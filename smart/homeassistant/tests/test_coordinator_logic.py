"""Tests for the PrayCalc coordinator's pure parsing and anchoring logic.

Purpose:
    Lock in the two behaviours that silently broke every sensor in v0.7.1:
    treating the API's ``hijriDate`` string as a mapping, and treating its UTC
    wall-clock prayer times as local wall-clock.

Why no Home Assistant dependency:
    ``_parse_hijri`` and ``_build_prayer_datetimes`` only touch
    ``homeassistant.util.dt`` for timezone helpers, so a small stub keeps this
    suite runnable on any Python without pinning a Home Assistant release.
"""

from __future__ import annotations

import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

INTEGRATION = (
    Path(__file__).resolve().parents[1] / "custom_components" / "praycalc"
)


def _load_coordinator_logic(tz_name: str):
    """Import the coordinator's pure helpers with ``dt_util`` bound to ``tz_name``."""
    local = ZoneInfo(tz_name)

    dt_stub = types.ModuleType("homeassistant.util.dt")
    dt_stub.UTC = timezone.utc
    dt_stub.now = lambda: datetime.now(local)
    dt_stub.utcnow = lambda: datetime.now(timezone.utc)
    dt_stub.as_local = lambda value: value.astimezone(local)

    source = (INTEGRATION / "coordinator.py").read_text()
    body = source[source.index("def _parse_hijri") : source.index("class PrayCalcData")]

    namespace: dict = {
        "dt_util": dt_stub,
        "datetime": datetime,
        "timedelta": timedelta,
        "HIJRI_MONTHS": [
            "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
            "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Shaban",
            "Ramadan", "Shawwal", "Dhul Qadah", "Dhul Hijjah",
        ],
        "PRAYER_ORDER": ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"],
    }
    exec(compile("from __future__ import annotations\n" + body, "coordinator", "exec"), namespace)
    return namespace


PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]

# Real API output for 2026-08-28, all times UTC. Jakarta, Tokyo and Auckland
# have Fajr on the *previous* UTC day; Detroit has Maghrib and Isha on the next.
CITY_FIXTURES = {
    "Detroit": ("America/Detroit", {
        "fajr": "09:31", "sunrise": "10:53", "dhuhr": "17:35",
        "asr": "21:17", "maghrib": "00:13", "isha": "01:35"}),
    "London": ("Europe/London", {
        "fajr": "03:24", "sunrise": "05:07", "dhuhr": "12:03",
        "asr": "15:49", "maghrib": "18:56", "isha": "20:39"}),
    "Mecca": ("Asia/Riyadh", {
        "fajr": "02:00", "sunrise": "03:03", "dhuhr": "09:24",
        "asr": "12:46", "maghrib": "15:40", "isha": "16:43"}),
    "Jakarta": ("Asia/Jakarta", {
        "fajr": "21:57", "sunrise": "22:54", "dhuhr": "04:55",
        "asr": "08:13", "maghrib": "10:53", "isha": "11:50"}),
    "Tokyo": ("Asia/Tokyo", {
        "fajr": "18:57", "sunrise": "20:10", "dhuhr": "02:44",
        "asr": "06:22", "maghrib": "09:14", "isha": "10:28"}),
    "Auckland": ("Pacific/Auckland", {
        "fajr": "17:35", "sunrise": "18:47", "dhuhr": "00:24",
        "asr": "03:30", "maghrib": "05:57", "isha": "07:08"}),
    "Anchorage": ("America/Anchorage", {
        "fajr": "12:06", "sunrise": "14:41", "dhuhr": "22:02",
        "asr": "01:49", "maghrib": "05:20", "isha": "07:55"}),
    "Kiritimati": ("Pacific/Kiritimati", {
        "fajr": "15:28", "sunrise": "16:26", "dhuhr": "22:33",
        "asr": "01:44", "maghrib": "04:35", "isha": "05:33"}),
}

DATE = "2026-08-28"


@pytest.mark.parametrize("city", list(CITY_FIXTURES))
def test_every_prayer_resolves(city: str) -> None:
    """No prayer is dropped when rebuilding datetimes."""
    tz_name, prayers = CITY_FIXTURES[city]
    built = _load_coordinator_logic(tz_name)["_build_prayer_datetimes"](prayers, DATE)
    assert set(built) == set(PRAYER_ORDER)


