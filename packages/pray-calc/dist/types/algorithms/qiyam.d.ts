/**
 * Qiyam al-Layl (night prayer) time calculation.
 *
 * Purpose: Compute the start of the last third of the night (Tahajjud time).
 * Inputs: Fajr time (fractional hours), Isha time (fractional hours).
 * Outputs: Start of last third of night (fractional hours).
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * The night is defined as the period from Isha to Fajr (next day).
 */
/**
 * Compute the start of the last third of the night.
 *
 * @param fajrTime - Fajr time in fractional hours.
 * @param ishaTime - Isha time in fractional hours.
 * @returns Start of the last third of the night (fractional hours).
 */
export declare function getQiyam(fajrTime: number, ishaTime: number): number;
//# sourceMappingURL=qiyam.d.ts.map