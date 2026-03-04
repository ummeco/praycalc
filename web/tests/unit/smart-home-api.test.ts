import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock fetch globally to simulate the smart service
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper to build a NextRequest with the right structure
function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    token?: string;
    cookie?: string;
  } = {}
): NextRequest {
  const { method = "GET", body, token, cookie } = options;
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (cookie) {
    headers.set("Cookie", `nhostSession=${cookie}`);
  }

  const init: RequestInit = { method, headers };
  if (body) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

// ---------------------------------------------------------------------------
// Integrations route tests
// ---------------------------------------------------------------------------
describe("GET /api/smart-home/integrations", () => {
  let handler: typeof import("@/app/api/smart-home/integrations/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/integrations/route");
  });

  it("returns 401 when no auth token is provided", async () => {
    const req = makeRequest("http://localhost:3000/api/smart-home/integrations");
    const res = await handler.GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Authentication required");
  });

  it("forwards auth token and returns integrations from smart service", async () => {
    const integrations = [
      { platform: "google-home", connected: true, lastSynced: "2026-03-01T00:00:00Z" },
      { platform: "alexa", connected: false, lastSynced: null },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ integrations }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/integrations",
      { token: "test-jwt-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.integrations).toHaveLength(2);
    expect(data.integrations[0].platform).toBe("google-home");

    // Verify the fetch was called with correct auth header
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/integrations");
    expect(opts.headers.Authorization).toBe("Bearer test-jwt-token");
  });

  it("returns 503 when smart service is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/integrations",
      { token: "test-jwt-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(503);

    const data = await res.json();
    expect(data.error).toContain("unavailable");
  });

  it("forwards error status from smart service", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal server error" }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/integrations",
      { token: "test-jwt-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/smart-home/integrations", () => {
  let handler: typeof import("@/app/api/smart-home/integrations/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/integrations/route");
  });

  it("returns 401 without auth", async () => {
    const req = makeRequest(
      "http://localhost:3000/api/smart-home/integrations",
      { method: "POST", body: { action: "unlink", platform: "google-home" } }
    );
    const res = await handler.POST(req);
    expect(res.status).toBe(401);
  });

  it("forwards unlink request to smart service", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/integrations",
      {
        method: "POST",
        body: { action: "unlink", platform: "alexa" },
        token: "test-token",
      }
    );
    const res = await handler.POST(req);
    expect(res.status).toBe(200);

    const [, opts] = mockFetch.mock.calls[0];
    const sentBody = JSON.parse(opts.body);
    expect(sentBody.action).toBe("unlink");
    expect(sentBody.platform).toBe("alexa");
  });
});

// ---------------------------------------------------------------------------
// Webhooks route tests
// ---------------------------------------------------------------------------
describe("GET /api/smart-home/webhooks", () => {
  let handler: typeof import("@/app/api/smart-home/webhooks/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/webhooks/route");
  });

  it("returns 401 without auth", async () => {
    const req = makeRequest("http://localhost:3000/api/smart-home/webhooks");
    const res = await handler.GET(req);
    expect(res.status).toBe(401);
  });

  it("returns webhook list from smart service", async () => {
    const webhooks = [
      {
        id: "wh-1",
        callbackUrl: "https://example.com/hook",
        events: ["adhan"],
        lat: 40.71,
        lng: -74.0,
        active: true,
        createdAt: "2026-03-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ webhooks }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks",
      { token: "test-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.webhooks).toHaveLength(1);
    expect(data.webhooks[0].callbackUrl).toBe("https://example.com/hook");
  });

  it("returns 503 when smart service is down", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks",
      { token: "test-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(503);
  });
});

describe("POST /api/smart-home/webhooks", () => {
  let handler: typeof import("@/app/api/smart-home/webhooks/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/webhooks/route");
  });

  it("creates a webhook and returns 201", async () => {
    const newWebhook = {
      id: "wh-new",
      callbackUrl: "https://example.com/new",
      events: ["adhan", "iqamah"],
      lat: 33.44,
      lng: -112.07,
      active: true,
      createdAt: "2026-03-04T00:00:00Z",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newWebhook,
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks",
      {
        method: "POST",
        body: {
          callbackUrl: "https://example.com/new",
          events: ["adhan", "iqamah"],
          lat: 33.44,
          lng: -112.07,
        },
        token: "test-token",
      }
    );
    const res = await handler.POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.id).toBe("wh-new");
  });

  it("forwards 409 when max webhooks reached", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        error: "Maximum webhooks reached",
        message: "Maximum 5 webhooks per user",
      }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks",
      {
        method: "POST",
        body: {
          callbackUrl: "https://example.com/hook",
          events: ["adhan"],
          lat: 40.71,
          lng: -74.0,
        },
        token: "test-token",
      }
    );
    const res = await handler.POST(req);
    expect(res.status).toBe(409);

    const data = await res.json();
    expect(data.error).toContain("Maximum");
  });
});

