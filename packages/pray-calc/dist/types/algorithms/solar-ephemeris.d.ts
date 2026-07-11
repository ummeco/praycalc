/**
 * High-accuracy solar ephemeris — Jean Meeus "Astronomical Algorithms" (2nd ed., Ch. 25).
 *
 * Purpose: Compute solar declination, Earth-Sun distance, and ecliptic longitude.
 * Inputs: Julian Date (number)
 * Outputs: SolarEphemeris { decl, r, eclLon }
 * Constraints: Zero dependencies; accuracy ~0.01° / ~0.0001 AU (1950–2050).
 */
import type { SolarEphemeris } from "../types/index.js";
/**
 * Convert a JS Date (UTC) to Julian Date.
 */
export declare function toJulianDate(date: Date): number;
/**
 * Compute solar declination, Earth-Sun distance, and ecliptic longitude
 * from a Julian Date.
 */
export declare function solarEphemeris(jd: number): SolarEphemeris;
/**
 * Solar vertical angular speed near a given hour angle (degrees/hour).
 */
export declare function solarVerticalSpeed(latRad: number, declRad: number, hAngleRad: number): number;
/**
 * Atmospheric refraction correction (degrees) for a given apparent solar altitude.
 * Uses Bennett/Saemundsson formula.
 * Returns a positive correction. Returns 0 for altitudes below −1°.
 */
export declare function atmosphericRefraction(altitudeDeg: number, pressureMbar?: number, temperatureC?: number): number;
export declare function clamp(v: number, min: number, max: number): number;
//# sourceMappingURL=solar-ephemeris.d.ts.map