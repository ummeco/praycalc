// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Pushto Pashto (`ps`).
class AppLocalizationsPs extends AppLocalizations {
  AppLocalizationsPs([String locale = 'ps']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'سحر';

  @override
  String get prayerSunrise => 'لمر ختل';

  @override
  String get prayerDhuhr => 'غرمه';

  @override
  String get prayerAsr => 'مازدیګر';

  @override
  String get prayerMaghrib => 'ماښام';

  @override
  String get prayerIsha => 'ماخستن';

  @override
  String get prayerQiyam => 'قیام';

  @override
  String get prayerSuhoor => 'سحري';

  @override
  String get prayerIftar => 'افطار';

  @override
  String get hijriMuharram => 'محرم';

  @override
  String get hijriSafar => 'صفر';

  @override
  String get hijriRabiAlAwwal => 'ربیع‌الاول';

  @override
  String get hijriRabiAlThani => 'ربیع‌الثاني';

  @override
  String get hijriJumadaAlAwwal => 'جمادی‌الاول';

  @override
  String get hijriJumadaAlThani => 'جمادی‌الثاني';

  @override
  String get hijriRajab => 'رجب';

  @override
  String get hijriShaban => 'شعبان';

  @override
  String get hijriRamadan => 'رمضان';

  @override
  String get hijriShawwal => 'شوال';

  @override
  String get hijriDhulQidah => 'ذوالقعده';

  @override
  String get hijriDhulHijjah => 'ذوالحجه';

  @override
  String get monthJan => 'جنوري';

  @override
  String get monthFeb => 'فبروري';

  @override
  String get monthMar => 'مارچ';

  @override
  String get monthApr => 'اپریل';

  @override
  String get monthMay => 'می';

  @override
  String get monthJun => 'جون';

  @override
  String get monthJul => 'جولای';

  @override
  String get monthAug => 'اګست';

  @override
  String get monthSep => 'سپتمبر';

  @override
  String get monthOct => 'اکتوبر';

  @override
  String get monthNov => 'نومبر';

  @override
  String get monthDec => 'دسمبر';

  @override
  String get monthJanuary => 'جنوري';

  @override
  String get monthFebruary => 'فبروري';

  @override
  String get monthMarch => 'مارچ';

  @override
  String get monthApril => 'اپریل';

  @override
  String get monthMayFull => 'می';

  @override
  String get monthJune => 'جون';

  @override
  String get monthJuly => 'جولای';

  @override
  String get monthAugust => 'اګست';

  @override
  String get monthSeptember => 'سپتمبر';

  @override
  String get monthOctober => 'اکتوبر';

  @override
  String get monthNovember => 'نومبر';

  @override
  String get monthDecember => 'دسمبر';

  @override
  String get dayMonShort => 'دو';

  @override
  String get dayTueShort => 'سه';

  @override
  String get dayWedShort => 'چهار';

  @override
  String get dayThuShort => 'پنج';

  @override
  String get dayFriShort => 'جمعه';

  @override
  String get daySatShort => 'شنبه';

  @override
  String get daySunShort => 'یک';

  @override
  String get dayMonday => 'دوشنبه';

  @override
  String get dayTuesday => 'سه‌شنبه';

  @override
  String get dayWednesday => 'چهارشنبه';

  @override
  String get dayThursday => 'پنجشنبه';

  @override
  String get dayFriday => 'جمعه';

  @override
  String get daySaturday => 'شنبه';

  @override
  String get daySunday => 'یکشنبه';

  @override
  String get daySuChart => 'ی';

  @override
  String get dayMoChart => 'د';

  @override
  String get dayTuChart => 'س';

  @override
  String get dayWeChart => 'چ';

  @override
  String get dayThChart => 'پ';

  @override
  String get dayFrChart => 'ج';

  @override
  String get daySaChart => 'ش';

  @override
  String get chooseCityLabel => 'ښار غوره کړئ';

  @override
  String get setCityFab => 'ښار ټاکل';

  @override
  String prayerTimesError(Object error) {
    return 'د لمونځ وختونه نشي حساب کیدلی.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer پاتې';
  }

  @override
  String get ramadanMubarak => 'رمضان مبارک';

  @override
  String ramadanDayProgress(int day) {
    return 'ورځ $day / ۳۰';
  }

  @override
  String get lastTenNights => 'وروستۍ ۱۰ شپې';

  @override
  String get laylatulQadr => 'لیلة القدر';

  @override
  String get homeSuffixAH => 'هـ';

  @override
  String get homeSuffixCE => 'م';

  @override
  String get homeNoCitySelected => 'هیڅ ښار نه دی ټاکل شوی';

  @override
  String get homeNoCityHint =>
      'پورته ټک وکړئ ترڅو خپل ښار ولټوئ یا GPS فعال کړئ.';

  @override
  String get homeCouldNotCalc => 'د لمونځ وختونه نشي حساب کیدلی.';

  @override
  String get homeQasr => 'قصر';

  @override
  String get homeActionMonthlyTimes => 'میاشتنۍ\nوختونه';

  @override
  String get homeActionDuaDhikr => 'دعا او\nذکر';

  @override
  String get homeActionPrayerStats => 'د لمونځ\nشمیرنې';

  @override
  String homePolarBanner(int count) {
    return '$count د لمونځ وختونه ستاسو د موقعیت لپاره په دې دوره کې نشي حساب کیدلی. په ترتیباتو کې نږدې عرض جغرافیایي تخمین وازمایئ.';
  }

  @override
  String get settingsTitle => 'ترتیبات';

  @override
  String get settingsSectionPrayerCalc => 'د لمونځ حساب';

  @override
  String get settingsCalcMethod => 'د حساب طریقه';

  @override
  String get settingsCalcMethodAuto => 'اتوماتیک (متحرک)';

  @override
  String get settingsHanafiAsr => 'حنفي مازدیګر';

  @override
  String get settingsHanafiAsrSubtitle =>
      'د سیوري فکتور ۲ برابره (ناوخته مازدیګر)';

  @override
  String get settingsSectionDisplay => 'ښودنه';

  @override
  String get settings24hClock => '۲۴ ساعته بڼه';

  @override
  String get settingsFollowSystemTheme => 'د سیسټم تم تعقیب';

  @override
  String get settingsDarkMode => 'تیاره حالت';

  @override
  String get settingsSectionNotifications => 'خبرتیاوې';

  @override
  String get settingsPrayerNotifications => 'د لمونځ خبرتیاوې';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'اذان، یادونې او د هر لمونځ ترتیبات';

  @override
  String get settingsPrayerAgendas => 'د لمونځ اجنداوې';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'دودیزې یادونې د لمونځ وختونو سره تړلې';

  @override
  String get settingsAccount => 'حساب';

  @override
  String get settingsSignInToSync => 'د همغږۍ لپاره ننوتل';

  @override
  String get settingsSignInToSyncSubtitle =>
      'خپل معلومات په ټولو وسایلو کې وساتئ';

  @override
  String get settingsHomeScreen => 'اصلي پاڼه';

  @override
  String get settingsSkyGradient => 'د اسمان رنګ شالید';

  @override
  String get settingsSkyGradientSubtitle =>
      'متحرک اسمان رنګونه د ورځې وخت سره سم';

  @override
  String get settingsWeatherGradient => 'د هوا رنګ';

  @override
  String get settingsWeatherGradientSubtitle =>
      'د محلي هوا پر بنسټ د اسمان رنګونه تنظیم کړئ';

  @override
  String get settingsCountdownAnimation => 'د شمیرنې انیمیشن';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'د بل لمونځ شمیرنې کې ساه اخیستنکي حلقه';

  @override
  String get settingsPrayerTracking => 'د لمونځ تعقیب';

  @override
  String get settingsTrackMyPrayers => 'زما لمونځونه تعقیب کړئ';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'هره ورځ بشپړ شوي لمونځونه ثبت کړئ';

  @override
  String get settingsPrayerStats => 'د لمونځ شمیرنې';

  @override
  String get settingsPrayerStatsSubtitle => 'لړۍ، اونیزې او میاشتنۍ چارټونه';

  @override
  String get settingsJumuahKahf => 'د جمعې الکهف یادونه';

  @override
  String get settingsJumuahKahfSubtitle =>
      'په جمعه ورځو کې د سورة الکهف لوستلو یادونه';

  @override
  String get settingsTravel => 'سفر';

  @override
  String get settingsTravelMode => 'د سفر حالت';

  @override
  String get settingsTravelModeSubtitle =>
      'په اتوماتیک ډول پیژندل کله چې له کوره لرې یاست او لمونځ تنظیم کړئ';

  @override
  String get settingsHomeLocation => 'د کور موقعیت';

  @override
  String get settingsHomeLocationNotSet =>
      'ټاکل شوی نه دی — ټک وکړئ ترڅو اوسنی موقعیت وکاروئ';

  @override
  String get settingsClearHomeLocation => 'د کور موقعیت پاک کړئ';

  @override
  String get settingsTravelRulings => 'د مسافر لمونځ احکام';

  @override
  String get settingsTravelRulingsSubtitle => 'قصر، جمع او د مسافر لارښود';

  @override
  String get settingsSmartHome => 'هوښیار کور';

  @override
  String get settingsSmartHomeIntegrations => 'د هوښیار کور اتصالات';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit، Google Home، Alexa، Home Assistant';

  @override
  String get settingsTvDisplay => 'د ټلویزیون ښودنه';

  @override
  String get settingsTvHome => 'د ټلویزیون اصلي ښودنه';

  @override
  String get settingsTvHomeSubtitle =>
      'د ټلویزیون لپاره بشپړ سکرین د لمونځ ساعت';

  @override
  String get settingsMasjidDisplay => 'د مسجد ښودنه';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'د مسجد سکرینونو لپاره د اذان/اقامت جدول';

  @override
  String get settingsTvSettings => 'د ټلویزیون ترتیبات';

  @override
  String get settingsTvSettingsSubtitle => 'د مسجد حالت، د اقامت آفسیټ، محیطي';

  @override
  String get settingsAboutPrayCalc => 'د PrayCalc په اړه';

  @override
  String get syncSynced => 'همغږ شوی';

  @override
  String get syncSyncing => 'همغږ کیږي...';

  @override
  String get syncOffline => 'آفلاین';

  @override
  String get syncError => 'د همغږۍ تېروتنه';

  @override
  String get notifSettingsTitle => 'خبرتیاوې او اذان';

  @override
  String get notifAdhanLabel => 'اذان';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'یادونه: $minutes دقیقې مخکې';
  }

