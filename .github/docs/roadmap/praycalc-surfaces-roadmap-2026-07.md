# PrayCalc — Remaining Surfaces & Launch Roadmap (2026-07)

Forward plan for every surface that is not yet in a store, plus the launch pipeline itself.
Every current-state claim below is cited to a file that was read on 2026-07-06.
Effort classes: **S** ≤1 day · **M** 2-5 days · **L** 1-2 weeks · **XL** >2 weeks.

## Ground truth — where each surface actually is

| Surface | State | Evidence |
|---|---|---|
| Mobile (RN/Expo) | Code-complete, 19/20 parity PASS, 1 PARTIAL (iOS widget) | `mobile/PARITY-GATE.md` rows 1-20 |
| iOS home widget | Not built (Android widget real) | `mobile/src/features/home-widget/HomeWidgetStub.tsx` L50-53 |
| TV (react-native-tvos) | **~40% — scaffold, not shippable** | `tv/CHANGELOG.md` ("Initial scaffold"); stubs below |
| watchOS (Swift) | ~55% — no Xcode project exists yet | `watchos/PrayCalcWatch/Bridge/XCODE_SETUP.md` |
| Wear OS (Kotlin) | ~70% — buildable Gradle project | `wearos/app/build.gradle.kts`, `.kt` sources present |
| Store pipeline | Workflows written, **zero accounts provisioned** | `.github/docs/runbooks/mobile-tv-release-provisioning.md` |
| Crash/analytics | Code wired, no-op without DSN/URL env | `mobile/src/lib/sentry.ts` L35-45, `analytics.ts` L51 |

**Repo-state surprises found while reading (all independently verified):**

- **TV pairing works by design but is fragile across relaunch.** `tv/src/lib/pairing/pairingService.ts` only *queries* `pc_tv_pairing` (L67-71) — that is intentional: the TV displays a locally generated PIN, the mobile app creates the row (`mobile/src/lib/pairing/pairingMutation.ts` upsert with `paired: true`), and the TV's poll then finds it. The loop closes; it was verified live (mobile-role upsert → anonymous TV poll). The REAL gaps: the TV's device ID and PIN are never persisted (see next bullet), so a relaunched TV loses its paired identity; and TV-side pre-registration (task 3.1) would additionally let mobile validate a PIN exists before claiming it. Keep 3.1 as an improvement, not a "pairing is broken" fix.
- **Four TV screens are hardcoded-data stubs**, despite real queries existing in `tv/src/lib/graphql/queries.ts`: `HadithOfDayScreen` (`SAMPLE_HADITH`), `DuaDisplayScreen` (`SAMPLE_DUAS`), `CitySearchScreen` (`SAMPLE_CITIES`), `IslamicEventsScreen` (8-event array). Each has an "in production, fetch from pc_*" comment.
- **TV has no persistence.** `AsyncStorage` is a dependency but appears only in code comments (`settingsStore.ts` L5, `pairingService.ts` L25) — never imported. Device ID, PIN, and settings reset on every launch.
- **TV client hits the wrong endpoint.** `tv/src/lib/graphql/client.ts` L11 targets `api.ummat.dev` (admin), not the per-app CORS endpoint `api.praycalc.com` the PRI mandates.
- **`store-listings.md` is stale** (`.claude/docs/store-listings.md`): says v1.2.0, advertises the Tehran method (excluded per D-P3-19), "export as PDF" (replaced by `.ics`), and an Apple Watch app as shipping (it is a scaffold). Current mobile version is 2.1.0. This file must not be submitted as-is.
- **watchOS complication fetches over network, not the local engine.** `ComplicationController.swift` calls `api.praycalc.com` instead of the shared C core in `PrayCalcEngine.swift` — the "offline-first" story breaks exactly at the killer feature. Wear OS wires its tile/complication to the offline JNI calc correctly.

Shared calc engines exist and are real: `core/c/` (C, used by watch/wear via JNI/bridge) and `packages/pray-calc/` (`@acamarata/pray-calc`, TS, used by mobile/TV). New surfaces should reuse these, not re-derive.

---

## Epic 1 — Store launch pipeline (critical path)

