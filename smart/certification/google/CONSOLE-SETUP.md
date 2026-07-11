# Google Assistant — Console Setup

## Read this first: what google.ts actually is, and the platform-status problem

`smart/src/routes/google.ts` is a **Dialogflow ES webhook fulfillment handler for an Actions on
Google Conversational Action** — not a Smart Home Action. The evidence is in the request/response
shapes themselves:
- Request: `body.queryResult.intent.displayName`, `body.queryResult.parameters`,
  `body.originalDetectIntentRequest.payload.user.accessToken` — this is the Dialogflow ES
  webhook request envelope.
- Response: `fulfillmentMessages[].platform === 'ACTIONS_ON_GOOGLE'`,
  `payload.google.expectUserResponse`, `payload.google.richResponse.items[].simpleResponse` —
  this is the legacy Actions on Google v2 conversational response format.

There is **no SYNC/QUERY/EXECUTE intent handling anywhere in `google.ts`**, which is what a real
Smart Home Action (the kind that controls lights/locks/thermostats) requires. So this is
correctly a conversational Q&A action, not a Smart Home Action — good, that matches what PrayCalc
actually needs (answer questions, not control a device).

**The problem: Google discontinued the Conversational Actions platform.** Google announced in
2022 and completed in June 2023 the sunset of Actions on Google Conversational Actions — the
exact platform this code targets (Actions Console + Dialogflow + the `ACTIONS_ON_GOOGLE`
`simpleResponse`/`richResponse` format). Existing third-party conversational actions were shut
off for all users, and the Actions Console stopped accepting new Conversational Action
submissions. [Certain, as of Anthropic's knowledge cutoff; the current date is 2026 — **verify
this hasn't changed by checking https://developers.google.com/assistant and the Actions Console
directly before doing any further setup work below.**]

**Do not treat the rest of this document as proof a submission path exists.** It documents the
console flow that *would* apply to this code if the classic conversational-action pipeline is
ever available to you (e.g., an internal/testing-only agent, or if Google reopens some form of
this surface). If the Actions Console no longer offers "Conversational" as a project type when
you check, this package cannot be submitted as-is, and `google.ts` would need to be re-targeted
at whatever the current Google Assistant/Gemini voice-app surface is — that is new engineering
work, not a certification-packaging task.

---

## If the classic Dialogflow ES + Actions on Google pipeline is available to you

### 1. Create the Dialogflow ES agent

1. Go to https://dialogflow.cloud.google.com/ > Create Agent.
2. Name: `PrayCalc`. Default language: `en`. Time zone: `Etc/UTC` (matches `agent-meta.json`).
3. Under **Fulfillment**, enable Webhook, URL: `https://smart.praycalc.com/google/fulfillment`.
   No custom headers needed (the endpoint is public-input, gated by the OAuth token in the
   request body, not a webhook secret).

### 2. Create the entity

Settings from `dialogflow-agent/entities/prayer-entity.json`: entity name `prayer`, kind Map,
6 values (`fajr`, `dhuhr`, `zuhr`, `asr`, `maghrib`, `isha`) each with the synonyms listed there.
`zuhr` is a separate value from `dhuhr` (not a synonym of it) because `google.ts` looks up
whichever literal string comes back in `params.prayer` — see the code comment in the JSON file.

### 3. Create the 5 intents

For each file in `dialogflow-agent/intents/`, create a matching intent in the console (or via
the Dialogflow API `projects.agent.intents.batchUpdate` using these files as the request body —
they're in the Dialogflow v2 `Intent` resource shape):

| File | Intent name | Enable webhook fulfillment | Training phrases |
|---|---|---|---|
| `next-prayer.json` | NextPrayer | Yes | 11 |
| `specific-prayer.json` | SpecificPrayer | Yes | 11 (uses `@prayer` entity) |
| `all-prayers.json` | AllPrayers | Yes | 11 |
| `qibla-direction.json` | QiblaDirection | Yes | 11 |
| `default-fallback.json` | Default Fallback Intent (built-in) | Yes | n/a |

Also enable webhook fulfillment on the built-in **Default Welcome Intent** — `google.ts`'s
switch-default branch (the same one Default Fallback Intent hits) is what returns the "Welcome
to PrayCalc" message, so both need the webhook turned on rather than a static console response.

Either PascalCase (`NextPrayer`) or snake_case (`next_prayer`) works as the intent
`displayName` — `google.ts` checks both spellings in every `case` statement.

### 4. Account linking (Actions on Google project settings, if the console still exposes this)

Actions on Google account linking used the same OAuth 2.0 endpoints as Alexa:
- Authorization URL: `https://smart.praycalc.com/oauth/authorize`
- Token URL: `https://smart.praycalc.com/oauth/token`
- Client ID: any value, e.g. `google-home-praycalc` (matches `smart/tests/e2e/oauth-flow.test.ts`'s fixture) — `oauth.ts` does not validate `client_id` against an allowlist.
- Client Secret: any non-empty value — `oauth.ts`'s `/oauth/token` never reads `client_secret`.
- Redirect URI: `https://oauth-redirect.googleusercontent.com/r/<project-id>` (Google generates
  this from your Actions project ID).
- Scopes: none — the flow doesn't use OAuth scopes; access is gated server-side by
  `hasUmmatPlus()` after login (returns HTTP 402 if the account isn't Ummat+), not by scope.

Like Alexa, **account linking must be optional, not mandatory** — `getUserLocation(undefined)`
falls back to a server-default location for anonymous users (`DEFAULT_LAT`/`DEFAULT_LNG` env
vars) with a 5-query/day cap tracked by IP address (`req.ip`, see `google.ts` line 23), so the
skill/action is usable without linking.

### 5. Directory / discovery settings

- Category: Lifestyle or Religion & Spirituality (whichever the current console offers)
- Invocation phrase: "PrayCalc" or "Talk to PrayCalc"
- Privacy policy: `https://praycalc.com/privacy`

---

## If the classic pipeline is gone (the realistic case)

Options to bring PrayCalc to a Google surface that Google is actually still accepting new
submissions to (each is a real engineering decision, not a config change — flag to the user
before starting any of these):

1. **Do nothing new on Google** and rely on Alexa + HomeKit + Home Assistant, which all remain
   live, standard integration paths (see `../alexa/` and `../../homeassistant/`).
2. **Android App Actions / Google Assistant "built-in intents"** for Android app deep links
   (different SDK, different code path, ties to the native Android app rather than
   `smart.praycalc.com`) — would need its own scoping and is not "certification packaging" of
   the existing webhook.
3. Re-check Google's current documentation for whatever has replaced Conversational Actions by
   the time this is read; Google's assistant developer surface has changed multiple times since
   2023 and may have changed again.

Do not start any of these without confirming current platform status first — this file's
Alexa-parity structure exists so the Dialogflow config is ready *if* a path opens, not because
submission is currently possible.
