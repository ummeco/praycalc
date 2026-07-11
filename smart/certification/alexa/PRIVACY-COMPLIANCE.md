# Alexa Skill — Privacy & Compliance Answers

Answers for the Alexa Developer Console "Privacy & Compliance" tab, grounded in what
`smart/src/routes/alexa.ts`, `smart/src/routes/oauth.ts`, and `smart/src/lib/*` actually do.
Do not change these answers without re-reading the code — the console cross-checks them
against observed skill behavior during certification.

## Does this skill allow users to make purchases or spend real money?
**No.** No in-skill purchasing (ISP) API is used. Ummat+ upgrades happen out-of-band on
`praycalc.com/upgrade`, never inside the Alexa conversation.

## Does this skill collect users' personal information?
**Yes.** Specifically:
- An OAuth access token (via account linking, optional) that resolves to a PrayCalc/Ummat
  user ID (`resolveUserFromToken` in `oauth.ts`).
- That user ID is used to look up a saved home location (`pc_saved_locations` via
  `getUserLocation` in `smart/src/lib/user-location.ts`) and subscription plan
  (`umm_subscriptions` via `smart/src/lib/subscription.ts`).
- For unlinked (anonymous) users, the Alexa `session.sessionId` is used only as a free-tier
  rate-limit key (`pc_free_tier_usage`, capped at 5 queries/day) — no location or profile data
  is tied to it.

Privacy policy: https://praycalc.com/privacy — Terms: https://praycalc.com/terms

## Is this skill directed at or does it target children under 13?
**No.** `isChildDirected: false` in `skill.json`. Content is prayer-time information for a
general audience.

## Does this skill contain advertising?
**No.**

## Is this skill compliant with export laws (encryption)?
**Yes.** Standard HTTPS/TLS only (no proprietary or non-standard encryption); `isExportCompliant: true`.

## Health, medical, or financial content?
**No.**

## Does the skill use the Alexa Web API for Games or Alexa Presentation Language (APL)?
**No.** `apis.custom.interfaces` is empty in `skill.json` — response is voice + a `Standard`
Alexa card (`buildAlexaResponse` in `alexa.ts`), not APL.

## Location data
The skill does not request the Alexa **Device Address** permission
(`permissions: []` in `skill.json`). Location instead comes from the user's PrayCalc account
(set in the mobile/web app), resolved server-side after account linking. Unlinked users get a
single server-configured default location (`DEFAULT_LAT`/`DEFAULT_LNG`/`DEFAULT_TIMEZONE` env
vars), not their real device location.

## Account linking — is it required to use the skill?
**No — optional.** `accountLinking.json` sets `"skipOnEnablement": true`. Without linking,
the skill answers using the default location, capped at 5 queries/day. Linking (Ummat+ required
server-side, see the 402 gate in `oauth.ts` `POST /authorize`) unlocks the user's own saved
location and removes the daily cap.

## Data retention / deletion
Users can revoke linked-account access at any time from the PrayCalc app (Settings > Smart Home)
or Alexa app (Skills > PrayCalc > Disable Skill, which calls `POST /oauth/revoke`). Full account
deletion is covered generally by `.github/wiki/Account-Deletion.md` ("smart home device
connections and automations" are listed as deleted); verify that deletion path also purges
`pc_oauth_tokens`/`pc_oauth_codes` rows before certification, since those tables are not named
explicitly in that doc.
