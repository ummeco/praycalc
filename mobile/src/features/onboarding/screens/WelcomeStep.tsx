/**
 * Purpose: Onboarding step 1 — app intro / welcome.
 * Inputs: onNext callback, onSkip callback.
 * Outputs: WelcomeStep component.
 * Constraints: No permission requests here — purely introductory copy.
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-onboarding-welcome-step
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
      <Text style={styles.desc}>{t('onboarding.welcome.desc')}</Text>
      <TouchableOpacity style={styles.button} onPress={onNext} accessibilityRole="button">
        <Text style={styles.buttonText}>{t('onboarding.welcome.cta')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onSkip} accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>{t('onboarding.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  panel: { gap: 20 },
  title: { fontSize: 32, fontWeight: '800', color: colors.brand.light },
  desc: { fontSize: 16, color: colors.text.inverse, lineHeight: 24, opacity: 0.9 },
  button: { backgroundColor: colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 16 },
  secondaryButton: { alignItems: 'center', padding: 14 },
  secondaryButtonText: { color: colors.brand.light, fontSize: 14, opacity: 0.8 },
});
