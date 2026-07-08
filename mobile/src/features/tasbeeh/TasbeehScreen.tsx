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
import { SafeAreaView, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { mmkv } from '../../lib/storage/mmkv';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { createStyles } from './TasbeehScreen.styles';
import { DHIKR_PRESETS, type DhikrPreset } from './dhikrPresets';
import { loadTasbeehHistory, appendTasbeehHistory, getTodayTasbeehTotal, type TasbeehHistoryEntry } from './tasbeehHistory';
import { DhikrCounter } from './components/DhikrCounter';
import { DhikrPicker } from './components/DhikrPicker';
import { TasbeehHistoryPanel } from './components/TasbeehHistoryPanel';

const STORAGE_KEY = 'pc:tasbeeh:session';

interface TasbeehSession {
  dhikrId: string;
  count: number;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TasbeehScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
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
  }, [count, isComplete, selectedPreset.id, selectedPreset.targetCount, selectedPreset.transliteration]);

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
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}
        bounces={false}
      >
        <DhikrCounter
          preset={selectedPreset}
          count={count}
          isComplete={isComplete}
          progress={progress}
          styles={styles}
          t={t}
          onIncrement={handleIncrement}
          onReset={handleReset}
        />

        <DhikrPicker
          presets={DHIKR_PRESETS}
          selectedPresetId={selectedPreset.id}
          styles={styles}
          t={t}
          onSelect={handleSelectPreset}
        />

        <TasbeehHistoryPanel
          history={history}
          todayTotal={todayTotal}
          recentHistory={recentHistory}
          styles={styles}
          t={t}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
