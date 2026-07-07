# PrayCalc Competitive Gap Analysis — 2026-07

Method: two web-research passes (Muslim Pro + Athan/IslamicFinder; Pillars, Sajda, Al-Moazin,
Prayer Now, FivePrayer, Just Pray and platform matrix) cross-tabulated against a fresh-eyes,
code-verified inventory of what PrayCalc actually ships (counts and depth, not checkboxes).
Sources and [unverified] markers live in the agent reports; this doc is the synthesis.

## Where the market is

- **Muslim Pro** (190M downloads): betting on super-app sprawl — AI chatbot, Qalbox streaming,
  social feed/DMs, gamified quests. Carries permanent trust damage from the 2020 location-data
  sale and heavy ad-fatigue complaints ("full-screen ads around the adhan").
- **Athan/IslamicFinder**: the cheap, focused specialist ($9.99/yr) with menstrual mode and 45+
  Quran translations; documented Android adhan-reliability complaints; made widgets free as a
  retention play (reversing premium gating).
- **Pillars**: the polish benchmark — class-leading widgets (home + lock-screen + Live
  Activities + Dynamic Island + StandBy), haptics, animated onboarding, streaks with a
  menstruation "pause", hard privacy stance. iOS-first; Android lags; gates Apple Watch.
- **Sajda**: polished all-rounder — Academy courses, hourly 99-Names lock-screen widget,
  Sajda+ smart Fajr/Tahajjud/Suhoor alarms, web presence.
- Convergent complaints across leaders: **ads around sacred moments** and **first-run accuracy
  configuration burden**. Convergent absences: **Jumu'ah features (nobody)** and **a good
  Android battery-optimization education flow (nobody)**.

## Where PrayCalc stands

Genuine strengths already shipped: 7 methods + custom angles + 4 high-lat rules + per-prayer
corrections (engine depth competitive with anyone), travel/qasr mode, offline-first calc,
235k-city web with embed + API + PWA, TV dashboard with live streams + kiosk mode +
screensaver (no competitor has a real Android TV product), desktop tray app, wear/watch
foundations, no ads anywhere, self-hosted analytics, $9.99/yr at the value end. Platform
breadth already exceeds everyone except Athan Pro.

The liability is depth-behind-the-checkbox: features exist as minimum implementations where
competitors ship mature ones. Itemized below.

---

## A. Table-stakes gaps (competitors have it; users will notice)

| # | Gap | Evidence vs us | Effort |
|---|---|---|---|
| A1 | Full adhan audio offline + as the Android notification sound (we bundle ONE 26s takbir; the 7-voice "library" is remote streaming) | All competitors bundle multiple full adhans; Android channel sound has no 30s cap — we under-deliver on Android for no technical reason | M |
| A2 | Suhoor / Tahajjud / Qiyam smart alarms + Last-third & Middle-of-night times displayed | Sajda+ (paid), Al-Moazin, Prayer Now, Pillars (times) | S-M |
| A3 | Notification snooze | Standard everywhere; we have zero | S |
| A4 | Lock-screen widgets; Live Activities + Dynamic Island + StandBy (iOS) | Pillars (all), Sajda, Muslim Pro (lock-screen) — we have home-screen only | M-L |
| A5 | Fasting tracker (Ramadan + qada + Mon/Thu, White Days) | Pillars, Muslim Pro, Athan — our Ramadan screen is a countdown | M |
| A6 | Missed-prayer (qada) logging + excused/menstruation pause mode | Pillars' signature humane feature; Athan Menstrual Mode — our stats literally cannot record a miss; needs scholar-reviewed wording | M |
| A7 | Quran verse text (we ship a surah index with zero verses) | Every competitor bundles at least a readable mushaf — DECISION POINT vs the islam.wiki scope split; minimum viable: bundled text-only mushaf, keep tafsir/audio on islam.wiki | L + decision |
| A8 | Duas/adhkar depth: 9 duas + 5 dhikr presets vs full Hisn al-Muslim (~130 chapters) elsewhere | Sourced-content expansion; content gate applies (citations required) | M (content) |
| A9 | Rate-us prompt, share cards, referral — zero growth mechanics | Universal; StoreReview API is an afternoon | S |
| A10 | Battery-optimization education flow (Android) | Category-wide complaint, nobody solves it well — both a gap and C2's opportunity | S-M |
| A11 | Calculation-method auto-selection by country | FivePrayer's most-praised feature; Muslim Pro auto-configures; we default MWL globally | S |
| A12 | Hijri event-list consistency: mobile shows Mawlid in its events list while TV banner policy excludes it | User content directive was TV-specific; needs one policy decision applied everywhere | S + decision |
| A13 | Islamic events (Eids, Ramadan) in the .ics calendar export | Small, differentiating for the export we already have | S |
| A14 | Web Qibla is a static needle (no device-orientation compass on mobile web) | Mobile-web users get a worse experience than any competitor's web | S |
| A15 | Analytics consent UI on mobile (Umami+Sentry run unconditioned) | Required to CLAIM the privacy positioning (and for store privacy labels) — web already has consent | S |

