/**
 * Prayer times comparison — all methods.
 *
 * Returns the PrayCalc Dynamic times plus comparison times for every
 * supported traditional method, all as fractional hours.
 *
 * Supported methods (14 total):
 *
 * | ID      | Name                                         | Fajr  | Isha            | Region          |
 * |---------|----------------------------------------------|-------|-----------------|-----------------|
 * | UOIF    | Union des Org. Islamiques de France          | 12°   | 12°             | France          |
 * | ISNACA  | IQNA / Islamic Council of North America      | 13°   | 13°             | Canada          |
 * | ISNA    | FCNA / Islamic Society of North America      | 15°   | 15°             | US, UK, AU, NZ  |
 * | SAMR    | Spiritual Admin. of Muslims of Russia        | 16°   | 15°             | Russia          |
 * | IGUT    | Inst. of Geophysics, Univ. of Tehran         | 17.7° | 14°             | Iran, Shia use  |
 * | MWL     | Muslim World League                          | 18°   | 17°             | Global default  |
 * | DIBT    | Diyanet İşleri Başkanlığı, Turkey            | 18°   | 17°             | Turkey          |
 * | Karachi | University of Islamic Sciences, Karachi      | 18°   | 18°             | PK, BD, IN, AF  |
 * | Kuwait  | Kuwait Ministry of Islamic Affairs           | 18°   | 17.5°           | Kuwait          |
 * | UAQ     | Umm Al-Qura University, Makkah               | 18.5° | +90 min sunset  | Saudi / Gulf    |
 * | Qatar   | Qatar / Gulf (standard minutes interval)     | 18°   | +90 min sunset  | Qatar, Gulf     |
 * | Egypt   | Egyptian General Authority of Survey         | 19.5° | 17.5°           | EG, SY, IQ, LB  |
 * | MUIS    | Majlis Ugama Islam Singapura                 | 20°   | 18°             | Singapore       |
 * | MSC     | Moonsighting Committee Worldwide (seasonal)  | —     | —               | Global          |
 */

import { getSpa } from 'nrel-spa';
import { computeAngles } from './getAngles.js';
import { getAsr } from './getAsr.js';
import { getQiyam } from './getQiyam.js';
import { getMidnight } from './getMidnight.js';
import { getMscFajr, getMscIsha } from './getMSC.js';
import { validateInputs } from './validate.js';
import { DHUHR_OFFSET_MINUTES } from './constants.js';
import type { MethodDefinition, PrayerTimesAll } from './types.js';

