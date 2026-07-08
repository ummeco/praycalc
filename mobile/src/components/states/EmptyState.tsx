/**
 * Purpose: Empty-content state supporting two shapes (ported from the former
 *   UIStates.tsx during consolidation): a single `message` line, or a `title` +
 *   optional `subtitle` pair. Part of the `components/states` shared UI-state set
 *   (see states/index.tsx).
 * Inputs: message, title, subtitle, action, onAction.
 * Outputs: EmptyState React component.
 * Constraints: At least one of `message`/`title` should be passed by the caller.
 *   Accessible (WCAG 2.1 AA); theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

export function EmptyState({ message, title, subtitle, action, onAction }: {
  message?: string;
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const heading = title ?? message ?? t('common.nothingHereYet');
  return (
    <View style={styles.container}>
      <Text style={styles.emptyIcon} aria-hidden>🕌</Text>
      <Text style={title ? styles.emptyTitle : styles.message} accessibilityRole="text">{heading}</Text>
      {subtitle ? <Text style={styles.message}>{subtitle}</Text> : null}
      {action && onAction && (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={action}
        >
          <Text style={styles.buttonText}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
