/**
 * Purpose: Generic error state with optional retry action. Part of the
 *   `components/states` shared UI-state set (see states/index.tsx).
 * Inputs: error (Error | string | null), onRetry.
 * Outputs: ErrorState React component.
 * Constraints: Accessible (WCAG 2.1 AA); theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

export function ErrorState({
  error,
  onRetry,
}: {
  error?: Error | string | null;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const msg = typeof error === 'string' ? error : error?.message ?? t('common.somethingWentWrong');
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle} accessibilityRole="text">{t('common.error')}</Text>
      <Text style={styles.message}>{msg}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
        >
          <Text style={styles.buttonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
