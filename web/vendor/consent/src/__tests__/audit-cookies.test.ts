import { describe, expect, it } from 'vitest'
import { auditCookies, formatAuditReport } from '../audit-cookies.js'

describe('auditCookies', () => {
  it('passes when all cookies are in the inventory', () => {
    const headers = [
      'auth_session=abc123; HttpOnly; Secure; SameSite=Lax',
      '__cf_bm=xyz; Max-Age=1800; SameSite=None; Secure',
    ]
    const result = auditCookies(headers)
    expect(result.passed).toBe(true)
    expect(result.undocumented).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when an undocumented cookie is present', () => {
    const headers = [
      '_ga=GA1.2.xxx; Max-Age=63072000; SameSite=Lax',
    ]
    const result = auditCookies(headers)
    expect(result.passed).toBe(false)
    expect(result.undocumented).toContain('_ga')
  })

  it('identifies non-essential cookies that require consent gating', () => {
    const headers = [
      'prayer_method=MWL; Max-Age=31536000; SameSite=Lax',
      '__stripe_mid=abc; Max-Age=34128000; SameSite=None; Secure',
    ]
    const result = auditCookies(headers)
    expect(result.passed).toBe(true)
    expect(result.missingConsent.map((c) => c.name)).toContain('prayer_method')
    expect(result.missingConsent.map((c) => c.name)).toContain('__stripe_mid')
  })

  it('handles malformed Set-Cookie headers gracefully', () => {
    const headers = ['']
    const result = auditCookies(headers)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('passes an empty header list', () => {
    const result = auditCookies([])
    expect(result.passed).toBe(true)
    expect(result.undocumented).toHaveLength(0)
  })

  it('handles multiple undocumented cookies', () => {
    const headers = [
      '_fbp=fb.1.xxx; Max-Age=7776000',
      '_gcl_au=1.1.xxx; Max-Age=7776000',
      'auth_session=valid; HttpOnly',
    ]
    const result = auditCookies(headers)
    expect(result.passed).toBe(false)
    expect(result.undocumented).toContain('_fbp')
    expect(result.undocumented).toContain('_gcl_au')
    expect(result.undocumented).not.toContain('auth_session')
  })

  it('strictly-necessary cookies do not appear in missingConsent', () => {
    const headers = [
      'auth_session=s; HttpOnly',
      'csrf_token=t; HttpOnly',
      '__cf_bm=b; Max-Age=1800',
    ]
    const result = auditCookies(headers)
    const missingNames = result.missingConsent.map((c) => c.name)
    expect(missingNames).not.toContain('auth_session')
    expect(missingNames).not.toContain('csrf_token')
    expect(missingNames).not.toContain('__cf_bm')
  })
})

describe('formatAuditReport', () => {
  it('reports PASSED when no issues', () => {
    const report = formatAuditReport({ passed: true, undocumented: [], missingConsent: [], errors: [] })
    expect(report).toContain('PASSED')
  })

  it('reports FAILED and lists undocumented cookies', () => {
    const report = formatAuditReport({
      passed: false,
      undocumented: ['_ga', '_fbp'],
      missingConsent: [],
      errors: [],
    })
    expect(report).toContain('FAILED')
    expect(report).toContain('_ga')
    expect(report).toContain('_fbp')
  })

  it('lists non-essential cookies requiring consent gating', () => {
    const report = formatAuditReport({
      passed: true,
      undocumented: [],
      missingConsent: [{ name: 'prayer_method', category: 'functional' }],
      errors: [],
    })
    expect(report).toContain('prayer_method')
    expect(report).toContain('functional')
  })
})
