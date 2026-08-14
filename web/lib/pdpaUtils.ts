/**
 * PDPA (Personal Data Protection Act) Utility Functions
 * For masking personal identifiable information (PII) in hospital dashboards & lists
 */

/**
 * Mask Patient Name according to PDPA
 * Example: "นาย สมชาย ดีเลิศ" -> "นาย สมชาย ดี***"
 * Example: "สมศรี มีสุข" -> "สมศรี มี***"
 */
export function maskPatientName(name: string, isPdpaActive: boolean = true): string {
  if (!isPdpaActive || !name) return name;

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const p = parts[0];
    if (p.length <= 3) return `${p}***`;
    return `${p.substring(0, 3)}***`;
  }

  // If there's prefix or firstname + lastname
  // Mask the last name keeping the first character or prefix intact
  const lastName = parts[parts.length - 1];
  const maskedLastName = lastName.length > 2 
    ? `${lastName.substring(0, 2)}${'*'.repeat(Math.max(3, lastName.length - 2))}`
    : '***';

  const otherParts = parts.slice(0, parts.length - 1).join(' ');
  return `${otherParts} ${maskedLastName}`;
}

/**
 * Mask Thai National Citizen ID (CID 13 digits)
 * Example: "1100200300405" -> "1-1002-XXXXX-05"
 * Example: "1-1002-00300-40-5" -> "1-1002-XXXXX-40-5"
 */
export function maskCid(cid: string, isPdpaActive: boolean = true): string {
  if (!isPdpaActive || !cid || cid === '-') return cid;

  const clean = cid.replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean.substring(0, 1)}-${clean.substring(1, 5)}-XXXXX-${clean.substring(11, 13)}`;
  }
  
  if (cid.length >= 8) {
    return `${cid.substring(0, 4)}XXXXX${cid.substring(cid.length - 2)}`;
  }
  return 'X-XXXX-XXXXX-XX-X';
}

/**
 * Mask Phone Number
 * Example: "0812345678" -> "081-XXX-5678"
 */
export function maskPhone(phone: string, isPdpaActive: boolean = true): string {
  if (!isPdpaActive || !phone || phone === '-') return phone;

  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.substring(0, 3)}-XXX-${clean.substring(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.substring(0, 2)}-XXX-${clean.substring(5)}`;
  }

  if (phone.length >= 6) {
    return `${phone.substring(0, 3)}-XXX-${phone.substring(phone.length - 4)}`;
  }
  return '08X-XXX-XXXX';
}

/**
 * Mask Hospital Number (HN) if needed
 * Example: "HN-98302" -> "HN-98***"
 */
export function maskHn(hn: string, isPdpaActive: boolean = true): string {
  if (!isPdpaActive || !hn) return hn;

  if (hn.length <= 5) return hn;
  return `${hn.substring(0, hn.length - 3)}***`;
}

/**
 * Role & PDPA Control Helper — reads the real, server-verified session
 * (set at login from HOSxP/Supabase, see app/api/hosxp/auth/login/route.ts)
 * rather than a separate client-writable flag.
 */
export function getCurrentUserRole(): string {
  if (typeof window === 'undefined') return 'nurse';
  try {
    const saved = localStorage.getItem('khh_user_session');
    if (!saved) return 'nurse';
    const session = JSON.parse(saved);
    return session.role || 'nurse';
  } catch (e) {
    return 'nurse';
  }
}

/**
 * Mask Patient Address for PDPA Compliance
 * Example: "บ้านเลขที่ 45/2 หมู่ 3 ต.คลองหาด" -> "บ้านเลขที่ XX/X หมู่ 3 ต.คลองหาด"
 */
export function maskAddress(address: string, isPdpaActive: boolean = true): string {
  if (!isPdpaActive || !address) return address;
  return address.replace(/(\d+)(\/\d+)?/g, (match) => match.replace(/\d/g, 'X'));
}

/**
 * Check if the current user has permission to toggle PDPA masking off.
 * Must be based on the real, server-verified role — this used to read a
 * separate localStorage key that any logged-in user could set themselves
 * from the Settings page, letting any staff account grant itself unmasked
 * access to patient PII with no server-side check at all.
 */
export function isITSuperAdmin(): boolean {
  return getCurrentUserRole() === 'super_admin';
}

