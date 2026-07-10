/**
 * Purpose: Notification settings body shown once the master toggle is on — per-prayer
 *   toggle rows (lead time + iqamah reminder + on/off), adhan sound picker, Suhoor/
 *   Tahajjud smart alarms, and the tonight's-night-times display card. Extracted
 *   verbatim from NotificationSettingsScreen.tsx (was pushing that file over the
 *   300-line cap).
 * Inputs: current notification settings + a NightTimes computation, and parent-owned
 *   handlers (advance/iqamah cycle, per-prayer toggle, sound select, Suhoor/Tahajjud
 *   toggle+cycle).
 * Outputs: PerPrayerAlertsSection component.
 * Constraints: Presentation-only — no state, no behavior change from the
 *   pre-extraction inline JSX. Rendered only while notificationsEnabled (parent-gated).
 */

import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import type { ThemeColors } from '../../../../constants/colors';
import type { useTranslation } from '../../../../i18n';
import { ADHAN_SOUNDS } from '../../../../constants';
import { PRAYER_LABEL_KEYS, NOTIFIABLE_PRAYERS as PRAYER_NAMES } from '../../../../constants/prayers';
import { formatClock } from '../../../jumuah/timeCycle';
import type { PrayerName } from '../../../../types/prayer';
import type { computeNightTimes } from '../../../../lib/notifications/nightTimes';
import type { NotificationSettingsStyles } from '../NotificationSettingsScreen.styles';

/** Render a Date as a short local clock (e.g. "3:47 AM"). */
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface PerPrayerAlertsSectionProps {
  t: ReturnType<typeof useTranslation>['t'];
  colors: ThemeColors;
  styles: NotificationSettingsStyles;
  notificationAdvanceMinutes: Record<PrayerName, number>;
  iqamahOffsetMinutes: Record<PrayerName, number>;
  perPrayerNotificationEnabled: Record<PrayerName, boolean>;
  onAdvanceCycle: (name: PrayerName) => void;
  onIqamahCycle: (name: PrayerName) => void;
  onPrayerToggle: (name: PrayerName, value: boolean) => void;
  adhanNotificationSoundId: string;
  onAdhanSoundSelect: (id: string) => void;
  suhoorAlarmEnabled: boolean;
  suhoorMinutesBeforeFajr: number;
  onSuhoorToggle: (value: boolean) => void;
  onSuhoorCycle: () => void;
  tahajjudAlarmEnabled: boolean;
  tahajjudMode: 'lastThird' | 'custom';
  onTahajjudToggle: (value: boolean) => void;
  onTahajjudModeToggle: () => void;
  onTahajjudTimeCycle: () => void;
  tahajjudCustomTime: string;
  nightTimes: ReturnType<typeof computeNightTimes> | null;
}

