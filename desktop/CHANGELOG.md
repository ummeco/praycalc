# Changelog — PrayCalc Desktop

> **Format:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

All notable changes to the PrayCalc desktop app are documented here.

## [1.2.2] - 2026-07-09

### Added
- "My TVs" tab: `AddTvForm` to pair a TV by entering its 6-digit code, `TvRow` list of paired TVs, and `TvDeepSettingsEditor` for per-TV countdown takeover, iqama times, prayer-name-only mode, calculation method, madhab, and time format
- Settings: location section reordered
- ESLint flat config (`eslint.config.mjs`) wired into `ci-desktop.yml` — TS/TSX lint gate now enforced in CI, not just locally
- Billing status now caches the last-known-good response so a transient network failure doesn't drop a valid entitlement

### Changed
- Split 4 oversized source files into smaller, single-responsibility modules per the 300-line cap
- Tray icon/text contrast adjusted to meet WCAG AA
- Tauri capabilities trimmed to least-privilege; removed unused dependencies

### Deprecated
### Removed
- Dead `get_today_date` Tauri command (unused by any JS caller) and its `invoke_handler!` registration

### Fixed
- Cross-timezone countdown bug: next-prayer timer now computes against the configured prayer timezone instead of the host's local timezone

### Security
