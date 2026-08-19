"""Islamic prayer time calculation engine."""
import math
from dataclasses import dataclass
from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional


class Method(str, Enum):
    ISNA = "isna"
    MWL = "mwl"
    EGYPT = "egypt"
    UMM_AL_QURA = "umm_al_qura"
    TEHRAN = "tehran"
    KARACHI = "karachi"


class Madhab(str, Enum):
    SHAFI = "shafi"
    HANAFI = "hanafi"


@dataclass
class PrayerTimes:
    fajr: str       # HH:MM 24-hour
    sunrise: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    date: str       # YYYY-MM-DD
    latitude: float
    longitude: float
    method: str
    madhab: str


# Method parameters: (fajr_angle, isha_angle, isha_interval_minutes or None)
_METHOD_PARAMS: dict[Method, tuple[float, Optional[float], Optional[int]]] = {
    Method.ISNA:       (15.0, 15.0,   None),
    Method.MWL:        (18.0, 17.0,   None),
    Method.EGYPT:      (19.5, 17.5,   None),
    Method.UMM_AL_QURA:(18.5, None,   90),
    Method.TEHRAN:     (17.7, 14.0,   None),
    Method.KARACHI:    (18.0, 18.0,   None),
}


#: Rendered in place of a prayer that has no time on the requested date. Above the
#: polar circles the sun can fail to rise or set for weeks, so Fajr, Sunrise, Maghrib
#: and Isha genuinely do not occur on some days.
NO_TIME_PLACEHOLDER = "--:--"


def _to_rad(degrees: float) -> float:
    return degrees * math.pi / 180.0


def _to_deg(radians: float) -> float:
    return radians * 180.0 / math.pi


def _fix_hour(h: float) -> float:
    """Normalize hour to 0-24 range."""
    return h - 24.0 * math.floor(h / 24.0)


def _julian_day(year: int, month: int, day: int) -> float:
    """Convert Gregorian date to Julian Day Number."""
    if month <= 2:
        year -= 1
        month += 12
    a = math.floor(year / 100)
    b = 2 - a + math.floor(a / 4)
    return math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + b - 1524.5


def _sun_position(jd: float) -> tuple[float, float]:
    """Calculate sun's declination and equation of time for Julian Day."""
    d = jd - 2451545.0
    g = _to_rad(357.529 + 0.98560028 * d)
    q = 280.459 + 0.98564736 * d
    l_val = _to_rad(q + 1.915 * math.sin(g) + 0.020 * math.sin(2 * g))
    e = _to_rad(23.439 - 0.00000036 * d)

    ra = _to_deg(math.atan2(math.cos(e) * math.sin(l_val), math.cos(l_val))) / 15.0
    ra = _fix_hour(ra)

    dec = _to_deg(math.asin(math.sin(e) * math.sin(l_val)))
    eq_time = q / 15.0 - ra
    return dec, eq_time


def _sun_angle_time(jd: float, lat: float, angle: float, direction: str = "ccw") -> float:
    """Calculate prayer time based on sun angle."""
    dec, eq_time = _sun_position(jd)
    noon = 12.0 - eq_time

    try:
        t = _to_deg(math.acos(
            (-math.sin(_to_rad(angle)) - math.sin(_to_rad(dec)) * math.sin(_to_rad(lat))) /
            (math.cos(_to_rad(dec)) * math.cos(_to_rad(lat)))
        )) / 15.0
    except ValueError:
        return float("nan")

    return noon + (t if direction == "cw" else -t)


def _asr_time(jd: float, lat: float, shadow_factor: int) -> float:
    """Calculate Asr prayer time. shadow_factor=1 (Shafi), 2 (Hanafi)."""
    dec, eq_time = _sun_position(jd)
    noon = 12.0 - eq_time

    target_angle = -_to_deg(math.atan(1.0 / (shadow_factor + math.tan(abs(_to_rad(lat - dec))))))

    try:
        t = _to_deg(math.acos(
            (-math.sin(_to_rad(target_angle)) - math.sin(_to_rad(dec)) * math.sin(_to_rad(lat))) /
            (math.cos(_to_rad(dec)) * math.cos(_to_rad(lat)))
        )) / 15.0
    except ValueError:
        return float("nan")

    return noon + t


def _format_time(hour: float, lng: float) -> str:
    """Format fractional hour as HH:MM, adjusted for longitude offset.

    Returns NO_TIME_PLACEHOLDER when the prayer has no time on the requested date.
    Above the polar circles the sun can fail to rise or set for weeks, so a depression
    angle is simply unreachable and the solvers return NaN. Passing that to
    ``_fix_hour`` raised ``ValueError: cannot convert float NaN to integer`` and took
    the caller's whole request down with it (PKG-07).
    """
    if not math.isfinite(hour):
        return NO_TIME_PLACEHOLDER
    hour = _fix_hour(hour + lng / 15.0)  # crude UTC offset; production would use TZ database
    if not math.isfinite(hour):
        return NO_TIME_PLACEHOLDER
    h = int(hour)
    m = int((hour - h) * 60 + 0.5)
    if m >= 60:
        h += 1
        m -= 60
    return f"{h % 24:02d}:{m:02d}"


def calculate_prayer_times(
    latitude: float,
    longitude: float,
    calc_date: date | str,
    method: Method | str = Method.ISNA,
    madhab: Madhab | str = Madhab.SHAFI,
) -> PrayerTimes:
    """Calculate Islamic prayer times for given location and date.

    Args:
        latitude: Decimal degrees, -90 to 90
        longitude: Decimal degrees, -180 to 180
        calc_date: Date as datetime.date or 'YYYY-MM-DD' string
        method: Calculation method (ISNA, MWL, Egypt, Umm Al-Qura, Tehran, Karachi)
        madhab: Asr shadow ratio (Shafi=1x, Hanafi=2x)

    Returns:
        PrayerTimes dataclass with formatted HH:MM prayer times
    """
    if isinstance(calc_date, str):
        d = date.fromisoformat(calc_date)
    else:
        d = calc_date

    if isinstance(method, str):
        method = Method(method.lower())
    if isinstance(madhab, str):
        madhab = Madhab(madhab.lower())

    jd = _julian_day(d.year, d.month, d.day)
    fajr_angle, isha_angle, isha_interval = _METHOD_PARAMS[method]
    shadow_factor = 1 if madhab == Madhab.SHAFI else 2

    fajr = _sun_angle_time(jd, latitude, fajr_angle, "ccw")
    sunrise = _sun_angle_time(jd, latitude, -0.833, "ccw")
    _, eq_time = _sun_position(jd)
    dhuhr = 12.0 - eq_time
    asr = _asr_time(jd, latitude, shadow_factor)
    maghrib = _sun_angle_time(jd, latitude, -0.833, "cw")

    if isha_interval is not None:
        isha = maghrib + isha_interval / 60.0
    else:
        isha = _sun_angle_time(jd, latitude, isha_angle or 17.0, "cw")

    date_str = d.isoformat()
    return PrayerTimes(
        fajr=_format_time(fajr, longitude),
        sunrise=_format_time(sunrise, longitude),
        dhuhr=_format_time(dhuhr, longitude),
        asr=_format_time(asr, longitude),
        maghrib=_format_time(maghrib, longitude),
        isha=_format_time(isha, longitude),
        date=date_str,
        latitude=latitude,
        longitude=longitude,
        method=method.value,
        madhab=madhab.value,
    )
