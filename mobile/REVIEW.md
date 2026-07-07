# praycalc/mobile — Wave-2 Gap-Closure Review

Each agent's section is appended below. Do not overwrite another agent's section.

---

## Onboarding rebuild + analytics consent + method auto-detect

**Scope:** `src/features/onboarding/**`, `src/app/onboarding/index.tsx`, `src/features/consent/**`, `src/lib/analytics.ts` (consent gate), `src/lib/method-autodetect.ts`.

### What was built

**Onboarding — 6-step flow** (`src/features/onboarding/OnboardingFlow.tsx`, orchestrated via `useOnboardingFlow.ts`), replacing the prior 1-screen/3-step flow:

1. **Welcome** — app intro (`screens/WelcomeStep.tsx`).
2. **Location** — primes with an explanation, then triggers the real `expo-location` OS permission prompt only on tap (`screens/LocationStep.tsx`). Denial/failure still advances (non-blocking).
3. **Notifications** — same prime-then-request pattern via `expo-notifications` directly (`screens/NotificationsStep.tsx`).
4. **Method** — explains DPC as the recommended default, lets the user keep it or expand a fixed-method list; the region-appropriate fixed fallback (from `method-autodetect.ts`) is badge-highlighted (`screens/MethodStep.tsx`).
5. **Consent** — first-run analytics ask, Accept/Decline, default-deny (`screens/ConsentStep.tsx`, reusing the shared `ConsentToggleCard`).
6. **Done** — completion screen; calls the existing `useSettingsStore.setOnboardingDone(true)` and `router.replace('/(tabs)/home')` so `src/app/index.tsx`'s root gate is untouched and behaves exactly as before.

Global **Skip** (header, all steps except last) jumps straight to `done` via `flow.skipToEnd()` and applies sensible defaults (DPC method, `analyticsConsent: 'denied'`) so the root gate's `onboardingDone || hasLocation` always resolves to a valid state.

**Animation:** `components/FadeStep.tsx` — opacity+translateY fade via React Native's built-in `Animated` API (no new dependency; `react-native-reanimated` is present in the app but wasn't needed for a simple per-step mount fade). Steps are keyed by step id so React remounts (and re-animates) on every transition.

**Progress indicator:** `components/OnboardingProgressDots.tsx` — dot row, current step highlighted/widened.

**Route:** `src/app/onboarding/index.tsx` is now a thin wrapper mounting `<OnboardingFlow />` — all logic lives in `src/features/onboarding/**` so it's unit-testable without expo-router.

### Analytics consent

- `src/features/consent/store/useConsentStore.ts` — zustand + AsyncStorage persist, `{ analyticsConsent: 'unset' | 'granted' | 'denied' }`, mirrors `useSettingsStore`'s persist middleware pattern.
- `src/lib/analytics.ts` — gated: `logAppOpen()` and `logPrayerEvent()` both check `useConsentStore.getState().analyticsConsent === 'granted'` before doing anything (default-deny — 'unset' and 'denied' both suppress). A second belt-and-suspenders check lives inside the shared `sendEvent()` chokepoint.
- `src/features/consent/components/ConsentToggleCard.tsx` — shared presentational component, `mode="buttons"` (Accept/Decline, used in onboarding) or `mode="toggle"` (on/off switch, used in the Privacy screen). Both callers get identical copy.
- `src/features/consent/screens/PrivacyConsentScreen.tsx` — standalone screen for changing consent after first-run, built and exported but **not yet linked from Settings/more.tsx** (out of scope — `more.tsx` is owned by another agent this wave). The orchestrator needs to add a navigation entry pointing at this component.

### Method auto-detect

`src/lib/method-autodetect.ts` — pure function `detectFallbackMethod({ countryCode?, timezone? }): FixedMethodKey`. Country code takes priority over timezone; unmatched input falls back to `MWL`. Mapping: US/CA→ISNA, EG→Egypt, PK/IN/BD→Karachi, FR→UOIF, SA/AE/QA/KW/BH/OM→Makkah, default→MWL. Never returns `DPC` or `Custom` — DPC stays the recommended default everywhere; this only affects the pre-selected FIXED fallback shown if the user opts off DPC.

### i18n

All new keys reused the `onboarding.*` and `consent.*` trees already present in `src/i18n/en.json` (a parallel agent in this same wave had pre-populated them with matching content) — no duplicate key trees were added, and no existing keys were removed or renamed.

### Verification

- `npx tsc --noEmit` → 0 errors.
- `npx jest --silent` → all tests in this scope pass:
  - `src/lib/__tests__/method-autodetect.test.ts` (pre-existing, written by a parallel agent — country map + timezone fallback + default MWL, all cases covered)
  - `src/lib/__tests__/analytics-consent-gate.test.ts` (new, 5 tests) — verifies no fetch call when consent is `unset`/`denied`, a fetch call fires when `granted`, and firing stops immediately after consent is revoked
  - `src/features/onboarding/__tests__/useOnboardingFlow.test.ts` (new, 6 tests) — step-order progression, clamping at both ends, `back()`, `skipToEnd()` lands on a valid `done` state, `goTo()`
  - Full suite: 217/217 passing; the only remaining failing suite (`src/features/masjid-mute/__tests__/geofenceTask.test.ts`) is unrelated parallel work (a `jest.mock()` scope-violation bug), outside this task's ownership.

### Files created/changed

- `src/features/onboarding/OnboardingFlow.tsx`, `useOnboardingFlow.ts`
- `src/features/onboarding/components/{FadeStep,OnboardingProgressDots}.tsx`
- `src/features/onboarding/screens/{WelcomeStep,LocationStep,NotificationsStep,MethodStep,ConsentStep,DoneStep}.tsx`
- `src/features/onboarding/__tests__/useOnboardingFlow.test.ts`
- `src/features/consent/store/useConsentStore.ts`
- `src/features/consent/components/ConsentToggleCard.tsx`
- `src/features/consent/screens/PrivacyConsentScreen.tsx`
- `src/lib/method-autodetect.ts` (implementation only — test file was already written by a parallel agent)
- `src/lib/analytics.ts` (consent gate added)
- `src/lib/__tests__/analytics-consent-gate.test.ts`
- `src/app/onboarding/index.tsx` (replaced with thin wrapper)

### Follow-up needed (out of scope for this task)

- Link `PrivacyConsentScreen` from Settings/`more.tsx` (navigation entry) — not done here, `more.tsx` is another agent's ownership this wave.
