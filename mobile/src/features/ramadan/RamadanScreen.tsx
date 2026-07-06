/**
 * Purpose: Ramadan tracker — iftar/suhoor times with a live countdown, day counter,
 *   special Ramadan duas.
 * Inputs: Prayer times (for Fajr=suhoor end, Maghrib=iftar) computed from the user's
 *   real settings (method/madhab/high-lat rule/custom angles), Hijri date via the
 *   shared @umalqura/core-backed module for Ramadan detection.
 * Outputs: RamadanScreen — Feature 11 of 20.
 * Constraints: Islamic content gate — special Ramadan duas from Hisn al-Muslim.
 *   Suhoor end = Fajr time. Iftar = Maghrib time. Day counter respects the real
 *   29-vs-30-day Ramadan length (previously hardcoded to /30 regardless of the
 *   actual month length).
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-11-ramadan
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { useSettingsStore, useActiveLocation } from '../settings/store/useSettingsStore';
import { calculatePrayerTimes } from '../../lib/prayer-calc';
import { resolveTimezoneOffset } from '../../lib/timezone';
import { gregorianToHijri, RAMADAN_MONTH } from '../../lib/hijri';
import type { CalcMethodKey } from '../../constants/methods';

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0m 0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

// Ramadan duas — Hisn al-Muslim sources
const RAMADAN_DUAS = [
  {
    id: 'iftar-dua',
    // Source: Hisn al-Muslim #185 — du'a at breaking fast
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allahumma laka sumtu wa ala rizqika aftartu',
    translation: 'O Allah, I fasted for You and I break my fast with Your sustenance',
    source: 'Hisn al-Muslim #185 (Abu Dawud 2358)',
    occasion: 'At iftar time',
  },
  {
    id: 'tarawih-intention',
    // Source: General Islamic practice — intention for Tarawih
    arabic: 'نَوَيْتُ صَلَاةَ التَّرَاوِيحِ لِلَّهِ تَعَالَى',
    transliteration: 'Nawaytu salata tarawih lillahi ta\'ala',
    translation: 'I intend to pray Tarawih for the sake of Allah the Exalted',
    source: 'General Islamic practice — intention (niyyah)',
    occasion: 'Before Tarawih',
  },
];

export default function RamadanScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const settings = useSettingsStore();
  const location = useActiveLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const today = now;
  const hijriDate = useMemo(() => gregorianToHijri(today, settings.hijriDayAdjustment), [today, settings.hijriDayAdjustment]);
  const isRamadan = hijriDate.month === RAMADAN_MONTH;
  const ramadanDay = isRamadan ? hijriDate.day : null;
  const ramadanDaysTotal = isRamadan ? hijriDate.daysInMonth : null;

  const prayerTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(
      today,
      location.latitude,
      location.longitude,
      resolveTimezoneOffset(location.timezone, today),
      settings.method as CalcMethodKey,
      settings.madhab,
      settings.highLatRule,
      settings.method === 'Custom'
        ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
        : undefined,
      settings.prayerMinuteAdjustments,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute each tick (`today`) + on settings/location change
  }, [location, settings.method, settings.madhab, settings.highLatRule, settings.customFajrAngle, settings.customIshaAngle, settings.prayerMinuteAdjustments, today.toDateString()]);

  // Live Iftar/Suhoor countdown — the category's marquee Ramadan feature.
  const countdown = useMemo(() => {
    if (!prayerTimes) return null;
    const nowMs = now.getTime();
    if (nowMs < prayerTimes.Maghrib.getTime()) {
      return { label: 'Iftar in', seconds: (prayerTimes.Maghrib.getTime() - nowMs) / 1000 };
    }
    // After Maghrib: count down to tomorrow's Suhoor end (Fajr).
    const tomorrowFajr = new Date(prayerTimes.Fajr);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    return { label: 'Suhoor ends in', seconds: (tomorrowFajr.getTime() - nowMs) / 1000 };
  }, [prayerTimes, now]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Month status */}
        <View style={styles.statusCard}>
          {isRamadan ? (
            <>
              <Text style={styles.ramadanTitle} accessibilityRole="header">
                رَمَضَان مُبَارَك
              </Text>
              <Text style={styles.ramadanSubtitle}>Ramadan Mubarak</Text>
              {ramadanDay && (
                <Text style={styles.dayCounter} accessibilityLabel={`Day ${ramadanDay} of ${ramadanDaysTotal} of Ramadan`}>
                  Day {ramadanDay} of {ramadanDaysTotal}
                </Text>
              )}
              {countdown && (
                <Text style={styles.countdown} accessibilityLabel={`${countdown.label} ${formatCountdown(countdown.seconds)}`}>
                  {countdown.label} {formatCountdown(countdown.seconds)}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.notRamadan} accessibilityRole="text">
              Ramadan is not currently active.{'\n'}
              Current Hijri month: {hijriDate.monthName} ({hijriDate.month}/12)
            </Text>
          )}
        </View>

        {/* Times */}
        {prayerTimes && (
          <View style={styles.timesCard}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Today's Times</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Suhoor Ends (Fajr)</Text>
              <Text
                style={styles.timeValue}
                accessibilityLabel={`Suhoor ends at ${formatTime(prayerTimes.Fajr)}`}
              >
                {formatTime(prayerTimes.Fajr)}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Iftar (Maghrib)</Text>
              <Text
                style={styles.timeValue}
                accessibilityLabel={`Iftar at ${formatTime(prayerTimes.Maghrib)}`}
              >
                {formatTime(prayerTimes.Maghrib)}
              </Text>
            </View>
          </View>
        )}
        {!location && (
          <Text style={styles.noLocation}>Set your location in Settings to see prayer times.</Text>
        )}

        {/* Ramadan duas */}
        <Text style={styles.sectionTitle} accessibilityRole="header">Ramadan Duas</Text>
        {RAMADAN_DUAS.map((dua) => (
          <View key={dua.id} style={styles.duaCard}>
            <Text style={styles.occasion}>{dua.occasion}</Text>
            <Text
              style={styles.arabicText}
              accessibilityLabel={`Arabic: ${dua.transliteration}`}
            >
              {dua.arabic}
            </Text>
            <Text style={styles.transliteration}>{dua.transliteration}</Text>
            <Text style={styles.translation}>{dua.translation}</Text>
            <Text style={styles.source}>{dua.source}</Text>
          </View>
        ))}

        {/* Laylat al-Qadr note */}
        {isRamadan && ramadanDay && ramadanDay >= 21 && (
          <View style={styles.specialCard}>
            <Text style={styles.specialTitle}>Laylat al-Qadr</Text>
            <Text style={styles.specialText}>
              We are in the last ten nights of Ramadan. Increase worship, especially on odd nights (21, 23, 25, 27, 29).
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  statusCard: {
    backgroundColor: colors.brand.dark,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  ramadanTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brand.light,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 44,
  },
  ramadanSubtitle: { fontSize: 16, color: colors.brand.light + 'CC', marginTop: 4 },
  dayCounter: { fontSize: 20, color: colors.brand.light, fontWeight: '600', marginTop: 8 },
  countdown: { fontSize: 15, color: colors.brand.light, fontWeight: '700', marginTop: 12, opacity: 0.9 },
  notRamadan: { fontSize: 16, color: colors.text.inverse, textAlign: 'center', lineHeight: 26 },
  timesCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 44,
    alignItems: 'center',
  },
  timeLabel: { fontSize: 15, color: colors.text.secondary },
  timeValue: { fontSize: 16, fontWeight: '700', color: colors.brand.dark },
  noLocation: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  duaCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  occasion: { fontSize: 12, color: colors.brand.mid, fontWeight: '700', marginBottom: 8 },
  arabicText: {
    fontSize: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    fontWeight: '500',
    lineHeight: 34,
    marginBottom: 6,
  },
  transliteration: { fontSize: 14, fontStyle: 'italic', color: colors.text.secondary, marginBottom: 4 },
  translation: { fontSize: 14, color: colors.text.primary, lineHeight: 22 },
  source: { fontSize: 12, color: colors.text.muted, marginTop: 4, fontStyle: 'italic' },
  specialCard: {
    backgroundColor: colors.brand.dark + 'EE',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  specialTitle: { fontSize: 16, fontWeight: '700', color: colors.brand.light, marginBottom: 6 },
  specialText: { fontSize: 14, color: colors.brand.light + 'CC', lineHeight: 22 },
});
