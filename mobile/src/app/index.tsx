/**
 * Purpose: Root route — first-launch gate. Redirects to /onboarding until the
 *   flow completes, then to the home tab forever after.
 * Inputs: useSettingsStore.onboardingDone + location (persisted).
 * Outputs: <Redirect> to /onboarding or /(tabs)/home.
 * Constraints: Must wait for zustand persist rehydration before deciding —
 *   deciding on default state would bounce existing users into onboarding.
 *   Users from builds that predate the onboardingDone flag are treated as
 *   onboarded when they already have a location set.
 *   Also imports '../lib/errors/reporter' for its side effect (installs the
 *   global JS error handler) — this module is the earliest first-party route
 *   file evaluated on app start that is not otherwise owned by concurrent work.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-index-gate
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import '../lib/errors/reporter';
import { useThemeColors } from '../hooks/useThemeColors';
import { useSettingsStore } from '../features/settings/store/useSettingsStore';

function useSettingsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useSettingsStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useSettingsStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

export default function Index() {
  const hydrated = useSettingsHydrated();
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const hasLocation = useSettingsStore((s) => s.location !== null);
  const colors = useThemeColors();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand.deep }}>
        <ActivityIndicator color={colors.brand.light} />
      </View>
    );
  }

  return <Redirect href={onboardingDone || hasLocation ? '/(tabs)/home' : '/onboarding'} />;
}
