import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getHosxpPool } from '@/lib/hosxpClient';
import {
  findDuplicatedUserProfile,
  provisionHosxpUserToStore,
  createDynamicStandbyProfile,
} from '@/lib/userProvisioningService';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { recordLoginActivity, extractClientIp } from '@/lib/loginActivityLog';
import { checkLoginLockout, recordLoginFailure, recordLoginSuccess } from '@/lib/loginRateLimit';

export const dynamic = 'force-dynamic';

/**
 * Issue a signed, httpOnly session cookie on the response for a
 * successfully authenticated user. httpOnly means client-side JS can't
 * read or forge it — this is what the middleware actually trusts.
 */
async function withSessionCookie(response: NextResponse, user: { id: string; role: string; name: string; roleLabel?: string }) {
  const token = await createSessionToken(user);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

/**
 * Determine Role from HOSxP opduser entryposition, groupname, doctorcode
 */
function mapHosxpRole(user: any): { role: string; roleLabel: string; badgeColor: string } {
  const pos = (user.entryposition || '').toLowerCase();
  const group = (user.groupname || '').toLowerCase();
  const login = (user.loginname || '').toLowerCase();
  const name = (user.name || '').toLowerCase();

  if (
    login === 'admin' ||
    login.includes('kittipun') ||
    name.includes('กิตติพันธ์') ||
    group.includes('admin') ||
    group.includes('it') ||
    pos.includes('สารสนเทศ') ||
    pos.includes('คอมพิวเตอร์') ||
    pos.includes('ผู้ดูแลระบบ')
  ) {
    return {
      role: 'super_admin',
      roleLabel: 'ผู้ดูแลระบบ (IT Super Admin)',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    };
  }

  if (user.doctorcode || pos.includes('แพทย์') || pos.includes('พญ') || pos.includes('นพ')) {
    return {
      role: 'doctor',
      roleLabel: 'แพทย์ประจำคลินิก (Doctor)',
      badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
    };
  }

  if (pos.includes('พยาบาล')) {
    return {
      role: 'nurse',
      roleLabel: 'พยาบาลวิชาชีพ (Nurse)',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
    };
  }

  if (pos.includes('ผู้อำนวยการ') || pos.includes('หัวหน้า')) {
    return {
      role: 'executive',
      roleLabel: 'ผู้บริหาร (Executive)',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
  }

  return {
    role: 'staff',
    roleLabel: user.entryposition || 'เจ้าหน้าที่ (Staff)',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
  };
}

export async function POST(request: Request) {
  let cleanUsername = '';
  const clientIp = extractClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const lockout = checkLoginLockout(clientIp);
  if (lockout.locked) {
    return NextResponse.json(
      {
        success: false,
        message: `เข้าสู่ระบบผิดพลาดหลายครั้งเกินไป กรุณาลองใหม่อีกครั้งใน ${Math.ceil((lockout.retryAfterSeconds || 0) / 60)} นาที`,
      },
      { status: 429, headers: { 'Retry-After': String(lockout.retryAfterSeconds || 0) } }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอก ชื่อผู้ใช้งาน (Username) และ รหัสผ่าน (Password)' },
        { status: 400 }
      );
    }

    cleanUsername = username.trim();

    // 1. STEP 1: Check Supabase / Duplicated User Store FIRST (0% HOSxP DB Load!)
    const duplicatedProfile = await findDuplicatedUserProfile(cleanUsername);
    if (duplicatedProfile) {
      recordLoginSuccess(clientIp);
      recordLoginActivity({
        loginname: duplicatedProfile.loginname,
        name: duplicatedProfile.name,
        role: duplicatedProfile.role,
        source: 'Supabase / Duplicated Store',
        ipAddress: clientIp,
        userAgent,
      });
      return await withSessionCookie(
        NextResponse.json({
          success: true,
          message: `⚡ เข้าสู่ระบบสำเร็จผ่าน Supabase / Duplicated Profile Store! ยินดีต้อนรับ ${duplicatedProfile.name}`,
          user: duplicatedProfile,
          isZeroDbAuth: true,
          source: 'Supabase / Duplicated Store',
        }),
        duplicatedProfile
      );
    }

    // 2. STEP 2: Query user from HOSxP opduser / opduser_Ncd database
    const pool = getHosxpPool();
    let rows: any[] = [];
    let isFromNcdTable = false;

    try {
      // First try querying opduser_Ncd / opduser_ncd if available
      try {
        const [ncdRows]: any = await pool.execute(
          `SELECT loginname, 
                  CONVERT(name USING utf8mb4) AS name, 
                  CONVERT(entryposition USING utf8mb4) AS entryposition, 
                  CONVERT(department USING utf8mb4) AS department, 
                  CONVERT(groupname USING utf8mb4) AS groupname, 
                  doctorcode, passweb, password, password_text, account_disable
           FROM opduser_Ncd 
           WHERE (loginname = ? OR doctorcode = ? OR cid = ?)
             AND (account_disable IS NULL OR account_disable != 'Y')
           LIMIT 1`,
          [cleanUsername, cleanUsername, cleanUsername]
        );
        if (ncdRows && ncdRows.length > 0) {
          rows = ncdRows;
          isFromNcdTable = true;
        }
      } catch (ncdErr) {
        // Table opduser_Ncd might be lowercased or missing, fall back quietly to opduser
      }

      // Fallback to standard opduser if not found in opduser_Ncd
      if (!rows || rows.length === 0) {
        const [dbRows]: any = await pool.execute(
          `SELECT loginname, 
                  CONVERT(name USING utf8mb4) AS name, 
                  CONVERT(entryposition USING utf8mb4) AS entryposition, 
                  CONVERT(department USING utf8mb4) AS department, 
                  CONVERT(groupname USING utf8mb4) AS groupname, 
                  doctorcode, passweb, password, password_text, account_disable
           FROM opduser 
           WHERE (loginname = ? OR doctorcode = ? OR cid = ?)
             AND (account_disable IS NULL OR account_disable != 'Y')
           LIMIT 1`,
          [cleanUsername, cleanUsername, cleanUsername]
        );
        rows = dbRows;
      }
    } catch (dbErr: any) {
      console.warn(`⚠️ HOSxP DB Connection Notice (${dbErr.code || 'ETIMEDOUT'}) for '${cleanUsername}'`);

      // Standby profile auto-provisioning skips password verification entirely
      // (there's no DB to check it against) — acceptable for dev convenience,
      // but in production it would let anyone in with any username when the
      // HOSxP link is down. Fail closed there instead.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            success: false,
            message: 'ไม่สามารถเชื่อมต่อฐานข้อมูล HOSxP ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ IT',
          },
          { status: 503 }
        );
      }

      console.warn(`⚠️ Creating dynamic standby profile for '${cleanUsername}' (dev only)...`);

      // Auto-provision dynamic standby profile for ANY username when DB is unreachable
      const standbyProfile = await createDynamicStandbyProfile(cleanUsername);

      recordLoginSuccess(clientIp);
      recordLoginActivity({
        loginname: standbyProfile.loginname,
        name: standbyProfile.name,
        role: standbyProfile.role,
        source: 'Supabase Standby Store (HOSxP Offline)',
        ipAddress: clientIp,
        userAgent,
      });

      return await withSessionCookie(
        NextResponse.json({
          success: true,
          message: `⚡ เข้าสู่ระบบสำเร็จ (Supabase Standby Profile - HOSxP 192.168.1.4 Offline)! ยินดีต้อนรับ ${standbyProfile.name}`,
          user: standbyProfile,
          isStandbyMode: true,
          source: 'Supabase Standby Store',
        }),
        standbyProfile
      );
    }

    if (!rows || rows.length === 0) {
      recordLoginFailure(clientIp);
      return NextResponse.json(
        { success: false, message: `ไม่พบชื่อผู้ใช้งาน '${cleanUsername}' ในระบบ HOSxP และ Supabase Store` },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verify Password against HOSxP passweb (MD5), password_text, or plain text
    const inputMd5Upper = crypto.createHash('md5').update(password).digest('hex').toUpperCase();
    const inputMd5Lower = crypto.createHash('md5').update(password).digest('hex').toLowerCase();

    let isPasswordValid = false;

    if (user.passweb) {
      const passwebUpper = String(user.passweb).toUpperCase();
      if (passwebUpper === inputMd5Upper || passwebUpper === inputMd5Lower || user.passweb === password) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid && user.password_text) {
      if (user.password_text === password) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid && user.password) {
      if (user.password === password) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      recordLoginFailure(clientIp);
      return NextResponse.json(
        { success: false, message: 'รหัสผ่าน HOSxP ไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Determine Role
    const roleInfo = mapHosxpRole(user);
    const fullName = user.name || cleanUsername;
    const nowIso = new Date().toISOString();

    // Update last_login timestamp in opduser_Ncd table (best effort)
    try {
      await pool.execute(
        `UPDATE opduser_Ncd SET last_login = NOW() WHERE loginname = ?`,
        [user.loginname]
      ).catch(() => {
        return pool.execute(
          `UPDATE opduser_ncd SET last_login = NOW() WHERE loginname = ?`,
          [user.loginname]
        );
      });
    } catch (updateErr) {
      // Ignore if table or last_login column does not exist yet
    }

    // STEP 3: Auto-provision user into Supabase / Duplicated Store for future 0%-DB logins
    const provisionedUser = await provisionHosxpUserToStore({
      loginname: user.loginname,
      name: fullName,
      entryposition: user.entryposition,
      department: user.department,
      doctorcode: user.doctorcode,
      role: roleInfo.role,
      roleLabel: roleInfo.roleLabel,
      badgeColor: roleInfo.badgeColor,
      lastLoginAt: nowIso,
      opduserNcdSyncedAt: nowIso,
    });

    recordLoginSuccess(clientIp);
    recordLoginActivity({
      loginname: provisionedUser.loginname,
      name: provisionedUser.name,
      role: provisionedUser.role,
      source: isFromNcdTable ? 'HOSxP DB (opduser_Ncd)' : 'HOSxP DB (opduser)',
      ipAddress: clientIp,
      userAgent,
    });

    return await withSessionCookie(
      NextResponse.json({
        success: true,
        message: `⚡ เข้าสู่ระบบ HOSxP/NCDs สำเร็จ! (ดึงและบันทึกเวลาผ่าน opduser_Ncd เรียบร้อยแล้ว) ยินดีต้อนรับ ${fullName}`,
        user: provisionedUser,
        isAutoProvisioned: true,
        isFromNcdTable,
      }),
      provisionedUser
    );
  } catch (error: any) {
    console.error('❌ HOSxP Login Auth Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์กับระบบ' },
      { status: 500 }
    );
  }
}


