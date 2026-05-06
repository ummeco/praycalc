/**
 * /account/delete — helper functions
 *
 * Validates request inputs and verifies Cloudflare Turnstile tokens
 * before the deletion request is processed server-side.
 */

/** Turnstile verification endpoint. */
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

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
