/**
 * Purpose: "Deep settings" section for one paired TV card in TvManagerScreen — countdown
 *   takeover, iqama offsets, name-only mode, madhab, time format, calc method, and manual
 *   per-TV lat/lng entry. Extracted from TvManagerScreen.tsx to keep that file under the
 *   300-line cap and to give these fields (previously state-only, unrendered) a home.
 * Inputs: row (TvSettingsRow), applyPatch callback (owned by the parent — it runs the
 *   UPDATE_TV_SETTINGS mutation + refetch), manual-location draft strings/setters and the
 *   commit handler (also parent-owned, keyed by row.id there), and an iqama-offset change
 *   callback pre-bound to `row` by the parent.
 * Outputs: TvDeepSettings component — presentation only, no direct GraphQL calls.
 * Constraints: iqama_offsets is a jsonb column — writes always go through
 *   onIqamaOffsetChange, which sends the full 5-key object (never a partial patch).
 *   calc_method is stored lowercased (e.g. 'dpc') per the live schema contract in
 *   lib/pairing/pairingMutation.ts, so CALC_METHODS.key is lowercased before compare/write.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tv-deep-settings
 */

import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CALC_METHODS } from '../../constants/methods';
import { createStyles } from './tvManagerStyles';
import type { TvSettingsRow } from './tvManagerQueries';
import type { IqamaOffsets, TvSettingsPatch } from '../../lib/pairing/pairingMutation';
import { DEFAULT_IQAMA_OFFSETS } from '../../lib/pairing/pairingMutation';
import {
  IQAMA_PRAYERS,
  IQAMA_PRAYER_LABEL_KEYS,
  MADHAB_OPTIONS,
  MADHAB_LABEL_KEYS,
  TIME_FORMAT_OPTIONS,
  TIME_FORMAT_LABEL_KEYS,
  MIN_TAKEOVER_MINUTES,
  MAX_TAKEOVER_MINUTES,
  MIN_NAME_ONLY_MINUTES,
  MAX_NAME_ONLY_MINUTES,
} from './tvManagerConstants';
import { TvLayoutThemePicker } from './TvLayoutThemePicker';
import { Stepper } from './TvStepper';

interface TvDeepSettingsProps {
  row: TvSettingsRow;
  applyPatch: (row: TvSettingsRow, changes: TvSettingsPatch) => Promise<void>;
  manualLat: string;
  manualLng: string;
  onManualLatChange: (text: string) => void;
  onManualLngChange: (text: string) => void;
  onManualLocationCommit: () => void;
  onIqamaOffsetChange: (prayer: keyof IqamaOffsets, delta: number) => void;
  manualEditing: boolean;
  onToggleManualEditing: () => void;
}

