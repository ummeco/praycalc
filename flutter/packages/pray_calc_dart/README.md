# pray_calc_dart — STALE VENDORED SNAPSHOT, NOT THE SOURCE OF TRUTH

> **Do not read this directory to determine what `pray_calc_dart` can do.**
> It is roughly a major version behind the published package.

| | Version | `highLatitudeRule` |
|---|---|---|
| This directory | **0.2.0** | absent |
| Published on [pub.dev](https://pub.dev/packages/pray_calc_dart) | **1.2.1** | present |

**The real source lives at <https://github.com/acamarata/pray-calc-dart>** — a separate
standalone repository, not this monorepo. It was never cloned into `/Volumes/X9/Sites`.
This copy is a vendored snapshot that diverged from upstream releases.

## Why this file exists

On 2026-08-19 a bug report was filed claiming `pray_calc_dart` detects polar conditions,
returns `NaN`, and **has no high-latitude fallback rule** — proposing that a
`HighLatitudeRule` enum be built from scratch.

That was wrong. The published package ships **six** high-latitude rules, cross-checked
against the JavaScript sibling on every build, with `highLatitudeRule` as a public
parameter. Of those, Aqrab al-Bilad and Aqrab al-Ayyam are the two that hold inside the
polar circles.

The report was filed because its author read *this* directory and reported it as the
state of the package. Nothing here told them it was stale. Now it does.

## Before citing this package for anything

```bash
# Check what is actually published (one call).
python3 -c "import urllib.request,json; print(json.load(urllib.request.urlopen('https://pub.dev/api/packages/pray_calc_dart'))['latest']['version'])"
```

Read the published API from pub.dev or from `acamarata/pray-calc-dart`, not from here.

## Status of this copy

Frozen. `praycalc/flutter/` is an archived read-only reference per the user directive of
2026-06-28 (superseding ADR-P8-09); see [`../../README.md`](../../README.md). This package
is consumed only by the archived Flutter app in this same tree (`flutter/pubspec.yaml`
resolves it by path, plus two unit tests). No live surface depends on it — the React
Native, Tauri and native watch/Wear targets listed there do not reference it. It is
retained only for 1:1 parity checking during migration.

If you need 1.2.x behaviour, pull it from upstream. Do not "fix" it here.
