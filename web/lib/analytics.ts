/**
 * PrayCalc — Client-side privacy analytics
 *
 * Tiny functions to send page views and events to /api/analytics.
 * No PII collected. Session hash is derived from a random ID stored
 * in sessionStorage (cleared when the tab closes).
 */

function getSessionHash(): string {
  if (typeof window === 'undefined') return ''
  let hash = sessionStorage.getItem('pc_sid')
  if (!hash) {
    // Generate a random anonymous session ID (not tied to any user)
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    hash = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    sessionStorage.setItem('pc_sid', hash)
  }
  return hash
}

function send(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  // Use sendBeacon for reliability on page unload, fall back to fetch
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body)
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Silently ignore analytics failures
    })
  }
}

/**
 * Track a page view.
 * @param path - The page path (e.g., "/en/new-york")
 * @param locale - The current locale (e.g., "en", "ar")
 */
export function trackPageView(path: string, locale?: string): void {
  send({
    page_path: path,
    event_name: 'page_view',
    locale: locale ?? null,
    session_hash: getSessionHash(),
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track a custom event.
 * @param name - Event name (e.g., "qibla_opened", "pdf_exported")
 * @param props - Optional properties (no PII)
 */
export function trackEvent(
  name: string,
  props?: Record<string, unknown>
): void {
  send({
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    event_name: name,
    locale: null,
    session_hash: getSessionHash(),
    timestamp: new Date().toISOString(),
    props: props ?? null,
  })
}
