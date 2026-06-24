/**
 * FILE: packages/brand/src/apps/chatislam.ts
 * PURPOSE: ChatIslam brand configuration. AI dawah + Q&A app (formerly IslamQA).
 * INVARIANTS: domain MUST be chatislam.org; dbPrefix is `ci_` per PPI.
 *   islamqa.us is a redirect target until expiry (do not renew).
 * DO NOT: imply the AI replaces scholars — voice guide demands citation-first humility.
 * REF: T-P7-C-S10-01, D-P3-44
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const chatislam: BrandConfig = {
  appKey: 'chatislam',
  appName: 'ChatIslam',
  domain: 'chatislam.org',
  primaryColor: green[400],
  backgroundColor: green[900],
  foregroundColor: semantic.textOnDark,
  logo: 'assets/chatislam/logo.svg',
  tagline: 'Ask. Learn. Cited from authentic sources.',
  dbPrefix: 'ci_',
} as const
