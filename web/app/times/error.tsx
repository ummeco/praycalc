/**
 * FILE:    praycalc/web/app/times/error.tsx
 * PURPOSE: Next.js error boundary for /times/* routes (server-side fetch errors).
 *   Displays human-readable error with retry. Never shows stack traces.
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

export default function TimesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('[PrayCalc/times] route error', error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white mb-3">Prayer times could not be loaded</h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        There was a problem fetching prayer times. Please try again or search for another city.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-2.5 border border-gray-700 hover:border-green-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          Back to home
        </Link>
      </div>
    </main>
  )
}
