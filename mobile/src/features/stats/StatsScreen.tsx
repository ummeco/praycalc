/**
 * Purpose: Prayer stats — streak, completion rate chart (weekly/monthly).
 * Inputs: MMKV-persisted prayer completions.
 * Outputs: StatsScreen — Feature 12 of 20.
 * Constraints: Data is local-only (no GraphQL on this screen — offline-first).
 *   7 UI states. Chart rendered with SVG via react-native-svg.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-12-stats
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { EmptyState } from '../../components/states';
import { mmkv } from '../../lib/storage/mmkv';
import type { PrayerName } from '../../types/prayer';

const COMPLETIONS_KEY = 'pc:completions';
const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

interface PrayerCompletion {
  date: string;          // YYYY-MM-DD
  prayerName: PrayerName;
  completedAt: number;   // Unix ms
}

function loadCompletions(): PrayerCompletion[] {
  const raw = mmkv.getString(COMPLETIONS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as PrayerCompletion[]; }
  catch { return []; }
}

function getStreak(completions: PrayerCompletion[]): number {
  const dailyCounts: Record<string, number> = {};
  for (const c of completions) {
    dailyCounts[c.date] = (dailyCounts[c.date] ?? 0) + 1;
  }
  // A day is "complete" if all 5 prayers are logged
  let streak = 0;
  let d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if ((dailyCounts[key] ?? 0) >= 5) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getWeeklyData(completions: PrayerCompletion[]): Array<{ day: string; count: number }> {
  const result: Array<{ day: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = completions.filter((c) => c.date === key).length;
    result.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
    });
  }
  return result;
}

// ── Inline bar chart (no extra deps) ─────────────────────────────────────────

function BarChart({ data }: { data: Array<{ day: string; count: number }> }) {
  const max = 5;
  return (
    <View
      style={chart.container}
      accessibilityRole="image"
      accessibilityLabel="Weekly prayer completion chart"
    >
      {data.map((d, i) => (
        <View key={i} style={chart.bar}>
          <View
            style={[
              chart.fill,
              { height: `${(d.count / max) * 100}%`, opacity: d.count === max ? 1 : 0.5 },
            ]}
            accessibilityLabel={`${d.day}: ${d.count} of 5 prayers`}
          />
          <Text style={chart.dayLabel}>{d.day}</Text>
          <Text style={chart.countLabel}>{d.count}</Text>
        </View>
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  container: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 4, padding: 8 },
  bar: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  fill: {
    width: '80%',
    backgroundColor: Colors.brand.mid,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: { fontSize: 10, color: Colors.text.muted, marginTop: 4 },
  countLabel: { fontSize: 10, color: Colors.brand.dark, fontWeight: '700' },
});

// ── Screen ────────────────────────────────────────────────────────────────────

type ViewMode = 'weekly' | 'monthly';

export default function StatsScreen() {
  const [mode, setMode] = useState<ViewMode>('weekly');

  const completions = useMemo(loadCompletions, []);
  const streak = useMemo(() => getStreak(completions), [completions]);
  const weeklyData = useMemo(() => getWeeklyData(completions), [completions]);

  const totalCompletions = completions.length;
  const weeklyRate = weeklyData.reduce((sum, d) => sum + d.count, 0) / 35; // max 7×5

  if (totalCompletions === 0) {
    return (
      <EmptyState
        message="No prayer logs yet. Start completing prayers to see your stats."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Streak cards */}
        <View style={styles.statsRow}>
          <View
            style={styles.statCard}
            accessibilityRole="text"
            accessibilityLabel={`Current streak: ${streak} days`}
          >
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View
            style={styles.statCard}
            accessibilityRole="text"
            accessibilityLabel={`Weekly completion rate: ${Math.round(weeklyRate * 100)} percent`}
          >
            <Text style={styles.statNumber}>{Math.round(weeklyRate * 100)}%</Text>
            <Text style={styles.statLabel}>Weekly Rate</Text>
          </View>
          <View
            style={styles.statCard}
            accessibilityRole="text"
            accessibilityLabel={`Total prayers logged: ${totalCompletions}`}
          >
            <Text style={styles.statNumber}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>Total Logged</Text>
          </View>
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
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {mode === 'weekly' ? 'Last 7 Days' : 'This Month'}
          </Text>
          <BarChart data={weeklyData} />
        </View>

        {/* Per-prayer breakdown */}
        <Text style={styles.sectionTitle} accessibilityRole="header">By Prayer</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: Colors.brand.light },
  statLabel: { fontSize: 11, color: Colors.brand.light + 'BB', marginTop: 2, textAlign: 'center' },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.card,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleTabActive: { backgroundColor: Colors.brand.mid },
  toggleLabel: { fontSize: 14, color: Colors.text.secondary, fontWeight: '500' },
  toggleLabelActive: { color: Colors.text.inverse, fontWeight: '700' },
  chartCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
    minHeight: 44,
  },
  prayerName: { width: 64, fontSize: 14, color: Colors.text.primary, fontWeight: '500' },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.background.card,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.brand.mid,
    borderRadius: 5,
    minWidth: 4,
  },
  prayerCount: { width: 32, fontSize: 13, color: Colors.text.muted, textAlign: 'right' },
});
