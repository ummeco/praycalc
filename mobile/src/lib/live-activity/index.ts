/**
 * Purpose: Public barrel for the Live Activity module — the ActivityKit "Next Prayer"
 *   countdown (Dynamic Island + lock-screen banner). Callers import the orchestration
 *   functions from here; the native accessor stays internal.
 * Outputs: refreshNextPrayerLiveActivity, endNextPrayerLiveActivity,
 *   isLiveActivitySupported.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-live-activity
 */

export {
  refreshNextPrayerLiveActivity,
  endNextPrayerLiveActivity,
  isLiveActivitySupported,
} from './liveActivity';
