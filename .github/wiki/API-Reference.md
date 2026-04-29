# API Reference

PrayCalc exposes a public HTTP API for prayer time calculations. All endpoints are read-only and require no authentication.

**Base URL:** `https://praycalc.com/api`

## Prayer Times

### `GET /api/times`

Returns prayer times for a given location and date.

**Query parameters:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `lat` | float | Yes | Latitude (-90 to 90) |
| `lng` | float | Yes | Longitude (-180 to 180) |
| `date` | string | No | ISO 8601 date (default: today) |
| `method` | string | No | Calculation method (default: `MWL`) |
| `school` | string | No | Asr school: `standard` or `hanafi` (default: `standard`) |

**Calculation methods:**

| Value | Organization |
| --- | --- |
| `ISNA` | Islamic Society of North America |
| `MWL` | Muslim World League |
| `Egypt` | Egyptian General Authority of Survey |
| `Makkah` | Umm al-Qura, Makkah |
| `Tehran` | Institute of Geophysics, University of Tehran |
| `Karachi` | University of Islamic Sciences, Karachi |
| `Kuwait` | Kuwait |
| `Qatar` | Qatar |
| `Singapore` | Majlis Ugama Islam Singapura |
| `Moon_Sighting` | Moonsighting Committee (Shafaq: Ahmer) |

**Example request:**

```
GET /api/times?lat=51.5074&lng=-0.1278&method=MWL
```

**Example response:**

```json
{
  "date": "2026-04-28",
  "location": { "lat": 51.5074, "lng": -0.1278 },
  "method": "MWL",
  "times": {
    "fajr": "03:42",
    "sunrise": "05:34",
    "dhuhr": "13:01",
    "asr": "16:52",
    "maghrib": "20:28",
    "isha": "22:20"
  },
  "hijri": { "day": 29, "month": 10, "year": 1447, "monthName": "Rajab" }
}
```

## Qibla Direction

### `GET /api/qibla`

Returns the Qibla direction (bearing) from any coordinate.

**Query parameters:**

| Parameter | Type | Required |
| --- | --- | --- |
| `lat` | float | Yes |
| `lng` | float | Yes |

**Example response:**

```json
{
  "bearing": 118.4,
  "direction": "SE"
}
```

## Calendar

### `GET /api/calendar`

Returns prayer times for a full month.

**Query parameters:** same as `/api/times`, plus:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `year` | int | No | Year (default: current year) |
| `month` | int | No | Month 1-12 (default: current month) |

Returns an array of daily time objects in the same format as `/api/times`.

## Rate Limits

Public API: 60 requests per minute per IP. For higher limits, contact us at [praycalc.com](https://praycalc.com).

## See Also

- [[Features]] — full feature list
- [Full API docs on praycalc.org](https://praycalc.org/api)
