import 'package:flutter/material.dart';
import 'package:hijri/hijri_calendar.dart';

// ---------------------------------------------------------------------------
// TvEidOverlay — Eid al-Fitr and Eid al-Adha full-screen overlay (TV2-9.3)
// ---------------------------------------------------------------------------

/// Enum identifying which Eid is active.
enum EidType { eidAlFitr, eidAlAdha }

/// Returns the active [EidType] for [date], or null if it is not an Eid day.
///
/// Detection is based on the Hijri calendar:
/// - Eid al-Fitr: 1 Shawwal (month 10, day 1)
/// - Eid al-Adha: 10 Dhu al-Hijjah (month 12, day 10)
EidType? detectEid(DateTime date) {
  try {
    final hj = HijriCalendar.fromDate(date);
    if (hj.hMonth == 10 && hj.hDay == 1) return EidType.eidAlFitr;
    if (hj.hMonth == 12 && hj.hDay == 10) return EidType.eidAlAdha;
  } catch (_) {}
  return null;
}

/// Full-screen Eid Mubarak overlay shown on Eid al-Fitr and Eid al-Adha.
///
/// Displays the Eid greeting, a crescent + star emblem, and the Eid prayer
/// time when provided. Stack this above the home screen body.
class TvEidOverlay extends StatelessWidget {
  const TvEidOverlay({
    super.key,
    required this.eidType,
    this.eidPrayerTimeFormatted,
  });

  final EidType eidType;

  /// Formatted Eid prayer time string, e.g. "7:30 AM". Null = not shown.
  final String? eidPrayerTimeFormatted;

  String get _greeting => 'Eid Mubarak';

  String get _subTitle => eidType == EidType.eidAlFitr
      ? 'Eid al-Fitr — 1 Shawwal'
      : 'Eid al-Adha — 10 Dhu al-Hijjah';

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xCC0D1F0F),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Crescent + star emblem
            const Text(
              '☪️',
              style: TextStyle(fontSize: 96),
            ),
            const SizedBox(height: 32),

            // Main greeting
            Text(
              _greeting,
              style: const TextStyle(
                color: Color(0xFFFFD700),
                fontSize: 80,
                fontWeight: FontWeight.bold,
                letterSpacing: 3,
              ),
            ),
            const SizedBox(height: 16),

            // Eid name / date
            Text(
              _subTitle,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 32,
              ),
            ),

            // Eid prayer time
            if (eidPrayerTimeFormatted != null) ...[
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 40, vertical: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E5E2F).withAlpha(200),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFFFD700).withAlpha(120),
                    width: 1,
                  ),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Eid Prayer',
                      style: TextStyle(
                        color: Color(0xFFFFD700),
                        fontSize: 24,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      eidPrayerTimeFormatted!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        fontFeatures: [FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
