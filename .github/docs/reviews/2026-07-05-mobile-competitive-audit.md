# PrayCalc Mobile — Competitive Audit & Backlog (2026-07-05)

> 6-agent audit of every mobile screen + hooks/stores vs competitor Adhan apps
> (Muslim Pro, Athan, Pillars). Core claims personally verified.

## ✅ Fixed this session (commit c4903fe)
- **Prayer engine** — replaced the hand-rolled `23.45*sin(day)` placeholder with
  the validated `pray-calc` v2 (NREL SPA + method presets + Hanafi/Shafi),
  mirroring the web app's `calcTimesAll`. This was the app's entire value prop.
- **Quran** — surah list 8 → all 114 (bundled metadata); unbundled surahs now
  show an honest "coming soon" state instead of fake placeholder glyphs.
- **5 dead CTAs wired** — "Set Location"/"Search City" (home, qibla, settings) →
  city-search; onboarding "Create Account" → sign-in; adhan retry → reexecute.

## ✅ Fixed this session (P0 items 1–6 + several P1s)
- **Custom angle + high-latitude rule** — `calculatePrayerTimes` now solves the
  user's own Fajr/Isha depression angles directly (verified to agree with
  pray-calc's own MWL/Karachi presets to <1 min) and implements the standard
  NightMiddle/AngleBased/OneSeventh/None high-lat fallback when an angle is
  geometrically unreachable — cross-checked against a genuine wraparound bug
  found and fixed during development (near-midnight sunset at extreme latitudes).
  Locked in with a regression test suite (`src/lib/prayer-calc/__tests__/`).
- **Settings persistence** — `useSettingsStore` extended with per-prayer
  notification enabled/advance-minutes, adhan voice + per-prayer enabled, travel
  location split from home, musafir mode. NotificationSettingsScreen, AdhanScreen,
  TravelScreen, SettingsScreen all now read/write the store instead of local
  `useState` that silently reset on restart.
- **Notification service** reads real settings (method/madhab/high-lat
  rule/custom angles/per-prayer enabled+advance) instead of hardcoded
  MWL/Shafi/all-5; also fixed a dormant bug where it read from an MMKV key the
  settings store never actually wrote to (store persists via AsyncStorage) —
  notifications were silently using stale/empty location data.
- **IAP + entitlement unification** — built `IAPListener.ts` (registered globally
  at app start per the SDK's own guidance), unified the two incompatible
  entitlement systems into a single `useAuthStore.isPlus` flag for both the IAP
  purchase and the web Ummat+ subscription. Anonymous users are now gated to
  sign in before purchasing (their own documented-but-unimplemented constraint).
- **Stats** — tap-to-mark-prayed on Home prayer rows (`src/lib/completions.ts`)
  now actually writes completions; StatsScreen refreshes on focus instead of
  reading once and going stale.
- **Honest gating** — SmartHomeScreen and HomeWidgetStub now gate behind
  `isPlus`; SmartHome's two fake hardcoded devices were removed (honestly empty
  until real discovery ships) and HomeWidget's fake "Maghrib 6:32 PM" preview
  now shows real computed next-prayer data.
- **Bug fixes** — `AgendasScreen`'s `parseFloat(IANA string)` → NaN → UTC+0 bug
  fixed via a shared `resolveTimezoneOffset` helper (numeric offsets + IANA
  zones with DST); `TravelScreen` no longer clobbers home location when
  selecting a travel city (`travelLocation`/`musafirMode` are separate store
  fields, `useActiveLocation()` selector); the four independent, mutually
  divergent Hijri approximations (Calendar/Ramadan/Moon) consolidated into one
  `@umalqura/core`-backed module (`src/lib/hijri/`) — Ramadan/Eid dates now
  agree app-wide, and Ramadan's day counter uses the real 29-vs-30-day length
  instead of a hardcoded `/30`.
