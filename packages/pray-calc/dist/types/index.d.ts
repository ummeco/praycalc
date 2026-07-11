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
export type { TwilightAngles, PrayerTimes, FormattedPrayerTimes, SolarEphemeris, SpaResult, SpaAnglesResult, GetTimesParams, } from "./types/index.js";
export { AsrConvention, ShafaqMode, HighLatitudeRule, } from "./types/index.js";
export { getTimes, formatTime } from "./algorithms/get-times.js";
export { getSpa } from "./algorithms/spa.js";
export { toJulianDate, solarEphemeris, atmosphericRefraction, solarVerticalSpeed } from "./algorithms/solar-ephemeris.js";
export { getAngles } from "./algorithms/angles.js";
export { getMscFajr, getMscIsha, minutesToDepression } from "./algorithms/msc.js";
export { getAsr } from "./algorithms/asr.js";
export { getQiyam } from "./algorithms/qiyam.js";
export { applyHighLatitudeRule } from "./algorithms/high-latitude.js";
//# sourceMappingURL=index.d.ts.map