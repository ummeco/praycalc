/**
 * S-C-S05-T04 — Canonical policy version stamped on every consent write.
 *
 * Bump CURRENT_POLICY_VERSION whenever the privacy / cookie policy text
 * meaningfully changes.  The new version triggers a re-prompt for every user
 * because the storage layer (storage.ts CURRENT_CONSENT_VERSION) treats a
 * mismatched version as "no record".
 *
 * Per-domain policy version IDs (UUIDs) live in lg_policy_version on the
 * server side; this semver string is the human-readable counterpart.
 */
export declare const CURRENT_POLICY_VERSION: "1.0.0";
export type PolicyVersion = typeof CURRENT_POLICY_VERSION | string;
//# sourceMappingURL=version.d.ts.map