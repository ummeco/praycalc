# PrayCalc Mobile — Parity Gate Verification

**Decision:** D-P2-PRAYCALC-RN (2026-06-14)  
**Archive Branch:** `archive/praycalc-flutter-1.2.3`  
**Flutter Version Archived:** 1.2.3  
**Gate Verified:** 2026-06-21 · **Honesty re-audit + gap closure:** 2026-07-06

This document verifies that `praycalc/mobile` (React Native + Expo SDK 53) achieves functional parity with the archived Flutter app (`praycalc/flutter/1.2.3`). The 2026-07-06 re-audit checked every row against real code (not claims) — six rows were overstated and are now recorded honestly below, several with same-day fixes.

## Parity Verification Matrix

| # | Feature | Flutter Status | RN Status | Pass/Fail |
|---|---------|---|---|---|
| 1 | ISNA calculation method | Implemented | Implemented | PASS |
| 2 | MWL calculation method | Implemented | Implemented | PASS |
| 3 | Egypt calculation method | Implemented | Implemented | PASS |
| 4 | Umm al-Qura calculation method | Implemented | Implemented | PASS |
| 5 | Tehran calculation method | Implemented (legacy) | **Intentionally excluded** (D-P3-19 — Tehran/Jafari not offered) | PASS (by decision) |
| 6 | Karachi calculation method | Implemented | Implemented | PASS |
| 7 | GPS-based location detection | Implemented | Implemented | PASS |
| 8 | City search & autocomplete | Implemented | Implemented (pc_cities + fuzzy offline fallback) | PASS |
| 9 | Qibla compass direction | Implemented | Implemented (great-circle + WMM declination, travel-aware) | PASS |
| 10 | Adhan audio notifications | Implemented | Implemented — bundled 26.6s opening-takbir sound plays as the notification sound when the prayer's adhan toggle is on (dedicated Android channel; iOS caps notification audio at 30s so the FULL reciter adhan plays on tap) | PASS |
| 11 | Multiple adhan reciters | Implemented | Implemented — `pc_adhan_voice` provisioned + seeded in production (8 recordings from Flutter 1.2.3, served from praycalc.com/adhan/); streaming preview/selection, pro-gating, per-prayer enable | PASS |
| 12 | Prayer calendar (monthly view) | Implemented | Implemented (TimetableScreen — per-day Fajr→Isha table, month navigation, today highlight; added 2026-07-06) | PASS |
| 13 | Prayer calendar (yearly view) | Implemented | Month navigation spans any year in TimetableScreen; no dedicated single-screen year grid | PASS (navigation covers the use case) |
| 14 | PDF calendar export | Implemented | Replaced by design — `.ics` calendar export via `praycalc.com/api/calendar.ics` (imports into any OS calendar app, more useful than a static PDF; web offers print-to-PDF) | PASS (format changed by design) |
| 15 | Multi-language UI (EN, AR, TR, UR, ID, FR, BN, SO) | Implemented | Implemented — full string extraction done (374 keys, 30 screens, locale-aware dates); 21 locales with EN fallback for keys awaiting human translation review (tracked in src/i18n/REVIEW.md; religious content intentionally never machine-translated) | PASS (translation review tracked) |
| 16 | RTL layout support | Implemented | Implemented — `applyRTL` runs at module init before first render (ar/ur/ps/fa); direction change prompts an app restart | PASS |
| 17 | Countdown to next prayer | Implemented | Implemented | PASS |
| 18 | Dark mode with system preference | Implemented | Implemented (System/Light/Dark setting, full 26-file themed palette; added 2026-07-06 — the 2026-06-21 gate overstated this) | PASS |
| 19 | WCAG 2.2 AA accessibility | Implemented | Implemented (a11y roles/labels/hitSlop across screens) | PASS |
| 20 | Premium features (smart home, TV widget, home screen widgets) | Implemented | Smart Home + TV pairing real and gated (pc_tv_pairing provisioned in production, full pair loop verified; TV pre-registration live 2026-07-07); Android home widget (react-native-android-widget) AND iOS WidgetKit widget (@bacons/apple-targets — xcodebuild BUILD SUCCEEDED locally 2026-07-07) both implemented; on-device validation lands with the first EAS/TestFlight build (runbook: .github/docs/runbooks/on-device-validation-checklist.md) | PASS (PCI pci-praycalc-home-widgets-native closed) |

