/**
 * Purpose: Real prayer-time computation for the TV app via the pray-calc v2 engine
 *   (getTimesAll — NREL SPA solar position + the PrayCalc Dynamic Method). Replaces
 *   the previous stub that called a nonexistent @acamarata/pray-calc API and silently
 *   returned fixed placeholder offsets (05:00/06:30/12:30…) for every location — a
 *   production defect: the TV showed fabricated times regardless of city or method.
 * Inputs: date, lat/lon, IANA-or-numeric timezone, methodId (lowercase, 'dpc' default),
 *   madhab ('shafi'|'hanafi').
 * Outputs: PrayerDay with HH:mm strings; '--:--' when a value is genuinely unreachable
 *   (polar day/night) rather than a fabricated time.
 * Constraints: Node/RN compatible; no DOM. DPC (no PRAY_CALC_METHOD_ID entry) uses the
 *   engine's dynamic raw times. Tehran/Jafari excluded (D-P3-19).
 * SPORT: praycalc/tv lib
 */

import { getTimesAll, getTimes, applyHighLatitudeRule } from 'pray-calc';
import { PrayerDay, Madhab, HighLatRule } from '../types';
import { resolveTimezoneOffset } from './timezone';
import { PRAY_CALC_METHOD_ID } from '../constants/methods';

interface CalcOptions {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  methodId: string;
  madhab: Madhab;
  /** Defaults to 'none': report Fajr/Isha absent rather than substituting silently. */
  highLatitudeRule?: HighLatRule;
}

/**
 * Upper bound on any legitimate fractional-hour prayer time. The NREL SPA reports an
 * unreachable rise/set event as the magic number -99999 rather than NaN.
 */
const MAX_PLAUSIBLE_HOURS = 1000;

/**
 * Normalize one raw engine value to NaN when it is not a usable time.
 *
 * WHY: -99999 is FINITE, so the `Number.isFinite` guard below accepted it and
 * `((-99999 % 24) + 24) % 24 === 9` printed a confident "09:00" for both Sunrise and
 * Maghrib during Longyearbyen's polar day (PKG-02). Every engine value passes through
 * here before any formatting.
 */
function sanitizeHours(value: number | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  if (!Number.isFinite(value)) return NaN;
  if (Math.abs(value) >= MAX_PLAUSIBLE_HOURS) return NaN;
  return value;
}

/** Fractional-hours (may be NaN / slightly out of [0,24)) → "HH:mm" local, or "--:--". */
function hoursToHHMM(hours: number): string {
  if (!Number.isFinite(hours)) return '--:--';
  const wrapped = ((hours % 24) + 24) % 24;
  const h = Math.floor(wrapped);
  const m = Math.round((wrapped - h) * 60);
  const hh = (m === 60 ? (h + 1) % 24 : h).toString().padStart(2, '0');
  const mm = (m === 60 ? 0 : m).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Compute the day's prayer times. DPC (the default) uses the engine's dynamic
 * raw.Fajr/raw.Isha; a fixed method overlays its raw.Methods[id] Fajr/Isha.
 */
export function calculatePrayerTimes(opts: CalcOptions): PrayerDay {
  const tz = resolveTimezoneOffset(opts.timezone, opts.date);
  const hanafi = opts.madhab === 'hanafi';
  const raw = getTimesAll(opts.date, opts.latitude, opts.longitude, tz, 0, undefined, undefined, hanafi);

  const methodKey = PRAY_CALC_METHOD_ID[opts.methodId];
  const methodEntry = methodKey ? raw.Methods[methodKey] : undefined; // [Fajr, Isha] fractional hours
  // Sanitize at the boundary — the `??` below must not treat a sentinel as a real value.
  const rawFajr = sanitizeHours(methodEntry?.[0] ?? raw.Fajr); // DPC / unknown -> dynamic
  const rawIsha = sanitizeHours(methodEntry?.[1] ?? raw.Isha);

  // Apply the substitution rule to the app's own Fajr/Isha. A fixed-method overlay is
  // never seen by the engine, so passing a rule into getTimesAll would leave those
  // untouched — the rule has to be applied to these values explicitly.
  const highLat = applyHighLatitudeRule(
    {
      rule: opts.highLatitudeRule ?? 'none',
      date: opts.date,
      lat: opts.latitude,
      lng: opts.longitude,
      fajrAngle: raw.angles.fajrAngle,
      ishaAngle: raw.angles.ishaAngle,
      // Always resolved with 'none' so a fallback can never recurse into another.
      resolveDay: (d, resolveLat, resolveLng) => {
        const r = getTimes(d, resolveLat, resolveLng, tz, 0, undefined, undefined, hanafi, 'none');
        return {
          Fajr: sanitizeHours(r.Fajr),
          Isha: sanitizeHours(r.Isha),
          Noon: sanitizeHours(r.Noon),
        };
      },
    },
    rawFajr,
    rawIsha,
    sanitizeHours(raw.Sunrise),
    sanitizeHours(raw.Maghrib),
  );
  const fajr = highLat.Fajr;
  const isha = highLat.Isha;

  return {
    fajr: hoursToHHMM(fajr),
    sunrise: hoursToHHMM(sanitizeHours(raw.Sunrise)),
    dhuhr: hoursToHHMM(sanitizeHours(raw.Dhuhr)),
    asr: hoursToHHMM(sanitizeHours(raw.Asr)),
    maghrib: hoursToHHMM(sanitizeHours(raw.Maghrib)),
    isha: hoursToHHMM(isha),
    date: opts.date.toISOString().split('T')[0] as string,
  };
}
