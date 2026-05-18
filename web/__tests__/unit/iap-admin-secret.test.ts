/**
 * T03 — IAP route admin-secret guard tests.
 *
 * Verifies that both Apple and Google IAP validate routes return HTTP 500
 * when HASURA_GRAPHQL_ADMIN_SECRET is missing or empty, rather than
 * silently forwarding requests with an empty-string admin secret.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper: valid-looking Apple JWS (three base64url segments; payload claims
// Production environment so it passes the sandbox check in non-sandbox mode).
function makeAppleJws(env: "Production" | "Sandbox" = "Production"): string {
  const header  = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    productId:             "com.praycalc.premium.yearly",
    originalTransactionId: "100000123456789",
    transactionId:         "100000987654321",
    purchaseDate:          Date.now(),
    expiresDate:           Date.now() + 365 * 24 * 60 * 60 * 1000,
    appAccountToken:       "00000000-0000-0000-0000-000000000001",
    environment:           env,
    type:                  "Auto-Renewable Subscription",
  })).toString("base64url");
  const sig = Buffer.from("fakesig").toString("base64url");
  return `${header}.${payload}.${sig}`;
}

describe("Apple IAP route — T03 admin secret guard", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockFetch.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 500 when HASURA_GRAPHQL_ADMIN_SECRET is missing", async () => {
    delete process.env.HASURA_GRAPHQL_ADMIN_SECRET;
    // Ensure sandbox mode so the JWS environment check passes
    process.env.APPLE_IAP_SANDBOX = "true";

    const { POST } = await import("@/app/api/iap/apple/validate/route");
    const req = new Request("http://localhost/api/iap/apple/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jwsTransaction: makeAppleJws("Sandbox"),
        userId:         "00000000-0000-0000-0000-000000000001",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/configuration/i);
    // Hasura must NOT have been called with an empty secret
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 500 when HASURA_GRAPHQL_ADMIN_SECRET is an empty string", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "";
    process.env.APPLE_IAP_SANDBOX = "true";

    const { POST } = await import("@/app/api/iap/apple/validate/route");
    const req = new Request("http://localhost/api/iap/apple/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jwsTransaction: makeAppleJws("Sandbox"),
        userId:         "00000000-0000-0000-0000-000000000001",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("proceeds to Hasura call when HASURA_GRAPHQL_ADMIN_SECRET is set", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "test-admin-secret";
    process.env.APPLE_IAP_SANDBOX = "true";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sync_apple_iap: {
            success: true,
            expiresAt: "2027-01-01T00:00:00.000Z",
          },
        },
      }),
    });

    const { POST } = await import("@/app/api/iap/apple/validate/route");
    const req = new Request("http://localhost/api/iap/apple/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jwsTransaction: makeAppleJws("Sandbox"),
        userId:         "00000000-0000-0000-0000-000000000001",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledOnce();
    // Verify the admin secret was forwarded correctly
    const callHeaders = mockFetch.mock.calls[0][1]?.headers ?? {};
    expect(callHeaders["x-hasura-admin-secret"]).toBe("test-admin-secret");
  });
});

describe("Google IAP route — T03 admin secret guard", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockFetch.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 500 when HASURA_GRAPHQL_ADMIN_SECRET is missing", async () => {
    delete process.env.HASURA_GRAPHQL_ADMIN_SECRET;
    process.env.GOOGLE_IAP_SANDBOX = "true"; // sandbox mode: skips Play API call

    const { POST } = await import("@/app/api/iap/google/validate/route");
    const req = new Request("http://localhost/api/iap/google/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purchaseToken: "fake-purchase-token",
        productId:     "com.praycalc.premium.yearly",
        userId:        "00000000-0000-0000-0000-000000000001",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/configuration/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 500 when HASURA_GRAPHQL_ADMIN_SECRET is empty string", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "";
    process.env.GOOGLE_IAP_SANDBOX = "true";

    const { POST } = await import("@/app/api/iap/google/validate/route");
    const req = new Request("http://localhost/api/iap/google/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purchaseToken: "fake-purchase-token",
        productId:     "com.praycalc.premium.yearly",
        userId:        "00000000-0000-0000-0000-000000000001",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("proceeds to Hasura call when HASURA_GRAPHQL_ADMIN_SECRET is set (sandbox mode)", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "test-admin-secret";
    process.env.GOOGLE_IAP_SANDBOX = "true";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sync_google_iap: {
            success: true,
            expiresAt: "2027-01-01T00:00:00.000Z",
          },
        },
      }),
    });

    const { POST } = await import("@/app/api/iap/google/validate/route");
    const req = new Request("http://localhost/api/iap/google/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purchaseToken: "fake-purchase-token",
        productId:     "com.praycalc.premium.yearly",
        userId:        "00000000-0000-0000-0000-000000000001",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledOnce();
    const callHeaders = mockFetch.mock.calls[0][1]?.headers ?? {};
    expect(callHeaders["x-hasura-admin-secret"]).toBe("test-admin-secret");
  });
});
