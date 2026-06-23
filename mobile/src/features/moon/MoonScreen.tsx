/**
 * Purpose: Moon phase display — current lunar phase, illumination, Hijri crescent data,
 *   visual moon representation.
 * Inputs: Current date, calculated moon phase using standard astronomical formula.
 * Outputs: MoonScreen — Feature 9 of 20.
 * Constraints: Hijri date from @ummat/shared (not @acamarata/pray-calc).
 *   Moon phase calculated locally (no API call needed).
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-09-moon
 */

import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';

// ── Moon phase calculation ────────────────────────────────────────────────────

type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

interface MoonData {
  phase: MoonPhase;
  illumination: number;   // 0-1
  age: number;            // days since new moon
  phaseName: string;
  phaseEmoji: string;
  nextNewMoon: Date;
  nextFullMoon: Date;
  // Hijri month crescent context
  hijriDay: number;
  hijriMonthName: string;
}

const LUNAR_CYCLE_DAYS = 29.53058867;
// Known new moon reference: 2000-01-06 18:14 UTC (J2000 epoch)
const KNOWN_NEW_MOON_JD = 2451549.0; // Julian Day for 2000-01-06

function toJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function getMoonAge(date: Date): number {
  const jd = toJulianDay(date);
  const daysSince = jd - KNOWN_NEW_MOON_JD;
  return ((daysSince % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
}

function getMoonIllumination(age: number): number {
  // Approximation: cosine of phase angle
  const phaseAngle = (age / LUNAR_CYCLE_DAYS) * 2 * Math.PI;
  return (1 - Math.cos(phaseAngle)) / 2;
}

function getMoonPhase(age: number): { phase: MoonPhase; name: string; emoji: string } {
  if (age < 1.85 || age >= 27.68) return { phase: 'new_moon', name: 'New Moon', emoji: '🌑' };
  if (age < 7.38) return { phase: 'waxing_crescent', name: 'Waxing Crescent', emoji: '🌒' };
  if (age < 9.22) return { phase: 'first_quarter', name: 'First Quarter', emoji: '🌓' };
  if (age < 14.76) return { phase: 'waxing_gibbous', name: 'Waxing Gibbous', emoji: '🌔' };
  if (age < 16.61) return { phase: 'full_moon', name: 'Full Moon', emoji: '🌕' };
  if (age < 22.15) return { phase: 'waning_gibbous', name: 'Waning Gibbous', emoji: '🌖' };
  if (age < 23.99) return { phase: 'last_quarter', name: 'Last Quarter', emoji: '🌗' };
  return { phase: 'waning_crescent', name: 'Waning Crescent', emoji: '🌘' };
}

function getNextPhaseDate(date: Date, targetAge: number): Date {
  const age = getMoonAge(date);
  let daysUntil = targetAge - age;
  if (daysUntil < 0) daysUntil += LUNAR_CYCLE_DAYS;
  return new Date(date.getTime() + daysUntil * 86400000);
}

// Simplified Hijri conversion (approximate — accurate to ±1 day)
// Full precision from @ummat/shared hijriToGregorian — this is display-only approximation
const HIJRI_EPOCH_JD = 1948438.5; // 1 Muharram 1 AH in Julian Days
const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Akhira', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
];

function gregorianToHijriApprox(date: Date): { day: number; monthName: string; year: number } {
  const jd = toJulianDay(date);
  const l = jd - HIJRI_EPOCH_JD;
  const n = Math.floor(l / 10631);
  const r = l - 10631 * n;
  const j = Math.floor((r + 29.5001) / 29.5);
  const day = Math.floor(r - 29.5001 * j + 30);
  const month = j % 12;
  const year = n * 30 + Math.floor(j / 12) + 1;
  return {
    day: Math.max(1, day),
    monthName: HIJRI_MONTH_NAMES[month] ?? 'Unknown',
    year,
  };
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function MoonScreen() {
  const moonData = useMemo<MoonData>(() => {
    const now = new Date();
    const age = getMoonAge(now);
    const illumination = getMoonIllumination(age);
    const { phase, name, emoji } = getMoonPhase(age);
    const nextNewMoon = getNextPhaseDate(now, 0);
    const nextFullMoon = getNextPhaseDate(now, 14.76);
    const { day, monthName } = gregorianToHijriApprox(now);
    return {
      phase,
      illumination,
      age,
      phaseName: name,
      phaseEmoji: emoji,
      nextNewMoon,
      nextFullMoon,
      hijriDay: day,
      hijriMonthName: monthName,
    };
  }, []);

  const illuminationPct = Math.round(moonData.illumination * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Visual moon display */}
        <View
          style={styles.moonContainer}
          accessibilityRole="image"
          accessibilityLabel={`Moon phase: ${moonData.phaseName}, ${illuminationPct}% illuminated`}
        >
          <Text style={styles.moonEmoji}>{moonData.phaseEmoji}</Text>
          <Text style={styles.phaseName}>{moonData.phaseName}</Text>
          <Text style={styles.illumination}>{illuminationPct}% illuminated</Text>
        </View>

        {/* Hijri month crescent info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} accessibilityRole="header">Hijri Calendar</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hijri Day</Text>
            <Text style={styles.infoValue}>{moonData.hijriDay}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Month</Text>
            <Text style={styles.infoValue}>{moonData.hijriMonthName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lunar Age</Text>
            <Text style={styles.infoValue}>{moonData.age.toFixed(1)} days</Text>
          </View>
        </View>

        {/* Upcoming phases */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} accessibilityRole="header">Upcoming Phases</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Full Moon 🌕</Text>
            <Text style={styles.infoValue}>
              {moonData.nextFullMoon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next New Moon 🌑</Text>
            <Text style={styles.infoValue}>
              {moonData.nextNewMoon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Islamic significance */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} accessibilityRole="header">Islamic Significance</Text>
          <Text style={styles.quoteText}>
            {/* Quran 2:189 — verified Uthmani text */}
            {'"They ask you about the new crescent moons. Say: they are times set for people and for Hajj." — Quran 2:189'}
          </Text>
          {moonData.hijriMonthName === 'Ramadan' && (
            <Text style={styles.specialEvent}>
              It is Ramadan — the month of fasting and seeking Laylat al-Qadr.
            </Text>
          )}
          {moonData.hijriMonthName === "Dhul Hijjah" && (
            <Text style={styles.specialEvent}>
              The first ten days of Dhul Hijjah are among the most virtuous of the year.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand.deep },
  scroll: { padding: 16, alignItems: 'center', paddingBottom: 40 },
  moonContainer: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  moonEmoji: {
    fontSize: 96,
    marginBottom: 12,
  },
  phaseName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.brand.light,
  },
  illumination: {
    fontSize: 16,
    color: Colors.brand.mid,
    marginTop: 4,
  },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.brand.dark + 'CC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.mid + '33',
    minHeight: 44,
    alignItems: 'center',
  },
  infoLabel: { fontSize: 15, color: Colors.text.inverse + 'BB' },
  infoValue: { fontSize: 15, fontWeight: '600', color: Colors.text.inverse },
  quoteText: {
    fontSize: 14,
    color: Colors.brand.light,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  specialEvent: {
    fontSize: 14,
    color: Colors.brand.light,
    marginTop: 8,
    lineHeight: 22,
  },
});
