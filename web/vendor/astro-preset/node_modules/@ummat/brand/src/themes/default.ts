/**
 * FILE: packages/brand/src/themes/default.ts
 * PURPOSE: Default Ummat theme. Active outside of Islamic seasonal windows.
 * INVARIANTS: must define every key in the Theme contract — never partial.
 * REF: T-P7-C-S10-T06
 */
import { green } from '../tokens/colors'
import type { Theme } from './types'

export const defaultTheme: Theme = {
  name: 'default',
  displayName: 'Default',
  cssVars: {
    '--brand-primary': green[400],
    '--brand-on-light': green[500],
    '--brand-dark': green[700],
    '--brand-deep': green[900],
    '--brand-light': green[100],
    '--brand-wash': green[50],
    '--brand-accent': green[400],
    '--brand-background-pattern': 'none',
  },
  motif: null,
  notes: 'Year-round palette. Applied outside Islamic seasonal windows.',
} as const
