/**
 * Purpose: Screen 11 — About: app version, credits
 * Inputs: Static version info; navigation back
 * Outputs: Read-only about screen; D-pad back only
 * Constraints: min 72pt text; hasTVPreferredFocus on back button
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';

type AboutNavProp = StackNavigationProp<RootStackParamList, 'About'>;

export default function AboutScreen(): React.JSX.Element {
  const navigation = useNavigation<AboutNavProp>();
  const backRef = useRef<TouchableHighlight>(null);

  return (
    <TvScreenWrapper title="About PrayCalc TV" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.root}>
          {/* App identity */}
          <Text style={styles.appName}>PrayCalc TV</Text>
          <Text style={styles.version}>Version 0.1.0</Text>
          <Text style={styles.tagline}>Prayer times for the masjid and home screen</Text>

          <View style={styles.divider} />

          {/* Credits */}
          <Text style={styles.sectionTitle}>Credits</Text>
          <Text style={styles.creditLine}>Prayer calculation: @acamarata/pray-calc</Text>
          <Text style={styles.creditLine}>NREL Solar Position Algorithm (SPA)</Text>
          <Text style={styles.creditLine}>MSC Seasonal Method for high latitudes</Text>
          <Text style={styles.creditLine}>Islamic content: ahl us-sunnah wal-jamaah verified sources</Text>

          <View style={styles.divider} />

          {/* Mission */}
          <Text style={styles.sectionTitle}>Mission</Text>
          <Text style={styles.missionText}>
            {
              'Build technology that helps Muslims live their deen, connect with their ummah, and make Islamic knowledge accessible to the world. Free, authentic, community-first.'
            }
          </Text>

          <View style={styles.divider} />

          {/* Legal */}
          <Text style={styles.legalText}>
            © 2026 Ummeco. Open source under MIT License. Islamic content provided
            for informational purposes — consult a scholar for religious rulings.
          </Text>

          <TouchableHighlight
            ref={backRef}
            hasTVPreferredFocus={true}
            accessible={true}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            underlayColor="#1E5E2F"
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  root: {
    flex: 1, backgroundColor: '#0D2F17', padding: 80, alignItems: 'center',
  },
  appName: { color: '#C9F27A', fontSize: 64, fontWeight: '800', letterSpacing: 2 },
  version: { color: '#79C24C', fontSize: 32, marginTop: 8 },
  tagline: { color: '#FFFFFF', fontSize: 28, marginTop: 12, textAlign: 'center' },
  divider: { width: '60%', height: 1, backgroundColor: '#1E5E2F', marginVertical: 40 },
  sectionTitle: { color: '#C9F27A', fontSize: 36, fontWeight: '700', marginBottom: 16 },
  creditLine: { color: '#FFFFFF', fontSize: 24, lineHeight: 40, textAlign: 'center' },
  missionText: {
    color: '#FFFFFF', fontSize: 26, lineHeight: 42, textAlign: 'center',
    paddingHorizontal: 60,
  },
  legalText: {
    color: '#79C24C', fontSize: 20, lineHeight: 32, textAlign: 'center',
    paddingHorizontal: 60, marginTop: 16,
  },
  backBtn: {
    marginTop: 48, paddingHorizontal: 60, paddingVertical: 24,
    backgroundColor: '#1E5E2F', borderRadius: 12, minHeight: 88, justifyContent: 'center',
  },
  backBtnText: { color: '#C9F27A', fontSize: 28, fontWeight: '600' },
});
