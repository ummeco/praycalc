/**
 * FILE:    praycalc/web/components/robustness/DataScreen.tsx
 * PURPOSE: Thin wrapper combining AsyncScreen + useAsyncScreen for praycalc/web.
 *   All data-bearing client components import DataScreen instead of managing
 *   loading/error/offline state manually.
 *
 * Inputs:
 *   - loading: boolean
 *   - data: T | null | undefined
 *   - error: Error | null
 *   - errorCode: string | undefined — 'PERMISSION_DENIED' | 'RATE_LIMITED' | 'NETWORK_OFFLINE'
 *   - retryAfterMs: number | undefined
 *   - onRetry: () => void
 *   - isEmpty: (data: T) => boolean | undefined
 *   - emptySlot: ReactNode — shown in empty state (icon + CTA)
 *   - children: ReactNode — shown in populated state only
 *
 * SPORT: P2-E5-W01-S01-T01 — robustness rollout (praycalc/web)
 * Ref: .claude/docs/p2-robustness-framework-spec.md §3
 */

'use client'

import React from 'react'
import { AsyncScreen } from '@ummat/ui'
import { useAsyncScreen } from '@/hooks/useAsyncScreen'

interface DataScreenProps<T> {
  loading: boolean
  data: T | null | undefined
  error: Error | null
  errorCode?: string
  retryAfterMs?: number
  onRetry: () => void
  isEmpty?: (data: T) => boolean
  emptySlot: React.ReactNode
  children: React.ReactNode
}

/**
 * DataScreen — the 7-state screen wrapper for praycalc.com.
 * Used by all data-bearing client components.
 */
export function DataScreen<T>({
  loading,
  data,
  error,
  errorCode,
  retryAfterMs,
  onRetry,
  isEmpty,
  emptySlot,
  children,
}: DataScreenProps<T>) {
  const asyncProps = useAsyncScreen({
    loading,
    data,
    error,
    errorCode,
    retryAfterMs,
    onRetry,
    isEmpty,
  })

  return (
    <AsyncScreen {...asyncProps} emptySlot={emptySlot}>
      {children}
    </AsyncScreen>
  )
}

export default DataScreen
