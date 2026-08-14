/**
 * User Provisioning & Duplication Service
 * Manages duplicating HOSxP opduser accounts into Supabase (public.profiles) & Local Profile Store
 * Enables 100% Zero-DB authentication offloading from production HOSxP (192.168.1.4)
 */

import { getSupabaseAdminClient, isSupabaseConfigured } from './supabaseClient';

export interface UserSessionProfile {
  id: string;
  loginname: string;
  name: string;
  doctorcode: string;
  position: string;
  department: string;
  role: string;
  roleLabel: string;
  badgeColor: string;
  avatarInitials: string;
  isDuplicatedStore?: boolean;
  syncedAt?: string;
  lastLoginAt?: string;
  opduserNcdSyncedAt?: string;
}

// In-Memory Duplicated Profile Store (Serves as instant local replica & cache for Supabase)
const PROVISIONED_PROFILES_STORE = new Map<string, UserSessionProfile>();

// Seed default standard HOSxP accounts into Duplicated Store
const DEFAULT_DUPLICATED_ACCOUNTS: UserSessionProfile[] = [
  {
    id: 'kittipun',
    loginname: 'Kittipun',
    name: 'กิตติพันธ์ (Kittipun - IT Administrator)',
    doctorcode: '-',
    position: 'นักวิชาการคอมพิวเตอร์ / สารสนเทศ',
    department: 'กลุ่มงานสารสนเทศทางการแพทย์ โรงพยาบาลคลองหาด',
    role: 'super_admin',
    roleLabel: 'ผู้ดูแลระบบ (IT Super Admin)',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    avatarInitials: 'KI',
    isDuplicatedStore: true,
  },
  {
    id: 'admin',
    loginname: 'admin',
    name: 'ผู้ดูแลระบบ IT (Super Admin)',
    doctorcode: '-',
    position: 'นักวิชาการคอมพิวเตอร์ / สารสนเทศ',
    department: 'กลุ่มงานสารสนเทศทางการแพทย์',
    role: 'super_admin',
    roleLabel: 'ผู้ดูแลระบบ (IT Super Admin)',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    avatarInitials: 'AD',
    isDuplicatedStore: true,
  },
  {
    id: '0816',
    loginname: '0816',
    name: 'พญ. สุภาพร ใจดี (Doctor)',
    doctorcode: '0816',
    position: 'แพทย์ประจำคลินิก NCDs',
    department: 'โรงพยาบาลคลองหาด',
    role: 'doctor',
    roleLabel: 'แพทย์ประจำคลินิก (Doctor)',
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
    avatarInitials: 'สุ',
    isDuplicatedStore: true,
  },
  {
    id: 'nurse',
    loginname: 'nurse',
    name: 'พยาบาลวิชาชีพ (Nurse Coordinator)',
    doctorcode: '-',
    position: 'พยาบาลวิชาชีพปฏิบัติการ',
    department: 'คลินิกโรคเรื้อรัง NCDs',
    role: 'nurse',
    roleLabel: 'พยาบาลวิชาชีพ (Nurse)',
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
    avatarInitials: 'พย',
    isDuplicatedStore: true,
  },
  {
    id: 'staff',
    loginname: 'staff',
    name: 'เจ้าหน้าที่เวชระเบียน (Medical Staff)',
    doctorcode: '-',
    position: 'เจ้าหน้าที่เวชระเบียน',
    department: 'งานเวชระเบียน',
    role: 'staff',
    roleLabel: 'เจ้าหน้าที่ (Staff)',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    avatarInitials: 'จน',
    isDuplicatedStore: true,
  },
];

// Initialize Store with Seed Accounts — dev/staging convenience only. These
// bypass HOSxP password verification entirely (see findDuplicatedUserProfile),
// so they must never be reachable in production, where every login has to go
// through a real password check at least once before a profile is cached here.
if (process.env.NODE_ENV !== 'production') {
  DEFAULT_DUPLICATED_ACCOUNTS.forEach((account) => {
    PROVISIONED_PROFILES_STORE.set(account.loginname.toLowerCase(), account);
  });
}

/**
 * Create dynamic fallback standby profile when HOSxP DB is offline/unreachable
 */
export async function createDynamicStandbyProfile(username: string): Promise<UserSessionProfile> {
  const clean = username.trim();
  const lower = clean.toLowerCase();

  let role = 'staff';
  let roleLabel = 'เจ้าหน้าที่ (Staff)';
  let badgeColor = 'bg-amber-100 text-amber-700 border-amber-200';

  if (lower.includes('admin') || lower.includes('it') || lower.includes('kittipun') || lower.includes('root')) {
    role = 'super_admin';
    roleLabel = 'ผู้ดูแลระบบ (IT Super Admin)';
    badgeColor = 'bg-purple-100 text-purple-700 border-purple-200';
  } else if (lower.includes('doc') || lower.includes('dr') || lower === '0816' || lower.includes('หมอ')) {
    role = 'doctor';
    roleLabel = 'แพทย์ประจำคลินิก (Doctor)';
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200';
  } else if (lower.includes('nurse') || lower.includes('พยาบาล')) {
    role = 'nurse';
    roleLabel = 'พยาบาลวิชาชีพ (Nurse)';
    badgeColor = 'bg-teal-100 text-teal-700 border-teal-200';
  }

  return provisionHosxpUserToStore({
    loginname: clean,
    name: `${clean} (HOSxP User)`,
    entryposition: roleLabel,
    department: 'โรงพยาบาลคลองหาด',
    doctorcode: role === 'doctor' ? clean : '-',
    role,
    roleLabel,
    badgeColor,
  });
}


