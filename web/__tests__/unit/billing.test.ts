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
    const status = await getBillingStatus("token-1");
    expect(status.plan).toBe("plus");
    expect(status.isActive).toBe(true);
  });

  it("sends a Bearer auth header", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ plan: "free", status: "none", isActive: false, expiresAt: null, currentPeriodEnd: null }),
    );
    await getBillingStatus("token-abc");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/status"),
      expect.objectContaining({ headers: { Authorization: "Bearer token-abc" } }),
    );
  });

  it("falls back to free plan on non-2xx (never throws)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 500));
    const status = await getBillingStatus("token-1");
    expect(status.plan).toBe("free");
    expect(status.isActive).toBe(false);
  });

  it("falls back to free plan on network error (never throws)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const status = await getBillingStatus("token-1");
    expect(status.plan).toBe("free");
  });
});

describe("startCheckout", () => {
  it("returns ok:true with the checkout URL on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ url: "https://checkout.stripe.com/session/123" }),
    );
    const result = await startCheckout("token-1");
    expect(result).toEqual({ ok: true, url: "https://checkout.stripe.com/session/123" });
  });

  it("returns ok:false on non-2xx (no throw)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 503));
    const result = await startCheckout("token-1");
    expect(result).toEqual({ ok: false });
  });

  it("returns ok:false on network error (no throw)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await startCheckout("token-1");
    expect(result).toEqual({ ok: false });
  });

  it("returns ok:false when the response body has no url", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}));
    const result = await startCheckout("token-1");
    expect(result).toEqual({ ok: false });
  });
});

describe("isBillingDisabled", () => {
  it("returns a boolean without throwing", () => {
    expect(typeof isBillingDisabled()).toBe("boolean");
  });
});
