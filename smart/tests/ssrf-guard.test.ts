/**
 * SIEGE H2 — SSRF guard unit tests
 *
 * Verifies that assertSafeFetchUrl blocks private/internal IPs and metadata
 * endpoints while allowing legitimate public URLs.
 *
 * Run: pnpm test from praycalc/smart/
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock dns/promises before importing the module
vi.mock('node:dns/promises', () => ({
  default: {
    lookup: vi.fn(),
  },
}))

import dns from 'node:dns/promises'
import { assertSafeFetchUrl, SsrfBlockedError } from '../src/lib/ssrf-guard.js'

type MockedDns = { lookup: ReturnType<typeof vi.fn> }
const mockDns = dns as unknown as MockedDns

function mockResolves(addresses: string[]) {
  mockDns.lookup.mockResolvedValue(addresses.map(a => ({ address: a, family: a.includes(':') ? 6 : 4 })))
}

describe('assertSafeFetchUrl — scheme validation', () => {
  beforeEach(() => mockResolves(['203.0.113.1']))

  it('allows https://', async () => {
    await expect(assertSafeFetchUrl('https://example.com/hook')).resolves.toBeDefined()
  })

  it('allows http://', async () => {
    await expect(assertSafeFetchUrl('http://example.com/hook')).resolves.toBeDefined()
  })

  it('blocks file://', async () => {
    await expect(assertSafeFetchUrl('file:///etc/passwd'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks ftp://', async () => {
    await expect(assertSafeFetchUrl('ftp://example.com/file'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })
})

describe('assertSafeFetchUrl — blocked hostnames', () => {
  beforeEach(() => mockResolves(['203.0.113.1']))

  it('blocks localhost', async () => {
    await expect(assertSafeFetchUrl('http://localhost/api'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks metadata.google.internal', async () => {
    await expect(assertSafeFetchUrl('http://metadata.google.internal/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })
})

describe('assertSafeFetchUrl — private IPv4 literal', () => {
  beforeEach(() => mockResolves(['203.0.113.1']))

  it('blocks 127.0.0.1 (loopback)', async () => {
    await expect(assertSafeFetchUrl('http://127.0.0.1/admin'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks 169.254.169.254 (AWS IMDS)', async () => {
    await expect(assertSafeFetchUrl('http://169.254.169.254/latest/meta-data/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks 10.0.0.1 (RFC1918)', async () => {
    await expect(assertSafeFetchUrl('http://10.0.0.1/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks 192.168.1.1 (RFC1918)', async () => {
    await expect(assertSafeFetchUrl('http://192.168.1.1/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks 172.16.0.1 (RFC1918)', async () => {
    await expect(assertSafeFetchUrl('http://172.16.0.1/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })
})

describe('assertSafeFetchUrl — DNS resolution check (rebinding)', () => {
  it('blocks a public hostname that resolves to a private IP', async () => {
    // Attacker controls DNS for evil.com and points it at AWS IMDS
    mockResolves(['169.254.169.254'])
    await expect(assertSafeFetchUrl('https://evil.example.com/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks a public hostname that resolves to RFC1918', async () => {
    mockResolves(['10.1.2.3'])
    await expect(assertSafeFetchUrl('https://internal-app.example.com/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('blocks when DNS lookup fails (cannot confirm safety)', async () => {
    mockDns.lookup.mockRejectedValue(new Error('ENOTFOUND'))
    await expect(assertSafeFetchUrl('https://nonexistent.example.com/'))
      .rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('allows a public IP address', async () => {
    mockResolves(['93.184.216.34']) // example.com
    await expect(assertSafeFetchUrl('https://example.com/hook')).resolves.toBeDefined()
  })
})

describe('assertSafeFetchUrl — webhook registration SSRF scenario (H2)', () => {
  it('blocks the exact AWS IMDS exploit URL from the SIEGE finding', async () => {
    // From H2 finding: "callbackUrl: http://169.254.169.254/latest/meta-data/iam/..."
    await expect(
      assertSafeFetchUrl('http://169.254.169.254/latest/meta-data/iam/security-credentials/')
    ).rejects.toBeInstanceOf(SsrfBlockedError)
  })

  it('allows a real webhook receiver', async () => {
    mockResolves(['93.184.216.34'])
    await expect(
      assertSafeFetchUrl('https://hooks.mysite.com/praycalc-adhan')
    ).resolves.toBeDefined()
  })
})
