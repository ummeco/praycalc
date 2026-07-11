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
import { type PrayerTimes, type GetTimesParams } from "../types/index.js";
/**
 * Compute prayer times for a given date and location.
 */
export declare function getTimes(params: GetTimesParams): PrayerTimes;
/**
 * Format fractional hours as HH:MM:SS string.
 * Returns "N/A" if the value is non-finite or negative.
 */
export declare function formatTime(hours: number): string;
//# sourceMappingURL=get-times.d.ts.map