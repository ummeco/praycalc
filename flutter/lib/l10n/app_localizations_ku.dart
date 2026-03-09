// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Kurdish (`ku`).
class AppLocalizationsKu extends AppLocalizations {
  AppLocalizationsKu([String locale = 'ku']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'بەرەبان';

  @override
  String get prayerSunrise => 'خۆرهەڵاتن';

  @override
  String get prayerDhuhr => 'نیوەڕۆ';

  @override
  String get prayerAsr => 'عەسر';

  @override
  String get prayerMaghrib => 'مەغریب';

  @override
  String get prayerIsha => 'عیشا';

  @override
  String get prayerQiyam => 'قیام';

  @override
  String get prayerSuhoor => 'سحور';

  @override
  String get prayerIftar => 'ئیفتار';

  @override
  String get hijriMuharram => 'موحەڕەم';

  @override
  String get hijriSafar => 'سەفەر';

  @override
  String get hijriRabiAlAwwal => 'ڕەبیعی یەکەم';

  @override
  String get hijriRabiAlThani => 'ڕەبیعی دووەم';

  @override
  String get hijriJumadaAlAwwal => 'جومادا یەکەم';

  @override
  String get hijriJumadaAlThani => 'جومادا دووەم';

  @override
  String get hijriRajab => 'ڕەجەب';

  @override
  String get hijriShaban => 'شەعبان';

  @override
  String get hijriRamadan => 'ڕەمەزان';

  @override
  String get hijriShawwal => 'شەوواڵ';

  @override
  String get hijriDhulQidah => 'زولقەعدە';

  @override
  String get hijriDhulHijjah => 'زولحیججە';

  @override
  String get monthJan => 'کانوونی دووەم';

  @override
  String get monthFeb => 'شوبات';

  @override
  String get monthMar => 'ئازار';

  @override
  String get monthApr => 'نیسان';

  @override
  String get monthMay => 'ئایار';

  @override
  String get monthJun => 'حوزەیران';

  @override
  String get monthJul => 'تەممووز';

  @override
  String get monthAug => 'ئاب';

  @override
  String get monthSep => 'ئەیلوول';

  @override
  String get monthOct => 'تشرینی یەکەم';

  @override
  String get monthNov => 'تشرینی دووەم';

  @override
  String get monthDec => 'کانوونی یەکەم';

  @override
  String get monthJanuary => 'کانوونی دووەم';

  @override
  String get monthFebruary => 'شوبات';

  @override
  String get monthMarch => 'ئازار';

  @override
  String get monthApril => 'نیسان';

  @override
  String get monthMayFull => 'ئایار';

  @override
  String get monthJune => 'حوزەیران';

  @override
  String get monthJuly => 'تەممووز';

  @override
  String get monthAugust => 'ئاب';

  @override
  String get monthSeptember => 'ئەیلوول';

  @override
  String get monthOctober => 'تشرینی یەکەم';

  @override
  String get monthNovember => 'تشرینی دووەم';

  @override
  String get monthDecember => 'کانوونی یەکەم';

  @override
  String get dayMonShort => 'دوو';

  @override
  String get dayTueShort => 'سێ';

  @override
  String get dayWedShort => 'چوا';

  @override
  String get dayThuShort => 'پێن';

  @override
  String get dayFriShort => 'هەی';

  @override
  String get daySatShort => 'شەم';

  @override
  String get daySunShort => 'یەک';

  @override
  String get dayMonday => 'دووشەممە';

  @override
  String get dayTuesday => 'سێشەممە';

  @override
  String get dayWednesday => 'چوارشەممە';

  @override
  String get dayThursday => 'پێنجشەممە';

  @override
  String get dayFriday => 'هەینی';

  @override
  String get daySaturday => 'شەممە';

  @override
  String get daySunday => 'یەکشەممە';

  @override
  String get daySuChart => 'یەک';

  @override
  String get dayMoChart => 'دوو';

  @override
  String get dayTuChart => 'سێ';

  @override
  String get dayWeChart => 'چوا';

  @override
  String get dayThChart => 'پێن';

  @override
  String get dayFrChart => 'هەی';

  @override
  String get daySaChart => 'شەم';

  @override
  String get chooseCityLabel => 'شارێک هەڵبژێرە';

  @override
  String get setCityFab => 'شار دابنێ';

  @override
  String prayerTimesError(Object error) {
    return 'کاتی نوێژەکان نەبوو بژمێردرێت.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer لە';
  }

  @override
  String get ramadanMubarak => 'ڕەمەزان مبارەک';

  @override
  String ramadanDayProgress(int day) {
    return 'ڕۆژی $day / ٣٠';
  }

  @override
  String get lastTenNights => '١٠ شەوی کۆتایی';

  @override
  String get laylatulQadr => 'شەوی قەدر';

  @override
  String get homeSuffixAH => 'کۆچی';

  @override
  String get homeSuffixCE => 'ز';

  @override
  String get homeNoCitySelected => 'هیچ شارێک هەڵنەبژێردراوە';

  @override
  String get homeNoCityHint =>
      'سەرەوە بپەنجە بکە بۆ گەڕان بۆ شارەکەت یان GPS چالاک بکە.';

  @override
  String get homeCouldNotCalc => 'نەتوانرا کاتی نوێژەکان بژمێردرێت.';

  @override
  String get homeQasr => 'قەسر';

  @override
  String get homeActionMonthlyTimes => 'کاتەکانی\nمانگانە';

  @override
  String get homeActionDuaDhikr => 'دعا و\nذکر';

  @override
  String get homeActionPrayerStats => 'ئامارەکانی\nنوێژ';

  @override
  String homePolarBanner(int count) {
    return '$count کاتی نوێژ ناتوانرێت بۆ شوێنەکەت بژمێردرێت لەم ماوەیەدا (خۆری نیوە شەو / شەوی قوتابی). لە ڕێکخستنەکاندا تەخمینی نزیکترین هێڵی پانی تاقی بکەرەوە.';
  }

  @override
  String get settingsTitle => 'ڕێکخستنەکان';

  @override
  String get settingsSectionPrayerCalc => 'ژمارەکردنی نوێژ';

  @override
  String get settingsCalcMethod => 'شێوازی ژمارەکردن';

  @override
  String get settingsCalcMethodAuto => 'ئۆتۆماتیکی (دینامیکی)';

  @override
  String get settingsHanafiAsr => 'عەسری حەنەفی';

  @override
  String get settingsHanafiAsrSubtitle =>
      'فاکتەری سێبەر ٢x (کاتی عەسری درەنگتر)';

  @override
  String get settingsSectionDisplay => 'پیشاندان';

  @override
  String get settings24hClock => 'کاتژمێری ٢٤ کاتژمێر';

  @override
  String get settingsFollowSystemTheme => 'شوێنکەوتنی تەمای سیستەم';

  @override
  String get settingsDarkMode => 'دۆخی تاریک';

  @override
  String get settingsSectionNotifications => 'ئاگادارکردنەوەکان';

  @override
  String get settingsPrayerNotifications => 'ئاگادارکردنەوەکانی نوێژ';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'بانگ، بیرکردنەوە، و ڕێکخستنی هەر نوێژێک';

  @override
  String get settingsPrayerAgendas => 'بەرنامەکانی نوێژ';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'بیرکردنەوەی تایبەت لە کاتی نوێژەکان';

  @override
  String get settingsAccount => 'هەژمار';

  @override
  String get settingsSignInToSync => 'چوونەژوورەوە بۆ هاوکاتکردن';

  @override
  String get settingsSignInToSyncSubtitle => 'داتاکانت لەسەر ئامێرەکان بپارێزە';

  @override
  String get settingsHomeScreen => 'شاشەی سەرەکی';

  @override
  String get settingsSkyGradient => 'پاشبنەمای گرادیەنتی ئاسمان';

  @override
  String get settingsSkyGradientSubtitle =>
      'ڕەنگە ئەنیمەیشنکراوەکانی ئاسمان بەپێی کاتی ڕۆژ';

  @override
  String get settingsWeatherGradient => 'گرادیەنتی ڕەنگی کەشوهەوا';

  @override
  String get settingsWeatherGradientSubtitle =>
      'ڕەنگەکانی ئاسمان بەپێی کەشوهەوای ناوخۆیی';

  @override
  String get settingsCountdownAnimation => 'ئەنیمەیشنی ژمارەی پاشگەز';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'بازنەی هەناسەدان لەسەر نوێژی داهاتوو';

  @override
  String get settingsPrayerTracking => 'بەدواداچوونی نوێژ';

  @override
  String get settingsTrackMyPrayers => 'نوێژەکانم تۆمار بکە';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'تۆمارکردنی ئەو نوێژانەی هەر ڕۆژ ئەنجامیان دەدەیت';

  @override
  String get settingsPrayerStats => 'ئامارەکانی نوێژ';

  @override
  String get settingsPrayerStatsSubtitle =>
      'زنجیرە، نەخشەکانی هەفتانە و مانگانە';

  @override
  String get settingsJumuahKahf => 'بیرکردنەوەی سوورەتی کەهف لە جومعەدا';

  @override
  String get settingsJumuahKahfSubtitle =>
      'بیرکردنەوە لە هەر جومعەیەک بۆ خوێندنەوەی سوورەتی کەهف';

  @override
  String get settingsTravel => 'گەشتکردن';

  @override
  String get settingsTravelMode => 'دۆخی گەشتکردن';

  @override
  String get settingsTravelModeSubtitle =>
      'بە ئۆتۆماتیکی دەزانێت کەی لە ماڵەوە دوورەیت و نوێژەکان ڕێکدەخات';

  @override
  String get settingsHomeLocation => 'شوێنی ماڵ';

  @override
  String get settingsHomeLocationNotSet =>
      'دانەنراوە — بپەنجە بکە بۆ بەکارهێنانی شوێنی ئێستا';

  @override
  String get settingsClearHomeLocation => 'پاککردنەوەی شوێنی ماڵ';

  @override
  String get settingsTravelRulings => 'حوکمەکانی نوێژی گەشتیار';

  @override
  String get settingsTravelRulingsSubtitle =>
      'قەسر، کۆکردنەوە، و ڕێنمایەکانی گەشتیار';

  @override
  String get settingsSmartHome => 'ماڵی زیرەک';

  @override
  String get settingsSmartHomeIntegrations => 'پەیوەندیکردنەکانی ماڵی زیرەک';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit، گووگڵ هۆم، ئەلێکسا، Home Assistant';

  @override
  String get settingsTvDisplay => 'پیشاندانی تەلەفزیۆن';

  @override
  String get settingsTvHome => 'پیشاندانی ماڵەوەی تەلەفزیۆن';

  @override
  String get settingsTvHomeSubtitle =>
      'کاتژمێری نوێژ بە تەواوی شاشە بۆ تەلەفزیۆن';

  @override
  String get settingsMasjidDisplay => 'پیشاندانی مزگەوت';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'خشتەی بانگ/ئیقامە بۆ شاشەکانی مزگەوت';

  @override
  String get settingsTvSettings => 'ڕێکخستنەکانی تەلەفزیۆن';

  @override
  String get settingsTvSettingsSubtitle =>
      'دۆخی مزگەوت، ئۆفسێتەکانی ئیقامە، ئەمبیەنت';

  @override
  String get settingsAboutPrayCalc => 'دەربارەی PrayCalc';

  @override
  String get syncSynced => 'هاوکاتکراو';

  @override
  String get syncSyncing => 'هاوکاتکردن...';

  @override
  String get syncOffline => 'ئۆفلاین';

  @override
  String get syncError => 'هەڵەی هاوکاتکردن';

  @override
  String get notifSettingsTitle => 'ئاگادارکردنەوەکان و بانگ';

  @override
  String get notifAdhanLabel => 'بانگ';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'بیرکردنەوە: $minutes خولەک پێش';
  }

