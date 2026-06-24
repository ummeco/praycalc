/**
 * FILE: packages/brand/src/tokens/index.ts
 * PURPOSE: Aggregated token export for @ummat/brand consumers.
 * INVARIANTS:
 *   - All token categories (colors, typography, spacing, borderRadius, shadows) must be
 *     re-exported under both their named exports and the `tokens` aggregate object.
 *   - The aggregate object shape is stable; consumers depend on `tokens.colors.green[400]`,
 *     `tokens.typography.fontFamilies.arabic`, etc.
 * DO NOT: rename top-level keys without a major version bump.
 * REF: T-P7-C-S10-01
 */

export { colors, green, semantic } from './colors'
export type { Colors, GreenScale, GreenStop, SemanticColors } from './colors'

export {
  typography,
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
} from './typography'
export type {
  Typography,
  FontFamilies,
  FontWeights,
  FontSizes,
  LineHeights,
} from './typography'

export { spacing, borderRadius, shadows } from './spacing'
export type { Spacing, BorderRadius, Shadows } from './spacing'

import { colors } from './colors'
import { typography } from './typography'
import { spacing, borderRadius, shadows } from './spacing'

/**
 * Aggregated tokens object. Shape is stable across minor versions.
 */
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const

export type Tokens = typeof tokens
