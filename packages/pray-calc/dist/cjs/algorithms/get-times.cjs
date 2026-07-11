"use strict";
/**
 * Core prayer times computation — PrayCalc Dynamic Method.
 *
 * Purpose: Compute all prayer times for a given date, location, and method.
 * Inputs: GetTimesParams (date, lat, lng, tz, optional flags).
 * Outputs: PrayerTimes { qiyam, fajr, sunrise, noon, dhuhr, asr, maghrib, isha, angles }.
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * Fixed Hanafi angles (when hanafiAngles=true + hanafi convention):
 *   Fajr = 18°, Isha = 17° — UK/South-Asian Hanafi standard.
 *   ⚠️ FLAG FOR ISLAMIC REVIEW before production use at scale.
 *   Other Hanafi positions exist (e.g. 15°/15° per some Egyptian scholars).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimes = getTimes;
exports.formatTime = formatTime;
const index_js_1 = require("../types/index.cjs");
const angles_js_1 = require("./angles.cjs");
const spa_js_1 = require("./spa.cjs");
const solar_ephemeris_js_1 = require("./solar-ephemeris.cjs");
const asr_js_1 = require("./asr.cjs");
const qiyam_js_1 = require("./qiyam.cjs");
const high_latitude_js_1 = require("./high-latitude.cjs");
const K_HANAFI_FAJR_ANGLE = 18;
const K_HANAFI_ISHA_ANGLE = 17;
/**
 * Compute prayer times for a given date and location.
 */
function getTimes(params) {
    const { date, lat, lng, tz, elevation = 0, temperature = 15, pressure = 1013.25, asrConvention = index_js_1.AsrConvention.shafii, hanafiAngles = false, highLatitudeRule = index_js_1.HighLatitudeRule.none, shafaqMode = index_js_1.ShafaqMode.general, } = params;
    const hanafi = asrConvention === index_js_1.AsrConvention.hanafi;
    // 1. Compute twilight angles — fixed Hanafi or dynamic method.
    const tw = hanafi && hanafiAngles
        ? { fajrAngle: K_HANAFI_FAJR_ANGLE, ishaAngle: K_HANAFI_ISHA_ANGLE }
        : (0, angles_js_1.getAngles)(date, lat, lng, { elevation, temperature, pressure, shafaq: shafaqMode });
    // 2. Convert depression angles to SPA zenith angles.
    //    SPA uses zenith (90° + depression) for custom altitude events.
    const fajrZenith = 90 + tw.fajrAngle;
    const ishaZenith = 90 + tw.ishaAngle;
    // 3. Run SPA for solar position + custom twilight times.
    const spaData = (0, spa_js_1.getSpa)(date, lat, lng, tz, {
        elevation,
        temperature,
        pressure,
        customAngles: [fajrZenith, ishaZenith],
    });
    let fajrTime = spaData.angles[0].sunrise;
    const sunriseTime = spaData.sunrise;
    const noonTime = spaData.solarNoon;
    const maghribTime = spaData.sunset;
    let ishaTime = spaData.angles[1].sunset;
    // Dhuhr: 2.5 minutes after solar noon.
    const dhuhrTime = isFinite(noonTime) ? noonTime + 2.5 / 60 : NaN;
    // 4. Solar declination for Asr (Meeus formula, accurate to ~0.01°).
    const jd = (0, solar_ephemeris_js_1.toJulianDate)(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0)));
    const eph = (0, solar_ephemeris_js_1.solarEphemeris)(jd);
    // 5. Asr time.
    const asrTime = isFinite(noonTime)
        ? (0, asr_js_1.getAsr)(noonTime, lat, eph.decl, hanafi)
        : NaN;
    // 6. Apply high-latitude rule if needed.
    if (highLatitudeRule !== index_js_1.HighLatitudeRule.none) {
        const adjusted = (0, high_latitude_js_1.applyHighLatitudeRule)(highLatitudeRule, fajrTime, ishaTime, isFinite(sunriseTime) ? sunriseTime : NaN, isFinite(maghribTime) ? maghribTime : NaN, isFinite(noonTime) ? noonTime : NaN, tw);
        fajrTime = adjusted.fajr;
        ishaTime = adjusted.isha;
    }
    // 7. Qiyam al-Layl (last third of the night).
    const qiyamTime = isFinite(fajrTime) && isFinite(ishaTime)
        ? (0, qiyam_js_1.getQiyam)(fajrTime, ishaTime)
        : NaN;
    return {
        qiyam: isFinite(qiyamTime) ? qiyamTime : NaN,
        fajr: isFinite(fajrTime) ? fajrTime : NaN,
        sunrise: isFinite(sunriseTime) ? sunriseTime : NaN,
        noon: isFinite(noonTime) ? noonTime : NaN,
        dhuhr: isFinite(dhuhrTime) ? dhuhrTime : NaN,
        asr: isFinite(asrTime) ? asrTime : NaN,
        maghrib: isFinite(maghribTime) ? maghribTime : NaN,
        isha: isFinite(ishaTime) ? ishaTime : NaN,
        angles: tw,
    };
}
/**
 * Format fractional hours as HH:MM:SS string.
 * Returns "N/A" if the value is non-finite or negative.
 */
function formatTime(hours) {
    if (!isFinite(hours) || hours < 0)
        return "N/A";
    const totalSec = Math.round(hours * 3600);
    const h = Math.floor(totalSec / 3600) % 24;
    const rem = totalSec - Math.floor(totalSec / 3600) * 3600;
    const m = Math.floor(rem / 60);
    const s = rem - m * 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