/** All supported traditional methods. */
const METHODS: MethodDefinition[] = [
  {
    id: 'UOIF',
    name: 'Union des Organisations Islamiques de France',
    region: 'France',
    fajrAngle: 12,
    ishaAngle: 12,
  },
  {
    id: 'ISNACA',
    name: 'IQNA / Islamic Council of North America',
    region: 'Canada',
    fajrAngle: 13,
    ishaAngle: 13,
  },
  {
    id: 'ISNA',
    name: 'FCNA / Islamic Society of North America',
    region: 'US, UK, AU, NZ',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  {
    id: 'SAMR',
    name: 'Spiritual Administration of Muslims of Russia',
    region: 'Russia',
    fajrAngle: 16,
    ishaAngle: 15,
  },
  {
    id: 'IGUT',
    name: 'Institute of Geophysics, University of Tehran',
    region: 'Iran',
    fajrAngle: 17.7,
    ishaAngle: 14,
  },
  { id: 'MWL', name: 'Muslim World League', region: 'Global', fajrAngle: 18, ishaAngle: 17 },
  {
    id: 'DIBT',
    name: 'Diyanet İşleri Başkanlığı, Turkey',
    region: 'Turkey',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    region: 'PK, BD, IN, AF',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  {
    id: 'Kuwait',
    name: 'Kuwait Ministry of Islamic Affairs',
    region: 'Kuwait',
    fajrAngle: 18,
    ishaAngle: 17.5,
  },
  {
    id: 'UAQ',
    name: 'Umm Al-Qura University, Makkah',
    region: 'Saudi Arabia',
    fajrAngle: 18.5,
    ishaAngle: null,
    ishaMinutes: 90,
  },
  {
    id: 'Qatar',
    name: 'Qatar / Gulf Standard',
    region: 'Qatar, Gulf',
    fajrAngle: 18,
    ishaAngle: null,
    ishaMinutes: 90,
  },
  {
    id: 'Egypt',
    name: 'Egyptian General Authority of Survey',
    region: 'EG, SY, IQ, LB',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  {
    id: 'MUIS',
    name: 'Majlis Ugama Islam Singapura',
    region: 'Singapore',
    fajrAngle: 20,
    ishaAngle: 18,
  },
  {
    id: 'MSC',
    name: 'Moonsighting Committee Worldwide',
    region: 'Global',
    fajrAngle: null,
    ishaAngle: null,
    useMSC: true,
  },
];

/**
 * Compute prayer times plus all traditional method comparisons.
 *
 * @param date        - Observer's local date (time-of-day is ignored)
 * @param lat         - Latitude in decimal degrees (-90 to 90)
 * @param lng         - Longitude in decimal degrees (-180 to 180)
 * @param tz          - UTC offset in hours (defaults to system tz)
 * @param elevation   - Observer elevation in meters (default: 0)
 * @param temperature - Ambient temperature in °C (default: 15)
 * @param pressure    - Atmospheric pressure in mbar (default: 1013.25)
 * @param hanafi      - Asr convention: false = Shafi'i (default), true = Hanafi
 * @returns Prayer times for the dynamic method plus all traditional methods.
 *          Any time that cannot be computed is returned as `NaN`.
 *          Methods map contains `[fajrTime, ishaTime]` per method.
 * @throws {RangeError} if lat, lng, tz, or elevation are out of valid range
 */
export function getTimesAll(
  date: Date,
  lat: number,
  lng: number,
  tz: number = -date.getTimezoneOffset() / 60,
  elevation = 0,
  temperature = 15,
  pressure = 1013.25,
  hanafi = false,
): PrayerTimesAll {
  validateInputs(lat, lng, tz, elevation);

  // 1. Dynamic angles and reusable solar declination.
  const { fajrAngle, ishaAngle, decl } = computeAngles(
    date,
    lat,
    lng,
    elevation,
    temperature,
    pressure,
  );

  // 2. Build batch zenith angles for the SPA call:
  //    Slot 0: dynamic Fajr, Slot 1: dynamic Isha, then pairs for each method.
  //    Methods with null angles (UAQ-isha, Qatar-isha, MSC) get a placeholder
  //    that is overridden below.
  const methodZeniths: number[] = [];
  for (const m of METHODS) {
    const fZ = m.fajrAngle !== null ? 90 + m.fajrAngle : 90 + 18; // placeholder for non-angle Fajr
    const iZ = m.ishaAngle !== null ? 90 + m.ishaAngle : 90 + 18; // placeholder for fixed-minute Isha
    methodZeniths.push(fZ, iZ);
  }

  const allZeniths: [number, ...number[]] = [
    90 + fajrAngle,
    90 + ishaAngle,
    ...(methodZeniths as number[]),
  ] as [number, ...number[]];

  const spaOpts = { elevation, temperature, pressure };
  const spaData = getSpa(date, lat, lng, tz, spaOpts, allZeniths);

  // 3. Extract core times (index 0 = dynamic Fajr, index 1 = dynamic Isha).
  const fajrTime = spaData.angles[0].sunrise;
  const sunriseTime = spaData.sunrise;
  const noonTime = spaData.solarNoon;
  const maghribTime = spaData.sunset;
  const ishaTime = spaData.angles[1].sunset;
  const dhuhrTime = noonTime + DHUHR_OFFSET_MINUTES / 60;

  // 4. Asr time (reuses declination from computeAngles — no extra ephemeris call).
  const asrTime = getAsr(noonTime, lat, decl, hanafi);
  const qiyamTime = getQiyam(fajrTime, ishaTime);
  const midnightTime = getMidnight(maghribTime, fajrTime);

  // 5. Build Methods map.
  const Methods: Record<string, [number, number]> = {};

  for (let i = 0; i < METHODS.length; i++) {
    const m = METHODS[i];
    const spaBaseIdx = 2 + i * 2; // angles index offset for this method

    let methodFajr = spaData.angles[spaBaseIdx].sunrise;
    let methodIsha: number;

    if (m.useMSC) {
      // MSC: seasonal minutes from sunrise/sunset.
      const mscFajrMin = getMscFajr(date, lat);
      const mscIshaMin = getMscIsha(date, lat);
      methodFajr = isFinite(sunriseTime) ? sunriseTime - mscFajrMin / 60 : NaN;
      methodIsha = isFinite(maghribTime) ? maghribTime + mscIshaMin / 60 : NaN;
    } else if (m.ishaMinutes !== undefined) {
      // Fixed-minute Isha (UAQ = 90 min, Qatar = 90 min after sunset).
      methodIsha = isFinite(maghribTime) ? maghribTime + m.ishaMinutes / 60 : NaN;
    } else {
      methodIsha = spaData.angles[spaBaseIdx + 1].sunset;
    }

    Methods[m.id] = [methodFajr, methodIsha];
  }

  return {
    Qiyam: isFinite(qiyamTime) ? qiyamTime : NaN,
    Fajr: isFinite(fajrTime) ? fajrTime : NaN,
    Sunrise: isFinite(sunriseTime) ? sunriseTime : NaN,
    Noon: isFinite(noonTime) ? noonTime : NaN,
    Dhuhr: isFinite(dhuhrTime) ? dhuhrTime : NaN,
    Asr: isFinite(asrTime) ? asrTime : NaN,
    Maghrib: isFinite(maghribTime) ? maghribTime : NaN,
    Isha: isFinite(ishaTime) ? ishaTime : NaN,
    Midnight: isFinite(midnightTime) ? midnightTime : NaN,
    Methods,
    angles: { fajrAngle, ishaAngle },
  };
}

/** Exported method list for documentation and tooling use. */
export { METHODS };
