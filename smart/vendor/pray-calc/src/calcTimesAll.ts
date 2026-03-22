/**
 * Formatted prayer times — dynamic method plus all traditional method comparisons.
 */

import { formatTime } from 'nrel-spa';
import { getTimesAll } from './getTimesAll.js';
import type { FormattedPrayerTimesAll } from './types.js';

/**
 * Compute prayer times formatted as HH:MM:SS strings, plus comparison times
 * for every supported traditional method.
 *
 * Uses the dynamic twilight angle algorithm for the primary times. See
 * getTimesAll() for full parameter documentation.
 *
 * @returns All prayer times as HH:MM:SS strings. "N/A" for unreachable events.
 *          Methods map contains [fajrString, ishaString] per method.
 */
export function calcTimesAll(
  date: Date,
  lat: number,
  lng: number,
  tz: number = -date.getTimezoneOffset() / 60,
  elevation = 0,
  temperature = 15,
  pressure = 1013.25,
  hanafi = false,
): FormattedPrayerTimesAll {
  const raw = getTimesAll(date, lat, lng, tz, elevation, temperature, pressure, hanafi);

  const Methods: Record<string, [string, string]> = {};
  for (const [id, [fajr, isha]] of Object.entries(raw.Methods)) {
    Methods[id] = [formatTime(fajr), formatTime(isha)];
  }

  return {
    Qiyam: formatTime(raw.Qiyam),
    Fajr: formatTime(raw.Fajr),
    Sunrise: formatTime(raw.Sunrise),
    Noon: formatTime(raw.Noon),
    Dhuhr: formatTime(raw.Dhuhr),
    Asr: formatTime(raw.Asr),
    Maghrib: formatTime(raw.Maghrib),
    Isha: formatTime(raw.Isha),
    Midnight: formatTime(raw.Midnight),
    angles: raw.angles,
    Methods,
  };
}
