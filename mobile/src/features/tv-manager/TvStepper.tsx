/**
 * Purpose: Shared −/value/+ stepper control used by every numeric field in
 *   TvDeepSettings.tsx (countdown minutes, iqama offsets, name-only minutes). Extracted
 *   from TvDeepSettings.tsx to keep that file under the 300-line cap.
 * Inputs: styles (from tvManagerStyles.createStyles), current value + unit label, and
 *   the decrease/increase handlers + their accessibility labels (all owned by the
 *   caller — this component is presentation-only).
 * Outputs: Stepper component — a labeled −/value/+ row.
 * Constraints: no `any`; pure presentation, no state of its own.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tv-stepper
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { createStyles } from './tvManagerStyles';

export function Stepper({
  styles, value, unit, onDecrease, onIncrease, decreaseLabel, increaseLabel,
}: {
  styles: ReturnType<typeof createStyles>;
  value: number;
  unit: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepperButton}
        onPress={onDecrease}
        accessibilityRole="button"
        accessibilityLabel={decreaseLabel}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.stepperButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value} {unit}</Text>
      <TouchableOpacity
        style={styles.stepperButton}
        onPress={onIncrease}
        accessibilityRole="button"
        accessibilityLabel={increaseLabel}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
