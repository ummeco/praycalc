# PrayCalc Smart Home

Server and integration layer for PrayCalc smart home support. Connects prayer times to Home Assistant, HomeKit (via Homebridge), Apple Shortcuts, Alexa, and Google Home.

---

## Architecture

```
praycalc.com  ←→  smart server (port 4010)
                        │
          ┌─────────────┼──────────────┐
          │             │              │
   Home Assistant   Homebridge     Webhooks
   (custom_component)  (HomeKit)   (HA / Alexa / GH)
```

The smart server exposes a REST API. Integrations poll it or receive push events.

---

## Smart Server

### Setup

```bash
cp .env.example .env.local
# Fill in HASURA_GRAPHQL_URL, HASURA_GRAPHQL_ADMIN_SECRET, JWT_SECRET

pnpm install
pnpm dev       # starts on port 4010
```

### API Endpoints

#### Public (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/public/times` | Prayer times for a lat/lng. 100 req/min per IP. |

Query params: `lat` (required), `lng` (required), `date` (YYYY-MM-DD, default today), `method` (isna/mwl/egypt/umm_al_qura/tehran/karachi, default isna), `madhab` (shafii/hanafi, default shafii).

```bash
curl "https://smart.praycalc.com/api/v1/public/times?lat=40.7128&lng=-74.0060"
```

Response:
```json
{
  "prayers": { "fajr": "05:23", "sunrise": "06:47", "dhuhr": "12:54", "asr": "16:12", "maghrib": "19:01", "isha": "20:27" },
  "nextPrayer": { "name": "asr", "time": "16:12" },
  "hijriDate": { "day": 1, "month": 1, "year": 1446, "monthName": "Muharram" },
  "qibla": { "bearing": 58.2, "distance": 9243 }
}
```

#### Authenticated endpoints (Bearer JWT)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/times` | Prayer times (same as public but authenticated) |
| POST | `/api/v1/webhooks` | Register a webhook callback |
| GET | `/api/v1/webhooks` | List your webhook registrations |
| DELETE | `/api/v1/webhooks/:id` | Remove a webhook registration |
| GET/POST/DELETE | `/api/v1/devices` | Smart home device registry (`pc_smart_home_devices`) |
| POST | `/api/v1/devices/pairings` | Companion device (watch/desktop) requests a pairing code (no auth) |
| POST | `/api/v1/devices/pairings/:code/claim` | User claims a companion pairing code |
| GET | `/api/v1/devices/pairings/:code` | Companion device polls pairing status (no auth) |
| GET/POST/DELETE | `/api/v1/integrations` | Integration config (HA, Homebridge, etc.) |
| GET | `/api/v1/links` | List linked voice/smart-home providers (WMD linking dashboard) |
| DELETE | `/api/v1/links/:provider` | Revoke a linked provider's tokens |
| POST | `/google` | Google Home fulfillment |
| POST | `/alexa` | Alexa skill handler |
| GET | `/health` | Server health check |

#### Webhooks

Register a URL to receive an HTTP POST each time adhan enters (fires every minute, matched by timezone-local time):

```bash
curl -X POST https://smart.praycalc.com/api/v1/webhooks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "callbackUrl": "https://your-ha.local/api/webhook/praycalc",
    "lat": 40.7128,
    "lng": -74.0060,
    "timezone": "America/New_York",
    "events": ["adhan"]
  }'
```

Webhook payload:
```json
{
  "event": "adhan",
  "prayer": "fajr",
  "time": "05:23",
  "date": "2024-03-15",
  "lat": 40.7128,
  "lng": -74.0060,
  "timezone": "America/New_York",
  "hijriDate": { "day": 4, "month": 9, "year": 1445, "monthName": "Ramadan" }
}
```

Max 5 active webhooks per user. Callback URLs must be public HTTPS (no private IPs).

### Cron

The server runs a cron job every minute (`cron/prayer-events.ts`). It queries all active webhook registrations from Hasura, converts UTC to each user's local timezone, calculates prayer times for that date, and fires the callback when the current minute matches a prayer time.

---

## Home Assistant Integration

Custom component at `homeassistant/custom_components/praycalc/`.

### Installation

1. Copy the `praycalc/` folder into your HA `config/custom_components/` directory.
2. Restart Home Assistant.
3. Go to Settings → Devices & Services → Add Integration → search "PrayCalc".

### Configuration

