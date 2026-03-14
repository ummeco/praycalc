import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';

// ---------------------------------------------------------------------------
// P-5: TvInfoMode — 4-panel info display (weather/calendar/stats/events)
// ---------------------------------------------------------------------------
//
// Shown when the TV home screen is switched to Info mode.
// Displays 4 information panels side by side.

class TvInfoPanel {
  final String title;
  final Widget content;
  const TvInfoPanel({required this.title, required this.content});
}

class TvInfoMode extends StatelessWidget {
  const TvInfoMode({
    super.key,
    required this.dateText,
    required this.hijriText,
    required this.weatherSummary,
    required this.tempText,
    required this.weatherIcon,
    required this.stats,
    required this.announcements,
    this.fontScale = 1.0,
  });

  /// Gregorian date e.g. "Monday, 9 March 2026"
  final String dateText;

  /// Hijri date e.g. "9 Ramadan 1447"
  final String hijriText;

  /// Weather description e.g. "Partly Cloudy"
  final String weatherSummary;

  /// Temperature string e.g. "23°C"
  final String tempText;

  /// Weather icon emoji e.g. "🌤️"
  final String weatherIcon;

  /// Stats map: label → value string (shown as key-value rows)
  final Map<String, String> stats;

  /// Announcements / upcoming events list (shown in 4th panel)
  final List<String> announcements;

  final double fontScale;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _InfoPanel(
          icon: '📅',
          title: 'Calendar',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(dateText, style: _labelStyle(fontScale, Colors.white70)),
              const SizedBox(height: 8),
              Text(hijriText,
                  style: _labelStyle(fontScale, const Color(0xFFC9F27A))),
              const SizedBox(height: 16),
              _DividerLine(),
              const SizedBox(height: 12),
              Text(AppLocalizations.of(context)!.tvJumuahGreeting,
                  textDirection: TextDirection.rtl,
                  style: TextStyle(
                    fontFamily: 'Amiri',
                    fontSize: 28 * fontScale,
                    color: Colors.white.withValues(alpha: 0.6),
                  )),
            ],
          ),
        ),
        _InfoPanel(
          icon: weatherIcon,
          title: 'Weather',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(tempText,
                  style: TextStyle(
                    color: const Color(0xFFC9F27A),
                    fontSize: 48 * fontScale,
                    fontWeight: FontWeight.bold,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  )),
              const SizedBox(height: 4),
              Text(weatherSummary,
                  style: _labelStyle(fontScale, Colors.white60)),
            ],
          ),
        ),
        _InfoPanel(
          icon: '📊',
          title: 'Prayer Stats',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: stats.entries
                .map((e) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.key,
                              style: _labelStyle(fontScale, Colors.white54)),
                          Text(e.value,
                              style: _labelStyle(
                                  fontScale, const Color(0xFFC9F27A))),
                        ],
                      ),
                    ))
                .toList(),
          ),
        ),
        _InfoPanel(
          icon: '📢',
          title: 'Events',
          child: announcements.isEmpty
              ? Text('No upcoming announcements',
                  style: _labelStyle(fontScale, Colors.white38))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: announcements
                      .take(5)
                      .map((a) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('•',
                                    style: TextStyle(
                                        color: const Color(0xFFC9F27A),
                                        fontSize: 16 * fontScale)),
                                const SizedBox(width: 8),
                                Expanded(
                                    child: Text(a,
                                        style: _labelStyle(
                                            fontScale, Colors.white70))),
                              ],
                            ),
                          ))
                      .toList(),
                ),
        ),
      ],
    );
  }

  static TextStyle _labelStyle(double scale, Color color) => TextStyle(
        color: color,
        fontSize: 16 * scale,
        height: 1.4,
      );
}

class _InfoPanel extends StatelessWidget {
  const _InfoPanel({required this.icon, required this.title, required this.child});

  final String icon;
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.25),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Text(icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 6),
              Text(title,
                  style: const TextStyle(
                      color: Colors.white38,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1)),
            ]),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _DividerLine extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(height: 1, color: Colors.white.withValues(alpha: 0.1));
}
