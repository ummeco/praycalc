/**
 * Purpose: Seamless background auto-update — checks for a newer signed build on
 *   launch, hourly thereafter, and on-demand when the user picks "Check for
 *   Updates" from the tray menu (DT-01); downloads silently in the background
 *   and surfaces a version string once a restart-ready update is available.
 *   Installing is always user-initiated via the returned `restart` callback
 *   (UPD-2) — this hook never installs automatically.
 * Inputs: none.
 * Outputs: `{ updateReady, restart }` — `updateReady` is the new version string
 *   (or null while none is ready); `restart` installs it and relaunches.
 * Constraints: never throws — checkForUpdate/installUpdateAndRelaunch already
 *   degrade to no-ops on any failure (see lib/updater.ts). The hourly poll and
 *   the menu-triggered check share the same `run()` — checkForUpdate itself
 *   short-circuits once a download is already staged (UPD-3), so this hook
 *   doesn't need its own re-download guard.
 * SPORT: praycalc desktop — seamless auto-update (hook).
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { checkForUpdate, installUpdateAndRelaunch } from '../lib/updater';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

export function useUpdater() {
  const [updateReady, setUpdateReady] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const run = () => {
      checkForUpdate().then((outcome) => {
        if (mountedRef.current && outcome.status === 'ready') setUpdateReady(outcome.version);
      });
    };
    run();
    const id = setInterval(run, UPDATE_CHECK_INTERVAL_MS);

    // "Check for Updates" tray menu item (src-tauri/src/tray.rs) — lets the
    // user force an immediate check instead of waiting for the hourly poll.
    let unlisten: (() => void) | undefined;
    listen('menu-check-for-updates', run).then((fn) => {
      unlisten = fn;
    });

    return () => {
      mountedRef.current = false;
      clearInterval(id);
      unlisten?.();
    };
  }, []);

  const restart = useCallback(() => {
    void installUpdateAndRelaunch();
  }, []);

  return { updateReady, restart };
}
