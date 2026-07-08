/**
 * Purpose: FlatList header for the masjid mute zones list — intro copy,
 *   master auto-mute toggle, permission-denied/platform info cards, and the
 *   "zones" heading + add button. Extracted from MasjidMuteScreen to keep
 *   both files under the 300-line cap; behavior unchanged.
 * Inputs: autoMuteEnabled, permissionDenied, zones.length, onMasterToggle,
 *   onAddZone callbacks, colors, styles (shared createStyles(colors)
 *   result), t (i18n translate).
 * Outputs: ZoneListHeader — rendered as FlatList's ListHeaderComponent.
 * Constraints: No behavior change from the inline version in
 *   MasjidMuteScreen.tsx — same accessibility labels/roles.
 */

import React from 'react';
import { View, Text, Switch, TouchableOpacity, Platform } from 'react-native';
import type { ThemeColors } from '../../constants/colors';
import type { createStyles } from './MasjidMuteScreen.styles';

export interface ZoneListHeaderProps {
  autoMuteEnabled: boolean;
  permissionDenied: boolean;
  hasZones: boolean;
  onMasterToggle: (enabled: boolean) => void;
  onAddZone: () => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function ZoneListHeader({
  autoMuteEnabled, permissionDenied, hasZones, onMasterToggle, onAddZone, colors, styles, t,
}: ZoneListHeaderProps) {
  return (
    <View>
      <Text style={styles.intro}>{t('screens.masjidMute.intro')}</Text>

      <View style={styles.masterCard}>
        <View style={styles.masterLeft}>
          <Text style={styles.masterLabel}>{t('screens.masjidMute.masterToggleLabel')}</Text>
          <Text style={styles.masterSub}>{t('screens.masjidMute.masterToggleSubtitle')}</Text>
        </View>
        <Switch
          value={autoMuteEnabled}
          onValueChange={onMasterToggle}
          trackColor={{ false: colors.background.card, true: colors.brand.mid }}
          thumbColor={colors.brand.light}
          accessibilityLabel={t('screens.masjidMute.masterToggleLabel')}
        />
      </View>

      {permissionDenied && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{t('screens.masjidMute.permissionDeniedNote')}</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          {Platform.OS === 'android' ? t('screens.masjidMute.androidNote') : t('screens.masjidMute.iosNote')}
        </Text>
      </View>

      {hasZones && (
        <View style={styles.zonesHeadingRow}>
          <Text style={styles.zonesHeading} accessibilityRole="header">{t('screens.masjidMute.zonesHeading')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddZone}
            accessibilityRole="button"
            accessibilityLabel={t('screens.masjidMute.addZoneButton')}
          >
            <Text style={styles.addBtnText}>+ {t('screens.masjidMute.addZoneButton')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
