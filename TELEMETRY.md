# Telemetry

**praycalc collects no telemetry by default.**

If you explicitly opt in, the following is collected anonymously:
- App version + platform (no PII, no IP addresses retained)
- Aggregated feature-usage counts (never per-user)
- Crash reports (stack trace only, no personal data)

**Where it goes:** `sentry.ummat.dev` / `ping.ummat.dev` (operated by the ummat project, Hetzner EU — Falkenstein)
**How to disable:** it is already off; opt in only by setting `NSELF_TELEMETRY=1` (or `--telemetry`). Set `TELEMETRY_DISABLED=true` to force off.
**Source:** the entire collection path is open source in this repo (`src/telemetry.*`).
