"""DataUpdateCoordinator for PrayCalc."""

from __future__ import annotations

import logging
from datetime import timedelta, datetime

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import (
    DOMAIN,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_CALC_METHOD,
    CONF_MADHAB,
    CONF_API_URL,
    DEFAULT_API_URL,
    UPDATE_INTERVAL_SECONDS,
)

_LOGGER = logging.getLogger(__name__)


class PrayCalcData:
    """Parsed response from the PrayCalc Smart API."""

    def __init__(self, data: dict) -> None:
        """Initialize from API response JSON."""
        self.raw = data
        self.prayers: dict[str, str] = data.get("prayers", {})
        self.next_prayer: dict = data.get("nextPrayer", {})
        self.hijri_date: dict = data.get("hijriDate", {})
        self.qibla: dict = data.get("qibla", {})
        self.date: str = data.get("date", "")
        self.location: dict = data.get("location", {})


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
        self._latitude = entry.data[CONF_LATITUDE]
        self._longitude = entry.data[CONF_LONGITUDE]
        self._method = entry.data[CONF_CALC_METHOD]
        self._madhab = entry.data[CONF_MADHAB]
        self._api_url = entry.data.get(CONF_API_URL, DEFAULT_API_URL)

    async def _async_update_data(self) -> PrayCalcData:
        """Fetch prayer times from the PrayCalc Smart REST API."""
        session = async_get_clientsession(self.hass)
        today = datetime.now().strftime("%Y-%m-%d")

        params = {
            "lat": str(self._latitude),
            "lng": str(self._longitude),
            "date": today,
            "method": self._method,
            "madhab": self._madhab,
        }

        try:
            async with session.get(
                self._api_url,
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
