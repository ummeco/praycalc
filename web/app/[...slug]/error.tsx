/**
 * FILE:    praycalc/web/app/[...slug]/error.tsx
 * PURPOSE: Next.js error boundary for the main city prayer times route.
 *   Displays human-readable error with retry. No stack trace exposed.
 *
 * SPORT: P2-E5-W01-S01-T01 — robustness rollout (praycalc/web)
 * Ref: .claude/docs/p2-robustness-framework-spec.md §3
 */

'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CityError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('[PrayCalc/city] route error', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#0D2F17] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white mb-3">Prayer times unavailable</h1>
      <p className="text-white/50 mb-8 max-w-sm">
        There was a problem loading prayer times for this location. Please try again or search for another city.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-2.5 bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] rounded-lg text-sm font-medium transition-colors border border-[#79C24C]/30"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-2.5 border border-white/10 hover:border-[#79C24C]/30 text-white/60 rounded-lg text-sm font-medium transition-colors">
          Search for a city
        </Link>
      </div>
    </main>
  )
}
