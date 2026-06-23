/**
 * Purpose: 5-step onboarding flow — location, calculation method, notifications,
 *   account (anonymous or sign-in), and completion.
 * Inputs: expo-location (GPS), useSettingsStore, PrayerNotificationService, auth.
 * Outputs: OnboardingScreen — Feature 20 of 20. Sets initial settings on complete.
 * Constraints: Permission gate on notifications step (graceful degrade if denied).
 *   Anonymous mode available (no account required). MMKV marks onboarding done.
 *   7 UI states. Final step navigates to home.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-20-onboarding
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import {
  requestNotificationPermission,
  schedulePrayerNotifications,
  setupNotificationChannel,
} from '../../lib/notifications/PrayerNotificationService';
import { mmkv } from '../../lib/storage/mmkv';
import { STORAGE_KEYS } from '../../constants';
import type { CityCoords } from '../../types/prayer';

// Available calculation methods (Tehran/Jafari excluded per D-P3-19)
const CALC_METHODS = [
  { key: 'MWL', label: 'Muslim World League', regions: 'Global' },
  { key: 'ISNA', label: 'ISNA', regions: 'North America' },
  { key: 'Egypt', label: 'Egyptian General Authority', regions: 'Africa / Middle East' },
  { key: 'Makkah', label: 'Umm al-Qura (Makkah)', regions: 'Saudi Arabia' },
  { key: 'Karachi', label: 'University of Karachi', regions: 'South Asia' },
  { key: 'Gulf', label: 'Gulf Region', regions: 'Gulf States' },
];

type Step = 'location' | 'method' | 'notifications' | 'account' | 'complete';
const STEPS: Step[] = ['location', 'method', 'notifications', 'account', 'complete'];

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>('location');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const { setLocation, setMethod } = useSettingsStore();

  const stepIndex = STEPS.indexOf(currentStep);

  const goNext = useCallback(() => {
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next);
  }, [stepIndex]);

  // ── Step: Location ────────────────────────────────────────────────────────

  const handleDetectLocation = useCallback(async () => {
    setLoadingLocation(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. You can set your city manually later in Settings.');
        setLoadingLocation(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const city: CityCoords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        city: geo?.city ?? geo?.district ?? 'My Location',
        country: geo?.country ?? '',
        timezone: `${-(new Date().getTimezoneOffset() / 60)}`,
      };
      setLocation(city);
      goNext();
    } catch (e) {
      setLocationError((e as Error).message ?? 'Could not detect location.');
    } finally {
      setLoadingLocation(false);
    }
  }, [setLocation, goNext]);

  // ── Step: Method ──────────────────────────────────────────────────────────

  const [selectedMethod, setSelectedMethod] = useState('MWL');
  const handleMethodContinue = useCallback(() => {
    setMethod(selectedMethod);
    goNext();
  }, [selectedMethod, setMethod, goNext]);

  // ── Step: Notifications ───────────────────────────────────────────────────

  const handleEnableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      await setupNotificationChannel();
      await schedulePrayerNotifications();
    }
    goNext();
  }, [goNext]);

  // ── Step: Account ─────────────────────────────────────────────────────────

  const handleAnonymousContinue = useCallback(() => {
    // Anonymous mode: skip account creation
    mmkv.set('pc:auth:mode', 'anonymous');
    goNext();
  }, [goNext]);

  // ── Step: Complete ────────────────────────────────────────────────────────

  const handleComplete = useCallback(() => {
    mmkv.set(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    onComplete?.();
  }, [onComplete]);

  // ── Progress bar ──────────────────────────────────────────────────────────

  const progress = (stepIndex + 1) / STEPS.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 5, now: stepIndex + 1 }}
        accessibilityLabel={`Step ${stepIndex + 1} of 5`}
      >
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.stepIndicator}>Step {stepIndex + 1} of {STEPS.length}</Text>

      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>

        {/* ── Step 1: Location ───────────────────────────────────────────── */}
        {currentStep === 'location' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>📍</Text>
            <Text style={styles.stepTitle} accessibilityRole="header">Your Location</Text>
            <Text style={styles.stepDesc}>
              We need your location to calculate accurate prayer times for your city.
            </Text>
            {locationError && (
              <Text style={styles.errorText} accessibilityRole="alert">{locationError}</Text>
            )}
            {loadingLocation ? (
              <ActivityIndicator size="large" color={Colors.brand.mid} style={{ marginVertical: 16 }} />
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleDetectLocation}
                accessibilityRole="button"
                accessibilityLabel="Detect my location"
              >
                <Text style={styles.primaryBtnText}>Detect My Location</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="Set city manually later"
            >
              <Text style={styles.secondaryBtnText}>Set City Manually Later</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: Method ─────────────────────────────────────────────── */}
        {currentStep === 'method' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>🕌</Text>
            <Text style={styles.stepTitle} accessibilityRole="header">Calculation Method</Text>
            <Text style={styles.stepDesc}>
              Choose the method used to calculate Fajr and Isha times.
            </Text>
            {CALC_METHODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.methodCard, selectedMethod === m.key && styles.methodCardActive]}
                onPress={() => setSelectedMethod(m.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedMethod === m.key }}
                accessibilityLabel={`${m.label}, used in ${m.regions}`}
              >
                <Text style={styles.methodName}>{m.label}</Text>
                <Text style={styles.methodRegion}>{m.regions}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleMethodContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue with selected method"
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 3: Notifications ──────────────────────────────────────── */}
        {currentStep === 'notifications' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>🔔</Text>
            <Text style={styles.stepTitle} accessibilityRole="header">Prayer Reminders</Text>
            <Text style={styles.stepDesc}>
              Get notified before each prayer time so you never miss a salah.
            </Text>
            {notifGranted === false && (
              <Text style={styles.notifDeniedText}>
                Notifications declined. You can enable them later in Settings → Notifications.
              </Text>
            )}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleEnableNotifications}
              accessibilityRole="button"
              accessibilityLabel="Enable prayer reminders"
            >
              <Text style={styles.primaryBtnText}>Enable Reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="Skip notifications for now"
            >
              <Text style={styles.secondaryBtnText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 4: Account ────────────────────────────────────────────── */}
        {currentStep === 'account' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>👤</Text>
            <Text style={styles.stepTitle} accessibilityRole="header">Your Account</Text>
            <Text style={styles.stepDesc}>
              Create an account to sync your settings and stats across devices.
              Or continue without an account — everything works locally.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                // ADR-DEFERRED (P2-E5-W02-S02-T01): navigate to sign-in/register flow — deferred to auth sprint
                goNext();
              }}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.primaryBtnText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleAnonymousContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue without account"
            >
              <Text style={styles.secondaryBtnText}>Continue Without Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 5: Complete ───────────────────────────────────────────── */}
        {currentStep === 'complete' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>✅</Text>
            <Text style={styles.stepTitle} accessibilityRole="header">
              بِسْمِ اللَّهِ
            </Text>
            <Text style={styles.bismillah}>In the name of Allah</Text>
            <Text style={styles.stepDesc}>
              PrayCalc is ready. May Allah accept your prayers.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleComplete}
              accessibilityRole="button"
              accessibilityLabel="Start using PrayCalc"
            >
              <Text style={styles.primaryBtnText}>Start Using PrayCalc</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.background.card,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.mid,
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  scroll: { padding: 24, paddingBottom: 48, flex: 1, justifyContent: 'center' },
  stepContent: { alignItems: 'center', gap: 12 },
  stepIcon: { fontSize: 56, marginBottom: 8 },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.brand.dark,
    textAlign: 'center',
  },
  bismillah: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: -8,
  },
  stepDesc: {
    fontSize: 15,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  errorText: { fontSize: 13, color: Colors.state.error, textAlign: 'center', lineHeight: 20 },
  notifDeniedText: {
    fontSize: 13,
    color: Colors.state.warning,
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: Colors.state.warning + '22',
    padding: 10,
    borderRadius: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.text.inverse },
  secondaryBtn: {
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryBtnText: { fontSize: 15, color: Colors.text.muted },
  methodCard: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    minHeight: 56,
    justifyContent: 'center',
  },
  methodCardActive: {
    borderWidth: 2,
    borderColor: Colors.brand.mid,
    backgroundColor: Colors.brand.light + '22',
  },
  methodName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  methodRegion: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
});
