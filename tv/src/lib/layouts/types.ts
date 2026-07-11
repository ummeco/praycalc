/**
 * Purpose: Shared prop contract every dashboard layout component implements. Keeps
 *   DashboardScreen a thin switch — it resolves the active layout component from the
 *   registry and passes this same typed bag to whichever one is selected.
 * Inputs: none (type-only module).
 * Outputs: DashboardLayoutProps interface.
 * Constraints: layouts must NOT render PrayerTakeover — takeovers stay in DashboardScreen
 *   so they layer above every layout unchanged.
 * SPORT: praycalc/tv lib/layouts
 */

import { PrayerDay, PrayerName, PrayerTime, TvSettings } from '../../types';

export interface DashboardLayoutProps {
  /** Full settings (cosmetic + deep-settings + location) — layouts read what they need. */
  settings: TvSettings;
  /** Today's 6 prayer times with isNext/isCompleted flags, from prayerStore. */
  prayerTimes: PrayerTime[];
  /** Today's raw "HH:MM" prayer day (adhan times + hijri fields), or null before first calc. */
  prayerDay: PrayerDay | null;
  /** The upcoming prayer name, or null before first calc. */
  nextPrayer: PrayerName | null;
}
