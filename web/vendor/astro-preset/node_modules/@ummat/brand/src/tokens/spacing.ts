/**
 * FILE: packages/brand/src/tokens/spacing.ts
 * PURPOSE: Spacing, border radius, and shadow tokens for the Ummat ecosystem.
 * INVARIANTS:
 *   - Spacing follows a 4-px base grid (Tailwind-compatible).
 *   - Border radius uses semantic names (sm/md/lg/full) rather than raw px.
 *   - Shadows use brand-green tints, not neutral grays, for cohesion.
 * DO NOT: introduce off-grid spacing values without ADR.
 * REF: T-P7-C-S10-01, brand-guide.md
 */

export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const

export type Spacing = typeof spacing

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const

export type BorderRadius = typeof borderRadius

/**
 * Shadow tokens tinted with brand green for ecosystem cohesion (RGBA of #0D2F17).
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(13, 47, 23, 0.06)',
  md: '0 4px 6px -1px rgba(13, 47, 23, 0.10), 0 2px 4px -2px rgba(13, 47, 23, 0.06)',
  lg: '0 10px 15px -3px rgba(13, 47, 23, 0.12), 0 4px 6px -4px rgba(13, 47, 23, 0.08)',
  xl: '0 20px 25px -5px rgba(13, 47, 23, 0.15), 0 8px 10px -6px rgba(13, 47, 23, 0.10)',
} as const

export type Shadows = typeof shadows
