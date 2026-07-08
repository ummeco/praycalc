/**
 * Purpose: Offline banner, optionally wrapping cached content (ported from the former
 *   UIStates.tsx during consolidation — e.g. PrayerTimesScreen shows last-known prayer
 *   times under the banner instead of an empty screen). Part of the `components/states`
 *   shared UI-state set (see states/index.tsx).
 * Inputs: message (pre-composed override), cachedAt, children.
 * Outputs: OfflineState React component.
 * Constraints: `message` takes priority; else `cachedAt` fills the cached-data copy;
 *   else falls back to a generic offline message. Theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

export function OfflineState({ message, cachedAt, children }: {
  message?: string;
  cachedAt?: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.offlineContainer}>
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText} accessibilityRole="text">
          {message
            ?? (cachedAt
              ? t('common.offlineShowingCachedFrom', { cachedAt })
              : t('common.offlineShowingCachedGeneric'))}
        </Text>
      </View>
      {children}
    </View>
  );
}
