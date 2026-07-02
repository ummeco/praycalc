/**
 * Purpose: App-wide constants for praycalc/mobile.
 * Inputs: Environment variables via process.env.EXPO_PUBLIC_*.
 * Outputs: Typed constants used across all features.
 * Constraints: No side effects; import-safe.
 */

import type { CalcMethod, PrayerName } from '../types';

export const API_URL =
  process.env['EXPO_PUBLIC_API_URL'] ?? 'https://api.ummat.dev/v1/graphql';

export const AUTH_URL =
  process.env['EXPO_PUBLIC_AUTH_URL'] ?? 'https://auth.ummat.dev';

export const BILLING_URL =
  process.env['EXPO_PUBLIC_BILLING_URL'] ?? 'https://api.praycalc.com/billing';

export const SENTRY_DSN =
  process.env['EXPO_PUBLIC_SENTRY_DSN_PRAYCALC'] ?? '';

export const UMAMI_ID =
  process.env['EXPO_PUBLIC_UMAMI_PRAYCALC_ID'] ?? '';

export const APP_ENV =
  (process.env['EXPO_PUBLIC_ENV'] ?? 'development') as 'development' | 'staging' | 'production';

// IAP product IDs
export const IAP_PRODUCT_IDS_IOS = ['praycalc_pro_monthly', 'praycalc_pro_annual'];
export const IAP_PRODUCT_IDS_ANDROID = ['praycalc_pro_monthly', 'praycalc_pro_annual'];

// iOS App Group for WidgetKit shared storage
export const APP_GROUP = 'group.com.ummeco.praycalc';

// Prayer names in canonical order (no Tehran/Jafari per D-P3-19)
export const PRAYER_NAMES: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Calculation methods available in UI — Tehran/Jafari excluded per D-P3-19
export const CALC_METHODS: CalcMethod[] = ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Gulf', 'Custom'];

// Brand colors (Ummeco green palette)
export const COLORS = {
  light: '#C9F27A',
  mid: '#79C24C',
  dark: '#1E5E2F',
  deep: '#0D2F17',
  white: '#FFFFFF',
  offWhite: '#F8FAF4',
  error: '#DC2626',
  warning: '#D97706',
  surface: '#1A4A28',
  surfaceLight: '#2A6A3A',
} as const;

// Background fetch task name
export const PRAYER_RESCHEDULE_TASK = 'PRAYER_RESCHEDULE';

// Notification channel ID (Android)
export const NOTIFICATION_CHANNEL_ID = 'prayer-alarms';

// Max notifications schedulable ahead (iOS/Android limit)
export const MAX_SCHEDULED_NOTIFICATIONS = 64;

// Days ahead to schedule notifications
export const NOTIFICATION_DAYS_AHEAD = 3;

// MMKV storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'pc:settings',
  CITY: 'pc:city',
  TASBEEH_SESSION: 'pc:tasbeeh',
  SUBSCRIPTION: 'pc:subscription',
  QURAN_BOOKMARKS: 'pc:quran:bookmarks',
  PRAYER_COMPLETIONS: 'pc:completions',
  ONBOARDING_DONE: 'pc:onboarding:done',
} as const;
