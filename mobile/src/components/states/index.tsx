/**
 * Purpose: Barrel for the shared 7-UI-state component set used across all feature
 *   screens. This module is the SURVIVOR of a consolidation with the former
 *   `components/shared/UIStates.tsx` (now deleted) — `SkeletonCard`/`SkeletonBar` and
 *   the richer `title`/`subtitle` EmptyState shape + `children`-carrying OfflineState
 *   were ported in from there so no capability was lost when the duplicate was removed.
 *   Split (2026-07-08) from a single 315-line file into one file per component plus a
 *   shared `states.styles.ts`, purely to respect the 300-line-per-file cap — every
 *   consumer keeps importing from this directory (`.../components/states`) unchanged.
 * Inputs: n/a (barrel — re-exports only).
 * Outputs: LoadingState, SkeletonState, SkeletonBar, SkeletonCard, ErrorState, EmptyState,
 *          OfflineState, PermissionDeniedState, RateLimitedState React components.
 * Constraints: All must be accessible (WCAG 2.1 AA); no fixed font sizes.
 *   Theme-aware via useThemeColors.
 */

export * from './LoadingState';
export * from './Skeleton';
export * from './ErrorState';
export * from './EmptyState';
export * from './OfflineState';
export * from './PermissionDeniedState';
export * from './RateLimitedState';
