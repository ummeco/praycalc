/**
 * FILE: packages/brand/src/themes/dhul-hijjah.ts
 * PURPOSE: Dhul Hijjah seasonal theme. Active Dhul Hijjah 1-13 (covers Hajj + Eid ul-Adha).
 *   Hajj-inspired deep greens + optional Kaaba motif.
 * REF: T-P7-C-S10-T06, T-P7-C-S10-T07
 */
import { green } from '../tokens/colors'
import type { Theme } from './types'

export const dhulHijjahTheme: Theme = {
  name: 'dhul-hijjah',
  displayName: 'Dhul Hijjah',
  cssVars: {
    '--brand-primary': green[700],
    '--brand-on-light': green[700],
    '--brand-dark': green[900],
    '--brand-deep': '#061908',
    '--brand-light': green[100],
    '--brand-wash': green[50],
    '--brand-accent': '#C9A24C',
    '--brand-background-pattern': 'url("/themes/dhul-hijjah/kaaba-pattern.svg")',
  },
  motif: 'kaaba',
  notes: 'Hajj-inspired deep greens + muted gold accent. Kaaba motif available.',
} as const
