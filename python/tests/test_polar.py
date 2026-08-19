"""PKG-07 — the Python port raised at high latitudes.

`_sun_angle_time` and `_asr_time` return `float("nan")` when a depression angle is
geometrically unreachable, which is correct. `_format_time` then called `_fix_hour`,
whose `math.floor(h / 24.0)` raises `ValueError: cannot convert float NaN to integer`.
Any caller asking about Tromso in June got an exception instead of prayer times.
"""
import math
import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from pray_calc import calculate_prayer_times, Method  # noqa: E402

NO_TIME = "--:--"

POLAR = [
    ("Longyearbyen midnight sun", 78.22334, 15.64689, date(2026, 6, 21)),
    ("Longyearbyen polar night", 78.22334, 15.64689, date(2026, 12, 21)),
    ("Tromso midnight sun", 69.6492, 18.9553, date(2026, 6, 21)),
    ("McMurdo polar night", -77.8419, 166.6863, date(2026, 6, 21)),
]

FIELDS = ("fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha")


class TestPolarLatitudes(unittest.TestCase):
    def test_polar_latitudes_do_not_raise(self):
        """Returning at all is the substance: this used to raise ValueError."""
        for name, lat, lng, d in POLAR:
            with self.subTest(location=name):
                times = calculate_prayer_times(lat, lng, d)
                for f in FIELDS:
                    self.assertIsInstance(getattr(times, f), str)

    def test_unreachable_prayers_render_as_placeholder(self):
        times = calculate_prayer_times(78.22334, 15.64689, date(2026, 6, 21))
        for f in ("fajr", "sunrise", "maghrib", "isha"):
            with self.subTest(prayer=f):
                self.assertEqual(getattr(times, f), NO_TIME)

    def test_no_nan_artifacts_at_any_latitude(self):
        for lat in range(-85, 90, 5):
            for month in range(1, 13):
                times = calculate_prayer_times(float(lat), 0.0, date(2026, month, 15))
                for f in FIELDS:
                    value = getattr(times, f)
                    with self.subTest(lat=lat, month=month, prayer=f):
                        self.assertNotIn("nan", value.lower())
                        if value != NO_TIME:
                            hh, mm = value.split(":")
                            self.assertTrue(0 <= int(hh) <= 23, value)
                            self.assertTrue(0 <= int(mm) <= 59, value)

    def test_normal_latitudes_unchanged(self):
        times = calculate_prayer_times(21.39, 39.86, date(2026, 3, 20), Method.UMM_AL_QURA)
        for f in FIELDS:
            with self.subTest(prayer=f):
                self.assertNotEqual(getattr(times, f), NO_TIME)


if __name__ == "__main__":
    unittest.main()
