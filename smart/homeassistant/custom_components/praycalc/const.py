"""Constants for the PrayCalc integration."""

DOMAIN = "praycalc"
DEFAULT_NAME = "PrayCalc"

CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"
CONF_CITY = "city"
CONF_CALC_METHOD = "calculation_method"
CONF_MADHAB = "madhab"
CONF_API_URL = "api_url"

DEFAULT_API_URL = "https://smart.praycalc.com/api/v1/times"

UPDATE_INTERVAL_SECONDS = 60

CALC_METHODS = {
    "isna": "ISNA (Islamic Society of North America)",
    "mwl": "MWL (Muslim World League)",
    "egypt": "Egyptian General Authority of Survey",
    "umm_al_qura": "Umm al-Qura University, Makkah",
    "tehran": "Institute of Geophysics, Tehran",
    "karachi": "University of Islamic Sciences, Karachi",
}

MADHABS = {
    "shafii": "Shafi'i / Maliki / Hanbali (standard shadow)",
    "hanafi": "Hanafi (double shadow)",
}

PRAYER_NAMES = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]

PRAYER_ICONS = {
    "fajr": "mdi:weather-sunset-up",
    "sunrise": "mdi:weather-sunny",
    "dhuhr": "mdi:white-balance-sunny",
    "asr": "mdi:weather-sunny-alert",
    "maghrib": "mdi:weather-sunset-down",
    "isha": "mdi:weather-night",
}

ATTR_PRAYER_NAME = "prayer_name"
ATTR_PRAYER_TIME = "prayer_time"
ATTR_COUNTDOWN = "countdown"
ATTR_COUNTDOWN_MINUTES = "countdown_minutes"
ATTR_HIJRI_DATE = "hijri_date"
ATTR_HIJRI_MONTH = "hijri_month"
ATTR_HIJRI_YEAR = "hijri_year"
ATTR_HIJRI_DAY = "hijri_day"
ATTR_QIBLA_BEARING = "qibla_bearing"
ATTR_QIBLA_COMPASS = "qibla_compass"
ATTR_CALCULATION_METHOD = "calculation_method"
ATTR_MADHAB = "madhab"
ATTR_CITY = "city"
ATTR_LATITUDE = "latitude"
ATTR_LONGITUDE = "longitude"
