# PrayCalc Mobile — Migration Status

Tracks Flutter-parity completion and known integration gaps.

## Feature Parity Status (20/20 complete)

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Prayer Times | Complete (T-01) | 7 methods, 7 UI states |
| 2 | Qibla Compass | Complete (T-01) | expo-sensors, great-circle bearing |
| 3 | Islamic Calendar | Complete (T-01) | Hijri/Gregorian dual display |
| 4 | Settings | Complete (T-01) | Method, location, notifications |
| 5 | Auth | Complete (T-01) | Anonymous + account mode |
| 6 | Adhan Audio | Complete (T-02) | react-native-track-player, lock-screen controls |
| 7 | Tasbeeh Counter | Complete (T-02) | expo-haptics, MMKV session |
| 8 | Dua & Dhikr | Complete (T-02) | Arabic RTL, tashkeel, Islamic content gate |
| 9 | Moon Phases | Complete (T-02) | J2000 Julian Day, Hijri approx |
| 10 | Quran | Partial (T-02) | Al-Fatiha verified; full corpus pending SQLite bundle (see below) |
| 11 | Ramadan Tracker | Complete (T-02) | Suhoor/Iftar, moon-age Hijri |
| 12 | Prayer Stats | Complete (T-02) | MMKV log, streak, inline bar chart |
| 13 | IAP/Subscription | Complete (T-02) | expo-in-app-purchases wired |
| 14 | City Search | Complete (T-02) | GraphQL + offline fallback |
| 15 | Notifications | Complete (T-02) | expo-notifications, 3-day lookahead, Android exact alarm |
| 16 | Home Widgets | Stub (T-02) | expo-widget-kit not stable for SDK 53 — see PCI below |
| 17 | Smart Home | Complete (T-02) | expo-local-authentication, local REST API |
| 18 | Agendas/Calendar | Complete (T-02) | expo-calendar, 20-min blocks |
| 19 | Travel/Musafir | Complete (T-02) | Qasr only, no auto-jama |
| 20 | Onboarding | Complete (T-02) | 5-step, expo-location GPS, RTL complete |

---

## Known Gaps & Filed PCIs

### Gap 1 — Quran Full Corpus (PCI: pci-praycalc-quran-corpus)

**Status:** Al-Fatiha (1:1-7) is verified Uthmani script in the current build. All other 113 surahs show placeholder text.

**What's needed:**
- Bundle a full Quran SQLite database (source: tanzil.net Uthmani Simple plain-text export, Creative Commons licensed)
- Write a `QuranDatabase.ts` service using `expo-sqlite` to query by surah+verse
- Update `QuranScreen.tsx` to load from DB instead of in-memory array
- Estimated size: ~1.2MB (SQLite) or ~2MB (JSON flat file)

**Workaround:** Surah list is navigable; only Al-Fatiha renders full Arabic text. Other surahs show "Full text loading..." placeholder.

---

### Gap 2 — Home Widgets (PCI: pci-praycalc-home-widgets-native)

**Status:** Stub screen shows simulated widget preview and setup instructions.

**What's needed:**
- iOS: Swift WidgetKit extension inside `ios/` target, sharing App Group with RN app
  - expo-widget-kit plugin scaffolds the extension when it reaches stable for SDK 53
  - Until then: native Swift extension required (per spec §6.6)
- Android: react-native-android-widget or native Kotlin AppWidget
  - Shares MMKV/SharedPreferences data with the RN layer
- writeWidgetData() stub in `src/features/home-widget/HomeWidgetStub.tsx` documents the integration contract

**Workaround:** Users can set next prayer notification as a lock-screen notification instead.

---

### Gap 3 — iOS DnD Bypass (PCI: pci-praycalc-ios-critical-alerts)

**Status:** Prayer notification channel on Android uses `CATEGORY_ALARM` for DnD bypass (API 31+). iOS `interruptionLevel: 'timeSensitive'` is configured but requires an Apple entitlement (`com.apple.developer.usernotifications.time-sensitive`).

**What's needed:**
- Apply for Time Sensitive Notifications entitlement from Apple Developer console
- Add entitlement to `ios/` target once prebuild runs
- Until approved: notifications fire normally but may be suppressed by Focus modes

---

### Gap 4 — IAP Sandbox Testing (PCI: pci-praycalc-iap-sandbox)

**Status:** expo-in-app-purchases wired with product IDs `praycalc_pro_monthly` and `praycalc_pro_annual`. Products not yet created in App Store Connect or Google Play Console.

**What's needed:**
- Create IAP products in App Store Connect (Subscriptions section)
- Create subscription products in Google Play Console
- Configure RevenueCat or direct StoreKit/Billing backend webhook handler in `ummat/backend`
- Test with sandbox accounts before production release

---

## Flutter Archive Status

`praycalc/flutter/` has been archived to `archive/flutter-p2-freeze` branch per D-P2-PRAYCALC-RN. The branch is retained as reference only for:
- tvOS native Dart code reference (until react-native-tvos parity verified)
- watchOS/Wear OS parity reference (not in T-02 scope; tracked in praycalc/watchos and praycalc/wearos)
- Original prayer calculation algorithm cross-check

Do NOT reinstall Flutter dependencies or run `flutter build` from this branch in CI.

---

## Dependency Notes

| Package | Version | Notes |
|---|---|---|
| react-native-track-player | ^4.1.1 | Requires `react-native-track-player` plugin in app.json |
| expo-notifications | SDK 53 | SCHEDULE_EXACT_ALARM required for Android API 31+ |
| expo-local-authentication | SDK 53 | NSFaceIDUsageDescription required for iOS |
| expo-calendar | SDK 53 | NSCalendarsFullAccessUsageDescription required for iOS 17+ |
| expo-in-app-purchases | SDK 53 | Products must be created in App Store Connect / Play Console before testing |
| expo-haptics | SDK 53 | No native config needed (Expo managed) |
| expo-task-manager | SDK 53 | Background fetch in UIBackgroundModes |
