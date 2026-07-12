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

## Validation status (2026-07-12)

| Check | Where | Status |
|---|---|---|
| hassfest | monorepo `validate-ha.yml` + praycalc-ha `validate.yml` | green |
| hacs/action (9 checks incl. brands/topics/license) | praycalc-ha `validate.yml` | green |
| Release | praycalc-ha `v0.7.0` | published |
| HACS default-registry PR | hacs/default | see PR link in the task log |

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
