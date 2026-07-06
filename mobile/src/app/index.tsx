/**
 * Purpose: Root route — first-launch gate. Redirects to /onboarding until the
 *   flow completes, then to the home tab forever after.
 * Inputs: useSettingsStore.onboardingDone + location (persisted).
 * Outputs: <Redirect> to /onboarding or /(tabs)/home.
 * Constraints: Must wait for zustand persist rehydration before deciding —
 *   deciding on default state would bounce existing users into onboarding.
 *   Users from builds that predate the onboardingDone flag are treated as
 *   onboarded when they already have a location set.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-index-gate
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors } from '../constants/colors';
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

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.brand.deep }}>
        <ActivityIndicator color={Colors.brand.light} />
      </View>
    );
  }

  return <Redirect href={onboardingDone || hasLocation ? '/(tabs)/home' : '/onboarding'} />;
}
