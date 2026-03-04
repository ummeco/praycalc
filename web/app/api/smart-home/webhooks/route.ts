import { type NextRequest, NextResponse } from "next/server";

const SMART_SERVICE_URL =
  process.env.SMART_SERVICE_URL || "http://localhost:4010";

function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
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
 * GET /api/smart-home/webhooks
 * List the user's webhook registrations.
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
    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/webhooks`, {
      method: "GET",
      headers: buildHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to fetch webhooks" },
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
 * POST /api/smart-home/webhooks
 * Register a new webhook.
 * Body: { callbackUrl, events, lat, lng }
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

    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/webhooks`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to create webhook" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
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
 * PUT /api/smart-home/webhooks
 * Update a webhook or send a test payload.
 * Body: { action: "test", id } or { id, callbackUrl, events, lat, lng }
 */
export async function PUT(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (body.action === "test" && body.id) {
      // Send a test payload
      const res = await fetch(
        `${SMART_SERVICE_URL}/api/v1/webhooks/${body.id}/test`,
        {
          method: "POST",
          headers: buildHeaders(token),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: data.error || "Test failed",
            message: data.message || "Could not send test payload.",
          },
          { status: res.status }
        );
      }

      return NextResponse.json({ message: "Test payload sent successfully." });
    }

    // Regular update
    const res = await fetch(
      `${SMART_SERVICE_URL}/api/v1/webhooks/${body.id}`,
      {
        method: "PUT",
        headers: buildHeaders(token),
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to update webhook" },
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
 * DELETE /api/smart-home/webhooks?id=xxx
 * Delete a webhook registration.
 */
export async function DELETE(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Webhook ID required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/webhooks/${id}`, {
      method: "DELETE",
      headers: buildHeaders(token),
    });

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to delete webhook" },
        { status: res.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      {
        error: "Smart home service is currently unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
