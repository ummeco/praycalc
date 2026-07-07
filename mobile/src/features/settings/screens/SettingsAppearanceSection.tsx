/**
 * Purpose: Settings → Time Format (12h/24h) + Appearance (theme mode: system/light/dark)
 *   sections. Extracted from SettingsScreen.tsx (was pushing that file over the 300-line
 *   cap).
 * Inputs: current timeFormat + themeMode, setter callbacks (owned by the parent).
 * Outputs: SettingsAppearanceSection component.
 * Constraints: Behavior must be pixel/logic-identical to the pre-extraction inline JSX.
 *   'system' theme follows the OS; 'light'/'dark' force a palette (see useThemeColors).
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-appearance-section
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useTranslation } from '../../../i18n';
import type { TimeFormat } from '../../../types/prayer';
import type { ThemeMode } from '../store/useSettingsStore';
import { SectionHeader } from './SettingsSectionHeader';

/** Appearance section options — System follows the OS, Light/Dark force a palette. */
const THEME_OPTIONS: { key: ThemeMode; labelKey: string }[] = [
  { key: 'system', labelKey: 'settings.appearance.system' },
  { key: 'light', labelKey: 'settings.appearance.light' },
  { key: 'dark', labelKey: 'settings.appearance.dark' },
];

interface SettingsAppearanceSectionProps {
  timeFormat: TimeFormat;
  onSetTimeFormat: (format: TimeFormat) => void;
  themeMode: ThemeMode;
  onSetThemeMode: (mode: ThemeMode) => void;
}

export function SettingsAppearanceSection({
  timeFormat, onSetTimeFormat, themeMode, onSetThemeMode,
}: SettingsAppearanceSectionProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <>
      {/* Time Format */}
      <SectionHeader title={t('settings.timeFormat.title')} styles={styles} />
      <View style={styles.card}>
        <View style={styles.toggle}>
          {(['12h', '24h'] as TimeFormat[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.toggleOption, timeFormat === f && styles.toggleOptionActive]}
              onPress={() => onSetTimeFormat(f)}
            >
              <Text style={[styles.toggleText, timeFormat === f && styles.toggleTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appearance — theme mode: System follows the OS, Light/Dark force a palette */}
      <SectionHeader title={t('settings.appearance.title')} styles={styles} />
      <View style={styles.card}>
        <View style={styles.toggle}>
          {THEME_OPTIONS.map((opt) => {
            const label = t(opt.labelKey);
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.toggleOption, themeMode === opt.key && styles.toggleOptionActive]}
                onPress={() => onSetThemeMode(opt.key)}
                accessibilityRole="button"
                accessibilityLabel={`${label} theme`}
                accessibilityState={{ selected: themeMode === opt.key }}
              >
                <Text style={[styles.toggleText, themeMode === opt.key && styles.toggleTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: colors.background.secondary },
  toggleOption: { flex: 1, padding: 12, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: colors.brand.dark },
  toggleText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  toggleTextActive: { color: colors.text.inverse, fontWeight: '700' },
});
