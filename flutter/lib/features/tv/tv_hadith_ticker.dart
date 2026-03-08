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

class TvHadithTicker extends StatelessWidget {
  const TvHadithTicker({super.key});

  String get _todaysHadith {
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year)).inDays;
    return _kHadith[dayOfYear % _kHadith.length];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: PrayCalcColors.deep.withAlpha(200),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          Icon(Icons.format_quote, color: PrayCalcColors.mid, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _todaysHadith,
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
    );
  }
}
