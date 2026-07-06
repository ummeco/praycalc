/**
 * Purpose: Islamic Calendar screen — Hijri/Gregorian dual date display, month navigation,
 *   and Islamic events list. This screen has no async I/O (calendar math is synchronous
 *   and always succeeds), so only the success state is reachable — loading/error/empty/
 *   offline/permission-denied are not applicable here, unlike data-fetching screens.
 * Inputs: Current date (auto); navigation buttons for prev/next month
 * Outputs: Calendar grid with Hijri overlay; events list for current Hijri month
 * Constraints: Hijri conversion via useIslamicCalendar hook, backed by src/lib/hijri
 *   (@umalqura/core — the app-wide shared Hijri source, exact Umm al-Qura tabular dates).
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-calendar-screen
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import i18next, { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useIslamicCalendar } from '../hooks/useIslamicCalendar';
import { EmptyState } from '../../../components/shared/UIStates';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Locale-aware weekday labels (short form), driven by the active i18next language. */
function getWeekdayLabels(locale: string): string[] {
  const base = new Date(Date.UTC(2024, 0, 7)); // a known Sunday (UTC)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    return d.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' });
  });
}

/** Locale-aware month name, driven by the active i18next language (not a catalog key —
 *  Gregorian month names are locale data, not translatable UI copy). */
function getMonthName(year: number, month: number, locale: string): string {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: 'long' });
}

export default function IslamicCalendarScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    gregorianDate,
    hijriDate,
    currentMonth,
    islamicEvents,
    eventsThisMonth,
    navigateMonth,
    setDate,
  } = useIslamicCalendar();

  const { year, month } = currentMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const locale = i18next.language;
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const monthName = useMemo(() => getMonthName(year, month, locale), [year, month, locale]);

  // ── 7 UI states — calendar always has data so most states are rare ─────────
  // Empty: no scenario (calendar always shows)
  // Error: handled gracefully via try/catch in hook
  // All other states: render the calendar

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Dual Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.hijriDate}>
          {`${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`}
        </Text>
        <Text style={styles.gregorianDate}>
          {gregorianDate.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(-1)}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.monthTitle}>
          <Text style={styles.monthTitleText}>{`${monthName} ${year}`}</Text>
          <Text style={styles.monthHijriText}>{hijriDate.monthName}</Text>
        </View>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(1)}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Labels — Friday (index 5) highlighted for Jumu'ah */}
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((d, i) => (
          <Text key={`${d}-${i}`} style={[styles.weekdayLabel, i === 5 && styles.jumuah]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected =
            day === gregorianDate.getDate() &&
            year === gregorianDate.getFullYear() &&
            month === gregorianDate.getMonth();

          return (
            <TouchableOpacity
              key={day}
              style={[styles.cell, isToday && styles.cellToday, isSelected && styles.cellSelected]}
              onPress={() => setDate(new Date(year, month, day))}
            >
              <Text style={[styles.cellText, isToday && styles.cellTodayText, isSelected && styles.cellSelectedText]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Islamic Events this month */}
      {eventsThisMonth.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>{t('screens.calendar.eventsThisMonth')}</Text>
          {eventsThisMonth.map((event) => (
            <View key={event.name} style={styles.eventRow}>
              <View style={styles.eventDot} />
              <View>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>
                  {`${event.hijriDay} ${hijriDate.monthName}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: 16, gap: 16 },
  dateHeader: {
    backgroundColor: colors.brand.deep,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  hijriDate: { fontSize: 20, fontWeight: '700', color: colors.brand.light },
  gregorianDate: { fontSize: 14, color: colors.text.inverse, opacity: 0.8 },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: { fontSize: 24, color: colors.brand.dark, fontWeight: '600' },
  monthTitle: { alignItems: 'center' },
  monthTitleText: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  monthHijriText: { fontSize: 12, color: colors.text.muted },
  weekdayRow: { flexDirection: 'row' },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.text.muted, fontWeight: '500' },
  jumuah: { color: colors.brand.dark },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellToday: { backgroundColor: colors.brand.mid, borderRadius: 20 },
  cellSelected: { backgroundColor: colors.brand.dark, borderRadius: 20 },
  cellText: { fontSize: 14, color: colors.text.primary },
  cellTodayText: { color: colors.text.inverse, fontWeight: '700' },
  cellSelectedText: { color: colors.text.inverse, fontWeight: '700' },
  eventsSection: { gap: 8 },
  sectionTitle: { fontSize: 13, color: colors.text.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, backgroundColor: colors.background.secondary, borderRadius: 8 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.mid, marginTop: 4 },
  eventName: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  eventDate: { fontSize: 12, color: colors.text.muted },
});
