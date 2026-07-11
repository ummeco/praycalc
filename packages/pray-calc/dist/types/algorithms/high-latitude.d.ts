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
import { HighLatitudeRule, type TwilightAngles } from "../types/index.js";
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
export declare function applyHighLatitudeRule(rule: HighLatitudeRule, fajr: number, isha: number, sunrise: number, sunset: number, solarNoon: number, angles: TwilightAngles): {
    fajr: number;
    isha: number;
};
//# sourceMappingURL=high-latitude.d.ts.map