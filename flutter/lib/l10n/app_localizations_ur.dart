// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Urdu (`ur`).
class AppLocalizationsUr extends AppLocalizations {
  AppLocalizationsUr([String locale = 'ur']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'فجر';

  @override
  String get prayerSunrise => 'طلوع آفتاب';

  @override
  String get prayerDhuhr => 'ظہر';

  @override
  String get prayerAsr => 'عصر';

  @override
  String get prayerMaghrib => 'مغرب';

  @override
  String get prayerIsha => 'عشاء';

  @override
  String get prayerQiyam => 'قیام اللیل';

  @override
  String get prayerSuhoor => 'سحری';

  @override
  String get prayerIftar => 'افطار';

  @override
  String get hijriMuharram => 'محرم';

  @override
  String get hijriSafar => 'صفر';

  @override
  String get hijriRabiAlAwwal => 'ربیع الاول';

  @override
  String get hijriRabiAlThani => 'ربیع الثانی';

  @override
  String get hijriJumadaAlAwwal => 'جمادی الاول';

  @override
  String get hijriJumadaAlThani => 'جمادی الثانی';

  @override
  String get hijriRajab => 'رجب';

  @override
  String get hijriShaban => 'شعبان';

  @override
  String get hijriRamadan => 'رمضان';

  @override
  String get hijriShawwal => 'شوال';

  @override
  String get hijriDhulQidah => 'ذوالقعدہ';

  @override
  String get hijriDhulHijjah => 'ذوالحجہ';

  @override
  String get monthJan => 'جنوری';

  @override
  String get monthFeb => 'فروری';

  @override
  String get monthMar => 'مارچ';

  @override
  String get monthApr => 'اپریل';

  @override
  String get monthMay => 'مئی';

  @override
  String get monthJun => 'جون';

  @override
  String get monthJul => 'جولائی';

  @override
  String get monthAug => 'اگست';

  @override
  String get monthSep => 'ستمبر';

  @override
  String get monthOct => 'اکتوبر';

  @override
  String get monthNov => 'نومبر';

  @override
  String get monthDec => 'دسمبر';

  @override
  String get monthJanuary => 'جنوری';

  @override
  String get monthFebruary => 'فروری';

  @override
  String get monthMarch => 'مارچ';

  @override
  String get monthApril => 'اپریل';

  @override
  String get monthMayFull => 'مئی';

  @override
  String get monthJune => 'جون';

  @override
  String get monthJuly => 'جولائی';

  @override
  String get monthAugust => 'اگست';

  @override
  String get monthSeptember => 'ستمبر';

  @override
  String get monthOctober => 'اکتوبر';

  @override
  String get monthNovember => 'نومبر';

  @override
  String get monthDecember => 'دسمبر';

  @override
  String get dayMonShort => 'پیر';

  @override
  String get dayTueShort => 'منگل';

  @override
  String get dayWedShort => 'بدھ';

  @override
  String get dayThuShort => 'جمعرات';

  @override
  String get dayFriShort => 'جمعہ';

  @override
  String get daySatShort => 'ہفتہ';

  @override
  String get daySunShort => 'اتوار';

  @override
  String get dayMonday => 'پیر';

  @override
  String get dayTuesday => 'منگل';

  @override
  String get dayWednesday => 'بدھ';

  @override
  String get dayThursday => 'جمعرات';

  @override
  String get dayFriday => 'جمعہ';

  @override
  String get daySaturday => 'ہفتہ';

  @override
  String get daySunday => 'اتوار';

  @override
  String get daySuChart => 'ات';

  @override
  String get dayMoChart => 'پی';

  @override
  String get dayTuChart => 'من';

  @override
  String get dayWeChart => 'بد';

  @override
  String get dayThChart => 'جع';

  @override
  String get dayFrChart => 'جم';

  @override
  String get daySaChart => 'ہف';

  @override
  String get chooseCityLabel => 'شہر منتخب کریں';

  @override
  String get setCityFab => 'شہر مقرر کریں';

  @override
  String prayerTimesError(Object error) {
    return 'نماز کے اوقات کا حساب نہیں ہو سکا۔\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer میں';
  }

  @override
  String get ramadanMubarak => 'رمضان مبارک 🌙';

  @override
  String ramadanDayProgress(int day) {
    return 'دن $day / 30';
  }

  @override
  String get lastTenNights => 'آخری 10 راتیں ✨';

  @override
  String get laylatulQadr => 'لیلۃ القدر ✨';

  @override
  String get homeSuffixAH => 'ہجری';

  @override
  String get homeSuffixCE => 'عیسوی';

  @override
  String get homeNoCitySelected => 'کوئی شہر منتخب نہیں';

  @override
  String get homeNoCityHint =>
      'اپنا شہر تلاش کرنے یا GPS فعال کرنے کے لیے اوپر دبائیں۔';

  @override
  String get homeCouldNotCalc => 'نماز کے اوقات کا حساب نہیں ہو سکا۔';

  @override
  String get homeQasr => 'قصر';

  @override
  String get homeActionMonthlyTimes => 'ماہانہ\nاوقات';

  @override
  String get homeActionDuaDhikr => 'دعا اور\nذکر';

  @override
  String get homeActionPrayerStats => 'نماز\nکے اعداد و شمار';

  @override
  String homePolarBanner(int count) {
    return 'اس عرصے میں آپ کے مقام کے لیے $count نماز کے اوقات کا حساب نہیں لگایا جا سکتا (آدھی رات کا سورج / قطبی رات)۔ ترتیبات میں قریب ترین عرض البلد کا تخمینہ آزمائیں۔';
  }

  @override
  String get settingsTitle => 'ترتیبات';

  @override
  String get settingsSectionPrayerCalc => 'نماز کا حساب';

  @override
  String get settingsCalcMethod => 'حساب کا طریقہ';

  @override
  String get settingsCalcMethodAuto => 'خودکار (متحرک)';

  @override
  String get settingsHanafiAsr => 'حنفی عصر';

  @override
  String get settingsHanafiAsrSubtitle => 'سایہ ضرب 2 (بعد میں عصر کا وقت)';

  @override
  String get settingsSectionDisplay => 'ظاہری شکل';

  @override
  String get settings24hClock => '24 گھنٹے کی گھڑی';

  @override
  String get settingsFollowSystemTheme => 'نظام کی تھیم استعمال کریں';

  @override
  String get settingsDarkMode => 'ڈارک موڈ';

  @override
  String get settingsSectionNotifications => 'اطلاعات';

  @override
  String get settingsPrayerNotifications => 'نماز کی اطلاعات';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'اذان، یاد دہانیاں، اور ہر نماز کی ترتیبات';

  @override
  String get settingsPrayerAgendas => 'نماز ایجنڈے';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'نماز کے اوقات سے وابستہ مخصوص یاد دہانیاں';

  @override
  String get settingsAccount => 'اکاؤنٹ';

  @override
  String get settingsSignInToSync => 'مزامنت کے لیے سائن ان کریں';

  @override
  String get settingsSignInToSyncSubtitle =>
      'اپنا ڈیٹا تمام آلات پر محفوظ رکھیں';

  @override
  String get settingsHomeScreen => 'ہوم اسکرین';

  @override
  String get settingsSkyGradient => 'آسمانی تدریج پس منظر';

  @override
  String get settingsSkyGradientSubtitle =>
      'دن کے وقت سے مماثل متحرک آسمانی رنگ';

  @override
  String get settingsWeatherGradient => 'موسمی تدریج';

  @override
  String get settingsWeatherGradientSubtitle =>
      'مقامی موسم کی بنیاد پر آسمانی رنگوں کو ایڈجسٹ کریں';

  @override
  String get settingsCountdownAnimation => 'الٹی گنتی اینیمیشن';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'اگلی نماز کی الٹی گنتی پر سانس کی انگوٹھی';

  @override
  String get settingsPrayerTracking => 'نماز کی پیروی';

  @override
  String get settingsTrackMyPrayers => 'میری نمازوں کا حساب رکھیں';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'روزانہ ادا کی گئی نمازوں کا ریکارڈ رکھیں';

  @override
  String get settingsPrayerStats => 'نماز کے اعداد و شمار';

  @override
  String get settingsPrayerStatsSubtitle => 'سلسلے، ہفتہ وار اور ماہانہ چارٹ';

  @override
  String get settingsJumuahKahf => 'جمعہ سورۃ الکہف کی یاد دہانی';

  @override
  String get settingsJumuahKahfSubtitle =>
      'جمعہ کو سورۃ الکہف پڑھنے کی یاد دہانی';

  @override
  String get settingsTravel => 'سفر';

  @override
  String get settingsTravelMode => 'سفر موڈ';

  @override
  String get settingsTravelModeSubtitle =>
      'گھر سے دور ہونے کا خود کار پتہ لگائیں اور نمازیں ایڈجسٹ کریں';

  @override
  String get settingsHomeLocation => 'گھر کا مقام';

  @override
  String get settingsHomeLocationNotSet =>
      'مقرر نہیں — موجودہ مقام استعمال کرنے کے لیے دبائیں';

  @override
  String get settingsClearHomeLocation => 'گھر کا مقام صاف کریں';

  @override
  String get settingsTravelRulings => 'سفر میں نماز کے احکام';

  @override
  String get settingsTravelRulingsSubtitle => 'قصر، جمع، اور مسافر کی رہنمائی';

  @override
  String get settingsSmartHome => 'سمارٹ ہوم';

  @override
  String get settingsSmartHomeIntegrations => 'سمارٹ ہوم انٹیگریشنز';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit، Google Home، Alexa، Home Assistant';

  @override
  String get settingsTvDisplay => 'ٹی وی ڈسپلے';

  @override
  String get settingsTvHome => 'ٹی وی ہوم ڈسپلے';

  @override
  String get settingsTvHomeSubtitle => 'ٹی وی کے لیے فل سکرین نماز گھڑی';

  @override
  String get settingsMasjidDisplay => 'مسجد ڈسپلے';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'مسجد اسکرینوں کے لیے اذان/اقامت ٹیبل';

  @override
  String get settingsTvSettings => 'ٹی وی ترتیبات';

  @override
  String get settingsTvSettingsSubtitle => 'مسجد موڈ، اقامت کے فرق، ایمبیئنٹ';

  @override
  String get settingsAboutPrayCalc => 'PrayCalc کے بارے میں';

  @override
  String get syncSynced => 'مزامنت مکمل';

  @override
  String get syncSyncing => 'مزامنت ہو رہی ہے...';

  @override
  String get syncOffline => 'آف لائن';

  @override
  String get syncError => 'مزامنت میں خرابی';

  @override
  String get notifSettingsTitle => 'اطلاعات اور اذان';

  @override
  String get notifAdhanLabel => 'اذان';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'یاد دہانی: $minutes منٹ پہلے';
  }

