/**
 * Purpose: Screen 12 — Ramadan Special: countdown to iftar/suhoor, full-screen mode
 * Inputs: Prayer times (fajr=suhoor end, maghrib=iftar); Ramadan dates from pc_islamic_event
 * Outputs: Full-screen Ramadan display with live countdown; D-pad back
 * Constraints: Full-screen mode for masjid display; min 72pt text; large countdown
 * SPORT: praycalc/tv screens
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePrayerStore } from '../stores/prayerStore';
import TvScreenWrapper from '../components/TvScreenWrapper';

type RamadanNavProp = StackNavigationProp<RootStackParamList, 'Ramadan'>;

function getCountdownTarget(fajr: string, maghrib: string): { label: string; targetMs: number } {
  const now = new Date();
  const nowMs = now.getTime();

  const [fajrH, fajrM] = fajr.split(':').map(Number);
  const [maghribH, maghribM] = maghrib.split(':').map(Number);

  // Above the Arctic Circle Fajr or Maghrib can be "--:--" on a given date. Parsing that
  // gives NaN, `setHours(NaN, NaN)` produces an Invalid Date, and the countdown renders
  // "NaN:NaN:NaN" (PKG-02). NaN targetMs is the caller's signal to hide the countdown.
  if (![fajrH, fajrM, maghribH, maghribM].every((n) => Number.isFinite(n))) {
    return { label: 'Fasting times unavailable at this latitude today', targetMs: NaN };
  }

  const fajrToday = new Date(now);
  fajrToday.setHours(fajrH, fajrM, 0, 0);

  const maghribToday = new Date(now);
  maghribToday.setHours(maghribH, maghribM, 0, 0);

  // After maghrib (iftar) → show next suhoor countdown
  if (nowMs > maghribToday.getTime()) {
    const fajrTomorrow = new Date(fajrToday);
    fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
    return { label: 'Suhoor ends (Fajr)', targetMs: fajrTomorrow.getTime() };
  }

  // Before fajr → show suhoor countdown
  if (nowMs < fajrToday.getTime()) {
    return { label: 'Suhoor ends (Fajr)', targetMs: fajrToday.getTime() };
  }

  // Between fajr and maghrib → show iftar countdown
  return { label: 'Iftar (Maghrib)', targetMs: maghribToday.getTime() };
}

function formatCountdown(diffMs: number): string {
  // NaN reaches here when the date has no Fajr/Maghrib at this latitude (see above).
  if (!Number.isFinite(diffMs)) return '--:--:--';
  if (diffMs <= 0) return '00:00:00';
  const totalSec = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function RamadanScreen(): React.JSX.Element {
  const navigation = useNavigation<RamadanNavProp>();
  const { prayerTimes } = usePrayerStore();
  const backRef = useRef<TouchableHighlight>(null);

  const fajrTime = prayerTimes.find((p) => p.name === 'fajr')?.time ?? '05:00';
  const maghribTime = prayerTimes.find((p) => p.name === 'maghrib')?.time ?? '18:30';

  const [countdown, setCountdown] = useState('');
  const [label, setLabel] = useState('');
  const [isFasting, setIsFasting] = useState(false);

  useEffect(() => {
    const update = (): void => {
      const { label: lbl, targetMs } = getCountdownTarget(fajrTime, maghribTime);
      const now = Date.now();
      const diff = targetMs - now;

      // Determine fasting state
      const [fajrH, fajrM] = fajrTime.split(':').map(Number);
      const [maghribH, maghribM] = maghribTime.split(':').map(Number);
      const nowDate = new Date();
      const afterFajr = nowDate.getHours() * 60 + nowDate.getMinutes() >= fajrH * 60 + fajrM;
      const beforeMaghrib = nowDate.getHours() * 60 + nowDate.getMinutes() < maghribH * 60 + maghribM;
      setIsFasting(afterFajr && beforeMaghrib);

      setLabel(lbl);
      setCountdown(formatCountdown(diff));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [fajrTime, maghribTime]);

  return (
    <TvScreenWrapper title="Ramadan" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        {/* Arabic heading */}
        <Text style={styles.arabicHeading}>{'رمضان كريم'}</Text>
        <Text style={styles.subtitle}>Ramadan Mubarak</Text>

        {/* Fasting status */}
        <View style={[styles.statusBadge, isFasting ? styles.statusFasting : styles.statusBreaking]}>
          <Text style={styles.statusText}>{isFasting ? 'Fasting' : 'Not Fasting'}</Text>
        </View>

        {/* Main countdown */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>{label}</Text>
          <Text style={styles.countdownValue}>{countdown}</Text>
        </View>

        {/* Suhoor / Iftar times */}
        <View style={styles.timesRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeBlockAr}>{'السحور'}</Text>
            <Text style={styles.timeBlockLabel}>Suhoor ends</Text>
            <Text style={styles.timeBlockTime}>{fajrTime}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeBlockAr}>{'الإفطار'}</Text>
            <Text style={styles.timeBlockLabel}>Iftar</Text>
            <Text style={styles.timeBlockTime}>{maghribTime}</Text>
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
  root: {
    flex: 1, backgroundColor: '#0D2F17', alignItems: 'center', justifyContent: 'center', padding: 80,
  },
  arabicHeading: {
    color: '#C9F27A', fontSize: 72, fontWeight: '800', writingDirection: 'rtl', marginBottom: 8,
  },
  subtitle: { color: '#79C24C', fontSize: 36, marginBottom: 32 },
  statusBadge: {
    paddingHorizontal: 48, paddingVertical: 16, borderRadius: 40, marginBottom: 40,
  },
  statusFasting: { backgroundColor: '#1E5E2F' },
  statusBreaking: { backgroundColor: '#0D2F17', borderWidth: 2, borderColor: '#1E5E2F' },
  statusText: { color: '#C9F27A', fontSize: 28, fontWeight: '700', letterSpacing: 2 },
  countdownContainer: { alignItems: 'center', marginBottom: 48 },
  countdownLabel: { color: '#79C24C', fontSize: 32, marginBottom: 8 },
  countdownValue: { color: '#C9F27A', fontSize: 96, fontWeight: '300', letterSpacing: 8 },
  timesRow: { flexDirection: 'row', gap: 80, marginBottom: 48 },
  timeBlock: {
    alignItems: 'center', backgroundColor: '#1E5E2F', padding: 32, borderRadius: 16,
    minWidth: 200,
  },
  timeBlockAr: { color: '#C9F27A', fontSize: 36, writingDirection: 'rtl', fontWeight: '600' },
  timeBlockLabel: { color: '#FFFFFF', fontSize: 22, marginTop: 8 },
  timeBlockTime: { color: '#C9F27A', fontSize: 48, fontWeight: '700', marginTop: 8 },
  backBtn: {
    paddingHorizontal: 60, paddingVertical: 24, backgroundColor: '#1E5E2F',
    borderRadius: 12, minHeight: 88, justifyContent: 'center',
  },
  backBtnText: { color: '#C9F27A', fontSize: 28, fontWeight: '600' },
});
