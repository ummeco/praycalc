import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// We test the route handlers by importing them and calling with mock NextRequest
// Since Next.js route handlers are just functions, we can test them directly.

describe("Billing API Routes", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("POST /api/billing/checkout", () => {
    it("proxies checkout request to smart service", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.stripe.com/session123" }),
      });

      const { POST } = await import("@/app/api/billing/checkout/route");
      const req = new Request("http://localhost/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(data.url).toBe("https://checkout.stripe.com/session123");
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch.mock.calls[0][0]).toContain("/billing/checkout");
    });

    it("returns 503 when smart service is unavailable", async () => {
      mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const { POST } = await import("@/app/api/billing/checkout/route");
      const req = new Request("http://localhost/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(503);

      const data = await res.json();
      expect(data.error).toContain("not available");
    });

    it("forwards non-200 status from smart service", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Stripe not configured" }),
      });

      const { POST } = await import("@/app/api/billing/checkout/route");
      const req = new Request("http://localhost/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(503); // 500 from backend → 503 to client
    });
  });

  describe("POST /api/billing/portal", () => {
    it("proxies portal request to smart service", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://billing.stripe.com/portal123" }),
      });

      const { POST } = await import("@/app/api/billing/portal/route");
      const req = new Request("http://localhost/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(data.url).toBe("https://billing.stripe.com/portal123");
    });

    it("forwards auth header to smart service", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://billing.stripe.com/portal" }),
      });

      const { POST } = await import("@/app/api/billing/portal/route");
      const req = new Request("http://localhost/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer my-jwt-token",
        },
      });

      await POST(req as any);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe("Bearer my-jwt-token");
    });

    it("returns 503 when service unavailable", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { POST } = await import("@/app/api/billing/portal/route");
      const req = new Request("http://localhost/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req as any);
      expect(res.status).toBe(503);
    });

    it("returns 404 when no subscription found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "No subscription found" }),
      });

      const { POST } = await import("@/app/api/billing/portal/route");
      const req = new Request("http://localhost/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req as any);
      expect(res.status).toBe(404);
    });
  });
});
