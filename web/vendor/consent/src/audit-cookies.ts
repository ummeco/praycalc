import { COOKIES } from './cookie-inventory.js'
import type { CookieCategory } from './types.js'

export interface AuditResult {
  passed: boolean
  undocumented: string[]
  missingConsent: Array<{ name: string; category: CookieCategory }>
  errors: string[]
}

const COOKIE_NAME_RE = /^([^=\s;,]+)/

function parseCookieName(setCookieHeader: string): string | null {
  const match = COOKIE_NAME_RE.exec(setCookieHeader.trim())
  return match ? match[1] : null
}

export function auditCookies(setCookieHeaders: string[]): AuditResult {
  const inventoryByName = new Map(COOKIES.map((c) => [c.name, c]))

  const undocumented: string[] = []
  const missingConsent: Array<{ name: string; category: CookieCategory }> = []
  const errors: string[] = []

  for (const header of setCookieHeaders) {
    const name = parseCookieName(header)
    if (!name) {
      errors.push(`Could not parse cookie name from header: ${header.slice(0, 80)}`)
      continue
    }

    const entry = inventoryByName.get(name)
    if (!entry) {
      undocumented.push(name)
      continue
    }

    if (!entry.strictlyNecessary && entry.category !== 'strictly-necessary') {
      missingConsent.push({ name: entry.name, category: entry.category })
    }
  }

  return {
    passed: undocumented.length === 0 && errors.length === 0,
    undocumented,
    missingConsent,
    errors,
  }
}

export function formatAuditReport(result: AuditResult): string {
  const lines: string[] = []

  lines.push(`Audit result: ${result.passed ? 'PASSED' : 'FAILED'}`)

  if (result.undocumented.length > 0) {
    lines.push('')
    lines.push('Undocumented cookies (fail CI):')
    result.undocumented.forEach((name) => lines.push(`  - ${name}`))
  }

  if (result.missingConsent.length > 0) {
    lines.push('')
    lines.push('Non-essential cookies that must be gated by consent:')
    result.missingConsent.forEach(({ name, category }) =>
      lines.push(`  - ${name} (${category})`)
    )
  }

  if (result.errors.length > 0) {
    lines.push('')
    lines.push('Parse errors:')
    result.errors.forEach((e) => lines.push(`  - ${e}`))
  }

  return lines.join('\n')
}
