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
export type { BridgeMethod, BridgeMadhab, BridgePrayerDayTimes, WatchSyncPayload, IosWatchContextPayload, WearPrayerTimesPayload, } from './types.js';
export { WEAR_PRAYER_TIMES_PATH } from './types.js';
export { mapMethodToIos, mapMadhabToIos, formatHHmm, toIosWatchContext, toWearPrayerTimes, } from './serialize.js';
export { isValidIosWatchContext, isValidWearPrayerTimesPayload } from './validate.js';
//# sourceMappingURL=index.d.ts.map