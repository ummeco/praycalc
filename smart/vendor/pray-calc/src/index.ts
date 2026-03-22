/**
 * pray-calc — Islamic prayer times with a physics-grounded dynamic angle algorithm.
 *
 * Main exports:
 *   getTimes       - Raw fractional-hour prayer times (dynamic method)
 *   calcTimes      - Formatted HH:MM:SS prayer times (dynamic method)
 *   getTimesAll    - Raw times + all 14 traditional method comparisons
 *   calcTimesAll   - Formatted times + all 14 traditional method comparisons
 *   getAngles      - Dynamic Fajr/Isha twilight depression angles
 *   getAsr         - Asr prayer time from solar noon and declination
 *   getQiyam       - Start of the last third of the night
 *   getMidnight    - Midpoint of the night (Isha endpoint)
 *   getMscFajr     - MSC Fajr offset in minutes before sunrise
 *   getMscIsha     - MSC Isha offset in minutes after sunset
 *   solarEphemeris - Jean Meeus solar ephemeris (declination, Earth-Sun distance, ecliptic lon)
 *   METHODS        - Array of all supported traditional method definitions
 */

export { getTimes } from './getTimes.js';
export { calcTimes } from './calcTimes.js';
export { getTimesAll, METHODS } from './getTimesAll.js';
export { calcTimesAll } from './calcTimesAll.js';
export { getAngles } from './getAngles.js';
export { getAsr } from './getAsr.js';
export { getQiyam } from './getQiyam.js';
export { getMidnight } from './getMidnight.js';
export { getMscFajr, getMscIsha } from './getMSC.js';
export { solarEphemeris, toJulianDate } from './getSolarEphemeris.js';
export { DHUHR_OFFSET_MINUTES, ANGLE_MIN, ANGLE_MAX } from './constants.js';

export type {
  FractionalHours,
  TimeString,
  AsrConvention,
  ShafaqMode,
  TwilightAngles,
  PrayerTimes,
  FormattedPrayerTimes,
  MethodEntry,
  PrayerTimesAll,
  FormattedPrayerTimesAll,
  AtmosphericParams,
  MethodDefinition,
} from './types.js';
