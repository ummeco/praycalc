/**
 * Purpose: Shared 7-UI-state components used across all feature screens.
 * Inputs: error, onRetry, message, permission props.
 * Outputs: LoadingState, SkeletonState, ErrorState, EmptyState, OfflineState,
 *          PermissionDeniedState, RateLimitedState React components.
 * Constraints: All must be accessible (WCAG 2.1 AA); no fixed font sizes.
 *   Theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';

// ── LoadingState ──────────────────────────────────────────────────────────────

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.brand.mid} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// ── SkeletonState ─────────────────────────────────────────────────────────────

export function SkeletonState({ rows = 5 }: { rows?: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container} accessibilityLabel="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.skeletonRow, { width: i % 2 === 0 ? '90%' : '70%' }]} />
      ))}
    </View>
  );
}

// ── ErrorState ────────────────────────────────────────────────────────────────

export function ErrorState({
  error,
  onRetry,
}: {
  error?: Error | string | null;
  onRetry?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const msg = typeof error === 'string' ? error : error?.message ?? 'Something went wrong.';
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle} accessibilityRole="text">Error</Text>
      <Text style={styles.message}>{msg}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

export function EmptyState({ message, action, onAction }: {
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.emptyIcon} aria-hidden>🕌</Text>
      <Text style={styles.message} accessibilityRole="text">{message}</Text>
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

// ── OfflineState ──────────────────────────────────────────────────────────────

export function OfflineState({ cachedAt }: { cachedAt?: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText} accessibilityRole="text">
        You're offline. {cachedAt ? `Showing data from ${cachedAt}.` : 'Cached data shown.'}
      </Text>
    </View>
  );
}

// ── PermissionDeniedState ─────────────────────────────────────────────────────

export function PermissionDeniedState({
  permission,
  onOpenSettings,
}: {
  permission: string;
  onOpenSettings?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle} accessibilityRole="text">Permission Required</Text>
      <Text style={styles.message}>
        {`${permission} permission is required for this feature.`}
      </Text>
      {onOpenSettings && (
        <TouchableOpacity
          style={styles.button}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Open system settings"
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── RateLimitedState ──────────────────────────────────────────────────────────

export function RateLimitedState({ retryAfter, onRetry }: {
  retryAfter?: number; // seconds
  onRetry?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.message} accessibilityRole="text">
        {retryAfter
          ? `Too many requests. Please wait ${retryAfter}s before retrying.`
          : 'Too many requests. Please wait before retrying.'}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry request"
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.state.error,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.brand.mid,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: colors.brand.deep,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  offlineText: {
    color: colors.text.inverse,
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonRow: {
    height: 20,
    backgroundColor: colors.brand.light + '44',
    borderRadius: 4,
    marginVertical: 6,
  },
});
