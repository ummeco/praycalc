/**
 * Purpose: "Layout & Theme" picker rendered atop TvDeepSettings — lets the user choose
 *   the TV's on-screen layout (classic/flipped/stream-full/times-only/ambient) and color
 *   theme (ummat-green/midnight/warm-sand/mono) for one paired TV. Mirrors
 *   web/src/islands/account/TvLayoutThemePicker.tsx and
 *   desktop/src/components/TvLayoutThemePicker.tsx field-for-field (same 5 layouts, same
 *   4 themes, same swatch hexes) so all three "My TVs" surfaces present identical
 *   choices.
 * Inputs: row (TvSettingsRow) for the current layout/theme value, applyPatch (parent's
 *   optimistic-update+save handler, the same one TvDeepSettings/TvCardBody already use).
 * Outputs: renders two radiogroups; calls applyPatch immediately on each selection
 *   (matches the immediate-apply pattern already used by madhab/time-format/calc-method
 *   chips in TvDeepSettings).
 * Constraints: no `any`; react-native-svg is not a dependency of this app (no-install
 *   rule for this ticket), so each layout thumbnail is sketched with plain nested <View>
 *   boxes instead of SVG — same visual intent (2/3+1/3 split, mirrored split, full-bleed
 *   + bottom strip, 2x2 grid, centered ambient dot) as the web/desktop inline-SVG
 *   thumbnails.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-tv-layout-theme-picker
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './tvManagerStyles';
import type { TvSettingsRow } from './tvManagerQueries';
import type { TvLayout, TvSettingsPatch } from '../../lib/pairing/pairingMutation';
import {
  LAYOUT_OPTIONS,
  LAYOUT_LABEL_KEYS,
  LAYOUT_DESC_KEYS,
  THEME_OPTIONS,
  THEME_LABEL_KEYS,
  THEME_SWATCHES,
} from './tvManagerConstants';

interface TvLayoutThemePickerProps {
  row: TvSettingsRow;
  applyPatch: (row: TvSettingsRow, changes: TvSettingsPatch) => Promise<void>;
}

export function TvLayoutThemePicker({ row, applyPatch }: TvLayoutThemePickerProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.layoutThemeSection}>
      <Text style={styles.subLabel}>{t('screens.tvManager.layoutThemeLabel')}</Text>

      <Text style={styles.fieldLabel}>{t('screens.tvManager.layoutLabel')}</Text>
      <View style={styles.layoutGrid}>
        {LAYOUT_OPTIONS.map((option) => {
          const isSelected = row.layout === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.layoutCard, isSelected && styles.layoutCardSelected]}
              onPress={() => void applyPatch(row, { layout: option })}
              accessibilityRole="radio"
              accessibilityLabel={t(LAYOUT_LABEL_KEYS[option])}
              accessibilityState={{ selected: isSelected }}
            >
              <LayoutThumbnail variant={option} styles={styles} />
              <Text style={styles.layoutCardTitle}>{t(LAYOUT_LABEL_KEYS[option])}</Text>
              <Text style={styles.layoutCardDesc}>{t(LAYOUT_DESC_KEYS[option])}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>{t('screens.tvManager.themeLabel')}</Text>
      <View style={styles.themeGrid}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = row.theme === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.themeCard, isSelected && styles.themeCardSelected]}
              onPress={() => void applyPatch(row, { theme: option })}
              accessibilityRole="radio"
              accessibilityLabel={t(THEME_LABEL_KEYS[option])}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.themeSwatchRow}>
                {THEME_SWATCHES[option].map((hex) => (
                  <View key={hex} style={[styles.themeSwatchDot, { backgroundColor: hex }]} />
                ))}
              </View>
              <Text style={styles.themeCardTitle}>{t(THEME_LABEL_KEYS[option])}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** Plain-View sketch of each layout's arrangement (no react-native-svg dependency). */
function LayoutThumbnail({
  variant,
  styles,
}: {
  variant: TvLayout;
  styles: ReturnType<typeof createStyles>;
}) {
  switch (variant) {
    case 'classic':
      return (
        <View style={styles.thumb}>
          <View style={[styles.thumbBlock, { flex: 2 }]} />
          <View style={[styles.thumbBlock, styles.thumbAccent, { flex: 1 }]} />
        </View>
      );
    case 'flipped':
      return (
        <View style={styles.thumb}>
          <View style={[styles.thumbBlock, styles.thumbAccent, { flex: 1 }]} />
          <View style={[styles.thumbBlock, { flex: 2 }]} />
        </View>
      );
    case 'stream-full':
      return (
        <View style={[styles.thumb, styles.thumbColumn]}>
          <View style={[styles.thumbBlock, styles.thumbAccent, { flex: 1 }]} />
          <View style={[styles.thumbBlock, styles.thumbStrip]} />
        </View>
      );
    case 'times-only':
      return (
        <View style={[styles.thumb, styles.thumbGrid]}>
          <View style={styles.thumbGridCell} />
          <View style={styles.thumbGridCell} />
          <View style={styles.thumbGridCell} />
          <View style={styles.thumbGridCell} />
        </View>
      );
    case 'ambient':
      return (
        <View style={styles.thumb}>
          <View style={styles.thumbDot} />
        </View>
      );
    default:
      return <View style={styles.thumb} />;
  }
}
