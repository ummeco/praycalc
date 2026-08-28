# PrayCalc for Home Assistant

A HACS custom integration that brings GPS-accurate Islamic prayer times, Qibla direction, and Hijri calendar into Home Assistant.

Powered by the [PrayCalc Smart API](https://praycalc.com).

## Features

- **Next Prayer** sensor with countdown timer (name, time, minutes remaining)
- **Individual prayer sensors** for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha
- **Qibla direction** sensor with bearing in degrees and compass direction
- **Hijri date** sensor with day, month name, and year
- Six calculation methods: ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi
- Two madhab options for Asr: Shafi'i (standard) and Hanafi (double shadow)
- Countdown updates every minute; prayer times are fetched twice an hour
- Change your method or madhab any time from the integration's **Configure** button
- Pre-fills location from your Home Assistant configuration
- Supports self-hosted PrayCalc Smart API instances

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the three-dot menu in the top right, then **Custom repositories**
3. Add `https://github.com/ummeco/praycalc-ha` with category **Integration**
4. Search for "PrayCalc" and click **Install**
5. Restart Home Assistant

### Manual

1. Download the latest release from the [releases page](https://github.com/ummeco/praycalc-ha/releases)
2. Copy the `custom_components/praycalc` folder to your `config/custom_components/` directory
3. Restart Home Assistant

## Setup

1. Go to **Settings > Devices & Services > Add Integration**
2. Search for **PrayCalc**
3. Enter your city name, latitude, and longitude (pre-filled from HA config)
4. Select your calculation method and madhab
5. Click **Submit**

### Changing settings later

- **Calculation method, madhab or API URL** — open the PrayCalc integration and
  click **Configure**. The entry reloads in place and keeps its history.
- **Location** — use the three-dot menu on the integration entry and choose
  **Reconfigure**. Changing coordinates rewrites the entry's identity, so this
  is deliberately kept separate from the options above.

## Requirements

Home Assistant **2026.3.0** or newer. The integration's brand icons are only
served from 2026.3 onward, and the config flow uses APIs added in 2024.4.

## Sensors

> **Your entity IDs include your city.** Home Assistant builds each entity ID
> from the device name, and the device is named after the city you entered
> during setup. Entering "Detroit" produces `sensor.praycalc_detroit_fajr`;
> leaving the city blank produces `sensor.praycalc_fajr`. The examples below use
> the blank-city form. Check **Settings > Devices & Services > PrayCalc >
> entities** for your exact IDs, or copy them from Developer Tools > States.

| Entity (no city set) | Type | Description |
| --- | --- | --- |
| `sensor.praycalc_next_prayer` | enum | Next prayer as a lowercase key: `fajr`, `dhuhr`, `asr`, `maghrib`, `isha` |
| `sensor.praycalc_fajr` | timestamp | Fajr prayer time |
| `sensor.praycalc_sunrise` | timestamp | Sunrise time (end of the Fajr window) |
| `sensor.praycalc_dhuhr` | timestamp | Dhuhr prayer time |
| `sensor.praycalc_asr` | timestamp | Asr prayer time |
| `sensor.praycalc_maghrib` | timestamp | Maghrib prayer time |
| `sensor.praycalc_isha` | timestamp | Isha prayer time |
| `sensor.praycalc_qibla_direction` | degrees | Qibla bearing from your location |
| `sensor.praycalc_hijri_date` | string | Current Hijri date (e.g., "15 Ramadan 1447 AH") |

The next-prayer sensor's **state** is the lowercase key, while the UI shows the
translated label ("Fajr"). Compare against the key in automations. Sunrise is
never reported as the next prayer, since it ends the Fajr window rather than
beginning a new one.

### Next Prayer Attributes

| Attribute | Example | Description |
| --- | --- | --- |
| `prayer_name` | `dhuhr` | Lowercase prayer name |
| `prayer_time` | `2026-08-28T13:35:00-04:00` | Prayer time as an ISO timestamp |
| `countdown` | `1h 23m` | Human-readable countdown |
| `countdown_minutes` | `83` | Minutes until the prayer |
| `calculation_method` | `ISNA (...)` | Full method name |
| `madhab` | `shafii` | Selected madhab |
| `city` | `Detroit` | Configured city name |
| `latitude` | `42.3314` | Configured latitude |
| `longitude` | `-83.0458` | Configured longitude |

### Individual Prayer Attributes

| Attribute | Example | Description |
| --- | --- | --- |
| `time_24h` | `05:12` | Raw 24-hour time string |
| `countdown` | `2h 45m` | Time until this prayer |
| `countdown_minutes` | `165` | Minutes until this prayer |

### Qibla Attributes

| Attribute | Example | Description |
| --- | --- | --- |
| `qibla_bearing` | `56.3` | Bearing in degrees |
| `qibla_compass` | `ENE` | Compass direction |

### Hijri Date Attributes

| Attribute | Example | Description |
| --- | --- | --- |
| `hijri_day` | `15` | Day of the Hijri month |
| `hijri_month` | `Ramadan` | Hijri month name |
| `hijri_year` | `1447` | Hijri year |
| `hijri_date` | `15 Ramadan 1447 AH` | Full formatted date |
| `hijri_month_number` | `9` | Hijri month number |

## Automation Examples

### Notification before Fajr

```yaml
automation:
  - alias: "Fajr Reminder"
    trigger:
      - platform: state
        entity_id: sensor.praycalc_next_prayer
        attribute: countdown_minutes
    condition:
      - condition: state
        entity_id: sensor.praycalc_next_prayer
        # The state is the lowercase key, not the display label.
        state: "fajr"
      - condition: numeric_state
        entity_id: sensor.praycalc_next_prayer
        attribute: countdown_minutes
        below: 15
    action:
      - service: notify.mobile_app
        data:
          title: "Fajr in {{ state_attr('sensor.praycalc_next_prayer', 'countdown') }}"
          message: "Time to prepare for Fajr prayer"
```

### Dim lights during prayer time

```yaml
automation:
  - alias: "Dim lights for prayer"
    trigger:
      - platform: time
        at: sensor.praycalc_dhuhr
      - platform: time
        at: sensor.praycalc_asr
      - platform: time
        at: sensor.praycalc_maghrib
      - platform: time
        at: sensor.praycalc_isha
    action:
      - service: light.turn_on
        target:
          area_id: living_room
        data:
          brightness_pct: 30
          transition: 5
      - delay: "00:15:00"
      - service: light.turn_on
        target:
          area_id: living_room
        data:
          brightness_pct: 100
          transition: 5
```

### Display Hijri date on dashboard

Use the Hijri date sensor in a Mushroom card or Entities card:

```yaml
type: entities
entities:
  - entity: sensor.praycalc_hijri_date
    name: Islamic Date
    icon: mdi:calendar-star
  - entity: sensor.praycalc_next_prayer
    name: Next Prayer
    icon: mdi:mosque
  - entity: sensor.praycalc_qibla_direction
    name: Qibla Direction
    icon: mdi:compass-rose
```

## Blueprints

Pre-built automation blueprints are available in the `smart/blueprints/` directory of the PrayCalc repository. Import them into Home Assistant for common prayer-time automations like:

- Gradual Fajr wake-up lights
- Adhan light flash
- Adhan audio on smart speakers
- Dim lights during prayer
- Warm Maghrib lighting
- Night mode after Isha
- Jumu'ah reminder
- Ramadan Suhoor alarm
- Ramadan Iftar countdown
- Custom webhook triggers

## Self-hosted API

By default, the integration uses `https://smart.praycalc.com/api/v1/times`. If you run your own PrayCalc Smart server, enter its URL during setup.

The API endpoint accepts these parameters:

| Parameter | Example | Description |
| --- | --- | --- |
| `lat` | `42.3314` | Latitude |
| `lng` | `-83.0458` | Longitude |
| `date` | `2026-03-04` | Date in YYYY-MM-DD format |
| `method` | `isna` | Calculation method |
| `madhab` | `shafii` | Asr calculation school |

## License

MIT. See the [PrayCalc repository](https://github.com/ummeco/praycalc) for details.
