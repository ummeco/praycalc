"""End-to-end tests against a real Home Assistant instance.

Purpose:
    Assert the entity IDs, names and states Home Assistant actually produces.
    Every claim the README makes about entity IDs is pinned here, so the docs
    cannot drift from reality again.

Why this suite exists:
    v0.7.1 shipped without ``translations/en.json``. Because hassfest does not
    validate custom-integration translations, CI stayed green while all nine
    entities fell back to empty names and collided into ``_2``..``_9`` suffixes.
    Only a real Home Assistant boot catches that.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="install requirements-test.txt to run the Home Assistant suite",
)

from pytest_homeassistant_custom_component.common import (  # noqa: E402
    MockConfigEntry,
)

DOMAIN = "praycalc"

# Verbatim API response for Detroit on 2026-08-28. Times are UTC; Maghrib and
# Isha fall on the following UTC day.
API_RESPONSE = {
    "prayers": {
        "fajr": "09:31", "sunrise": "10:53", "dhuhr": "17:35",
        "asr": "21:17", "maghrib": "00:13", "isha": "01:35",
    },
    "nextPrayer": {"name": "Dhuhr", "time": "17:35", "minutesUntil": 308},
    "hijriDate": "13 Rabi al-Awwal 1448 AH",
    "qibla": {"bearing": 52.03},
    "meta": {
        "lat": 42.3314, "lng": -83.0458, "date": "2026-08-28",
        "method": "isna", "madhab": "shafii", "timezone": "UTC",
    },
}

ENTRY_DATA = {
    "city": "Detroit",
    "latitude": 42.3314,
    "longitude": -83.0458,
    "calculation_method": "isna",
    "madhab": "shafii",
    "api_url": "https://smart.praycalc.com/api/v1/times",
}

EXPECTED_SUFFIXES = [
    "next_prayer", "fajr", "sunrise", "dhuhr", "asr",
    "maghrib", "isha", "qibla_direction", "hijri_date",
]


class _FakeResponse:
    """Minimal stand-in for an aiohttp response."""

    status = 200

    async def json(self):
        return API_RESPONSE

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False


def _fake_get(*args, **kwargs):
    return _FakeResponse()


async def _setup(hass: HomeAssistant, data: dict | None = None) -> MockConfigEntry:
    """Add and set up a PrayCalc config entry with a stubbed API."""
    entry = MockConfigEntry(
        domain=DOMAIN, data=data or ENTRY_DATA, unique_id="42.3314_-83.0458"
    )
    entry.add_to_hass(hass)
    with patch("aiohttp.ClientSession.get", _fake_get):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    return entry


def _platform_entities(hass: HomeAssistant) -> list:
    return [e for e in er.async_get(hass).entities.values() if e.platform == DOMAIN]


async def test_entry_loads(hass: HomeAssistant) -> None:
    """The integration sets up without error."""
    entry = await _setup(hass)
    assert entry.state is ConfigEntryState.LOADED


async def test_creates_exactly_nine_entities(hass: HomeAssistant) -> None:
    """All nine sensors register."""
    await _setup(hass)
    assert len(_platform_entities(hass)) == 9


async def test_entity_ids_include_the_city(hass: HomeAssistant) -> None:
    """The device name carries the city, so entity IDs do too."""
    await _setup(hass)
    ids = {e.entity_id for e in _platform_entities(hass)}
    assert ids == {f"sensor.praycalc_detroit_{s}" for s in EXPECTED_SUFFIXES}


async def test_entity_ids_without_a_city(hass: HomeAssistant) -> None:
    """With no city the IDs collapse to the bare domain form used in the README."""
    await _setup(hass, {**ENTRY_DATA, "city": ""})
    ids = {e.entity_id for e in _platform_entities(hass)}
    assert ids == {f"sensor.praycalc_{s}" for s in EXPECTED_SUFFIXES}


async def test_no_entity_has_a_dedup_suffix(hass: HomeAssistant) -> None:
    """Empty names would collide and produce _2.._9. This is the v0.7.1 bug."""
    await _setup(hass)
    for entity in _platform_entities(hass):
        assert not entity.entity_id.rstrip("0123456789").endswith("_"), (
            f"{entity.entity_id} looks deduplicated — translations failed to load"
        )


async def test_every_entity_has_a_resolved_name(hass: HomeAssistant) -> None:
    """Names come from translations/en.json, not from strings.json."""
    await _setup(hass)
    for entity in _platform_entities(hass):
        state = hass.states.get(entity.entity_id)
        assert state is not None
        friendly = state.attributes.get("friendly_name")
        assert friendly, f"{entity.entity_id} has no friendly_name"
        assert friendly != "PrayCalc - Detroit", (
            f"{entity.entity_id} fell back to the bare device name"
        )


async def test_no_entity_is_unavailable(hass: HomeAssistant) -> None:
    """A raising property surfaces as unknown/unavailable; none should."""
    await _setup(hass)
    for entity in _platform_entities(hass):
        state = hass.states.get(entity.entity_id)
        assert state.state not in ("unavailable", "unknown"), (
            f"{entity.entity_id} is {state.state}"
        )


async def test_hijri_sensor_returns_the_formatted_string(hass: HomeAssistant) -> None:
    """Regression: v0.7.1 called .get() on this string and raised AttributeError."""
    await _setup(hass)
    state = hass.states.get("sensor.praycalc_detroit_hijri_date")
    assert state.state == "13 Rabi al-Awwal 1448 AH"
    assert state.attributes["hijri_day"] == 13
    assert state.attributes["hijri_month"] == "Rabi al-Awwal"
    assert state.attributes["hijri_year"] == 1448
    assert state.attributes["hijri_month_number"] == 3


async def test_prayer_timestamps_are_the_correct_instants(hass: HomeAssistant) -> None:
    """UTC wall-clock strings are anchored to real instants, including rollover."""
    await _setup(hass)
    expected = {
        "fajr": "2026-08-28T09:31:00+00:00",
        "sunrise": "2026-08-28T10:53:00+00:00",
        "dhuhr": "2026-08-28T17:35:00+00:00",
        "asr": "2026-08-28T21:17:00+00:00",
        # Detroit's evening prayers land on the next UTC day.
        "maghrib": "2026-08-29T00:13:00+00:00",
        "isha": "2026-08-29T01:35:00+00:00",
    }
    for prayer, iso in expected.items():
        state = hass.states.get(f"sensor.praycalc_detroit_{prayer}")
        assert state.state == iso, f"{prayer} was {state.state}, expected {iso}"


async def test_next_prayer_is_a_lowercase_enum_key(hass: HomeAssistant) -> None:
    """The state must match an ``options`` entry for state translation to work."""
    await _setup(hass)
    state = hass.states.get("sensor.praycalc_detroit_next_prayer")
    assert state.state in state.attributes["options"]
    assert "sunrise" not in state.attributes["options"]


async def test_qibla_bearing_and_compass(hass: HomeAssistant) -> None:
    """Bearing passes through and the compass point is derived from it."""
    await _setup(hass)
    state = hass.states.get("sensor.praycalc_detroit_qibla_direction")
    assert float(state.state) == pytest.approx(52.03)
    assert state.attributes["qibla_compass"] == "NE"


async def test_unload_is_clean(hass: HomeAssistant) -> None:
    """Unloading removes the entry's data and cancels the local ticker."""
    entry = await _setup(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