- **Also discovered & fixed**: the actual live `/city-search` route was a
  separate, more primitive scaffold (8 hardcoded cities, fake search) than the
  fully-built GraphQL-backed `CitySearchScreen` component, which was only
  reachable embedded in TravelScreen — every "Set Location" entry point in the
  app was hitting the primitive one. Consolidated to one implementation, added
  debounce + "Use Current Location".
- **P1s**: Home screen Hijri+Gregorian date header, location name, per-prayer
  mute indicator; live Iftar/Suhoor countdown on Ramadan; 5th tab for Quran;
  madhab question added to onboarding.

## ⏳ Backlog remains (lower priority / needs content or native work)
Qibla real magnetic declination (WMM) + real accuracy detection — needs a full
World Magnetic Model coefficient table, deliberately not faked; full Quran
corpus + audio and wider dua catalog — content licensing/bundling, not a code
task; working native home-screen widget (WidgetKit/AppWidget) and real
adhan-voice-as-notification-sound — need bundled native assets/extensions;
real smart-home platform integration (HomeKit/Google Home) or formally cutting
the feature; monthly prayer timetable export; custom dhikr; social sign-in.

---

# PrayCalc Mobile — Competitive Gap Report

## 1. Overall Verdict

The app is architecturally sound (real 7-state UI machine, real GraphQL/auth/IAP scaffolding, correct fiqh handling) but **not competitive today**. Three systemic failures dominate: (1) core prayer-time math is a hand-rolled placeholder, not the validated `@acamarata/pray-calc` library, with three separate divergent ad-hoc Hijri algorithms across screens; (2) at least 8 primary CTAs are literal no-ops (`{/* comment */}` or `Alert.alert('Coming soon')`) sitting on screens that otherwise look finished; (3) settings write to local `useState` instead of the store, so notifications, per-prayer sound, travel mode, and smart-home toggles silently reset on every app restart or simply do nothing downstream. The monetization path is also broken end-to-end — no purchase listener exists, so IAP never unlocks anything, and two incompatible entitlement systems (PrayCalc Pro vs Ummat+) coexist. Ship-blocking before any store listing.

## 2. Ratings Table (worst first)

