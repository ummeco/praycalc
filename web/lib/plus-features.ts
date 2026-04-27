/**
 * Plus-tier feature registry — these features require an active Ummat+ subscription.
 *
 * Free-tier features are in free-tier-features.ts and are NEVER in this list.
 * Core prayer times / Qibla / Iqama / 30-day offline cache remain free forever.
 */
export const PLUS_FEATURES = [
  "multi_city",
  "custom_adhan_voices",
  "detailed_history_analytics",
  "donation_history_view",
  "premium_themes",
  "cross_device_sync",
  "priority_support",
  "early_access_features",
] as const;

export type PlusFeature = (typeof PLUS_FEATURES)[number];

/** Type guard — true if the given string is a Plus-only feature. */
export function isPlusFeature(name: string): name is PlusFeature {
  return (PLUS_FEATURES as readonly string[]).includes(name);
}
