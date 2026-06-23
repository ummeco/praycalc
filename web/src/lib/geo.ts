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

/** Approximate UTC offset in hours for a given timezone and date */
export function getUtcOffset(timezone: string, date: Date = new Date()): number {
  return DateTime.fromJSDate(date, { zone: timezone }).offset / 60;
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
