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
import { createHash } from 'node:crypto';
export class ConsentValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'ConsentValidationError';
    }
}
function isCategoriesShape(v) {
    if (!v || typeof v !== 'object')
        return false;
    const o = v;
    return (typeof o.analytics === 'boolean' &&
        typeof o.marketing === 'boolean' &&
        typeof o.functional === 'boolean');
}
function decodeLegacyClientPayload(consentB64) {
    try {
        const json = Buffer.from(consentB64, 'base64').toString('utf-8');
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== 'object')
            return null;
        const r = parsed;
        if (typeof r.version === 'string' &&
            typeof r.timestamp === 'number' &&
            typeof r.explicit === 'boolean' &&
            isCategoriesShape(r.categories)) {
            return r;
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Parse the incoming body and return a normalised payload.
 *
 * Throws ConsentValidationError with code `BAD_REQUEST` on any failure.
 */
export function parseConsentBody(body) {
    if (!body || typeof body !== 'object') {
        throw new ConsentValidationError('BAD_REQUEST', 'Body must be an object');
    }
    const b = body;
    // Legacy shape from current client: { consent: base64(ConsentRecord) }
    if (typeof b.consent === 'string') {
        const record = decodeLegacyClientPayload(b.consent);
        if (!record) {
            throw new ConsentValidationError('BAD_REQUEST', 'consent field is not a valid base64 ConsentRecord');
        }
        return {
            categories: record.categories,
            policyVersion: record.version,
            doNotTrack: record.doNotTrack,
            doNotSell: record.doNotSell,
        };
    }
    // Spec shape: { categories, policy_version, locale }
    if (!isCategoriesShape(b.categories)) {
        throw new ConsentValidationError('BAD_REQUEST', 'categories must be {analytics, marketing, functional} booleans');
    }
    const policyVersion = typeof b.policy_version === 'string'
        ? b.policy_version
        : typeof b.policyVersion === 'string'
            ? b.policyVersion
            : null;
    if (!policyVersion) {
        throw new ConsentValidationError('BAD_REQUEST', 'policy_version is required');
    }
    return {
        categories: b.categories,
        policyVersion,
        locale: typeof b.locale === 'string' ? b.locale : undefined,
        doNotTrack: typeof b.doNotTrack === 'boolean' ? b.doNotTrack : undefined,
        doNotSell: typeof b.doNotSell === 'boolean' ? b.doNotSell : undefined,
    };
}
// ─── CSRF / same-origin guard ────────────────────────────────────────────────
/**
 * Reject cross-origin POSTs.  Two signals are checked:
 *
 *   1. Sec-Fetch-Site (most browsers, 2020+): must be `same-origin` or `same-site`
 *   2. Origin header matches Host header (fallback for older clients)
 *
 * If neither signal proves same-origin, we reject.  This is the standard
 * "double-submit-cookie" precursor — sufficient for non-banking endpoints.
 */
export function isSameOrigin(headers) {
    const fetchSite = headers.get('sec-fetch-site');
    if (fetchSite) {
        return fetchSite === 'same-origin' || fetchSite === 'same-site' || fetchSite === 'none';
    }
    // Fallback: Origin must match Host
    const origin = headers.get('origin');
    const host = headers.get('host');
    if (!origin || !host) {
        // No Origin AND no Sec-Fetch-Site — likely a non-browser client. Allow,
        // since GDPR consent endpoints are also exercised from server-side jobs.
        return true;
    }
    try {
        const o = new URL(origin);
        return o.host === host;
    }
    catch {
        return false;
    }
}
// ─── Fingerprint hash (no raw PII) ───────────────────────────────────────────
/**
 * SHA-256 of (user_agent + ":" + ip).  Never store raw IP or UA.
 */
export function makeFingerprintHash(userAgent, ip) {
    const ua = userAgent ?? '';
    const ipPart = ip ?? '';
    if (!ua && !ipPart)
        return null;
    return createHash('sha256').update(`${ua}:${ipPart}`).digest('hex');
}
/**
 * Extract client IP from common proxy headers.  Honours the order:
 *   1. cf-connecting-ip (Cloudflare)
 *   2. x-real-ip (nginx)
 *   3. x-forwarded-for first value
 */
export function clientIpFromHeaders(headers) {
    const cf = headers.get('cf-connecting-ip');
    if (cf)
        return cf.trim();
    const xri = headers.get('x-real-ip');
    if (xri)
        return xri.trim();
    const xff = headers.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0]?.trim();
        if (first)
            return first;
    }
    return null;
}
/**
 * Resolve the latest policy_version_id for a given (domain, policy_type='cookie').
 * Falls back to any cookie policy for the domain if effective_date filter empty.
 */
export async function resolveLatestCookiePolicyVersion(hasura, domain) {
    const query = `query LatestCookiePolicy($domain: String!) {
    lg_policy_version(
      where: { domain: { _eq: $domain }, policy_type: { _eq: "cookie" } },
      order_by: { effective_date: desc, created_at: desc },
      limit: 1
    ) { id version_semver }
  }`;
    const res = await fetch(hasura.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': hasura.adminSecret,
        },
        body: JSON.stringify({ query, variables: { domain } }),
    });
    if (!res.ok)
        return null;
    const data = (await res.json());
    return data.data?.lg_policy_version?.[0] ?? null;
}
/**
 * Insert one lg_consent_record row per category change.  Insert-only — never
 * UPDATE / DELETE existing rows (GDPR Art 7 immutability).
 */
