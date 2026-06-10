import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

const _kHadith = [
  '"Actions are judged by intentions." — Bukhari',
  '"The best of you are those best in character." — Tirmidhi',
  '"None of you truly believes until he loves for his brother what he loves for himself." — Bukhari',
  '"Cleanliness is half of faith." — Muslim',
  '"The strong man is not one who wrestles well, but one who controls himself when angry." — Bukhari',
  '"Make things easy, not difficult." — Bukhari',
  '"He who does not show mercy will not be shown mercy." — Bukhari',
  '"The best prayer after the obligatory ones is the night prayer." — Muslim',
  '"Whoever believes in Allah and the Last Day should speak good or remain silent." — Bukhari',
  '"Smiling at your brother is charity." — Tirmidhi',
  '"Pay the worker before his sweat dries." — Ibn Majah',
  '"Seek knowledge from the cradle to the grave." — Ibn Abd al-Barr',
  '"The world is a prison for the believer and a paradise for the disbeliever." — Muslim',
  '"Whoever removes a worldly hardship from a believer, Allah removes hardship from him on the Day." — Muslim',
  '"Tie your camel, then put your trust in Allah." — Tirmidhi',
  '"The most beloved deeds to Allah are those done consistently, even if small." — Bukhari',
  '"Every act of goodness is charity." — Muslim',
  '"Be in this world as though you were a stranger or a traveler." — Bukhari',
  '"Allah is gentle and loves gentleness in all things." — Bukhari',
  '"Whoever conceals a Muslim\'s faults, Allah will conceal his faults on the Day." — Muslim',
];

/// The 99 Names of Allah with transliteration and English meaning.
const _kAsmaAlHusna = [
  'Ar-Rahmān — The Most Gracious',
  'Ar-Rahīm — The Most Merciful',
  'Al-Malik — The King',
  'Al-Quddūs — The Holy',
  'As-Salām — The Source of Peace',
  'Al-Muʾmin — The Guardian of Faith',
  'Al-Muhaymin — The Protector',
  'Al-ʿAzīz — The Almighty',
  'Al-Jabbār — The Compeller',
  'Al-Mutakabbir — The Supreme',
  'Al-Khāliq — The Creator',
  'Al-Bāriʾ — The Originator',
  'Al-Musawwir — The Fashioner of Forms',
  'Al-Ghaffār — The Ever-Forgiving',
  'Al-Qahhār — The Subduer',
  'Al-Wahhāb — The Bestower',
  'Ar-Razzāq — The Provider',
  'Al-Fattāh — The Opener',
  'Al-ʿAlīm — The All-Knowing',
  'Al-Qābid — The Withholder',
  'Al-Bāsit — The Extender',
  'Al-Khāfid — The Reducer',
  'Ar-Rāfiʿ — The Exalter',
  'Al-Muʿizz — The Honorer',
  'Al-Mudhill — The Humiliator of the Arrogant',
  'As-Samīʿ — The All-Hearing',
  'Al-Basīr — The All-Seeing',
  'Al-Hakam — The Judge',
  'Al-ʿAdl — The Just',
  'Al-Latīf — The Subtle One',
  'Al-Khabīr — The All-Aware',
  'Al-Halīm — The Forbearing',
  'Al-ʿAzīm — The Magnificent',
  'Al-Ghafūr — The All-Forgiving',
  'Ash-Shakūr — The Appreciative',
  'Al-ʿAlī — The Most High',
  'Al-Kabīr — The Greatest',
  'Al-Hafīz — The Preserver',
  'Al-Muqīt — The Sustainer',
  'Al-Hasīb — The Reckoner',
  'Al-Jalīl — The Majestic',
  'Al-Karīm — The Generous',
  'Ar-Raqīb — The Watchful',
  'Al-Mujīb — The Responsive',
  'Al-Wāsiʿ — The All-Encompassing',
  'Al-Hakīm — The Wise',
  'Al-Wadūd — The Loving',
  'Al-Majīd — The Glorious',
  'Al-Bāʿith — The Resurrector',
  'Ash-Shahīd — The Witness',
  'Al-Haqq — The Truth',
  'Al-Wakīl — The Trustee',
  'Al-Qawī — The Strong',
  'Al-Matīn — The Firm',
  'Al-Walī — The Protecting Friend',
  'Al-Hamīd — The Praiseworthy',
  'Al-Muhsī — The Counter',
  'Al-Mubdiʾ — The Originator',
  'Al-Muʿīd — The Restorer',
  'Al-Muhyī — The Giver of Life',
  'Al-Mumīt — The Taker of Life',
  'Al-Hayy — The Ever-Living',
  'Al-Qayyūm — The Self-Subsisting',
  'Al-Wājid — The Finder',
  'Al-Mājid — The Noble',
  'Al-Wāhid — The Unique',
  'Al-Ahad — The One',
  'As-Samad — The Eternal',
  'Al-Qādir — The Able',
  'Al-Muqtadir — The Powerful',
  'Al-Muqaddim — The Expediter',
  'Al-Muʾakhkhir — The Delayer',
  'Al-Awwal — The First',
  'Al-Ākhir — The Last',
  'Az-Zāhir — The Manifest',
  'Al-Bātin — The Hidden',
  'Al-Wālī — The Governor',
  'Al-Mutaʿālī — The Most Exalted',
  'Al-Barr — The Source of All Goodness',
  'At-Tawwāb — The Accepter of Repentance',
  'Al-Muntaqim — The Avenger',
  'Al-ʿAfuww — The Pardoner',
  'Ar-Raʾūf — The Compassionate',
  'Mālik-ul-Mulk — Owner of All Sovereignty',
  'Dhul-Jalāl — Lord of Majesty and Bounty',
  'Al-Muqsit — The Equitable',
  'Al-Jāmiʿ — The Gatherer',
  'Al-Ghanī — The Self-Sufficient',
  'Al-Mughnī — The Enricher',
  'Al-Māniʿ — The Preventer of Harm',
  'Ad-Dārr — The Distressor',
  'An-Nāfiʿ — The Propitious',
  'An-Nūr — The Light',
  'Al-Hādī — The Guide',
  'Al-Badīʿ — The Incomparable Originator',
  'Al-Bāqī — The Everlasting',
  'Al-Wārith — The Inheritor',
  'Ar-Rashīd — The Guide to the Right Path',
  'As-Sabūr — The Patient One',
];

