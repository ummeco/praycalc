"""Pytest configuration for the PrayCalc Home Assistant integration tests.

Purpose:
    Make ``custom_components/praycalc`` importable by a real Home Assistant
    instance so the suite can assert on genuinely generated entity IDs rather
    than on a reimplementation of Home Assistant's naming rules.

Why the copy:
    ``pytest-homeassistant-custom-component`` boots Home Assistant against a
    config directory inside its own package. Home Assistant only discovers
    custom integrations under ``<config_dir>/custom_components``, so the
    integration is staged there for the duration of the session.
"""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

INTEGRATION_SRC = (
    Path(__file__).resolve().parents[1] / "custom_components" / "praycalc"
)


def _harness_custom_components() -> Path | None:
    """Return the harness's ``custom_components`` directory, if it is installed."""
    try:
        from pytest_homeassistant_custom_component.common import get_test_config_dir
    except ImportError:
        return None
    return Path(get_test_config_dir()) / "custom_components"


@pytest.fixture(scope="session", autouse=True)
def stage_integration():
    """Copy the integration into the harness config dir for the test session."""
    target_root = _harness_custom_components()
    if target_root is None:
        yield
        return

    target = target_root / "praycalc"
    target_root.mkdir(parents=True, exist_ok=True)
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(INTEGRATION_SRC, target)

    yield

    shutil.rmtree(target, ignore_errors=True)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(request):
    """Enable custom integrations for tests that ask for a ``hass`` instance."""
    if "hass" not in request.fixturenames:
        yield
        return
    request.getfixturevalue("enable_custom_integrations")
    yield
