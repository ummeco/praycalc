/**
 * Purpose: Pure, unit-testable logic for the Qada (missed-prayer) counter —
 *   per-prayer owed counts and the excused-range fiqh distinction. Kept separate
 *   from QadaScreen so it can be tested without rendering React Native components.
 * Inputs: QadaCounts (per-prayer owed), ExcusedRange[] (menses/illness date ranges).
 * Outputs: adjust/makeUp helpers, total outstanding, excused-range overlap check.
 * Constraints: SENSITIVE FIQH — this module encodes ONE specific, well-established
 *   ruling and must not silently drift: a woman does NOT make up (qada) prayers
 *   missed during menstruation, but DOES make up fasts missed during that time
 *   (Sahih al-Bukhari 321, Sahih Muslim 335 — Aisha (RA) explains the distinction).
 *   The excused-range toggle in this feature therefore applies ONLY to the prayer
 *   counter, never to the fasting tracker (those are two separate features/stores
 *   by design). This is a majority-position summary, not a fatwa — the UI must
 *   keep the "consult your local scholar" note visible wherever this applies.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-qada-logic
 */

import type { PrayerName } from '../../types/prayer';

export const QADA_PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export type QadaCounts = Record<PrayerName, number>;

export function emptyQadaCounts(): QadaCounts {
  const counts = {} as QadaCounts;
  for (const p of QADA_PRAYERS) counts[p] = 0;
  counts.Sunrise = 0; // Sunrise is not a salah — always 0, kept only for PrayerName completeness.
  return counts;
}

/** Clamp any single prayer's owed count to >= 0 — never allow a negative debt. */
export function clampCount(n: number): number {
  return Math.max(0, Math.round(n));
}

export function totalOutstanding(counts: QadaCounts): number {
  return QADA_PRAYERS.reduce((sum, p) => sum + (counts[p] ?? 0), 0);
}

export interface ExcusedRange {
  id: string;
  /** YYYY-MM-DD, inclusive start/end. */
  startDate: string;
  endDate: string;
  /** Free-text reason, e.g. "menses" or "illness" — never required, never validated against a fixed list. */
  note?: string;
}

/** True if `date` (YYYY-MM-DD) falls within any excused range (inclusive). */
export function isDateExcused(date: string, ranges: ExcusedRange[]): boolean {
  return ranges.some((r) => date >= r.startDate && date <= r.endDate);
}

/**
 * Days covered by an excused range (inclusive), used for display only — this
 * module never auto-decrements prayer counts from a range; the user explicitly
 * marks prayers owed/made-up, and the excused toggle only means "don't count
 * missed prayers in this window as owed" per the ruling in the module doc above.
 */
export function excusedRangeDayCount(range: ExcusedRange): number {
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / 86_400_000) + 1);
}
