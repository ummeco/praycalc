/**
 * POST /api/iap/google/webhook
 *
 * T07 — Google Play Real-Time Developer Notifications (RTDN) handler.
 *
 * Google delivers subscription lifecycle events via Cloud Pub/Sub push
 * notifications signed as JWTs.  This route:
 *   1. Verifies the Pub/Sub push JWT using GOOGLE_PUBSUB_AUDIENCE.
 *   2. Decodes the base64-encoded SubscriptionNotification payload.
 *   3. Handles the following lifecycle events:
 *        SUBSCRIPTION_PURCHASED      (1)
 *        SUBSCRIPTION_RENEWED        (2)
 *        SUBSCRIPTION_RECOVERED      (3)  payment recovered after hold
 *        SUBSCRIPTION_ON_HOLD        (5)  payment declined
 *        SUBSCRIPTION_IN_GRACE_PERIOD(6)  grace period started
 *        SUBSCRIPTION_RESTARTED      (7)  resubscribed
 *        SUBSCRIPTION_PRICE_CHANGE_CONFIRMED (8)
 *        SUBSCRIPTION_DEFERRED       (9)
 *        SUBSCRIPTION_PAUSED         (10)
 *        SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED (11)
 *        SUBSCRIPTION_REVOKED        (12) refunded / chargebacked
 *        SUBSCRIPTION_EXPIRED        (13)
 *   4. Syncs the updated state to Hasura via update_google_iap_status action.
 *
 * Google Pub/Sub push authentication:
 *   Cloud Pub/Sub signs every push message as a JWT Bearer token in the
 *   Authorization header. The token audience must match the endpoint URL
 *   (or the GOOGLE_PUBSUB_AUDIENCE env var). We verify using Google's JWK set.
 *
 * Required env vars:
 *   HASURA_GRAPHQL_ADMIN_SECRET     — guards Hasura call (T03)
 *   GOOGLE_PUBSUB_AUDIENCE          — expected JWT audience (this endpoint URL)
 *
 * Optional env vars:
 *   GOOGLE_PUBSUB_VERIFY=false      — disable JWT verification (test/sandbox only)
 *
 * Reference:
 *   https://developer.android.com/google/play/billing/rtdn-reference
 *   https://cloud.google.com/pubsub/docs/push#authentication
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Google's JWK endpoint for verifying Pub/Sub JWT push tokens. */
const GOOGLE_JWK_URI = "https://www.googleapis.com/oauth2/v3/certs";

const HASURA_URL =
  process.env.HASURA_ADMIN_URL ?? "https://api.ummat.dev/v1/graphql";

// ── Subscription notification types ──────────────────────────────────────────

const enum SubscriptionNotificationType {
  PURCHASED       = 1,
  RENEWED         = 2,
  RECOVERED       = 3,
  ON_HOLD         = 5,
  IN_GRACE_PERIOD = 6,
  RESTARTED       = 7,
  PRICE_CHANGE_CONFIRMED = 8,
  DEFERRED        = 9,
  PAUSED          = 10,
  PAUSE_SCHEDULE_CHANGED = 11,
  REVOKED         = 12,
  EXPIRED         = 13,
}

/** Derived subscription status for Hasura update. */
type SubscriptionStatus =
  | "active"
  | "expired"
  | "revoked"
  | "on_hold"
  | "in_grace_period"
  | "paused";

function notificationTypeToStatus(
  type: number,
): SubscriptionStatus {
  switch (type) {
    case SubscriptionNotificationType.PURCHASED:
    case SubscriptionNotificationType.RENEWED:
    case SubscriptionNotificationType.RECOVERED:
    case SubscriptionNotificationType.RESTARTED:
    case SubscriptionNotificationType.PRICE_CHANGE_CONFIRMED:
    case SubscriptionNotificationType.DEFERRED:
      return "active";
    case SubscriptionNotificationType.ON_HOLD:
      return "on_hold";
    case SubscriptionNotificationType.IN_GRACE_PERIOD:
      return "in_grace_period";
    case SubscriptionNotificationType.PAUSED:
    case SubscriptionNotificationType.PAUSE_SCHEDULE_CHANGED:
      return "paused";
    case SubscriptionNotificationType.REVOKED:
      return "revoked";
    case SubscriptionNotificationType.EXPIRED:
    default:
      return "expired";
  }
}

