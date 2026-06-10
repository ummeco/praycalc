import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ---------------------------------------------------------------------------
// Surah data
// ---------------------------------------------------------------------------

@immutable
class _SurahInfo {
  final int number;
  final String nameArabic;
  final String nameEnglish;
  final int totalAyahs;

  const _SurahInfo(
      this.number, this.nameArabic, this.nameEnglish, this.totalAyahs);
}

const List<_SurahInfo> _kSurahs = [
  _SurahInfo(1, 'الفاتحة', 'Al-Fatihah', 7),
  _SurahInfo(2, 'البقرة', 'Al-Baqarah', 286),
  _SurahInfo(3, 'آل عمران', 'Ali Imran', 200),
  _SurahInfo(4, 'النساء', 'An-Nisa', 176),
  _SurahInfo(5, 'المائدة', 'Al-Maidah', 120),
  _SurahInfo(6, 'الأنعام', 'Al-Anam', 165),
  _SurahInfo(7, 'الأعراف', 'Al-Araf', 206),
  _SurahInfo(8, 'الأنفال', 'Al-Anfal', 75),
  _SurahInfo(9, 'التوبة', 'At-Tawbah', 129),
  _SurahInfo(10, 'يونس', 'Yunus', 109),
  _SurahInfo(11, 'هود', 'Hud', 123),
  _SurahInfo(12, 'يوسف', 'Yusuf', 111),
  _SurahInfo(13, 'الرعد', 'Ar-Rad', 43),
  _SurahInfo(14, 'إبراهيم', 'Ibrahim', 52),
  _SurahInfo(15, 'الحجر', 'Al-Hijr', 99),
  _SurahInfo(16, 'النحل', 'An-Nahl', 128),
  _SurahInfo(17, 'الإسراء', 'Al-Isra', 111),
  _SurahInfo(18, 'الكهف', 'Al-Kahf', 110),
  _SurahInfo(19, 'مريم', 'Maryam', 98),
  _SurahInfo(20, 'طه', 'Ta-Ha', 135),
  _SurahInfo(21, 'الأنبياء', 'Al-Anbiya', 112),
  _SurahInfo(22, 'الحج', 'Al-Hajj', 78),
  _SurahInfo(23, 'المؤمنون', 'Al-Muminun', 118),
  _SurahInfo(24, 'النور', 'An-Nur', 64),
  _SurahInfo(25, 'الفرقان', 'Al-Furqan', 77),
  _SurahInfo(26, 'الشعراء', 'Ash-Shuara', 227),
  _SurahInfo(27, 'النمل', 'An-Naml', 93),
  _SurahInfo(28, 'القصص', 'Al-Qasas', 88),
  _SurahInfo(29, 'العنكبوت', 'Al-Ankabut', 69),
  _SurahInfo(30, 'الروم', 'Ar-Rum', 60),
  _SurahInfo(31, 'لقمان', 'Luqman', 34),
  _SurahInfo(32, 'السجدة', 'As-Sajdah', 30),
  _SurahInfo(33, 'الأحزاب', 'Al-Ahzab', 73),
  _SurahInfo(34, 'سبأ', 'Saba', 54),
  _SurahInfo(35, 'فاطر', 'Fatir', 45),
  _SurahInfo(36, 'يس', 'Ya-Sin', 83),
  _SurahInfo(37, 'الصافات', 'As-Saffat', 182),
  _SurahInfo(38, 'ص', 'Sad', 88),
  _SurahInfo(39, 'الزمر', 'Az-Zumar', 75),
  _SurahInfo(40, 'غافر', 'Ghafir', 85),
  _SurahInfo(41, 'فصلت', 'Fussilat', 54),
  _SurahInfo(42, 'الشورى', 'Ash-Shura', 53),
  _SurahInfo(43, 'الزخرف', 'Az-Zukhruf', 89),
  _SurahInfo(44, 'الدخان', 'Ad-Dukhan', 59),
  _SurahInfo(45, 'الجاثية', 'Al-Jathiyah', 37),
  _SurahInfo(46, 'الأحقاف', 'Al-Ahqaf', 35),
  _SurahInfo(47, 'محمد', 'Muhammad', 38),
  _SurahInfo(48, 'الفتح', 'Al-Fath', 29),
  _SurahInfo(49, 'الحجرات', 'Al-Hujurat', 18),
  _SurahInfo(50, 'ق', 'Qaf', 45),
  _SurahInfo(51, 'الذاريات', 'Adh-Dhariyat', 60),
  _SurahInfo(52, 'الطور', 'At-Tur', 49),
  _SurahInfo(53, 'النجم', 'An-Najm', 62),
  _SurahInfo(54, 'القمر', 'Al-Qamar', 55),
  _SurahInfo(55, 'الرحمن', 'Ar-Rahman', 78),
  _SurahInfo(56, 'الواقعة', 'Al-Waqiah', 96),
  _SurahInfo(57, 'الحديد', 'Al-Hadid', 29),
  _SurahInfo(58, 'المجادلة', 'Al-Mujadila', 22),
  _SurahInfo(59, 'الحشر', 'Al-Hashr', 24),
  _SurahInfo(60, 'الممتحنة', 'Al-Mumtahanah', 13),
  _SurahInfo(61, 'الصف', 'As-Saf', 14),
  _SurahInfo(62, 'الجمعة', 'Al-Jumuah', 11),
  _SurahInfo(63, 'المنافقون', 'Al-Munafiqun', 11),
  _SurahInfo(64, 'التغابن', 'At-Taghabun', 18),
  _SurahInfo(65, 'الطلاق', 'At-Talaq', 12),
  _SurahInfo(66, 'التحريم', 'At-Tahrim', 12),
  _SurahInfo(67, 'الملك', 'Al-Mulk', 30),
  _SurahInfo(68, 'القلم', 'Al-Qalam', 52),
  _SurahInfo(69, 'الحاقة', 'Al-Haqqah', 52),
  _SurahInfo(70, 'المعارج', 'Al-Maarij', 44),
  _SurahInfo(71, 'نوح', 'Nuh', 28),
  _SurahInfo(72, 'الجن', 'Al-Jinn', 28),
  _SurahInfo(73, 'المزمل', 'Al-Muzzammil', 20),
  _SurahInfo(74, 'المدثر', 'Al-Muddaththir', 56),
  _SurahInfo(75, 'القيامة', 'Al-Qiyamah', 40),
  _SurahInfo(76, 'الإنسان', 'Al-Insan', 31),
  _SurahInfo(77, 'المرسلات', 'Al-Mursalat', 50),
  _SurahInfo(78, 'النبأ', 'An-Naba', 40),
  _SurahInfo(79, 'النازعات', 'An-Naziat', 46),
  _SurahInfo(80, 'عبس', 'Abasa', 42),
  _SurahInfo(81, 'التكوير', 'At-Takwir', 29),
  _SurahInfo(82, 'الانفطار', 'Al-Infitar', 19),
  _SurahInfo(83, 'المطففين', 'Al-Mutaffifin', 36),
  _SurahInfo(84, 'الانشقاق', 'Al-Inshiqaq', 25),
  _SurahInfo(85, 'البروج', 'Al-Buruj', 22),
  _SurahInfo(86, 'الطارق', 'At-Tariq', 17),
  _SurahInfo(87, 'الأعلى', 'Al-Ala', 19),
  _SurahInfo(88, 'الغاشية', 'Al-Ghashiyah', 26),
  _SurahInfo(89, 'الفجر', 'Al-Fajr', 30),
  _SurahInfo(90, 'البلد', 'Al-Balad', 20),
  _SurahInfo(91, 'الشمس', 'Ash-Shams', 15),
  _SurahInfo(92, 'الليل', 'Al-Layl', 21),
  _SurahInfo(93, 'الضحى', 'Ad-Duha', 11),
  _SurahInfo(94, 'الشرح', 'Ash-Sharh', 8),
  _SurahInfo(95, 'التين', 'At-Tin', 8),
  _SurahInfo(96, 'العلق', 'Al-Alaq', 19),
  _SurahInfo(97, 'القدر', 'Al-Qadr', 5),
  _SurahInfo(98, 'البينة', 'Al-Bayyinah', 8),
  _SurahInfo(99, 'الزلزلة', 'Az-Zalzalah', 8),
  _SurahInfo(100, 'العاديات', 'Al-Adiyat', 11),
  _SurahInfo(101, 'القارعة', 'Al-Qariah', 11),
  _SurahInfo(102, 'التكاثر', 'At-Takathur', 8),
  _SurahInfo(103, 'العصر', 'Al-Asr', 3),
  _SurahInfo(104, 'الهمزة', 'Al-Humazah', 9),
  _SurahInfo(105, 'الفيل', 'Al-Fil', 5),
  _SurahInfo(106, 'قريش', 'Quraysh', 4),
  _SurahInfo(107, 'الماعون', 'Al-Maun', 7),
  _SurahInfo(108, 'الكوثر', 'Al-Kawthar', 3),
  _SurahInfo(109, 'الكافرون', 'Al-Kafirun', 6),
  _SurahInfo(110, 'النصر', 'An-Nasr', 3),
  _SurahInfo(111, 'المسد', 'Al-Masad', 5),
  _SurahInfo(112, 'الإخلاص', 'Al-Ikhlas', 4),
  _SurahInfo(113, 'الفلق', 'Al-Falaq', 5),
  _SurahInfo(114, 'الناس', 'An-Nas', 6),
];

