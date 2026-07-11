# PrayCalc for Home Assistant — HACS Submission Checklist

Target: get `ummeco/praycalc` added to HACS's **default repository list** so users don't need
"Add custom repository" — they just search "PrayCalc" in HACS and install.

The integration itself lives at `smart/homeassistant/custom_components/praycalc/` (a monorepo
subfolder, not repo root) — `hacs.json`'s `zip_release: true` + `filename: "praycalc.zip"` +
`content_in_root: false` already accounts for this: HACS will pull the integration from a
**GitHub Release asset** named `praycalc.zip` (containing the `custom_components/praycalc/`
folder) rather than expecting it at repo root.

## Current file status (verified against HACS + Home Assistant requirements)

| File | Status | Notes |
|---|---|---|
| `hacs.json` | OK | `name`, `homeassistant` min version, `render_readme`, `zip_release`, `filename`, `content_in_root` all present |
| `custom_components/praycalc/manifest.json` | OK | `domain`, `name`, `codeowners`, `config_flow`, `documentation`, `issue_tracker`, `integration_type`, `iot_class`, `version` all present |
| `custom_components/praycalc/__init__.py` | present | not audited line-by-line in this pass — HACS/hassfest validation (§ 3) will catch issues |
| README.md | OK | installation, sensors, automations all documented |
| Repo `LICENSE` | OK | root-level MIT covers the whole repo including this subfolder |

No hacs.json/manifest.json fields were changed — both were already compliant.

## Gaps that block default-repo submission

### 1. No GitHub Release with a `praycalc.zip` asset yet

`hacs.json` promises a zip release asset that doesn't exist yet. Without it, HACS (even as a
custom repository) can't install a version. This needs a release workflow that, on a tag (e.g.
`smart-ha-v*`), zips `custom_components/praycalc/` into `praycalc.zip` and attaches it to a
GitHub Release. **Out of scope for this pass** (`.github/workflows/` isn't in this task's edit
scope) — file a follow-up ticket to add this workflow before attempting submission.

### 2. No HACS/hassfest validation CI

HACS's own submission bot checks that a `hacs/action` + `home-assistant/actions/hassfest`
GitHub Actions workflow exists and passes on every push/PR. Same scoping note as above — this
is a `.github/workflows/` addition, tracked as a follow-up, not done in this pass.

### 3. Repository GitHub topics

HACS's default-repo review expects the repo to carry the `home-assistant` and `hacs` GitHub
topics (Settings > General > Topics on github.com/ummeco/praycalc). This is a repo-settings
change, not a file change — a human with repo admin access needs to add these.

### 4. Manual validation pass

Before opening the HACS default-repo PR, run both validators locally/in CI once:

```bash
# hassfest (official HA manifest/structure validator)
docker run --rm -v "$(pwd)/smart/homeassistant:/github/workspace" \
  ghcr.io/home-assistant/hassfest --action validate

# HACS action (validates hacs.json + repo structure for HACS compatibility)
docker run --rm -e "INPUT_CATEGORY=integration" \
  -v "$(pwd)/smart/homeassistant:/github/workspace" \
  ghcr.io/hacs/action:main
```

Both must pass with zero errors before submission.

## Submission steps (once the gaps above are closed)

1. Ensure at least one tagged GitHub Release exists with a `praycalc.zip` asset (§ 1) and the
   validation workflow is green on `main` (§ 2).
2. Add the `home-assistant` and `hacs` topics to the repo (§ 3).
3. Fork https://github.com/hacs/default
4. Add an entry to `integration` (the plain-text list file) for `ummeco/praycalc`, alphabetically
   sorted.
5. Open a PR against `hacs/default`. The HACS bot runs an automated check against the repo
   (hacs.json validity, manifest validity, release asset presence, README, topics) and comments
   with pass/fail — fix anything it flags before requesting human review.
6. A HACS maintainer reviews and merges. Timeline varies (days to weeks).

Nothing in step 5-6 can be done by an AI agent — a human with a GitHub account must fork, PR,
and respond to review feedback.

## Current install path (works today, no default-repo listing needed)

Users can already install via **HACS > Custom repositories** (documented in
`README.md` § Installation) — this works as soon as gap § 1 (a real release zip) is closed,
independent of default-repo listing.