export function TvDeepSettings({
  row, applyPatch, manualLat, manualLng, onManualLatChange, onManualLngChange,
  onManualLocationCommit, onIqamaOffsetChange, manualEditing, onToggleManualEditing,
}: TvDeepSettingsProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iqamaOffsets = row.iqama_offsets ?? DEFAULT_IQAMA_OFFSETS;

  return (
    <View style={styles.deepSection}>
      <TvLayoutThemePicker row={row} applyPatch={applyPatch} />

      {/* Countdown takeover */}
      <View style={styles.subSectionRow}>
        <Text style={styles.subLabel}>{t('screens.tvManager.countdownTakeoverLabel')}</Text>
        <Switch
          value={row.countdown_takeover_enabled}
          onValueChange={(value) => applyPatch(row, { countdown_takeover_enabled: value })}
          trackColor={{ false: colors.background.card, true: colors.brand.mid }}
          thumbColor={colors.brand.light}
          accessibilityLabel={t('screens.tvManager.countdownTakeoverLabel')}
        />
      </View>
      <Text style={styles.hint}>{t('screens.tvManager.countdownTakeoverHint')}</Text>
      {row.countdown_takeover_enabled && (
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>{t('screens.tvManager.countdownMinutesLabel')}</Text>
          <Stepper
            styles={styles}
            value={row.countdown_minutes}
            unit="min"
            onDecrease={() => applyPatch(row, {
              countdown_minutes: Math.max(MIN_TAKEOVER_MINUTES, row.countdown_minutes - 1),
            })}
            onIncrease={() => applyPatch(row, {
              countdown_minutes: Math.min(MAX_TAKEOVER_MINUTES, row.countdown_minutes + 1),
            })}
            decreaseLabel={t('screens.tvManager.decreaseCountdown')}
            increaseLabel={t('screens.tvManager.increaseCountdown')}
          />
        </View>
      )}

      {/* Iqama */}
      <View style={styles.subSectionRow}>
        <Text style={styles.subLabel}>{t('screens.tvManager.iqamaLabel')}</Text>
        <Switch
          value={row.iqama_enabled}
          onValueChange={(value) => applyPatch(row, { iqama_enabled: value })}
          trackColor={{ false: colors.background.card, true: colors.brand.mid }}
          thumbColor={colors.brand.light}
          accessibilityLabel={t('screens.tvManager.iqamaLabel')}
        />
      </View>
      <Text style={styles.hint}>{t('screens.tvManager.iqamaHint')}</Text>
      {row.iqama_enabled && IQAMA_PRAYERS.map((prayer) => (
        <View key={prayer} style={styles.prayerStepperRow}>
          <Text style={styles.prayerLabel}>{t(IQAMA_PRAYER_LABEL_KEYS[prayer])}</Text>
          <Stepper
            styles={styles}
            value={iqamaOffsets[prayer]}
            unit="min"
            onDecrease={() => onIqamaOffsetChange(prayer, -1)}
            onIncrease={() => onIqamaOffsetChange(prayer, 1)}
            decreaseLabel={t('screens.tvManager.decreaseIqama', { prayer: t(IQAMA_PRAYER_LABEL_KEYS[prayer]) })}
            increaseLabel={t('screens.tvManager.increaseIqama', { prayer: t(IQAMA_PRAYER_LABEL_KEYS[prayer]) })}
          />
        </View>
      ))}

      {/* Name-only mode */}
      <View style={styles.subSectionRow}>
        <Text style={styles.subLabel}>{t('screens.tvManager.nameOnlyLabel')}</Text>
        <Switch
          value={row.name_only_enabled}
          onValueChange={(value) => applyPatch(row, { name_only_enabled: value })}
          trackColor={{ false: colors.background.card, true: colors.brand.mid }}
          thumbColor={colors.brand.light}
          accessibilityLabel={t('screens.tvManager.nameOnlyLabel')}
        />
      </View>
      <Text style={styles.hint}>{t('screens.tvManager.nameOnlyHint')}</Text>
      {row.name_only_enabled && (
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>{t('screens.tvManager.nameOnlyMinutesLabel')}</Text>
          <Stepper
            styles={styles}
            value={row.name_only_minutes}
            unit="min"
            onDecrease={() => applyPatch(row, {
              name_only_minutes: Math.max(MIN_NAME_ONLY_MINUTES, row.name_only_minutes - 1),
            })}
            onIncrease={() => applyPatch(row, {
              name_only_minutes: Math.min(MAX_NAME_ONLY_MINUTES, row.name_only_minutes + 1),
            })}
            decreaseLabel={t('screens.tvManager.decreaseNameOnly')}
            increaseLabel={t('screens.tvManager.increaseNameOnly')}
          />
        </View>
      )}

      {/* Madhab */}
      <Text style={styles.fieldLabel}>{t('screens.tvManager.madhabLabel')}</Text>
      <View style={styles.optionRow}>
        {MADHAB_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionChip, row.madhab === option && styles.optionChipSelected]}
            onPress={() => applyPatch(row, { madhab: option })}
            accessibilityRole="radio"
            accessibilityLabel={t(MADHAB_LABEL_KEYS[option])}
            accessibilityState={{ selected: row.madhab === option }}
          >
            <Text style={[styles.optionChipText, row.madhab === option && styles.optionChipTextSelected]}>
              {t(MADHAB_LABEL_KEYS[option])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time format */}
      <Text style={styles.fieldLabel}>{t('screens.tvManager.timeFormatLabel')}</Text>
      <View style={styles.optionRow}>
        {TIME_FORMAT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionChip, row.time_format === option && styles.optionChipSelected]}
            onPress={() => applyPatch(row, { time_format: option })}
            accessibilityRole="radio"
            accessibilityLabel={t(TIME_FORMAT_LABEL_KEYS[option])}
            accessibilityState={{ selected: row.time_format === option }}
          >
            <Text style={[styles.optionChipText, row.time_format === option && styles.optionChipTextSelected]}>
              {t(TIME_FORMAT_LABEL_KEYS[option])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calc method */}
      <Text style={styles.fieldLabel}>{t('screens.tvManager.calcMethodLabel')}</Text>
      <View style={styles.optionRow}>
        {CALC_METHODS.map((method) => {
          const value = method.key.toLowerCase();
          const isSelected = row.calc_method === value;
          return (
            <TouchableOpacity
              key={method.key}
              style={[styles.optionChip, isSelected && styles.optionChipSelected]}
              onPress={() => applyPatch(row, { calc_method: value })}
              accessibilityRole="radio"
              accessibilityLabel={method.label}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Manual per-TV location */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={onToggleManualEditing}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tvManager.manualLocationToggle')}
      >
        <Text style={styles.linkButtonText}>{t('screens.tvManager.manualLocationToggle')}</Text>
      </TouchableOpacity>
      {manualEditing && (
        <>
          <View style={styles.coordRow}>
            <View style={styles.coordField}>
              <Text style={styles.hint}>{t('screens.tvManager.latitudeLabel')}</Text>
              <TextInput
                style={styles.coordInput}
                value={manualLat}
                onChangeText={onManualLatChange}
                keyboardType="numbers-and-punctuation"
                placeholderTextColor={colors.text.muted}
                accessibilityLabel={t('screens.tvManager.latitudeLabel')}
              />
            </View>
            <View style={styles.coordField}>
              <Text style={styles.hint}>{t('screens.tvManager.longitudeLabel')}</Text>
              <TextInput
                style={styles.coordInput}
                value={manualLng}
                onChangeText={onManualLngChange}
                keyboardType="numbers-and-punctuation"
                placeholderTextColor={colors.text.muted}
                accessibilityLabel={t('screens.tvManager.longitudeLabel')}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onManualLocationCommit}
            accessibilityRole="button"
            accessibilityLabel={t('screens.tvManager.manualLocationSave')}
          >
            <Text style={styles.secondaryButtonText}>{t('screens.tvManager.manualLocationSave')}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
