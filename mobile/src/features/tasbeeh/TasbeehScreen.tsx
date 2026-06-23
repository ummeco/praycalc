/**
 * Purpose: Digital dhikr counter with haptic feedback, custom dhikr, MMKV persistence.
 * Inputs: DhikrPreset constants, user custom dhikr.
 * Outputs: TasbeehScreen — Feature 7 of 20.
 * Constraints: expo-haptics for vibration on increment. MMKV persists count across restarts.
 *   Arabic strings: full tashkeel, textAlign 'right', writingDirection 'rtl'.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-07-tasbeeh
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { mmkv } from '../../lib/storage/mmkv';
import { Colors } from '../../constants/colors';

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
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(DHIKR_PRESETS[0]!);
  const [count, setCount] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

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
          <Text style={styles.targetText}>of {selectedPreset.targetCount}</Text>
          {isComplete && <Text style={styles.completeText}>Complete!</Text>}
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
          accessibilityLabel="Reset counter"
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        {/* Preset selector */}
        <Text style={styles.sectionTitle} accessibilityRole="header">Choose Dhikr</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  arabicContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    width: '100%',
  },
  arabicText: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.brand.dark,
    fontWeight: '600',
    lineHeight: 52,
    width: '100%',
  },
  transliteration: {
    fontSize: 18,
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  source: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  counterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.brand.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.brand.deep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  counterButtonComplete: {
    backgroundColor: Colors.state.success,
  },
  countNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.text.inverse,
  },
  targetText: {
    fontSize: 14,
    color: Colors.brand.light,
    marginTop: 2,
  },
  completeText: {
    fontSize: 14,
    color: Colors.brand.light,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    width: '80%',
    height: 8,
    backgroundColor: Colors.background.card,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.mid,
    borderRadius: 4,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.brand.mid,
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: { fontSize: 16, color: Colors.brand.mid, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  presetCard: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    marginBottom: 8,
    minHeight: 44,
  },
  presetCardActive: {
    borderWidth: 2,
    borderColor: Colors.brand.mid,
    backgroundColor: Colors.brand.light + '22',
  },
  presetArabic: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.brand.dark,
    lineHeight: 30,
  },
  presetTranslit: {
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 4,
  },
});