  @override
  String notifVolumePct(int pct) {
    return 'غږ: $pct٪';
  }

  @override
  String get notifTestAdhan => 'اذان وازمایئ';

  @override
  String get notifModeOff => 'بند';

  @override
  String get notifModeReminderOnly => 'یوازې یادونه';

  @override
  String get notifModeArrival => 'د لمونځ په وخت';

  @override
  String get notifModeBoth => 'یادونه + د لمونځ وخت';

  @override
  String get citySearchHint => 'ښار ولټوئ…';

  @override
  String get citySearchDetectTooltip => 'زما موقعیت پیدا کړئ';

  @override
  String get citySearchNoCityGps => 'له GPS څخه ښار ونه پیژندل شو.';

  @override
  String get citySearchPermissionDenied =>
      'د موقعیت اجازه رد شوه. په لاسي ډول ولټوئ.';

  @override
  String get citySearchNoResults => 'هیڅ ښار ونه موندل شو.';

  @override
  String get citySearchStartTyping => 'د لټون لپاره لیکل پیل کړئ…';

  @override
  String get agendasTitle => 'د لمونځ اجنداوې';

  @override
  String get agendasEmpty =>
      'تر اوسه هیڅ اجندا نشته.\n+ ټک وکړئ ترڅو د خپلو لمونځونو سره تړلې یادونه اضافه کړئ.';

  @override
  String get agendasUndo => 'بیرته راوستل';

  @override
  String agendasRemoved(String label) {
    return '$label لرې شو';
  }

  @override
  String get agendaNewTitle => 'نوې اجندا';

  @override
  String get agendaEditTitle => 'اجندا سمول';

  @override
  String get agendaSave => 'خوندي کړئ';

  @override
  String get agendaLabelEmpty => 'لیبل نشي خالي کیدلی';

  @override
  String get agendaLabelField => 'لیبل';

  @override
  String get agendaLabelHint => 'لکه: د سحر لپاره پاڅیدل';

  @override
  String get agendaPrayerSection => 'لمونځ';

  @override
  String get agendaTimeOffsetSection => 'د وخت فاصله';

