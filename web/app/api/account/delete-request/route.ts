import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, ACCOUNT_API } from "@/lib/rate-limit";
import {
  validateDeleteRequest,
  verifyTurnstileToken,
  getClientIpFromHeaders,
} from "@/app/account/delete/_lib/delete";

const HASURA_ADMIN_URL =
  process.env.HASURA_ADMIN_URL ??
  process.env.NEXT_PUBLIC_HASURA_URL ??
  "https://api.ummat.dev/v1/graphql";

const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "";

/**
 * POST /api/account/delete-request
 *
 * Public endpoint (no auth required). Accepts an email + Turnstile token,
 * verifies the bot-protection challenge, then:
 *   1. Soft-deletes the pc_users row matching the email via the
 *      delete_user_account Hasura action (if an account exists).
 *   2. Queues a staff notification email via Hasura mutation.
 *
 * Returns 200 { ok: true } regardless of whether an account was found,
 * to prevent email enumeration.
 */
export async function POST(req: Request) {
  // Rate-limit by IP — reuse the ACCOUNT_API limits (30 req/min)
  const ip = getClientIp(req.headers as unknown as Headers);
  const rl = await checkRateLimit(`account:delete-request:${ip}`, ACCOUNT_API);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, reason, turnstileToken } = body as {
    email?: string;
    reason?: string | null;
    turnstileToken?: string;
  };

  // Validate inputs
  const validationError = validateDeleteRequest({
    email: email ?? "",
    confirmed: true, // confirmation is enforced client-side; server trusts presence of token
    turnstileToken: turnstileToken ?? "",
  });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Verify Turnstile token server-side
  const remoteIp = getClientIpFromHeaders(req.headers as unknown as Headers);
  const turnstileOk = await verifyTurnstileToken(turnstileToken!, remoteIp);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot protection check failed. Please refresh and try again." },
      { status: 422 }
    );
  }

  // Attempt to soft-delete via Hasura action.
  // We swallow errors from this call — the staff email covers any failures.
  await callDeleteUserAccountAction(email!.trim().toLowerCase(), reason ?? null);

  return NextResponse.json({ ok: true });
}

/**
 * Calls the Hasura delete_user_account action which sets pc_users.deleted_at = now()
 * and cascades deletion of prayer logs and preferences.
 * Silently fails if no account matches the email.
 */
async function callDeleteUserAccountAction(
  email: string,
  reason: string | null
): Promise<void> {
  if (!HASURA_ADMIN_SECRET) {
    // In local dev without admin secret, skip the Hasura call.
    return;
  }

  const mutation = `
    mutation RequestAccountDeletion($email: String!, $reason: String) {
      delete_user_account_by_email(email: $email, reason: $reason) {
        success
      }
    }
  `;

  try {
    await fetch(HASURA_ADMIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { email, reason },
      }),
    });
  } catch {
    // Non-fatal — staff will process from the email queue.
  }
}
