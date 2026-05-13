/**
 * Tests for POST /api/account/delete-action
 *
 * S6-05 — Hasura action handler: delete_user_account
 *
 * This route is called by Hasura after user-role permission check.
 * It validates the Remote Schema secret, then soft-deletes the user
 * via the pc_soft_delete_user Postgres function.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper: build a Hasura action request body
function makeActionBody(overrides: Record<string, unknown> = {}) {
  return {
    action: { name: "delete_user_account" },
    input: { userId: "00000000-0000-0000-0000-000000000001" },
    session_variables: {
      "x-hasura-user-id": "00000000-0000-0000-0000-000000000001",
      "x-hasura-role": "user",
    },
    ...overrides,
  };
}

// Helper: simulate the Hasura run_sql response for pc_soft_delete_user
function mockSoftDeleteSuccess() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      result: [["pc_soft_delete_user"], [["t"]]],
    }),
  });
}

function mockSoftDeleteNotFound() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      result: [["pc_soft_delete_user"], [["f"]]],
    }),
  });
}

function mockSoftDeleteError() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    text: async () => "Internal Server Error",
    json: async () => ({ error: "run_sql failed" }),
  });
}

async function callRoute(
  body: unknown,
  headers?: Record<string, string>
) {
  // Dynamic import so env vars are re-read each test
  const { POST } = await import(
    "@/app/api/account/delete-action/route"
  );
  const req = new Request("http://localhost/api/account/delete-action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  // NextRequest compatibility shim
  return POST(req as Parameters<typeof POST>[0]);
}

// ─── Secret validation ────────────────────────────────────────────────────────

describe("secret validation", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    delete process.env.REMOTE_SCHEMA_SECRET;
    delete process.env.HASURA_GRAPHQL_ADMIN_SECRET;
    delete process.env.HASURA_ADMIN_URL;
    vi.resetModules();
  });
  afterEach(() => vi.resetModules());

  it("allows the request when REMOTE_SCHEMA_SECRET is not set (dev mode)", async () => {
    mockSoftDeleteSuccess();
    const res = await callRoute(makeActionBody());
    expect(res.status).toBe(200);
  });

  it("rejects with 403 when secret is wrong", async () => {
    process.env.REMOTE_SCHEMA_SECRET = "correct-secret";
    vi.resetModules();
    const res = await callRoute(makeActionBody(), {
      "x-remote-schema-secret": "wrong-secret",
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Forbidden/i);
  });

  it("allows the request when secret matches", async () => {
    process.env.REMOTE_SCHEMA_SECRET = "correct-secret";
    vi.resetModules();
    mockSoftDeleteSuccess();
    const res = await callRoute(makeActionBody(), {
      "x-remote-schema-secret": "correct-secret",
    });
    expect(res.status).toBe(200);
  });
});

// ─── Input validation ─────────────────────────────────────────────────────────

describe("input validation", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    delete process.env.REMOTE_SCHEMA_SECRET;
    vi.resetModules();
  });
  afterEach(() => vi.resetModules());

  it("returns 400 when userId is missing", async () => {
    const res = await callRoute({ action: { name: "delete_user_account" }, input: {} });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/userId/i);
  });

  it("returns 400 for invalid JSON", async () => {
    const { POST } = await import("@/app/api/account/delete-action/route");
    const req = new Request("http://localhost/api/account/delete-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
  });

  it("returns 403 when session userId does not match input userId", async () => {
    const res = await callRoute(
      makeActionBody({
        input: { userId: "00000000-0000-0000-0000-000000000002" },
        session_variables: {
          "x-hasura-user-id": "00000000-0000-0000-0000-000000000001",
          "x-hasura-role": "user",
        },
      })
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Forbidden/i);
  });
});

// ─── Soft-delete behaviour ────────────────────────────────────────────────────

describe("soft-delete behaviour", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    delete process.env.REMOTE_SCHEMA_SECRET;
    vi.resetModules();
  });
  afterEach(() => vi.resetModules());

  it("returns { success: true } when pc_soft_delete_user returns t", async () => {
    mockSoftDeleteSuccess();
    const res = await callRoute(makeActionBody());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns { success: false } when user row does not exist", async () => {
    mockSoftDeleteNotFound();
    const res = await callRoute(makeActionBody());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("returns 500 when Hasura run_sql call fails", async () => {
    mockSoftDeleteError();
    const res = await callRoute(makeActionBody());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 500 when fetch throws (network error)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const res = await callRoute(makeActionBody());
    expect(res.status).toBe(500);
  });

  it("calls the Hasura run_sql endpoint with pc_soft_delete_user SQL", async () => {
    mockSoftDeleteSuccess();
    await callRoute(makeActionBody());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v2/query");
    const body = JSON.parse(options.body as string) as {
      type: string;
      args: { sql: string; args: string[] };
    };
    expect(body.type).toBe("run_sql");
    expect(body.args.sql).toContain("pc_soft_delete_user");
    expect(body.args.args[0]).toBe("00000000-0000-0000-0000-000000000001");
  });
});
