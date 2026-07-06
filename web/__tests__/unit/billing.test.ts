import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getBillingStatus, startCheckout, isBillingDisabled } from "@/lib/billing";

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 400) {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// getBillingStatus/startCheckout now call PrayCalc's own same-origin
// /api/billing/* proxy routes, which hold the access token in an httpOnly
// cookie server-side (ADR-010 fix) — no token argument is passed from here.

describe("getBillingStatus", () => {
  it("returns the parsed status on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        plan: "plus",
        status: "active",
        isActive: true,
        expiresAt: "2027-01-01",
        currentPeriodEnd: "2027-01-01",
      }),
    );
    const status = await getBillingStatus();
    expect(status.plan).toBe("plus");
    expect(status.isActive).toBe(true);
  });

  it("calls the same-origin proxy route with credentials", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ plan: "free", status: "none", isActive: false, expiresAt: null, currentPeriodEnd: null }),
    );
    await getBillingStatus();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/billing/status",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("falls back to free plan on non-2xx (never throws)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 500));
    const status = await getBillingStatus();
    expect(status.plan).toBe("free");
    expect(status.isActive).toBe(false);
  });

  it("falls back to free plan on network error (never throws)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const status = await getBillingStatus();
    expect(status.plan).toBe("free");
  });
});

describe("startCheckout", () => {
  it("returns ok:true with the checkout URL on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ ok: true, url: "https://checkout.stripe.com/session/123" }),
    );
    const result = await startCheckout();
    expect(result).toEqual({ ok: true, url: "https://checkout.stripe.com/session/123" });
  });

  it("posts to the same-origin proxy route with credentials", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(jsonResponse({ ok: true, url: "https://checkout.stripe.com/session/1" }));
    await startCheckout();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/billing/checkout",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
  });

  it("returns ok:false on non-2xx (no throw)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 503));
    const result = await startCheckout();
    expect(result).toEqual({ ok: false });
  });

  it("returns ok:false on network error (no throw)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await startCheckout();
    expect(result).toEqual({ ok: false });
  });

  it("returns ok:false when the response body reports failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({ ok: false }));
    const result = await startCheckout();
    expect(result).toEqual({ ok: false });
  });
});

describe("isBillingDisabled", () => {
  it("returns a boolean without throwing", () => {
    expect(typeof isBillingDisabled()).toBe("boolean");
  });
});
