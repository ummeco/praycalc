import type { CookieCategory } from './types.js';
export interface AuditResult {
    passed: boolean;
    undocumented: string[];
    missingConsent: Array<{
        name: string;
        category: CookieCategory;
    }>;
    errors: string[];
}
export declare function auditCookies(setCookieHeaders: string[]): AuditResult;
export declare function formatAuditReport(result: AuditResult): string;
//# sourceMappingURL=audit-cookies.d.ts.map