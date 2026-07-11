/**
 * Dynamic twilight angle algorithm — PrayCalc Dynamic Method v2.
 *
 * Purpose: Compute adaptive Fajr and Isha solar depression angles that
 *          accurately track the observable phenomenon across all latitudes and seasons.
 * Inputs: Date, lat, lng, optional elevation/temperature/pressure.
 * Outputs: TwilightAngles { fajrAngle, ishaAngle }
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * Three-layer model:
 *   1. MSC base (MCW piecewise seasonal, converted to depression angle)
 *   2. Ephemeris corrections (Earth-Sun distance, Fourier season smoothing)
 *   3. Environmental corrections (elevation, atmospheric refraction)
 */
import { type TwilightAngles, ShafaqMode } from "../types/index.js";
/**
 * Compute dynamic twilight depression angles for Fajr and Isha.
 *
 * @param date - Observer's local date (time-of-day is ignored).
 * @param lat - Latitude in decimal degrees.
 * @param lng - Longitude in decimal degrees (reserved, currently unused).
 * @param elevation - Observer elevation in meters (default: 0).
 * @param temperature - Ambient temperature in °C (default: 15).
 * @param pressure - Atmospheric pressure in mbar (default: 1013.25).
 * @param shafaq - Shafaq mode for MSC Isha (default: general).
 */
export declare function getAngles(date: Date, lat: number, _lng: number, { elevation, temperature, pressure, shafaq, }?: {
    elevation?: number;
    temperature?: number;
    pressure?: number;
    shafaq?: ShafaqMode;
}): TwilightAngles;
//# sourceMappingURL=angles.d.ts.map