# Release praycalc v0.9.0 — 2026-04-27

## Version (locked)
0.9.0

> Note: web/package.json is on 1.2.1 (P2 closeout). Flutter pubspec reflects prior versioning.
> v0.9.0 is the P3 release tag for the monetization + CI quality gate phase (phase2 commits).
> Aligns P3 release plan numbering. The v1.2.1 web build is the artifact being tagged.

## Features included

### v1.2.1 — P2 Phase 2 closeout (current HEAD)
- Monetization scaffolding (phase2 commit 56928f4)
- CI quality gates across web + org
- Legal pages (contact, account deletion for Play compliance)
- FVM pin for Flutter
- CVE patches across web + org (commit c711576)
- Phase 1 security hardening + legal pages (commit f867f07, v1.2.1 tag)

### v1.2.0 — Screenshots, real-time WS push, tvOS, watchOS, release automation
- Real-time WebSocket push for prayer time updates
- tvOS app icon set (AppIcon.brandassets PNGs)
- watchOS support
- Release automation workflow (replaces manual steps)
- Rate limit smoke test fixes
- Contact page + account deletion info (Play Store compliance)
- org docs update for desktop + TV feature pages

### v1.1.0 — TV, Quran, widgets, i18n, smart home, WearOS
- TV display (Android TV / Apple TV)
- Quran integration
- Home screen widgets
- Full i18n wiring (CityInfoHeader, GeoPrompt, QiblaModal, PrayerArrivalOverlay)
- Smart home integration (Homebridge)
- WearOS support
- Glance widget fixes

### v1.0 baseline
- TV display, desktop, mobile, smart home, web dashboard

### CI / infra
- Linux CMake regression fixes (cmake 3.27.9 pin, IMPORTED_TARGET bug)
- Shorebird integration (non-blocking) + Amazon flavor
- Android: AGP 8.9.1 + Kotlin 2.1.21 + Gradle 8.11.1 stack
- macOS NSPanel + WindowManagerPlugin v0.4.3
- Flutter secure storage Linux cmake fix
- libayatana-appindicator3 + libcurl for Linux CI

## Migrations
N/A — praycalc has no backend migrations (uses ummat backend shared schema with `pc_` prefix).

## Deploy sequence
1. Pre-flight: verify `https://praycalc.com` is live + check Vercel project status
2. Deploy web: `vercel deploy --prod` from `praycalc/web/` → ummat-praycalc project
3. Deploy org: `vercel deploy --prod` from `praycalc/org/` → ummat-praycalc-org project
4. Mobile builds: Shorebird patch push for Flutter (non-blocking — can follow asynchronously)
5. Smoke: load `https://praycalc.com`, verify prayer times render, check WS push
6. Announce

## Rollback plan
- **Web / Org:** `vercel rollback` on ummat-praycalc + ummat-praycalc-org
- **Mobile:** Shorebird rollback patch (if patch pushed); otherwise App Store review cycle
- **Git:** `git revert <range>` on hotfix branch

## User communication
- **Channel:** praycalc.org changelog page + App Store / Play Store release notes
- **Message:** Prayer time accuracy improvements, real-time push updates, and full multi-platform support including Apple Watch and WearOS.

## Tag command
```
git -C /Volumes/X9/Sites/ummeco/praycalc tag v0.9.0 && git -C /Volumes/X9/Sites/ummeco/praycalc push origin v0.9.0
```

## gh release create command
```
gh release create v0.9.0 \
  --repo ummeco/praycalc \
  --title "praycalc v0.9.0" \
  --notes-file /Volumes/X9/Sites/ummeco/praycalc/.github/wiki/releases/release-praycalc-v0.9.0-2026-04-27.md
```
