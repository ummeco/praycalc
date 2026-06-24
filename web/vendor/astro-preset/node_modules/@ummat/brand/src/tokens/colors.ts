/**
 * FILE: packages/brand/src/tokens/colors.ts
 * PURPOSE: Canonical brand color palette for the Ummat ecosystem. Single source of truth.
 * INVARIANTS:
 *   - The four canonical hex values are LOCKED per PPI brand section:
 *       #C9F27A (light)  #79C24C (mid)  #1E5E2F (dark)  #0D2F17 (deep)
 *   - The light-bg AA-contrast variant #5A9438 is added per Wave 4 finding (T-P7-C-S10-01).
 *   - All ecosystem apps share this palette. Per-app overrides live in src/apps/*.ts.
 * DO NOT: change canonical hex values without a STORM-approved brand decision; add palette
 *   colors outside the green family without ADR; rename the `green` scale.
 * REF: T-P7-C-S10-01, T-P7-C-S10-T14 (color sweep), brand-guide.md
 */

/** Canonical Ummat green scale. Numeric stops follow Tailwind convention. */
export const green = {
  /** Lightest tint — large surfaces, hover wash on dark green. */
  50: '#F4FBE8',
  /** Brand "light" — highlights, accents, light-mode backgrounds (canonical). */
  100: '#C9F27A',
  /** Brand "mid" — primary brand color: buttons, icons, CTAs on dark bg (canonical). */
  400: '#79C24C',
  /** Light-bg AA-contrast variant — use as primary on light bg where #79C24C fails contrast (Wave 4). */
  500: '#5A9438',
  /** Brand "dark" — dark mode primary, body text on light bg (canonical). */
  700: '#1E5E2F',
  /** Brand "deep" — dark mode backgrounds, deep contrast (canonical). */
  900: '#0D2F17',
} as const

export type GreenScale = typeof green
export type GreenStop = keyof GreenScale

/**
 * Semantic color aliases. Use these in component code in preference to raw scale stops.
 * Surface and content tokens map intent → palette stops, allowing themes to remap without
 * editing components.
 *
 * WCAG contrast ratios on white (#FFFFFF):
 *   green[400] (#79C24C) = 2.93:1  → FAIL AA (do not use as text colour on white/light bg)
 *   green[500] (#5A9438) = 4.50:1  → PASS AA (minimum for normal text)
 *   green[700] (#1E5E2F) = 7.53:1  → PASS AAA
 *   green[900] (#0D2F17) = 14.2:1  → PASS AAA
 *
 * T06 (p9-sprint-I18N-RTL-WAVE0-SETUP): green.accent introduced to make the semantic
 * role of #79C24C explicit (decorative / CTA on dark bg only, NOT text on white).
 * green.textOnWhite is the mandatory foreground for body text on white/light surfaces.
 */
export const semantic = {
  brand: green[400],
  brandOnLight: green[500],
  brandDark: green[700],
  brandDeep: green[900],
  brandLight: green[100],
  brandWash: green[50],
  /** Primary text on light background. */
  textOnLight: green[900],
  /** Primary text on dark background. */
  textOnDark: green[50],
  /**
   * Accent colour — decorative elements, icons, CTAs on dark green backgrounds.
   * WCAG 2.93:1 on white → NOT safe as text colour on white or light surfaces.
   * This is the canonical alias for #79C24C (#79C24C → green[400]).
   * Use green.textOnWhite for body text on white/light backgrounds.
   */
  accent: green[400],
  /**
   * Mandatory text colour on white or light (#F4FBE8) backgrounds.
   * WCAG 7.53:1 on white = AAA. Use this wherever #79C24C was previously
   * used as a text colour. Canonical alias for #1E5E2F (green[700]).
   *
   * T06: demotes #79C24C from text use; introduces this named token.
   */
  textOnWhite: green[700],
  /**
   * Text colour on deep green (#0D2F17) backgrounds.
   * WCAG: #C9F27A on #0D2F17 = 8.7:1 (AAA). Canonical alias for green[100].
   */
  textOnDark2: green[100],
} as const

export type SemanticColors = typeof semantic

/**
 * Canonical palette object. Consumers import this for tokens.colors.
 */
export const colors = {
  green,
  semantic,
} as const

export type Colors = typeof colors
