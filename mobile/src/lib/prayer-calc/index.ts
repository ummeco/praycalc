/**
 * Purpose: Prayer-time + qibla wrapper for RN consumption.
 *   Prayer times use the validated `pray-calc` package (v2, the same engine the
 *   web app uses) via getTimesAll — NREL SPA solar position + the Dynamic Method,
 *   with fixed-angle method presets and Hanafi/Shafi Asr. Adds two layers pray-calc
 *   itself does not provide: (1) user-supplied custom Fajr/Isha depression angles,
 *   solved via the standard solar hour-angle equation against pray-calc's own solar
 *   ephemeris/noon outputs; (2) high-latitude fallback (Angle-Based / Middle-of-the-
 *   Night / One-Seventh) applied whenever a depression angle is geometrically
 *   unreachable (polar summer), using the classical night-length approximation from
 *   the praytimes.org reference algorithm that the whole industry's high-lat rules
 *   are built on.
 * Inputs: latitude, longitude, date, method key, madhab, tz offset (hours),
 *   optional highLatRule + custom angles + per-prayer manual minute adjustments
 *   (±30, matching a local mosque timetable — applied AFTER high-lat fallback so
 *   a correction never masks an unreachable-angle condition).
 * Outputs: PrayerTimes { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha } as Date objects.
 * Constraints: Tehran/Jafari never passed (not in pray-calc's METHODS — D-P3-19).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-prayer-calc
 */

import { getTimesAll, solarEphemeris, toJulianDate } from 'pray-calc';
import type { PrayerTimes, Madhab, HighLatRule, PrayerName } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';
import { CALC_METHODS } from '../../constants/methods';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const DEG = Math.PI / 180;

/**
 * Upper bound on any legitimate fractional-hour prayer time. Real values live in
 * roughly [-24, 48] once day-wrapping is accounted for; the NREL SPA reports an
 * unreachable rise/set event as the magic number -99999 instead of NaN.
 */
const MAX_PLAUSIBLE_HOURS = 1000;

/**
 * Normalize one raw engine value to NaN when it is not a usable time.
 *
 * WHY this exists: -99999 is a FINITE number, so `Number.isFinite` — the guard used
 * throughout this file and by the UI formatters — accepts it. Before this was added,
 * the sentinel flowed all the way to the screen, where `((-99999 % 24) + 24) % 24 === 9`
 * rendered as a confident, entirely fabricated "09:00" for Sunrise AND Maghrib at
 * Longyearbyen in June (PKG-01). Every value coming out of pray-calc must pass through
 * here before any arithmetic or formatting touches it.
 */
export function sanitizeHours(value: number | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  if (!Number.isFinite(value)) return NaN;
  if (Math.abs(value) >= MAX_PLAUSIBLE_HOURS) return NaN;
  return value;
}

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
 * Keys not present (e.g. 'Custom') are handled separately (custom angle solve).
 */
const METHOD_ID: Partial<Record<CalcMethodKey, string>> = {
  MWL: 'MWL',
  ISNA: 'ISNA',
  Egypt: 'Egypt',
  Makkah: 'UAQ', // Umm Al-Qura University, Makkah
  Karachi: 'Karachi',
  UOIF: 'UOIF',
};

/** Fajr/Isha depression angle per method, for high-lat Angle-Based fallback only. */
const METHOD_ANGLES: Partial<Record<CalcMethodKey, { fajr: number; isha: number }>> = Object.fromEntries(
  CALC_METHODS.map((m) => [m.key, { fajr: m.fajrAngle, isha: m.ishaAngle ?? 18 }]),
);

