// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Fajr';

  @override
  String get prayerSunrise => 'Sunrise';

  @override
  String get prayerDhuhr => 'Dhuhr';

  @override
  String get prayerAsr => 'Asr';

  @override
  String get prayerMaghrib => 'Maghrib';

  @override
  String get prayerIsha => 'Isha';

  @override
  String get prayerQiyam => 'Qiyam';

  @override
  String get prayerSuhoor => 'Suhoor';

  @override
  String get prayerIftar => 'Iftar';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabi\' al-Awwal';

  @override
  String get hijriRabiAlThani => 'Rabi\' al-Thani';

  @override
  String get hijriJumadaAlAwwal => 'Jumada al-Awwal';

  @override
  String get hijriJumadaAlThani => 'Jumada al-Thani';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Sha\'ban';

  @override
  String get hijriRamadan => 'Ramadan';

  @override
  String get hijriShawwal => 'Shawwal';

  @override
  String get hijriDhulQidah => 'Dhu al-Qi\'dah';

  @override
  String get hijriDhulHijjah => 'Dhu al-Hijjah';

  @override
  String get monthJan => 'Jan';

  @override
  String get monthFeb => 'Feb';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Apr';

  @override
  String get monthMay => 'May';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Aug';

  @override
  String get monthSep => 'Sep';

  @override
  String get monthOct => 'Oct';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Dec';

  @override
  String get monthJanuary => 'January';

  @override
  String get monthFebruary => 'February';

  @override
  String get monthMarch => 'March';

  @override
  String get monthApril => 'April';

  @override
  String get monthMayFull => 'May';

  @override
  String get monthJune => 'June';

  @override
  String get monthJuly => 'July';

  @override
  String get monthAugust => 'August';

  @override
  String get monthSeptember => 'September';

  @override
  String get monthOctober => 'October';

  @override
  String get monthNovember => 'November';

  @override
  String get monthDecember => 'December';

  @override
  String get dayMonShort => 'Mon';

  @override
  String get dayTueShort => 'Tue';

  @override
  String get dayWedShort => 'Wed';

  @override
  String get dayThuShort => 'Thu';

  @override
  String get dayFriShort => 'Fri';

  @override
  String get daySatShort => 'Sat';

  @override
  String get daySunShort => 'Sun';

  @override
  String get daySuChart => 'Su';

  @override
  String get dayMoChart => 'Mo';

  @override
  String get dayTuChart => 'Tu';

  @override
  String get dayWeChart => 'We';

  @override
  String get dayThChart => 'Th';

  @override
  String get dayFrChart => 'Fr';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Choose a city';

  @override
  String get setCityFab => 'Set city';

  @override
  String prayerTimesError(Object error) {
    return 'Could not calculate prayer times.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer in';
  }

  @override
  String get ramadanMubarak => 'Ramadan Mubarak 🌙';

  @override
  String ramadanDayProgress(int day) {
    return 'Day $day / 30';
  }

  @override
  String get lastTenNights => 'Last 10 Nights ✨';

  @override
  String get laylatulQadr => 'Laylatul Qadr ✨';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsSectionPrayerCalc => 'Prayer Calculation';

  @override
  String get settingsHanafiAsr => 'Hanafi Asr';

  @override
  String get settingsHanafiAsrSubtitle => 'Shadow factor 2x (later Asr time)';

  @override
  String get settingsSectionDisplay => 'Display';

  @override
  String get settings24hClock => '24-hour clock';

  @override
  String get settingsFollowSystemTheme => 'Follow system theme';

  @override
  String get settingsDarkMode => 'Dark mode';

  @override
  String get settingsSectionNotifications => 'Notifications';

  @override
  String get settingsPrayerNotifications => 'Prayer notifications';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhan, reminders, and per-prayer settings';

  @override
  String get settingsPrayerAgendas => 'Prayer agendas';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Custom reminders offset from prayer times';

  @override
  String get notifSettingsTitle => 'Notifications & Adhan';

  @override
  String get notifAdhanLabel => 'Adhan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Reminder: $minutes min before';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Volume: $pct%';
  }

  @override
  String get notifTestAdhan => 'Test adhan';

  @override
  String get notifModeOff => 'Off';

  @override
  String get notifModeReminderOnly => 'Reminder only';

  @override
  String get notifModeArrival => 'At prayer time';

  @override
  String get notifModeBoth => 'Reminder + arrival';

  @override
  String get citySearchHint => 'Search city…';

  @override
  String get citySearchDetectTooltip => 'Detect my location';

  @override
  String get citySearchNoCityGps => 'Could not detect city from GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Location permission denied. Search manually.';

  @override
  String get citySearchNoResults => 'No cities found.';

  @override
  String get citySearchStartTyping => 'Start typing to search…';

  @override
  String get agendasTitle => 'Prayer Agendas';

  @override
  String get agendasEmpty =>
      'No agendas yet.\nTap + to add a reminder linked to your prayers.';

  @override
  String get agendasUndo => 'Undo';

  @override
  String agendasRemoved(String label) {
    return '$label removed';
  }

  @override
  String get agendaNewTitle => 'New Agenda';

  @override
  String get agendaEditTitle => 'Edit Agenda';

  @override
  String get agendaSave => 'Save';

  @override
  String get agendaLabelEmpty => 'Label cannot be empty';

  @override
  String get agendaLabelField => 'Label';

  @override
  String get agendaLabelHint => 'e.g. Wake for Fajr';

  @override
  String get agendaPrayerSection => 'Prayer';

  @override
  String get agendaTimeOffsetSection => 'Time offset';

  @override
  String get agendaOffsetAtPrayerTime => 'At prayer time';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes min before';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes min after';
  }

  @override
  String get agendaRepeatSection => 'Repeat';

  @override
  String get agendaNotifTypeSection => 'Notification type';

  @override
  String get agendaNotifSilent => 'Silent';

  @override
  String get agendaNotifSound => 'Sound';

  @override
  String get agendaNotifVibrate => 'Vibrate';

  @override
  String get agendaDayM => 'M';

  @override
  String get agendaDayT => 'T';

  @override
  String get agendaDayW => 'W';

  @override
  String get agendaDayF => 'F';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Moon & Hijri Calendar';

  @override
  String moonIlluminated(int pct) {
    return '$pct% illuminated';
  }

  @override
  String get moonFullTonight => 'Full moon tonight!';

  @override
  String get moonNextTomorrow => 'Next full moon tomorrow';

  @override
  String moonNextDays(int days) {
    return 'Next full moon in $days days';
  }

  @override
  String moonAge(String age) {
    return 'Moon age: $age days';
  }

  @override
  String get hijriTodayLabel => 'Today in the Hijri Calendar';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year AH begins';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days days away';
  }

  @override
  String get calDateCol => 'Date';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Fajr';

  @override
  String get calSunriseCol => 'Sunrise';

  @override
  String get calDhuhrCol => 'Dhuhr';

  @override
  String get calAsrCol => 'Asr';

  @override
  String get calMaghribCol => 'Maghrib';

  @override
  String get calIshaCol => 'Isha';

  @override
  String get calNoCityText =>
      'Set your city first\nto view the prayer calendar.';

  @override
  String get calShareTooltip => 'Share calendar';

  @override
  String get calPrevMonthTooltip => 'Previous month';

  @override
  String get calNextMonthTooltip => 'Next month';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Prayer Times — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Switch to compass';

  @override
  String get qiblaSwitchToAR => 'Switch to AR camera';

  @override
  String get qiblaNoCityText =>
      'Set your city first\nto calculate the Qibla direction.';

  @override
  String get qiblaCompassUnavailable =>
      'Compass sensor unavailable on this device.';

  @override
  String get qiblaCalibrate =>
      'Calibrate: move your phone in a figure-8 motion.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° from North';
  }

  @override
  String qiblaFrom(String city) {
    return 'From $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km from the Kaaba';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km from the Kaaba';
  }

  @override
  String get qiblaFacingQibla => 'Facing Qibla ✓';

  @override
  String get tasbeehTitle => 'Tasbeeh';

  @override
  String get tasbeehResetTooltip => 'Reset';

  @override
  String get tasbeehTapToSwitch => 'Tap label to switch';

  @override
  String get tasbeehTapToCount => 'Tap anywhere to count';

  @override
  String get tasbeehResetDialogTitle => 'Reset counter?';

  @override
  String get tasbeehResetDialogContent =>
      'This will reset the current count to zero.';

  @override
  String get tasbeehCancel => 'Cancel';

  @override
  String get tasbeehReset => 'Reset';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Today: $count dhikr';
  }

  @override
  String get tasbeehLast7Days => 'Last 7 days';

  @override
  String get tasbeehNoHistory => 'No history yet — start counting!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih complete! $count dhikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Smart Home';

  @override
  String get smartHomeSubtitle => 'Connect your devices to prayer times';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Ask Google for prayer times and Qibla direction';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Ask Alexa for prayer times, next prayer, and more';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc => 'Create custom shortcuts for prayer times';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Automate lights, displays, and reminders at prayer times';

  @override
  String get smartHomeLinkAccount => 'Link Account';

  @override
  String get smartHomeLinked => 'Linked';

  @override
  String get smartHomeUnlink => 'Unlink';

  @override
  String get smartHomeSetupInstructions => 'Setup Instructions';

  @override
  String get smartHomeRequiresUmmatPlus => 'Requires Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Troubleshooting';

  @override
  String get smartHomeTestConnection => 'Test Connection';

  @override
  String get smartHomeConnectionSuccess => 'Connected successfully';

  @override
  String get smartHomeConnectionFailed =>
      'Connection failed. Check your account link.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Premium prayer time features';

  @override
  String get subscriptionUpgrade => 'Upgrade to Ummat+';

  @override
  String get subscriptionRestore => 'Restore Purchase';

  @override
  String get subscriptionManage => 'Manage Subscription';

  @override
  String get subscriptionCancel => 'Cancel Subscription';

  @override
  String get subscriptionActive => 'Active';

  @override
  String get subscriptionExpired => 'Expired';

  @override
  String get subscriptionFree => 'Free';

  @override
  String get subscriptionFreeDesc => 'Basic prayer times, Qibla, calendar';

  @override
  String get subscriptionPlusDesc =>
      'Smart home, TV display, widgets, and more';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count free queries remaining';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/year';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/month';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Smart home integration';

  @override
  String get subscriptionFeatureTV => 'TV display mode';

  @override
  String get subscriptionFeatureWidgets => 'Home screen widgets';

  @override
  String get subscriptionFeatureWatch => 'Watch complications';

  @override
  String get subscriptionFeatureSync => 'Cross-device sync';

  @override
  String get subscriptionFeatureAdFree => 'Ad-free experience';

  @override
  String get tvTitle => 'TV Display';

  @override
  String get tvMasjidMode => 'Masjid Mode';

  @override
  String get tvAmbientMode => 'Ambient Mode';

  @override
  String get tvSettingsIqamah => 'Iqamah Offsets';

  @override
  String get tvSettingsAnnouncements => 'Announcements';

  @override
  String get tvConnectQR => 'Scan to connect';

  @override
  String get watchTitle => 'Watch';

  @override
  String get watchNextPrayer => 'Next Prayer';

  @override
  String get watchAllPrayers => 'All Prayers';

  @override
  String get watchComplication => 'Complication';

  @override
  String get nextPrayer => 'Next prayer';

  @override
  String get allPrayers => 'All prayers';

  @override
  String get today => 'Today';

  @override
  String get tomorrow => 'Tomorrow';

  @override
  String get thisWeek => 'This week';

  @override
  String get thisMonth => 'This month';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonSave => 'Save';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonClose => 'Close';

  @override
  String get commonDone => 'Done';

  @override
  String get commonBack => 'Back';

  @override
  String get commonNext => 'Next';

  @override
  String get commonSkip => 'Skip';

  @override
  String get commonContinue => 'Continue';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Yes';

  @override
  String get commonNo => 'No';

  @override
  String get commonShare => 'Share';

  @override
  String get commonCopy => 'Copy';

  @override
  String get commonCopied => 'Copied to clipboard';

  @override
  String get commonLoading => 'Loading...';

  @override
  String get commonError => 'Something went wrong';

  @override
  String get commonErrorRetry => 'Something went wrong. Tap to retry.';

  @override
  String get commonNoInternet => 'No internet connection';

  @override
  String get commonOfflineMode => 'Offline mode';

  @override
  String get commonSignIn => 'Sign in';

  @override
  String get commonSignOut => 'Sign out';

  @override
  String get commonSignUp => 'Sign up';

  @override
  String get commonProfile => 'Profile';

  @override
  String get commonAccount => 'Account';

  @override
  String get commonAbout => 'About';

  @override
  String commonVersion(String version) {
    return 'Version $version';
  }

  @override
  String get commonPrivacyPolicy => 'Privacy Policy';

  @override
  String get commonTermsOfService => 'Terms of Service';

  @override
  String get commonRateApp => 'Rate this app';

  @override
  String get commonFeedback => 'Send feedback';

  @override
  String get commonHelp => 'Help';

  @override
  String get commonLanguage => 'Language';

  @override
  String get travelNotificationTitle => 'You are now traveling';

  @override
  String get travelNotificationBody =>
      'Prayer times may be shortened. Tap to learn about travel rulings.';

  @override
  String get travelRulingsTitle => 'Travel & Prayer';

  @override
  String get travelRulingsIntro =>
      'Islamic rulings on prayer while traveling, with scholarly references from the Quran and authentic Hadith collections.';

  @override
  String get travelWhenTitle => 'When Does Travel Apply?';

  @override
  String get travelQasrTitle => 'Shortening Prayers (Qasr)';

  @override
  String get travelJamTitle => 'Combining Prayers (Jam\')';

  @override
  String get travelDurationTitle => 'Duration of Travel';

  @override
  String get travelReferencesTitle => 'Scholarly References';

  @override
  String get travelLearnMore => 'Learn more';
}
