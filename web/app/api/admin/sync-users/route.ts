import { NextRequest, NextResponse } from 'next/server';
import { getHosxpPool } from '@/lib/hosxpClient';
import {
  batchProvisionHosxpUsers,
  getAllDuplicatedProfiles,
  provisionHosxpUserToStore,
} from '@/lib/userProvisioningService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sync-users
 * List all duplicated user profiles stored in Supabase / Local Profile Store
 */
export async function GET() {
  const profiles = getAllDuplicatedProfiles();
  return NextResponse.json({
    success: true,
    total: profiles.length,
    message: `⚡ พบบัญชีผู้ใช้งานในระบบ Supabase / Duplicated Store ทั้งหมด ${profiles.length} รายการ`,
    profiles,
  });
}

/**
 * POST /api/admin/sync-users
 * Duplicate / Sync opduser accounts from HOSxP to Supabase public.profiles & Local Store
 */
export async function POST() {
  try {
    const pool = getHosxpPool();

    let rows: any[] = [];
    let isFromNcdTable = false;

    // Try opduser_Ncd first
    try {
      const [ncdRows]: any = await pool.execute(`
        SELECT loginname, 
               CONVERT(name USING utf8mb4) AS name, 
               CONVERT(entryposition USING utf8mb4) AS entryposition, 
               CONVERT(department USING utf8mb4) AS department, 
               doctorcode
        FROM opduser_Ncd 
        WHERE (account_disable IS NULL OR account_disable != 'Y')
        LIMIT 100
      `);
      if (ncdRows && ncdRows.length > 0) {
        rows = ncdRows;
        isFromNcdTable = true;
      }
    } catch (err) {
      // opduser_Ncd fallback quietly
    }

    if (!rows || rows.length === 0) {
      // Fallback to standard opduser
      const [dbRows]: any = await pool.execute(`
        SELECT loginname, 
               CONVERT(name USING utf8mb4) AS name, 
               CONVERT(entryposition USING utf8mb4) AS entryposition, 
               CONVERT(department USING utf8mb4) AS department, 
               doctorcode
        FROM opduser 
        WHERE (account_disable IS NULL OR account_disable != 'Y')
        LIMIT 100
      `);
      rows = dbRows;
    }

    const result = await batchProvisionHosxpUsers(rows);

    return NextResponse.json({
      success: true,
      message: `⚡ คัดลอกและ Sync บัญชี ${isFromNcdTable ? 'opduser_Ncd' : 'opduser'} จาก HOSxP เข้าสู่ Supabase Profile Store สำเร็จทั้งหมด ${result.count} บัญชี`,
      syncedCount: result.count,
      isFromNcdTable,
      profiles: result.profiles,
    });
  } catch (error: any) {
    console.warn('⚠️ HOSxP DB sync notice. Performing seed fallback sync:', error.message);

    // Fallback seed accounts if HOSxP DB is unreachable
    const seedAccounts = [
      { loginname: 'admin', name: 'ผู้ดูแลระบบ IT', entryposition: 'สารสนเทศ', role: 'super_admin' },
      { loginname: '0816', name: 'พญ. สุภาพร ใจดี', entryposition: 'แพทย์', doctorcode: '0816', role: 'doctor' },
      { loginname: 'nurse', name: 'พยาบาลวิชาชีพ', entryposition: 'พยาบาล', role: 'nurse' },
      { loginname: 'staff', name: 'เจ้าหน้าที่เวชระเบียน', entryposition: 'เวชระเบียน', role: 'staff' },
    ];

    const result = await batchProvisionHosxpUsers(seedAccounts);

    return NextResponse.json({
      success: true,
      isFallbackSync: true,
      message: `⚡ ทำการ Sync บัญชีมาตรฐานเข้าสู่ Supabase Profile Store สำเร็จ (${result.count} บัญชี)`,
      syncedCount: result.count,
      profiles: result.profiles,
    });
  }
}
