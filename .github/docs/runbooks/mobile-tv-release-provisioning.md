# Mobile + TV Release Provisioning Runbook

This is the replacement for the retired Flutter release pipeline (`release.yml`, disabled).
`release-mobile.yml` and `release-tv.yml` build and submit via EAS Build + Submit. Neither
workflow can do anything useful until the accounts and secrets below exist — this doc is the
one-time setup. Do it once; releases after that are just `git tag && git push`.

Direct-install (no store account needed) sideload APKs are a SEPARATE, already-working
pipeline for both apps — `release-mobile-apk.yml` (`mobile-v*` tags) and `release-tv-apk.yml`
(`tv-v*` tags) — and need none of the setup below; they only need
`PRAYCALC_ANDROID_KEYSTORE_B64` + `PRAYCALC_ANDROID_KEYSTORE_PASSWORD` (already provisioned).
This doc covers store submission (EAS/App Store/Play Store/Amazon) only.

Nothing here can be done by an AI agent on your behalf: account creation needs your identity,
payment method, and 2FA; only you can complete it.

---

## 0. What you're setting up, at a glance

| Account | Cost | Unlocks | Shared across mobile + tv? |
| --- | --- | --- | --- |
| Expo/EAS | Free | Build + submit infrastructure for both apps | Yes — one org, two EAS projects |
| Apple Developer Program | $99/year | iOS/tvOS builds, App Store + tvOS App Store submission | Yes — one team, two app records |
| Google Play Console | $25 one-time | Android + Android TV submission | Yes — one account, two app listings |
| Amazon Developer | Free | Fire TV submission (tv/ only) | tv/ only |

---

## 1. Expo/EAS account + projects

1. Create a free account at expo.dev (use an org account if `ummeco` already has one — check before making a personal one).
2. Install the CLI locally once: `npx eas-cli login`.
3. From `mobile/`, run `eas init` — this creates a real EAS project and writes the real project ID into `mobile/app.json`'s `extra.eas.projectId` (currently `UD-PENDING-EAS-PROJECT-ID`).
4. From `tv/`, run `eas init` — same thing, but note `tv/app.json` is NOT an Expo config (tv/ is a bare project), so `eas init` here just registers the project with EAS's backend; it won't try to write an `extra.eas` block into a non-Expo app.json. If `eas init` complains about missing Expo config, use `eas project:init` instead, which only requires an `eas.json` (already present).
5. Generate a robot-account access token for CI: `eas credentials --platform android` won't do this — instead go to expo.dev → account settings → Access Tokens → create a token scoped to the `ummeco` org. This is the value for the `EXPO_TOKEN` GitHub secret (see § 5).

---

## 2. Apple Developer Program

