/**
 * PrayCalc — Client-side Web Vitals instrumentation
 *
 * T-P7-Q-PERF-07 — Measure INP (Interaction to Next Paint), LCP (Largest
 * Contentful Paint), CLS (Cumulative Layout Shift), and TTFB (Time to First Byte)
 * and post each as a custom analytics event so per-route p95 trends can be
 * visualised against the per-route-shape budgets in
 * `.github/wiki/standards/performance-budgets.md`.
 *
 * Implementation note: this file uses native browser PerformanceObserver +
 * `performance.timing` rather than the `web-vitals@^4` npm package so it ships
 * without adding a runtime dependency. It records the same metric names the
 * Q-PERF-13 budget table uses (LCP / INP / CLS / TTFB) and posts to the existing
 * `/api/analytics` endpoint (Hasura `pc_analytics_events` table).
 *
 * Next.js conventions: this file is auto-imported in the BROWSER bundle when
 * Next.js detects `instrumentation-client.ts` at the project root. No `register()`
 * export is needed; top-level code runs once on first client load.
 *
 * Privacy: no PII is captured. The `route` field is `window.location.pathname`
 * which contains user-supplied path segments only (e.g. `/en/new-york`).
 * No query string, no hash, no user agent fingerprint.
 */

import { trackEvent } from '@/lib/analytics'

type WebVital = {
  name: 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Web Vitals thresholds (Google: https://web.dev/vitals/)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
} as const

function rate(name: WebVital['name'], value: number): WebVital['rating'] {
  const t = THRESHOLDS[name]
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

function report(vital: WebVital): void {
  if (typeof window === 'undefined') return
  trackEvent('web_vital', {
    name: vital.name,
    value: Math.round(vital.value * 1000) / 1000,
    rating: vital.rating,
    route: window.location.pathname,
  })
}

function observeLCP(): void {
  try {
    let last = 0
    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        // Largest Contentful Paint: keep the largest observed value.
        last = Math.max(last, (entry as PerformanceEntry & { renderTime?: number; loadTime?: number }).renderTime ?? entry.startTime)
      }
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    // Report on visibility change or unload (whichever fires first).
    const flush = () => {
      if (last > 0) report({ name: 'LCP', value: last, rating: rate('LCP', last) })
      observer.disconnect()
    }
    addEventListener('visibilitychange', flush, { once: true })
    addEventListener('pagehide', flush, { once: true })
  } catch {
    // PerformanceObserver not supported — silently skip.
  }
}

function observeCLS(): void {
  try {
    let cls = 0
    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!e.hadRecentInput && typeof e.value === 'number') {
          cls += e.value
        }
      }
    })
    observer.observe({ type: 'layout-shift', buffered: true })
    const flush = () => {
      report({ name: 'CLS', value: cls, rating: rate('CLS', cls) })
      observer.disconnect()
    }
    addEventListener('visibilitychange', flush, { once: true })
    addEventListener('pagehide', flush, { once: true })
  } catch {
    // skip
  }
}

function observeINP(): void {
  try {
    let worst = 0
    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        // Each event-timing entry's duration approximates the INP for that interaction.
        // Track the worst (p100) — for true p98 web-vitals@4 uses a quantile estimator.
        const d = entry.duration ?? 0
        if (d > worst) worst = d
      }
    })
    observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    const flush = () => {
      if (worst > 0) report({ name: 'INP', value: worst, rating: rate('INP', worst) })
      observer.disconnect()
    }
    addEventListener('visibilitychange', flush, { once: true })
    addEventListener('pagehide', flush, { once: true })
  } catch {
    // event-timing unsupported pre-Chrome 96 — silently skip.
  }
}

function observeTTFB(): void {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (!nav) return
    const ttfb = nav.responseStart - nav.startTime
    if (ttfb > 0) report({ name: 'TTFB', value: ttfb, rating: rate('TTFB', ttfb) })
  } catch {
    // skip
  }
}

function observeFCP(): void {
  try {
    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          report({ name: 'FCP', value: entry.startTime, rating: rate('FCP', entry.startTime) })
          observer.disconnect()
        }
      }
    })
    observer.observe({ type: 'paint', buffered: true })
  } catch {
    // skip
  }
}

if (typeof window !== 'undefined') {
  observeLCP()
  observeCLS()
  observeINP()
  observeTTFB()
  observeFCP()
}
