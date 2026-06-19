/**
 * /account/delete — helper functions
 *
 * Validates request inputs, verifies Cloudflare Turnstile tokens, and mints/
 * verifies the server-side HMAC confirmation token that gates the destructive
 * delete. Turnstile alone is replayable (P2-E1-W01 Track E extended / QA-C):
 * the destructive Hasura action MUST additionally require a valid, unexpired,
 * email-bound HMAC token issued by this server.
 */

import { createHmac, timingSafeEqual } from "crypto";

/** Turnstile verification endpoint. */
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Confirmation-token lifetime: 30 minutes. */
const CONFIRM_TTL_MS = 30 * 60 * 1000;

/** Normalize an email for stable HMAC binding. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Mints a time-limited HMAC confirmation token bound to the email.
 * Token format: base64url("<expiresAtMs>.<hex-hmac-sha256(email|expiresAtMs)>").
 * Throws (fail-closed) if DELETE_CONFIRM_SECRET is not configured — a missing
 * secret must never silently downgrade to an unauthenticated delete.
 */
export function mintDeleteConfirmToken(
  email: string,
  now: number = Date.now()
): string {
  const secret = process.env.DELETE_CONFIRM_SECRET;
  if (!secret) {
    throw new Error("DELETE_CONFIRM_SECRET is not configured");
  }
  const expiresAt = now + CONFIRM_TTL_MS;
  const sig = createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}|${expiresAt}`)
    .digest("hex");
  return Buffer.from(`${expiresAt}.${sig}`).toString("base64url");
}

/**
 * Verifies an HMAC confirmation token against the email. Fail-closed:
 * returns false on missing secret, missing/garbled token, expiry, or any
 * signature mismatch. Uses crypto.timingSafeEqual to avoid timing leaks.
 */
export function verifyDeleteConfirmToken(
  email: string,
  token: string | undefined | null,
  now: number = Date.now()
): boolean {
  const secret = process.env.DELETE_CONFIRM_SECRET;
  if (!secret || !token) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const sep = decoded.indexOf(".");
  if (sep === -1) return false;

  const expiresAt = Number(decoded.slice(0, sep));
  const providedSig = decoded.slice(sep + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false;

  const expectedSig = createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}|${expiresAt}`)
    .digest("hex");

  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Validates a deletion request form submission.
 * Returns an error string if invalid, or null if valid.
 */
export function validateDeleteRequest(input: {
  email: string;
  confirmed: boolean;
  turnstileToken: string;
}): string | null {
  const { email, confirmed, turnstileToken } = input;

  if (!email || typeof email !== "string") {
    return "Email address is required.";
  }

  // RFC 5322-derived simple format check (server-side validation complement)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.trim())) {
    return "Please enter a valid email address.";
  }

  if (!confirmed) {
    return "Please confirm that you understand deletion is permanent.";
  }

  if (!turnstileToken || typeof turnstileToken !== "string") {
    return "Bot protection token is required. Please refresh the page.";
  }

  return null;
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if the token is valid.
 *
 * In environments without TURNSTILE_SECRET_KEY, verification is
 * skipped and the function returns true. This allows local development
 * without Turnstile credentials configured.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Allow bypass in development / test environments where secret is absent.
  if (!secret) {
    return true;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
    });

    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * Extracts the client IP address from request headers.
 * Prefers x-forwarded-for (Vercel / Cloudflare proxy), falls back to x-real-ip.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip") ?? "unknown";
}
