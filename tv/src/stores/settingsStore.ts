/**
 * Purpose: Global settings store for PrayCalc TV app
 * Inputs: User settings changes, pairing updates
 * Outputs: Reactive settings state consumed by all screens
 * Constraints: Zustand v5; persisted via AsyncStorage (zustand/middleware persist), no DOM APIs
 * SPORT: praycalc/tv stores
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TvSettings, Madhab } from '../types';
import { DEFAULT_IQAMA_OFFSETS } from '../lib/settings/tvSettingsSync';

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
  calculationMethodId: 'dpc',
  madhab: 'shafi' as Madhab,
  language: 'en',
  autoAdvanceScreens: false,
  screensaverTimeoutMinutes: 5,
  displayBrightness: 1,
  adhanVolume: 0.8,
  prayerVolumes: {},
  // Dashboard cosmetic defaults (overridden by pc_tv_settings when a row exists).
  accentColor: '#79C24C',
  streamSource: 'makkah-tv',
  rotateMinutes: 10,
  showWeather: true,
  // Deep-settings defaults (overridden by pc_tv_settings when a row exists).
  countdownTakeoverEnabled: false,
  countdownMinutes: 5,
  iqamaEnabled: false,
  iqamaOffsets: DEFAULT_IQAMA_OFFSETS,
  nameOnlyEnabled: false,
  nameOnlyMinutes: 10,
  timeFormat: '24h',
};

/**
 * Effective TV location, sourced from settings (which pc_tv_settings keeps in sync on
 * every poll, not just at pair time) — so an account-side location edit reaches the
 * prayer calculation without a re-pair.
 */
export function selectEffectiveLocation(settings: TvSettings): {
  latitude: number;
  longitude: number;
  city: string;
  timezone: string;
} {
  return {
    latitude: settings.latitude,
    longitude: settings.longitude,
    city: settings.cityName,
    timezone: settings.timezone,
  };
}

/** Storage key — namespaced so it never collides with other AsyncStorage consumers. */
export const SETTINGS_STORAGE_KEY = 'praycalc-tv-settings';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only the settings payload — actions are re-created on hydration.
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
