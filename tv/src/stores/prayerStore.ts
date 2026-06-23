/**
 * Purpose: Prayer times state store for PrayCalc TV app
 * Inputs: Prayer calculation results from @acamarata/pray-calc
 * Outputs: Reactive prayer times + next-prayer state
 * Constraints: Zustand v5; recalculated on city/method changes; no DOM APIs
 * SPORT: praycalc/tv stores
 */

import { create } from 'zustand';
import { PrayerDay, PrayerName, PrayerTime } from '../types';

interface PrayerStore {
  prayerDay: PrayerDay | null;
  prayerTimes: PrayerTime[];
  nextPrayer: PrayerName | null;
  setPrayerDay: (day: PrayerDay) => void;
  setNextPrayer: (name: PrayerName) => void;
  markCompleted: (name: PrayerName) => void;
}

function buildPrayerTimes(day: PrayerDay, next: PrayerName | null): PrayerTime[] {
  const names: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  return names.map((name) => ({
    name,
    time: day[name],
    isNext: name === next,
    isCompleted: false,
  }));
}

export const usePrayerStore = create<PrayerStore>((set, get) => ({
  prayerDay: null,
  prayerTimes: [],
  nextPrayer: null,
  setPrayerDay: (day) => {
    const { nextPrayer } = get();
    set({ prayerDay: day, prayerTimes: buildPrayerTimes(day, nextPrayer) });
  },
  setNextPrayer: (name) => {
    const { prayerDay, prayerTimes } = get();
    set({
      nextPrayer: name,
      prayerTimes: prayerTimes.map((p) => ({ ...p, isNext: p.name === name })),
    });
    if (prayerDay) {
      set({ prayerTimes: buildPrayerTimes(prayerDay, name) });
    }
  },
  markCompleted: (name) => {
    set((state) => ({
      prayerTimes: state.prayerTimes.map((p) =>
        p.name === name ? { ...p, isCompleted: true } : p
      ),
    }));
  },
}));
