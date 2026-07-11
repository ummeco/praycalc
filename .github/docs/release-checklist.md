# PrayCalc Release Checklist

Everything the release workflows handle automatically is marked **AUTO**. Your required
actions are marked **YOU**. Releases are per-surface now, not one unified pipeline — each
surface has its own tag prefix and its own workflow:

| Surface | Workflow | Trigger | Stack |
| --- | --- | --- | --- |
| Mobile — Android APK direct-install | `release-mobile-apk.yml` | `mobile-v*` tag push | React Native + Expo SDK 53, Gradle-built signed APK, no store account needed |
| Mobile — App Store / Play Store submission | `release-mobile.yml` | Manual (`workflow_dispatch` only) | React Native + Expo SDK 53, EAS Build + Submit |
| TV — Android TV / Fire TV APK direct-install | `release-tv-apk.yml` | `tv-v*` tag push | react-native-tvos (bare), Gradle-built signed APK, no store account needed |
| TV — Play Store (TV listing) / tvOS App Store submission | `release-tv.yml` | Manual (`workflow_dispatch` only) | react-native-tvos (bare), EAS Build + Submit |
| Desktop (macOS/Windows/Linux) | `release-desktop.yml` | `desktop-v*` tag push | Tauri 2, signed installers + rolling `desktop-latest` updater feed |
| Web | Vercel auto-deploy on push to `main` | — | Astro (D-P2-STACK-CANON) |
| Docs (praycalc.org) | Vercel auto-deploy on push to `main` | — | Astro (static) |

`flutter/` is an archived reference only (ADR-P8-09 superseded 2026-06-28) — its old
`release.yml` pipeline is disabled and does not run. watchOS (`watchos/`) and Wear OS
(`wearos/`) are native Swift/Kotlin scaffolds with no CI/release automation yet; they ship
manually through Xcode/Android Studio when their own work resumes.

**One-time account/credential setup:** see
`.github/docs/runbooks/mobile-tv-release-provisioning.md` — do that first, this checklist
assumes it's done.

---

## Mobile release

Two separate, decoupled paths ship from the same tag/version — a tag push only triggers the
APK path below; EAS store submission is a manual step you trigger yourself.

### Step 1 — YOU: Verify locally

```bash
cd mobile && pnpm typecheck && pnpm lint && pnpm test
```

### Step 2 — YOU: Bump version and tag

```bash
# bump mobile/app.json's "version" field, commit
git tag mobile-v2.1.0
git push origin mobile-v2.1.0
```

### Step 3 — AUTO: what pushing the tag actually triggers (`release-mobile-apk.yml`)

A signed Android APK is built directly (Expo prebuild → Gradle, no EAS account needed) and
published to a GitHub Release for direct-install/sideload. This is the fast, no-store-review
path — it does **not** touch the App Store or Play Store.

### Step 4 — YOU: separately, submit to the stores (`release-mobile.yml`, manual dispatch only)

`release-mobile.yml` no longer runs on tag push — run it manually from the Actions tab
(`workflow_dispatch`: pick platform/profile/auto-submit) once EAS/store credentials exist.
It builds via EAS (iOS + Android, production profile) and can auto-submit to App Store Connect
(TestFlight processing → manual release from there) and Google Play Console (internal track by
default — promote manually to production once verified).

### Step 5 — YOU: first-release-only manual steps

- App Store Connect: fill out the listing (screenshots, description, age rating, privacy
  policy URL — see `.github/docs/store-listing.md`) before the build can go to review.
- Play Console: the very first version of any app must go through the console UI once
  (content rating questionnaire, data-safety form) before `--auto-submit` works for
  subsequent versions.

---

## TV release

Two separate, decoupled paths ship from the same tag/version, exactly mirroring mobile — a
tag push only triggers the APK path below; EAS store submission is a manual step you trigger
yourself.

### Step 1 — YOU: Verify locally

```bash
cd tv && pnpm typecheck && pnpm lint && pnpm test
```

### Step 2 — YOU: Bump version and tag

```bash
# bump tv/package.json's "version" (and tv/app.json's "version"/"android.versionCode"), commit
git tag tv-v0.2.0
git push origin tv-v0.2.0
```

### Step 3 — AUTO: what pushing the tag actually triggers (`release-tv-apk.yml`)

A signed Android TV / Fire TV APK is built directly (plain Gradle build against the committed
`tv/android` project, no EAS account needed) and published to a GitHub Release
(`PrayCalc-TV-{version}.apk` + `.sha256`) for direct-install/sideload. This is the fast,
no-store-review path — it does **not** touch the Play Store, tvOS App Store, or Amazon
Appstore.

### Step 4 — YOU: separately, submit to the stores (`release-tv.yml`, manual dispatch only)

`release-tv.yml` does not run on tag push — run it manually from the Actions tab
(`workflow_dispatch`: pick platform/profile/auto-submit) once EAS/store credentials exist. It
builds via EAS (Apple TV via the `PrayCalcTV-tvOS` scheme + Android TV) and can auto-submit to
App Store Connect and Google Play Console (Android TV listing on the same Play Console app
record as the phone/tablet listing — see the provisioning runbook § 3).

### Step 5 — YOU: Amazon Appstore (Fire TV)

Amazon has no EAS Submit integration and no automated lane at all. Download the signed APK
from the `release-tv-apk.yml` GitHub Release (Step 3 above) and follow
`.github/docs/fire-tv-submission.md` for the manual upload + listing steps. Requires a free
Amazon Developer account. See also `.github/docs/store-listing-tv.md` for the short-form
checklist covering Fire TV, Android TV, and tvOS submission mechanics together.

### Step 6 — YOU: Physical device QA

- [ ] Fire TV / Android TV: sideload the `release-tv-apk.yml` GitHub Release APK, test D-pad navigation, adhan overlay, TV pairing
- [ ] Apple TV: TestFlight (once tvOS platform + simulator/device testing is set up) → full smoke test

---

## Desktop release

Unaffected by this change — see `release-desktop.yml` directly; it already builds and
publishes signed installers per `desktop-v*` tag.

---

## Known environment gap (flagged during pipeline build-out)

Building `tv/`'s native iOS project locally requires the tvOS platform component installed
in Xcode (Settings → Platforms → tvOS, or `xcodebuild -downloadPlatform tvOS`) — it's a
~3.6 GB download not included by default with Xcode CLI tools on this machine. EAS Build
runs on Expo's own macOS build infrastructure, not a GitHub-hosted runner, so this gap may
not apply there at all — but this hasn't been verified against a real EAS build yet (no EAS
account existed when this pipeline was built). If the first real `release-tv.yml` run fails
on a missing-tvOS-platform error inside EAS's build logs, that confirms it needs handling on
Expo's side (file a support request with Expo, or fall back to a self-hosted macOS runner
with the platform pre-installed).