/// Ambient ticker for the TV home screen.
///
/// Rotates every [rotationSeconds] through hadith, and optionally the 99 Names
/// of Allah. Uses minute-of-day to pick the active item so all TVs on the same
/// account show the same text at the same time.
class TvHadithTicker extends StatefulWidget {
  const TvHadithTicker({
    super.key,
    this.includeAsmaAlHusna = false,
    this.rotationSeconds = 30,
  });

  final bool includeAsmaAlHusna;
  final int rotationSeconds;

  @override
  State<TvHadithTicker> createState() => _TvHadithTickerState();
}

class _TvHadithTickerState extends State<TvHadithTicker>
    with SingleTickerProviderStateMixin {
  late Timer _timer;
  late String _current;
  late AnimationController _fade;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
      value: 1.0,
    );
    _current = _pick();
    _timer = Timer.periodic(Duration(seconds: widget.rotationSeconds), (_) {
      _fade.reverse().then((_) {
        if (mounted) {
          setState(() => _current = _pick());
          _fade.forward();
        }
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _fade.dispose();
    super.dispose();
  }

  String _pick() {
    final pool = <String>[..._kHadith];
    if (widget.includeAsmaAlHusna) pool.addAll(_kAsmaAlHusna);
    final minute = DateTime.now().difference(DateTime(2000)).inMinutes;
    return pool[minute % pool.length];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: PrayCalcColors.deep.withAlpha(200),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      alignment: Alignment.centerLeft,
      child: FadeTransition(
        opacity: _fade,
        child: Row(
          children: [
            Icon(Icons.format_quote, color: PrayCalcColors.mid, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _current,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
