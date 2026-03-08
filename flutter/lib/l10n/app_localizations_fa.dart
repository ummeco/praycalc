// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Persian (`fa`).
class AppLocalizationsFa extends AppLocalizations {
  AppLocalizationsFa([String locale = 'fa']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'فجر';

  @override
  String get prayerSunrise => 'طلوع آفتاب';

  @override
  String get prayerDhuhr => 'ظهر';

  @override
  String get prayerAsr => 'عصر';

  @override
  String get prayerMaghrib => 'مغرب';

  @override
  String get prayerIsha => 'عشاء';

  @override
  String get prayerQiyam => 'قیام شب';

  @override
  String get prayerSuhoor => 'سحری';

  @override
  String get prayerIftar => 'افطار';

  @override
  String get hijriMuharram => 'محرم';

  @override
  String get hijriSafar => 'صفر';

  @override
  String get hijriRabiAlAwwal => 'ربیع‌الاول';

  @override
  String get hijriRabiAlThani => 'ربیع‌الثانی';

  @override
  String get hijriJumadaAlAwwal => 'جمادی‌الاول';

  @override
  String get hijriJumadaAlThani => 'جمادی‌الثانی';

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
  String get monthJan => 'ژانویه';

  @override
  String get monthFeb => 'فوریه';

  @override
  String get monthMar => 'مارس';

  @override
  String get monthApr => 'آوریل';

  @override
  String get monthMay => 'مه';

  @override
  String get monthJun => 'ژوئن';

  @override
  String get monthJul => 'ژوئیه';

  @override
  String get monthAug => 'اوت';

  @override
  String get monthSep => 'سپتامبر';

  @override
  String get monthOct => 'اکتبر';

  @override
  String get monthNov => 'نوامبر';

  @override
  String get monthDec => 'دسامبر';

  @override
  String get monthJanuary => 'ژانویه';

  @override
  String get monthFebruary => 'فوریه';

  @override
  String get monthMarch => 'مارس';

  @override
  String get monthApril => 'آوریل';

  @override
  String get monthMayFull => 'مه';

  @override
  String get monthJune => 'ژوئن';

  @override
  String get monthJuly => 'ژوئیه';

  @override
  String get monthAugust => 'اوت';

  @override
  String get monthSeptember => 'سپتامبر';

  @override
  String get monthOctober => 'اکتبر';

  @override
  String get monthNovember => 'نوامبر';

  @override
  String get monthDecember => 'دسامبر';

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
  String get dayThursday => 'پنج‌شنبه';

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
  String get chooseCityLabel => 'شهری را انتخاب کنید';

  @override
  String get setCityFab => 'تنظیم شهر';

  @override
  String prayerTimesError(Object error) {
    return 'محاسبه اوقات نماز ممکن نیست.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer تا';
  }

  @override
  String get ramadanMubarak => 'رمضان مبارک';

  @override
  String ramadanDayProgress(int day) {
    return 'روز $day / ۳۰';
  }

  @override
  String get lastTenNights => '۱۰ شب آخر';

  @override
  String get laylatulQadr => 'شب قدر';

  @override
  String get homeSuffixAH => 'ه.ق';

  @override
  String get homeSuffixCE => 'م';

  @override
  String get homeNoCitySelected => 'شهری انتخاب نشده';

  @override
  String get homeNoCityHint =>
      'بالا را لمس کنید تا شهرتان را جستجو کنید یا GPS را فعال نمایید.';

  @override
  String get homeCouldNotCalc => 'محاسبه اوقات نماز ممکن نیست.';

  @override
  String get homeQasr => 'قصر';

  @override
  String get homeActionMonthlyTimes => 'اوقات\nماهانه';

  @override
  String get homeActionDuaDhikr => 'دعا و\nذکر';

  @override
  String get homeActionPrayerStats => 'آمار\nنماز';

  @override
  String homePolarBanner(int count) {
    return '$count وقت نماز برای موقعیت شما در این دوره قابل محاسبه نیست (خورشید نیمه‌شب / شب قطبی). تخمین نزدیک‌ترین عرض جغرافیایی را در تنظیمات امتحان کنید.';
  }

  @override
  String get settingsTitle => 'تنظیمات';

  @override
  String get settingsSectionPrayerCalc => 'محاسبه نماز';

  @override
  String get settingsCalcMethod => 'روش محاسبه';

  @override
  String get settingsCalcMethodAuto => 'خودکار (پویا)';

  @override
  String get settingsHanafiAsr => 'عصر حنفی';

  @override
  String get settingsHanafiAsrSubtitle => 'ضریب سایه ۲ برابر (وقت عصر دیرتر)';

  @override
  String get settingsSectionDisplay => 'نمایش';

  @override
  String get settings24hClock => 'ساعت ۲۴ ساعته';

  @override
  String get settingsFollowSystemTheme => 'پیروی از تم سیستم';

  @override
  String get settingsDarkMode => 'حالت تاریک';

  @override
  String get settingsSectionNotifications => 'اعلان‌ها';

  @override
  String get settingsPrayerNotifications => 'اعلان‌های نماز';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'اذان، یادآوری‌ها و تنظیمات هر نماز';

  @override
  String get settingsPrayerAgendas => 'برنامه‌های نماز';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'یادآوری‌های سفارشی مرتبط با اوقات نماز';

  @override
  String get settingsAccount => 'حساب کاربری';

  @override
  String get settingsSignInToSync => 'ورود برای همگام‌سازی';

  @override
  String get settingsSignInToSyncSubtitle =>
      'داده‌هایتان را در دستگاه‌ها نگهداری کنید';

  @override
  String get settingsHomeScreen => 'صفحه اصلی';

  @override
  String get settingsSkyGradient => 'پس‌زمینه گرادیان آسمان';

  @override
  String get settingsSkyGradientSubtitle => 'رنگ‌های آسمان متحرک مطابق وقت روز';

  @override
  String get settingsWeatherGradient => 'گرادیان هوا';

  @override
  String get settingsWeatherGradientSubtitle =>
      'تنظیم رنگ‌های آسمان بر اساس آب‌وهوای محلی';

  @override
  String get settingsCountdownAnimation => 'انیمیشن شمارش معکوس';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'حلقه تنفسی روی شمارش معکوس نماز بعدی';

  @override
  String get settingsPrayerTracking => 'پیگیری نماز';

  @override
  String get settingsTrackMyPrayers => 'پیگیری نمازهایم';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'ثبت نمازهایی که هر روز به جا می‌آورید';

  @override
  String get settingsPrayerStats => 'آمار نماز';

  @override
  String get settingsPrayerStatsSubtitle => 'رشته‌ها، نمودارهای هفتگی و ماهانه';

  @override
  String get settingsJumuahKahf => 'یادآوری سوره کهف جمعه';

  @override
  String get settingsJumuahKahfSubtitle =>
      'یادآوری در روزهای جمعه برای خواندن سوره کهف';

  @override
  String get settingsTravel => 'سفر';

  @override
  String get settingsTravelMode => 'حالت سفر';

  @override
  String get settingsTravelModeSubtitle =>
      'تشخیص خودکار دور بودن از خانه و تنظیم نمازها';

  @override
  String get settingsHomeLocation => 'موقعیت خانه';

  @override
  String get settingsHomeLocationNotSet =>
      'تنظیم نشده — لمس کنید تا از موقعیت فعلی استفاده شود';

  @override
  String get settingsClearHomeLocation => 'پاک کردن موقعیت خانه';

  @override
  String get settingsTravelRulings => 'احکام نماز مسافر';

  @override
  String get settingsTravelRulingsSubtitle => 'قصر، جمع و راهنمای مسافر';

  @override
  String get settingsSmartHome => 'خانه هوشمند';

  @override
  String get settingsSmartHomeIntegrations => 'اتصال خانه هوشمند';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit، Google Home، Alexa، Home Assistant';

  @override
  String get settingsTvDisplay => 'نمایشگر تلویزیون';

  @override
  String get settingsTvHome => 'نمایش خانه تلویزیون';

  @override
  String get settingsTvHomeSubtitle => 'ساعت نماز تمام‌صفحه برای تلویزیون';

  @override
  String get settingsMasjidDisplay => 'نمایشگر مسجد';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'جدول اذان/اقامه برای صفحه‌نمایش مسجد';

  @override
  String get settingsTvSettings => 'تنظیمات تلویزیون';

  @override
  String get settingsTvSettingsSubtitle => 'حالت مسجد، آفست اقامه، محیطی';

  @override
  String get settingsAboutPrayCalc => 'درباره PrayCalc';

  @override
  String get syncSynced => 'همگام‌سازی شده';

  @override
  String get syncSyncing => 'در حال همگام‌سازی...';

  @override
  String get syncOffline => 'آفلاین';

  @override
  String get syncError => 'خطای همگام‌سازی';

  @override
  String get notifSettingsTitle => 'اعلان‌ها و اذان';

  @override
  String get notifAdhanLabel => 'اذان';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'یادآوری: $minutes دقیقه قبل';
  }

