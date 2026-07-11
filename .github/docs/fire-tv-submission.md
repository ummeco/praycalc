# Fire TV — Amazon Appstore Submission Guide

## Prerequisites

1. Amazon Developer account (free) — sign up at developer.amazon.com
2. Fire TV device for testing (or Fire TV emulator via Android Studio AVD)
3. PrayCalc TV signed APK — download the `PrayCalc-TV-{version}.apk` asset from the matching
   `tv-v*` GitHub Release (built by `release-tv-apk.yml`, a plain Gradle build — no EAS account
   needed). Verify the download against the release's `.sha256` file before installing.

## Step 1 — Test on Device

Install and test the APK on a real Fire TV:

```bash
adb connect <fire-tv-ip>:5555
adb install praycalc-tv-android.apk
adb shell monkey -p com.ummeco.praycalc.tv -c android.intent.category.LEANBACK_LAUNCHER 1
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
   - Package name: `com.ummeco.praycalc.tv`
3. **Availability & Pricing:** Free, All countries
4. **Description:** Copy from `.github/docs/store-listing.md`
5. **Images:** See `.github/docs/store-listing.md` § Screenshots (Android TV / Fire TV section)
6. **APK Upload:** Upload the `PrayCalc-TV-{version}.apk` asset downloaded from the matching `tv-v*` GitHub Release (`release-tv-apk.yml`)
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
- Deep link: `amzn://apps/android?p=com.ummeco.praycalc.tv`
- Web link: `https://www.amazon.com/dp/[ASIN]` (assigned after approval)

Update the PrayCalc website and README with the Amazon Appstore link.

## Notes

- Amazon Developer registration itself is free (no annual fee, unlike Apple's Developer Program)
- No Firebase/FCM in this stack at all (D-P3-41) — push notifications go through the nSelf push plugin, which doesn't depend on Google Play Services, so this isn't Fire-TV-specific handling
- Prayer time calculations are identical to the Google Play / App Store versions (same `@acamarata/pray-calc` engine across every surface)
