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

import { calcTimes, calcTimesAll, METHODS } from 'pray-calc';
import type { CivilDateInput } from 'pray-calc';
import type { FormattedPrayerTimes, FormattedPrayerTimesAll } from 'pray-calc';
import type { PrayerResult } from './prayer-utils';

export type { PrayerResult } from './prayer-utils';

// DPC (Dynamic Prayer Calculation) is PrayCalc's flagship default. It is NOT a
// fixed-angle preset in pray-calc's METHODS map — it is the engine's own dynamic
// output (raw.Fajr / raw.Isha from calcTimesAll), a per-location, per-season angle
// learned from empirical twilight observations. Selecting method=DPC (or omitting
// method entirely) yields those dynamic times. See praycalc.org "How DPC Works".
export const DPC_METHOD_ID = 'DPC' as const;

// Tehran/Jafari (Shia fiqh method) is excluded per D-P3-19 — it is not present
// in pray-calc's METHODS map, so no filtering is needed here; every id in
// METHODS is an approved fixed-angle/seasonal method safe to expose via the API.
/**
 * All method IDs the API accepts for the `method` query param. DPC (the dynamic
 * default) is listed first, followed by every fixed-angle/seasonal preset from
 * pray-calc's METHODS map (e.g. 'MWL', 'Karachi').
 */
export const KNOWN_METHOD_IDS: readonly string[] = [DPC_METHOD_ID, ...METHODS.map((m) => m.id)];

/** True if `id` is a recognized calculation method (case-sensitive; includes DPC). */
export function isKnownMethod(id: string): boolean {
  return KNOWN_METHOD_IDS.includes(id);
}

/** Human-readable label for each method id, used by picker UIs (embed config, etc.). */
const METHOD_LABELS: Record<string, string> = {
  DPC: 'Dynamic (PrayCalc DPC) — Recommended',
  MWL: 'Muslim World League (18°/17°)',
  ISNA: 'ISNA — North America (15°/15°)',
  ISNACA: 'ISNA Canada',
  Egypt: 'Egyptian General Authority (19.5°/17.5°)',
  Karachi: 'University of Islamic Sciences, Karachi (18°/18°)',
  UAQ: 'Umm al-Qura, Makkah (18.5°/90 min)',
  Qatar: 'Qatar (18°/90 min)',
  Kuwait: 'Kuwait (18°/17.5°)',
  MUIS: 'Singapore (MUIS) (20°/18°)',
  UOIF: 'Union des Organisations Islamiques de France (12°/12°)',
  DIBT: 'Diyanet, Türkiye (18°/17°)',
  IGUT: 'Institute of Geophysics, University of Tehran',
  SAMR: 'Spiritual Administration of Muslims, Russia',
  MSC: 'Moonsighting Committee (seasonal)',
};

/** Method id + display label, DPC first. For method-picker UIs. */
export interface MethodOption {
  id: string;
  label: string;
  /** True only for DPC — the recommended dynamic default. */
  recommended: boolean;
}

/** All selectable methods as {id, label, recommended} — DPC first, then fixed presets. */
export function getMethodOptions(): MethodOption[] {
  return KNOWN_METHOD_IDS.map((id) => ({
    id,
    label: METHOD_LABELS[id] ?? id,
    recommended: id === DPC_METHOD_ID,
  }));
}

// Muslim World League (MWL) Fajr/Isha angles: 18° Fajr / 17° Isha.
// Islamic basis: MWL is the globally accepted standard for Fajr/Isha angles,
// adopted by ISNA, ECFR, and most North American/European Islamic organizations.
// Source: Muslim World League, Mecca — established standard used globally.
// For Hanafi Asr, the madhab uses shadow-ratio 2x (controlled by `hanafi` flag).
// MWL is chosen as the hanafiAngles method; Karachi (18°/18°) is the South-Asian
// Hanafi alternative but MWL is the broader global default.
// Users may override via the `method` query param — see getPrayerTimes() below.
const _HANAFI_ANGLES_METHOD_ID = 'MWL' as const;

/**
 * Compute prayer times for a given date/location.
 *
 * @param date - Gregorian date
 * @param lat - Latitude
 * @param lng - Longitude
 * @param tzOffset - UTC offset in hours (from luxon DateTime)
 * @param hanafi - Use Hanafi Asr calculation (shadow = 2x)
 * @param date - The calendar day to compute. Prefer the unambiguous 'YYYY-MM-DD' form: a
 *   Date is an instant, not a day, and which day it denotes depends on the host timezone.
 *   Callers rendering for a location should pass `civilDayIn(timezone)` so the date and the
 *   offset come from the same zone (see P12-E01).
 * @param hanafiAngles - Use MWL fixed-angle Fajr (18°) / Isha (17°) instead of dynamic calculation
 * @param method - Optional method ID (see KNOWN_METHOD_IDS). 'DPC' (or omitting method)
 *   returns the PrayCalc Dynamic Method's own per-location/season Fajr/Isha times. Any
 *   fixed preset id (e.g. 'MWL') overrides Fajr/Isha with that method's fixed-angle/
 *   seasonal times. Unknown/absent -> DPC dynamic default (backward compatible).
 */
export function getPrayerTimes(
  date: CivilDateInput,
  lat: number,
  lng: number,
  tzOffset: number,
  hanafi = false,
  hanafiAngles = false,
  method?: string,
): PrayerResult {
  // DPC is the dynamic default — it has no fixed-angle overlay, so treat it exactly
  // like the no-method path (engine's raw dynamic Fajr/Isha), never a Methods lookup.
  if (method && method !== DPC_METHOD_ID && isKnownMethod(method)) {
    const allTimes = calcTimesAll(date, lat, lng, tzOffset, 0, undefined, undefined, hanafi) as FormattedPrayerTimesAll;
    // calcTimesAll returns a `Methods` map keyed by string method ID (e.g. 'MWL', 'Karachi') —
    // NOT numeric indices. Using the string ID is required; numeric string keys ('5') are undefined.
    // pray-calc's FormattedPrayerTimesAll.Methods is typed Record<string, [TimeString, TimeString]>,
    // so no cast is needed here.
    const methodEntry = allTimes.Methods?.[method];
    return {
      Fajr:    (methodEntry?.[0] ?? allTimes.Fajr)    ?? 'N/A',
      Sunrise: allTimes.Sunrise ?? 'N/A',
      Dhuhr:   allTimes.Dhuhr   ?? 'N/A',
      Asr:     allTimes.Asr     ?? 'N/A',
      Maghrib: allTimes.Maghrib ?? 'N/A',
      Isha:    (methodEntry?.[1] ?? allTimes.Isha)    ?? 'N/A',
      Qiyam:   allTimes.Qiyam   ?? 'N/A',
    };
  }

  if (hanafi && hanafiAngles) {
    const allTimes = calcTimesAll(date, lat, lng, tzOffset, 0, undefined, undefined, hanafi) as FormattedPrayerTimesAll;
    // pray-calc's FormattedPrayerTimesAll.Methods is typed Record<string, [TimeString, TimeString]>.
    const hanafiEntry = allTimes.Methods?.[_HANAFI_ANGLES_METHOD_ID];
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
