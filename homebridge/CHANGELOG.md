# Changelog

All notable changes to `homebridge-praycalc` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-07-11

Published to npm as `homebridge-praycalc@1.0.0`.

### Added
- Initial plugin: registers `PrayCalcPrayers` as a Homebridge accessory
- One `ContactSensor` HomeKit service per daily prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Fetches prayer times from the public PrayCalc API, refreshed hourly
- Configurable calculation method, madhab, and post-prayer active window
- `config.schema.json` for Homebridge Config UI X (no manual `config.json` editing required)
- `README.md` with installation, configuration, and troubleshooting instructions
- `PUBLISH.md` — npm publish + Homebridge verified-plugin application steps
- 17 vitest unit tests over the pure schedule/window helpers

### Changed
- Madhab default corrected from `shafi` to `shafii` (matches the PrayCalc API enum)
- `package.json`: added `license`, `repository`, `homepage`, `bugs`, `author`, `displayName`,
  `files`, and `engines.node` fields required for npm publish and the Homebridge verified-plugin
  application
