# Alexa Skill — Submission Guide

Package contents:
- `skill-package/skill.json` — skill manifest (publishing info, endpoint, privacy flags)
- `skill-package/accountLinking.json` — OAuth 2.0 account linking, pointed at the live
  `smart.praycalc.com` OAuth endpoints
- `skill-package/interactionModels/custom/en-US.json` — interaction model (9 intents: 5 built-in,
  4 custom; matches `smart/src/routes/alexa.ts` exactly)
- `ask-resources.json` — ask-cli project file (no Lambda; this is a self-hosted HTTPS endpoint)
- `PRIVACY-COMPLIANCE.md` — answers for the console's Privacy & Compliance tab
- This file

Nothing here can be submitted by an AI agent — Amazon requires a human with 2FA on the
developer account to click through the console and hit Submit for Certification.

---

## 0. Prerequisites

- [ ] Amazon Developer account at developer.amazon.com (free)
- [ ] `ask-cli` installed and authenticated: `npm install -g ask-cli && ask configure`
- [ ] Confirm `smart.praycalc.com/alexa/fulfillment` is live and reachable:
  `curl -s -o /dev/null -w '%{http_code}' https://smart.praycalc.com/alexa/fulfillment` should not be a connection error (a 4xx/5xx from a GET is fine — Alexa only POSTs).
- [ ] Confirm `smart.praycalc.com/oauth/authorize` renders the consent page:
  `curl -s https://smart.praycalc.com/oauth/authorize?client_id=alexa-praycalc&redirect_uri=https://example.com&state=x&response_type=code` should return the `Link PrayCalc` HTML page.
- [ ] A test Ummat+ account (email/password) that passes the `hasUmmatPlus` gate in `oauth.ts`,
  for testing the linked path during certification.

## 1. Create the skill (first time only)

```bash
cd smart/certification/alexa
ask init --hosted-skill=false   # or: create the skill in the console first, then `ask configure` to link this folder
```

If the skill already exists in the console (created by a human), instead:

```bash
ask smapi create-skill-for-vendor  # OR grab the existing skillId and add it to ask-resources.json manually:
#   "profiles": { "default": { "skillId": "amzn1.ask.skill.xxxxxxxx-xxxx-...", ... } }
```

## 2. Deploy the manifest, interaction model, and account linking

```bash
cd smart/certification/alexa
ask deploy
```

This pushes `skill.json`, `interactionModels/custom/en-US.json`, and `accountLinking.json` to
the skill via SMAPI. No Lambda/code deploy happens (`skillInfrastructure` is `none` — the
fulfillment endpoint is the already-running `smart.praycalc.com` service).

If `ask deploy` rejects the account-linking file schema, apply it directly instead:

```bash
ask smapi update-account-linking-info \
  --skill-id <SKILL_ID> \
  --account-linking-request file:skill-package/accountLinking.json
```

## 3. Fill in console-only fields (ask-cli/SMAPI can't set these)

In the Alexa Developer Console, under the skill:
- **Distribution > Privacy & Compliance**: paste the answers from `PRIVACY-COMPLIANCE.md`.
- **Distribution > Availability**: worldwide, per `skill.json`'s `isAvailableWorldwide: true`.
- **Certification > Icons**: upload 108x108 and 512x512 PNG icons
  (referenced as placeholders `assets/icon-108.png` / `assets/icon-512.png` in `skill.json` —
  swap in real PrayCalc app icon exports before deploy; PNG only, no transparency for the 108px one).
- **Account Linking page** in the console will auto-generate three redirect URIs
  (`pitangui.amazon.com`, `layla.amazon.com`, `alexa.amazon.co.jp`) — `oauth.ts`'s
  `/oauth/authorize` accepts any `redirect_uri`, so no server-side allowlist change is needed.
  Client Secret: the value in `accountLinking.json` is a placeholder — `oauth.ts` never reads
  or validates `client_secret`, so any non-empty string satisfies Amazon's form requirement.

## 4. Test in the developer console before submitting

Alexa Developer Console > Test tab > enable testing for "Development", then run each case in
§ Certification test cases below via the text/voice simulator. These map 1:1 to
`smart/tests/voice-utterances.test.ts` and `smart/tests/alexa.test.ts`, so if those test files
are green (`cd smart && pnpm test`), the fulfillment behavior itself is already verified —
this pass is about the real HTTPS round-trip + account linking UI, not the response logic.

## 5. Certification test cases

| # | Say | Expect |
|---|-----|--------|
| 1 | "Alexa, open PrayCalc" | Welcome message (`LaunchRequest`), session stays open |
| 2 | "ask PrayCalc when is Fajr" | One-shot `SpecificPrayerIntent`, speaks Fajr time, session ends |
| 3 | "ask PrayCalc for all prayer times" | `AllPrayersIntent`, speaks all 5 times + Echo Show card |
| 4 | "ask PrayCalc for the Qibla direction" | `QiblaIntent`, speaks bearing in degrees |
| 5 | "ask PrayCalc what's the next prayer" | `NextPrayerIntent` |
| 6 | "ask PrayCalc when is Zuhr" | Resolves via the `zuhr` slot value alias to the Dhuhr time |
| 7 | "help" (mid-session) | `AMAZON.HelpIntent`, session stays open |
| 8 | "stop" | `AMAZON.StopIntent`, "As-salamu alaykum", session ends |
| 9 | Ask 6 questions in one day, unlinked | 6th response is the free-tier limit message pointing to `praycalc.com/upgrade` |
| 10 | Complete account linking with an Ummat+ test account, then ask any prayer question | Uses the account's saved home location, no daily cap |
| 11 | Complete account linking with a non-Plus account | `POST /oauth/authorize` returns 402 and the "Ummat+ is required" page — confirm the Alexa app surfaces this as a failed-linking state, not a silent success |
| 12 | Say something unrelated, e.g. "what's the weather" | Falls to the default/`AMAZON.FallbackIntent` branch: "I'm not sure what you asked...", session stays open |
| 13 | Say "cancel" | `AMAZON.CancelIntent`, "As-salamu alaykum" |
| 14 | End the session abruptly (hang up) | `SessionEndedRequest` handled, no error |

## 6. Submit for certification

Console > Distribution > Submission > **Submit for Review**. A human must click this — it
starts Amazon's automated + manual certification pass (typically a few business days).

## Known gaps to close before a human clicks Submit

- Real skill icons (108px/512px PNG) — placeholders only right now.
- A dedicated Ummat+ test account + credentials must be added to the console's
  "Testing Instructions" notes field (do not commit real credentials to this repo).
- Confirm `praycalc.com/privacy` and `praycalc.com/terms` are live and describe voice-assistant
  data use specifically (Alexa certification reviewers check the linked privacy policy text
  against what the skill actually collects, per `PRIVACY-COMPLIANCE.md`).
