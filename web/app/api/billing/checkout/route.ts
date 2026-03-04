import { NextRequest, NextResponse } from "next/server";

const SMART_SERVICE_URL =
  process.env.SMART_SERVICE_URL || "http://localhost:4010";

/**
 * POST /api/billing/checkout
 *
 * Proxies checkout session creation to the smart service billing endpoint.
 * If Stripe is not configured (no STRIPE_SECRET_KEY on smart service),
 * the smart service will return a 500, which we surface as a 503.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization") || "";

    const response = await fetch(`${SMART_SERVICE_URL}/billing/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ email: body.email || "" }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Checkout unavailable" },
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
