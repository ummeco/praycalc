/**
 * Purpose: Shared 7-UI-state components used across all praycalc/mobile screens.
 *   States: loading (skeleton), success (pass-through), empty, error, offline,
 *   permission-denied, rate-limited.
 * Inputs: State-specific props
 * Outputs: React Native view components
 * Constraints: No external UI library — StyleSheet only. Theme-aware via useThemeColors.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-ui-states
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';

// ── Loading / Skeleton ────────────────────────────────────────────────────────

export function LoadingState({ message }: { message?: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand.dark} />
      <Text style={styles.label}>{message ?? t('common.loading')}</Text>
    </View>
  );
}

export function SkeletonBar({ width = '80%', height = 16 }: { width?: number | string; height?: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.skeletonBar, { width: width as number, height }]} />;
}

export function SkeletonCard() {
  return (
    <View style={createStyles(useThemeColors()).skeletonCard}>
      <SkeletonBar width="60%" height={20} />
      <SkeletonBar width="40%" height={14} />
      <SkeletonBar width="50%" height={14} />
    </View>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  subtitle,
  action,
  onAction,
}: {
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title ?? t('common.nothingHereYet')}</Text>
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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const message = error instanceof Error ? error.message : (error ?? t('common.error'));
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>{t('common.somethingWentWrong')}</Text>
      <Text style={styles.label}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Offline ───────────────────────────────────────────────────────────────────

export function OfflineState({
  message,
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.offlineContainer}>
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineBannerText}>{message ?? t('common.offlineCachedData')}</Text>
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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const permissionLabel = permission.charAt(0).toUpperCase() + permission.slice(1);
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{t('common.permissionRequired', { permission: permissionLabel })}</Text>
      <Text style={styles.label}>
        {t('common.permissionRequiredBody', { permission })}
      </Text>
      {onOpenSettings ? (
        <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
          <Text style={styles.buttonText}>{t('common.openSettings')}</Text>
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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{t('common.tooManyRequests')}</Text>
      <Text style={styles.label}>
        {t('common.waitBeforeRetrying', { seconds: retryAfterSeconds })}
      </Text>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.state.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.brand.dark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
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
  offlineContainer: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: colors.state.warning,
    padding: 8,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '500',
  },
});
