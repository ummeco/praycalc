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

describe("signIn", () => {
  it("resolves with user + tokens on the flat response shape", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        accessToken: "at-1",
        refreshToken: "rt-1",
        accessTokenExpiresIn: 900,
        user: { id: "u1", email: "a@b.com", displayName: "A B" },
      }),
    );
    const result = await signIn("a@b.com", "secret");
    expect(result.user.email).toBe("a@b.com");
    expect(result.user.displayName).toBe("A B");
    expect(result.tokens.accessToken).toBe("at-1");
    expect(result.tokens.refreshToken).toBe("rt-1");
    expect(result.tokens.accessTokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it("falls back to unwrapping a nested session shape", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        session: {
          accessToken: "at-2",
          refreshToken: "rt-2",
          accessTokenExpiresIn: 600,
          user: { id: "u2", email: "c@d.com" },
        },
      }),
    );
    const result = await signIn("c@d.com", "secret");
    expect(result.tokens.accessToken).toBe("at-2");
    // displayName falls back to email local-part when absent
    expect(result.user.displayName).toBe("c");
  });

  it("calls the correct endpoint with credentials in the body", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ accessToken: "x", refreshToken: "y", user: { email: "e@e.com" } }),
    );
    await signIn("e@e.com", "pw");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/signin/email-password"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws a user-presentable message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ message: "Invalid email or password." }, false, 401),
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
    await expect(signIn("a@b.com", "wrong")).rejects.toThrow("Invalid email or password.");
  });

  it("throws when the success response is missing tokens", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}));
    await expect(signIn("a@b.com", "pw")).rejects.toThrow("Unexpected response from auth server.");
  });
});

describe("signUp", () => {
  it("posts to the signup endpoint with options.displayName", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(
      jsonResponse({ accessToken: "at", refreshToken: "rt", user: { email: "n@n.com", displayName: "New" } }),
    );
    const result = await signUp("n@n.com", "pw123456", "New");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/signup/email-password"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "n@n.com",
          password: "pw123456",
          options: { displayName: "New" },
        }),
      }),
    );
    expect(result.user.displayName).toBe("New");
  });

  it("throws a user-presentable message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ message: "Email already registered." }, false, 409),
    );
    await expect(signUp("dupe@e.com", "pw")).rejects.toThrow("Email already registered.");
  });
});

describe("requestMagicLink", () => {
  it("resolves on 200 ack with no session", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}));
    await expect(requestMagicLink("m@m.com")).resolves.toBeUndefined();
  });

  it("calls the passwordless email endpoint", async () => {
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
  it("resolves with new tokens on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ accessToken: "at-new", refreshToken: "rt-new", user: { email: "r@r.com" } }),
    );
    const result = await refreshSession("rt-old");
    expect(result.tokens.accessToken).toBe("at-new");
  });

  it("throws on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({}, false, 401),
    );
    await expect(refreshSession("expired")).rejects.toThrow("Session refresh failed.");
  });
});

describe("signOut", () => {
  it("resolves even when the network call fails (best-effort)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
    await expect(signOut("rt-1")).resolves.toBeUndefined();
  });

  it("resolves on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}));
    await expect(signOut("rt-1")).resolves.toBeUndefined();
  });
});
