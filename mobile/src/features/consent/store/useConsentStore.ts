/**
 * Purpose: Zustand v5 store for analytics telemetry consent — default-deny until
 *   the user explicitly grants permission during onboarding (or later from the
 *   Privacy screen).
 * Inputs: User's Accept/Decline choice from the consent UI.
 * Outputs: analyticsConsent state + setAnalyticsConsent() action, persisted via
 *   AsyncStorage so the choice survives app restarts.
 * Constraints: 'unset' and 'denied' both mean NO telemetry — src/lib/analytics.ts
 *   gates on `=== 'granted'` explicitly, never on `!== 'denied'`, so a fresh
 *   install (unset) never sends events before the user has been asked.
 *   Mirrors the persist middleware pattern used by useSettingsStore.ts.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-consent-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Analytics telemetry consent state. 'unset' = not yet asked (default-deny). */
export type AnalyticsConsent = 'unset' | 'granted' | 'denied';

export interface ConsentState {
  analyticsConsent: AnalyticsConsent;
  setAnalyticsConsent: (value: AnalyticsConsent) => void;
}

const initialState = {
  analyticsConsent: 'unset' as AnalyticsConsent,
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      ...initialState,
      setAnalyticsConsent: (analyticsConsent) => set({ analyticsConsent }),
    }),
    {
      name: 'praycalc-consent',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState) => persistedState as ConsentState,
    },
  ),
);