// ── Pub/Sub message types ──────────────────────────────────────────────────

interface PubSubData {
  version?: string;
  packageName?: string;
  eventTimeMillis?: string;
  subscriptionNotification?: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    subscriptionId: string;
  };
  oneTimeProductNotification?: unknown;
  testNotification?: unknown;
}

interface PubSubMessage {
  data: string; // base64-encoded JSON
  messageId: string;
  publishTime?: string;
  attributes?: Record<string, string>;
}

interface PubSubPushBody {
  message: PubSubMessage;
  subscription?: string;
}

// ── JWT verification (Google Pub/Sub push) ────────────────────────────────────

interface JWKSet {
  keys: Array<{
    kty: string;
    kid: string;
    n?: string;
    e?: string;
    use?: string;
    alg?: string;
  }>;
}

let _cachedJwks: JWKSet | null = null;
let _jwksFetchedAt = 0;
const JWK_CACHE_TTL_MS = 3600 * 1000; // 1 hour

async function fetchJWKS(): Promise<JWKSet> {
  const now = Date.now();
  if (_cachedJwks && now - _jwksFetchedAt < JWK_CACHE_TTL_MS) {
    return _cachedJwks;
  }
  const resp = await fetch(GOOGLE_JWK_URI);
  if (!resp.ok) {
    throw new Error(`Failed to fetch Google JWK set: ${resp.status}`);
  }
  _cachedJwks = (await resp.json()) as JWKSet;
  _jwksFetchedAt = now;
  return _cachedJwks;
}

/**
 * Verify a Google Pub/Sub push JWT.
 *
 * Google signs Pub/Sub push notifications as RS256 JWTs where:
 *   - `iss` = "accounts.google.com" or "https://accounts.google.com"
 *   - `aud` = the endpoint URL (GOOGLE_PUBSUB_AUDIENCE)
 *   - `exp` = standard JWT expiry
 *
 * Verification uses Node.js `crypto.createVerify` with Google's public JWK.
 */
async function verifyPubSubJwt(authHeader: string, audience: string): Promise<boolean> {
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  let header: { kid?: string; alg?: string };
  let payload: { iss?: string; aud?: string; exp?: number; iat?: number };

  try {
    header  = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as typeof header;
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as typeof payload;
  } catch {
    return false;
  }

  // Validate issuer and audience.
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!validIssuers.includes(payload.iss ?? "")) return false;
  if (payload.aud !== audience) return false;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return false;

  // Find matching JWK by kid.
  const jwks = await fetchJWKS();
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk || jwk.kty !== "RSA" || !jwk.n || !jwk.e) return false;

  // Verify RS256 signature using Node.js crypto.
  try {
    const { createVerify, createPublicKey } = await import("crypto");
    const pubKey = createPublicKey({
      key: {
        kty: "RSA",
        n: jwk.n,
        e: jwk.e,
        alg: "RS256",
        use: "sig",
      },
      format: "jwk",
    });
    const verifier = createVerify("SHA256");
    verifier.update(`${parts[0]}.${parts[1]}`);
    return verifier.verify(pubKey, parts[2], "base64url");
  } catch {
    return false;
  }
}

// ── Hasura update ─────────────────────────────────────────────────────────────

const UPDATE_GOOGLE_IAP_STATUS_MUTATION = `
  mutation UpdateGoogleIAPStatus(
    $purchaseToken: String!
    $status: String!
    $eventTimeMillis: String
    $notificationType: Int!
  ) {
    update_google_iap_status(
      purchaseToken: $purchaseToken
      status: $status
      eventTimeMillis: $eventTimeMillis
      notificationType: $notificationType
    ) {
      success
      userId
    }
  }
`;