/** Solve for the fractional-hour time a given solar depression angle is crossed. */
function solveDepressionTime(
  noon: number,
  latitude: number,
  declination: number,
  angleDeg: number,
  before: boolean,
): number {
  const lat = latitude * DEG;
  const decl = declination * DEG;
  const cosH = (-Math.sin(angleDeg * DEG) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
  if (cosH < -1 || cosH > 1 || !Number.isFinite(cosH)) return NaN;
  const hourAngleHours = (Math.acos(cosH) * 180) / Math.PI / 15;
  return before ? noon - hourAngleHours : noon + hourAngleHours;
}

/** Fraction-of-night portion for each high-latitude rule. NaN ('None') means "do not adjust". */
function highLatPortion(rule: HighLatRule, angleDeg: number): number {
  switch (rule) {
    case 'AngleBased':
      return angleDeg / 60;
    case 'OneSeventh':
      return 1 / 7;
    case 'NightMiddle':
      return 1 / 2;
    case 'None':
    default:
      return NaN;
  }
}

/**
 * Apply the high-latitude fallback to an unreachable Fajr/Isha time, per the
 * praytimes.org reference convention: nightLength = 24 - dayLength (same-day
 * Sunrise/Maghrib), then offset Sunrise/Maghrib by `portion * nightLength`.
 */
function applyHighLatFallback(
  rawTime: number,
  sunrise: number,
  maghrib: number,
  rule: HighLatRule,
  angleDeg: number,
  isFajr: boolean,
): number {
  if (Number.isFinite(rawTime)) return rawTime;
  if (!Number.isFinite(sunrise) || !Number.isFinite(maghrib)) return NaN;
  const portion = highLatPortion(rule, angleDeg);
  if (!Number.isFinite(portion)) return NaN; // 'None' — leave unreachable
  // At extreme latitudes, sunset can fall just after local midnight and comes back
  // as a small fractional-hour value (e.g. 0.06 = 00:04) that is numerically less
  // than sunrise — unwrap it onto the same 24h+ axis before measuring night length.
  const maghribUnwrapped = maghrib < sunrise ? maghrib + 24 : maghrib;
  const nightLength = 24 - (maghribUnwrapped - sunrise);
  return isFajr ? sunrise - portion * nightLength : maghribUnwrapped + portion * nightLength;
}

/**
 * Convert fractional hours (may be NaN or slightly out of [0,24)) onto a base Date, local time.
 *
 * An unreachable prayer returns an **Invalid Date**, not local midnight. Midnight is a real
 * time of day: rendering it for "this prayer does not exist today" told the user Fajr was at
 * 12:00 AM. Callers must test with `isPrayerTimeValid` before formatting or scheduling.
 */
function hoursToDate(base: Date, hours: number): Date {
  const d = new Date(base);
  if (!Number.isFinite(hours)) return new Date(NaN);
  const wrapped = ((hours % 24) + 24) % 24;
  const h = Math.floor(wrapped);
  const remainderMinutes = (wrapped - h) * 60;
  const m = Math.floor(remainderMinutes);
  const s = Math.round((remainderMinutes - m) * 60);
  d.setHours(h, m, s, 0);
  return d;
}

/**
 * Test-only alias for the boundary sanitizer, so a regression test can inject a sentinel
 * directly. The engines no longer emit one (nrel-spa >= 2.1.0), but the app pins its
 * engine with a caret range, so this guard stays as defense in depth against an older
 * resolution.
 */
export const sanitizeForTest = sanitizeHours;

/**
 * True when a prayer time is a real instant that may be displayed, scheduled or compared.
 *
 * Above the Arctic and Antarctic circles some prayers genuinely have no time on some days:
 * there is no sunrise to precede Fajr and no sunset to follow Maghrib. Those come back as
 * Invalid Date. Every caller that formats, schedules a notification for, sorts, or diffs a
 * prayer time must gate on this first — an Invalid Date silently poisons date arithmetic.
 */
export function isPrayerTimeValid(date: Date | null | undefined): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * Calculate prayer times using the pray-calc v2 engine (NREL SPA), mirroring the
 * web app's getPrayerTimes(). Method presets come from `.Methods`; 'Custom' solves
 * the user's own Fajr/Isha depression angles directly. Unreachable angles (high
 * latitude, polar summer) fall back per `highLatRule`.
 *
 * A prayer with no time today is returned as an Invalid Date — never as midnight and
 * never as an engine sentinel. Gate on `isPrayerTimeValid` before using any value.
 */
