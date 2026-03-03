import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/timezone.dart' as tz;
import '../../shared/models/agenda_model.dart';
import '../../shared/models/settings_model.dart';

/// Agenda scheduling service.
/// Computes the exact trigger DateTime for each agenda item given a date + city.
class AgendaService {
  AgendaService._();
  static final instance = AgendaService._();

  /// Compute the DateTime when [agenda] should fire on [date].
  ///
  /// Returns null if:
  /// - The agenda is not active on this day-of-week
  /// - The prayer time is undefined (NaN — polar regions / midnight sun)
  DateTime? computeTrigger({
    required Agenda agenda,
    required DateTime date,
    required City city,
    required bool hanafi,
  }) {
    // Check day-of-week: Dart weekday is 1=Mon..7=Sun → convert to 0=Mon..6=Sun
    final weekday = date.weekday - 1;
    if (agenda.days.length < 7 && !agenda.days.contains(weekday)) return null;

    // Compute UTC offset for this city's timezone on [date]
    final offset = _utcOffsetFor(city.timezone, date);

    // Compute prayer times (use UTC noon as stable reference point)
    final utcDate = DateTime.utc(date.year, date.month, date.day, 12);
    final prayerTimes = getTimes(utcDate, city.lat, city.lng, offset, hanafi: hanafi);

    // Get fractional hour for the requested prayer
    final h = _prayerHour(prayerTimes, agenda.prayer);
    if (h == null || !h.isFinite) return null;

    // Convert fractional hour to local DateTime
    final baseHour = h % 24;
    final hours = baseHour.floor();
    final minutes = ((baseHour - hours) * 60).round();
    final prayerTime = DateTime(date.year, date.month, date.day, hours, minutes);

    // Apply offset (positive = after prayer, negative = before prayer)
    return prayerTime.add(Duration(minutes: agenda.offsetMinutes));
  }

  /// Human-readable description of when an agenda fires (used in UI).
  static String offsetDescription(Agenda a) {
    final pName = _prayerDisplayName(a.prayer);
    if (a.offsetMinutes == 0) return 'At $pName';
    if (a.offsetMinutes < 0) return '${a.offsetMinutes.abs()} min before $pName';
    return '${a.offsetMinutes} min after $pName';
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  double _utcOffsetFor(String timezone, DateTime date) {
    // Handle literal UTC offsets (e.g. "UTC+5:30", "UTC-7")
    if (timezone.startsWith('UTC')) {
      final rest = timezone.substring(3);
      if (rest.isEmpty) return 0.0;
      final sign = rest.startsWith('-') ? -1.0 : 1.0;
      final parts = rest.substring(1).split(':');
      final h = double.tryParse(parts[0]) ?? 0.0;
      final m = parts.length > 1 ? (double.tryParse(parts[1]) ?? 0.0) / 60.0 : 0.0;
      return sign * (h + m);
    }
    // Handle IANA timezone IDs (e.g. "America/New_York", "Asia/Karachi")
    try {
      final location = tz.getLocation(timezone);
      final tzDate = tz.TZDateTime(location, date.year, date.month, date.day, 12);
      return tzDate.timeZoneOffset.inMinutes / 60.0;
    } catch (_) {
      return 0.0;
    }
  }

  double? _prayerHour(PrayerTimes times, PrayerName prayer) {
    switch (prayer) {
      case PrayerName.fajr:
        return times.fajr;
      case PrayerName.sunrise:
        return times.sunrise;
      case PrayerName.dhuhr:
        return times.dhuhr;
      case PrayerName.asr:
        return times.asr;
      case PrayerName.maghrib:
        return times.maghrib;
      case PrayerName.isha:
        return times.isha;
    }
  }

  static String _prayerDisplayName(PrayerName p) {
    switch (p) {
      case PrayerName.fajr:
        return 'Fajr';
      case PrayerName.sunrise:
        return 'Sunrise';
      case PrayerName.dhuhr:
        return 'Dhuhr';
      case PrayerName.asr:
        return 'Asr';
      case PrayerName.maghrib:
        return 'Maghrib';
      case PrayerName.isha:
        return 'Isha';
    }
  }
}
