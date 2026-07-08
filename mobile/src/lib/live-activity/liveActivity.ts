/**
 * Purpose: JS orchestration for the "Next Prayer" ActivityKit Live Activity (Dynamic
 *   Island + lock-screen banner). Computes the next prayer via the SAME shared path the
 *   iOS widget uses (computeNextPrayer in widgetTaskHandler), then starts or updates a
 *   single running activity so the countdown always targets the upcoming prayer. Ending
 *   is exposed for location-clear / settings-reset. All calls are best-effort and safe
 *   off-device: the native accessor returns a no-op stub outside a real iOS build.
 * Inputs: computeNextPrayer() (shared settings + calc engine); Platform.OS guard.
 * Outputs:
 *   - refreshNextPrayerLiveActivity(): start-or-update the activity to the next prayer.
 *   - endNextPrayerLiveActivity(): end any running activity.
 *   - isLiveActivitySupported(): whether ActivityKit can run right now.
 *   The activity id is held in module state (mirrors how iOS keeps one live activity).
 * Constraints: iOS-only at runtime (guarded). The ContentState field names/types MUST
 *   match NextPrayerActivityAttributes.ContentState in BOTH Swift copies
 *   (modules/pray-live-activity + targets/next-prayer-widget/NextPrayerLiveActivity.swift).
 *   Best-effort: never throws to the caller (a Live Activity failure must not break
 *   notification scheduling, which is the real work).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-live-activity
 */

import { Platform } from 'react-native';
import { computeNextPrayer, formatTime } from '../../widgets/widgetTaskHandler';
import { getLiveActivityModule } from './nativeModule';

/**
 * The single running activity's id, held in module state. iOS itself limits us to one
 * Next Prayer activity (start() ends existing ones first), so JS only needs to remember
 * the current id to route update()/end() at it. Null when nothing is running.
 */
let currentActivityId: string | null = null;

/** True when ActivityKit is available and the user has Live Activities enabled. */
export function isLiveActivitySupported(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    return getLiveActivityModule().isSupported();
  } catch {
    return false;
  }
}

/**
 * Start (or update the running) Next Prayer Live Activity so its countdown targets the
 * upcoming prayer. If all of today's prayers have passed the shared computeNextPrayer
 * returns tomorrow's Fajr, so the activity stays valid overnight without extra logic.
 * When there is no next prayer (no location), any running activity is ended instead.
 * Best-effort — swallows every error.
 */
export async function refreshNextPrayerLiveActivity(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const mod = getLiveActivityModule();
    if (!mod.isSupported()) return;

    const next = await computeNextPrayer();
    if (!next) {
      await endNextPrayerLiveActivity();
      return;
    }

    const timestamp = next.time.getTime();
    const label = formatTime(next.time);
    const city = next.cityName ?? null;

    // Update in place if we already have a live one; otherwise start fresh.
    if (currentActivityId && mod.isRunning(currentActivityId)) {
      const ok = await mod.update(currentActivityId, next.name, timestamp, label);
      if (ok) return;
      // Stale id (activity was dismissed) — fall through and start a new one.
      currentActivityId = null;
    }

    const id = await mod.start(next.name, timestamp, label, city);
    currentActivityId = id;
  } catch {
    // Best-effort only — never surface a Live Activity failure to the caller.
  }
}

/** End any running Next Prayer Live Activity (location cleared / reset). Best-effort. */
export async function endNextPrayerLiveActivity(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const mod = getLiveActivityModule();
    if (currentActivityId) {
      await mod.end(currentActivityId);
    } else {
      await mod.endAll();
    }
  } catch {
    // Best-effort only.
  } finally {
    currentActivityId = null;
  }
}

/** Test-only reset of module state (the current activity id). */
export function __resetLiveActivityStateForTests(): void {
  currentActivityId = null;
}
