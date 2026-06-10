// ShareAgendaSheet — bottom sheet for sharing today's prayer times.
//
// Two options:
//   1. Share as Text — formatted prayer times via share_plus
//   2. Share QR Code  — QrImageView encoding a praycalc.com deep link

import 'package:flutter/material.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/services/locale_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/models/settings_model.dart';

/// Show the share agenda bottom sheet.
void showShareAgendaSheet({
  required BuildContext context,
  required City city,
  required PrayerTimes times,
  required AppSettings settings,
}) {
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: const Color(0xFF0D2010),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => ShareAgendaSheet(
      city: city,
      times: times,
      settings: settings,
    ),
  );
}

class ShareAgendaSheet extends StatelessWidget {
  const ShareAgendaSheet({
    super.key,
    required this.city,
    required this.times,
    required this.settings,
  });

  final City city;
  final PrayerTimes times;
  final AppSettings settings;

  // T38: delegate to LocaleService.formatPrayerTime
  String _fmtH(double h) {
    if (!h.isFinite) return '--:--';
    final total = h % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    final now = DateTime.now();
    final t = DateTime(now.year, now.month, now.day, hh, mm);
    return LocaleService.instance.formatPrayerTime(t);
  }

  String get _previewText {
    final now = DateTime.now();
    final date = '${now.day}/${now.month}/${now.year}';
    return 'Prayer Times for ${city.displayName}, $date\n'
        'Fajr: ${_fmtH(times.fajr)} · '
        'Dhuhr: ${_fmtH(times.dhuhr)} · '
        'Asr: ${_fmtH(times.asr)} · '
        'Maghrib: ${_fmtH(times.maghrib)} · '
        'Isha: ${_fmtH(times.isha)}\n'
        'via PrayCalc — praycalc.com';
  }

  String get _qrUrl {
    final now = DateTime.now();
    final date =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final lat = city.lat.toStringAsFixed(5);
    final lng = city.lng.toStringAsFixed(5);
    return 'https://praycalc.com/?lat=$lat&lng=$lng&date=$date';
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(60),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            Text(
              'Share Prayer Times',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              city.displayName,
              style: TextStyle(
                color: Colors.white.withAlpha(160),
                fontSize: 13,
              ),
            ),

            const SizedBox(height: 20),

            // Preview text card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(12),
                borderRadius: BorderRadius.circular(12),
                border:
                    Border.all(color: Colors.white.withAlpha(20), width: 1),
              ),
              child: Text(
                _previewText,
                style: TextStyle(
                  color: Colors.white.withAlpha(200),
                  fontSize: 12,
                  height: 1.6,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // QR code
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: QrImageView(
                  data: _qrUrl,
                  version: QrVersions.auto,
                  size: 140,
                  backgroundColor: Colors.white,
                ),
              ),
            ),

            const SizedBox(height: 8),

            Center(
              child: Text(
                'Scan to open in PrayCalc',
                style: TextStyle(
                  color: Colors.white.withAlpha(100),
                  fontSize: 11,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                      SharePlus.instance.share(
                        ShareParams(text: _previewText),
                      );
                    },
                    icon: const Icon(Icons.share_outlined),
                    label: const Text('Share as Text'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: PrayCalcColors.light,
                      side: BorderSide(
                          color: PrayCalcColors.mid.withAlpha(120)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