export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number,
  methodKey: CalcMethodKey,
  madhab: Madhab = 'Shafi',
  highLatRule: HighLatRule = 'NightMiddle',
  customAngles?: { fajr: number; isha: number },
  minuteAdjustments?: Partial<Record<PrayerName, number>>,
): PrayerTimes {
  const hanafi = madhab === 'Hanafi';
  const engine = getTimesAll(date, latitude, longitude, timezone, 0, undefined, undefined, hanafi);

  // Sanitize at the boundary: nothing downstream may see a raw engine sentinel (PKG-01).
  const raw = {
    Fajr: sanitizeHours(engine.Fajr),
    Sunrise: sanitizeHours(engine.Sunrise),
    Noon: sanitizeHours(engine.Noon),
    Dhuhr: sanitizeHours(engine.Dhuhr),
    Asr: sanitizeHours(engine.Asr),
    Maghrib: sanitizeHours(engine.Maghrib),
    Isha: sanitizeHours(engine.Isha),
    Methods: Object.fromEntries(
      Object.entries(engine.Methods ?? {}).map(([id, pair]) => [
        id,
        [sanitizeHours(pair?.[0]), sanitizeHours(pair?.[1])] as [number, number],
      ]),
    ) as Record<string, [number, number]>,
    angles: engine.angles,
  };

  let fajr: number;
  let isha: number;
  let fajrAngle: number;
  let ishaAngle: number;

  if (methodKey === 'Custom' && customAngles) {
    const noonUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
    const { decl } = solarEphemeris(toJulianDate(noonUtc));
    fajrAngle = customAngles.fajr;
    ishaAngle = customAngles.isha;
    fajr = solveDepressionTime(raw.Noon, latitude, decl, fajrAngle, true);
    isha = solveDepressionTime(raw.Noon, latitude, decl, ishaAngle, false);
  } else {
    const methodId = METHOD_ID[methodKey];
    const methodEntry = methodId ? raw.Methods[methodId] : undefined; // [Fajr, Isha] fractional hours
    const methodAngles = METHOD_ANGLES[methodKey] ?? { fajr: raw.angles.fajrAngle, isha: raw.angles.ishaAngle };
    fajrAngle = methodAngles.fajr;
    ishaAngle = methodAngles.isha;
    // DPC (flagship): no METHOD_ID mapping, so methodEntry is undefined and we use the
    // engine's dynamic raw.Fajr/raw.Isha (PrayCalc Dynamic Method) with its dynamic angles.
    fajr = methodEntry?.[0] ?? raw.Fajr;
    isha = methodEntry?.[1] ?? raw.Isha;
  }

  fajr = applyHighLatFallback(fajr, raw.Sunrise, raw.Maghrib, highLatRule, fajrAngle, true);
  isha = applyHighLatFallback(isha, raw.Sunrise, raw.Maghrib, highLatRule, ishaAngle, false);

  const times: PrayerTimes = {
    Fajr: hoursToDate(date, fajr),
    Sunrise: hoursToDate(date, raw.Sunrise),
    Dhuhr: hoursToDate(date, raw.Dhuhr),
    Asr: hoursToDate(date, raw.Asr),
    Maghrib: hoursToDate(date, raw.Maghrib),
    Isha: hoursToDate(date, isha),
  };

  if (minuteAdjustments) {
    for (const name of Object.keys(times) as (keyof PrayerTimes)[]) {
      const minutes = minuteAdjustments[name as PrayerName];
      if (minutes) times[name] = new Date(times[name].getTime() + minutes * 60_000);
    }
  }

  return times;
}
