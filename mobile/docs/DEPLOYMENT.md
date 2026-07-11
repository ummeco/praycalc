# praycalc/mobile — Deployment & Rollback Strategy

## FGAP-08: App Store Bundle ID Continuity

**Bundle ID:** `com.praycalc.praycalcApp`

This matches the existing Flutter app's bundle ID (confirmed from
`praycalc/flutter/ios/Runner.xcodeproj/project.pbxproj.bak`):
```
PRODUCT_BUNDLE_IDENTIFIER = com.praycalc.praycalcApp
```

**Why this matters:** The React Native replacement uses the SAME bundle ID as the
Flutter app (`com.praycalc.praycalcApp`) to replace the existing App Store listing
rather than creating a new listing. No new bundle ID is created.

**Android package:** `com.praycalc.praycalcApp` (matches Flutter `applicationId`)

---

## Initial App Store Release — Phased Rollout Strategy

### Release Phases

| Phase | Rollout % | Duration | Criteria to proceed |
|---|---|---|---|
| Phase 1 | 5% | 48 hours | Crash-free rate ≥ 99%, no P0 regressions, prayer times match reference |
| Phase 2 | 25% | 72 hours | Rating ≥ 4.2, no P1 issues, crash-free ≥ 99.5% |
| Phase 3 | 50% | 5 days | Sustained metrics, organic reviews positive |
| Phase 4 | 100% | Full release | All metrics stable |

### Rollout Steps (iOS)

1. Build production EAS build: `eas build --platform ios --profile production`
2. Submit via EAS Submit: `eas submit --platform ios`
3. In App Store Connect → App Availability → Staged Rollout: set 5%
4. Monitor Crashlytics (nSelf logging) + App Store Connect crash reports
5. Increment rollout percentage per phase criteria above

### Rollout Steps (Android)

1. Build AAB: `eas build --platform android --profile production`
2. Submit: `eas submit --platform android`
3. Google Play Console → Release → Production → Staged rollout at 5-10%
4. Monitor ANR/crash rate in Play Console
5. Increment rollout per phase criteria

---

## Rollback Plan

### Trigger Conditions (rollback immediately)

- Crash-free rate drops below 98% in first 24h
- P0 regression: prayer times off by > 5 minutes for major method/city
- P0 regression: Qibla bearing error > 10 degrees for standard test points
- App fails to launch on iOS 16 or Android API 26 (minimum targets)
- Auth data loss affecting > 0.1% of users

### Rollback Procedure

**iOS:**
1. Immediately halt staged rollout in App Store Connect
2. Re-submit the prior Flutter build from `archive/praycalc-flutter-1.2.3` branch
3. Use same bundle ID `com.praycalc.praycalcApp` — Apple allows submitting
   an older binary for same listing
4. File urgent PCI: `pci-praycalc-mobile-rollback-<date>`

**Android:**
1. Halt staged rollout in Play Console immediately
2. Re-publish prior Flutter APK/AAB from archive branch
3. Same package `com.praycalc.praycalcApp` — Play Console allows rollback to
   prior release within 72h

### Contact on P0

- Primary: Technical lead (@ali)
- EAS Build issue: `eas build:cancel` + `eas build:list` to identify last good build
- App Store emergency: Use Transporter or Xcode Organizer as fallback

---

## EAS Build Profiles

See `eas.json` for build profiles:
- `development`: simulator + internal distribution
- `preview`: internal APK for QA
- `production`: App Store + Play Store submission

## OTA (Over-The-Air) Updates — expo-updates

Code-complete as of 2026-07-07. `expo-updates@~0.28.18` is installed;
`app.config.js` layers `updates` (`enabled: true`, `checkAutomatically: "ON_LOAD"`,
`fallbackToCacheTimeout: 0`) and `runtimeVersion: { policy: "appVersion" }` on
top of `app.json`. `src/lib/updates/otaUpdates.ts` re-checks on every
foreground transition (`useOtaUpdates()`, wired in `src/app/_layout.tsx`) so a
long-lived session still picks up new JS without a force-quit. Updates never
force a mid-session reload — a fetched update applies automatically on the
next natural app launch (seamless, no user-facing prompt).

**User-gated before OTA is live (cannot be done by an agent):**

- [ ] Create the real EAS project (`eas init` or Expo dashboard) and replace
      `UD-PENDING-EAS-PROJECT-ID` in `app.json` → `expo.extra.eas.projectId`
      (the `updates.url` in `app.config.js` derives from this automatically —
      one edit, nothing else to change).
- [ ] Confirm `eas.json` build-profile channels (`development` / `preview` /
      `production`) match the channels you intend to `eas update --branch <x>`
      into — they're pre-wired but unverified against the real project.
