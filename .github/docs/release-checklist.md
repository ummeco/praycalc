# PrayCalc Release Checklist

Everything the release workflows handle automatically is marked **AUTO**. Your required
actions are marked **YOU**. Releases are per-surface now, not one unified pipeline — each
surface has its own tag prefix and its own workflow:

| Surface | Workflow | Tag prefix | Stack |
| --- | --- | --- | --- |
| Mobile (iOS + Android phone/tablet) | `release-mobile.yml` | `mobile-v*` | React Native + Expo SDK 53, EAS Build + Submit |
| TV (Apple TV + Android TV + Fire TV) | `release-tv.yml` | `tv-v*` | react-native-tvos (bare), EAS Build + Submit |
| Desktop (macOS/Windows/Linux) | `release-desktop.yml` | `desktop-v*` | Tauri 2 |
| Web | Vercel auto-deploy on push to `main` | — | Next.js (migrating to Astro per D-P2-STACK-CANON) |

`flutter/` is an archived reference only (ADR-P8-09 superseded 2026-06-28) — its old
`release.yml` pipeline is disabled and does not run. watchOS (`watchos/`) and Wear OS
(`wearos/`) are native Swift/Kotlin scaffolds with no CI/release automation yet; they ship
manually through Xcode/Android Studio when their own work resumes.

**One-time account/credential setup:** see
`.github/docs/runbooks/mobile-tv-release-provisioning.md` — do that first, this checklist
assumes it's done.

---

## Mobile release

### Step 1 — YOU: Verify locally

```bash
cd mobile && pnpm typecheck && pnpm lint && pnpm test
```

### Step 2 — YOU: Bump version and tag

```bash
# bump mobile/app.json's "version" field, commit
git tag mobile-v2.0.1
git push origin mobile-v2.0.1
```

### Step 3 — AUTO: what `release-mobile.yml` does

EAS Build (iOS + Android, production profile) → auto-submit to App Store Connect (TestFlight
processing → manual release from there) and Google Play Console (internal track by default —
promote manually to production once verified).

### Step 4 — YOU: first-release-only manual steps

- App Store Connect: fill out the listing (screenshots, description, age rating, privacy
  policy URL — see `.github/docs/store-listing.md`) before the build can go to review.
- Play Console: the very first version of any app must go through the console UI once
  (content rating questionnaire, data-safety form) before `--auto-submit` works for
  subsequent versions.

---

## TV release

### Step 1 — YOU: Verify locally

```bash
cd tv && pnpm typecheck && pnpm lint && pnpm test
```

### Step 2 — YOU: Bump version and tag

```bash
# bump tv/app.json's "version"/"android.versionCode", commit
git tag tv-v0.2.0
git push origin tv-v0.2.0
```

### Step 3 — AUTO: what `release-tv.yml` does

EAS Build (Apple TV via the `PrayCalcTV-tvOS` scheme + Android TV) → auto-submit to App Store
Connect and Google Play Console, same as mobile. The Android APK is also uploaded as a
downloadable workflow artifact (`praycalc-tv-android-apk`) for manual Fire TV submission.

### Step 4 — YOU: Amazon Appstore (Fire TV)

Amazon has no EAS Submit integration. Download the `praycalc-tv-android-apk` artifact from
the workflow run and follow `.github/docs/fire-tv-submission.md` for the manual upload +
listing steps. Requires a free Amazon Developer account.

### Step 5 — YOU: Physical device QA

- [ ] Fire TV / Android TV: sideload the APK artifact, test D-pad navigation, adhan overlay, TV pairing
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
