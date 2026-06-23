/**
 * Purpose: Zustand v5 settings store for PrayCalc — calculation method, madhab,
 *   location, notification preferences, time format. Persisted via AsyncStorage.
 * Inputs: Actions from SettingsScreen
 * Outputs: Settings state + updaters
 * Constraints: No Tehran/Jafari method (D-P3-19). Persisted per zustand v5 pattern.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-settings-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CityCoords, Madhab, HighLatRule, TimeFormat } from '../../../types/prayer';
import { DEFAULT_METHOD } from '../../../constants/methods';

export interface SettingsState {
  method: string;
  customFajrAngle: number;
  customIshaAngle: number;
  madhab: Madhab;
  highLatRule: HighLatRule;
  location: CityCoords | null;
  timeFormat: TimeFormat;
  notificationsEnabled: boolean;
  notificationOffset: number;
  locale: string;

  // Actions
  setMethod: (method: string) => void;
  setCustomAngles: (fajr: number, isha: number) => void;
  setMadhab: (madhab: Madhab) => void;
  setHighLatRule: (rule: HighLatRule) => void;
  setLocation: (location: CityCoords | null) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationOffset: (offset: number) => void;
  setLocale: (locale: string) => void;
  reset: () => void;
}

const initialState: Omit<SettingsState, keyof { [K in keyof SettingsState as SettingsState[K] extends Function ? K : never]: never }> = {
  method: DEFAULT_METHOD,
  customFajrAngle: 15,
  customIshaAngle: 15,
  madhab: 'Shafi',
  highLatRule: 'NightMiddle',
  location: null,
  timeFormat: '12h',
  notificationsEnabled: false,
  notificationOffset: 5,
  locale: 'en',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      method: DEFAULT_METHOD,
      customFajrAngle: 15,
      customIshaAngle: 15,
      madhab: 'Shafi',
      highLatRule: 'NightMiddle',
      location: null,
      timeFormat: '12h',
      notificationsEnabled: false,
      notificationOffset: 5,
      locale: 'en',

      setMethod: (method) => set({ method }),
      setCustomAngles: (fajr, isha) => set({ customFajrAngle: fajr, customIshaAngle: isha }),
      setMadhab: (madhab) => set({ madhab }),
      setHighLatRule: (highLatRule) => set({ highLatRule }),
      setLocation: (location) => set({ location }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setNotificationOffset: (notificationOffset) => set({ notificationOffset }),
      setLocale: (locale) => set({ locale }),
      reset: () => set({ ...initialState } as Partial<SettingsState>),
    }),
    {
      name: 'praycalc-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