Nothing ships until this exists. The runbook is written; the accounts are not. Only the user can do the account/identity/payment steps (`runbook` L8-9).

| Task | Effort | Owner | Dependency | Acceptance |
|---|---|---|---|---|
| 1.1 Expo org + `EXPO_TOKEN` secret | S | user | — | `eas whoami` works in CI; token in repo secrets (`runbook` §1.5) |
| 1.2 `eas init` in `mobile/` + `tv/` | S | agent-able after 1.1 | 1.1 | real projectId replaces `UD-PENDING-EAS-PROJECT-ID` (`mobile/app.json` L141) |
| 1.3 **Apple Developer Program (org)** | M-L wall-clock | user | — | enrolled; DUNS verification can take days if org (`runbook` §2.1) — **start first, it gates everything iOS/tvOS** |
| 1.4 Two Apple bundle IDs + two ASC app records + ASC API key (.p8) | S | user | 1.3 | `.p8` downloaded once; Team ID + Key ID + Issuer ID captured (`runbook` §2.2-2.4) |
| 1.5 Fill `eas.json` identifiers, base64 `.p8` → `ASC_API_KEY_P8` secret | S | agent-able | 1.4 | four `UD-PENDING-*` fields replaced in `mobile/eas.json` L41-44 + `tv/eas.json` L43-46 |
| 1.6 Play Console ($25) + two apps + service-account JSON | M | user | — | `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret set; first manual upload done (Play requires it, `runbook` §3.4) |
| 1.7 Amazon Developer (Fire TV, tv/ only) | S | user | — | app record created (`runbook` §4) |
| 1.8 First internal builds (TestFlight + Play internal track) | M | agent-able | 1.1-1.6 | green `release-mobile.yml` run; build lands in both internal tracks |
| 1.9 Play Data Safety form: account-deletion URL | S | user | 1.6 | URL set to `praycalc.com/account/delete` (`.claude/docs/PLAY-DATA-SAFETY.md`) |
| 1.10 Rewrite `store-listings.md` to current reality | M | agent-able | — | no Tehran, no PDF, watch/TV listed as "coming" not "shipping"; version 2.1.0 |

**On-device validation checklist (code-complete-but-unvalidated — do on first internal build):**

| Item | Why it needs a real device | Source |
|---|---|---|
| Android home widget refresh | `react-native-android-widget` never run on hardware | `HomeWidgetStub.tsx` L15 "validation pending first store build" |
| Adhan notification sound | 30s iOS cap + dedicated Android channel | `PARITY-GATE.md` row 10 |
| Reschedule across reboot | background task registration | `PARITY-GATE.md` L51 |
| RTL on real devices | `applyRTL` + restart prompt | `PARITY-GATE.md` row 16 |
| Iqamah second-notification | offset options 10/15/20/30 | `NotificationSettingsScreen.tsx` L46 |

**Data-safety / privacy declarations PrayCalc must file** (given its actual data touchpoints):

- **Location** — approximate + precise, used for prayer-time/Qibla calc; declare "not shared, not linked to identity," processed on-device. (GPS per `PARITY-GATE.md` row 7.)
- **Notifications** — no data collected, but declare the permission.
- **Purchases / IAP** — Ummat+ subscription (`HomeWidgetStub.tsx` L96 gating).
- **Analytics** — anonymous only *if* Umami is enabled; today it is a no-op (`analytics.ts` L51). Declare only when a URL is set; the code already guarantees zero PII (`analytics.ts` L4-11).
- **Crash data** — Sentry, only if DSN set, PII scrubbed (`sentry.ts` L49-68). Declare "crash logs, not linked to identity" when enabled.
- Account-deletion URL is mandatory because the app supports account creation (`PLAY-DATA-SAFETY.md`).

**Prayer-app-specific review-rejection risks:** location-permission justification (must explain prayer-time use in the purpose string or Apple rejects); IAP that gates "religious obligation" features draws scrutiny — keep free tier fully functional (it is); bundle-ID continuity with the archived Flutter listing so it reads as an update, not a clone (`runbook` §2.2, `mobile/DEPLOYMENT.md` FGAP-08); no misleading "official"/mosque-affiliation claims in the listing.

---

## Epic 2 — iOS WidgetKit extension (closes PARITY-GATE row 20)

The only PARTIAL parity row. Android widget is real; iOS is a documented no-op (`HomeWidgetStub.tsx` L50-53, PCI `pci-praycalc-home-widgets-native`).

| Task | Effort | Notes |
|---|---|---|
| 2.1 Choose approach: `expo-apple-targets` config plugin vs bare `expo prebuild` + hand-written Swift target | S (decision) | `expo-apple-targets` keeps the managed flow; bare gives full control but forfeits prebuild |
| 2.2 App Group + shared container to bridge next-prayer data RN→widget | M | RN writes next-prayer JSON to App Group `UserDefaults`; widget reads it |
| 2.3 WidgetKit timeline provider (small/medium sizes) computing from shared data | M | mirror Android `NextPrayerWidget.tsx` |
| 2.4 Wire `writeWidgetData` iOS branch (currently returns early, L50) | S | replace no-op with App Group write + `WidgetCenter.reloadTimelines` |

**Acceptance:** iOS home-screen widget shows the real next prayer and refreshes after a settings change; `PARITY-GATE.md` row 20 flips to PASS; PCI closed. **Effort: M-L total.** Depends on Epic 1.3 (needs Apple Program for the App Group entitlement).

---

## Epic 3 — TV app completion (biggest gap)

`tv/` is a 40% scaffold, not the near-done app the parity gate implies. It needs real work before any store.

| Task | Effort | Acceptance |
|---|---|---|
| 3.1 **Implement TV-side pairing registration** (the missing mutation) | M | TV inserts its PIN/device into `pc_tv_pairing`; mobile can claim it; loop closes end-to-end on real hardware |
| 3.2 Add AsyncStorage persistence (device ID, PIN, settings) | S | device ID stable across relaunch (`pairingService.ts` L25 comment resolved) |
| 3.3 Wire 4 stub screens to existing queries | M | Hadith/Dua/CitySearch/IslamicEvents pull from `pc_*` via `queries.ts` (already written), no `SAMPLE_*` constants remain |
| 3.4 Point client at `api.praycalc.com` per PRI | S | `client.ts` L11 no longer targets `api.ummat.dev` |
| 3.5 Replace approximate Hijri conversion with shared engine | S | `CalendarScreen` uses `@acamarata` Hijri, not the rough inline approximation |
| 3.6 tvOS + Android TV store pipeline | M | see Epic 1; `release-tv.yml` already exists, needs `tv/eas.json` identifiers + first manual passes; Fire TV APK is manual (`release-tv.yml` L103-122) |

**Total effort: L.** Depends on Epic 1 for submission. Note the `release-tv.yml` caveat (L9-14): EAS tvOS-scheme builds are less battle-tested; documented fallback is a macOS `xcodebuild`+fastlane job for the iOS/tvOS leg only.

---

## Epic 4 — watchOS + Wear OS (from scaffolds)

Both compute prayer times from the shared `core/c/` engine. The killer feature is a **complication/tile showing the next prayer**. Minimal shippable v1 = list of today's times + next-prayer complication; defer Qibla-on-wrist and settings-on-wrist.

| Platform | State | v1 gap | Effort |
|---|---|---|---|
| **Wear OS** | ~70%, buildable Gradle, tile+complication already wired to offline JNI calc | verify phone→watch Data Layer sync path (`PrayerDataListenerService.kt` unverified); add CI leg; confirm launcher/tile art; Play TV/Wear listing | M |
| **watchOS** | ~55%, **no Xcode project exists** | create the `.xcodeproj` + Widget Extension target manually (`XCODE_SETUP.md`); **fix complication to call the local engine, not `api.praycalc.com`**; wire C core into the widget target; real app icon | L |

**Acceptance (both):** installs from store; next-prayer complication/tile updates locally without network; today's times list renders offline. Wear OS is the faster win — ship it first. Both depend on Epic 1 accounts (Wear OS on Play 1.6, watchOS on Apple 1.3).

---

## Epic 5 — Translation review operation (374-key catalog)

Full extraction is done; most non-en keys fall back to English (`mobile/src/i18n/REVIEW.md` L18-22). Religious-adjacent strings were deliberately never machine-translated and are release-gated.

| Task | Effort | Owner |
|---|---|---|
| 5.1 Machine-translate the ~260 generic-UI `screens.*` keys (safe chrome) | M | agent-able (per `REVIEW.md` L131-143 these are explicitly safe) |
| 5.2 **Scholar/qualified review of religious-adjacent keys** before any locale ships them | L (external) | user must source reviewers per PPI content gate |
| 5.3 Per-locale QA pass (RTL, truncation, date formats) | M | agent-able |

**Religious keys needing human review** (`REVIEW.md` L119-129): `screens.travel.musafirAlertBody`, `screens.travel.fiqhNote`, `screens.ramadan.laylatAlQadrBody`, `screens.moon.ramadanNote`, `screens.moon.dhulHijjahNote`. Dua/dhikr/Quran arrays stay English/Arabic forever (Hard Content Gate, `REVIEW.md` L27-52).

**Locale priority by market:** ship **ar, ur, id, tr, fr** first (largest Muslim populations + already deepest coverage — ar/ur have +24 keys, `REVIEW.md` L70-71). Then bn, ms, so. The other 13 stay en-fallback until demand justifies review cost.

**Process:** machine pass on chrome (5.1) → scholar review on the 5 flagged keys + any locale-specific fiqh nuance (5.2) → native-speaker QA (5.3) → mark the locale "reviewed" in `REVIEW.md`. A locale is not "done" until its religious keys pass scholar review — mistranslated fiqh is release-blocking per PPI theology standards.

---

## Epic 6 — Post-launch operations

| Item | Current | Needed | Effort |
|---|---|---|---|
| Crash reporting | Sentry wired, no-op without DSN (`sentry.ts` L35) | provision nSentry per Policy 8, set `EXPO_PUBLIC_SENTRY_DSN` as EAS secret | S |
| Analytics | Umami wired, no-op without URL (`analytics.ts` L51) | provision Umami site, set `EXPO_PUBLIC_UMAMI_URL` + website ID | S |
| Store-review responses | none | define who monitors + responds; 24-48h SLA on 1-star reports | S (process) |
| Update cadence | ad-hoc | monthly patch train; `git tag && git push` per `runbook` §6 | S |
| **iOS critical-alerts entitlement** | uses `timeSensitive` (`PrayerNotificationService.ts` L246) | request Apple Critical Alerts entitlement so adhan bypasses DnD; PCI `pci-praycalc-ios-critical-alerts` | M (Apple approval, user-led) |

Open PCIs tracked: `pci-praycalc-home-widgets-native` (Epic 2), `pci-praycalc-ios-critical-alerts` (above), `pci-praycalc-iap-sandbox`, `pci-praycalc-quran-corpus`.

---

## Epic 7 — Non-goals (restated, do not scope-creep)

- **No full Quran** in PrayCalc — that is islam.wiki (`.claude/docs/VISION.md` L24; TV/mobile keep only Al-Fatiha + citations).
- **No Tehran / Jafari method** — excluded by decision D-P3-19 (`PARITY-GATE.md` row 5). The stale `store-listings.md` still advertises it; that is a doc bug, not a feature.
- **No mosque-finder v2** — v1 (OSM Overpass, 10km) is the ceiling for this phase (`PARITY-GATE.md` L64); no reviews, prayer-space details, or check-ins.
- No social, chat, or masjid-management (belongs to Ummat App / Chat / Pro, `VISION.md` L23-26).

---

## Next 3 actions

1. **[user]** Start Apple Developer Program org enrollment at developer.apple.com/programs today — the DUNS verification is the longest lead-time item and gates every iOS, tvOS, and watchOS surface (`runbook` §2.1).
2. **[user]** Create the Expo org + generate the `EXPO_TOKEN` and add it to repo secrets, so the agent can run `eas init` and unblock all build work (`runbook` §1).
3. **[agent-able]** Rewrite `.claude/docs/store-listings.md` to current reality (drop Tehran and PDF, mark watch/TV as "coming soon," set version 2.1.0) so no false claim reaches a store reviewer.
