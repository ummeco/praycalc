"""Sensor platform for PrayCalc integration."""

from __future__ import annotations

import logging
from datetime import datetime

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    CONF_CITY,
    CONF_CALC_METHOD,
    CONF_MADHAB,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    PRAYER_NAMES,
    PRAYER_ICONS,
    ATTR_PRAYER_NAME,
    ATTR_PRAYER_TIME,
    ATTR_COUNTDOWN,
    ATTR_COUNTDOWN_MINUTES,
    ATTR_HIJRI_DATE,
    ATTR_HIJRI_MONTH,
    ATTR_HIJRI_YEAR,
    ATTR_HIJRI_DAY,
    ATTR_QIBLA_BEARING,
    ATTR_QIBLA_COMPASS,
    ATTR_CALCULATION_METHOD,
    ATTR_MADHAB,
    ATTR_CITY,
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    CALC_METHODS,
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

    entities: list[SensorEntity] = []

    # Next prayer sensor (main sensor)
    entities.append(PrayCalcNextPrayerSensor(coordinator, entry))

    # Individual prayer time sensors
    for prayer in PRAYER_NAMES:
        entities.append(PrayCalcPrayerTimeSensor(coordinator, entry, prayer))

    # Qibla direction sensor
    entities.append(PrayCalcQiblaSensor(coordinator, entry))

    # Hijri date sensor
    entities.append(PrayCalcHijriDateSensor(coordinator, entry))

    async_add_entities(entities, update_before_add=True)


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    """Return device info for grouping all PrayCalc entities."""
    city = entry.data.get(CONF_CITY, "")
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=f"PrayCalc{' - ' + city if city else ''}",
        manufacturer="PrayCalc",
        model="Prayer Time Calculator",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url="https://praycalc.com",
    )


def _format_countdown(target_time_str: str) -> tuple[str, int]:
    """Calculate countdown string and minutes from a time string (HH:MM).

    Returns (formatted_string, total_minutes).
    """
    try:
        now = datetime.now()
        parts = target_time_str.split(":")
        target = now.replace(
            hour=int(parts[0]),
            minute=int(parts[1]),
            second=0,
            microsecond=0,
        )
        # If target is in the past, it's tomorrow's prayer
        if target < now:
            from datetime import timedelta

            target += timedelta(days=1)

        diff = target - now
        total_minutes = int(diff.total_seconds() / 60)
        hours = total_minutes // 60
        minutes = total_minutes % 60

        if hours > 0:
            return f"{hours}h {minutes}m", total_minutes
        return f"{minutes}m", total_minutes
    except (ValueError, IndexError):
        return "unknown", 0


def _bearing_to_compass(bearing: float) -> str:
    """Convert a bearing in degrees to a compass direction."""
    directions = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
    ]
    index = round(bearing / 22.5) % 16
    return directions[index]


