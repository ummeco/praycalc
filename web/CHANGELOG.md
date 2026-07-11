# Changelog — PrayCalc Web (`praycalc.com`)

> **Format:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
> **Versioning:** [SemVer](https://semver.org/) — see `web/package.json`.

All notable changes to the PrayCalc web app are documented here.

## [Unreleased]

### Added
- Account page: "Add TV" form to pair a TV by entering its 6-digit code, `TvCard` list of paired TVs, and `TvDeepSettingsEditor` for per-TV countdown takeover, iqama times, prayer-name-only mode, calculation method, madhab, and time format
- `/api/tvs` route now proxies all TV reads/writes server-side with an Ummat+ check before touching Hasura — the browser never calls Hasura directly for TV data
- Hero search card redesign (straddle layout, solid input), app-grade footer, fixed top-right settings panel with Ummat+ upsell, real light theme
- PWA icons, manifest, and service worker overhaul; city sitemap; custom 500 page
- +45 server-route tests; E2E hydration barrier (`data-hydrated` marker) to stabilize the settings-panel test after mobile autofocus was suppressed
### Changed
- Magic-link CSP fix; rate limiting added to auth routes; mobile a11y/responsive fixes
### Deprecated
### Removed
- 29 orphaned legacy `src/lib` files and dead residuals; dead `web/messages` locale stubs
### Fixed
- Error boundary + modal focus-traps; RTL logical properties throughout; locale list corrected to what's actually shipped (was overstating coverage)
### Security
