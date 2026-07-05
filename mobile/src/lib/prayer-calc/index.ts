/**
 * Purpose: Prayer-time + qibla wrapper for RN consumption.
 *   Prayer times use the validated `pray-calc` package (v2, the same engine the
 *   web app uses) via calcTimesAll — NREL SPA solar position + the Dynamic Method,
 *   with fixed-angle method presets and Hanafi/Shafi Asr. Replaces the former
 *   hand-rolled placeholder algorithm.
 * Inputs: latitude, longitude, date, method key, madhab, tz offset (hours).
 * Outputs: PrayerTimes { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha } as Date objects.
 * Constraints: Tehran/Jafari never passed (not in pray-calc's METHODS — D-P3-19).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-prayer-calc
 */

import { calcTimesAll } from 'pray-calc';
import type { PrayerTimes, Madhab } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

/**
 * Great-circle bearing toward the Kaaba (NOT planar approximation — CR-C requirement).
 * @returns Bearing in degrees (0-360).
 */
export function getQiblaDirection(lat: number, lng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const lat1 = toRad(lat);
  const lat2 = toRad(KAABA_LAT);
  const dLng = toRad(KAABA_LNG - lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Map the app's method key to pray-calc's METHODS map id.
 * Keys not present (e.g. 'Custom') fall back to the Dynamic Method default.
 */
const METHOD_ID: Partial<Record<CalcMethodKey, string>> = {
  MWL: 'MWL',
  ISNA: 'ISNA',
  Egypt: 'Egypt',
  Makkah: 'UAQ', // Umm Al-Qura University, Makkah
  Karachi: 'Karachi',
  UOIF: 'UOIF',
  // 'Custom' → undefined → Dynamic Method (calcTimesAll top-level Fajr/Isha)
};

/** Parse a "HH:MM" or "HH:MM:SS" clock string onto the given base date (local). */
function clockToDate(base: Date, clock: string | undefined): Date {
  const d = new Date(base);
  if (!clock || !/^\d{1,2}:\d{2}/.test(clock)) {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const [h, m, s] = clock.split(':').map((n) => parseInt(n, 10));
  d.setHours(h ?? 0, m ?? 0, s ?? 0, 0);
  return d;
}

/**
 * Calculate prayer times using the pray-calc v2 engine (NREL SPA), mirroring the
 * web app's getPrayerTimes(). Method presets come from the returned `.Methods`
 * map keyed by method id; unknown keys fall back to the Dynamic Method.
 */
export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number,
  methodKey: CalcMethodKey,
  madhab: Madhab = 'Shafi',
): PrayerTimes {
  const hanafi = madhab === 'Hanafi';
  // calcTimesAll(date, lat, lng, tzOffset, dst, elevation?, pressure?, hanafi)
  const all = calcTimesAll(date, latitude, longitude, timezone, 0, undefined, undefined, hanafi) as {
    Fajr?: string; Sunrise?: string; Dhuhr?: string; Asr?: string; Maghrib?: string; Isha?: string;
    Methods?: Record<string, [string, string]>;
  };

  const methodId = METHOD_ID[methodKey];
  const methodEntry = methodId ? all.Methods?.[methodId] : undefined; // [Fajr, Isha]
  const fajr = methodEntry?.[0] ?? all.Fajr;
  const isha = methodEntry?.[1] ?? all.Isha;

  return {
    Fajr: clockToDate(date, fajr),
    Sunrise: clockToDate(date, all.Sunrise),
    Dhuhr: clockToDate(date, all.Dhuhr),
    Asr: clockToDate(date, all.Asr),
    Maghrib: clockToDate(date, all.Maghrib),
    Isha: clockToDate(date, isha),
  };
}
