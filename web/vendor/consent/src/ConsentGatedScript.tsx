"use client"

/**
 * ConsentGatedScript — renders a Next.js Script tag only when the specified
 * consent category has been accepted.
 *
 * S05-05/06/12: Consent-gate for analytics scripts (e.g. Umami) per D-P3-21.
 * Drop-in replacement for <Script> anywhere analytics / marketing scripts live.
 *
 * Usage:
 *   <ConsentGatedScript
 *     category="analytics"
 *     src={`${process.env.NEXT_PUBLIC_UMAMI_HOST_URL}/script.js`}
 *     data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
 *     strategy="afterInteractive"
 *   />
 */

import React from 'react'
import { useConsent } from './useConsent.js'

export interface ConsentGatedScriptProps {
  /** Consent category that must be accepted before the script loads. */
  category: keyof import('./types.js').ConsentCategories
  /** Script src URL. */
  src: string
  /** Next.js Script loading strategy. Default: "afterInteractive". */
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive'
  /** Any additional data-* attributes passed to the <script> element. */
  [key: string]: unknown
}

export function ConsentGatedScript({
  category,
  src,
  strategy = 'afterInteractive',
  ...rest
}: ConsentGatedScriptProps) {
  const { categories, hasConsented } = useConsent()

  // Only inject the script once consent has been recorded AND the specific
  // category is accepted.  Before consent is given, hasConsented=false so
  // we wait; after rejection the category boolean is false — script stays out.
  if (!hasConsented || !categories[category]) return null

  // We render a plain <script> element rather than importing next/script to
  // keep this package free of Next.js peer dependencies.  next/script's
  // "afterInteractive" strategy is equivalent to defer/async on a script that
  // executes after hydration — achieved here by conditionally mounting the
  // element only after the client-side consent check.
  return (
    <script
      src={src}
      async
      {...rest}
    />
  )
}
