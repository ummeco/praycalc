# macOS Distribution Guide

PrayCalc for macOS is a Swift Package Manager project (swift-tools-version 5.9) that builds a lightweight menubar app. It requires macOS 13.0+ and Xcode 15+.

## Building

### Swift Package Manager (CLI)

```bash
cd macos
swift build -c release
```

The binary is output to `.build/release/PrayCalcMenu`.

### Xcode

1. Open the `macos/` directory in Xcode (File > Open, select the folder containing `Package.swift`).
2. Select the `PrayCalcMenu` scheme.
3. Set your development team under Signing and Capabilities.
4. Build with Cmd+B or archive with Product > Archive.

## Code Signing with Developer ID

To distribute outside the Mac App Store, sign with a "Developer ID Application" certificate.

### Prerequisites

- An Apple Developer account ($99/year)
- A "Developer ID Application" certificate installed in your Keychain (create at developer.apple.com > Certificates, Identifiers & Profiles)

### Signing the App

After building or archiving:

```bash
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  --options runtime \
  build/PrayCalc.app
```

The `--options runtime` flag enables the hardened runtime, which is required for notarization.

To verify the signature:

```bash
codesign --verify --deep --strict --verbose=2 build/PrayCalc.app
spctl --assess --type exec --verbose build/PrayCalc.app
```

### Signing via Xcode Archive

1. Product > Archive
2. In the Organizer, select the archive > Distribute App
3. Choose "Developer ID" > "Upload" (for notarization) or "Export"
4. Xcode handles signing automatically using your team certificate

## Notarization

Apple requires notarization for all software distributed outside the App Store on macOS 10.15+. Users will see a Gatekeeper warning without it.

### Store Credentials (one-time setup)

```bash
xcrun notarytool store-credentials "praycalc-notary" \
  --apple-id "your@email.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "app-specific-password"
```

Generate the app-specific password at appleid.apple.com > Sign-In and Security > App-Specific Passwords.

### Submit for Notarization

Zip the signed app first:

```bash
ditto -c -k --keepParent build/PrayCalc.app build/PrayCalc.zip

xcrun notarytool submit build/PrayCalc.zip \
  --keychain-profile "praycalc-notary" \
  --wait
```

The `--wait` flag blocks until Apple returns a result (usually 2-5 minutes).

### Check Status

```bash
xcrun notarytool info <submission-id> --keychain-profile "praycalc-notary"
xcrun notarytool log <submission-id> --keychain-profile "praycalc-notary"
```

### Staple the Ticket

After notarization succeeds, staple the ticket to the app so it works offline:

```bash
xcrun stapler staple build/PrayCalc.app
```

## Creating a DMG

### Using create-dmg (recommended)

```bash
brew install create-dmg

create-dmg \
  --volname "PrayCalc" \
  --volicon "PrayCalcMenu/Assets.xcassets/AppIcon.appiconset/icon_512x512.png" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "PrayCalc.app" 175 190 \
  --app-drop-link 425 190 \
  "build/PrayCalc.dmg" \
  "build/PrayCalc.app"
```

### Using hdiutil (no extra dependencies)

```bash
# Create a temporary folder with the app and an Applications symlink
mkdir -p build/dmg-stage
cp -R build/PrayCalc.app build/dmg-stage/
ln -s /Applications build/dmg-stage/Applications

# Create the DMG
hdiutil create -volname "PrayCalc" \
  -srcfolder build/dmg-stage \
  -ov -format UDZO \
  build/PrayCalc.dmg

rm -rf build/dmg-stage
```

### Sign and Notarize the DMG

The DMG itself should also be signed and notarized:

```bash
codesign --force --sign "Developer ID Application: Your Name (TEAM_ID)" build/PrayCalc.dmg

xcrun notarytool submit build/PrayCalc.dmg \
  --keychain-profile "praycalc-notary" \
  --wait

xcrun stapler staple build/PrayCalc.dmg
```

## Distribution Outside the App Store

### GitHub Releases

1. Build, sign, notarize, and create the DMG (steps above).
2. Create a GitHub release at `github.com/ummeco/praycalc/releases`.
3. Attach the `.dmg` file to the release.
4. Users download, open the DMG, and drag PrayCalc.app to Applications.

### Homebrew Cask (future)

A Homebrew cask formula is planned. See `macos/README.md` for the draft cask definition. Once releases are published, submit the cask to `homebrew/homebrew-cask` or host in a custom tap.

### Update Checking

The app currently does not include auto-update. Users check for new versions on GitHub or praycalc.com. Sparkle framework integration is planned for a future release.

## Troubleshooting

**"PrayCalc.app is damaged and can't be opened"**: The app was not notarized or the ticket was not stapled. Re-run notarization and stapling steps.

**"PrayCalc.app can't be opened because Apple cannot check it for malicious software"**: Right-click the app > Open > Open. This bypasses Gatekeeper for a single launch. For permanent fix, notarize the app.

**Signing fails with "no identity found"**: Ensure your Developer ID Application certificate is installed in Keychain Access and not expired. Check with `security find-identity -v -p codesigning`.