  @override
  String get agendaOffsetAtPrayerTime => 'د لمونځ په وخت';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes دقیقې مخکې';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes دقیقې وروسته';
  }

  @override
  String get agendaRepeatSection => 'تکرار';

  @override
  String get agendaNotifTypeSection => 'د خبرتیا ډول';

  @override
  String get agendaNotifSilent => 'خاموش';

  @override
  String get agendaNotifSound => 'غږ';

  @override
  String get agendaNotifVibrate => 'لړزان';

  @override
  String get agendaDayM => 'د';

  @override
  String get agendaDayT => 'س';

  @override
  String get agendaDayW => 'چ';

  @override
  String get agendaDayF => 'ج';

  @override
  String get agendaDayS => 'ش';

  @override
  String get moonTitle => 'سپوږمۍ او هجري تقویم';

  @override
  String moonIlluminated(int pct) {
    return '$pct٪ رڼا';
  }

  @override
  String get moonFullTonight => 'نن شپه بشپړه سپوږمۍ!';

  @override
  String get moonNextTomorrow => 'بله بشپړه سپوږمۍ سبا';

  @override
  String moonNextDays(int days) {
    return 'بله بشپړه سپوږمۍ په $days ورځو کې';
  }

  @override
  String moonAge(String age) {
    return 'د سپوږمۍ عمر: $age ورځې';
  }

  @override
  String get moonPhaseNewMoon => 'نوې سپوږمۍ';

  @override
  String get moonPhaseWaxingCrescent => 'مخکیني هلال';

  @override
  String get moonPhaseFirstQuarter => 'لومړۍ ربع';

  @override
  String get moonPhaseWaxingGibbous => 'مخکیني محدب';

  @override
  String get moonPhaseFullMoon => 'بشپړه سپوږمۍ';

  @override
  String get moonPhaseWaningGibbous => 'وروستنی محدب';

  @override
  String get moonPhaseLastQuarter => 'وروستنۍ ربع';

  @override
  String get moonPhaseWaningCrescent => 'وروستنی هلال';

  @override
  String get moonHilalVisibility => 'د راتلونکي هلال لیدنه';

  @override
  String get moonRegionMiddleEast => 'منځنی ختیځ';

  @override
  String get moonRegionWestAfrica => 'لویدیځ افریقا';

  @override
  String get moonRegionSouthAsia => 'سویلي آسیا';

  @override
  String get moonRegionEurope => 'اروپا';

  @override
  String get moonRegionAmericas => 'امریکا';

  @override
  String get moonVisible => 'لیدل کیږي';

  @override
  String get moonNotVisible => 'نه لیدل کیږي';

  @override
  String get moonPossible => 'احتمالي';

  @override
  String get moonUpcomingDates => 'راتلونکي اسلامي نیټې';

  @override
  String get hijriTodayLabel => 'نن د هجري تقویم کې';

  @override
  String ramadanBeginsLabel(int year) {
    return 'رمضان $year هـ پیلیږي';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days ورځې پاتې';
  }

  @override
  String get moonLunarCycle => 'قمري دوره';

  @override
  String moonDayOfCycle(int day) {
    return 'ورځ $day له ~۲۹.۵ څخه';
  }

  @override
  String get moonHilalSightingForecast => 'د هلال لیدنې وړاندوینه';

  @override
  String get moonHilalVisibilityMap => 'د هلال لیدنې نقشه';

  @override
  String moonDayN(int day) {
    return 'ورځ $day';
  }

  @override
  String get moonGlobalSighting => 'نړیواله لیدنه';

  @override
  String get moonZoneNakedEye => 'وړه سترګه';

  @override
  String get moonZoneBinoculars => 'دوربین';

  @override
  String get moonZoneVeryDifficult => 'ډیره ستونزمنه';

  @override
  String get moonZoneNotVisible => 'نه لیدل کیږي';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year هـ احتمالاً ۲۹ ورځې وي. هلال د ۲۹مې ورځې لیدل کیږي، انشاءالله.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year هـ احتمالاً ۳۰ ورځې وي. هلال د ۲۹مې ورځې نه لیدل کیږي — میاشت ۳۰ ورځې بشپړیږي.';
  }

  @override
  String get moonUmmAlQura => 'ام‌القری';

  @override
  String get moonSaudiArabia => 'سعودي عربستان';

  @override
  String get moonFCNACalc => 'FCNA / حساب';

  @override
  String get moonNorthAmerica => 'شمالي امریکا';

  @override
  String moonNDays(int days) {
    return '$days ورځې';
  }

  @override
  String moonStarts(String month) {
    return 'د $month پیل:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'د لمر پریوتو وخت د سپوږمۍ عمر: $hours ساعته';
  }

  @override
  String get moon7DayLunarCalendar => '۷ ورځنی قمري تقویم';

  @override
  String get moonUpcomingIslamicEvents => 'راتلونکي اسلامي پیښې';

  @override
  String get moonTodayLabel => 'نن';

  @override
  String get moonTomorrowLabel => 'سبا';

  @override
  String get calDateCol => 'نیټه';

  @override
  String get calHijriCol => 'هجري';

  @override
  String get calFajrCol => 'سحر';

  @override
  String get calSunriseCol => 'لمر ختل';

  @override
  String get calDhuhrCol => 'غرمه';

  @override
  String get calAsrCol => 'مازدیګر';

  @override
  String get calMaghribCol => 'ماښام';

  @override
  String get calIshaCol => 'ماخستن';

  @override
  String get calNoCityText => 'لومړی خپل ښار ټاکئ\nترڅو د لمونځ تقویم وګورئ.';

  @override
  String get calShareTooltip => 'تقویم شریک کړئ';

  @override
  String get calPrevMonthTooltip => 'تیره میاشت';

  @override
  String get calNextMonthTooltip => 'بله میاشت';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'د لمونځ وختونه — $month';
  }

  @override
  String get qiblaTitle => 'قبله';

  @override
  String get qiblaSwitchToCompass => 'قطب نما ته ورشئ';

  @override
  String get qiblaSwitchToAR => 'AR کامرې ته ورشئ';

  @override
  String get qiblaNoCityText => 'لومړی خپل ښار ټاکئ\nترڅو د قبلې لوری حساب شي.';

  @override
  String get qiblaCompassUnavailable =>
      'په دې وسیله کې د قطب نما سینسر شتون نلري.';

  @override
  String get qiblaCalibrate => 'کالیبریشن: خپل ګوشی د ۸ شکل شان وګرځوئ.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return 'له شمال څخه $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return 'له $city څخه';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'له کعبې څخه $dist کم';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return 'له کعبې څخه $dist زره کم';
  }

  @override
  String get qiblaFacingQibla => 'مخ د قبلې لوري ✓';

  @override
  String get tasbeehTitle => 'تسبیح';

  @override
  String get tasbeehResetTooltip => 'بیا تنظیم';

  @override
  String get tasbeehTapToSwitch => 'د بدلون لپاره لیبل ته ټک وکړئ';

  @override
  String get tasbeehTapToCount => 'د شمیرلو لپاره هرچیرته ټک وکړئ';

  @override
  String get tasbeehResetDialogTitle => 'شمیرنه بیا تنظیم کړئ؟';

  @override
  String get tasbeehResetDialogContent => 'دا به اوسنۍ شمیرنه صفر ته راولي.';

  @override
  String get tasbeehCancel => 'لغوه';

  @override
  String get tasbeehReset => 'بیا تنظیم';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'نن: $count ذکر';
  }

  @override
  String get tasbeehLast7Days => 'تیرې ۷ ورځې';

  @override
  String get tasbeehNoHistory => 'تر اوسه هیڅ تاریخ نشته — شمیرل پیل کړئ!';

  @override
  String tasbeehComplete(int count) {
    return 'تسبیح بشپړ شو! $count ذکر';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'هوښیار کور';

  @override
  String get smartHomeSubtitle => 'خپل وسایل د لمونځ وختونو سره وصل کړئ';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'له ګوګل څخه د لمونځ وختونو او د قبلې لوری پوښتنه وکړئ';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'له الکسا څخه د لمونځ وختونو، راتلونکي لمونځ او نورو پوښتنه وکړئ';

  @override
  String get smartHomeSiri => 'د Siri شارټکټونه';

  @override
  String get smartHomeSiriDesc =>
      'د لمونځ وختونو لپاره دودیز شارټکټونه جوړ کړئ';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'د لمونځ وختونو کې رڼا، ښودنې او یادونې اتومات کړئ';

  @override
  String get smartHomeLinkAccount => 'حساب وصل کړئ';

  @override
  String get smartHomeLinked => 'وصل شوی';

  @override
  String get smartHomeUnlink => 'جلا کړئ';

  @override
  String get smartHomeSetupInstructions => 'د ترتیب لارښوونې';

  @override
  String get smartHomeRequiresUmmatPlus => 'Ummat+ ته اړتیا لري';

  @override
  String get smartHomeTroubleshooting => 'ستونزو حل';

  @override
  String get smartHomeTestConnection => 'اتصال وازمایئ';

  @override
  String get smartHomeConnectionSuccess => 'په بریالیتوب سره وصل شو';

  @override
  String get smartHomeConnectionFailed =>
      'اتصال ناکام شو. د خپل حساب اتصال وګورئ.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'د لمونځ وختونو ممتاز ځانګړتیاوې';

  @override
  String get subscriptionUpgrade => 'Ummat+ ته لوړ کړئ';

  @override
  String get subscriptionRestore => 'پیرود بیرته راوړئ';

  @override
  String get subscriptionManage => 'ګډون اداره کړئ';

  @override
  String get subscriptionCancel => 'ګډون لغوه کړئ';

  @override
  String get subscriptionActive => 'فعال';

  @override
  String get subscriptionExpired => 'ختم شوی';

  @override
  String get subscriptionFree => 'وړیا';

  @override
  String get subscriptionFreeDesc => 'اساسي لمونځ وختونه، قبله، تقویم';

  @override
  String get subscriptionPlusDesc =>
      'هوښیار کور، د ټلویزیون ښودنه، وجیټونه او نور';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count وړیا پوښتنې پاتې';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/کال';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/میاشت';
  }

  @override
  String get subscriptionFeatureSmartHome => 'د هوښیار کور اتصال';

  @override
  String get subscriptionFeatureTV => 'د ټلویزیون ښودنې حالت';

  @override
  String get subscriptionFeatureWidgets => 'د اصلي پاڼې وجیټونه';

  @override
  String get subscriptionFeatureWatch => 'د ساعت ځانګړتیاوې';

  @override
  String get subscriptionFeatureSync => 'د وسایلو ترمنځ همغږي';

  @override
  String get subscriptionFeatureAdFree => 'بې اعلاناتو تجربه';

  @override
  String get watchTitle => 'ساعت';

  @override
  String get watchNextPrayer => 'بل لمونځ';

  @override
  String get watchAllPrayers => 'ټول لمونځونه';

  @override
  String get watchComplication => 'ځانګړتیا';

  @override
  String get nextPrayer => 'بل لمونځ';

  @override
  String get allPrayers => 'ټول لمونځونه';

  @override
  String get today => 'نن';

  @override
  String get tomorrow => 'سبا';

  @override
  String get thisWeek => 'دا اونۍ';

  @override
  String get thisMonth => 'دا میاشت';

  @override
  String get loginCreateAccount => 'حساب جوړ کړئ';

  @override
  String get loginSignIn => 'ننوتل';

  @override
  String get loginWelcomeBack => 'بیرته ښه راغلاست';

  @override
  String get loginJoinPrayCalc => 'PrayCalc سره یوځای شئ';

  @override
  String get loginSyncSubtitle =>
      'د خپلو لمونځونو معلومات په وسایلو کې همغږ کړئ';

  @override
  String get loginContinueGoogle => 'د Google سره دوام ورکړئ';

  @override
  String get loginOr => 'یا';

  @override
  String get loginSigningIn => 'ننوتل کیږي…';

  @override
  String get loginNameLabel => 'د ښودنې نوم (اختیاري)';

  @override
  String get loginEmailLabel => 'بریښنالیک';

  @override
  String get loginPasswordLabel => 'پټنوم';

  @override
  String get loginEmailRequired => 'بریښنالیک اړین دی';

  @override
  String get loginEmailInvalid => 'یو سم بریښنالیک پته ولیکئ';

  @override
  String get loginPasswordRequired => 'پټنوم اړین دی';

  @override
  String get loginPasswordMinLength => 'پټنوم باید لږترلږه ۸ توري وي';

  @override
  String get loginForgotPassword => 'پټنوم مو هیر شوی؟';

  @override
  String get loginEnterEmailFirst => 'لومړی خپل بریښنالیک پته ولیکئ';

  @override
  String get loginResetSent => 'د پټنوم بیا تنظیم بریښنالیک واستول شو';

  @override
  String get loginResetFailed => 'د بیا تنظیم بریښنالیک نشي لیږل کیدلی';

  @override
  String get loginNewToPrayCalc => 'PrayCalc ته نوي یاست؟';

  @override
  String get loginAlreadyHaveAccount => 'مخکې حساب لرئ؟';

  @override
  String get accountTitle => 'حساب';

  @override
  String get accountNotSignedIn => 'ننوتلي نه یاست';

  @override
  String get accountSyncSection => 'همغږي';

  @override
  String get accountSyncStatus => 'د همغږۍ حالت';

  @override
  String get accountSyncNow => 'اوس همغږ کړئ';

  @override
  String get accountSyncHistory => 'د همغږۍ تاریخ';

  @override
  String get accountNoConflicts => 'هیڅ تعارض ونه موندل شو';

  @override
  String accountConflictsResolved(int count) {
    return '$count حل شوي';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'همغږ شوی $time';
  }

  @override
  String get accountOfflineStatus => 'آفلاین. بدلونونه په محلي ډول خوندي شول.';

  @override
  String get accountSyncErrorStatus => 'د همغږۍ تېروتنه. بیا هڅه کیږي.';

  @override
  String get accountDataSection => 'معلومات';

  @override
  String get accountExportData => 'معلومات صادر کړئ';

  @override
  String get accountExportSubtitle =>
      'خپل ترتیبات او د لمونځ راپورونه ډاونلوډ کړئ';

  @override
  String get accountExportFailed => 'معلومات نشي صادر کیدلی';

  @override
  String get accountSignOutTitle => 'وتل';

  @override
  String get accountSignOutBody =>
      'ستاسو محلي معلومات به خوندي وي. د همغږۍ دوام لپاره بیا ننوځئ.';

  @override
  String get accountDeleteAccount => 'حساب حذف کړئ';

  @override
  String get accountDeleteSubtitle => 'خپل حساب او معلومات تل لپاره حذف کړئ';

  @override
  String get accountDeleteBody =>
      'دا به ستاسو حساب او ټول همغږ شوي معلومات تل لپاره حذف کړي. ستاسو په دې وسیله محلي معلومات نه حذف کیږي.\n\nدا عمل بیرته نشي اخیستل کیدلی.';

  @override
  String get accountDeleted => 'حساب حذف شو';

  @override
  String get accountDeleteFailed => 'حساب نشي حذف کیدلی';

  @override
  String get accountTimeJustNow => 'همدا اوس';

  @override
  String accountTimeMinAgo(int min) {
    return '$min دقیقې مخکې';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour ساعته مخکې';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day ورځې مخکې';
  }

  @override
  String get statsTitle => 'د لمونځ شمیرنې';

  @override
  String get statsShareTooltip => 'شمیرنې شریکې کړئ';

  @override
  String get statsTodayPrayers => 'د نن لمونځونه';

  @override
  String statsTodayCount(int done) {
    return '$done / ۵';
  }

  @override
  String get statsStreak => 'لړۍ';

  @override
  String get statsDays => 'ورځې';

  @override
  String get statsThisWeek => 'دا اونۍ';

  @override
  String get statsCompletion => 'بشپړتیا';

  @override
  String get statsThisMonth => 'دا میاشت';

  @override
  String get statsMostMissed => 'ډیر پاتې شوي';

  @override
  String get statsThisWeekLabel => 'دا اونۍ';

  @override
  String get statsWeeklyChart => 'اونیز بشپړتیا د لمونځ له مخې';

  @override
  String get statsMonthlyChart => 'میاشتنۍ بشپړتیا د لمونځ له مخې';

  @override
  String statsTotalLogged(int count) {
    return '$count ټول ثبت شوي لمونځونه';
  }

  @override
  String get statsKeepItUp => 'دوام ورکړئ!';

  @override
  String get statsShareTitle => 'د PrayCalc لمونځ شمیرنې';

  @override
  String statsShareStreak(int days) {
    return 'لړۍ: $days ورځې';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'اونیزې: $pct٪';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'میاشتنۍ: $pct٪';
  }

  @override
  String get statsShareBreakdown => 'اونیزه تفصیل:';

  @override
  String get aboutTitle => 'د PrayCalc په اړه';

  @override
  String get aboutWebsite => 'ویبپاڼه';

  @override
  String get aboutContact => 'اړیکه';

  @override
  String get aboutLicenses => 'خلاصې سرچینې جوازونه';

  @override
  String get aboutCouldNotOpen => 'لینک نشي خلاصیدلی.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. ټول حقوق خوندي دي.\n\nد لمونځ وختونه د pray_calc_dart انجن په کارولو محاسبه کیږي. دقت ستاسو GPS موقعیت او ټاکل شوي حساب میتود پورې اړه لري.';
  }

  @override
  String get commonCancel => 'لغوه';

  @override
  String get commonSave => 'خوندي کړئ';

  @override
  String get commonDelete => 'حذف';

  @override
  String get commonEdit => 'سمول';

  @override
  String get commonRetry => 'بیا هڅه';

  @override
  String get commonClose => 'بند';

  @override
  String get commonDone => 'ترسره شو';

  @override
  String get commonBack => 'بیرته';

  @override
  String get commonNext => 'بل';

  @override
  String get commonSkip => 'تیریدل';

  @override
  String get commonContinue => 'دوام';

  @override
  String get commonOk => 'سمه ده';

  @override
  String get commonYes => 'هو';

  @override
  String get commonNo => 'نه';

  @override
  String get commonShare => 'شریکول';

  @override
  String get commonCopy => 'کاپي';

  @override
  String get commonCopied => 'کلیپبورډ ته کاپي شو';

  @override
  String get commonLoading => 'بارول...';

  @override
  String get commonError => 'یو څه غلط شو';

  @override
  String get commonErrorRetry => 'یو څه غلط شو. د بیا هڅې لپاره ټک وکړئ.';

  @override
  String get commonNoInternet => 'انترنیټ اتصال نشته';

  @override
  String get commonOfflineMode => 'آفلاین حالت';

  @override
  String get commonSignIn => 'ننوتل';

  @override
  String get commonSignOut => 'وتل';

  @override
  String get commonSignUp => 'ثبتنام';

  @override
  String get commonProfile => 'پروفایل';

  @override
  String get commonAccount => 'حساب';

  @override
  String get commonAbout => 'په اړه';

  @override
  String commonVersion(String version) {
    return 'نسخه $version';
  }

  @override
  String get commonPrivacyPolicy => 'د محرمیت تګلاره';

  @override
  String get commonTermsOfService => 'د خدماتو شرایط';

  @override
  String get commonRateApp => 'دا اپلیکیشن امتیاز ورکړئ';

  @override
  String get commonFeedback => 'نظر واستوئ';

  @override
  String get commonHelp => 'مرسته';

  @override
  String get commonLanguage => 'ژبه';

  @override
  String get commonOpenSettings => 'ترتیبات خلاص کړئ';

  @override
  String get travelNotificationTitle => 'تاسې اوس مسافر یاست';

  @override
  String get travelNotificationBody =>
      'لمونځونه ممکن لنډ شي. د مسافر د لمونځ احکامو لپاره ټک وکړئ.';

  @override
  String get travelRulingsTitle => 'سفر او لمونځ';

  @override
  String get travelRulingsIntro =>
      'د سفر په وخت کې د لمونځ اسلامي احکام، د قرآن او معتبرو حدیثو مجموعو علمي مراجعو سره.';

  @override
  String get travelWhenTitle => 'سفر کله پلي کیږي؟';

  @override
  String get travelQasrTitle => 'لمونځ لنډول (قصر)';

  @override
  String get travelJamTitle => 'لمونځونه یوځای کول (جمع)';

  @override
  String get travelDurationTitle => 'د سفر موده';

  @override
  String get travelReferencesTitle => 'علمي مراجع';

  @override
  String get travelLearnMore => 'نور زده کړئ';

  @override
  String get travelHanafiDefaultTitle => 'ولې PrayCalc حنفي ډیفالټ کاروي';

  @override
  String get travelDeeperScholarly => 'ژوره علمي بحث';

  @override
  String get onboardingTitle1 => 'د لمونځ وختونه، هرچیرته چې یاست';

  @override
  String get onboardingBody1 =>
      'د GPS دقیق سلاه وختونه د ځمکې هر ښار لپاره. سحر تر ماخستن، لمر ختل تر قیام. زموږ د خپل حساب انجن لخوا چلول کیږي.';

  @override
  String get onboardingTitle2 => 'ستاسو موقعیت، ستاسو وختونه';

  @override
  String get onboardingBody2 =>
      'هر ښار ولټوئ یا GPS ته اجازه ورکړئ چې ستاسو موقعیت پیدا کړي. PrayCalc د نړۍ ۵ ملیون ښارونو لپاره وختونه پیدا کوي.';

  @override
  String get onboardingTitle3 => 'هیڅ لمونځ مه پریږدئ';

  @override
  String get onboardingBody3 =>
      'د لمونځ په وخت اذان، مخکې یادونه. د سحري، ټولګیو او نورو لپاره دودیزې اجنداوې.';

  @override
  String get onboardingTitle4 => 'هر څه چې تاسو ورته اړتیا لرئ';

  @override
  String get onboardingBody4 =>
      'د قبلې قطب نما، د لمونځ تقویم، هجري سپوږمۍ فاز، تسبیح شمیرنه. ټول په یو ځای کې.';

  @override
  String get onboardingSkip => 'تیریدل';

  @override
  String get onboardingGetStarted => 'پیل وکړئ';

  @override
  String get onboardingSignInTitle => 'PrayCalc ته ننوځئ';

  @override
  String get onboardingSignInSubtitle =>
      'خپل د لمونځ تاریخ خوندي کړئ\nاو په ټولو وسایلو کې یې همغږ کړئ.';

  @override
  String get onboardingContinueGoogle => 'د Google سره دوام ورکړئ';

  @override
  String get onboardingContinueWithoutAccount => 'بې حساب دوام ورکړئ';

  @override
  String get onboardingSigningIn => 'ننوتل کیږي…';

  @override
  String get onboardingSelectLanguage => 'ژبه غوره کړئ';

  @override
  String get duaDhikrTitle => 'دعا او ذکر';

  @override
  String get duaDhikrTabDua => 'دعاګانې';

  @override
  String get duaDhikrTabDhikr => 'ذکر';

  @override
  String get duaDhikrTabTasbeeh => 'تسبیح';

  @override
  String get duaDhikrTabMorning => 'سهار';

  @override
  String get duaDhikrTabEvening => 'ماښام';

  @override
  String get duaDhikrMorningAdhkar => 'سهارنۍ اذکار';

  @override
  String get duaDhikrEveningAdhkar => 'ماښامنۍ اذکار';

  @override
  String get calGregToggle => 'میلادي';

  @override
  String get calHijriToggle => 'هجري';

  @override
  String get calYearlyTooltip => 'کلنی تقویم';

  @override
  String get calExportIcsTooltip => '.ics صادر کړئ';

  @override
  String get calMagCol => 'ماښام';

  @override
  String get qiblaShowOnMap => 'په نقشه ښکاره کړئ';

  @override
  String get qiblaWaitingCompass => 'د قطب نما تم ته...';

  @override
  String get qiblaNoCompassSensor =>
      'د قطب نما سینسر نشته. د قبلې لوری ثابته ښودل کیږي.';

  @override
  String get qiblaAccuracyExcellent => 'غوره دقت';

  @override
  String get qiblaAccuracyGood => 'ښه دقت';

  @override
  String get qiblaAccuracyFair => 'منځنی دقت. ګوشی د ۸ شکل شان وګرځوئ.';

  @override
  String get qiblaAccuracyLow => 'ټیټ دقت. ګوشی د ۸ شکل شان وګرځوئ.';

  @override
  String get qiblaToTheKaaba => 'کعبې ته';

  @override
  String get qiblaYourLocation => 'ستاسو موقعیت';

  @override
  String get qiblaGpsAccurate => 'GPS دقیق';

  @override
  String get qiblaCityCenter => 'د ښار مرکز';

  @override
  String get moonIlluminatedLabel => 'رڼا';

  @override
  String get moonAgeLabel => 'عمر';

  @override
  String get moonFirstQtr => 'لومړۍ ربع';

  @override
  String get moonLastQtr => 'وروستنۍ ربع';

  @override
  String get moonTonight => 'نن شپه';

  @override
  String get moonTomorrow => 'سبا';

  @override
  String moonDaysAway(int days) {
    return '$days ورځې';
  }

  @override
  String get moonBeta => 'آزمایشي';

  @override
  String get setHomeTitle => 'د کور موقعیت ټاکل';

  @override
  String get setHomeSearchHint => 'ښار، کلی یا پوستي کوډ ولټوئ…';

  @override
  String get setHomeClear => 'پاک کړئ';

  @override
  String get setHomeUseCurrentLocation => 'اوسنی موقعیت وکاروئ';

  @override
  String get setHomeDetectAndSet =>
      'خپل موقعیت وپیژنئ او د کور په توګه یې ټاکئ';

  @override
  String get setHomeAlreadySet => 'کور مخکې ټاکل شوی';

  @override
  String setHomeSetAs(String city) {
    return '$city د کور په توګه ټاکل شو';
  }

  @override
  String get setHomeCurrentLocationSet => 'اوسنی موقعیت د کور په توګه ټاکل شو';

  @override
  String get setHomePermissionDenied =>
      'د موقعیت اجازه رد شوه. لاندې ښار ولټوئ.';

  @override
  String get setHomeGpsUnavailable => 'GPS شتون نلري. په لاسي ډول ولټوئ.';

  @override
  String get setHomeNoCitiesFound => 'هیڅ ښار ونه موندل شو.';

  @override
  String get setHomeSearchPrompt => 'خپل کور ښار ولټوئ';

  @override
  String get setHomeSearchBody =>
      'پورته لیکل وکړئ ترڅو ولټوئ، یا خپل اوسنی موقعیت وکاروئ. د سفر حالت به پیژني کله چې له کوره لرې یاست.';

  @override
  String get subscriptionYouHavePlus => 'تاسو Ummat+ لرئ';

  @override
  String get subscriptionUpgradeTo => 'Ummat+ ته لوړ کړئ';

  @override
  String get subscriptionThankYou => 'د PrayCalc ملاتړ لپاره مننه.';

  @override
  String get subscriptionUnlockPremium =>
      'په ټولو وسایلو کې ممتاز ځانګړتیاوې خلاصې کړئ.';

  @override
  String get subscriptionManageSub => 'ګډون اداره کړئ';

  @override
  String get subscriptionWelcome => 'Ummat+ ته ښه راغلاست!';

  @override
  String get subscriptionSubscribe => 'ګډون وکړئ';

  @override
  String get subscriptionFreeFeatures => 'وړیا ځانګړتیاوې';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ ځانګړتیاوې';

  @override
  String get subscriptionFeaturePrayerTimes => 'د لمونځ وختونه';

  @override
  String get subscriptionFeatureQibla => 'د قبلې قطب نما';

  @override
  String get subscriptionFeatureCalendar => 'میاشتنی تقویم';

  @override
  String get subscriptionFeatureTasbeeh => 'تسبیح شمیرنه';

  @override
  String get subscriptionFeatureMoon => 'سپوږمۍ او هجري';

  @override
  String get smartHomeAlertType => 'د خبرتیا ډول';

  @override
  String get smartHomeAlertModal => 'بشپړ سکرین پاپ اپ';

  @override
  String get smartHomeAlertCorner => 'کونجي خبرتیا';

  @override
  String get smartHomeAlertNone => 'هیڅ (خاموش)';

  @override
  String get smartHomePauseMedia => 'د اذان په وخت میډیا ودروئ';

  @override
  String get smartHomeQuietHours => 'خاموشې ساعتونه';

  @override
  String get smartHomeQuietFrom => 'له';

  @override
  String get smartHomeQuietTo => 'تر';

  @override
  String get smartHomePrayerAudio => 'د هر لمونځ غږ';

  @override
  String get smartHomeAudioAdhan => 'اذان';

  @override
  String get smartHomeAudioBeep => 'بیپ';

  @override
  String get smartHomeAudioSilent => 'خاموش';

  @override
  String get aboutPrivacy => 'د محرمیت تګلاره';

  @override
  String aboutVersion(String version) {
    return 'نسخه $version';
  }

  @override
  String get notifDefaultAdhan => 'ډیفالټ اذان';

  @override
  String get notifFajrAdhan => 'د سحر اذان';

  @override
  String get notifFajrAdhanSubtitle => 'د سحر د لمونځ وخت پخیږي';

  @override
  String get notifRegularAdhan => 'عادي اذان';

  @override
  String get notifRegularAdhanSubtitle =>
      'غرمه، مازدیګر، ماښام، ماخستن وختونو کې پخیږي';

  @override
  String get notifPerPrayerSettings => 'د هر لمونځ ترتیبات';

  @override
  String get notifPreview => 'مخکتنه';

  @override
  String get tvSettingsTitle => 'د ټلویزیون ترتیبات';

  @override
  String get tvDisplayMode => 'د ښودنې حالت';

  @override
  String get tvMasjidMode => 'د مسجد حالت';

  @override
  String get tvMasjidModeSubtitle => 'لوی تابلو ښودنه د اقامت وختونو سره';

  @override
  String get tvMasjidName => 'د مسجد نوم';

  @override
  String get tvMasjidNameTapToSet => 'ټاکلو لپاره ټک وکړئ';

  @override
  String get tvClock => 'ساعت';

  @override
  String get tv24hFormat => '۲۴ ساعته بڼه';

  @override
  String get tvIqamahOffsets => 'د اقامت آفسیټونه (د اذان وروسته دقیقې)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'د اذان وروسته $offset دقیقې';
  }

  @override
  String get tvQrCode => 'QR کوډ';

  @override
  String get tvShowQrCode => 'QR کوډ ښکاره کړئ';

  @override
  String get tvShowQrCodeSubtitle => 'د مسجد سکرین کې QR کوډ ښکاره کړئ';

  @override
  String get tvQrCodeUrl => 'QR کوډ URL';

  @override
  String get tvAmbientModeSection => 'محیطي حالت';

  @override
  String get tvIdleTimeout => 'بیکارۍ وخت';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'محیطي فعالیدو ته $minutes دقیقې';
  }

  @override
  String get tvPhotoInterval => 'د عکسونو فاصله';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'د عکسونو ترمنځ $seconds ثانیې';
  }

  @override
  String get tvBackground => 'شالید';

  @override
  String get tvPhotoCategory => 'د عکس کتګوري';

  @override
  String get tvLocation => 'موقعیت';

  @override
  String get tvChangeCity => 'ښار بدل کړئ';

  @override
  String get tvChangeCitySubtitle => 'بل ښار ولټوئ';

  @override
  String get tvScreensaverBg => 'د سکرین ساتونکي شالید';

  @override
  String get tvScreensaverPhotos => 'عکسونه';

  @override
  String get tvScreensaverPattern => 'هندسي نمونه';

  @override
  String get tvScreensaverBoth => 'عکسونه + نمونه';

  @override
  String get tvCategoryAll => 'ټولې کتګوریګانې';

  @override
  String get tvCategoryMasjids => 'جوماتونه';

  @override
  String get tvCategoryInteriors => 'دننه';

  @override
  String get tvCategoryGeometric => 'هندسي';

  @override
  String get tvCategoryCalligraphy => 'خطاطي';

  @override
  String get tvCategoryLandscapes => 'مناظر';

  @override
  String get tvCategoryRamadan => 'رمضان';

  @override
  String get tvPhotoCategoryTitle => 'د عکس کتګوري';

  @override
  String tvEnterHint(String title) {
    return '$title دننه کړئ';
  }

  @override
  String get tvSystemDefault => 'د سیسټم ډیفالټ';

  @override
  String get smartHomeIntegrations => 'اتصالات';

  @override
  String get smartHomeLinkedSpeakers => 'وصل شوي سپیکرونه او ښودنې';

  @override
  String get smartHomeAlertDisplay => 'د خبرتیا ښودنه';

  @override
  String get smartHomeAtAdhanShow => 'د اذان په وخت ښکاره کړئ';

  @override
  String get smartHomePauseMediaTitle => 'د اذان په وخت میډیا ودروئ';

  @override
  String get smartHomePauseMediaSubtitle => 'د اذان له پای وروسته بیا پیلیږي';

  @override
  String get smartHomePrayerAudioSection => 'د لمونځ غږ';

  @override
  String get smartHomeQuietHoursSection => 'خاموشې ساعتونه';

  @override
  String get smartHomeEnableQuietHours => 'خاموشې ساعتونه فعال کړئ';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'ټولې د هوښیار کور خبرتیاوې خاموشې کیږي';

  @override
  String get smartHomeNoDevices => 'تر اوسه هیڅ وسیله وصل نه ده';

  @override
  String get smartHomeNoDevicesDesc =>
      'پورته Google Home یا Alexa وصل کړئ، بیا به ستاسو سپیکرونه او ښودنې دلته ښکاري.';

  @override
  String get smartHomeRequiresPlus => 'هوښیار کور Ummat+ ته اړتیا لري';

  @override
  String get smartHomeRequiresPlusDesc =>
      'په Google Home، Alexa، Siri او Home Assistant کې د لمونځ اعلانونه کنټرول کړئ. ټاکئ کومې وسایل اذان پخوي، کله میډیا ودروي او خاموشې ساعتونه ټاکئ.';

  @override
  String get smartHomeBroadcastGoogle =>
      'د Nest سپیکرونو او ښودنو کې اذان خپور کړئ.';

  @override
  String get smartHomeEnableAlexa => 'په Alexa کې د PrayCalc مهارت فعال کړئ.';

  @override
  String get smartHomeSiriAsk =>
      'له Siri څخه د لمونځ وختونو پوښتنه وکړئ یا اتومات ترتیب کړئ.';

  @override
  String get smartHomeHassAdd =>
      'د بشپړ اتومات ملاتړ لپاره HACS له لارې اضافه کړئ.';

  @override
  String get smartHomeSetupGuide => 'د ترتیب لارښود';

  @override
  String get smartHomeSiriSetupTitle => 'د Siri شارټکټونو ترتیب';

  @override
  String get smartHomeSiriStep1 =>
      'په خپل iPhone یا iPad کې د شارټکټونو اپلیکیشن خلاص کړئ.';

  @override
  String get smartHomeSiriStep2 => 'د نوي شارټکټ جوړولو لپاره \"+\" ټک وکړئ.';

  @override
  String get smartHomeSiriStep3 => 'د عملونو لیست کې \"PrayCalc\" ولټوئ.';

  @override
  String get smartHomeSiriStep4 =>
      '\"بل لمونځ وخت\" یا \"نن د لمونځ وختونه\" اضافه کړئ.';

  @override
  String get smartHomeSiriStep5 =>
      'اختیاري: اتومات ته یې اضافه کړئ (لکه هره ورځ د سحر وخت).';

  @override
  String get smartHomeSiriStep6 =>
      'د آزمایش لپاره ووایاست \"Hey Siri, بل لمونځ وخت\".';

  @override
  String get smartHomeSiriFootnote => 'iOS ۱۶ یا وروسته ته اړتیا لري.';

  @override
  String get smartHomeHassSetupTitle => 'د Home Assistant ترتیب';

  @override
  String get smartHomeHassStep1 =>
      'HACS (د Home Assistant ټولنې پلورنځی) نصب کړئ.';

  @override
  String get smartHomeHassStep2 =>
      'په HACS کې \"PrayCalc\" ولټوئ او نصب یې کړئ.';

  @override
  String get smartHomeHassStep3 =>
      'ترتیبات > وسایل او خدمات > اتصال اضافه کولو ته لاړ شئ.';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" ولټوئ او غوره یې کړئ.';

  @override
  String get smartHomeHassStep5 =>
      'خپل PrayCalc API کلی دننه کړئ (ستاسو حساب کې جوړ شوی).';

  @override
  String get smartHomeHassStep6 => 'خپل موقعیت او حساب میتود ترتیب کړئ.';

  @override
  String get smartHomeHassFootnote =>
      'Home Assistant 2024.1+ سره HACS ته اړتیا لري.';

  @override
  String get smartHomeApiKey => 'API کلی';

  @override
  String get smartHomeGenerateApiKey => 'API کلی جوړ کړئ';

  @override
  String get smartHomeApiKeyNotReady =>
      'د API کلي جوړول به وروسته شتون ولري کله چې د PrayCalc هوښیار خدمت ځای پر ځای شي.';

  @override
  String get smartHomeApiKeyDesc =>
      'تاسو یو API کلي ته اړتیا لرئ ترڅو Home Assistant خپل PrayCalc حساب سره وصل کړئ.';

  @override
  String get smartHomeLinkedStatus => 'وصل شوی';

  @override
  String get smartHomeNotLinkedStatus => 'وصل شوی نه دی';

  @override
  String get smartHomeCouldNotOpen => 'لینک نشي خلاصیدلی.';

  @override
  String get smartHomeDevices => 'وسایل';

  @override
  String get smartHomeAddDevice => 'وسیله اضافه کړئ';

  @override
  String get smartHomeDeleteDevice => 'حذف';

  @override
  String get smartHomeDeleteDeviceConfirm => 'دا وسیله لرې کړئ؟';

  @override
  String get smartHomeDeviceOnline => 'آنلاین';

  @override
  String get smartHomeDeviceOffline => 'آفلاین';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'وروستی ځل لیدل شوی: $time';
  }

  @override
  String get smartHomeDeviceName => 'د وسیلې نوم';

  @override
  String get smartHomeDeviceType => 'د وسیلې ډول';

  @override
  String get smartHomeDeviceTypeTv => 'تلویزیون';

  @override
  String get smartHomeDeviceTypeSpeaker => 'سپیکر';

  @override
  String get smartHomeDeviceTypeWatch => 'ساعت';

  @override
  String get smartHomeDeviceTypeDesktop => 'ډیسکټاپ';

  @override
  String get smartHomeDeviceTypeOther => 'نور';

  @override
  String get smartHomeDeviceAdhan => 'د اذان خبرتیاوې';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'پدې وسیله باندې د اذان خبرتیاوې ترلاسه کړئ';

  @override
  String get smartHomeDeviceVolume => 'غږ';

  @override
  String get smartHomeDeviceAudioType => 'د غږ ډول';

  @override
  String get smartHomeDeviceEnabledPrayers => 'فعال لمونځونه';

  @override
  String get smartHomeDeviceSettings => 'د وسیلې تنظیمات';

  @override
  String get smartHomeTesting => 'ازمویل کیږي...';

  @override
  String get smartHomeTestSuccess => 'اړیکه تایید شوه';

  @override
  String get smartHomeTestFailed => 'د اړیکې ازموینه ناکامه شوه';

  @override
  String get smartHomePairTv => 'تلویزیون وصل کړئ';

  @override
  String get smartHomePairingTv => 'تلویزیون ثبتیږي...';

  @override
  String get smartHomePairTvSuccess => 'تلویزیون په بریالیتوب سره وصل شو';

  @override
  String get smartHomePairTvFailed => 'د تلویزیون وصلول ناکام شو';

  @override
  String get smartHomeLoadingDevices => 'وسایل بارکیږي...';

  @override
  String get smartHomeLoadingIntegrations => 'یوځای کول بارکیږي...';

  @override
  String get smartHomeServiceUnavailable =>
      'د سمارټ کور خدمت اوس مهال شتون نلري. مهرباني وکړئ وروسته بیا هڅه وکړئ.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total بشپړ شو';
  }

  @override
  String get adhkarReset => 'بیا تنظیم';

  @override
  String get syncHistoryTitle => 'د همغږۍ تاریخ';

  @override
  String get syncClearHistory => 'تاریخ پاک کړئ';

  @override
  String get syncNoConflicts =>
      'هیڅ همغږۍ تعارض ونه موندل شو. ټولې وسایل همغږ دي.';

  @override
  String get syncDomainSettings => 'ترتیبات';

  @override
  String get syncDomainCities => 'خوندي شوي ښارونه';

  @override
  String get syncDomainPrayerLogs => 'د لمونځ راپورونه';

  @override
  String get syncTimeJustNow => 'همدا اوس';

  @override
  String syncTimeMinAgo(int min) {
    return '$min دقیقې مخکې';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour ساعته مخکې';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day ورځې مخکې';
  }

  @override
  String get pinCity => 'پین';

  @override
  String get pinMaxReached =>
      'اعظمي ۵ پین شوي ښارونه. د نورو لپاره Ummat+ ته لوړ کړئ.';

  @override
  String pinCityUnpinned(String city) {
    return '$city غیر پین شو';
  }

  @override
  String get pinUndo => 'بیرته راوستل';
}
