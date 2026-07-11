/**
 * Asr prayer time calculation.
 *
 * Purpose: Compute Asr time as fractional hours using shadow-length convention.
 * Inputs: Solar noon (fractional hours), latitude (deg), solar declination (deg), Hanafi flag.
 * Outputs: Asr time as fractional hours, or NaN if sun never reaches required altitude.
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * Asr begins when shadow = (shadowFactor × object length) + shadow at noon.
 *  - Shafi'i/Maliki/Hanbali: shadowFactor = 1
 *  - Hanafi: shadowFactor = 2
 */
/**
 * Compute Asr time as fractional hours.
 *
 * @param solarNoon - Solar noon in fractional hours.
 * @param latitude - Observer latitude in degrees.
 * @param declination - Solar declination in degrees.
 * @param hanafi - true for Hanafi (shadow factor 2), false for Shafi'i (factor 1).
 */
export declare function getAsr(solarNoon: number, latitude: number, declination: number, hanafi?: boolean): number;
//# sourceMappingURL=asr.d.ts.map