# PrayCalc Auto-Update Map — every surface, zero manual steps

> Goal state (owner directive 2026-07-12): after the humans' FIRST store upload,
> no surface ever needs a manual update push again. This document is the
> authoritative map of how each surface updates, what triggers it, and the one
> platform-imposed exception.

| Surface | Mechanism | Trigger | User action needed |
|---|---|---|---|
| **Web (praycalc.com)** | Vercel deploy on push + PWA service worker (`skipWaiting` on activate) | `git push` to main | None — next page load runs the new version |
| **Org (praycalc.org)** | Vercel deploy on push | `git push` to main | None |
| **Desktop (Win/macOS/Linux)** | Tauri updater: checks `desktop-latest/latest.json` on launch + hourly, downloads signed update in background, installs on "Restart" click | `desktop-v*` tag → `release-desktop.yml` (signed artifacts + rolling `desktop-latest` manifest) | One click ("Restart to update") — by design, so we never kill the app mid-use |
| **Mobile iOS/Android — JS & content** | **expo-updates OTA**: embedded in every binary (`CHECK_ON_LAUNCH=ALWAYS`, `LAUNCH_WAIT_MS=0`) — downloads silently in background, applies next launch | `mobile-v*` tag → `release-mobile-ota.yml` publishes to the `production` channel | **None. Fully silent.** |
| **Mobile — native module changes** | Store release (platform rule — see below) | `release-mobile.yml` (EAS build+submit) | Store auto-updates the app for users; humans only approve the store submission |
| **Mobile — GitHub direct-install APK** | Same OTA as above (config baked into the APK manifest) + new APKs per tag | `mobile-v*` tag → `release-mobile-apk.yml` | None for JS updates; sideload again only for native changes |
| **TV (Play / Fire TV store installs)** | Store auto-update | `tv-v*` tag → `release-tv-apk.yml` → store submission | None (store handles it) |
| **TV (sideloaded)** | In-app UpdateToast polls GitHub `tv-v*` releases | same | Staff-only surface; toast points at the download |
| **Watch (watchOS/Wear OS)** | Bundled with the phone app — updates ride every mobile store release automatically | mobile release | None |
| **Smart server (smart.praycalc.com)** | **CI auto-deploy**: `deploy-smart.yml` — test → rsync → docker build → restart → public health verify | `git push` to main touching `smart/**` | None — merged code is live in ~3 min |
| **Home Assistant (HACS)** | HACS surfaces new `praycalc-ha` releases; updates apply on the user's HACS update flow | `v*` release on `ummeco/praycalc-ha` (sync per `smart/homeassistant/HACS.md`) | One click in HACS (HA platform convention) |
| **Homebridge plugin** | npm release; Homebridge UI auto-update (users can enable unattended plugin updates) | `npm publish` from `homebridge/` | None if user enables Homebridge auto-update |
| **Alexa skill / fulfillment** | Server-side only — fulfillment lives on smart.praycalc.com, so skill behavior updates with every smart deploy | smart deploy | None |

## The one exception (platform-imposed, not ours)

Apple and Google **prohibit** silently swapping native code outside their stores.
Anything that changes native modules (new permissions, new native dependencies,
RN/Expo SDK upgrades) requires a store build + review. Everything else — screens,
logic, translations, content, bug fixes in JS — ships **OTA with zero user action**
via expo-updates. The `runtimeVersion: appVersion` policy guarantees an OTA bundle
can never land on a binary whose native side doesn't match it.

## Activation status (2026-07-12)

Everything above is live EXCEPT mobile OTA publishing, which is wired and
placeholder-gated: paste `EXPO_TOKEN` (repo secret) and replace
`UD-PENDING-EAS-PROJECT-ID` in `mobile/app.json` (one find/replace — two
occurrences) per `.github/docs/CREDENTIALS.md`. The `release-mobile-ota.yml`
workflow no-ops with a notice until then, then publishes on every `mobile-v*` tag
automatically. Binaries built from 2.2.1+ already contain the OTA client config.

## Release ritual (what a "release" is now)

```bash
# bump version in the surface's manifest + CHANGELOG, commit, then:
git tag mobile-v<X.Y.Z> && git push origin mobile-v<X.Y.Z>   # mobile: APK + OTA
git tag desktop-v<X.Y.Z> && git push origin desktop-v<X.Y.Z> # desktop: installers + updater feed
git tag tv-v<X.Y.Z> && git push origin tv-v<X.Y.Z>           # tv: signed APK
# web/org/smart: just merge to main
```

Every pipeline is green-verified as of 2026-07-12. No other steps exist.
