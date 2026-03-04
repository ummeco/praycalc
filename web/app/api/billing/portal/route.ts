import { NextRequest, NextResponse } from "next/server";

const SMART_SERVICE_URL =
  process.env.SMART_SERVICE_URL || "http://localhost:4010";

/**
 * POST /api/billing/portal
 *
 * Proxies Stripe Customer Portal session creation to the smart service.
 * Users with an active subscription can manage billing here.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";

    const response = await fetch(`${SMART_SERVICE_URL}/billing/portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: "{}",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Portal unavailable" },
        { status: response.status >= 500 ? 503 : response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Billing service is not available. Please try again later." },
      { status: 503 },
    );
  }
}