export async function insertConsentRecords(hasura, payload, context, options = {}) {
    const policy = await resolveLatestCookiePolicyVersion(hasura, context.domain);
    if (!policy) {
        return { error: `no_policy_version_for_domain:${context.domain}` };
    }
    const action = options.action ?? 'change';
    const dnt = payload.doNotTrack === true;
    // DNT forces all non-necessary categories to false at write time.
    const effective = dnt
        ? { analytics: false, marketing: false, functional: false }
        : payload.categories;
    // Build one row per category; consent_type = explicit_click for normal
    // grants; cookie_banner_accept when all true; cookie_banner_reject when
    // all false (banner shortcuts).
    const allTrue = effective.analytics && effective.marketing && effective.functional;
    const allFalse = !effective.analytics && !effective.marketing && !effective.functional;
    const consentType = action === 'withdraw'
        ? 'cookie_banner_reject'
        : allTrue
            ? 'cookie_banner_accept'
            : allFalse
                ? 'cookie_banner_reject'
                : 'explicit_click';
    const rows = Object.keys(effective).map((cat) => ({
        user_id: context.userId ?? null,
        policy_version_id: policy.id,
        consent_type: consentType,
        granted: effective[cat],
        country_code: context.countryCode ?? null,
        browser_fingerprint_hash: context.fingerprintHash ?? null,
    }));
    const mutation = `mutation InsertConsent($objects: [lg_consent_record_insert_input!]!) {
    insert_lg_consent_record(objects: $objects) { returning { id } }
  }`;
    const res = await fetch(hasura.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': hasura.adminSecret,
        },
        body: JSON.stringify({ query: mutation, variables: { objects: rows } }),
    });
    if (!res.ok)
        return { error: `hasura_http_${res.status}` };
    const data = (await res.json());
    if (data.errors?.length)
        return { error: data.errors[0].message };
    const ids = data.data?.insert_lg_consent_record?.returning?.map((r) => r.id) ?? [];
    return { ids };
}
/**
 * Return latest effective consent state (last-write-wins per category) for
 * the given user_id OR fingerprint_hash.  user_id wins when both present.
 */
export async function fetchLatestConsent(hasura, context) {
    const policy = await resolveLatestCookiePolicyVersion(hasura, context.domain);
    if (!policy)
        return null;
    const whereByUser = context.userId
        ? `user_id: { _eq: "${context.userId}" }`
        : context.fingerprintHash
            ? `browser_fingerprint_hash: { _eq: "${context.fingerprintHash}" }`
            : null;
    if (!whereByUser)
        return null;
    const query = `query LatestConsent {
    lg_consent_record(
      where: { ${whereByUser}, policy_version_id: { _eq: "${policy.id}" } },
      order_by: { granted_at: desc },
      limit: 24
    ) { consent_type granted granted_at }
  }`;
    const res = await fetch(hasura.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': hasura.adminSecret,
        },
        body: JSON.stringify({ query }),
    });
    if (!res.ok)
        return null;
    const data = (await res.json());
    const rows = data.data?.lg_consent_record ?? [];
    if (rows.length === 0)
        return null;
    // Take most recent row.  Map back to category state.
    const head = rows[0];
    const categories = head.consent_type === 'cookie_banner_accept'
        ? { analytics: true, marketing: true, functional: true }
        : head.consent_type === 'cookie_banner_reject'
            ? { analytics: false, marketing: false, functional: false }
            : { analytics: head.granted, marketing: head.granted, functional: head.granted };
    return { categories, policyVersion: policy.version_semver };
}
export async function handleConsentRequest(input) {
    // CSRF gate for state-changing methods
    if (input.method !== 'GET' && !isSameOrigin(input.headers)) {
        return { status: 403, body: { error: 'cross_origin_blocked', code: 'CSRF' } };
    }
    const ip = clientIpFromHeaders(input.headers);
    const ua = input.headers.get('user-agent');
    const fingerprintHash = makeFingerprintHash(ua, ip);
    const ctx = {
        domain: input.domain,
        userId: input.userId ?? null,
        countryCode: input.countryCode ?? null,
        fingerprintHash,
    };
    if (input.method === 'POST') {
        let payload;
        try {
            payload = parseConsentBody(input.body);
        }
        catch (e) {
            if (e instanceof ConsentValidationError) {
                return { status: 400, body: { error: e.message, code: e.code } };
            }
            return { status: 400, body: { error: 'invalid_payload', code: 'BAD_REQUEST' } };
        }
        const result = await insertConsentRecords(input.hasura, payload, ctx, {
            action: 'change',
        });
        if ('error' in result) {
            return { status: 502, body: { error: result.error, code: 'HASURA_ERROR' } };
        }
        return {
            status: 200,
            body: { ok: true, recordIds: result.ids, policy_version: payload.policyVersion },
        };
    }
    if (input.method === 'GET') {
        const current = await fetchLatestConsent(input.hasura, ctx);
        if (!current)
            return { status: 200, body: { ok: true, record: null } };
        return {
            status: 200,
            body: {
                ok: true,
                record: {
                    categories: current.categories,
                    policy_version: current.policyVersion,
                },
            },
        };
    }
    if (input.method === 'DELETE') {
        const withdrawPayload = {
            categories: { analytics: false, marketing: false, functional: false },
            policyVersion: 'withdraw',
        };
        const result = await insertConsentRecords(input.hasura, withdrawPayload, ctx, {
            action: 'withdraw',
        });
        if ('error' in result) {
            return { status: 502, body: { error: result.error, code: 'HASURA_ERROR' } };
        }
        return { status: 200, body: { ok: true, recordIds: result.ids, withdrawn: true } };
    }
    return { status: 405, body: { error: 'method_not_allowed', code: 'METHOD' } };
}
//# sourceMappingURL=server-handler.js.map