/**
 * Purpose: Local-only prayer-completion log (tap-to-mark-prayed on Home) that backs
 *   StatsScreen's streak/chart UI. Previously nothing in the app ever wrote this key,
 *   so Stats was permanently unreachable dead code.
 * Inputs: PrayerName, date.
 * Outputs: PrayerCompletion[] persisted to MMKV under STORAGE_KEYS.PRAYER_COMPLETIONS.
 * Constraints: Local-only (no GraphQL) — mirrors StatsScreen's offline-first design.
 *   One completion per (date, prayerName) — toggling re-marks/un-marks idempotently.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-completions
 */

import { mmkv } from './storage/mmkv';
import { STORAGE_KEYS } from '../constants';
import type { PrayerName } from '../types/prayer';

export interface PrayerCompletion {
  date: string; // YYYY-MM-DD
  prayerName: PrayerName;
  completedAt: number; // Unix ms
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function loadCompletions(): PrayerCompletion[] {
  const raw = mmkv.getString(STORAGE_KEYS.PRAYER_COMPLETIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PrayerCompletion[];
  } catch {
    return [];
  }
}

function saveCompletions(completions: PrayerCompletion[]): void {
  mmkv.set(STORAGE_KEYS.PRAYER_COMPLETIONS, JSON.stringify(completions));
}

export function isPrayerCompleted(prayerName: PrayerName, date: Date = new Date()): boolean {
  const dateKey = toDateKey(date);
  return loadCompletions().some((c) => c.date === dateKey && c.prayerName === prayerName);
}

/** Toggle a prayer's completion for the given date. Returns the new completed state. */
export function togglePrayerCompletion(prayerName: PrayerName, date: Date = new Date()): boolean {
  const dateKey = toDateKey(date);
  const completions = loadCompletions();
  const idx = completions.findIndex((c) => c.date === dateKey && c.prayerName === prayerName);
  if (idx >= 0) {
    completions.splice(idx, 1);
    saveCompletions(completions);
    return false;
  }
  completions.push({ date: dateKey, prayerName, completedAt: Date.now() });
  saveCompletions(completions);
  return true;
}
