/**
 * Purpose: Renders the 6-prayer list with per-prayer completion toggle, next-prayer
 *   highlight, mute indicator, and formatted time. Extracted verbatim from
 *   PrayerTimesScreen.tsx (was pushing that file over the 300-line cap).
 * Inputs: times/nextPrayer/secondsToNextPrayer/settings + parent-owned colors/styles/t.
 * Outputs: PrayerList component (also used standalone inside the offline state).
 * Constraints: Presentation + own local completedTick state only — no behavior change
 *   from the pre-extraction inline component (same accessibility labels/i18n keys).
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import i18next from '../../../../i18n';
import type { ThemeColors } from '../../../../constants/colors';
import type { SettingsState } from '../../../settings/store/useSettingsStore';
import type { usePrayerTimes } from '../../hooks/usePrayerTimes';
import type { PrayerName } from '../../../../types/prayer';
import { isPrayerCompleted, togglePrayerCompletion } from '../../../../lib/completions';
import { PRAYER_LABEL_KEYS, DISPLAY_PRAYERS as PRAYER_ORDER } from '../../../../constants/prayers';
import { recordSuccessAndMaybeRequestReview } from '../../../../lib/review';
import { formatTime } from '../prayerTimesScreen.helpers';
import type { PrayerTimesScreenStyles } from '../PrayerTimesScreen.styles';

interface PrayerListProps {
  times: ReturnType<typeof usePrayerTimes>['times'];
  provenance: ReturnType<typeof usePrayerTimes>['provenance'];
  nextPrayer: PrayerName | null;
  secondsToNextPrayer: number;
  settings: SettingsState;
  colors: ThemeColors;
  styles: PrayerTimesScreenStyles;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function PrayerList({ times, provenance, nextPrayer, settings, colors, styles, t }: PrayerListProps) {
  const [completedTick, setCompletedTick] = useState(0);
  if (!times) return null;

  const canLog = (name: PrayerName) => name !== 'Sunrise';

  return (
    <View key={completedTick} style={styles.prayerList}>
      {PRAYER_ORDER.map((name) => {
        const isNext = name === nextPrayer;
        // Fajr and Isha are the only prayers a high-latitude rule can supply. Anything
        // other than 'observed' means the sun did not provide this time — it is a
        // juristic substitution, and the row says so rather than presenting it as a
        // calculation.
        const source = name === 'Fajr' ? provenance?.Fajr : name === 'Isha' ? provenance?.Isha : undefined;
        const substituted = source !== undefined && source !== 'observed' && source !== 'unavailable';
        const completed = canLog(name) && isPrayerCompleted(name);
        const muted = canLog(name) && settings.perPrayerNotificationEnabled[name] === false;
        const label = t(PRAYER_LABEL_KEYS[name]);
        return (
          <TouchableOpacity
            key={name}
            style={[styles.prayerRow, isNext && styles.prayerRowNext]}
            disabled={!canLog(name)}
            onPress={() => {
              const nowCompleted = togglePrayerCompletion(name);
              setCompletedTick((tick) => tick + 1);
              // Growth: natural success moment. Only counts forward completions
              // (not un-marking) toward the rate-us gate — never nags, fires at most once.
              if (nowCompleted) {
                void recordSuccessAndMaybeRequestReview().catch(() => undefined);
              }
            }}
            accessibilityRole={canLog(name) ? 'checkbox' : undefined}
            accessibilityState={canLog(name) ? { checked: completed } : undefined}
            accessibilityLabel={canLog(name) ? `${label}, ${completed ? t('screens.prayerTimes.markedPrayed') : t('screens.prayerTimes.notMarkedPrayed')}. ${t('screens.prayerTimes.doubleTapToggle')}` : undefined}
          >
            <View style={[styles.prayerDot, { backgroundColor: colors.prayer[name.toLowerCase() as keyof typeof colors.prayer] ?? colors.brand.mid }]} />
            <Text style={[styles.prayerName, isNext && styles.prayerNameNext]}>
              {label}
            </Text>
            {muted && <Text style={styles.muteIcon}>🔕</Text>}
            <View style={styles.prayerTimeGroup}>
              <Text style={[styles.prayerTime, isNext && styles.prayerTimeNext]}>
                {formatTime(times[name], settings.timeFormat, i18next.language)}
              </Text>
              {substituted && (
                <Text style={styles.prayerTimeSubstituted}>
                  {t('screens.prayerTimes.substituted')}
                </Text>
              )}
            </View>
            {canLog(name) && (
              <Text style={[styles.completedCheck, completed && styles.completedCheckActive]}>
                {completed ? '✓' : '○'}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
