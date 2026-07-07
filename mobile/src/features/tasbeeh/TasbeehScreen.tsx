/**
 * Purpose: Digital dhikr counter with haptic feedback, custom dhikr, MMKV persistence.
 *   Also persists a history log of completed dhikr sessions (name/count/timestamp)
 *   and shows a simple history list + today's total dhikr count.
 * Inputs: DhikrPreset constants, user custom dhikr.
 * Outputs: TasbeehScreen — Feature 7 of 20.
 * Constraints: expo-haptics for vibration on increment. MMKV persists count across restarts.
 *   Arabic strings: full tashkeel, textAlign 'right', writingDirection 'rtl'.
 *   History log is append-only, capped at HISTORY_LIMIT most-recent sessions to
 *   bound MMKV storage growth; a "session" is logged only when the target count
 *   is reached (isComplete), never on partial/abandoned counts.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-07-tasbeeh
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { mmkv } from '../../lib/storage/mmkv';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { loadTasbeehHistory, appendTasbeehHistory, getTodayTasbeehTotal, type TasbeehHistoryEntry } from './tasbeehHistory';

// ── Dhikr presets (ahl us-sunnah sources) ────────────────────────────────────

interface DhikrPreset {
  id: string;
  arabic: string;        // Full tashkeel — never split
  transliteration: string;
  translation: string;
  targetCount: number;
  source: string;
}

/**
 * Islamic content gate: all Arabic strings verified Uthmani tashkeel.
 * Sources: Sahih Bukhari + Muslim + Hisn al-Muslim (Ibn al-Qayyim / Sa'id al-Qahtani).
 * Any agent modifying this list MUST re-verify against source before commit.
 */
const DHIKR_PRESETS: DhikrPreset[] = [
  {
    id: 'subhanallah',
    // Source: Sahih Bukhari 6406 — "Subhan Allah" × 33
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    targetCount: 33,
    source: 'Sahih Bukhari 6406',
  },
  {
    id: 'alhamdulillah',
    // Source: Sahih Bukhari 6406 — "Al-Hamdulillah" × 33
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise be to Allah',
    targetCount: 33,
    source: 'Sahih Bukhari 6406',
  },
  {
    id: 'allahuakbar',
    // Source: Sahih Bukhari 6406 — "Allahu Akbar" × 34
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    targetCount: 34,
    source: 'Sahih Bukhari 6406',
  },
  {
    id: 'la_ilaha',
    // Source: Hisn al-Muslim #25 — "La ilaha illallah wahdahu" × 10 (after Fajr/Maghrib)
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "La ilaha illallahu wahdahu la sharika lah",
    translation: 'There is no god but Allah alone, without partner',
    targetCount: 10,
    source: 'Hisn al-Muslim #25',
  },
  {
    id: 'astaghfirullah',
    // Source: Sahih Muslim 2702 — istighfar × 100
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    targetCount: 100,
    source: 'Sahih Muslim 2702',
  },
];

const STORAGE_KEY = 'pc:tasbeeh:session';

interface TasbeehSession {
  dhikrId: string;
  count: number;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TasbeehScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(DHIKR_PRESETS[0]!);
  const [count, setCount] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [history, setHistory] = useState<TasbeehHistoryEntry[]>(loadTasbeehHistory);

  // Restore persisted session on mount
  useEffect(() => {
    const raw = mmkv.getString(STORAGE_KEY);
    if (raw) {
      try {
        const session = JSON.parse(raw) as TasbeehSession;
        const preset = DHIKR_PRESETS.find((p) => p.id === session.dhikrId);
        if (preset) {
          setSelectedPreset(preset);
          setCount(session.count);
          setIsComplete(session.count >= preset.targetCount);
        }
      } catch {
        // Corrupt data — reset silently
      }
    }
  }, []);

  // Persist on every count change
  useEffect(() => {
    mmkv.set(
      STORAGE_KEY,
      JSON.stringify({ dhikrId: selectedPreset.id, count } satisfies TasbeehSession),
    );
  }, [count, selectedPreset.id]);

