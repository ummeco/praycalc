"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAngles = getAngles;
const index_js_1 = require("../types/index.cjs");
const solar_ephemeris_js_1 = require("./solar-ephemeris.cjs");
const msc_js_1 = require("./msc.cjs");
const K_FAJR_MIN = 10;
const K_FAJR_MAX = 22;
const K_ISHA_MIN = 10;
const K_ISHA_MAX = 22;
function clip(value, min, max) {
    return value < min ? min : value > max ? max : value;
}
function round3(value) {
    return Math.round(value * 1000) / 1000;
}
/**
 * Earth-Sun distance correction in degrees.
 * Effect magnitude: ≈ ±0.015°.
 */
function earthSunDistanceCorrection(r) {
    return -0.5 * Math.log(r);
}
/**
 * Fourier smoothing correction (< 0.3° total) to remove MCW piecewise
 * artifacts and add hemisphere-symmetric season curvature.
 */
function fourierSmoothingCorrection(eclLon, latAbsDeg) {
    const DEG = Math.PI / 180;
    const theta = eclLon; // solar ecliptic longitude, radians [0, 2π)
    const phi = latAbsDeg * DEG;
    const a1 = 0.03 * Math.sin(theta);
    const b1 = -0.05 * Math.cos(theta);
    const a2 = 0.02 * Math.sin(2 * theta);
    const b2 = 0.02 * Math.cos(2 * theta);
    const c1 = -0.008 * phi * Math.sin(theta);
    const d1 = 0.004 * phi * Math.cos(theta);
    return a1 + b1 + a2 + b2 + c1 + d1;
}
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
function getAngles(date, lat, _lng, { elevation = 0, temperature = 15, pressure = 1013.25, shafaq = index_js_1.ShafaqMode.general, } = {}) {
    // 1. Solar ephemeris at UTC noon of the given date.
    const noonDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
    const jd = (0, solar_ephemeris_js_1.toJulianDate)(noonDate);
    const eph = (0, solar_ephemeris_js_1.solarEphemeris)(jd);
    // 2. MCW reference times (minutes before/after sunrise/sunset).
    const mscFajrMin = (0, msc_js_1.getMscFajr)(date, lat);
    const mscIshaMin = (0, msc_js_1.getMscIsha)(date, lat, shafaq);
    // 3. Convert MCW minutes to equivalent solar depression angles.
    let fajrBase = (0, msc_js_1.minutesToDepression)(mscFajrMin, lat, eph.decl);
    let ishaBase = (0, msc_js_1.minutesToDepression)(mscIshaMin, lat, eph.decl);
    // Handle polar or unreachable geometry.
    if (!isFinite(fajrBase) || isNaN(fajrBase))
        fajrBase = 18;
    if (!isFinite(ishaBase) || isNaN(ishaBase))
        ishaBase = 18;
    // 4. Earth-Sun distance correction.
    const rCorr = earthSunDistanceCorrection(eph.r);
    // 5. Fourier smoothing correction.
    const fourierCorr = fourierSmoothingCorrection(eph.eclLon, Math.abs(lat));
    // 6. Atmospheric refraction at expected twilight depression.
    const refrFajr = (0, solar_ephemeris_js_1.atmosphericRefraction)(-(fajrBase + 0.5), pressure, temperature);
    const refrIsha = (0, solar_ephemeris_js_1.atmosphericRefraction)(-(ishaBase + 0.5), pressure, temperature);
    // 7. Elevation correction (horizon dip).
    const horizonDipDeg = 1.06 * Math.sqrt(elevation / 1000);
    const elevCorr = horizonDipDeg * 0.3;
    // 8. Assemble final angles.
    const rawFajr = fajrBase + rCorr + fourierCorr + refrFajr + elevCorr;
    const rawIsha = ishaBase + rCorr + fourierCorr + refrIsha + elevCorr;
    const fajrAngle = round3(clip(rawFajr, K_FAJR_MIN, K_FAJR_MAX));
    const ishaAngle = round3(clip(rawIsha, K_ISHA_MIN, K_ISHA_MAX));
    return { fajrAngle, ishaAngle };
}
