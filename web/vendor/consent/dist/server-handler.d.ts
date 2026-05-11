/**
 * S-C-S05-T05a — Shared server handler for /api/consent across 8 Ummat apps.
 *
 * Each app's app/api/consent/route.ts (or src/app/api/consent/route.ts) is a thin
 * wrapper that delegates to these handlers. The handlers talk to Hasura admin
 * via fetch and write to lg_consent_record (insert-only, GDPR Art 7 compliant).
 *
 * Responsibilities:
 *   POST   — record a new consent decision (grant or revoke per-category)
 *   GET    — return current effective consent for authenticated user OR anon
 *            cookie ID; falls back to "no record" (banner re-prompts)
 *   DELETE — withdraw consent: write new lg_consent_record rows with granted=false
 *
 * GDPR/CCPA:
 *   - Insert-only (lg_consent_record table guarantees immutability)
 *   - policy_version stamped on every write (T04)
 *   - browser_fingerprint_hash is SHA-256 of (user_agent + ip) — no raw PII
 *   - DNT honoured at write time (categories forced false)
 *
 * Security:
 *   - CSRF: same-origin check (Sec-Fetch-Site or Origin/Host comparison)
 *   - Rate limit: best-effort cap (handled in route.ts wrapper if util available)
 *   - Admin secret stays server-side only (never returned in any response)
 *
 * Notes on lg_consent_record schema (from
 * hasura/migrations/default/20260428040000_lg_consent_record/up.sql):
 *
 *   id, user_id (nullable), policy_version_id (FK), consent_type (enum),
 *   granted (bool), granted_at, country_code, browser_fingerprint_hash, created_at
 *
 * We map one ConsentCategories record to up to 4 rows
 * (one per category: explicit_click for each), keeping the DB schema as the
 * canonical audit. localStorage stays the fast read path for the banner.
 */
import type { ConsentRecord } from './types.js';
/**
 * Schema-shaped validator for the POST payload.  Mirrors the shape that
 * the client (`useConsent.tsx`) sends today: `{ consent: <base64-encoded JSON ConsentRecord> }`
 * AND the spec shape: `{ categories, policy_version, locale }`.
 *
 * Both shapes are accepted to keep current clients working while new clients
 * migrate to the explicit shape.
 */
export interface ConsentPostPayload {
    categories: ConsentRecord['categories'];
    policyVersion: string;
    locale?: string;
    doNotTrack?: boolean;
    doNotSell?: boolean;
}
export declare class ConsentValidationError extends Error {
    code: string;
    constructor(code: string, message: string);
}
/**
 * Parse the incoming body and return a normalised payload.
 *
 * Throws ConsentValidationError with code `BAD_REQUEST` on any failure.
 */
export declare function parseConsentBody(body: unknown): ConsentPostPayload;
/**
 * Reject cross-origin POSTs.  Two signals are checked:
 *
 *   1. Sec-Fetch-Site (most browsers, 2020+): must be `same-origin` or `same-site`
 *   2. Origin header matches Host header (fallback for older clients)
 *
 * If neither signal proves same-origin, we reject.  This is the standard
 * "double-submit-cookie" precursor — sufficient for non-banking endpoints.
 */
export declare function isSameOrigin(headers: Headers): boolean;
/**
 * SHA-256 of (user_agent + ":" + ip).  Never store raw IP or UA.
 */
export declare function makeFingerprintHash(userAgent: string | null, ip: string | null): string | null;
/**
 * Extract client IP from common proxy headers.  Honours the order:
 *   1. cf-connecting-ip (Cloudflare)
 *   2. x-real-ip (nginx)
 *   3. x-forwarded-for first value
 */
export declare function clientIpFromHeaders(headers: Headers): string | null;
export interface HasuraAdminConfig {
    endpoint: string;
    adminSecret: string;
}
export interface ConsentWriteContext {
    /** Domain key matching lg_policy_version.domain (e.g. 'ummat.app') */
    domain: string;
    /** Authenticated user id, if any */
    userId?: string | null;
    /** Two-letter country code, optional */
    countryCode?: string | null;
    /** SHA-256 hash of UA+IP — no raw PII */
    fingerprintHash?: string | null;
}
interface LgPolicyVersionRow {
    id: string;
    version_semver: string;
}
/**
 * Resolve the latest policy_version_id for a given (domain, policy_type='cookie').
 * Falls back to any cookie policy for the domain if effective_date filter empty.
 */
export declare function resolveLatestCookiePolicyVersion(hasura: HasuraAdminConfig, domain: string): Promise<LgPolicyVersionRow | null>;
/**
 * Insert one lg_consent_record row per category change.  Insert-only — never
 * UPDATE / DELETE existing rows (GDPR Art 7 immutability).
 */
export declare function insertConsentRecords(hasura: HasuraAdminConfig, payload: ConsentPostPayload, context: ConsentWriteContext, options?: {
    action?: 'grant' | 'withdraw' | 'change';
}): Promise<{
    ids: string[];
} | {
    error: string;
}>;
/**
 * Return latest effective consent state (last-write-wins per category) for
 * the given user_id OR fingerprint_hash.  user_id wins when both present.
 */
export declare function fetchLatestConsent(hasura: HasuraAdminConfig, context: ConsentWriteContext): Promise<{
    categories: ConsentRecord['categories'];
    policyVersion: string;
} | null>;
export interface ConsentHandlerInput {
    method: 'POST' | 'GET' | 'DELETE';
    headers: Headers;
    body?: unknown;
    /** Authenticated user id from session, if any */
    userId?: string | null;
    /** Two-letter country (e.g. from Cloudflare cf-ipcountry) */
    countryCode?: string | null;
    /** Domain key for lg_policy_version lookup */
    domain: string;
    hasura: HasuraAdminConfig;
}
export interface ConsentHandlerResult {
    status: number;
    body: Record<string, unknown>;
}
export declare function handleConsentRequest(input: ConsentHandlerInput): Promise<ConsentHandlerResult>;
export {};
//# sourceMappingURL=server-handler.d.ts.map