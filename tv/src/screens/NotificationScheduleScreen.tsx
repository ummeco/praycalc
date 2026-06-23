/**
 * Purpose: Screen 7 — Notification Schedule: visual prayer time blocks for the day
 * Inputs: Prayer times from prayerStore; current time
 * Outputs: Timeline view of 24-hour day with prayer time blocks; D-pad navigation
 * Constraints: Read-only visual display; no touch required; large text for 10-foot UI
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PrayerName } from '../types';
import { usePrayerStore } from '../stores/prayerStore';
import TvScreenWrapper from '../components/TvScreenWrapper';

type NotifNavProp = StackNavigationProp<RootStackParamList, 'NotificationSchedule'>;

const PRAYER_COLORS: Record<PrayerName, string> = {
  fajr:    '#1E5E2F',
  sunrise: '#79C24C',
  dhuhr:   '#C9F27A',
  asr:     '#79C24C',
  maghrib: '#1E5E2F',
  isha:    '#0D2F17',
};

const PRAYER_LABELS: Record<PrayerName, { en: string; ar: string }> = {
  fajr:    { en: 'Fajr',    ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr:   { en: 'Dhuhr',   ar: 'الظهر' },
  asr:     { en: 'Asr',     ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha:    { en: 'Isha',    ar: 'العشاء' },
};

export default function NotificationScheduleScreen(): React.JSX.Element {
  const navigation = useNavigation<NotifNavProp>();
  const { prayerTimes, nextPrayer } = usePrayerStore();
  const backRef = useRef<TouchableHighlight>(null);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToPercent(minutes: number): number {
    return (minutes / (24 * 60)) * 100;
  }

  return (
    <TvScreenWrapper title="Prayer Schedule" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        {/* Timeline */}
        <View style={styles.timeline}>
          {/* 24h bar */}
          <View style={styles.timeBar}>
            {/* Current time indicator */}
            <View
              style={[
                styles.nowIndicator,
                { left: `${minutesToPercent(nowMinutes)}%` as unknown as number },
              ]}
            />

            {/* Prayer markers */}
            {prayerTimes.map((prayer) => {
              const minutes = timeToMinutes(prayer.time);
              const isNext = prayer.name === nextPrayer;
              return (
                <View
                  key={prayer.name}
                  style={[
                    styles.prayerMarker,
                    { left: `${minutesToPercent(minutes)}%` as unknown as number },
                    isNext && styles.prayerMarkerNext,
                  ]}
                />
              );
            })}
          </View>

          {/* Hour labels */}
          <View style={styles.hourLabels}>
            {[0, 6, 12, 18, 24].map((h) => (
              <Text key={h} style={styles.hourLabel}>
                {h === 24 ? '24:00' : `${h.toString().padStart(2, '0')}:00`}
              </Text>
            ))}
          </View>
        </View>

        {/* Prayer time blocks */}
        <View style={styles.blocksGrid}>
          {prayerTimes.map((prayer) => {
            const isNext = prayer.name === nextPrayer;
            return (
              <View
                key={prayer.name}
                style={[
                  styles.block,
                  { backgroundColor: PRAYER_COLORS[prayer.name] },
                  isNext && styles.blockNext,
                ]}
              >
                <Text style={styles.blockNameAr}>{PRAYER_LABELS[prayer.name].ar}</Text>
                <Text style={styles.blockName}>{PRAYER_LABELS[prayer.name].en}</Text>
                <Text style={styles.blockTime}>{prayer.time}</Text>
                {isNext && <Text style={styles.blockNextLabel}>NEXT</Text>}
              </View>
            );
          })}
        </View>

        {/* Back button */}
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
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 60 },
  timeline: { marginBottom: 48 },
  timeBar: {
    height: 16,
    backgroundColor: '#1E5E2F',
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
  },
  nowIndicator: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 24,
    backgroundColor: '#C9F27A',
    borderRadius: 2,
  },
  prayerMarker: {
    position: 'absolute',
    top: -8,
    width: 8,
    height: 32,
    backgroundColor: '#79C24C',
    borderRadius: 4,
  },
  prayerMarkerNext: { backgroundColor: '#C9F27A', width: 12, height: 40 },
  hourLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  hourLabel: { color: '#79C24C', fontSize: 20 },
  blocksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    flex: 1,
    alignItems: 'flex-start',
  },
  block: {
    width: 180,
    height: 140,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  blockNext: { borderColor: '#C9F27A' },
  blockNameAr: { color: '#C9F27A', fontSize: 28, writingDirection: 'rtl', fontWeight: '600' },
  blockName: { color: '#FFFFFF', fontSize: 20, marginTop: 4 },
  blockTime: { color: '#C9F27A', fontSize: 28, fontWeight: '700', marginTop: 8 },
  blockNextLabel: { color: '#C9F27A', fontSize: 18, fontWeight: '800', marginTop: 4, letterSpacing: 2 },
  backBtn: {
    alignSelf: 'center',
    paddingHorizontal: 60,
    paddingVertical: 24,
    backgroundColor: '#1E5E2F',
    borderRadius: 12,
    minHeight: 88,
    justifyContent: 'center',
    marginTop: 24,
  },
  backBtnText: { color: '#C9F27A', fontSize: 28, fontWeight: '600' },
});
