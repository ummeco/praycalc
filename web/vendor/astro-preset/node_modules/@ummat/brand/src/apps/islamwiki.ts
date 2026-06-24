/**
 * FILE: packages/brand/src/apps/islamwiki.ts
 * PURPOSE: Islam.wiki brand configuration. Standalone Islamic knowledge base.
 * INVARIANTS: domain MUST be islam.wiki; dbPrefix is `iw_` per PPI.
 * DO NOT: introduce sensationalist taglines — voice guide forbids it.
 * REF: T-P7-C-S10-01
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const islamwiki: BrandConfig = {
  appKey: 'islamwiki',
  appName: 'Islam.wiki',
  domain: 'islam.wiki',
  primaryColor: green[500],
  backgroundColor: green[50],
  foregroundColor: semantic.textOnLight,
  logo: 'assets/islamwiki/logo.svg',
  tagline: 'Quran, Hadith, and Islamic knowledge. With sources.',
  dbPrefix: 'iw_',
} as const
