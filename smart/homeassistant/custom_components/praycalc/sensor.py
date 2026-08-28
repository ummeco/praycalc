"""Sensor platform for PrayCalc integration.

Purpose:
    Expose prayer times, the next upcoming prayer, Qibla bearing and the Hijri
    date as Home Assistant sensors.

Constraints:
    All time arithmetic goes through ``homeassistant.util.dt`` and the
    coordinator's pre-converted datetimes. Never build a datetime from
    ``datetime.now()`` here: the API speaks UTC and the host clock is not
    necessarily the timezone of the configured coordinates.
"""

from __future__ import annotations

import logging
from datetime import datetime

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_CALCULATION_METHOD,
    ATTR_CITY,
    ATTR_COUNTDOWN,
    ATTR_COUNTDOWN_MINUTES,
    ATTR_HIJRI_DATE,
    ATTR_HIJRI_DAY,
    ATTR_HIJRI_MONTH,
    ATTR_HIJRI_YEAR,
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    ATTR_MADHAB,
    ATTR_PRAYER_NAME,
    ATTR_PRAYER_TIME,
    ATTR_QIBLA_BEARING,
    ATTR_QIBLA_COMPASS,
    CALC_METHODS,
    CONF_CALC_METHOD,
    CONF_CITY,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_MADHAB,
    DOMAIN,
    NEXT_PRAYER_OPTIONS,
    PRAYER_ICONS,
    PRAYER_NAMES,
)
from .coordinator import PrayCalcCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up PrayCalc sensors from a config entry."""
    coordinator: PrayCalcCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities: list[SensorEntity] = [
        PrayCalcNextPrayerSensor(coordinator, entry),
        *(
            PrayCalcPrayerTimeSensor(coordinator, entry, prayer)
            for prayer in PRAYER_NAMES
        ),
        PrayCalcQiblaSensor(coordinator, entry),
        PrayCalcHijriDateSensor(coordinator, entry),
    ]

    # No update_before_add: async_config_entry_first_refresh() has already
    # populated the coordinator, so a per-entity refresh would be redundant.
    async_add_entities(entities)


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    """Return device info for grouping all PrayCalc entities."""
    city = entry.options.get(CONF_CITY, entry.data.get(CONF_CITY, ""))
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=f"PrayCalc{' - ' + city if city else ''}",
        manufacturer="PrayCalc",
        model="Prayer Time Calculator",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url="https://praycalc.com",
    )


def _format_countdown(target: datetime | None) -> tuple[str | None, int | None]:
    """Return ``(human_readable, total_minutes)`` until ``target``.

    Both values are ``None`` when the target is unknown, so the attribute is
    absent rather than misleadingly zero.
    """
    if target is None:
        return None, None

    diff = target - dt_util.now()
    total_minutes = max(0, int(diff.total_seconds() // 60))
    hours, minutes = divmod(total_minutes, 60)
    return (f"{hours}h {minutes}m" if hours else f"{minutes}m"), total_minutes


def _bearing_to_compass(bearing: float) -> str:
    """Convert a bearing in degrees to a 16-point compass direction."""
    directions = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
    ]
    return directions[round(bearing / 22.5) % 16]


class PrayCalcBaseSensor(CoordinatorEntity[PrayCalcCoordinator], SensorEntity):
    """Shared wiring for every PrayCalc sensor."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: PrayCalcCoordinator,
        entry: ConfigEntry,
        unique_suffix: str,
    ) -> None:
        """Initialize common entity attributes."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{unique_suffix}"
        self._attr_device_info = _device_info(entry)

    def _setting(self, key: str, default=None):
        """Read a setting, preferring options set via the options flow."""
        return self._entry.options.get(key, self._entry.data.get(key, default))


class PrayCalcNextPrayerSensor(PrayCalcBaseSensor):
    """Sensor showing the next upcoming prayer.

    Declared as an ENUM sensor so Home Assistant resolves the state through the
    ``state`` block in the translations file. The raw state is the lowercase
    prayer key; the UI shows the translated label.
    """

    _attr_translation_key = "next_prayer"
    _attr_icon = "mdi:mosque"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = NEXT_PRAYER_OPTIONS

    def __init__(
        self, coordinator: PrayCalcCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the next prayer sensor."""
        super().__init__(coordinator, entry, "next_prayer")

    @property
    def icon(self) -> str:
        """Return an icon matching the upcoming prayer."""
        if not self.coordinator.data:
            return "mdi:mosque"
        name, _ = self.coordinator.data.next_prayer()
        return PRAYER_ICONS.get(name or "", "mdi:mosque")

    @property
    def native_value(self) -> str | None:
        """Return the next prayer key (lowercase, matching ``options``)."""
        if not self.coordinator.data:
            return None
        name, _ = self.coordinator.data.next_prayer()
        return name if name in NEXT_PRAYER_OPTIONS else None

    @property
    def extra_state_attributes(self) -> dict:
        """Return the countdown and the configuration in effect."""
        if not self.coordinator.data:
            return {}

        name, when = self.coordinator.data.next_prayer()
        countdown_str, countdown_min = _format_countdown(when)

        return {
            ATTR_PRAYER_NAME: name,
            ATTR_PRAYER_TIME: when.isoformat() if when else None,
            ATTR_COUNTDOWN: countdown_str,
            ATTR_COUNTDOWN_MINUTES: countdown_min,
            ATTR_CALCULATION_METHOD: CALC_METHODS.get(
                self._setting(CONF_CALC_METHOD, ""), ""
            ),
            ATTR_MADHAB: self._setting(CONF_MADHAB, ""),
            ATTR_CITY: self._setting(CONF_CITY, ""),
            ATTR_LATITUDE: self._setting(CONF_LATITUDE),
            ATTR_LONGITUDE: self._setting(CONF_LONGITUDE),
        }