export function PerPrayerAlertsSection({
  t, colors, styles,
  notificationAdvanceMinutes, iqamahOffsetMinutes, perPrayerNotificationEnabled,
  onAdvanceCycle, onIqamahCycle, onPrayerToggle,
  adhanNotificationSoundId, onAdhanSoundSelect,
  suhoorAlarmEnabled, suhoorMinutesBeforeFajr, onSuhoorToggle, onSuhoorCycle,
  tahajjudAlarmEnabled, tahajjudMode, onTahajjudToggle, onTahajjudModeToggle, onTahajjudTimeCycle,
  tahajjudCustomTime, nightTimes,
}: PerPrayerAlertsSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.notifications.perPrayerAlerts')}</Text>
      {PRAYER_NAMES.map((name) => (
        <View key={name} style={styles.prayerRow}>
          <Text style={styles.prayerLabel}>{t(PRAYER_LABEL_KEYS[name])}</Text>
          <View style={styles.prayerControls}>
            <TouchableOpacity
              onPress={() => onAdvanceCycle(name)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.notifications.leadTimeAccessibilityLabel', {
                prayer: t(PRAYER_LABEL_KEYS[name]), minutes: notificationAdvanceMinutes[name] ?? 0,
              })}
            >
              <Text style={styles.advanceLabel}>{t('screens.notifications.minutesBefore', { count: notificationAdvanceMinutes[name] ?? 0 })}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onIqamahCycle(name)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.notifications.iqamahAccessibilityLabel', {
                prayer: t(PRAYER_LABEL_KEYS[name]),
                status: (iqamahOffsetMinutes[name] ?? 0) === 0
                  ? t('screens.notifications.iqamahOff')
                  : t('screens.notifications.iqamahAfter', { count: iqamahOffsetMinutes[name] }),
              })}
            >
              <Text style={styles.advanceLabel}>
                {(iqamahOffsetMinutes[name] ?? 0) === 0 ? t('screens.notifications.iqamahOff') : t('screens.notifications.iqamahAfter', { count: iqamahOffsetMinutes[name] })}
              </Text>
            </TouchableOpacity>
            <Switch
              value={perPrayerNotificationEnabled[name] ?? false}
              onValueChange={(v) => onPrayerToggle(name, v)}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={t('screens.notifications.enableAccessibilityLabel', { prayer: t(PRAYER_LABEL_KEYS[name]) })}
            />
          </View>
        </View>
      ))}

      {/* Adhan sound picker */}
      <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.notifications.adhanSoundTitle')}</Text>
      <Text style={styles.sectionSub}>{t('screens.notifications.adhanSoundSub')}</Text>
      {ADHAN_SOUNDS.map((sound) => (
        <TouchableOpacity
          key={sound.id}
          style={[styles.soundRow, adhanNotificationSoundId === sound.id && styles.soundRowSelected]}
          onPress={() => onAdhanSoundSelect(sound.id)}
          accessibilityRole="radio"
          accessibilityState={{ selected: adhanNotificationSoundId === sound.id }}
          accessibilityLabel={t(sound.labelKey)}
        >
          <Text style={styles.soundLabel}>{t(sound.labelKey)}</Text>
          {adhanNotificationSoundId === sound.id && <Text style={styles.soundCheck}>✓</Text>}
        </TouchableOpacity>
      ))}

      {/* Smart alarms — Suhoor / Tahajjud */}
      <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.notifications.smartAlarmsTitle')}</Text>
      <View style={styles.prayerRow}>
        <View style={styles.smartLeft}>
          <Text style={styles.prayerLabel}>{t('screens.notifications.suhoorLabel')}</Text>
          <Text style={styles.smartSub}>{t('screens.notifications.suhoorSub')}</Text>
        </View>
        <View style={styles.prayerControls}>
          {suhoorAlarmEnabled && (
            <TouchableOpacity
              onPress={onSuhoorCycle}
              accessibilityRole="button"
              accessibilityLabel={t('screens.notifications.suhoorBefore', { count: suhoorMinutesBeforeFajr })}
            >
              <Text style={styles.advanceLabel}>{t('screens.notifications.suhoorBefore', { count: suhoorMinutesBeforeFajr })}</Text>
            </TouchableOpacity>
          )}
          <Switch
            value={suhoorAlarmEnabled}
            onValueChange={onSuhoorToggle}
            trackColor={{ false: colors.background.card, true: colors.brand.mid }}
            thumbColor={colors.brand.light}
            accessibilityLabel={t('screens.notifications.suhoorLabel')}
          />
        </View>
      </View>
      <View style={styles.prayerRow}>
        <View style={styles.smartLeft}>
          <Text style={styles.prayerLabel}>{t('screens.notifications.tahajjudLabel')}</Text>
          <Text style={styles.smartSub}>{t('screens.notifications.tahajjudSub')}</Text>
        </View>
        <View style={styles.prayerControls}>
          {tahajjudAlarmEnabled && (
            <TouchableOpacity
              onPress={onTahajjudModeToggle}
              accessibilityRole="button"
              accessibilityLabel={t(tahajjudMode === 'lastThird' ? 'screens.notifications.tahajjudLastThird' : 'screens.notifications.tahajjudCustom')}
            >
              <Text style={styles.advanceLabel}>
                {tahajjudMode === 'lastThird'
                  ? t('screens.notifications.tahajjudLastThird')
                  : formatClock(tahajjudCustomTime)}
              </Text>
            </TouchableOpacity>
          )}
          <Switch
            value={tahajjudAlarmEnabled}
            onValueChange={onTahajjudToggle}
            trackColor={{ false: colors.background.card, true: colors.brand.mid }}
            thumbColor={colors.brand.light}
            accessibilityLabel={t('screens.notifications.tahajjudLabel')}
          />
        </View>
      </View>
      {tahajjudAlarmEnabled && tahajjudMode === 'custom' && (
        <TouchableOpacity
          style={styles.customTimeRow}
          onPress={onTahajjudTimeCycle}
          accessibilityRole="button"
          accessibilityLabel={`${t('screens.notifications.tahajjudCustom')}: ${formatClock(tahajjudCustomTime)}. Tap to change.`}
        >
          <Text style={styles.smartSub}>{t('screens.notifications.tahajjudCustom')}</Text>
          <Text style={styles.timeValue}>{formatClock(tahajjudCustomTime)}</Text>
        </TouchableOpacity>
      )}

      {/* Night times (display) */}
      <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.notifications.nightTimesTitle')}</Text>
      {nightTimes ? (
        <View style={styles.nightCard}>
          <View style={styles.nightRow}>
            <Text style={styles.nightLabel}>{t('screens.notifications.lastThirdBegins')}</Text>
            <Text style={styles.nightValue}>{fmtTime(nightTimes.lastThirdStart)}</Text>
          </View>
          <View style={styles.nightRow}>
            <Text style={styles.nightLabel}>{t('screens.notifications.middleOfNight')}</Text>
            <Text style={styles.nightValue}>{fmtTime(nightTimes.middleOfNight)}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.sectionSub}>{t('screens.notifications.nightTimesUnavailable')}</Text>
      )}
    </>
  );
}
