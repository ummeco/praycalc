/**
 * Purpose: No-stream "masjid daylight mode" layout — a large-type prayer grid designed
 *   to stay legible across a brightly lit hall (oversized digits, high-contrast tokens,
 *   generous spacing) rather than a video-first design. Shows city, live clock, hijri
 *   date, a 6-cell prayer grid, and a next-prayer countdown.
 * Inputs: DashboardLayoutProps.
 * Outputs: the times-only dashboard view.
 * Constraints: 16:9 1080p; no DisplayPane/stream is rendered here by design; hijri date
 *   computed via the shared lib/hijri module (same Umm al-Qura source every other screen
 *   uses) since PrayerDay's optional hijriDate* fields are not populated by the current
 *   calc engine. Theme-token driven colors (useTheme); accentColor overrides next-prayer
 *   highlight only, as elsewhere.
 * SPORT: praycalc/tv components/layouts
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardLayoutProps } from '../../lib/layouts/types';
import { useTheme } from '../../hooks/useTheme';
import { gregorianToHijri } from '../../lib/hijri';
import { PrayerName } from '../../types';

const PRAYER_LABELS: Record<PrayerName, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

/** Formats seconds-remaining as "Hh MMm" or "MMm SSs" for the next-prayer countdown. */
function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

export default function TimesOnlyLayout({
  settings,
  prayerTimes,
  nextPrayer,
}: DashboardLayoutProps): React.JSX.Element {
  const theme = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: settings.timeFormat === '12h',
  });
  const hijri = gregorianToHijri(now);

  let countdownText = '';
  if (nextPrayer) {
    const next = prayerTimes.find((p) => p.name === nextPrayer);
    if (next) {
      const [h, m] = next.time.split(':').map(Number);
      const target = new Date(now).setHours(h, m, 0, 0);
      const diffMs = target - now.getTime();
      countdownText = diffMs > 0 ? formatCountdown(diffMs) : 'Now';
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.city, { color: theme.textPrimary }]}>{settings.cityName}</Text>
        <Text style={styles.clock}>{clock}</Text>
        <Text style={[styles.hijri, { color: theme.textSecondary }]}>
          {hijri.day} {hijri.monthName} {hijri.year}H
        </Text>
      </View>

      {nextPrayer ? (
        <View style={[styles.countdown, { borderColor: theme.border }]}>
          <Text style={[styles.countdownLabel, { color: theme.textSecondary }]}>
            Next: {PRAYER_LABELS[nextPrayer].en}
          </Text>
          <Text style={[styles.countdownValue, { color: settings.accentColor }]}>
            {countdownText}
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {prayerTimes.map((p) => {
          const isNext = p.name === nextPrayer;
          return (
            <View
              key={p.name}
              accessible={true}
              accessibilityLabel={`${PRAYER_LABELS[p.name].en} at ${p.time}${
                isNext ? ', next prayer' : ''
              }`}
              style={[
                styles.cell,
                { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                isNext && { borderColor: settings.accentColor },
              ]}
            >
              <Text style={[styles.cellNameAr, { color: theme.textPrimary }]}>
                {PRAYER_LABELS[p.name].ar}
              </Text>
              <Text style={[styles.cellNameEn, { color: theme.textSecondary }]}>
                {PRAYER_LABELS[p.name].en}
              </Text>
              <Text
                style={[
                  styles.cellTime,
                  { color: isNext ? settings.accentColor : theme.textPrimary },
                ]}
              >
                {p.time}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  city: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clock: {
    color: '#FFFFFF',
    fontSize: 96,
    fontWeight: '200',
    marginTop: 4,
  },
  hijri: {
    fontSize: 30,
    marginTop: 4,
  },
  countdown: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 16,
  },
  countdownLabel: {
    fontSize: 26,
  },
  countdownValue: {
    fontSize: 44,
    fontWeight: '700',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 1600,
  },
  cell: {
    width: 320,
    alignItems: 'center',
    paddingVertical: 28,
    borderRadius: 20,
    borderWidth: 3,
  },
  cellNameAr: {
    fontSize: 34,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  cellNameEn: {
    fontSize: 26,
    marginTop: 4,
  },
  cellTime: {
    fontSize: 48,
    fontWeight: '700',
    marginTop: 10,
  },
});
