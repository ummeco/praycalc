"use strict";
/**
 * @praycalc/bridge-types — shared phone <-> watch/wear bridge types + helpers.
 *
 * Purpose: Single home for the TypeScript shapes and serialize/validate helpers
 *   used by mobile/src/lib/watch/watchSync.ts to talk to the two native bridge
 *   modules (mobile/modules/watch-bridge for iOS, mobile/modules/wear-bridge
 *   for Android). See types.ts for why the two platform shapes differ.
 * Outputs: all public types + helpers.
 * Constraints: zero runtime dependencies; ESM + CJS + types.
 * SPORT: praycalc packages/bridge-types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidWearPrayerTimesPayload = exports.isValidIosWatchContext = exports.toWearPrayerTimes = exports.toIosWatchContext = exports.formatHHmm = exports.mapMadhabToIos = exports.mapMethodToIos = exports.WEAR_PRAYER_TIMES_PATH = void 0;
var types_js_1 = require("./types.cjs");
Object.defineProperty(exports, "WEAR_PRAYER_TIMES_PATH", { enumerable: true, get: function () { return types_js_1.WEAR_PRAYER_TIMES_PATH; } });
var serialize_js_1 = require("./serialize.cjs");
Object.defineProperty(exports, "mapMethodToIos", { enumerable: true, get: function () { return serialize_js_1.mapMethodToIos; } });
Object.defineProperty(exports, "mapMadhabToIos", { enumerable: true, get: function () { return serialize_js_1.mapMadhabToIos; } });
Object.defineProperty(exports, "formatHHmm", { enumerable: true, get: function () { return serialize_js_1.formatHHmm; } });
Object.defineProperty(exports, "toIosWatchContext", { enumerable: true, get: function () { return serialize_js_1.toIosWatchContext; } });
Object.defineProperty(exports, "toWearPrayerTimes", { enumerable: true, get: function () { return serialize_js_1.toWearPrayerTimes; } });
var validate_js_1 = require("./validate.cjs");
Object.defineProperty(exports, "isValidIosWatchContext", { enumerable: true, get: function () { return validate_js_1.isValidIosWatchContext; } });
Object.defineProperty(exports, "isValidWearPrayerTimesPayload", { enumerable: true, get: function () { return validate_js_1.isValidWearPrayerTimesPayload; } });