  @override
  String notifVolumePct(int pct) {
    return 'صدا: $pct٪';
  }

  @override
  String get notifTestAdhan => 'آزمایش اذان';

  @override
  String get notifModeOff => 'خاموش';

  @override
  String get notifModeReminderOnly => 'فقط یادآوری';

  @override
  String get notifModeArrival => 'در وقت نماز';

  @override
  String get notifModeBoth => 'یادآوری + وقت نماز';

  @override
  String get citySearchHint => 'جستجوی شهر…';

  @override
  String get citySearchDetectTooltip => 'تشخیص موقعیت من';

  @override
  String get citySearchNoCityGps => 'تشخیص شهر از GPS ممکن نشد.';

  @override
  String get citySearchPermissionDenied =>
      'مجوز موقعیت رد شد. به صورت دستی جستجو کنید.';

  @override
  String get citySearchNoResults => 'شهری یافت نشد.';

  @override
  String get citySearchStartTyping => 'شروع به تایپ برای جستجو…';

  @override
  String get agendasTitle => 'برنامه‌های نماز';

  @override
  String get agendasEmpty =>
      'هنوز برنامه‌ای نیست.\n+ را لمس کنید تا یادآوری مرتبط با نمازهایتان اضافه کنید.';

  @override
  String get agendasUndo => 'بازگردانی';

  @override
  String agendasRemoved(String label) {
    return '$label حذف شد';
  }

  @override
  String get agendaNewTitle => 'برنامه جدید';

  @override
  String get agendaEditTitle => 'ویرایش برنامه';

  @override
  String get agendaSave => 'ذخیره';

  @override
  String get agendaLabelEmpty => 'برچسب نمی‌تواند خالی باشد';

  @override
  String get agendaLabelField => 'برچسب';

  @override
  String get agendaLabelHint => 'مثلاً بیدار شدن برای فجر';

  @override
  String get agendaPrayerSection => 'نماز';

  @override
  String get agendaTimeOffsetSection => 'فاصله زمانی';

