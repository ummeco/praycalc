/**
 * Purpose: Shared StyleSheet factory for all `components/states` UI-state components
 *   (LoadingState, SkeletonState family, ErrorState, EmptyState, OfflineState,
 *   PermissionDeniedState, RateLimitedState). Split out of the former monolithic
 *   `states/index.tsx` so each component can live in its own file while still sharing
 *   one style object (e.g. `container`, `message`, `button`, `buttonText`).
 * Inputs: colors (ThemeColors) — current theme palette.
 * Outputs: createStyles(colors) -> StyleSheet.
 * Constraints: Values must stay byte-identical to the pre-split styles (no visual diff).
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
