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
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  Platform, Linking, Alert,
} from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
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
import { ADHAN_SOUNDS } from '../../../constants';
import { PRAYER_LABEL_KEYS, NOTIFIABLE_PRAYERS as PRAYER_NAMES } from '../../../constants/prayers';
import { cycleClock, formatClock } from '../../jumuah/timeCycle';
import type { CalcMethodKey } from '../../../constants/methods';
import type { PrayerName } from '../../../types/prayer';

/** Tap-to-cycle options for per-prayer notification lead time. */
const ADVANCE_MINUTE_OPTIONS = [0, 5, 10, 15, 20, 30];

/** Tap-to-cycle options for the iqamah follow-up reminder (0 = off). */
const IQAMAH_OFFSET_OPTIONS = [0, 10, 15, 20, 30];

/** Tap-to-cycle options for the Suhoor pre-Fajr alarm lead time (minutes). */
const SUHOOR_MINUTE_OPTIONS = [30, 45, 60, 75, 90];

/** Render a Date as a short local clock (e.g. "3:47 AM"). */
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

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

        {/* Per-prayer toggles */}
        {notificationsEnabled && (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.notifications.perPrayerAlerts')}</Text>
            {PRAYER_NAMES.map((name) => (
              <View key={name} style={styles.prayerRow}>
                <Text style={styles.prayerLabel}>{t(PRAYER_LABEL_KEYS[name])}</Text>
                <View style={styles.prayerControls}>
                  <TouchableOpacity
                    onPress={() => handleAdvanceCycle(name)}
                    accessibilityRole="button"
                    accessibilityLabel={`${name} notification lead time, ${notificationAdvanceMinutes[name] ?? 0} minutes before. Tap to change.`}
                  >
                    <Text style={styles.advanceLabel}>{t('screens.notifications.minutesBefore', { count: notificationAdvanceMinutes[name] ?? 0 })}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleIqamahCycle(name)}
                    accessibilityRole="button"
                    accessibilityLabel={`${name} iqamah reminder, ${(iqamahOffsetMinutes[name] ?? 0) === 0 ? 'off' : `${iqamahOffsetMinutes[name]} minutes after adhan`}. Tap to change.`}
                  >
                    <Text style={styles.advanceLabel}>
                      {(iqamahOffsetMinutes[name] ?? 0) === 0 ? t('screens.notifications.iqamahOff') : t('screens.notifications.iqamahAfter', { count: iqamahOffsetMinutes[name] })}
                    </Text>
                  </TouchableOpacity>
                  <Switch
                    value={perPrayerNotificationEnabled[name] ?? false}
                    onValueChange={(v) => handlePrayerToggle(name, v)}
                    trackColor={{ false: colors.background.card, true: colors.brand.mid }}
                    thumbColor={colors.brand.light}
                    accessibilityLabel={`Enable ${name} notification`}
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
                onPress={() => handleAdhanSoundSelect(sound.id)}
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
                    onPress={handleSuhoorCycle}
                    accessibilityRole="button"
                    accessibilityLabel={t('screens.notifications.suhoorBefore', { count: suhoorMinutesBeforeFajr })}
                  >
                    <Text style={styles.advanceLabel}>{t('screens.notifications.suhoorBefore', { count: suhoorMinutesBeforeFajr })}</Text>
                  </TouchableOpacity>
                )}
                <Switch
                  value={suhoorAlarmEnabled}
                  onValueChange={handleSuhoorToggle}
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
                    onPress={handleTahajjudModeToggle}
                    accessibilityRole="button"
                    accessibilityLabel={t(tahajjudMode === 'lastThird' ? 'screens.notifications.tahajjudLastThird' : 'screens.notifications.tahajjudCustom')}
                  >
                    <Text style={styles.advanceLabel}>
                      {tahajjudMode === 'lastThird'
                        ? t('screens.notifications.tahajjudLastThird')
                        : formatClock(settings.tahajjudCustomTime)}
                    </Text>
                  </TouchableOpacity>
                )}
                <Switch
                  value={tahajjudAlarmEnabled}
                  onValueChange={handleTahajjudToggle}
                  trackColor={{ false: colors.background.card, true: colors.brand.mid }}
                  thumbColor={colors.brand.light}
                  accessibilityLabel={t('screens.notifications.tahajjudLabel')}
                />
              </View>
            </View>
            {tahajjudAlarmEnabled && tahajjudMode === 'custom' && (
              <TouchableOpacity
                style={styles.customTimeRow}
                onPress={handleTahajjudTimeCycle}
                accessibilityRole="button"
                accessibilityLabel={`${t('screens.notifications.tahajjudCustom')}: ${formatClock(settings.tahajjudCustomTime)}. Tap to change.`}
              >
                <Text style={styles.smartSub}>{t('screens.notifications.tahajjudCustom')}</Text>
                <Text style={styles.timeValue}>{formatClock(settings.tahajjudCustomTime)}</Text>
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
        )}

        {/* Reliability / battery-optimization education (Android) + Test adhan */}
        {notificationsEnabled && Platform.OS === 'android' && !batteryHelpDismissed && (
          <View style={styles.batteryCard}>
            <Text style={styles.batteryTitle}>{t('screens.notifications.batteryTitle')}</Text>
            <Text style={styles.infoText}>{t('screens.notifications.batteryIntro')}</Text>
            <Text style={styles.batteryStep}>1. {t('screens.notifications.batteryStepAlarms')}</Text>
            <Text style={styles.batteryStep}>2. {t('screens.notifications.batteryStepOptimization')}</Text>
            <Text style={styles.batteryOem}>{t('screens.notifications.batteryOemNote')}</Text>
            <View style={styles.batteryButtons}>
              <TouchableOpacity
                style={styles.batteryBtn}
                onPress={openSystemSettings}
                accessibilityRole="button"
                accessibilityLabel={t('screens.notifications.openExactAlarm')}
              >
                <Text style={styles.linkText}>{t('screens.notifications.openExactAlarm')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.batteryBtn}
                onPress={() => void openBatteryOptimizationSettings()}
                accessibilityRole="button"
                accessibilityLabel={t('screens.notifications.openBatterySettings')}
              >
                <Text style={styles.linkText}>{t('screens.notifications.openBatterySettings')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => setBatteryHelpDismissed(true)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.notifications.dismiss')}
            >
              <Text style={styles.dismissText}>{t('screens.notifications.dismiss')}</Text>
            </TouchableOpacity>
          </View>
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  masterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
  },
  masterLeft: { flex: 1, marginRight: 12 },
  masterLabel: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  masterSub: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  infoCard: {
    backgroundColor: colors.brand.light + '33',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 13, color: colors.brand.dark, lineHeight: 20 },
  linkBtn: { marginTop: 8, minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 14, color: colors.brand.dark, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8, marginTop: 20 },
  sectionSub: { fontSize: 13, color: colors.text.muted, marginBottom: 8, lineHeight: 18 },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 56,
  },
  prayerLabel: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  prayerControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  advanceLabel: { fontSize: 13, color: colors.text.muted, padding: 4 },
  // Adhan sound picker
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    marginBottom: 6,
    minHeight: 48,
  },
  soundRowSelected: { borderWidth: 2, borderColor: colors.brand.mid, backgroundColor: colors.brand.light + '22' },
  soundLabel: { fontSize: 15, color: colors.text.primary },
  soundCheck: { fontSize: 16, color: colors.brand.mid, fontWeight: '700' },
  // Smart alarms
  smartLeft: { flex: 1, marginRight: 12 },
  smartSub: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  customTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  timeValue: { fontSize: 15, fontWeight: '600', color: colors.brand.dark },
  // Night times
  nightCard: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: 12 },
  nightRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  nightLabel: { fontSize: 14, color: colors.text.secondary },
  nightValue: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  // Battery education
  batteryCard: {
    backgroundColor: colors.state.warning + '22',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  batteryTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  batteryStep: { fontSize: 13, color: colors.text.primary, lineHeight: 20, marginTop: 6 },
  batteryOem: { fontSize: 12, color: colors.text.muted, lineHeight: 18, marginTop: 10 },
  batteryButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  batteryBtn: { minHeight: 44, justifyContent: 'center' },
  dismissBtn: { marginTop: 10, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-end' },
  dismissText: { fontSize: 14, color: colors.text.muted, fontWeight: '600' },
  // Test adhan
  testBtn: {
    marginTop: 20,
    backgroundColor: colors.brand.mid,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  testBtnText: { fontSize: 15, fontWeight: '700', color: colors.text.inverse },
});
