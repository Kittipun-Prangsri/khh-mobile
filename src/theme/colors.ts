// Mirrors apps/web/lib/flex/flexConstants.ts KHH_COLORS so the mobile app
// stays visually consistent with the LINE Flex Messages patients already see.
export const KHH_COLORS = {
  PRIMARY_TEAL: '#0D9488',
  DARK_TEAL: '#0B6F8A',
  DIET_GREEN: '#16A34A',
  THAI_MEDICINE_GREEN: '#059669',
  MEDICATION_BLUE: '#0284C7',
  EXERCISE_ORANGE: '#EA580C',
  MENTAL_PURPLE: '#7C3AED',
  EMERGENCY_RED: '#DC2626',

  // Additional UI-only tokens (not present in the Flex theme, needed for
  // native screens: backgrounds, borders, text hierarchy).
  BACKGROUND: '#F7FAFA',
  SURFACE: '#FFFFFF',
  BORDER: '#E2E8F0',
  TEXT_PRIMARY: '#0F172A',
  TEXT_SECONDARY: '#64748B',
  TEXT_ON_PRIMARY: '#FFFFFF',
  WARNING_AMBER: '#D97706',
  SUCCESS_GREEN: '#16A34A',
} as const;

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const TYPE = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
