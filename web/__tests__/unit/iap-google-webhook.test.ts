/**
 * T07 — Google IAP RTDN webhook tests.
 *
 * Verifies the Pub/Sub push handler for subscription lifecycle events:
 *   - Admin secret guard (returns 500 when missing)
 *   - JWT verification skip in test mode (GOOGLE_PUBSUB_VERIFY=false)
 *   - Audience env var guard
 *   - Authorization header requirement
 *   - Body validation (missing message.data)
 *   - Test notification is silently acknowledged
 *   - Subscription lifecycle events are forwarded to Hasura
 *   - Correct status mapping (notificationType → status string)
 *   - Hasura 500 returns 500 so Pub/Sub retries
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper: encode a DeveloperNotification payload to base64 as Pub/Sub would.
function makePubSubBody(
  notification: Record<string, unknown>,
  messageId = "msg-001"
): Record<string, unknown> {
  const data = Buffer.from(JSON.stringify(notification)).toString("base64");
  return { message: { data, messageId } };
}

// Helper: build a subscription notification object.
function makeSubNotification(
  notificationType: number,
  purchaseToken = "tok-abc",
  subscriptionId = "com.praycalc.premium.yearly"
): Record<string, unknown> {
  return {
    version: "1.0",
    packageName: "com.praycalc.app",
    eventTimeMillis: "1716000000000",
    subscriptionNotification: {
      version: "1.0",
      notificationType,
      purchaseToken,
      subscriptionId,
    },
  };
}

// Skip JWT verification for all tests.
const TEST_ENV = {
  GOOGLE_PUBSUB_VERIFY: "false",
};

describe("Google IAP webhook — T07", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...TEST_ENV };
    mockFetch.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ── Admin secret guard ─────────────────────────────────────────────────────

  it("returns 500 when HASURA_GRAPHQL_ADMIN_SECRET is missing", async () => {
    delete process.env.HASURA_GRAPHQL_ADMIN_SECRET;

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const body = makePubSubBody(makeSubNotification(2));
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/configuration/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 500 when HASURA_GRAPHQL_ADMIN_SECRET is empty string", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "";

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const body = makePubSubBody(makeSubNotification(2));
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── JWT verification mode ──────────────────────────────────────────────────

  it("returns 500 when GOOGLE_PUBSUB_AUDIENCE is missing (verification enabled)", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";
    delete process.env.GOOGLE_PUBSUB_VERIFY; // enable verification
    delete process.env.GOOGLE_PUBSUB_AUDIENCE;

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake.jwt.token",
      },
      body: JSON.stringify(makePubSubBody(makeSubNotification(2))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header is missing (verification enabled)", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";
    process.env.GOOGLE_PUBSUB_AUDIENCE = "https://praycalc.com/api/iap/google/webhook";
    delete process.env.GOOGLE_PUBSUB_VERIFY;

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(2))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  // ── Body validation ─────────────────────────────────────────────────────────

  it("returns 400 when body is not valid JSON", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 when message.data is missing", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: { messageId: "123" } }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  // ── Test notification handling ─────────────────────────────────────────────

  it("acknowledges test notification without calling Hasura", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const body = makePubSubBody({ testNotification: { version: "1.0" } });
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── Subscription lifecycle events → Hasura update ─────────────────────────

  it("forwards SUBSCRIPTION_RENEWED (type=2) with status=active to Hasura", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          update_google_iap_status: { success: true, userId: "user-001" },
        },
      }),
    });

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(2))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledOnce();

    const callArgs = mockFetch.mock.calls[0];
    const callHeaders = callArgs[1]?.headers ?? {};
    expect(callHeaders["x-hasura-admin-secret"]).toBe("admin-secret");

    const body = JSON.parse(callArgs[1]?.body as string) as {
      variables: { status: string; notificationType: number };
    };
    expect(body.variables.status).toBe("active");
    expect(body.variables.notificationType).toBe(2);
    expect(body.variables).toMatchObject({ purchaseToken: "tok-abc" });
  });

  it("forwards SUBSCRIPTION_EXPIRED (type=13) with status=expired to Hasura", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { update_google_iap_status: { success: true, userId: "user-001" } },
      }),
    });

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(13))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string) as {
      variables: { status: string };
    };
    expect(body.variables.status).toBe("expired");
  });

  it("forwards SUBSCRIPTION_REVOKED (type=12) with status=revoked to Hasura", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { update_google_iap_status: { success: true, userId: "user-001" } },
      }),
    });

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(12))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string) as {
      variables: { status: string };
    };
    expect(body.variables.status).toBe("revoked");
  });

  it("forwards SUBSCRIPTION_ON_HOLD (type=5) with status=on_hold to Hasura", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { update_google_iap_status: { success: true, userId: "user-001" } },
      }),
    });

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(5))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string) as {
      variables: { status: string };
    };
    expect(body.variables.status).toBe("on_hold");
  });

  it("forwards SUBSCRIPTION_PAUSED (type=10) with status=paused to Hasura", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { update_google_iap_status: { success: true, userId: "user-001" } },
      }),
    });

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(10))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string) as {
      variables: { status: string };
    };
    expect(body.variables.status).toBe("paused");
  });

  // ── Hasura failure → 500 so Pub/Sub retries ───────────────────────────────

  it("returns 500 when Hasura returns an error (so Pub/Sub retries)", async () => {
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "admin-secret";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        errors: [{ message: "Action not found" }],
      }),
    });

    const { POST } = await import("@/app/api/iap/google/webhook/route");
    const req = new Request("http://localhost/api/iap/google/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePubSubBody(makeSubNotification(2))),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});
