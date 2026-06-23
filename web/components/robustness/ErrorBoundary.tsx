/**
 * FILE:    praycalc/web/components/robustness/ErrorBoundary.tsx
 * PURPOSE: Route-level React ErrorBoundary for praycalc.com.
 *   Re-exports from @ummat/errors/boundary so the app never contains a copy.
 *   Every route-level component MUST be wrapped in this boundary.
 *
 * Inputs:  fallback (ReactNode) + children (ReactNode)
 * Outputs: children in normal operation; fallback on caught error.
 *
 * SPORT: P2-E5-W01-S01-T01 — robustness rollout (praycalc/web)
 * Ref: .claude/docs/p2-robustness-framework-spec.md §3
 */

export { ErrorBoundary, ErrorState } from '@ummat/errors/boundary'
export type { default } from '@ummat/errors/boundary'
