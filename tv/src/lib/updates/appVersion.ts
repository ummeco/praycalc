/**
 * Purpose: Single source for the running app's semver, read by the update-check flow.
 *   A literal (not a package.json import) — RN/Metro can require JSON, but tsc's rootDir
 *   handling for a file outside `src/` is an unnecessary risk for one string. Keep this
 *   value in lockstep with package.json's "version" and AboutScreen.tsx's "Version X.Y.Z"
 *   string on every release bump.
 * Inputs: none.
 * Outputs: APP_VERSION constant, "X.Y.Z" (no leading 'v', no tag prefix).
 * Constraints: must be updated in the same commit as any version bump.
 * SPORT: praycalc/tv lib/updates
 */

export const APP_VERSION = '1.0.0';
