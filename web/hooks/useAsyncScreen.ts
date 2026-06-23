/**
 * FILE:    praycalc/web/hooks/useAsyncScreen.ts
 * PURPOSE: Composes AsyncScreen props from query/mutation state + offline detection.
 *   All data-bearing screens use this hook to derive the 7-state AsyncScreen props.
 *
 * Inputs:
 *   - loading: boolean — true while fetch in-flight
 *   - data: T | null | undefined — fetched data (null/undefined = empty)
 *   - error: Error | null — non-retriable error
 *   - errorCode: string | undefined — error code to detect PERMISSION_DENIED / RATE_LIMITED
 *   - retryAfterMs: number | undefined — from Retry-After header (rate-limited)
 *   - onRetry: () => void — retry callback
 *
 * Outputs: AsyncScreenProps to spread onto <AsyncScreen {...props}>
 *
 * SPORT: P2-E5-W01-S01-T01 — robustness rollout (praycalc/web)
 * Ref: .claude/docs/p2-robustness-framework-spec.md §3.2
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import type { AsyncScreenProps } from '@ummat/ui'

interface UseAsyncScreenOptions<T> {
  loading: boolean
  data: T | null | undefined
  error: Error | null
  /** Canonical error code — 'PERMISSION_DENIED' | 'RATE_LIMITED' | 'NETWORK_OFFLINE' | ... */
  errorCode?: string
  retryAfterMs?: number
  onRetry: () => void
  /** isEmpty: custom predicate — defaults to null/undefined check */
  isEmpty?: (data: T) => boolean
}

/**
 * Derives the 7-state AsyncScreen props from fetch state + offline detection.
 * Uses navigator.onLine for lightweight offline detection (no external deps).
 */
export function useAsyncScreen<T>(
  opts: UseAsyncScreenOptions<T>
): AsyncScreenProps {
  const { loading, data, error, errorCode, retryAfterMs, onRetry, isEmpty } = opts

  // Offline detection — navigator.onLine + online/offline events
  const [offline, setOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const stableOnRetry = useCallback(onRetry, [onRetry])

  // Derive empty: null/undefined OR custom predicate
  const empty: boolean = !loading && !error && data == null
    ? true
    : !loading && !error && data != null && isEmpty != null
      ? isEmpty(data as T)
      : false

  return {
    loading,
    empty,
    error: errorCode === 'PERMISSION_DENIED' || errorCode === 'RATE_LIMITED'
      ? null  // those states have their own slots
      : error,
    offline: offline || errorCode === 'NETWORK_OFFLINE',
    permissionDenied: errorCode === 'PERMISSION_DENIED',
    rateLimited: errorCode === 'RATE_LIMITED',
    retryAfterMs,
    onRetry: stableOnRetry,
  }
}

export default useAsyncScreen
