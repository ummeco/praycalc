# Changelog — PrayCalc Web (`praycalc.com`)

> **Format:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
> **Versioning:** CalVer `YYYY.MM.PATCH` per `.github/docs/standards/versioning.md`.
> **Standard:** `.github/docs/standards/changelog.md`.

All notable changes to the PrayCalc web app are documented here.

## [Unreleased]

### Added
- Account page: "Add TV" form to pair a TV by entering its 6-digit code, `TvCard` list of paired TVs, and `TvDeepSettingsEditor` for per-TV countdown takeover, iqama times, prayer-name-only mode, calculation method, madhab, and time format
- `/api/tvs` route now proxies all TV reads/writes server-side with an Ummat+ check before touching Hasura — the browser never calls Hasura directly for TV data
### Changed
### Deprecated
### Removed
### Fixed
### Security
