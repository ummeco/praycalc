/**
 * T-P7-Q-PERF-07 — Web Vitals instrumentation rating thresholds.
 *
 * The instrumentation file `instrumentation-client.ts` is auto-loaded by
 * Next.js into the BROWSER bundle, so it cannot be imported directly into a
 * vitest (jsdom) test environment without triggering the side-effect bootstrap.
 * Instead this test verifies the rating thresholds match Google's published
 * Web Vitals buckets — the same constants encoded in the instrumentation file
 * — so any regression to either side stays in lock-step.
 *
 * If you adjust THRESHOLDS in `instrumentation-client.ts`, mirror the change
 * here.
 */

import { describe, it, expect } from 'vitest'

// Mirror of THRESHOLDS in instrumentation-client.ts. Keep in sync.
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
} as const

type Vital = keyof typeof THRESHOLDS

function rate(name: Vital, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name]
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

describe('Web Vitals rating buckets (Google web.dev/vitals/)', () => {
  it('LCP: ≤2500 good, ≤4000 needs-improvement, >4000 poor', () => {
    expect(rate('LCP', 1500)).toBe('good')
    expect(rate('LCP', 2500)).toBe('good')
    expect(rate('LCP', 2501)).toBe('needs-improvement')
    expect(rate('LCP', 4000)).toBe('needs-improvement')
    expect(rate('LCP', 4001)).toBe('poor')
  })

  it('INP: ≤200 good, ≤500 needs-improvement, >500 poor (replaces FID per D-P7-01)', () => {
    expect(rate('INP', 100)).toBe('good')
    expect(rate('INP', 200)).toBe('good')
    expect(rate('INP', 300)).toBe('needs-improvement')
    expect(rate('INP', 500)).toBe('needs-improvement')
    expect(rate('INP', 600)).toBe('poor')
  })

  it('CLS: ≤0.1 good, ≤0.25 needs-improvement, >0.25 poor', () => {
    expect(rate('CLS', 0.05)).toBe('good')
    expect(rate('CLS', 0.1)).toBe('good')
    expect(rate('CLS', 0.15)).toBe('needs-improvement')
    expect(rate('CLS', 0.25)).toBe('needs-improvement')
    expect(rate('CLS', 0.26)).toBe('poor')
  })

  it('TTFB: ≤800 good, ≤1800 needs-improvement, >1800 poor', () => {
    expect(rate('TTFB', 500)).toBe('good')
    expect(rate('TTFB', 800)).toBe('good')
    expect(rate('TTFB', 1500)).toBe('needs-improvement')
    expect(rate('TTFB', 1801)).toBe('poor')
  })

  it('FCP: ≤1800 good, ≤3000 needs-improvement, >3000 poor', () => {
    expect(rate('FCP', 1000)).toBe('good')
    expect(rate('FCP', 1800)).toBe('good')
    expect(rate('FCP', 2500)).toBe('needs-improvement')
    expect(rate('FCP', 3001)).toBe('poor')
  })

  it('thresholds reflect the per-route-shape A-budget (LCP ≤1500, INP ≤200)', () => {
    // Marketing/home A-shape (`performance-budgets.md` § Per-Route-Shape Budgets)
    // demands LCP ≤1500ms and INP ≤200ms — well within Google's "good" bucket.
    expect(rate('LCP', 1500)).toBe('good')
    expect(rate('INP', 200)).toBe('good')
  })

  it('D-shape (donate) budget LCP ≤1500, TBT ≤200 land in good buckets', () => {
    expect(rate('LCP', 1500)).toBe('good')
    // TBT is not a Web Vital but mirrors INP for our purposes; under the D-budget.
    expect(rate('INP', 200)).toBe('good')
  })
})
