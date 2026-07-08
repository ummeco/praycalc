/**
 * Purpose: Rate-limited (HTTP 429) state with an optional countdown-aware retry copy.
 *   Part of the `components/states` shared UI-state set (see states/index.tsx).
 * Inputs: retryAfter (seconds), onRetry.
 * Outputs: RateLimitedState React component.
 * Constraints: Accessible (WCAG 2.1 AA); theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

export function RateLimitedState({ retryAfter, onRetry }: {
  retryAfter?: number; // seconds
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.message} accessibilityRole="text">
        {retryAfter
          ? t('common.tooManyRequestsRetry', { seconds: retryAfter })
          : t('common.tooManyRequestsRetryGeneric')}
      </Text>
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
