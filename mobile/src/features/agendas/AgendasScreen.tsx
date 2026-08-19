/**
 * Purpose: Prayer agenda integration — add salah blocks to device calendar via expo-calendar.
 * Inputs: expo-calendar permission, prayer times, user preferences for which prayers to add.
 * Outputs: AgendasScreen — Feature 18 of 20.
 * Constraints: expo-calendar requires NSCalendarsFullAccessUsageDescription (iOS).
 *   Calendar permission gate. 7 UI states.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-18-agendas
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import * as Calendar from 'expo-calendar';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { PermissionDeniedState, LoadingState } from '../../components/states';
import { calculatePrayerTimes, isPrayerTimeValid } from '../../lib/prayer-calc';
import { resolveTimezoneOffset } from '../../lib/timezone';
import { useSettingsStore, useActiveLocation } from '../settings/store/useSettingsStore';
import { PRAYER_LABEL_KEYS, NOTIFIABLE_PRAYERS as PRAYER_NAMES } from '../../constants/prayers';
import type { PrayerName } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';

const PRAYER_DURATION_MINS = 20; // Block 20 min per prayer on calendar

export default function AgendasScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [enabledPrayers, setEnabledPrayers] = useState<Record<PrayerName, boolean>>({
    Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true,
  });
  const [syncing, setSyncing] = useState(false);
  const location = useActiveLocation();
  const { method, madhab, highLatRule, customFajrAngle, customIshaAngle, prayerMinuteAdjustments } = useSettingsStore();

  useEffect(() => {
    void (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
    })();
  }, []);

  const handleAddToCalendar = useCallback(async () => {
    if (!location) {
      Alert.alert(t('screens.agendas.locationRequired'), t('screens.agendas.locationRequiredBody'));
      return;
    }
    setSyncing(true);
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((c: Calendar.Calendar) => c.allowsModifications) ?? calendars[0];
      if (!defaultCalendar) {
        Alert.alert(t('screens.agendas.noCalendarFound'), t('screens.agendas.noCalendarFoundBody'));
        return;
      }

      const today = new Date();
      const prayerTimes = calculatePrayerTimes(
        today,
        location.latitude,
        location.longitude,
        resolveTimezoneOffset(location.timezone, today),
        method as CalcMethodKey,
        madhab,
        highLatRule,
        method === 'Custom' ? { fajr: customFajrAngle, isha: customIshaAngle } : undefined,
        prayerMinuteAdjustments,
      );

      let added = 0;
      for (const name of PRAYER_NAMES) {
        if (!enabledPrayers[name]) continue;
        const time = prayerTimes[name as keyof typeof prayerTimes];
        // `instanceof Date` alone is not enough: a prayer with no time on this date is an
        // Invalid Date, which would reach createEventAsync and write a corrupt calendar
        // entry (PKG-01). Skip it — there is no event to create.
        if (!isPrayerTimeValid(time)) continue;
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
      Alert.alert(t('screens.agendas.done'), t('screens.agendas.addedCount', { count: added }));
    } catch (e) {
      Alert.alert(t('screens.agendas.error'), (e as Error).message ?? t('screens.agendas.addFailed'));
    } finally {
      setSyncing(false);
    }
  }, [location, enabledPrayers, method, madhab, highLatRule, customFajrAngle, customIshaAngle, prayerMinuteAdjustments, t]);

  if (permissionStatus === 'unknown') return <LoadingState message={t('screens.agendas.checkingPermission')} />;
  if (permissionStatus === 'denied') {
    return <PermissionDeniedState permission="Calendar" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title} accessibilityRole="header">{t('screens.agendas.title')}</Text>
        <Text style={styles.desc}>
          {t('screens.agendas.desc', { minutes: PRAYER_DURATION_MINS })}
        </Text>

        {/* Prayer toggles */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.agendas.whichPrayers')}</Text>
        {PRAYER_NAMES.map((name) => (
          <View key={name} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t(PRAYER_LABEL_KEYS[name])}</Text>
            <Switch
              value={enabledPrayers[name] ?? false}
              onValueChange={(v) => setEnabledPrayers((p) => ({ ...p, [name]: v }))}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={`Add ${t(PRAYER_LABEL_KEYS[name])} to calendar`}
            />
          </View>
        ))}

        {!location && (
          <Text style={styles.locationWarning}>
            {t('screens.agendas.setLocationHint')}
          </Text>
        )}

        {/* Sync button */}
        <TouchableOpacity
          style={[styles.syncBtn, (!location || syncing) && styles.syncBtnDisabled]}
          onPress={handleAddToCalendar}
          disabled={!location || syncing}
          accessibilityRole="button"
          accessibilityLabel={t('screens.agendas.addButtonAccessibilityLabel')}
          accessibilityState={{ disabled: !location || syncing }}
        >
          <Text style={styles.syncBtnText}>
            {syncing ? t('screens.agendas.adding') : t('screens.agendas.addButton')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: colors.brand.dark, marginBottom: 8 },
  desc: { fontSize: 14, color: colors.text.muted, lineHeight: 22, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 10 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 56,
  },
  toggleLabel: { fontSize: 16, color: colors.text.primary },
  locationWarning: {
    fontSize: 13,
    color: colors.state.warning,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  syncBtn: {
    marginTop: 24,
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText: { fontSize: 16, fontWeight: '700', color: colors.text.inverse },
});
