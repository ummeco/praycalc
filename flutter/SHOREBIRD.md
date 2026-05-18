# Shorebird Release Guide — praycalc Flutter

**App:** PrayCalc Flutter (`praycalc/flutter`)
**Platforms covered:** iOS and Android only (macOS/Windows/Linux/watchOS/tvOS use platform-native distribution)
**Sprint:** p9-sprint-MOBILE-PROD-READY T09

---

## Overview

Shorebird enables over-the-air (OTA) code patches for Flutter apps without submitting a new
App Store or Play Store build. The workflow is:

1. **Initial release** — submit a signed IPA/AAB through the App Store / Play Store once
2. **Ongoing patches** — push code-only updates via Shorebird without a new store review

Vault key: `SHOREBIRD_TOKEN` (stored in `~/.claude/vault.env`; do not commit)

---

## Prerequisites

```bash
# Install Shorebird CLI
curl --proto '=https' --tlsv1.2 https://raw.githubusercontent.com/shorebirdtech/install/main/install.sh -sSf | bash
echo "$HOME/.shorebird/bin" >> ~/.zshrc  # or ~/.bashrc

# Authenticate
shorebird login

# Verify shorebird.yaml app_id is populated
cat praycalc/flutter/shorebird.yaml
```

Also required for initial iOS release:
- Apple distribution certificate in Keychain
- App Store provisioning profile (distribution) in Xcode
- Apple Developer Team ID (from developer.apple.com)

---

## Step 1 — Initial Binary Submission (one time per platform)

The initial App Store / Play Store submission requires a signed binary. Use `shorebird release`
which produces a Shorebird-patching-enabled IPA/AAB.

### iOS

```bash
cd praycalc/flutter

# Produces a Shorebird-enabled signed IPA for App Store submission
shorebird release ios

# Upload the .ipa to App Store Connect via Transporter or Xcode Organizer
# The IPA is at: build/ios/ipa/praycalc.ipa (or similar)
```

### Android

```bash
cd praycalc/flutter

# Produces a Shorebird-enabled signed AAB for Play Store submission
shorebird release android --flavor google -t lib/main.dart

# Upload to Play Console → Internal Testing track
# The AAB is at: build/app/outputs/bundle/googleRelease/app-google-release.aab
```

After the store review approves the initial build, all subsequent code-only updates can be
shipped via `shorebird patch` (Step 2) without a new store review.

---

## Step 2 — OTA Patches (ongoing)

For code-only updates (Dart changes that do not require a new native binary):

```bash
# Patch iOS (ships immediately to live users)
cd praycalc/flutter
shorebird patch ios

# Patch Android
shorebird patch android --flavor google -t lib/main.dart
```

CI runs `shorebird patch` automatically on every push to `main` via
`.github/workflows/flutter-ci.yml` (`shorebird-patch-android` and `shorebird-patch-ios` jobs).

**Note:** The CI patch step uses `continue-on-error: true` because patching fails if there is
no existing Shorebird release yet (before Step 1 is complete).

---

## Step 3 — New Store Build (when required)

A new store submission (Step 1 again) is required when:
- A new native plugin is added or updated
- A Flutter engine update changes the native surface
- A major version bump requiring new store metadata

```bash
shorebird release ios    # or android
# Then upload to App Store / Play Console as a new version
```

---

## Certificate Management

See the "Certificate Management" section in this file for fastlane Match setup.

### fastlane Match (iOS cert rotation)

`flock/apps/mobile/fastlane/` contains a reference Match configuration. For praycalc:

1. Initialize Match for the praycalc bundle ID:
   ```bash
   cd praycalc/flutter/ios
   fastlane match init
   # Storage: git, URL: git@github.com:ummeco/ios-certs.git
   ```

2. Fetch certs before each release build:
   ```bash
   fastlane match appstore  # downloads distribution cert + profile
   ```

3. Required env vars: `MATCH_PASSWORD`, `APPLE_TEAM_ID`, `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`

---

## Shorebird CI Secrets Required

| Secret name | Description |
|---|---|
| `SHOREBIRD_TOKEN` | Shorebird authentication token (from `shorebird login --ci`) |
| `GOOGLE_SERVICES_JSON` | base64-encoded `google-services.json` for Android flavor |
| `GOOGLE_SERVICE_INFO_PLIST` | base64-encoded `GoogleService-Info.plist` for iOS |

---

## Official Shorebird Documentation

- [Shorebird CLI reference](https://docs.shorebird.dev/reference/cli)
- [Initial release guide](https://docs.shorebird.dev/guides/code-push)
- [CI/CD integration](https://docs.shorebird.dev/ci-cd)
- [Android flavors](https://docs.shorebird.dev/guides/flavors)
