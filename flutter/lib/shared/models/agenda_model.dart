enum PrayerName { fajr, sunrise, dhuhr, asr, maghrib, isha }

enum AgendaNotificationType { silent, sound, vibrate }

class Agenda {
  final String id;
  final String label;
  final PrayerName prayer;
  final int offsetMinutes; // negative = before prayer, positive = after
  final bool enabled;
  final List<int> days; // 0=Mon, 6=Sun (all 7 = every day)
  final AgendaNotificationType notificationType;

  const Agenda({
    required this.id,
    required this.label,
    required this.prayer,
    required this.offsetMinutes,
    this.enabled = true,
    this.days = const [0, 1, 2, 3, 4, 5, 6],
    this.notificationType = AgendaNotificationType.sound,
  });

  Agenda copyWith({
    String? id,
    String? label,
    PrayerName? prayer,
    int? offsetMinutes,
    bool? enabled,
    List<int>? days,
    AgendaNotificationType? notificationType,
  }) =>
      Agenda(
        id: id ?? this.id,
        label: label ?? this.label,
        prayer: prayer ?? this.prayer,
        offsetMinutes: offsetMinutes ?? this.offsetMinutes,
        enabled: enabled ?? this.enabled,
        days: days ?? this.days,
        notificationType: notificationType ?? this.notificationType,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'prayer': prayer.name,
        'offsetMinutes': offsetMinutes,
        'enabled': enabled,
        'days': days,
        'notificationType': notificationType.name,
      };

  static Agenda fromJson(Map<String, dynamic> j) => Agenda(
        id: j['id'] as String,
        label: j['label'] as String,
        prayer: PrayerName.values.byName(j['prayer'] as String),
        offsetMinutes: j['offsetMinutes'] as int,
        enabled: j['enabled'] as bool? ?? true,
        days: List<int>.from(j['days'] as List),
        notificationType: AgendaNotificationType.values
            .byName(j['notificationType'] as String? ?? 'sound'),
      );
}
