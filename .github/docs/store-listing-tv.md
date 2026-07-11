# PrayCalc TV — Store Submission Checklists (Fire TV / Android TV / tvOS)

Creative copy, keywords, and screenshot sizes live in `.github/docs/store-listing.md` (shared
with mobile). This doc is the **submission-mechanics checklist** for each TV storefront —
what to click, in what order, once you have the build artifact in hand. All three are
human-only steps: no AI agent can create accounts, accept terms, or click "Submit for review"
on your behalf.

Build sources:
- Fire TV / Android TV sideload APK → `release-tv-apk.yml` (`tv-v*` tag push) → GitHub Release
- Android TV Play Store listing + tvOS App Store → `release-tv.yml` (manual `workflow_dispatch`, EAS Build + Submit)

---

## Fire TV — Amazon Appstore

Same signed APK, no separate build. Full walkthrough (including the on-device test checklist
and store-asset manifest) lives in `.github/docs/fire-tv-submission.md` — this is the short
form for a repeat submission once the account/listing already exists.

- [ ] Amazon Developer account exists (developer.amazon.com — free, one-time)
- [ ] App record exists under Apps & Services → Amazon Appstore, package `com.ummeco.praycalc.tv`
- [ ] Download `PrayCalc-TV-{version}.apk` from the matching `tv-v*` GitHub Release
- [ ] Verify the `.sha256` checksum matches before uploading anywhere
- [ ] Upload the SAME APK to the app record's binary slot (Appstore Console → your app → Binary Files)
- [ ] Confirm listing copy/screenshots are current (`.github/docs/store-listing.md` + `assets/firetv/`)
- [ ] Submit for review (2-5 business days typical)

---

## Android TV — Google Play

Android TV is **not** a separate app record — it's a device form factor on the SAME Play
Console app listing as the phone/tablet app (`com.ummeco.praycalc.tv`, per the provisioning
runbook § 3.2). One listing, multiple device categories.

- [ ] Play Console app record exists for `com.ummeco.praycalc.tv` (provisioning runbook § 3.2)
- [ ] Store listing → main store listing → confirm "TV banner" is uploaded: **1280×720 px**,
      JPEG or 24-bit PNG (no alpha) — this is a DIFFERENT asset from the 1024×500 px
      "Feature graphic" mobile uses; Play rejects TV form-factor enablement without it
- [ ] Store listing → TV screenshots: at least 1, up to 8, **1920×1080 px** (see
      `.github/docs/store-listing.md` § Screenshots → Android TV / Fire TV)
- [ ] App content → confirm the app declares Android TV support (Play auto-detects the
      `<uses-feature android:name="android.software.leanback">` / `LEANBACK_LAUNCHER` intent
      filter from the APK/AAB — verify it shows up under App content → Device catalog → TV
      after the first upload; if it doesn't, the leanback manifest declaration is missing
      from `tv/android` and needs a source fix, not a store-console fix)
- [ ] Release → Testing/Production track → upload the build (via `release-tv.yml`
      `--auto-submit`, or manually if credentials aren't provisioned yet)
- [ ] First release only: complete the content rating questionnaire and data-safety form
      (blocks `--auto-submit` until done once, per provisioning runbook § 3.4)
- [ ] Submit for review

---

## tvOS — Apple App Store Connect

tvOS is a **universal purchase** companion platform on the SAME App Store Connect app record
as a corresponding iOS app where applicable — but PrayCalc TV has no iOS phone/tablet
counterpart (that's `mobile/`, a separate bundle ID `com.praycalc.praycalcApp`). So tvOS here
gets its OWN app record, bundle ID `com.ummeco.praycalc.tv` (provisioning runbook § 2.2) — not
a universal-purchase add-on to an existing record. Universal purchase only applies if a single
bundle ID needs to cover both iOS and tvOS binaries, which isn't this app's shape.

- [ ] Apple Developer Program enrollment active (provisioning runbook § 2.1)
- [ ] Bundle ID `com.ummeco.praycalc.tv` registered (provisioning runbook § 2.2)
- [ ] App Store Connect app record created for that bundle ID, platform = tvOS
- [ ] App Store Connect API key configured in `tv/eas.json`
      (`submit.production.ios.{ascApiKeyIssuerId,ascApiKeyId,appleTeamId,ascAppId}` — the
      `ascAppId` here is THIS app's own numeric ID, not mobile's)
- [ ] App record listing filled out: description, screenshots (`.github/docs/store-listing.md`
      § iPad sizes are the closest tvOS analog until dedicated 1920×1080 tvOS marketing
      screenshots exist — Apple requires tvOS-specific screenshot dimensions at submission
      time, check the current App Store Connect upload spec since Apple revises these), age
      rating, privacy policy URL (`https://praycalc.com/privacy`)
- [ ] Run `release-tv.yml` manually (`workflow_dispatch`, platform=`ios`, submit=`true`) —
      builds via the `PrayCalcTV-tvOS` Xcode scheme (tv/eas.json) and auto-submits to App
      Store Connect (lands in "Prepare for Submission" / TestFlight processing)
- [ ] First release only: complete App Store Connect's export compliance and content rights
      questions in the app record before Apple will accept the build for review
- [ ] Submit for review from App Store Connect once the build finishes processing

---

## See also

- `.github/docs/runbooks/mobile-tv-release-provisioning.md` — one-time account/credential setup
- `.github/docs/fire-tv-submission.md` — full Fire TV walkthrough + on-device test checklist
- `.github/docs/store-listing.md` — shared creative copy, keywords, screenshot sizes
- `.github/docs/release-checklist.md` — per-release AUTO vs YOU steps for every surface