class PrayCalcNextPrayerSensor(CoordinatorEntity[PrayCalcCoordinator], SensorEntity):
    """Sensor showing the next upcoming prayer."""

    _attr_has_entity_name = True
    _attr_translation_key = "next_prayer"
    _attr_icon = "mdi:mosque"

    def __init__(
        self, coordinator: PrayCalcCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the next prayer sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_next_prayer"
        self._attr_device_info = _device_info(entry)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_state()
        self.async_write_ha_state()

    def _update_state(self) -> None:
        """Update sensor state from coordinator data."""
        if not self.coordinator.data:
            self._attr_native_value = None
            return

        data = self.coordinator.data
        next_prayer = data.next_prayer
        prayer_name = next_prayer.get("name", "unknown")
        prayer_time = next_prayer.get("time", "")

        self._attr_native_value = prayer_name.capitalize()
        self._attr_icon = PRAYER_ICONS.get(prayer_name.lower(), "mdi:mosque")

        countdown_str, countdown_min = _format_countdown(prayer_time)

        self._attr_extra_state_attributes = {
            ATTR_PRAYER_NAME: prayer_name,
            ATTR_PRAYER_TIME: prayer_time,
            ATTR_COUNTDOWN: countdown_str,
            ATTR_COUNTDOWN_MINUTES: countdown_min,
            ATTR_CALCULATION_METHOD: CALC_METHODS.get(
                self._entry.data.get(CONF_CALC_METHOD, ""), ""
            ),
            ATTR_MADHAB: self._entry.data.get(CONF_MADHAB, ""),
            ATTR_CITY: self._entry.data.get(CONF_CITY, ""),
            ATTR_LATITUDE: self._entry.data.get(CONF_LATITUDE),
            ATTR_LONGITUDE: self._entry.data.get(CONF_LONGITUDE),
        }

    @property
    def native_value(self) -> str | None:
        """Return the next prayer name."""
        if not self.coordinator.data:
            return None
        data = self.coordinator.data
        name = data.next_prayer.get("name", "unknown")
        return name.capitalize()

    @property
    def extra_state_attributes(self) -> dict:
        """Return extra attributes including countdown."""
        if not self.coordinator.data:
            return {}
        data = self.coordinator.data
        next_prayer = data.next_prayer
        prayer_name = next_prayer.get("name", "unknown")
        prayer_time = next_prayer.get("time", "")
        countdown_str, countdown_min = _format_countdown(prayer_time)

        return {
            ATTR_PRAYER_NAME: prayer_name,
            ATTR_PRAYER_TIME: prayer_time,
            ATTR_COUNTDOWN: countdown_str,
            ATTR_COUNTDOWN_MINUTES: countdown_min,
            ATTR_CALCULATION_METHOD: CALC_METHODS.get(
                self._entry.data.get(CONF_CALC_METHOD, ""), ""
            ),
            ATTR_MADHAB: self._entry.data.get(CONF_MADHAB, ""),
            ATTR_CITY: self._entry.data.get(CONF_CITY, ""),
        }


class PrayCalcPrayerTimeSensor(
    CoordinatorEntity[PrayCalcCoordinator], SensorEntity
):
    """Sensor for an individual prayer time (Fajr, Dhuhr, etc.)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(
        self,
        coordinator: PrayCalcCoordinator,
        entry: ConfigEntry,
        prayer: str,
    ) -> None:
        """Initialize an individual prayer time sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._prayer = prayer
        self._attr_unique_id = f"{entry.entry_id}_{prayer}"
        self._attr_translation_key = prayer
        self._attr_icon = PRAYER_ICONS.get(prayer, "mdi:clock-outline")
        self._attr_device_info = _device_info(entry)

    @property
    def native_value(self) -> datetime | None:
        """Return the prayer time as a datetime object."""
        if not self.coordinator.data:
            return None

        prayers = self.coordinator.data.prayers
        time_str = prayers.get(self._prayer, "")
        if not time_str:
            return None

        try:
            parts = time_str.split(":")
            now = datetime.now()
            return now.replace(
                hour=int(parts[0]),
                minute=int(parts[1]),
                second=0,
                microsecond=0,
            ).astimezone()
        except (ValueError, IndexError):
            return None

    @property
    def extra_state_attributes(self) -> dict:
        """Return the raw time string as an attribute."""
        if not self.coordinator.data:
            return {}

        prayers = self.coordinator.data.prayers
        time_str = prayers.get(self._prayer, "")
        countdown_str, countdown_min = _format_countdown(time_str)

        return {
            "time_24h": time_str,
            ATTR_COUNTDOWN: countdown_str,
            ATTR_COUNTDOWN_MINUTES: countdown_min,
        }


class PrayCalcQiblaSensor(
    CoordinatorEntity[PrayCalcCoordinator], SensorEntity
):
    """Sensor showing the Qibla direction (bearing in degrees)."""

    _attr_has_entity_name = True
    _attr_translation_key = "qibla"
    _attr_icon = "mdi:compass-rose"
    _attr_native_unit_of_measurement = "\u00b0"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self, coordinator: PrayCalcCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the Qibla sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_qibla"
        self._attr_device_info = _device_info(entry)

    @property
    def native_value(self) -> float | None:
        """Return the Qibla bearing in degrees."""
        if not self.coordinator.data:
            return None

        qibla = self.coordinator.data.qibla
        return qibla.get("bearing")

    @property
    def extra_state_attributes(self) -> dict:
        """Return compass direction and distance."""
        if not self.coordinator.data:
            return {}

        qibla = self.coordinator.data.qibla
        bearing = qibla.get("bearing", 0)
        return {
            ATTR_QIBLA_BEARING: bearing,
            ATTR_QIBLA_COMPASS: _bearing_to_compass(bearing),
            "distance_km": qibla.get("distance"),
        }


class PrayCalcHijriDateSensor(
    CoordinatorEntity[PrayCalcCoordinator], SensorEntity
):
    """Sensor showing the current Hijri (Islamic) date."""

    _attr_has_entity_name = True
    _attr_translation_key = "hijri_date"
    _attr_icon = "mdi:calendar-star"

    def __init__(
        self, coordinator: PrayCalcCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the Hijri date sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_hijri_date"
        self._attr_device_info = _device_info(entry)

    @property
    def native_value(self) -> str | None:
        """Return the formatted Hijri date string."""
        if not self.coordinator.data:
            return None

        hijri = self.coordinator.data.hijri_date
        day = hijri.get("day", "")
        month = hijri.get("month", "")
        year = hijri.get("year", "")
        month_name = hijri.get("monthName", month)

        if day and month_name and year:
            return f"{day} {month_name} {year}"
        return None

    @property
    def extra_state_attributes(self) -> dict:
        """Return individual Hijri date components."""
        if not self.coordinator.data:
            return {}

        hijri = self.coordinator.data.hijri_date
        return {
            ATTR_HIJRI_DAY: hijri.get("day"),
            ATTR_HIJRI_MONTH: hijri.get("monthName", hijri.get("month")),
            ATTR_HIJRI_YEAR: hijri.get("year"),
            ATTR_HIJRI_DATE: self.native_value,
            "hijri_month_number": hijri.get("month"),
            "hijri_weekday": hijri.get("weekday"),
        }
