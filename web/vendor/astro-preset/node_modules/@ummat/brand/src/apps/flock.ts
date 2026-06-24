/**
 * FILE: packages/brand/src/apps/flock.ts
 * PURPOSE: Flock brand configuration. Family wellness app (transferred to ummeco 2026-04-13).
 * INVARIANTS:
 *   - domain MUST be flock.family.
 *   - dbPrefix is `fl_` per D-P3-19 (NOT `flo_` — common mistake).
 *   - Islamic-first but generic-capable: tagline must not assume audience faith.
 * DO NOT: change dbPrefix to `flo_`; that decision is locked.
 * REF: T-P7-C-S10-01, D-P3-19
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const flock: BrandConfig = {
  appKey: 'flock',
  appName: 'Flock',
  domain: 'flock.family',
  primaryColor: green[400],
  backgroundColor: green[50],
  foregroundColor: semantic.textOnLight,
  logo: 'assets/flock/logo.svg',
  tagline: 'Stay close as a family. Wherever life takes you.',
  dbPrefix: 'fl_',
} as const
