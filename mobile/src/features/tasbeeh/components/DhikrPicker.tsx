/**
 * Purpose: Dhikr preset selector list for TasbeehScreen — extracted so the
 *   screen component stays under the 300-line file cap.
 * Inputs: full preset list, currently selected preset id, shared
 *   styles/translate function, select callback.
 * Outputs: DhikrPicker component — identical JSX/accessibility output to the
 *   original inline block in TasbeehScreen.tsx.
 * Constraints: Purely presentational — no own state, no theme/i18n hook calls
 *   (styles and t are passed down from the screen to avoid duplicate lookups).
 *   Arabic text: full tashkeel, textAlign 'right', writingDirection 'rtl'.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tasbeeh-dhikr-picker
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import type { TFunction } from 'i18next';
import type { DhikrPreset } from '../dhikrPresets';
import type { TasbeehStyles } from '../TasbeehScreen.styles';

interface DhikrPickerProps {
  presets: DhikrPreset[];
  selectedPresetId: string;
  styles: TasbeehStyles;
  t: TFunction;
  onSelect: (preset: DhikrPreset) => void;
}

export function DhikrPicker({
  presets, selectedPresetId, styles, t, onSelect,
}: DhikrPickerProps) {
  return (
    <>
      <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.tasbeeh.chooseDhikr')}</Text>
      {presets.map((preset) => (
        <TouchableOpacity
          key={preset.id}
          style={[
            styles.presetCard,
            selectedPresetId === preset.id && styles.presetCardActive,
          ]}
          onPress={() => onSelect(preset)}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedPresetId === preset.id }}
          accessibilityLabel={t('screens.tasbeeh.presetAccessibilityLabel', {
            transliteration: preset.transliteration, target: preset.targetCount, source: preset.source,
          })}
        >
          <Text style={styles.presetArabic}>{preset.arabic}</Text>
          <Text style={styles.presetTranslit}>{preset.transliteration} × {preset.targetCount}</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}
