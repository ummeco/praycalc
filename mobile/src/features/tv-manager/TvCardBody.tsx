/**
 * Purpose: Expanded-card body for one paired TV in TvManagerScreen — rename, accent
 *   color, stream source, rotation, weather toggle, location refresh, the deep-settings
 *   disclosure (TvDeepSettings), and delete. Extracted from TvManagerScreen.tsx to keep
 *   that file under the 300-line cap; this is the render-only counterpart to the
 *   handlers TvManagerScreen owns (mutations, drafts, refetch).
 * Inputs: row (TvSettingsRow) + every field/handler the card needs, all owned by the
 *   parent (name draft + commit, applyPatch, location refresh, deep-settings expand
 *   state, manual-location drafts/commit, iqama offset change, delete).
 * Outputs: TvCardBody component — presentation only, no direct GraphQL calls.
 * Constraints: Must render identically to the pre-extraction inline JSX (same fields,
 *   same order, same accessibility labels) — this is a pure extraction, not a redesign.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tv-card-body
 */

import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './tvManagerStyles';
import type { TvSettingsRow } from './tvManagerQueries';
import type { IqamaOffsets, TvSettingsPatch } from '../../lib/pairing/pairingMutation';
import {
  ACCENT_SWATCHES, STREAM_SOURCES, STREAM_LABEL_KEYS, MIN_ROTATE_MINUTES, MAX_ROTATE_MINUTES,
} from './tvManagerConstants';
import { TvDeepSettings } from './TvDeepSettings';

interface TvCardBodyProps {
  row: TvSettingsRow;
  nameDraft: string;
  onNameDraftChange: (text: string) => void;
  onRenameCommit: () => void;
  applyPatch: (row: TvSettingsRow, changes: TvSettingsPatch) => Promise<void>;
  onUpdateLocation: () => void;
  deepExpanded: boolean;
  onToggleDeepExpanded: () => void;
  manualLat: string;
  manualLng: string;
  onManualLatChange: (text: string) => void;
  onManualLngChange: (text: string) => void;
  onManualLocationCommit: () => void;
  onIqamaOffsetChange: (prayer: keyof IqamaOffsets, delta: number) => void;
  manualEditing: boolean;
  onToggleManualEditing: () => void;
  onDelete: () => void;
}

export function TvCardBody({
  row, nameDraft, onNameDraftChange, onRenameCommit, applyPatch, onUpdateLocation,
  deepExpanded, onToggleDeepExpanded, manualLat, manualLng, onManualLatChange,
  onManualLngChange, onManualLocationCommit, onIqamaOffsetChange, manualEditing,
  onToggleManualEditing, onDelete,
}: TvCardBodyProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.cardBody}>
      {/* Rename */}
      <Text style={styles.fieldLabel}>{t('screens.tvManager.nameLabel')}</Text>
      <TextInput
        style={styles.nameInput}
        value={nameDraft}
        onChangeText={onNameDraftChange}
        onBlur={onRenameCommit}
        onSubmitEditing={onRenameCommit}
        placeholderTextColor={colors.text.muted}
        accessibilityLabel={t('screens.tvManager.nameLabel')}
      />

      {/* Accent color */}
      <Text style={styles.fieldLabel}>{t('screens.tvManager.colorLabel')}</Text>
      <View style={styles.swatchRow}>
        {ACCENT_SWATCHES.map((hex) => (
          <TouchableOpacity
            key={hex}
            style={[
              styles.swatchOption,
              { backgroundColor: hex },
              row.accent_color === hex && styles.swatchOptionSelected,
            ]}
            onPress={() => applyPatch(row, { accent_color: hex })}
            accessibilityRole="radio"
            accessibilityLabel={`Accent color ${hex}`}
            accessibilityState={{ selected: row.accent_color === hex }}
          />
        ))}
      </View>

      {/* Stream source */}
      <Text style={styles.fieldLabel}>{t('screens.tvManager.streamLabel')}</Text>
      <View style={styles.optionRow}>
        {STREAM_SOURCES.map((source) => (
          <TouchableOpacity
            key={source}
            style={[styles.optionChip, row.stream_source === source && styles.optionChipSelected]}
            onPress={() => applyPatch(row, { stream_source: source })}
            accessibilityRole="radio"
            accessibilityLabel={t(STREAM_LABEL_KEYS[source])}
            accessibilityState={{ selected: row.stream_source === source }}
          >
            <Text style={[styles.optionChipText, row.stream_source === source && styles.optionChipTextSelected]}>
              {t(STREAM_LABEL_KEYS[source])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rotation minutes stepper */}
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>{t('screens.tvManager.rotateLabel')}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => applyPatch(row, {
              rotate_minutes: Math.max(MIN_ROTATE_MINUTES, row.rotate_minutes - 1),
            })}
            accessibilityLabel={t('screens.tvManager.decreaseRotate')}
          >
            <Text style={styles.stepperButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{row.rotate_minutes} min</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => applyPatch(row, {
              rotate_minutes: Math.min(MAX_ROTATE_MINUTES, row.rotate_minutes + 1),
            })}
            accessibilityLabel={t('screens.tvManager.increaseRotate')}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weather toggle */}
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>{t('screens.tvManager.weatherLabel')}</Text>
        <Switch
          value={row.show_weather}
          onValueChange={(value) => applyPatch(row, { show_weather: value })}
          trackColor={{ false: colors.background.card, true: colors.brand.mid }}
          thumbColor={colors.brand.light}
          accessibilityLabel={t('screens.tvManager.weatherLabel')}
        />
      </View>

      {/* Location refresh */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onUpdateLocation}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tvManager.updateLocationAction')}
      >
        <Text style={styles.secondaryButtonText}>{t('screens.tvManager.updateLocationAction')}</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>{t('screens.tvManager.updateLocationHint')}</Text>

      {/* Deep settings toggle */}
      <TouchableOpacity
        style={styles.deepToggle}
        onPress={onToggleDeepExpanded}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tvManager.deepSettingsLabel')}
        accessibilityState={{ expanded: deepExpanded }}
      >
        <Text style={styles.deepToggleText}>{t('screens.tvManager.deepSettingsLabel')}</Text>
        <Text style={styles.chevron}>{deepExpanded ? '︿' : '﹀'}</Text>
      </TouchableOpacity>
      {deepExpanded && (
        <TvDeepSettings
          row={row}
          applyPatch={applyPatch}
          manualLat={manualLat}
          manualLng={manualLng}
          onManualLatChange={onManualLatChange}
          onManualLngChange={onManualLngChange}
          onManualLocationCommit={onManualLocationCommit}
          onIqamaOffsetChange={onIqamaOffsetChange}
          manualEditing={manualEditing}
          onToggleManualEditing={onToggleManualEditing}
        />
      )}

      {/* Delete */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tvManager.deleteAction')}
      >
        <Text style={styles.deleteButtonText}>{t('screens.tvManager.deleteAction')}</Text>
      </TouchableOpacity>
    </View>
  );
}
