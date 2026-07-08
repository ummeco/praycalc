/**
 * Purpose: Skeleton-placeholder trio (row-list, single bar, card-shaped) used while
 *   content streams in. Part of the `components/states` shared UI-state set (see
 *   states/index.tsx). Grouped together since SkeletonBar/SkeletonCard are small
 *   building blocks composed from each other.
 * Inputs: SkeletonState(rows), SkeletonBar(width, height), SkeletonCard() (no props).
 * Outputs: SkeletonState, SkeletonBar, SkeletonCard React components.
 * Constraints: Theme-aware via useThemeColors; no fixed font sizes.
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { createStyles } from './states.styles';

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