The config flow (UI) asks for:
- City name (optional, for display)
- Latitude / Longitude
- Calculation method (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi)
- Madhab (Shafi'i/Maliki/Hanbali or Hanafi)
- API URL (default: `https://smart.praycalc.com/api/v1/times`)

### Sensors created

| Entity ID | Description |
|-----------|-------------|
| `sensor.praycalc_next_prayer` | Name of the next prayer + countdown attributes |
| `sensor.praycalc_fajr` | Fajr time (timestamp device class) |
| `sensor.praycalc_sunrise` | Sunrise time |
| `sensor.praycalc_dhuhr` | Dhuhr time |
| `sensor.praycalc_asr` | Asr time |
| `sensor.praycalc_maghrib` | Maghrib time |
| `sensor.praycalc_isha` | Isha time |
| `sensor.praycalc_qibla` | Qibla bearing in degrees + compass direction |
| `sensor.praycalc_hijri_date` | Today's Hijri date string |

Data refreshes every 60 seconds (configurable via `UPDATE_INTERVAL_SECONDS` in `const.py`).

### Automations example

```yaml
automation:
  - alias: "Adhan at Fajr"
    trigger:
      platform: state
      entity_id: sensor.praycalc_next_prayer
      to: "Fajr"
    action:
      service: media_player.play_media
      target:
        entity_id: media_player.living_room
      data:
        media_content_id: /local/adhan.mp3
        media_content_type: music
```

---

## Homebridge Plugin (HomeKit)

Plugin at `homebridge/src/index.ts`. Creates one HomeKit contact sensor per prayer (5 sensors: Fajr, Dhuhr, Asr, Maghrib, Isha). Each sensor is OPEN (contact not detected) for a configurable window after prayer time, then CLOSED.

### Installation

```bash
cd homebridge
pnpm install
pnpm build
# Then install the built plugin into your Homebridge instance
```

### config.json

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

`windowMinutes` (default: 30) — how long the contact sensor stays OPEN after the prayer time.

The plugin fetches prayer times from the public API on startup and refreshes every hour. Sensor states update every minute.

---

## Apple Shortcuts

Pre-built shortcuts in `shortcuts/`:

| File | Description |
|------|-------------|
| `next-prayer.shortcut` | Shows the next prayer name and time |
| `all-prayers.shortcut` | Shows all five daily prayer times |
| `qibla-direction.shortcut` | Shows Qibla direction with compass bearing |

### Install

1. Open each `.shortcut` file on your iPhone or iPad.
2. Tap "Add Shortcut" when prompted.
3. The shortcuts call `https://praycalc.com/api/prayers` using your device's current location.

You can add these to your Home Screen or invoke via Siri ("Hey Siri, next prayer").

---

## Alexa Skill & Google Home Fulfillment

The live implementation is `POST /alexa/fulfillment` (`src/routes/alexa.ts`) and
`POST /google/fulfillment` (`src/routes/google.ts`) — see the API table above.
Both run in-process on this server; there is no separate Lambda/Cloud
Functions deployment. Both are **custom conversational skills/actions**
(voice Q&A — "when is Fajr", "what's the Qibla direction"), not the Alexa
Smart Home Skill API or a Google Smart Home Action (no device
discovery/SYNC/QUERY/EXECUTE directives are implemented). Set the Alexa
custom skill's endpoint and the Google Assistant fulfillment webhook URL to
`https://smart.praycalc.com/alexa/fulfillment` and
`https://smart.praycalc.com/google/fulfillment` respectively.

Account linking for both uses the OAuth 2.0 server in `src/routes/oauth.ts`
(`GET/POST /oauth/authorize`, `POST /oauth/token`, `POST /oauth/revoke`) and is
optional — unlinked requests fall back to a server-default location
(`DEFAULT_LAT`/`DEFAULT_LNG`/`DEFAULT_TIMEZONE`) capped at 5 queries/day.

Submission-ready certification packages (skill manifest, interaction model,
account linking config, privacy answers, and step-by-step submission
instructions for a human to execute) live in `certification/alexa/` and
`certification/google/`. **Read `certification/google/CONSOLE-SETUP.md`
before investing time in the Google package** — Google discontinued new
submissions to the Conversational Actions platform this code targets in 2023;
verify current platform status before assuming a submission path exists.

(An earlier `smarthome/` directory prototyped a separate AWS Lambda / Cloud
Functions deployment using `ask-sdk-core` / `@assistant/conversation`. It
referenced a nonexistent `pc_assistant_links` table and was never wired into
CI or deploy — removed as dead code, WTH Epic H / H1.)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4010) |
| `HASURA_GRAPHQL_URL` | Yes | Hasura endpoint (e.g. `http://hasura:8080/v1/graphql`) |
| `HASURA_GRAPHQL_ADMIN_SECRET` | Yes | Hasura admin secret |
| `JWT_SECRET` | Yes | JWT signing secret for auth tokens |
| `MINIO_ENDPOINT` | No | Object storage endpoint |
| `MINIO_ACCESS_KEY` | No | Object storage access key |
| `MINIO_SECRET_KEY` | No | Object storage secret key |

Copy `.env.example` to `.env.local` and fill in values.

---

## Development

```bash
pnpm dev         # watch mode, restarts on changes
pnpm build       # compile TypeScript
pnpm test        # run tests (Vitest)
pnpm lint        # ESLint
```

Tests live in `tests/`. The server is not started when imported (only when run directly), so tests can import `app` without side effects.
