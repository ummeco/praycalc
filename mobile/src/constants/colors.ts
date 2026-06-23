/**
 * Purpose: Brand color palette for PrayCalc mobile app
 * Inputs: none
 * Outputs: Colors constant object
 * Constraints: Matches Ummeco brand palette (#C9F27A / #79C24C / #1E5E2F / #0D2F17)
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
