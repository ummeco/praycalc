# Smart Server — Endpoint Security Reference

> Last updated: 2026-03-13 (SEC-B1 full audit)
> Base: `smart/src/`

Complete inventory of every HTTP endpoint in `praycalc/smart/`, with auth status, ownership
checks, and any known gaps. Updated after every route addition.

---

## Auth Model

Two token types:

| Token | Issued by | Carries | Used for |
| --- | --- | --- | --- |
| **User JWT** | Hasura Auth (`auth.ummat.dev`) | `user_id`, Hasura claims | Web dashboard + mobile API calls |
| **TV JWT** | Smart server (`POST /api/v1/tv/activate`) | `device_id`, `user_id` | TV app API calls |

Both are verified by `requireAuth` middleware (`smart/src/middleware/auth.ts`):

1. Decode the JWT (HS256, secret from `HASURA_JWT_SECRET`).
2. Extract `user_id` from `https://hasura.io/jwt/claims` → `x-hasura-user-id`.
3. Set `req.userId` and `req.isAuthenticated` for downstream handlers.

`optionalAuth` runs the same check but does not block requests with no token — it sets
`req.isAuthenticated = false` and continues.

---

## Route Inventory

### `/health` — Health Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/health` | None | Returns status, uptime, version. No sensitive data. |

**Verdict:** Intentionally public. Monitoring probes require no auth.

---

### `/api/v1/public` — Public Times Router

Mounted with `cors({ origin: '*' })` — explicitly intended for third-party consumers.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/times` | None | Prayer times by lat/lng query params. Rate-limited: 100 req/IP/min. No PII. |

**Verdict:** Intentionally public. Read-only, no user data, rate-limited.

---

### `/api/v1/times` — Prayer Times Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/times` | `optionalAuth` | Authenticated users get saved preferences; anonymous users get defaults. |

**Verdict:** Intentional `optionalAuth`. Works for both anonymous and signed-in users.

---

### `/oauth` — OAuth 2.0 Router

Standard OAuth 2.0 authorization server endpoints. All are intentionally unauthenticated
(the user authenticates during the flow itself).

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/oauth/authorize` | None | Shows OAuth consent page |
| `POST` | `/oauth/authorize` | None | Validates credentials, issues auth code |
| `POST` | `/oauth/token` | None | Exchanges code/refresh token for access token |
| `POST` | `/oauth/revoke` | None | Revokes token (validated against DB, not header-auth) |

**Verdict:** All intentional. Standard OAuth 2.0 server pattern requires unauthenticated endpoints.

---

### `/google` — Google Actions Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/google/fulfillment` | None (OAuth token lookup) | Resolves user from OAuth `access_token` in request body. Falls back to anonymous with IP rate limit. |

**Verdict:** Intentional. Google Actions sends access tokens — server resolves user from
`resolveUserFromToken()`. Unauthenticated fallback is limited to public prayer time data.

---

### `/alexa` — Alexa Skills Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/alexa/fulfillment` | None (account linking token lookup) | Resolves user from Alexa account linking token. Falls back to anonymous. |

**Verdict:** Intentional. Same pattern as Google Actions.

---

### `/billing` — Billing Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/billing/checkout` | `requireAuth` | Create Stripe Checkout session |
| `GET` | `/billing/status` | `requireAuth` | Check subscription status |
| `POST` | `/billing/portal` | `requireAuth` | Create Stripe Customer Portal session |
| `POST` | `/billing/webhook` | None (signature verified) | Stripe webhook — signature checked via `stripe-signature` header + `STRIPE_WEBHOOK_SECRET` |
| `POST` | `/billing/verify-receipt` | `requireAuth` | Verify iOS/Android IAP receipt |

**Verdict:** `/billing/webhook` is intentionally unauthenticated (Stripe sends it). Signature
verification with `STRIPE_WEBHOOK_SECRET` is equivalent to auth. All other billing routes require auth.

---

### `/api/v1/webhooks` — Webhook Registration Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/webhooks` | `requireAuth` | List user's registered webhooks |
| `POST` | `/api/v1/webhooks` | `requireAuth` | Register a webhook URL (max 5 per user) |
| `DELETE` | `/api/v1/webhooks/:id` | `requireAuth` | Remove webhook (ownership verified) |

**Verdict:** Fully authenticated.

---