## B. Depth-vs-checkbox gaps (the vibe-coding debt — looks done, is shallow)

| # | Gap | Reality |
|---|---|---|
| B1 | i18n coverage ~20% on mobile (en=490 lines, others ~93; screens.* falls back to English) | Worst for ar/ur RTL users — mixed-language UI in our most important locales |
| B2 | TV Dua/Hadith/Events screens = 3-item hardcoded arrays; pc_dua/pc_hadith/pc_islamic_event tables don't exist in prod | Queries are pre-written and dormant; content provisioning + table creation needed |
| B3 | **Desktop notifications are dead code** — Rust stub never invoked; nothing fires unless the window is open | Desktop's core promise (adhan on your desktop) silently broken |
| B4 | macOS builds are arm64-only while release notes claim macOS support generally | Intel Mac users get nothing; overclaim |
| B5 | watchOS: complication extension target is an empty shell; zero phone↔watch sync (no WCSession); wearOS is ahead | The "killer feature" (wrist complication) isn't actually populated on iOS-side watch |
| B6 | Onboarding = 1 screen / 3 steps vs Pillars' animated, permission-priming, auto-detecting flow | First-run accuracy config is the #1 category complaint — our onboarding doesn't solve it |
| B7 | A11y is selective (87 labels / 62 files); no VoiceOver audit, no Dynamic Type strategy | Under-marketed category-wide (opportunity), but we can't claim it yet |
| B8 | Tablet "support" is a flag with zero adaptive layouts | iPad users get a stretched phone app |
| B9 | Web social sign-in buttons are inert ("coming soon") | Visible broken promise on the auth screen |
| B10 | Tasbih has no history log; stats have no export | Muslim Pro/Athan both journal |
| B11 | Deep links: only the TV-pairing route | No city/screen links for sharing or widgets |
| B12 | Mosque finder: fixed 10km, no filters, no mosque prayer/Jumu'ah times | Muslim Pro shows mosque details; ours is a list + maps handoff |
| B13 | Zero JSON-LD structured data on a 235k-city SEO site | Large organic-traffic opportunity being left on the table |
| B14 | CCPA page carries 4 unresolved counsel TODOs (U-15, known/user-gated) | — |
| B15 | Web countdown is a local tick; no service-worker push story | Minor |

## C. Differentiators nobody has (offense)

| # | Opportunity | Why us |
|---|---|---|
| C1 | **Jumu'ah suite** — khutbah-time reminders, Surah al-Kahf Friday reminder, Ghusl/Sunnah checklist, masjid Jumu'ah times | Research: "no app mentions Jumu'ah-specific features" — first-mover on a weekly ritual every user observes |
| C2 | Android notification-reliability done right (OEM education + follow-ringer + test-my-adhan button) | The category's loudest complaint; nobody owns the fix |
| C3 | Multi-platform done well (Android TV + Wear OS + web + desktop + kiosk) | Only Athan Pro competes; we already lead — finish depth (B3/B5) and market it |
| C4 | Privacy-first, ads-never positioning | Post-Muslim-Pro-scandal, this is THE trust axis; we're genuinely clean — needs A15 + messaging |
| C5 | Institutions (prisons, universities, hospitals, masjids) | We uniquely have /institutions + TV kiosk mode + multi-year tables; zero competition |

## D. Deliberate non-goals (validated — don't chase)

Super-app sprawl: AI fiqh chatbot (content-gate risk), social feed/DMs, SVOD streaming,
halal-restaurant/commerce/Umrah booking, greeting cards. Full Quran experience stays
islam.wiki's remit (subject to the A7 minimum-mushaf decision).

## Monetization note

$9.99/yr sits at Athan's price point (vs Muslim Pro $34.99, Pillars $11.99/$49.99-lifetime).
One competitor lesson: Athan un-gated widgets in 2024 as a retention play, and Pillars takes
flak for gating Apple Watch. Consider whether the home-screen widget belongs in free tier
with premium widget STYLES, keeping TV/smart-home/voices as the paid spine.

## Priority order (impact × effort)

- **P0 — before store launch:** B3 (desktop notifications — broken promise), A15 (consent UI),
  B1 (ar/ur i18n coverage), B6+A11 (onboarding + method auto-select), A10 (battery education),
  A9 (rate/share), A3 (snooze), A12 (Mawlid policy decision).
- **P1 — first post-launch cycle:** A1 (full adhan on Android + more bundled audio), A2
  (suhoor/tahajjud + night times), A4 (lock-screen widget minimum, then Live Activities),
  A5 (fasting tracker), A6 (qada + excused mode, scholar-reviewed), C1 (Jumu'ah suite),
  A8 (duas expansion), B5 (watch sync), B2 (TV content tables).
- **P2:** A7 decision + execution, B12 (mosque depth), B13 (JSON-LD), A13 (ICS events),
  A14 (web compass), B8 (tablet), B10, B11, C5 marketing page refresh, CarPlay/Android Auto
  research, Vision Pro (Athan Pro is there).