@pytest.mark.parametrize("city", list(CITY_FIXTURES))
def test_prayers_are_chronological(city: str) -> None:
    """Fajr through Isha stay strictly increasing across UTC midnight."""
    tz_name, prayers = CITY_FIXTURES[city]
    built = _load_coordinator_logic(tz_name)["_build_prayer_datetimes"](prayers, DATE)
    ordered = [built[name] for name in PRAYER_ORDER]
    assert ordered == sorted(ordered)


@pytest.mark.parametrize("city", list(CITY_FIXTURES))
def test_all_prayers_fall_on_the_requested_local_date(city: str) -> None:
    """The whole day is anchored to the date the user asked for.

    This is the assertion that fails if UTC times are read as local wall-clock:
    Jakarta's Fajr would land on the 27th and Detroit's Maghrib on the 29th.
    """
    tz_name, prayers = CITY_FIXTURES[city]
    built = _load_coordinator_logic(tz_name)["_build_prayer_datetimes"](prayers, DATE)
    for name, when in built.items():
        assert when.strftime("%Y-%m-%d") == DATE, f"{name} landed on {when}"


@pytest.mark.parametrize("city", list(CITY_FIXTURES))
def test_dhuhr_is_near_local_midday(city: str) -> None:
    """Dhuhr is solar noon, so a timezone slip shows up here first."""
    tz_name, prayers = CITY_FIXTURES[city]
    built = _load_coordinator_logic(tz_name)["_build_prayer_datetimes"](prayers, DATE)
    dhuhr = built["dhuhr"]
    assert 11 <= dhuhr.hour <= 14, f"Dhuhr at {dhuhr} is not near midday"


@pytest.mark.parametrize("city", list(CITY_FIXTURES))
def test_fajr_is_before_sunrise_in_the_small_hours(city: str) -> None:
    """Fajr precedes sunrise and lands in the early morning locally."""
    tz_name, prayers = CITY_FIXTURES[city]
    built = _load_coordinator_logic(tz_name)["_build_prayer_datetimes"](prayers, DATE)
    assert built["fajr"] < built["sunrise"]
    assert 2 <= built["fajr"].hour <= 7


def test_malformed_times_are_skipped_not_fatal() -> None:
    """A bad entry drops that prayer instead of raising."""
    logic = _load_coordinator_logic("America/Detroit")
    built = logic["_build_prayer_datetimes"](
        {"fajr": "09:31", "sunrise": "--:--", "dhuhr": "17:35",
         "asr": "01:60", "maghrib": "", "isha": "01:35"},
        DATE,
    )
    assert "fajr" in built and "dhuhr" in built
    assert "sunrise" not in built
    assert "asr" not in built
    assert "maghrib" not in built


def test_empty_payload_returns_empty_mapping() -> None:
    """An empty prayers dict yields no datetimes rather than an exception."""
    logic = _load_coordinator_logic("America/Detroit")
    assert logic["_build_prayer_datetimes"]({}, DATE) == {}


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("13 Rabi al-Awwal 1448 AH", {"day": 13, "month": 3, "month_name": "Rabi al-Awwal", "year": 1448}),
        ("1 Ramadan 1447 AH", {"day": 1, "month": 9, "month_name": "Ramadan", "year": 1447}),
        ("30 Dhul Hijjah 1450 AH", {"day": 30, "month": 12, "month_name": "Dhul Hijjah", "year": 1450}),
    ],
)
def test_hijri_string_is_split_into_components(raw: str, expected: dict) -> None:
    """The API sends one formatted string; components are derived from it.

    v0.7.1 called ``.get()`` on this string, raising AttributeError on every
    state update of the Hijri sensor.
    """
    parsed = _load_coordinator_logic("UTC")["_parse_hijri"](raw)
    for key, value in expected.items():
        assert parsed[key] == value
    assert parsed["formatted"] == raw


@pytest.mark.parametrize("raw", ["", "garbage", "no-digits here AH", None])
def test_hijri_parsing_degrades_gracefully(raw) -> None:
    """Unparseable input yields empty components instead of raising."""
    parsed = _load_coordinator_logic("UTC")["_parse_hijri"](raw)
    assert parsed["day"] is None
    assert parsed["month"] is None


def test_unknown_hijri_month_keeps_name_without_number() -> None:
    """An upstream month rename degrades to a name with no index."""
    parsed = _load_coordinator_logic("UTC")["_parse_hijri"]("5 Unknown Month 1400 AH")
    assert parsed["day"] == 5
    assert parsed["month_name"] == "Unknown Month"
    assert parsed["month"] is None
    assert parsed["year"] == 1400
