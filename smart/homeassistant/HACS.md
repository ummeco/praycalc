# PrayCalc for Home Assistant — HACS Distribution

## How this ships

HACS requires a dedicated repo layout (`hacs.json` + `custom_components/<domain>/` at the
repo **root**, validated remotely against the GitHub tree), which a monorepo cannot satisfy.
Distribution therefore lives in a mirror repo:

- **Source of truth:** this folder (`smart/homeassistant/` in `ummeco/praycalc`)
- **HACS distribution repo:** https://github.com/ummeco/praycalc-ha
  (repo-root layout, topics `home-assistant`/`hacs`, in-repo brand assets at
  `custom_components/praycalc/brand/`, `Validate` workflow running hassfest + hacs/action —
  both green as of 2026-07-12)

## Validation status (2026-08-28)

| Check | Where | Status |
|---|---|---|
| hassfest | monorepo `validate-ha.yml` + praycalc-ha `validate.yml` | green |
| hacs/action (9 checks incl. brands/topics/license) | praycalc-ha `validate.yml` | green |
| translations parity | both repos | green |
| pytest (real Home Assistant) | both repos | green, 62 tests |
| Release | praycalc-ha `v0.8.0` | published |
| HACS default-registry PR | [hacs/default#9123](https://github.com/hacs/default/pull/9123) | changes requested 2026-08-28, addressed in v0.8.0, review re-requested |

## What hassfest and hacs/action do NOT check

Both were green for v0.7.1, which shipped with no `translations/` directory and
a Hijri sensor that raised `AttributeError` on every state update. Neither tool
validates custom-integration translations, and neither boots Home Assistant.
The `translations` and `pytest` jobs exist to cover exactly that gap. Do not
treat a green hassfest as evidence the integration works.

Minimum Home Assistant version is **2026.3.0** (`hacs.json`). Raise it only
deliberately: `config_flow.py` needs 2024.4 for `ConfigFlowResult`, and the
in-repo brand assets are only served from 2026.3. When bumping, also bump the
pin in `requirements-test.txt` so tests run against the version being claimed.

The brands requirement is satisfied via HACS's **in-repo brand assets** fallback
(`custom_components/praycalc/brand/icon.png`, `icon@2x.png`, `logo.png`) — no
home-assistant/brands PR is required for HACS listing. (A home-assistant/brands entry is
only needed if we later pursue Home Assistant core inclusion.)

## Sync procedure (source → mirror)

After changing anything under `smart/homeassistant/`:

```bash
git clone git@github.com:ummeco/praycalc-ha.git /tmp/praycalc-ha
rsync -a --delete smart/homeassistant/custom_components/ /tmp/praycalc-ha/custom_components/
cp smart/homeassistant/README.md /tmp/praycalc-ha/README.md
cp smart/homeassistant/hacs.json /tmp/praycalc-ha/hacs.json
cd /tmp/praycalc-ha && git add -A && git commit -m "sync from ummeco/praycalc@<sha>" && git push
# bump custom_components/praycalc/manifest.json "version" first (both repos), then:
gh release create v<version> --repo ummeco/praycalc-ha --title "PrayCalc for Home Assistant <version>" --notes "<notes>"
```

Keep `manifest.json` version identical in both repos. Users receive updates automatically
through HACS when a new release is tagged in praycalc-ha.

## Install (users)

Until the default-registry PR is merged: HACS → Custom repositories →
`https://github.com/ummeco/praycalc-ha` (Integration). After merge: search "PrayCalc" in HACS.

## Historical note

The original plan (zip_release from this monorepo's `ha-v*` tags via `release-ha.yml`) was
abandoned 2026-07-12: hacs/action validates the remote repo tree, so the monorepo could never
pass, and HACS's release-asset lookup breaks on a repo with mixed product tags. `release-ha.yml`
remains for producing a manual-install zip, but HACS installs come from praycalc-ha.
