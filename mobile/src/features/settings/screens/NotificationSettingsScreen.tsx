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

import React, { useState, useCallback } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  Platform, Linking,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { PermissionDeniedState } from '../../../components/states';
import {
  requestNotificationPermission,
  schedulePrayerNotifications,
  setupNotificationChannel,
} from '../../../lib/notifications/PrayerNotificationService';
import { useSettingsStore } from '../store/useSettingsStore';
import type { PrayerName } from '../../../types/prayer';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function NotificationSettingsScreen() {
  const { notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [advanceMinutes, setAdvanceMinutes] = useState<Record<PrayerName, number>>({
    Fajr: 10, Sunrise: 0, Dhuhr: 5, Asr: 5, Maghrib: 5, Isha: 5,
  });
  const [enabledPrayers, setEnabledPrayers] = useState<Record<PrayerName, boolean>>({
    Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true,
  });

  const handleMasterToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      await setupNotificationChannel();
      await schedulePrayerNotifications();
    }
    setNotificationsEnabled(value);
    setPermissionDenied(false);
  }, [setNotificationsEnabled]);

  const handlePrayerToggle = useCallback(async (name: PrayerName, value: boolean) => {
    setEnabledPrayers((prev) => ({ ...prev, [name]: value }));
    if (notificationsEnabled) {
      await schedulePrayerNotifications();
    }
  }, [notificationsEnabled]);

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
            <Text style={styles.masterLabel}>Prayer Notifications</Text>
            <Text style={styles.masterSub}>
              Receive alerts before each prayer time
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
            thumbColor={Colors.brand.light}
            accessibilityLabel="Enable prayer notifications"
          />
        </View>

        {/* Android exact alarm note */}
        {Platform.OS === 'android' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              On Android 12+, allow "Alarms & Reminders" in system settings for exact prayer time alerts.
            </Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={openSystemSettings}
              accessibilityRole="button"
              accessibilityLabel="Open system settings for alarms"
            >
              <Text style={styles.linkText}>Open System Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Per-prayer toggles */}
        {notificationsEnabled && (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">Per-Prayer Alerts</Text>
            {PRAYER_NAMES.map((name) => (
              <View key={name} style={styles.prayerRow}>
                <Text style={styles.prayerLabel}>{name}</Text>
                <View style={styles.prayerControls}>
                  <Text style={styles.advanceLabel}>{advanceMinutes[name]}m before</Text>
                  <Switch
                    value={enabledPrayers[name] ?? false}
                    onValueChange={(v) => handlePrayerToggle(name, v)}
                    trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
                    thumbColor={Colors.brand.light}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  masterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
  },
  masterLeft: { flex: 1, marginRight: 12 },
  masterLabel: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  masterSub: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
  infoCard: {
    backgroundColor: Colors.brand.light + '33',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 13, color: Colors.brand.dark, lineHeight: 20 },
  linkBtn: { marginTop: 8, minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 14, color: Colors.brand.dark, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.card,
    minHeight: 56,
  },
  prayerLabel: { fontSize: 16, color: Colors.text.primary, fontWeight: '500' },
  prayerControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  advanceLabel: { fontSize: 13, color: Colors.text.muted },
});
