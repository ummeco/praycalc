/**
 * FILE: packages/brand/src/tokens/typography.ts
 * PURPOSE: Typography tokens for Ummat ecosystem. References fonts loaded via @ummat/shared/fonts.
 * INVARIANTS:
 *   - Arabic script (Quran, Hadith, du'a, UI in AR/UR/FA/PS) uses Amiri or Noto Naskh Arabic.
 *   - Quranic verses use Amiri; UI Arabic uses Noto Naskh Arabic.
 *   - Latin script uses Geist (headings + body) with Inter fallback.
 *   - Font-family arrays MUST include CSS var first (set by @ummat/shared/fonts via Next.js).
 * DO NOT: hardcode raw "Amiri" strings in components — use the family tokens here; mix Arabic
 *   text with Latin font-family (RTL boundary required).
 * REF: T-P7-C-S10-01, brand-guide.md, packages/shared/tailwind/preset.ts
 */

export const fontFamilies = {
  /** Latin headings + body. Loaded via @ummat/shared/fonts. */
  sans: ['var(--font-latin)', 'Geist', 'Inter', 'system-ui', 'sans-serif'] as const,
  /** Monospace for code/numbers. */
  mono: ['var(--font-mono)', 'Geist Mono', 'ui-monospace', 'monospace'] as const,
  /** Arabic UI text (menus, labels, UI in AR/UR/FA/PS). */
  arabic: ['var(--font-arabic)', '"Noto Naskh Arabic"', 'serif'] as const,
  /** Quranic verses, Hadith, classical Arabic content. */
  quran: ['var(--font-quran)', 'Amiri', '"Noto Naskh Arabic"', 'serif'] as const,
} as const

export type FontFamilies = typeof fontFamilies

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const

export type FontWeights = typeof fontWeights

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
} as const

export type FontSizes = typeof fontSizes

export const lineHeights = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.65,
  loose: 1.85,
} as const

export type LineHeights = typeof lineHeights

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
} as const

export type Typography = typeof typography
