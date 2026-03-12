// Stream mode overlay widgets
//
// Two overlays appear in the YouTube player's letterbox black bars:
//   TvStreamAyahBar    — top bar: cycles Quranic ayahs every 2.5 min with crossfade
//   TvStreamRamadanBar — bottom card: Ramadan day + moon + Suhoor/Iftar + live countdown

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hijri/hijri_calendar.dart';

import '../../core/providers/ramadan_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';
import 'tv_ayah_of_hour.dart';

// ─── Cycling ayah bar ─────────────────────────────────────────────────────────

/// Shows a compact Quranic ayah in the top black bar of the stream player.
/// Cycles through all 24 hour-slots every 2.5 minutes with a crossfade.
class TvStreamAyahBar extends StatefulWidget {
  const TvStreamAyahBar({super.key});

  @override
  State<TvStreamAyahBar> createState() => _TvStreamAyahBarState();
}

class _TvStreamAyahBarState extends State<TvStreamAyahBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _fade;
  late Animation<double> _opacity;
  Timer? _cycleTimer;
  int _slot = DateTime.now().hour;

  static const _cycleDuration = Duration(minutes: 2, seconds: 30);
  static const _fadeDuration = Duration(milliseconds: 700);

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(vsync: this, duration: _fadeDuration);
    _opacity = CurvedAnimation(parent: _fade, curve: Curves.easeInOut);
    _fade.forward();
    _cycleTimer = Timer.periodic(_cycleDuration, (_) => _cycle());
  }

  void _cycle() {
    _fade.reverse().then((_) {
      if (!mounted) return;
      setState(() => _slot = (_slot + 1) % 24);
      _fade.forward();
    });
  }

  @override
  void dispose() {
    _cycleTimer?.cancel();
    _fade.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              PrayCalcColors.deep.withValues(alpha: 0.82),
              PrayCalcColors.deep.withValues(alpha: 0.55),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: PrayCalcColors.mid.withValues(alpha: 0.4),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: PrayCalcColors.dark.withValues(alpha: 0.5),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: TvAyahOfHour(hour: _slot, compact: true),
      ),
    );
  }
}

// ─── Ramadan bottom card ──────────────────────────────────────────────────────

/// Full-width premium Ramadan card for stream mode.
/// Self-computes the Suhoor/Iftar countdown with its own 1-second timer.
class TvStreamRamadanBar extends StatefulWidget {
  const TvStreamRamadanBar({
    super.key,
    required this.ramadan,
    required this.suhoorTime,
    required this.iftarTime,
    required this.nowH,
    required this.fajrH,
    required this.maghribH,
    required this.now,
  });

  final RamadanState ramadan;
  final String suhoorTime;
  final String iftarTime;
  final double nowH;
  final double fajrH;
  final double maghribH;
  final DateTime now;

  @override
  State<TvStreamRamadanBar> createState() => _TvStreamRamadanBarState();
}

class _TvStreamRamadanBarState extends State<TvStreamRamadanBar> {
  Timer? _timer;
  late String _countdown;
  late String _label;

