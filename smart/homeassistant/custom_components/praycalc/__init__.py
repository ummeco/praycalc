"""PrayCalc integration for Home Assistant.

Provides prayer time sensors, Qibla direction, Hijri date, and next prayer
countdown from the PrayCalc Smart REST API.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN, LOCAL_REFRESH_SECONDS
from .coordinator import PrayCalcCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up PrayCalc from a config entry."""
    coordinator = PrayCalcCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Prayer times only change once a day, so the coordinator polls the API
    # infrequently. This local ticker re-renders entity state every minute from
    # already-cached data so the countdown stays live without network traffic.
    @callback
    def _tick(_now) -> None:
        coordinator.async_update_listeners()

    entry.async_on_unload(
        async_track_time_interval(
            hass, _tick, timedelta(seconds=LOCAL_REFRESH_SECONDS)
        )
    )

    entry.async_on_unload(entry.add_update_listener(_async_update_options))

    return True


async def _async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when options change so new settings take effect."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a PrayCalc config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, PLATFORMS
    )
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok
