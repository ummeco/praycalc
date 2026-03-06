import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

/// Scholarly travel prayer rulings screen with citations from Quran and Hadith.
///
/// Covers Qasr (shortening), Jam' (combining), distance thresholds by madhab,
/// and duration of concession. All citations are sourced from authentic
/// collections with hadith numbers.
class TravelRulingsScreen extends StatefulWidget {
  const TravelRulingsScreen({super.key});

  @override
  State<TravelRulingsScreen> createState() => _TravelRulingsScreenState();
}

class _TravelRulingsScreenState extends State<TravelRulingsScreen> {
  bool _scholarsExpanded = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? PrayCalcColors.surface : Colors.white;
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

          // ── App Default: Hanafi ───────────────────────────────────────
          _SectionHeader(title: 'Why PrayCalc Uses the Hanafi Default'),
          const SizedBox(height: 8),
          _ContentCard(
            cardColor: cardColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'PrayCalc uses the Hanafi distance threshold of 77 km '
                  '(approximately 48 miles) by default. There are two reasons '
                  'for this choice:',
                  style: TextStyle(color: textColor, height: 1.6),
                ),
                const SizedBox(height: 12),
                _BulletPoint(
                  text: 'The Hanafi threshold is the most conservative among '
                      'the four schools. Using it avoids the possibility of '
                      'shortening prayers before the distance threshold is '
                      'reached according to any school — a safer approach for '
                      'a general-purpose app.',
                  textColor: textColor,
                ),
                _BulletPoint(
                  text: 'Distance on a map can only be measured as a straight '
                      'line (as the crow flies). Actual road distance is always '
                      'longer, so the Hanafi threshold provides a natural '
                      'buffer when travel routes are unknown.',
                  textColor: textColor,
                ),
                const SizedBox(height: 12),
                Text(
                  'If your madhab uses a different threshold, or if your '
                  'scholar has guided you otherwise, you can change the '
                  'calculation method in settings.',
                  style: TextStyle(color: subtextColor, height: 1.5),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => context.push(Routes.settings),
                  icon: const Icon(Icons.settings_outlined, size: 16),
                  label: const Text('Open Settings'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: PrayCalcColors.mid,
                    side: BorderSide(color: PrayCalcColors.mid.withAlpha(120)),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                ),
              ],
            ),
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
          const SizedBox(height: 24),

          // ── Expandable: Scholarly Discussion ──────────────────────────
          GestureDetector(
            onTap: () => setState(() => _scholarsExpanded = !_scholarsExpanded),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: PrayCalcColors.dark.withAlpha(160),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: PrayCalcColors.mid.withAlpha(60),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.library_books_outlined,
                    size: 18,
                    color: PrayCalcColors.mid,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Deeper Scholarly Discussion',
                      style: TextStyle(
                        color: PrayCalcColors.light,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  Icon(
                    _scholarsExpanded
                        ? Icons.keyboard_arrow_up_rounded
                        : Icons.keyboard_arrow_down_rounded,
                    color: PrayCalcColors.mid,
                    size: 22,
                  ),
                ],
              ),
            ),
          ),

          if (_scholarsExpanded) ...[
            const SizedBox(height: 12),

            _ContentCard(
              cardColor: cardColor,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'The Hanafi Position on Combining',
                    style: TextStyle(
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'The Hanafi school holds that combining prayers during '
                    'travel is not permitted except at Arafat (combining '
                    'Dhuhr and Asr at midday) and Muzdalifah (combining '
                    'Maghrib and Isha at night) during Hajj. This is based '
                    'on the principle that each prayer has a fixed time '
                    '(waqt), and praying outside that window requires a '
                    'strong necessity.\n\n'
                    'Ibn Mas\'ud (may Allah be pleased with him) is reported '
                    'to have said: "I never saw the Prophet \uFDFA pray a '
                    'prayer out of its time except two: he combined Maghrib '
                    'and Isha at Muzdalifah and he hastened Fajr on that day." '
                    '(Bukhari 1682)',
                    style: TextStyle(color: textColor, height: 1.6),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    "The Shafi'i, Maliki, and Hanbali Position",
                    style: TextStyle(
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "These three schools permit combining prayers whenever "
                    "a person is in a state of qualifying travel. Their "
                    "primary evidence is the hadith of Ibn 'Abbas (Muslim 705) "
                    "and the general practice of the Prophet \uFDFA on "
                    "journeys. Ibn al-Qayyim in Zad al-Ma'ad documents "
                    "that the Prophet \uFDFA regularly combined prayers when "
                    "traveling to ease hardship on the community.",
                    style: TextStyle(color: textColor, height: 1.6),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Intention and Continuity',
                    style: TextStyle(
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'All schools agree that once a traveler firmly intends '
                    'to remain in a place for the minimum settlement period '
                    '(15 days for Hanafi, 4 days for others), the concessions '
                    'end immediately — even if they have not yet prayed the '
                    'first prayer since settling. The intention, not the '
                    'physical act of unpacking, is what terminates the '
                    'traveler status.',
                    style: TextStyle(color: textColor, height: 1.6),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Imam al-Nawawi on the Wisdom of Qasr',
                    style: TextStyle(
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Imam al-Nawawi writes in al-Majmu' that Qasr is a mercy "
                    "Allah granted to travelers to remove hardship (mashaqqah). "
                    "He emphasizes that the traveler should not view it as a "
                    "deficiency in worship, but as a gift — and that refusing "
                    "the concession out of unnecessary strictness goes against "
                    "the Sunnah. The Prophet \uFDFA said: 'Allah loves that "
                    "His concessions be taken, just as He dislikes that sins "
                    "be committed.' (Ahmad, Sahih)",
                    style: TextStyle(color: textColor, height: 1.6),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),
            _HadithCitationCard(
              source: 'Sahih Bukhari',
              number: '1682',
              text: "Ibn Mas'ud: 'I never saw the Prophet \uFDFA pray a "
                  "prayer out of its time except two: he combined Maghrib "
                  "and Isha at Muzdalifah and he hastened Fajr on that day.'",
            ),
          ],

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
