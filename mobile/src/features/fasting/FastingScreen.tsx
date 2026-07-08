/**
 * Purpose: Fasting tracker — log fasts by date/type (Ramadan, Monday, Thursday,
 *   White Days, Qada, Voluntary), show per-type counts/streaks, Ramadan "day X of
 *   30" progress, and upcoming recommended fast-day suggestions.
 * Inputs: useFastingStore (persisted logs), useSettingsStore.hijriDayAdjustment,
 *   fastingLogic pure functions.
 * Outputs: FastingScreen — new feature (fasting tab, scaffolded route/menu).
 * Constraints: CONTENT GATE — Mon/Thu sunnah cites Sahih Muslim 1162; White Days
 *   cites Sunan an-Nasa'i 2345 / Sunan Abi Dawud 2449. Never fabricate a citation.
 *   Local-only (no GraphQL) — matches StatsScreen's offline-first pattern.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-fasting
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import { useFastingStore } from './store/useFastingStore';
import {
  FAST_TYPES,
  toDateKey,
  countByType,
  getWeeklyStreak,
  getWhiteDaysStatus,
  getRamadanProgress,
  getUpcomingSuggestions,
  type FastType,
} from './fastingLogic';
import { createStyles } from './FastingScreen.styles';

const FAST_TYPE_LABELS: Record<FastType, string> = {
  Ramadan: 'Ramadan',
  Monday: 'Monday',
  Thursday: 'Thursday',
  WhiteDays: 'White Days',
  Qada: 'Qada (Make-up)',
  Voluntary: 'Voluntary',
};

export default function FastingScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hijriDayAdjustment = useSettingsStore((s) => s.hijriDayAdjustment);
  const logs = useFastingStore((s) => s.logs);
  const logFast = useFastingStore((s) => s.logFast);
  const unlogFast = useFastingStore((s) => s.unlogFast);

  const [selectedType, setSelectedType] = useState<FastType>('Voluntary');
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const todayLog = logs.find((l) => l.date === todayKey) ?? null;

  const mondayStreak = useMemo(() => getWeeklyStreak(logs, 'Monday', today), [logs, today]);
  const thursdayStreak = useMemo(() => getWeeklyStreak(logs, 'Thursday', today), [logs, today]);
  const whiteDaysStatus = useMemo(
    () => getWhiteDaysStatus(logs, today, hijriDayAdjustment),
    [logs, today, hijriDayAdjustment],
  );
  const ramadanProgress = useMemo(
    () => getRamadanProgress(today, hijriDayAdjustment),
    [today, hijriDayAdjustment],
  );
  const suggestions = useMemo(
    () => getUpcomingSuggestions(logs, today, hijriDayAdjustment),
    [logs, today, hijriDayAdjustment],
  );

  const handleToggleToday = useCallback(async (type: FastType) => {
    if (todayLog?.type === type) {
      unlogFast(todayKey);
    } else {
      logFast(todayKey, type);
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [todayLog, todayKey, logFast, unlogFast]);

  const handleLogSuggestion = useCallback(async (date: string, type: FastType) => {
    logFast(date, type);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [logFast]);

  const recentLogs = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14),
    [logs],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}>
        {/* Ramadan progress banner — only shown during Ramadan */}
        {ramadanProgress && (
          <View style={styles.ramadanBanner} accessibilityRole="text"
            accessibilityLabel={`Ramadan day ${ramadanProgress.day} of ${ramadanProgress.totalDays}`}
          >
            <Text style={styles.ramadanText}>
              {t('screens.fasting.ramadanDayOf', { day: ramadanProgress.day, total: ramadanProgress.totalDays })}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(ramadanProgress.day / ramadanProgress.totalDays) * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Today's log */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.fasting.todaysFast')}</Text>
        <View style={styles.typeGrid}>
          {FAST_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, todayLog?.type === type && styles.typeChipActive]}
              onPress={() => setSelectedType(type)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedType === type }}
              accessibilityLabel={FAST_TYPE_LABELS[type]}
            >
              <Text style={[styles.typeChipText, todayLog?.type === type && styles.typeChipTextActive]}>
                {FAST_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.logButton, todayLog && styles.logButtonActive]}
          onPress={() => handleToggleToday(selectedType)}
          accessibilityRole="button"
          accessibilityLabel={todayLog ? t('screens.fasting.unlogToday') : t('screens.fasting.logToday')}
        >
          <Text style={styles.logButtonText}>
            {todayLog ? t('screens.fasting.loggedAs', { type: FAST_TYPE_LABELS[todayLog.type] }) : t('screens.fasting.logToday')}
          </Text>
        </TouchableOpacity>

        {/* Streaks / counts */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.fasting.yourStreaks')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard} accessibilityLabel={`Monday streak: ${mondayStreak}`}>
            <Text style={styles.statNumber}>{mondayStreak}</Text>
            <Text style={styles.statLabel}>{t('screens.fasting.mondayStreak')}</Text>
          </View>
          <View style={styles.statCard} accessibilityLabel={`Thursday streak: ${thursdayStreak}`}>
            <Text style={styles.statNumber}>{thursdayStreak}</Text>
            <Text style={styles.statLabel}>{t('screens.fasting.thursdayStreak')}</Text>
          </View>
          <View style={styles.statCard} accessibilityLabel={`White Days this month: ${whiteDaysStatus.thisMonthLogged} of 3`}>
            <Text style={styles.statNumber}>{whiteDaysStatus.thisMonthLogged}/3</Text>
            <Text style={styles.statLabel}>{t('screens.fasting.whiteDaysMonth')}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCardSmall} accessibilityLabel={`Ramadan fasts logged: ${countByType(logs, 'Ramadan')}`}>
            <Text style={styles.statNumberSmall}>{countByType(logs, 'Ramadan')}</Text>
            <Text style={styles.statLabelSmall}>{t('screens.fasting.ramadanLogged')}</Text>
          </View>
          <View style={styles.statCardSmall} accessibilityLabel={`Qada fasts made up: ${countByType(logs, 'Qada')}`}>
            <Text style={styles.statNumberSmall}>{countByType(logs, 'Qada')}</Text>
            <Text style={styles.statLabelSmall}>{t('screens.fasting.qadaLogged')}</Text>
          </View>
          <View style={styles.statCardSmall} accessibilityLabel={`Voluntary fasts logged: ${countByType(logs, 'Voluntary')}`}>
            <Text style={styles.statNumberSmall}>{countByType(logs, 'Voluntary')}</Text>
            <Text style={styles.statLabelSmall}>{t('screens.fasting.voluntaryLogged')}</Text>
          </View>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.fasting.upcomingSuggestions')}</Text>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={`${s.type}-${s.date}`}
                style={styles.suggestionRow}
                onPress={() => handleLogSuggestion(s.date, s.type)}
                accessibilityRole="button"
                accessibilityLabel={`Log ${s.label} on ${s.date}`}
              >
                <Text style={styles.suggestionDate}>{s.date}</Text>
                <Text style={styles.suggestionLabel}>{s.label}</Text>
                <Text style={styles.suggestionAction}>{t('screens.fasting.logAction')}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.sourceNote}>{t('screens.fasting.sunnahSourceNote')}</Text>
          </>
        )}

        {/* Recent log history */}
        {recentLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.fasting.recentLogs')}</Text>
            {recentLogs.map((l) => (
              <View key={l.date} style={styles.historyRow} accessibilityLabel={`${l.date}: ${FAST_TYPE_LABELS[l.type]}`}>
                <Text style={styles.historyDate}>{l.date}</Text>
                <Text style={styles.historyType}>{FAST_TYPE_LABELS[l.type]}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
