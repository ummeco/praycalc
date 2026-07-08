/**
 * Purpose: Prayer notification settings — enable/disable per prayer, advance minutes,
 *   permission prompt, deep-link to system settings for exact alarm (Android API 31+).
 * Inputs: useSettingsStore, PrayerNotificationService.
 * Outputs: NotificationSettingsScreen — Feature 15 of 20 (notification UI).
 * Constraints: Permission gate during onboarding + this screen.
 *   Android exact alarms: SCHEDULE_EXACT_ALARM in app.json.
 *   7 UI states.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-15-notifications
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, Switch, TouchableOpacity, SafeAreaView, ScrollView,
  Platform, Linking, Alert,
} from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { PermissionDeniedState } from '../../../components/states';
import {
  registerRescheduleTask,
  requestNotificationPermission,
  schedulePrayerNotifications,
  setupNotificationChannel,
  openBatteryOptimizationSettings,
  fireTestAdhanNotification,
} from '../../../lib/notifications/PrayerNotificationService';
import { useSettingsStore } from '../store/useSettingsStore';
import { useActiveLocation } from '../store/useSettingsStore';
import { computeNightTimes } from '../../../lib/notifications/nightTimes';
import { calculatePrayerTimes } from '../../../lib/prayer-calc';
import { resolveTimezoneOffset } from '../../../lib/timezone';
import { cycleClock } from '../../jumuah/timeCycle';
import type { CalcMethodKey } from '../../../constants/methods';
import type { PrayerName } from '../../../types/prayer';
import { createStyles } from './NotificationSettingsScreen.styles';
import { BatteryOptimizationCard } from './components/BatteryOptimizationCard';
import { PerPrayerAlertsSection } from './components/PerPrayerAlertsSection';

/** Tap-to-cycle options for per-prayer notification lead time. */
const ADVANCE_MINUTE_OPTIONS = [0, 5, 10, 15, 20, 30];

/** Tap-to-cycle options for the iqamah follow-up reminder (0 = off). */
const IQAMAH_OFFSET_OPTIONS = [0, 10, 15, 20, 30];

