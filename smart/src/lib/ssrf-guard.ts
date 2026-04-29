/**
 * SIEGE H2/H3 — SSRF guard
 *
 * Validates a URL against known-dangerous destinations before the server
 * makes an outbound fetch on behalf of user-supplied input.
 *
 * Blocks:
 *   - Non-http(s) schemes (file://, ftp://, etc.)
 *   - RFC 1918 private ranges: 10.x, 172.16-31.x, 192.168.x
 *   - Loopback: 127.0.0.0/8, ::1, localhost
 *   - Link-local / AWS IMDS: 169.254.0.0/16
 *   - Cloud metadata hostnames: metadata.google.internal, instance-data, etc.
 *
 * DNS-level bypass mitigation: we resolve the hostname to IPs and check
 * every resolved address. Requires Node.js built-in dns/promises.
 */

import dns from 'node:dns/promises'

// Blocked hostnames (exact match, lowercase)
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'instance-data',                 // GCE fallback hostname
  'link-local.metadata.google',    // GKE variant
])

/**
 * Returns true if the dotted-decimal IPv4 address falls in any blocked range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return false
  const [a, b] = parts

  return (
    a === 10 ||                          // 10.0.0.0/8
    a === 127 ||                         // 127.0.0.0/8 (loopback)
    a === 169 && b === 254 ||            // 169.254.0.0/16 (link-local / AWS IMDS)
    a === 172 && b >= 16 && b <= 31 ||   // 172.16.0.0/12
    a === 192 && b === 168              // 192.168.0.0/16
  )
}

/**
 * Returns true if the IPv6 address is a loopback or link-local address.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[/, '').replace(/\]$/, '')
  return (
    normalized === '::1' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  )
}

export class SsrfBlockedError extends Error {
  constructor(reason: string) {
    super(`SSRF blocked: ${reason}`)
    this.name = 'SsrfBlockedError'
  }
}

/**
 * Validates that `rawUrl` is safe to fetch server-side.
 *
 * @throws {SsrfBlockedError} if the URL resolves to a private/internal address
 * @throws {Error} if the URL is malformed
 */
export async function assertSafeFetchUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('Invalid URL')
  }

  // Scheme allowlist — only http and https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SsrfBlockedError(`scheme "${url.protocol}" is not allowed`)
  }

  const hostname = url.hostname.toLowerCase()

  // Blocked hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new SsrfBlockedError(`hostname "${hostname}" is not allowed`)
  }

  // Literal IP addresses — check immediately without DNS
  if (isPrivateIPv4(hostname)) {
    throw new SsrfBlockedError(`IPv4 address "${hostname}" is in a private range`)
  }
  if (isPrivateIPv6(hostname)) {
    throw new SsrfBlockedError(`IPv6 address "${hostname}" is a loopback/link-local address`)
  }

  // DNS resolution — check all returned addresses
  let addresses: string[]
  try {
    const results = await dns.lookup(hostname, { all: true, family: 0 })
    addresses = results.map(r => r.address)
  } catch {
    // DNS resolution failure — treat as blocked (cannot confirm the destination is safe)
    throw new SsrfBlockedError(`hostname "${hostname}" could not be resolved`)
  }

  for (const addr of addresses) {
    if (isPrivateIPv4(addr)) {
      throw new SsrfBlockedError(`"${hostname}" resolves to private IPv4 ${addr}`)
    }
    if (isPrivateIPv6(addr)) {
      throw new SsrfBlockedError(`"${hostname}" resolves to private IPv6 ${addr}`)
    }
  }

  return url
}
