# praycalc/mobile Changelog

## [2.1.0] — 2026-07-10

### Fixed — Version sync + dependency coherence (W5 gap closure)

- `package.json` version brought into lockstep with `app.json` `expo.version`
  (the store-shipping, OTA-`runtimeVersion`-keying number) — was drifted to
  `0.2.0`. Earlier `0.x` CHANGELOG entries below predate store versioning and
  track internal feature-scaffold milestones, not shipped App Store/Play
  Store builds; `2.1.0` is the first entry aligned to the real release number.
- Dependency matrix realigned to Expo SDK 53's bundled native module versions
  (`react-native` 0.79.6, `react` 19.0.0, `expo-router` ~5.1.11, and 20 more
  `expo-*`/`react-native-*` packages) — see PR/commit notes for full diff.
- `expo-in-app-purchases` (abandoned since 2022) replaced with
  `react-native-iap@13.0.4` behind the same `src/lib/iap` wrapper interface.

## [0.3.0] — 2026-07-08

### Added — TV manager deep settings

- `TvManagerScreen`: rewritten to list every paired TV with a `TvCardBody` summary and a `TvDeepSettings` editor per TV (name, accent color, stream source, content-rotation minutes, weather toggle, per-TV location, countdown takeover, iqama times, prayer-name-only mode, calculation method, madhab, time format)
- `pairingMutation`: claim-by-PIN update no longer sends `device_id` — the TV's own `device_id` from the pairing row is preserved through the claim, matching the same rule enforced server-side

## [0.1.0] — 2026-06-21 (P2-E4-W03-S03-T01)

### Added — Initial scaffold

- Expo SDK 53 managed workflow, New Architecture enabled, React 19, urql v4, zustand v5, Expo Router v4
- Bundle ID `com.praycalc.praycalcApp` (matches Flutter app — FGAP-08)
- Feature 1 — Prayer Times: 6-time display, next-prayer countdown (1s tick), Hanafi/Shafi Asr toggle, 7-method selector (Tehran/Jafari excluded per D-P3-19), 7 UI states
- Feature 2 — Qibla Compass: expo-sensors Magnetometer, great-circle bearing, animated needle, accuracy indicator, declination correction, 7 UI states
- Feature 3 — Islamic Calendar: Hijri/Gregorian dual display, month navigation, static Islamic events, 7 UI states
- Feature 4 — Settings: method selector, madhab toggle, GPS+manual location, notification prefs, 12/24h format
- Feature 5 — Auth: anonymous mode (zero API calls), account mode (JWT → SecureStore), Expo Router auth group
- DEPLOYMENT.md: FGAP-08 phased rollout (5%→25%→50%→100%) + rollback plan
- pnpm workspace wired (`@ummat/praycalc-mobile`)
- @acamarata/pray-calc workspace dependency
- SPORT REGISTRY-APPS.md updated

## [0.2.0] — 2026-06-21 (P2-E4-W03-S03-T02)

### Added — Features 6-20: Full Flutter parity

- **Feature 6 — Adhan Audio**: react-native-track-player, per-prayer voice selection, lock-screen controls, GraphQL voice library (`pc_adhan_voice`)
- **Feature 7 — Tasbeeh Counter**: 5 dhikr presets, expo-haptics feedback (Bukhari 6406, Hisn #25, Muslim 2702), MMKV session persistence
- **Feature 8 — Dua & Dhikr**: Morning/evening adhkar + post-prayer duas (Hisn #96/#100/#83/#108/#118, Muslim 591/597), full Arabic tashkeel RTL, category filter tabs
- **Feature 9 — Moon Phases**: J2000 Julian Day moon age/illumination/phase, Hijri date approximation (HIJRI_EPOCH_JD), Quran 2:189 citation
- **Feature 10 — Quran**: Uthmani script (verified Tanzil.net/IslamicFoundation.ca for Al-Fatiha), bismillah logic (no sura 9/1), MMKV bookmarks
- **Feature 11 — Ramadan Tracker**: Suhoor/Iftar times from prayer calc, moon-age Hijri month, iftar dua (Hisn #185, Abu Dawud 2358), Laylat al-Qadr note
- **Feature 12 — Prayer Stats**: MMKV completion log, streak calculation, inline bar chart, weekly/monthly view
- **Feature 13 — IAP/Subscription**: expo-in-app-purchases, monthly/annual products, restore purchases, StoreKit+Google Play Billing
- **Feature 14 — City Search**: GraphQL `pc_cities` ilike query, offline fallback (20 bundled cities), fuzzyMatch(), wired to useSettingsStore
- **Feature 15 — Prayer Notifications**: expo-notifications + expo-task-manager, per-prayer toggles, Android CATEGORY_ALARM DnD bypass, SCHEDULE_EXACT_ALARM deep-link, 3-day lookahead schedule
- **Feature 16 — Home Widgets (stub)**: expo-widget-kit experimental stub, simulated preview, PCI pci-praycalc-home-widgets-native filed
- **Feature 17 — Smart Home**: expo-local-authentication biometric gate, device toggle list, local REST API via fetch with AbortSignal.timeout
- **Feature 18 — Prayer Calendar**: expo-calendar, per-prayer toggle, 20-min events + 5-min alarms, timezone-aware
- **Feature 19 — Travel/Musafir**: Qasr toggle (Dhuhr/Asr/Isha 4→2), jama fiqh note, travel city via CitySearchScreen, Alert explanation
- **Feature 20 — Onboarding**: 5-step flow (location→method→notifications→account→complete), expo-location GPS, Bismillah RTL completion screen, MMKV onboarding_done flag

### Updated

- `src/app/(tabs)/more.tsx`: 13 routed menu items, all T-02 stubs removed, icons added
- `app.json`: added react-native-track-player, expo-notifications, expo-local-authentication, expo-calendar plugins; SCHEDULE_EXACT_ALARM + calendar + biometric Android permissions; NSCalendarsFullAccessUsageDescription + NSFaceIDUsageDescription iOS plist entries; UIBackgroundModes += audio
- Created 13 `src/app/*/index.tsx` route re-exports for all T-02 features

## [0.1.0-extras] — 2026-06-21 (P2-E4-W03-S03-T01)

### Added
- **i18n**: 21 locale scaffold using i18next + expo-localization. Locales: en, ar, fr, ur, tr, id, ms, bn, sw, es, de, nl, pt, it, ru, hi, ps, fa, so, ha, yo.
- **RTL**: Full RTL support for Arabic, Urdu, Pashto, Farsi via `I18nManager.forceRTL`. App reload (expo-updates) triggered on direction change.
- **Locale persistence**: MMKV key `i18n.locale` persists user locale selection across app restarts.
- **Sentry**: `initSentry()` no-op wrapper (`src/lib/sentry.ts`). Activates only when `EXPO_PUBLIC_SENTRY_DSN` is set (UD-2). CI builds with no DSN exit clean.
- **Analytics**: `logPrayerEvent(type, time)` + `logAppOpen()` fire anonymous Umami beacons (zero PII — no user ID, location, or full timestamp). Controlled by `EXPO_PUBLIC_UMAMI_URL` + `EXPO_PUBLIC_UMAMI_WEBSITE_ID`.
