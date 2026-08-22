/**
 * geo.ts — Client-side geo utilities.
 *
 * PURPOSE: Location search and reverse geocoding via Astro API endpoints.
 *   Shared by client islands and server pages (no server-only marker needed in Astro).
 * INPUTS: Query strings, lat/lng coordinates
 * OUTPUTS: GeoResult objects
 * CONSTRAINTS: No Node.js filesystem APIs (use geo.server.ts for those)
 * REF: P2-E3-W02-S02-T03
 */

import { DateTime } from 'luxon';

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
  slug: string;
  timezone?: string;
}

/** Client-side: call Astro API endpoints */
export async function searchLocation(query: string): Promise<GeoResult[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json() as Promise<GeoResult[]>;
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeoResult | null> {
  try {
    const res = await fetch(`/api/geo?lat=${lat}&lng=${lng}`);
    if (!res.ok) return null;
    return res.json() as Promise<GeoResult>;
  } catch {
    return null;
  }
}

/**
 * Approximate UTC offset in hours for a given timezone and date.
 * Accepts IANA zone names ("America/New_York") or plain numeric offsets
 * ("3", "-5.5") for backward compatibility. Throws a TypeError with a clear
 * message for anything else (API routes convert it to a 400) — previously an
 * invalid zone propagated as an unhandled Luxon RangeError (500/masked 404).
 */
export function getUtcOffset(timezone: string, date: Date = new Date()): number {
  const asNumber = Number(timezone);
  if (timezone.trim() !== '' && Number.isFinite(asNumber)) {
    if (asNumber < -14 || asNumber > 14) {
      throw new TypeError(`Invalid UTC offset: ${timezone} (expected -14..14)`);
    }
    return asNumber;
  }
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  if (!dt.isValid) {
    throw new TypeError(`Invalid timezone: ${timezone} (expected IANA name like America/New_York)`);
  }
  return dt.offset / 60;
}

/**
 * The calendar day currently in progress in `timezone`, as 'YYYY-MM-DD'.
 *
 * WHY this exists: prayer times belong to a calendar day, and a server-rendered page must
 * serve the day the VIEWER is on, not the day the server is on. Taking `new Date()` on a
 * Vercel box (UTC) and pairing it with a city's UTC offset takes the date from one timezone
 * and the offset from another. Measured 2026-08-22 over 24 hourly samples, that served the
 * wrong date for 12 hours a day in Auckland, 10 in Honolulu and 9 in Tokyo.
 *
 * WHY a string: pray-calc 2.4.0 accepts 'YYYY-MM-DD' precisely so callers never have to
 * reason about instants. Returning a Date would hand the ambiguity straight back, since a
 * Date carries no record of which frame produced it.
 *
 * WHY not a fixed offset: offsets move with DST. Adding `getUtcOffset(tz)` hours to a UTC
 * instant is right for most of the year and wrong across every transition. Luxon resolves
 * the zone at the instant, which is the only correct way.
 *
 * Accepts the same two timezone forms as {@link getUtcOffset}: an IANA name
 * ('Pacific/Auckland') or a bare numeric UTC offset ('13', '-5'), because the embed and
 * calendar surfaces may receive either.
 *
 * @param timezone - IANA timezone name, or a numeric UTC offset in hours as a string
 * @param date     - The instant to resolve at; defaults to now
 * @returns The calendar day in that zone, zero-padded as 'YYYY-MM-DD'
 * @throws TypeError if the timezone is neither a valid IANA name nor an in-range offset
 */
export function civilDayIn(timezone: string, date: Date = new Date()): string {
  const asNumber = Number(timezone);
  if (timezone.trim() !== '' && Number.isFinite(asNumber)) {
    if (asNumber < -14 || asNumber > 14) {
      throw new TypeError(`Invalid UTC offset: ${timezone} (expected -14..14)`);
    }
    const shifted = DateTime.fromJSDate(date, { zone: 'utc' }).plus({ minutes: asNumber * 60 });
    return shifted.toFormat('yyyy-MM-dd');
  }

  const dt = DateTime.fromJSDate(date, { zone: timezone });
  if (!dt.isValid) {
    throw new TypeError(`Invalid timezone: ${timezone} (expected IANA name like America/New_York)`);
  }
  return dt.toFormat('yyyy-MM-dd');
}

// Approximate timezone per US state abbreviation (fallback)
export const US_STATE_TZ: Record<string, string> = {
  al: 'America/Chicago', ak: 'America/Anchorage', az: 'America/Phoenix',
  ar: 'America/Chicago', ca: 'America/Los_Angeles', co: 'America/Denver',
  ct: 'America/New_York', de: 'America/New_York', fl: 'America/New_York',
  ga: 'America/New_York', hi: 'Pacific/Honolulu', id: 'America/Boise',
  il: 'America/Chicago', in: 'America/Indiana/Indianapolis', ia: 'America/Chicago',
  ks: 'America/Chicago', ky: 'America/New_York', la: 'America/Chicago',
  me: 'America/New_York', md: 'America/New_York', ma: 'America/New_York',
  mi: 'America/Detroit', mn: 'America/Chicago', ms: 'America/Chicago',
  mo: 'America/Chicago', mt: 'America/Denver', ne: 'America/Chicago',
  nv: 'America/Los_Angeles', nh: 'America/New_York', nj: 'America/New_York',
  nm: 'America/Denver', ny: 'America/New_York', nc: 'America/New_York',
  nd: 'America/Chicago', oh: 'America/New_York', ok: 'America/Chicago',
  or: 'America/Los_Angeles', pa: 'America/New_York', ri: 'America/New_York',
  sc: 'America/New_York', sd: 'America/Chicago', tn: 'America/Chicago',
  tx: 'America/Chicago', ut: 'America/Denver', vt: 'America/New_York',
  va: 'America/New_York', wa: 'America/Los_Angeles', wv: 'America/New_York',
  wi: 'America/Chicago', wy: 'America/Denver', dc: 'America/New_York',
};