async function updateHasuraStatus(
  adminSecret: string,
  params: {
    purchaseToken: string;
    status: SubscriptionStatus;
    eventTimeMillis?: string;
    notificationType: number;
  }
): Promise<void> {
  const resp = await fetch(HASURA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({
      query: UPDATE_GOOGLE_IAP_STATUS_MUTATION,
      variables: params,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Hasura request failed: ${resp.status}`);
  }

  const json = (await resp.json()) as {
    errors?: unknown[];
  };
  if (json.errors?.length) {
    throw new Error(`Hasura error: ${JSON.stringify(json.errors)}`);
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // T03 guard: admin secret must be present.
  const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
  if (!adminSecret) {
    console.error("[IAP/Google/Webhook] HASURA_GRAPHQL_ADMIN_SECRET is not configured");
    return NextResponse.json({ error: "Internal configuration error" }, { status: 500 });
  }

  // Verify Pub/Sub push JWT unless verification is explicitly disabled.
  const skipVerify = process.env.GOOGLE_PUBSUB_VERIFY === "false";
  if (!skipVerify) {
    const audience = process.env.GOOGLE_PUBSUB_AUDIENCE;
    if (!audience) {
      console.error("[IAP/Google/Webhook] GOOGLE_PUBSUB_AUDIENCE is not configured");
      return NextResponse.json({ error: "Internal configuration error" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    let valid = false;
    try {
      valid = await verifyPubSubJwt(authHeader, audience);
    } catch (err) {
      Sentry.captureException(err);
      console.error("[IAP/Google/Webhook] JWT verification error:", err);
      return NextResponse.json({ error: "JWT verification failed" }, { status: 500 });
    }
    if (!valid) {
      console.warn("[IAP/Google/Webhook] Invalid Pub/Sub JWT");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse the Pub/Sub push body.
  let pushBody: PubSubPushBody;
  try {
    pushBody = (await req.json()) as PubSubPushBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!pushBody?.message?.data) {
    return NextResponse.json({ error: "Missing message.data" }, { status: 400 });
  }

  // Decode and parse the DeveloperNotification payload.
  let notification: PubSubData;
  try {
    const raw = Buffer.from(pushBody.message.data, "base64").toString("utf8");
    notification = JSON.parse(raw) as PubSubData;
  } catch {
    return NextResponse.json({ error: "Failed to decode notification data" }, { status: 400 });
  }

  // Ignore test notifications (Google sends these to verify endpoint health).
  if (notification.testNotification) {
    console.log("[IAP/Google/Webhook] Test notification received — ignoring");
    return NextResponse.json({ received: true });
  }

  // Ignore one-time product notifications (not subscriptions).
  if (notification.oneTimeProductNotification) {
    return NextResponse.json({ received: true });
  }

  const sub = notification.subscriptionNotification;
  if (!sub) {
    // Unknown notification type — ack to prevent re-delivery.
    console.warn("[IAP/Google/Webhook] Unknown notification structure");
    return NextResponse.json({ received: true });
  }

  const { purchaseToken, subscriptionId, notificationType } = sub;
  if (!purchaseToken || !subscriptionId) {
    return NextResponse.json({ error: "Missing purchaseToken or subscriptionId" }, { status: 400 });
  }

  const status = notificationTypeToStatus(notificationType);
  console.log(
    `[IAP/Google/Webhook] sub=${subscriptionId} type=${notificationType} status=${status}`
  );

  try {
    await updateHasuraStatus(adminSecret, {
      purchaseToken,
      status,
      eventTimeMillis: notification.eventTimeMillis,
      notificationType,
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error("[IAP/Google/Webhook] Hasura update error:", err);
    // Return 500 so Pub/Sub will retry delivery.
    return NextResponse.json({ error: "Status sync failed" }, { status: 500 });
  }

  // Acknowledge the Pub/Sub message (HTTP 200 = ack).
  return NextResponse.json({ received: true });
}
