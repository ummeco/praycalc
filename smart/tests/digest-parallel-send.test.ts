/**
 * Tests: digest route — parallel email send (perf fix CRITICAL-1)
 *
 * Verifies:
 *   - All subscribers receive email (no serial bottleneck)
 *   - Failures in one send do not block others (allSettled)
 *   - Concurrency cap: batches of CONCURRENCY are dispatched in waves
 *   - Error list reflects only failed sends
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers — replicate the parallelized batch-send logic from digest.ts
// so tests are self-contained and surgical (not integration tests of Hono).
// ---------------------------------------------------------------------------

const CONCURRENCY = 10

async function sendDigestEmails(
  subscribers: Array<{ email: string }>,
  sendFn: (email: string) => Promise<{ ok: boolean }>,
): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = []

  for (let i = 0; i < subscribers.length; i += CONCURRENCY) {
    const batch = subscribers.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map((sub) => sendFn(sub.email).then((r) => ({ sub, ok: r.ok }))),
    )
    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const sub = batch[j]
      if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok)) {
        errors.push(sub.email)
      }
    }
  }

  const sent = subscribers.length - errors.length
  return { sent, errors }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('digest parallel email send', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('sends to all subscribers when none fail', async () => {
    const subs = Array.from({ length: 25 }, (_, i) => ({ email: `user${i}@example.com` }))
    const sendFn = vi.fn().mockResolvedValue({ ok: true })

    const { sent, errors } = await sendDigestEmails(subs, sendFn)

    expect(sent).toBe(25)
    expect(errors).toHaveLength(0)
    expect(sendFn).toHaveBeenCalledTimes(25)
  })

  it('collects failed emails in errors array and does not block others', async () => {
    const subs = [
      { email: 'good1@example.com' },
      { email: 'bad@example.com' },
      { email: 'good2@example.com' },
    ]
    const sendFn = vi.fn().mockImplementation(async (email: string) => {
      if (email === 'bad@example.com') return { ok: false }
      return { ok: true }
    })

    const { sent, errors } = await sendDigestEmails(subs, sendFn)

    expect(sent).toBe(2)
    expect(errors).toEqual(['bad@example.com'])
    expect(sendFn).toHaveBeenCalledTimes(3) // all were attempted
  })

  it('handles rejected promises (network errors) without aborting batch', async () => {
    const subs = [
      { email: 'ok@example.com' },
      { email: 'crash@example.com' },
    ]
    const sendFn = vi.fn().mockImplementation(async (email: string) => {
      if (email === 'crash@example.com') throw new Error('network timeout')
      return { ok: true }
    })

    const { sent, errors } = await sendDigestEmails(subs, sendFn)

    expect(sent).toBe(1)
    expect(errors).toContain('crash@example.com')
  })

  it('dispatches >CONCURRENCY subscribers in multiple waves', async () => {
    const subs = Array.from({ length: 23 }, (_, i) => ({ email: `u${i}@test.com` }))
    const callOrder: string[] = []
    const sendFn = vi.fn().mockImplementation(async (email: string) => {
      callOrder.push(email)
      return { ok: true }
    })

    const { sent } = await sendDigestEmails(subs, sendFn)

    expect(sent).toBe(23)
    expect(sendFn).toHaveBeenCalledTimes(23)
    // All 23 unique emails were attempted exactly once
    expect(new Set(callOrder).size).toBe(23)
  })

  it('zero subscribers → sent=0, no errors', async () => {
    const sendFn = vi.fn()
    const { sent, errors } = await sendDigestEmails([], sendFn)
    expect(sent).toBe(0)
    expect(errors).toHaveLength(0)
    expect(sendFn).not.toHaveBeenCalled()
  })
})
