import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/timezone.dart' as tz;

import '../../shared/models/settings_model.dart';

/// Generates iCalendar (.ics) content for prayer times.
///
/// Each prayer (Fajr through Isha) becomes a VEVENT with a 5-minute duration
/// and a VALARM reminder 10 minutes before the prayer starts.
class ICalService {
  const ICalService._();

  /// The six obligatory/sunnah prayer names to export.
  static const _prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  /// Extract a fractional-hour value from [PrayerTimes] by prayer index.
  static double _getPrayerTime(PrayerTimes times, int index) {
    switch (index) {
      case 0: return times.fajr;
      case 1: return times.sunrise;
      case 2: return times.dhuhr;
      case 3: return times.asr;
      case 4: return times.maghrib;
      case 5: return times.isha;
      default: return double.nan;
    }
  }

  /// Generate iCalendar content for prayer times.
  ///
  /// If [month] is provided (1-12), generates for that month only.
  /// Otherwise generates the full [year].
  static String generateIcal({
    required City city,
    required bool hanafi,
    required int year,
    int? month,
  }) {
    final buf = StringBuffer();

    buf.writeln('BEGIN:VCALENDAR');
    buf.writeln('VERSION:2.0');
    buf.writeln('PRODID:-//PrayCalc//Prayer Times//EN');
    buf.writeln('CALSCALE:GREGORIAN');
    buf.writeln('METHOD:PUBLISH');
    buf.writeln('X-WR-CALNAME:PrayCalc - ${city.name}');
    buf.writeln('X-WR-TIMEZONE:${city.timezone}');

    // VTIMEZONE component
    buf.writeln(_buildVTimezone(city.timezone));

    // Determine date range.
    final startMonth = month ?? 1;
    final endMonth = month ?? 12;

    for (var m = startMonth; m <= endMonth; m++) {
      final daysInMonth = _daysInMonth(year, m);
      for (var d = 1; d <= daysInMonth; d++) {
        final date = DateTime.utc(year, m, d, 12);
        final offset = _utcOffset(city.timezone, date);
        final times = getTimes(date, city.lat, city.lng, offset, hanafi: hanafi);

        for (var p = 0; p < _prayerNames.length; p++) {
          final h = _getPrayerTime(times, p);
          if (!h.isFinite) continue;

          final prayerDt = _fractionalHoursToDateTime(year, m, d, h);
          final uid = 'praycalc-${city.lat.toStringAsFixed(4)}-'
              '${city.lng.toStringAsFixed(4)}-$year$m$d-${_prayerNames[p]}'
              '@praycalc.com';

          buf.writeln('BEGIN:VEVENT');
          buf.writeln('UID:$uid');
          buf.writeln('DTSTAMP:${_formatDtUtc(DateTime.now().toUtc())}');
          buf.writeln('DTSTART;TZID=${city.timezone}:${_formatDtLocal(prayerDt)}');
          buf.writeln('DURATION:PT5M');
          buf.writeln('SUMMARY:${_prayerNames[p]}');
          buf.writeln('DESCRIPTION:${_prayerNames[p]} prayer time for ${city.name}');
          buf.writeln('LOCATION:${city.name}, ${city.country}');
          buf.writeln('CATEGORIES:Prayer');
          buf.writeln('STATUS:CONFIRMED');
          buf.writeln('TRANSP:TRANSPARENT');

          // Alarm 10 minutes before
          buf.writeln('BEGIN:VALARM');
          buf.writeln('TRIGGER:-PT10M');
          buf.writeln('ACTION:DISPLAY');
          buf.writeln('DESCRIPTION:${_prayerNames[p]} in 10 minutes');
          buf.writeln('END:VALARM');

          buf.writeln('END:VEVENT');
        }
      }
    }

    buf.writeln('END:VCALENDAR');
    return buf.toString();
  }

