/**
 * Purpose: Multi-step onboarding orchestrator — wires useOnboardingFlow's step
 *   machine to the individual step screens, applies results (location, method,
 *   notification grant, analytics consent) to their respective stores, and
 *   completes the flow by calling the existing setOnboardingDone action so the
 *   root gate (src/app/index.tsx) proceeds into the app exactly as before.
 * Inputs: none — self-contained; reads/writes useSettingsStore (existing actions
 *   only) and useConsentStore (new, owned by this feature).
 * Outputs: OnboardingFlow component, rendered by src/app/onboarding/index.tsx.
 * Constraints:
 *   - Skippable but complete: the global Skip affordance (header) jumps straight
 *     to 'done' and applies sensible defaults (DPC method already default,
 *     onboardingDone=true, analyticsConsent='denied' — default-deny) so the root
 *     gate's redirect logic (onboardingDone || hasLocation) always resolves.
 *   - Does not read/write auth — the prior onboarding's account-creation step is
 *     out of scope for this rebuild (not part of the assigned step list) and
 *     auth/useAuthStore is another feature's ownership; existing anonymous-mode
 *     default is preserved implicitly (untouched).
 *   - Location step failure/denial still advances the flow (does not block).
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-onboarding-flow
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import { useConsentStore, type AnalyticsConsent } from '../consent/store/useConsentStore';
import { detectFallbackMethod, DEFAULT_FALLBACK_METHOD, type FixedMethodKey } from '../../lib/method-autodetect';
import { DEFAULT_METHOD, type CalcMethodKey } from '../../constants/methods';
import type { CityCoords } from '../../types/prayer';
import { useOnboardingFlow } from './useOnboardingFlow';
import { OnboardingProgressDots } from './components/OnboardingProgressDots';
import { FadeStep } from './components/FadeStep';
import { WelcomeStep } from './screens/WelcomeStep';
import { LocationStep } from './screens/LocationStep';
import { NotificationsStep } from './screens/NotificationsStep';
import { MethodStep } from './screens/MethodStep';
import { ConsentStep } from './screens/ConsentStep';
import { DoneStep } from './screens/DoneStep';

export function OnboardingFlow() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const flow = useOnboardingFlow();
  const setLocation = useSettingsStore((s) => s.setLocation);
  const setMethod = useSettingsStore((s) => s.setMethod);
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone);
  const setAnalyticsConsent = useConsentStore((s) => s.setAnalyticsConsent);

  const [detectedFallback, setDetectedFallback] = useState<FixedMethodKey>(DEFAULT_FALLBACK_METHOD);

  function completeAndEnter() {
    setOnboardingDone(true);
    router.replace('/(tabs)/home');
  }

  function handleLocationResolved(location: CityCoords | null) {
    if (location) {
      setLocation(location);
      setDetectedFallback(detectFallbackMethod({ countryCode: undefined, timezone: location.timezone }));
    }
    flow.next();
  }

  function handleMethodSelected(method: CalcMethodKey) {
    setMethod(method);
    flow.next();
  }

  function handleConsentChoice(value: AnalyticsConsent) {
    setAnalyticsConsent(value);
    flow.next();
  }

  /** Global Skip — jumps to Done with sensible, valid defaults so the root gate proceeds. */
  function handleGlobalSkip() {
    setMethod(DEFAULT_METHOD);
    setAnalyticsConsent('denied');
    flow.skipToEnd();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <OnboardingProgressDots total={flow.totalSteps} currentIndex={flow.stepIndex} />
        {!flow.isLastStep && (
          <TouchableOpacity onPress={handleGlobalSkip} accessibilityRole="button">
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        <FadeStep key={flow.step}>
          {flow.step === 'welcome' && <WelcomeStep onNext={flow.next} onSkip={handleGlobalSkip} />}

          {flow.step === 'location' && (
            <LocationStep onLocationResolved={handleLocationResolved} onSkip={flow.next} />
          )}

          {flow.step === 'notifications' && (
            <NotificationsStep onDone={() => flow.next()} onSkip={flow.next} />
          )}

          {flow.step === 'method' && (
            <MethodStep detectedFallback={detectedFallback} onSelect={handleMethodSelected} />
          )}

          {flow.step === 'consent' && <ConsentStep onChoice={handleConsentChoice} />}

          {flow.step === 'done' && <DoneStep onFinish={completeAndEnter} />}
        </FadeStep>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand.deep },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12 },
  skipText: { color: colors.brand.light, fontSize: 14, opacity: 0.7 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
});