  const handleIncrement = useCallback(async () => {
    if (isComplete) return;
    const next = count + 1;
    setCount(next);
    if (next >= selectedPreset.targetCount) {
      setIsComplete(true);
      // Session complete — log it to history (only completed sessions are logged).
      const updated = appendTasbeehHistory({
        dhikrId: selectedPreset.id,
        dhikrName: selectedPreset.transliteration,
        count: next,
        completedAt: Date.now(),
      });
      setHistory(updated);
      // Heavy impact on completion
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Light impact on each tap
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [count, isComplete, selectedPreset.targetCount]);

  const handleReset = useCallback(async () => {
    setCount(0);
    setIsComplete(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleSelectPreset = useCallback((preset: DhikrPreset) => {
    setSelectedPreset(preset);
    setCount(0);
    setIsComplete(false);
  }, []);

  const progress = Math.min(count / selectedPreset.targetCount, 1);
  const todayTotal = useMemo(() => getTodayTasbeehTotal(history), [history]);
  const recentHistory = useMemo(() => history.slice(0, 10), [history]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Arabic text — RTL, tashkeel preserved */}
        <View style={styles.arabicContainer}>
          <Text
            style={styles.arabicText}
            accessibilityRole="text"
            accessibilityLabel={`Arabic: ${selectedPreset.transliteration}`}
          >
            {selectedPreset.arabic}
          </Text>
          <Text style={styles.transliteration}>{selectedPreset.transliteration}</Text>
          <Text style={styles.translation}>{selectedPreset.translation}</Text>
          <Text style={styles.source}>{selectedPreset.source}</Text>
        </View>

        {/* Counter display */}
        <TouchableOpacity
          style={[styles.counterButton, isComplete && styles.counterButtonComplete]}
          onPress={handleIncrement}
          disabled={isComplete}
          accessibilityRole="button"
          accessibilityLabel={`Count: ${count} of ${selectedPreset.targetCount}. ${isComplete ? 'Complete' : 'Tap to increment'}`}
          activeOpacity={0.8}
        >
          <Text style={styles.countNumber}>{count}</Text>
          <Text style={styles.targetText}>{t('screens.tasbeeh.of', { count: selectedPreset.targetCount })}</Text>
          {isComplete && <Text style={styles.completeText}>{t('common.complete')}!</Text>}
        </TouchableOpacity>

        {/* Progress bar */}
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: selectedPreset.targetCount, now: count }}
        >
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel={t('screens.tasbeeh.resetCounter')}
        >
          <Text style={styles.resetText}>{t('common.reset')}</Text>
        </TouchableOpacity>

        {/* Preset selector */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.tasbeeh.chooseDhikr')}</Text>
        {DHIKR_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              selectedPreset.id === preset.id && styles.presetCardActive,
            ]}
            onPress={() => handleSelectPreset(preset)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPreset.id === preset.id }}
            accessibilityLabel={`${preset.transliteration}, target ${preset.targetCount}, source ${preset.source}`}
          >
            <Text style={styles.presetArabic}>{preset.arabic}</Text>
            <Text style={styles.presetTranslit}>{preset.transliteration} × {preset.targetCount}</Text>
          </TouchableOpacity>
        ))}

        {/* History */}
        {history.length > 0 && (
          <>
            <View style={styles.todayTotalCard} accessibilityLabel={`Today's dhikr total: ${todayTotal}`}>
              <Text style={styles.todayTotalNumber}>{todayTotal}</Text>
              <Text style={styles.todayTotalLabel}>{t('screens.tasbeeh.todayTotal')}</Text>
            </View>
            <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.tasbeeh.history')}</Text>
            {recentHistory.map((entry, i) => (
              <View
                key={`${entry.completedAt}-${i}`}
                style={styles.historyRow}
                accessibilityLabel={`${entry.dhikrName}: ${entry.count}, ${new Date(entry.completedAt).toLocaleString()}`}
              >
                <Text style={styles.historyName}>{entry.dhikrName}</Text>
                <Text style={styles.historyCount}>× {entry.count}</Text>
                <Text style={styles.historyTime}>
                  {new Date(entry.completedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  arabicContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    width: '100%',
  },
  arabicText: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    fontWeight: '600',
    lineHeight: 52,
    width: '100%',
  },
  transliteration: {
    fontSize: 18,
    color: colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  source: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  counterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.brand.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.brand.deep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  counterButtonComplete: {
    backgroundColor: colors.state.success,
  },
  countNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text.inverse,
  },
  targetText: {
    fontSize: 14,
    color: colors.brand.light,
    marginTop: 2,
  },
  completeText: {
    fontSize: 14,
    color: colors.brand.light,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    width: '80%',
    height: 8,
    backgroundColor: colors.background.card,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.mid,
    borderRadius: 4,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: { fontSize: 16, color: colors.brand.mid, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  presetCard: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    marginBottom: 8,
    minHeight: 44,
  },
  presetCardActive: {
    borderWidth: 2,
    borderColor: colors.brand.mid,
    backgroundColor: colors.brand.light + '22',
  },
  presetArabic: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    lineHeight: 30,
  },
  presetTranslit: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  todayTotalCard: {
    width: '100%',
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  todayTotalNumber: { fontSize: 24, fontWeight: '800', color: colors.brand.light },
  todayTotalLabel: { fontSize: 12, color: colors.brand.light + 'CC', marginTop: 2 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 40,
    gap: 8,
  },
  historyName: { flex: 1, fontSize: 13, color: colors.text.primary, fontWeight: '500' },
  historyCount: { fontSize: 13, color: colors.brand.dark, fontWeight: '700' },
  historyTime: { fontSize: 11, color: colors.text.muted, width: 84, textAlign: 'right' },
});
