/**
 * Purpose: Pure stats-aggregation helpers for StatsScreen — streak calculation
 *   and weekly completion-count bucketing. No React, no side effects.
 * Inputs: PrayerCompletion[] (from lib/completions), locale string.
 * Outputs: PRAYER_NAMES constant, getStreak (day-streak count), getWeeklyData
 *   (day/count buckets for the last 7 days).
 * Constraints: Pure functions only — kept testable without the RN runtime.
 */

import type { PrayerCompletion } from '../../lib/completions';
import type { PrayerName } from '../../types/prayer';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function getStreak(completions: PrayerCompletion[]): number {
  const dailyCounts: Record<string, number> = {};
  for (const c of completions) {
    dailyCounts[c.date] = (dailyCounts[c.date] ?? 0) + 1;
  }
  // A day is "complete" if all 5 prayers are logged
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if ((dailyCounts[key] ?? 0) >= 5) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getWeeklyData(completions: PrayerCompletion[], locale: string): { day: string; count: number }[] {
  const result: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = completions.filter((c) => c.date === key).length;
    result.push({
      day: d.toLocaleDateString(locale, { weekday: 'short' }),
      count,
    });
  }
  return result;
}
