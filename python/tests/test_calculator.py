"""Tests for pray-calc prayer time calculation."""
import unittest
from datetime import date
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from pray_calc import calculate_prayer_times, Method, Madhab, PrayerTimes


class TestPrayerTimes(unittest.TestCase):

    def test_mecca_fajr_format(self):
        """Fajr for Mecca should be formatted as HH:MM."""
        r = calculate_prayer_times(21.3891, 39.8579, '2024-03-20', Method.UMM_AL_QURA)
        self.assertRegex(r.fajr, r'^\d{2}:\d{2}$')

    def test_mecca_all_times_present(self):
        """All 6 prayer times should be present for Mecca."""
        r = calculate_prayer_times(21.3891, 39.8579, '2024-03-20')
        for t in [r.fajr, r.sunrise, r.dhuhr, r.asr, r.maghrib, r.isha]:
            self.assertRegex(t, r'^\d{2}:\d{2}$')

    def test_fajr_before_sunrise(self):
        """Fajr must always be before sunrise."""
        r = calculate_prayer_times(51.5074, -0.1278, '2024-06-21', Method.ISNA)
        self.assertLess(r.fajr, r.sunrise)

    def test_sunrise_before_dhuhr(self):
        r = calculate_prayer_times(40.7128, -74.0060, '2024-03-20', Method.ISNA)
        self.assertLess(r.sunrise, r.dhuhr)

    def test_dhuhr_before_asr(self):
        r = calculate_prayer_times(40.7128, -74.0060, '2024-03-20')
        self.assertLess(r.dhuhr, r.asr)

    def test_asr_before_maghrib(self):
        r = calculate_prayer_times(40.7128, -74.0060, '2024-03-20')
        self.assertLess(r.asr, r.maghrib)

    def test_maghrib_before_isha(self):
        r = calculate_prayer_times(40.7128, -74.0060, '2024-03-20')
        self.assertLess(r.maghrib, r.isha)

    def test_isna_method(self):
        r = calculate_prayer_times(40.0, -75.0, '2024-01-15', Method.ISNA)
        self.assertEqual(r.method, 'isna')

    def test_mwl_method(self):
        r = calculate_prayer_times(51.5, 0.0, '2024-01-15', Method.MWL)
        self.assertEqual(r.method, 'mwl')

    def test_egypt_method(self):
        r = calculate_prayer_times(30.0, 31.0, '2024-01-15', Method.EGYPT)
        self.assertEqual(r.method, 'egypt')

    def test_umm_al_qura_method(self):
        r = calculate_prayer_times(21.0, 39.0, '2024-01-15', Method.UMM_AL_QURA)
        self.assertEqual(r.method, 'umm_al_qura')

    def test_tehran_method(self):
        r = calculate_prayer_times(35.7, 51.4, '2024-01-15', Method.TEHRAN)
        self.assertEqual(r.method, 'tehran')

    def test_karachi_method(self):
        r = calculate_prayer_times(24.9, 67.0, '2024-01-15', Method.KARACHI)
        self.assertEqual(r.method, 'karachi')

    def test_hanafi_asr_later_than_shafi(self):
        """Hanafi asr (2x shadow) should be later than Shafi (1x shadow)."""
        shafi = calculate_prayer_times(40.0, -75.0, '2024-06-21', madhab=Madhab.SHAFI)
        hanafi = calculate_prayer_times(40.0, -75.0, '2024-06-21', madhab=Madhab.HANAFI)
        self.assertLess(shafi.asr, hanafi.asr)

    def test_string_method_input(self):
        """String method input should work."""
        r = calculate_prayer_times(40.0, -75.0, '2024-03-20', method='isna')
        self.assertEqual(r.method, 'isna')

    def test_string_date_input(self):
        """String date should be accepted."""
        r = calculate_prayer_times(40.0, -75.0, '2024-03-20')
        self.assertEqual(r.date, '2024-03-20')

    def test_date_object_input(self):
        """datetime.date input should work."""
        r = calculate_prayer_times(40.0, -75.0, date(2024, 3, 20))
        self.assertEqual(r.date, '2024-03-20')

    def test_northern_latitude(self):
        """Calculation should work for high northern latitudes (Oslo, 60N)."""
        r = calculate_prayer_times(59.9, 10.7, '2024-03-20', Method.MWL)
        self.assertRegex(r.fajr, r'^\d{2}:\d{2}$')

    def test_southern_latitude(self):
        """Calculation should work for southern latitudes (Sydney, -34)."""
        r = calculate_prayer_times(-33.87, 151.21, '2024-03-20', Method.MWL)
        self.assertRegex(r.fajr, r'^\d{2}:\d{2}$')

    def test_negative_longitude(self):
        """Negative longitude (Americas) should work."""
        r = calculate_prayer_times(43.65, -79.38, '2024-03-20', Method.ISNA)
        self.assertRegex(r.dhuhr, r'^\d{2}:\d{2}$')

    def test_returns_prayer_times_dataclass(self):
        r = calculate_prayer_times(40.0, -75.0, '2024-03-20')
        self.assertIsInstance(r, PrayerTimes)

    def test_latitude_stored(self):
        r = calculate_prayer_times(40.0, -75.0, '2024-03-20')
        self.assertEqual(r.latitude, 40.0)

    def test_longitude_stored(self):
        r = calculate_prayer_times(40.0, -75.0, '2024-03-20')
        self.assertEqual(r.longitude, -75.0)

    def test_umm_al_qura_isha_90min_after_maghrib(self):
        """Umm Al-Qura: Isha should be exactly 90 minutes after Maghrib."""
        r = calculate_prayer_times(21.39, 39.86, '2024-03-20', Method.UMM_AL_QURA)
        def to_minutes(t: str) -> int:
            h, m = map(int, t.split(':'))
            return h * 60 + m
        diff = to_minutes(r.isha) - to_minutes(r.maghrib)
        self.assertEqual(diff, 90)


if __name__ == '__main__':
    unittest.main()
