// P-9: Multi-city prayer board
//
// Displays prayer times for two cities side by side. The primary city's times
// come from the parent (already computed). The secondary city's times are
// computed synchronously using pray_calc_dart with the stored lat/lng/timezone.
// Shown as a two-column comparison board.

import 'package:flutter/material.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/data/latest_10y.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

import '../../core/theme/app_theme.dart';

bool _tzInit = false;

void _ensureTz() {
  if (_tzInit) return;
  tz_data.initializeTimeZones();
  _tzInit = true;
}

double _utcOffset(String timezone, DateTime date) {
  if (timezone.startsWith('UTC')) {
    final rest = timezone.substring(3);
    if (rest.isEmpty) return 0;
    return double.tryParse(rest) ?? 0;
  }
  try {
    _ensureTz();
    final loc = tz.getLocation(timezone);
    final dt = tz.TZDateTime.from(date, loc);
    return dt.timeZoneOffset.inMinutes / 60.0;
  } catch (e) {
    return 0;
  }
}

// ─── Prayer row data ─────────────────────────────────────────────────────────

const _kPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

double _extractH(PrayerTimes t, String name) => switch (name) {
      'Fajr' => t.fajr,
      'Dhuhr' => t.dhuhr,
      'Asr' => t.asr,
      'Maghrib' => t.maghrib,
      'Isha' => t.isha,
      _ => double.nan,
    };

// ─── Widget ──────────────────────────────────────────────────────────────────

/// Two-city prayer time comparison board.
///
/// [primaryLabel]   — display name for the primary city.
/// [primaryTimes]   — pre-computed prayer times for the primary city.
/// [secondaryLabel] — display name for the second city.
/// [secondaryLat/Lng/TimeZone] — coordinates + timezone for on-the-fly computation.
/// [use24h]         — format toggle.
/// [activeIdx]      — index in `_kPrayers` of the currently active prayer (highlights row).
class TvMultiCityBoard extends StatelessWidget {
  const TvMultiCityBoard({
    super.key,
    required this.primaryLabel,
    required this.primaryTimes,
    required this.secondaryLabel,
    required this.secondaryLat,
    required this.secondaryLng,
    required this.secondaryTimeZone,
    required this.use24h,
    this.activeIdx = -1,
    this.isRamadan = false,
  });

  final String primaryLabel;
  final PrayerTimes primaryTimes;
  final String secondaryLabel;
  final double secondaryLat;
  final double secondaryLng;
  final String secondaryTimeZone;
  final bool use24h;
  final int activeIdx;
  final bool isRamadan;

  PrayerTimes? _computeSecondary() {
    try {
      _ensureTz();
      final now = DateTime.now();
      final date = DateTime.utc(now.year, now.month, now.day, 12);
      final offset = _utcOffset(secondaryTimeZone, date);
      return getTimes(date, secondaryLat, secondaryLng, offset);
    } catch (e) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final secondaryTimes = _computeSecondary();

    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: PrayCalcColors.mid.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header row
          _HeaderRow(
            primaryLabel: primaryLabel,
            secondaryLabel: secondaryLabel,
          ),
          const Divider(height: 1, color: Colors.white12),
          // Prayer rows
          ...List.generate(_kPrayers.length, (i) {
            final prayer = _kPrayers[i];
            final isActive = i == activeIdx;
            final primaryH = _extractH(primaryTimes, prayer);
            final secondaryH = secondaryTimes != null
                ? _extractH(secondaryTimes, prayer)
                : double.nan;
            String label = prayer;
            if (isRamadan && prayer == 'Fajr') label = 'Suhoor';
            if (isRamadan && prayer == 'Maghrib') label = 'Iftar';
            return _PrayerRow(
              label: label,
              primaryTime: _fmt(primaryH, use24h),
              secondaryTime: _fmt(secondaryH, use24h),
              isActive: isActive,
            );
          }),
        ],
      ),
    );
  }

  String _fmt(double h, bool use24h) {
    if (!h.isFinite) return '--:--';
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}

// ─── Sub-widgets ─────────────────────────────────────────────────────────────

class _HeaderRow extends StatelessWidget {
  const _HeaderRow({
    required this.primaryLabel,
    required this.secondaryLabel,
  });

  final String primaryLabel;
  final String secondaryLabel;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          const SizedBox(width: 80), // prayer label column
          Expanded(
            child: Text(
              primaryLabel,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ),
          Expanded(
            child: Text(
              secondaryLabel,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: PrayCalcColors.mid,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PrayerRow extends StatelessWidget {
  const _PrayerRow({
    required this.label,
    required this.primaryTime,
    required this.secondaryTime,
    required this.isActive,
  });

  final String label;
  final String primaryTime;
  final String secondaryTime;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    final bg = isActive
        ? PrayCalcColors.dark.withValues(alpha: 0.6)
        : Colors.transparent;

    return Container(
      color: bg,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: TextStyle(
                color: isActive ? PrayCalcColors.light : Colors.white60,
                fontSize: 16,
                fontWeight:
                    isActive ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
          Expanded(
            child: Text(
              primaryTime,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white70,
                fontSize: 20,
                fontWeight:
                    isActive ? FontWeight.bold : FontWeight.normal,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
          Expanded(
            child: Text(
              secondaryTime,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isActive
                    ? PrayCalcColors.mid
                    : Colors.white.withValues(alpha: 0.45),
                fontSize: 20,
                fontWeight: FontWeight.normal,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
