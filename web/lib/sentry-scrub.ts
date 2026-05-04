/**
 * PII scrubbing for Sentry/GlitchTip events — SEC-M6 compliance.
 * T25.15 — Layer 1: SDK-level beforeSend hook.
 *
 * Strips headers and fields that would expose PII or secrets:
 *   Headers: authorization, x-hasura-admin-secret, x-remote-schema-secret,
 *            cookie, set-cookie, x-hasura-user-id
 *   Fields:  password, token, secret, email, phone (deep-scrub in extra/contexts)
 */
import type { ErrorEvent, EventHint } from '@sentry/nextjs'

/** Headers to redact entirely (value replaced with [REDACTED]). */
const BLOCKED_HEADERS = new Set([
  'authorization',
  'x-hasura-admin-secret',
  'x-remote-schema-secret',
  'cookie',
  'set-cookie',
  'x-hasura-user-id',
])

/** Top-level field patterns to delete from `event.user` and deep-scrub in extras. */
const BLOCKED_FIELDS = ['password', 'token', 'secret', 'email', 'phone']

/**
 * Recursively scrub sensitive keys from a plain object.
 * Returns a new object — never mutates the input.
 */
function scrubObject(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 5) return obj // guard against deep circular-like structures
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    if (BLOCKED_FIELDS.some((f) => lowerKey.includes(f))) {
      result[key] = '[REDACTED]'
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = scrubObject(value as Record<string, unknown>, depth + 1)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Scrub a Sentry Event before it is sent to GlitchTip.
 *
 * Usage in sentry.client.config.ts and sentry.server.config.ts:
 *   import { scrubPII } from './lib/sentry-scrub'
 *   Sentry.init({ ..., beforeSend: scrubPII })
 */
// _hint is required by Sentry v10's beforeSend signature but unused here.
export function scrubPII(event: ErrorEvent, _hint?: EventHint): ErrorEvent | null {
  // --- 1. Scrub request headers ---
  if (event.request?.headers) {
    const headers = event.request.headers as Record<string, unknown>
    for (const header of BLOCKED_HEADERS) {
      if (header in headers) {
        headers[header] = '[REDACTED]'
      }
      // Also check for capitalized/mixed-case variants
      const upperHeader = header
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('-')
      if (upperHeader in headers) {
        headers[upperHeader] = '[REDACTED]'
      }
    }
  }

  // --- 2. Remove request body — may contain user content or credentials ---
  if (event.request) {
    delete event.request.data
  }

  // --- 3. Scrub user object ---
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
    // Keep user.id for grouping but remove other PII fields
    const { id, username } = event.user
    event.user = { id, username }
  }

  // --- 4. Deep-scrub extra / contexts for leaked field names ---
  if (event.extra && typeof event.extra === 'object') {
    event.extra = scrubObject(event.extra as Record<string, unknown>)
  }

  if (event.contexts && typeof event.contexts === 'object') {
    event.contexts = scrubObject(event.contexts as Record<string, unknown>) as typeof event.contexts
  }

  return event
}