/** Tap-to-cycle options for the Suhoor pre-Fajr alarm lead time (minutes). */
const SUHOOR_MINUTE_OPTIONS = [30, 45, 60, 75, 90];

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    perPrayerNotificationEnabled,
    setPerPrayerNotificationEnabled,
    notificationAdvanceMinutes,
    setNotificationAdvanceMinutes,
    iqamahOffsetMinutes,
    setIqamahOffsetMinutes,
    adhanNotificationSoundId,
    setAdhanNotificationSoundId,
    suhoorAlarmEnabled,
    setSuhoorAlarmEnabled,
    suhoorMinutesBeforeFajr,
    setSuhoorMinutesBeforeFajr,
    tahajjudAlarmEnabled,
    setTahajjudAlarmEnabled,
    tahajjudMode,
    setTahajjudMode,
  } = useSettingsStore();
  const location = useActiveLocation();
  const settings = useSettingsStore();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [batteryHelpDismissed, setBatteryHelpDismissed] = useState(false);

  /** Reschedule the window if notifications are on (guarded, fire-and-forget). */
  const reschedule = useCallback(() => {
    if (notificationsEnabled) void schedulePrayerNotifications().catch(() => undefined);
  }, [notificationsEnabled]);

  /**
   * Tonight's night divisions (last third + middle) for display. Uses today's
   * Maghrib and tomorrow's Fajr (the night crosses midnight), honouring the user's
   * method/madhab/high-lat/custom-angle settings — same inputs the scheduler uses.
   */
  const nightTimes = useMemo(() => {
    if (!location) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const custom = settings.method === 'Custom'
      ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
      : undefined;
    const calc = (d: Date) => calculatePrayerTimes(
      d, location.latitude, location.longitude, resolveTimezoneOffset(location.timezone, d),
      settings.method as CalcMethodKey, settings.madhab, settings.highLatRule, custom,
      settings.prayerMinuteAdjustments,
    );
    const maghrib = calc(today).Maghrib;
    const fajr = calc(tomorrow).Fajr;
    if (!(maghrib instanceof Date) || !(fajr instanceof Date)) return null;
    if (Number.isNaN(maghrib.getTime()) || Number.isNaN(fajr.getTime())) return null;
    return computeNightTimes(maghrib, fajr);
  }, [location, settings.method, settings.madhab, settings.highLatRule,
    settings.customFajrAngle, settings.customIshaAngle, settings.prayerMinuteAdjustments]);

  const handleSuhoorToggle = useCallback((v: boolean) => {
    setSuhoorAlarmEnabled(v);
    reschedule();
  }, [setSuhoorAlarmEnabled, reschedule]);

  const handleSuhoorCycle = useCallback(() => {
    const idx = SUHOOR_MINUTE_OPTIONS.indexOf(suhoorMinutesBeforeFajr);
    const next = SUHOOR_MINUTE_OPTIONS[(idx + 1) % SUHOOR_MINUTE_OPTIONS.length] ?? 45;
    setSuhoorMinutesBeforeFajr(next);
    reschedule();
  }, [suhoorMinutesBeforeFajr, setSuhoorMinutesBeforeFajr, reschedule]);

  const handleTahajjudToggle = useCallback((v: boolean) => {
    setTahajjudAlarmEnabled(v);
    reschedule();
  }, [setTahajjudAlarmEnabled, reschedule]);

  const handleTahajjudModeToggle = useCallback(() => {
    setTahajjudMode(tahajjudMode === 'lastThird' ? 'custom' : 'lastThird');
    reschedule();
  }, [tahajjudMode, setTahajjudMode, reschedule]);

  const handleTahajjudTimeCycle = useCallback(() => {
    useSettingsStore.getState().setTahajjudCustomTime(cycleClock(useSettingsStore.getState().tahajjudCustomTime));
    reschedule();
  }, [reschedule]);

  const handleAdhanSoundSelect = useCallback((id: string) => {
    setAdhanNotificationSoundId(id);
    reschedule();
  }, [setAdhanNotificationSoundId, reschedule]);

  const handleTestAdhan = useCallback(() => {
    void fireTestAdhanNotification().catch(() => undefined);
    Alert.alert(t('screens.notifications.testAdhanButton'), t('screens.notifications.testAdhanScheduled'));
  }, [t]);

  const handleMasterToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      await setupNotificationChannel();
      // Midnight background task keeps the 3-day window rolling even if the
      // app stays closed (also re-registered on every app start in _layout).
      await registerRescheduleTask();
      await schedulePrayerNotifications();
    }
    setNotificationsEnabled(value);
    setPermissionDenied(false);
  }, [setNotificationsEnabled]);

  const handlePrayerToggle = useCallback(async (name: PrayerName, value: boolean) => {
    setPerPrayerNotificationEnabled(name, value);
    if (notificationsEnabled) {
      await schedulePrayerNotifications();
    }
  }, [notificationsEnabled, setPerPrayerNotificationEnabled]);

  const handleAdvanceCycle = useCallback(async (name: PrayerName) => {
    const current = notificationAdvanceMinutes[name] ?? 0;
    const idx = ADVANCE_MINUTE_OPTIONS.indexOf(current);
    const next = ADVANCE_MINUTE_OPTIONS[(idx + 1) % ADVANCE_MINUTE_OPTIONS.length] ?? 0;
    setNotificationAdvanceMinutes(name, next);
    if (notificationsEnabled) {
      await schedulePrayerNotifications();
    }
  }, [notificationAdvanceMinutes, notificationsEnabled, setNotificationAdvanceMinutes]);

  const handleIqamahCycle = useCallback(async (name: PrayerName) => {
    const current = iqamahOffsetMinutes[name] ?? 0;
    const idx = IQAMAH_OFFSET_OPTIONS.indexOf(current);
    const next = IQAMAH_OFFSET_OPTIONS[(idx + 1) % IQAMAH_OFFSET_OPTIONS.length] ?? 0;
    setIqamahOffsetMinutes(name, next);
    if (notificationsEnabled) {
      await schedulePrayerNotifications();
    }
  }, [iqamahOffsetMinutes, notificationsEnabled, setIqamahOffsetMinutes]);

  const openSystemSettings = useCallback(() => {
    if (Platform.OS === 'android') {
      void Linking.openSettings();
    } else {
      void Linking.openURL('app-settings:');
    }
  }, []);

  if (permissionDenied) {
    return (
      <PermissionDeniedState
        permission="Notifications"
        onOpenSettings={openSystemSettings}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Master toggle */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <Text style={styles.masterLabel}>{t('screens.notifications.masterLabel')}</Text>
            <Text style={styles.masterSub}>
              {t('screens.notifications.masterSub')}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{ false: colors.background.card, true: colors.brand.mid }}
            thumbColor={colors.brand.light}
            accessibilityLabel={t('screens.notifications.masterAccessibilityLabel')}
          />
        </View>

        {/* Android exact alarm note */}
        {Platform.OS === 'android' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {t('screens.notifications.androidExactAlarm')}
            </Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={openSystemSettings}
              accessibilityRole="button"
              accessibilityLabel={t('screens.notifications.openSystemSettingsAccessibilityLabel')}
            >
              <Text style={styles.linkText}>{t('screens.notifications.openSystemSettings')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Per-prayer toggles + adhan sound + smart alarms + night times */}
        {notificationsEnabled && (
          <PerPrayerAlertsSection
            t={t}
            colors={colors}
            styles={styles}
            notificationAdvanceMinutes={notificationAdvanceMinutes}
            iqamahOffsetMinutes={iqamahOffsetMinutes}
            perPrayerNotificationEnabled={perPrayerNotificationEnabled}
            onAdvanceCycle={handleAdvanceCycle}
            onIqamahCycle={handleIqamahCycle}
            onPrayerToggle={handlePrayerToggle}
            adhanNotificationSoundId={adhanNotificationSoundId}
            onAdhanSoundSelect={handleAdhanSoundSelect}
            suhoorAlarmEnabled={suhoorAlarmEnabled}
            suhoorMinutesBeforeFajr={suhoorMinutesBeforeFajr}
            onSuhoorToggle={handleSuhoorToggle}
            onSuhoorCycle={handleSuhoorCycle}
            tahajjudAlarmEnabled={tahajjudAlarmEnabled}
            tahajjudMode={tahajjudMode}
            onTahajjudToggle={handleTahajjudToggle}
            onTahajjudModeToggle={handleTahajjudModeToggle}
            onTahajjudTimeCycle={handleTahajjudTimeCycle}
            tahajjudCustomTime={settings.tahajjudCustomTime}
            nightTimes={nightTimes}
          />
        )}

        {/* Reliability / battery-optimization education (Android) + Test adhan */}
        {notificationsEnabled && Platform.OS === 'android' && !batteryHelpDismissed && (
          <BatteryOptimizationCard
            t={t}
            styles={styles}
            onOpenSystemSettings={openSystemSettings}
            onOpenBatterySettings={() => void openBatteryOptimizationSettings()}
            onDismiss={() => setBatteryHelpDismissed(true)}
          />
        )}

        {notificationsEnabled && (
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestAdhan}
            accessibilityRole="button"
            accessibilityLabel={t('screens.notifications.testAdhanButton')}
          >
            <Text style={styles.testBtnText}>{t('screens.notifications.testAdhanButton')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
