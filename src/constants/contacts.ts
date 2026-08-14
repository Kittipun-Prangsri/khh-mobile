// Mirrors apps/web/lib/flex/flexConstants.ts KHH_CONTACTS.
// Keep in sync with the web/LINE source of truth — do not fork values here.
export const KHH_CONTACTS = {
  NCD_CLINIC_PHONE_DISPLAY: '06-2271-0099',
  NCD_CLINIC_PHONE_URI: 'tel:0622710099',
  MENTAL_HEALTH_PHONE_DISPLAY: '061-3961769',
  MENTAL_HEALTH_PHONE_URI: 'tel:0613961769',
  HOTLINE_1323_URI: 'tel:1323',
  EMERGENCY_1669_URI: 'tel:1669',
  MAPS_LOCATION_URI: 'https://maps.google.com/?q=โรงพยาบาลคลองหาด',
} as const;

// Base URL for the existing HOSxP-backed API that already serves the LINE
// webhook (apps/web). The mobile app is a second client of the SAME backend
// — no new HOSxP integration should be written for this app.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5003/api/v1';
