/**
 * Purpose: Onboarding step 2 — "why location" priming screen. Explains why
 *   location is needed (accurate prayer times for the user's city) BEFORE
 *   triggering the actual OS permission prompt, per platform best-practice
 *   (prime first, then request) — the OS prompt only fires when the user taps
 *   Continue, never on screen mount.
 * Inputs: onLocationResolved(CityCoords | null) — called with the resolved
 *   location on success, or null if permission was denied/unavailable so the
 *   caller can still advance the flow. onSkip callback.
 * Outputs: LocationStep component.
 * Constraints: Uses expo-location exactly as the prior single-screen onboarding
 *   did (requestForegroundPermissionsAsync → getCurrentPositionAsync → reverse
 *   geocode) so behavior is unchanged, just re-primed with explanatory copy.
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-onboarding-location-step
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import type { CityCoords } from '../../../types/prayer';

interface LocationStepProps {
  onLocationResolved: (location: CityCoords | null) => void;
  onSkip: () => void;
}

export function LocationStep({ onLocationResolved, onSkip }: LocationStepProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [requesting, setRequesting] = useState(false);

  async function requestLocation() {
    setRequesting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        onLocationResolved(null);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      onLocationResolved({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: geo?.city ?? 'Unknown',
        country: geo?.country ?? 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch {
      onLocationResolved(null);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{t('onboarding.location.title')}</Text>
      <Text style={styles.desc}>{t('onboarding.location.prime')}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={requestLocation}
        disabled={requesting}
        accessibilityRole="button"
      >
        {requesting ? (
          <ActivityIndicator color={colors.brand.deep} />
        ) : (
          <Text style={styles.buttonText}>{t('onboarding.location.allow')}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onSkip} accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>{t('onboarding.location.later')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  panel: { gap: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.brand.light },
  desc: { fontSize: 16, color: colors.text.inverse, lineHeight: 24, opacity: 0.9 },
  button: { backgroundColor: colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 16 },
  secondaryButton: { alignItems: 'center', padding: 14 },
  secondaryButtonText: { color: colors.brand.light, fontSize: 14, opacity: 0.8 },
});
