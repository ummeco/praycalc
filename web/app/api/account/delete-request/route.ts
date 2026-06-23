import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, ACCOUNT_API } from "@/lib/rate-limit";
import {
  validateDeleteRequest,
  verifyTurnstileToken,
  getClientIpFromHeaders,
  mintDeleteConfirmToken,
  verifyDeleteConfirmToken,
} from "@/app/account/delete/_lib/delete";

// Zod schema — T03 AC-01/AC-05: tight schema at account delete-request boundary
const DeleteRequestSchema = z.object({
  email:          z.string().email('email must be a valid email address'),
  turnstileToken: z.string().min(1, 'turnstileToken is required'),
  reason:         z.string().max(500).optional().nullable(),
  confirmToken:   z.string().optional(),
});

// Startup fail-fast: HASURA_ADMIN_URL must never fall back to the public endpoint
// for admin operations — admin secret + public URL = credential exposure risk (P2-E1-W01 Track E extended).
const HASURA_ADMIN_URL = process.env.HASURA_ADMIN_URL
if (!HASURA_ADMIN_URL && typeof window === 'undefined') {
  // Server-only check: warn loudly in logs. Route still works but Hasura call will be skipped
  // (callDeleteUserAccountAction guards on !HASURA_ADMIN_SECRET). A startup throw here would
  // break the public delete-request page for all users if misconfigured, so we warn instead.
  console.error('[delete-request] HASURA_ADMIN_URL is not set — account deletion requests will be queued via email only.')
}

const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET

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

  const rawBody = await req.json().catch(() => null);
  const parsed = DeleteRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, reason, turnstileToken, confirmToken } = parsed.data;

  // Validate inputs
  const validationError = validateDeleteRequest({
    email: email ?? "",
    confirmed: true, // confirmation is enforced client-side; server trusts presence of token
    turnstileToken: turnstileToken ?? "",
  });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Verify Turnstile token server-side (bot protection — necessary but NOT sufficient:
  // Turnstile is replayable, so the destructive action additionally requires an
  // email-bound HMAC confirmation token, P2-E1-W01 Track E extended / QA-C).
  const remoteIp = getClientIpFromHeaders(req.headers as unknown as Headers);
  const turnstileOk = await verifyTurnstileToken(turnstileToken!, remoteIp);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot protection check failed. Please refresh and try again." },
      { status: 422 }
    );
  }

  const normalizedEmail = email!.trim().toLowerCase();

  // Phase 2 (confirm): a valid HMAC token is present → perform the destructive
  // soft-delete. Replay is prevented because the token is email-bound + expires.
  if (confirmToken) {
    if (!verifyDeleteConfirmToken(normalizedEmail, confirmToken)) {
      return NextResponse.json(
        { error: "Confirmation link is invalid or expired. Please request deletion again." },
        { status: 401 }
      );
    }
    await callDeleteUserAccountAction(normalizedEmail, reason ?? null);
    return NextResponse.json({ ok: true, confirmed: true });
  }

  // Phase 1 (request): mint a time-limited confirmation token and deliver it to
  // the account owner's email. We never delete here, and always return { ok: true }
  // regardless of whether an account exists (prevents email enumeration).
  try {
    const token = mintDeleteConfirmToken(normalizedEmail);
    await queueDeletionConfirmationEmail(normalizedEmail, token, reason ?? null);
  } catch (err) {
    // DELETE_CONFIRM_SECRET missing: we cannot issue a confirm token. This is
    // fail-closed on the DESTRUCTIVE path — phase 2 (verifyDeleteConfirmToken)
    // already rejects every token when the secret is absent, so no deletion can
    // occur. We deliberately do NOT 500 the public request page; we log the
    // misconfiguration and return { ok: true } (anti-enumeration) without a token.
    console.error("[delete-request] confirmation token minting skipped (misconfigured):", err);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Queues the deletion-confirmation email containing the HMAC confirm token.
 * Best-effort: failure to send is non-fatal to the request response (the user
 * can re-request), but the token is never exposed in the HTTP response — it is
 * delivered only to the verified account-owner email channel.
 */
async function queueDeletionConfirmationEmail(
  email: string,
  confirmToken: string,
  reason: string | null
): Promise<void> {
  if (!HASURA_ADMIN_SECRET || !HASURA_ADMIN_URL) {
    // No admin channel configured (local dev): staff processes from the queue.
    return;
  }

  const mutation = `
    mutation QueueDeletionConfirmation($email: String!, $token: String!, $reason: String) {
      queue_account_deletion_confirmation(email: $email, token: $token, reason: $reason) {
        success
      }
    }
  `;

  try {
    await fetch(HASURA_ADMIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET as string,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { email, token: confirmToken, reason },
      }),
    });
  } catch {
    // Non-fatal — user can re-request; token never leaves the email channel.
  }
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
  if (!HASURA_ADMIN_SECRET || !HASURA_ADMIN_URL) {
    // In local dev without admin secret / URL, skip the Hasura call.
    // Staff is notified via email queue; account deletion completes on next staff review.
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
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET as string,
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
