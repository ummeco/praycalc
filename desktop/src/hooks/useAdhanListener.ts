/**
 * Purpose: Bridge the two events Rust's native background timer fires —
 *   `prayer-time` (adhan) and `prayer-refresh` (60s-after auto-advance) — into
 *   React state, and drive the side effects that follow: showing/focusing the
 *   window when the adhan overlay activates, and reloading the prayer list
 *   shortly after.
 * Inputs: `loadPrayers` (reload callback) and `notificationsRef` — a ref to the
 *   live `settings.notifications` flag, read at event time (not a dep) so this
 *   hook doesn't need to resubscribe on every settings change.
 * Outputs: `{ adhanActive, adhanActiveRef, dismissAdhan }` — `adhanActiveRef`
 *   lets callers (e.g. a blur handler) read the latest value synchronously
 *   without a stale closure.
 * Constraints: mirrors the exact timing/behavior of the pre-extraction App.tsx
 *   effects (10s post-adhan refresh, notifications-gated activation).
 * SPORT: praycalc desktop — adhan overlay + auto-refresh (hook).
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { listen } from '@tauri-apps/api/event';
import type { Settings } from '../lib/ipc-types';

export function useAdhanListener(
  loadPrayers: (s: Settings) => void,
  settingsRef: RefObject<Settings>,
) {
  const [adhanActive, setAdhanActive] = useState<string | null>(null);
  const adhanActiveRef = useRef<string | null>(null);
  adhanActiveRef.current = adhanActive;

  const dismissAdhan = useCallback(() => setAdhanActive(null), []);

  // Listen for events fired by Rust's native timer.
  useEffect(() => {
    let unlistenTime: (() => void) | undefined;
    let unlistenRefresh: (() => void) | undefined;
    listen<string>('prayer-time', (event) => {
      if (settingsRef.current.notifications) setAdhanActive(event.payload);
    }).then((fn) => {
      unlistenTime = fn;
    });
    // Auto-advance: Rust fires this 60s after prayer time (window may be hidden).
    listen<null>('prayer-refresh', () => {
      loadPrayers(settingsRef.current);
    }).then((fn) => {
      unlistenRefresh = fn;
    });
    return () => {
      unlistenTime?.();
      unlistenRefresh?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPrayers]);

  // Show + focus window whenever adhan activates; refresh the list 10s later
  // so "next" updates (which in turn resets Rust's adhan/refresh state).
  useEffect(() => {
    if (!adhanActive) return;
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
      const win = getCurrentWindow();
      win.show().catch(() => {});
      win.setFocus().catch(() => {});
    });
    const id = setTimeout(() => loadPrayers(settingsRef.current), 10_000);
    return () => clearTimeout(id);
  }, [adhanActive, loadPrayers, settingsRef]);

  return { adhanActive, adhanActiveRef, dismissAdhan };
}
