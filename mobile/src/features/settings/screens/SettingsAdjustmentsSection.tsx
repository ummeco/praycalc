/**
 * Purpose: Settings → prayer-time fine-tuning (per-prayer minute correction, ±30) and
 *   Hijri date offset (±2 days, local moon-sighting). Extracted from SettingsScreen.tsx
 *   (was pushing that file over the 300-line cap).
 * Inputs: current prayerMinuteAdjustments + hijriDayAdjustment, adjust callbacks (owned
 *   by the parent — minute adjustments also trigger a notification reschedule, which
 *   stays in SettingsScreen so this component is presentation-only).
 * Outputs: SettingsAdjustmentsSection component.
 * Constraints: Behavior must be pixel/logic-identical to the pre-extraction inline JSX.
 *   Clamp bounds (±30 min, ±2 days) are enforced by the store actions, not here.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-adjustments-section
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useTranslation } from '../../../i18n';
import { PRAYER_LABEL_KEYS, DISPLAY_PRAYERS as ADJUSTABLE_PRAYERS } from '../../../constants/prayers';
import type { PrayerName } from '../../../types/prayer';
import { SectionHeader } from './SettingsSectionHeader';

interface SettingsAdjustmentsSectionProps {
  prayerMinuteAdjustments: Record<PrayerName, number>;
  onAdjustPrayerMinutes: (prayer: PrayerName, delta: number) => void;
  hijriDayAdjustment: number;
  onAdjustHijriDay: (nextValue: number) => void;
}

export function SettingsAdjustmentsSection({
  prayerMinuteAdjustments, onAdjustPrayerMinutes, hijriDayAdjustment, onAdjustHijriDay,
}: SettingsAdjustmentsSectionProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <>
      {/* Prayer time fine-tuning — match a local mosque timetable */}
      <SectionHeader title={t('settings.prayerAdjustments.title')} styles={styles} />
      <View style={styles.card}>
        <Text style={styles.hint}>
          {t('settings.prayerAdjustments.hint')}
        </Text>
        {ADJUSTABLE_PRAYERS.map((prayer) => {
          const value = prayerMinuteAdjustments[prayer] ?? 0;
          return (
            <View key={prayer} style={styles.row}>
              <Text style={styles.rowLabel}>{t(PRAYER_LABEL_KEYS[prayer])}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => onAdjustPrayerMinutes(prayer, -1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease ${prayer} adjustment`}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue} accessibilityLabel={`${prayer} adjustment: ${value} minutes`}>
                  {value > 0 ? `+${value}` : value} min
                </Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => onAdjustPrayerMinutes(prayer, 1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase ${prayer} adjustment`}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Hijri date adjustment — local moon-sighting offset */}
      <SectionHeader title={t('settings.hijriAdjustment.title')} styles={styles} />
      <View style={styles.card}>
        <Text style={styles.hint}>
          {t('settings.hijriAdjustment.hint')}
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.hijriAdjustment.offset')}</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => onAdjustHijriDay(hijriDayAdjustment - 1)}
              accessibilityRole="button"
              accessibilityLabel={t('settings.hijriAdjustment.decreaseAccessibilityLabel')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.stepperButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue} accessibilityLabel={`Hijri offset: ${hijriDayAdjustment} days`}>
              {hijriDayAdjustment > 0 ? `+${hijriDayAdjustment}` : hijriDayAdjustment} d
            </Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => onAdjustHijriDay(hijriDayAdjustment + 1)}
              accessibilityRole="button"
              accessibilityLabel={t('settings.hijriAdjustment.increaseAccessibilityLabel')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </TouchableOpacity>
          </View>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.text.primary },
  hint: { fontSize: 13, color: colors.text.muted, fontStyle: 'italic' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { fontSize: 18, fontWeight: '700', color: colors.brand.dark, lineHeight: 20 },
  stepperValue: { fontSize: 14, color: colors.text.primary, minWidth: 56, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
