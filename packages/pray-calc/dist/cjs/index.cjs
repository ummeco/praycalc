"use strict";
/**
 * @acamarata/pray-calc — PrayCalc Dynamic Method TypeScript package.
 *
 * Purpose: Zero-dependency TypeScript prayer time calculation library.
 *          Port of pray_calc_dart (NREL SPA + MSC seasonal + dynamic twilight angles).
 * Outputs: All public types and functions.
 * Constraints: ESM + CJS + types; zero runtime dependencies.
 *
 * Islamic Note: Tehran/Jafari method excluded per D-P3-19 (project decision).
 * Hijri calendar deferred to @ummat/shared per spec §2.3 — not in this package.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyHighLatitudeRule = exports.getQiyam = exports.getAsr = exports.minutesToDepression = exports.getMscIsha = exports.getMscFajr = exports.getAngles = exports.solarVerticalSpeed = exports.atmosphericRefraction = exports.solarEphemeris = exports.toJulianDate = exports.getSpa = exports.formatTime = exports.getTimes = exports.HighLatitudeRule = exports.ShafaqMode = exports.AsrConvention = void 0;
var index_js_1 = require("./types/index.cjs");
Object.defineProperty(exports, "AsrConvention", { enumerable: true, get: function () { return index_js_1.AsrConvention; } });
Object.defineProperty(exports, "ShafaqMode", { enumerable: true, get: function () { return index_js_1.ShafaqMode; } });
Object.defineProperty(exports, "HighLatitudeRule", { enumerable: true, get: function () { return index_js_1.HighLatitudeRule; } });
// Main API
var get_times_js_1 = require("./algorithms/get-times.cjs");
Object.defineProperty(exports, "getTimes", { enumerable: true, get: function () { return get_times_js_1.getTimes; } });
Object.defineProperty(exports, "formatTime", { enumerable: true, get: function () { return get_times_js_1.formatTime; } });
// SPA (solar position)
var spa_js_1 = require("./algorithms/spa.cjs");
Object.defineProperty(exports, "getSpa", { enumerable: true, get: function () { return spa_js_1.getSpa; } });
// Solar ephemeris
var solar_ephemeris_js_1 = require("./algorithms/solar-ephemeris.cjs");
Object.defineProperty(exports, "toJulianDate", { enumerable: true, get: function () { return solar_ephemeris_js_1.toJulianDate; } });
Object.defineProperty(exports, "solarEphemeris", { enumerable: true, get: function () { return solar_ephemeris_js_1.solarEphemeris; } });
Object.defineProperty(exports, "atmosphericRefraction", { enumerable: true, get: function () { return solar_ephemeris_js_1.atmosphericRefraction; } });
Object.defineProperty(exports, "solarVerticalSpeed", { enumerable: true, get: function () { return solar_ephemeris_js_1.solarVerticalSpeed; } });
// Dynamic angles
var angles_js_1 = require("./algorithms/angles.cjs");
Object.defineProperty(exports, "getAngles", { enumerable: true, get: function () { return angles_js_1.getAngles; } });
// MSC algorithm
var msc_js_1 = require("./algorithms/msc.cjs");
Object.defineProperty(exports, "getMscFajr", { enumerable: true, get: function () { return msc_js_1.getMscFajr; } });
Object.defineProperty(exports, "getMscIsha", { enumerable: true, get: function () { return msc_js_1.getMscIsha; } });
Object.defineProperty(exports, "minutesToDepression", { enumerable: true, get: function () { return msc_js_1.minutesToDepression; } });
// Sub-calculations
var asr_js_1 = require("./algorithms/asr.cjs");
Object.defineProperty(exports, "getAsr", { enumerable: true, get: function () { return asr_js_1.getAsr; } });
var qiyam_js_1 = require("./algorithms/qiyam.cjs");
Object.defineProperty(exports, "getQiyam", { enumerable: true, get: function () { return qiyam_js_1.getQiyam; } });
var high_latitude_js_1 = require("./algorithms/high-latitude.cjs");
Object.defineProperty(exports, "applyHighLatitudeRule", { enumerable: true, get: function () { return high_latitude_js_1.applyHighLatitudeRule; } });
