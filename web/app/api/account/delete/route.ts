import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, ACCOUNT_API } from "@/lib/rate-limit";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.ummat.dev";

/**
 * POST /api/account/delete
 *
 * Deletes the authenticated user's account via Hasura Auth.
 * The client sends the access token in the Authorization header.
 * Hasura Auth DELETE /user removes the account and all associated data.
 */
export async function POST(req: Request) {
  const rl = await checkRateLimit(`account:${getClientIp(req.headers as unknown as Headers)}`, ACCOUNT_API);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${AUTH_URL}/user`, {
    method: "DELETE",
    headers: {
      Authorization: authHeader,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message || "Failed to delete account.";
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
