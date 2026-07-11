# Voice Assistant & Smart Home Certification Runbook

Index for submitting PrayCalc's four voice/smart-home integrations. Nothing in this runbook can
be executed by an AI agent past the point of preparing files — every platform requires a human
with an authenticated developer account to click Submit.

## Status at a glance

| Platform | Package | Ready to submit? |
|---|---|---|
| Amazon Alexa | `smart/certification/alexa/` | Yes — see `SUBMISSION.md` there |
| Google Assistant | `smart/certification/google/` | **No — platform likely discontinued for this use case.** Read `CONSOLE-SETUP.md`'s banner first |
| Apple HomeKit (Homebridge) | `homebridge/` | Not published yet — see `homebridge/PUBLISH.md` |
| Home Assistant (HACS) | `smart/homeassistant/` | Installable today as a HACS custom repository; default-repo listing blocked on a release pipeline — see `smart/homeassistant/HACS.md` |

## Alexa

1. Read `smart/certification/alexa/SUBMISSION.md`.
2. Prerequisite: `smart.praycalc.com/alexa/fulfillment` and `/oauth/*` must be live (they are —
   confirm with the curl checks in that doc).
3. `ask deploy` the skill package, fill in console-only fields (icons, privacy answers), run the
   14 test cases in the submission doc, then a human clicks Submit for Review in the Alexa
   Developer Console.

## Google Assistant

1. Read `smart/certification/google/CONSOLE-SETUP.md` in full before doing anything else — it
   documents that `google.ts` targets Actions on Google's Conversational Actions platform, which
   Google stopped accepting new submissions to in 2023.
2. If the Google Actions Console still offers a "Conversational" project type when checked, the
   rest of `CONSOLE-SETUP.md` and `SUBMISSION.md` apply as written.
3. If not, this is a scoping decision (drop Google entirely, or re-target a different, currently
   live Google surface as new engineering work) — not something to push through as-is.

## Apple HomeKit (Homebridge)

1. Read `homebridge/PUBLISH.md`.
2. Fix the flagged pre-publish gaps (notably the `madhab` default typo — a source change, not
   done in this pass) before publishing.
3. `npm publish --access public`, then apply to `homebridge/verified` per the doc's § 4.

## Home Assistant (HACS)

1. Read `smart/homeassistant/HACS.md`.
2. `hacs.json` and `manifest.json` are already compliant — no changes needed there.
3. Blocking gap: no GitHub Release with a `praycalc.zip` asset yet, and no HACS/hassfest
   validation CI — both are `.github/workflows/` additions, filed as a follow-up (out of this
   runbook's file scope).
4. Once both exist and pass, follow the HACS default-repo PR steps in § "Submission steps".

## Cross-cutting: shared OAuth server

Alexa and Google account linking both point at the same `smart.praycalc.com/oauth/*` endpoints
(`src/routes/oauth.ts`). Any change to that OAuth server (redirect handling, token TTLs, the
Ummat+ gate) affects both certification packages — re-check both `SUBMISSION.md` files' account
linking sections if `oauth.ts` changes.

## Verification before any submission

```bash
cd smart && pnpm test        # full suite, includes alexa/google/oauth/voice-utterance tests
python3 -c "
import json, glob
for f in glob.glob('certification/**/*.json', recursive=True):
    json.load(open(f))
    print(f, 'OK')
"
```