- [ ] `eas.json` `cli.appVersionSource` is `"remote"` (required: this project
      uses a dynamic `app.config.js`, and EAS CLI cannot write an
      auto-incremented `versionCode`/`buildNumber` back into a `.js` config —
      only a static `app.json`. Remote mode stores the build-number counter on
      EAS's servers instead, so it also survives ephemeral CI runners across
      reruns of the same commit.) No manual `versionCode`/`buildNumber` is set
      in `app.json` — remote mode manages both automatically per build.
- [ ] Run `eas build` at least once per platform/profile AFTER the real
      projectId is set, so the installed binary embeds the correct update URL
      + channel (an OTA-eligible build cannot be retrofitted after the fact).
- [ ] Publish the first OTA update: `eas update --branch production --message "..."`.
- [ ] Verify on a real device: install the build, publish a trivial OTA change,
      background/foreground the app (or cold-restart), confirm the change
      appears without a store update.

## Play Console Background Location Declaration

Masjid Mute geofencing (`src/features/masjid-mute/lib/geofenceTask.ts`) requires
`ACCESS_BACKGROUND_LOCATION` (declared via the `expo-location` plugin's
`isAndroidBackgroundLocationEnabled: true` in `app.json`). Google Play requires a
**Background Location permission declaration form** in Play Console (App content
→ Sensitive permissions) before a build requesting this permission can be
published — explain the masjid-proximity auto-mute use case there before the
first submission that includes this permission.

## Pre-Submit Checklist

- [ ] Bundle ID matches `com.praycalc.praycalcApp` in app.json
- [ ] Prayer times verified for Makkah (MWL) within 1 minute of reference
- [ ] Qibla for NYC shows ~58° bearing
- [ ] Qibla for Makkah itself shows 0°/360° (or no directional arrow)
- [ ] Tehran/Jafari absent from all method selectors
- [ ] All 7 UI states tested (force offline, deny location, etc.)
- [ ] `npx expo prebuild --clean` exits 0
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] iOS simulator smoke test: all 13 T-02 screens navigate (More tab)
- [ ] Android emulator smoke test: all 13 T-02 screens navigate
- [ ] Adhan audio plays in background (lock screen controls visible)
- [ ] Tasbeeh counter persists through app backgrounding
- [ ] Prayer notifications fire for at least one test prayer
- [ ] Onboarding completes all 5 steps, marks done flag in MMKV
- [ ] Musafir mode shows qasr table; no automatic jama
- [ ] Home widget screen shows stub notice (not a crash)
- [ ] Islamic content: no Tehran/Jafari in method selector (D-P3-19)
- [ ] Dua/Adhkar: Arabic text renders RTL with full tashkeel

---

## FGAP-09: Staged Rollout for T-02 Feature Update

**Applies to:** App Store/Play Store update from v0.1.x (Features 1-5) to v0.2.0 (Features 6-20)

### Why phased for a feature update

Features 15 (notifications), 13 (IAP), and 18 (calendar) touch sensitive platform APIs (push tokens, payment flows, calendar writes). A staged rollout catches permission-model regressions before full exposure.

### iOS TestFlight → App Store Staged Rollout

| Stage | Audience | Duration | Go/No-Go Signal |
|---|---|---|---|
| Internal TestFlight | Team + beta testers | 48h | All T-02 features smoke-pass, no crash |
| External TestFlight | 500 external testers | 72h | Crash-free ≥ 99.5%, notification delivery rate ≥ 95% |
| App Store 10% | Live users | 48h | Crash-free ≥ 99.5%, IAP conversion not regressed |
| App Store 100% | All users | Full release | All metrics stable |

**Note:** iOS staged rollout affects new downloads only; existing users auto-update through the gradual percentage.

### Android Play Store Staged Rollout

| Stage | Rollout % | Duration | Go/No-Go Signal |
|---|---|---|---|
| Internal testing | 10 testers | 24h | Smoke pass |
| Closed testing | ~100 testers | 48h | Feature regression check |
| Production 20% | Live users | 48h | ANR rate < 0.1%, crash rate < 1% |
| Production 50% | Live users | 72h | Sustained metrics |
| Production 100% | All users | Full release | — |

### Rollback for T-02 Update

- Halt staged rollout immediately on: crash-free drops below 98%, notification permission crash, IAP flow fails, calendar permission crash
- Roll back to v0.1.x build (FGAP-08 era) using same bundle ID — both App Store and Play Store support rollback to prior approved version
- File PCI `pci-praycalc-t02-rollback-<date>` immediately
