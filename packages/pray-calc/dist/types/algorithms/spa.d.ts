/**
 * NREL Solar Position Algorithm (SPA) — TypeScript port.
 *
 * Purpose: Compute solar zenith/azimuth, sunrise/transit/sunset, plus
 *          custom-zenith rise/set events (used for Fajr/Isha).
 * Inputs: Date, lat/lng/tz, elevation, pressure, temperature, customAngles[].
 * Outputs: SpaResult { zenith, azimuth, sunrise, solarNoon, sunset, angles[] }
 * Constraints: Zero dependencies; direct port of spa.dart (which follows nrel-spa JS v2.0.1).
 * Accuracy: ±0.0003° for solar zenith angle.
 *
 * Reference: Reda, I. and Andreas, A. (2004). Solar Position Algorithm for
 * Solar Radiation Applications. NREL/TP-560-34302.
 */
import type { SpaResult } from "../types/index.js";
/**
 * Compute solar position for the given parameters.
 *
 * @param date - Date in UTC (time-of-day matters for zenith; for RTS, only date is used).
 * @param latitude - Decimal degrees (−90 to 90, south = negative).
 * @param longitude - Decimal degrees (−180 to 180, west = negative).
 * @param timezone - Hours from UTC (e.g., −5 for EST).
 * @param customAngles - Zenith angles for which rise/set times are needed.
 */
export declare function getSpa(date: Date, latitude: number, longitude: number, timezone: number, options?: {
    elevation?: number;
    pressure?: number;
    temperature?: number;
    deltaUt1?: number;
    deltaT?: number;
    slope?: number;
    azmRotation?: number;
    atmosRefract?: number;
    customAngles?: number[];
}): SpaResult;
//# sourceMappingURL=spa.d.ts.map