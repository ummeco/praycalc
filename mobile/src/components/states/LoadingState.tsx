/**
 * Purpose: Full-screen loading spinner state, shown while a screen's primary data is
 *   in flight. Part of the `components/states` shared UI-state set (see states/index.tsx).
 * Inputs: message (optional override; defaults to t('common.loading')).
 * Outputs: LoadingState React component.
 * Constraints: Accessible (WCAG 2.1 AA) via accessibilityRole="progressbar". Theme-aware.
 */

import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

export function LoadingState({ message }: { message?: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedMessage = message ?? t('common.loading');
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={resolvedMessage}>
      <ActivityIndicator size="large" color={colors.brand.mid} />
      <Text style={styles.message}>{resolvedMessage}</Text>
    </View>
  );
}