### `/api/v1/integrations` — Integrations Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/integrations` | `requireAuth` | List connected integrations |
| `POST` | `/api/v1/integrations` | `requireAuth` | Connect integration (google, alexa) |

**Verdict:** Fully authenticated.

---

### `/api/v1/devices` — Smart Home Devices Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/devices` | `requireAuth` | List user's smart home devices |
| `POST` | `/api/v1/devices` | `requireAuth` | Register device |
| `DELETE` | `/api/v1/devices/:id` | `requireAuth` | Remove device (ownership verified) |

**Verdict:** Fully authenticated.

---

### `/api/v1/agendas` — Agendas Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/agendas` | `requireAuth` | List caller's agendas |
| `POST` | `/api/v1/agendas` | `requireAuth` | Create agenda |
| `GET` | `/api/v1/agendas/:id` | `optionalAuth` | Public if `is_public=true`; else owner only |
| `PATCH` | `/api/v1/agendas/:id` | `requireAuth` | Update (ownership verified) |
| `DELETE` | `/api/v1/agendas/:id` | `requireAuth` | Delete (ownership verified) |
| `GET` | `/api/v1/agendas/share/:slug` | None | Public share page — returns public agendas only |

**Verdict:** `GET /share/:slug` intentionally public (read-only public data). All mutations require auth.

---

### `/api/v1/stats` — Stats Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/stats` | `requireAuth` | Prayer stats for authenticated user |

**Verdict:** Fully authenticated.

---

### `/api/v1/digest` — Email Digest Router

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/v1/digest/subscribe` | None | Subscribe email — generates confirm + unsub tokens |
| `GET` | `/api/v1/digest/confirm` | None | Confirm via token in query param |
| `GET` | `/api/v1/digest/unsubscribe` | None | Unsubscribe via token in query param |
| `POST` | `/api/v1/digest/send` | None (`x-api-key` header) | Protected by `INTERNAL_API_KEY` env var — for cron jobs |

**Verdict:** Subscribe/confirm/unsubscribe are intentionally public (email flows). `/send` uses
API key auth (cron-to-server). No PII exposed without a valid token.

---

### `/api/v1/tv` — TV Router

#### Public (unauthenticated) — intentional

| Method | Path | Why unauthenticated |
| --- | --- | --- |
| `POST` | `/api/v1/tv/code` | TV has no token yet; requests 6-char code (legacy TV2-1.3 flow) |
| `POST` | `/api/v1/tv/auth/device` | TV initiates RFC 8628 device flow before any token exists |
| `GET` | `/api/v1/tv/auth/poll` | TV polls for auth status; identified by opaque `device_code` |
| `POST` | `/api/v1/tv/activate` | TV exchanges 4-digit code for JWT; rate-limited 10/IP/min |
| `GET` | `/api/v1/tv/code/:code/status` | TV polls pairing code status before JWT is issued |
| `GET` | `/api/v1/tv/guest/:code` | Guest QR resolution — returns lat/lng only, no user data, 24h expiry |
| `GET` | `/api/v1/tv/streams` | Read-only curated stream library — no user data |
| `GET` | `/api/v1/tv/platform-config` | TV reads display config before JWT is issued |

All public TV endpoints enforce input validation and return no PII.
`POST /activate` rate-limited: 10 req/IP/min → 429.

#### Authenticated — `requireAuth`

| Method | Path | Ownership check | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/v1/tv/pair` | — | User creates pairing entry; device does not exist yet |
| `POST` | `/api/v1/tv/auth/authorize` | — | User authorizes a pending `device_code` |
| `POST` | `/api/v1/tv/auth/refresh` | — | Refreshes caller's own TV JWT |
| `POST` | `/api/v1/tv/app-code` | — | Dashboard generates 4-digit code |
| `GET` | `/api/v1/tv/app-code/:code/status` | requireAuth | Dashboard polls code activation status |
| `POST` | `/api/v1/tv/guest-qr` | — | Creates 24h guest QR tied to caller's user_id |
| `GET` | `/api/v1/tv` | — | Lists only devices owned by `req.userId` |
| `POST` | `/api/v1/tv/heartbeat` | JWT carries device_id | TV updates own last_seen; device identity from JWT |
| `POST` | `/api/v1/tv/:id/screenshot` | Hasura + in-memory | Owner only |
| `POST` | `/api/v1/tv/:id/photo/upload` | Hasura + in-memory | Owner only; presigned S3 URL |
| `GET` | `/api/v1/tv/:id/photos` | Hasura + in-memory | Owner only |
| `PATCH` | `/api/v1/tv/:id` | Hasura | Owner only; rename |
| `DELETE` | `/api/v1/tv/:id` | Hasura | Owner only |
| `POST` | `/api/v1/tv/:id/share` | Hasura | Owner only; adds share |
| `DELETE` | `/api/v1/tv/:id/share/:userId` | Hasura | Owner or self-removal |
| `GET` | `/api/v1/tv/:id/settings` | Hasura + owner/share | Owner or shared user |
| `PATCH` | `/api/v1/tv/:id/settings` | Hasura + in-memory | Owner or shared user |
| `GET` | `/api/v1/tv/groups` | — | Lists caller's groups |
| `POST` | `/api/v1/tv/groups` | — | Creates group (caller = owner) |
| `PATCH` | `/api/v1/tv/groups/:id/settings` | Hasura | Owner only |
| `POST` | `/api/v1/tv/groups/:id/announce` | Hasura | Owner only |
| `GET` | `/api/v1/tv/:id/announcements` | Hasura + owner/share | Owner or shared user |
| `GET` | `/api/v1/tv/dashboard/stream` | requireAuth | SSE stream for web dashboard |
| `GET` | `/api/v1/tv/:id/events` | requireAuth | SSE stream; no explicit ownership check (see gaps) |
| `POST` | `/api/v1/tv/:id/prayer-complete` | requireAuth | Broadcasts prayer name to TV's SSE; no PII |
| `POST` | `/api/v1/tv/:id/quran` | Hasura + owner/share | Owner or shared user |

