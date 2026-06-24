/**
 * FILE: packages/brand/src/themes/eid.ts
 * PURPOSE: Eid ul-Fitr seasonal theme. Active Shawwal 1-3.
 *   Lighter, festive palette with bright gold accent.
 * REF: T-P7-C-S10-T06, T-P7-C-S10-T07
 */
import { green } from '../tokens/colors'
import type { Theme } from './types'

export const eidTheme: Theme = {
  name: 'eid',
  displayName: 'Eid',
  cssVars: {
    '--brand-primary': green[400],
    '--brand-on-light': green[500],
    '--brand-dark': green[700],
    '--brand-deep': green[900],
    '--brand-light': green[100],
    '--brand-wash': green[50],
    '--brand-accent': '#F2C94C',
    '--brand-background-pattern': 'url("/themes/eid/festive-pattern.svg")',
  },
  motif: 'festive-stars',
  notes: 'Lighter palette + bright festive gold. Used for Eid ul-Fitr and Eid ul-Adha.',
} as const
