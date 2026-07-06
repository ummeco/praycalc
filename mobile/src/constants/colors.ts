/**
 * Purpose: Brand color palettes for PrayCalc mobile app — light (default export shape,
 *   unchanged) and dark (added for system/light/dark theming).
 * Inputs: none
 * Outputs: Colors (light) + DarkColors (dark) constant objects; ThemeColors type
 * Constraints: Matches Ummeco brand palette (#C9F27A / #79C24C / #1E5E2F / #0D2F17).
 *   DarkColors MUST satisfy the same shape as Colors (enforced via ThemeColors type)
 *   so useThemeColors() can return either interchangeably.
 * SPORT: N/A — constants only
 */

export const Colors = {
  brand: {
    light: '#C9F27A',
    mid: '#79C24C',
    dark: '#1E5E2F',
    deep: '#0D2F17',
  },
  text: {
    primary: '#0D2F17',
    secondary: '#1E5E2F',
    inverse: '#FFFFFF',
    muted: '#6B7280',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    card: '#F3F4F6',
  },
  state: {
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#16A34A',
  },
  prayer: {
    fajr: '#1E3A5F',
    sunrise: '#F59E0B',
    dhuhr: '#1E5E2F',
    asr: '#D97706',
    maghrib: '#B91C1C',
    isha: '#1E3A5F',
  },
} as const;

/**
 * Shape every theme palette must satisfy. Structural (widened to `string` leaves)
 * rather than `typeof Colors` directly — `typeof Colors` would carry Colors' exact
 * hex-literal types (via `as const`), which DarkColors' different hex values could
 * never satisfy.
 */
export type ThemeColors = {
  [K in keyof typeof Colors]: { [P in keyof (typeof Colors)[K]]: string };
};

/** Dark palette — brand greens unchanged (read fine on dark backgrounds); text/background/state/prayer tuned for dark contrast. */
export const DarkColors: ThemeColors = {
  brand: {
    light: '#C9F27A',
    mid: '#79C24C',
    dark: '#1E5E2F',
    deep: '#0D2F17',
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#C9F27A',
    inverse: '#0D2F17',
    muted: '#9CA3AF',
  },
  background: {
    primary: '#111827',
    secondary: '#1F2937',
    card: '#374151',
  },
  state: {
    error: '#F87171',
    warning: '#FBBF24',
    success: '#4ADE80',
  },
  prayer: {
    fajr: '#7EA8D8',
    sunrise: '#FBBF24',
    dhuhr: '#79C24C',
    asr: '#F0A84B',
    maghrib: '#F87171',
    isha: '#7EA8D8',
  },
};
