/**
 * Purpose: Settings → Calculation Method (7 methods + custom-angle inputs), High-Latitude
 *   rule, and Madhab (Asr shadow factor) sections. Extracted from SettingsScreen.tsx (was
 *   pushing that file over the 300-line cap).
 * Inputs: current method/customAngles/highLatRule/madhab, setter callbacks (owned by the
 *   parent — every setter also triggers a notification reschedule, which stays in
 *   SettingsScreen so this component is presentation-only).
 * Outputs: SettingsCalculationSection component.
 * Constraints: Method selector must show exactly 7 methods (no Tehran/Jafari — D-P3-19).
 *   Behavior must be pixel/logic-identical to the pre-extraction inline JSX.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-calculation-section
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useTranslation } from '../../../i18n';
import { CALC_METHODS } from '../../../constants/methods';
import type { Madhab, HighLatRule } from '../../../types/prayer';
import { SectionHeader } from './SettingsSectionHeader';

const HIGH_LAT_RULES: { key: HighLatRule; labelKey: string }[] = [
  { key: 'NightMiddle', labelKey: 'settings.highLatitude.nightMiddle' },
  { key: 'AngleBased', labelKey: 'settings.highLatitude.angleBased' },
  { key: 'OneSeventh', labelKey: 'settings.highLatitude.oneSeventh' },
  { key: 'None', labelKey: 'settings.highLatitude.none' },
];

interface SettingsCalculationSectionProps {
  method: string;
  onSetMethod: (method: string) => void;
  customFajrAngle: number;
  customIshaAngle: number;
  onSetCustomAngles: (fajr: number, isha: number) => void;
  highLatRule: HighLatRule;
  onSetHighLatRule: (rule: HighLatRule) => void;
  madhab: Madhab;
  onSetMadhab: (madhab: Madhab) => void;
}

export function SettingsCalculationSection({
  method, onSetMethod, customFajrAngle, customIshaAngle, onSetCustomAngles,
  highLatRule, onSetHighLatRule, madhab, onSetMadhab,
}: SettingsCalculationSectionProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <>
      {/* Calculation Method */}
      <SectionHeader title={t('settings.calculation.title')} styles={styles} />
      <View style={styles.card}>
        {CALC_METHODS.map((m) => {
          const isSelected = method === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => onSetMethod(m.key)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {method === 'Custom' && (
          <View style={styles.customAnglesRow}>
            <View style={styles.angleField}>
              <Text style={styles.hint}>{t('settings.customAngles.fajr')}</Text>
              <TextInput
                style={styles.angleInput}
                keyboardType="decimal-pad"
                value={String(customFajrAngle)}
                onChangeText={(v) => {
                  const fajr = parseFloat(v);
                  if (!Number.isNaN(fajr)) onSetCustomAngles(fajr, customIshaAngle);
                }}
                accessibilityLabel="Custom Fajr angle in degrees"
              />
            </View>
            <View style={styles.angleField}>
              <Text style={styles.hint}>{t('settings.customAngles.isha')}</Text>
              <TextInput
                style={styles.angleInput}
                keyboardType="decimal-pad"
                value={String(customIshaAngle)}
                onChangeText={(v) => {
                  const isha = parseFloat(v);
                  if (!Number.isNaN(isha)) onSetCustomAngles(customFajrAngle, isha);
                }}
                accessibilityLabel="Custom Isha angle in degrees"
              />
            </View>
          </View>
        )}
      </View>

      {/* High-latitude rule */}
      <SectionHeader title={t('settings.highLatitude.title')} styles={styles} />
      <View style={styles.card}>
        <Text style={styles.hint}>
          {t('settings.highLatitude.hint')}
        </Text>
        {HIGH_LAT_RULES.map((rule) => {
          const isSelected = highLatRule === rule.key;
          return (
            <TouchableOpacity
              key={rule.key}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => onSetHighLatRule(rule.key)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {t(rule.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Madhab (Asr shadow factor) */}
      <SectionHeader title={t('settings.madhab.title')} styles={styles} />
      <View style={styles.card}>
        <View style={styles.toggle}>
          {(['Shafi', 'Hanafi'] as Madhab[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleOption, madhab === m && styles.toggleOptionActive]}
              onPress={() => onSetMadhab(m)}
            >
              <Text style={[styles.toggleText, madhab === m && styles.toggleTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>
          {t('settings.madhab.hint')}
        </Text>
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
  hint: { fontSize: 13, color: colors.text.muted, fontStyle: 'italic' },
  customAnglesRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  angleField: { flex: 1, gap: 4 },
  angleInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.card,
    minHeight: 40,
  },
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
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: colors.background.secondary },
  toggleOption: { flex: 1, padding: 12, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: colors.brand.dark },
  toggleText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  toggleTextActive: { color: colors.text.inverse, fontWeight: '700' },
});
