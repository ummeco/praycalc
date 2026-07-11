/**
 * High-latitude rules for prayer time adjustment.
 *
 * Purpose: Apply high-latitude rules when Fajr/Isha times are unreachable
 *          due to polar conditions (sun never sets/rises far enough).
 * Inputs: PrayerTimes with possible NaN values, solarNoon, method.
 * Outputs: Adjusted Fajr/Isha times (fractional hours).
 * Constraints: Zero runtime dependencies. Pure functions.
 *
 * Methods:
 *   - angleBased: offset = (angle / 60) × night length from midnight
 *   - oneSeventh: offset = (1/7) × night length
 *   - middleOfNight: split night equally around midnight
 */
import { HighLatitudeRule } from "../types/index.js";
/**
 * Apply high-latitude rule to produce valid Fajr and Isha times.
 *
 * @param rule - High-latitude rule to apply.
 * @param fajr - Computed Fajr time (may be NaN).
 * @param isha - Computed Isha time (may be NaN).
 * @param sunrise - Sunrise time (fractional hours).
 * @param sunset - Sunset time (fractional hours; Maghrib).
 * @param solarNoon - Solar noon (fractional hours).
 * @param angles - Twilight angles used for angle-based rule.
 * @returns { fajr, isha } after applying the rule.
 */
export function applyHighLatitudeRule(rule, fajr, isha, sunrise, sunset, solarNoon, angles) {
    if (rule === HighLatitudeRule.none)
        return { fajr, isha };
    // Night length: from sunset to next sunrise (crossing midnight)
    const adjustedSunrise = sunrise <= sunset ? sunrise + 24 : sunrise;
    const nightLength = adjustedSunrise - sunset;
    const midnight = sunset + nightLength / 2;
    // Compute safe offsets based on rule
    let offset;
    switch (rule) {
        case HighLatitudeRule.angleBased:
            // Use twilight angle as fraction: angle / 60 × night
            offset = (Math.min(angles.fajrAngle, angles.ishaAngle) / 60) * nightLength;
            break;
        case HighLatitudeRule.oneSeventh:
            offset = nightLength / 7;
            break;
        case HighLatitudeRule.middleOfNight:
            offset = nightLength / 2;
            break;
        default:
            return { fajr, isha };
    }
    // Normalize midnight to [0, 24)
    const normalMidnight = midnight >= 24 ? midnight - 24 : midnight;
    const safeFajr = !isFinite(fajr) || isNaN(fajr)
        ? (normalMidnight - offset + 24) % 24
        : fajr;
    const safeIsha = !isFinite(isha) || isNaN(isha)
        ? (normalMidnight + offset) % 24
        : isha;
    return { fajr: safeFajr, isha: safeIsha };
}
