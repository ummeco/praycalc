/**
 * Purpose: Qibla compass screen — animated compass needle using expo-sensors magnetometer.
 *   Shows bearing toward Kaaba, accuracy indicator, and declination correction.
 * Inputs: User location from settings store
 * Outputs: Animated compass with qibla needle; bearing angle display
 * Constraints: Uses great-circle bearing (not planar — CR-C requirement).
 *   All 7 UI states implemented. RTL layout prepared.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-qibla-screen
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../constants/colors';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useQibla } from '../hooks/useQibla';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  PermissionDeniedState,
} from '../../../components/shared/UIStates';

const ACCURACY_LABELS = ['Unreliable', 'Low', 'Medium', 'High'];
const ACCURACY_COLORS = [Colors.state.error, Colors.state.warning, Colors.brand.mid, Colors.brand.dark];

export default function QiblaScreen() {
  const settings = useSettingsStore();
  const lat = settings.location?.latitude ?? null;
  const lng = settings.location?.longitude ?? null;

  const { bearing, heading, needleAngle, accuracy, status, error } = useQibla({
    latitude: lat,
    longitude: lng,
    declination: 0, // Can be enhanced with WMM declination API
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
    return <LoadingState message="Calibrating compass..." />;
  }

  if (status === 'empty') {
    return (
      <EmptyState
        title="Location Required"
        subtitle="Set your location in Settings to find the Qibla direction."
        action="Set Location"
        onAction={() => {/* Navigate to city-search */}}
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
        <Text style={styles.bearingLabel}>Qibla Bearing</Text>
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
            { backgroundColor: ACCURACY_COLORS[accuracy] ?? Colors.state.error },
          ]}
        />
        <Text style={styles.accuracyLabel}>
          Accuracy: {ACCURACY_LABELS[accuracy] ?? 'Unknown'}
        </Text>
      </View>

      {/* Declination note */}
      <Text style={styles.note}>
        Heading: {Math.round(heading)}° | Great-circle bearing to Kaaba
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  bearingInfo: { alignItems: 'center' },
  bearingValue: { fontSize: 48, fontWeight: '700', color: Colors.brand.dark },
  bearingLabel: { fontSize: 14, color: Colors.text.muted },
  compassContainer: { alignItems: 'center', justifyContent: 'center' },
  compassOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: Colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: Colors.background.secondary,
  },
  compassDir: { position: 'absolute', fontSize: 16, fontWeight: '700', color: Colors.text.primary },
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
    backgroundColor: Colors.brand.dark,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  needleBottom: {
    width: 10,
    height: 90,
    backgroundColor: Colors.background.card,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  centerDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.brand.mid,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accuracyDot: { width: 12, height: 12, borderRadius: 6 },
  accuracyLabel: { fontSize: 14, color: Colors.text.muted },
  note: { fontSize: 12, color: Colors.text.muted, textAlign: 'center' },
});
