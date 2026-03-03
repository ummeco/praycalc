import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/models/settings_model.dart';

// ─── Public API ───────────────────────────────────────────────────────────────

/// Renders the prayer times card off-screen, captures at 3× (1080×1350 px),
/// and shares it via the platform share sheet.
Future<void> sharePrayerCard({
  required BuildContext context,
  required City city,
  required PrayerTimes times,
  required AppSettings settings,
}) async {
  final key = GlobalKey();
  final entry = OverlayEntry(
    builder: (_) => Positioned(
      left: -4000,
      top: -4000,
      child: RepaintBoundary(
        key: key,
        child: SizedBox(
          width: 360,
          height: 450,
          child: _PrayerCardContent(city: city, times: times, settings: settings),
        ),
      ),
    ),
  );

  Overlay.of(context).insert(entry);
  // Wait one frame so Flutter lays out and paints the off-screen widget.
  await Future<void>.delayed(const Duration(milliseconds: 80));

  try {
    final boundary =
        key.currentContext!.findRenderObject() as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 3.0);
    final data = await image.toByteData(format: ui.ImageByteFormat.png);
    if (data == null) return;

    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/praycalc_share.png');
    await file.writeAsBytes(data.buffer.asUint8List());

    await SharePlus.instance.share(
      ShareParams(
        files: [XFile(file.path, mimeType: 'image/png')],
        subject: 'Prayer times — ${city.displayName}',
      ),
    );
  } finally {
    entry.remove();
  }
}

// ─── Card widget ──────────────────────────────────────────────────────────────

class _PrayerCardContent extends StatelessWidget {
  const _PrayerCardContent({
    required this.city,
    required this.times,
    required this.settings,
  });

  final City city;
  final PrayerTimes times;
  final AppSettings settings;

  @override
  Widget build(BuildContext context) {
    final hijri = HijriCalendar.fromDate(DateTime.now());
    final now = DateTime.now();

    return Container(
      width: 360,
      height: 450,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF1E5E2F), Color(0xFF0D2F17)],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Header: brand
            Text(
              'PrayCalc',
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            // City
            Text(
              city.displayName,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            // Date
            Text(
              '${_gregDate(now)}  ·  ${_hijriDate(hijri)}',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 16),
            const Divider(color: Colors.white24, height: 1),
            const SizedBox(height: 14),
            // Prayer rows
            ..._prayerRows(settings.use24h),
            const Spacer(),
            const Divider(color: Colors.white24, height: 1),
            const SizedBox(height: 8),
            Text(
              'praycalc.com',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.45),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _prayerRows(bool use24h) {
    const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final hours = [
      times.fajr,
      times.sunrise,
      times.dhuhr,
      times.asr,
      times.maghrib,
      times.isha,
    ];

    return List.generate(prayerNames.length, (i) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              prayerNames[i],
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              _fmtT(hours[i], use24h),
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    });
  }

  String _gregDate(DateTime d) {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${d.day} ${months[d.month]} ${d.year}';
  }

  String _hijriDate(HijriCalendar h) {
    const months = [
      '', 'Muharram', 'Safar', "Rabi' I", "Rabi' II",
      'Jumada I', 'Jumada II', 'Rajab', "Sha'ban",
      'Ramadan', 'Shawwal', "Dhu'l-Qi'dah", "Dhu'l-Hijjah",
    ];
    return '${h.hDay} ${months[h.hMonth]} ${h.hYear} AH';
  }

  String _fmtT(double h, bool use24h) {
    if (!h.isFinite) return '--:--';
    final total = h % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh < 12 ? 'AM' : 'PM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}
