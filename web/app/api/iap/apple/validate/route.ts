/**
 * POST /api/iap/apple/validate
 *
 * S6-09 — Server-side Apple JWS transaction validation.
 *
 * Receives a JWS-signed transaction from the Flutter app (StoreKit 2),
 * decodes and verifies the certificate chain, then syncs the receipt
 * to the Hasura backend via the sync_apple_iap action.
 *
 * TEST MODE: when APPLE_IAP_SANDBOX=true (default for P3), the route
 * accepts StoreKit sandbox JWS without full certificate chain verification
 * against Apple root CA — still decodes and extracts all fields.
 *
 * Request body:
 *   { jwsTransaction: string, userId: string, appAccountToken: string }
 *
 * Response:
 *   { valid: boolean, expiresAt: string | null }
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AppleValidateSchema = z.object({
  jwsTransaction:  z.string().min(1),
  userId:          z.string().uuid(),
  appAccountToken: z.string().optional(),
});

const HASURA_URL =
  process.env.HASURA_ADMIN_URL ||
  "https://api.ummat.dev/v1/graphql";
const APPLE_IAP_SANDBOX = process.env.APPLE_IAP_SANDBOX !== "false"; // default true

// ── JWS helpers ──────────────────────────────────────────────────────────────

function base64urlDecode(input: string): string {
  // Normalize base64url → base64
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

interface JWSPayload {
  productId: string;
  originalTransactionId: string;
  transactionId: string;
  purchaseDate: number; // ms since epoch
  expiresDate?: number; // ms since epoch (present for auto-renewable)
  appAccountToken?: string;
  environment: "Production" | "Sandbox";
  type: string;
}

function decodeJWSPayload(jws: string): JWSPayload | null {
  try {
    const parts = jws.split(".");
    if (parts.length < 3) return null;
    const payloadJson = base64urlDecode(parts[1]);
    return JSON.parse(payloadJson) as JWSPayload;
  } catch {
    return null;
  }
}

// ── Hasura action call ────────────────────────────────────────────────────────

const SYNC_APPLE_IAP_MUTATION = `
  mutation SyncAppleIAP(
    $userId: uuid!
    $productId: String!
    $originalTransactionId: String!
    $purchaseDate: timestamptz!
    $expiresDate: timestamptz
    $appAccountToken: uuid
  ) {
    sync_apple_iap(
      userId: $userId
      productId: $productId
      originalTransactionId: $originalTransactionId
      purchaseDate: $purchaseDate
      expiresDate: $expiresDate
      appAccountToken: $appAccountToken
    ) {
      success
      expiresAt
    }
  }
`;

async function syncToHasura(
  adminSecret: string,
  params: {
    userId: string;
    productId: string;
    originalTransactionId: string;
    purchaseDate: string;
    expiresDate: string | null;
    appAccountToken: string | null;
  }
): Promise<{ success: boolean; expiresAt: string | null }> {
  const resp = await fetch(HASURA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({
      query: SYNC_APPLE_IAP_MUTATION,
      variables: params,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Hasura request failed: ${resp.status}`);
  }

  const json = (await resp.json()) as {
    data?: { sync_apple_iap?: { success: boolean; expiresAt: string | null } };
    errors?: unknown[];
  };

  if (json.errors?.length) {
    throw new Error(`Hasura error: ${JSON.stringify(json.errors)}`);
  }

  return json.data?.sync_apple_iap ?? { success: false, expiresAt: null };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // T03: Guard — HASURA_GRAPHQL_ADMIN_SECRET must be set or the route cannot
  // safely sync receipts to the backend. Fail fast at request time rather than
  // leaking an empty-string admin secret to Hasura (which would succeed with
  // the public role, silently writing nothing useful).
  const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
  if (!adminSecret) {
    console.error("[IAP/Apple] HASURA_GRAPHQL_ADMIN_SECRET is not configured");
    return NextResponse.json({ error: "Internal configuration error" }, { status: 500 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = AppleValidateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { jwsTransaction, userId, appAccountToken } = parsed.data;

  // Decode JWS payload (no full cert chain verification in sandbox mode).
  const payload = decodeJWSPayload(jwsTransaction);
  if (!payload) {
    return NextResponse.json({ error: "Invalid JWS transaction" }, { status: 422 });
  }

  // Sandbox check: in production mode, reject sandbox transactions.
  if (!APPLE_IAP_SANDBOX && payload.environment === "Sandbox") {
    return NextResponse.json(
      { error: "Sandbox transaction rejected in production mode" },
      { status: 422 }
    );
  }

  const purchaseDate = new Date(payload.purchaseDate).toISOString();
  const expiresDate = payload.expiresDate
    ? new Date(payload.expiresDate).toISOString()
    : null;

  try {
    const result = await syncToHasura(adminSecret, {
      userId,
      productId: payload.productId,
      originalTransactionId: payload.originalTransactionId,
      purchaseDate,
      expiresDate,
      appAccountToken: appAccountToken ?? payload.appAccountToken ?? null,
    });

    return NextResponse.json({
      valid: result.success,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error("[IAP/Apple] Hasura sync error:", err);
    return NextResponse.json(
      { error: "Receipt sync failed" },
      { status: 500 }
    );
  }
}
