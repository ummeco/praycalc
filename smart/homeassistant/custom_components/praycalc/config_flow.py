"""Config flow for PrayCalc integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    DOMAIN,
    DEFAULT_NAME,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_CITY,
    CONF_CALC_METHOD,
    CONF_MADHAB,
    CONF_API_URL,
    DEFAULT_API_URL,
    CALC_METHODS,
    MADHABS,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_CITY, default=""): str,
        vol.Required(CONF_LATITUDE): vol.Coerce(float),
        vol.Required(CONF_LONGITUDE): vol.Coerce(float),
        vol.Required(CONF_CALC_METHOD, default="isna"): vol.In(CALC_METHODS),
        vol.Required(CONF_MADHAB, default="shafii"): vol.In(MADHABS),
        vol.Optional(CONF_API_URL, default=DEFAULT_API_URL): str,
    }
)


class PrayCalcConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for PrayCalc."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step: location and calculation preferences."""
        errors: dict[str, str] = {}

        if user_input is not None:
            latitude = user_input[CONF_LATITUDE]
            longitude = user_input[CONF_LONGITUDE]

            if not -90 <= latitude <= 90:
                errors[CONF_LATITUDE] = "invalid_latitude"
            elif not -180 <= longitude <= 180:
                errors[CONF_LONGITUDE] = "invalid_longitude"
            else:
                # Test the API connection
                can_connect = await self._test_api(
                    user_input.get(CONF_API_URL, DEFAULT_API_URL),
                    latitude,
                    longitude,
                    user_input[CONF_CALC_METHOD],
                    user_input[CONF_MADHAB],
                )
                if not can_connect:
                    errors["base"] = "cannot_connect"
                else:
                    city = user_input.get(CONF_CITY, "").strip()
                    title = f"PrayCalc - {city}" if city else DEFAULT_NAME

                    # Prevent duplicate entries for same location
                    await self.async_set_unique_id(
                        f"{latitude:.4f}_{longitude:.4f}"
                    )
                    self._abort_if_unique_id_configured()

                    return self.async_create_entry(
                        title=title,
                        data=user_input,
                    )

        # Pre-fill latitude/longitude from HA's configured location
        suggested_values = {}
        if user_input is None:
            suggested_values = {
                CONF_LATITUDE: self.hass.config.latitude,
                CONF_LONGITUDE: self.hass.config.longitude,
                CONF_CITY: self.hass.config.location_name or "",
            }

        schema = self.add_suggested_values_to_schema(
            STEP_USER_SCHEMA, suggested_values
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )

    async def _test_api(
        self,
        api_url: str,
        lat: float,
        lng: float,
        method: str,
        madhab: str,
    ) -> bool:
        """Test if the PrayCalc API is reachable."""
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(
                api_url,
                params={
                    "lat": str(lat),
                    "lng": str(lng),
                    "date": "2026-01-01",
                    "method": method,
                    "madhab": madhab,
                },
                timeout=15,
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return "prayers" in data
                return False
        except Exception:
            _LOGGER.exception("Failed to connect to PrayCalc API")
            return False
