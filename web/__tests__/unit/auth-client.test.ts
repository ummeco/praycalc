import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { signIn, signUp, requestMagicLink, refreshSession, signOut } from "@/lib/auth/client";

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------
function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// signIn/signUp/refreshSession/signOut now call PrayCalc's own same-origin
// /api/auth/* proxy routes — the routes hold the real tokens as httpOnly
// cookies server-side (ADR-010 fix) and only ever return { user,
// accessTokenExpiresAt } to the client. requestMagicLink is the one
// exception: it never returns a token, so it still calls Hasura Auth
// directly.

describe("signIn", () => {
  it("resolves with user + accessTokenExpiresAt (no raw tokens)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        user: { id: "u1", email: "a@b.com", displayName: "A B" },
        accessTokenExpiresAt: Date.now() + 900_000,
      }),
    );
    const result = await signIn("a@b.com", "secret");
    expect(result.user.email).toBe("a@b.com");
    expect(result.user.displayName).toBe("A B");
    expect(result.accessTokenExpiresAt).toBeGreaterThan(Date.now());
    expect((result as unknown as { tokens?: unknown }).tokens).toBeUndefined();
  });

  it("posts to the same-origin proxy route with credentials", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ user: { email: "e@e.com", displayName: "e" }, accessTokenExpiresAt: Date.now() }),
    );
    await signIn("e@e.com", "pw");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/auth/signin",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ email: "e@e.com", password: "pw" }),
      }),
    );
  });

  it("throws a user-presentable message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "Invalid email or password." }, false, 401),
    );
    await expect(signIn("a@b.com", "wrong")).rejects.toThrow("Invalid email or password.");
  });

  it("throws a fallback message when the error body is unparseable", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(signIn("a@b.com", "wrong")).rejects.toThrow("Request failed.");
  });
});

describe("signUp", () => {
  it("posts to the signup proxy route with displayName", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ user: { email: "n@n.com", displayName: "New" }, accessTokenExpiresAt: Date.now() }),
    );
    const result = await signUp("n@n.com", "pw123456", "New");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/auth/signup",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "n@n.com", password: "pw123456", displayName: "New" }),
      }),
    );
    expect(result.user.displayName).toBe("New");
  });

  it("throws a user-presentable message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "Email already registered." }, false, 409),
    );
    await expect(signUp("dupe@e.com", "pw")).rejects.toThrow("Email already registered.");
  });
});

describe("requestMagicLink", () => {
  it("resolves on 200 ack with no session", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}));
    await expect(requestMagicLink("m@m.com")).resolves.toBeUndefined();
  });

  it("calls the passwordless email endpoint directly on the auth server", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(jsonResponse({}));
    await requestMagicLink("m@m.com");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/signin/passwordless/email"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws a user-presentable message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ message: "Failed to send login link." }, false, 500),
    );
    await expect(requestMagicLink("bad@e.com")).rejects.toThrow("Failed to send login link.");
  });
});

describe("refreshSession", () => {
  it("resolves with a new accessTokenExpiresAt on success (cookie-based, no args)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ user: { email: "r@r.com" }, accessTokenExpiresAt: Date.now() + 900_000 }),
    );
    const result = await refreshSession();
    expect(result.accessTokenExpiresAt).toBeGreaterThan(Date.now());
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/refresh",
      expect.objectContaining({ body: JSON.stringify({}) }),
    );
  });

  it("passes a legacy refresh token in the body for one-time migration", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ user: { email: "r@r.com" }, accessTokenExpiresAt: Date.now() }),
    );
    await refreshSession("rt-old");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/auth/refresh",
      expect.objectContaining({ body: JSON.stringify({ refreshToken: "rt-old" }) }),
    );
  });

  it("throws on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "Session refresh failed." }, false, 401),
    );
    await expect(refreshSession()).rejects.toThrow("Session refresh failed.");
  });
});

describe("signOut", () => {
  it("resolves even when the network call fails (best-effort)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
    await expect(signOut()).resolves.toBeUndefined();
  });

  it("resolves on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({ ok: true }));
    await expect(signOut()).resolves.toBeUndefined();
  });

  it("passes a legacy refresh token in the body when provided", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));
    await signOut("rt-legacy");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/auth/signout",
      expect.objectContaining({ body: JSON.stringify({ refreshToken: "rt-legacy" }) }),
    );
  });
});
