# PrayCalc Flutter Build Scripts

## build-signed-debug.sh

Builds a signed-debug APK using the Android debug keystore. No secrets required.

```bash
# Run from praycalc/flutter/
./scripts/build-signed-debug.sh
```

Output: `build/app/outputs/flutter-apk/app-debug.apk`

Signed with the auto-generated Gradle debug keystore (`~/.android/debug.keystore`). Suitable for internal testing via Play Store internal track. Not suitable for production Play Store upload.

Requirements:
- Flutter SDK on PATH
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` set

## build-android-release.sh

Builds an unsigned-release APK for external signing (production).

```bash
# Run from praycalc/flutter/
./scripts/build-android-release.sh
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

Production signing is user-managed per D-P3-28. The CI job in `.github/workflows/release.yml` also produces unsigned-release APKs as build artifacts via:
```bash
flutter build apk --release --no-obfuscate
```
CI artifact path: `build/app/outputs/flutter-apk/app-release.apk`

## shorebird-setup.sh

One-time Shorebird CLI setup for OTA (over-the-air) patch delivery. Run once per developer machine. Requires Shorebird account credentials.

## gen_city_db.mjs

Generates the city database used by the city search feature. Runs at build time — not a manual script.