  /// Build a minimal VTIMEZONE component.
  static String _buildVTimezone(String timezone) {
    // For UTC-style zones, use a fixed offset VTIMEZONE.
    if (timezone.startsWith('UTC')) {
      final offsetStr = _utcToIcalOffset(timezone);
      return '''BEGIN:VTIMEZONE
TZID:$timezone
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:$offsetStr
TZOFFSETTO:$offsetStr
TZNAME:$timezone
END:STANDARD
END:VTIMEZONE''';
    }

    // For IANA zones, produce a basic VTIMEZONE.
    // A full DST-aware VTIMEZONE is complex; we emit a simplified one
    // and rely on the TZID reference so clients can resolve it.
    try {
      final location = tz.getLocation(timezone);
      final now = DateTime.now().toUtc();
      final tzNow = tz.TZDateTime.from(now, location);
      final offsetSec = tzNow.timeZoneOffset.inSeconds;
      final offsetStr = _secondsToIcalOffset(offsetSec);

      return '''BEGIN:VTIMEZONE
TZID:$timezone
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:$offsetStr
TZOFFSETTO:$offsetStr
TZNAME:${tzNow.timeZoneName}
END:STANDARD
END:VTIMEZONE''';
    } catch (_) {
      return '''BEGIN:VTIMEZONE
TZID:$timezone
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:UTC
END:STANDARD
END:VTIMEZONE''';
    }
  }

  /// Convert UTC timezone string to iCal offset (e.g., "UTC+5:30" -> "+0530").
  static String _utcToIcalOffset(String timezone) {
    final rest = timezone.substring(3);
    if (rest.isEmpty) return '+0000';

    final sign = rest.startsWith('-') ? '-' : '+';
    final parts = rest.substring(1).split(':');
    final h = int.tryParse(parts[0]) ?? 0;
    final m = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;
    return '$sign${h.toString().padLeft(2, '0')}${m.toString().padLeft(2, '0')}';
  }

  /// Convert seconds offset to iCal format (e.g., 19800 -> "+0530").
  static String _secondsToIcalOffset(int seconds) {
    final sign = seconds >= 0 ? '+' : '-';
    final abs = seconds.abs();
    final h = abs ~/ 3600;
    final m = (abs % 3600) ~/ 60;
    return '$sign${h.toString().padLeft(2, '0')}${m.toString().padLeft(2, '0')}';
  }

  /// Convert fractional hours to a DateTime on the given date.
  static DateTime _fractionalHoursToDateTime(
    int year, int month, int day, double hours,
  ) {
    final total = hours % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    return DateTime(year, month, day, hh, mm);
  }

  /// Format a UTC DateTime as iCal timestamp: "YYYYMMDDTHHmmSSZ".
  static String _formatDtUtc(DateTime dt) {
    return '${dt.year}'
        '${dt.month.toString().padLeft(2, '0')}'
        '${dt.day.toString().padLeft(2, '0')}'
        'T'
        '${dt.hour.toString().padLeft(2, '0')}'
        '${dt.minute.toString().padLeft(2, '0')}'
        '${dt.second.toString().padLeft(2, '0')}'
        'Z';
  }

  /// Format a local DateTime as iCal timestamp: "YYYYMMDDTHHMMSS".
  static String _formatDtLocal(DateTime dt) {
    return '${dt.year}'
        '${dt.month.toString().padLeft(2, '0')}'
        '${dt.day.toString().padLeft(2, '0')}'
        'T'
        '${dt.hour.toString().padLeft(2, '0')}'
        '${dt.minute.toString().padLeft(2, '0')}'
        '00';
  }

  /// Number of days in a month.
  static int _daysInMonth(int year, int month) {
    if (month == 12) return DateTime(year + 1, 1, 0).day;
    return DateTime(year, month + 1, 0).day;
  }

  /// DST-aware UTC offset from IANA timezone string.
  static double _utcOffset(String timezone, DateTime date) {
    if (timezone.startsWith('UTC')) {
      final rest = timezone.substring(3);
      if (rest.isEmpty) return 0.0;
      final sign = rest.startsWith('-') ? -1.0 : 1.0;
      final parts = rest.substring(1).split(':');
      final h = double.tryParse(parts[0]) ?? 0.0;
      final m =
          parts.length > 1 ? (double.tryParse(parts[1]) ?? 0.0) / 60.0 : 0.0;
      return sign * (h + m);
    }
    try {
      final location = tz.getLocation(timezone);
      final tzTime = tz.TZDateTime.from(date, location);
      return tzTime.timeZoneOffset.inSeconds / 3600.0;
    } catch (_) {
      return 0.0;
    }
  }
}