  @override
  String notifVolumePct(int pct) {
    return 'دەنگ: $pct%';
  }

  @override
  String get notifTestAdhan => 'تاقیکردنەوەی بانگ';

  @override
  String get notifModeOff => 'کوژاندنەوە';

  @override
  String get notifModeReminderOnly => 'تەنها بیرکردنەوە';

  @override
  String get notifModeArrival => 'لە کاتی نوێژدا';

  @override
  String get notifModeBoth => 'بیرکردنەوە + هاتن';

  @override
  String get citySearchHint => 'گەڕان بۆ شار…';

  @override
  String get citySearchDetectTooltip => 'شوێنەکەم بدۆزەرەوە';

  @override
  String get citySearchNoCityGps => 'نەتوانرا شار لە GPS بدۆزرێتەوە.';

  @override
  String get citySearchPermissionDenied =>
      'ڕێگەپێدانی شوێن ڕەتکرایەوە. بە دەستی بگەڕێ.';

  @override
  String get citySearchNoResults => 'هیچ شارێک نەدۆزرایەوە.';

  @override
  String get citySearchStartTyping => 'دەست بە تایپکردن بکە بۆ گەڕان…';

  @override
  String get agendasTitle => 'بەرنامەکانی نوێژ';

  @override
  String get agendasEmpty =>
      'هێشتا هیچ بەرنامەیەک نییە.\n+ بپەنجە بکە بۆ زیادکردنی بیرکردنەوە بە نوێژەکانت.';

  @override
  String get agendasUndo => 'گەڕانەوە';

  @override
  String agendasRemoved(String label) {
    return '$label لابرا';
  }

  @override
  String get agendaNewTitle => 'بەرنامەی نوێ';

  @override
  String get agendaEditTitle => 'دەستکاریکردنی بەرنامە';

  @override
  String get agendaSave => 'پاشەکەوتکردن';

  @override
  String get agendaLabelEmpty => 'ناونیشان نابێت بەتاڵ بێت';

  @override
  String get agendaLabelField => 'ناونیشان';

  @override
  String get agendaLabelHint => 'بۆ نموونە: هەستان بۆ بەرەبان';

  @override
  String get agendaPrayerSection => 'نوێژ';

  @override
  String get agendaTimeOffsetSection => 'ئۆفسێتی کات';

