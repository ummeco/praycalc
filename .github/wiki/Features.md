# Features

## Accounts & Ummat+

PrayCalc uses the shared Ummat account system — one sign-in works across every app in the ecosystem (web, mobile, desktop, TV). Auth runs against `auth.ummat.dev` (Hasura Auth) and issues a JWT that each surface stores locally.

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
| TV | — | TV app pairing and access are Plus-only |
| Smart Home | — | Google Home / Alexa account linking, device + token routes |

**Note:** Stripe is not yet provisioned for this account. Until then, `/upgrade` shows a "launching soon" state instead of a live checkout — nothing charges. Signing in, syncing settings, and using the calculator work today on every surface regardless of tier.

## Web App (praycalc.com)

| Feature | Status |
| --- | --- |
| GPS-based prayer times | Done |
| City search with autocomplete | Done |
| All calculation methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi) | Done |
| Qibla compass direction | Done |
| Next prayer countdown | Done |
| Monthly/yearly prayer calendars | Done |
| PDF calendar export | Done |
| Dark mode | Done |
| PWA with offline support | Done |
| 8 languages (EN, AR, TR, UR, ID, FR, BN, SO) | Done |
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
| Adhan notifications (9 reciters) | Done |
| Qibla compass | Done |
| Prayer time settings | Done |
| Dark/light theme | Done |
| Tasbeeh counter | Done |
| Ramadan countdown | Done |
| Moon phase display | Done |
| Persistent notification shade | Done |
| Shorebird OTA updates | Done |

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
| Unified 3-platform release (.dmg, .msi/.exe, .deb/.AppImage/.rpm) | Done |
| Account tab: sign in/up, entitlement badge, sign out | Done |

## Documentation Site (praycalc.org)

| Feature | Status |
| --- | --- |
| Calculation methods docs | Done |
| API reference | Done |
| PWA documentation | Done |
| i18n guide | Done |
