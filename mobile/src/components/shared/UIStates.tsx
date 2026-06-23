/**
 * Purpose: Shared 7-UI-state components used across all praycalc/mobile screens.
 *   States: loading (skeleton), success (pass-through), empty, error, offline,
 *   permission-denied, rate-limited.
 * Inputs: State-specific props
 * Outputs: React Native view components
 * Constraints: No external UI library — StyleSheet only.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-ui-states
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';

// ── Loading / Skeleton ────────────────────────────────────────────────────────

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.brand.dark} />
      <Text style={styles.label}>{message}</Text>
    </View>
  );
}

export function SkeletonBar({ width = '80%', height = 16 }: { width?: number | string; height?: number }) {
  return <View style={[styles.skeletonBar, { width: width as number, height }]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonBar width="60%" height={20} />
      <SkeletonBar width="40%" height={14} />
      <SkeletonBar width="50%" height={14} />
    </View>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────

export function EmptyState({
  title = 'Nothing here yet',
  subtitle,
  action,
  onAction,
}: {
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.label}>{subtitle}</Text> : null}
      {action && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────────

export function ErrorState({
  error,
  onRetry,
}: {
  error: string | Error | null;
  onRetry?: () => void;
}) {
  const message = error instanceof Error ? error.message : (error ?? 'An error occurred');
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.label}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Offline ───────────────────────────────────────────────────────────────────

export function OfflineState({
  message = "You're offline. Showing cached data.",
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.offlineContainer}>
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineBannerText}>{message}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Permission Denied ─────────────────────────────────────────────────────────

export function PermissionDeniedState({
  permission = 'location',
  onOpenSettings,
}: {
  permission?: string;
  onOpenSettings?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{`${permission.charAt(0).toUpperCase() + permission.slice(1)} Permission Required`}</Text>
      <Text style={styles.label}>
        {`Prayer times require ${permission} access. Please enable it in Settings.`}
      </Text>
      {onOpenSettings ? (
        <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Rate Limited ──────────────────────────────────────────────────────────────

export function RateLimitedState({
  retryAfterSeconds = 60,
  onRetry,
}: {
  retryAfterSeconds?: number;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>Too Many Requests</Text>
      <Text style={styles.label}>
        {`Please wait ${retryAfterSeconds}s before trying again.`}
      </Text>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.state.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.brand.dark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  skeletonBar: {
    backgroundColor: Colors.background.card,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCard: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginVertical: 4,
    width: '100%',
    gap: 8,
  },
  offlineContainer: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: Colors.state.warning,
    padding: 8,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: Colors.text.inverse,
    fontSize: 13,
    fontWeight: '500',
  },
});
