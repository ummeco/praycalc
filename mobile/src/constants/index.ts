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

/** Android channel whose sound is the bundled adhan takbir excerpt (channel sound
 *  is immutable after creation — hence a separate channel from the default one).
 *  Default/legacy adhan channel. Each additional bundled adhan sound gets its OWN
 *  channel (`${NOTIFICATION_CHANNEL_ADHAN_ID}-<id>`) because Android channel sounds
 *  cannot be mutated after the channel is first created — see ADHAN_SOUNDS. */
export const NOTIFICATION_CHANNEL_ADHAN_ID = 'prayer-alarms-adhan';

/** Bundled notification sound (26.6s opening takbir cut from the Makkah adhan we
 *  ship — iOS caps notification sounds at 30s; the full adhan plays on tap).
 *  This is the DEFAULT bundled adhan sound (see ADHAN_SOUNDS / DEFAULT_ADHAN_SOUND_ID). */
export const ADHAN_NOTIFICATION_SOUND = 'adhan_takbir.wav';

/**
 * Bundled short adhan-opening notification sounds the user can choose from.
 * Each is a <=28s cut of a full reciter's adhan (iOS hard-caps notification
 * sounds at 30s; the FULL adhan streams on notification tap). Every entry MUST
 * be registered in app.json's expo-notifications `sounds` array (that plugin
 * copies the file into the native bundle and — on Android — makes it usable as
 * a channel sound). `file` is the value expo-notifications expects for both the
 * scheduled-notification `sound` field and the Android channel `sound` field.
 *
 * Android channel sounds are immutable after channel creation, so each sound
 * needs its own channel id (adhanChannelId) — we create them all up front.
 */
export interface AdhanSound {
  /** Stable id persisted in settings (never the filename — filenames can change). */
  id: string;
  /** Bundled WAV filename, as it appears in app.json `sounds` + native bundle. */
  file: string;
  /** i18n key for the display name in the picker. */
  labelKey: string;
  /** Android notification channel dedicated to this sound (immutable channel-sound rule). */
  adhanChannelId: string;
}

export const ADHAN_SOUNDS: readonly AdhanSound[] = [
  { id: 'takbir',  file: 'adhan_takbir.wav',  labelKey: 'screens.notifications.adhanSound.takbir',  adhanChannelId: NOTIFICATION_CHANNEL_ADHAN_ID },
  { id: 'makkah',  file: 'adhan_makkah.wav',  labelKey: 'screens.notifications.adhanSound.makkah',  adhanChannelId: 'prayer-alarms-adhan-makkah' },
  { id: 'mishari', file: 'adhan_mishari.wav', labelKey: 'screens.notifications.adhanSound.mishari', adhanChannelId: 'prayer-alarms-adhan-mishari' },
  { id: 'madina',  file: 'adhan_madina.wav',  labelKey: 'screens.notifications.adhanSound.madina',  adhanChannelId: 'prayer-alarms-adhan-madina' },
] as const;

/** Default bundled adhan sound id (the original takbir cut). */
export const DEFAULT_ADHAN_SOUND_ID = 'takbir';

/** Look up a bundled adhan sound by id, falling back to the default (never undefined). */
export function resolveAdhanSound(id: string | null | undefined): AdhanSound {
  return ADHAN_SOUNDS.find((s) => s.id === id) ?? ADHAN_SOUNDS[0]!;
}

// ── Smart-alarm constants (Suhoor / Tahajjud / Qiyam) ─────────────────────────

/** Background task name for the smart-alarm reschedule window. */
export const SMART_ALARM_TASK = 'SMART_ALARM_RESCHEDULE';

/** Android notification channel for smart alarms (Suhoor/Tahajjud) — default chime. */
export const SMART_ALARM_CHANNEL_ID = 'smart-alarms';

/** Android notification channel for Jumu'ah reminders — default chime. */
export const JUMUAH_CHANNEL_ID = 'jumuah-reminders';

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
