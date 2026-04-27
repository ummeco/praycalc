/**
 * plus-gate.ts — Feature access control for PrayCalc free vs. Plus tier.
 *
 * Design principles:
 * - FREE_TIER_FEATURES never hit the eligibility check — type-level guarantee,
 *   enforced at runtime too. Core prayer times are always accessible.
 * - Plus check calls the backend eligibility API; anonymous users are treated
 *   as free-tier (full access to free features, no Plus access).
 * - isPlusFeature() is a synchronous type guard for UI rendering decisions.
 * - canAccess() is the async gate for actual feature use; always call it before
 *   rendering Plus-only content.
 */

import { isFreeTierFeature, type FreeTierFeature } from "./free-tier-features";
import { isPlusFeature, type PlusFeature } from "./plus-features";

export type { FreeTierFeature, PlusFeature };
export { isFreeTierFeature, isPlusFeature };

// Re-export the constants so callers can import everything from one place.
export { FREE_TIER_FEATURES } from "./free-tier-features";
export { PLUS_FEATURES } from "./plus-features";

// ---------------------------------------------------------------------------
// Eligibility API
// ---------------------------------------------------------------------------

/** Shape returned by the plus eligibility endpoint. */
interface EligibilityResponse {
  isPlus: boolean;
}

/**
 * Fetch Plus eligibility for a given user.
 * Returns false on any network/auth error so the app degrades gracefully.
 *
 * Endpoint contract: GET /api/plus/eligibility?userId=<id>
 * Responds with { isPlus: boolean } — Sprint 22 plus-eligibility lib.
 */
async function fetchPlusEligibility(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/plus/eligibility?userId=${encodeURIComponent(userId)}`, {
      // Cache for 60 s to avoid hammering the endpoint on rapid re-renders.
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) return false;
    const data = (await res.json()) as EligibilityResponse;
    return data.isPlus === true;
  } catch {
    // Network offline, server error, parse failure — degrade to free.
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * canAccess — async feature gate.
 *
 * - Free-tier features: ALWAYS returns true, no network call. Type-level
 *   guarantee: the compiler rejects any feature not in FREE_TIER_FEATURES
 *   or PLUS_FEATURES from reaching this function.
 * - Plus-only features: returns true only if userId is provided AND the
 *   backend confirms active Plus eligibility.
 * - Anonymous users (userId = null | undefined): free features → true;
 *   Plus features → false (show upgrade banner, do not block).
 *
 * @param userId  Hasura Auth user ID, or null/undefined for anonymous.
 * @param featureName  Any feature key from FREE_TIER_FEATURES or PLUS_FEATURES.
 */
export async function canAccess(
  userId: string | null | undefined,
  featureName: string,
): Promise<boolean> {
  // Free-tier features bypass eligibility entirely — no network call.
  if (isFreeTierFeature(featureName)) {
    return true;
  }

  // Unknown feature name — deny by default (safe fallback).
  if (!isPlusFeature(featureName)) {
    return false;
  }

  // Anonymous user: never gets Plus access.
  if (!userId) {
    return false;
  }

  return fetchPlusEligibility(userId);
}
