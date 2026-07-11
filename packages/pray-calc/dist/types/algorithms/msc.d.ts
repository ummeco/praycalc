/**
 * Moonsighting Committee Worldwide (MCW) seasonal algorithm.
 *
 * Purpose: Compute Fajr and Isha as time offsets from sunrise/sunset using
 *          empirical piecewise-linear seasonal functions (Khalid Shaukat).
 * Inputs: Date, latitude, optional ShafaqMode for Isha.
 * Outputs: Fajr offset (minutes before sunrise), Isha offset (minutes after sunset).
 * Constraints: Zero dependencies. Pure functions.
 *
 * Reference: moonsighting.com/isha_fajr.html
 */
import { ShafaqMode } from "../types/index.js";
/**
 * Compute Fajr offset in minutes before sunrise using the MCW algorithm.
 * Returns minutes before sunrise (rounded to nearest minute).
 */
export declare function getMscFajr(date: Date, latitude: number): number;
/**
 * Compute Isha offset in minutes after sunset using the MCW algorithm.
 * Returns minutes after sunset (rounded to nearest minute).
 */
export declare function getMscIsha(date: Date, latitude: number, shafaq?: ShafaqMode): number;
/**
 * Convert MCW minutes-before-sunrise to an equivalent solar depression angle (degrees),
 * using exact spherical trigonometry.
 * Returns NaN if the geometry is unreachable (polar day/night).
 */
export declare function minutesToDepression(minutes: number, latDeg: number, declDeg: number): number;
//# sourceMappingURL=msc.d.ts.map