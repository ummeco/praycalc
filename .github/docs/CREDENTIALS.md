# Credentials & Placeholder Checklist

Single source of truth for every placeholder, secret, and pending credential across PrayCalc's
release pipelines and legal pages. For each row: what it is, where it gets pasted, who has to
provide it, and which workflow/page consumes it. Setup walkthroughs for the store-account rows
live in `.github/docs/runbooks/mobile-tv-release-provisioning.md` — this file is the flat
checklist, that runbook is the step-by-step guide.

Nothing in this file can be provisioned by an AI agent: account creation needs a human identity,
payment method, and 2FA (mobile-tv-release-provisioning.md § intro).

---

## Store submission (mobile + tv)

| Placeholder / secret | File / location | Who provides | Consumed by |
|---|---|---|---|
| `EXPO_TOKEN` | GitHub repo secret (Settings → Secrets and variables → Actions) | User — EAS robot access token from expo.dev → account settings → Access Tokens, scoped to the `ummeco` org | `release-mobile.yml`, `release-tv.yml` |
| `extra.eas.projectId` (currently `UD-PENDING-EAS-PROJECT-ID`) | `mobile/app.json` line 153 | User — created by running `eas init` from `mobile/` once an Expo/EAS org account exists | EAS build/submit for `mobile/` |
| `ASC_API_KEY_P8` | GitHub repo secret | User — App Store Connect API key `.p8` file, base64-encoded (`base64 -i AuthKey_XXXXX.p8`) | `release-mobile.yml`, `release-tv.yml` |
| `ascApiKeyIssuerId` (`UD-PENDING-ASC-API-KEY-ISSUER-ID`) | `mobile/eas.json` line 42, `tv/eas.json` line 43 | User — Issuer ID from the same App Store Connect API key (not a GH secret; committed directly, it's an identifier, not a credential) | EAS build/submit, both apps |
| `ascApiKeyId` (`UD-PENDING-ASC-API-KEY-ID`) | `mobile/eas.json` line 43, `tv/eas.json` line 44 | User — Key ID from the same API key (not a GH secret) | EAS build/submit, both apps |
| `appleTeamId` (`UD-PENDING-APPLE-TEAM-ID`) | `mobile/eas.json` line 44, `tv/eas.json` line 45 | User — Apple Developer "Membership" tab, 10-char alphanumeric (not a GH secret) | EAS build/submit, both apps |
| `ascAppId` (`UD-PENDING-ASC-APP-ID`) | `mobile/eas.json` line 45 | User — numeric App Store Connect app ID for the `com.praycalc.praycalcApp` record (not a GH secret) | EAS submit, `mobile/` |
| `ascAppId` (`UD-PENDING-ASC-APP-ID-TV`) | `tv/eas.json` line 46 | User — numeric App Store Connect app ID for the `com.ummeco.praycalc.tv` record (not a GH secret) | EAS submit, `tv/` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | GitHub repo secret **and** Vercel project `ummat-praycalc` env var | User — Play Console service-account JSON (Setup → API access) | `release-mobile.yml` (GH secret); backend IAP receipt validation (Vercel env var, per `.claude/docs/PLAY-DATA-SAFETY.md` — vault key `PRAYCALC_GOOGLE_PLAY_SA_JSON`) |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_TV` | GitHub repo secret | User — same service account JSON (or a second one) | `release-tv.yml` |
| Amazon Appstore account (Fire TV) | No secret — manual upload only | User — free registration at developer.amazon.com; no EAS Submit integration exists for Amazon | Manual: download signed APK from `release-tv-apk.yml`'s `tv-v*` GitHub Release, upload via Amazon Developer Console (`.github/docs/fire-tv-submission.md`) |

## Signing — already provisioned (no action needed)

| Placeholder / secret | File / location | Status | Consumed by |
|---|---|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` + `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | GitHub repo secrets | **DONE** — confirmed live since desktop v1.2.3 | `release-desktop.yml` (signs the Tauri updater manifest) |
| `PRAYCALC_ANDROID_KEYSTORE_B64` + `PRAYCALC_ANDROID_KEYSTORE_PASSWORD` (alias `praycalc`) | GitHub repo secrets | **DONE** | `release-mobile-apk.yml`, `release-tv-apk.yml` (direct-install APK signing) |

## Signing — optional, not yet configured

| Placeholder / secret | File / location | Status | Consumed by |
|---|---|---|---|
| macOS notarization (Apple ID app-specific password + Team ID, or a "Developer ID Application" cert) | Not present in `release-desktop.yml`; would need new GitHub secrets (e.g. `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `APPLE_CERTIFICATE` + password) | Optional — desktop currently ships Tauri-updater-signed but not Apple-notarized DMGs; users see a Gatekeeper warning on first launch | Would gate into `release-desktop.yml`'s macOS build steps if pursued. Unrelated to the separate `macos/` Swift menubar app's own notarization guide (`.github/docs/macos-distribution.md`), which already documents the process for that target. |
| Windows Authenticode code-signing cert | Not present in `release-desktop.yml`; would need new GitHub secrets (e.g. `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`) | Optional — desktop currently ships Tauri-updater-signed but not Authenticode-signed installers; users see a SmartScreen warning on first run | Would gate into `release-desktop.yml`'s Windows build steps if pursued |

## Legal entity placeholders (from `web/src/pages/legal/california.astro`, ticket U-15)

| Placeholder | Resolution |
|---|---|
| `[COMPANY LEGAL NAME]` | **Resolved with real data — not a placeholder.** Entity is **Ummeco LLC**, confirmed across `legal/privacy-policy.md` (`{{ENTITY_NAME}}` = Ummeco LLC), `legal/terms-of-service.md` (`{{GOVERNING_LAW_STATE}}` = Delaware), and the canonical `~/.claude/references/business-info.md`. |
| `[BUSINESS ADDRESS]` | **Resolved with real data.** 1679 S. Dupont Hwy, Suite 100, Dover, DE 19901 (canonical Delaware registered-agent address, `~/.claude/references/business-info.md`) — used as the CPRA principal-place-of-business disclosure. |
| `[STATE OF FORMATION]` | **Resolved with real data.** Delaware, consistent with the registered-agent address above and `terms-of-service.md`'s governing-law state. |

No `[COMPANY...]`-style placeholders remain in `california.astro` — real entity data was found in-repo, so the ticket's placeholder fallback was not needed. Attorney review of this CCPA copy is still welcome; it was applied as standard boilerplate per owner direction 2026-07-12 (see the HTML comments in `california.astro` for the exact note).

## Other human-gated items (tracked in `.claude/tasks/active.md`, not new secrets — listed here for completeness)

| Item | Status |
|---|---|
| `npm publish homebridge-praycalc` | Authorized by owner (2026-07-12); separate from this checklist — tracked in `.claude/tasks/active.md` item 1, not a store/legal credential |
| HACS `hacs/default` PR | Gated on `smart/homeassistant/HACS.md` gaps (release-asset workflow — now added, see `validate-ha.yml` — plus repo topics + a human PR) |