describe("DELETE /api/smart-home/webhooks", () => {
  let handler: typeof import("@/app/api/smart-home/webhooks/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/webhooks/route");
  });

  it("returns 400 when no id is provided", async () => {
    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks",
      { method: "DELETE", token: "test-token" }
    );
    const res = await handler.DELETE(req);
    expect(res.status).toBe(400);
  });

  it("deletes a webhook and returns 204", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks?id=wh-1",
      { method: "DELETE", token: "test-token" }
    );
    const res = await handler.DELETE(req);
    expect(res.status).toBe(204);

    // Verify the ID was passed in the URL
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/webhooks/wh-1");
  });

  it("returns 404 when webhook not found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Webhook not found" }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks?id=nonexistent",
      { method: "DELETE", token: "test-token" }
    );
    const res = await handler.DELETE(req);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/smart-home/webhooks (test action)", () => {
  let handler: typeof import("@/app/api/smart-home/webhooks/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/webhooks/route");
  });

  it("sends a test payload and returns success message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Test sent" }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/webhooks",
      {
        method: "PUT",
        body: { action: "test", id: "wh-1" },
        token: "test-token",
      }
    );
    const res = await handler.PUT(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toContain("Test payload sent");

    // Verify test endpoint was called
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/webhooks/wh-1/test");
    expect(opts.method).toBe("POST");
  });
});

// ---------------------------------------------------------------------------
// Devices route tests
// ---------------------------------------------------------------------------
describe("GET /api/smart-home/devices", () => {
  let handler: typeof import("@/app/api/smart-home/devices/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/devices/route");
  });

  it("returns 401 without auth", async () => {
    const req = makeRequest("http://localhost:3000/api/smart-home/devices");
    const res = await handler.GET(req);
    expect(res.status).toBe(401);
  });

  it("returns device list", async () => {
    const devices = [
      {
        id: "dev-1",
        name: "Living Room TV",
        type: "tv",
        online: true,
        lastSeen: "2026-03-04T12:00:00Z",
        pairedAt: "2026-03-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ devices }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/devices",
      { token: "test-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.devices).toHaveLength(1);
    expect(data.devices[0].name).toBe("Living Room TV");
  });

  it("returns 503 when smart service is down", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/devices",
      { token: "test-token" }
    );
    const res = await handler.GET(req);
    expect(res.status).toBe(503);
  });
});

describe("POST /api/smart-home/devices (generate code)", () => {
  let handler: typeof import("@/app/api/smart-home/devices/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/devices/route");
  });

  it("generates a pairing code", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: "A1B2C3", expiresIn: 300 }),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/devices",
      {
        method: "POST",
        body: { action: "generate-code" },
        token: "test-token",
      }
    );
    const res = await handler.POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.code).toBe("A1B2C3");
    expect(data.expiresIn).toBe(300);

    // Verify the pair-code endpoint was called
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/devices/pair-code");
  });
});

describe("DELETE /api/smart-home/devices", () => {
  let handler: typeof import("@/app/api/smart-home/devices/route");

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    handler = await import("@/app/api/smart-home/devices/route");
  });

  it("returns 400 when no id is provided", async () => {
    const req = makeRequest(
      "http://localhost:3000/api/smart-home/devices",
      { method: "DELETE", token: "test-token" }
    );
    const res = await handler.DELETE(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Device ID required");
  });

  it("unpairs a device and returns 204", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    const req = makeRequest(
      "http://localhost:3000/api/smart-home/devices?id=dev-1",
      { method: "DELETE", token: "test-token" }
    );
    const res = await handler.DELETE(req);
    expect(res.status).toBe(204);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/devices/dev-1");
  });
});
