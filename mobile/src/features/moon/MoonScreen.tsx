/**
 * Purpose: Moon phase display — current lunar phase, illumination, Hijri crescent data,
 *   visual moon representation.
 * Inputs: Current date, calculated moon phase using standard astronomical formula.
 * Outputs: MoonScreen — Feature 9 of 20.
 * Constraints: Hijri date via src/lib/hijri (@umalqura/core) — the single shared Hijri
 *   source app-wide, replacing this screen's former independent ±1-day approximation.
 *   Moon phase (illumination/age) calculated locally — no API call needed.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-09-moon
 */

import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import i18next, { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { gregorianToHijri, RAMADAN_MONTH } from '../../lib/hijri';
import { useSettingsStore } from '../settings/store/useSettingsStore';

const DHUL_HIJJAH_MONTH = 12;

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
  phaseEmoji: string;
  nextNewMoon: Date;
  nextFullMoon: Date;
  // Hijri month crescent context
  hijriDay: number;
  hijriMonth: number;
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

/** Translation key per moon phase, `screens.moon` namespace (render-time only — the internal MoonPhase union stays English). */
const MOON_PHASE_LABEL_KEYS: Record<MoonPhase, string> = {
  new_moon: 'screens.moon.phaseNewMoon',
  waxing_crescent: 'screens.moon.phaseWaxingCrescent',
  first_quarter: 'screens.moon.phaseFirstQuarter',
  waxing_gibbous: 'screens.moon.phaseWaxingGibbous',
  full_moon: 'screens.moon.phaseFullMoon',
  waning_gibbous: 'screens.moon.phaseWaningGibbous',
  last_quarter: 'screens.moon.phaseLastQuarter',
  waning_crescent: 'screens.moon.phaseWaningCrescent',
};

function getMoonPhase(age: number): { phase: MoonPhase; emoji: string } {
  if (age < 1.85 || age >= 27.68) return { phase: 'new_moon', emoji: '🌑' };
  if (age < 7.38) return { phase: 'waxing_crescent', emoji: '🌒' };
  if (age < 9.22) return { phase: 'first_quarter', emoji: '🌓' };
  if (age < 14.76) return { phase: 'waxing_gibbous', emoji: '🌔' };
  if (age < 16.61) return { phase: 'full_moon', emoji: '🌕' };
  if (age < 22.15) return { phase: 'waning_gibbous', emoji: '🌖' };
  if (age < 23.99) return { phase: 'last_quarter', emoji: '🌗' };
  return { phase: 'waning_crescent', emoji: '🌘' };
}

function getNextPhaseDate(date: Date, targetAge: number): Date {
  const age = getMoonAge(date);
  let daysUntil = targetAge - age;
  if (daysUntil < 0) daysUntil += LUNAR_CYCLE_DAYS;
  return new Date(date.getTime() + daysUntil * 86400000);
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function MoonScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hijriDayAdjustment = useSettingsStore((s) => s.hijriDayAdjustment);
  const moonData = useMemo<MoonData>(() => {
    const now = new Date();
    const age = getMoonAge(now);
    const illumination = getMoonIllumination(age);
    const { phase, emoji } = getMoonPhase(age);
    const nextNewMoon = getNextPhaseDate(now, 0);
    const nextFullMoon = getNextPhaseDate(now, 14.76);
    const hijri = gregorianToHijri(now, hijriDayAdjustment);
    return {
      phase,
      illumination,
      age,
      phaseEmoji: emoji,
      nextNewMoon,
      nextFullMoon,
      hijriDay: hijri.day,
      hijriMonth: hijri.month,
      hijriMonthName: hijri.monthName,
    };
  }, [hijriDayAdjustment]);

  const illuminationPct = Math.round(moonData.illumination * 100);
  const phaseLabel = t(MOON_PHASE_LABEL_KEYS[moonData.phase]);
  const locale = i18next.language;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Visual moon display */}
        <View
          style={styles.moonContainer}
          accessibilityRole="image"
          accessibilityLabel={`Moon phase: ${phaseLabel}, ${t('screens.moon.illuminatedPct', { pct: illuminationPct })}`}
        >
          <Text style={styles.moonEmoji}>{moonData.phaseEmoji}</Text>
          <Text style={styles.phaseName}>{phaseLabel}</Text>
          <Text style={styles.illumination}>{t('screens.moon.illuminatedPct', { pct: illuminationPct })}</Text>
        </View>

        {/* Hijri month crescent info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} accessibilityRole="header">{t('screens.moon.hijriCalendar')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('screens.moon.hijriDay')}</Text>
            <Text style={styles.infoValue}>{moonData.hijriDay}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('screens.moon.month')}</Text>
            <Text style={styles.infoValue}>{moonData.hijriMonthName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('screens.moon.lunarAge')}</Text>
            <Text style={styles.infoValue}>{t('screens.moon.daysUnit', { count: Number(moonData.age.toFixed(1)) })}</Text>
          </View>
        </View>

        {/* Upcoming phases */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} accessibilityRole="header">{t('screens.moon.upcomingPhases')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('screens.moon.nextFullMoon')}</Text>
            <Text style={styles.infoValue}>
              {moonData.nextFullMoon.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('screens.moon.nextNewMoon')}</Text>
            <Text style={styles.infoValue}>
              {moonData.nextNewMoon.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Islamic significance */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} accessibilityRole="header">{t('screens.moon.significance')}</Text>
          <Text style={styles.quoteText}>
            {/* Quran 2:189 — verified Uthmani text — Islamic content gate: English only, never machine-translated */}
            {'"They ask you about the new crescent moons. Say: they are times set for people and for Hajj." — Quran 2:189'}
          </Text>
          {moonData.hijriMonth === RAMADAN_MONTH && (
            <Text style={styles.specialEvent}>
              {t('screens.moon.ramadanNote')}
            </Text>
          )}
          {moonData.hijriMonth === DHUL_HIJJAH_MONTH && (
            <Text style={styles.specialEvent}>
              {t('screens.moon.dhulHijjahNote', { month: moonData.hijriMonthName })}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand.deep },
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
    color: colors.brand.light,
  },
  illumination: {
    fontSize: 16,
    color: colors.brand.mid,
    marginTop: 4,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.brand.dark + 'CC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand.mid + '33',
    minHeight: 44,
    alignItems: 'center',
  },
  infoLabel: { fontSize: 15, color: colors.text.inverse + 'BB' },
  infoValue: { fontSize: 15, fontWeight: '600', color: colors.text.inverse },
  quoteText: {
    fontSize: 14,
    color: colors.brand.light,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  specialEvent: {
    fontSize: 14,
    color: colors.brand.light,
    marginTop: 8,
    lineHeight: 22,
  },
});
