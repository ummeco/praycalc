/**
 * Purpose: Compact horizontal strip of today's 6 prayer times, meant to overlay the
 *   bottom of a full-bleed stream (StreamFullLayout) as a translucent bar rather than
 *   PrayerRail's full vertical column.
 * Inputs: prayerTimes + nextPrayer (same shape PrayerRail consumes), accentColor.
 * Outputs: a translucent bottom bar listing each prayer name + time, next prayer
 *   highlighted with accentColor.
 * Constraints: min 22pt text (smaller than PrayerRail since it shares screen space with
 *   video); no countdown/iqama detail here — that stays in the full PrayerRail.
 * SPORT: praycalc/tv components/dashboard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrayerName, PrayerTime } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

interface TimesStripProps {
  prayerTimes: PrayerTime[];
  nextPrayer: PrayerName | null;
  accentColor: string;
}

export default function TimesStrip({
  prayerTimes,
  nextPrayer,
  accentColor,
}: TimesStripProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: `${theme.bg}CC` }]}>
      {prayerTimes.map((p) => {
        const isNext = p.name === nextPrayer;
        return (
          <View
            key={p.name}
            accessible={true}
            accessibilityLabel={`${PRAYER_LABELS[p.name]} at ${p.time}${
              isNext ? ', next prayer' : ''
            }`}
            style={styles.item}
          >
            <Text
              style={[styles.name, { color: isNext ? accentColor : theme.textSecondary }]}
            >
              {PRAYER_LABELS[p.name]}
            </Text>
            <Text style={[styles.time, { color: isNext ? accentColor : theme.textPrimary }]}>
              {p.time}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  item: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
});
