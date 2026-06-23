/**
 * Purpose: Global settings store for PrayCalc TV app
 * Inputs: User settings changes, pairing updates
 * Outputs: Reactive settings state consumed by all screens
 * Constraints: Zustand v5; persisted via AsyncStorage; no DOM APIs
 * SPORT: praycalc/tv stores
 */

import { create } from 'zustand';
import { TvSettings, Madhab } from '../types';

interface SettingsStore {
  settings: TvSettings;
  updateSettings: (patch: Partial<TvSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: TvSettings = {
  cityId: 'mecca',
  cityName: 'Mecca',
  latitude: 21.3891,
  longitude: 39.8579,
  timezone: 'Asia/Riyadh',
  calculationMethodId: 'mwl',
  madhab: 'shafi' as Madhab,
  language: 'en',
  autoAdvanceScreens: false,
  screensaverTimeoutMinutes: 5,
  displayBrightness: 1,
  adhanVolume: 0.8,
  prayerVolumes: {},
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULT_SETTINGS,
  updateSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),
  resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
}));
