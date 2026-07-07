/**
 * Purpose: Onboarding step 5 — first-run analytics consent ask. Reuses the
 *   shared ConsentToggleCard (Accept/Decline mode) so wording is identical to
 *   the later Privacy screen.
 * Inputs: onChoice(AnalyticsConsent) callback — fired on Accept or Decline.
 * Outputs: ConsentStep component.
 * Constraints: Default-deny — this step does not pre-select 'granted'; the
 *   store stays 'unset' until the user taps a button here (or skips, in which
 *   case the parent explicitly sets 'denied' — see OnboardingScreen skip path).
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-onboarding-consent-step
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import type { AnalyticsConsent } from '../../consent/store/useConsentStore';
import { ConsentToggleCard } from '../../consent/components/ConsentToggleCard';

interface ConsentStepProps {
  onChoice: (value: AnalyticsConsent) => void;
}

export function ConsentStep({ onChoice }: ConsentStepProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{t('onboarding.consent.title')}</Text>
      <ConsentToggleCard mode="buttons" value="unset" onChange={onChoice} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  panel: { gap: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.brand.light },
});
