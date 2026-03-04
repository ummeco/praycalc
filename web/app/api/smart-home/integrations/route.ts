import { type NextRequest, NextResponse } from "next/server";

const SMART_SERVICE_URL =
  process.env.SMART_SERVICE_URL || "http://localhost:4010";

/**
 * Extract auth token from the request. Checks Authorization header first,
 * then falls back to the session cookie.
 */
function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fall back to session cookie (set by Hasura Auth)
  return req.cookies.get("nhostSession")?.value ?? null;
}

function buildHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * GET /api/smart-home/integrations
 * Lists the user's connected smart home integrations.
 */
export async function GET(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/integrations`, {
      method: "GET",
      headers: buildHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to fetch integrations" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: "Smart home service is currently unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}

/**
 * POST /api/smart-home/integrations
 * Link or unlink an integration.
 * Body: { action: "link" | "unlink", platform: string, ... }
 */
export async function POST(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/integrations`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to update integration" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: "Smart home service is currently unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
