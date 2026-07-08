/**
 * Purpose: Settings → Language section — expandable list of the 21 supported locales.
 *   Extracted from SettingsScreen.tsx (was pushing that file over the 300-line cap).
 * Inputs: current locale, expanded/collapsed UI state, select-locale callback (owned by
 *   the parent — locale change touches i18next + RTL + a possible restart prompt, all of
 *   which stay in SettingsScreen so this component is presentation-only).
 * Outputs: SettingsLanguageSection component.
 * Constraints: Behavior must be pixel/logic-identical to the pre-extraction inline JSX.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-language-section
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { SUPPORTED_LOCALES, LOCALE_NAMES, useTranslation, type SupportedLocale } from '../../../i18n';
import { SectionHeader } from './SettingsSectionHeader';

interface SettingsLanguageSectionProps {
  locale: string;
  showLanguages: boolean;
  onToggleShowLanguages: () => void;
  onSelectLocale: (locale: SupportedLocale) => void;
}

export function SettingsLanguageSection({
  locale, showLanguages, onToggleShowLanguages, onSelectLocale,
}: SettingsLanguageSectionProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <>
      <SectionHeader title={t('settings.language.title')} styles={styles} />
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={onToggleShowLanguages}
          accessibilityRole="button"
          accessibilityLabel={t('settings.appLanguage')}
          accessibilityHint={LOCALE_NAMES[locale as SupportedLocale] ?? 'English'}
          accessibilityState={{ expanded: showLanguages }}
        >
          <Text style={styles.rowLabel}>{t('settings.appLanguage')}</Text>
          <Text style={styles.rowValue}>
            {LOCALE_NAMES[locale as SupportedLocale] ?? 'English'} {showLanguages ? '▴' : '▾'}
          </Text>
        </TouchableOpacity>
        {showLanguages && (
          <View accessibilityRole="radiogroup">
            {SUPPORTED_LOCALES.map((loc) => {
              const isSelected = locale === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => onSelectLocale(loc)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={LOCALE_NAMES[loc]}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {LOCALE_NAMES[loc]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.text.primary },
  rowValue: { fontSize: 14, color: colors.text.muted },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  optionRowSelected: { backgroundColor: colors.background.secondary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.brand.dark },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.dark },
  optionLabel: { fontSize: 14, color: colors.text.primary, flex: 1 },
  optionLabelSelected: { fontWeight: '600', color: colors.brand.dark },
});
