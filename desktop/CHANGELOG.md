# Changelog — PrayCalc Desktop

> **Format:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

All notable changes to the PrayCalc desktop app are documented here.

## [1.3.0] - 2026-07-11

### Added
- Minor release rollup of the 2026-07-10 campaign below (first release on the race-free draft pipeline + rolling desktop-latest updater feed).

## [1.2.4] - 2026-07-10

### Added
- Tray context menu ("Open PrayCalc", "Check for Updates", "Quit") on every platform — fixes the tray being effectively unusable on most Linux desktop environments, where `libappindicator` never delivers raw click events and a menu is the only reliable way in. macOS/Windows keep their existing click-to-toggle behavior; the menu appears on right-click there instead.
- "Display next prayer in menu bar" setting is now wired end-to-end: turning it off shows the tray icon alone (no countdown text) instead of being silently ignored.
- `LICENSES-AUDIO.md` documenting the adhan recording assets' provenance status.

### Changed
- Prayer-times fetch date, and the prayer-list midnight refresh, are now anchored to the *configured location's* timezone instead of the device's own — matches the countdown math fixed in 1.2.2.
- Auto-update flow redesigned: updates now download in the background and wait for the user to click "Restart" before installing, on every platform. Previously Windows could silently kill the running app mid-use when a background check auto-installed; the hourly re-check no longer re-downloads an update that's already staged.
- Updater endpoint now points at a dedicated `desktop-latest` rolling release tag instead of the repo's overall `releases/latest` (which was shared with non-desktop tags).
- Ummat+ entitlement cache is now keyed to the signed-in account and cleared on sign-out, so a cached "Ummat+ active" state can never leak to a different account signing in afterward.

### Fixed
- Location settings: latitude/longitude of exactly `0` no longer silently reverts to the previous value; both fields are now clamped to their valid ranges (±90 / ±180).
- Prayer-times request URL now percent-encodes the timezone string instead of interpolating it raw.
- Multi-monitor: the tray popup now positions itself against the monitor the tray icon/cursor is actually on, instead of the (often stale) monitor the hidden window last happened to occupy.
- Sunrise (shuruq) no longer triggers an OS notification or the adhan overlay — it is not a salah and continues to display normally in the prayer list and tray, matching mobile's behavior.

## [1.2.3] - 2026-07-09

### Added
- Seamless auto-update is now live: signed release ships `.sig` updater artifacts + `latest.json`; the installed app checks on launch and hourly, downloads in the background, and shows a "Restart to update" banner when a new version is ready.

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
