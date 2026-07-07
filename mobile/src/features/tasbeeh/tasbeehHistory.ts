/**
 * Purpose: Pure MMKV-backed history log for completed tasbeeh (dhikr) sessions —
 *   extracted from TasbeehScreen.tsx so it can be unit-tested without importing
 *   React Native UI (importing the .tsx screen directly in a test transitively
 *   pulls in react-native internals that fail to parse under this project's
 *   jest/hermes-parser combination).
 * Inputs: TasbeehHistoryEntry (dhikrId, dhikrName, count, completedAt).
 * Outputs: loadTasbeehHistory, appendTasbeehHistory, getTodayTasbeehTotal.
 * Constraints: Append-only, capped at HISTORY_LIMIT most-recent sessions to bound
 *   MMKV storage growth. A "session" is logged only when the target count is
 *   reached — never on partial/abandoned counts (see TasbeehScreen.tsx handleIncrement).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-tasbeeh-history
 */

import { mmkv } from '../../lib/storage/mmkv';

const HISTORY_KEY = 'pc:tasbeeh:history';
/** Cap stored history entries to bound MMKV growth — oldest entries drop off first. */
const HISTORY_LIMIT = 200;

export interface TasbeehHistoryEntry {
  dhikrId: string;
  dhikrName: string; // transliteration, for display without a presets lookup
  count: number;
  completedAt: number; // Unix ms
}

/** Load the persisted history log (newest first). */
export function loadTasbeehHistory(): TasbeehHistoryEntry[] {
  const raw = mmkv.getString(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TasbeehHistoryEntry[];
  } catch {
    return [];
  }
}

/** Append a completed session to the history log, capped at HISTORY_LIMIT. */
export function appendTasbeehHistory(entry: TasbeehHistoryEntry): TasbeehHistoryEntry[] {
  const existing = loadTasbeehHistory();
  const next = [entry, ...existing].slice(0, HISTORY_LIMIT);
  mmkv.set(HISTORY_KEY, JSON.stringify(next));
  return next;
}

/** Sum of dhikr counts logged today (local date). */
export function getTodayTasbeehTotal(history: TasbeehHistoryEntry[], now: Date = new Date()): number {
  const todayKey = now.toISOString().slice(0, 10);
  return history
    .filter((h) => new Date(h.completedAt).toISOString().slice(0, 10) === todayKey)
    .reduce((sum, h) => sum + h.count, 0);
}
