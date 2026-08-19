/**
 * Purpose: RIGHT dashboard pane (~1/3). Vertical rail of today's 6 prayer times with the
 *   next prayer highlighted and a live countdown, in the TV green-gradient style.
 * Inputs: prayerTimes + nextPrayer from prayerStore; accentColor from settings.
 * Outputs: the prayer rail view.
 * Constraints: min 28pt text; accent color drives the next-prayer highlight; a11y labels
 *   on each row; countdown ticks every second and cleans up on unmount. Colors are
 *   theme-token driven (useTheme) — 'ummat-green' renders byte-identical to pre-T4-3.
 * SPORT: praycalc/tv components/dashboard
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IqamaOffsets, PrayerName, PrayerTime } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const PRAYER_LABELS: Record<PrayerName, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

/**
 * Adds `minutes` to a "HH:MM" 24h time string, wrapping across midnight.
 *
 * A prayer with no time on this date arrives as "--:--" (polar day/night). Parsing that
 * yields NaN, and the arithmetic below would render the literal string "NaN:NaN" in the
 * iqamah column (PKG-02) — there is no iqamah for a prayer that does not occur.
 */
function addMinutesToTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

interface PrayerRailProps {
  cityName: string;
  prayerTimes: PrayerTime[];
  nextPrayer: PrayerName | null;
  accentColor: string;
  iqamaEnabled: boolean;
  iqamaOffsets: IqamaOffsets;
}

export default function PrayerRail({
  cityName,
  prayerTimes,
  nextPrayer,
  accentColor,
  iqamaEnabled,
  iqamaOffsets,
}: PrayerRailProps): React.JSX.Element {
  const theme = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={[styles.root, { backgroundColor: theme.surface, borderLeftColor: theme.border }]}>
      <View style={styles.header}>
        <Text style={[styles.city, { color: theme.textPrimary }]} numberOfLines={1}>
          {cityName}
        </Text>
        <Text style={styles.clock}>{clock}</Text>
      </View>

      <View style={styles.list}>
        {prayerTimes.map((p) => {
          const isNext = p.name === nextPrayer;
          const iqamaTime =
            iqamaEnabled && p.name !== 'sunrise'
              ? addMinutesToTime(p.time, iqamaOffsets[p.name])
              : null;
          return (
            <View
              key={p.name}
              accessible={true}
              accessibilityLabel={`${PRAYER_LABELS[p.name].en} at ${p.time}${
                iqamaTime ? `, iqama at ${iqamaTime}` : ''
              }${isNext ? ', next prayer' : ''}`}
              style={[
                styles.row,
                { backgroundColor: theme.surfaceAlt },
                isNext && { borderColor: accentColor, backgroundColor: '#2a7a3d' },
              ]}
            >
              <View style={styles.rowNames}>
                <Text style={[styles.nameAr, { color: theme.textPrimary }]}>
                  {PRAYER_LABELS[p.name].ar}
                </Text>
                <Text style={styles.nameEn}>{PRAYER_LABELS[p.name].en}</Text>
              </View>
              <View style={styles.timeCol}>
                <Text
                  style={[styles.time, { color: theme.textSecondary }, isNext && { color: accentColor }]}
                >
                  {p.time}
                </Text>
                {iqamaTime ? (
                  <Text style={styles.iqamaText}>Iqama {iqamaTime}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {nextPrayer ? (
        <View style={[styles.countdownBar, { borderTopColor: theme.border }]}>
          <Text style={[styles.countdownLabel, { color: theme.textSecondary }]}>
            Next: {PRAYER_LABELS[nextPrayer].en}
          </Text>
          <NextPrayerCountdown
            nextPrayer={nextPrayer}
            prayerTimes={prayerTimes}
            accentColor={accentColor}
          />
        </View>
      ) : null}
    </View>
  );
}

function NextPrayerCountdown({
  nextPrayer,
  prayerTimes,
  accentColor,
}: {
  nextPrayer: PrayerName;
  prayerTimes: PrayerTime[];
  accentColor: string;
}): React.JSX.Element {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const update = (): void => {
      const next = prayerTimes.find((p) => p.name === nextPrayer);
      if (!next) return;
      const [h, m] = next.time.split(':').map(Number);
      const target = new Date().setHours(h, m, 0, 0);
      const diffMs = target - Date.now();
      if (diffMs <= 0) {
        setCountdown('Now');
        return;
      }
      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      setCountdown(
        hours > 0 ? `${hours}h ${minutes}m ${secs}s` : `${minutes}m ${secs}s`
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [nextPrayer, prayerTimes]);

  return <Text style={[styles.countdownValue, { color: accentColor }]}>{countdown}</Text>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderLeftWidth: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  city: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clock: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '300',
    marginTop: 4,
  },
  list: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowNames: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  nameAr: {
    fontSize: 30,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  nameEn: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  timeCol: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 32,
    fontWeight: '700',
  },
  iqamaText: {
    color: '#5a9a6a',
    fontSize: 18,
    fontWeight: '400',
    marginTop: 2,
  },
  countdownBar: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  countdownLabel: {
    fontSize: 28,
  },
  countdownValue: {
    fontSize: 40,
    fontWeight: '700',
    marginTop: 4,
  },
});