class PrayCalcPrayerTimeSensor(PrayCalcBaseSensor):
    """Sensor for an individual prayer time (Fajr, Dhuhr, etc.)."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(
        self,
        coordinator: PrayCalcCoordinator,
        entry: ConfigEntry,
        prayer: str,
    ) -> None:
        """Initialize an individual prayer time sensor."""
        super().__init__(coordinator, entry, prayer)
        self._prayer = prayer
        self._attr_translation_key = prayer
        self._attr_icon = PRAYER_ICONS.get(prayer, "mdi:clock-outline")

    @property
    def native_value(self) -> datetime | None:
        """Return the prayer time as a timezone-aware datetime."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data.prayer_times.get(self._prayer)

    @property
    def extra_state_attributes(self) -> dict:
        """Return the local wall-clock time and a countdown."""
        if not self.coordinator.data:
            return {}

        when = self.coordinator.data.prayer_times.get(self._prayer)
        countdown_str, countdown_min = _format_countdown(when)

        return {
            "time_24h": when.strftime("%H:%M") if when else None,
            ATTR_COUNTDOWN: countdown_str,
            ATTR_COUNTDOWN_MINUTES: countdown_min,
        }


class PrayCalcQiblaSensor(PrayCalcBaseSensor):
    """Sensor showing the Qibla direction (bearing in degrees)."""

    _attr_translation_key = "qibla"
    _attr_icon = "mdi:compass-rose"
    _attr_native_unit_of_measurement = "°"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self, coordinator: PrayCalcCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the Qibla sensor."""
        super().__init__(coordinator, entry, "qibla")

    @property
    def native_value(self) -> float | None:
        """Return the Qibla bearing in degrees."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data.qibla.get("bearing")

    @property
    def extra_state_attributes(self) -> dict:
        """Return the bearing and its compass equivalent."""
        if not self.coordinator.data:
            return {}

        bearing = self.coordinator.data.qibla.get("bearing")
        if bearing is None:
            return {}

        return {
            ATTR_QIBLA_BEARING: bearing,
            ATTR_QIBLA_COMPASS: _bearing_to_compass(bearing),
        }


class PrayCalcHijriDateSensor(PrayCalcBaseSensor):
    """Sensor showing the current Hijri (Islamic) date."""

    _attr_translation_key = "hijri_date"
    _attr_icon = "mdi:calendar-star"

    def __init__(
        self, coordinator: PrayCalcCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the Hijri date sensor."""
        super().__init__(coordinator, entry, "hijri_date")

    @property
    def native_value(self) -> str | None:
        """Return the formatted Hijri date string."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data.hijri.get("formatted")

    @property
    def extra_state_attributes(self) -> dict:
        """Return individual Hijri date components."""
        if not self.coordinator.data:
            return {}

        hijri = self.coordinator.data.hijri
        return {
            ATTR_HIJRI_DAY: hijri.get("day"),
            ATTR_HIJRI_MONTH: hijri.get("month_name"),
            ATTR_HIJRI_YEAR: hijri.get("year"),
            ATTR_HIJRI_DATE: hijri.get("formatted"),
            "hijri_month_number": hijri.get("month"),
        }
