"""Config, options and reconfigure flows for the PrayCalc integration.

Purpose:
    Let a user add PrayCalc, later adjust calculation preferences without
    losing history, and move an existing entry to a new location.

Flows:
    - ``async_step_user``        initial setup
    - ``async_step_reconfigure`` change location (rewrites the unique ID)
    - ``PrayCalcOptionsFlow``    change method / madhab / API URL in place
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CALC_METHODS,
    CONF_API_URL,
    CONF_CALC_METHOD,
    CONF_CITY,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_MADHAB,
    DEFAULT_API_URL,
    DEFAULT_NAME,
    DOMAIN,
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

# Options cover everything that can change without altering the entry's
# identity. Location lives in the reconfigure flow because the unique ID is
# derived from it.
STEP_OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_CALC_METHOD): vol.In(CALC_METHODS),
        vol.Required(CONF_MADHAB): vol.In(MADHABS),
        vol.Optional(CONF_API_URL, default=DEFAULT_API_URL): str,
    }
)


async def _test_api(
    hass,
    api_url: str,
    lat: float,
    lng: float,
    method: str,
    madhab: str,
) -> bool:
    """Return True if the PrayCalc API answers with usable data."""
    session = async_get_clientsession(hass)
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
            if response.status != 200:
                return False
            data = await response.json()
            return "prayers" in data
    except Exception:
        _LOGGER.exception("Failed to connect to PrayCalc API")
        return False


def _validate_coordinates(user_input: dict[str, Any]) -> dict[str, str]:
    """Return a field-keyed error map for out-of-range coordinates."""
    errors: dict[str, str] = {}
    if not -90 <= user_input[CONF_LATITUDE] <= 90:
        errors[CONF_LATITUDE] = "invalid_latitude"
    elif not -180 <= user_input[CONF_LONGITUDE] <= 180:
        errors[CONF_LONGITUDE] = "invalid_longitude"
    return errors


class PrayCalcConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for PrayCalc."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow handler."""
        return PrayCalcOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step: location and calculation preferences."""
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = _validate_coordinates(user_input)

            if not errors and not await _test_api(
                self.hass,
                user_input.get(CONF_API_URL, DEFAULT_API_URL),
                user_input[CONF_LATITUDE],
                user_input[CONF_LONGITUDE],
                user_input[CONF_CALC_METHOD],
                user_input[CONF_MADHAB],
            ):
                errors["base"] = "cannot_connect"

            if not errors:
                city = user_input.get(CONF_CITY, "").strip()

                await self.async_set_unique_id(
                    f"{user_input[CONF_LATITUDE]:.4f}_"
                    f"{user_input[CONF_LONGITUDE]:.4f}"
                )
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=f"PrayCalc - {city}" if city else DEFAULT_NAME,
                    data=user_input,
                )

        suggested_values: dict[str, Any] = {}
        if user_input is None:
            suggested_values = {
                CONF_LATITUDE: self.hass.config.latitude,
                CONF_LONGITUDE: self.hass.config.longitude,
                CONF_CITY: self.hass.config.location_name or "",
            }

        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(
                STEP_USER_SCHEMA, suggested_values
            ),
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Move an existing entry to a new location or set of preferences."""
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = _validate_coordinates(user_input)

            if not errors and not await _test_api(
                self.hass,
                user_input.get(CONF_API_URL, DEFAULT_API_URL),
                user_input[CONF_LATITUDE],
                user_input[CONF_LONGITUDE],
                user_input[CONF_CALC_METHOD],
                user_input[CONF_MADHAB],
            ):
                errors["base"] = "cannot_connect"

            if not errors:
                await self.async_set_unique_id(
                    f"{user_input[CONF_LATITUDE]:.4f}_"
                    f"{user_input[CONF_LONGITUDE]:.4f}"
                )
                self._abort_if_unique_id_mismatch(reason="wrong_location")

                city = user_input.get(CONF_CITY, "").strip()
                return self.async_update_reload_and_abort(
                    entry,
                    title=f"PrayCalc - {city}" if city else DEFAULT_NAME,
                    data=user_input,
                )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self.add_suggested_values_to_schema(
                STEP_USER_SCHEMA, {**entry.data, **entry.options}
            ),
            errors=errors,
        )


class PrayCalcOptionsFlow(OptionsFlow):
    """Adjust calculation preferences without re-adding the integration."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the options step."""
        entry = self.config_entry
        errors: dict[str, str] = {}

        if user_input is not None:
            if await _test_api(
                self.hass,
                user_input.get(CONF_API_URL, DEFAULT_API_URL),
                entry.data[CONF_LATITUDE],
                entry.data[CONF_LONGITUDE],
                user_input[CONF_CALC_METHOD],
                user_input[CONF_MADHAB],
            ):
                return self.async_create_entry(data=user_input)
            errors["base"] = "cannot_connect"

        current = {**entry.data, **entry.options}
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                STEP_OPTIONS_SCHEMA,
                {
                    CONF_CALC_METHOD: current.get(CONF_CALC_METHOD, "isna"),
                    CONF_MADHAB: current.get(CONF_MADHAB, "shafii"),
                    CONF_API_URL: current.get(CONF_API_URL, DEFAULT_API_URL),
                },
            ),
            errors=errors,
        )