// ---------------------------------------------------------------------------
// TvSurahSelector
// ---------------------------------------------------------------------------

/// Full-screen D-pad navigable surah picker for TV.
///
/// Returns the selected surah number (1-based) via [Navigator.pop], or null
/// if the user pressed Back without selecting.
class TvSurahSelector extends StatefulWidget {
  const TvSurahSelector({
    super.key,
    required this.initialSurah,
    required this.onSelected,
  });

  /// 1-based surah number to highlight on open.
  final int initialSurah;

  /// Called with the 1-based surah number when the user confirms a selection.
  final ValueChanged<int> onSelected;

  @override
  State<TvSurahSelector> createState() => _TvSurahSelectorState();
}

class _TvSurahSelectorState extends State<TvSurahSelector> {
  late int _selectedIndex;
  late final ScrollController _scrollController;

  static const double _rowHeight = 64.0;
  static const Color _bgColor = Color(0xFF0D2F17);
  static const Color _accentColor = Color(0xFFC9F27A);

  @override
  void initState() {
    super.initState();
    _selectedIndex = (widget.initialSurah - 1).clamp(0, _kSurahs.length - 1);
    _scrollController = ScrollController(
      initialScrollOffset: _selectedIndex * _rowHeight,
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToSelected() {
    final offset = (_selectedIndex * _rowHeight).clamp(
      0.0,
      _scrollController.position.maxScrollExtent,
    );
    _scrollController.animateTo(
      offset,
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOut,
    );
  }

  void _moveTo(int index) {
    final clamped = index.clamp(0, _kSurahs.length - 1);
    setState(() => _selectedIndex = clamped);
    _scrollToSelected();
  }

  KeyEventResult _handleKey(KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;

    switch (event.logicalKey) {
      case LogicalKeyboardKey.arrowDown:
        _moveTo(_selectedIndex + 1);
        return KeyEventResult.handled;
      case LogicalKeyboardKey.arrowUp:
        _moveTo(_selectedIndex - 1);
        return KeyEventResult.handled;
      case LogicalKeyboardKey.arrowLeft:
        _moveTo(_selectedIndex - 10);
        return KeyEventResult.handled;
      case LogicalKeyboardKey.arrowRight:
        _moveTo(_selectedIndex + 10);
        return KeyEventResult.handled;
      case LogicalKeyboardKey.select:
      case LogicalKeyboardKey.enter:
        _confirmSelection();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.escape:
      case LogicalKeyboardKey.goBack:
        Navigator.of(context).pop(null);
        return KeyEventResult.handled;
      default:
        return KeyEventResult.ignored;
    }
  }

  void _confirmSelection() {
    final surahNumber = _kSurahs[_selectedIndex].number;
    widget.onSelected(surahNumber);
    Navigator.of(context).pop(surahNumber);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgColor,
      body: Focus(
        autofocus: true,
        onKeyEvent: (_, event) => _handleKey(event),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.fromLTRB(48, 36, 48, 20),
                child: Text(
                  'Select Surah',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  itemCount: _kSurahs.length,
                  itemExtent: _rowHeight,
                  padding: const EdgeInsets.symmetric(horizontal: 48),
                  itemBuilder: (context, index) {
                    final surah = _kSurahs[index];
                    final isSelected = index == _selectedIndex;
                    return GestureDetector(
                      onTap: () {
                        setState(() => _selectedIndex = index);
                        _confirmSelection();
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 120),
                        margin: const EdgeInsets.symmetric(vertical: 2),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? _accentColor.withValues(alpha: 0.15)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? _accentColor.withValues(alpha: 0.5)
                                : Colors.transparent,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Number
                            SizedBox(
                              width: 40,
                              child: Text(
                                '${surah.number}',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.4),
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            // Arabic name
                            Text(
                              surah.nameArabic,
                              textDirection: TextDirection.rtl,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontFamily: 'Amiri',
                              ),
                            ),
                            const SizedBox(width: 16),
                            // English name
                            Expanded(
                              child: Text(
                                surah.nameEnglish,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            // Ayah count
                            Text(
                              '${surah.totalAyahs} ayahs',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.4),
                                fontSize: 14,
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              // D-pad hint bar
              Padding(
                padding: const EdgeInsets.fromLTRB(48, 12, 48, 24),
                child: Row(
                  children: const [
                    Icon(Icons.keyboard_arrow_up, color: Colors.white30, size: 18),
                    Icon(Icons.keyboard_arrow_down, color: Colors.white30, size: 18),
                    SizedBox(width: 4),
                    Text(
                      'Navigate',
                      style: TextStyle(color: Colors.white30, fontSize: 13),
                    ),
                    SizedBox(width: 24),
                    Icon(Icons.keyboard_arrow_left, color: Colors.white30, size: 18),
                    Icon(Icons.keyboard_arrow_right, color: Colors.white30, size: 18),
                    SizedBox(width: 4),
                    Text(
                      'Jump 10',
                      style: TextStyle(color: Colors.white30, fontSize: 13),
                    ),
                    SizedBox(width: 24),
                    Text(
                      'OK to select  •  Back to cancel',
                      style: TextStyle(color: Colors.white30, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
