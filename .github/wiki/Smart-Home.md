# Smart Home

PrayCalc integrates with smart home platforms so your home responds to prayer times automatically. Turn off the TV at Fajr. Dim the lights during Isha. Play adhan through your smart speakers.

Smart home features require an **Ummat+** subscription. See [[IAP]] for setup.

## Supported platforms

| Platform | Integration type |
| --- | --- |
| Apple HomeKit | Native HomeKit accessory + automations |
| Google Home | Actions on Google (webhook-based) |
| Amazon Alexa | Alexa Skills Kit (webhook-based) |
| Home Assistant | MQTT + REST webhook |
| IFTTT | Webhook trigger |
| Zapier | Webhook trigger |

## How it works

PrayCalc calculates tomorrow's prayer times each night and pushes them to your connected platforms as scheduled automations. When Fajr time arrives, your configured devices fire.

Automations are created and managed in the PrayCalc app — not in the home platform's own app, so everything stays in sync when you change your location or calculation method.

## Setup

1. Open PrayCalc > Settings > Smart Home
2. Tap the platform you want to connect
3. Follow the pairing flow (OAuth for HomeKit/Google/Alexa, API key for HASS)
4. Configure your automations (which devices, which prayers, what action)
5. Test — tap "Trigger now" to fire a test event

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

The TV Command Center is a separate Ummat+ feature that manages PrayCalc apps on Android TV and Fire TV devices from your phone. See the TV Control section in [[Features]] for the full feature list, including per-TV deep display settings (iqama times, countdown takeover, prayer-name-only mode).

Pair a TV by entering the 6-digit code shown on the TV screen from the web account page, the desktop menu-bar app's "My TVs" tab, or Settings > Connect TV in the mobile app.

## Troubleshooting

**Automations not firing:** confirm your location is set correctly and recalculate prayer times. Check that the smart home connection is still active in Settings > Smart Home.

**Wrong prayer times pushed to home platform:** prayer times are pushed the night before. If you change your location or method after midnight, tap "Refresh automations" in Settings > Smart Home to push updated times immediately.

## See Also

- [[Features]] — full feature list
- [[IAP]] — Ummat+ subscription setup
- [[Installation]] — TV app installation and pairing
