/**
 * Purpose: Single source of truth for prayer-name → i18n label-key mapping and the two
 *   canonical prayer-name orderings used across screens. Replaces 7 byte-identical local
 *   copies of `PRAYER_LABEL_KEYS` (NotificationSettingsScreen, SettingsScreen,
 *   PrayerTimesScreen, AdhanScreen, AgendasScreen, TravelScreen, TimetableScreen) that had
 *   drifted into duplicated maintenance burden.
 * Inputs: none (static data).
 * Outputs: PRAYER_LABEL_KEYS (all 6 prayers → 'prayer.*' i18n key), NOTIFIABLE_PRAYERS
 *   (5 salah prayers — Sunrise excluded, no salah to notify/log for it),
 *   DISPLAY_PRAYERS (all 6, Sunrise included — timetable/calendar alignment).
 * Constraints: Render-time translation only — the internal PrayerName union stays English
 *   (store keys, route params, analytics events all key off the English name).
 * SPORT: REGISTRY-CONSTANTS.md#praycalc-mobile-prayer-labels
 */

import type { PrayerName } from '../types/prayer';

/** Translation key per prayer name, `prayer` namespace (render-time only). */
export const PRAYER_LABEL_KEYS: Record<PrayerName, string> = {
  Fajr: 'prayer.fajr',
  Sunrise: 'prayer.sunrise',
  Dhuhr: 'prayer.dhuhr',
  Asr: 'prayer.asr',
  Maghrib: 'prayer.maghrib',
  Isha: 'prayer.isha',
};

/** The 5 salah prayers eligible for notifications/adhan/logging — Sunrise excluded (no salah). */
export const NOTIFIABLE_PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** All 6 prayer rows for display surfaces (timetable, prayer times list) — includes Sunrise. */
export const DISPLAY_PRAYERS: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
