/**
 * Purpose: Zustand v5 store for the fasting tracker — persists logged fasts
 *   (date + type) via AsyncStorage, same persistence pattern as useSettingsStore.
 * Inputs: Actions from FastingScreen (log/unlog a date+type).
 * Outputs: FastingState — logs[] + logFast/unlogFast/isLogged.
 * Constraints: One log per date (a day can only be one fast type — matches how a
 *   person actually fasts a given day). Does NOT touch useSettingsStore.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-fasting-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FastLog, FastType } from '../fastingLogic';

export interface FastingState {
  logs: FastLog[];

  /** Log (or overwrite) a fast for a given date. */
  logFast: (date: string, type: FastType) => void;
  /** Remove a logged fast for a given date. */
  unlogFast: (date: string) => void;
  /** The logged type for a date, or null if not logged. */
  getLogForDate: (date: string) => FastLog | null;
  reset: () => void;
}

const initialState = {
  logs: [] as FastLog[],
};

export const useFastingStore = create<FastingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      logFast: (date, type) =>
        set((s) => ({
          logs: [...s.logs.filter((l) => l.date !== date), { date, type, loggedAt: Date.now() }],
        })),

      unlogFast: (date) =>
        set((s) => ({
          logs: s.logs.filter((l) => l.date !== date),
        })),

      getLogForDate: (date) => get().logs.find((l) => l.date === date) ?? null,

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'praycalc-fasting',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
