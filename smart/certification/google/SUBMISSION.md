# Google Assistant Action — Submission Guide

> **Strategy decision:** Google Conversational Actions has been closed to new 3P submissions
> since June 2023. PrayCalc's voice strategy is Alexa-first. This package is retained as a
> historical record of what `google.ts` implements and as reference for a future re-scoping
> decision if a new Google 3P surface opens. See
> **[`.github/docs/adr/adr-google-voice-platform-retirement.md`](../../../.github/docs/adr/adr-google-voice-platform-retirement.md)**
> for the full decision, alternatives considered, and the revisit trigger.

> **Read `CONSOLE-SETUP.md` first.** `google.ts` targets Actions on Google's Conversational
> Actions platform (Dialogflow ES webhook + `ACTIONS_ON_GOOGLE` response format), which Google
> sunset for consumers in June 2023 and has not, as of this writing, reopened to new submissions.
> **Verify current status at the Google Actions Console before doing anything below** — if
> "Conversational" is not an option when creating a new project, this package documents a
> dead submission path and the right next step is a scoping conversation about which live
> Google surface (if any) PrayCalc should target, not clicking through the steps here.

This document assumes the classic pipeline is reachable (e.g., testing-only, or reopened).
Package contents:
- `dialogflow-agent/agent-meta.json` — agent-level settings (webhook URL, locale, time zone)
- `dialogflow-agent/entities/prayer-entity.json` — the `@prayer` entity
- `dialogflow-agent/intents/*.json` — 5 intents (4 custom + Default Fallback), Dialogflow v2
  `Intent` resource shape, importable via `projects.agent.intents.batchUpdate`
- `CONSOLE-SETUP.md` — full console walkthrough + the account-linking config
- `TEST-MATRIX.md` — certification test cases
- This file

Nothing here can be submitted by an AI agent — a human with access to the Google Cloud project
and Actions Console must review and click Submit.

## 1. Prerequisites

- [ ] Google Cloud project with the Dialogflow API enabled (or an existing Actions on Google
  project, if the console still exposes project creation for this type)
- [ ] Confirm the webhook is reachable:
  `curl -s -X POST https://smart.praycalc.com/google/fulfillment -H 'Content-Type: application/json' -d '{"queryResult":{"intent":{"displayName":"AllPrayers"}}}'`
  should return a JSON body with `fulfillmentMessages`.
- [ ] A test Ummat+ account for the linked-account test cases.

## 2. Build the agent

Follow `CONSOLE-SETUP.md` §§ 1-4: create the agent, entity, 5 intents, and (if the console
still offers it) account linking pointed at the same `smart.praycalc.com/oauth/*` endpoints
used by the Alexa package (`../alexa/skill-package/accountLinking.json` — identical
`authorizationUrl`/`accessTokenUrl`, since both platforms share one OAuth server).

```bash
# Example: import an intent via the Dialogflow API (repeat per file in dialogflow-agent/intents/)
gcloud auth application-default login
curl -X POST \
  "https://dialogflow.googleapis.com/v2/projects/<PROJECT_ID>/agent/intents" \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d @dialogflow-agent/intents/next-prayer.json
```

(Strip the `_comment` field from each file before posting — it isn't part of the API schema,
it's documentation for whoever reads these files.)

## 3. Test in the Dialogflow simulator and Actions Console simulator

Run every case in `TEST-MATRIX.md` in both the Dialogflow "Try it now" panel (webhook-only,
no account linking) and the Actions Console simulator (full account-linking flow).

## 4. Directory listing

If the Actions Console still has a directory submission flow:
- Category: Lifestyle or Religion & Spirituality
- Sample invocations: "Talk to PrayCalc", "Ask PrayCalc when is Fajr"
- Privacy policy: `https://praycalc.com/privacy`
- Description: reuse the copy in `../alexa/skill-package/skill.json`'s
  `publishingInformation.locales.en-US.description` — same product, same answer.

## 5. Submit for review

Actions Console > **Deploy > Directory information** > **Submit for review**, if that path is
still live. A human must do this.

## Known gaps before a human clicks Submit

- Confirm the Actions Console pipeline is actually available (see the banner above) before
  spending more time on this package.
- Real app icon assets for the directory listing.
- A dedicated Ummat+ test account for reviewers, entered into the console's testing notes (not
  committed to this repo).
- If the classic pipeline is gone, this file and `CONSOLE-SETUP.md` should be treated as a
  historical record of "what google.ts implements", useful for a re-scoping decision, not as an
  active submission checklist.
