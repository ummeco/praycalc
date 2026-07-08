/**
 * Purpose: Single row in the masjid mute zones list — tap to edit, ✕ to
 *   delete, shows "active now" badge when the zone is currently entered.
 *   Extracted from MasjidMuteScreen to keep both files under the 300-line cap.
 * Inputs: zone (MuteZone), isActive (bool), onEdit/onDelete callbacks,
 *   styles (shared createStyles(colors) result), t (i18n translate).
 * Outputs: ZoneListRow — one FlatList renderItem row.
 * Constraints: No behavior change from the inline version in
 *   MasjidMuteScreen.tsx — same accessibility labels/roles.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { MuteZone } from './store/useMuteStore';
import type { createStyles } from './MasjidMuteScreen.styles';

export interface ZoneListRowProps {
  zone: MuteZone;
  isActive: boolean;
  onEdit: (zone: MuteZone) => void;
  onDelete: (zone: MuteZone) => void;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function ZoneListRow({ zone, isActive, onEdit, onDelete, styles, t }: ZoneListRowProps) {
  return (
    <View style={styles.zoneRow} accessible accessibilityLabel={`${zone.label}, ${zone.radiusMeters} meter radius`}>
      <TouchableOpacity style={styles.zoneInfo} onPress={() => onEdit(zone)} accessibilityRole="button">
        <Text style={styles.zoneLabel}>{zone.label}</Text>
        <Text style={styles.zoneSub}>{t('screens.masjidMute.radiusValue', { radius: zone.radiusMeters })}</Text>
        {isActive && <Text style={styles.zoneActive}>{t('screens.masjidMute.activeNow')}</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(zone)}
        accessibilityRole="button"
        accessibilityLabel={`${t('screens.masjidMute.deleteZone')} ${zone.label}`}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}
