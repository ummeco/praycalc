/**
 * FILE: packages/brand/src/apps/ummatApp.ts
 * PURPOSE: Ummat App brand configuration. Consumer super-app for the global ummah.
 * INVARIANTS: domain MUST be ummat.app; dbPrefix is `ua_` per PPI.
 * DO NOT: use individualistic taglines — voice guide demands community-first framing.
 * REF: T-P7-C-S10-01
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const ummatApp: BrandConfig = {
  appKey: 'ummat-app',
  appName: 'Ummat',
  domain: 'ummat.app',
  primaryColor: green[400],
  backgroundColor: green[900],
  foregroundColor: semantic.textOnDark,
  logo: 'assets/ummatApp/logo.svg',
  tagline: 'Your community. Your deen. Your ummah.',
  dbPrefix: 'ua_',
} as const
