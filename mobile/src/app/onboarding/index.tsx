/**
 * Purpose: Onboarding modal — welcome, permissions request, location setup, auth choice
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-onboarding
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const STEPS = ['welcome', 'location', 'auth'] as const;
type OnboardingStep = typeof STEPS[number];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const setLocation = useSettingsStore((s) => s.setLocation);
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone);
  const setAnonymous = useAuthStore((s) => s.setAnonymous);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: geo?.city ?? 'Unknown',
        country: geo?.country ?? 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
    setStep('auth');
  }

  function finish() {
    setOnboardingDone(true);
    setAnonymous();
    router.replace('/(tabs)/home');
  }

  function finishToSignIn() {
    // Mark done BEFORE leaving — the root gate must not bounce the user back
    // into onboarding after they return from the auth flow.
    setOnboardingDone(true);
    router.push('/(auth)/sign-in');
  }

  return (
    <View style={styles.container}>
      {step === 'welcome' && (
        <View style={styles.panel}>
          <Text style={styles.title}>{t('screens.onboarding.welcomeTitle')}</Text>
          <Text style={styles.desc}>{t('screens.onboarding.welcomeDesc')}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep('location')}>
            <Text style={styles.buttonText}>{t('screens.onboarding.getStarted')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'location' && (
        <View style={styles.panel}>
          <Text style={styles.title}>{t('screens.onboarding.locationTitle')}</Text>
          <Text style={styles.desc}>{t('screens.onboarding.locationDesc')}</Text>
          <TouchableOpacity style={styles.button} onPress={requestLocation}>
            <Text style={styles.buttonText}>{t('screens.onboarding.allowLocation')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('auth')}>
            <Text style={styles.secondaryButtonText}>{t('screens.onboarding.skipManual')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'auth' && (
        <View style={styles.panel}>
          <Text style={styles.title}>{t('screens.onboarding.authTitle')}</Text>
          <Text style={styles.desc}>{t('screens.onboarding.authDesc')}</Text>
          <TouchableOpacity style={styles.button} onPress={finishToSignIn}>
            <Text style={styles.buttonText}>{t('common.createAccount')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={finish}>
            <Text style={styles.secondaryButtonText}>{t('screens.onboarding.skipForNow')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand.deep, justifyContent: 'center', padding: 32 },
  panel: { gap: 24 },
  title: { fontSize: 32, fontWeight: '800', color: colors.brand.light },
  desc: { fontSize: 16, color: colors.text.inverse, lineHeight: 24, opacity: 0.9 },
  button: { backgroundColor: colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 16 },
  secondaryButton: { alignItems: 'center', padding: 14 },
  secondaryButtonText: { color: colors.brand.light, fontSize: 14, opacity: 0.8 },
});