1. Enroll at developer.apple.com/programs ($99/year, needs a legal name/DUNS number if enrolling as an organization rather than an individual — budget a few days if Apple needs to verify an org).
2. Once enrolled, in App Store Connect (appstoreconnect.apple.com):
   - **Register two Bundle IDs** (Certificates, Identifiers & Profiles → Identifiers → +):
     - `com.praycalc.praycalcApp` (mobile — must match the archived Flutter app's bundle ID exactly, per `mobile/docs/DEPLOYMENT.md` FGAP-08, so the App Store listing continues rather than forking into a new one)
     - `com.ummeco.praycalc.tv` (tv — new tvOS app record)
   - **Create two App Store Connect app records** (My Apps → +), one per bundle ID above. Each gets its own `ascAppId` (a numeric App Store Connect app ID) — copy both.
3. **Generate an App Store Connect API key** (Users and Access → Integrations → App Store Connect API → +):
   - Role: App Manager (enough to build/submit; doesn't need Admin).
   - Download the `.p8` file **immediately** — Apple only lets you download it once.
   - Note the Key ID and Issuer ID shown next to it.
   - This ONE key works for both apps (it's scoped to your team, not a single app) — you do not need a second key for tv/.
4. Note your **Apple Team ID** (Membership tab, a 10-character alphanumeric string).
5. **iOS/tvOS signing certificates and provisioning profiles do NOT need to be exported or stored in GitHub.** Run `eas credentials` locally once per app (from `mobile/` and separately from `tv/`), log in with the same Apple ID, and let EAS generate and store the distribution certificate + provisioning profile in EAS's own credential store. CI builds reference the EAS project, not a local secret — this is the whole point of EAS-managed credentials, and it's why this repo has no `.p12`/`.mobileprovision` secrets anymore (the old `release-checklist.md`'s `IOS_CERTIFICATES_P12` etc. secrets are obsolete under this pipeline).

---

## 3. Google Play Console

1. Register at play.google.com/console ($25 one-time, personal or org account — pick whichever should own both listings long-term).
2. **Create two apps** (All apps → Create app):
   - Package name `com.praycalc.praycalcApp` (mobile) — again, matches the archived Flutter app so this becomes an update to the existing listing, not a new one.
   - Package name `com.ummeco.praycalc.tv` (tv — list it under both "Phone/tablet" and "TV" device categories in Play Console's form factor settings, since Android TV distribution is a checkbox on a normal app listing, not a separate app).
3. **Create a service account for CI uploads** (Play Console → Setup → API access → Create new service account → follow the link to Google Cloud Console):
   - In Google Cloud Console, create a service account, grant it a JSON key, download it.
   - Back in Play Console, grant that service account **Release manager** permission (Users and permissions), scoped to both apps (or "All apps" if you don't want to redo this per app).
   - The downloaded JSON is the value for `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (mobile) — you can reuse the SAME service account JSON for tv/'s `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_TV` secret, since it's one Play Console account either way. Two separate secret names exist only so the two workflows don't share a literal secret reference (rotate independently if you ever want to).
4. Each app needs at least one manual upload through the Play Console UI before EAS Submit can auto-upload to it (Play requires the FIRST version of any app to go through the console once, to set up the store listing, content rating questionnaire, and data-safety form). Do this manually for the first release; every version after that can go through `--auto-submit`.

---

## 4. Amazon Developer account (tv/ only, for Fire TV)

1. Register at developer.amazon.com (free).
2. Create an app under Apps & Services → Amazon Appstore → Add New App, package name `com.ummeco.praycalc.tv`.
3. There is no EAS Submit integration for Amazon, and no automated submission lane at all. Amazon reviewers accept a plain signed APK — use the signed, checksummed, versioned APK that `release-tv-apk.yml` (a plain Gradle build, `tv-v*` tag push) publishes to the tag's GitHub Release. Download it from `github.com/ummeco/praycalc/releases` and upload it manually via the Amazon Developer Console. See `.github/docs/fire-tv-submission.md` for the full manual submission walkthrough (store listing text, screenshots, review process).
4. If Amazon submissions become frequent enough to automate, Amazon does have an Appstore Submission API using OAuth "security profile" client credentials — that's a follow-up, not part of this pipeline yet.

---

## 5. GitHub Secrets to create

Settings → Secrets and variables → Actions → New repository secret. These replace the old
Flutter-era secrets (`GOOGLE_SERVICES_JSON`, `GOOGLE_SERVICE_INFO_PLIST`, `SHOREBIRD_TOKEN`) —
delete those once this pipeline is confirmed working, they're Firebase/Shorebird artifacts this
stack doesn't use (no Firebase per D-P3-41).

| Secret | Value | Used by |
| --- | --- | --- |
| `EXPO_TOKEN` | The EAS robot access token from § 1.5 | Both workflows |
| `ASC_API_KEY_P8` | The `.p8` file from § 2.3, base64-encoded: `base64 -i AuthKey_XXXXX.p8 \| pbcopy` | Both workflows |
| `ASC_API_KEY_ISSUER_ID` *(goes in eas.json, not a GH secret — see note below)* | Issuer ID from § 2.3 | — |
| `ASC_API_KEY_ID` *(goes in eas.json, not a GH secret — see note below)* | Key ID from § 2.3 | — |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Full contents of the service account JSON from § 3.3 | `release-mobile.yml` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_TV` | Same JSON (or a second service account) | `release-tv.yml` |

**Note on `mobile/eas.json` / `tv/eas.json` `UD-PENDING-*` placeholders:** the Issuer ID, Key ID,
Apple Team ID, and ASC App IDs are not secrets (they're not credentials by themselves — they're
just identifiers) and are meant to be committed directly into `eas.json`, replacing the
`UD-PENDING-*` placeholders once you have the real values from §§ 1-2. Only the `.p8` key file
itself and the Play service account JSON are secret material and belong in GitHub Secrets.

Fill in, per app:
- `mobile/eas.json` → `submit.production.ios.{ascApiKeyIssuerId,ascApiKeyId,appleTeamId,ascAppId}`
- `mobile/app.json` → `expo.extra.eas.projectId`
- `tv/eas.json` → same four `submit.production.ios.*` fields (issuer/key/team are the same values as mobile since it's one Apple team; `ascAppId` is the TV app's own numeric ID)

---

## 6. First release, end to end

1. Complete §§ 1-5 above.
2. Bump `mobile/app.json`'s `version` (and/or `tv/app.json`'s `version`), commit.
3. `git tag mobile-v2.1.0 && git push origin mobile-v2.1.0` (or `tv-v0.2.0` for the TV app).
   - For **mobile**, this tag ONLY triggers `release-mobile-apk.yml` (the signed direct-install
     APK on GitHub Releases) — it does not touch EAS or the stores. To submit to the App Store /
     Play Store, run `release-mobile.yml` manually from the Actions tab (`workflow_dispatch`) once
     you're ready; it is not tag-triggered.
   - For **tv**, the tag pattern mirrors mobile exactly (no more asymmetry): `tv-v*` ONLY
     triggers `release-tv-apk.yml` (a plain Gradle build → signed direct-install APK on
     GitHub Releases, for Android TV / Fire TV sideload — no EAS account needed). To submit
     to the Google Play (Android TV listing) or the tvOS App Store, run `release-tv.yml`
     manually from the Actions tab; it is not tag-triggered either. Amazon Appstore (Fire TV)
     has no automated submission lane either way — download the `release-tv-apk.yml` GitHub
     Release APK and follow `.github/docs/fire-tv-submission.md`.
4. Watch the run at `github.com/ummeco/praycalc/actions`. First run of each app needs a manual Play Console pass (§ 3.4) and, for iOS, the app must be in "Prepare for Submission" state in App Store Connect with a filled-out listing (screenshots, description, age rating, privacy policy URL — see `.github/docs/store-listing.md`) before `--auto-submit` can push it to review.
5. First-time Apple/Google review can take longer than routine updates (a few days is normal for a first submission, especially if manual human review flags anything). Budget for at least one rejection-and-resubmit cycle — this is normal for first submissions, not a sign anything is broken.

---

## See also

- `.github/docs/store-listing.md` — listing copy, screenshots, keywords (bundle IDs already updated to the RN package names)
- `.github/docs/store-listing-tv.md` — Fire TV / Android TV / tvOS submission-mechanics checklists
- `.github/docs/fire-tv-submission.md` — Amazon Appstore manual submission walkthrough
- `.github/docs/release-checklist.md` — per-release checklist (rewritten for this pipeline)
- `mobile/docs/DEPLOYMENT.md` — mobile-specific rollout/rollback strategy, bundle ID continuity rationale
