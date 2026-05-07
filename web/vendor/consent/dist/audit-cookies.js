import { COOKIES } from './cookie-inventory.js';
const COOKIE_NAME_RE = /^([^=\s;,]+)/;
function parseCookieName(setCookieHeader) {
    const match = COOKIE_NAME_RE.exec(setCookieHeader.trim());
    return match ? match[1] : null;
}
export function auditCookies(setCookieHeaders) {
    const inventoryByName = new Map(COOKIES.map((c) => [c.name, c]));
    const undocumented = [];
    const missingConsent = [];
    const errors = [];
    for (const header of setCookieHeaders) {
        const name = parseCookieName(header);
        if (!name) {
            errors.push(`Could not parse cookie name from header: ${header.slice(0, 80)}`);
            continue;
        }
        const entry = inventoryByName.get(name);
        if (!entry) {
            undocumented.push(name);
            continue;
        }
        if (!entry.strictlyNecessary && entry.category !== 'strictly-necessary') {
            missingConsent.push({ name: entry.name, category: entry.category });
        }
    }
    return {
        passed: undocumented.length === 0 && errors.length === 0,
        undocumented,
        missingConsent,
        errors,
    };
}
export function formatAuditReport(result) {
    const lines = [];
    lines.push(`Audit result: ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (result.undocumented.length > 0) {
        lines.push('');
        lines.push('Undocumented cookies (fail CI):');
        result.undocumented.forEach((name) => lines.push(`  - ${name}`));
    }
    if (result.missingConsent.length > 0) {
        lines.push('');
        lines.push('Non-essential cookies that must be gated by consent:');
        result.missingConsent.forEach(({ name, category }) => lines.push(`  - ${name} (${category})`));
    }
    if (result.errors.length > 0) {
        lines.push('');
        lines.push('Parse errors:');
        result.errors.forEach((e) => lines.push(`  - ${e}`));
    }
    return lines.join('\n');
}
//# sourceMappingURL=audit-cookies.js.map