/**
 * Purpose: Zustand v5 store for the Qada (missed-prayer) counter — persists
 *   per-prayer owed counts + excused date ranges via AsyncStorage, same
 *   persistence pattern as useSettingsStore.
 * Inputs: Actions from QadaScreen (adjust/makeUp per prayer, add/remove excused range).
 * Outputs: QadaState — counts + excusedRanges + mutators.
 * Constraints: Does NOT touch useSettingsStore. See qadaLogic.ts module doc for the
 *   fiqh basis of the excused-range feature (prayers, not fasts, are excused here —
 *   Sahih al-Bukhari 321 / Sahih Muslim 335).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-qada-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerName } from '../../../types/prayer';
import { emptyQadaCounts, clampCount, type QadaCounts, type ExcusedRange } from '../qadaLogic';

export interface QadaState {
  counts: QadaCounts;
  excusedRanges: ExcusedRange[];

  /** Adjust a single prayer's owed count by ±delta (clamped >= 0). */
  adjustCount: (prayer: PrayerName, delta: number) => void;
  /** Convenience: mark one prayer as made up (decrement by 1, clamped >= 0). */
  makeUpOne: (prayer: PrayerName) => void;
  setCount: (prayer: PrayerName, count: number) => void;
  addExcusedRange: (range: Omit<ExcusedRange, 'id'>) => void;
  removeExcusedRange: (id: string) => void;
  reset: () => void;
}

const initialState = {
  counts: emptyQadaCounts(),
  excusedRanges: [] as ExcusedRange[],
};

export const useQadaStore = create<QadaState>()(
  persist(
    (set) => ({
      ...initialState,

      adjustCount: (prayer, delta) =>
        set((s) => ({
          counts: { ...s.counts, [prayer]: clampCount((s.counts[prayer] ?? 0) + delta) },
        })),

      makeUpOne: (prayer) =>
        set((s) => ({
          counts: { ...s.counts, [prayer]: clampCount((s.counts[prayer] ?? 0) - 1) },
        })),

      setCount: (prayer, count) =>
        set((s) => ({
          counts: { ...s.counts, [prayer]: clampCount(count) },
        })),

      addExcusedRange: (range) =>
        set((s) => ({
          excusedRanges: [...s.excusedRanges, { ...range, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
        })),

      removeExcusedRange: (id) =>
        set((s) => ({
          excusedRanges: s.excusedRanges.filter((r) => r.id !== id),
        })),

      reset: () => set({ ...initialState, counts: emptyQadaCounts() }),
    }),
    {
      name: 'praycalc-qada',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
