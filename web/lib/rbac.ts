export type UserRole = 'super_admin' | 'doctor' | 'nurse' | 'staff' | 'executive';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  department: string;
  avatarInitials: string;
  badgeColor: string;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'usr_admin',
    name: 'นายอดิศร สุขสมบูรณ์',
    role: 'super_admin',
    roleLabel: 'ผู้ดูแลระบบ (IT Super Admin)',
    email: 'admin@khh.go.th',
    department: 'ศูนย์เทคโนโลยีสารสนเทศ (IT)',
    avatarInitials: 'ไอที',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  doctor: {
    id: 'usr_doc',
    name: 'พญ. วรรณภา จิตดี',
    role: 'doctor',
    roleLabel: 'แพทย์ประจำคลินิก (Doctor)',
    email: 'doctor@khh.go.th',
    department: 'คลินิกโรคเรื้อรัง (NCDs)',
    avatarInitials: 'หมอ',
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  nurse: {
    id: 'usr_nurse',
    name: 'กิตติพงษ์ แก้วมณี',
    role: 'nurse',
    roleLabel: 'พยาบาลวิชาชีพ (Nurse)',
    email: 'nurse@khh.go.th',
    department: 'กลุ่มงานพยาบาล NCDs',
    avatarInitials: 'พย',
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  staff: {
    id: 'usr_staff',
    name: 'นางสาวสมใจ นามดี',
    role: 'staff',
    roleLabel: 'เจ้าหน้าที่เวชระเบียน (Staff)',
    email: 'staff@khh.go.th',
    department: 'กลุ่มงานเวชระเบียนและลงทะเบียน',
    avatarInitials: 'เวช',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  executive: {
    id: 'usr_exec',
    name: 'นพ. ผู้อำนวยการ รพ.คลองหาด',
    role: 'executive',
    roleLabel: 'ผู้บริหาร (Executive)',
    email: 'executive@khh.go.th',
    department: 'สำนักผู้อำนวยการ',
    avatarInitials: 'ผอ',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

export interface PermissionCheck {
  canViewSettings: boolean;
  canEditPatients: boolean;
  canManageAppointments: boolean;
  canManageFollowUps: boolean;
  canSendLineMessages: boolean;
  canViewReports: boolean;
  isReadOnly: boolean;
}

export function getRolePermissions(role: UserRole): PermissionCheck {
  switch (role) {
    case 'super_admin':
      return {
        canViewSettings: true,
        canEditPatients: true,
        canManageAppointments: true,
        canManageFollowUps: true,
        canSendLineMessages: true,
        canViewReports: true,
        isReadOnly: false,
      };
    case 'doctor':
      return {
        canViewSettings: false,
        canEditPatients: false,
        canManageAppointments: true,
        canManageFollowUps: true,
        canSendLineMessages: false,
        canViewReports: true,
        isReadOnly: false,
      };
    case 'nurse':
      return {
        canViewSettings: false,
        canEditPatients: true,
        canManageAppointments: true,
        canManageFollowUps: true,
        canSendLineMessages: true,
        canViewReports: true,
        isReadOnly: false,
      };
    case 'staff':
      return {
        canViewSettings: false,
        canEditPatients: true,
        canManageAppointments: true,
        canManageFollowUps: false,
        canSendLineMessages: false,
        canViewReports: true,
        isReadOnly: false,
      };
    case 'executive':
      return {
        canViewSettings: false,
        canEditPatients: false,
        canManageAppointments: false,
        canManageFollowUps: false,
        canSendLineMessages: false,
        canViewReports: true,
        isReadOnly: true,
      };
    default:
      return getRolePermissions('nurse');
  }
}
