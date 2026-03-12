// PrayerCardFan — fanned prayer time card layout for the home screen.
//
// 5 prayer cards arranged in a fanned stack. Tapping spreads them into a
// horizontal list; tapping a card shows its detail. Auto-collapses after 3s.
// SharedPreferences key: 'home_layout_fan' (bool, default false).

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';

// ── Prayer card data ──────────────────────────────────────────────────────────

class _PCard {
  final String label;
  final double hours;
  final bool isNext;
  _PCard({required this.label, required this.hours, required this.isNext});
}

// ── Widget ────────────────────────────────────────────────────────────────────

class PrayerCardFan extends StatefulWidget {
  const PrayerCardFan({
    super.key,
    required this.times,
    required this.use24h,
    required this.nextPrayerIndex,
  });

  final PrayerTimes times;
  final bool use24h;

  /// 0-based index of next prayer among the 5 fard prayers (Fajr=0..Isha=4).
  final int nextPrayerIndex;

  @override
  State<PrayerCardFan> createState() => _PrayerCardFanState();
}

class _PrayerCardFanState extends State<PrayerCardFan>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _spreadAnim;

  bool _isSpread = false;
  int? _selectedCard;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _spreadAnim = CurvedAnimation(
      parent: _ctrl,
      curve: Curves.elasticOut,
      reverseCurve: Curves.easeIn,
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  List<_PCard> get _cards {
    const labels = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final hours = [
      widget.times.fajr,
      widget.times.dhuhr,
      widget.times.asr,
      widget.times.maghrib,
      widget.times.isha,
    ];
    return List.generate(5, (i) => _PCard(
          label: labels[i],
          hours: hours[i],
          isNext: i == widget.nextPrayerIndex,
        ));
  }

  void _toggleSpread() {
    if (_isSpread) {
      _collapse();
    } else {
      setState(() {
        _isSpread = true;
        _selectedCard = null;
      });
      _ctrl.forward();
      _scheduleAutoCollapse();
    }
  }

  void _collapse() {
    _ctrl.reverse().then((_) {
      if (mounted) setState(() => _isSpread = false);
    });
  }

  void _scheduleAutoCollapse() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && _isSpread) _collapse();
    });
  }

  void _onCardTap(int i) {
    setState(() => _selectedCard = i);
    _scheduleAutoCollapse();
  }

  String _formatH(double h) {
    if (!h.isFinite) return '—';
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (widget.use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }

  @override
  Widget build(BuildContext context) {
    final cards = _cards;

    return GestureDetector(
      onTap: _isSpread ? null : _toggleSpread,
      child: SizedBox(
        height: 140,
        child: AnimatedBuilder(
          animation: _spreadAnim,
          builder: (context, _) {
            final spread = _spreadAnim.value;
            return Stack(
              alignment: Alignment.center,
              clipBehavior: Clip.none,
              children: List.generate(cards.length, (i) {
                final card = cards[i];
                final isSelected = _selectedCard == i;

                // Stacked angles: [-3°, -1°, 0°, +1°, +3°]
                final stackedAngles = [-3.0, -1.0, 0.0, 1.0, 3.0];
                // Spread angles: [-20°, -10°, 0°, +10°, +20°]
                final spreadAngles = [-20.0, -10.0, 0.0, 10.0, 20.0];

                final stackAngle = stackedAngles[i] * math.pi / 180;
                final spreadAngle = spreadAngles[i] * math.pi / 180;
                final angle = stackAngle + (spreadAngle - stackAngle) * spread;

                // Horizontal offset when spread
                final spreadOffsetX = (i - 2) * 70.0;
                final offsetX = spreadOffsetX * spread;

                // Elevation: selected card pops up slightly
                final offsetY = isSelected ? -8.0 : 0.0;

                return Positioned(
                  child: GestureDetector(
                    onTap: _isSpread ? () => _onCardTap(i) : null,
                    child: Transform.translate(
                      offset: Offset(offsetX, offsetY),
                      child: Transform.rotate(
                        angle: angle,
                        child: _PrayerCard(
                          label: card.label,
                          timeStr: _formatH(card.hours),
                          isNext: card.isNext,
                          isSelected: isSelected,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            );
          },
        ),
      ),
    );
  }
}

// ── Card widget ───────────────────────────────────────────────────────────────

class _PrayerCard extends StatelessWidget {
  const _PrayerCard({
    required this.label,
    required this.timeStr,
    required this.isNext,
    required this.isSelected,
  });

  final String label;
  final String timeStr;
  final bool isNext;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final bg = isNext
        ? Colors.white
        : const Color(0xFF0D2F17).withAlpha(220);
    final borderColor = isNext
        ? PrayCalcColors.light
        : Colors.white.withAlpha(40);
    final nameColor = isNext ? PrayCalcColors.dark : Colors.white.withAlpha(200);
    final timeColor = isNext ? PrayCalcColors.dark : Colors.white;

    return Container(
      width: 120,
      height: 80,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: isNext ? 2 : 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isSelected ? 80 : 40),
            blurRadius: isSelected ? 12 : 6,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: TextStyle(
              color: nameColor,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            timeStr,
            style: TextStyle(
              color: timeColor,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Settings helper ───────────────────────────────────────────────────────────

Future<bool> getPrayerCardFanEnabled() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool('home_layout_fan') ?? false;
}

Future<void> setPrayerCardFanEnabled(bool enabled) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('home_layout_fan', enabled);
}
