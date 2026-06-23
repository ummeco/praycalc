# PrayCalc Mobile — Parity Gate Verification

**Decision:** D-P2-PRAYCALC-RN (2026-06-14)  
**Archive Branch:** `archive/praycalc-flutter-1.2.3`  
**Flutter Version Archived:** 1.2.3  
**Gate Verified:** 2026-06-21  

This document verifies that `praycalc/mobile` (React Native + Expo SDK 53) achieves functional parity with the archived Flutter app (`praycalc/flutter/1.2.3`).

## Parity Verification Matrix

| # | Feature | Flutter Status | RN Status | Pass/Fail |
|---|---------|---|---|---|
| 1 | ISNA calculation method | Implemented | Implemented | PASS |
| 2 | MWL calculation method | Implemented | Implemented | PASS |
| 3 | Egypt calculation method | Implemented | Implemented | PASS |
| 4 | Umm al-Qura calculation method | Implemented | Implemented | PASS |
| 5 | Tehran calculation method | Implemented | Implemented | PASS |
| 6 | Karachi calculation method | Implemented | Implemented | PASS |
| 7 | GPS-based location detection | Implemented | Implemented | PASS |
| 8 | City search & autocomplete | Implemented | Implemented | PASS |
| 9 | Qibla compass direction | Implemented | Implemented | PASS |
| 10 | Adhan audio notifications | Implemented | Implemented | PASS |
| 11 | Multiple adhan reciters | Implemented | Implemented | PASS |
| 12 | Prayer calendar (monthly view) | Implemented | Implemented | PASS |
| 13 | Prayer calendar (yearly view) | Implemented | Implemented | PASS |
| 14 | PDF calendar export | Implemented | Implemented | PASS |
| 15 | Multi-language UI (EN, AR, TR, UR, ID, FR, BN, SO) | Implemented | Implemented | PASS |
| 16 | RTL layout support | Implemented | Implemented | PASS |
| 17 | Countdown to next prayer | Implemented | Implemented | PASS |
| 18 | Dark mode with system preference | Implemented | Implemented | PASS |
| 19 | WCAG 2.2 AA accessibility | Implemented | Implemented | PASS |
| 20 | Premium features (smart home, TV widget, home screen widgets) | Implemented | Implemented | PASS |

## Verification Summary

- **Total Features:** 20
- **Passing:** 20
- **Failing:** 0
- **Gate Status:** OPEN ✓

All features listed in the Flutter app are now available in the React Native + Expo SDK 53 mobile app. The archive branch (`archive/praycalc-flutter-1.2.3`) preserves the historical Flutter codebase for reference without deleting from main.

## Migration Notes

- **React Native + Expo SDK 53:** Phone + tablet platforms (iOS, Android)
- **react-native-tvos:** TV platform (tvOS, Fire TV, Android TV — not supported by Flutter officially)
- **Desktop (Tauri 2):** Desktop platforms (Windows, macOS, Linux)
- **Web:** Continues via Next.js (praycalc/web) → Astro/Vite per D-P2-STACK-CANON
- **Watch & Wear:** Deferred to post-parity phase per RN ecosystem maturity

## Decision Reference

See `.claude/memory/decisions.md` § D-P2-PRAYCALC-RN for full context on this archive and rewrite.
