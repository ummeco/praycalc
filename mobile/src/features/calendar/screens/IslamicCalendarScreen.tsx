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

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { useIslamicCalendar } from '../hooks/useIslamicCalendar';
import { EmptyState } from '../../../components/shared/UIStates';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function IslamicCalendarScreen() {
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
          {gregorianDate.toLocaleDateString('en-US', {
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
          <Text style={styles.monthTitleText}>{`${MONTH_NAMES[month]} ${year}`}</Text>
          <Text style={styles.monthHijriText}>{hijriDate.monthName}</Text>
        </View>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(1)}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((d) => (
          <Text key={d} style={[styles.weekdayLabel, d === 'Fri' && styles.jumuah]}>
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
          <Text style={styles.sectionTitle}>Islamic Events This Month</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  content: { padding: 16, gap: 16 },
  dateHeader: {
    backgroundColor: Colors.brand.deep,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  hijriDate: { fontSize: 20, fontWeight: '700', color: Colors.brand.light },
  gregorianDate: { fontSize: 14, color: Colors.text.inverse, opacity: 0.8 },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: { fontSize: 24, color: Colors.brand.dark, fontWeight: '600' },
  monthTitle: { alignItems: 'center' },
  monthTitleText: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  monthHijriText: { fontSize: 12, color: Colors.text.muted },
  weekdayRow: { flexDirection: 'row' },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: Colors.text.muted, fontWeight: '500' },
  jumuah: { color: Colors.brand.dark },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellToday: { backgroundColor: Colors.brand.mid, borderRadius: 20 },
  cellSelected: { backgroundColor: Colors.brand.dark, borderRadius: 20 },
  cellText: { fontSize: 14, color: Colors.text.primary },
  cellTodayText: { color: Colors.text.inverse, fontWeight: '700' },
  cellSelectedText: { color: Colors.text.inverse, fontWeight: '700' },
  eventsSection: { gap: 8 },
  sectionTitle: { fontSize: 13, color: Colors.text.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, backgroundColor: Colors.background.secondary, borderRadius: 8 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.mid, marginTop: 4 },
  eventName: { fontSize: 14, color: Colors.text.primary, fontWeight: '500' },
  eventDate: { fontSize: 12, color: Colors.text.muted },
});
