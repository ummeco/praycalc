# ADR — Google Conversational Actions retirement and PrayCalc voice strategy

**Status:** Accepted · **Date:** 2026-07-11 · **Scope:** smart/ (voice fulfillment)

---

## Context

`smart/src/routes/google.ts` implements a Google Conversational Actions fulfillment endpoint
using the Dialogflow ES webhook format and the `ACTIONS_ON_GOOGLE` response envelope. This was
the standard pipeline for building custom voice assistants for Google Assistant via third-party
submissions.

In June 2023, Google stopped accepting new third-party Conversational Actions submissions and
announced end-of-life for the platform. Existing published actions were sunset; the Actions
Console no longer exposes a "Conversational" project type for new developers. The
`smart/certification/google/SUBMISSION.md` package documents the submission steps but already
carries a banner warning that the pipeline is closed.

As of this writing (2026-07-11), Google has not reopened 3P Conversational Actions to new
submissions. The candidate successor surface — Gemini extensions for Google apps — does not
have a stable third-party API or a submission path with documented SLAs for external developers.

The Alexa Skills Kit is open, stable, and documented. The `smart/certification/alexa/`
package is complete (manifest, interaction model, account linking, privacy compliance answers)
and is pending only icon assets and a human developer-console submission step. PrayCalc's
voice feature set (NextPrayer, SpecificPrayer, AllPrayers, QiblaDirection — 4 custom intents)
maps well to the Alexa model and is fully implemented in `smart/src/routes/alexa.ts`.

---

## Decision

**PrayCalc voice strategy is Alexa-first.** Alexa is the primary supported voice surface.
The Google Conversational Actions pipeline is classified as closed to new submissions and is
not a viable publication target until Google opens a stable 3P path.

**`smart/src/routes/google.ts` stays in service** but is not an active certification target.
The fulfillment endpoint remains live at `smart.praycalc.com/google/fulfillment` to serve
any users who linked PrayCalc via the Actions Console before the submission window closed
(i.e., during any internal testing period or developer-preview phase). Removing it would
break those sessions silently.

**The `smart/certification/google/` package is retained as historical record.** It documents
what `google.ts` implements, which is required context for any future re-scoping decision
should a new Google 3P voice surface open.

**Revisit trigger:** if Google announces a stable, documented 3P submission path for Gemini
extensions or a successor platform (GA status, published review SLAs, account linking
support), this ADR should be re-evaluated and a new certification package authored.

---

## Alternatives Considered

### Remove `google.ts` and the certification package

Rejected. The fulfillment code is harmless to maintain (zero operational overhead — it shares
the same Express router, subscription checks, and prayer calculator as the Alexa route). The
certification package has future-research value. Deletion provides no benefit and risks
breaking legacy-linked users.

### Port to Google Home / Smart Home fulfillment (App Actions)

Not applicable. App Actions (the main surviving 3P Google Assistant surface as of 2026) target
Android apps via `actions.xml` intents and deep links, not conversational voice queries.
PrayCalc's voice use case (ask for prayer times) does not map cleanly to App Actions, which are
designed for in-app navigation and structured intents tied to a Play Store app. A re-scoping
conversation would be needed before this could be a target.

### Build for Gemini Extensions immediately

Rejected as premature. As of 2026-07-11, there is no documented stable 3P API for Gemini
extensions with a submission and review path for developers outside Google's early-access
program. Building against an unstable or undocumented API would produce a certification
package that cannot be submitted and would require a rewrite when the platform stabilizes.

### Maintain Google as co-primary with Alexa

Rejected. There is no submission path for Google Conversational Actions. "Co-primary" implies
active maintenance of a platform, which is not possible when the platform is closed to
submissions and has no defined path back to GA.

---

## Consequences

**Positive:**
- Engineering focus concentrates on Alexa, which has a clear, documented submission path.
- `google.ts` continues to serve any existing linked users at zero additional cost.
- The `smart/certification/google/` package remains useful for a future re-scoping decision.

**Risks and mitigations:**
- If Google opens Gemini 3P extensions with short notice, PrayCalc will need to author a new
  certification package from scratch (the Dialogflow ES intents in the Google certification
  package are not directly portable to a Gemini extensions format). The existing `google.ts`
  fulfillment logic (4 intents) is small enough to re-implement quickly if needed.
- Google may announce deprecation of the legacy Conversational Actions webhook endpoints
  entirely, at which point `google.ts` should be removed. Monitor the Actions on Google
  developer blog and this repo's periodic review cycle.

**No source-code changes are required.** This ADR formalizes the current state; `google.ts`
was already written and the Alexa package was already prioritized. The only operational
change is that the Google certification package is not actively progressed toward submission.

---

## See Also

- `smart/certification/google/SUBMISSION.md` — points to this ADR; documents the now-closed
  submission steps for historical reference
- `smart/certification/alexa/SUBMISSION.md` — the active certification target
- `smart/src/routes/google.ts` — fulfillment handler kept live for legacy users
- `smart/src/routes/alexa.ts` — primary voice fulfillment implementation
