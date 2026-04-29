/**
 * POST /api/iap/google/validate
 *
 * S6-10b — Server-side Google Play purchase token validation.
 *
 * Receives a purchaseToken from the Flutter app (Play Billing v6),
 * calls Google Play Developer API to verify the subscription status,
 * then syncs the receipt to Hasura via the sync_google_iap action.
 *
 * TEST MODE: when GOOGLE_IAP_SANDBOX=true (default for P3), the route
 * skips the real Google Play API call and returns a mock valid response.
 * This allows end-to-end flow testing without a real Play service account.
 *
 * Request body:
 *   { purchaseToken: string, productId: string, userId: string }
 *
 * Response:
 *   { valid: boolean, expiresAt: string | null }
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

const HASURA_URL =
  process.env.HASURA_ADMIN_URL ||
  "https://api.ummat.dev/v1/graphql";
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || "";
const GOOGLE_IAP_SANDBOX = process.env.GOOGLE_IAP_SANDBOX !== "false"; // default true

// ── Google Play API ───────────────────────────────────────────────────────────

interface GoogleSubscriptionResource {
  paymentState: number; // 1 = payment received
  autoRenewing: boolean;
  expiryTimeMillis: string; // string representation of ms since epoch
  startTimeMillis?: string;
  orderId?: string;
}

/**
 * Fetch subscription resource from Google Play Developer API.
 * Requires GOOGLE_PLAY_SERVICE_ACCOUNT_JSON (base64 encoded) in env.
 */
async function fetchGoogleSubscription(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string
): Promise<GoogleSubscriptionResource | null> {
  const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.error("[IAP/Google] GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set");
    return null;
  }

  let credentials: { client_email: string; private_key: string };
  try {
    const decoded = Buffer.from(serviceAccountJson, "base64").toString("utf8");
    credentials = JSON.parse(decoded);
  } catch {
    console.error("[IAP/Google] Failed to parse service account JSON");
    return null;
  }

  // Obtain OAuth2 access token using service account JWT.
  const accessToken = await getServiceAccountToken(credentials);
  if (!accessToken) return null;

  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    console.error("[IAP/Google] Play API error:", resp.status, await resp.text());
    return null;
  }

  return (await resp.json()) as GoogleSubscriptionResource;
}

async function getServiceAccountToken(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Build JWT manually (no external lib dependency).
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString(
    "base64url"
  );
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${header}.${payloadEncoded}`;

  // Sign using Node.js crypto (available in Next.js edge/node runtime).
  const { createSign } = await import("crypto");
  const sign = createSign("SHA256");
  sign.update(signingInput);
  const signature = sign.sign(credentials.private_key, "base64url");

  const jwt = `${signingInput}.${signature}`;

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResp.ok) return null;
  const tokenData = (await tokenResp.json()) as { access_token?: string };
  return tokenData.access_token ?? null;
}

// ── Hasura action call ────────────────────────────────────────────────────────

const SYNC_GOOGLE_IAP_MUTATION = `
  mutation SyncGoogleIAP(
    $userId: uuid!
    $productId: String!
    $purchaseToken: String!
    $purchaseDate: timestamptz!
    $expiresDate: timestamptz
  ) {
    sync_google_iap(
      userId: $userId
      productId: $productId
      purchaseToken: $purchaseToken
      purchaseDate: $purchaseDate
      expiresDate: $expiresDate
    ) {
      success
      expiresAt
    }
  }
`;

async function syncToHasura(params: {
  userId: string;
  productId: string;
  purchaseToken: string;
  purchaseDate: string;
  expiresDate: string | null;
}): Promise<{ success: boolean; expiresAt: string | null }> {
  const resp = await fetch(HASURA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: SYNC_GOOGLE_IAP_MUTATION,
      variables: params,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Hasura request failed: ${resp.status}`);
  }

  const json = (await resp.json()) as {
    data?: { sync_google_iap?: { success: boolean; expiresAt: string | null } };
    errors?: unknown[];
  };

  if (json.errors?.length) {
    throw new Error(`Hasura error: ${JSON.stringify(json.errors)}`);
  }

  return json.data?.sync_google_iap ?? { success: false, expiresAt: null };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { purchaseToken?: string; productId?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { purchaseToken, productId, userId } = body;

  if (!purchaseToken || !productId || !userId) {
    return NextResponse.json(
      { error: "purchaseToken, productId, and userId are required" },
      { status: 400 }
    );
  }

  let expiresDate: string | null = null;
  let purchaseDate: string = new Date().toISOString();

  if (GOOGLE_IAP_SANDBOX) {
    // TEST MODE: skip real Play API, return mock valid subscription.
    // Expires 1 year from now to simulate active yearly subscription.
    const mockExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    expiresDate = mockExpiry.toISOString();
  } else {
    // Production: verify with Google Play Developer API.
    const packageName = "com.praycalc.app";
    const subscription = await fetchGoogleSubscription(
      packageName,
      productId,
      purchaseToken
    );

    if (!subscription) {
      return NextResponse.json({ error: "Google Play verification failed" }, { status: 422 });
    }

    // paymentState: 1 = payment received; 0 = payment pending.
    if (subscription.paymentState !== 1) {
      return NextResponse.json({ valid: false, expiresAt: null });
    }

    const expiryMs = parseInt(subscription.expiryTimeMillis, 10);
    expiresDate = new Date(expiryMs).toISOString();
    if (subscription.startTimeMillis) {
      purchaseDate = new Date(parseInt(subscription.startTimeMillis, 10)).toISOString();
    }
  }

  try {
    const result = await syncToHasura({
      userId,
      productId,
      purchaseToken,
      purchaseDate,
      expiresDate,
    });

    return NextResponse.json({
      valid: result.success,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error("[IAP/Google] Hasura sync error:", err);
    return NextResponse.json({ error: "Receipt sync failed" }, { status: 500 });
  }
}