  @override
  String get agendaOffsetAtPrayerTime => 'لە کاتی نوێژدا';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes خولەک پێش';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes خولەک دوا';
  }

  @override
  String get agendaRepeatSection => 'دووبارەکردنەوە';

  @override
  String get agendaNotifTypeSection => 'جۆری ئاگادارکردنەوە';

  @override
  String get agendaNotifSilent => 'بێدەنگ';

  @override
  String get agendaNotifSound => 'دەنگ';

  @override
  String get agendaNotifVibrate => 'لەرزین';

  @override
  String get agendaDayM => 'دوو';

  @override
  String get agendaDayT => 'سێ';

  @override
  String get agendaDayW => 'چوا';

  @override
  String get agendaDayF => 'هەی';

  @override
  String get agendaDayS => 'شەم';

  @override
  String get moonTitle => 'مانگ و ڕۆژژمێری کۆچی';

  @override
  String moonIlluminated(int pct) {
    return '$pct% ڕووناکراوە';
  }

  @override
  String get moonFullTonight => 'مانگی تەواو ئەمشەو!';

  @override
  String get moonNextTomorrow => 'مانگی تەواوی داهاتوو سبەی';

  @override
  String moonNextDays(int days) {
    return 'مانگی تەواوی داهاتوو لە $days ڕۆژدا';
  }

  @override
  String moonAge(String age) {
    return 'تەمەنی مانگ: $age ڕۆژ';
  }

  @override
  String get moonPhaseNewMoon => 'مانگی نوێ';

  @override
  String get moonPhaseWaxingCrescent => 'هیلالی گەشبوو';

  @override
  String get moonPhaseFirstQuarter => 'چارەکی یەکەم';

  @override
  String get moonPhaseWaxingGibbous => 'گەشبووی پڕ';

  @override
  String get moonPhaseFullMoon => 'مانگی تەواو';

  @override
  String get moonPhaseWaningGibbous => 'کەمبووی پڕ';

  @override
  String get moonPhaseLastQuarter => 'چارەکی کۆتایی';

  @override
  String get moonPhaseWaningCrescent => 'هیلالی کەمبوو';

  @override
  String get moonHilalVisibility => 'بینینی هیلالی داهاتوو';

  @override
  String get moonRegionMiddleEast => 'ڕۆژهەڵاتی ناوەڕاست';

  @override
  String get moonRegionWestAfrica => 'ئەفریقای ڕۆژئاوا';

  @override
  String get moonRegionSouthAsia => 'ئاسیای باشوور';

  @override
  String get moonRegionEurope => 'ئەوروپا';

  @override
  String get moonRegionAmericas => 'ئەمریکاکان';

  @override
  String get moonVisible => 'بینراو';

  @override
  String get moonNotVisible => 'نابینراو';

  @override
  String get moonPossible => 'گونجاو';

  @override
  String get moonUpcomingDates => 'بەروارە ئیسلامییەکانی داهاتوو';

  @override
  String get hijriTodayLabel => 'ئەمڕۆ لە ڕۆژژمێری کۆچیدا';

  @override
  String ramadanBeginsLabel(int year) {
    return 'ڕەمەزانی $year کۆچی دەست پێدەکات';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days ڕۆژ ماوە';
  }

  @override
  String get moonLunarCycle => 'خولی مانگ';

  @override
  String moonDayOfCycle(int day) {
    return 'ڕۆژی $day لە ~٢٩.٥';
  }

  @override
  String get moonHilalSightingForecast => 'پێشبینی بینینی هیلال';

  @override
  String get moonHilalVisibilityMap => 'نەخشەی بینینی هیلال';

  @override
  String moonDayN(int day) {
    return 'ڕۆژی $day';
  }

  @override
  String get moonGlobalSighting => 'بینینی جیهانی';

  @override
  String get moonZoneNakedEye => 'بە چاوی ڕووت';

  @override
  String get moonZoneBinoculars => 'بە دووربین';

  @override
  String get moonZoneVeryDifficult => 'زۆر قورس';

  @override
  String get moonZoneNotVisible => 'نابینراو';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year کۆچی بە گومانەوە ٢٩ ڕۆژ دەبێت. چاوەڕوان دەکرێت هیلال لە ڕۆژی ٢٩ بینرێت، ئینشاءاڵڵاه.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year کۆچی بە گومانەوە ٣٠ ڕۆژ دەبێت. هیلال لە ڕۆژی ٢٩ بەگومان نابینرێت — مانگ ٣٠ ڕۆژ تەواو دەبێت.';
  }

  @override
  String get moonUmmAlQura => 'ئوم القرا';

  @override
  String get moonSaudiArabia => 'عەرەبستانی سعوودی';

  @override
  String get moonFCNACalc => 'FCNA / ژمارەکردن';

  @override
  String get moonNorthAmerica => 'ئەمریکای باکوور';

  @override
  String moonNDays(int days) {
    return '$days ڕۆژ';
  }

  @override
  String moonStarts(String month) {
    return '$month دەست پێدەکات:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'تەمەنی مانگ لە ئاوابوون: $hours ک';
  }

  @override
  String get moon7DayLunarCalendar => 'ڕۆژژمێری مانگی ٧ ڕۆژە';

  @override
  String get moonUpcomingIslamicEvents => 'بۆنە ئیسلامییەکانی داهاتوو';

  @override
  String get moonTodayLabel => 'ئەمڕۆ';

  @override
  String get moonTomorrowLabel => 'سبەی';

  @override
  String get calDateCol => 'بەروار';

  @override
  String get calHijriCol => 'کۆچی';

  @override
  String get calFajrCol => 'بەرەبان';

  @override
  String get calSunriseCol => 'خۆرهەڵاتن';

  @override
  String get calDhuhrCol => 'نیوەڕۆ';

  @override
  String get calAsrCol => 'عەسر';

  @override
  String get calMaghribCol => 'مەغریب';

  @override
  String get calIshaCol => 'عیشا';

  @override
  String get calNoCityText => 'سەرەتا شارەکەت دابنێ\nبۆ بینینی ڕۆژژمێری نوێژ.';

  @override
  String get calShareTooltip => 'هاوبەشکردنی ڕۆژژمێر';

  @override
  String get calPrevMonthTooltip => 'مانگی پێشوو';

  @override
  String get calNextMonthTooltip => 'مانگی داهاتوو';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'کاتی نوێژ — $month';
  }

  @override
  String get qiblaTitle => 'قیبلە';

  @override
  String get qiblaSwitchToCompass => 'گۆڕین بۆ قیبلەنامە';

  @override
  String get qiblaSwitchToAR => 'گۆڕین بۆ کامێرای AR';

  @override
  String get qiblaNoCityText =>
      'سەرەتا شارەکەت دابنێ\nبۆ ژمارەکردنی ئاراستەی قیبلە.';

  @override
  String get qiblaCompassUnavailable =>
      'هەستەوەری قیبلەنامە لەم ئامێرەدا بەردەست نییە.';

  @override
  String get qiblaCalibrate => 'کالیبرە: مۆبایلەکەت بە شێوەی ٨ بجوڵێنە.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° لە باکوورەوە';
  }

  @override
  String qiblaFrom(String city) {
    return 'لە $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist کم لە کەعبە';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K کم لە کەعبە';
  }

  @override
  String get qiblaFacingQibla => 'بەرەو قیبلە ✓';

  @override
  String get tasbeehTitle => 'تەسبیح';

  @override
  String get tasbeehResetTooltip => 'ڕیسێتکردن';

  @override
  String get tasbeehTapToSwitch => 'ناونیشان بپەنجە بکە بۆ گۆڕین';

  @override
  String get tasbeehTapToCount => 'هەر شوێنێک بپەنجە بکە بۆ ژمارەکردن';

  @override
  String get tasbeehResetDialogTitle => 'ژمارەکە ڕیسێت بکرێت؟';

  @override
  String get tasbeehResetDialogContent =>
      'ئەمە ژمارەی ئێستا بۆ سفر ڕیسێت دەکات.';

  @override
  String get tasbeehCancel => 'پاشگەزبوونەوە';

  @override
  String get tasbeehReset => 'ڕیسێتکردن';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'ئەمڕۆ: $count ذکر';
  }

  @override
  String get tasbeehLast7Days => '٧ ڕۆژی ڕابردوو';

  @override
  String get tasbeehNoHistory => 'هێشتا مێژووی نییە — دەست بە ژمارەکردن بکە!';

  @override
  String tasbeehComplete(int count) {
    return 'تەسبیح تەواو بوو! $count ذکر';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'ماڵی زیرەک';

  @override
  String get smartHomeSubtitle => 'ئامێرەکانت بە کاتی نوێژەوە بەستە';

  @override
  String get smartHomeGoogleHome => 'گووگڵ هۆم';

  @override
  String get smartHomeGoogleHomeDesc =>
      'لە گووگڵ بپرسە دەربارەی کاتی نوێژ و ئاراستەی قیبلە';

  @override
  String get smartHomeAlexa => 'ئەمازۆن ئەلێکسا';

  @override
  String get smartHomeAlexaDesc =>
      'لە ئەلێکسا بپرسە دەربارەی کاتی نوێژ، نوێژی داهاتوو، و زیاتر';

  @override
  String get smartHomeSiri => 'شۆرتکەتەکانی سیری';

  @override
  String get smartHomeSiriDesc => 'شۆرتکەتی تایبەت بۆ کاتی نوێژ دروست بکە';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'ئۆتۆماتیککردنی لایت، پیشاندان، و بیرکردنەوە لە کاتی نوێژدا';

  @override
  String get smartHomeLinkAccount => 'بەستنی هەژمار';

  @override
  String get smartHomeLinked => 'بەسترا';

  @override
  String get smartHomeUnlink => 'لابردنی بەستن';

  @override
  String get smartHomeSetupInstructions => 'ڕێنمایەکانی دامەزراندن';

  @override
  String get smartHomeRequiresUmmatPlus => 'پێویستی بە Ummat+ هەیە';

  @override
  String get smartHomeTroubleshooting => 'چاکسازی';

  @override
  String get smartHomeTestConnection => 'تاقیکردنەوەی پەیوەندی';

  @override
  String get smartHomeConnectionSuccess => 'بە سەرکەوتوویی پەیوەست بوو';

  @override
  String get smartHomeConnectionFailed =>
      'پەیوەندی سەرنەکەوت. بەستنی هەژمارەکەت بپشکنە.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'تایبەتمەندییە پرێمیەمەکانی کاتی نوێژ';

  @override
  String get subscriptionUpgrade => 'نوێکردنەوە بۆ Ummat+';

  @override
  String get subscriptionRestore => 'گەڕاندنەوەی کڕین';

  @override
  String get subscriptionManage => 'بەڕێوەبردنی بەشداری';

  @override
  String get subscriptionCancel => 'هەڵوەشاندنەوەی بەشداری';

  @override
  String get subscriptionActive => 'چالاک';

  @override
  String get subscriptionExpired => 'بەسەرچوو';

  @override
  String get subscriptionFree => 'بەخۆڕایی';

  @override
  String get subscriptionFreeDesc => 'کاتی نوێژی بنەڕەتی، قیبلە، ڕۆژژمێر';

  @override
  String get subscriptionPlusDesc =>
      'ماڵی زیرەک، پیشاندانی تەلەفزیۆن، ویدجێت، و زیاتر';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count داواکاری بەخۆڕایی ماوە';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/ساڵانە';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/مانگانە';
  }

  @override
  String get subscriptionFeatureSmartHome => 'یەکگرتنی ماڵی زیرەک';

  @override
  String get subscriptionFeatureTV => 'دۆخی پیشاندانی تەلەفزیۆن';

  @override
  String get subscriptionFeatureWidgets => 'ویدجێتەکانی شاشەی سەرەکی';

  @override
  String get subscriptionFeatureWatch => 'کۆمپلیکەیشنەکانی کاتژمێر';

  @override
  String get subscriptionFeatureSync => 'هاوکاتکردنی نێوان ئامێرەکان';

  @override
  String get subscriptionFeatureAdFree => 'بێ ڕیکلام';

  @override
  String get watchTitle => 'کاتژمێر';

  @override
  String get watchNextPrayer => 'نوێژی داهاتوو';

  @override
  String get watchAllPrayers => 'هەموو نوێژەکان';

  @override
  String get watchComplication => 'کۆمپلیکەیشن';

  @override
  String get nextPrayer => 'نوێژی داهاتوو';

  @override
  String get allPrayers => 'هەموو نوێژەکان';

  @override
  String get today => 'ئەمڕۆ';

  @override
  String get tomorrow => 'سبەی';

  @override
  String get thisWeek => 'ئەم هەفتەیە';

  @override
  String get thisMonth => 'ئەم مانگە';

  @override
  String get loginCreateAccount => 'هەژمار دروست بکە';

  @override
  String get loginSignIn => 'چوونەژوورەوە';

  @override
  String get loginWelcomeBack => 'بەخێربێیتەوە';

  @override
  String get loginJoinPrayCalc => 'بەشداربوون لە PrayCalc';

  @override
  String get loginSyncSubtitle => 'داتای نوێژەکانت لەسەر ئامێرەکان هاوکات بکە';

  @override
  String get loginContinueGoogle => 'بەردەوامبوون بە گووگڵ';

  @override
  String get loginOr => 'یان';

  @override
  String get loginSigningIn => 'چوونەژوورەوە…';

  @override
  String get loginNameLabel => 'ناوی پیشاندان (ئارەزوومەندانە)';

  @override
  String get loginEmailLabel => 'ئیمەیل';

  @override
  String get loginPasswordLabel => 'وشەی نهێنی';

  @override
  String get loginEmailRequired => 'ئیمەیل پێویستە';

  @override
  String get loginEmailInvalid => 'ئیمەیلێکی دروست بنووسە';

  @override
  String get loginPasswordRequired => 'وشەی نهێنی پێویستە';

  @override
  String get loginPasswordMinLength => 'وشەی نهێنی دەبێت لانیکەم ٨ پیت بێت';

  @override
  String get loginForgotPassword => 'وشەی نهێنی لەبیرکردووە؟';

  @override
  String get loginEnterEmailFirst => 'سەرەتا ئیمەیلەکەت بنووسە';

  @override
  String get loginResetSent => 'ئیمەیلی ڕیسێتکردنی وشەی نهێنی نێردرا';

  @override
  String get loginResetFailed => 'نەتوانرا ئیمەیلی ڕیسێت بنێردرێت';

  @override
  String get loginNewToPrayCalc => 'تازەیت لە PrayCalc؟';

  @override
  String get loginAlreadyHaveAccount => 'پێشتر هەژمارت هەیە؟';

  @override
  String get accountTitle => 'هەژمار';

  @override
  String get accountNotSignedIn => 'چوونەژوورەوە نەکراوە';

  @override
  String get accountSyncSection => 'هاوکاتکردن';

  @override
  String get accountSyncStatus => 'بارودۆخی هاوکاتکردن';

  @override
  String get accountSyncNow => 'ئێستا هاوکات بکە';

  @override
  String get accountSyncHistory => 'مێژووی هاوکاتکردن';

  @override
  String get accountNoConflicts => 'هیچ ناکۆکییەک نەدۆزرایەوە';

  @override
  String accountConflictsResolved(int count) {
    return '$count چارەسەرکرا';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'هاوکاتکرا $time';
  }

  @override
  String get accountOfflineStatus =>
      'ئۆفلاین. گۆڕانکارییەکان بە ناوخۆیی پاشەکەوتکراون.';

  @override
  String get accountSyncErrorStatus =>
      'هەڵەی هاوکاتکردن. دووبارە هەوڵ دەدرێتەوە.';

  @override
  String get accountDataSection => 'داتا';

  @override
  String get accountExportData => 'هەناردەکردنی داتا';

  @override
  String get accountExportSubtitle => 'داگرتنی ڕێکخستنەکان و تۆمارەکانی نوێژ';

  @override
  String get accountExportFailed => 'نەتوانرا داتا هەناردە بکرێت';

  @override
  String get accountSignOutTitle => 'چوونەدەرەوە';

  @override
  String get accountSignOutBody =>
      'داتای ناوخۆییت دەمێنێتەوە. دووبارە بچۆرەوە بۆ بەردەوامبوونی هاوکاتکردن.';

  @override
  String get accountDeleteAccount => 'سڕینەوەی هەژمار';

  @override
  String get accountDeleteSubtitle => 'سڕینەوەی هەمیشەیی هەژمار و داتا';

  @override
  String get accountDeleteBody =>
      'ئەمە هەژمارەکەت و هەموو داتای هاوکاتکراو بە هەمیشەیی دەسڕێتەوە. داتای ناوخۆیی لەسەر ئەم ئامێرە نالابردرێت.\n\nئەم کارە ناتوانرێت پاشگەزبکرێتەوە.';

  @override
  String get accountDeleted => 'هەژمار سڕدرایەوە';

  @override
  String get accountDeleteFailed => 'نەتوانرا هەژمار بسڕدرێتەوە';

  @override
  String get accountTimeJustNow => 'ئێستا';

  @override
  String accountTimeMinAgo(int min) {
    return '$minخ پێش';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hourک پێش';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$dayڕ پێش';
  }

  @override
  String get statsTitle => 'ئامارەکانی نوێژ';

  @override
  String get statsShareTooltip => 'هاوبەشکردنی ئامارەکان';

  @override
  String get statsTodayPrayers => 'نوێژەکانی ئەمڕۆ';

  @override
  String statsTodayCount(int done) {
    return '$done / ٥';
  }

  @override
  String get statsStreak => 'زنجیرە';

  @override
  String get statsDays => 'ڕۆژ';

  @override
  String get statsThisWeek => 'ئەم هەفتەیە';

  @override
  String get statsCompletion => 'تەواوکردن';

  @override
  String get statsThisMonth => 'ئەم مانگە';

  @override
  String get statsMostMissed => 'زۆرترین نوێژی بەجێماو';

  @override
  String get statsThisWeekLabel => 'ئەم هەفتەیە';

  @override
  String get statsWeeklyChart => 'تەواوکردنی هەفتانە بەپێی نوێژ';

  @override
  String get statsMonthlyChart => 'تەواوکردنی مانگانە بەپێی نوێژ';

  @override
  String statsTotalLogged(int count) {
    return '$count کۆی نوێژی تۆمارکراو';
  }

  @override
  String get statsKeepItUp => 'بەردەوام بە!';

  @override
  String get statsShareTitle => 'ئامارەکانی نوێژی PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'زنجیرە: $days ڕۆژ';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'هەفتانە: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'مانگانە: $pct%';
  }

  @override
  String get statsShareBreakdown => 'وردبینی هەفتانە:';

  @override
  String get aboutTitle => 'دەربارەی PrayCalc';

  @override
  String get aboutWebsite => 'ماڵپەڕ';

  @override
  String get aboutContact => 'پەیوەندی';

  @override
  String get aboutLicenses => 'مۆڵەتەکانی سەرچاوە کراوە';

  @override
  String get aboutCouldNotOpen => 'نەتوانرا بەستەرەکە بکرێتەوە.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. هەموو مافەکان پارێزراون.\n\nکاتی نوێژ بە مۆتۆری pray_calc_dart ژمێردراوە. وردی بەپێی شوێنی GPS و شێوازی ژمارەکردنی هەڵبژاردراوە.';
  }

  @override
  String get commonCancel => 'پاشگەزبوونەوە';

  @override
  String get commonSave => 'پاشەکەوتکردن';

  @override
  String get commonDelete => 'سڕینەوە';

  @override
  String get commonEdit => 'دەستکاری';

  @override
  String get commonRetry => 'هەوڵی دووبارە';

  @override
  String get commonClose => 'داخستن';

  @override
  String get commonDone => 'تەواو';

  @override
  String get commonBack => 'گەڕانەوە';

  @override
  String get commonNext => 'داهاتوو';

  @override
  String get commonSkip => 'بازدان';

  @override
  String get commonContinue => 'بەردەوامبوون';

  @override
  String get commonOk => 'باشە';

  @override
  String get commonYes => 'بەڵێ';

  @override
  String get commonNo => 'نەخێر';

  @override
  String get commonShare => 'هاوبەشکردن';

  @override
  String get commonCopy => 'کۆپی';

  @override
  String get commonCopied => 'کۆپی کرا بۆ کلیپبۆرد';

  @override
  String get commonLoading => 'بارکردن...';

  @override
  String get commonError => 'شتێک هەڵە بوو';

  @override
  String get commonErrorRetry => 'شتێک هەڵە بوو. بپەنجە بکە بۆ هەوڵی دووبارە.';

  @override
  String get commonNoInternet => 'پەیوەندی ئینتەرنێت نییە';

  @override
  String get commonOfflineMode => 'دۆخی ئۆفلاین';

  @override
  String get commonSignIn => 'چوونەژوورەوە';

  @override
  String get commonSignOut => 'چوونەدەرەوە';

  @override
  String get commonSignUp => 'تۆمارکردن';

  @override
  String get commonProfile => 'پرۆفایل';

  @override
  String get commonAccount => 'هەژمار';

  @override
  String get commonAbout => 'دەربارە';

  @override
  String commonVersion(String version) {
    return 'وەشان $version';
  }

  @override
  String get commonPrivacyPolicy => 'سیاسەتی تایبەتمەندی';

  @override
  String get commonTermsOfService => 'مەرجەکانی خزمەتگوزاری';

  @override
  String get commonRateApp => 'هەڵسەنگاندنی ئەپ';

  @override
  String get commonFeedback => 'ناردنی فیدباک';

  @override
  String get commonHelp => 'یارمەتی';

  @override
  String get commonLanguage => 'زمان';

  @override
  String get commonOpenSettings => 'کردنەوەی ڕێکخستنەکان';

  @override
  String get travelNotificationTitle => 'ئێستا گەشت دەکەیت';

  @override
  String get travelNotificationBody =>
      'نوێژەکان بکوتردراو بن. بپەنجە بکە بۆ زانینی حوکمەکانی گەشتکردن.';

  @override
  String get travelRulingsTitle => 'گەشتکردن و نوێژ';

  @override
  String get travelRulingsIntro =>
      'حوکمە ئیسلامییەکانی نوێژ لە کاتی گەشتکردندا، بە سەرچاوەکانی زانایان لە قورئان و کۆمەڵە فەرموودە ڕاستەقینەکانەوە.';

  @override
  String get travelWhenTitle => 'کەی حوکمی گەشتکردن دەبەسترێتەوە؟';

  @override
  String get travelQasrTitle => 'کورتکردنەوەی نوێژ (قەسر)';

  @override
  String get travelJamTitle => 'کۆکردنەوەی نوێژ (جەمع)';

  @override
  String get travelDurationTitle => 'ماوەی گەشتکردن';

  @override
  String get travelReferencesTitle => 'سەرچاوەکانی زانایان';

  @override
  String get travelLearnMore => 'زیاتر بزانە';

  @override
  String get travelHanafiDefaultTitle =>
      'بۆچی PrayCalc ڕای حەنەفی وەک بنەڕەت بەکاردەهێنێت';

  @override
  String get travelDeeperScholarly => 'گفتوگۆی ژەناتری زانایان';

  @override
  String get onboardingTitle1 => 'کاتی نوێژ، لە هەر شوێنێک بیت';

  @override
  String get onboardingBody1 =>
      'کاتی نوێژی وورد بە GPS بۆ هەر شارێکی زەوی. لە بەرەبانەوە تا عیشا، لە خۆرهەڵاتنەوە تا قیام. بە مۆتۆری ژمارەکردنی تایبەتی ئێمە، دروستکراو بۆ وردی.';

  @override
  String get onboardingTitle2 => 'شوێنەکەت، کاتەکانت';

  @override
  String get onboardingBody2 =>
      'گەڕان بکە بۆ هەر شارێک یان ڕێگە بدە GPS شوێنەکەت بدۆزێتەوە. PrayCalc کاتی نوێژ بۆ ٥ میلیۆن شار لە جیهاندا دەدۆزێتەوە.';

  @override
  String get onboardingTitle3 => 'هیچ نوێژێک لەدەست مەدە';

  @override
  String get onboardingBody3 =>
      'بانگ لە کاتی نوێژدا، بیرکردنەوە پێشتر. بەرنامە تایبەتەکان بۆ سحور، وانە، و زیاتر.';

  @override
  String get onboardingTitle4 => 'هەموو ئەوەی پێویستتە';

  @override
  String get onboardingBody4 =>
      'قیبلەنامە، ڕۆژژمێری نوێژ، قۆناغەکانی مانگی کۆچی، ژمێری تەسبیح. هەمووی لە یەک شوێن.';

  @override
  String get onboardingSkip => 'بازدان';

  @override
  String get onboardingGetStarted => 'دەستپێبکە';

  @override
  String get onboardingSignInTitle => 'بچۆرە ژوورەوە بۆ PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'مێژووی نوێژەکانت بپارێزە و\nلەسەر هەموو ئامێرەکانت هاوکات بکە.';

  @override
  String get onboardingContinueGoogle => 'بەردەوامبوون بە گووگڵ';

  @override
  String get onboardingContinueWithoutAccount => 'بەردەوامبوون بێ هەژمار';

  @override
  String get onboardingSigningIn => 'چوونەژوورەوە…';

  @override
  String get onboardingSelectLanguage => 'زمان هەڵبژێرە';

  @override
  String get duaDhikrTitle => 'دعا و ذکر';

  @override
  String get duaDhikrTabDua => 'دعاکان';

  @override
  String get duaDhikrTabDhikr => 'ذکر';

  @override
  String get duaDhikrTabTasbeeh => 'تەسبیح';

  @override
  String get duaDhikrTabMorning => 'بەیانی';

  @override
  String get duaDhikrTabEvening => 'ئێوارە';

  @override
  String get duaDhikrMorningAdhkar => 'ئەزکاری بەیانی';

  @override
  String get duaDhikrEveningAdhkar => 'ئەزکاری ئێوارە';

  @override
  String get calGregToggle => 'زایینی';

  @override
  String get calHijriToggle => 'کۆچی';

  @override
  String get calYearlyTooltip => 'ڕۆژژمێری ساڵانە';

  @override
  String get calExportIcsTooltip => 'هەناردەکردنی .ics';

  @override
  String get calMagCol => 'مەغ';

  @override
  String get qiblaShowOnMap => 'پیشاندان لەسەر نەخشە';

  @override
  String get qiblaWaitingCompass => 'چاوەڕوانی قیبلەنامە...';

  @override
  String get qiblaNoCompassSensor =>
      'هەستەوەری قیبلەنامە نییە. ئاراستەی قیبلە بە شێوازی جێگیر پیشاندەدرێت.';

  @override
  String get qiblaAccuracyExcellent => 'وردی نایاب';

  @override
  String get qiblaAccuracyGood => 'وردی باش';

  @override
  String get qiblaAccuracyFair =>
      'وردی مامناوەند. بە هەڵسووڕاندنی مۆبایل بە شێوەی ٨ کالیبرە بکە.';

  @override
  String get qiblaAccuracyLow =>
      'وردی نزم. بە هەڵسووڕاندنی مۆبایل بە شێوەی ٨ کالیبرە بکە.';

  @override
  String get qiblaToTheKaaba => 'بۆ کەعبە';

  @override
  String get qiblaYourLocation => 'شوێنەکەت';

  @override
  String get qiblaGpsAccurate => 'GPS وورد';

  @override
  String get qiblaCityCenter => 'ناوەندی شار';

  @override
  String get moonIlluminatedLabel => 'ڕووناکراو';

  @override
  String get moonAgeLabel => 'تەمەن';

  @override
  String get moonFirstQtr => 'چارەکی یەکەم';

  @override
  String get moonLastQtr => 'چارەکی کۆتایی';

  @override
  String get moonTonight => 'ئەمشەو';

  @override
  String get moonTomorrow => 'سبەی';

  @override
  String moonDaysAway(int days) {
    return '$daysڕ';
  }

  @override
  String get moonBeta => 'بێتا';

  @override
  String get setHomeTitle => 'دانانی شوێنی ماڵ';

  @override
  String get setHomeSearchHint => 'گەڕان بۆ شار، شارۆچکە یان کۆدی پۆستا…';

  @override
  String get setHomeClear => 'پاککردنەوە';

  @override
  String get setHomeUseCurrentLocation => 'بەکارهێنانی شوێنی ئێستا';

  @override
  String get setHomeDetectAndSet => 'شوێنەکەت بدۆزەرەوە و وەک ماڵ دایبنێ';

  @override
  String get setHomeAlreadySet => 'شوێنی ماڵ پێشتر دانراوە';

  @override
  String setHomeSetAs(String city) {
    return '$city وەک ماڵ دانرا';
  }

  @override
  String get setHomeCurrentLocationSet => 'شوێنی ئێستا وەک ماڵ دانرا';

  @override
  String get setHomePermissionDenied =>
      'ڕێگەپێدانی شوێن ڕەتکرایەوە. لە خوارەوە بۆ شارێک بگەڕێ.';

  @override
  String get setHomeGpsUnavailable => 'GPS بەردەست نییە. بە دەستی بگەڕێ.';

  @override
  String get setHomeNoCitiesFound => 'هیچ شارێک نەدۆزرایەوە.';

  @override
  String get setHomeSearchPrompt => 'بگەڕێ بۆ شاری ماڵەکەت';

  @override
  String get setHomeSearchBody =>
      'لە سەرەوە تایپ بکە بۆ گەڕان، یان شوێنی ئێستات بەکاربهێنە. دۆخی گەشتکردن دەزانێت کەی لە ماڵەوە دوورەیت.';

  @override
  String get subscriptionYouHavePlus => 'تۆ Ummat+ ت هەیە';

  @override
  String get subscriptionUpgradeTo => 'نوێکردنەوە بۆ Ummat+';

  @override
  String get subscriptionThankYou => 'سوپاس بۆ پشتیوانیکردنی PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'تایبەتمەندییە پرێمیەمەکان لەسەر هەموو ئامێرەکانت بکەرەوە.';

  @override
  String get subscriptionManageSub => 'بەڕێوەبردنی بەشداری';

  @override
  String get subscriptionWelcome => 'بەخێربێیت بۆ Ummat+!';

  @override
  String get subscriptionSubscribe => 'بەشداربوون';

  @override
  String get subscriptionFreeFeatures => 'تایبەتمەندییە بەخۆڕایییەکان';

  @override
  String get subscriptionPlusFeatures => 'تایبەتمەندییەکانی Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'کاتی نوێژ';

  @override
  String get subscriptionFeatureQibla => 'قیبلەنامە';

  @override
  String get subscriptionFeatureCalendar => 'ڕۆژژمێری مانگانە';

  @override
  String get subscriptionFeatureTasbeeh => 'ژمێری تەسبیح';

  @override
  String get subscriptionFeatureMoon => 'مانگ و کۆچی';

  @override
  String get smartHomeAlertType => 'جۆری ئاگادارکردنەوە';

  @override
  String get smartHomeAlertModal => 'مۆداڵی تەواوی شاشە';

  @override
  String get smartHomeAlertCorner => 'ئاگادارکردنەوەی گۆشە';

  @override
  String get smartHomeAlertNone => 'هیچ (بێدەنگ)';

  @override
  String get smartHomePauseMedia => 'وەستاندنی میدیا لە کاتی بانگ';

  @override
  String get smartHomeQuietHours => 'کاتژمێرە بێدەنگەکان';

  @override
  String get smartHomeQuietFrom => 'لە';

  @override
  String get smartHomeQuietTo => 'بۆ';

  @override
  String get smartHomePrayerAudio => 'دەنگی هەر نوێژێک';

  @override
  String get smartHomeAudioAdhan => 'بانگ';

  @override
  String get smartHomeAudioBeep => 'بیپ';

  @override
  String get smartHomeAudioSilent => 'بێدەنگ';

  @override
  String get aboutPrivacy => 'سیاسەتی تایبەتمەندی';

  @override
  String aboutVersion(String version) {
    return 'وەشان $version';
  }

  @override
  String get notifDefaultAdhan => 'بانگی بنەڕەت';

  @override
  String get notifFajrAdhan => 'بانگی بەرەبان';

  @override
  String get notifFajrAdhanSubtitle => 'لە کاتی نوێژی بەرەباندا دەنوسرێت';

  @override
  String get notifRegularAdhan => 'بانگی ئاسایی';

  @override
  String get notifRegularAdhanSubtitle =>
      'لە نیوەڕۆ، عەسر، مەغریب، عیشا دەنوسرێت';

  @override
  String get notifPerPrayerSettings => 'ڕێکخستنەکانی هەر نوێژێک';

  @override
  String get notifPreview => 'پێشبینین';

  @override
  String get tvSettingsTitle => 'ڕێکخستنەکانی تەلەفزیۆن';

  @override
  String get tvDisplayMode => 'دۆخی پیشاندان';

  @override
  String get tvMasjidMode => 'دۆخی مزگەوت';

  @override
  String get tvMasjidModeSubtitle => 'پیشاندانی تابلۆی گەورە بە کاتی ئیقامە';

  @override
  String get tvMasjidName => 'ناوی مزگەوت';

  @override
  String get tvMasjidNameTapToSet => 'بپەنجە بکە بۆ دانان';

  @override
  String get tvClock => 'کاتژمێر';

  @override
  String get tv24hFormat => 'فۆرماتی ٢٤ کاتژمێر';

  @override
  String get tvIqamahOffsets => 'ئۆفسێتەکانی ئیقامە (خولەک دوای بانگ)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset خولەک دوای بانگ';
  }

  @override
  String get tvQrCode => 'کۆدی QR';

  @override
  String get tvShowQrCode => 'پیشاندانی کۆدی QR';

  @override
  String get tvShowQrCodeSubtitle => 'پیشاندانی کۆدی QR لەسەر شاشەی مزگەوت';

  @override
  String get tvQrCodeUrl => 'بەستەری کۆدی QR';

  @override
  String get tvAmbientModeSection => 'دۆخی ئەمبیەنت';

  @override
  String get tvIdleTimeout => 'کاتی بێکاری';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes خولەک پێش چالاکبوونی ئەمبیەنت';
  }

  @override
  String get tvPhotoInterval => 'نێوانی وێنەکان';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds چرکە نێوان وێنەکان';
  }

  @override
  String get tvBackground => 'پاشبنەما';

  @override
  String get tvPhotoCategory => 'پۆلی وێنە';

  @override
  String get tvLocation => 'شوێن';

  @override
  String get tvChangeCity => 'گۆڕینی شار';

  @override
  String get tvChangeCitySubtitle => 'گەڕان بۆ شارێکی جیاواز';

  @override
  String get tvScreensaverBg => 'پاشبنەمای شاشەپارێز';

  @override
  String get tvScreensaverPhotos => 'وێنەکان';

  @override
  String get tvScreensaverPattern => 'نەخشەی هەندەسی';

  @override
  String get tvScreensaverBoth => 'وێنە + نەخشە';

  @override
  String get tvCategoryAll => 'هەموو پۆلەکان';

  @override
  String get tvCategoryMasjids => 'مزگەوتەکان';

  @override
  String get tvCategoryInteriors => 'ناوەوە';

  @override
  String get tvCategoryGeometric => 'هەندەسی';

  @override
  String get tvCategoryCalligraphy => 'خوشنووسی';

  @override
  String get tvCategoryLandscapes => 'دیمەنەکان';

  @override
  String get tvCategoryRamadan => 'ڕەمەزان';

  @override
  String get tvPhotoCategoryTitle => 'پۆلی وێنە';

  @override
  String tvEnterHint(String title) {
    return 'بنووسە $title';
  }

  @override
  String get tvSystemDefault => 'بنەڕەتی سیستەم';

  @override
  String get smartHomeIntegrations => 'یەکگرتنەکان';

  @override
  String get smartHomeLinkedSpeakers => 'بەرزەدەنگ و پیشاندانی بەسترا';

  @override
  String get smartHomeAlertDisplay => 'پیشاندانی ئاگادارکردنەوە';

  @override
  String get smartHomeAtAdhanShow => 'لە کاتی بانگدا پیشان بدە';

  @override
  String get smartHomePauseMediaTitle => 'وەستاندنی میدیا لە کاتی بانگ';

  @override
  String get smartHomePauseMediaSubtitle =>
      'دوای تەواوبوونی بانگ بەردەوام دەبێت';

  @override
  String get smartHomePrayerAudioSection => 'دەنگی نوێژ';

  @override
  String get smartHomeQuietHoursSection => 'کاتژمێرە بێدەنگەکان';

  @override
  String get smartHomeEnableQuietHours => 'چالاککردنی کاتژمێرە بێدەنگەکان';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'هەموو ئاگادارکردنەوەکانی ماڵی زیرەک بێدەنگ دەکرێن';

  @override
  String get smartHomeNoDevices => 'هێشتا هیچ ئامێرێک نەبەستراوە';

  @override
  String get smartHomeNoDevicesDesc =>
      'لە سەرەوەدا گووگڵ هۆم یان ئەلێکسا ببەستە، ئینجا بەرزەدەنگ و پیشاندانەکانت لێرە دەردەکەون.';

  @override
  String get smartHomeRequiresPlus => 'ماڵی زیرەک پێویستی بە Ummat+ هەیە';

  @override
  String get smartHomeRequiresPlusDesc =>
      'کۆنترۆڵی بانگدان لەسەر گووگڵ هۆم، ئەلێکسا، سیری، و Home Assistant. ڕێکبخە کام ئامێرەکان بانگ دەکەن، کەی میدیا بوەستێنرێت، و کاتژمێرە بێدەنگەکان دابنێ.';

  @override
  String get smartHomeBroadcastGoogle =>
      'بڵاوکردنەوەی بانگ لەسەر بەرزەدەنگ و پیشاندانەکانی Nest.';

  @override
  String get smartHomeEnableAlexa =>
      'تواناکانی PrayCalc لەسەر ئەلێکسا چالاک بکە.';

  @override
  String get smartHomeSiriAsk =>
      'لە سیری بپرسە دەربارەی کاتی نوێژ یان ئۆتۆماتیکیەکان دامەزرێنە.';

  @override
  String get smartHomeHassAdd =>
      'لەڕێی HACS زیاد بکە بۆ پشتیوانی تەواوی ئۆتۆماتیک.';

  @override
  String get smartHomeSetupGuide => 'ڕێنمای دامەزراندن';

  @override
  String get smartHomeSiriSetupTitle => 'دامەزراندنی شۆرتکەتەکانی سیری';

  @override
  String get smartHomeSiriStep1 =>
      'ئەپی Shortcuts لەسەر ئایفۆن یان ئایپاد بکەرەوە.';

  @override
  String get smartHomeSiriStep2 =>
      'بپەنجە بکە لەسەر \"+\" بۆ دروستکردنی شۆرتکەتی نوێ.';

  @override
  String get smartHomeSiriStep3 => 'بگەڕێ بۆ \"PrayCalc\" لە لیستی کارەکاندا.';

  @override
  String get smartHomeSiriStep4 =>
      '\"کاتی نوێژی داهاتوو\" یان \"کاتی نوێژەکانی ئەمڕۆ\" زیاد بکە.';

  @override
  String get smartHomeSiriStep5 =>
      'بە ئارەزوو زیادی بکە بۆ ئۆتۆماتیک (بۆ نموونە ڕۆژانە لە بەرەبان).';

  @override
  String get smartHomeSiriStep6 =>
      'بڵێ \"Hey Siri, next prayer time\" بۆ تاقیکردنەوە.';

  @override
  String get smartHomeSiriFootnote => 'پێویستی بە iOS 16 یان دواتر هەیە.';

  @override
  String get smartHomeHassSetupTitle => 'دامەزراندنی Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'HACS (فرۆشگای کۆمەڵگەی Home Assistant) دامەزرێنە.';

  @override
  String get smartHomeHassStep2 =>
      'لە HACS دا، بگەڕێ بۆ \"PrayCalc\" و دایبمەزرێنە.';

  @override
  String get smartHomeHassStep3 =>
      'بچۆ بۆ ڕێکخستنەکان > ئامێرەکان و خزمەتگوزارییەکان > زیادکردنی یەکگرتن.';

  @override
  String get smartHomeHassStep4 => 'بگەڕێ بۆ \"PrayCalc\" و هەڵیبژێرە.';

  @override
  String get smartHomeHassStep5 =>
      'کلیلی API ی PrayCalc بنووسە (لە هەژمارەکەت دروستکراوە).';

  @override
  String get smartHomeHassStep6 => 'شوێن و شێوازی ژمارەکردنەکەت ڕێکبخە.';

  @override
  String get smartHomeHassFootnote =>
      'پێویستی بە Home Assistant 2024.1+ بە HACS هەیە.';

  @override
  String get smartHomeApiKey => 'کلیلی API';

  @override
  String get smartHomeGenerateApiKey => 'دروستکردنی کلیلی API';

  @override
  String get smartHomeApiKeyNotReady =>
      'دروستکردنی کلیلی API بەردەست دەبێت کاتێک خزمەتگوزاری زیرەکی PrayCalc دەرچوو.';

  @override
  String get smartHomeApiKeyDesc =>
      'پێویستت بە کلیلی API هەیە بۆ بەستنی Home Assistant بە هەژماری PrayCalc ەوە.';

  @override
  String get smartHomeLinkedStatus => 'بەسترا';

  @override
  String get smartHomeNotLinkedStatus => 'نەبەستراو';

  @override
  String get smartHomeCouldNotOpen => 'نەتوانرا بەستەرەکە بکرێتەوە.';

  @override
  String get smartHomeDevices => 'ئامێرەکان';

  @override
  String get smartHomeAddDevice => 'زیادکردنی ئامێر';

  @override
  String get smartHomeDeleteDevice => 'سڕینەوە';

  @override
  String get smartHomeDeleteDeviceConfirm => 'ئەم ئامێرە لاببرێت؟';

  @override
  String get smartHomeDeviceOnline => 'ئۆنلاین';

  @override
  String get smartHomeDeviceOffline => 'ئۆفلاین';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'کۆتا جار بینرا: $time';
  }

  @override
  String get smartHomeDeviceName => 'ناوی ئامێر';

  @override
  String get smartHomeDeviceType => 'جۆری ئامێر';

  @override
  String get smartHomeDeviceTypeTv => 'تەلەفزیۆن';

  @override
  String get smartHomeDeviceTypeSpeaker => 'بەرزەدەنگ';

  @override
  String get smartHomeDeviceTypeWatch => 'کاتژمێر';

  @override
  String get smartHomeDeviceTypeDesktop => 'دێسکتۆپ';

  @override
  String get smartHomeDeviceTypeOther => 'هی تر';

  @override
  String get smartHomeDeviceAdhan => 'ئاگادارکردنەوەکانی بانگ';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'وەرگرتنی ئاگادارکردنەوەی بانگ لەسەر ئەم ئامێرە';

  @override
  String get smartHomeDeviceVolume => 'دەنگ';

  @override
  String get smartHomeDeviceAudioType => 'جۆری دەنگ';

  @override
  String get smartHomeDeviceEnabledPrayers => 'نوێژە چالاکەکان';

  @override
  String get smartHomeDeviceSettings => 'ڕێکخستنەکانی ئامێر';

  @override
  String get smartHomeTesting => 'تاقیکردنەوە...';

  @override
  String get smartHomeTestSuccess => 'پەیوەندی پشتڕاستکرایەوە';

  @override
  String get smartHomeTestFailed => 'تاقیکردنەوەی پەیوەندی سەرنەکەوت';

  @override
  String get smartHomePairTv => 'جووتکردنی تەلەفزیۆن';

  @override
  String get smartHomePairingTv => 'تۆمارکردنی تەلەفزیۆن...';

  @override
  String get smartHomePairTvSuccess => 'تەلەفزیۆن بە سەرکەوتوویی جووت کرا';

  @override
  String get smartHomePairTvFailed => 'جووتکردنی تەلەفزیۆن سەرنەکەوت';

  @override
  String get smartHomeLoadingDevices => 'بارکردنی ئامێرەکان...';

  @override
  String get smartHomeLoadingIntegrations => 'بارکردنی یەکگرتنەکان...';

  @override
  String get smartHomeServiceUnavailable =>
      'خزمەتگوزاری ماڵی زیرەک لە ئێستادا بەردەست نییە. دواتر دووبارە هەوڵ بدەرەوە.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total تەواوکرا';
  }

  @override
  String get adhkarReset => 'ڕیسێتکردن';

  @override
  String get syncHistoryTitle => 'مێژووی هاوکاتکردن';

  @override
  String get syncClearHistory => 'پاککردنەوەی مێژوو';

  @override
  String get syncNoConflicts =>
      'هیچ ناکۆکییەکی هاوکاتکردن نەدۆزرایەوە. هەموو ئامێرەکان هاوکاتن.';

  @override
  String get syncDomainSettings => 'ڕێکخستنەکان';

  @override
  String get syncDomainCities => 'شارە پاشەکەوتکراوەکان';

  @override
  String get syncDomainPrayerLogs => 'تۆمارەکانی نوێژ';

  @override
  String get syncTimeJustNow => 'ئێستا';

  @override
  String syncTimeMinAgo(int min) {
    return '$minخ پێش';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hourک پێش';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$dayڕ پێش';
  }

  @override
  String get pinCity => 'سنجاق';

  @override
  String get pinMaxReached =>
      'زۆرینەی ٥ شاری سنجاقکراو. نوێکردنەوە بۆ Ummat+ بۆ زیاتر.';

  @override
  String pinCityUnpinned(String city) {
    return '$city سنجاقی لێکرایەوە';
  }

  @override
  String get pinUndo => 'گەڕانەوە';

  @override
  String get tvPairingScanQr => 'Scan TV QR Code';

  @override
  String get tvPairingScanInstruction =>
      'Point your camera at the QR code on your TV';

  @override
  String get tvPairingEnterManually => 'Enter code manually';

  @override
  String get tvPairingEnterCode => 'Enter pairing code';

  @override
  String get tvPairingCodeHint => '6-character code shown on your TV';

  @override
  String get tvPairingNameThisTv => 'Name this TV';

  @override
  String get tvPairingNameHint => 'e.g. Living Room TV';

  @override
  String tvPairingSuccess(String name) {
    return '$name paired!';
  }

  @override
  String get tvPairingSuccessSubtitle =>
      'Your TV is now connected to your account.';

  @override
  String get tvPairingBackToMyTvs => 'Back to My TVs';

  @override
  String get tvPairingTimeout =>
      'Request timed out. Is the TV on and connected?';

  @override
  String get tvPairingServerError => 'Could not connect to server.';

  @override
  String get tvPairingSignInRequired =>
      'Sign in to your account before pairing a TV.';
}