---

## Ownership Check Pattern

For device-specific write routes, ownership is verified in two layers:

1. **In-memory cache** (`deviceRegistry.get(deviceId)?.userId`): fast path for recently active
   devices.
2. **Hasura fallback**: when device is not in memory (after restart), query `pc_tv_devices`
   to verify `user_id = req.userId`. For shared access, also check `pc_tv_shares`.

On Hasura failure, the endpoint returns **403** (deny-on-error — secure default).

---

## Known Gaps

| Gap | Risk | Mitigation |
| --- | --- | --- |
| `GET /:id/events` — no ownership check | Low — SSE stream is push-only; subscriber must know the `deviceId` (UUID, not guessable); events contain no PII | Track as follow-up task; add Hasura ownership check |
| `POST /:id/prayer-complete` — no ownership check | Low — payload is only a prayer name string; no PII; SSE push only | Same as above |

No other gaps found in this audit (2026-03-13). All unauthenticated endpoints are either
intentional by design or protected by alternative mechanisms (webhook signatures, API keys,
rate limits, token lookups).

---

## Alternative Auth Mechanisms

| Endpoint | Mechanism |
| --- | --- |
| `/billing/webhook` | Stripe `stripe-signature` header + `STRIPE_WEBHOOK_SECRET` |
| `/api/v1/digest/send` | `x-api-key` header must equal `INTERNAL_API_KEY` env var |
| `/google/fulfillment` | OAuth access token resolved via `resolveUserFromToken()` |
| `/alexa/fulfillment` | Alexa account linking token resolved via `resolveUserFromToken()` |

---

## Rate Limiting

| Endpoint | Limit |
| --- | --- |
| `POST /api/v1/tv/activate` | 10 req/IP/min (custom token bucket, `activateRateLimit`) |
| `GET /api/v1/public/times` | 100 req/IP/min (in-memory token bucket) |
| All other routes | Global rate limiter via `rateLimiter` middleware |

---

## Input Validation

All endpoints validate:

- `device_name`: max 100 chars (SEC-A7, `DEVICE_NAME_MAX_LEN`)
- `announcement text`: max 500 chars (SEC-A7, `ANNOUNCEMENT_TEXT_MAX_LEN`)
- Photo upload: non-empty filename, max 100 chars, `image/*` content type required
- JWT secret: no hardcoded fallback in production (SEC-A9)
- HTML stripped from announcement text before storage (SEC-A8 `stripHtml()`)
- Kiosk PIN stored as salted hash: `praycalc_kiosk_{deviceId}_{pin}` (SEC-A4)
- Pairing code: 4-digit numeric, checked against in-memory store with expiry
- `lat`/`lng`: must be numeric (not string) before use in prayer time calc
