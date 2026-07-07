/**
 * Purpose: Qibla compass screen — animated compass needle using expo-sensors magnetometer.
 *   Shows bearing toward Kaaba, accuracy indicator, and declination correction.
 * Inputs: User location from settings store
 * Outputs: Animated compass with qibla needle; bearing angle display
 * Constraints: Uses great-circle bearing (not planar — CR-C requirement).
 *   All 7 UI states implemented. RTL layout prepared.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-qibla-screen
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import geomagnetism from 'geomagnetism';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useActiveLocation } from '../../settings/store/useSettingsStore';
import { useQibla } from '../hooks/useQibla';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  PermissionDeniedState,
} from '../../../components/states';

const ACCURACY_LABEL_KEYS = [
  'screens.qibla.accuracyUnreliable',
  'screens.qibla.accuracyLow',
  'screens.qibla.accuracyMedium',
  'screens.qibla.accuracyHigh',
];

export default function QiblaScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accuracyColors = useMemo(
    () => [colors.state.error, colors.state.warning, colors.brand.mid, colors.brand.dark],
    [colors],
  );
  // Travel-aware: musafir mode points the compass from the travel city, matching
  // every other prayer surface (Home/Ramadan/Agendas/Widget use the same hook).
  const activeLocation = useActiveLocation();
  const lat = activeLocation?.latitude ?? null;
  const lng = activeLocation?.longitude ?? null;

  // Real magnetic declination (offline WMM model) so the compass corrects
  // magnetic north → true north for an accurate Qibla heading.
  const declination = useMemo(() => {
    if (lat == null || lng == null) return 0;
    try {
      return geomagnetism.model().point([lat, lng]).decl;
    } catch {
      return 0;
    }
  }, [lat, lng]);

  const { bearing, heading, needleAngle, accuracy, status, error } = useQibla({
    latitude: lat,
    longitude: lng,
    declination,
  });

  // Animated rotation for compass needle
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const prevAngleRef = useRef(0);

  useEffect(() => {
    // Smooth rotation — shortest path to avoid spinning
    let diff = needleAngle - prevAngleRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const target = prevAngleRef.current + diff;
    prevAngleRef.current = target;

    Animated.timing(rotationAnim, {
      toValue: target,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [needleAngle, rotationAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  // ── 7 UI States ──────────────────────────────────────────────────────────────

  if (status === 'skeleton' || status === 'loading') {
    return <LoadingState message={t('screens.qibla.calibrating')} />;
  }

  if (status === 'empty') {
    return (
      <EmptyState
        title={t('screens.qibla.locationRequiredTitle')}
        subtitle={t('screens.qibla.locationRequiredSubtitle')}
        action={t('screens.prayerTimes.setLocationAction')}
        onAction={() => router.push('/city-search')}
      />
    );
  }

  if (status === 'permission-denied') {
    return <PermissionDeniedState permission="motion" />;
  }

  if (status === 'error') {
    return <ErrorState error={error} />;
  }

  // success
  return (
    <View style={styles.container}>
      {/* Bearing info */}
      <View style={styles.bearingInfo}>
        <Text style={styles.bearingValue}>
          {bearing !== null ? `${Math.round(bearing)}°` : '—'}
        </Text>
        <Text style={styles.bearingLabel}>{t('screens.qibla.bearingLabel')}</Text>
      </View>

      {/* Compass rose */}
      <View style={styles.compassContainer}>
        {/* Outer ring with N/S/E/W labels */}
        <View style={styles.compassOuter}>
          <Text style={[styles.compassDir, styles.compassN]}>N</Text>
          <Text style={[styles.compassDir, styles.compassE]}>E</Text>
          <Text style={[styles.compassDir, styles.compassS]}>S</Text>
          <Text style={[styles.compassDir, styles.compassW]}>W</Text>

          {/* Animated needle pointing to Qibla */}
          <Animated.View style={[styles.needle, { transform: [{ rotate: rotation }] }]}>
            <View style={styles.needleTop} />
            <View style={styles.needleBottom} />
          </Animated.View>

          {/* Center dot */}
          <View style={styles.centerDot} />
        </View>
      </View>

      {/* Accuracy indicator */}
      <View style={styles.accuracyRow}>
        <View
          style={[
            styles.accuracyDot,
            { backgroundColor: accuracyColors[accuracy] ?? colors.state.error },
          ]}
        />
        <Text style={styles.accuracyLabel}>
          {t('screens.qibla.accuracyLabel', {
            level: ACCURACY_LABEL_KEYS[accuracy] ? t(ACCURACY_LABEL_KEYS[accuracy]!) : t('screens.qibla.accuracyUnknown'),
          })}
        </Text>
      </View>

      {/* Declination note */}
      <Text style={styles.note}>
        {t('screens.qibla.headingNote', { degrees: Math.round(heading) })}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  bearingInfo: { alignItems: 'center' },
  bearingValue: { fontSize: 48, fontWeight: '700', color: colors.brand.dark },
  bearingLabel: { fontSize: 14, color: colors.text.muted },
  compassContainer: { alignItems: 'center', justifyContent: 'center' },
  compassOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.background.secondary,
  },
  compassDir: { position: 'absolute', fontSize: 16, fontWeight: '700', color: colors.text.primary },
  compassN: { top: 10 },
  compassS: { bottom: 10 },
  compassE: { right: 10 },
  compassW: { left: 10 },
  needle: {
    position: 'absolute',
    alignItems: 'center',
    height: 200,
    width: 20,
  },
  needleTop: {
    width: 10,
    height: 90,
    backgroundColor: colors.brand.dark,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  needleBottom: {
    width: 10,
    height: 90,
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  centerDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.mid,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accuracyDot: { width: 12, height: 12, borderRadius: 6 },
  accuracyLabel: { fontSize: 14, color: colors.text.muted },
  note: { fontSize: 12, color: colors.text.muted, textAlign: 'center' },
});
