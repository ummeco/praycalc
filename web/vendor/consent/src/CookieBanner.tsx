"use client"

import React from 'react'
import type { CookieBannerStrings, ConsentRegion } from './types.js'
import { useConsent } from './useConsent.js'

const DEFAULT_STRINGS: Required<CookieBannerStrings> = {
  title: 'We use cookies',
  body: 'We use cookies to improve your experience. Non-essential cookies are only set with your consent.',
  acceptAll: 'Accept all',
  rejectNonEssential: 'Reject non-essential',
  customize: 'Manage preferences',
}

export interface CookieBannerProps {
  strings?: CookieBannerStrings
  region?: ConsentRegion
  privacyPolicyUrl?: string
  cookiePolicyUrl?: string
}

export function CookieBanner({
  strings,
  region,
  privacyPolicyUrl = '/privacy',
  cookiePolicyUrl = '/cookies',
}: CookieBannerProps) {
  const { needsBanner, acceptAll, rejectNonEssential, openPreferences } = useConsent()
  const s = { ...DEFAULT_STRINGS, ...strings }

  if (!needsBanner) return null

  const isEu = region === 'EU'

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D2F17] border-t border-[#1E5E2F] shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#C9F27A] mb-1">{s.title}</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {s.body}{' '}
              <a
                href={privacyPolicyUrl}
                className="underline text-[#5A9438] hover:text-[#C9F27A] transition-colors"
              >
                Privacy Policy
              </a>
              {' · '}
              <a
                href={cookiePolicyUrl}
                className="underline text-[#5A9438] hover:text-[#C9F27A] transition-colors"
              >
                Cookie Policy
              </a>
              {isEu && (
                <span className="ml-2 text-gray-400 text-xs">(EEA — GDPR applies)</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={rejectNonEssential}
              className="px-4 py-2 text-sm rounded-md border border-gray-500 text-gray-300 hover:border-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {s.rejectNonEssential}
            </button>

            <button
              type="button"
              onClick={openPreferences}
              className="px-4 py-2 text-sm rounded-md border border-[#79C24C] text-[#5A9438] hover:border-[#C9F27A] hover:text-[#C9F27A] transition-colors whitespace-nowrap"
            >
              {s.customize}
            </button>

            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2 text-sm rounded-md bg-[#79C24C] text-[#0D2F17] font-semibold hover:bg-[#C9F27A] transition-colors whitespace-nowrap"
            >
              {s.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
