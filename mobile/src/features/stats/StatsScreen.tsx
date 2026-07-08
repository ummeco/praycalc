/**
 * Purpose: Prayer stats — streak, completion rate chart (weekly/monthly), plus
 *   summary cards surfacing fasting streak and Qada outstanding count from the
 *   fasting/qada trackers (read-only cross-feature summary — no writes).
 * Inputs: MMKV-persisted prayer completions; useFastingStore/useQadaStore (read-only).
 * Outputs: StatsScreen — Feature 12 of 20.
 * Constraints: Data is local-only (no GraphQL on this screen — offline-first).
 *   7 UI states. Chart rendered with SVG via react-native-svg.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-12-stats
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import i18next, { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { EmptyState } from '../../components/states';
import { loadCompletions, type PrayerCompletion } from '../../lib/completions';
import { useFastingStore } from '../fasting/store/useFastingStore';
import { useQadaStore } from '../qada/store/useQadaStore';
import { getWeeklyStreak } from '../fasting/fastingLogic';
import { totalOutstanding } from '../qada/qadaLogic';
import { PRAYER_NAMES, getStreak, getWeeklyData } from './statsLogic';
import { BarChart } from './components/BarChart';
import { createStyles } from './StatsScreen.styles';

type ViewMode = 'weekly' | 'monthly';

export default function StatsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<ViewMode>('weekly');
  const [completions, setCompletions] = useState<PrayerCompletion[]>(loadCompletions);

  // Re-read on focus — completions are logged from the Home tab and this screen
  // stays mounted across tab switches, so a plain useMemo(loadCompletions, []) would go stale.
  useFocusEffect(
    useCallback(() => {
      setCompletions(loadCompletions());
    }, []),
  );

  const streak = useMemo(() => getStreak(completions), [completions]);
  const weeklyData = useMemo(() => getWeeklyData(completions, i18next.language), [completions]);

  const totalCompletions = completions.length;
  const weeklyRate = weeklyData.reduce((sum, d) => sum + d.count, 0) / 35; // max 7×5

  // Cross-feature summary (read-only) — fasting streak + Qada outstanding.
  const fastingLogs = useFastingStore((s) => s.logs);
  const qadaCounts = useQadaStore((s) => s.counts);
  const mondayStreak = useMemo(() => getWeeklyStreak(fastingLogs, 'Monday'), [fastingLogs]);
  const thursdayStreak = useMemo(() => getWeeklyStreak(fastingLogs, 'Thursday'), [fastingLogs]);
  const fastingStreak = Math.max(mondayStreak, thursdayStreak);
  const qadaOutstanding = useMemo(() => totalOutstanding(qadaCounts), [qadaCounts]);

  if (totalCompletions === 0) {
    return (
      <EmptyState
        message={t('screens.stats.noLogs')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}
      >
        {/* Streak cards */}
        <View style={styles.statsRow}>
          <View
            style={styles.statCard}
            accessibilityRole="text"
            accessibilityLabel={`Current streak: ${streak} days`}
          >
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>{t('screens.stats.dayStreak')}</Text>
          </View>
          <View
            style={styles.statCard}
            accessibilityRole="text"
            accessibilityLabel={`Weekly completion rate: ${Math.round(weeklyRate * 100)} percent`}
          >
            <Text style={styles.statNumber}>{Math.round(weeklyRate * 100)}%</Text>
            <Text style={styles.statLabel}>{t('screens.stats.weeklyRate')}</Text>
          </View>
          <View
            style={styles.statCard}
            accessibilityRole="text"
            accessibilityLabel={`Total prayers logged: ${totalCompletions}`}
          >
            <Text style={styles.statNumber}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>{t('screens.stats.totalLogged')}</Text>
          </View>
        </View>

        {/* Cross-feature summary — fasting streak + Qada outstanding */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.summaryCard}
            onPress={() => router.push('/fasting')}
            accessibilityRole="button"
            accessibilityLabel={`Fasting streak: ${fastingStreak} weeks. Tap to open fasting tracker.`}
          >
            <Text style={styles.summaryNumber}>{fastingStreak}</Text>
            <Text style={styles.summaryLabel}>{t('screens.stats.fastingStreak')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.summaryCard}
            onPress={() => router.push('/qada')}
            accessibilityRole="button"
            accessibilityLabel={`Qada prayers outstanding: ${qadaOutstanding}. Tap to open Qada tracker.`}
          >
            <Text style={styles.summaryNumber}>{qadaOutstanding}</Text>
            <Text style={styles.summaryLabel}>{t('screens.stats.qadaOutstanding')}</Text>
          </TouchableOpacity>
        </View>

        {/* Chart toggle */}
        <View style={styles.toggleRow} accessibilityRole="tablist">
          {(['weekly', 'monthly'] as ViewMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleTab, mode === m && styles.toggleTabActive]}
              onPress={() => setMode(m)}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
            >
              <Text style={[styles.toggleLabel, mode === m && styles.toggleLabelActive]}>
                {m === 'weekly' ? t('screens.stats.weekly') : t('screens.stats.monthly')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {mode === 'weekly' ? t('screens.stats.last7Days') : t('screens.stats.thisMonth')}
          </Text>
          <BarChart data={weeklyData} colors={colors} t={t} />
        </View>

        {/* Per-prayer breakdown */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.stats.byPrayer')}</Text>
        {PRAYER_NAMES.map((name) => {
          const count = completions.filter((c) => c.prayerName === name).length;
          const pct = totalCompletions > 0 ? count / totalCompletions : 0;
          return (
            <View
              key={name}
              style={styles.prayerRow}
              accessibilityRole="text"
              accessibilityLabel={`${name}: ${count} completions`}
            >
              <Text style={styles.prayerName}>{name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
              </View>
              <Text style={styles.prayerCount}>{count}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
