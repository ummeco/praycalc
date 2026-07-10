/**
 * Purpose: Arabic dhikr display + tap-to-increment counter + progress bar +
 *   reset button for TasbeehScreen — extracted so the screen component stays
 *   under the 300-line file cap.
 * Inputs: selected DhikrPreset, current count, completion flag, progress
 *   fraction (0-1), shared styles/translate function, increment/reset callbacks.
 * Outputs: DhikrCounter component — identical JSX/accessibility output to the
 *   original inline block in TasbeehScreen.tsx.
 * Constraints: Purely presentational — no own state, no theme/i18n hook calls
 *   (styles and t are passed down from the screen to avoid duplicate lookups).
 *   Arabic text: full tashkeel, textAlign 'right', writingDirection 'rtl'.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tasbeeh-dhikr-counter
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { TFunction } from 'i18next';
import type { DhikrPreset } from '../dhikrPresets';
import type { TasbeehStyles } from '../TasbeehScreen.styles';

interface DhikrCounterProps {
  preset: DhikrPreset;
  count: number;
  isComplete: boolean;
  progress: number;
  styles: TasbeehStyles;
  t: TFunction;
  onIncrement: () => void;
  onReset: () => void;
}

export function DhikrCounter({
  preset, count, isComplete, progress, styles, t, onIncrement, onReset,
}: DhikrCounterProps) {
  return (
    <>
      {/* Arabic text — RTL, tashkeel preserved */}
      <View style={styles.arabicContainer}>
        <Text
          style={styles.arabicText}
          accessibilityRole="text"
          accessibilityLabel={t('screens.tasbeeh.arabicTextAccessibilityLabel', { transliteration: preset.transliteration })}
        >
          {preset.arabic}
        </Text>
        <Text style={styles.transliteration}>{preset.transliteration}</Text>
        <Text style={styles.translation}>{preset.translation}</Text>
        <Text style={styles.source}>{preset.source}</Text>
      </View>

      {/* Counter display */}
      <TouchableOpacity
        style={[styles.counterButton, isComplete && styles.counterButtonComplete]}
        onPress={onIncrement}
        disabled={isComplete}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tasbeeh.counterAccessibilityLabel', {
          count, target: preset.targetCount,
          status: isComplete ? t('common.complete') : t('screens.tasbeeh.tapToIncrement'),
        })}
        activeOpacity={0.8}
      >
        <Text style={styles.countNumber}>{count}</Text>
        <Text style={styles.targetText}>{t('screens.tasbeeh.of', { count: preset.targetCount })}</Text>
        {isComplete && <Text style={styles.completeText}>{t('common.complete')}!</Text>}
      </TouchableOpacity>

      {/* Progress bar */}
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: preset.targetCount, now: count }}
      >
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Reset button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tasbeeh.resetCounter')}
      >
        <Text style={styles.resetText}>{t('common.reset')}</Text>
      </TouchableOpacity>
    </>
  );
}
