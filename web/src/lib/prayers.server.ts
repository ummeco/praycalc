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

// Muslim World League (MWL) Fajr/Isha angles: 18° Fajr / 17° Isha.
// Islamic basis: MWL is the globally accepted standard for Fajr/Isha angles,
// adopted by ISNA, ECFR, and most North American/European Islamic organizations.
// Source: Muslim World League, Mecca — established standard used globally.
// For Hanafi Asr, the madhab uses shadow-ratio 2x (controlled by `hanafi` flag).
// MWL is chosen as the hanafiAngles method; Karachi (18°/18°) is the South-Asian
// Hanafi alternative but MWL is the broader global default.
// Users may override via the calculation method selector in the UI (see PrayerCalculator.tsx).
const _HANAFI_ANGLES_METHOD_ID = 'MWL' as const;

/**
 * Compute prayer times for a given date/location.
 *
 * @param date - Gregorian date
 * @param lat - Latitude
 * @param lng - Longitude
 * @param tzOffset - UTC offset in hours (from luxon DateTime)
 * @param hanafi - Use Hanafi Asr calculation (shadow = 2x)
 * @param hanafiAngles - Use MWL fixed-angle Fajr (18°) / Isha (17°) instead of dynamic calculation
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
    // calcTimesAll returns a `Methods` map keyed by string method ID (e.g. 'MWL', 'Karachi') —
    // NOT numeric indices. Using the string ID is required; numeric string keys ('5') are undefined.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pray-calc CJS types do not expose Methods shape
    const hanafiEntry = (allTimes as any).Methods?.[_HANAFI_ANGLES_METHOD_ID] as [string, string] | undefined;
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
