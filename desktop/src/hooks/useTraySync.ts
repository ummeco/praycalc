/**
 * Purpose: Push the current next-prayer + display settings into Rust
 *   (`set_next_prayer`) whenever either changes, so the native background timer
 *   (src-tauri/src/timer.rs) can keep the tray label / adhan / auto-refresh
 *   loop in sync without polling the JS side.
 * Inputs: `next` (the upcoming prayer, or null before the first load) and the
 *   current `Settings`.
 * Outputs: none — side-effect-only hook.
 * Constraints: fire-and-forget; a failed `invoke` (e.g. command not yet
 *   registered during dev hot-reload) must never surface to the UI.
 * SPORT: praycalc desktop — native tray sync (hook).
 */
import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { PrayerEntry, Settings } from '../lib/ipc-types';

export function useTraySync(next: PrayerEntry | null, settings: Settings): void {
  useEffect(() => {
    if (!next) return;
    invoke('set_next_prayer', {
      name: next.name,
      time: next.time,
      tz: settings.tz,
      notifications: settings.notifications,
      displayMode: settings.displayMode,
      nameFormat: settings.nameFormat,
      showSeconds: settings.showSeconds,
      countdownPrefix: settings.countdownPrefix,
    }).catch(() => {});
  }, [next, settings]);
}
