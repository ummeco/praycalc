/**
 * Purpose: Inline weekly/monthly completion bar chart for StatsScreen — no
 *   chart library dependency, plain Views with proportional bar height.
 * Inputs: data (day/count pairs), colors (ThemeColors), t (translation fn).
 * Outputs: BarChart component — accessible image with per-bar labels.
 * Constraints: Styles are chart-specific and self-contained (not shared
 *   elsewhere), so createChartStyles lives alongside the component.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../constants/colors';

export function BarChart({ data, colors, t }: { data: { day: string; count: number }[]; colors: ThemeColors; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const max = 5;
  const chart = useMemo(() => createChartStyles(colors), [colors]);
  return (
    <View
      style={chart.container}
      accessibilityRole="image"
      accessibilityLabel={t('screens.stats.chartAccessibilityLabel')}
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

const createChartStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 4, padding: 8 },
  bar: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  fill: {
    width: '80%',
    backgroundColor: colors.brand.mid,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: { fontSize: 10, color: colors.text.muted, marginTop: 4 },
  countLabel: { fontSize: 10, color: colors.brand.dark, fontWeight: '700' },
});
