/**
 * Purpose: Step-progress indicator (dots) for the multi-step onboarding flow.
 * Inputs: total step count, zero-based index of the current step.
 * Outputs: OnboardingProgressDots component — a row of dots, current step highlighted.
 * Constraints: Purely presentational, no state. Matches theme via useThemeColors.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-onboarding-progress-dots
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';

interface OnboardingProgressDotsProps {
  total: number;
  currentIndex: number;
}

export function OnboardingProgressDots({ total, currentIndex }: OnboardingProgressDotsProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel={`Step ${currentIndex + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.dark, opacity: 0.4 },
  dotActive: { backgroundColor: colors.brand.light, opacity: 1, width: 20 },
});
