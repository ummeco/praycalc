/**
 * FILE: packages/brand/src/apps/ummatChat.ts
 * PURPOSE: Ummat Chat brand configuration. Messaging + team communication for the ecosystem.
 * INVARIANTS:
 *   - domain MUST be ummat.chat.
 *   - dbPrefix is `uc_` per PPI.
 *   - Backbone is nChat (D-P3-23) — never imply a custom chat protocol.
 * DO NOT: imply E2E by default in B2B mode (Pro workspaces are admin-readable).
 * REF: T-P7-C-S10-01, D-P3-23
 */
import { green, semantic } from '../tokens/colors'
import type { BrandConfig } from './types'

export const ummatChat: BrandConfig = {
  appKey: 'ummat-chat',
  appName: 'Ummat Chat',
  domain: 'ummat.chat',
  primaryColor: green[400],
  backgroundColor: green[900],
  foregroundColor: semantic.textOnDark,
  logo: 'assets/ummatChat/logo.svg',
  tagline: 'Talk with your people. Run your team.',
  dbPrefix: 'uc_',
} as const
