/**
 * Purpose: Onboarding step 4 — explains DPC (Dynamic Prayer Calculation) as the
 *   recommended default, and lets the user keep it or pick a fixed method. The
 *   smart-detected fixed method (from method-autodetect.ts) is pre-selected and
 *   highlighted as "recommended for your location" in case they opt off DPC.
 * Inputs: detectedFallback (FixedMethodKey) — precomputed by the parent from the
 *   resolved location's country code. onSelect(CalcMethodKey) callback.
 * Outputs: MethodStep component.
 * Constraints: DPC stays visually primary/highlighted regardless of the detected
 *   fallback — the fallback only affects which FIXED method is pre-selected if
 *   the user taps away from DPC. Renders from CALC_METHODS (constants/methods.ts)
 *   so it always matches the same list used in Settings.
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-onboarding-method-step
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { CALC_METHODS, DEFAULT_METHOD, type CalcMethodKey } from '../../../constants/methods';
import type { FixedMethodKey } from '../../../lib/method-autodetect';

interface MethodStepProps {
  detectedFallback: FixedMethodKey;
  onSelect: (method: CalcMethodKey) => void;
}

export function MethodStep({ detectedFallback, onSelect }: MethodStepProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<CalcMethodKey>(DEFAULT_METHOD);
  const [showFixedList, setShowFixedList] = useState(false);

  const fixedMethods = CALC_METHODS.filter((m) => m.key !== 'DPC' && m.key !== 'Custom');

  function chooseDpc() {
    setSelected(DEFAULT_METHOD);
    setShowFixedList(false);
  }

  function chooseFixed(key: CalcMethodKey) {
    setSelected(key);
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{t('onboarding.method.title')}</Text>
      <Text style={styles.desc}>{t('onboarding.method.dpcExplain')}</Text>

      <TouchableOpacity
        style={[styles.dpcCard, selected === 'DPC' && styles.dpcCardActive]}
        onPress={chooseDpc}
        accessibilityRole="button"
        accessibilityState={{ selected: selected === 'DPC' }}
      >
        <Text style={styles.dpcLabel}>{t('onboarding.method.dpcLabel')}</Text>
        <Text style={styles.dpcBadge}>{t('onboarding.method.recommended')}</Text>
        <Text style={styles.dpcDesc}>{t('onboarding.method.dpcExplain')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowFixedList((v) => !v)} accessibilityRole="button">
        <Text style={styles.fixedToggleText}>{t('onboarding.method.orFixed')}</Text>
      </TouchableOpacity>

      {showFixedList && (
        <ScrollView style={styles.fixedList}>
          {fixedMethods.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.fixedRow, selected === m.key && styles.fixedRowActive]}
              onPress={() => chooseFixed(m.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === m.key }}
            >
              <Text style={styles.fixedRowLabel}>{m.label}</Text>
              {m.key === detectedFallback && (
                <Text style={styles.fixedRowBadge}>{t('onboarding.method.suggested')}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={() => onSelect(selected)} accessibilityRole="button">
        <Text style={styles.continueButtonText}>{t('onboarding.method.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  panel: { gap: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.brand.light },
  desc: { fontSize: 15, color: colors.text.inverse, lineHeight: 22, opacity: 0.9 },
  dpcCard: { borderRadius: 14, padding: 18, borderWidth: 2, borderColor: colors.brand.mid, gap: 6 },
  dpcCardActive: { backgroundColor: colors.brand.dark },
  dpcLabel: { fontSize: 18, fontWeight: '800', color: colors.brand.light },
  dpcBadge: { fontSize: 11, fontWeight: '700', color: colors.brand.deep, backgroundColor: colors.brand.light, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  dpcDesc: { fontSize: 13, color: colors.text.inverse, opacity: 0.85, lineHeight: 19 },
  fixedToggleText: { color: colors.brand.light, fontSize: 14, textDecorationLine: 'underline', opacity: 0.85 },
  fixedList: { maxHeight: 220, borderRadius: 12 },
  fixedRow: { padding: 14, borderRadius: 10, backgroundColor: colors.brand.deep, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fixedRowActive: { backgroundColor: colors.brand.dark },
  fixedRowLabel: { color: colors.text.inverse, fontSize: 14 },
  fixedRowBadge: { color: colors.brand.light, fontSize: 11, fontWeight: '700' },
  continueButton: { backgroundColor: colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 4 },
  continueButtonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 16 },
});
