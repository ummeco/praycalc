// P-7: Quran ayah of the hour
//
// Displays a curated Quranic ayah selected by the current hour (0–23).
// Shows the Arabic text in Amiri font, transliteration, English translation,
// and surah:ayah reference. Fades in on mount and when the hour changes.

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';

// ─── Data model ──────────────────────────────────────────────────────────────

class _Ayah {
  final int hour;
  final String arabic;
  final String transliteration;
  final String translation;
  final String reference;

  const _Ayah({
    required this.hour,
    required this.arabic,
    required this.transliteration,
    required this.translation,
    required this.reference,
  });

  factory _Ayah.fromJson(Map<String, dynamic> j) => _Ayah(
        hour: j['hour'] as int,
        arabic: j['arabic'] as String,
        transliteration: j['transliteration'] as String,
        translation: j['translation'] as String,
        reference: j['reference'] as String,
      );
}

// ─── Loader (cached after first load) ────────────────────────────────────────

List<_Ayah>? _cachedAyahs;

Future<List<_Ayah>> _loadAyahs() async {
  if (_cachedAyahs != null) return _cachedAyahs!;
  final raw = await rootBundle.loadString('assets/data/tv_ayahs.json');
  final list = (jsonDecode(raw) as List<dynamic>)
      .map((e) => _Ayah.fromJson(e as Map<String, dynamic>))
      .toList();
  _cachedAyahs = list;
  return list;
}

_Ayah? _forHour(List<_Ayah> ayahs, int hour) {
  try {
    return ayahs.firstWhere((a) => a.hour == hour);
  } catch (_) {
    return ayahs.isNotEmpty ? ayahs[hour % ayahs.length] : null;
  }
}

// ─── Widget ──────────────────────────────────────────────────────────────────

/// Displays the Quranic ayah assigned to the current [hour] (0–23).
///
/// [hour] — current local hour; changes trigger a cross-fade to the new ayah.
/// [compact] — if true, hides the transliteration row to save vertical space.
class TvAyahOfHour extends StatefulWidget {
  const TvAyahOfHour({
    super.key,
    required this.hour,
    this.compact = false,
  });

  final int hour;
  final bool compact;

  @override
  State<TvAyahOfHour> createState() => _TvAyahOfHourState();
}

class _TvAyahOfHourState extends State<TvAyahOfHour>
    with SingleTickerProviderStateMixin {
  late AnimationController _fade;
  late Animation<double> _opacity;
  List<_Ayah>? _ayahs;
  _Ayah? _current;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _opacity = CurvedAnimation(parent: _fade, curve: Curves.easeIn);
    _loadAyahs().then((list) {
      if (!mounted) return;
      setState(() {
        _ayahs = list;
        _current = _forHour(list, widget.hour);
      });
      _fade.forward();
    });
  }

  @override
  void didUpdateWidget(TvAyahOfHour old) {
    super.didUpdateWidget(old);
    if (old.hour != widget.hour && _ayahs != null) {
      _fade.reverse().then((_) {
        if (!mounted) return;
        setState(() => _current = _forHour(_ayahs!, widget.hour));
        _fade.forward();
      });
    }
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_current == null) return const SizedBox.shrink();
    return FadeTransition(
      opacity: _opacity,
      child: _AyahCard(ayah: _current!, compact: widget.compact),
    );
  }
}

// ─── Card layout ─────────────────────────────────────────────────────────────

class _AyahCard extends StatelessWidget {
  const _AyahCard({required this.ayah, required this.compact});
  final _Ayah ayah;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: PrayCalcColors.mid.withValues(alpha: 0.25),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Arabic text — Amiri, RTL
          Text(
            ayah.arabic,
            textAlign: TextAlign.center,
            textDirection: TextDirection.rtl,
            style: const TextStyle(
              fontFamily: 'Amiri',
              fontSize: 26,
              height: 1.7,
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          // Transliteration (hidden in compact mode)
          if (!compact) ...[
            Text(
              ayah.transliteration,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.5,
                color: Colors.white.withValues(alpha: 0.65),
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 8),
          ],
          // English translation
          Text(
            '"${ayah.translation}"',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              height: 1.5,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          // Reference pill
          Align(
            alignment: Alignment.center,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: PrayCalcColors.dark.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                ayah.reference,
                style: TextStyle(
                  fontSize: 12,
                  color: PrayCalcColors.light,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