  @override
  String get agendaOffsetAtPrayerTime => 'در وقت نماز';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes دقیقه قبل';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes دقیقه بعد';
  }

  @override
  String get agendaRepeatSection => 'تکرار';

  @override
  String get agendaNotifTypeSection => 'نوع اعلان';

  @override
  String get agendaNotifSilent => 'بی‌صدا';

  @override
  String get agendaNotifSound => 'صدا';

  @override
  String get agendaNotifVibrate => 'لرزش';

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
  String get moonTitle => 'ماه و تقویم هجری';

  @override
  String moonIlluminated(int pct) {
    return '$pct٪ روشن';
  }

  @override
  String get moonFullTonight => 'ماه کامل امشب!';

  @override
  String get moonNextTomorrow => 'ماه کامل بعدی فردا';

  @override
  String moonNextDays(int days) {
    return 'ماه کامل بعدی در $days روز';
  }

  @override
  String moonAge(String age) {
    return 'سن ماه: $age روز';
  }

  @override
  String get moonPhaseNewMoon => 'ماه نو';

  @override
  String get moonPhaseWaxingCrescent => 'هلال رو به افزایش';

  @override
  String get moonPhaseFirstQuarter => 'تربیع اول';

  @override
  String get moonPhaseWaxingGibbous => 'محدب رو به افزایش';

  @override
  String get moonPhaseFullMoon => 'بدر';

  @override
  String get moonPhaseWaningGibbous => 'محدب رو به کاهش';

  @override
  String get moonPhaseLastQuarter => 'تربیع آخر';

  @override
  String get moonPhaseWaningCrescent => 'هلال رو به کاهش';

  @override
  String get moonHilalVisibility => 'رؤیت هلال بعدی';

  @override
  String get moonRegionMiddleEast => 'خاورمیانه';

  @override
  String get moonRegionWestAfrica => 'غرب آفریقا';

  @override
  String get moonRegionSouthAsia => 'جنوب آسیا';

  @override
  String get moonRegionEurope => 'اروپا';

  @override
  String get moonRegionAmericas => 'آمریکا';

  @override
  String get moonVisible => 'قابل رؤیت';

  @override
  String get moonNotVisible => 'غیر قابل رؤیت';

  @override
  String get moonPossible => 'احتمالی';

  @override
  String get moonUpcomingDates => 'تاریخ‌های اسلامی پیش رو';

  @override
  String get hijriTodayLabel => 'امروز در تقویم هجری';

  @override
  String ramadanBeginsLabel(int year) {
    return 'آغاز رمضان $year ه.ق';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days روز مانده';
  }

  @override
  String get moonLunarCycle => 'چرخه قمری';

  @override
  String moonDayOfCycle(int day) {
    return 'روز $day از ~۲۹.۵';
  }

  @override
  String get moonHilalSightingForecast => 'پیش‌بینی رؤیت هلال';

  @override
  String get moonHilalVisibilityMap => 'نقشه رؤیت هلال';

  @override
  String moonDayN(int day) {
    return 'روز $day';
  }

  @override
  String get moonGlobalSighting => 'رؤیت جهانی';

  @override
  String get moonZoneNakedEye => 'چشم غیرمسلح';

  @override
  String get moonZoneBinoculars => 'دوربین دوچشمی';

  @override
  String get moonZoneVeryDifficult => 'بسیار دشوار';

  @override
  String get moonZoneNotVisible => 'غیر قابل رؤیت';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year ه.ق احتمالاً ۲۹ روزه خواهد بود. انتظار رؤیت هلال در روز ۲۹ام، ان‌شاءالله.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year ه.ق احتمالاً ۳۰ روزه خواهد بود. رؤیت هلال در روز ۲۹ام بعید است — ماه ۳۰ روز کامل می‌شود.';
  }

  @override
  String get moonUmmAlQura => 'ام‌القری';

  @override
  String get moonSaudiArabia => 'عربستان سعودی';

  @override
  String get moonFCNACalc => 'FCNA / محاسبه';

  @override
  String get moonNorthAmerica => 'آمریکای شمالی';

  @override
  String moonNDays(int days) {
    return '$days روز';
  }

  @override
  String moonStarts(String month) {
    return 'آغاز $month:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'سن ماه در غروب: $hours ساعت';
  }

  @override
  String get moon7DayLunarCalendar => 'تقویم قمری ۷ روزه';

  @override
  String get moonUpcomingIslamicEvents => 'رویدادهای اسلامی پیش رو';

  @override
  String get moonTodayLabel => 'امروز';

  @override
  String get moonTomorrowLabel => 'فردا';

  @override
  String get calDateCol => 'تاریخ';

  @override
  String get calHijriCol => 'هجری';

  @override
  String get calFajrCol => 'فجر';

  @override
  String get calSunriseCol => 'طلوع';

  @override
  String get calDhuhrCol => 'ظهر';

  @override
  String get calAsrCol => 'عصر';

  @override
  String get calMaghribCol => 'مغرب';

  @override
  String get calIshaCol => 'عشاء';

  @override
  String get calNoCityText =>
      'ابتدا شهرتان را تنظیم کنید\nتا تقویم نماز را مشاهده نمایید.';

  @override
  String get calShareTooltip => 'اشتراک‌گذاری تقویم';

  @override
  String get calPrevMonthTooltip => 'ماه قبل';

  @override
  String get calNextMonthTooltip => 'ماه بعد';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'اوقات نماز — $month';
  }

  @override
  String get qiblaTitle => 'قبله';

  @override
  String get qiblaSwitchToCompass => 'تغییر به قطب‌نما';

  @override
  String get qiblaSwitchToAR => 'تغییر به دوربین واقعیت افزوده';

  @override
  String get qiblaNoCityText =>
      'ابتدا شهرتان را تنظیم کنید\nتا جهت قبله محاسبه شود.';

  @override
  String get qiblaCompassUnavailable =>
      'سنسور قطب‌نما در این دستگاه موجود نیست.';

  @override
  String get qiblaCalibrate => 'کالیبره: گوشی خود را به شکل عدد ۸ حرکت دهید.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° از شمال';
  }

  @override
  String qiblaFrom(String city) {
    return 'از $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist کیلومتر تا کعبه';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '$dist هزار کیلومتر تا کعبه';
  }

  @override
  String get qiblaFacingQibla => 'رو به قبله ✓';

  @override
  String get tasbeehTitle => 'تسبیح';

  @override
  String get tasbeehResetTooltip => 'بازنشانی';

  @override
  String get tasbeehTapToSwitch => 'برچسب را لمس کنید تا تغییر کند';

  @override
  String get tasbeehTapToCount => 'هر جایی را لمس کنید تا بشمارید';

  @override
  String get tasbeehResetDialogTitle => 'بازنشانی شمارنده؟';

  @override
  String get tasbeehResetDialogContent =>
      'شمارش فعلی به صفر بازنشانی خواهد شد.';

  @override
  String get tasbeehCancel => 'انصراف';

  @override
  String get tasbeehReset => 'بازنشانی';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'امروز: $count ذکر';
  }

  @override
  String get tasbeehLast7Days => '۷ روز گذشته';

  @override
  String get tasbeehNoHistory => 'هنوز سابقه‌ای نیست — شمارش را شروع کنید!';

  @override
  String tasbeehComplete(int count) {
    return 'تسبیح کامل شد! $count ذکر';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'خانه هوشمند';

  @override
  String get smartHomeSubtitle => 'دستگاه‌هایتان را به اوقات نماز متصل کنید';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'از گوگل درباره اوقات نماز و جهت قبله بپرسید';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'از الکسا درباره اوقات نماز، نماز بعدی و موارد دیگر بپرسید';

  @override
  String get smartHomeSiri => 'میانبرهای Siri';

  @override
  String get smartHomeSiriDesc => 'میانبرهای سفارشی برای اوقات نماز بسازید';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'خودکارسازی چراغ‌ها، نمایشگرها و یادآوری‌ها در وقت نماز';

  @override
  String get smartHomeLinkAccount => 'اتصال حساب';

  @override
  String get smartHomeLinked => 'متصل';

  @override
  String get smartHomeUnlink => 'قطع اتصال';

  @override
  String get smartHomeSetupInstructions => 'دستورالعمل‌های نصب';

  @override
  String get smartHomeRequiresUmmatPlus => 'نیاز به Ummat+ دارد';

  @override
  String get smartHomeTroubleshooting => 'عیب‌یابی';

  @override
  String get smartHomeTestConnection => 'آزمایش اتصال';

  @override
  String get smartHomeConnectionSuccess => 'اتصال موفق';

  @override
  String get smartHomeConnectionFailed =>
      'اتصال ناموفق. اتصال حسابتان را بررسی کنید.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'ویژگی‌های ممتاز اوقات نماز';

  @override
  String get subscriptionUpgrade => 'ارتقا به Ummat+';

  @override
  String get subscriptionRestore => 'بازیابی خرید';

  @override
  String get subscriptionManage => 'مدیریت اشتراک';

  @override
  String get subscriptionCancel => 'لغو اشتراک';

  @override
  String get subscriptionActive => 'فعال';

  @override
  String get subscriptionExpired => 'منقضی شده';

  @override
  String get subscriptionFree => 'رایگان';

  @override
  String get subscriptionFreeDesc => 'اوقات نماز پایه، قبله، تقویم';

  @override
  String get subscriptionPlusDesc =>
      'خانه هوشمند، نمایش تلویزیون، ویجت‌ها و بیشتر';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count پرس‌وجوی رایگان باقیمانده';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/سال';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/ماه';
  }

  @override
  String get subscriptionFeatureSmartHome => 'اتصال خانه هوشمند';

  @override
  String get subscriptionFeatureTV => 'حالت نمایش تلویزیون';

  @override
  String get subscriptionFeatureWidgets => 'ویجت‌های صفحه اصلی';

  @override
  String get subscriptionFeatureWatch => 'صفحات ساعت';

  @override
  String get subscriptionFeatureSync => 'همگام‌سازی بین دستگاه‌ها';

  @override
  String get subscriptionFeatureAdFree => 'بدون تبلیغات';

  @override
  String get watchTitle => 'ساعت';

  @override
  String get watchNextPrayer => 'نماز بعدی';

  @override
  String get watchAllPrayers => 'همه نمازها';

  @override
  String get watchComplication => 'صفحه';

  @override
  String get nextPrayer => 'نماز بعدی';

  @override
  String get allPrayers => 'همه نمازها';

  @override
  String get today => 'امروز';

  @override
  String get tomorrow => 'فردا';

  @override
  String get thisWeek => 'این هفته';

  @override
  String get thisMonth => 'این ماه';

  @override
  String get loginCreateAccount => 'ایجاد حساب';

  @override
  String get loginSignIn => 'ورود';

  @override
  String get loginWelcomeBack => 'خوش آمدید';

  @override
  String get loginJoinPrayCalc => 'عضویت در PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'داده‌های نمازتان را در دستگاه‌ها همگام‌سازی کنید';

  @override
  String get loginContinueGoogle => 'ادامه با Google';

  @override
  String get loginOr => 'یا';

  @override
  String get loginSigningIn => 'در حال ورود…';

  @override
  String get loginNameLabel => 'نام نمایشی (اختیاری)';

  @override
  String get loginEmailLabel => 'ایمیل';

  @override
  String get loginPasswordLabel => 'رمز عبور';

  @override
  String get loginEmailRequired => 'ایمیل الزامی است';

  @override
  String get loginEmailInvalid => 'یک آدرس ایمیل معتبر وارد کنید';

  @override
  String get loginPasswordRequired => 'رمز عبور الزامی است';

  @override
  String get loginPasswordMinLength => 'رمز عبور باید حداقل ۸ کاراکتر باشد';

  @override
  String get loginForgotPassword => 'رمز عبور را فراموش کردید؟';

  @override
  String get loginEnterEmailFirst => 'ابتدا آدرس ایمیلتان را وارد کنید';

  @override
  String get loginResetSent => 'ایمیل بازنشانی رمز عبور ارسال شد';

  @override
  String get loginResetFailed => 'ارسال ایمیل بازنشانی ممکن نشد';

  @override
  String get loginNewToPrayCalc => 'تازه وارد PrayCalc هستید؟';

  @override
  String get loginAlreadyHaveAccount => 'قبلاً حساب دارید؟';

  @override
  String get accountTitle => 'حساب کاربری';

  @override
  String get accountNotSignedIn => 'وارد نشده‌اید';

  @override
  String get accountSyncSection => 'همگام‌سازی';

  @override
  String get accountSyncStatus => 'وضعیت همگام‌سازی';

  @override
  String get accountSyncNow => 'همگام‌سازی الان';

  @override
  String get accountSyncHistory => 'تاریخچه همگام‌سازی';

  @override
  String get accountNoConflicts => 'تعارضی شناسایی نشد';

  @override
  String accountConflictsResolved(int count) {
    return '$count حل شده';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'همگام‌سازی شده $time';
  }

  @override
  String get accountOfflineStatus => 'آفلاین. تغییرات به صورت محلی ذخیره شد.';

  @override
  String get accountSyncErrorStatus => 'خطای همگام‌سازی. دوباره تلاش خواهد شد.';

  @override
  String get accountDataSection => 'داده‌ها';

  @override
  String get accountExportData => 'خروجی داده‌ها';

  @override
  String get accountExportSubtitle => 'دانلود تنظیمات و گزارش نمازهایتان';

  @override
  String get accountExportFailed => 'خروجی داده‌ها ممکن نشد';

  @override
  String get accountSignOutTitle => 'خروج';

  @override
  String get accountSignOutBody =>
      'داده‌های محلی شما حفظ خواهد شد. دوباره وارد شوید تا همگام‌سازی ادامه یابد.';

  @override
  String get accountDeleteAccount => 'حذف حساب';

  @override
  String get accountDeleteSubtitle => 'حذف دائمی حساب و داده‌هایتان';

  @override
  String get accountDeleteBody =>
      'حساب و تمام داده‌های همگام‌سازی شده به صورت دائمی حذف خواهد شد. داده‌های محلی روی این دستگاه حذف نخواهد شد.\n\nاین عمل قابل بازگشت نیست.';

  @override
  String get accountDeleted => 'حساب حذف شد';

  @override
  String get accountDeleteFailed => 'حذف حساب ممکن نشد';

  @override
  String get accountTimeJustNow => 'همین الان';

  @override
  String accountTimeMinAgo(int min) {
    return '$min دقیقه پیش';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour ساعت پیش';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day روز پیش';
  }

  @override
  String get statsTitle => 'آمار نماز';

  @override
  String get statsShareTooltip => 'اشتراک آمار';

  @override
  String get statsTodayPrayers => 'نمازهای امروز';

  @override
  String statsTodayCount(int done) {
    return '$done / ۵';
  }

  @override
  String get statsStreak => 'رشته';

  @override
  String get statsDays => 'روز';

  @override
  String get statsThisWeek => 'این هفته';

  @override
  String get statsCompletion => 'تکمیل';

  @override
  String get statsThisMonth => 'این ماه';

  @override
  String get statsMostMissed => 'بیشترین فوت شده';

  @override
  String get statsThisWeekLabel => 'این هفته';

  @override
  String get statsWeeklyChart => 'تکمیل هفتگی به تفکیک نماز';

  @override
  String get statsMonthlyChart => 'تکمیل ماهانه به تفکیک نماز';

  @override
  String statsTotalLogged(int count) {
    return '$count نماز ثبت شده';
  }

  @override
  String get statsKeepItUp => 'ادامه دهید!';

  @override
  String get statsShareTitle => 'آمار نماز PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'رشته: $days روز';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'هفتگی: $pct٪';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'ماهانه: $pct٪';
  }

  @override
  String get statsShareBreakdown => 'جزئیات هفتگی:';

  @override
  String get aboutTitle => 'درباره PrayCalc';

  @override
  String get aboutWebsite => 'وب‌سایت';

  @override
  String get aboutContact => 'تماس';

  @override
  String get aboutLicenses => 'مجوزهای متن‌باز';

  @override
  String get aboutCouldNotOpen => 'باز کردن لینک ممکن نشد.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. تمام حقوق محفوظ است.\n\nاوقات نماز با موتور pray_calc_dart محاسبه می‌شود. دقت به موقعیت GPS و روش محاسبه انتخابی شما بستگی دارد.';
  }

  @override
  String get commonCancel => 'انصراف';

  @override
  String get commonSave => 'ذخیره';

  @override
  String get commonDelete => 'حذف';

  @override
  String get commonEdit => 'ویرایش';

  @override
  String get commonRetry => 'تلاش مجدد';

  @override
  String get commonClose => 'بستن';

  @override
  String get commonDone => 'انجام شد';

  @override
  String get commonBack => 'بازگشت';

  @override
  String get commonNext => 'بعدی';

  @override
  String get commonSkip => 'رد شدن';

  @override
  String get commonContinue => 'ادامه';

  @override
  String get commonOk => 'تایید';

  @override
  String get commonYes => 'بله';

  @override
  String get commonNo => 'خیر';

  @override
  String get commonShare => 'اشتراک';

  @override
  String get commonCopy => 'کپی';

  @override
  String get commonCopied => 'در کلیپ‌بورد کپی شد';

  @override
  String get commonLoading => 'در حال بارگذاری...';

  @override
  String get commonError => 'مشکلی پیش آمد';

  @override
  String get commonErrorRetry => 'مشکلی پیش آمد. لمس کنید تا دوباره تلاش شود.';

  @override
  String get commonNoInternet => 'بدون اتصال اینترنت';

  @override
  String get commonOfflineMode => 'حالت آفلاین';

  @override
  String get commonSignIn => 'ورود';

  @override
  String get commonSignOut => 'خروج';

  @override
  String get commonSignUp => 'ثبت‌نام';

  @override
  String get commonProfile => 'پروفایل';

  @override
  String get commonAccount => 'حساب';

  @override
  String get commonAbout => 'درباره';

  @override
  String commonVersion(String version) {
    return 'نسخه $version';
  }

  @override
  String get commonPrivacyPolicy => 'سیاست حفظ حریم خصوصی';

  @override
  String get commonTermsOfService => 'شرایط خدمات';

  @override
  String get commonRateApp => 'امتیازدهی به برنامه';

  @override
  String get commonFeedback => 'ارسال بازخورد';

  @override
  String get commonHelp => 'راهنما';

  @override
  String get commonLanguage => 'زبان';

  @override
  String get commonOpenSettings => 'باز کردن تنظیمات';

  @override
  String get travelNotificationTitle => 'شما در حال سفر هستید';

  @override
  String get travelNotificationBody =>
      'نمازها ممکن است کوتاه شوند. لمس کنید تا احکام نماز مسافر را بخوانید.';

  @override
  String get travelRulingsTitle => 'سفر و نماز';

  @override
  String get travelRulingsIntro =>
      'احکام اسلامی نماز در سفر، با مراجع علمی از قرآن و مجموعه‌های حدیث معتبر.';

  @override
  String get travelWhenTitle => 'سفر کی اعمال می‌شود؟';

  @override
  String get travelQasrTitle => 'کوتاه کردن نماز (قصر)';

  @override
  String get travelJamTitle => 'جمع خواندن نماز';

  @override
  String get travelDurationTitle => 'مدت سفر';

  @override
  String get travelReferencesTitle => 'مراجع علمی';

  @override
  String get travelLearnMore => 'بیشتر بدانید';

  @override
  String get travelHanafiDefaultTitle =>
      'چرا PrayCalc پیش‌فرض حنفی را استفاده می‌کند';

  @override
  String get travelDeeperScholarly => 'بحث علمی عمیق‌تر';

  @override
  String get onboardingTitle1 => 'اوقات نماز، هر کجا که باشید';

  @override
  String get onboardingBody1 =>
      'اوقات نماز دقیق GPS برای هر شهری روی زمین. فجر تا عشاء، طلوع تا قیام. با موتور محاسبه اختصاصی ما، ساخته شده برای دقت.';

  @override
  String get onboardingTitle2 => 'موقعیت شما، اوقات شما';

  @override
  String get onboardingBody2 =>
      'هر شهری را جستجو کنید یا اجازه دهید GPS موقعیتتان را تشخیص دهد. PrayCalc اوقات ۵ میلیون شهر در سراسر جهان را پیدا می‌کند.';

  @override
  String get onboardingTitle3 => 'هیچ نمازی را از دست ندهید';

  @override
  String get onboardingBody3 =>
      'اذان در وقت نماز، یادآوری قبل از آن. برنامه‌های سفارشی برای سحری، کلاس‌ها و بیشتر.';

  @override
  String get onboardingTitle4 => 'هر آنچه نیاز دارید';

  @override
  String get onboardingBody4 =>
      'قطب‌نمای قبله، تقویم نماز، فاز قمری هجری، شمارنده تسبیح. همه در یک جا.';

  @override
  String get onboardingSkip => 'رد شدن';

  @override
  String get onboardingGetStarted => 'شروع کنید';

  @override
  String get onboardingSignInTitle => 'ورود به PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'تاریخچه نمازتان را ذخیره کرده\nو در تمام دستگاه‌هایتان همگام کنید.';

  @override
  String get onboardingContinueGoogle => 'ادامه با Google';

  @override
  String get onboardingContinueWithoutAccount => 'ادامه بدون حساب';

  @override
  String get onboardingSigningIn => 'در حال ورود…';

  @override
  String get onboardingSelectLanguage => 'انتخاب زبان';

  @override
  String get duaDhikrTitle => 'دعا و ذکر';

  @override
  String get duaDhikrTabDua => 'دعاها';

  @override
  String get duaDhikrTabDhikr => 'ذکر';

  @override
  String get duaDhikrTabTasbeeh => 'تسبیح';

  @override
  String get duaDhikrTabMorning => 'صبح';

  @override
  String get duaDhikrTabEvening => 'عصر';

  @override
  String get duaDhikrMorningAdhkar => 'اذکار صبح';

  @override
  String get duaDhikrEveningAdhkar => 'اذکار عصر';

  @override
  String get calGregToggle => 'میلادی';

  @override
  String get calHijriToggle => 'هجری';

  @override
  String get calYearlyTooltip => 'تقویم سالانه';

  @override
  String get calExportIcsTooltip => 'خروجی .ics';

  @override
  String get calMagCol => 'مغرب';

  @override
  String get qiblaShowOnMap => 'نمایش روی نقشه';

  @override
  String get qiblaWaitingCompass => 'انتظار قطب‌نما...';

  @override
  String get qiblaNoCompassSensor =>
      'سنسور قطب‌نما موجود نیست. جهت قبله به صورت ثابت نمایش داده می‌شود.';

  @override
  String get qiblaAccuracyExcellent => 'دقت عالی';

  @override
  String get qiblaAccuracyGood => 'دقت خوب';

  @override
  String get qiblaAccuracyFair =>
      'دقت متوسط. با حرکت دادن گوشی به شکل عدد ۸ کالیبره کنید.';

  @override
  String get qiblaAccuracyLow =>
      'دقت پایین. با حرکت دادن گوشی به شکل عدد ۸ کالیبره کنید.';

  @override
  String get qiblaToTheKaaba => 'به سوی کعبه';

  @override
  String get qiblaYourLocation => 'موقعیت شما';

  @override
  String get qiblaGpsAccurate => 'دقیق GPS';

  @override
  String get qiblaCityCenter => 'مرکز شهر';

  @override
  String get moonIlluminatedLabel => 'روشنایی';

  @override
  String get moonAgeLabel => 'سن';

  @override
  String get moonFirstQtr => 'تربیع اول';

  @override
  String get moonLastQtr => 'تربیع آخر';

  @override
  String get moonTonight => 'امشب';

  @override
  String get moonTomorrow => 'فردا';

  @override
  String moonDaysAway(int days) {
    return '$days روز';
  }

  @override
  String get moonBeta => 'آزمایشی';

  @override
  String get setHomeTitle => 'تنظیم موقعیت خانه';

  @override
  String get setHomeSearchHint => 'جستجوی شهر، روستا یا کد پستی…';

  @override
  String get setHomeClear => 'پاک کردن';

  @override
  String get setHomeUseCurrentLocation => 'استفاده از موقعیت فعلی';

  @override
  String get setHomeDetectAndSet =>
      'موقعیت خود را تشخیص داده و به عنوان خانه تنظیم کنید';

  @override
  String get setHomeAlreadySet => 'خانه قبلاً تنظیم شده';

  @override
  String setHomeSetAs(String city) {
    return '$city به عنوان خانه تنظیم شد';
  }

  @override
  String get setHomeCurrentLocationSet => 'موقعیت فعلی به عنوان خانه تنظیم شد';

  @override
  String get setHomePermissionDenied =>
      'مجوز موقعیت رد شد. شهری را در زیر جستجو کنید.';

  @override
  String get setHomeGpsUnavailable =>
      'GPS در دسترس نیست. به صورت دستی جستجو کنید.';

  @override
  String get setHomeNoCitiesFound => 'شهری یافت نشد.';

  @override
  String get setHomeSearchPrompt => 'شهر خانه خود را جستجو کنید';

  @override
  String get setHomeSearchBody =>
      'بالا تایپ کنید تا جستجو کنید، یا از موقعیت فعلیتان استفاده نمایید. حالت سفر تشخیص می‌دهد که از خانه دور هستید.';

  @override
  String get subscriptionYouHavePlus => 'شما Ummat+ دارید';

  @override
  String get subscriptionUpgradeTo => 'ارتقا به Ummat+';

  @override
  String get subscriptionThankYou => 'از حمایتتان از PrayCalc سپاسگزاریم.';

  @override
  String get subscriptionUnlockPremium =>
      'ویژگی‌های ممتاز را در تمام دستگاه‌هایتان باز کنید.';

  @override
  String get subscriptionManageSub => 'مدیریت اشتراک';

  @override
  String get subscriptionWelcome => 'به Ummat+ خوش آمدید!';

  @override
  String get subscriptionSubscribe => 'اشتراک';

  @override
  String get subscriptionFreeFeatures => 'ویژگی‌های رایگان';

  @override
  String get subscriptionPlusFeatures => 'ویژگی‌های Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'اوقات نماز';

  @override
  String get subscriptionFeatureQibla => 'قطب‌نمای قبله';

  @override
  String get subscriptionFeatureCalendar => 'تقویم ماهانه';

  @override
  String get subscriptionFeatureTasbeeh => 'شمارنده تسبیح';

  @override
  String get subscriptionFeatureMoon => 'ماه و هجری';

  @override
  String get smartHomeAlertType => 'نوع هشدار';

  @override
  String get smartHomeAlertModal => 'پنجره تمام‌صفحه';

  @override
  String get smartHomeAlertCorner => 'اعلان گوشه‌ای';

  @override
  String get smartHomeAlertNone => 'بدون صدا (ساکت)';

  @override
  String get smartHomePauseMedia => 'توقف رسانه هنگام اذان';

  @override
  String get smartHomeQuietHours => 'ساعات سکوت';

  @override
  String get smartHomeQuietFrom => 'از';

  @override
  String get smartHomeQuietTo => 'تا';

  @override
  String get smartHomePrayerAudio => 'صدای هر نماز';

  @override
  String get smartHomeAudioAdhan => 'اذان';

  @override
  String get smartHomeAudioBeep => 'بوق';

  @override
  String get smartHomeAudioSilent => 'ساکت';

  @override
  String get aboutPrivacy => 'سیاست حفظ حریم خصوصی';

  @override
  String aboutVersion(String version) {
    return 'نسخه $version';
  }

  @override
  String get notifDefaultAdhan => 'اذان پیش‌فرض';

  @override
  String get notifFajrAdhan => 'اذان فجر';

  @override
  String get notifFajrAdhanSubtitle => 'در وقت نماز فجر پخش می‌شود';

  @override
  String get notifRegularAdhan => 'اذان معمولی';

  @override
  String get notifRegularAdhanSubtitle => 'در ظهر، عصر، مغرب، عشاء پخش می‌شود';

  @override
  String get notifPerPrayerSettings => 'تنظیمات هر نماز';

  @override
  String get notifPreview => 'پیش‌نمایش';

  @override
  String get tvSettingsTitle => 'تنظیمات تلویزیون';

  @override
  String get tvDisplayMode => 'حالت نمایش';

  @override
  String get tvMasjidMode => 'حالت مسجد';

  @override
  String get tvMasjidModeSubtitle => 'نمایشگر بزرگ تابلو با اوقات اقامه';

  @override
  String get tvMasjidName => 'نام مسجد';

  @override
  String get tvMasjidNameTapToSet => 'لمس کنید تا تنظیم شود';

  @override
  String get tvClock => 'ساعت';

  @override
  String get tv24hFormat => 'قالب ۲۴ ساعته';

  @override
  String get tvIqamahOffsets => 'فاصله اقامه (دقیقه بعد از اذان)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset دقیقه بعد از اذان';
  }

  @override
  String get tvQrCode => 'کد QR';

  @override
  String get tvShowQrCode => 'نمایش کد QR';

  @override
  String get tvShowQrCodeSubtitle => 'نمایش کد QR روی صفحه مسجد';

  @override
  String get tvQrCodeUrl => 'آدرس کد QR';

  @override
  String get tvAmbientModeSection => 'حالت محیطی';

  @override
  String get tvIdleTimeout => 'زمان بیکاری';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes دقیقه تا فعال شدن حالت محیطی';
  }

  @override
  String get tvPhotoInterval => 'فاصله عکس‌ها';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds ثانیه بین عکس‌ها';
  }

  @override
  String get tvBackground => 'پس‌زمینه';

  @override
  String get tvPhotoCategory => 'دسته‌بندی عکس';

  @override
  String get tvLocation => 'موقعیت';

  @override
  String get tvChangeCity => 'تغییر شهر';

  @override
  String get tvChangeCitySubtitle => 'جستجوی شهر دیگر';

  @override
  String get tvScreensaverBg => 'پس‌زمینه محافظ صفحه';

  @override
  String get tvScreensaverPhotos => 'عکس‌ها';

  @override
  String get tvScreensaverPattern => 'الگوی هندسی';

  @override
  String get tvScreensaverBoth => 'عکس‌ها + الگو';

  @override
  String get tvCategoryAll => 'همه دسته‌ها';

  @override
  String get tvCategoryMasjids => 'مساجد';

  @override
  String get tvCategoryInteriors => 'فضای داخلی';

  @override
  String get tvCategoryGeometric => 'هندسی';

  @override
  String get tvCategoryCalligraphy => 'خوشنویسی';

  @override
  String get tvCategoryLandscapes => 'مناظر';

  @override
  String get tvCategoryRamadan => 'رمضان';

  @override
  String get tvPhotoCategoryTitle => 'دسته‌بندی عکس';

  @override
  String tvEnterHint(String title) {
    return 'وارد کردن $title';
  }

  @override
  String get tvSystemDefault => 'پیش‌فرض سیستم';

  @override
  String get smartHomeIntegrations => 'اتصال‌ها';

  @override
  String get smartHomeLinkedSpeakers => 'بلندگوها و نمایشگرهای متصل';

  @override
  String get smartHomeAlertDisplay => 'نمایش هشدار';

  @override
  String get smartHomeAtAdhanShow => 'در وقت اذان نمایش بده';

  @override
  String get smartHomePauseMediaTitle => 'توقف رسانه در وقت اذان';

  @override
  String get smartHomePauseMediaSubtitle => 'بعد از پایان اذان ادامه می‌یابد';

  @override
  String get smartHomePrayerAudioSection => 'صدای نماز';

  @override
  String get smartHomeQuietHoursSection => 'ساعات سکوت';

  @override
  String get smartHomeEnableQuietHours => 'فعال کردن ساعات سکوت';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'همه هشدارهای خانه هوشمند بی‌صدا می‌شوند';

  @override
  String get smartHomeNoDevices => 'هنوز دستگاهی متصل نشده';

  @override
  String get smartHomeNoDevicesDesc =>
      'Google Home یا Alexa را از بالا متصل کنید، سپس بلندگوها و نمایشگرهایتان اینجا ظاهر می‌شوند.';

  @override
  String get smartHomeRequiresPlus => 'خانه هوشمند نیاز به Ummat+ دارد';

  @override
  String get smartHomeRequiresPlusDesc =>
      'اعلام نماز را در Google Home، Alexa، Siri و Home Assistant کنترل کنید. تنظیم کنید کدام دستگاه‌ها اذان پخش کنند، چه زمانی رسانه متوقف شود و ساعات سکوت تعیین نمایید.';

  @override
  String get smartHomeBroadcastGoogle =>
      'پخش اذان روی بلندگوها و نمایشگرهای Nest.';

  @override
  String get smartHomeEnableAlexa => 'مهارت PrayCalc را در Alexa فعال کنید.';

  @override
  String get smartHomeSiriAsk =>
      'از Siri درباره اوقات نماز بپرسید یا خودکارسازی تنظیم کنید.';

  @override
  String get smartHomeHassAdd =>
      'از طریق HACS برای پشتیبانی کامل خودکارسازی اضافه کنید.';

  @override
  String get smartHomeSetupGuide => 'راهنمای نصب';

  @override
  String get smartHomeSiriSetupTitle => 'راه‌اندازی میانبرهای Siri';

  @override
  String get smartHomeSiriStep1 =>
      'برنامه Shortcuts را در iPhone یا iPad خود باز کنید.';

  @override
  String get smartHomeSiriStep2 => '\"+\" را لمس کنید تا میانبر جدیدی بسازید.';

  @override
  String get smartHomeSiriStep3 => '\"PrayCalc\" را در لیست عملیات جستجو کنید.';

  @override
  String get smartHomeSiriStep4 =>
      '\"وقت نماز بعدی\" یا \"اوقات نماز امروز\" را اضافه کنید.';

  @override
  String get smartHomeSiriStep5 =>
      'به صورت اختیاری به خودکارسازی اضافه کنید (مثلاً هر روز در وقت فجر).';

  @override
  String get smartHomeSiriStep6 =>
      'بگویید \"Hey Siri, وقت نماز بعدی\" تا آزمایش کنید.';

  @override
  String get smartHomeSiriFootnote => 'نیاز به iOS ۱۶ یا بالاتر دارد.';

  @override
  String get smartHomeHassSetupTitle => 'راه‌اندازی Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'HACS (فروشگاه جامعه Home Assistant) را نصب کنید.';

  @override
  String get smartHomeHassStep2 => 'در HACS، \"PrayCalc\" را جستجو و نصب کنید.';

  @override
  String get smartHomeHassStep3 =>
      'به تنظیمات > دستگاه‌ها و سرویس‌ها > افزودن ادغام بروید.';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" را جستجو و انتخاب کنید.';

  @override
  String get smartHomeHassStep5 =>
      'کلید API PrayCalc خود را وارد کنید (در حسابتان ایجاد شده).';

  @override
  String get smartHomeHassStep6 => 'موقعیت و روش محاسبه خود را تنظیم کنید.';

  @override
  String get smartHomeHassFootnote =>
      'نیاز به Home Assistant 2024.1+ با HACS دارد.';

  @override
  String get smartHomeApiKey => 'کلید API';

  @override
  String get smartHomeGenerateApiKey => 'ایجاد کلید API';

  @override
  String get smartHomeApiKeyNotReady =>
      'ایجاد کلید API پس از راه‌اندازی سرویس هوشمند PrayCalc در دسترس خواهد بود.';

  @override
  String get smartHomeApiKeyDesc =>
      'برای اتصال Home Assistant به حساب PrayCalc خود به کلید API نیاز دارید.';

  @override
  String get smartHomeLinkedStatus => 'متصل';

  @override
  String get smartHomeNotLinkedStatus => 'متصل نیست';

  @override
  String get smartHomeCouldNotOpen => 'باز کردن لینک ممکن نشد.';

  @override
  String get smartHomeDevices => 'دستگاه‌ها';

  @override
  String get smartHomeAddDevice => 'افزودن دستگاه';

  @override
  String get smartHomeDeleteDevice => 'حذف';

  @override
  String get smartHomeDeleteDeviceConfirm => 'این دستگاه حذف شود؟';

  @override
  String get smartHomeDeviceOnline => 'آنلاین';

  @override
  String get smartHomeDeviceOffline => 'آفلاین';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'آخرین مشاهده: $time';
  }

  @override
  String get smartHomeDeviceName => 'نام دستگاه';

  @override
  String get smartHomeDeviceType => 'نوع دستگاه';

  @override
  String get smartHomeDeviceTypeTv => 'تلویزیون';

  @override
  String get smartHomeDeviceTypeSpeaker => 'بلندگو';

  @override
  String get smartHomeDeviceTypeWatch => 'ساعت';

  @override
  String get smartHomeDeviceTypeDesktop => 'رایانه';

  @override
  String get smartHomeDeviceTypeOther => 'سایر';

  @override
  String get smartHomeDeviceAdhan => 'اعلان‌های اذان';

  @override
  String get smartHomeDeviceAdhanDesc => 'دریافت هشدارهای اذان در این دستگاه';

  @override
  String get smartHomeDeviceVolume => 'حجم صدا';

  @override
  String get smartHomeDeviceAudioType => 'نوع صدا';

  @override
  String get smartHomeDeviceEnabledPrayers => 'نمازهای فعال';

  @override
  String get smartHomeDeviceSettings => 'تنظیمات دستگاه';

  @override
  String get smartHomeTesting => 'در حال آزمایش...';

  @override
  String get smartHomeTestSuccess => 'اتصال تأیید شد';

  @override
  String get smartHomeTestFailed => 'آزمایش اتصال ناموفق بود';

  @override
  String get smartHomePairTv => 'جفت‌سازی تلویزیون';

  @override
  String get smartHomePairingTv => 'در حال ثبت تلویزیون...';

  @override
  String get smartHomePairTvSuccess => 'تلویزیون با موفقیت جفت شد';

  @override
  String get smartHomePairTvFailed => 'جفت‌سازی تلویزیون ناموفق بود';

  @override
  String get smartHomeLoadingDevices => 'در حال بارگذاری دستگاه‌ها...';

  @override
  String get smartHomeLoadingIntegrations =>
      'در حال بارگذاری یکپارچه‌سازی‌ها...';

  @override
  String get smartHomeServiceUnavailable =>
      'سرویس خانه هوشمند در حال حاضر در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total تکمیل شده';
  }

  @override
  String get adhkarReset => 'بازنشانی';

  @override
  String get syncHistoryTitle => 'تاریخچه همگام‌سازی';

  @override
  String get syncClearHistory => 'پاک کردن تاریخچه';

  @override
  String get syncNoConflicts =>
      'تعارض همگام‌سازی شناسایی نشد. همه دستگاه‌ها همگام هستند.';

  @override
  String get syncDomainSettings => 'تنظیمات';

  @override
  String get syncDomainCities => 'شهرهای ذخیره شده';

  @override
  String get syncDomainPrayerLogs => 'گزارش نماز';

  @override
  String get syncTimeJustNow => 'همین الان';

  @override
  String syncTimeMinAgo(int min) {
    return '$min دقیقه پیش';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour ساعت پیش';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day روز پیش';
  }

  @override
  String get pinCity => 'سنجاق';

  @override
  String get pinMaxReached =>
      'حداکثر ۵ شهر سنجاق شده. برای بیشتر به Ummat+ ارتقا دهید.';

  @override
  String pinCityUnpinned(String city) {
    return '$city از سنجاق درآمد';
  }

  @override
  String get pinUndo => 'بازگردانی';
}
