# Smart Home

PrayCalc integrates with smart home and voice platforms so your home responds to prayer times
automatically, and so you can ask for prayer times and Qibla direction by voice. Turn off the TV
at Fajr. Dim the lights during Isha. Play adhan through your smart speakers. Ask Alexa or your
Home Assistant dashboard when the next prayer is.

Product overview: [praycalc.org/features/smart-home](https://praycalc.org/features/smart-home).
Full platform-by-platform submission status for maintainers lives in
[`smart/certification/`](https://github.com/ummeco/praycalc/tree/main/smart/certification) and
[`homebridge/PUBLISH.md`](https://github.com/ummeco/praycalc/blob/main/homebridge/PUBLISH.md)
(private/ops detail); this page is the user-facing summary.

Voice and automation features require an **Ummat+** subscription for account linking (unlimited
queries, your own saved location). Without linking, voice assistants still answer up to 5
questions/day using a default location. See [[IAP]] for subscription setup.

## Supported platforms

| Platform | Integration type | Status |
| --- | --- | --- |
| Amazon Alexa | Alexa Skill (webhook fulfillment + OAuth account linking) | Fulfillment live at `smart.praycalc.com`; certification package ready in `smart/certification/alexa/`, pending a human submitting via the Alexa Developer Console |
| Google Assistant | Conversational Action (Dialogflow webhook) | Fulfillment code exists and is live, but Google discontinued new submissions to this platform (Conversational Actions) in 2023 — see `smart/certification/google/CONSOLE-SETUP.md` for the full status note before expecting a listing here |
| Apple HomeKit | Homebridge plugin (`homebridge-praycalc`) — contact sensors, one per prayer | Plugin code complete; not yet published to npm (see `homebridge/PUBLISH.md`) |
| Home Assistant | Custom integration (`custom_components/praycalc`), installable via HACS custom repository today | Works as a HACS **custom repository** now; default-repo listing (searchable without adding a custom repo URL) is pending a release pipeline — see `smart/homeassistant/HACS.md` |

## How it works

PrayCalc calculates tomorrow's prayer times each night and pushes them to your connected
platforms as scheduled automations. When Fajr time arrives, your configured devices fire.

Automations are created and managed in the PrayCalc app — not in the home platform's own app, so
everything stays in sync when you change your location or calculation method.

Voice queries (Alexa/Google) work differently from automations: they're answered live, on
request, by the PrayCalc Smart server (`smart.praycalc.com`) — no automation setup needed to ask
"what time is the next prayer?"

## Setup by platform

### Amazon Alexa

1. In the Alexa app, go to **Skills > Search "PrayCalc"** (once published) and enable it, or ask
   "Alexa, open PrayCalc" once installed.
2. Optional: link your PrayCalc account (Alexa app > Skills > PrayCalc > Settings > Link Account)
   with an Ummat+ account to use your saved home location and remove the 5-query/day limit.
   Without linking, PrayCalc answers using a default location.
3. Try: "Alexa, ask PrayCalc when is Fajr", "Alexa, ask PrayCalc for the Qibla direction",
   "Alexa, ask PrayCalc for all prayer times".

### Google Assistant

Not currently available as a published Google Assistant action — see the Status column above.
If this changes, setup instructions will be added here.

### Apple HomeKit (via Homebridge)

Requires a Homebridge instance (a small always-on server or a device like a Raspberry Pi
running Homebridge — this is a general home-automation prerequisite, not PrayCalc-specific).

1. Install the `homebridge-praycalc` plugin (Homebridge Config UI X > Plugins > search
   "PrayCalc" > Install, once published — see `homebridge/PUBLISH.md`).
2. Configure your latitude/longitude, calculation method, and madhab in the plugin settings.
3. Five contact sensors appear in the Home app — one per prayer — each "Open" during that
   prayer's active window. Build Home app automations off them (e.g., "When Fajr Prayer opens,
   turn on the bedroom light at 10%").

Full detail: `homebridge/README.md`.

### Home Assistant (HACS)

1. In HACS, open the three-dot menu > **Custom repositories** > add
   `https://github.com/ummeco/praycalc` as an **Integration**.
2. Search "PrayCalc" in HACS, install, restart Home Assistant.
3. **Settings > Devices & Services > Add Integration > PrayCalc.** Enter your city/lat/lng,
   calculation method, and madhab.
4. You get sensors for next prayer (with countdown), each individual prayer time, Qibla bearing,
   and the Hijri date — build automations directly in Home Assistant's automation editor, or
   import one of the pre-built blueprints in `smart/blueprints/` (gradual Fajr wake-up lights,
   adhan audio, Jumu'ah reminder, Ramadan Suhoor/Iftar alerts, and more).

Full detail: `smart/homeassistant/README.md`.

## Available automation triggers

| Trigger | Description |
| --- | --- |
| Prayer time (any of 5 prayers) | Fires at the calculated prayer time |
| Pre-prayer reminder | Fires N minutes before a prayer (1-60 min) |
| Sunrise | Fires at sunrise |
| Sunset | Fires at sunset |
| Adhan start | Fires when adhan audio begins playing |
| Adhan end | Fires when adhan audio finishes |

## TV Command Center

The TV Command Center is a separate Ummat+ feature that manages PrayCalc apps on Android TV and
Fire TV devices from your phone. See the TV Control section in [[Features]] for the full feature
list, including per-TV deep display settings (iqama times, countdown takeover, prayer-name-only
mode).

Pair a TV by entering the 6-digit code shown on the TV screen from the web account page, the
desktop menu-bar app's "My TVs" tab, or Settings > Connect TV in the mobile app.

## Troubleshooting

**Automations not firing:** confirm your location is set correctly and recalculate prayer times.
Check that the smart home connection is still active in Settings > Smart Home.

**Wrong prayer times pushed to home platform:** prayer times are pushed the night before. If you
change your location or method after midnight, tap "Refresh automations" in Settings > Smart
Home to push updated times immediately.

**Voice assistant says to set a location first:** this means account linking succeeded but no
home location is saved on your PrayCalc account yet (or the server has no default location
configured for anonymous use) — set your location in the PrayCalc app under Settings.

**Voice assistant asks you to upgrade after linking:** account linking for Alexa/Google requires
an active Ummat+ subscription; a non-Plus account will fail to link. See [[IAP]].

## See Also

- [[Features]] — full feature list
- [[IAP]] — Ummat+ subscription setup
- [[Installation]] — TV app installation and pairing
- [praycalc.org/features/smart-home](https://praycalc.org/features/smart-home) — public product page
