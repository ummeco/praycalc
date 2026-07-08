/**
 * Purpose: Full-screen dashboard overlays — a pre-adhan countdown takeover and a post-
 *   adhan/iqama "name only" takeover — that cover the stream when the admin enables them.
 * Inputs: TvSettings (countdown/iqama/name-only toggles + minutes, accentColor, timeFormat),
 *   PrayerDay (today's "HH:MM" adhan times), nextPrayer from prayerStore.
 * Outputs: an absolute-fill overlay View when a mode is active, else null (renders nothing).
 * Constraints: react-native-tvos; no DOM APIs; owns a 1s tick, cleaned up on unmount;
 *   NAME-ONLY takes precedence over COUNTDOWN when both windows overlap.
 * SPORT: praycalc/tv components/dashboard
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrayerDay, PrayerName, TvSettings } from '../../types';

const PRAYER_LABELS: Record<PrayerName, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

const PRAYER_ORDER: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

interface PrayerTakeoverProps {
  settings: TvSettings;
  prayerDay: PrayerDay | null;
  nextPrayer: PrayerName | null;
}

/** Parses a "HH:MM" 24h string onto `base`'s calendar date. */
function timeToDate(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Formats a clock time per the TV's configured 12h/24h display preference. */
function formatClock(date: Date, timeFormat: TvSettings['timeFormat']): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  });
}

/** Formats a millisecond duration as a MM:SS countdown string. */
function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Finds the most recent prayer whose adhan has passed but is still within its
 * name-only display window (adhan [+ iqama offset, unless sunrise] + nameOnlyMinutes).
 */
function findActiveNameOnlyPrayer(
  settings: TvSettings,
  prayerDay: PrayerDay,
  now: Date
): PrayerName | null {
  let active: PrayerName | null = null;
  for (const name of PRAYER_ORDER) {
    const adhan = timeToDate(now, prayerDay[name]);
    if (adhan.getTime() > now.getTime()) continue;
    const iqamaMinutes =
      settings.iqamaEnabled && name !== 'sunrise' ? settings.iqamaOffsets[name] : 0;
    const end = new Date(adhan.getTime() + (iqamaMinutes + settings.nameOnlyMinutes) * 60000);
    if (now.getTime() <= end.getTime()) {
      active = name;
    }
  }
  return active;
}

export default function PrayerTakeover({
  settings,
  prayerDay,
  nextPrayer,
}: PrayerTakeoverProps): React.JSX.Element | null {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!prayerDay) return null;

  // NAME-ONLY takes precedence — it deliberately covers/hides the stream longer.
  if (settings.nameOnlyEnabled) {
    const active = findActiveNameOnlyPrayer(settings, prayerDay, now);
    if (active) {
      const label = PRAYER_LABELS[active];
      return (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.nameOnlyAr}>{label.ar}</Text>
          <Text style={styles.nameOnlyEn}>{label.en}</Text>
          <Text style={styles.nameOnlySub}>It is time for {label.en}</Text>
        </View>
      );
    }
  }

  // COUNTDOWN — pre-adhan window for the next upcoming prayer.
  if (settings.countdownTakeoverEnabled && nextPrayer) {
    const adhan = timeToDate(now, prayerDay[nextPrayer]);
    const diffMs = adhan.getTime() - now.getTime();
    const windowMs = settings.countdownMinutes * 60000;
    if (diffMs > 0 && diffMs <= windowMs) {
      const label = PRAYER_LABELS[nextPrayer];
      return (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.countdownAr}>{label.ar}</Text>
          <Text style={styles.countdownEn}>{label.en}</Text>
          <Text style={styles.countdownLabel}>Adhan in</Text>
          <Text style={[styles.countdownValue, { color: settings.accentColor }]}>
            {formatCountdown(diffMs)}
          </Text>
          <Text style={styles.countdownClock}>
            at {formatClock(adhan, settings.timeFormat)}
          </Text>
        </View>
      );
    }
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#0D2F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameOnlyAr: {
    color: '#C9F27A',
    fontSize: 96,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  nameOnlyEn: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '300',
    marginTop: 12,
  },
  nameOnlySub: {
    color: '#79C24C',
    fontSize: 28,
    marginTop: 24,
  },
  countdownAr: {
    color: '#C9F27A',
    fontSize: 72,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  countdownEn: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '300',
    marginTop: 8,
  },
  countdownLabel: {
    color: '#79C24C',
    fontSize: 30,
    marginTop: 32,
  },
  countdownValue: {
    fontSize: 88,
    fontWeight: '700',
    marginTop: 8,
  },
  countdownClock: {
    color: '#5a9a6a',
    fontSize: 22,
    marginTop: 12,
  },
});
