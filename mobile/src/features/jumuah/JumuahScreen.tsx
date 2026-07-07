/**
 * Purpose: Jumu'ah suite — Friday khutbah-time reminder, Surah al-Kahf reminder
 *   (Thursday evening / Friday morning), and a cited checklist of the sunnahs of
 *   Jumu'ah. Reminder toggles/times persist to useSettingsStore and are scheduled
 *   as weekly notifications by PrayerNotificationService (khutbah on Fridays only,
 *   Kahf on the chosen day).
 * Inputs: useSettingsStore (jumuah/kahf fields), schedulePrayerNotifications.
 * Outputs: JumuahScreen (Feature — Jumu'ah suite).
 * Constraints: All Islamic content is cited (Sahih Muslim 854 for Friday's virtue;
 *   the Kahf-light hadith via al-Hakim/al-Bayhaqi, sahih per al-Albani). Static,
 *   reuse-only content — nothing fabricated. Time is edited via a tap-to-cycle
 *   control (no native date-picker dependency), matching NotificationSettingsScreen.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-jumuah
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import { schedulePrayerNotifications } from '../../lib/notifications/PrayerNotificationService';
import { cycleClock, formatClock } from './timeCycle';

/** Cited sunnahs of Jumu'ah — {key} maps to screens.jumuah.checklist.{key}(+Citation). */
const CHECKLIST_ITEMS = [
  'ghusl', 'cleanClothes', 'perfume', 'early', 'kahf', 'salawat', 'dua',
] as const;

