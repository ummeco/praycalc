# PrayCalc Gap-Closure Plan — 2026-07

Derived from the competitive gap analysis (`.github/docs/research/competitive-gap-analysis-2026-07.md`)
and the user's 2026-07-07 product decisions (`.claude/memory/decisions.md`). Every gap the analysis
raised is addressed here, assigned, or explicitly deferred with an owner project.

## Guiding decisions

- **DPC is the hero.** Default + highlighted on every surface; .org carries the deep explainer.
- **Mawlid excluded everywhere** (done in foundation commit).
- **PrayCalc stays prayer-focused.** Businesses / masjid-locator DB → Ummat app. Full Quran → Islam.Wiki.
  PrayCalc still ships a readable mushaf + post-adhan/post-prayer duas, and a user-defined geofence
  auto-mute (no masjid DB needed — user adds a location by address or map tap).
- **Keep screens clean** — secondary features live under More/Settings.

---

## WAVE 1 — SHIPPED (2026-07-07, CI-green)

| # | Workstream | Domain | Gap refs |
|---|---|---|---|
| W1.1 | **DPC hero on web/org** + JSON-LD structured data + web live-compass Qibla + Islamic events in .ics export | web/ + org/ | DPC, B13, A14, A13 |
| W1.2 | **Desktop notifications fix** (dead Rust stub → real OS notifications when app closed) + macOS Intel build + tray menu + desktop DPC default | desktop/ | B3, B4, DPC |
| W1.3 | **Backend + TV content**: create pc_dua / pc_hadith / pc_islamic_event tables (Mawlid excluded), seed from cited in-repo content, wire the 3 TV screens off hardcoded arrays; TV DPC default | ummat backend + tv/ | B2, DPC |
| W1.4 | **Mobile mushaf + duas**: readable verse text for short surahs + Islam.Wiki deep links; expand duas with post-adhan + post-prayer adhkar + fuller Hisn al-Muslim subset (cited) | mobile features/quran, dua-dhikr | A7, A8 |

(Foundation already shipped: DPC default + Mawlid removal in mobile/tv.)

## WAVE 2 — SHIPPED (2026-07-07, CI-green)

| # | Workstream | Gap refs |
|---|---|---|
| W2.1 | **Geofence auto-mute**: add a masjid/location by address or map-tap, set radius, auto-mute inside; native module + own store slice + Settings section | (new; user directive) |
| W2.2 | **Notification depth**: bundle more full adhan audio + play full adhan as the Android sound; snooze; **Suhoor/Tahajjud/Qiyam smart alarms** + Last-third/Middle-of-night times; **Android battery-optimization education flow** + "test my adhan" button | A1, A2, A3, A10, C2 |
| W2.3 | **Trackers**: fasting tracker (Ramadan + Mon/Thu + White Days), **qada/missed-prayer logging + excused/menstruation pause** (scholar-reviewed wording), tasbih history | A5, A6, B10 |
| W2.4 | **Jumu'ah suite** (category-first): khutbah reminder, Surah al-Kahf Friday reminder, Ghusl/Sunnah checklist | C1 |
| W2.5 | **Onboarding + method auto-select**: animated permission-priming multi-step onboarding; auto-pick DPC (already default) and detect country for the fixed-method fallback; mobile analytics **consent UI** | B6, A11, A15 |

## WAVE 3 — SHIPPED (2026-07-07)

| # | Workstream | Gap refs |
|---|---|---|
| W3.1 | Lock-screen widgets; **Live Activities + Dynamic Island + StandBy** (iOS) | A4 |
| W3.2 | watchOS phone↔watch sync (WCSession) + populate the complication extension shell; verify Wear tiles | B5 |
| W3.3 | Tablet/iPad adaptive layouts; a11y audit (VoiceOver + Dynamic Type) | B8, B7 |
| W3.4 | Growth: rate-us prompt, share cards, deep links beyond pairing | A9, B11 |
| W3.5 | Web: finish/hide inert social sign-in; PWA push story | B9, B15 |

## Deferred (owner project named — raised, not built here)

| Gap | Owner |
|---|---|
| Local Islamic businesses, halal finder | Ummat app |
| Masjid locator + masjid prayer/Jumu'ah times DB, auto-mute-at-masjid | Ummat app (PrayCalc geofence bridges until then) |
| Full Quran (tafsir, audio, full mushaf, memorization) | Islam.Wiki (PrayCalc ships readable mushaf + deep links) |
| AI fiqh chatbot, social feed/DMs, SVOD streaming, commerce/booking, greeting cards | Non-goals (validated) |
| CCPA `/legal/california` counsel review (U-15) | User/counsel |

## Cross-cutting release gates (every wave)

- Islamic content gate: cited sources, no fabrication, ahl us-sunnah, scholar review for
  qada/excused wording. Mawlid stays excluded.
- Each surface: tsc 0, tests green, local build validated before push. CI green per push.
- Store-launch prerequisites remain user-gated (Expo token, Apple DUNS, Play Console).
