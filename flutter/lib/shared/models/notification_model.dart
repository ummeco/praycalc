/// Adhan type — which recording to play at prayer time.
enum AdhanType {
  makkah,
  madinah,
  mishari,
  fajrMishari,
  abdulBasit,
  nasserAlQatami,
  egypt,
  pashaii,
  beep,
  silent,
}

enum PrayerNotificationMode { off, reminderOnly, arrival, both }

class PrayerNotificationConfig {
  final String prayerName;
  final PrayerNotificationMode mode;
  final int minutesBefore; // for reminder
  final AdhanType adhanType;
  final double volume;

  const PrayerNotificationConfig({
    required this.prayerName,
    this.mode = PrayerNotificationMode.arrival,
    this.minutesBefore = 10,
    this.adhanType = AdhanType.makkah,
    this.volume = 0.8,
  });

  PrayerNotificationConfig copyWith({
    PrayerNotificationMode? mode,
    int? minutesBefore,
    AdhanType? adhanType,
    double? volume,
  }) =>
      PrayerNotificationConfig(
        prayerName: prayerName,
        mode: mode ?? this.mode,
        minutesBefore: minutesBefore ?? this.minutesBefore,
        adhanType: adhanType ?? this.adhanType,
        volume: volume ?? this.volume,
      );

  Map<String, dynamic> toJson() => {
        'prayerName': prayerName,
        'mode': mode.name,
        'minutesBefore': minutesBefore,
        'adhanType': adhanType.name,
        'volume': volume,
      };

  static PrayerNotificationConfig fromJson(Map<String, dynamic> j) =>
      PrayerNotificationConfig(
        prayerName: j['prayerName'] as String,
        mode: PrayerNotificationMode.values
            .byName(j['mode'] as String? ?? 'arrival'),
        minutesBefore: j['minutesBefore'] as int? ?? 10,
        adhanType:
            AdhanType.values.byName(j['adhanType'] as String? ?? 'makkah'),
        volume: (j['volume'] as num?)?.toDouble() ?? 0.8,
      );
}

/// Default notification config for all 6 prayers.
const List<PrayerNotificationConfig> defaultNotificationConfigs = [
  PrayerNotificationConfig(prayerName: 'Fajr'),
  PrayerNotificationConfig(
      prayerName: 'Sunrise', mode: PrayerNotificationMode.off),
  PrayerNotificationConfig(prayerName: 'Dhuhr'),
  PrayerNotificationConfig(prayerName: 'Asr'),
  PrayerNotificationConfig(prayerName: 'Maghrib'),
  PrayerNotificationConfig(prayerName: 'Isha'),
];

/// Sunnah / optional prayer notification settings.
/// Stored separately from per-prayer fard configs.
class SunnahNotificationConfig {
  final bool iqamahEnabled;
  final int iqamahOffsetMinutes; // 5/10/15/20/30
  final bool tahajjudEnabled;
  final bool duhaEnabled;

  const SunnahNotificationConfig({
    this.iqamahEnabled = false,
    this.iqamahOffsetMinutes = 10,
    this.tahajjudEnabled = false,
    this.duhaEnabled = false,
  });

  SunnahNotificationConfig copyWith({
    bool? iqamahEnabled,
    int? iqamahOffsetMinutes,
    bool? tahajjudEnabled,
    bool? duhaEnabled,
  }) =>
      SunnahNotificationConfig(
        iqamahEnabled: iqamahEnabled ?? this.iqamahEnabled,
        iqamahOffsetMinutes: iqamahOffsetMinutes ?? this.iqamahOffsetMinutes,
        tahajjudEnabled: tahajjudEnabled ?? this.tahajjudEnabled,
        duhaEnabled: duhaEnabled ?? this.duhaEnabled,
      );

  Map<String, dynamic> toJson() => {
        'iqamahEnabled': iqamahEnabled,
        'iqamahOffsetMinutes': iqamahOffsetMinutes,
        'tahajjudEnabled': tahajjudEnabled,
        'duhaEnabled': duhaEnabled,
      };

  static SunnahNotificationConfig fromJson(Map<String, dynamic> j) =>
      SunnahNotificationConfig(
        iqamahEnabled: j['iqamahEnabled'] as bool? ?? false,
        iqamahOffsetMinutes: j['iqamahOffsetMinutes'] as int? ?? 10,
        tahajjudEnabled: j['tahajjudEnabled'] as bool? ?? false,
        duhaEnabled: j['duhaEnabled'] as bool? ?? false,
      );
}

const SunnahNotificationConfig defaultSunnahNotificationConfig =
    SunnahNotificationConfig();
