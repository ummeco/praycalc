/**
 * Purpose: Ramadan tracker — iftar/suhoor times, day counter, special Ramadan duas.
 * Inputs: Prayer times (for Fajr=suhoor end, Maghrib=iftar), Hijri date for Ramadan detection.
 * Outputs: RamadanScreen — Feature 11 of 20.
 * Constraints: Islamic content gate — special Ramadan duas from Hisn al-Muslim.
 *   Suhoor end = Fajr time. Iftar = Maghrib time.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-11-ramadan
 */

import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import { calculatePrayerTimes } from '../../lib/prayer-calc';

// Hijri month 9 = Ramadan
const RAMADAN_MONTH = 9;
// Approximate Hijri month using moon-age calculation
function estimateHijriMonth(date: Date): number {
  const LUNAR_CYCLE = 29.53058867;
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const totalMonths = Math.floor(daysSince / LUNAR_CYCLE);
  // Month 0 = Muharram 1421 AH (approx); map to 1-12
  return ((totalMonths + 2) % 12) + 1;
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
  const { location } = useSettingsStore();
  const today = new Date();
  const hijriMonth = estimateHijriMonth(today);
  const isRamadan = hijriMonth === RAMADAN_MONTH;

  const prayerTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(
      today,
      location.latitude,
      location.longitude,
      parseFloat(location.timezone) || 0,
      'MWL',
    );
  }, [location]);

  // Ramadan day counter (approx. from Hijri day 1 of Ramadan)
  const ramadanDay = isRamadan
    ? (() => {
        const LUNAR_CYCLE = 29.53058867;
        const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
        const moonAge = ((today.getTime() - KNOWN_NEW_MOON) / 86400000) % LUNAR_CYCLE;
        return Math.max(1, Math.floor(moonAge) + 1);
      })()
    : null;

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
                <Text style={styles.dayCounter} accessibilityLabel={`Day ${ramadanDay} of Ramadan`}>
                  Day {ramadanDay} of 30
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.notRamadan} accessibilityRole="text">
              Ramadan is not currently active.{'\n'}
              Current estimated Hijri month: {hijriMonth}/12
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  statusCard: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  ramadanTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.brand.light,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 44,
  },
  ramadanSubtitle: { fontSize: 16, color: Colors.brand.light + 'CC', marginTop: 4 },
  dayCounter: { fontSize: 20, color: Colors.brand.light, fontWeight: '600', marginTop: 8 },
  notRamadan: { fontSize: 16, color: Colors.text.inverse, textAlign: 'center', lineHeight: 26 },
  timesCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.card,
    minHeight: 44,
    alignItems: 'center',
  },
  timeLabel: { fontSize: 15, color: Colors.text.secondary },
  timeValue: { fontSize: 16, fontWeight: '700', color: Colors.brand.dark },
  noLocation: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  duaCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  occasion: { fontSize: 12, color: Colors.brand.mid, fontWeight: '700', marginBottom: 8 },
  arabicText: {
    fontSize: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.brand.dark,
    fontWeight: '500',
    lineHeight: 34,
    marginBottom: 6,
  },
  transliteration: { fontSize: 14, fontStyle: 'italic', color: Colors.text.secondary, marginBottom: 4 },
  translation: { fontSize: 14, color: Colors.text.primary, lineHeight: 22 },
  source: { fontSize: 12, color: Colors.text.muted, marginTop: 4, fontStyle: 'italic' },
  specialCard: {
    backgroundColor: Colors.brand.dark + 'EE',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  specialTitle: { fontSize: 16, fontWeight: '700', color: Colors.brand.light, marginBottom: 6 },
  specialText: { fontSize: 14, color: Colors.brand.light + 'CC', lineHeight: 22 },
});
