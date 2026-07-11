# homebridge-praycalc

Homebridge plugin that exposes Islamic prayer times as HomeKit **contact sensors** — one per
daily prayer (Fajr, Dhuhr, Asr, Maghrib, Isha). Each sensor reads **Open** while that prayer's
time window is active, and **Closed** otherwise, so it can drive HomeKit automations (dim the
lights, play a sound, send a notification) without any PrayCalc account or login.

Powered by the public [PrayCalc Smart API](https://smart.praycalc.com) — no API key required.

## Installation

### Homebridge Config UI X (recommended)

1. Search for "PrayCalc" in the Plugins tab of Homebridge Config UI X.
2. Click **Install**.
3. Configure via the settings form (see Configuration below) — no manual JSON editing needed.

### Manual

```bash
npm install -g homebridge-praycalc
```

Then add an accessory block to your Homebridge `config.json` (see below).

## Configuration

```json
{
  "accessories": [
    {
      "accessory": "PrayCalcPrayers",
      "name": "Prayer Times",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "method": "isna",
      "madhab": "shafii",
      "windowMinutes": 30
    }
  ]
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `accessory` | string | yes | — | Must be exactly `"PrayCalcPrayers"` |
| `name` | string | yes | — | Accessory name shown in the Home app |
| `latitude` | number | yes | — | Decimal degrees, north positive |
| `longitude` | number | yes | — | Decimal degrees, east positive |
| `method` | string | no | `isna` | One of `isna`, `mwl`, `egypt`, `umm_al_qura`, `tehran`, `karachi` |
| `madhab` | string | no | `shafii` | One of `shafii` (standard) or `hanafi` (double-shadow Asr) |
| `windowMinutes` | number | no | `30` | Minutes after a prayer's start time the sensor stays Open |

Full config UI schema is in `config.schema.json` for Config UI X users.

## What you get

Five `ContactSensor` HomeKit services, one per prayer:

- Fajr Prayer
- Dhuhr Prayer
- Asr Prayer
- Maghrib Prayer
- Isha Prayer

Each reads **Contact Not Detected** (Open, i.e. the automation-friendly "triggered" state) during
its active window, and **Contact Detected** (Closed) the rest of the day.

## Example automation

In the Home app: Automation > When a sensor detects something > pick e.g. "Fajr Prayer" >
Opens > choose a scene (dim lights, play a sound via a HomeKit speaker, etc.).

## How it works

On startup and every hour, the plugin fetches today's prayer times from
`https://api.praycalc.com/api/v1/public/times` for the configured latitude/longitude, method,
and madhab. Sensor states are recomputed every minute from the cached times — no per-minute
network call.

## Requirements

- Homebridge `>=1.6.0`
- Node.js `>=20.0.0` (the plugin uses the native `fetch` API)

## Troubleshooting

**Sensors never show Open:** confirm `latitude`/`longitude` are correct and check the Homebridge
log for `homebridge-praycalc: Initial fetch failed` — this usually means the device running
Homebridge has no outbound internet access to `api.praycalc.com`.

**Wrong prayer times:** double check `method` and `madhab` match your usual calculation
preference; these affect Fajr/Isha (method) and Asr (madhab) timing.

## See also

- [PrayCalc for Home Assistant](../smart/homeassistant/README.md) — HACS integration with more
  sensor detail (countdowns, Qibla, Hijri date)
- [PrayCalc Smart Home wiki](https://github.com/ummeco/praycalc/wiki/Smart-Home)

## License

MIT — see the [repository LICENSE](https://github.com/ummeco/praycalc/blob/main/LICENSE).
