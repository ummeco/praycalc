# PrayCalc Web — API Reference

**Base path:** `/api` — all routes are Next.js App Router `route.ts` handlers.
**Auth:** Most public endpoints are unauthenticated but rate-limited by IP. Authenticated routes require a Hasura Auth JWT (`Authorization: Bearer <token>`).

---

## Prayer Times

### `GET /api/prayers`

**Auth:** Public — IP rate-limited.
**Purpose:** Compute prayer times for a location + date range.

| Param | Type | Required | Notes |
|---|---|---|---|
| `lat` | number | yes | Decimal latitude |
| `lng` | number | yes | Decimal longitude |
| `tz` | string | no | IANA timezone (default `UTC`) |
| `from` | string (YYYY-MM-DD) | yes | Start date |
| `to` | string (YYYY-MM-DD) | yes | End date (max 400 days span) |
| `hanafi` | `"1"` | no | Use Hanafi Asr calculation |

**Response:** `{ times: PrayerResult[] }` — array of daily prayer time objects.
**Errors:** `400` invalid/missing params, `429` rate exceeded.

---

## Geolocation

### `GET /api/geo`

**Auth:** Public — IP rate-limited.
**Purpose:** Reverse-geocode lat/lng to timezone + locale label.

| Param | Type | Required |
|---|---|---|
| `lat` | number | yes |
| `lng` | number | yes |

**Response:** `{ tz: string, label: string, utcOffset: number }`
**Errors:** `400` bad params, `429` rate exceeded.

---

## Search

### `GET /api/search`

**Auth:** Public.
**Purpose:** Search masjid/city location index for autocomplete.

| Param | Type | Required |
|---|---|---|
| `q` | string | yes |

**Response:** `{ results: Array<{ name: string, lat: number, lng: number, tz: string }> }`

---

## GraphQL

### `POST /api/graphql`

**Auth:** User JWT (passed through to Hasura). Public queries allowed per Hasura role rules.
**Purpose:** Hasura GraphQL proxy — forwards requests to `https://api.ummat.dev/v1/graphql` with CORS headers.
**Request:** Standard GraphQL `{ query, variables, operationName }`.
**Response:** Standard GraphQL response.

---

## Analytics

### `POST /api/analytics`

**Auth:** Public (anonymous events allowed).
**Purpose:** Ingest anonymous usage events (prayer time views, share clicks, widget activations) to Umami-compatible endpoint.
**Request body:** `{ event: string, payload?: Record<string, unknown> }`
**Response:** `{ ok: true }`
**Errors:** `400` missing event name.

---

## Calendar Export

### `GET /api/calendar/pdf`

**Auth:** Public.
**Purpose:** Generate a printable monthly prayer time PDF for a location.

| Param | Type | Required |
|---|---|---|
| `lat` | number | yes |
| `lng` | number | yes |
| `month` | string (YYYY-MM) | yes |
| `tz` | string | no |

**Response:** `application/pdf` binary stream.
**Errors:** `400` missing params, `429` rate exceeded.

### `GET /api/calendar/ics`

**Auth:** Public.
**Purpose:** Generate iCal `.ics` file for prayer time subscription.
**Params:** Same as PDF.
**Response:** `text/calendar` download.

---

## Ramadan

### `GET /api/ramadan/times`

**Auth:** Public — IP rate-limited.
**Purpose:** Sehri/Iftar times for full Ramadan month.

| Param | Type | Required |
|---|---|---|
| `lat` | number | yes |
| `lng` | number | yes |
| `year` | number | yes |
| `tz` | string | no |

**Response:** `{ days: Array<{ date: string, sehri: string, iftar: string }> }`

---

## TV / Smart Display

### `POST /api/tv/activate`

**Auth:** User JWT.
**Purpose:** Activate a TV display device by pairing code.
**Request body:** `{ code: string }`
**Response:** `{ deviceId: string, status: 'activated' }`
**Errors:** `400` invalid code, `401` unauthenticated, `404` code not found.

### `GET /api/tv/app-code`

**Auth:** User JWT.
**Purpose:** Generate a pairing code for a new TV app install.
**Response:** `{ code: string, expiresAt: string }`

### `GET /api/tv/app-code/[code]/status`

**Auth:** Public (polled by TV app).
**Purpose:** Poll whether a pairing code has been claimed.
**Response:** `{ status: 'pending' | 'activated', deviceId?: string }`

---

## Dashboard — TV Management

All dashboard routes require **user JWT**.

### `GET /api/dashboard/tvs`

**Purpose:** List all TVs owned by the authenticated user.
**Response:** `{ tvs: Array<{ id, name, status, lastSeen }> }`

### `POST /api/dashboard/tvs`

**Purpose:** Register a new TV device.
**Request body:** `{ name: string, code: string }`
**Response:** `{ tv: { id, name } }`

