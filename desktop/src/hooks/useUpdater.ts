/**
 * Purpose: Seamless background auto-update — checks for a newer signed build on
 *   launch and hourly thereafter, downloads+installs silently, and surfaces a
 *   version string once a restart-ready update is available.
 * Inputs: none.
 * Outputs: `{ updateReady, restart }` — `updateReady` is the new version string
 *   (or null while none is ready); `restart` relaunches into it.
 * Constraints: never throws — checkForUpdate/relaunchApp already degrade to
 *   no-ops on any failure (see lib/updater.ts).
 * SPORT: praycalc desktop — seamless auto-update (hook).
 */
import { useEffect, useState, useCallback } from 'react';
import { checkForUpdate, relaunchApp } from '../lib/updater';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

export function useUpdater() {
  const [updateReady, setUpdateReady] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      checkForUpdate().then((outcome) => {
        if (!cancelled && outcome.status === 'ready') setUpdateReady(outcome.version);
      });
    };
    run();
    const id = setInterval(run, UPDATE_CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const restart = useCallback(() => {
    void relaunchApp();
  }, []);

  return { updateReady, restart };
}
