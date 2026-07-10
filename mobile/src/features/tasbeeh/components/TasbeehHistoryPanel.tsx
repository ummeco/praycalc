/**
 * Purpose: Today's-total card + recent-sessions history list for
 *   TasbeehScreen — extracted so the screen component stays under the
 *   300-line file cap.
 * Inputs: full history (for the empty-state check), today's total, the
 *   already-sliced recent history entries, shared styles/translate function.
 * Outputs: TasbeehHistoryPanel component — identical JSX/accessibility output
 *   to the original inline block in TasbeehScreen.tsx (renders nothing when
 *   history is empty).
 * Constraints: Purely presentational — no own state, no theme/i18n hook calls
 *   (styles and t are passed down from the screen to avoid duplicate lookups).
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tasbeeh-history-panel
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { TFunction } from 'i18next';
import i18next from '../../../i18n';
import type { TasbeehHistoryEntry } from '../tasbeehHistory';
import type { TasbeehStyles } from '../TasbeehScreen.styles';

interface TasbeehHistoryPanelProps {
  history: TasbeehHistoryEntry[];
  todayTotal: number;
  recentHistory: TasbeehHistoryEntry[];
  styles: TasbeehStyles;
  t: TFunction;
}

export function TasbeehHistoryPanel({
  history, todayTotal, recentHistory, styles, t,
}: TasbeehHistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <>
      <View style={styles.todayTotalCard} accessibilityLabel={t('screens.tasbeeh.todayTotalAccessibilityLabel', { total: todayTotal })}>
        <Text style={styles.todayTotalNumber}>{todayTotal}</Text>
        <Text style={styles.todayTotalLabel}>{t('screens.tasbeeh.todayTotal')}</Text>
      </View>
      <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.tasbeeh.history')}</Text>
      {recentHistory.map((entry, i) => (
        <View
          key={`${entry.completedAt}-${i}`}
          style={styles.historyRow}
          accessibilityLabel={t('screens.tasbeeh.historyEntryAccessibilityLabel', {
            name: entry.dhikrName,
            count: entry.count,
            date: new Date(entry.completedAt).toLocaleString(i18next.language),
          })}
        >
          <Text style={styles.historyName}>{entry.dhikrName}</Text>
          <Text style={styles.historyCount}>× {entry.count}</Text>
          <Text style={styles.historyTime}>
            {new Date(entry.completedAt).toLocaleDateString(i18next.language)}
          </Text>
        </View>
      ))}
    </>
  );
}
