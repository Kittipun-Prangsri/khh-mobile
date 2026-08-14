/**
 * PDPA Data Masking Utilities for Hospital NCDs Care Portal
 */

/**
 * Mask Thai National ID Card Number (CID)
 * Example: '1100200345678' -> '1-1002-XXXXX-67-8'
 */
export function maskCid(cid?: string): string {
  if (!cid || cid === '-') return '-';
  const clean = cid.replace(/\D/g, '');
  if (clean.length !== 13) return cid;
  
  return `${clean[0]}-${clean.slice(1, 5)}-XXXXX-${clean.slice(10, 12)}-${clean[12]}`;
}

/**
 * Mask Phone Number
 * Example: '0812345678' -> '081-XXX-5678'
 */
export function maskPhone(phone?: string): string {
  if (!phone || phone === '-') return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 9) return phone;
  
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-XXX-${clean.slice(6)}`;
  }
  return `${clean.slice(0, 2)}-XXX-${clean.slice(5)}`;
}

/**
 * Mask Patient Surname for PDPA Privacy
 * Example: 'นายสมชาย ใจดี' -> 'นายสมชาย ใจ***'
 */
export function maskName(fullName?: string): string {
  if (!fullName) return 'ไม่ระบุชื่อ';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  const maskedLastName = lastName.length > 2 
    ? `${lastName.slice(0, 2)}***` 
    : `${lastName.slice(0, 1)}***`;

  return `${firstName} ${maskedLastName}`;
}