  @override
  String notifVolumePct(int pct) {
    return 'آواز: $pct%';
  }

  @override
  String get notifTestAdhan => 'اذان ٹیسٹ';

  @override
  String get notifModeOff => 'بند';

  @override
  String get notifModeReminderOnly => 'صرف یاد دہانی';

  @override
  String get notifModeArrival => 'نماز کے وقت';

  @override
  String get notifModeBoth => 'یاد دہانی + وقت';

  @override
  String get citySearchHint => 'شہر تلاش کریں…';

  @override
  String get citySearchDetectTooltip => 'میرا مقام تلاش کریں';

  @override
  String get citySearchNoCityGps => 'GPS سے شہر کا پتہ نہیں چل سکا۔';

  @override
  String get citySearchPermissionDenied =>
      'مقام کی اجازت نہیں دی گئی۔ دستی تلاش کریں۔';

  @override
  String get citySearchNoResults => 'کوئی شہر نہیں ملا۔';

  @override
  String get citySearchStartTyping => 'تلاش کے لیے ٹائپ کریں…';

  @override
  String get agendasTitle => 'نماز ایجنڈے';

  @override
  String get agendasEmpty =>
      'ابھی کوئی ایجنڈا نہیں ہے۔\nاپنی نمازوں سے وابستہ یاد دہانی شامل کرنے کے لیے + دبائیں۔';

  @override
  String get agendasUndo => 'واپس';

  @override
  String agendasRemoved(String label) {
    return '$label ہٹا دیا گیا';
  }

  @override
  String get agendaNewTitle => 'نیا ایجنڈا';

  @override
  String get agendaEditTitle => 'ایجنڈا میں ترمیم';

  @override
  String get agendaSave => 'محفوظ کریں';

  @override
  String get agendaLabelEmpty => 'عنوان خالی نہیں ہو سکتا';

  @override
  String get agendaLabelField => 'عنوان';

  @override
  String get agendaLabelHint => 'مثال: فجر کے لیے بیدار ہوں';

  @override
  String get agendaPrayerSection => 'نماز';

  @override
  String get agendaTimeOffsetSection => 'وقت کا فرق';

