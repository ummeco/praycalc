"use client"

/**
 * S-C-S05-T08 — Pre-consent gating helpers (LIVE GDPR P0 fix).
 *
 * Companion to <ConsentGatedScript>.  This module exports:
 *
 *   <ConsentGated category="analytics">{children}</ConsentGated>
 *     Declarative wrapper.  Children only render once the named category
 *     has been ACTIVELY granted.  Pre-consent state (record === null) renders
 *     nothing.
 *
 *   useConsentGate('marketing')
 *     Hook form.  Returns boolean — true ONLY after explicit grant.
 *
 * Rationale: GDPR Art 7 (and EDPB guidelines) forbid loading non-essential
 * trackers (Umami, Sentry replay, GA, fbq, etc.) before consent.  Sentry
 * **error tracking** is a different beast — it falls under the "necessary"
 * tier for fraud / abuse / breach detection and is permitted by the legitimate-
 * interest legal basis even without explicit consent.  Sentry **replay**
 * captures user interactions and IS analytics — must be gated.
 */

import React from 'react'
import type { ConsentCategories } from './types.js'
import { useConsent } from './useConsent.js'

export type GatedCategory = keyof ConsentCategories

/**
 * Returns true iff a consent record exists AND the given category is granted.
 *
 * Pre-consent (record === null) → false.
 * Post-reject              → false.
 * Post-accept              → true once the category is opted in.
 */
export function useConsentGate(category: GatedCategory): boolean {
  const { hasConsented, categories } = useConsent()
  if (!hasConsented) return false
  return categories[category] === true
}

export interface ConsentGatedProps {
  category: GatedCategory
  children: React.ReactNode
  /** Optional fallback rendered while consent is pending or rejected. */
  fallback?: React.ReactNode
}

/**
 * Declarative gating wrapper.  Use anywhere third-party scripts, embeds, or
 * analytics-bearing components live.  Example:
 *
 *   <ConsentGated category="analytics">
 *     <UmamiScript />
 *   </ConsentGated>
 *
 * SSR safety: the underlying useConsent hook sets needsBanner/categories
 * only after client mount (storage.readConsent is gated on `window`).  So
 * the server-side render of <ConsentGated> always returns the fallback
 * (or null).  This prevents flash-of-tracker content during hydration.
 */
export function ConsentGated({ category, children, fallback = null }: ConsentGatedProps) {
  const granted = useConsentGate(category)
  if (!granted) return <>{fallback}</>
  return <>{children}</>
}