  @override
  void initState() {
    super.initState();
    _updateCountdown();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(_updateCountdown);
    });
  }

  void _updateCountdown() {
    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;
    double targetH;
    String label;

    if (nowH < widget.fajrH) {
      targetH = widget.fajrH;
      label = 'Until Suhoor ends';
    } else if (nowH < widget.maghribH) {
      targetH = widget.maghribH;
      label = 'Until Iftar';
    } else {
      // After Maghrib — count to tomorrow's Fajr
      targetH = widget.fajrH + 24.0;
      label = 'Until Fajr';
    }

    double diff = targetH - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    _countdown = '${hh.toString().padLeft(2, '0')}:'
        '${mm.toString().padLeft(2, '0')}:'
        '${ss.toString().padLeft(2, '0')}';
    _label = label;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ramadan = widget.ramadan;
    final moonUrl = MoonPhase.cycleMonthUrl(widget.now);
    final isQadr = ramadan.isLaylatulQadr;
    final borderColor = isQadr
        ? const Color(0xFFE8D5A3)
        : PrayCalcColors.mid;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            PrayCalcColors.deep.withValues(alpha: 0.95),
            const Color(0xFF0A1F10).withValues(alpha: 0.92),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: borderColor.withValues(alpha: isQadr ? 0.7 : 0.45),
          width: isQadr ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: PrayCalcColors.dark.withValues(alpha: 0.6),
            blurRadius: 24,
            spreadRadius: 4,
          ),
          if (isQadr)
            BoxShadow(
              color: const Color(0xFFE8D5A3).withValues(alpha: 0.12),
              blurRadius: 40,
              spreadRadius: 8,
            ),
        ],
      ),
      child: Row(
        children: [
          // Moon image
          ClipOval(
            child: Image.network(
              moonUrl,
              width: 56,
              height: 56,
              fit: BoxFit.cover,
              errorBuilder: (_, _, e) => Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: PrayCalcColors.dark.withValues(alpha: 0.6),
                ),
                child: const Icon(Icons.nightlight_round,
                    color: Color(0xFFE8D5A3), size: 32),
              ),
            ),
          ),
          const SizedBox(width: 16),

          // Day + badges
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ramadan',
                style: TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1.2,
                ),
              ),
              Text(
                'Day ${ramadan.hDay}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  height: 1.1,
                ),
              ),
              if (isQadr)
                _Pill('Laylatul Qadr', const Color(0xFFE8D5A3))
              else if (ramadan.isLastTenNights)
                _Pill('Last 10 Nights', PrayCalcColors.light),
            ],
          ),

          const SizedBox(width: 24),
          _vDivider(),
          const SizedBox(width: 24),

          // Suhoor / Iftar times
          _TimeBlock(
            icon: Icons.brightness_3,
            label: 'Suhoor',
            arabic: 'السحور',
            time: widget.suhoorTime,
            color: const Color(0xFF8BA7D4),
          ),
          const SizedBox(width: 20),
          _TimeBlock(
            icon: Icons.wb_twilight,
            label: 'Iftar',
            arabic: 'الإفطار',
            time: widget.iftarTime,
            color: const Color(0xFFE8A050),
          ),

          const Spacer(),
          _vDivider(),
          const SizedBox(width: 24),

          // Live countdown
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _label,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withValues(alpha: 0.5),
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _countdown,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.w200,
                  letterSpacing: 2,
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _vDivider() => Container(
        width: 1,
        height: 50,
        color: Colors.white.withValues(alpha: 0.12),
      );
}

// ─── Always-present context bar ───────────────────────────────────────────────
//
// Shows next-prayer countdown outside Ramadan.
// In Ramadan: shows moon/day badge + contextual countdown (Suhoor/Iftar/Fajr).

class TvStreamContextBar extends StatefulWidget {
  const TvStreamContextBar({
    super.key,
    required this.isRamadan,
    required this.ramadan,
    required this.nextPrayerName,
    required this.nextPrayerH,
    required this.suhoorTime,
    required this.iftarTime,
    required this.fajrH,
    required this.maghribH,
    required this.now,
  });

  final bool isRamadan;
  final RamadanState ramadan;
  final String nextPrayerName;
  final double nextPrayerH;
  final String suhoorTime;
  final String iftarTime;
  final double fajrH;
  final double maghribH;
  final DateTime now;

  @override
  State<TvStreamContextBar> createState() => _TvStreamContextBarState();
}

class _TvStreamContextBarState extends State<TvStreamContextBar> {
  Timer? _timer;
  late String _countdown;
  late String _countdownLabel;

