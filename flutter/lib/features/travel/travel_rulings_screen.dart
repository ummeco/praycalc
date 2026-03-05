import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Scholarly travel prayer rulings screen with citations from Quran and Hadith.
///
/// Covers Qasr (shortening), Jam' (combining), distance thresholds by madhab,
/// and duration of concession. All citations are sourced from authentic
/// collections with hadith numbers.
class TravelRulingsScreen extends StatelessWidget {
  const TravelRulingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark
        ? PrayCalcColors.surface
        : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A2E1A);
    final subtextColor = textColor.withAlpha(160);

    return Scaffold(
      appBar: AppBar(title: const Text('Travel & Prayer')),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        children: [
          // ── Introduction ──────────────────────────────────────────────
          Text(
            'Islamic rulings on prayer while traveling, with scholarly '
            'references from the Quran and authentic Hadith collections.',
            style: TextStyle(fontSize: 15, color: subtextColor, height: 1.5),
          ),
          const SizedBox(height: 24),

          // ── Section 1: When Does Travel Apply? ────────────────────────
          _SectionHeader(title: 'When Does Travel Apply?'),
          const SizedBox(height: 8),
          _ContentCard(
            cardColor: cardColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'The concessions for travelers begin once you depart your '
                  'city and travel beyond the minimum distance threshold. '
                  'Scholars differ on the exact distance:',
                  style: TextStyle(color: textColor, height: 1.6),
                ),
                const SizedBox(height: 12),
                _BulletPoint(
                  text: 'Hanafi: approximately 77 km (48 miles)',
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: "Shafi'i and Hanbali: approximately 80 km (50 miles)",
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: 'Maliki: any distance considered customary travel',
                  textColor: textColor,
                ),
                const SizedBox(height: 12),
                Text(
                  'PrayCalc uses the Hanafi threshold of 77 km by default. '
                  'All four schools agree that air travel, road travel, and '
                  'sea travel qualify equally.',
                  style: TextStyle(color: subtextColor, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Section 2: Shortening Prayers (Qasr) ──────────────────────
          _SectionHeader(title: 'Shortening Prayers (Qasr)'),
          const SizedBox(height: 8),
          _QuranCitationCard(
            surah: "An-Nisa' 4:101",
            text: '"And when you travel in the land, there is no sin on you '
                'if you shorten the prayer, if you fear that those who '
                'disbelieve may put you in trial."',
          ),
          const SizedBox(height: 12),
          _ContentCard(
            cardColor: cardColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'When traveling, the four-rakat prayers are reduced to two:',
                  style: TextStyle(color: textColor, height: 1.6),
                ),
                const SizedBox(height: 12),
                _BulletPoint(
                  text: 'Dhuhr: 4 rakat shortened to 2',
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: 'Asr: 4 rakat shortened to 2',
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: 'Isha: 4 rakat shortened to 2',
                  textColor: textColor,
                ),
                const SizedBox(height: 12),
                Text(
                  'Fajr (2 rakat) and Maghrib (3 rakat) remain unchanged '
                  'during travel. The Sunnah prayers (nawafil) before and '
                  'after the obligatory prayers may be omitted while '
                  'traveling, except for the Fajr Sunnah and Witr.',
                  style: TextStyle(color: subtextColor, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _HadithCitationCard(
            source: 'Sahih Bukhari',
            number: '1102',
            text: "The Prophet \uFDFA would shorten the prayer while "
                "traveling, praying two rakat for Dhuhr, Asr, and Isha.",
          ),
          const SizedBox(height: 24),

          // ── Section 3: Combining Prayers (Jam') ───────────────────────
          _SectionHeader(title: "Combining Prayers (Jam')"),
          const SizedBox(height: 8),
          _ContentCard(
            cardColor: cardColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "During travel, prayers may be combined in two ways:",
                  style: TextStyle(color: textColor, height: 1.6),
                ),
                const SizedBox(height: 12),
                _BulletPoint(
                  text: "Jam' Taqdim (combining early): pray Dhuhr and Asr "
                      "together at Dhuhr time, or Maghrib and Isha together "
                      "at Maghrib time.",
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: "Jam' Ta'khir (combining late): delay Dhuhr to Asr "
                      "time and pray them together, or delay Maghrib to Isha "
                      "time and pray them together.",
                  textColor: textColor,
                ),
                const SizedBox(height: 12),
                Text(
                  "Fajr is never combined with another prayer. The Hanafi "
                  "school permits combining only at Arafat and Muzdalifah "
                  "during Hajj, while the other three schools permit it "
                  "for any qualifying travel.",
                  style: TextStyle(color: subtextColor, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _HadithCitationCard(
            source: 'Sahih Muslim',
            number: '705',
            text: "Ibn 'Abbas reported that the Messenger of Allah \uFDFA "
                "combined Dhuhr and Asr, and Maghrib and Isha, while "
                "traveling.",
          ),
          const SizedBox(height: 8),
          _HadithCitationCard(
            source: 'Sahih Muslim',
            number: '686',
            text: "The Prophet \uFDFA used to combine Dhuhr and Asr, and "
                "Maghrib and Isha while traveling.",
          ),
          const SizedBox(height: 24),

          // ── Section 4: Duration of Travel ─────────────────────────────
          _SectionHeader(title: 'Duration of Travel'),
          const SizedBox(height: 8),
          _ContentCard(
            cardColor: cardColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'The travel concession ends when you return home or settle '
                  'in a location with the intention to stay. Scholars differ '
                  'on when a traveler must resume full prayers:',
                  style: TextStyle(color: textColor, height: 1.6),
                ),
                const SizedBox(height: 12),
                _BulletPoint(
                  text: 'Hanafi: 15 days or more of intended stay',
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: "Shafi'i and Maliki: 4 days of intended stay "
                      "(excluding arrival and departure days)",
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: 'Hanbali: more than 4 days of intended stay',
                  textColor: textColor,
                ),
                const SizedBox(height: 12),
                Text(
                  'If you are unsure how long you will stay, you may '
                  'continue shortening prayers until you make a firm '
                  'decision to settle. Most scholars recommend resuming '
                  'full prayers after 15 days as a precaution.',
                  style: TextStyle(color: subtextColor, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _HadithCitationCard(
            source: 'Sahih Bukhari',
            number: '1107',
            text: "The Prophet \uFDFA stayed in Makkah for 19 days, "
                "shortening his prayers. When we stay 19 days, we shorten; "
                "if longer, we pray in full.",
          ),
          const SizedBox(height: 24),

          // ── Section 5: Scholarly References ────────────────────────────
          _SectionHeader(title: 'Scholarly References'),
          const SizedBox(height: 8),
          _ContentCard(
            cardColor: cardColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _ReferenceRow(
                  source: "Quran, An-Nisa' 4:101",
                  description: 'Permission to shorten prayer during travel',
                  textColor: textColor,
                  subtextColor: subtextColor,
                ),
                const Divider(height: 24),
                _ReferenceRow(
                  source: 'Sahih Muslim 686',
                  description: 'Combining prayers during travel',
                  textColor: textColor,
                  subtextColor: subtextColor,
                ),
                const Divider(height: 24),
                _ReferenceRow(
                  source: 'Sahih Muslim 705',
                  description:
                      "Ibn 'Abbas on combining Dhuhr+Asr and Maghrib+Isha",
                  textColor: textColor,
                  subtextColor: subtextColor,
                ),
                const Divider(height: 24),
                _ReferenceRow(
                  source: 'Sahih Bukhari 1102',
                  description: 'Shortening prayer during travel',
                  textColor: textColor,
                  subtextColor: subtextColor,
                ),
                const Divider(height: 24),
                _ReferenceRow(
                  source: 'Sahih Bukhari 1107',
                  description: 'Duration of travel concession',
                  textColor: textColor,
                  subtextColor: subtextColor,
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ── Private helper widgets ──────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: PrayCalcColors.mid,
      ),
    );
  }
}

class _ContentCard extends StatelessWidget {
  const _ContentCard({required this.cardColor, required this.child});
  final Color cardColor;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: cardColor,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: child,
      ),
    );
  }
}

class _BulletPoint extends StatelessWidget {
  const _BulletPoint({required this.text, required this.textColor});
  final String text;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 7, right: 8),
            child: Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                color: PrayCalcColors.mid,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Expanded(
            child: Text(text, style: TextStyle(color: textColor, height: 1.5)),
          ),
        ],
      ),
    );
  }
}

