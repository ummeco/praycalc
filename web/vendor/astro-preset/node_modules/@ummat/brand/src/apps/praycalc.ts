/**
 * FILE: packages/brand/src/apps/praycalc.ts
 * PURPOSE: PrayCalc brand configuration. Standalone prayer time calculator.
 * INVARIANTS:
 *   - Domain MUST be praycalc.com (docs at praycalc.org are a redirect target).
 *   - dbPrefix is `pc_` per PPI.
 *   - PrayCalc is 100% free; premium features gated via Ummat+.
 * DO NOT: rebrand without coordinated PPI + ASO + store-listing update.
 * REF: T-P7-C-S10-01
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const praycalc: BrandConfig = {
  appKey: 'praycalc',
  appName: 'PrayCalc',
  domain: 'praycalc.com',
  primaryColor: green[400],
  backgroundColor: green[900],
  foregroundColor: semantic.textOnDark,
  logo: 'assets/praycalc/logo.svg',
  tagline: 'Accurate prayer times. Anywhere on Earth.',
  dbPrefix: 'pc_',
} as const
