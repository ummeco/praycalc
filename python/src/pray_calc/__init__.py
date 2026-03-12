"""pray-calc: Accurate Islamic prayer time calculations."""
from .calculator import calculate_prayer_times, PrayerTimes, Method, Madhab

__all__ = ["calculate_prayer_times", "PrayerTimes", "Method", "Madhab"]
__version__ = "0.9.4"
