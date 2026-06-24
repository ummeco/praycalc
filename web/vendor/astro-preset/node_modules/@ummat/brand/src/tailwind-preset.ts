/**
 * FILE: packages/brand/src/tailwind-preset.ts
 * PURPOSE: Tailwind v3 preset exposing Ummat tokens as utility classes.
 * INVARIANTS:
 *   - Targets Tailwind v3.3+ (logical properties + text-start/end native).
 *   - Tailwind v4 consumers configure via @theme in globals.css — see packages/shared/tailwind/preset.ts.
 *   - The `green` palette object MUST match tokens/colors.ts canonical hex values.
 *   - No external plugins beyond a small RTL variant plugin (already shipped by @ummat/shared).
 * DO NOT: extend colors outside the green family here; consumer apps add brand-adjacent colors
 *   via their own tailwind.config.ts `theme.extend`.
 * REF: T-P7-C-S10-01, T-P7-C-S10-02
 */
import type { Config } from 'tailwindcss'
import { green } from './tokens/colors'
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
} from './tokens/typography'
import { spacing, borderRadius, shadows } from './tokens/spacing'

export const ummatBrandPreset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Spread the canonical green scale so Tailwind utilities like bg-green-400 produce #79C24C.
        green: { ...green },
        brand: {
          DEFAULT: green[400],
          light: green[100],
          'light-bg': green[500],
          dark: green[700],
          deep: green[900],
          wash: green[50],
        },
      },
      fontFamily: {
        sans: [...fontFamilies.sans],
        mono: [...fontFamilies.mono],
        arabic: [...fontFamilies.arabic],
        quran: [...fontFamilies.quran],
      },
      fontWeight: {
        regular: String(fontWeights.regular),
        medium: String(fontWeights.medium),
        semibold: String(fontWeights.semibold),
        bold: String(fontWeights.bold),
        extrabold: String(fontWeights.extrabold),
      },
      fontSize: { ...fontSizes },
      lineHeight: {
        tight: String(lineHeights.tight),
        snug: String(lineHeights.snug),
        normal: String(lineHeights.normal),
        relaxed: String(lineHeights.relaxed),
        loose: String(lineHeights.loose),
      },
      spacing: { ...spacing },
      borderRadius: { ...borderRadius },
      boxShadow: { ...shadows },
    },
  },
  plugins: [],
}

export default ummatBrandPreset
