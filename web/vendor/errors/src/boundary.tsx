/**
 * FILE:    @ummat/errors/boundary
 * PURPOSE: React ErrorBoundary component for route-level error containment.
 *   Catches unhandled rendering errors; renders a safe fallback.
 *   Only ErrorCode.INTERNAL and unhandled boundary errors are sent to Sentry —
 *   DSN wiring itself is E-06-W02 scope.
 *
 * Inputs:
 *   - fallback: ReactNode — rendered when the boundary catches an error
 *   - children: ReactNode — protected subtree
 *
 * Outputs: children in normal operation; fallback on caught error.
 *
 * SPORT: P2-E5-W01-S01-T01 — robustness rollout (praycalc/web)
 * Ref: .claude/docs/p2-robustness-framework-spec.md §3
 */

'use client'

import React from 'react'

interface Props {
  fallback: React.ReactNode
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — wraps every route-level component.
 * Catches rendering errors that AsyncScreen cannot handle (e.g., render-phase throws).
 * Import from @ummat/errors/boundary — never copy into app code.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Sentry DSN wired in E-06-W02; log here so it's captured when DSN is active
    console.error('[ErrorBoundary] Unhandled render error', { error, info })
    // When @sentry/nextjs is available, capture the exception
    try {
      const Sentry = require('@sentry/nextjs') as typeof import('@sentry/nextjs')
      Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
    } catch {
      // Sentry not configured yet — silent in E-05
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

/**
 * Pre-built fallback for route-level errors.
 * Matches the ErrorSlot from AsyncScreen (human-readable, no stack trace).
 */
export function ErrorState({
  onRetry,
  message = 'Something went wrong. Please try again.',
}: {
  onRetry?: () => void
  message?: string
}) {
  return (
    <div
      className="ummat-async-screen ummat-async-screen--error"
      role="alert"
      aria-live="assertive"
    >
      <p className="ummat-async-screen__message">{message}</p>
      {onRetry && (
        <button
          className="ummat-async-screen__retry"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorBoundary
