# PrayCalc Release Checklist — v1.1.0

Everything the release workflow handles automatically is marked **AUTO**. Your required actions are marked **YOU**.

---

## One-Time Setup (do once, never again)

### GitHub Secrets (Settings → Secrets and variables → Actions)

Add these secrets to unlock full CI automation:

| Secret | How to get it | Unlocks |
| --- | --- | --- |
| `GOOGLE_SERVICES_JSON` | Firebase Console → Project Settings → Android app → `google-services.json` → `base64 -i file` | Android builds |
| `GOOGLE_SERVICE_INFO_PLIST` | Firebase Console → Project Settings → iOS app → `GoogleService-Info.plist` → `base64 -i file` | iOS builds |
| `SHOREBIRD_TOKEN` | `shorebird login` on your machine | OTA updates (Android + iOS) |
| `IOS_CERTIFICATES_P12` | Keychain Access → export Distribution cert → `base64 -i cert.p12` | Signed iOS release |
| `IOS_CERTIFICATES_P12_PASSWORD` | Password you set when exporting the .p12 | Signed iOS release |
| `IOS_PROVISIONING_PROFILE` | Download from developer.apple.com → `base64 -i file.mobileprovision` | Signed iOS release |
| `KEYCHAIN_PASSWORD` | Any strong random string | Signed iOS release |
| `MACOS_CERTIFICATES_P12` | Export "Developer ID Application" cert from Keychain → `base64 -i cert.p12` | macOS signed DMG |
| `MACOS_CERTIFICATES_P12_PASSWORD` | Password for the macOS .p12 | macOS signed DMG |
| `MACOS_KEYCHAIN_PASSWORD` | Any strong random string | macOS signed DMG |
| `APPLE_ID` | Your Apple ID email | macOS notarization |
| `APPLE_TEAM_ID` | developer.apple.com → Membership → Team ID | macOS notarization |
| `APPLE_APP_PASSWORD` | appleid.apple.com → App-Specific Passwords → Generate | macOS notarization |

Without signing secrets, the workflow still builds and packages everything — macOS/Windows/Linux artifacts are always produced. iOS signed IPA requires the iOS cert secrets.

---

## Release Steps

### Step 1 — YOU: Verify locally

```bash
cd flutter && dart analyze && flutter test
cd ../smart && pnpm build
```

### Step 2 — YOU: Push tag

```bash
git tag v1.1.0
git push origin v1.1.0
```

The release workflow runs automatically. It takes about 15-20 minutes. Watch progress at:
`github.com/ummeco/praycalc/actions`

### Step 3 — AUTO: What the workflow produces

| Platform | Artifact | Notes |
| --- | --- | --- |
| Android (Google Play) | AAB + Shorebird release created | Ready for Play Console upload |
| Android (Amazon) | APK | Ready for Amazon Appstore upload |
| iOS | Shorebird release created | IPA in App Store Connect if certs set |
| macOS | `PrayCalc.dmg` | Signed + notarized if certs set |
| Windows | `PrayCalc-Windows.zip` | Extract and run `praycalc_app.exe` |
| Linux | `.deb` + `.tar.gz` | Install with `dpkg -i` |
| Smart server | Docker image pushed to `ghcr.io/ummeco/praycalc-smart` | Pull on Hetzner to deploy |
| GitHub Release | All artifacts attached with changelog | Public download page |

### Step 4 — YOU: Submit to stores

**Google Play Console** — `play.google.com/console`

1. Production → Create new release → Upload the `.aab` from GitHub Release
2. Release notes → paste from `CHANGELOG.md`
3. Submit for review

**App Store Connect** — `appstoreconnect.apple.com`

1. If iOS certs were set: Shorebird already uploaded the IPA. Go to TestFlight → validate → submit for review.
2. If not: `shorebird release ios` on your Mac, then upload via Xcode Organizer.

**Amazon Appstore** — `developer.amazon.com`

1. Upload APK from GitHub Release
2. Use copy from `assets/firetv/store-assets-manifest.md`
3. See `fire-tv-submission.md` for full steps
4. Requires $99/year Amazon Developer account

### Step 5 — YOU: Deploy smart server

```bash
ssh root@159.69.190.92
docker pull ghcr.io/ummeco/praycalc-smart:1.1.0
docker stop praycalc-smart && docker rm praycalc-smart
docker run -d --name praycalc-smart \
  --network ummat_network \
  --env-file /root/praycalc-smart/.env \
  -p 4010:4010 \
  ghcr.io/ummeco/praycalc-smart:1.1.0
```

### Step 6 — YOU: Physical device QA

- [ ] Fire TV: `adb install` amazon APK → test D-pad, adhan, TV pairing, Quran
- [ ] Android phone: install from Play Console internal track → full smoke test
- [ ] iOS: TestFlight → install → full smoke test

---

## Platform-Specific Blockers

### watchOS

Source files are complete at `flutter/ios/PrayCalcWatch/`. Xcode wiring required:

1. Open `flutter/ios/Runner.xcworkspace` in Xcode
2. File → New → Target → watchOS → Watch App for iOS App
3. Follow `flutter/ios/PrayCalcWatch/README.md` step by step

### tvOS (Apple TV)

Native Swift app at `flutter/ios/PrayCalcTV/PrayCalcTV.xcodeproj`. To submit:

1. Open in Xcode → Signing & Capabilities → set your Development Team
2. Product → Archive → Distribute → App Store Connect → upload
3. Add icons: `icon-1280x768.png` (App Icon), `shelf-400x240.png`, `shelf-1920x720.png`

Place in `flutter/ios/PrayCalcTV/Assets.xcassets/AppIcon.brandassets/`

### macOS (Desktop)

DMG is auto-built by the release workflow. For notarization, add the 3 `APPLE_*` secrets.
For Mac App Store submission (separate from direct DMG distribution):

1. Create a Mac App Store provisioning profile at developer.apple.com
2. Add `MACOS_APP_STORE_PP` secret
3. Archive via Xcode → Distribute → Mac App Store

---

## Status at v1.1.0

| Platform | Code | Build | Store-ready |
| --- | --- | --- | --- |
| Web | ✅ | ✅ Vercel auto | ✅ Live |
| Android (Google Play) | ✅ | ✅ AUTO | YOU: upload AAB |
| Android (Amazon Fire TV) | ✅ | ✅ AUTO | YOU: $99 acct + upload |
| WearOS | ✅ | ✅ bundled | YOU: upload with Android |
| iOS | ✅ | ✅ AUTO (if certs set) | YOU: submit in ASC |
| macOS | ✅ | ✅ AUTO (DMG) | YOU: notarize if needed |
| Windows | ✅ | ✅ AUTO (ZIP) | YOU: upload to website |
| Linux | ✅ | ✅ AUTO (.deb + tar.gz) | YOU: upload to website |
| tvOS | ✅ code | YOU: Xcode Archive | YOU: submit in ASC |
| watchOS | ✅ source | YOU: Xcode wiring | YOU: submit with iOS |
