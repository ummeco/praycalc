/**
 * Purpose: Onboarding step 6 (final) — completion screen shown briefly before
 *   navigating into the app.
 * Inputs: onFinish callback.
 * Outputs: DoneStep component.
 * Constraints: Purely presentational — the parent screen is responsible for
 *   actually marking onboarding complete (setOnboardingDone) before/around
 *   navigation; this step only renders the confirmation UI and the button that
 *   triggers it.
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-onboarding-done-step
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';

interface DoneStepProps {
  onFinish: () => void;
}

export function DoneStep({ onFinish }: DoneStepProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{t('onboarding.done.title')}</Text>
      <Text style={styles.desc}>{t('onboarding.done.desc')}</Text>
      <TouchableOpacity style={styles.button} onPress={onFinish} accessibilityRole="button">
        <Text style={styles.buttonText}>{t('onboarding.done.cta')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  panel: { gap: 20 },
  title: { fontSize: 30, fontWeight: '800', color: colors.brand.light },
  desc: { fontSize: 16, color: colors.text.inverse, lineHeight: 24, opacity: 0.9 },
  button: { backgroundColor: colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 16 },
});
