/**
 * Purpose: Prayer-time + qibla wrapper for RN consumption.
 *   Prayer times use the validated `pray-calc` package (v2, the same engine the
 *   web app uses) via getTimesAll — NREL SPA solar position + the Dynamic Method,
 *   with fixed-angle method presets and Hanafi/Shafi Asr. Adds two layers on top:
 *   (1) user-supplied custom Fajr/Isha depression angles, solved via the standard solar
 *   hour-angle equation against pray-calc's own solar ephemeris/noon outputs;
 *   (2) high-latitude substitution, delegated to pray-calc's own `applyHighLatitudeRule`
 *   rather than reimplemented here, so app and engine cannot drift. Six rules: the three
 *   night-proportion ones plus Aqrab al-Bilad and Aqrab al-Ayyam, which are the only rules
 *   that reach inside the polar circles. The rules are applied to the app's OWN Fajr/Isha
 *   because a fixed-method overlay and custom angles are computed here and never seen by
 *   the engine. `provenance` comes back with the result so the UI can mark a juristic
 *   substitution instead of presenting it as a calculation.
 * Inputs: latitude, longitude, date, method key, madhab, tz offset (hours),
 *   optional highLatRule + custom angles + per-prayer manual minute adjustments
 *   (±30, matching a local mosque timetable — applied AFTER high-lat fallback so
 *   a correction never masks an unreachable-angle condition).
 * Outputs: PrayerTimes { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha } as Date objects.
 * Constraints: Tehran/Jafari never passed (not in pray-calc's METHODS — D-P3-19).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-prayer-calc
 */

import { getTimesAll, getTimes, solarEphemeris, toJulianDate, applyHighLatitudeRule } from 'pray-calc';
import type { HighLatitudeRule as EngineRule, TimeSource as EngineSource } from 'pray-calc';
import type {
  PrayerTimes, Madhab, HighLatRule, PrayerName, PrayerProvenance, PrayerTimeSource,
  DetailedPrayerTimes,
} from '../../types/prayer';
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
 *
 * Exported so a regression test can inject a sentinel directly. The engines stopped
 * emitting one in nrel-spa 2.1.0, but the app pins its engine with a caret range, so this
 * stays as defense in depth against an older resolution.
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

/**
 * App rule name -> engine rule name.
 *
 * The substitution logic itself lives in pray-calc so both stay in step; this file only
 * decides WHICH values to run through it. That matters because the app computes Fajr and
 * Isha in three different ways (the engine's dynamic angles, a fixed-method overlay, or a
 * user's custom depression angles) and the engine only ever sees the first.
 */
const ENGINE_RULE: Record<HighLatRule, EngineRule> = {
  NightMiddle: 'middleOfNight',
  AngleBased: 'angleBased',
  OneSeventh: 'oneSeventh',
  AqrabAlBilad: 'aqrabAlBilad',
  AqrabAlAyyam: 'aqrabAlAyyam',
  None: 'none',
};

/** Engine provenance value -> the app's own naming. */
const APP_SOURCE: Record<EngineSource, PrayerTimeSource> = {
  observed: 'observed',
  middleOfNight: 'NightMiddle',
  angleBased: 'AngleBased',
  oneSeventh: 'OneSeventh',
  aqrabAlBilad: 'AqrabAlBilad',
  aqrabAlAyyam: 'AqrabAlAyyam',
  unavailable: 'unavailable',
};

/**
 * Convert fractional hours (may be NaN or slightly out of [0,24)) onto a base Date, local time.
 *
 * An unreachable prayer returns an **Invalid Date**, not local midnight. Midnight is a real
 * time of day: rendering it for "this prayer does not exist today" told the user Fajr was at
 * 12:00 AM. Callers must test with `isPrayerTimeValid` before formatting or scheduling.
 */
function hoursToDate(base: Date, hours: number): Date {
  if (!Number.isFinite(hours)) return new Date(NaN);
  const d = new Date(base);
  // Roll the date rather than wrapping the clock. The engine reports a time past midnight
  // as e.g. 24.16 (00:09 tomorrow), and wrapping that to 00:09 TODAY moved Isha to the
  // start of the day — ahead of Fajr in any sorted list, and ahead of "now" for the
  // countdown and the notification scheduler. Shifting the date keeps the instant correct.
  // setDate/setHours are used rather than millisecond arithmetic so DST transitions are
  // handled by the platform.
  const dayOffset = Math.floor(hours / 24);
  const within = hours - dayOffset * 24;
  if (dayOffset !== 0) d.setDate(d.getDate() + dayOffset);
  const h = Math.floor(within);
  const remainderMinutes = (within - h) * 60;
  const m = Math.floor(remainderMinutes);
  const s = Math.round((remainderMinutes - m) * 60);
  d.setHours(h, m, s, 0);
  return d;
}

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
export function calculatePrayerTimesDetailed(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number,
  methodKey: CalcMethodKey,
  madhab: Madhab = 'Shafi',
  highLatRule: HighLatRule = 'NightMiddle',
  customAngles?: { fajr: number; isha: number },
  minuteAdjustments?: Partial<Record<PrayerName, number>>,
): DetailedPrayerTimes {
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

  // Run the app's own Fajr/Isha through the engine's substitution rules. The engine
  // applies them to its dynamic angles internally, but the values above may come from a
  // fixed-method overlay or a custom-angle solve, which it never sees — so they are
  // applied here explicitly rather than by passing a rule into getTimesAll.
  const highLat = applyHighLatitudeRule(
    {
      rule: ENGINE_RULE[highLatRule],
      date,
      lat: latitude,
      lng: longitude,
      fajrAngle,
      ishaAngle,
      // Aqrab al-Bilad and Aqrab al-Ayyam need other days/latitudes resolved. Always with
      // rule 'none' so a fallback can never recurse into another fallback.
      resolveDay: (d, resolveLat, resolveLng) => {
        const r = getTimes(d, resolveLat, resolveLng, timezone, 0, undefined, undefined, hanafi, 'none');
        return {
          Fajr: sanitizeHours(r.Fajr),
          Isha: sanitizeHours(r.Isha),
          Noon: sanitizeHours(r.Noon),
        };
      },
    },
    fajr,
    isha,
    raw.Sunrise,
    raw.Maghrib,
  );
  fajr = highLat.Fajr;
  isha = highLat.Isha;
  const provenance: PrayerProvenance = {
    Fajr: APP_SOURCE[highLat.provenance.Fajr],
    Isha: APP_SOURCE[highLat.provenance.Isha],
  };

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

  return { times, provenance };
}

/**
 * Prayer times only. Thin wrapper over [calculatePrayerTimesDetailed] for the many callers
 * that just render a timetable; use the detailed form when the caller needs to distinguish
 * a computed time from a juristic substitution.
 */
export function calculatePrayerTimes(
  ...args: Parameters<typeof calculatePrayerTimesDetailed>
): PrayerTimes {
  return calculatePrayerTimesDetailed(...args).times;
}
