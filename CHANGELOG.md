## [Unreleased] — 2026-07-08 — Account-linked TV control

### Added
- TV: unpaired TVs show a 6-digit code on launch; a paired TV syncs settings from `pc_tv_settings` on a ~5s poll instead of only reading local storage
- Web, desktop, mobile: each surface can now add a TV by entering its code (web: account page; desktop: menu-bar app "My TVs" tab; mobile: Pair TV screen) and edit its full settings, including deep display settings — countdown takeover, per-prayer iqama times, prayer-name-only mode
- Backend: `pc_tv_pairing` claim-by-PIN preserves the TV's own `device_id`; `pc_tv_settings` is the single control plane per TV, public-read by `device_id` for the TV, user-owned writes for the account surfaces
- Web: `/api/tvs` proxies all TV data through a server-side Ummat+ check, no direct Hasura calls from the browser

### Notes
- Multiple TVs per account are supported (masjids running several screens manage them all from one place)
- Mawlid is intentionally excluded from all TV content

---

## [Unreleased] — 2026-07-02 — P4: Ummat Accounts + Ummat+

### Added
- Web: real Hasura Auth sign-in/sign-up (replaces the mock auth stub), account island, `/upgrade` and `/upgrade/success` pages, Ummat+ badge and billing status
- Mobile: real sign-up/sign-in (the register tab was previously mis-wired to the login mutation), entitlement fetch, "Pair TV" screen (writes `pc_tv_pairing`), `praycalc://pair` deep link
- Desktop: Account tab (sign in/up, entitlement badge, sign out, opens `/upgrade`), CSP updated for the auth endpoint, session persisted in the Tauri store
- Smart home: `requirePlus` middleware (`402 ummat_plus_required`) on Google Home / Alexa account linking and on device/token routes
- Backend (`ummat/backend`): migration formalizing the 5 `pc_` tables; Hasura Plus-gate on `pc_tv_pairing` (INSERT restricted to the `plus` role with a `user_id` session preset; poll SELECT open to unauthenticated clients, scoped to poll-safe columns); `syncPlusRole` converges the `plus` Hasura role with `umm_subscriptions` on every Stripe/Apple/Google webhook; `dev-grant-plus.sh` for local QA without live billing

### Notes
- Stripe is not yet provisioned for this account. `/billing/checkout` returns `503 billing_disabled` until keys exist; `/upgrade` shows a "launching soon" state, no live charges.
- Verified locally end-to-end: dev-grant moves a user to active Plus (role + subscription); a Plus JWT can pair a TV to itself; a free account is blocked from pairing; role escalation attempts are denied; an unauthenticated TV poll can still read paired status by pin.

---

## [3.2.0] — 2026-06-27 — E-05: Tauri 2 Desktop App

### Added
- Desktop app (`praycalc/desktop/`): Tauri 2 + Vite + React 19 + Tailwind 4
- System tray icon showing next prayer name + time
- Left-click tray toggles 360px prayer times popover
- Countdown timer to next prayer (live 1s updates)
- All 6 prayer times with next prayer highlighted in green
- Settings: 10 preset cities, calculation method, Hanafi school toggle, notification toggle, auto-start at login
- OS notifications at prayer time via tauri-plugin-notification
- Auto-start at login via tauri-plugin-autostart
- Settings persisted via tauri-plugin-store
- Fetches from praycalc.com API; refreshes at midnight
- CI: ci-desktop.yml (macOS-15, cargo check + tsc + Vite build)
- Supports Windows, Linux, macOS (arm64 + x64)

---

## [3.1.0] — 2026-06-27 — E-05/E-06/E-07: Native Surfaces Complete

### Added
- macOS: countdown now live-updates every second; adhan sound picker (None/Default/Makkah/Madinah); audio files bundled
- watchOS: @main conflict resolved; PrayCalcWatchWidgets.swift owns widget bundle entry point; adhan audio added
- Wear OS: QiblaScreen added (canvas compass + degree display); wired into nav; Qibla chip in prayer list; tile LaunchAction package fixed; adhan audio in raw resources
- Smart home: README.md documenting all integrations; shortcuts use public API; all 259 tests pass
- CI: ci-macos.yml, ci-watchos.yml, ci-wearos.yml, ci-smart.yml

### Fixed
- Vercel source builds no longer override prebuilt deploys for non-web/ pushes (ignoredBuildStep set)
- Lambda data/ bundle: `includeFiles` in astro.config.ts ensures geo.json + auto.json survive source builds
- Node.js engine bumped from 20.x to 22.x (20.x deprecated in Vercel 2026-10-01)

---

## [3.0.0] — 2026-06-27 — P3: PrayCalc Full Platform Excellence

