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

import { getTimesAll } from 'pray-calc';
import { PrayerDay, Madhab } from '../types';
import { resolveTimezoneOffset } from './timezone';
import { PRAY_CALC_METHOD_ID } from '../constants/methods';

interface CalcOptions {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  methodId: string;
  madhab: Madhab;
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
  const fajr = methodEntry?.[0] ?? raw.Fajr; // DPC / unknown -> dynamic
  const isha = methodEntry?.[1] ?? raw.Isha;

  return {
    fajr: hoursToHHMM(fajr),
    sunrise: hoursToHHMM(raw.Sunrise),
    dhuhr: hoursToHHMM(raw.Dhuhr),
    asr: hoursToHHMM(raw.Asr),
    maghrib: hoursToHHMM(raw.Maghrib),
    isha: hoursToHHMM(isha),
    date: opts.date.toISOString().split('T')[0] as string,
  };
}
