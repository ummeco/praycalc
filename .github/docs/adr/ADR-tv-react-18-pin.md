# ADR — pin React 18.2.0 on TV surfaces, carving out of D-P2-REACT19

**Status:** Accepted · **Date:** 2026-08-28 · **Scope:** `praycalc/tv`, `flock/apps/tv`

---

## Context

ASI decision **D-P2-REACT19** mandates React 19 across all Vite and React Native surfaces.
Both TV apps followed it. Neither works.

`react-native-tvos@0.74.x` declares an **exact** peer dependency:

```json
"peerDependencies": { "react": "18.2.0", "@types/react": "^18.2.6" }
```

React Native 0.74's `Touchable` reads
`React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher`.
**React 19 removed that field.** The module graph therefore throws while loading, before
any screen renders.

Observed on the released `PrayCalc-TV-1.1.3.apk`, Android TV emulator, API 36:

```
FATAL EXCEPTION: mqt_native_modules
Process: com.ummeco.praycalc.tv, PID: 2796
com.facebook.react.common.JavascriptException:
  TypeError: Cannot read property 'ReactCurrentDispatcher' of undefined
  js engine: hermes
  ... get Touchable@1:50256
```

This is not emulator-specific. The app died on every cold start on every device.

| Surface | Was | react-native-tvos |
|---|---|---|
| `praycalc/tv` | react 19.0.0 | 0.74.5-0 |
| `flock/apps/tv` | react 19.1.0 | 0.74.2-0 |

D-P2-REACT19 is simply **not satisfiable** on this fork. The tvos fork lags upstream React
Native, and React 19 support did not arrive until releases built on RN 0.78.

## Decision

**Pin `react` to `18.2.0` on both TV surfaces**, along with `react-test-renderer` and
`@types/react`, as a documented carve-out from D-P2-REACT19.

D-P2-REACT19 continues to apply unchanged to every other surface: web (Vite), mobile
(RN + Expo), and desktop (Tauri). The carve-out is scoped to `react-native-tvos` only, and
expires when the fork ships a release built on RN 0.78 or newer.

## Alternatives considered

**Upgrade `react-native-tvos` to an RN 0.78+ build.** Preserves D-P2-REACT19 with no
exception. Rejected *for now*: it is a framework major upgrade with its own migration
surface, on a fork that lags upstream, while a shipped app is broken today. This remains
the intended end state and should be scheduled as its own work.

**Leave React 19 and patch around the missing internal.** Rejected outright. Reaching into
`__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` to shim a field React deliberately
removed is the kind of fix that breaks silently on the next patch release.

## Consequences

- Both TV apps run React 18.2.0 while every other surface stays on React 19. Components
  shared between TV and other surfaces must not rely on React 19-only APIs. TV shares no
  component packages today, so nothing is affected right now.
- TV cannot adopt React 19 features until the tvos fork moves to RN 0.78+.
- `praycalc/tv` typecheck, lint and its 115 tests all pass on React 18.2.0.

## Why this was not caught

The TV Emulator Smoke workflow existed but had **failed on every run since it was added**,
for reasons unrelated to the app: it requested `system-images;android-33;android-tv;x86_64`,
which Google does not publish. The emulator never booted, so the job never got far enough
to run the app, and the crash went unreported through a release.

Three things changed alongside this ADR:

1. The smoke workflow now boots (API 36 has an x86_64 TV image) and correctly resolves,
   launches and asserts on the app.
2. `release-tv-apk.yml` is now **gated**: `build-apk` → `smoke` → `publish`. An APK that
   does not survive launch on an emulator cannot be published.
3. Failures dump the crash buffer, so the next one is diagnosable from the run alone.

The underlying process defect was that nothing between "Gradle produced an APK" and
`gh release create` ever ran the app. That gap is now closed.