/// Styled card for Quran citations with a green accent border.
class _QuranCitationCard extends StatelessWidget {
  const _QuranCitationCard({required this.surah, required this.text});
  final String surah;
  final String text;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      color: cs.primaryContainer.withAlpha(60),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: cs.primary.withAlpha(100), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.menu_book_rounded, size: 18, color: cs.primary),
                const SizedBox(width: 8),
                Text(
                  surah,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: cs.primary,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              text,
              style: TextStyle(
                fontStyle: FontStyle.italic,
                color: cs.onSurface.withAlpha(200),
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Styled card for Hadith citations.
class _HadithCitationCard extends StatelessWidget {
  const _HadithCitationCard({
    required this.source,
    required this.number,
    required this.text,
  });
  final String source;
  final String number;
  final String text;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? PrayCalcColors.surface : Colors.white;

    return Card(
      color: cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isDark ? Colors.white12 : Colors.black12,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.format_quote_rounded, size: 18, color: PrayCalcColors.mid),
                const SizedBox(width: 8),
                Text(
                  '$source $number',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: PrayCalcColors.mid,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              text,
              style: TextStyle(
                fontStyle: FontStyle.italic,
                color: isDark ? Colors.white70 : const Color(0xFF3A3A3A),
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReferenceRow extends StatelessWidget {
  const _ReferenceRow({
    required this.source,
    required this.description,
    required this.textColor,
    required this.subtextColor,
  });
  final String source;
  final String description;
  final Color textColor;
  final Color subtextColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          source,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: textColor,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          description,
          style: TextStyle(color: subtextColor, fontSize: 13),
        ),
      ],
    );
  }
}
