/**
 * FILE: packages/brand/src/themes/muharram.ts
 * PURPOSE: Muharram seasonal theme. Active Muharram 1-10.
 *   Muted, respectful tones. No festive elements — the month of Ashura is solemn.
 * INVARIANTS:
 *   - No gold or festive accents.
 *   - Background pattern is `none` — visual quiet is the design.
 *   - Per-user opt-out documented in T06 acceptance.
 * REF: T-P7-C-S10-T06, T-P7-C-S10-T07
 */
import { green } from '../tokens/colors'
import type { Theme } from './types'

export const muharramTheme: Theme = {
  name: 'muharram',
  displayName: 'Muharram',
  cssVars: {
    '--brand-primary': green[700],
    '--brand-on-light': green[700],
    '--brand-dark': '#15401F',
    '--brand-deep': '#08200F',
    '--brand-light': '#A8B89A',
    '--brand-wash': '#EEF2EA',
    '--brand-accent': green[700],
    '--brand-background-pattern': 'none',
  },
  motif: null,
  notes: 'Muted, respectful palette. No festive accents. Per-user opt-out supported.',
} as const
