# homebridge-praycalc — Publish Readiness

This plugin is **not published yet**. This document is the exact sequence to publish it and
apply for Homebridge's "verified" plugin badge — nothing here has been executed. A human must
run the publish command (npm auth) and submit the verification PR/application.

## Pre-publish checklist (done in this pass)

- [x] `package.json`: `license`, `repository`, `homepage`, `bugs`, `author`, `displayName`,
  `files`, `engines.node` added
- [x] `README.md` created with accurate install/config/troubleshooting instructions
- [x] `CHANGELOG.md` created
- [x] `config.schema.json` created (Config UI X support)
- [x] `keywords` includes `homebridge-plugin` (required for Homebridge plugin discovery)
- [x] `main` points at `dist/index.js`, built by `tsc` (`scripts.build`), and `prepublishOnly`
  now runs the build automatically so `npm publish` can't ship stale/missing `dist/`

## Known gaps to close before publishing (not fixed here — flagged, not silently changed)

- [ ] **Default madhab typo**: `src/index.ts` defaults `madhab` to `'shafi'` when unset, but the
  API accepts `'shafii'`/`'hanafi'` (see `smart/src/lib/prayer-calculator.ts`'s `Madhab` type and
  `config.schema.json`'s default of `'shafii'`). An unset `madhab` in `config.json` likely sends
  an unrecognized value to the API. This is a one-line behavior fix in plugin source — out of
  this certification-packaging pass's scope (no source behavior changes), file as a follow-up.
- [ ] No test file/coverage for the accessory logic (`getPrayerState` window math, config
  validation). Homebridge verification doesn't require tests, but it's a real gap.
- [ ] No CI workflow for this plugin specifically (build/lint on push) — confirm whether the
  root repo's CI already covers `homebridge/` as a standalone workspace.
- [ ] `@types/node` currently `^22.20.0` while `engines.node` requires `>=20.0.0` — fine (types
  are a superset), but confirm the plugin has actually been run/tested against Node 20, not just
  the version it happens to be developed on.

## 1. Final local verification

```bash
cd homebridge
pnpm install
pnpm build          # tsc — must produce dist/index.js with no errors
node -e "require('./dist/index.js')"   # sanity: module loads without throwing
npm pack --dry-run  # confirm the tarball only contains files listed in "files"
```

## 2. Bump version and publish to npm

```bash
cd homebridge
npm version patch    # or minor/major — updates package.json + creates a git tag locally
npm publish --access public
```

Requires an npm account with publish rights logged in (`npm whoami` to check,
`npm login` if not). The package name `homebridge-praycalc` must not already be taken by
another publisher — check first:

```bash
npm view homebridge-praycalc
```

If that returns `404 Not Found`, the name is available.

## 3. Verify the published package

```bash
npm view homebridge-praycalc
npx --yes homebridge-praycalc@latest --help 2>&1 | head -5   # confirms the tarball is installable
```

Install it in a real (or test) Homebridge instance via Config UI X or
`npm install -g homebridge-praycalc` and confirm the 5 contact sensors appear in the Home app.

## 4. Apply for Homebridge "verified" plugin status

Verified plugins get listed prominently in Homebridge Config UI X's plugin search and carry a
verified badge. Steps (per Homebridge's plugin verification process):

1. Fork https://github.com/homebridge/verified
2. Add `homebridge-praycalc` to `verified-plugins.json` (alphabetical order)
3. Open a PR against `homebridge/verified` from the fork
4. The PR template requires confirming:
   - The plugin is published to npm and installable
   - `package.json` has `homebridge-plugin` in `keywords` (done)
   - The plugin doesn't crash Homebridge on install with a default/minimal config
   - `config.schema.json` exists and is valid (done)
   - README documents installation and configuration (done)
5. A Homebridge maintainer reviews and merges — this can take days to weeks; no action needed
   from us while it's in review beyond responding to any review comments.

## 5. Post-publish

- Update `../.github/wiki/Smart-Home.md`'s HomeKit row if the install instructions there
  reference this plugin (already updated in this pass — see the wiki page).
- Update `CHANGELOG.md`'s `[Unreleased]` section into a dated `[1.0.0]` (or whatever version was
  actually published) release entry.