### `GET /api/dashboard/tvs/[id]`

**Purpose:** Get single TV device details.

### `PUT /api/dashboard/tvs/[id]/settings`

**Purpose:** Update TV display settings (layout, method, theme).
**Request body:** `{ settings: Record<string, unknown> }`

### `DELETE /api/dashboard/tvs/[id]`

**Purpose:** Remove a TV device.
**Response:** `{ ok: true }`

### `GET /api/dashboard/tvs/[id]/screenshot`

**Purpose:** Fetch latest screenshot of the TV display.
**Response:** `image/png` or `{ url: string }`.

### `PUT /api/dashboard/tvs/[id]/quran`

**Purpose:** Configure Quran verse overlay on TV.
**Request body:** `{ surah: number, ayah: number, enabled: boolean }`

### `POST /api/dashboard/tvs/[id]/share`

**Purpose:** Generate a shareable public link for a TV layout.
**Response:** `{ shareUrl: string }`

### `GET /api/dashboard/tvs/groups`

**Purpose:** List TV groups.

### `POST /api/dashboard/tvs/groups`

**Purpose:** Create a TV group.
**Request body:** `{ name: string, tvIds: string[] }`

### `POST /api/dashboard/tvs/groups/[id]/announce`

**Purpose:** Push an announcement overlay to all TVs in a group.
**Request body:** `{ message: string, durationSeconds: number }`

### `GET /api/dashboard/tvs/stream`

**Auth:** User JWT — SSE stream.
**Purpose:** Server-sent events stream for real-time TV status updates.
**Response:** `text/event-stream`

---

## Billing

Billing routes proxy to the internal smart service.

### `POST /api/billing/checkout`

**Auth:** User JWT (passed via `Authorization` header).
**Purpose:** Create a Stripe checkout session for PrayCalc Pro subscription.
**Request body:** `{ email?: string }`
**Response:** `{ url: string }` — Stripe Checkout redirect URL.
**Errors:** `503` Stripe not configured or smart service unavailable.

### `POST /api/billing/portal`

**Auth:** User JWT.
**Purpose:** Open Stripe customer portal for subscription management.
**Request body:** `{ returnUrl: string }`
**Response:** `{ url: string }` — Stripe portal redirect URL.

---

## In-App Purchases

### `POST /api/iap/apple/validate`

**Auth:** User JWT.
**Purpose:** Validate an Apple App Store receipt and unlock Pro access.
**Request body:** `{ receipt: string, productId: string }`
**Response:** `{ valid: boolean, expiresAt?: string }`
**Errors:** `400` invalid receipt, `402` purchase invalid.

### `POST /api/iap/google/validate`

**Auth:** User JWT.
**Purpose:** Validate a Google Play purchase token and unlock Pro access.
**Request body:** `{ purchaseToken: string, productId: string, packageName: string }`
**Response:** `{ valid: boolean, expiresAt?: string }`
**Errors:** `400` invalid token, `402` purchase invalid.

---

## Smart Home

### `GET /api/smart-home/integrations`

**Auth:** User JWT.
**Purpose:** List configured smart home integrations (Alexa, Google Home, HomeKit).
**Response:** `{ integrations: Array<{ type: string, status: string, lastSync: string }> }`

### `POST /api/smart-home/integrations`

**Purpose:** Connect a new smart home integration.
**Request body:** `{ type: 'alexa' | 'google_home' | 'homekit', authCode?: string }`

### `POST /api/smart-home/webhooks`

**Auth:** HMAC signature verified (integration-specific secret).
**Purpose:** Receive incoming events from smart home platforms.
**Request body:** Platform-specific event payload.

### `GET /api/smart-home/devices`

**Auth:** User JWT.
**Purpose:** List discovered smart home devices.
**Response:** `{ devices: Array<{ id, name, type, capabilities }> }`

---

## Account

### `POST /api/account/delete-request`

**Auth:** User JWT.
**Purpose:** Initiate account deletion — sends confirmation email.
**Response:** `{ ok: true }`

### `POST /api/account/delete-action`

**Auth:** User JWT.
**Purpose:** Confirm and execute account deletion with token from email.
**Request body:** `{ token: string }`
**Response:** `{ ok: true }`
**Errors:** `400` invalid/expired token, `401` unauthenticated.

### `DELETE /api/account/delete`

**Auth:** User JWT.
**Purpose:** Immediate account deletion (admin/dev flow).
**Response:** `{ ok: true }`

---

## Cron

### `POST /api/cron/digest`

**Auth:** Cron secret header (`x-cron-secret`).
**Purpose:** Send daily prayer time digest emails to subscribed users.
**Errors:** `401` invalid secret.

---

## Dev

### `POST /api/dev/login`

**Auth:** Dev-only (disabled in production via `NODE_ENV` check).
**Purpose:** Bypass auth for local development.
**Request body:** `{ userId: string }`
