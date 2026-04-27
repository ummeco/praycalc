/**
 * Free-tier feature registry — these features are ALWAYS FREE.
 *
 * Islamic-tech ethics commitment: core prayer times, Qibla, and offline
 * access are a religious necessity. They will never be paywalled.
 *
 * App Store / Play Store risk note: gating core religious functionality
 * behind an IAP violates Apple App Store guideline 3.1.1 (must offer
 * basic app functionality for free) and creates review risk. This list
 * is the contractual boundary.
 *
 * DO NOT move any entry from this list to PLUS_FEATURES without explicit
 * user approval and a STORM-approved release plan.
 */
export const FREE_TIER_FEATURES = [
  "core_5_prayers",
  "qibla_compass",
  "iqama_view",
  "offline_30_days",
  "manual_madhab_select",
  "manual_location",
  "basic_notifications",
] as const;

export type FreeTierFeature = (typeof FREE_TIER_FEATURES)[number];

/** Type guard — true if the given string is a free-tier feature. */
export function isFreeTierFeature(name: string): name is FreeTierFeature {
  return (FREE_TIER_FEATURES as readonly string[]).includes(name);
}
