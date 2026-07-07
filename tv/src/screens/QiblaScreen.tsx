/**
 * Purpose: Screen 2 — Qibla Direction: compass bearing, city name, large text display for TV
 * Inputs: lat/lng from settings — bearing computed locally (great-circle); no network
 * Outputs: Large bearing display + directional text; D-pad back navigation
 * Constraints: TV has no compass sensor; bearing displayed as computed value; min 72pt text
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import TvScreenWrapper from '../components/TvScreenWrapper';

type QiblaNavProp = StackNavigationProp<RootStackParamList, 'Qibla'>;

function getQiblaDirection(bearing: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(bearing / 45) % 8];
}

// Simplified Qibla bearing calculation using great-circle formula
function computeQiblaBearing(lat: number, lon: number): number {
  const MECCA_LAT = 21.3891 * (Math.PI / 180);
  const MECCA_LON = 39.8579 * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const lonDiff = MECCA_LON - lon * (Math.PI / 180);
  const y = Math.sin(lonDiff) * Math.cos(MECCA_LAT);
  const x =
    Math.cos(latRad) * Math.sin(MECCA_LAT) -
    Math.sin(latRad) * Math.cos(MECCA_LAT) * Math.cos(lonDiff);
  const bearing = ((Math.atan2(y, x) * (180 / Math.PI)) + 360) % 360;
  return Math.round(bearing);
}

export default function QiblaScreen(): React.JSX.Element {
  const navigation = useNavigation<QiblaNavProp>();
  const { settings } = useSettingsStore();
  const backRef = useRef<TouchableHighlight>(null);

  const bearing = computeQiblaBearing(settings.latitude, settings.longitude);
  const direction = getQiblaDirection(bearing);

  return (
    <TvScreenWrapper
      title="Qibla Direction"
      showBackButton
      onBack={() => navigation.goBack()}
    >
      <View style={styles.root}>
        <Text style={styles.cityLabel}>{settings.cityName}</Text>

        {/* Large compass bearing display */}
        <View style={styles.bearingContainer}>
          <Text style={styles.bearingValue}>{bearing}°</Text>
          <Text style={styles.directionLabel}>{direction}</Text>
        </View>

        {/* Arabic direction text */}
        <Text style={styles.arabicLabel}>{'اتجاه القبلة'}</Text>
        <Text style={styles.meccaLabel}>toward Mecca · نحو مكة المكرمة</Text>

        {/* Compass rose (simplified SVG-free representation) */}
        <View style={styles.compassRose}>
          <Text style={styles.compassN}>N</Text>
          <View style={styles.compassRow}>
            <Text style={styles.compassNS}>W</Text>
            <View style={styles.compassCenter}>
              <View
                style={[
                  styles.compassNeedle,
                  { transform: [{ rotate: `${bearing}deg` }] },
                ]}
              />
            </View>
            <Text style={styles.compassNS}>E</Text>
          </View>
          <Text style={styles.compassN}>S</Text>
        </View>

        <TouchableHighlight
          ref={backRef}
          hasTVPreferredFocus={true}
          accessible={true}
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          underlayColor="#1E5E2F"
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableHighlight>
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: '#0D2F17',
  },
  cityLabel: {
    color: '#79C24C',
    fontSize: 36,
    marginBottom: 24,
  },
  bearingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bearingValue: {
    color: '#C9F27A',
    fontSize: 120,
    fontWeight: '700',
    letterSpacing: 4,
  },
  directionLabel: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '300',
  },
  arabicLabel: {
    color: '#C9F27A',
    fontSize: 48,
    writingDirection: 'rtl',
    marginTop: 16,
  },
  meccaLabel: {
    color: '#79C24C',
    fontSize: 28,
    marginTop: 8,
    marginBottom: 40,
  },
  compassRose: {
    alignItems: 'center',
    marginBottom: 40,
  },
  compassN: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
  },
  compassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  compassNS: {
    color: '#79C24C',
    fontSize: 28,
    fontWeight: '600',
  },
  compassCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1E5E2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassNeedle: {
    width: 4,
    height: 80,
    backgroundColor: '#C9F27A',
    borderRadius: 2,
  },
  backBtn: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    backgroundColor: '#1E5E2F',
    borderRadius: 12,
    minHeight: 88,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '600',
  },
});
