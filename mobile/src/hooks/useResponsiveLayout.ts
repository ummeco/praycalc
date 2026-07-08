/**
 * Purpose: Shared tablet/wide-viewport detection for adaptive layouts. The app has
 *   a tablet flag in app.json but no adaptive layouts existed anywhere — this hook
 *   is the single source of truth for the width breakpoint so every screen agrees
 *   on what counts as "wide" instead of each screen picking its own threshold.
 * Inputs: react-native's useWindowDimensions (reacts to rotation/split-view resize).
 * Outputs: { isWide, width, maxContentWidth } — isWide true at width >= 768
 *   (standard tablet portrait breakpoint), maxContentWidth a sensible cap so wide
 *   screens get a centered reading-width column instead of a stretched phone UI.
 * Constraints: Pure derived state, no side effects — safe to call from any component.
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-useResponsiveLayout
 */

import { useWindowDimensions } from 'react-native';

/** Tablet portrait breakpoint — matches iPad mini (768pt) and up. */
export const WIDE_BREAKPOINT = 768;

/** Centered column cap for wide screens — avoids a stretched, hard-to-scan phone UI. */
export const MAX_CONTENT_WIDTH = 680;

export interface ResponsiveLayout {
  width: number;
  height: number;
  /** True when the viewport is tablet-width (>= 768pt) or wider. */
  isWide: boolean;
  /** Cap to apply to a centered content container on wide screens. */
  maxContentWidth: number;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isWide: width >= WIDE_BREAKPOINT,
    maxContentWidth: MAX_CONTENT_WIDTH,
  };
}