export default function JumuahScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    jumuahKhutbahReminderEnabled, setJumuahKhutbahReminderEnabled,
    jumuahKhutbahTime, setJumuahKhutbahTime,
    kahfReminderEnabled, setKahfReminderEnabled,
    kahfReminderDay, setKahfReminderDay,
    kahfReminderTime, setKahfReminderTime,
    notificationsEnabled,
  } = useSettingsStore();

  /** Persist a reminder change, then re-roll the notification window if enabled. */
  const reschedule = useCallback(() => {
    if (notificationsEnabled) void schedulePrayerNotifications().catch(() => undefined);
  }, [notificationsEnabled]);

  const toggleKhutbah = useCallback((v: boolean) => {
    setJumuahKhutbahReminderEnabled(v);
    reschedule();
  }, [setJumuahKhutbahReminderEnabled, reschedule]);

  const cycleKhutbahTime = useCallback(() => {
    setJumuahKhutbahTime(cycleClock(jumuahKhutbahTime));
    reschedule();
  }, [jumuahKhutbahTime, setJumuahKhutbahTime, reschedule]);

  const toggleKahf = useCallback((v: boolean) => {
    setKahfReminderEnabled(v);
    reschedule();
  }, [setKahfReminderEnabled, reschedule]);

  const toggleKahfDay = useCallback(() => {
    setKahfReminderDay(kahfReminderDay === 'fridayMorning' ? 'thursdayEve' : 'fridayMorning');
    reschedule();
  }, [kahfReminderDay, setKahfReminderDay, reschedule]);

  const cycleKahfTime = useCallback(() => {
    setKahfReminderTime(cycleClock(kahfReminderTime));
    reschedule();
  }, [kahfReminderTime, setKahfReminderTime, reschedule]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>{t('screens.jumuah.intro')}</Text>

        {/* Virtue of Jumu'ah (cited) */}
        <View style={styles.virtueCard}>
          <Text style={styles.virtueTitle} accessibilityRole="header">{t('screens.jumuah.virtueTitle')}</Text>
          <Text style={styles.virtueBody}>{t('screens.jumuah.virtueBody')}</Text>
          <Text style={styles.citation}>{t('screens.jumuah.virtueCitation')}</Text>
          <Text style={[styles.virtueBody, styles.virtueSpacer]}>{t('screens.jumuah.kahfVirtueBody')}</Text>
          <Text style={styles.citation}>{t('screens.jumuah.kahfVirtueCitation')}</Text>
        </View>

        {/* Khutbah reminder */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t('screens.jumuah.khutbahTitle')}</Text>
              <Text style={styles.rowSub}>{t('screens.jumuah.khutbahSub')}</Text>
            </View>
            <Switch
              value={jumuahKhutbahReminderEnabled}
              onValueChange={toggleKhutbah}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={t('screens.jumuah.khutbahTitle')}
            />
          </View>
          {jumuahKhutbahReminderEnabled && (
            <TouchableOpacity
              style={styles.timeRow}
              onPress={cycleKhutbahTime}
              accessibilityRole="button"
              accessibilityLabel={`${t('screens.jumuah.reminderTime')}: ${formatClock(jumuahKhutbahTime)}. Tap to change.`}
            >
              <Text style={styles.timeLabel}>{t('screens.jumuah.reminderTime')}</Text>
              <Text style={styles.timeValue}>{formatClock(jumuahKhutbahTime)}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Surah al-Kahf reminder */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t('screens.jumuah.kahfTitle')}</Text>
              <Text style={styles.rowSub}>{t('screens.jumuah.kahfSub')}</Text>
            </View>
            <Switch
              value={kahfReminderEnabled}
              onValueChange={toggleKahf}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={t('screens.jumuah.kahfTitle')}
            />
          </View>
          {kahfReminderEnabled && (
            <>
              <TouchableOpacity
                style={styles.timeRow}
                onPress={toggleKahfDay}
                accessibilityRole="button"
                accessibilityLabel={t(kahfReminderDay === 'fridayMorning' ? 'screens.jumuah.kahfDayFriday' : 'screens.jumuah.kahfDayThursday')}
              >
                <Text style={styles.timeLabel}>{t('screens.jumuah.kahfSub')}</Text>
                <Text style={styles.timeValue}>
                  {t(kahfReminderDay === 'fridayMorning' ? 'screens.jumuah.kahfDayFriday' : 'screens.jumuah.kahfDayThursday')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeRow}
                onPress={cycleKahfTime}
                accessibilityRole="button"
                accessibilityLabel={`${t('screens.jumuah.reminderTime')}: ${formatClock(kahfReminderTime)}. Tap to change.`}
              >
                <Text style={styles.timeLabel}>{t('screens.jumuah.reminderTime')}</Text>
                <Text style={styles.timeValue}>{formatClock(kahfReminderTime)}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Sunnahs checklist (static, cited) */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.jumuah.checklistTitle')}</Text>
        <View style={styles.card}>
          {CHECKLIST_ITEMS.map((key) => (
            <View key={key} style={styles.checkItem}>
              <Text style={styles.checkBullet}>•</Text>
              <View style={styles.checkText}>
                <Text style={styles.checkLabel}>{t(`screens.jumuah.checklist.${key}`)}</Text>
                <Text style={styles.citation}>{t(`screens.jumuah.checklist.${key}Citation`)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 14, color: colors.text.secondary, lineHeight: 20, marginBottom: 16 },
  virtueCard: {
    backgroundColor: colors.brand.light + '22',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  virtueTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  virtueBody: { fontSize: 15, color: colors.text.primary, lineHeight: 22 },
  virtueSpacer: { marginTop: 12 },
  citation: { fontSize: 12, color: colors.text.muted, fontStyle: 'italic', marginTop: 4 },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowText: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  rowSub: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background.card,
    minHeight: 44,
  },
  timeLabel: { fontSize: 14, color: colors.text.secondary },
  timeValue: { fontSize: 16, fontWeight: '600', color: colors.brand.dark },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  checkItem: { flexDirection: 'row', paddingVertical: 8 },
  checkBullet: { fontSize: 16, color: colors.brand.mid, marginRight: 10, lineHeight: 22 },
  checkText: { flex: 1 },
  checkLabel: { fontSize: 15, color: colors.text.primary, lineHeight: 22 },
});
