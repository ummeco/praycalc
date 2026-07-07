/**
 * Purpose: Unit tests for the tasbeeh history log helpers (loadTasbeehHistory,
 *   appendTasbeehHistory, getTodayTasbeehTotal) in tasbeehHistory.ts.
 *   Uses the real MMKV instance (same as the app) — cleared between tests so
 *   each test starts from an empty history log.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-07-tasbeeh
 */

import {
  loadTasbeehHistory,
  appendTasbeehHistory,
  getTodayTasbeehTotal,
  type TasbeehHistoryEntry,
} from '../tasbeehHistory';
import { mmkv } from '../../../lib/storage/mmkv';

const HISTORY_KEY = 'pc:tasbeeh:history';

beforeEach(() => {
  mmkv.delete(HISTORY_KEY);
});

describe('loadTasbeehHistory', () => {
  it('returns an empty array when nothing is persisted', () => {
    expect(loadTasbeehHistory()).toEqual([]);
  });

  it('returns [] on corrupt JSON instead of throwing', () => {
    mmkv.set(HISTORY_KEY, 'not json{{{');
    expect(loadTasbeehHistory()).toEqual([]);
  });
});

describe('appendTasbeehHistory', () => {
  it('prepends the new entry (newest first)', () => {
    const first: TasbeehHistoryEntry = { dhikrId: 'subhanallah', dhikrName: 'SubhanAllah', count: 33, completedAt: 1000 };
    const second: TasbeehHistoryEntry = { dhikrId: 'alhamdulillah', dhikrName: 'Alhamdulillah', count: 33, completedAt: 2000 };
    appendTasbeehHistory(first);
    const result = appendTasbeehHistory(second);
    expect(result[0]).toEqual(second);
    expect(result[1]).toEqual(first);
  });

  it('persists across a fresh load', () => {
    const entry: TasbeehHistoryEntry = { dhikrId: 'allahuakbar', dhikrName: 'Allahu Akbar', count: 34, completedAt: 3000 };
    appendTasbeehHistory(entry);
    expect(loadTasbeehHistory()).toEqual([entry]);
  });

  it('caps at HISTORY_LIMIT (200) entries', () => {
    for (let i = 0; i < 205; i++) {
      appendTasbeehHistory({ dhikrId: 'subhanallah', dhikrName: 'SubhanAllah', count: 33, completedAt: i });
    }
    expect(loadTasbeehHistory().length).toBe(200);
  });
});

describe('getTodayTasbeehTotal', () => {
  // Fixed at local noon — the day-key comparison is UTC-based (toISOString), so
  // times near local midnight would flip UTC date under some timezones; noon is
  // safe across all real-world UTC offsets (-12..+14).
  const NOON = 12;

  it('sums only entries completed today', () => {
    const now = new Date(2026, 6, 7, NOON, 0, 0);
    const todayEntry: TasbeehHistoryEntry = {
      dhikrId: 'subhanallah', dhikrName: 'SubhanAllah', count: 33,
      completedAt: new Date(2026, 6, 7, NOON, 0, 0).getTime(),
    };
    const yesterdayEntry: TasbeehHistoryEntry = {
      dhikrId: 'alhamdulillah', dhikrName: 'Alhamdulillah', count: 33,
      completedAt: new Date(2026, 6, 6, NOON, 0, 0).getTime(),
    };
    const total = getTodayTasbeehTotal([todayEntry, yesterdayEntry], now);
    expect(total).toBe(33);
  });

  it('is 0 for an empty history', () => {
    expect(getTodayTasbeehTotal([], new Date())).toBe(0);
  });

  it('sums multiple sessions completed on the same day', () => {
    const now = new Date(2026, 6, 7, NOON, 0, 0);
    const entries: TasbeehHistoryEntry[] = [
      { dhikrId: 'subhanallah', dhikrName: 'SubhanAllah', count: 33, completedAt: new Date(2026, 6, 7, NOON, 0, 0).getTime() },
      { dhikrId: 'astaghfirullah', dhikrName: 'Astaghfirullah', count: 100, completedAt: new Date(2026, 6, 7, NOON, 0, 0).getTime() },
    ];
    expect(getTodayTasbeehTotal(entries, now)).toBe(133);
  });
});
