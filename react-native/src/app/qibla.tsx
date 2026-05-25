/**
 * Purpose: Qibla direction screen with animated compass rose.
 * Inputs: useLocation(), useQibla() hooks
 * Outputs: QiblaCompass component + bearing/distance info
 * Constraints: Falls back to static bearing if magnetometer unavailable.
 *   Shows calibration tip when heading is noisy (simulated environments).
 * SPORT: app/qibla.tsx
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { useQibla } from '../hooks/useQibla';
import { QiblaCompass } from '../components/QiblaCompass';

export default function QiblaScreen() {
  const { location, loading } = useLocation();
  const qibla = useQibla(location);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Qibla Direction</Text>
        <Text style={styles.subtitle}>The direction of prayer (toward Mecca)</Text>

        {loading && !qibla && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#34a853" />
            <Text style={styles.loadingText}>Locating…</Text>
          </View>
        )}

        {qibla && <QiblaCompass qibla={qibla} />}

        {qibla?.compassHeading === -1 && (
          <View style={styles.calibrationBanner}>
            <Text style={styles.calibrationText}>
              🧭 Compass unavailable — showing static bearing only.
              {'\n'}On a physical device, move the phone in a figure-8 to calibrate.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d2015',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 24,
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: -16,
  },
  center: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 40,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  calibrationBanner: {
    backgroundColor: 'rgba(255,200,60,0.12)',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    marginHorizontal: 16,
  },
  calibrationText: {
    color: 'rgba(255,220,100,0.85)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
