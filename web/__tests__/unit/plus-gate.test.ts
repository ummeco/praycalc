/**
 * plus-gate.test.ts — T1-6-1 through T1-6-5 eligibility integration tests.
 *
 * Coverage:
 *   1. Plus user accessing a Plus feature → allowed
 *   2. Free user accessing a Plus feature → denied (shows upgrade prompt)
 *   3. Free user accessing a core free feature → always allowed (no network call)
 *   4. Anonymous user accessing a core free feature → allowed
 *   5. Anonymous user accessing a Plus feature → denied
 *   6. Unknown feature name → denied (safe fallback)
 *   7. Backend eligibility API failure → degrades to free (no crash)
 *   8. Free-tier features skip the eligibility API entirely
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { canAccess, isPlusFeature, isFreeTierFeature } from "@/lib/plus-gate";
import { FREE_TIER_FEATURES } from "@/lib/free-tier-features";
import { PLUS_FEATURES } from "@/lib/plus-features";

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockPlusEligibility(isPlus: boolean) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ isPlus }),
  } as Response);
}

function mockEligibilityFailure() {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
}

function mockEligibilityServerError() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({}),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
});

// ---------------------------------------------------------------------------
// Type guards — sanity checks
// ---------------------------------------------------------------------------

describe("isPlusFeature", () => {
  it("returns true for every entry in PLUS_FEATURES", () => {
    for (const f of PLUS_FEATURES) {
      expect(isPlusFeature(f)).toBe(true);
    }
  });

  it("returns false for a free-tier feature name", () => {
    expect(isPlusFeature("core_5_prayers")).toBe(false);
  });

  it("returns false for an unknown string", () => {
    expect(isPlusFeature("nonexistent_feature")).toBe(false);
  });
});

describe("isFreeTierFeature", () => {
  it("returns true for every entry in FREE_TIER_FEATURES", () => {
    for (const f of FREE_TIER_FEATURES) {
      expect(isFreeTierFeature(f)).toBe(true);
    }
  });

  it("returns false for a Plus feature name", () => {
    expect(isFreeTierFeature("multi_city")).toBe(false);
  });

  it("returns false for an unknown string", () => {
    expect(isFreeTierFeature("nonexistent_feature")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canAccess — the 8 required test cases
// ---------------------------------------------------------------------------

describe("canAccess", () => {
  // Case 1: Plus user accessing a Plus feature → allowed
  it("1. Plus user accessing a Plus feature → allowed", async () => {
    mockPlusEligibility(true);
    const result = await canAccess("user-123", "multi_city");
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("userId=user-123"),
      expect.any(Object),
    );
  });

  // Case 2: Free user (no Plus) accessing a Plus feature → denied
  it("2. Free user accessing a Plus feature → denied", async () => {
    mockPlusEligibility(false);
    const result = await canAccess("user-free", "custom_adhan_voices");
    expect(result).toBe(false);
  });

  // Case 3: Free user accessing a core free feature → always allowed, no network call
  it("3. Free user accessing a core free feature → always allowed (no API call)", async () => {
    const result = await canAccess("user-free", "core_5_prayers");
    expect(result).toBe(true);
    // No fetch call — free-tier bypasses eligibility entirely
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Case 4: Anonymous user (null userId) accessing a core free feature → allowed
  it("4. Anonymous user accessing a core free feature → allowed", async () => {
    const result = await canAccess(null, "qibla_compass");
    expect(result).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Case 5: Anonymous user accessing a Plus feature → denied
  it("5. Anonymous user accessing a Plus feature → denied", async () => {
    const result = await canAccess(null, "cross_device_sync");
    expect(result).toBe(false);
    // No fetch call — anonymous users short-circuit before the API
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Case 6: Unknown feature name → denied (safe fallback)
  it("6. Unknown feature name → denied by default", async () => {
    const result = await canAccess("user-123", "totally_unknown_feature");
    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Case 7: Backend failure → degrades gracefully to false (no crash)
  it("7. Backend API network failure → degrades to false without crashing", async () => {
    mockEligibilityFailure();
    const result = await canAccess("user-123", "premium_themes");
    expect(result).toBe(false);
  });

  // Case 7b: Backend server error (500)
  it("7b. Backend server error (500) → degrades to false", async () => {
    mockEligibilityServerError();
    const result = await canAccess("user-123", "multi_city");
    expect(result).toBe(false);
  });

  // Case 8: All FREE_TIER_FEATURES skip the eligibility API (broad sweep)
  it("8. All FREE_TIER_FEATURES skip eligibility API", async () => {
    for (const feature of FREE_TIER_FEATURES) {
      const result = await canAccess("user-123", feature);
      expect(result).toBe(true);
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Case 8b: Undefined userId also denies Plus access
  it("8b. Undefined userId → denied for Plus features", async () => {
    const result = await canAccess(undefined, "detailed_history_analytics");
    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Core offline access is always free (30-day cache — AMENDED 2026-04-26)
  it("offline_30_days is free for all users including anonymous", async () => {
    const anon = await canAccess(null, "offline_30_days");
    const free = await canAccess("user-free", "offline_30_days");
    expect(anon).toBe(true);
    expect(free).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Feature list integrity
// ---------------------------------------------------------------------------

describe("feature list integrity", () => {
  it("FREE_TIER_FEATURES has exactly 7 entries", () => {
    expect(FREE_TIER_FEATURES).toHaveLength(7);
  });

  it("PLUS_FEATURES has exactly 8 entries", () => {
    expect(PLUS_FEATURES).toHaveLength(8);
  });

  it("no feature appears in both lists", () => {
    const freeSet = new Set(FREE_TIER_FEATURES as readonly string[]);
    for (const f of PLUS_FEATURES) {
      expect(freeSet.has(f)).toBe(false);
    }
  });

  it("core_5_prayers is in FREE_TIER_FEATURES", () => {
    expect(FREE_TIER_FEATURES).toContain("core_5_prayers");
  });

  it("offline_30_days is in FREE_TIER_FEATURES (not Plus)", () => {
    expect(FREE_TIER_FEATURES).toContain("offline_30_days");
    expect(PLUS_FEATURES).not.toContain("offline_30_days");
  });
});
