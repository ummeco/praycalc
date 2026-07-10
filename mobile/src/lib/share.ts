/**
 * Purpose: Pure text builders for the native Share sheet (react-native Share API,
 *   no extra dependency) — today's prayer times for a city, and a general
 *   "share the app" message. Kept side-effect-free so they're unit-testable
 *   without mocking react-native's Share module.
 * Inputs: PrayerTimes (Date per prayer), city/country strings, TimeFormat,
 *   locale (for time formatting).
 * Outputs: Plain-text share message + a praycalc.com link.
 * Constraints: No trailing/leading whitespace surprises — callers pass the
 *   returned string straight into Share.share({ message }).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-share
 */

import type { PrayerTimes, TimeFormat } from '../types/prayer';
import { PRAYER_LABEL_KEYS, DISPLAY_PRAYERS } from '../constants/prayers';
import { formatTime } from './formatTime';

export const PRAYCALC_SHARE_URL = 'https://praycalc.com';

export interface BuildPrayerTimesShareTextOptions {
  times: PrayerTimes;
  city: string;
  country: string;
  timeFormat: TimeFormat;
  locale: string;
  /** Translated prayer-name lookup, e.g. t(PRAYER_LABEL_KEYS[name]) — kept as an
   *  injected function so this stays i18n-agnostic and unit-testable without i18next. */
  translatePrayerLabel: (name: (typeof DISPLAY_PRAYERS)[number]) => string;
}

/** Build "Prayer times for {city} today: Fajr 5:12am, ... — praycalc.com" */
export function buildPrayerTimesShareText(options: BuildPrayerTimesShareTextOptions): string {
  const { times, city, country, timeFormat, locale, translatePrayerLabel } = options;
  const lines = DISPLAY_PRAYERS
    .map((name) => `${translatePrayerLabel(name)}: ${formatTime(times[name], timeFormat, locale)}`)
    .join('\n');
  const location = country ? `${city}, ${country}` : city;
  return `Prayer times for ${location} today:\n${lines}\n\n${PRAYCALC_SHARE_URL}`;
}

/** Build the generic "share the app" message (no location data required). */
export function buildAppShareText(): string {
  return `PrayCalc — accurate prayer times, Qibla direction, and more.\n${PRAYCALC_SHARE_URL}`;
}

// Re-export for callers that only need the label-key map alongside the builder.
export { PRAYER_LABEL_KEYS };