| Screen | Rating | One-line summary |
|---|---|---|
| SubscriptionScreen | stub | No purchase listener exists anywhere — IAP purchases never unlock Pro; two incompatible entitlement systems coexist |
| SmartHomeScreen | stub | Fake mock devices, "Add Device" is Alert-only, lock-on-salah does nothing, ungated by the paywall it's supposed to require |
| HomeWidgetStub | stub | Self-admitted no-op; shows fake hardcoded widget preview data; native packages not even installed |
| QuranScreen | stub | 106 of 114 surahs render fake placeholder Arabic text; no audio, search, tafsir, or translation options |
| StatsScreen | stub | Nothing in the app ever writes a completion record — streak/chart UI is permanently unreachable dead code |
| PrayerTimesScreen (Home) | major-gaps | Core prayer-time calc is a placeholder algorithm; high-latitude rule/custom angles are dead settings; "Set Location" CTA is a no-op |
| IslamicCalendarScreen | major-gaps | Second independent ±1-day Hijri approximation; claims 7 UI states but has none beyond success; no export/converter/countdown |
| RamadanScreen | major-gaps | Third independent Hijri approximation; no live Iftar/Suhoor countdown (the category's marquee feature); no fasting tracker |
| AdhanScreen | major-gaps | Voice selection and per-prayer enable/disable never persist or reach the notification service; error retry is a no-op; Pro paywall unenforced |
| NotificationSettingsScreen | major-gaps | Per-prayer toggles are cosmetic — service always schedules all 5 at hardcoded MWL/Shafi regardless of user's real settings |
| SettingsScreen | major-gaps | Manual per-prayer time offset, high-lat rule UI, custom angle inputs, language picker, theme toggle all absent or dead; city search CTA is a no-op |
| OnboardingScreen | major-gaps | "Create Account" silently no-ops instead of opening signup; no madhab/high-lat questions asked despite mattering materially |
| CitySearchScreen | major-gaps | No debounce (hammers API per keystroke); "100k city DB" claimed in comments doesn't exist, only 19 fallback cities; no favorites/current-location option |
| AgendasScreen | major-gaps | `parseFloat(timezone)` on an IANA string silently produces NaN→UTC+0 for every non-UTC user; today-only, no recurring sync |
| QiblaScreen | minor-gaps | Magnetic declination hardcoded to 0, accuracy hardcoded to always-High (fake); no calibration flow; correct bearing math otherwise |
| MoonScreen | minor-gaps | Static emoji instead of rendered moon graphic; independent (4th) Hijri approximation; otherwise solid astronomy |
| TravelScreen | minor-gaps | Selecting a travel city overwrites Home location (same store field) with no undo; musafir toggle doesn't persist or affect anything downstream |
| TasbeehScreen | minor-gaps | "Custom dhikr" promised in file header comment but not built; no session history/streaks |
| AuthScreen | minor-gaps | Fully wired end-to-end but no social login, no forgot-password |
| PairTvScreen | minor-gaps | Fully wired and correctly gated; only missing QR pairing and device management list |
| (tabs)/_layout | minor-gaps | Only 4 tabs vs competitor 5; Quran/Duas buried under More |
| DuaDhikrScreen | major-gaps | Fully wired but only 8 duas total; "sleep"/"general" categories modeled but zero content and no tab |

## 3. P0 — Must-Fix for Competitiveness

| Item | Screen:line | Fix |
|---|---|---|
| Core prayer-time calc is placeholder, not `@acamarata/pray-calc` | `src/lib/prayer-calc/index.ts:84-92` | Wire the real Hermes-compatible package; this is the app's entire value proposition |
| High-lat rule stored but never read; `hourAngle()` returns NaN at high latitudes | `useSettingsStore.ts:21,32,46` + `prayer-calc/index.ts` | Read `highLatRule` in calc; implement Angle-Based/Middle-of-Night/Seventh-of-Night fallback when `cosHA` out of range |
| Custom Fajr/Isha angles never consumed | `useSettingsStore.ts:43-44` | Pass `customFajrAngle`/`customIshaAngle` into `calculatePrayerTimes`; remove or wire the dead Settings row |
| "Set Location" CTA no-op (Home + Qibla) | `PrayerTimesScreen.tsx:140`, `QiblaScreen.tsx:73` | Wire to city-search route via Expo Router |
| "Search City Manually" CTA no-op | `SettingsScreen.tsx:119-124` | Same — wire to city-search route |
| "Create Account" onboarding CTA no-ops to `goNext()` | `OnboardingScreen.tsx:254-264` | Navigate to real `src/app/(auth)/sign-in.tsx` |
| Per-prayer notification toggles are cosmetic — service ignores enabled state | `NotificationSettingsScreen.tsx:53-58` + `PrayerNotificationService.ts` | Pass per-prayer-enabled map into `schedulePrayerNotifications()`; loop must skip disabled prayers |
| Notifications hardcode MWL method, ignore user's method/madhab/high-lat/custom settings | `PrayerNotificationService.ts` | Read from `useSettingsStore` instead of hardcoding `'MWL'` |
| Adhan voice selection never persists / never reaches notification service | `AdhanScreen.tsx:113-117` | Persist selection to store; `PrayerNotificationService.ts` must read it instead of hardcoded `'default'` sound |
| AdhanScreen error retry is a no-op | `AdhanScreen.tsx:80` | Wire `onRetry` to urql's `execute`/refetch |
| Pro-locked adhan voices previewable/selectable by free users | `AdhanScreen.tsx` (voice.is_pro badge) | Add entitlement check before play/select |
| IAP purchase listener does not exist — purchases never unlock anything | `SubscriptionScreen.tsx:79-82`, referenced `src/lib/iap/IAPListener.ts` missing entirely | Build the listener: validate receipt, write `pc_iap_receipts`, flip `isPro`/`isPlus` |
| Two incompatible entitlement systems (PrayCalc Pro vs Ummat+) | `SubscriptionScreen.tsx` vs `useAuthStore.isPlus` / `PairTvScreen.tsx` | Unify into one entitlement model before either paywall ships |
| SmartHomeScreen fully fake, ungated by its own required paywall | `SmartHomeScreen.tsx:30-33,141` | Either gate behind `isPlus` and cut to MVP real integration, or pull the screen/tab entirely until built |
| HomeWidgetStub shows fake data and instructs users to do something impossible | `HomeWidgetStub.tsx:30-39,58-60` | Hide entry point until native widget ships, or ship real WidgetKit/AppWidget |
| Quran corpus is 8/114 surahs, rest are placeholder glyph text | `QuranScreen.tsx:110-121,49-58` | Bundle full corpus before shipping the tab, or clearly mark unavailable surahs and disable navigation into them |
| StatsScreen streak/chart is unreachable — nothing ever writes a completion | `StatsScreen.tsx:19,29` + `PrayerTimesScreen.tsx` | Add tap-to-log/swipe-to-mark-prayed on the home prayer rows; write `pc:completions` on each mark |
| AgendasScreen: `parseFloat(timezone)` on IANA string → NaN → silent UTC+0 | `AgendasScreen.tsx:58` | Use proper IANA-aware offset resolution (e.g. `Intl.DateTimeFormat` or a tz library), not `parseFloat` |
| TravelScreen: travel city overwrites Home location with no restore path | `TravelScreen.tsx:58,156-161` | Split store fields: `homeLocation` vs `travelLocation`; restore on travel-mode-off |
| Settings notification section duplicates NotificationSettingsScreen with a separate, disconnected offset picker | `SettingsScreen.tsx:189-225` | Remove the duplicate; single source of truth for notification config |
| Qibla accuracy hardcoded to always-High (fake reading shown to user) | `useQibla.ts:92-93` | Read real magnetometer calibration/accuracy state, not a constant `3` |
| 3 (arguably 4, with Moon screen) independent, divergent Hijri conversion algorithms in one app | `useIslamicCalendar.ts:49-80`, `RamadanScreen.tsx:21-28`, `MoonScreen.tsx:89-103` | Consolidate to one shared Hijri conversion module (or wire the promised `@ummat/shared`) so Ramadan/Eid dates agree app-wide |
| IslamicCalendarScreen claims "7 UI states" with none implemented (no loading/error path exists) | `IslamicCalendarScreen.tsx:21,55-58` | Either implement real states or correct the misleading header comment |
| RamadanScreen "Day X of 30" hardcodes 30 regardless of actual 29/30-day month | `RamadanScreen.tsx:70-77,95` | Derive from real Ramadan start date, respect 29-vs-30 |

## 4. P1 — Competitive Parity Gaps (ranked by user impact)

| Feature | Screen | Effort |
|---|---|---|
| Live Iftar/Suhoor countdown timer | Ramadan | M — reuse existing countdown pattern from Home |
| Tap/swipe to mark prayer complete on Home (unlocks Stats entirely) | Prayer Times + Stats | M |
| Manual per-prayer time adjustment (±minutes) | Settings + calc engine + notification service | M — needs new store field + UI + calc/notification wiring |
| Hijri + Gregorian date header on Home | Prayer Times | S |
| Location/city name text on Home (reverse-geocode already exists elsewhere) | Prayer Times | S |
| Circular/arc progress visualization for next-prayer countdown | Prayer Times | M |
| Monthly prayer timetable + share/export (PDF/image) | New screen, or extend Calendar/Agendas | L |
| Full 114-surah Quran corpus + audio recitation + search + tafsir | Quran | L (content licensing/bundling) |
| Fasting tracker / streak / qada log | Ramadan | M |
| Per-prayer notification mute directly on Home row | Prayer Times | S |
| Real magnetic declination (WMM) + real accuracy detection + calibration flow | Qibla | M |
| Wider dua catalog (8 → 40-100+) + audio + search + favorites + sleep/general categories | Dua/Dhikr | M (content) + S (favorites, reusing Quran's bookmark pattern) |
| Real smart-home platform integration (HomeKit/Google Home) or cut the feature | Smart Home | L, or S to remove |
| Working home-screen widget (WidgetKit/AppWidget) | Home Widget | L (native modules) |
| Multi-day/monthly calendar export (.ics) instead of today-only | Agendas | M |
| Custom/user-defined dhikr (promised, not built) | Tasbeeh | S |
| Favorites/saved cities + "Use Current Location" on search screen itself | City Search | S |
| Debounced city search input | City Search | S (bug fix, not feature) |
| Real 100k-city offline DB (currently 19 hardcoded fallback cities vs claimed) | City Search | L, or correct the misleading comment now (S) |
| Madhab + high-latitude questions during onboarding | Onboarding | S |
| Social sign-in (Apple/Google) + forgot-password | Auth | M |
| 5th tab for Quran/Duas instead of buried under More | Tab layout | S |
| Per-prayer sound assignment + volume/silent/vibrate mode | Adhan + Notifications | M |
| Zakat al-Fitr calculator | Ramadan | S |

## 5. P2 — Polish

- Haptics: `expo-haptics` is installed but unused across Home, Qibla, Calendar, Settings, Onboarding, Subscription — wire light/medium/success taps consistent with Tasbeeh's existing correct usage pattern.
- Migrate Qibla needle from legacy `Animated` to already-installed `react-native-reanimated` for smoother rotation.
- Sunrise row visually de-emphasized (grey/smaller) vs actual prayers on Home.
- Pull-to-refresh on Home, Calendar, City Search.
- Calendar: month-jump/year-picker, "Today" quick-jump, in-grid event markers, accessibility labels on grid cells, RTL layout.
- Moon: replace emoji with rendered/animated moon disc; add moonrise/moonset; cross-link to Calendar/Ramadan screens.
- Toast/inline confirmation on settings changes instead of silent writes (Settings, Notifications).
- Consistent error-state component usage — several screens import `ErrorState`/`EmptyState`/`OfflineState` and never render them (Adhan, City Search, Calendar); either wire or remove dead imports.
- Annual-vs-monthly savings badge and feature comparison table on Subscription screen.
- QR-code pairing option on PairTvScreen; paired-devices management list.
- RTL audit across screens claiming RTL-readiness in comments but not implementing `I18nManager` checks (Settings, Adhan, Notifications, Travel).

## 6. What's Already Strong (don't rework)

- 7-state UI machine (skeleton/loading/empty/error/offline/permission-denied/success) genuinely implemented and consistently used across Prayer Times, Qibla, Onboarding, Adhan (mostly).
- Qibla great-circle bearing math and shortest-path needle rotation are correct.
- Madhab toggle + 7 calculation methods correctly exclude Tehran/Jafari per org decision.
- AuthScreen, PairTvScreen, TravelScreen, DuaDhikrScreen, TasbeehScreen: fully wired end-to-end, no dead buttons, real backend calls, good accessibility, correct Islamic content citations (Hisn al-Muslim, Bukhari, Muslim, Abu Dawud).
- AgendasScreen's core `expo-calendar` integration is real (not mocked) apart from the timezone bug.
- Biometric gate on Smart Home lock feature is correctly implemented via `expo-local-authentication`.
- Background rescheduling task (TaskManager + BackgroundFetch) for notifications is real and working.
- Accessibility labeling is consistently strong app-wide (roles, labels, states) — better than most competitor apps at this layer.
- HomeWidgetStub is honest about its own limitation in code and has a sensible future integration point — just needs the native build, not a rewrite.

### TLDR
- Three systemic failures: placeholder prayer-time engine (not the real library), 8+ dead-CTA/no-op buttons on primary flows, and settings that don't persist to the store so real behavior diverges from what users configure.
- Monetization is non-functional end-to-end (no IAP listener, two incompatible entitlement models) — must fix before any store submission.
- Foundation is strong (state machine, a11y, fiqh correctness, wiring patterns) — this is a "finish what's started" problem, not an architecture problem.