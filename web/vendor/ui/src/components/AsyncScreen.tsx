/**
 * @ummat/ui — AsyncScreen
 *
 * Purpose: 7-state wrapper component for all async/data-bearing screens.
 *   Renders exactly one state at a time: loading | empty | error | populated |
 *   offline | permission-denied | rate-limited.
 *
 * Inputs:
 *   - loading: boolean — fetch in-flight, no data yet
 *   - empty: boolean — fetch succeeded, result set is zero-length / null
 *   - error: Error | null — non-retriable fetch or mutation failure
 *   - offline: boolean — network unavailable
 *   - permissionDenied: boolean — user lacks required auth claim / role
 *   - rateLimited: boolean — API returned 429 or quota exceeded
 *   - retryAfterMs: number (optional) — countdown ms for rate-limited state
 *   - onRetry: () => void — retry callback for error / rate-limited states
 *   - children: ReactNode — rendered ONLY in the populated state
 *   - emptySlot: ReactNode — rendered in the empty state
 *
 * Outputs: JSX element with appropriate slot rendered for the current state.
 *
 * Constraints:
 *   - Priority order (first truthy wins):
 *     offline > permissionDenied > rateLimited > loading > error > empty > populated
 *   - children NEVER render in any state other than populated
 *   - error state MUST NOT expose raw stack traces to the DOM
 *
 * SPORT: P2-E2-W02-S02-T01 — AsyncScreen baseline component
 *
 * Ref: .claude/docs/p2-robustness-framework-spec.md §3.2
 */

import React, { useEffect, useRef, useState } from 'react'

export interface AsyncScreenProps {
  loading: boolean
  empty: boolean
  error: Error | null
  offline: boolean
  permissionDenied: boolean
  rateLimited: boolean
  /** Countdown milliseconds for rate-limited state. Defaults to 60_000. */
  retryAfterMs?: number
  onRetry: () => void
  children: React.ReactNode
  emptySlot: React.ReactNode
}

type ScreenState =
  | 'offline'
  | 'permission-denied'
  | 'rate-limited'
  | 'loading'
  | 'error'
  | 'empty'
  | 'populated'

function resolveState(props: AsyncScreenProps): ScreenState {
  if (props.offline) return 'offline'
  if (props.permissionDenied) return 'permission-denied'
  if (props.rateLimited) return 'rate-limited'
  if (props.loading) return 'loading'
  if (props.error) return 'error'
  if (props.empty) return 'empty'
  return 'populated'
}

// ---------------------------------------------------------------------------
// Countdown hook — reads retryAfterMs and ticks down once per second.
// ---------------------------------------------------------------------------
function useCountdown(ms: number | undefined, active: boolean): number {
  const totalSec = Math.ceil((ms ?? 60_000) / 1_000)
  const [remaining, setRemaining] = useState(totalSec)

  useEffect(() => {
    if (!active) {
      setRemaining(totalSec)
      return
    }
    setRemaining(totalSec)
    const id = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1))
    }, 1_000)
    return () => clearInterval(id)
  }, [active, totalSec])

  return remaining
}

// ---------------------------------------------------------------------------
// Slot components
// ---------------------------------------------------------------------------

function LoadingSlot() {
  return (
    <div className="ummat-async-screen ummat-async-screen--loading" role="status" aria-live="polite" aria-label="Loading">
      <span className="ummat-async-screen__spinner" aria-hidden="true" />
    </div>
  )
}

function EmptySlot({ children }: { children: React.ReactNode }) {
  return (
    <div className="ummat-async-screen ummat-async-screen--empty" role="status" aria-live="polite">
      {children}
    </div>
  )
}

function ErrorSlot({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="ummat-async-screen ummat-async-screen--error" role="alert" aria-live="assertive">
      <p className="ummat-async-screen__message">Something went wrong. Please try again.</p>
      <button className="ummat-async-screen__retry" onClick={onRetry} type="button">
        Retry
      </button>
    </div>
  )
}

function OfflineSlot() {
  return (
    <div className="ummat-async-screen ummat-async-screen--offline" role="status" aria-live="polite">
      <p className="ummat-async-screen__message">You appear to be offline.</p>
    </div>
  )
}

function PermissionDeniedSlot() {
  return (
    <div className="ummat-async-screen ummat-async-screen--permission-denied" role="status" aria-live="polite">
      <p className="ummat-async-screen__message">You don&apos;t have permission to view this content.</p>
    </div>
  )
}

function RateLimitedSlot({ retryAfterMs, onRetry }: { retryAfterMs: number | undefined; onRetry: () => void }) {
  const remaining = useCountdown(retryAfterMs, true)
  const autoRetried = useRef(false)

  useEffect(() => {
    if (remaining === 0 && !autoRetried.current) {
      autoRetried.current = true
      onRetry()
    }
  }, [remaining, onRetry])

  return (
    <div className="ummat-async-screen ummat-async-screen--rate-limited" role="status" aria-live="polite">
      {remaining > 0 ? (
        <p className="ummat-async-screen__message">Retrying in {remaining}s&hellip;</p>
      ) : (
        <button className="ummat-async-screen__retry" onClick={onRetry} type="button">
          Retry now
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AsyncScreen — main export
// ---------------------------------------------------------------------------

/**
 * AsyncScreen renders exactly one of 7 states for async data-bearing screens.
 * Import from @ummat/ui — never copy this component into an app.
 */
export function AsyncScreen(props: AsyncScreenProps) {
  const {
    onRetry,
    children,
    emptySlot,
    retryAfterMs,
  } = props

  const state = resolveState(props)

  switch (state) {
    case 'offline':
      return <OfflineSlot />
    case 'permission-denied':
      return <PermissionDeniedSlot />
    case 'rate-limited':
      return <RateLimitedSlot retryAfterMs={retryAfterMs} onRetry={onRetry} />
    case 'loading':
      return <LoadingSlot />
    case 'error':
      return <ErrorSlot onRetry={onRetry} />
    case 'empty':
      return <EmptySlot>{emptySlot}</EmptySlot>
    case 'populated':
      return <>{children}</>
  }
}

AsyncScreen.displayName = 'AsyncScreen'

export default AsyncScreen
