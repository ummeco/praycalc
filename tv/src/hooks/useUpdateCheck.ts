/**
 * Purpose: Runs checkForUpdate on boot and once daily, surfacing a dismissible
 *   "update available" signal for the dashboard toast.
 * Inputs: none (reads APP_VERSION).
 * Outputs: { visible, latestTag, dismiss } — visible is true only while an update exists
 *   and the user hasn't dismissed it this session; dismiss() hides it until the next
 *   check finds a still-newer tag.
 * Constraints: never throws (checkForUpdate swallows all errors); daily interval only —
 *   no retry/backoff needed since a missed poll just retries in ~24h.
 * SPORT: praycalc/tv hooks
 */

import { useEffect, useState } from 'react';
import { checkForUpdate } from '../lib/updates/updateCheck';
import { APP_VERSION } from '../lib/updates/appVersion';

const DAILY_MS = 24 * 60 * 60 * 1000;

export interface UseUpdateCheckResult {
  visible: boolean;
  latestTag: string | null;
  dismiss: () => void;
}

export function useUpdateCheck(): UseUpdateCheckResult {
  const [latestTag, setLatestTag] = useState<string | null>(null);
  const [dismissedTag, setDismissedTag] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async (): Promise<void> => {
      const result = await checkForUpdate(APP_VERSION);
      if (cancelled) return;
      setLatestTag(result.updateAvailable ? result.latestTag : null);
    };
    void run();
    const timer = setInterval(() => void run(), DAILY_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return {
    visible: latestTag !== null && latestTag !== dismissedTag,
    latestTag,
    dismiss: () => setDismissedTag(latestTag),
  };
}
