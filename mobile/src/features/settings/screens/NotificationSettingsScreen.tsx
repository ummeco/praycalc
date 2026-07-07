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
  Platform, Linking,
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
} from '../../../lib/notifications/PrayerNotificationService';
import { useSettingsStore } from '../store/useSettingsStore';
import { PRAYER_LABEL_KEYS, NOTIFIABLE_PRAYERS as PRAYER_NAMES } from '../../../constants/prayers';
import type { PrayerName } from '../../../types/prayer';

/** Tap-to-cycle options for per-prayer notification lead time. */
const ADVANCE_MINUTE_OPTIONS = [0, 5, 10, 15, 20, 30];

/** Tap-to-cycle options for the iqamah follow-up reminder (0 = off). */
const IQAMAH_OFFSET_OPTIONS = [0, 10, 15, 20, 30];

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
  } = useSettingsStore();
  const [permissionDenied, setPermissionDenied] = useState(false);

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
            accessibilityLabel="Enable prayer notifications"
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
              accessibilityLabel="Open system settings for alarms"
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
          </>
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
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
});
