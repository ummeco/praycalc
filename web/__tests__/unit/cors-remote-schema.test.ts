/**
 * T0-08-04: CORS headers on /api/graphql Remote Schema endpoint — PrayCalc
 *
 * Verifies OPTIONS preflight returns correct per-app origin allowlist.
 * No wildcard, no admin-secret in allowed headers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

function makeOptions(origin: string) {
  return new NextRequest('http://localhost/api/graphql', {
    method: 'OPTIONS',
    headers: { Origin: origin },
  })
}

describe('OPTIONS /api/graphql — CORS preflight (PrayCalc)', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('REMOTE_SCHEMA_SECRET', 'test-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 204 with correct origin for prod Hasura (api.ummat.dev)', async () => {
    const { OPTIONS } = await import('../../app/api/graphql/route')
    const res = await OPTIONS(makeOptions('https://api.ummat.dev'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://api.ummat.dev')
  })

  it('returns 204 with correct origin for local dev (api.praycalc.local.nself.org:8543)', async () => {
    const { OPTIONS } = await import('../../app/api/graphql/route')
    const res = await OPTIONS(makeOptions('https://api.praycalc.local.nself.org:8543'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://api.praycalc.local.nself.org:8543'
    )
  })

  it('returns no ACAO header for unknown origin', async () => {
    const { OPTIONS } = await import('../../app/api/graphql/route')
    const res = await OPTIONS(makeOptions('https://evil.example.com'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('returns no ACAO header for wrong app origin (praycalc.com browser)', async () => {
    // The RS endpoint is called Hasura-to-Next — browser (praycalc.com) must not be allowed
    const { OPTIONS } = await import('../../app/api/graphql/route')
    const res = await OPTIONS(makeOptions('https://praycalc.com'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('allowed headers do NOT include x-hasura-admin-secret', async () => {
    const { OPTIONS } = await import('../../app/api/graphql/route')
    const res = await OPTIONS(makeOptions('https://api.ummat.dev'))
    const headers = res.headers.get('Access-Control-Allow-Headers') ?? ''
    expect(headers.toLowerCase()).not.toContain('admin-secret')
    expect(headers.toLowerCase()).toContain('x-remote-schema-secret')
  })

  it('allowed methods are POST and OPTIONS only', async () => {
    const { OPTIONS } = await import('../../app/api/graphql/route')
    const res = await OPTIONS(makeOptions('https://api.ummat.dev'))
    const methods = res.headers.get('Access-Control-Allow-Methods') ?? ''
    expect(methods).toContain('POST')
    expect(methods).toContain('OPTIONS')
    expect(methods.toUpperCase()).not.toContain('DELETE')
    expect(methods.toUpperCase()).not.toContain('PUT')
  })
})
