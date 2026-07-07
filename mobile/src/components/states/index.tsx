/**
 * Purpose: Shared 7-UI-state components used across all feature screens. This module is
 *   the SURVIVOR of a consolidation with the former `components/shared/UIStates.tsx` (now
 *   deleted) — `SkeletonCard`/`SkeletonBar` and the richer `title`/`subtitle` EmptyState
 *   shape + `children`-carrying OfflineState were ported in from there so no capability
 *   was lost when the duplicate was removed.
 * Inputs: error, onRetry, message, permission props.
 * Outputs: LoadingState, SkeletonState, SkeletonCard, SkeletonBar, ErrorState, EmptyState,
 *          OfflineState, PermissionDeniedState, RateLimitedState React components.
 * Constraints: All must be accessible (WCAG 2.1 AA); no fixed font sizes.
 *   Theme-aware via useThemeColors.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';

// ── LoadingState ──────────────────────────────────────────────────────────────

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

// ── SkeletonState ─────────────────────────────────────────────────────────────

export function SkeletonState({ rows = 5 }: { rows?: number }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container} accessibilityLabel={t('common.loadingContent')}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.skeletonRow, { width: i % 2 === 0 ? '90%' : '70%' }]} />
      ))}
    </View>
  );
}

/** A single skeleton placeholder bar — building block for card-shaped skeletons. */
export function SkeletonBar({ width = '80%', height = 16 }: { width?: number | string; height?: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.skeletonBar, { width: width as number, height }]} />;
}

/** A card-shaped skeleton (3 bars) — used where the loading content is card-list shaped
 *  (e.g. prayer-times fan) rather than the generic row-list shape of SkeletonState. */
export function SkeletonCard() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.skeletonCard}>
      <SkeletonBar width="60%" height={20} />
      <SkeletonBar width="40%" height={14} />
      <SkeletonBar width="50%" height={14} />
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
          accessibilityLabel="Retry"
        >
          <Text style={styles.buttonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

/**
 * Two supported shapes (ported from the former UIStates.tsx so both call-site styles
 * keep working post-consolidation): a single `message` line, or a `title` + optional
 * `subtitle` pair. At least one of `message`/`title` should be passed by the caller.
 */
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

// ── OfflineState ──────────────────────────────────────────────────────────────

/**
 * Renders an offline banner. `message` (a pre-composed string, e.g. from a caller-owned
 * i18n key) takes priority; else `cachedAt` fills the "showing cached data from X" copy;
 * else falls back to a generic offline message. `children`, if provided, render below the
 * banner (ported from the former UIStates.tsx — e.g. PrayerTimesScreen shows last-known
 * prayer times underneath the banner instead of an empty screen).
 */
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

// ── PermissionDeniedState ─────────────────────────────────────────────────────

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
          accessibilityLabel="Open system settings"
        >
          <Text style={styles.buttonText}>{t('common.openSettings')}</Text>
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
          accessibilityLabel="Retry request"
        >
          <Text style={styles.buttonText}>{t('common.retry')}</Text>
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
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
  offlineContainer: {
    flex: 1,
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
  skeletonBar: {
    backgroundColor: colors.background.card,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCard: {
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginVertical: 4,
    width: '100%',
    gap: 8,
  },
});
