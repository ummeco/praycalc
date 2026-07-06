/**
 * Purpose: Monthly prayer timetable — a scrollable per-day table (Fajr/Sunrise/
 *   Dhuhr/Asr/Maghrib/Isha) for the active location's current or navigated month,
 *   with a calendar-export action for offline/print use (e.g. masjid noticeboards).
 * Inputs: useActiveLocation() (home, or travel city while musafir mode is on —
 *   matches every other prayer surface), useSettingsStore (method, madhab,
 *   highLatRule, custom angles, prayerMinuteAdjustments, timeFormat).
 * Outputs: TimetableScreen — month navigation header, per-day time rows, today
 *   highlight, "Export Calendar" action linking to the real praycalc.com
 *   /api/calendar.ics endpoint (there is no PDF-generating endpoint in the web
 *   app — see Constraints).
 * Constraints:
 *   - praycalc.com only exposes two calendar exports: `/api/calendar.ics`
 *     (RFC 5545 .ics file, real GET endpoint, verified in web/src/pages/api/
 *     calendar.ics.ts) and a browser `window.print()` button inside the web
 *     app's CalendarModal island (city page only, not a server PDF route).
 *     No `/api/calendar/pdf` endpoint exists anywhere in web/. The export
 *     button here is honestly labelled "Export Calendar (.ics)" and opens the
 *     real endpoint — it does not claim to produce a PDF.
 *   - Prayer times computed locally via calculatePrayerTimes (same engine as
 *     every other mobile screen) — the .ics export additionally calls the
 *     server endpoint for a portable file the OS calendar app can import.
 *   - Times formatted per settings.timeFormat (12h/24h). Prayer names translated
 *     at render time only (t('prayer.*')) — internal PrayerName stays English.
 *   - No location → EmptyState with a Set Location action to /city-search
 *     (pattern: QiblaScreen).
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-timetable-screen
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import i18next, { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { useSettingsStore, useActiveLocation } from '../settings/store/useSettingsStore';
import { calculatePrayerTimes } from '../../lib/prayer-calc';
import { resolveTimezoneOffset } from '../../lib/timezone';
import type { CalcMethodKey } from '../../constants/methods';
import type { PrayerName, PrayerTimes } from '../../types/prayer';
import { EmptyState } from '../../components/shared/UIStates';

const DISPLAY_PRAYERS: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Translation key per prayer name, `prayer` namespace (render-time only). */
const PRAYER_LABEL_KEYS: Record<PrayerName, string> = {
  Fajr: 'prayer.fajr',
  Sunrise: 'prayer.sunrise',
  Dhuhr: 'prayer.dhuhr',
  Asr: 'prayer.asr',
  Maghrib: 'prayer.maghrib',
  Isha: 'prayer.isha',
};

/** praycalc.com's real calendar export — verified against web/src/pages/api/calendar.ics.ts. */
const ICS_EXPORT_BASE = 'https://praycalc.com/api/calendar.ics';

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/** Locale-aware month name, driven by the active i18next language (not a catalog key —
 *  Gregorian month names are locale data, not translatable UI copy). */
function getMonthName(year: number, month0: number, locale: string): string {
  return new Date(year, month0, 1).toLocaleDateString(locale, { month: 'long' });
}

function formatTime(date: Date, format: '12h' | '24h', locale: string): string {
  if (format === '24h') {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface DayRow {
  day: number;
  isToday: boolean;
  times: PrayerTimes;
}

export default function TimetableScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const settings = useSettingsStore();
  const activeLocation = useActiveLocation();

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());

  function goPrevMonth() {
    setMonth0((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setMonth0((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  const rows: DayRow[] = useMemo(() => {
    if (!activeLocation) return [];
    const total = daysInMonth(year, month0);
    const tzOffset = resolveTimezoneOffset(activeLocation.timezone, new Date(year, month0, 1));
    const customAngles = settings.method === 'Custom'
      ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
      : undefined;

    const out: DayRow[] = [];
    for (let day = 1; day <= total; day++) {
      const date = new Date(year, month0, day);
      const times = calculatePrayerTimes(
        date,
        activeLocation.latitude,
        activeLocation.longitude,
        tzOffset,
        settings.method as CalcMethodKey,
        settings.madhab,
        settings.highLatRule,
        customAngles,
        settings.prayerMinuteAdjustments,
      );
      out.push({
        day,
        isToday: (
          year === today.getFullYear() && month0 === today.getMonth() && day === today.getDate()
        ),
        times,
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- today is a stable ref for the session
  }, [
    activeLocation, year, month0, settings.method, settings.madhab, settings.highLatRule,
    settings.customFajrAngle, settings.customIshaAngle, settings.prayerMinuteAdjustments,
  ]);

  function handleExportCalendar() {
    if (!activeLocation) return;
    const params = new URLSearchParams({
      lat: String(activeLocation.latitude),
      lng: String(activeLocation.longitude),
      tz: activeLocation.timezone,
      days: '30',
      hanafi: settings.madhab === 'Hanafi' ? '1' : '0',
    });
    void Linking.openURL(`${ICS_EXPORT_BASE}?${params.toString()}`);
  }

  if (!activeLocation) {
    return (
      <EmptyState
        title={t('screens.timetable.setCityTitle')}
        subtitle={t('screens.timetable.setCitySubtitle')}
        action={t('settings.location.title')}
        onAction={() => router.push('/city-search')}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.monthNav} accessibilityRole="header">
        <TouchableOpacity
          onPress={goPrevMonth}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={t('screens.timetable.previousMonth')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{getMonthName(year, month0, i18next.language)} {year}</Text>
        <TouchableOpacity
          onPress={goNextMonth}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={t('screens.timetable.nextMonth')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.locationLabel}>
        {activeLocation.city}, {activeLocation.country}
      </Text>

      {/* Table header */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableCellDay, styles.tableHeaderText]}>#</Text>
        {DISPLAY_PRAYERS.map((name) => (
          <Text key={name} style={[styles.tableCell, styles.tableHeaderText]}>
            {t(PRAYER_LABEL_KEYS[name])}
          </Text>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {rows.map((row) => (
          <View
            key={row.day}
            style={[styles.tableRow, row.isToday && styles.tableRowToday]}
            accessible
            accessibilityLabel={`Day ${row.day}${row.isToday ? ', today' : ''}`}
          >
            <Text style={[styles.tableCell, styles.tableCellDay, row.isToday && styles.tableCellToday]}>
              {row.day}
            </Text>
            {DISPLAY_PRAYERS.map((name) => (
              <Text key={name} style={[styles.tableCell, row.isToday && styles.tableCellToday]}>
                {formatTime(row.times[name], settings.timeFormat, i18next.language)}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Export — honest label: real .ics calendar file, not a PDF (no PDF endpoint exists) */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={handleExportCalendar}
        accessibilityRole="button"
        accessibilityLabel={t('screens.timetable.exportAccessibilityLabel')}
      >
        <Text style={styles.exportButtonText}>{t('screens.timetable.exportCalendar')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: 16, gap: 12 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  navButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 28, color: colors.brand.dark, fontWeight: '700' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.text.primary, minWidth: 140, textAlign: 'center' },
  locationLabel: { fontSize: 13, color: colors.text.muted, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 12 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 36,
  },
  tableRowToday: {
    backgroundColor: colors.brand.light + '33',
    borderRadius: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tableCellDay: {
    flex: 0.5,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tableCellToday: {
    color: colors.brand.dark,
    fontWeight: '700',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  exportButton: {
    backgroundColor: colors.brand.dark,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  exportButtonText: { color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
});
