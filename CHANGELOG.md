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
