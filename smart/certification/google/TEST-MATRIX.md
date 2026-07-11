# Google Assistant Action — Test Matrix

Same coverage as the Alexa test matrix, mapped to the Dialogflow ES intents in
`dialogflow-agent/intents/`. All cases are already exercised as HTTP-level tests in
`smart/tests/google.test.ts` and `smart/tests/voice-utterances.test.ts`
(`pnpm test` from `smart/` must be green before any manual console testing).

| # | Utterance | Intent | Expected |
|---|---|---|---|
| 1 | "Talk to PrayCalc" | Default Welcome Intent | Welcome message, `expectUserResponse: true` |
| 2 | "When is Fajr?" | SpecificPrayer (`prayer=fajr`) | Speaks Fajr time, contains "today" |
| 3 | "When is Zuhr?" | SpecificPrayer (`prayer=zuhr`) | Resolves the `zuhr` alias to the Dhuhr time |
| 4 | "What are today's prayer times?" | AllPrayers | All 5 prayer times in one response |
| 5 | "Which direction is the Qibla?" | QiblaDirection | Bearing in degrees |
| 6 | "What's the next prayer?" | NextPrayer | Next prayer name + ETA, or "all prayers have passed" |
| 7 | Ask an unmapped question, e.g. "tell me a joke" | Default Fallback Intent | Falls to `google.ts` default branch: welcome/feature-list message |
| 8 | Ask 6 questions in a row, unlinked | (any) | 6th response is the free-tier limit message (`checkFreeQueryLimit`, capped by `req.ip` when unlinked) |
| 9 | Complete account linking with an Ummat+ test account, then ask any prayer question | (any) | Uses the account's saved home location, no daily cap |
| 10 | Complete account linking with a non-Plus account | n/a | `POST /oauth/authorize` returns HTTP 402 — confirm the Google account-linking UI surfaces this as a failed link, not a silent success |
| 11 | Missing/invalid `prayer` parameter | SpecificPrayer | "I didn't catch which prayer you asked about..." fallback text |
| 12 | Response format check | any | `res.body.fulfillmentMessages` is an array; `res.body.payload.google.richResponse.items` present; `displayText` has SSML tags stripped |

## Regression command

```bash
cd smart && pnpm test -- google alexa voice
```
