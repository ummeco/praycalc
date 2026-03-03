/// Notification channel and ID constants shared across notification + agenda systems.
class NotificationChannels {
  NotificationChannels._();

  static const String prayers = 'praycalc_prayers';       // High priority, sound
  static const String reminders = 'praycalc_reminders';   // Default, no sound
  static const String persistent = 'praycalc_persistent'; // Low, no sound, sticky
  static const String ramadan = 'praycalc_ramadan';       // Ramadan countdown shade (PC-ST-1.7)
}

class NotificationIds {
  NotificationIds._();

  static const int persistentShade = 1;

  // Snooze: 10 (one active snooze at a time, overwritten on each snooze tap)
  static const int snooze = 10;

  // Prayer notifications today:
  //   arrival  100–105  (100 + prayerIdx)
  //   reminder 150–155  (150 + prayerIdx)
  // Prayer notifications tomorrow:
  //   arrival  120–125  (120 + prayerIdx)
  //   reminder 170–175  (170 + prayerIdx)
  static int prayer(int idx, {int dayOffset = 0}) => 100 + (dayOffset * 20) + idx;
  static int prayerReminder(int idx, {int dayOffset = 0}) => 150 + (dayOffset * 20) + idx;

  // Agenda notifications: 200 + (dayOffset * 50) + agendaIdx
  // Supports up to 7 days × 50 agendas = IDs 200–549
  static int agenda(int dayOffset, int agendaIdx) => 200 + (dayOffset * 50) + agendaIdx;

  // Ramadan: 600-609
  static const int suhoorMinus30 = 600;
  static const int suhoorMinus10 = 601;
  static const int suhoorAtFajr = 602;
  static const int iftarAtMaghrib = 603;
  static const int qiyamReminder = 604;

  // Jumu'ah / Ramadan extras: 610+
  static const int jumuahKahf = 610;         // PC-ST-1.8 Jumu'ah Al-Kahf reminder
  static const int ramadanCountdown = 620;   // PC-ST-1.7 Ramadan persistent countdown
}
