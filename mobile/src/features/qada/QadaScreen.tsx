/**
 * Purpose: Qada (missed-prayer) tracker — per-prayer owed counter with +/- and
 *   "make up one" actions, plus an optional excused-date-range toggle for periods
 *   (e.g. menstruation, postnatal bleeding, or illness) during which prayers are
 *   not counted as owed.
 * Inputs: useQadaStore (persisted counts + excused ranges).
 * Outputs: QadaScreen — new feature (qada tab, scaffolded route/menu).
 * Constraints: SENSITIVE FIQH — do not alter the wording of qadaFiqhNote/menses
 *   without re-verifying against Sahih al-Bukhari 321 and Sahih Muslim 335. The
 *   ruling encoded here (majority position, ahl us-sunnah): during menstruation
 *   a woman does NOT pray and does NOT make up (qada) those missed prayers later
 *   — but she DOES make up any fasts missed during that time. This screen only
 *   ever excuses PRAYERS from the owed count; it never touches the fasting
 *   tracker (separate feature/store). Always keep the "consult your local
 *   scholar" note visible near the excused-range toggle — this is a majority
 *   summary, not a fatwa for every individual case.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-qada
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import type { PrayerName } from '../../types/prayer';
import { useQadaStore } from './store/useQadaStore';
import { QADA_PRAYERS, totalOutstanding } from './qadaLogic';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function QadaScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const counts = useQadaStore((s) => s.counts);
  const excusedRanges = useQadaStore((s) => s.excusedRanges);
  const adjustCount = useQadaStore((s) => s.adjustCount);
  const makeUpOne = useQadaStore((s) => s.makeUpOne);
  const addExcusedRange = useQadaStore((s) => s.addExcusedRange);
  const removeExcusedRange = useQadaStore((s) => s.removeExcusedRange);

  const [excusedFormOpen, setExcusedFormOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayKey());
  const [endDate, setEndDate] = useState(todayKey());
  const [note, setNote] = useState('');

  const total = useMemo(() => totalOutstanding(counts), [counts]);

  const handleAdjust = useCallback(async (prayer: PrayerName, delta: number) => {
    adjustCount(prayer, delta);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [adjustCount]);

  const handleMakeUp = useCallback(async (prayer: PrayerName) => {
    makeUpOne(prayer);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [makeUpOne]);

  const handleAddRange = useCallback(() => {
    if (!startDate || !endDate || endDate < startDate) return;
    addExcusedRange({ startDate, endDate, note: note.trim() || undefined });
    setNote('');
    setExcusedFormOpen(false);
  }, [startDate, endDate, note, addExcusedRange]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Total outstanding */}
        <View style={styles.totalCard} accessibilityLabel={`Total prayers owed: ${total}`}>
          <Text style={styles.totalNumber}>{total}</Text>
          <Text style={styles.totalLabel}>{t('screens.qada.totalOwed')}</Text>
        </View>

        {/* Per-prayer counters */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.qada.perPrayer')}</Text>
        {QADA_PRAYERS.map((prayer) => (
          <View key={prayer} style={styles.prayerRow} accessibilityLabel={`${prayer}: ${counts[prayer]} owed`}>
            <Text style={styles.prayerName}>{prayer}</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={styles.stepButton}
                onPress={() => handleAdjust(prayer, -1)}
                accessibilityRole="button"
                accessibilityLabel={`Decrease ${prayer} owed count`}
              >
                <Text style={styles.stepButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.countText}>{counts[prayer]}</Text>
              <TouchableOpacity
                style={styles.stepButton}
                onPress={() => handleAdjust(prayer, 1)}
                accessibilityRole="button"
                accessibilityLabel={`Increase ${prayer} owed count`}
              >
                <Text style={styles.stepButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.makeUpButton, counts[prayer] === 0 && styles.makeUpButtonDisabled]}
                onPress={() => handleMakeUp(prayer)}
                disabled={counts[prayer] === 0}
                accessibilityRole="button"
                accessibilityLabel={`Mark one ${prayer} as made up`}
              >
                <Text style={styles.makeUpButtonText}>{t('screens.qada.makeUpOne')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Excused range section */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.qada.excusedTitle')}</Text>
        <Text style={styles.fiqhNote}>{t('screens.qada.fiqhNote')}</Text>
        <Text style={styles.fiqhCitation}>{t('screens.qada.fiqhCitation')}</Text>
        <Text style={styles.scholarNote}>{t('screens.qada.consultScholar')}</Text>

        {excusedRanges.map((r) => (
          <View key={r.id} style={styles.excusedRow} accessibilityLabel={`Excused from ${r.startDate} to ${r.endDate}`}>
            <View style={styles.excusedInfo}>
              <Text style={styles.excusedDates}>{r.startDate} → {r.endDate}</Text>
              {r.note ? <Text style={styles.excusedNote}>{r.note}</Text> : null}
            </View>
            <TouchableOpacity
              onPress={() => removeExcusedRange(r.id)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.qada.removeExcusedRangeAccessibilityLabel')}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {excusedFormOpen ? (
          <View style={styles.excusedForm}>
            <Text style={styles.formLabel}>{t('screens.qada.startDate')}</Text>
            <TextInput
              style={styles.dateInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.qada.startDate')}
            />
            <Text style={styles.formLabel}>{t('screens.qada.endDate')}</Text>
            <TextInput
              style={styles.dateInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.qada.endDate')}
            />
            <Text style={styles.formLabel}>{t('screens.qada.noteOptional')}</Text>
            <TextInput
              style={styles.dateInput}
              value={note}
              onChangeText={setNote}
              placeholder={t('screens.qada.notePlaceholder')}
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.qada.noteOptional')}
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddRange} accessibilityRole="button" accessibilityLabel={t('common.save')}>
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setExcusedFormOpen(false)} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addRangeButton}
            onPress={() => setExcusedFormOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('screens.qada.addExcusedRange')}
          >
            <Text style={styles.addRangeButtonText}>{t('screens.qada.addExcusedRange')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  totalCard: {
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalNumber: { fontSize: 40, fontWeight: '800', color: colors.brand.light },
  totalLabel: { fontSize: 13, color: colors.brand.light + 'CC', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 12, marginTop: 8 },
  prayerRow: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
  },
  prayerName: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 8 },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepButton: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: colors.background.card,
    alignItems: 'center', justifyContent: 'center',
  },
  stepButtonText: { fontSize: 20, fontWeight: '700', color: colors.brand.dark },
  countText: { fontSize: 18, fontWeight: '800', color: colors.text.primary, minWidth: 32, textAlign: 'center' },
  makeUpButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  makeUpButtonDisabled: { backgroundColor: colors.background.card },
  makeUpButtonText: { fontSize: 13, fontWeight: '700', color: colors.text.inverse },
  fiqhNote: { fontSize: 13, color: colors.text.secondary, lineHeight: 19, marginBottom: 6 },
  fiqhCitation: { fontSize: 11, color: colors.text.muted, marginBottom: 8, fontStyle: 'italic' },
  scholarNote: {
    fontSize: 12,
    color: colors.brand.dark,
    fontWeight: '600',
    marginBottom: 16,
    padding: 10,
    backgroundColor: colors.brand.light + '33',
    borderRadius: 8,
  },
  excusedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginBottom: 8,
    minHeight: 44,
  },
  excusedInfo: { flex: 1 },
  excusedDates: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  excusedNote: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  removeButton: { padding: 8, minHeight: 32, justifyContent: 'center' },
  removeButtonText: { fontSize: 13, color: colors.state.error, fontWeight: '600' },
  excusedForm: {
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  formLabel: { fontSize: 12, color: colors.text.muted, marginBottom: 4, marginTop: 8 },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.background.card,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 44,
  },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  saveButton: {
    flex: 1, backgroundColor: colors.brand.dark, borderRadius: 8, paddingVertical: 12,
    alignItems: 'center', minHeight: 44, justifyContent: 'center',
  },
  saveButtonText: { color: colors.text.inverse, fontWeight: '700' },
  cancelButton: {
    flex: 1, borderWidth: 1, borderColor: colors.brand.mid, borderRadius: 8, paddingVertical: 12,
    alignItems: 'center', minHeight: 44, justifyContent: 'center',
  },
  cancelButtonText: { color: colors.brand.mid, fontWeight: '700' },
  addRangeButton: {
    borderWidth: 1,
    borderColor: colors.brand.mid,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  addRangeButtonText: { color: colors.brand.mid, fontWeight: '700' },
});
