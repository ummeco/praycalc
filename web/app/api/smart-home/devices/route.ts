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
 * GET /api/smart-home/devices
 * List paired devices.
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
    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/devices`, {
      method: "GET",
      headers: buildHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to fetch devices" },
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
 * POST /api/smart-home/devices
 * Pair a device or generate a pairing code.
 * Body: { action: "generate-code" } or { action: "pair", code, deviceName, deviceType }
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

    if (body.action === "generate-code") {
      const res = await fetch(
        `${SMART_SERVICE_URL}/api/v1/devices/pair-code`,
        {
          method: "POST",
          headers: buildHeaders(token),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: data.error || "Failed to generate pairing code" },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Regular pair
    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/devices`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to pair device" },
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
 * DELETE /api/smart-home/devices?id=xxx
 * Unpair a device.
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
      { error: "Device ID required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${SMART_SERVICE_URL}/api/v1/devices/${id}`, {
      method: "DELETE",
      headers: buildHeaders(token),
    });

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to unpair device" },
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
