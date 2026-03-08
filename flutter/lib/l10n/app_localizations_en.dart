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
  String get dayMonday => 'Monday';

  @override
  String get dayTuesday => 'Tuesday';

  @override
  String get dayWednesday => 'Wednesday';

  @override
  String get dayThursday => 'Thursday';

  @override
  String get dayFriday => 'Friday';

  @override
  String get daySaturday => 'Saturday';

  @override
  String get daySunday => 'Sunday';

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
  String get ramadanMubarak => 'Ramadan Mubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Day $day / 30';
  }

  @override
  String get lastTenNights => 'Last 10 Nights';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'AH';

  @override
  String get homeSuffixCE => 'CE';

  @override
  String get homeNoCitySelected => 'No city selected';

  @override
  String get homeNoCityHint =>
      'Tap above to search for your city or enable GPS.';

  @override
  String get homeCouldNotCalc => 'Could not calculate prayer times.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Monthly\nTimes';

  @override
  String get homeActionDuaDhikr => 'Dua &\nDhikr';

  @override
  String get homeActionPrayerStats => 'Prayer\nStats';

  @override
  String homePolarBanner(int count) {
    return '$count prayer times cannot be calculated for your location during this period (midnight sun / polar night). Try nearest-latitude estimation in settings.';
  }

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
  String get settingsAccount => 'Account';

  @override
  String get settingsSignInToSync => 'Sign in to sync';

  @override
  String get settingsSignInToSyncSubtitle => 'Keep your data across devices';

  @override
  String get settingsHomeScreen => 'Home Screen';

  @override
  String get settingsSkyGradient => 'Sky gradient background';

  @override
  String get settingsSkyGradientSubtitle =>
      'Animated sky colors matching the time of day';

  @override
  String get settingsWeatherGradient => 'Weather-tinted gradient';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Adjust sky colors based on local weather';

  @override
  String get settingsCountdownAnimation => 'Countdown animation';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Breathing ring on the next prayer countdown';

  @override
  String get settingsPrayerTracking => 'Prayer Tracking';

  @override
  String get settingsTrackMyPrayers => 'Track my prayers';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Log which prayers you complete each day';

  @override
  String get settingsPrayerStats => 'Prayer statistics';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Streaks, weekly and monthly charts';

  @override
  String get settingsJumuahKahf => 'Jumu\'ah Al-Kahf reminder';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Reminder on Fridays to read Surah Al-Kahf';

  @override
  String get settingsTravel => 'Travel';

  @override
  String get settingsTravelMode => 'Travel mode';

  @override
  String get settingsTravelModeSubtitle =>
      'Automatically detect when away from home and adjust prayers';

  @override
  String get settingsHomeLocation => 'Home location';

  @override
  String get settingsHomeLocationNotSet =>
      'Not set — tap to use current location';

  @override
  String get settingsClearHomeLocation => 'Clear home location';

  @override
  String get settingsTravelRulings => 'Travel prayer rulings';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, combining, and traveler guidelines';

  @override
  String get settingsSmartHome => 'Smart Home';

  @override
  String get settingsSmartHomeIntegrations => 'Smart home integrations';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'TV Display';

  @override
  String get settingsTvHome => 'TV home display';

  @override
  String get settingsTvHomeSubtitle => 'Full-screen prayer clock for TV';

  @override
  String get settingsMasjidDisplay => 'Masjid display';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Adhan/iqamah table for masjid screens';

  @override
  String get settingsTvSettings => 'TV settings';

  @override
  String get settingsTvSettingsSubtitle =>
      'Masjid mode, iqamah offsets, ambient';

  @override
  String get settingsAboutPrayCalc => 'About PrayCalc';

  @override
  String get syncSynced => 'Synced';

  @override
  String get syncSyncing => 'Syncing...';

  @override
  String get syncOffline => 'Offline';

  @override
  String get syncError => 'Sync error';

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
  String get moonPhaseNewMoon => 'New Moon';

  @override
  String get moonPhaseWaxingCrescent => 'Waxing Crescent';

  @override
  String get moonPhaseFirstQuarter => 'First Quarter';

  @override
  String get moonPhaseWaxingGibbous => 'Waxing Gibbous';

  @override
  String get moonPhaseFullMoon => 'Full Moon';

  @override
  String get moonPhaseWaningGibbous => 'Waning Gibbous';

  @override
  String get moonPhaseLastQuarter => 'Last Quarter';

  @override
  String get moonPhaseWaningCrescent => 'Waning Crescent';

  @override
  String get moonHilalVisibility => 'Next Hilal Visibility';

  @override
  String get moonRegionMiddleEast => 'Middle East';

  @override
  String get moonRegionWestAfrica => 'West Africa';

  @override
  String get moonRegionSouthAsia => 'South Asia';

  @override
  String get moonRegionEurope => 'Europe';

  @override
  String get moonRegionAmericas => 'Americas';

  @override
  String get moonVisible => 'Visible';

  @override
  String get moonNotVisible => 'Not Visible';

  @override
  String get moonPossible => 'Possible';

  @override
  String get moonUpcomingDates => 'Upcoming Islamic Dates';

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
  String get moonLunarCycle => 'Lunar Cycle';

  @override
  String moonDayOfCycle(int day) {
    return 'Day $day of ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'Hilal Sighting Forecast';

  @override
  String get moonHilalVisibilityMap => 'Hilal Visibility Map';

  @override
  String moonDayN(int day) {
    return 'Day $day';
  }

  @override
  String get moonGlobalSighting => 'Global Sighting';

  @override
  String get moonZoneNakedEye => 'Naked Eye';

  @override
  String get moonZoneBinoculars => 'Binoculars';

  @override
  String get moonZoneVeryDifficult => 'Very Difficult';

  @override
  String get moonZoneNotVisible => 'Not Visible';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year AH will likely be 29 days. Crescent expected to be sighted on the 29th, in sha Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year AH will likely be 30 days. Crescent unlikely on the 29th — month completes 30 days.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Saudi Arabia';

  @override
  String get moonFCNACalc => 'FCNA / Calc.';

  @override
  String get moonNorthAmerica => 'North America';

  @override
  String moonNDays(int days) {
    return '$days days';
  }

  @override
  String moonStarts(String month) {
    return '$month starts:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Moon age at sunset: $hours h';
  }

  @override
  String get moon7DayLunarCalendar => '7-Day Lunar Calendar';

  @override
  String get moonUpcomingIslamicEvents => 'Upcoming Islamic Events';

  @override
  String get moonTodayLabel => 'Today';

  @override
  String get moonTomorrowLabel => 'Tomorrow';

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
  String get loginCreateAccount => 'Create Account';

  @override
  String get loginSignIn => 'Sign In';

  @override
  String get loginWelcomeBack => 'Welcome back';

  @override
  String get loginJoinPrayCalc => 'Join PrayCalc';

  @override
  String get loginSyncSubtitle => 'Sync your prayer data across devices';

  @override
  String get loginContinueGoogle => 'Continue with Google';

  @override
  String get loginOr => 'or';

  @override
  String get loginSigningIn => 'Signing in…';

  @override
  String get loginNameLabel => 'Display name (optional)';

  @override
  String get loginEmailLabel => 'Email';

  @override
  String get loginPasswordLabel => 'Password';

  @override
  String get loginEmailRequired => 'Email is required';

  @override
  String get loginEmailInvalid => 'Enter a valid email address';

  @override
  String get loginPasswordRequired => 'Password is required';

  @override
  String get loginPasswordMinLength => 'Password must be at least 8 characters';

  @override
  String get loginForgotPassword => 'Forgot password?';

  @override
  String get loginEnterEmailFirst => 'Enter your email address first';

  @override
  String get loginResetSent => 'Password reset email sent';

  @override
  String get loginResetFailed => 'Could not send reset email';

  @override
  String get loginNewToPrayCalc => 'New to PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Already have an account?';

  @override
  String get accountTitle => 'Account';

  @override
  String get accountNotSignedIn => 'Not signed in';

  @override
  String get accountSyncSection => 'Sync';

  @override
  String get accountSyncStatus => 'Sync status';

  @override
  String get accountSyncNow => 'Sync now';

  @override
  String get accountSyncHistory => 'Sync history';

  @override
  String get accountNoConflicts => 'No conflicts detected';

  @override
  String accountConflictsResolved(int count) {
    return '$count resolved';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Synced $time';
  }

  @override
  String get accountOfflineStatus => 'Offline. Changes saved locally.';

  @override
  String get accountSyncErrorStatus => 'Sync error. Will retry.';

  @override
  String get accountDataSection => 'Data';

  @override
  String get accountExportData => 'Export data';

  @override
  String get accountExportSubtitle => 'Download your settings and prayer logs';

  @override
  String get accountExportFailed => 'Could not export data';

  @override
  String get accountSignOutTitle => 'Sign out';

  @override
  String get accountSignOutBody =>
      'Your local data will be kept. Sign in again to resume syncing.';

  @override
  String get accountDeleteAccount => 'Delete account';

  @override
  String get accountDeleteSubtitle =>
      'Permanently delete your account and data';

  @override
  String get accountDeleteBody =>
      'This will permanently delete your account and all synced data. Your local data on this device will not be removed.\n\nThis action cannot be undone.';

  @override
  String get accountDeleted => 'Account deleted';

  @override
  String get accountDeleteFailed => 'Could not delete account';

  @override
  String get accountTimeJustNow => 'just now';

  @override
  String accountTimeMinAgo(int min) {
    return '${min}m ago';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '${hour}h ago';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '${day}d ago';
  }

  @override
  String get statsTitle => 'Prayer Statistics';

  @override
  String get statsShareTooltip => 'Share stats';

  @override
  String get statsTodayPrayers => 'Today\'s Prayers';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Streak';

  @override
  String get statsDays => 'days';

  @override
  String get statsThisWeek => 'This Week';

  @override
  String get statsCompletion => 'completion';

  @override
  String get statsThisMonth => 'This Month';

  @override
  String get statsMostMissed => 'Most Missed';

  @override
  String get statsThisWeekLabel => 'this week';

  @override
  String get statsWeeklyChart => 'Weekly Completion by Prayer';

  @override
  String get statsMonthlyChart => 'Monthly Completion by Prayer';

  @override
  String statsTotalLogged(int count) {
    return '$count total prayers logged';
  }

  @override
  String get statsKeepItUp => 'Keep it up!';

  @override
  String get statsShareTitle => 'PrayCalc Prayer Statistics';

  @override
  String statsShareStreak(int days) {
    return 'Streak: $days days';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Weekly: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Monthly: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Weekly breakdown:';

  @override
  String get aboutTitle => 'About PrayCalc';

  @override
  String get aboutWebsite => 'Website';

  @override
  String get aboutContact => 'Contact';

  @override
  String get aboutLicenses => 'Open Source Licenses';

  @override
  String get aboutCouldNotOpen => 'Could not open the link.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. All rights reserved.\n\nPrayer times calculated using the pray_calc_dart engine. Accuracy depends on your GPS location and selected calculation method.';
  }

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
  String get commonOpenSettings => 'Open Settings';

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

  @override
  String get travelHanafiDefaultTitle => 'Why PrayCalc Uses the Hanafi Default';

  @override
  String get travelDeeperScholarly => 'Deeper Scholarly Discussion';

  @override
  String get onboardingTitle1 => 'Prayer times, wherever you are';

  @override
  String get onboardingBody1 =>
      'GPS-accurate salah times for every city on earth. Fajr to Isha, sunrise to Qiyam. Powered by our own calculation engine, built for precision.';

  @override
  String get onboardingTitle2 => 'Your location, your times';

  @override
  String get onboardingBody2 =>
      'Search any city or let GPS detect your location. PrayCalc finds times for 5 million cities worldwide.';

  @override
  String get onboardingTitle3 => 'Never miss a prayer';

  @override
  String get onboardingBody3 =>
      'Adhan at prayer time, reminders before it. Custom agendas for Suhoor, classes, and more.';

  @override
  String get onboardingTitle4 => 'Everything you need';

  @override
  String get onboardingBody4 =>
      'Qibla compass, prayer calendar, Hijri moon phase, Tasbeeh counter. All in one place.';

  @override
  String get onboardingSkip => 'Skip';

  @override
  String get onboardingGetStarted => 'Get Started';

  @override
  String get onboardingSignInTitle => 'Sign in to PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Save your prayer history and sync\nacross all your devices.';

  @override
  String get onboardingContinueGoogle => 'Continue with Google';

  @override
  String get onboardingContinueWithoutAccount => 'Continue without account';

  @override
  String get onboardingSigningIn => 'Signing in…';

  @override
  String get onboardingSelectLanguage => 'Select Language';

  @override
  String get duaDhikrTitle => 'Dua & Dhikr';

  @override
  String get duaDhikrTabDua => 'Duas';

  @override
  String get duaDhikrTabDhikr => 'Dhikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbeeh';

  @override
  String get duaDhikrTabMorning => 'Morning';

  @override
  String get duaDhikrTabEvening => 'Evening';

  @override
  String get duaDhikrMorningAdhkar => 'Morning Adhkar';

  @override
  String get duaDhikrEveningAdhkar => 'Evening Adhkar';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Yearly calendar';

  @override
  String get calExportIcsTooltip => 'Export .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Show on map';

  @override
  String get qiblaWaitingCompass => 'Waiting for compass...';

  @override
  String get qiblaNoCompassSensor =>
      'No compass sensor. Showing Qibla direction statically.';

  @override
  String get qiblaAccuracyExcellent => 'Excellent accuracy';

  @override
  String get qiblaAccuracyGood => 'Good accuracy';

  @override
  String get qiblaAccuracyFair =>
      'Fair accuracy. Calibrate by moving phone in figure-8.';

  @override
  String get qiblaAccuracyLow =>
      'Low accuracy. Calibrate by moving phone in figure-8.';

  @override
  String get qiblaToTheKaaba => 'to the Kaaba';

  @override
  String get qiblaYourLocation => 'Your location';

  @override
  String get qiblaGpsAccurate => 'GPS-accurate';

  @override
  String get qiblaCityCenter => 'City center';

  @override
  String get moonIlluminatedLabel => 'Illuminated';

  @override
  String get moonAgeLabel => 'Age';

  @override
  String get moonFirstQtr => 'First Qtr';

  @override
  String get moonLastQtr => 'Last Qtr';

  @override
  String get moonTonight => 'Tonight';

  @override
  String get moonTomorrow => 'Tomorrow';

  @override
  String moonDaysAway(int days) {
    return '${days}d';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Set Home Location';

  @override
  String get setHomeSearchHint => 'Search city, town or zip…';

  @override
  String get setHomeClear => 'Clear';

  @override
  String get setHomeUseCurrentLocation => 'Use Current Location';

  @override
  String get setHomeDetectAndSet => 'Detect your location and set it as home';

  @override
  String get setHomeAlreadySet => 'Home already set';

  @override
  String setHomeSetAs(String city) {
    return '$city set as home';
  }

  @override
  String get setHomeCurrentLocationSet => 'Current location set as home';

  @override
  String get setHomePermissionDenied =>
      'Location permission denied. Search for a city below.';

  @override
  String get setHomeGpsUnavailable => 'GPS unavailable. Search manually.';

  @override
  String get setHomeNoCitiesFound => 'No cities found.';

  @override
  String get setHomeSearchPrompt => 'Search for your home city';

  @override
  String get setHomeSearchBody =>
      'Type above to search, or use your current location. Travel mode will detect when you are away from home.';

  @override
  String get subscriptionYouHavePlus => 'You have Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Upgrade to Ummat+';

  @override
  String get subscriptionThankYou => 'Thank you for supporting PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Unlock premium features across all your devices.';

  @override
  String get subscriptionManageSub => 'Manage subscription';

  @override
  String get subscriptionWelcome => 'Welcome to Ummat+!';

  @override
  String get subscriptionSubscribe => 'Subscribe';

  @override
  String get subscriptionFreeFeatures => 'Free Features';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ Features';

  @override
  String get subscriptionFeaturePrayerTimes => 'Prayer times';

  @override
  String get subscriptionFeatureQibla => 'Qibla compass';

  @override
  String get subscriptionFeatureCalendar => 'Monthly calendar';

  @override
  String get subscriptionFeatureTasbeeh => 'Tasbeeh counter';

  @override
  String get subscriptionFeatureMoon => 'Moon & Hijri';

  @override
  String get smartHomeAlertType => 'Alert Type';

  @override
  String get smartHomeAlertModal => 'Full-screen modal';

  @override
  String get smartHomeAlertCorner => 'Corner notification';

  @override
  String get smartHomeAlertNone => 'None (silent)';

  @override
  String get smartHomePauseMedia => 'Pause media during adhan';

  @override
  String get smartHomeQuietHours => 'Quiet hours';

  @override
  String get smartHomeQuietFrom => 'From';

  @override
  String get smartHomeQuietTo => 'To';

  @override
  String get smartHomePrayerAudio => 'Per-prayer audio';

  @override
  String get smartHomeAudioAdhan => 'Adhan';

  @override
  String get smartHomeAudioBeep => 'Beep';

  @override
  String get smartHomeAudioSilent => 'Silent';

  @override
  String get aboutPrivacy => 'Privacy Policy';

  @override
  String aboutVersion(String version) {
    return 'Version $version';
  }

  @override
  String get notifDefaultAdhan => 'Default Adhan';

  @override
  String get notifFajrAdhan => 'Fajr Adhan';

  @override
  String get notifFajrAdhanSubtitle => 'Played at Fajr prayer time';

  @override
  String get notifRegularAdhan => 'Regular Adhan';

  @override
  String get notifRegularAdhanSubtitle => 'Played at Dhuhr, Asr, Maghrib, Isha';

  @override
  String get notifPerPrayerSettings => 'Per-Prayer Settings';

  @override
  String get notifPreview => 'Preview';

  @override
  String get tvSettingsTitle => 'TV Settings';

  @override
  String get tvDisplayMode => 'Display Mode';

  @override
  String get tvMasjidMode => 'Masjid Mode';

  @override
  String get tvMasjidModeSubtitle => 'Large signage display with iqamah times';

  @override
  String get tvMasjidName => 'Masjid Name';

  @override
  String get tvMasjidNameTapToSet => 'Tap to set';

  @override
  String get tvClock => 'Clock';

  @override
  String get tv24hFormat => '24-hour format';

  @override
  String get tvIqamahOffsets => 'Iqamah Offsets (minutes after adhan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset min after adhan';
  }

  @override
  String get tvQrCode => 'QR Code';

  @override
  String get tvShowQrCode => 'Show QR Code';

  @override
  String get tvShowQrCodeSubtitle => 'Display a QR code on the masjid screen';

  @override
  String get tvQrCodeUrl => 'QR Code URL';

  @override
  String get tvAmbientModeSection => 'Ambient Mode';

  @override
  String get tvIdleTimeout => 'Idle timeout';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes minutes before ambient activates';
  }

  @override
  String get tvPhotoInterval => 'Photo interval';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds seconds between photos';
  }

  @override
  String get tvBackground => 'Background';

  @override
  String get tvPhotoCategory => 'Photo category';

  @override
  String get tvLocation => 'Location';

  @override
  String get tvChangeCity => 'Change City';

  @override
  String get tvChangeCitySubtitle => 'Search for a different city';

  @override
  String get tvScreensaverBg => 'Screensaver Background';

  @override
  String get tvScreensaverPhotos => 'Photos';

  @override
  String get tvScreensaverPattern => 'Geometric pattern';

  @override
  String get tvScreensaverBoth => 'Photos + pattern';

  @override
  String get tvCategoryAll => 'All categories';

  @override
  String get tvCategoryMasjids => 'Masjids';

  @override
  String get tvCategoryInteriors => 'Interiors';

  @override
  String get tvCategoryGeometric => 'Geometric';

  @override
  String get tvCategoryCalligraphy => 'Calligraphy';

  @override
  String get tvCategoryLandscapes => 'Landscapes';

  @override
  String get tvCategoryRamadan => 'Ramadan';

  @override
  String get tvPhotoCategoryTitle => 'Photo Category';

  @override
  String tvEnterHint(String title) {
    return 'Enter $title';
  }

  @override
  String get tvSystemDefault => 'System default';

  @override
  String get smartHomeIntegrations => 'Integrations';

  @override
  String get smartHomeLinkedSpeakers => 'Linked Speakers & Displays';

  @override
  String get smartHomeAlertDisplay => 'Alert Display';

  @override
  String get smartHomeAtAdhanShow => 'At adhan time show';

  @override
  String get smartHomePauseMediaTitle => 'Pause media at adhan';

  @override
  String get smartHomePauseMediaSubtitle => 'Resumes after the adhan ends';

  @override
  String get smartHomePrayerAudioSection => 'Prayer Audio';

  @override
  String get smartHomeQuietHoursSection => 'Quiet Hours';

  @override
  String get smartHomeEnableQuietHours => 'Enable quiet hours';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'All smart home alerts are silenced';

  @override
  String get smartHomeNoDevices => 'No devices linked yet';

  @override
  String get smartHomeNoDevicesDesc =>
      'Link Google Home or Alexa above, then your speakers and displays will appear here.';

  @override
  String get smartHomeRequiresPlus => 'Smart Home requires Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Control prayer announcements on Google Home, Alexa, Siri, and Home Assistant. Configure which devices play adhan, when to pause media, and set quiet hours.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Broadcast adhan on Nest speakers and displays.';

  @override
  String get smartHomeEnableAlexa => 'Enable the PrayCalc skill on Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Ask Siri for prayer times or set automations.';

  @override
  String get smartHomeHassAdd => 'Add via HACS for full automation support.';

  @override
  String get smartHomeSetupGuide => 'Setup guide';

  @override
  String get smartHomeSiriSetupTitle => 'Siri Shortcuts Setup';

  @override
  String get smartHomeSiriStep1 =>
      'Open the Shortcuts app on your iPhone or iPad.';

  @override
  String get smartHomeSiriStep2 => 'Tap \"+\" to create a new shortcut.';

  @override
  String get smartHomeSiriStep3 =>
      'Search for \"PrayCalc\" in the actions list.';

  @override
  String get smartHomeSiriStep4 =>
      'Add \"Next Prayer Time\" or \"Prayer Times Today\".';

  @override
  String get smartHomeSiriStep5 =>
      'Optionally add it to an automation (e.g. daily at Fajr).';

  @override
  String get smartHomeSiriStep6 =>
      'Say \"Hey Siri, next prayer time\" to test.';

  @override
  String get smartHomeSiriFootnote => 'Requires iOS 16 or later.';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant Setup';

  @override
  String get smartHomeHassStep1 =>
      'Install HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 =>
      'In HACS, search for \"PrayCalc\" and install.';

  @override
  String get smartHomeHassStep3 =>
      'Go to Settings > Devices & Services > Add Integration.';

  @override
  String get smartHomeHassStep4 => 'Search for \"PrayCalc\" and select it.';

  @override
  String get smartHomeHassStep5 =>
      'Enter your PrayCalc API key (generated in your account).';

  @override
  String get smartHomeHassStep6 =>
      'Configure your location and calculation method.';

  @override
  String get smartHomeHassFootnote =>
      'Requires Home Assistant 2024.1+ with HACS.';

  @override
  String get smartHomeApiKey => 'API Key';

  @override
  String get smartHomeGenerateApiKey => 'Generate API Key';

  @override
  String get smartHomeApiKeyNotReady =>
      'API key generation will be available once the PrayCalc smart service is deployed.';

  @override
  String get smartHomeApiKeyDesc =>
      'You will need an API key to connect Home Assistant to your PrayCalc account.';

  @override
  String get smartHomeLinkedStatus => 'Linked';

  @override
  String get smartHomeNotLinkedStatus => 'Not linked';

  @override
  String get smartHomeCouldNotOpen => 'Could not open the link.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total completed';
  }

  @override
  String get adhkarReset => 'Reset';

  @override
  String get syncHistoryTitle => 'Sync History';

  @override
  String get syncClearHistory => 'Clear history';

  @override
  String get syncNoConflicts =>
      'No sync conflicts detected. All devices are in sync.';

  @override
  String get syncDomainSettings => 'Settings';

  @override
  String get syncDomainCities => 'Saved Cities';

  @override
  String get syncDomainPrayerLogs => 'Prayer Logs';

  @override
  String get syncTimeJustNow => 'just now';

  @override
  String syncTimeMinAgo(int min) {
    return '${min}m ago';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '${hour}h ago';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '${day}d ago';
  }

  @override
  String get pinCity => 'Pin';

  @override
  String get pinMaxReached =>
      'Maximum 5 pinned cities. Upgrade to Ummat+ for more.';

  @override
  String pinCityUnpinned(String city) {
    return '$city unpinned';
  }

  @override
  String get pinUndo => 'Undo';
}