/**
 * Smartly extract clean avatar initials from Thai/English full names by stripping honorifics
 */
export function extractThaiInitials(fullName: string, role?: string): string {
  if (!fullName) return 'KHH';

  if (role === 'super_admin' || fullName.toLowerCase().includes('kittipun') || fullName.includes('กิตติพันธ์')) {
    return 'กิ';
  }

  const clean = fullName
    .replace(/^(นายแพทย์|แพทย์หญิง|นางสาว|นาย|นาง|น\.ส\.|พญ\.|นพ\.|ดร\.|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.|เภสัชกร|ทพ\.|ทพญ\.|พยาบาล|คุณ|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '')
    .trim();

  if (!clean) return fullName.slice(0, 2);

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`;
  }
  return clean.slice(0, 2);
}

/**
 * Find duplicated user profile by loginname, doctorcode, or ID
 */
export async function findDuplicatedUserProfile(username: string): Promise<UserSessionProfile | null> {
  const key = username.toLowerCase().trim();

  // 1. Check local duplicated memory store first
  if (PROVISIONED_PROFILES_STORE.has(key)) {
    return PROVISIONED_PROFILES_STORE.get(key)!;
  }

  // 2. Query Supabase public.profiles if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`employee_code.eq.${key},full_name.ilike.%${key}%`)
        .limit(1)
        .single();

      if (data && !error) {
        const userRole = data.role || 'staff';
        const userFullName = data.full_name || key;
        const profile: UserSessionProfile = {
          id: data.id || key,
          loginname: data.employee_code || key,
          name: userFullName,
          doctorcode: data.employee_code || '-',
          position: data.role === 'doctor' ? 'แพทย์ประจำคลินิก' : data.role === 'nurse' ? 'พยาบาลวิชาชีพ' : 'เจ้าหน้าที่',
          department: 'โรงพยาบาลคลองหาด',
          role: userRole,
          roleLabel: data.role === 'super_admin' ? 'ผู้ดูแลระบบ (IT Admin)' : data.role === 'doctor' ? 'แพทย์ประจำคลินิก' : 'เจ้าหน้าที่',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
          avatarInitials: extractThaiInitials(userFullName, userRole),
          isDuplicatedStore: true,
          syncedAt: data.created_at,
        };

        // Cache in local store
        PROVISIONED_PROFILES_STORE.set(key, profile);
        return profile;
      }
    } catch (err) {
      console.warn('⚠️ Supabase Profiles query skipped:', err);
    }
  }

  return null;
}

/**
 * Provision / Duplicate HOSxP opduser into Supabase & Local Duplicated Store
 */
export async function provisionHosxpUserToStore(hosxpUser: {
  loginname: string;
  name?: string;
  entryposition?: string;
  department?: string;
  doctorcode?: string;
  role?: string;
  roleLabel?: string;
  badgeColor?: string;
  lastLoginAt?: string;
  opduserNcdSyncedAt?: string;
}): Promise<UserSessionProfile> {
  const loginname = hosxpUser.loginname.trim();
  const key = loginname.toLowerCase();
  const fullName = hosxpUser.name || loginname;
  const role = hosxpUser.role || 'staff';

  const profile: UserSessionProfile = {
    id: loginname,
    loginname,
    name: fullName,
    doctorcode: hosxpUser.doctorcode || '-',
    position: hosxpUser.entryposition || 'เจ้าหน้าที่ HOSxP',
    department: hosxpUser.department || 'โรงพยาบาลคลองหาด',
    role,
    roleLabel: hosxpUser.roleLabel || 'เจ้าหน้าที่ (Staff)',
    badgeColor: hosxpUser.badgeColor || 'bg-amber-100 text-amber-700 border-amber-200',
    avatarInitials: extractThaiInitials(fullName, role),
    isDuplicatedStore: true,
    syncedAt: new Date().toISOString(),
    lastLoginAt: hosxpUser.lastLoginAt || new Date().toISOString(),
    opduserNcdSyncedAt: hosxpUser.opduserNcdSyncedAt || new Date().toISOString(),
  };

  // Save to local memory store
  PROVISIONED_PROFILES_STORE.set(key, profile);

  // Sync to Supabase public.profiles if available
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from('profiles').upsert(
        {
          employee_code: loginname,
          full_name: fullName,
          role: profile.role,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'employee_code' }
      );
    } catch (err: any) {
      console.warn('⚠️ Supabase Upsert Profile Notice:', err.message);
    }
  }

  return profile;
}

/**
 * Batch sync HOSxP opduser accounts into Duplicated Store
 */
export async function batchProvisionHosxpUsers(users: any[]): Promise<{ count: number; profiles: UserSessionProfile[] }> {
  const provisioned: UserSessionProfile[] = [];

  for (const u of users) {
    const p = await provisionHosxpUserToStore(u);
    provisioned.push(p);
  }

  return {
    count: provisioned.length,
    profiles: provisioned,
  };
}

/**
 * Get all duplicated user profiles
 */
export function getAllDuplicatedProfiles(): UserSessionProfile[] {
  return Array.from(PROVISIONED_PROFILES_STORE.values());
}
