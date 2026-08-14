/**
 * Centralized Constants for KHH Safe-Connect LINE Flex Templates
 * Hospital: Khlong Hat Hospital (โรงพยาบาลคลองหาด)
 */

export const KHH_CONTACTS = {
  HOSPITAL_NAME: 'โรงพยาบาลคลองหาด',
  HOSPITAL_SHORT: 'รพ.คลองหาด (KHH)',
  
  // NCD Clinic
  NCD_CLINIC_NAME: 'ศูนย์ประสานงาน NCDs Care รพ.คลองหาด',
  NCD_CLINIC_PHONE_DISPLAY: '06-2271-0099',
  NCD_CLINIC_PHONE_URI: 'tel:0622710099',
  NCD_HOURS_DISPLAY: 'ในเวลาราชการ 08:00 - 16:00 น. (จันทร์ - ศุกร์)',

  // Mental Health & Addiction Department
  MENTAL_HEALTH_DEPT: 'กลุ่มงานสุขภาพจิตและยาเสพติด รพ.คลองหาด',
  MENTAL_HEALTH_PHONE_DISPLAY: '061-3961769',
  MENTAL_HEALTH_PHONE_URI: 'tel:0613961769',
  MENTAL_HEALTH_LINE_ID: '061-3961769',
  MENTAL_HEALTH_HOURS_DISPLAY: 'ในเวลาราชการ 08:30 น. - 16:30 น. (จันทร์ - ศุกร์)',

  // Thai Traditional Medicine
  THAI_MEDICINE_DEPT: 'กลุ่มงานแพทย์แผนไทยและการแพทย์ทางเลือก รพ.คลองหาด',
  THAI_MEDICINE_PHONE_DISPLAY: '06-2271-0099',
  THAI_MEDICINE_PHONE_URI: 'tel:0622710099',

  // Hotlines
  HOTLINE_1323_DISPLAY: 'สายด่วนสุขภาพจิต 1323 (ฟรี 24 ชม.)',
  HOTLINE_1323_URI: 'tel:1323',
  EMERGENCY_1669_DISPLAY: '🚑 โทรฉุกเฉิน 1669 ทันที',
  EMERGENCY_1669_URI: 'tel:1669',

  // Hospital Navigation & Location
  MAPS_LOCATION_URI: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('โรงพยาบาลคลองหาด')}`,
  MAPS_LABEL: '🗺️ นำทางมาโรงพยาบาลคลองหาด',
};

export const KHH_COLORS = {
  // Theme Primary Palette
  PRIMARY_TEAL: '#0D9488',
  DARK_TEAL: '#0B6F8A',
  LIGHT_TEAL_BG: '#F0FDFA',
  LIGHT_TEAL_BORDER: '#CCFBF1',

  // NCDs Menu Tile Colors
  DIET_GREEN: '#16A34A',
  THAI_MEDICINE_GREEN: '#059669',
  MEDICATION_BLUE: '#0284C7',
  EXERCISE_ORANGE: '#EA580C',
  MENTAL_PURPLE: '#7C3AED',
  MENTAL_DARK_PURPLE: '#6D28D9',

  // Gamification & Badges
  GOLD_BADGE: '#D97706',
  SILVER_BADGE: '#475569',
  BRONZE_BADGE: '#B45309',

  // Alerts & Statuses
  EMERGENCY_RED: '#DC2626',
  WARNING_AMBER: '#D97706',
  SUCCESS_GREEN: '#15803D',
  INFO_SKY: '#0284C7',

  // Neutrals & Cards
  TEXT_MAIN: '#0F172A',
  TEXT_MUTED: '#64748B',
  BG_LIGHT_BLUE: '#EFF6FF',
  BG_LIGHT_RED: '#FEF2F2',
  BG_LIGHT_PURPLE: '#F5F3FF',
  BG_LIGHT_AMBER: '#FFFBEB',
};
