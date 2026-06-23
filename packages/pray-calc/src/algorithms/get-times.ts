/**
 * Core prayer times computation — PrayCalc Dynamic Method.
 *
 * Purpose: Compute all prayer times for a given date, location, and method.
 * Inputs: GetTimesParams (date, lat, lng, tz, optional flags).
 * Outputs: PrayerTimes { qiyam, fajr, sunrise, noon, dhuhr, asr, maghrib, isha, angles }.
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * Fixed Hanafi angles (when hanafiAngles=true + hanafi convention):
 *   Fajr = 18°, Isha = 17° — UK/South-Asian Hanafi standard.
 *   ⚠️ FLAG FOR ISLAMIC REVIEW before production use at scale.
 *   Other Hanafi positions exist (e.g. 15°/15° per some Egyptian scholars).
 */

import {
  type PrayerTimes,
  type GetTimesParams,
  AsrConvention,
  HighLatitudeRule,
  ShafaqMode,
} from "../types/index.js";
import { getAngles } from "./angles.js";
import { getSpa } from "./spa.js";
import { toJulianDate, solarEphemeris } from "./solar-ephemeris.js";
import { getAsr } from "./asr.js";
import { getQiyam } from "./qiyam.js";
import { applyHighLatitudeRule } from "./high-latitude.js";

const K_HANAFI_FAJR_ANGLE = 18;
const K_HANAFI_ISHA_ANGLE = 17;

/**
 * Compute prayer times for a given date and location.
 */
export function getTimes(params: GetTimesParams): PrayerTimes {
  const {
    date,
    lat,
    lng,
    tz,
    elevation = 0,
    temperature = 15,
    pressure = 1013.25,
    asrConvention = AsrConvention.shafii,
    hanafiAngles = false,
    highLatitudeRule = HighLatitudeRule.none,
    shafaqMode = ShafaqMode.general,
  } = params;

  const hanafi = asrConvention === AsrConvention.hanafi;

  // 1. Compute twilight angles — fixed Hanafi or dynamic method.
  const tw =
    hanafi && hanafiAngles
      ? { fajrAngle: K_HANAFI_FAJR_ANGLE, ishaAngle: K_HANAFI_ISHA_ANGLE }
      : getAngles(date, lat, lng, { elevation, temperature, pressure, shafaq: shafaqMode });

  // 2. Convert depression angles to SPA zenith angles.
  //    SPA uses zenith (90° + depression) for custom altitude events.
  const fajrZenith = 90 + tw.fajrAngle;
  const ishaZenith = 90 + tw.ishaAngle;

  // 3. Run SPA for solar position + custom twilight times.
  const spaData = getSpa(date, lat, lng, tz, {
    elevation,
    temperature,
    pressure,
    customAngles: [fajrZenith, ishaZenith],
  });

  let fajrTime = spaData.angles[0].sunrise;
  const sunriseTime = spaData.sunrise;
  const noonTime = spaData.solarNoon;
  const maghribTime = spaData.sunset;
  let ishaTime = spaData.angles[1].sunset;

  // Dhuhr: 2.5 minutes after solar noon.
  const dhuhrTime = isFinite(noonTime) ? noonTime + 2.5 / 60 : NaN;

  // 4. Solar declination for Asr (Meeus formula, accurate to ~0.01°).
  const jd = toJulianDate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0)),
  );
  const eph = solarEphemeris(jd);

  // 5. Asr time.
  const asrTime = isFinite(noonTime)
    ? getAsr(noonTime, lat, eph.decl, hanafi)
    : NaN;

  // 6. Apply high-latitude rule if needed.
  if (highLatitudeRule !== HighLatitudeRule.none) {
    const adjusted = applyHighLatitudeRule(
      highLatitudeRule,
      fajrTime,
      ishaTime,
      isFinite(sunriseTime) ? sunriseTime : NaN,
      isFinite(maghribTime) ? maghribTime : NaN,
      isFinite(noonTime) ? noonTime : NaN,
      tw,
    );
    fajrTime = adjusted.fajr;
    ishaTime = adjusted.isha;
  }

  // 7. Qiyam al-Layl (last third of the night).
  const qiyamTime = isFinite(fajrTime) && isFinite(ishaTime)
    ? getQiyam(fajrTime, ishaTime)
    : NaN;

  return {
    qiyam: isFinite(qiyamTime) ? qiyamTime : NaN,
    fajr: isFinite(fajrTime) ? fajrTime : NaN,
    sunrise: isFinite(sunriseTime) ? sunriseTime : NaN,
    noon: isFinite(noonTime) ? noonTime : NaN,
    dhuhr: isFinite(dhuhrTime) ? dhuhrTime : NaN,
    asr: isFinite(asrTime) ? asrTime : NaN,
    maghrib: isFinite(maghribTime) ? maghribTime : NaN,
    isha: isFinite(ishaTime) ? ishaTime : NaN,
    angles: tw,
  };
}

/**
 * Format fractional hours as HH:MM:SS string.
 * Returns "N/A" if the value is non-finite or negative.
 */
export function formatTime(hours: number): string {
  if (!isFinite(hours) || hours < 0) return "N/A";
  const totalSec = Math.round(hours * 3600);
  const h = Math.floor(totalSec / 3600) % 24;
  const rem = totalSec - Math.floor(totalSec / 3600) * 3600;
  const m = Math.floor(rem / 60);
  const s = rem - m * 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
