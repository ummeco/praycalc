/**
 * FILE: packages/brand/src/themes/ramadan.ts
 * PURPOSE: Ramadan seasonal theme. Active Ramadan 1-29.
 *   Darker green base + warm gold accent + crescent motif.
 * INVARIANTS: gold accent is brand-adjacent only; never replaces the green primary.
 * REF: T-P7-C-S10-T06, T-P7-C-S10-T07
 */
import { green } from '../tokens/colors'
import type { Theme } from './types'

export const ramadanTheme: Theme = {
  name: 'ramadan',
  displayName: 'Ramadan',
  cssVars: {
    '--brand-primary': green[700],
    '--brand-on-light': green[700],
    '--brand-dark': green[900],
    '--brand-deep': '#06190C',
    '--brand-light': green[100],
    '--brand-wash': green[50],
    '--brand-accent': '#D4AF37',
    '--brand-background-pattern': 'url("/themes/ramadan/crescent-pattern.svg")',
  },
  motif: 'crescent',
  notes: 'Darker greens + warm gold accent. Crescent motif in headers.',
} as const
