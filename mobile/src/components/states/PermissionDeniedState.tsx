/**
 * Purpose: Permission-denied state with an "open settings" action. Part of the
 *   `components/states` shared UI-state set (see states/index.tsx).
 * Inputs: permission (name shown in body copy), onOpenSettings.
 * Outputs: PermissionDeniedState React component.
 * Constraints: Accessible (WCAG 2.1 AA); theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

export function PermissionDeniedState({
  permission,
  onOpenSettings,
}: {
  permission: string;
  onOpenSettings?: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle} accessibilityRole="text">{t('common.permissionRequiredGeneric')}</Text>
      <Text style={styles.message}>
        {t('common.permissionRequiredGenericBody', { permission })}
      </Text>
      {onOpenSettings && (
        <TouchableOpacity
          style={styles.button}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel={t('common.openSettings')}
        >
          <Text style={styles.buttonText}>{t('common.openSettings')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