  @override
  void initState() {
    super.initState();
    _update();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(_update);
    });
  }

  void _update() {
    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

    // Label is always "Next prayer" based.
    // Ramadan special cases: Fajr → "Suhoor Ends In", Maghrib → "Iftar Is In".
    final nextName = widget.nextPrayerName;
    if (widget.isRamadan && nextName == 'Fajr') {
      _countdownLabel = 'Suhoor Ends In';
    } else if (widget.isRamadan && nextName == 'Maghrib') {
      _countdownLabel = 'Iftar Is In';
    } else {
      _countdownLabel = '$nextName Is In';
    }
    double diff = widget.nextPrayerH - nowH;
    if (diff < 0) diff += 24;
    _countdown = _fmt((diff * 3600).round());
  }

  String _fmt(int sec) {
    if (sec < 0) sec = 0;
    final h = sec ~/ 3600;
    final m = (sec % 3600) ~/ 60;
    final s = sec % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  /// Returns a special-day label for the given Hijri date, or null if none.
  static String? _specialDay(int hMonth, int hDay) {
    // Muharram
    if (hMonth == 1 && hDay == 10) return 'Ashura';
    // Sha'ban
    if (hMonth == 8 && hDay == 15) return "Laylat al-Nisf";
    // Dhul Hijjah
    if (hMonth == 12) {
      if (hDay == 9) return 'Day of Arafah';
      if (hDay == 10) return 'Eid al-Adha';
      if (hDay >= 11 && hDay <= 13) return 'Days of Tashreeq';
      if (hDay >= 1 && hDay <= 8) return 'Best 10 Days';
    }
    // Shawwal
    if (hMonth == 10 && hDay == 1) return 'Eid al-Fitr';
    return null;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Hijri date
    String hijriStr = '';
    String? specialDay;
    try {
      final hj = HijriCalendar.fromDate(widget.now);
      const months = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      hijriStr = '${hj.hDay} ${months[hj.hMonth - 1]} ${hj.hYear}';
      // In Ramadan, special day tags come from ramadan state.
      if (widget.isRamadan) {
        if (widget.ramadan.isLaylatulQadr) {
          specialDay = 'Laylatul Qadr';
        } else if (widget.ramadan.isLastTenNights) {
          specialDay = 'Last 10 Nights';
        }
      } else {
        specialDay = _specialDay(hj.hMonth, hj.hDay);
      }
    } catch (_) {}

    final isQadr = widget.isRamadan && widget.ramadan.isLaylatulQadr;
    final borderColor =
        isQadr ? const Color(0xFFE8D5A3) : PrayCalcColors.mid;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            PrayCalcColors.deep.withValues(alpha: 0.95),
            const Color(0xFF0A1F10).withValues(alpha: 0.92),
          ],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: borderColor.withValues(alpha: isQadr ? 0.7 : 0.35),
          width: isQadr ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: PrayCalcColors.dark.withValues(alpha: 0.5),
            blurRadius: 20,
            spreadRadius: 2,
          ),
          if (isQadr)
            BoxShadow(
              color: const Color(0xFFE8D5A3).withValues(alpha: 0.10),
              blurRadius: 36,
              spreadRadius: 6,
            ),
        ],
      ),
      child: Row(
        children: [
          // ── LEFT: Hijri date + special day badge ──────────────────────────
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'HIJRI',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.4),
                  fontSize: 9,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                hijriStr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
              if (specialDay != null) ...[
                const SizedBox(height: 4),
                _SpecialBadge(
                  label: specialDay,
                  color: isQadr
                      ? const Color(0xFFE8D5A3)
                      : PrayCalcColors.light,
                ),
              ],
            ],
          ),

          const SizedBox(width: 16),
          _VDivider(),
          const SizedBox(width: 16),

          // ── MIDDLE: Ramadan progress bar (Ramadan only) ───────────────────
          if (widget.isRamadan)
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'RAMADAN DAY ${widget.ramadan.hDay}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.55),
                          fontSize: 10,
                          letterSpacing: 1.1,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${30 - widget.ramadan.hDay} days left',
                        style: TextStyle(
                          color: PrayCalcColors.light.withValues(alpha: 0.7),
                          fontSize: 10,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (widget.ramadan.hDay / 30).clamp(0.0, 1.0),
                      backgroundColor:
                          Colors.white.withValues(alpha: 0.12),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isQadr
                            ? const Color(0xFFE8D5A3)
                            : PrayCalcColors.light,
                      ),
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            )
          else
            const Spacer(),

          const SizedBox(width: 16),
          _VDivider(),
          const SizedBox(width: 16),

          // ── RIGHT: countdown ──────────────────────────────────────────────
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _countdownLabel.toUpperCase(),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.45),
                  fontSize: 9,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                _countdown,
                style: TextStyle(
                  color: isQadr
                      ? const Color(0xFFE8D5A3)
                      : Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w200,
                  letterSpacing: 2,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
              if (!widget.isRamadan)
                Text(
                  widget.nextPrayerName,
                  style: TextStyle(
                    color: PrayCalcColors.light.withValues(alpha: 0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SpecialBadge extends StatelessWidget {
  const _SpecialBadge({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.5), width: 1),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 10,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.3,
          ),
        ),
      );
}


class _VDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
        width: 1,
        height: 44,
        color: Colors.white.withValues(alpha: 0.12),
      );
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _Pill extends StatelessWidget {
  const _Pill(this.label, this.color);
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.5)),
        ),
        child: Text(
          label,
          style: TextStyle(
              fontSize: 10, color: color, fontWeight: FontWeight.w600),
        ),
      );
}

class _TimeBlock extends StatelessWidget {
  const _TimeBlock({
    required this.icon,
    required this.label,
    required this.arabic,
    required this.time,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String arabic;
  final String time;
  final Color color;

  @override
  Widget build(BuildContext context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 12, color: color),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            arabic,
            style: TextStyle(
              fontFamily: 'Amiri',
              fontSize: 13,
              color: color.withValues(alpha: 0.8),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            time,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w600,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
        ],
      );
}
