"""DataUpdateCoordinator for PrayCalc.

Purpose:
    Fetch prayer times from the PrayCalc Smart REST API and normalise them into
    timezone-aware datetimes that Home Assistant can consume directly.

Inputs:
    Config entry data/options: latitude, longitude, calculation method, madhab,
    and an optional self-hosted API URL.

Outputs:
    ``PrayCalcData`` exposing ``prayer_times`` (aware datetimes, local tz),
    ``next_prayer``, ``qibla`` and ``hijri`` components.

Constraints:
    The API returns wall-clock strings in **UTC** ("HH:MM") with no date
    attached, plus ``meta.date`` for the solar day. Times must therefore be
    re-anchored to real datetimes before use; treating them as local wall-clock
    (which earlier versions did) shifts every sensor by the UTC offset.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_API_URL,
    CONF_CALC_METHOD,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_MADHAB,
    DEFAULT_API_URL,
    DOMAIN,
    HIJRI_MONTHS,
    PRAYER_ORDER,
    UPDATE_INTERVAL_SECONDS,
)

_LOGGER = logging.getLogger(__name__)


def _parse_hijri(raw: str) -> dict:
    """Split the API's Hijri string into components.

    The API returns a single formatted string such as ``"13 Rabi al-Awwal 1448
    AH"``. Older code treated this value as a mapping and called ``.get()`` on
    it, which raised ``AttributeError`` on every state update.

    Returns a dict with ``day``, ``month``, ``month_name``, ``year`` and
    ``formatted``. Unparseable input yields the raw string with empty parts
    rather than raising, so a format change upstream degrades instead of
    breaking the entity.
    """
    formatted = (raw or "").strip()
    result: dict = {
        "day": None,
        "month": None,
        "month_name": None,
        "year": None,
        "formatted": formatted or None,
    }
    if not formatted:
        return result

    # "13 Rabi al-Awwal 1448 AH" -> ["13", "Rabi al-Awwal 1448 AH"]
    parts = formatted.split(" ", 1)
    if len(parts) != 2 or not parts[0].isdigit():
        return result

    result["day"] = int(parts[0])
    remainder = parts[1].removesuffix("AH").strip()

    # Trailing token is the year; everything before it is the month name.
    tokens = remainder.rsplit(" ", 1)
    if len(tokens) == 2 and tokens[1].isdigit():
        month_name = tokens[0].strip()
        result["month_name"] = month_name
        result["year"] = int(tokens[1])
        if month_name in HIJRI_MONTHS:
            result["month"] = HIJRI_MONTHS.index(month_name) + 1

    return result


def _build_prayer_datetimes(
    prayers: dict[str, str], base_date_str: str
) -> dict[str, datetime]:
    """Turn UTC "HH:MM" strings into timezone-aware local datetimes.

    The API emits UTC wall-clock times for a single solar day, so a prayer can
    legitimately land on the following UTC calendar day (Detroit's Maghrib at
    20:13 EDT is 00:13 UTC the next morning). Two corrections are applied:

    1. Walking the prayers in solar order, any time earlier than its
       predecessor is rolled forward one day.
    2. The whole sequence is shifted so that Dhuhr — solar noon, the most
       stable anchor — falls on the requested date in local time.

    Returns a mapping of prayer name to aware datetime in HA's local timezone.
    Prayers with missing or malformed times are omitted.
    """
    try:
        base = datetime.strptime(base_date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        base = dt_util.utcnow().replace(tzinfo=None)

    base = base.replace(hour=0, minute=0, second=0, microsecond=0)

    built: dict[str, datetime] = {}
    previous: datetime | None = None

    for name in PRAYER_ORDER:
        raw = prayers.get(name)
        if not raw:
            continue
        try:
            hour_str, minute_str = str(raw).split(":")[:2]
            candidate = base.replace(
                hour=int(hour_str), minute=int(minute_str)
            ).replace(tzinfo=dt_util.UTC)
        except (ValueError, IndexError):
            continue

        # Roll forward past a UTC midnight crossing.
        if previous is not None and candidate < previous:
            candidate += timedelta(days=1)

        built[name] = candidate
        previous = candidate

    if not built:
        return {}

    # Re-anchor: Dhuhr must fall on the requested date once converted to local.
    anchor = built.get("dhuhr") or next(iter(built.values()))
    local_anchor_date = dt_util.as_local(anchor).date()
    try:
        target_date = datetime.strptime(base_date_str, "%Y-%m-%d").date()
        shift = (target_date - local_anchor_date).days
    except (ValueError, TypeError):
        shift = 0

    if shift:
        built = {k: v + timedelta(days=shift) for k, v in built.items()}

    return {k: dt_util.as_local(v) for k, v in built.items()}


class PrayCalcData:
    """Parsed response from the PrayCalc Smart API."""

    def __init__(self, data: dict) -> None:
        """Normalise the raw API response into typed, tz-aware fields."""
        self.raw = data

        meta: dict = data.get("meta", {}) or {}
        self.meta = meta
        self.date: str = meta.get("date", "")
        self.method: str = meta.get("method", "")
        self.madhab: str = meta.get("madhab", "")
        self.latitude = meta.get("lat")
        self.longitude = meta.get("lng")

        # Raw "HH:MM" UTC strings, kept for the time_24h attribute.
        self.prayers: dict[str, str] = data.get("prayers", {}) or {}

        # Real datetimes, converted to HA's local timezone.
        self.prayer_times: dict[str, datetime] = _build_prayer_datetimes(
            self.prayers, self.date
        )

        self.qibla: dict = data.get("qibla", {}) or {}
        self.hijri: dict = _parse_hijri(data.get("hijriDate", ""))

    def next_prayer(self, now: datetime | None = None) -> tuple[str | None, datetime | None]:
        """Return the next upcoming prayer as ``(name, when)``.

        Computed locally from cached datetimes so the countdown stays accurate
        between API polls. Sunrise is skipped: it marks the end of Fajr rather
        than a prayer in its own right.

        Once every prayer for the day has passed, tomorrow's Fajr is estimated
        as today's Fajr plus 24 hours. The true value moves by a minute or two
        day to day; the next scheduled poll corrects it after midnight.
        """
        if not self.prayer_times:
            return None, None

        current = now or dt_util.now()
        upcoming = [
            (name, when)
            for name, when in self.prayer_times.items()
            if name != "sunrise" and when > current
        ]
        if upcoming:
            name, when = min(upcoming, key=lambda item: item[1])
            return name, when

        fajr = self.prayer_times.get("fajr")
        if fajr is None:
            return None, None
        return "fajr", fajr + timedelta(days=1)


class PrayCalcCoordinator(DataUpdateCoordinator[PrayCalcData]):
    """Coordinator that fetches prayer times from the PrayCalc Smart API."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL_SECONDS),
        )
        self.config_entry = entry

    def _setting(self, key: str, default=None):
        """Read a setting, preferring options set via the options flow."""
        return self.config_entry.options.get(
            key, self.config_entry.data.get(key, default)
        )

    async def _async_update_data(self) -> PrayCalcData:
        """Fetch prayer times from the PrayCalc Smart REST API."""
        session = async_get_clientsession(self.hass)

        params = {
            "lat": str(self._setting(CONF_LATITUDE)),
            "lng": str(self._setting(CONF_LONGITUDE)),
            "date": dt_util.now().strftime("%Y-%m-%d"),
            "method": self._setting(CONF_CALC_METHOD, "isna"),
            "madhab": self._setting(CONF_MADHAB, "shafii"),
        }

        try:
            async with session.get(
                self._setting(CONF_API_URL, DEFAULT_API_URL),
                params=params,
                timeout=30,
            ) as response:
                if response.status != 200:
                    raise UpdateFailed(
                        f"PrayCalc API returned HTTP {response.status}"
                    )
                data = await response.json()
                return PrayCalcData(data)

        except UpdateFailed:
            raise
        except Exception as err:
            raise UpdateFailed(f"Error fetching PrayCalc data: {err}") from err
