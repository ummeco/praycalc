/**
 * Purpose: Standalone Privacy screen — lets the user change their analytics
 *   consent choice after first-run onboarding, via a toggle (not the
 *   Accept/Decline buttons used on first ask).
 * Inputs: useConsentStore (analyticsConsent + setAnalyticsConsent).
 * Outputs: PrivacyConsentScreen component, exported for the orchestrator to
 *   wire a navigation entry to (e.g. from Settings/more.tsx — NOT done here,
 *   more.tsx is outside this task's ownership).
 * Constraints: Reuses ConsentToggleCard so wording matches the onboarding step
 *   exactly. Self-contained screen — no navigation params required, so it can be
 *   dropped into any route/stack the orchestrator chooses.
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-privacy-consent-screen
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useConsentStore } from '../store/useConsentStore';
import { ConsentToggleCard } from '../components/ConsentToggleCard';

export function PrivacyConsentScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const analyticsConsent = useConsentStore((s) => s.analyticsConsent);
  const setAnalyticsConsent = useConsentStore((s) => s.setAnalyticsConsent);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('consent.privacyScreenTitle')}</Text>
      <ConsentToggleCard mode="toggle" value={analyticsConsent} onChange={setAnalyticsConsent} />
      <View style={styles.footerNote}>
        <Text style={styles.footerNoteText}>{t('consent.privacyScreenFooter')}</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: 20, gap: 16 },
  header: { fontSize: 24, fontWeight: '800', color: colors.text.primary },
  footerNote: { padding: 4 },
  footerNoteText: { fontSize: 12, color: colors.text.muted, lineHeight: 18 },
});
