/**
 * Purpose: Dynamic Expo config layer — extends the static app.json with the
 *   EAS Update `updates` block + `runtimeVersion` policy, computed from the
 *   SAME `extra.eas.projectId` value that already lives in app.json (single
 *   source of truth: update the projectId in one place, this file picks it up).
 * Inputs: app.json (base config), EAS_PROJECT_ID-shaped placeholder until the
 *   real EAS project is provisioned (see mobile/docs/DEPLOYMENT.md OTA checklist).
 * Outputs: Full Expo config object (app.json spread + updates + runtimeVersion).
 * Constraints: Must stay in sync with the `expo-updates` config plugin
 *   auto-linked via SDK 53 (no explicit plugin entry needed — the package's
 *   presence in dependencies is enough for `expo prebuild` to wire native code).
 *   `fallbackToCacheTimeout: 0` is required for the seamless/background OTA
 *   pattern: launch is never blocked on a network update check — a fetched
 *   update only takes effect on the NEXT app launch (see src/lib/updates/otaUpdates.ts
 *   for the foreground check-and-fetch flow that keeps the cache warm).
 * SPORT: REGISTRY-CONFIG.md#praycalc-mobile-app-config
 */

const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
const baseExpoConfig = appJson.expo;

const projectId = baseExpoConfig.extra?.eas?.projectId;

module.exports = () => ({
  expo: {
    ...baseExpoConfig,
    // Policy "appVersion": a new OTA update is only offered to installs whose
    // native `version` (app.json `expo.version`) matches — safest default for
    // an app with native modules that change occasionally (widgets, IAP,
    // notifications). Revisit "fingerprint" once native-change cadence is
    // measured post-launch (fingerprint auto-detects native drift instead of
    // relying on a manually bumped version string).
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      enabled: true,
      // Check for a new update every time the JS bundle loads (cold start +
      // reload), not just periodically — this is what makes OTA feel
      // "seamless": the app never nags, it just quietly has the new bundle
      // ready by the next launch.
      checkAutomatically: 'ON_LOAD',
      // Never block first paint on the update check/download — always render
      // the cached bundle immediately. A fetched update is applied on the
      // NEXT launch via Updates.reloadAsync() (see otaUpdates.ts) or, absent
      // that, automatically on the following cold start.
      fallbackToCacheTimeout: 0,
      // UD-PENDING-EAS-PROJECT-ID until the real EAS project is created —
      // resolves automatically once extra.eas.projectId in app.json is set
      // for real (single edit, no duplicate URL to update).
      url: `https://u.expo.dev/${projectId}`,
    },
  },
});
