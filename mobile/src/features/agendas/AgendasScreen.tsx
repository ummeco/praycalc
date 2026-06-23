/**
 * Purpose: Prayer agenda integration — add salah blocks to device calendar via expo-calendar.
 * Inputs: expo-calendar permission, prayer times, user preferences for which prayers to add.
 * Outputs: AgendasScreen — Feature 18 of 20.
 * Constraints: expo-calendar requires NSCalendarsFullAccessUsageDescription (iOS).
 *   Calendar permission gate. 7 UI states.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-18-agendas
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import * as Calendar from 'expo-calendar';
import { Colors } from '../../constants/colors';
import { PermissionDeniedState, LoadingState } from '../../components/states';
import { calculatePrayerTimes } from '../../lib/prayer-calc';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import type { PrayerName } from '../../types/prayer';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_DURATION_MINS = 20; // Block 20 min per prayer on calendar

export default function AgendasScreen() {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [enabledPrayers, setEnabledPrayers] = useState<Record<PrayerName, boolean>>({
    Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true,
  });
  const [syncing, setSyncing] = useState(false);
  const { location } = useSettingsStore();

  useEffect(() => {
    void (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
    })();
  }, []);

  const handleAddToCalendar = useCallback(async () => {
    if (!location) {
      Alert.alert('Location required', 'Set your city in Settings to add prayer times to calendar.');
      return;
    }
    setSyncing(true);
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((c: Calendar.Calendar) => c.allowsModifications) ?? calendars[0];
      if (!defaultCalendar) {
        Alert.alert('No calendar found', 'No writable calendar found on this device.');
        return;
      }

      const today = new Date();
      const prayerTimes = calculatePrayerTimes(
        today,
        location.latitude,
        location.longitude,
        parseFloat(location.timezone) || 0,
        'MWL',
      );

      let added = 0;
      for (const name of PRAYER_NAMES) {
        if (!enabledPrayers[name]) continue;
        const time = prayerTimes[name as keyof typeof prayerTimes];
        if (!(time instanceof Date)) continue;
        const startDate = time;
        const endDate = new Date(time.getTime() + PRAYER_DURATION_MINS * 60 * 1000);
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `${name} Prayer`,
          startDate,
          endDate,
          timeZone: location.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          alarms: [{ relativeOffset: -5 }], // 5 min reminder
          notes: 'Salah time — PrayCalc',
        });
        added++;
      }
      Alert.alert('Done', `Added ${added} prayer times to your calendar.`);
    } catch (e) {
      Alert.alert('Error', (e as Error).message ?? 'Failed to add to calendar.');
    } finally {
      setSyncing(false);
    }
  }, [location, enabledPrayers]);

  if (permissionStatus === 'unknown') return <LoadingState message="Checking calendar permission..." />;
  if (permissionStatus === 'denied') {
    return <PermissionDeniedState permission="Calendar" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title} accessibilityRole="header">Prayer Calendar</Text>
        <Text style={styles.desc}>
          Add salah blocks to your device calendar as reminders.
          Each prayer gets a {PRAYER_DURATION_MINS}-minute event with a 5-minute alert.
        </Text>

        {/* Prayer toggles */}
        <Text style={styles.sectionTitle} accessibilityRole="header">Which prayers to add</Text>
        {PRAYER_NAMES.map((name) => (
          <View key={name} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{name}</Text>
            <Switch
              value={enabledPrayers[name] ?? false}
              onValueChange={(v) => setEnabledPrayers((p) => ({ ...p, [name]: v }))}
              trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
              thumbColor={Colors.brand.light}
              accessibilityLabel={`Add ${name} to calendar`}
            />
          </View>
        ))}

        {!location && (
          <Text style={styles.locationWarning}>
            Set your city in Settings to enable calendar sync.
          </Text>
        )}

        {/* Sync button */}
        <TouchableOpacity
          style={[styles.syncBtn, (!location || syncing) && styles.syncBtnDisabled]}
          onPress={handleAddToCalendar}
          disabled={!location || syncing}
          accessibilityRole="button"
          accessibilityLabel="Add today's prayer times to calendar"
          accessibilityState={{ disabled: !location || syncing }}
        >
          <Text style={styles.syncBtnText}>
            {syncing ? 'Adding...' : "Add Today's Prayers to Calendar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.brand.dark, marginBottom: 8 },
  desc: { fontSize: 14, color: Colors.text.muted, lineHeight: 22, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 10 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.card,
    minHeight: 56,
  },
  toggleLabel: { fontSize: 16, color: Colors.text.primary },
  locationWarning: {
    fontSize: 13,
    color: Colors.state.warning,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  syncBtn: {
    marginTop: 24,
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text.inverse },
});
