/**
 * Purpose: Notification settings screen — per-prayer toggle, pre-reminder times, sound.
 * Inputs: useNotifications(), usePrayerTimes() hooks
 * Outputs: List of prayer rows with enable toggle and trigger selector
 * Constraints: Requesting permission shown inline if not yet granted.
 *   Changes are persisted immediately via useNotifications.updateSettings().
 * SPORT: app/notifications.tsx
 */

import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useNotifications } from '../hooks/useNotifications';
import type { PrayerName, NotifTrigger } from '../types';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Qiyam'];

const TRIGGER_LABELS: Record<NotifTrigger, string> = {
  at_adhan: 'At adhan',
  pre_5: '5 min before',
  pre_10: '10 min before',
  pre_15: '15 min before',
  pre_30: '30 min before',
};

const ALL_TRIGGERS: NotifTrigger[] = ['at_adhan', 'pre_5', 'pre_10', 'pre_15', 'pre_30'];

export default function NotificationsScreen() {
  const { location } = useLocation();
  const { times } = usePrayerTimes(location);
  const { settings, updateSettings, permissionGranted, requestPermission } = useNotifications(times);

  const toggleGlobal = (value: boolean) => {
    updateSettings({ globalEnabled: value });
  };

  const togglePrayer = (name: PrayerName, enabled: boolean) => {
    updateSettings({
      prayers: {
        ...settings.prayers,
        [name]: { ...settings.prayers[name], enabled },
      },
    });
  };

  const toggleTrigger = (name: PrayerName, trigger: NotifTrigger) => {
    const current = settings.prayers[name].triggers;
    const next = current.includes(trigger)
      ? current.filter((t) => t !== trigger)
      : [...current, trigger];
    updateSettings({
      prayers: { ...settings.prayers, [name]: { ...settings.prayers[name], triggers: next } },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Notification Alerts</Text>

        {/* Permission banner */}
        {!permissionGranted && (
          <TouchableOpacity style={styles.permBanner} onPress={requestPermission}>
            <Text style={styles.permText}>🔕 Notifications are disabled. Tap to enable.</Text>
          </TouchableOpacity>
        )}

        {/* Global toggle */}
        <View style={styles.section}>
          <View style={styles.globalRow}>
            <Text style={styles.globalLabel}>All Prayer Alerts</Text>
            <Switch
              value={settings.globalEnabled}
              onValueChange={toggleGlobal}
              trackColor={{ true: '#34a853' }}
            />
          </View>
        </View>

        {/* Per-prayer rows */}
        <View style={styles.section}>
          {PRAYER_NAMES.map((name) => {
            const config = settings.prayers[name];
            return (
              <View key={name} style={styles.prayerBlock}>
                <View style={styles.prayerHeader}>
                  <Text style={styles.prayerName}>{name}</Text>
                  <Switch
                    value={config.enabled && settings.globalEnabled}
                    onValueChange={(v) => togglePrayer(name, v)}
                    disabled={!settings.globalEnabled}
                    trackColor={{ true: '#34a853' }}
                  />
                </View>
                {config.enabled && settings.globalEnabled && (
                  <View style={styles.triggers}>
                    {ALL_TRIGGERS.map((trigger) => {
                      const active = config.triggers.includes(trigger);
                      return (
                        <TouchableOpacity
                          key={trigger}
                          style={[styles.triggerChip, active && styles.triggerChipActive]}
                          onPress={() => toggleTrigger(name, trigger)}
                        >
                          <Text style={[styles.triggerLabel, active && styles.triggerLabelActive]}>
                            {TRIGGER_LABELS[trigger]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d2015' },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 22, color: '#fff', fontWeight: '600', marginBottom: 4 },
  permBanner: {
    backgroundColor: 'rgba(220,150,50,0.15)',
    borderRadius: 10,
    padding: 14,
  },
  permText: { color: 'rgba(255,200,80,0.9)', fontSize: 14, textAlign: 'center' },
  section: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  globalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  globalLabel: { fontSize: 16, color: '#fff', fontWeight: '500' },
  prayerBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerName: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  triggers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  triggerChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  triggerChipActive: {
    backgroundColor: 'rgba(52,168,83,0.25)',
    borderColor: '#34a853',
  },
  triggerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  triggerLabelActive: { color: '#34a853', fontWeight: '600' },
});
