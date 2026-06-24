/**
 * FILE: packages/brand/src/apps/ummatPro.ts
 * PURPOSE: Ummat Pro brand configuration. B2B platform for masjids, charities, imams, businesses.
 * INVARIANTS: domain MUST be ummat.pro; dbPrefix is `up_` per PPI.
 * DO NOT: position as an Islamic version of Salesforce — voice is humble authority, not enterprise.
 * REF: T-P7-C-S10-01
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const ummatPro: BrandConfig = {
  appKey: 'ummat-pro',
  appName: 'Ummat Pro',
  domain: 'ummat.pro',
  primaryColor: green[500],
  backgroundColor: green[50],
  foregroundColor: semantic.textOnLight,
  logo: 'assets/ummatPro/logo.svg',
  tagline: 'Run your masjid, charity, or business. Built for the ummah.',
  dbPrefix: 'up_',
} as const