  @override
  String get agendaOffsetAtPrayerTime => 'نماز کے وقت';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes منٹ پہلے';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes منٹ بعد';
  }

  @override
  String get agendaRepeatSection => 'تکرار';

  @override
  String get agendaNotifTypeSection => 'اطلاع کی قسم';

  @override
  String get agendaNotifSilent => 'خاموش';

  @override
  String get agendaNotifSound => 'آواز';

  @override
  String get agendaNotifVibrate => 'ارتعاش';

  @override
  String get agendaDayM => 'پ';

  @override
  String get agendaDayT => 'م';

  @override
  String get agendaDayW => 'ب';

  @override
  String get agendaDayF => 'ج';

  @override
  String get agendaDayS => 'ہ';

  @override
  String get moonTitle => 'چاند اور ہجری تقویم';

  @override
  String moonIlluminated(int pct) {
    return '$pct% روشن';
  }

  @override
  String get moonFullTonight => 'آج رات پورا چاند!';

  @override
  String get moonNextTomorrow => 'اگلا پورا چاند کل';

  @override
  String moonNextDays(int days) {
    return 'اگلا پورا چاند $days دنوں میں';
  }

  @override
  String moonAge(String age) {
    return 'چاند کی عمر: $age دن';
  }

  @override
  String get moonPhaseNewMoon => 'نیا چاند';

  @override
  String get moonPhaseWaxingCrescent => 'بڑھتا ہلال';

  @override
  String get moonPhaseFirstQuarter => 'پہلی تربیع';

  @override
  String get moonPhaseWaxingGibbous => 'بڑھتا احدب';

  @override
  String get moonPhaseFullMoon => 'پورا چاند';

  @override
  String get moonPhaseWaningGibbous => 'گھٹتا احدب';

  @override
  String get moonPhaseLastQuarter => 'آخری تربیع';

  @override
  String get moonPhaseWaningCrescent => 'گھٹتا ہلال';

  @override
  String get moonHilalVisibility => 'اگلے ہلال کی رؤیت';

  @override
  String get moonRegionMiddleEast => 'مشرق وسطیٰ';

  @override
  String get moonRegionWestAfrica => 'مغربی افریقہ';

  @override
  String get moonRegionSouthAsia => 'جنوبی ایشیا';

  @override
  String get moonRegionEurope => 'یورپ';

  @override
  String get moonRegionAmericas => 'امریکاز';

  @override
  String get moonVisible => 'نظر آئے گا';

  @override
  String get moonNotVisible => 'نظر نہیں آئے گا';

  @override
  String get moonPossible => 'ممکن';

  @override
  String get moonUpcomingDates => 'آنے والی اسلامی تاریخیں';

  @override
  String get hijriTodayLabel => 'آج ہجری تقویم میں';

  @override
  String ramadanBeginsLabel(int year) {
    return 'رمضان $year ہجری شروع';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days دن باقی';
  }

  @override
  String get moonLunarCycle => 'قمری دور';

  @override
  String moonDayOfCycle(int day) {
    return 'دن $day / ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'ہلال کی رؤیت کی پیشگوئی';

  @override
  String get moonHilalVisibilityMap => 'ہلال کی نظر کا نقشہ';

  @override
  String moonDayN(int day) {
    return 'دن $day';
  }

  @override
  String get moonGlobalSighting => 'عالمی رؤیت';

  @override
  String get moonZoneNakedEye => 'ننگی آنکھ سے';

  @override
  String get moonZoneBinoculars => 'دوربین سے';

  @override
  String get moonZoneVeryDifficult => 'بہت مشکل';

  @override
  String get moonZoneNotVisible => 'نظر نہیں آئے گا';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year ہجری ممکنہ طور پر 29 دن کا ہوگا۔ 29 تاریخ کو ہلال کی رؤیت متوقع ہے، ان شاء اللہ۔';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year ہجری ممکنہ طور پر 30 دن کا ہوگا۔ 29 تاریخ کو ہلال نظر آنے کا امکان نہیں۔';
  }

  @override
  String get moonUmmAlQura => 'ام القریٰ';

  @override
  String get moonSaudiArabia => 'سعودی عرب';

  @override
  String get moonFCNACalc => 'FCNA / حساب';

  @override
  String get moonNorthAmerica => 'شمالی امریکا';

  @override
  String moonNDays(int days) {
    return '$days دن';
  }

  @override
  String moonStarts(String month) {
    return '$month شروع:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'غروب کے وقت چاند کی عمر: $hours گھنٹے';
  }

  @override
  String get moon7DayLunarCalendar => '7 دن کا قمری تقویم';

  @override
  String get moonUpcomingIslamicEvents => 'آنے والے اسلامی واقعات';

  @override
  String get moonTodayLabel => 'آج';

  @override
  String get moonTomorrowLabel => 'کل';

  @override
  String get calDateCol => 'تاریخ';

  @override
  String get calHijriCol => 'ہجری';

  @override
  String get calFajrCol => 'فجر';

  @override
  String get calSunriseCol => 'طلوع';

  @override
  String get calDhuhrCol => 'ظہر';

  @override
  String get calAsrCol => 'عصر';

  @override
  String get calMaghribCol => 'مغرب';

  @override
  String get calIshaCol => 'عشاء';

  @override
  String get calNoCityText =>
      'نماز کی تقویم دیکھنے کے لیے\nپہلے اپنا شہر مقرر کریں۔';

  @override
  String get calShareTooltip => 'تقویم شیئر کریں';

  @override
  String get calPrevMonthTooltip => 'پچھلا مہینہ';

  @override
  String get calNextMonthTooltip => 'اگلا مہینہ';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'نماز کے اوقات — $month';
  }

  @override
  String get qiblaTitle => 'قبلہ';

  @override
  String get qiblaSwitchToCompass => 'قطب نما پر جائیں';

  @override
  String get qiblaSwitchToAR => 'AR کیمرے پر جائیں';

  @override
  String get qiblaNoCityText =>
      'قبلے کی سمت معلوم کرنے کے لیے\nپہلے اپنا شہر مقرر کریں۔';

  @override
  String get qiblaCompassUnavailable => 'اس آلے پر قطب نما دستیاب نہیں ہے۔';

  @override
  String get qiblaCalibrate => 'کیلیبریشن: فون کو آٹھ کی شکل میں گھمائیں۔';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return 'شمال سے $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return '$city سے';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'کعبہ سے $dist کلومیٹر';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return 'کعبہ سے $dist ہزار کلومیٹر';
  }

  @override
  String get qiblaFacingQibla => 'قبلے کی طرف رخ ✓';

  @override
  String get tasbeehTitle => 'تسبیح';

  @override
  String get tasbeehResetTooltip => 'دوبارہ شروع';

  @override
  String get tasbeehTapToSwitch => 'تبدیل کرنے کے لیے عنوان دبائیں';

  @override
  String get tasbeehTapToCount => 'گنتی کے لیے کہیں بھی دبائیں';

  @override
  String get tasbeehResetDialogTitle => 'شمار صفر کریں؟';

  @override
  String get tasbeehResetDialogContent => 'اس سے موجودہ شمار صفر ہو جائے گا۔';

  @override
  String get tasbeehCancel => 'منسوخ';

  @override
  String get tasbeehReset => 'دوبارہ شروع';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'آج: $count ذکر';
  }

  @override
  String get tasbeehLast7Days => 'پچھلے 7 دن';

  @override
  String get tasbeehNoHistory => 'ابھی تک کوئی ریکارڈ نہیں، گنتی شروع کریں!';

  @override
  String tasbeehComplete(int count) {
    return 'تسبیح مکمل! $count ذکر';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'سمارٹ ہوم';

  @override
  String get smartHomeSubtitle => 'اپنے آلات کو نماز کے اوقات سے جوڑیں';

  @override
  String get smartHomeGoogleHome => 'گوگل ہوم';

  @override
  String get smartHomeGoogleHomeDesc =>
      'گوگل سے نماز کے اوقات اور قبلے کی سمت پوچھیں';

  @override
  String get smartHomeAlexa => 'ایمیزون الیکسا';

  @override
  String get smartHomeAlexaDesc =>
      'الیکسا سے نماز کے اوقات اور اگلی نماز پوچھیں';

  @override
  String get smartHomeSiri => 'سری شارٹ کٹس';

  @override
  String get smartHomeSiriDesc => 'نماز کے اوقات کے لیے مخصوص شارٹ کٹ بنائیں';

  @override
  String get smartHomeHomeAssistant => 'ہوم اسسٹنٹ';

  @override
  String get smartHomeHomeAssistantDesc =>
      'نماز کے اوقات پر روشنیاں اور یاد دہانیاں خود کار بنائیں';

  @override
  String get smartHomeLinkAccount => 'اکاؤنٹ جوڑیں';

  @override
  String get smartHomeLinked => 'جوڑا ہوا';

  @override
  String get smartHomeUnlink => 'جوڑ ختم کریں';

  @override
  String get smartHomeSetupInstructions => 'سیٹ اپ ہدایات';

  @override
  String get smartHomeRequiresUmmatPlus => 'امت+ ضروری ہے';

  @override
  String get smartHomeTroubleshooting => 'مسائل حل کریں';

  @override
  String get smartHomeTestConnection => 'رابطے کا ٹیسٹ';

  @override
  String get smartHomeConnectionSuccess => 'کامیابی سے جوڑ لیا گیا';

  @override
  String get smartHomeConnectionFailed =>
      'رابطہ ناکام۔ اپنے اکاؤنٹ کا جوڑ چیک کریں۔';

  @override
  String get subscriptionTitle => 'امت+';

  @override
  String get subscriptionSubtitle => 'پریمیم نماز کے اوقات کی خصوصیات';

  @override
  String get subscriptionUpgrade => 'امت+ میں اپ گریڈ کریں';

  @override
  String get subscriptionRestore => 'خریداری بحال کریں';

  @override
  String get subscriptionManage => 'رکنیت کا انتظام';

  @override
  String get subscriptionCancel => 'رکنیت منسوخ کریں';

  @override
  String get subscriptionActive => 'فعال';

  @override
  String get subscriptionExpired => 'ختم شدہ';

  @override
  String get subscriptionFree => 'مفت';

  @override
  String get subscriptionFreeDesc => 'بنیادی نماز کے اوقات، قبلہ، تقویم';

  @override
  String get subscriptionPlusDesc => 'سمارٹ ہوم، ٹی وی ڈسپلے، وجیٹس، اور مزید';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count مفت سوالات باقی';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/سال';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/ماہ';
  }

  @override
  String get subscriptionFeatureSmartHome => 'سمارٹ ہوم انٹیگریشن';

  @override
  String get subscriptionFeatureTV => 'ٹی وی ڈسپلے موڈ';

  @override
  String get subscriptionFeatureWidgets => 'ہوم اسکرین وجیٹس';

  @override
  String get subscriptionFeatureWatch => 'واچ کمپلیکیشنز';

  @override
  String get subscriptionFeatureSync => 'کراس ڈیوائس سنک';

  @override
  String get subscriptionFeatureAdFree => 'اشتہار مفت تجربہ';

  @override
  String get watchTitle => 'واچ';

  @override
  String get watchNextPrayer => 'اگلی نماز';

  @override
  String get watchAllPrayers => 'تمام نمازیں';

  @override
  String get watchComplication => 'کمپلیکیشن';

  @override
  String get nextPrayer => 'اگلی نماز';

  @override
  String get allPrayers => 'تمام نمازیں';

  @override
  String get today => 'آج';

  @override
  String get tomorrow => 'کل';

  @override
  String get thisWeek => 'اس ہفتے';

  @override
  String get thisMonth => 'اس مہینے';

  @override
  String get loginCreateAccount => 'اکاؤنٹ بنائیں';

  @override
  String get loginSignIn => 'سائن ان';

  @override
  String get loginWelcomeBack => 'واپسی پر خوش آمدید';

  @override
  String get loginJoinPrayCalc => 'PrayCalc میں شامل ہوں';

  @override
  String get loginSyncSubtitle =>
      'اپنے نماز کے ڈیٹا کو تمام آلات پر مزامنت کریں';

  @override
  String get loginContinueGoogle => 'Google کے ساتھ جاری رکھیں';

  @override
  String get loginOr => 'یا';

  @override
  String get loginSigningIn => 'سائن ان ہو رہا ہے…';

  @override
  String get loginNameLabel => 'ظاہری نام (اختیاری)';

  @override
  String get loginEmailLabel => 'ای میل';

  @override
  String get loginPasswordLabel => 'پاس ورڈ';

  @override
  String get loginEmailRequired => 'ای میل ضروری ہے';

  @override
  String get loginEmailInvalid => 'درست ای میل پتہ درج کریں';

  @override
  String get loginPasswordRequired => 'پاس ورڈ ضروری ہے';

  @override
  String get loginPasswordMinLength => 'پاس ورڈ کم از کم 8 حروف ہونا چاہیے';

  @override
  String get loginForgotPassword => 'پاس ورڈ بھول گئے؟';

  @override
  String get loginEnterEmailFirst => 'پہلے اپنا ای میل پتہ درج کریں';

  @override
  String get loginResetSent => 'پاس ورڈ ری سیٹ ای میل بھیج دی گئی';

  @override
  String get loginResetFailed => 'ری سیٹ ای میل نہیں بھیجی جا سکی';

  @override
  String get loginNewToPrayCalc => 'PrayCalc میں نئے ہیں؟';

  @override
  String get loginAlreadyHaveAccount => 'پہلے سے اکاؤنٹ ہے؟';

  @override
  String get accountTitle => 'اکاؤنٹ';

  @override
  String get accountNotSignedIn => 'سائن ان نہیں ہے';

  @override
  String get accountSyncSection => 'مزامنت';

  @override
  String get accountSyncStatus => 'مزامنت کی حالت';

  @override
  String get accountSyncNow => 'ابھی مزامنت کریں';

  @override
  String get accountSyncHistory => 'مزامنت کی تاریخ';

  @override
  String get accountNoConflicts => 'کوئی تنازعات نہیں';

  @override
  String accountConflictsResolved(int count) {
    return '$count حل ہو گئے';
  }

  @override
  String accountSyncedAgo(String time) {
    return '$time مزامنت ہوئی';
  }

  @override
  String get accountOfflineStatus =>
      'آف لائن۔ تبدیلیاں مقامی طور پر محفوظ ہیں۔';

  @override
  String get accountSyncErrorStatus => 'مزامنت میں خرابی۔ دوبارہ کوشش ہو گی۔';

  @override
  String get accountDataSection => 'ڈیٹا';

  @override
  String get accountExportData => 'ڈیٹا برآمد کریں';

  @override
  String get accountExportSubtitle =>
      'اپنی ترتیبات اور نماز کے ریکارڈ ڈاؤن لوڈ کریں';

  @override
  String get accountExportFailed => 'ڈیٹا برآمد نہیں ہو سکا';

  @override
  String get accountSignOutTitle => 'سائن آؤٹ';

  @override
  String get accountSignOutBody =>
      'آپ کا مقامی ڈیٹا محفوظ رہے گا۔ مزامنت دوبارہ شروع کرنے کے لیے سائن ان کریں۔';

  @override
  String get accountDeleteAccount => 'اکاؤنٹ حذف کریں';

  @override
  String get accountDeleteSubtitle => 'اپنا اکاؤنٹ اور ڈیٹا مستقل حذف کریں';

  @override
  String get accountDeleteBody =>
      'اس سے آپ کا اکاؤنٹ اور تمام مزامنت شدہ ڈیٹا مستقل طور پر حذف ہو جائے گا۔ اس آلے پر آپ کا مقامی ڈیٹا نہیں ہٹایا جائے گا۔\n\nیہ عمل واپس نہیں لیا جا سکتا۔';

  @override
  String get accountDeleted => 'اکاؤنٹ حذف ہو گیا';

  @override
  String get accountDeleteFailed => 'اکاؤنٹ حذف نہیں ہو سکا';

  @override
  String get accountTimeJustNow => 'ابھی';

  @override
  String accountTimeMinAgo(int min) {
    return '$min منٹ پہلے';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour گھنٹے پہلے';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day دن پہلے';
  }

  @override
  String get statsTitle => 'نماز کے اعداد و شمار';

  @override
  String get statsShareTooltip => 'اعداد و شمار شیئر کریں';

  @override
  String get statsTodayPrayers => 'آج کی نمازیں';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'سلسلہ';

  @override
  String get statsDays => 'دن';

  @override
  String get statsThisWeek => 'اس ہفتے';

  @override
  String get statsCompletion => 'تکمیل';

  @override
  String get statsThisMonth => 'اس مہینے';

  @override
  String get statsMostMissed => 'سب سے زیادہ فوت شدہ';

  @override
  String get statsThisWeekLabel => 'اس ہفتے';

  @override
  String get statsWeeklyChart => 'نماز کے لحاظ سے ہفتہ وار تکمیل';

  @override
  String get statsMonthlyChart => 'نماز کے لحاظ سے ماہانہ تکمیل';

  @override
  String statsTotalLogged(int count) {
    return 'کل $count نمازیں ریکارڈ ہوئیں';
  }

  @override
  String get statsKeepItUp => 'جاری رکھیں!';

  @override
  String get statsShareTitle => 'PrayCalc نماز کے اعداد و شمار';

  @override
  String statsShareStreak(int days) {
    return 'سلسلہ: $days دن';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'ہفتہ وار: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'ماہانہ: $pct%';
  }

  @override
  String get statsShareBreakdown => 'ہفتہ وار تفصیل:';

  @override
  String get statsHeatmapTitle => 'Year at a Glance';

  @override
  String get statsHeatmapNoData => 'No prayers logged for this day';

  @override
  String statsHeatmapDetail(int count) {
    return '$count / 5 prayers completed';
  }

  @override
  String get statsDailyGoalTitle => 'Daily Prayer Goal';

  @override
  String statsDailyGoalLabel(int goal) {
    return '$goal prayers / day';
  }

  @override
  String get statsGoalStreak => 'Goal Streak';

  @override
  String get statsBestStreak => 'Best Streak';

  @override
  String get aboutTitle => 'PrayCalc کے بارے میں';

  @override
  String get aboutWebsite => 'ویب سائٹ';

  @override
  String get aboutContact => 'رابطہ';

  @override
  String get aboutLicenses => 'اوپن سورس لائسنس';

  @override
  String get aboutCouldNotOpen => 'لنک نہیں کھل سکا۔';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev۔ جملہ حقوق محفوظ ہیں۔\n\nنماز کے اوقات pray_calc_dart انجن سے حساب کیے جاتے ہیں۔ درستگی آپ کے GPS مقام اور منتخب حساب کے طریقے پر منحصر ہے۔';
  }

  @override
  String get commonCancel => 'منسوخ';

  @override
  String get commonSave => 'محفوظ کریں';

  @override
  String get commonDelete => 'حذف کریں';

  @override
  String get commonEdit => 'ترمیم';

  @override
  String get commonRetry => 'دوبارہ کوشش';

  @override
  String get commonClose => 'بند کریں';

  @override
  String get commonDone => 'ہو گیا';

  @override
  String get commonBack => 'واپس';

  @override
  String get commonNext => 'اگلا';

  @override
  String get commonSkip => 'چھوڑیں';

  @override
  String get commonContinue => 'جاری رکھیں';

  @override
  String get commonOk => 'ٹھیک ہے';

  @override
  String get commonYes => 'ہاں';

  @override
  String get commonNo => 'نہیں';

  @override
  String get commonShare => 'شیئر کریں';

  @override
  String get commonCopy => 'کاپی کریں';

  @override
  String get commonCopied => 'کلپ بورڈ پر کاپی ہو گیا';

  @override
  String get commonLoading => 'لوڈ ہو رہا ہے...';

  @override
  String get commonError => 'کچھ غلط ہو گیا';

  @override
  String get commonErrorRetry => 'کچھ غلط ہو گیا۔ دوبارہ کوشش کے لیے دبائیں۔';

  @override
  String get commonNoInternet => 'انٹرنیٹ کنکشن نہیں ہے';

  @override
  String get commonOfflineMode => 'آف لائن موڈ';

  @override
  String get commonSignIn => 'سائن ان';

  @override
  String get commonSignOut => 'سائن آؤٹ';

  @override
  String get commonSignUp => 'سائن اپ';

  @override
  String get commonProfile => 'پروفائل';

  @override
  String get commonAccount => 'اکاؤنٹ';

  @override
  String get commonAbout => 'تعارف';

  @override
  String commonVersion(String version) {
    return 'ورژن $version';
  }

  @override
  String get commonPrivacyPolicy => 'رازداری کی پالیسی';

  @override
  String get commonTermsOfService => 'شرائط و ضوابط';

  @override
  String get commonRateApp => 'ایپ کی درجہ بندی';

  @override
  String get commonFeedback => 'رائے بھیجیں';

  @override
  String get commonHelp => 'مدد';

  @override
  String get commonLanguage => 'زبان';

  @override
  String get commonOpenSettings => 'ترتیبات کھولیں';

  @override
  String get travelNotificationTitle => 'آپ اب سفر میں ہیں';

  @override
  String get travelNotificationBody =>
      'نماز کے اوقات قصر ہو سکتے ہیں۔ سفر کے احکام جاننے کے لیے دبائیں۔';

  @override
  String get travelRulingsTitle => 'سفر اور نماز';

  @override
  String get travelRulingsIntro =>
      'سفر میں نماز کے اسلامی احکام، قرآن اور صحیح احادیث سے علمی حوالوں کے ساتھ۔';

  @override
  String get travelWhenTitle => 'سفر کب لاگو ہوتا ہے؟';

  @override
  String get travelQasrTitle => 'نماز قصر کرنا';

  @override
  String get travelJamTitle => 'نمازیں جمع کرنا';

  @override
  String get travelDurationTitle => 'سفر کی مدت';

  @override
  String get travelReferencesTitle => 'علمی حوالے';

  @override
  String get travelLearnMore => 'مزید جانیں';

  @override
  String get travelHanafiDefaultTitle =>
      'PrayCalc حنفی ڈیفالٹ کیوں استعمال کرتا ہے';

  @override
  String get travelDeeperScholarly => 'مزید علمی بحث';

  @override
  String get onboardingTitle1 => 'نماز کے اوقات، آپ جہاں بھی ہوں';

  @override
  String get onboardingBody1 =>
      'دنیا کے ہر شہر کے لیے GPS درست نماز کے اوقات۔ فجر سے عشاء، طلوع سے قیام تک۔ ہمارے اپنے حساب کے انجن سے، درستگی کے لیے بنایا گیا۔';

  @override
  String get onboardingTitle2 => 'آپ کا مقام، آپ کے اوقات';

  @override
  String get onboardingBody2 =>
      'کوئی بھی شہر تلاش کریں یا GPS کو اپنا مقام معلوم کرنے دیں۔ PrayCalc دنیا بھر میں 50 لاکھ شہروں کے اوقات تلاش کرتا ہے۔';

  @override
  String get onboardingTitle3 => 'کوئی نماز نہ چھوڑیں';

  @override
  String get onboardingBody3 =>
      'نماز کے وقت اذان، پہلے سے یاد دہانی۔ سحری، کلاسوں اور مزید کے لیے مخصوص ایجنڈے۔';

  @override
  String get onboardingTitle4 => 'آپ کو جو کچھ چاہیے';

  @override
  String get onboardingBody4 =>
      'قبلہ قطب نما، نماز تقویم، ہجری چاند کے مراحل، تسبیح شمار۔ سب ایک جگہ۔';

  @override
  String get onboardingSkip => 'چھوڑیں';

  @override
  String get onboardingGetStarted => 'شروع کریں';

  @override
  String get onboardingSignInTitle => 'PrayCalc میں سائن ان کریں';

  @override
  String get onboardingSignInSubtitle =>
      'اپنی نماز کی تاریخ محفوظ کریں اور\nاپنے تمام آلات پر مزامنت کریں۔';

  @override
  String get onboardingContinueGoogle => 'Google کے ساتھ جاری رکھیں';

  @override
  String get onboardingContinueWithoutAccount => 'بغیر اکاؤنٹ جاری رکھیں';

  @override
  String get onboardingSigningIn => 'سائن ان ہو رہا ہے…';

  @override
  String get onboardingSelectLanguage => 'زبان منتخب کریں';

  @override
  String get duaDhikrTitle => 'دعا اور ذکر';

  @override
  String get duaDhikrTabDua => 'دعا';

  @override
  String get duaDhikrTabDhikr => 'ذکر';

  @override
  String get duaDhikrTabTasbeeh => 'تسبیح';

  @override
  String get duaDhikrTabMorning => 'صبح';

  @override
  String get duaDhikrTabEvening => 'شام';

  @override
  String get duaDhikrMorningAdhkar => 'صبح کے اذکار';

  @override
  String get duaDhikrEveningAdhkar => 'شام کے اذکار';

  @override
  String get calGregToggle => 'عیسوی';

  @override
  String get calHijriToggle => 'ہجری';

  @override
  String get calYearlyTooltip => 'سالانہ تقویم';

  @override
  String get calExportIcsTooltip => '.ics برآمد کریں';

  @override
  String get calMagCol => 'مغر';

  @override
  String get qiblaShowOnMap => 'نقشے پر دکھائیں';

  @override
  String get qiblaWaitingCompass => 'قطب نما کا انتظار...';

  @override
  String get qiblaNoCompassSensor =>
      'قطب نما سینسر نہیں ہے۔ قبلے کی سمت جامد دکھائی جا رہی ہے۔';

  @override
  String get qiblaAccuracyExcellent => 'بہترین درستگی';

  @override
  String get qiblaAccuracyGood => 'اچھی درستگی';

  @override
  String get qiblaAccuracyFair =>
      'مناسب درستگی۔ فون کو آٹھ کی شکل میں گھما کر کیلیبریٹ کریں۔';

  @override
  String get qiblaAccuracyLow =>
      'کم درستگی۔ فون کو آٹھ کی شکل میں گھما کر کیلیبریٹ کریں۔';

  @override
  String get qiblaToTheKaaba => 'کعبہ کی طرف';

  @override
  String get qiblaYourLocation => 'آپ کا مقام';

  @override
  String get qiblaGpsAccurate => 'GPS درست';

  @override
  String get qiblaCityCenter => 'شہر کا مرکز';

  @override
  String get moonIlluminatedLabel => 'روشن';

  @override
  String get moonAgeLabel => 'عمر';

  @override
  String get moonFirstQtr => 'پہلی تربیع';

  @override
  String get moonLastQtr => 'آخری تربیع';

  @override
  String get moonTonight => 'آج رات';

  @override
  String get moonTomorrow => 'کل';

  @override
  String moonDaysAway(int days) {
    return '$days دن';
  }

  @override
  String get moonBeta => 'بیٹا';

  @override
  String get setHomeTitle => 'گھر کا مقام مقرر کریں';

  @override
  String get setHomeSearchHint => 'شہر، قصبہ یا زپ کوڈ تلاش کریں…';

  @override
  String get setHomeClear => 'صاف کریں';

  @override
  String get setHomeUseCurrentLocation => 'موجودہ مقام استعمال کریں';

  @override
  String get setHomeDetectAndSet =>
      'اپنا مقام معلوم کریں اور گھر کے طور پر مقرر کریں';

  @override
  String get setHomeAlreadySet => 'گھر پہلے سے مقرر ہے';

  @override
  String setHomeSetAs(String city) {
    return '$city گھر کے طور پر مقرر ہو گیا';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'موجودہ مقام گھر کے طور پر مقرر ہو گیا';

  @override
  String get setHomePermissionDenied =>
      'مقام کی اجازت نہیں دی گئی۔ نیچے شہر تلاش کریں۔';

  @override
  String get setHomeGpsUnavailable => 'GPS دستیاب نہیں۔ دستی تلاش کریں۔';

  @override
  String get setHomeNoCitiesFound => 'کوئی شہر نہیں ملا۔';

  @override
  String get setHomeSearchPrompt => 'اپنا گھر کا شہر تلاش کریں';

  @override
  String get setHomeSearchBody =>
      'تلاش کے لیے اوپر ٹائپ کریں، یا اپنا موجودہ مقام استعمال کریں۔ سفر موڈ گھر سے دور ہونے کا پتہ لگائے گا۔';

  @override
  String get subscriptionYouHavePlus => 'آپ کے پاس امت+ ہے';

  @override
  String get subscriptionUpgradeTo => 'امت+ میں اپ گریڈ کریں';

  @override
  String get subscriptionThankYou => 'PrayCalc کی حمایت کا شکریہ۔';

  @override
  String get subscriptionUnlockPremium =>
      'اپنے تمام آلات پر پریمیم خصوصیات کھولیں۔';

  @override
  String get subscriptionManageSub => 'رکنیت کا انتظام';

  @override
  String get subscriptionWelcome => 'امت+ میں خوش آمدید!';

  @override
  String get subscriptionSubscribe => 'رکنیت حاصل کریں';

  @override
  String get subscriptionFreeFeatures => 'مفت خصوصیات';

  @override
  String get subscriptionPlusFeatures => 'امت+ خصوصیات';

  @override
  String get subscriptionFeaturePrayerTimes => 'نماز کے اوقات';

  @override
  String get subscriptionFeatureQibla => 'قبلہ قطب نما';

  @override
  String get subscriptionFeatureCalendar => 'ماہانہ تقویم';

  @override
  String get subscriptionFeatureTasbeeh => 'تسبیح شمار';

  @override
  String get subscriptionFeatureMoon => 'چاند اور ہجری';

  @override
  String get smartHomeAlertType => 'تنبیہ کی قسم';

  @override
  String get smartHomeAlertModal => 'فل سکرین ونڈو';

  @override
  String get smartHomeAlertCorner => 'کونے کی اطلاع';

  @override
  String get smartHomeAlertNone => 'کچھ نہیں (خاموش)';

  @override
  String get smartHomePauseMedia => 'اذان کے دوران میڈیا روکیں';

  @override
  String get smartHomeQuietHours => 'خاموشی کے اوقات';

  @override
  String get smartHomeQuietFrom => 'سے';

  @override
  String get smartHomeQuietTo => 'تک';

  @override
  String get smartHomePrayerAudio => 'ہر نماز کی آواز';

  @override
  String get smartHomeAudioAdhan => 'اذان';

  @override
  String get smartHomeAudioBeep => 'بیپ';

  @override
  String get smartHomeAudioSilent => 'خاموش';

  @override
  String get aboutPrivacy => 'رازداری کی پالیسی';

  @override
  String aboutVersion(String version) {
    return 'ورژن $version';
  }

  @override
  String get notifDefaultAdhan => 'پہلے سے طے شدہ اذان';

  @override
  String get notifFajrAdhan => 'فجر کی اذان';

  @override
  String get notifFajrAdhanSubtitle => 'فجر کی نماز کے وقت بجتی ہے';

  @override
  String get notifRegularAdhan => 'عام اذان';

  @override
  String get notifRegularAdhanSubtitle => 'ظہر، عصر، مغرب، عشاء پر بجتی ہے';

  @override
  String get notifPerPrayerSettings => 'ہر نماز کی ترتیبات';

  @override
  String get notifPreview => 'پیش نظارہ';

  @override
  String get tvSettingsTitle => 'ٹی وی ترتیبات';

  @override
  String get tvDisplayMode => 'ڈسپلے موڈ';

  @override
  String get tvMasjidMode => 'مسجد موڈ';

  @override
  String get tvMasjidModeSubtitle =>
      'اقامت کے اوقات کے ساتھ بڑا سائن بورڈ ڈسپلے';

  @override
  String get tvMasjidName => 'مسجد کا نام';

  @override
  String get tvMasjidNameTapToSet => 'مقرر کرنے کے لیے دبائیں';

  @override
  String get tvClock => 'گھڑی';

  @override
  String get tv24hFormat => '24 گھنٹے فارمیٹ';

  @override
  String get tvIqamahOffsets => 'اقامت کے فرق (اذان کے بعد منٹ)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'اذان کے بعد $offset منٹ';
  }

  @override
  String get tvQrCode => 'QR کوڈ';

  @override
  String get tvShowQrCode => 'QR کوڈ دکھائیں';

  @override
  String get tvShowQrCodeSubtitle => 'مسجد اسکرین پر QR کوڈ دکھائیں';

  @override
  String get tvQrCodeUrl => 'QR کوڈ URL';

  @override
  String get tvAmbientModeSection => 'ایمبیئنٹ موڈ';

  @override
  String get tvIdleTimeout => 'بیکار وقت';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'ایمبیئنٹ فعال ہونے سے پہلے $minutes منٹ';
  }

  @override
  String get tvPhotoInterval => 'تصویر کا وقفہ';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'تصاویر کے درمیان $seconds سیکنڈ';
  }

  @override
  String get tvBackground => 'پس منظر';

  @override
  String get tvPhotoCategory => 'تصویر کی قسم';

  @override
  String get tvLocation => 'مقام';

  @override
  String get tvChangeCity => 'شہر تبدیل کریں';

  @override
  String get tvChangeCitySubtitle => 'کوئی مختلف شہر تلاش کریں';

  @override
  String get tvScreensaverBg => 'اسکرین سیور پس منظر';

  @override
  String get tvScreensaverPhotos => 'تصاویر';

  @override
  String get tvScreensaverPattern => 'ہندسی پیٹرن';

  @override
  String get tvScreensaverBoth => 'تصاویر + پیٹرن';

  @override
  String get tvCategoryAll => 'تمام اقسام';

  @override
  String get tvCategoryMasjids => 'مساجد';

  @override
  String get tvCategoryInteriors => 'اندرونی سجاوٹ';

  @override
  String get tvCategoryGeometric => 'ہندسی';

  @override
  String get tvCategoryCalligraphy => 'خطاطی';

  @override
  String get tvCategoryLandscapes => 'مناظر';

  @override
  String get tvCategoryRamadan => 'رمضان';

  @override
  String get tvPhotoCategoryTitle => 'تصویر کی قسم';

  @override
  String tvEnterHint(String title) {
    return '$title درج کریں';
  }

  @override
  String get tvSystemDefault => 'نظام کا ڈیفالٹ';

  @override
  String get smartHomeIntegrations => 'انٹیگریشنز';

  @override
  String get smartHomeLinkedSpeakers => 'جوڑے گئے اسپیکرز اور ڈسپلے';

  @override
  String get smartHomeAlertDisplay => 'تنبیہ ڈسپلے';

  @override
  String get smartHomeAtAdhanShow => 'اذان کے وقت دکھائیں';

  @override
  String get smartHomePauseMediaTitle => 'اذان پر میڈیا روکیں';

  @override
  String get smartHomePauseMediaSubtitle =>
      'اذان ختم ہونے کے بعد دوبارہ شروع ہو گا';

  @override
  String get smartHomePrayerAudioSection => 'نماز کی آواز';

  @override
  String get smartHomeQuietHoursSection => 'خاموشی کے اوقات';

  @override
  String get smartHomeEnableQuietHours => 'خاموشی کے اوقات فعال کریں';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'تمام سمارٹ ہوم تنبیہات خاموش ہو جائیں گی';

  @override
  String get smartHomeNoDevices => 'ابھی تک کوئی آلہ نہیں جوڑا گیا';

  @override
  String get smartHomeNoDevicesDesc =>
      'اوپر Google Home یا Alexa جوڑیں، پھر آپ کے اسپیکرز اور ڈسپلے یہاں نظر آئیں گے۔';

  @override
  String get smartHomeRequiresPlus => 'سمارٹ ہوم کے لیے امت+ ضروری ہے';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Google Home، Alexa، Siri اور Home Assistant پر نماز کے اعلانات کنٹرول کریں۔ ترتیب دیں کہ کون سے آلات اذان بجائیں، میڈیا کب روکیں، اور خاموشی کے اوقات مقرر کریں۔';

  @override
  String get smartHomeBroadcastGoogle =>
      'Nest اسپیکرز اور ڈسپلے پر اذان نشر کریں۔';

  @override
  String get smartHomeEnableAlexa => 'Alexa پر PrayCalc اسکل فعال کریں۔';

  @override
  String get smartHomeSiriAsk =>
      'Siri سے نماز کے اوقات پوچھیں یا آٹومیشن مقرر کریں۔';

  @override
  String get smartHomeHassAdd => 'مکمل آٹومیشن کے لیے HACS سے شامل کریں۔';

  @override
  String get smartHomeSetupGuide => 'سیٹ اپ گائیڈ';

  @override
  String get smartHomeSiriSetupTitle => 'Siri شارٹ کٹس سیٹ اپ';

  @override
  String get smartHomeSiriStep1 =>
      'اپنے iPhone یا iPad پر شارٹ کٹس ایپ کھولیں۔';

  @override
  String get smartHomeSiriStep2 => 'نیا شارٹ کٹ بنانے کے لیے \"+\" دبائیں۔';

  @override
  String get smartHomeSiriStep3 =>
      'ایکشنز کی فہرست میں \"PrayCalc\" تلاش کریں۔';

  @override
  String get smartHomeSiriStep4 =>
      '\"اگلی نماز کا وقت\" یا \"آج کے نماز کے اوقات\" شامل کریں۔';

  @override
  String get smartHomeSiriStep5 =>
      'اختیاری طور پر کسی آٹومیشن میں شامل کریں (مثلاً روزانہ فجر پر)۔';

  @override
  String get smartHomeSiriStep6 =>
      'ٹیسٹ کے لیے \"Hey Siri، اگلی نماز کا وقت\" کہیں۔';

  @override
  String get smartHomeSiriFootnote => 'iOS 16 یا بعد کا ضروری ہے۔';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant سیٹ اپ';

  @override
  String get smartHomeHassStep1 =>
      'HACS (Home Assistant کمیونٹی اسٹور) انسٹال کریں۔';

  @override
  String get smartHomeHassStep2 =>
      'HACS میں \"PrayCalc\" تلاش کریں اور انسٹال کریں۔';

  @override
  String get smartHomeHassStep3 =>
      'ترتیبات > آلات اور خدمات > انٹیگریشن شامل کریں پر جائیں۔';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" تلاش کریں اور منتخب کریں۔';

  @override
  String get smartHomeHassStep5 =>
      'اپنی PrayCalc API کلید درج کریں (آپ کے اکاؤنٹ میں بنائی جاتی ہے)۔';

  @override
  String get smartHomeHassStep6 => 'اپنا مقام اور حساب کا طریقہ ترتیب دیں۔';

  @override
  String get smartHomeHassFootnote =>
      'HACS کے ساتھ Home Assistant 2024.1+ ضروری ہے۔';

  @override
  String get smartHomeApiKey => 'API کلید';

  @override
  String get smartHomeGenerateApiKey => 'API کلید بنائیں';

  @override
  String get smartHomeApiKeyNotReady =>
      'PrayCalc سمارٹ سروس کی تعیناتی کے بعد API کلید بنانا دستیاب ہو گا۔';

  @override
  String get smartHomeApiKeyDesc =>
      'Home Assistant کو اپنے PrayCalc اکاؤنٹ سے جوڑنے کے لیے API کلید ضروری ہو گی۔';

  @override
  String get smartHomeLinkedStatus => 'جوڑا ہوا';

  @override
  String get smartHomeNotLinkedStatus => 'جوڑا نہیں ہوا';

  @override
  String get smartHomeCouldNotOpen => 'لنک نہیں کھل سکا۔';

  @override
  String get smartHomeDevices => 'آلات';

  @override
  String get smartHomeAddDevice => 'آلہ شامل کریں';

  @override
  String get smartHomeDeleteDevice => 'حذف کریں';

  @override
  String get smartHomeDeleteDeviceConfirm => 'یہ آلہ ہٹائیں؟';

  @override
  String get smartHomeDeviceOnline => 'آن لائن';

  @override
  String get smartHomeDeviceOffline => 'آف لائن';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'آخری بار دیکھا: $time';
  }

  @override
  String get smartHomeDeviceName => 'آلے کا نام';

  @override
  String get smartHomeDeviceType => 'آلے کی قسم';

  @override
  String get smartHomeDeviceTypeTv => 'ٹی وی';

  @override
  String get smartHomeDeviceTypeSpeaker => 'اسپیکر';

  @override
  String get smartHomeDeviceTypeWatch => 'گھڑی';

  @override
  String get smartHomeDeviceTypeDesktop => 'ڈیسکٹاپ';

  @override
  String get smartHomeDeviceTypeOther => 'دیگر';

  @override
  String get smartHomeDeviceAdhan => 'اذان کی اطلاعات';

  @override
  String get smartHomeDeviceAdhanDesc => 'اس آلے پر اذان کے الرٹ وصول کریں';

  @override
  String get smartHomeDeviceVolume => 'والیوم';

  @override
  String get smartHomeDeviceAudioType => 'آواز کی قسم';

  @override
  String get smartHomeDeviceEnabledPrayers => 'فعال نمازیں';

  @override
  String get smartHomeDeviceSettings => 'آلے کی ترتیبات';

  @override
  String get smartHomeTesting => 'جانچ ہو رہی ہے...';

  @override
  String get smartHomeTestSuccess => 'کنکشن تصدیق ہو گیا';

  @override
  String get smartHomeTestFailed => 'کنکشن ٹیسٹ ناکام';

  @override
  String get smartHomePairTv => 'ٹی وی جوڑیں';

  @override
  String get smartHomePairingTv => 'ٹی وی رجسٹر ہو رہا ہے...';

  @override
  String get smartHomePairTvSuccess => 'ٹی وی کامیابی سے جوڑا گیا';

  @override
  String get smartHomePairTvFailed => 'ٹی وی جوڑنا ناکام';

  @override
  String get smartHomeLoadingDevices => 'آلات لوڈ ہو رہے ہیں...';

  @override
  String get smartHomeLoadingIntegrations => 'انٹیگریشنز لوڈ ہو رہی ہیں...';

  @override
  String get smartHomeServiceUnavailable =>
      'سمارٹ ہوم سروس ابھی دستیاب نہیں ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total مکمل';
  }

  @override
  String get adhkarReset => 'دوبارہ شروع';

  @override
  String get syncHistoryTitle => 'مزامنت کی تاریخ';

  @override
  String get syncClearHistory => 'تاریخ صاف کریں';

  @override
  String get syncNoConflicts =>
      'مزامنت میں کوئی تنازعات نہیں۔ تمام آلات مزامنت ہیں۔';

  @override
  String get syncDomainSettings => 'ترتیبات';

  @override
  String get syncDomainCities => 'محفوظ شہر';

  @override
  String get syncDomainPrayerLogs => 'نماز کے ریکارڈ';

  @override
  String get syncTimeJustNow => 'ابھی';

  @override
  String syncTimeMinAgo(int min) {
    return '$min منٹ پہلے';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour گھنٹے پہلے';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day دن پہلے';
  }

  @override
  String get pinCity => 'پن کریں';

  @override
  String get pinMaxReached =>
      'زیادہ سے زیادہ 5 پن شدہ شہر۔ مزید کے لیے امت+ میں اپ گریڈ کریں۔';

  @override
  String pinCityUnpinned(String city) {
    return '$city ان پن ہو گیا';
  }

  @override
  String get pinUndo => 'واپس';

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

  @override
  String get tvJumuahGreeting => 'جمعہ مبارک';

  @override
  String get tvChildFajrExplanation =>
      'Fajr is the morning prayer. We wake up before sunrise to thank Allah for a new day!';

  @override
  String get tvChildFajrFunFact =>
      'The Prophet ﷺ said: “The best prayer in the sight of Allah is Fajr on Friday.” (Bukhari)';

  @override
  String get tvChildSunriseExplanation =>
      'After Fajr, the sun rises. This is a blessed time to make dhikr and read Quran.';

  @override
  String get tvChildSunriseFunFact =>
      'Sitting after Fajr until sunrise and praying two rak’ahs earns the reward of a full Hajj! (Tirmidhi)';

  @override
  String get tvChildDhuhrExplanation =>
      'Dhuhr is the midday prayer. The sun is highest in the sky, and we pause to remember Allah.';

  @override
  String get tvChildDhuhrFunFact =>
      'The Prophet ﷺ loved to pray Dhuhr early when the sun begins to decline. (Muslim)';

  @override
  String get tvChildAsrExplanation =>
      'Asr is the afternoon prayer. Allah swears by this time in Surah Al-Asr — it is very important!';

  @override
  String get tvChildAsrFunFact =>
      'Missing Asr prayer is like losing one’s family and wealth. That is how much Allah loves it! (Bukhari)';

  @override
  String get tvChildMaghribExplanation =>
      'Maghrib is the sunset prayer. When the sun sets, we thank Allah for the beautiful day.';

  @override
  String get tvChildMaghribFunFact =>
      'The angels of the day and night meet at Fajr and Maghrib. How special! (Bukhari)';

  @override
  String get tvChildIshaExplanation =>
      'Isha is the night prayer. We end our day by thanking Allah before we sleep.';

  @override
  String get tvChildIshaFunFact =>
      'Praying Isha and Fajr in congregation is like praying all night long! (Muslim)';

  @override
  String get desktopOpen => 'Open PrayCalc';

  @override
  String get desktopQuit => 'Quit PrayCalc';

  @override
  String get desktopSettings => 'Settings…';

  @override
  String get desktopTvDisplays => 'TV Displays…';

  @override
  String get desktopTrayTooltip => 'PrayCalc - Prayer Times';

  @override
  String get desktopNextPrayer => 'Next Prayer…';
}
