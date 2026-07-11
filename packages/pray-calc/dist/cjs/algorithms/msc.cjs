"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMscFajr = getMscFajr;
exports.getMscIsha = getMscIsha;
exports.minutesToDepression = minutesToDepression;
const index_js_1 = require("../types/index.cjs");
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
/**
 * Compute the MCW seasonal index (dyy) and days in year.
 */
function computeDyy(date, latitude) {
    const year = date.getUTCFullYear();
    const daysInYear = isLeapYear(year) ? 366 : 365;
    // Reference solstice: Dec 21 for Northern Hemisphere, Jun 21 for Southern
    const refMonth = latitude >= 0 ? 12 : 6;
    const refDay = 21;
    const zeroDate = Date.UTC(year, refMonth - 1, refDay);
    const inputDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    let diffDays = Math.round((inputDate - zeroDate) / 86_400_000);
    if (diffDays < 0)
        diffDays += daysInYear;
    return { dyy: diffDays, daysInYear };
}
/**
 * Piecewise-linear seasonal interpolation over 6 segments.
 */
function interpolateSegment(dyy, daysInYear, a, b, c, d) {
    if (dyy < 91) {
        return a + ((b - a) / 91) * dyy;
    }
    else if (dyy < 137) {
        return b + ((c - b) / 46) * (dyy - 91);
    }
    else if (dyy < 183) {
        return c + ((d - c) / 46) * (dyy - 137);
    }
    else if (dyy < 229) {
        return d + ((c - d) / 46) * (dyy - 183);
    }
    else if (dyy < 275) {
        return c + ((b - c) / 46) * (dyy - 229);
    }
    else {
        const len = daysInYear - 275;
        return b + ((a - b) / len) * (dyy - 275);
    }
}
/**
 * Compute Fajr offset in minutes before sunrise using the MCW algorithm.
 * Returns minutes before sunrise (rounded to nearest minute).
 */
function getMscFajr(date, latitude) {
    const latAbs = Math.abs(latitude);
    const { dyy, daysInYear } = computeDyy(date, latitude);
    const a = 75 + (28.65 / 55) * latAbs;
    const b = 75 + (19.44 / 55) * latAbs;
    const c = 75 + (32.74 / 55) * latAbs;
    const d = 75 + (48.1 / 55) * latAbs;
    return Math.round(interpolateSegment(dyy, daysInYear, a, b, c, d));
}
/**
 * Compute Isha offset in minutes after sunset using the MCW algorithm.
 * Returns minutes after sunset (rounded to nearest minute).
 */
function getMscIsha(date, latitude, shafaq = index_js_1.ShafaqMode.general) {
    const latAbs = Math.abs(latitude);
    const { dyy, daysInYear } = computeDyy(date, latitude);
    let a, b, c, d;
    switch (shafaq) {
        case index_js_1.ShafaqMode.ahmer:
            a = 62 + (17.4 / 55) * latAbs;
            b = 62 - (7.16 / 55) * latAbs;
            c = 62 + (5.12 / 55) * latAbs;
            d = 62 + (19.44 / 55) * latAbs;
            break;
        case index_js_1.ShafaqMode.abyad:
            a = 75 + (25.6 / 55) * latAbs;
            b = 75 + (7.16 / 55) * latAbs;
            c = 75 + (36.84 / 55) * latAbs;
            d = 75 + (81.84 / 55) * latAbs;
            break;
        case index_js_1.ShafaqMode.general:
        default:
            a = 75 + (25.6 / 55) * latAbs;
            b = 75 + (2.05 / 55) * latAbs;
            c = 75 - (9.21 / 55) * latAbs;
            d = 75 + (6.14 / 55) * latAbs;
            break;
    }
    return Math.round(interpolateSegment(dyy, daysInYear, a, b, c, d));
}
/**
 * Convert MCW minutes-before-sunrise to an equivalent solar depression angle (degrees),
 * using exact spherical trigonometry.
 * Returns NaN if the geometry is unreachable (polar day/night).
 */
function minutesToDepression(minutes, latDeg, declDeg) {
    const DEG = Math.PI / 180;
    const phi = latDeg * DEG;
    const delta = declDeg * DEG;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosDelta = Math.cos(delta);
    const sinDelta = Math.sin(delta);
    // Standard sunrise/sunset: h = −0.833° (includes refraction + semi-diameter)
    const h0 = -0.833 * DEG;
    const sinH0 = Math.sin(h0);
    const denominator = cosPhi * cosDelta;
    if (Math.abs(denominator) < 1e-10)
        return NaN;
    // Hour angle at standard sunrise
    const cosHRise = (sinH0 - sinPhi * sinDelta) / denominator;
    if (cosHRise < -1)
        return NaN; // polar night
    if (cosHRise > 1)
        return NaN; // polar day
    const hRise = Math.acos(cosHRise); // radians
    // Hour angle at the prayer time (further from solar noon)
    const deltaH = (minutes / 60) * 15 * DEG;
    const hPrayer = hRise + deltaH;
    // Cap at π (midnight)
    if (hPrayer > Math.PI) {
        const sinHMidnight = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(Math.PI);
        const hMidnight = Math.asin(Math.max(-1, Math.min(1, sinHMidnight)));
        return -hMidnight / DEG;
    }
    // Solar altitude at hPrayer
    const sinHPrayer = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(hPrayer);
    const hPrayerAlt = Math.asin(Math.max(-1, Math.min(1, sinHPrayer)));
    // Depression angle: positive when sun is below horizon
    return -hPrayerAlt / DEG;
}
