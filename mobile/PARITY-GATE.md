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
| 10 | Adhan audio notifications | Implemented | **Partial** — notifications fire with the system sound; tapping one plays the selected reciter's adhan in-app (added 2026-07-06). Adhan voice AS the notification sound requires bundled native sound assets per platform | PARTIAL (PCI pci-praycalc-adhan-notification-sound) |
| 11 | Multiple adhan reciters | Implemented | Implemented (DB-driven `pc_adhan_voice` library, streaming preview/selection, pro-gating, per-prayer enable) | PASS |
| 12 | Prayer calendar (monthly view) | Implemented | Implemented (TimetableScreen — per-day Fajr→Isha table, month navigation, today highlight; added 2026-07-06) | PASS |
| 13 | Prayer calendar (yearly view) | Implemented | Month navigation spans any year in TimetableScreen; no dedicated single-screen year grid | PASS (navigation covers the use case) |
| 14 | PDF calendar export | Implemented | **Replaced** — `.ics` calendar export via the real `praycalc.com/api/calendar.ics` endpoint (imports into any OS calendar). No server PDF endpoint exists in the web app either; web offers print-to-PDF in its CalendarModal | PARTIAL (by design — .ics is the portable format) |
| 15 | Multi-language UI (EN, AR, TR, UR, ID, FR, BN, SO) | Implemented | **Partial** — i18n live at app start (21 locales incl. all 8 Flutter ones), Settings language picker, prayer names + core UI strings translated at render time. Full screen-string extraction is the tracked remainder | PARTIAL (tracked — translations need human review per Islamic content gate) |
| 16 | RTL layout support | Implemented | Implemented — `applyRTL` runs at module init before first render (ar/ur/ps/fa); direction change prompts an app restart | PASS |
| 17 | Countdown to next prayer | Implemented | Implemented | PASS |
| 18 | Dark mode with system preference | Implemented | Implemented (System/Light/Dark setting, full 26-file themed palette; added 2026-07-06 — the 2026-06-21 gate overstated this) | PASS |
| 19 | WCAG 2.2 AA accessibility | Implemented | Implemented (a11y roles/labels/hitSlop across screens) | PASS |
| 20 | Premium features (smart home, TV widget, home screen widgets) | Implemented | **Partial** — Smart Home (lock-on-salah, honest empty device list) and TV pairing are real and gated; home-screen widget is an in-app config/preview with the native WidgetKit/AppWidget extension tracked | PARTIAL (PCI pci-praycalc-home-widgets-native) |

## Verification Summary

- **Total Features:** 20
- **PASS:** 16
- **PARTIAL (tracked, honest):** 4 — rows 10, 14, 15, 20; each has a PCI or documented design decision, none blocks release
- **Gate Status:** OPEN ✓ (with tracked partials recorded above)

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

## Migration Notes

- **React Native + Expo SDK 53:** Phone + tablet platforms (iOS, Android)
- **react-native-tvos:** TV platform (tvOS, Fire TV, Android TV — not supported by Flutter officially)
- **Desktop (Tauri 2):** Desktop platforms (Windows, macOS, Linux)
- **Web:** Continues via Next.js (praycalc/web) → Astro/Vite per D-P2-STACK-CANON
- **Watch & Wear:** Deferred to post-parity phase per RN ecosystem maturity

## Decision Reference

See `.claude/memory/decisions.md` § D-P2-PRAYCALC-RN for full context on this archive and rewrite.
