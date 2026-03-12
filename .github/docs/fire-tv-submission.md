# Fire TV — Amazon Appstore Submission Guide

## Prerequisites

1. Amazon Developer account ($99/year) — sign up at developer.amazon.com
2. Fire TV device for testing (or Fire TV emulator via Android Studio AVD)
3. PrayCalc amazon flavor APK built (`./flutter/amazon-build.sh`)

## Step 1 — Test on Device

Install and test the APK on a real Fire TV:

```bash
adb connect <fire-tv-ip>:5555
adb install flutter/build/app/outputs/flutter-apk/app-amazon-release.apk
adb shell monkey -p com.praycalc.app.amazon -c android.intent.category.LEANBACK_LAUNCHER 1
```

**Test checklist:**
- [ ] App launches from Fire TV home screen
- [ ] Prayer times display correctly (use GPS or manual location)
- [ ] D-pad navigation works through all screens
- [ ] Adhan overlay plays at prayer time (test with a 1-minute offset)
- [ ] TV pairing flow works (connect from phone)
- [ ] Quran audio plays correctly
- [ ] Settings can be configured without keyboard
- [ ] Children's mode works with D-pad
- [ ] App handles no-network gracefully (offline mode)

## Step 2 — Prepare Store Assets

See `assets/firetv/store-assets-manifest.md` for required assets.
Place finalized assets in `assets/firetv/` before submission.

## Step 3 — Amazon Appstore Console

1. Log in at developer.amazon.com, go to Appstore, then My Apps, then New App
2. **App information:**
   - Title: PrayCalc — Islamic Prayer Times
   - Category: Lifestyle > Religion & Spirituality
   - Content rating: Everyone
   - Package name: `com.praycalc.app.amazon`
3. **Availability & Pricing:** Free, All countries
4. **Description:** Copy from `assets/firetv/store-assets-manifest.md`
5. **Images:** Upload from `assets/firetv/`
6. **APK Upload:** Upload `app-amazon-release.apk`
7. **Device Support:** Select "Fire TV" (all generations), optionally Fire Tablet

## Step 4 — Submit for Review

Amazon review typically takes 2-5 business days.

During review, Amazon will test:
- App stability on Fire TV
- No prohibited content
- No unauthorized in-app purchases (our app is fully free)
- Proper Leanback launcher intent

## Step 5 — Post-Submission

After approval:
- App appears in Amazon Appstore under Lifestyle > Religion
- Deep link: `amzn://apps/android?p=com.praycalc.app.amazon`
- Web link: `https://www.amazon.com/dp/[ASIN]` (assigned after approval)

Update the PrayCalc website and README with the Amazon Appstore link.

## Notes

- Amazon Developer account costs $99/year — this is the FOR-USER blocker (FIRETV-4)
- The `amazon` flavor APK excludes Firebase/FCM since Fire TV has no Google Play Services
- Local notifications still work via flutter_local_notifications
- Prayer time calculations are identical to the Google Play version