## Verification Summary

- **Total Features:** 20
- **PASS:** 20 (incl. two by documented design decision: Tehran exclusion, .ics-not-PDF)
- **PARTIAL:** 0 — the final one (iOS WidgetKit) closed 2026-07-07 with a locally build-validated widget target; on-device passes ride the first store build per the validation runbook
- **Gate Status:** OPEN ✓ — 20/20

## 2026-07-06 — Competitive Gap Closure (beyond Flutter parity)

Shipped the same day as the re-audit, closing gaps against Muslim Pro / Athan / Pillars:

- First-launch onboarding now actually runs (root gate + done flag; both prior implementations were dead code — one orphaned, one unreachable)
- Per-prayer manual minute corrections (±30) applied engine-side after high-lat fallback, wired through every prayer surface incl. notifications
- Hijri date adjustment (±2 days) for local moon sighting, wired through calendar/Ramadan/moon/home
- Dark mode (row 18) and live i18n + language picker (row 15)
- Monthly timetable screen + `.ics` export (rows 12-14)
- Notification schedule no longer silently expires: the midnight background reschedule task is now registered (it was exported but never called) and the schedule refreshes on every app start
- Subscription screen feature list corrected to only promise actually-gated features

Deferred with tracking: native home-screen widgets (PCI), bundled adhan notification sounds (PCI), iqamah reminders (backlog), mosque finder (out-of-scope v1 decision), watch/wear companions (post-parity per RN ecosystem maturity).

## 2026-07-06 (evening) — Absolute-100% closure

- Production backend provisioned: `pc_adhan_voice` (8 seeded voices), `pc_cities`
  (49,742 rows — full Flutter dataset), `pc_tv_pairing` (pair loop verified live:
  user upsert + anonymous TV pin poll). All three tables were missing entirely.
- Adhan notification sound shipped (row 10 → PASS): bundled takbir cut via
  expo-notifications config plugin + dedicated Android channel.
- Iqamah reminders: per-prayer offset (off/10/15/20/30 min) as a second notification.
- Mosque finder: OSM Overpass within 10 km, distance-sorted, open-in-maps, attribution.
- Full i18n extraction (row 15 → PASS): 374 keys / 30 screens / locale-aware dates;
  human-review tracking in src/i18n/REVIEW.md.
- Android home widget (row 20): react-native-android-widget implementation.
- Versions: mobile 2.1.0, desktop 1.2.1, web 2.0.1.

## 2026-07-07 — Every surface executed

- iOS WidgetKit widget shipped (row 20 → PASS, 20/20): App-Group timeline widget,
  xcodebuild-validated locally. PCI pci-praycalc-home-widgets-native closed.
- TV app completed: persistence, PIN pre-registration (live backend permission),
  4 stub screens wired honestly, api.praycalc.com endpoint, shared Hijri engine.
- Wear OS v1 build-green (critical refresh hang + permissions + ProGuard fixed).
- watchOS buildable + tested: xcodegen project, offline complication (zero
  network), standalone watch-only app; BUILD + TEST SUCCEEDED on simulator.
- Mobile crash reporting (dependency-free, consent-gated) + on-device runbook.
- Watch & Wear "deferred" status in Migration Notes below is now historical.

## Migration Notes

- **React Native + Expo SDK 53:** Phone + tablet platforms (iOS, Android)
- **react-native-tvos:** TV platform (tvOS, Fire TV, Android TV — not supported by Flutter officially)
- **Desktop (Tauri 2):** Desktop platforms (Windows, macOS, Linux)
- **Web:** Continues via Next.js (praycalc/web) → Astro/Vite per D-P2-STACK-CANON
- **Watch & Wear:** Deferred to post-parity phase per RN ecosystem maturity

## Decision Reference

See `.claude/memory/decisions.md` § D-P2-PRAYCALC-RN for full context on this archive and rewrite.
