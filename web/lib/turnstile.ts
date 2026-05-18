// lib/turnstile.ts — T09 (SEC-HARDENING)
// Local Turnstile verifier for PrayCalc.
// Cannot import @ummat/* packages — PrayCalc is a separate repo.
// Fail-closed in production; passes through in dev when secret key is missing.

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY ?? ''

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    // Dev/test: no secret key configured — pass through.
    // Production: fail-closed (caller checks NODE_ENV).
    return false
  }

  if (!token) return false

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
        }).toString(),
      },
    )
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
