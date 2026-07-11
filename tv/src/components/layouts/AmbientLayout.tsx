/**
 * Purpose: Content-first layout — full-screen ContentRotation (Ayah/Hadith/Dua cards) with
 *   a small corner chip showing the live clock + next-prayer countdown. For rooms that
 *   want rotating Islamic content as the primary display with prayer info as a glance-only
 *   accent, not a dedicated rail.
 * Inputs: DashboardLayoutProps.
 * Outputs: full-screen ContentRotation + top-right clock/next-prayer chip.
 * Constraints: 16:9 1080p; ContentRotation renders solid (overlay=false) since there is no
 *   stream beneath it; the corner chip is intentionally compact (not a full rail).
 * SPORT: praycalc/tv components/layouts
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ContentRotation from '../dashboard/ContentRotation';
import { useTheme } from '../../hooks/useTheme';
import { DashboardLayoutProps } from '../../lib/layouts/types';
import { PrayerName } from '../../types';

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export default function AmbientLayout({
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
  const nextTime = nextPrayer ? prayerTimes.find((p) => p.name === nextPrayer)?.time : undefined;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ContentRotation rotateMinutes={settings.rotateMinutes} overlay={false} />
      <View style={[styles.chip, { backgroundColor: `${theme.surface}D9`, borderColor: theme.border }]}>
        <Text style={styles.clock}>{clock}</Text>
        {nextPrayer && nextTime ? (
          <Text style={[styles.next, { color: settings.accentColor }]}>
            {PRAYER_LABELS[nextPrayer]} {nextTime}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  chip: {
    position: 'absolute',
    top: 24,
    right: 24,
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
  },
  clock: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
  },
  next: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
});
