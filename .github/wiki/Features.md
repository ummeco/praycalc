# Features

## Accounts & Ummat+

PrayCalc uses the shared Ummat account system — one sign-in works across every app in the ecosystem (web, mobile, desktop, TV). Auth runs against `auth.ummat.dev` (Hasura Auth). The web app keeps the session in httpOnly cookies behind same-origin `/api/auth/*` proxy routes; mobile stores tokens in expo-secure-store and desktop in a tauri-plugin-store file.

| Tier | Price | What you get |
| --- | --- | --- |
| Free | $0 | Full prayer time calculator on every surface: web, mobile, desktop |
| Ummat+ | $9.99/yr | Everything in Free, plus TV app access and Smart Home integrations |

Ummat+ status is checked server-side wherever it matters — the client never decides who gets Plus. Billing runs through the shared Ummat backend (Stripe + Apple/Google IAP webhooks keep entitlement in sync).

| Surface | Free tier | Ummat+ adds |
| --- | --- | --- |
| Web (praycalc.com) | Sign in/up, saved settings, calculator | Plus badge on the account island, `/upgrade` checkout flow |
| Mobile (RN) | Sign in/up, calculator, notifications | Pair a TV from Settings > Connect TV |
| Desktop (Tauri) | Sign in/up from the Account tab, calculator | Entitlement badge, link out to `/upgrade` |
| TV | — | TV app pairing, account-linked control, and deep display settings are Plus-only |
| Smart Home | — | Google Home / Alexa account linking, device + token routes |

**Note:** Stripe is not yet provisioned for this account. Until then, `/upgrade` shows a "launching soon" state instead of a live checkout — nothing charges. Signing in, syncing settings, and using the calculator work today on every surface regardless of tier.

## TV Control (account-linked)

An unpaired PrayCalc TV shows a 6-digit code on launch. A signed-in Ummat+ user adds that TV to their account from any surface, then controls it remotely. No remote control needed after setup — masjids running several TVs manage all of them from one phone or laptop.

**Add a TV**

- Web: praycalc.com account page, "Add TV" — enter the code shown on the TV screen
- Desktop: menu-bar app, "My TVs" tab — enter the code
- Mobile: Pair TV screen — enter the code

**What syncs, and how fast**

Once paired, every setting change made from web, desktop, or mobile reaches the TV in about 5 seconds. The TV polls its own settings row on that interval, so there's nothing to refresh or reboot.

**Per-TV settings**

| Setting | Description |
| --- | --- |
| Name | Custom label per TV (e.g. "Main Hall", "Musalla") |
| Accent color | Defaults to green, customizable per TV |
| Stream source | The background video/stream shown on the TV |
| Content rotation | Minutes between rotating content panels |
| Weather | Toggle the weather panel on/off |
| Location | Per-TV city/lat/lng, independent of the account owner's own location |
| Countdown takeover | Full-screen countdown in the final N minutes before adhan |
| Iqama times | Per-prayer minutes-after-adhan offset (no sunrise iqama) |
| Prayer-name-only mode | Full-screen prayer name for N minutes after adhan/iqama; hides the stream during this window |
| Calculation method | Same method options as the other apps |
| Madhab | Hanafi/Shafi Asr setting |
| Time format | 12h or 24h |

**Multiple TVs**

One account can pair and manage any number of TVs. Each TV keeps its own independent settings.

Mawlid content is excluded from all TV displays.

See also [[Smart-Home]] for the TV Command Center on Android TV/Fire TV, which is a separate feature.

## Web App (praycalc.com)

| Feature | Status |
| --- | --- |
| GPS-based prayer times | Done |
| City search with autocomplete | Done |
| DPC (dynamic, flagship default) + fixed presets (MWL, ISNA, Egypt, Umm al-Qura, Karachi, UOIF) + Custom — Tehran/Jafari excluded (D-P3-19) | Done |
| Qibla compass direction | Done |
| Next prayer countdown | Done |
| Monthly/yearly prayer calendars | Done |
| PDF calendar export | Done |
| Dark mode | Done |
| PWA with offline support + install-to-home-screen (A2HS) | Done |
| 12 languages (EN, AR, UR, FA, ID, TR, MS, BN, FR, ES, DE, RU) | Done |
| RTL layout support | Done |
| Adhan audio preview | Done |
| Settings panel with method selection | Done |
| SEO (meta, JSON-LD, sitemap) | Done |
| Accessibility (WCAG 2.1 AA) | Done |
| Last visited cities | Done |
| Popular cities | Done |
| Session management | Done |
| Account sign in/up (Hasura Auth) | Done |
| Ummat+ badge + billing status | Done |
| `/upgrade` and `/upgrade/success` pages | Done |

## Institutions Reference (praycalc.com/institutions)

A public reference page for schools, universities, correctional facilities, hospitals, the U.S. military, employers, and government agencies on Islamic religious obligations and reasonable accommodation.

- **Multi-year Islamic dates table** — Ramadan, Last 10 Nights, Eid al-Fitr, Day of Arafah, Eid al-Adha, and Ashura, computed via the Umm al-Qura calendar (`@umalqura/core`). Auto-starts at the current Hijri year and runs 15 years forward, so it never needs manual updates; the current year is highlighted.
- **Accommodation guidance by topic** — Ramadan Suhoor/Iftar timing, the two Eids, daily prayer, halal dietary needs, dress/modesty, Hajj travel, religious property, and end-of-life — each with specific callouts for prisons, hospitals, schools, the military, and employers.
- **Authoritative references** — EEOC, U.S. Dept. of Education, CAIR, DOJ RLUIPA, Federal Bureau of Prisons (P5360.09), and DoD Instruction 1300.17.
- Printable; linked from the praycalc.com footer.

## Mobile App (React Native + Expo)

| Feature | Status |
| --- | --- |
| Prayer times display | Done |
| Adhan notifications (Makkah, Mishari, Madina) | Done |
| Qibla compass | Done |
| Prayer time settings | Done |
| Dark/light theme | Done |
| Tasbeeh counter | Done |
| Ramadan countdown | Done |
| Moon phase display | Done |
| Persistent notification shade | Done |
| OTA updates (expo-updates — checks on launch + foreground, applies on next natural launch) | Done |

## Desktop App (macOS, Windows, Linux)

| Feature | Status |
| --- | --- |
| Menu bar / system tray app (Tauri 2 + Vite + React 19) | Done |
| Live countdown text in tray (macOS) | Done |
| Live countdown via tooltip + click popup (Windows, Linux) | Done |
| Popup auto-positions above/below tray based on taskbar position | Done |
| Tray-only, no dock icon (macOS) | Done |
| Auto-start on login | Done |
| Native notifications | Done |
| Unified 3-platform release (.dmg/.app.tar.gz, .msi/.exe, .deb/.AppImage) | Done |
| Account tab: sign in/up, entitlement badge, sign out | Done |
| Seamless auto-update (checks on launch + hourly, downloads in background, "Restart to update" banner) — since v1.2.3 | Done |

## Documentation Site (praycalc.org)

| Feature | Status |
| --- | --- |
| Calculation methods docs | Done |
| API reference | Done |
| PWA documentation | Done |
| i18n guide | Done |