### Added
- City pages fully restored and enhanced: live clock, countdown to next prayer, next-prayer highlight, adhan audio
- QiblaModal with distance display and animated compass
- SettingsPanel with madhab/method/notification prefs
- CalendarModal with month/year views, Hijri mode, fetches from /api/prayers
- `/embed` SSR page for third-party iframe embeds (theme/size/city params)
- `/api/calendar.ics` — RFC 5545 ICS export with DST-correct UTC timestamps
- Vanilla service worker (NetworkFirst for city pages, CacheFirst for assets)
- PWA manifest + SW registration
- Account island with saved cities management
- praycalc.org migrated to Astro 5 (PR #28) with full 33-route parity
- TV app (Apple TV, Android TV): all 15 screens verified, stale-closure bug fixed
- CI: ci-org.yml, generated-file-gate.yml, all-checks-pass.yml

### Fixed
- Production city pages were returning 500 — root cause: data/geo.json + data/auto.json not included in Vercel Lambda bundle. Fixed via postbuild.mjs cpSync.
- Mobile app tab icons were all null; app name was "Prayer Times" — fixed to PrayCalc + Ionicons
- embed.astro CSS interpolation error (Tailwind v4 incompatible with {variable} in style blocks — fixed with define:vars)
- Broken service worker (sw.ts imported @serwist/next which is Next.js-only) — replaced with vanilla sw.js

### Tests
- 372 unit tests passing (vitest)

# Changelog — PrayCalc

All notable changes to the PrayCalc monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- @acamarata/pray-calc: Zero-dependency TypeScript prayer time calculation engine published to npm (P2-E4-W01-S01-T04); NREL SPA + MCW seasonal + dynamic twilight angles; 8 prayer calculation methods (Tehran/Jafari excluded per D-P3-19); 4 Hanafi Legal rules; parity verified across 4800+ combinations; ESM + CommonJS + TypeScript types; used by praycalc/mobile + praycalc/tv
- praycalc/mobile: React Native + Expo SDK 53 rewrite complete (P2-E4-W03-S03-T02); 20/20 features ported from Flutter, Flutter parity gate passed; iOS 16+, Android API 26+; Expo Router v4, urql v4, zustand v5, newArch true, React 19; bundleId: com.praycalc.praycalcApp (FGAP-08); Sentry no-op pattern (UD-2), Umami anonymous analytics, 21 locales + RTL (ar, ur, ps, fa)
- praycalc/tv: react-native-tvos scaffold complete (P2-E4-W03-S03-T05); 15 screens scaffolded (HomeScreen prayer grid, PairingScreen QR+PIN, ScreensaverScreen, HadithOfDayScreen RTL, RamadanScreen, etc.); D-pad focus + TVFocusGuideView; QR + 6-digit PIN pairing every 5s; 3 platforms: Apple TV (tvOS 16+), Android TV (API 26+), Fire TV (API 26+); bundleId: com.ummeco.praycalc.tv; pnpm workspace wired
- praycalc/web: Astro migration target (D-P2-STACK-CANON); preview stack pre-flight
- praycalc/org: Astro + MDX migration target (D-P2-STACK-CANON); content site rewrite plan

### Changed
- praycalc/flutter: Archived to branch archive/praycalc-flutter-1.2.3 (P2-E4-W03-S03-T03); Flutter codebase retained for reference only; all new development uses React Native
- praycalc: Canonical backend moved to shared ummat nSelf instance (api.ummat.dev); independent smart contract backend stable (pc_ prefix)
- Prayer calculation: decision D-P2-PRAYCALC-RN (2026-06-14) locked; supersedes D-P8-09 (ADR-0022); rationale: 6+ platforms unreachable by React Native + Expo, Flutter offers 9-platform reach (9 vs RN's 6 via Tauri + TV extensions)

### Removed
- praycalc/flutter: Archived to branch (source retained; no new feature work on Flutter)

### Fixed
- FGAP-08: praycalc/mobile bundleId matches Flutter app (com.praycalc.praycalcApp) — store continuity
- FGAP-09: Staged rollout plan documented (phased iOS + Android release via EAS Submit)

### Security
- praycalc/mobile: Sentry DSN integration wired (no-op pattern until EXPO_PUBLIC_SENTRY_DSN env set)

### Performance
- praycalc/mobile: 20 features at feature parity with Flutter (zero regressions); typecheck clean

---

## E-04 Native App Standardization (P2)

**Ticket:** P2-E4-W04-S04-T04 (Integration close-out)

Core milestone: praycalc fully migrated to React Native + Expo SDK 53 (D-P2-PRAYCALC-RN); @acamarata/pray-calc published; praycalc/mobile + praycalc/tv scaffolded and feature-complete; praycalc/flutter archived; SPORT registries + MASTER-PACKAGES updated for E-04 completeness.

- @acamarata/pray-calc: ✅ Published, zero deps, 8 methods, 4800+ parity tests
- praycalc/mobile: ✅ Complete, 20/20 features, Flutter parity gate passed, EAS Build green
- praycalc/tv: ✅ Scaffolded, 15 screens, D-pad focus, pairing wired, pnpm workspace
- praycalc/web + praycalc/org: Astro target migration planned (D-P2-STACK-CANON)

---
