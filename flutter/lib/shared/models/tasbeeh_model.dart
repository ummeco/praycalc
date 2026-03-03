import 'dart:convert';

/// A single dhikr preset with its label and target count.
class TasbeehPreset {
  final String label;
  final int target;

  const TasbeehPreset(this.label, this.target);

  TasbeehPreset copyWith({String? label, int? target}) =>
      TasbeehPreset(label ?? this.label, target ?? this.target);

  Map<String, dynamic> toJson() => {'label': label, 'target': target};

  factory TasbeehPreset.fromJson(Map<String, dynamic> json) =>
      TasbeehPreset(json['label'] as String, json['target'] as int);
}

/// Default post-prayer tasbih sequence: 33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar.
const List<TasbeehPreset> defaultPresets = [
  TasbeehPreset('SubhanAllah', 33),
  TasbeehPreset('Alhamdulillah', 33),
  TasbeehPreset('Allahu Akbar', 34),
];

// ── Day record (for history) ─────────────────────────────────────────────────

/// Aggregate dhikr total for a single day.
class TasbeehDayRecord {
  final DateTime date;
  final int total;

  const TasbeehDayRecord({required this.date, required this.total});

  Map<String, dynamic> toJson() => {
        'date': date.toIso8601String(),
        'total': total,
      };

  factory TasbeehDayRecord.fromJson(Map<String, dynamic> json) =>
      TasbeehDayRecord(
        date: DateTime.parse(json['date'] as String),
        total: json['total'] as int,
      );
}

// ── State ────────────────────────────────────────────────────────────────────

/// Full state of the Tasbeeh counter.
class TasbeehState {
  /// Current count within the active preset.
  final int count;

  /// Index of the active preset in [presets].
  final int presetIndex;

  /// All configured presets.
  final List<TasbeehPreset> presets;

  /// Total taps for today (resets at midnight).
  final int dailyTotal;

  /// Last 7 days of dhikr history (most recent first).
  final List<TasbeehDayRecord> history;

  const TasbeehState({
    required this.count,
    required this.presetIndex,
    required this.presets,
    required this.dailyTotal,
    required this.history,
  });

  factory TasbeehState.initial() => const TasbeehState(
        count: 0,
        presetIndex: 0,
        presets: defaultPresets,
        dailyTotal: 0,
        history: [],
      );

  TasbeehPreset get currentPreset => presets[presetIndex];

  int get target => currentPreset.target;

  TasbeehState copyWith({
    int? count,
    int? presetIndex,
    List<TasbeehPreset>? presets,
    int? dailyTotal,
    List<TasbeehDayRecord>? history,
  }) =>
      TasbeehState(
        count: count ?? this.count,
        presetIndex: presetIndex ?? this.presetIndex,
        presets: presets ?? this.presets,
        dailyTotal: dailyTotal ?? this.dailyTotal,
        history: history ?? this.history,
      );

  // ── Serialisation helpers ──────────────────────────────────────────────────

  Map<String, dynamic> toJson() => {
        'count': count,
        'presetIndex': presetIndex,
        'presets': presets.map((p) => p.toJson()).toList(),
        'dailyTotal': dailyTotal,
        'historyDate': _todayKey(),
        'history': history.map((r) => r.toJson()).toList(),
      };

  /// Restore state from a JSON map.  If the persisted date is not today the
  /// daily total is reset to 0 and a history entry is added for yesterday's
  /// total before wiping it.
  static TasbeehState fromJson(Map<String, dynamic> json) {
    final presets = (json['presets'] as List?)
            ?.map((e) => TasbeehPreset.fromJson(e as Map<String, dynamic>))
            .toList() ??
        defaultPresets.toList();

    final history = (json['history'] as List?)
            ?.map((e) => TasbeehDayRecord.fromJson(e as Map<String, dynamic>))
            .toList() ??
        <TasbeehDayRecord>[];

    final storedDateKey = json['historyDate'] as String? ?? '';
    final todayKey = _todayKey();

    int dailyTotal = json['dailyTotal'] as int? ?? 0;

    if (storedDateKey != todayKey) {
      // The app was opened on a new day — archive yesterday's total.
      if (dailyTotal > 0 && storedDateKey.isNotEmpty) {
        final parts = storedDateKey.split('-');
        if (parts.length == 3) {
          final yesterday = DateTime(
            int.parse(parts[0]),
            int.parse(parts[1]),
            int.parse(parts[2]),
          );
          history.insert(0, TasbeehDayRecord(date: yesterday, total: dailyTotal));
          // Keep only 7 days.
          if (history.length > 7) history.removeRange(7, history.length);
        }
      }
      dailyTotal = 0;
    }

    final presetIndex = (json['presetIndex'] as int? ?? 0)
        .clamp(0, presets.length - 1);

    return TasbeehState(
      count: json['count'] as int? ?? 0,
      presetIndex: presetIndex,
      presets: presets,
      dailyTotal: dailyTotal,
      history: history,
    );
  }

  static String _todayKey() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  /// Encode to a JSON string for SharedPreferences storage.
  String toPrefsString() => jsonEncode(toJson());

  factory TasbeehState.fromPrefsString(String raw) =>
      TasbeehState.fromJson(jsonDecode(raw) as Map<String, dynamic>);
}
