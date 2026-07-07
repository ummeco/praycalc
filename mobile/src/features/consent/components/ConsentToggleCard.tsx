/**
 * Purpose: Shared analytics-consent UI — explanation copy + Accept/Decline (or a
 *   toggle, when `mode="toggle"`) — reused by the onboarding Consent step and the
 *   standalone Privacy screen so both present identical language and behavior.
 * Inputs: current AnalyticsConsent value, onChange callback, display mode.
 * Outputs: ConsentToggleCard component.
 * Constraints: Purely presentational — does not read/write the store itself, so it
 *   is trivially reusable from both first-run onboarding and the later Privacy
 *   screen without coupling either caller's navigation/completion logic here.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-consent-toggle-card
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import type { AnalyticsConsent } from '../store/useConsentStore';

interface ConsentToggleCardProps {
  value: AnalyticsConsent;
  onChange: (value: AnalyticsConsent) => void;
  /** 'buttons' = Accept/Decline (first-run onboarding). 'toggle' = on/off switch (Privacy screen, changing an existing choice). */
  mode?: 'buttons' | 'toggle';
}

export function ConsentToggleCard({ value, onChange, mode = 'buttons' }: ConsentToggleCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isGranted = value === 'granted';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('consent.title')}</Text>
      <Text style={styles.desc}>{t('consent.description')}</Text>
      <Text style={styles.privacyNote}>{t('consent.privacyNote')}</Text>

      {mode === 'buttons' ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => onChange('denied')}
            accessibilityRole="button"
            accessibilityLabel={t('consent.decline')}
          >
            <Text style={styles.declineButtonText}>{t('consent.decline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onChange('granted')}
            accessibilityRole="button"
            accessibilityLabel={t('consent.accept')}
          >
            <Text style={styles.acceptButtonText}>{t('consent.accept')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.toggleRow, isGranted && styles.toggleRowActive]}
          onPress={() => onChange(isGranted ? 'denied' : 'granted')}
          accessibilityRole="switch"
          accessibilityState={{ checked: isGranted }}
          accessibilityLabel={t('consent.toggleLabel')}
        >
          <Text style={styles.toggleLabel}>{t('consent.toggleLabel')}</Text>
          <View style={[styles.toggleTrack, isGranted && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, isGranted && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  desc: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  privacyNote: { fontSize: 12, color: colors.text.muted, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  declineButton: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: colors.background.secondary },
  declineButtonText: { color: colors.text.primary, fontWeight: '600', fontSize: 14 },
  acceptButton: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: colors.brand.mid },
  acceptButtonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 14 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
  },
  toggleRowActive: { backgroundColor: colors.background.secondary },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: colors.text.primary, flex: 1 },
  toggleTrack: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.text.muted, padding: 2, justifyContent: 'center' },
  toggleTrackActive: { backgroundColor: colors.brand.mid },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.background.primary },
  toggleThumbActive: { alignSelf: 'flex-end' },
});
