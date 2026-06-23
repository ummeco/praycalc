/**
 * prayers.server.ts — Server-side prayer time calculation for Astro endpoints.
 *
 * PURPOSE: Wraps pray-calc to compute prayer times for a given location.
 *   Astro equivalent of the Next.js lib/prayers.ts (server-only).
 *   No "server-only" package needed — Astro isolates server code by convention.
 * INPUTS: Date, lat, lng, tzOffset, hanafi flag
 * OUTPUTS: PrayerResult with formatted HH:MM times
 * CONSTRAINTS: Only import from Astro server pages/endpoints, never client islands
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON
 */

import { calcTimes, calcTimesAll } from 'pray-calc';
import type { FormattedPrayerTimes, FormattedPrayerTimesAll } from 'pray-calc';
import type { PrayerResult } from './prayer-utils';

export type { PrayerResult } from './prayer-utils';

// Muslim World League (method index 5) — 18° Fajr / 17° Isha
// ⚠️ FLAG FOR ISLAMIC REVIEW: other Hanafi positions exist (e.g. 15°/15°).
const _HANAFI_METHOD_INDEX = 5;

/**
 * Compute prayer times for a given date/location.
 *
 * @param date - Gregorian date
 * @param lat - Latitude
 * @param lng - Longitude
 * @param tzOffset - UTC offset in hours (from luxon DateTime)
 * @param hanafi - Use Hanafi Asr calculation (shadow = 2x)
 * @param hanafiAngles - Use MWL 18°/17° Fajr/Isha angles
 */
export function getPrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  tzOffset: number,
  hanafi = false,
  hanafiAngles = false,
): PrayerResult {
  if (hanafi && hanafiAngles) {
    const allTimes = calcTimesAll(date, lat, lng, tzOffset, 0, undefined, undefined, hanafi) as FormattedPrayerTimesAll;
    const hanafiEntry = (allTimes as any).Methods?.[String(_HANAFI_METHOD_INDEX)];
    return {
      Fajr:    (hanafiEntry?.[0]  ?? allTimes.Fajr)    ?? 'N/A',
      Sunrise: allTimes.Sunrise ?? 'N/A',
      Dhuhr:   allTimes.Dhuhr   ?? 'N/A',
      Asr:     allTimes.Asr     ?? 'N/A',
      Maghrib: allTimes.Maghrib ?? 'N/A',
      Isha:    (hanafiEntry?.[1]  ?? allTimes.Isha)    ?? 'N/A',
      Qiyam:   allTimes.Qiyam   ?? 'N/A',
    };
  }

  const times = calcTimes(
    date,
    lat,
    lng,
    tzOffset,
    0,
    undefined,
    undefined,
    hanafi,
  ) as FormattedPrayerTimes;

  return {
    Fajr:    times.Fajr    ?? 'N/A',
    Sunrise: times.Sunrise ?? 'N/A',
    Dhuhr:   times.Dhuhr   ?? 'N/A',
    Asr:     times.Asr     ?? 'N/A',
    Maghrib: times.Maghrib ?? 'N/A',
    Isha:    times.Isha    ?? 'N/A',
    Qiyam:   times.Qiyam   ?? 'N/A',
  };
}
