/**
 * Purpose: Screen 13 — Moon Phase: visual moon animation, current phase
 * Inputs: Moon phase data from pc_moon_phase via GraphQL; current Hijri date
 * Outputs: Visual moon phase display (SVG-free, StyleSheet-based); phase name and illumination
 * Constraints: react-native-svgs available but complex; use View-based moon visual; D-pad back
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MoonPhase } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';

type MoonNavProp = StackNavigationProp<RootStackParamList, 'MoonPhase'>;

// Simplified moon phase calculation from Julian Day
function getCurrentMoonPhase(): MoonPhase {
  const now = new Date();
  const jd = now.getTime() / 86400000 + 2440587.5;
  // Synodic period = 29.53059 days
  const synodic = 29.53059;
  const knownNewMoon = 2451549.5; // Jan 6, 2000 new moon
  const daysSince = jd - knownNewMoon;
  const cycleDay = ((daysSince % synodic) + synodic) % synodic;
  const illumination = 0.5 * (1 - Math.cos((cycleDay / synodic) * 2 * Math.PI));

  let phase: MoonPhase['phase'];
  if (cycleDay < 1.85) phase = 'new';
  else if (cycleDay < 7.38) phase = 'waxing_crescent';
  else if (cycleDay < 9.22) phase = 'first_quarter';
  else if (cycleDay < 14.77) phase = 'waxing_gibbous';
  else if (cycleDay < 16.61) phase = 'full';
  else if (cycleDay < 22.15) phase = 'waning_gibbous';
  else if (cycleDay < 23.99) phase = 'last_quarter';
  else phase = 'waning_crescent';

  const hijriDay = Math.floor(cycleDay) + 1;

  return {
    phase,
    illumination: Math.round(illumination * 100) / 100,
    ageInDays: Math.round(cycleDay * 10) / 10,
    hijriDay,
  };
}

const PHASE_NAMES: Record<MoonPhase['phase'], { en: string; ar: string }> = {
  new:             { en: 'New Moon',         ar: 'الهلال الجديد' },
  waxing_crescent: { en: 'Waxing Crescent',  ar: 'الهلال المتصاعد' },
  first_quarter:   { en: 'First Quarter',    ar: 'التربيع الأول' },
  waxing_gibbous:  { en: 'Waxing Gibbous',   ar: 'الأحدب المتصاعد' },
  full:            { en: 'Full Moon',         ar: 'البدر' },
  waning_gibbous:  { en: 'Waning Gibbous',   ar: 'الأحدب المتناقص' },
  last_quarter:    { en: 'Last Quarter',      ar: 'التربيع الأخير' },
  waning_crescent: { en: 'Waning Crescent',  ar: 'الهلال المتناقص' },
};

// Simple View-based moon visual — circle with dark/light overlay
function MoonVisual({ illumination, phase }: Pick<MoonPhase, 'illumination' | 'phase'>): React.JSX.Element {
  const isWaxing = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous'].includes(phase);

  return (
    <View style={moonStyles.container}>
      {/* Full moon disc */}
      <View style={moonStyles.disc}>
        {/* Dark overlay representing shadow */}
        {phase !== 'full' && phase !== 'new' && (
          <View
            style={[
              moonStyles.shadow,
              isWaxing ? moonStyles.shadowLeft : moonStyles.shadowRight,
              { width: `${(1 - illumination) * 100}%` },
            ]}
          />
        )}
        {phase === 'new' && <View style={moonStyles.fullShadow} />}
      </View>
      {/* Craters / texture suggestion */}
      <View style={moonStyles.crater1} />
      <View style={moonStyles.crater2} />
    </View>
  );
}

const moonStyles = StyleSheet.create({
  container: { width: 300, height: 300, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  disc: {
    width: 280, height: 280, borderRadius: 140, backgroundColor: '#C9F27A',
    overflow: 'hidden', flexDirection: 'row',
  },
  shadow: { height: '100%', backgroundColor: '#0D2F17', position: 'absolute', top: 0 },
  shadowLeft: { left: 0 },
  shadowRight: { right: 0 },
  fullShadow: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#0D2F17' },
  crater1: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)', top: 80, left: 120,
  },
  crater2: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.08)', top: 150, left: 80,
  },
});

export default function MoonPhaseScreen(): React.JSX.Element {
  const navigation = useNavigation<MoonNavProp>();
  const backRef = useRef<TouchableHighlight>(null);
  const moonData = getCurrentMoonPhase();
  const phaseNames = PHASE_NAMES[moonData.phase];

  return (
    <TvScreenWrapper title="Moon Phase" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        <MoonVisual illumination={moonData.illumination} phase={moonData.phase} />

        <Text style={styles.phaseAr}>{phaseNames.ar}</Text>
        <Text style={styles.phaseEn}>{phaseNames.en}</Text>

        <View style={styles.dataRow}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Illumination</Text>
            <Text style={styles.dataValue}>{Math.round(moonData.illumination * 100)}%</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Moon Age</Text>
            <Text style={styles.dataValue}>{moonData.ageInDays} days</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Hijri Day</Text>
            <Text style={styles.dataValue}>{moonData.hijriDay}</Text>
          </View>
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
  root: { flex: 1, backgroundColor: '#0D2F17', alignItems: 'center', justifyContent: 'center', padding: 80 },
  phaseAr: { color: '#C9F27A', fontSize: 48, writingDirection: 'rtl', fontWeight: '700', marginTop: 32 },
  phaseEn: { color: '#FFFFFF', fontSize: 36, marginTop: 8, marginBottom: 32 },
  dataRow: { flexDirection: 'row', gap: 60, marginBottom: 48 },
  dataItem: { alignItems: 'center' },
  dataLabel: { color: '#79C24C', fontSize: 22, marginBottom: 8 },
  dataValue: { color: '#C9F27A', fontSize: 40, fontWeight: '700' },
  backBtn: {
    paddingHorizontal: 60, paddingVertical: 24, backgroundColor: '#1E5E2F',
    borderRadius: 12, minHeight: 88, justifyContent: 'center',
  },
  backBtnText: { color: '#C9F27A', fontSize: 28, fontWeight: '600' },
});
