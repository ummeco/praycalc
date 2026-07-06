/**
 * Purpose: Onboarding modal — welcome, permissions request, location setup, auth choice
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const STEPS = ['welcome', 'location', 'auth'] as const;
type OnboardingStep = typeof STEPS[number];

export default function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const setLocation = useSettingsStore((s) => s.setLocation);
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone);
  const setAnonymous = useAuthStore((s) => s.setAnonymous);

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
          <Text style={styles.title}>Welcome to PrayCalc</Text>
          <Text style={styles.desc}>Accurate prayer times, Qibla direction, and Islamic calendar — all in one place.</Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep('location')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'location' && (
        <View style={styles.panel}>
          <Text style={styles.title}>Enable Location</Text>
          <Text style={styles.desc}>Prayer times require your location for accurate calculation.</Text>
          <TouchableOpacity style={styles.button} onPress={requestLocation}>
            <Text style={styles.buttonText}>Allow Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('auth')}>
            <Text style={styles.secondaryButtonText}>Skip — I'll set manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'auth' && (
        <View style={styles.panel}>
          <Text style={styles.title}>Create Account?</Text>
          <Text style={styles.desc}>Optional: create an account for cloud sync and prayer history. You can always sign up later.</Text>
          <TouchableOpacity style={styles.button} onPress={finishToSignIn}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={finish}>
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand.deep, justifyContent: 'center', padding: 32 },
  panel: { gap: 24 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.brand.light },
  desc: { fontSize: 16, color: Colors.text.inverse, lineHeight: 24, opacity: 0.9 },
  button: { backgroundColor: Colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: Colors.brand.deep, fontWeight: '700', fontSize: 16 },
  secondaryButton: { alignItems: 'center', padding: 14 },
  secondaryButtonText: { color: Colors.brand.light, fontSize: 14, opacity: 0.8 },
});
