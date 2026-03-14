// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'الفجر';

  @override
  String get prayerSunrise => 'الشروق';

  @override
  String get prayerDhuhr => 'الظهر';

  @override
  String get prayerAsr => 'العصر';

  @override
  String get prayerMaghrib => 'المغرب';

  @override
  String get prayerIsha => 'العشاء';

  @override
  String get prayerQiyam => 'قيام الليل';

  @override
  String get prayerSuhoor => 'السحور';

  @override
  String get prayerIftar => 'الإفطار';

  @override
  String get hijriMuharram => 'محرم';

  @override
  String get hijriSafar => 'صفر';

  @override
  String get hijriRabiAlAwwal => 'ربيع الأول';

  @override
  String get hijriRabiAlThani => 'ربيع الثاني';

  @override
  String get hijriJumadaAlAwwal => 'جمادى الأولى';

  @override
  String get hijriJumadaAlThani => 'جمادى الآخرة';

  @override
  String get hijriRajab => 'رجب';

  @override
  String get hijriShaban => 'شعبان';

  @override
  String get hijriRamadan => 'رمضان';

  @override
  String get hijriShawwal => 'شوال';

  @override
  String get hijriDhulQidah => 'ذو القعدة';

  @override
  String get hijriDhulHijjah => 'ذو الحجة';

  @override
  String get monthJan => 'يناير';

  @override
  String get monthFeb => 'فبراير';

  @override
  String get monthMar => 'مارس';

  @override
  String get monthApr => 'أبريل';

  @override
  String get monthMay => 'مايو';

  @override
  String get monthJun => 'يونيو';

  @override
  String get monthJul => 'يوليو';

  @override
  String get monthAug => 'أغسطس';

  @override
  String get monthSep => 'سبتمبر';

  @override
  String get monthOct => 'أكتوبر';

  @override
  String get monthNov => 'نوفمبر';

  @override
  String get monthDec => 'ديسمبر';

  @override
  String get monthJanuary => 'يناير';

  @override
  String get monthFebruary => 'فبراير';

  @override
  String get monthMarch => 'مارس';

  @override
  String get monthApril => 'أبريل';

  @override
  String get monthMayFull => 'مايو';

  @override
  String get monthJune => 'يونيو';

  @override
  String get monthJuly => 'يوليو';

  @override
  String get monthAugust => 'أغسطس';

  @override
  String get monthSeptember => 'سبتمبر';

  @override
  String get monthOctober => 'أكتوبر';

  @override
  String get monthNovember => 'نوفمبر';

  @override
  String get monthDecember => 'ديسمبر';

  @override
  String get dayMonShort => 'الإثنين';

  @override
  String get dayTueShort => 'الثلاثاء';

  @override
  String get dayWedShort => 'الأربعاء';

  @override
  String get dayThuShort => 'الخميس';

  @override
  String get dayFriShort => 'الجمعة';

  @override
  String get daySatShort => 'السبت';

  @override
  String get daySunShort => 'الأحد';

  @override
  String get dayMonday => 'الإثنين';

  @override
  String get dayTuesday => 'الثلاثاء';

  @override
  String get dayWednesday => 'الأربعاء';

  @override
  String get dayThursday => 'الخميس';

  @override
  String get dayFriday => 'الجمعة';

  @override
  String get daySaturday => 'السبت';

  @override
  String get daySunday => 'الأحد';

  @override
  String get daySuChart => 'أح';

  @override
  String get dayMoChart => 'إث';

  @override
  String get dayTuChart => 'ثل';

  @override
  String get dayWeChart => 'أر';

  @override
  String get dayThChart => 'خم';

  @override
  String get dayFrChart => 'جم';

  @override
  String get daySaChart => 'سب';

  @override
  String get chooseCityLabel => 'اختر مدينة';

  @override
  String get setCityFab => 'تحديد المدينة';

  @override
  String prayerTimesError(Object error) {
    return 'تعذّر حساب أوقات الصلاة.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer في';
  }

  @override
  String get ramadanMubarak => 'رمضان مبارك 🌙';

  @override
  String ramadanDayProgress(int day) {
    return 'اليوم $day / 30';
  }

  @override
  String get lastTenNights => 'العشر الأواخر ✨';

  @override
  String get laylatulQadr => 'ليلة القدر ✨';

  @override
  String get homeSuffixAH => 'هـ';

  @override
  String get homeSuffixCE => 'م';

  @override
  String get homeNoCitySelected => 'لم يتم اختيار مدينة';

  @override
  String get homeNoCityHint => 'اضغط أعلاه للبحث عن مدينتك أو تفعيل GPS.';

  @override
  String get homeCouldNotCalc => 'تعذّر حساب أوقات الصلاة.';

  @override
  String get homeQasr => 'قصر';

  @override
  String get homeActionMonthlyTimes => 'الأوقات\nالشهرية';

  @override
  String get homeActionDuaDhikr => 'الدعاء\nوالذكر';

  @override
  String get homeActionPrayerStats => 'إحصائيات\nالصلاة';

  @override
  String homePolarBanner(int count) {
    return 'لا يمكن حساب $count من أوقات الصلاة لموقعك خلال هذه الفترة (شمس منتصف الليل / ليل قطبي). جرب تقدير خط العرض الأقرب في الإعدادات.';
  }

  @override
  String get settingsTitle => 'الإعدادات';

  @override
  String get settingsSectionPrayerCalc => 'حساب أوقات الصلاة';

  @override
  String get settingsCalcMethod => 'طريقة الحساب';

  @override
  String get settingsCalcMethodAuto => 'تلقائي (ديناميكي)';

  @override
  String get settingsHanafiAsr => 'عصر الحنفية';

  @override
  String get settingsHanafiAsrSubtitle => 'ضعف الظل (وقت العصر المتأخر)';

  @override
  String get settingsSectionDisplay => 'العرض';

  @override
  String get settings24hClock => 'ساعة 24';

  @override
  String get settingsFollowSystemTheme => 'اتبع سمة النظام';

  @override
  String get settingsDarkMode => 'الوضع الداكن';

  @override
  String get settingsSectionNotifications => 'الإشعارات';

  @override
  String get settingsPrayerNotifications => 'إشعارات الصلاة';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'الأذان والتذكيرات وإعدادات كل صلاة';

  @override
  String get settingsPrayerAgendas => 'جداول الصلاة';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'تذكيرات مخصصة بفارق عن أوقات الصلاة';

  @override
  String get settingsAccount => 'الحساب';

  @override
  String get settingsSignInToSync => 'سجّل الدخول للمزامنة';

  @override
  String get settingsSignInToSyncSubtitle => 'حافظ على بياناتك عبر الأجهزة';

  @override
  String get settingsHomeScreen => 'الشاشة الرئيسية';

  @override
  String get settingsSkyGradient => 'خلفية تدرج السماء';

  @override
  String get settingsSkyGradientSubtitle =>
      'ألوان سماء متحركة تتناسب مع وقت اليوم';

  @override
  String get settingsWeatherGradient => 'تدرج ملون بالطقس';

  @override
  String get settingsWeatherGradientSubtitle =>
      'ضبط ألوان السماء بناءً على الطقس المحلي';

  @override
  String get settingsCountdownAnimation => 'رسوم العد التنازلي';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'حلقة تنفسية على العد التنازلي للصلاة التالية';

  @override
  String get settingsPrayerTracking => 'تتبع الصلاة';

  @override
  String get settingsTrackMyPrayers => 'تتبع صلواتي';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'سجّل الصلوات التي تؤديها كل يوم';

  @override
  String get settingsPrayerStats => 'إحصائيات الصلاة';

  @override
  String get settingsPrayerStatsSubtitle =>
      'السلاسل والرسوم البيانية الأسبوعية والشهرية';

  @override
  String get settingsJumuahKahf => 'تذكير سورة الكهف يوم الجمعة';

  @override
  String get settingsJumuahKahfSubtitle =>
      'تذكير أيام الجمعة لقراءة سورة الكهف';

  @override
  String get settingsTravel => 'السفر';

  @override
  String get settingsTravelMode => 'وضع السفر';

  @override
  String get settingsTravelModeSubtitle =>
      'الكشف التلقائي عن الابتعاد عن المنزل وضبط الصلوات';

  @override
  String get settingsHomeLocation => 'موقع المنزل';

  @override
  String get settingsHomeLocationNotSet =>
      'غير محدد — اضغط لاستخدام الموقع الحالي';

  @override
  String get settingsClearHomeLocation => 'مسح موقع المنزل';

  @override
  String get settingsTravelRulings => 'أحكام صلاة المسافر';

  @override
  String get settingsTravelRulingsSubtitle => 'القصر والجمع وإرشادات المسافر';

  @override
  String get settingsSmartHome => 'المنزل الذكي';

  @override
  String get settingsSmartHomeIntegrations => 'تكاملات المنزل الذكي';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit، Google Home، Alexa، Home Assistant';

  @override
  String get settingsTvDisplay => 'شاشة التلفاز';

  @override
  String get settingsTvHome => 'عرض التلفاز الرئيسي';

  @override
  String get settingsTvHomeSubtitle => 'ساعة صلاة بملء الشاشة للتلفاز';

  @override
  String get settingsMasjidDisplay => 'شاشة المسجد';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'جدول الأذان والإقامة لشاشات المسجد';

  @override
  String get settingsTvSettings => 'إعدادات التلفاز';

  @override
  String get settingsTvSettingsSubtitle =>
      'وضع المسجد، فروق الإقامة، الوضع المحيطي';

  @override
  String get settingsAboutPrayCalc => 'حول PrayCalc';

  @override
  String get syncSynced => 'تمت المزامنة';

  @override
  String get syncSyncing => 'جاري المزامنة...';

  @override
  String get syncOffline => 'غير متصل';

  @override
  String get syncError => 'خطأ في المزامنة';

  @override
  String get notifSettingsTitle => 'الإشعارات والأذان';

  @override
  String get notifAdhanLabel => 'الأذان';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'تذكير: $minutes دقيقة قبل';
  }

  @override
  String notifVolumePct(int pct) {
    return 'الصوت: $pct%';
  }

  @override
  String get notifTestAdhan => 'اختبار الأذان';

  @override
  String get notifModeOff => 'إيقاف';

  @override
  String get notifModeReminderOnly => 'تذكير فقط';

  @override
  String get notifModeArrival => 'عند وقت الصلاة';

  @override
  String get notifModeBoth => 'تذكير + وصول';

  @override
  String get citySearchHint => 'البحث عن مدينة…';

  @override
  String get citySearchDetectTooltip => 'تحديد موقعي';

  @override
  String get citySearchNoCityGps => 'تعذّر تحديد المدينة من GPS.';

  @override
  String get citySearchPermissionDenied => 'رُفض إذن الموقع. ابحث يدوياً.';

  @override
  String get citySearchNoResults => 'لم يتم العثور على مدن.';

  @override
  String get citySearchStartTyping => 'ابدأ الكتابة للبحث…';

  @override
  String get agendasTitle => 'جداول الصلاة';

  @override
  String get agendasEmpty =>
      'لا توجد جداول بعد.\nاضغط + لإضافة تذكير مرتبط بصلواتك.';

  @override
  String get agendasUndo => 'تراجع';

  @override
  String agendasRemoved(String label) {
    return 'تمت إزالة $label';
  }

  @override
  String get agendaNewTitle => 'جدول جديد';

  @override
  String get agendaEditTitle => 'تعديل الجدول';

  @override
  String get agendaSave => 'حفظ';

  @override
  String get agendaLabelEmpty => 'لا يمكن أن يكون العنوان فارغاً';

  @override
  String get agendaLabelField => 'العنوان';

  @override
  String get agendaLabelHint => 'مثال: الاستيقاظ للفجر';

  @override
  String get agendaPrayerSection => 'الصلاة';

  @override
  String get agendaTimeOffsetSection => 'فرق الوقت';

  @override
  String get agendaOffsetAtPrayerTime => 'عند وقت الصلاة';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes دقيقة قبل';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes دقيقة بعد';
  }

  @override
  String get agendaRepeatSection => 'التكرار';

  @override
  String get agendaNotifTypeSection => 'نوع الإشعار';

  @override
  String get agendaNotifSilent => 'صامت';

  @override
  String get agendaNotifSound => 'صوت';

  @override
  String get agendaNotifVibrate => 'اهتزاز';

  @override
  String get agendaDayM => 'إ';

  @override
  String get agendaDayT => 'ث';

  @override
  String get agendaDayW => 'أ';

  @override
  String get agendaDayF => 'ج';

  @override
  String get agendaDayS => 'س';

  @override
  String get moonTitle => 'القمر والتقويم الهجري';

  @override
  String moonIlluminated(int pct) {
    return '$pct% مضيء';
  }

  @override
  String get moonFullTonight => 'بدر الليلة!';

  @override
  String get moonNextTomorrow => 'البدر القادم غداً';

  @override
  String moonNextDays(int days) {
    return 'البدر القادم في $days أيام';
  }

  @override
  String moonAge(String age) {
    return 'عمر القمر: $age يوم';
  }

  @override
  String get moonPhaseNewMoon => 'محاق';

  @override
  String get moonPhaseWaxingCrescent => 'هلال متزايد';

  @override
  String get moonPhaseFirstQuarter => 'تربيع أول';

  @override
  String get moonPhaseWaxingGibbous => 'أحدب متزايد';

  @override
  String get moonPhaseFullMoon => 'بدر';

  @override
  String get moonPhaseWaningGibbous => 'أحدب متناقص';

  @override
  String get moonPhaseLastQuarter => 'تربيع أخير';

  @override
  String get moonPhaseWaningCrescent => 'هلال متناقص';

  @override
  String get moonHilalVisibility => 'رؤية الهلال القادم';

  @override
  String get moonRegionMiddleEast => 'الشرق الأوسط';

  @override
  String get moonRegionWestAfrica => 'غرب أفريقيا';

  @override
  String get moonRegionSouthAsia => 'جنوب آسيا';

  @override
  String get moonRegionEurope => 'أوروبا';

  @override
  String get moonRegionAmericas => 'الأمريكتان';

  @override
  String get moonVisible => 'مرئي';

  @override
  String get moonNotVisible => 'غير مرئي';

  @override
  String get moonPossible => 'محتمل';

  @override
  String get moonUpcomingDates => 'مواعيد إسلامية قادمة';

  @override
  String get hijriTodayLabel => 'اليوم في التقويم الهجري';

  @override
  String ramadanBeginsLabel(int year) {
    return 'بداية رمضان $year هـ';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'بعد $days يوم';
  }

  @override
  String get moonLunarCycle => 'الدورة القمرية';

  @override
  String moonDayOfCycle(int day) {
    return 'اليوم $day من ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'توقعات رؤية الهلال';

  @override
  String get moonHilalVisibilityMap => 'خريطة رؤية الهلال';

  @override
  String moonDayN(int day) {
    return 'اليوم $day';
  }

  @override
  String get moonGlobalSighting => 'الرؤية العالمية';

  @override
  String get moonZoneNakedEye => 'بالعين المجردة';

  @override
  String get moonZoneBinoculars => 'بالمنظار';

  @override
  String get moonZoneVeryDifficult => 'صعب جداً';

  @override
  String get moonZoneNotVisible => 'غير مرئي';

  @override
  String moonMonthPrediction29(String month, int year) {
    return 'من المتوقع أن يكون $month $year هـ 29 يوماً. يُتوقع رؤية الهلال في التاسع والعشرين إن شاء الله.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return 'من المتوقع أن يكون $month $year هـ 30 يوماً. رؤية الهلال غير مرجحة في التاسع والعشرين.';
  }

  @override
  String get moonUmmAlQura => 'أم القرى';

  @override
  String get moonSaudiArabia => 'المملكة العربية السعودية';

  @override
  String get moonFCNACalc => 'FCNA / حسابي';

  @override
  String get moonNorthAmerica => 'أمريكا الشمالية';

  @override
  String moonNDays(int days) {
    return '$days يوم';
  }

  @override
  String moonStarts(String month) {
    return 'بداية $month:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'عمر القمر عند الغروب: $hours ساعة';
  }

  @override
  String get moon7DayLunarCalendar => 'التقويم القمري لـ 7 أيام';

  @override
  String get moonUpcomingIslamicEvents => 'المناسبات الإسلامية القادمة';

  @override
  String get moonTodayLabel => 'اليوم';

  @override
  String get moonTomorrowLabel => 'غداً';

  @override
  String get calDateCol => 'التاريخ';

  @override
  String get calHijriCol => 'هجري';

  @override
  String get calFajrCol => 'الفجر';

  @override
  String get calSunriseCol => 'الشروق';

  @override
  String get calDhuhrCol => 'الظهر';

  @override
  String get calAsrCol => 'العصر';

  @override
  String get calMaghribCol => 'المغرب';

  @override
  String get calIshaCol => 'العشاء';

  @override
  String get calNoCityText => 'حدد مدينتك أولاً\nلعرض تقويم الصلاة.';

  @override
  String get calShareTooltip => 'مشاركة التقويم';

  @override
  String get calPrevMonthTooltip => 'الشهر السابق';

  @override
  String get calNextMonthTooltip => 'الشهر التالي';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'أوقات الصلاة — $month';
  }

  @override
  String get qiblaTitle => 'القبلة';

  @override
  String get qiblaSwitchToCompass => 'التبديل إلى البوصلة';

  @override
  String get qiblaSwitchToAR => 'التبديل إلى كاميرا الواقع المعزز';

  @override
  String get qiblaNoCityText => 'حدد مدينتك أولاً\nلحساب اتجاه القبلة.';

  @override
  String get qiblaCompassUnavailable =>
      'مستشعر البوصلة غير متوفر على هذا الجهاز.';

  @override
  String get qiblaCalibrate => 'المعايرة: حرّك هاتفك بشكل رقم 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° من الشمال';
  }

  @override
  String qiblaFrom(String city) {
    return 'من $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist كم من الكعبة المشرفة';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '$dist ألف كم من الكعبة المشرفة';
  }

  @override
  String get qiblaFacingQibla => 'في اتجاه القبلة ✓';

  @override
  String get tasbeehTitle => 'التسبيح';

  @override
  String get tasbeehResetTooltip => 'إعادة تعيين';

  @override
  String get tasbeehTapToSwitch => 'اضغط على العنوان للتبديل';

  @override
  String get tasbeehTapToCount => 'اضغط في أي مكان للعد';

  @override
  String get tasbeehResetDialogTitle => 'إعادة تعيين العداد؟';

  @override
  String get tasbeehResetDialogContent =>
      'سيؤدي هذا إلى إعادة تعيين العداد إلى الصفر.';

  @override
  String get tasbeehCancel => 'إلغاء';

  @override
  String get tasbeehReset => 'إعادة تعيين';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'اليوم: $count ذكر';
  }

  @override
  String get tasbeehLast7Days => 'آخر 7 أيام';

  @override
  String get tasbeehNoHistory => 'لا يوجد سجل بعد — ابدأ العد!';

  @override
  String tasbeehComplete(int count) {
    return 'اكتمل التسبيح! $count ذكر';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'المنزل الذكي';

  @override
  String get smartHomeSubtitle => 'اربط أجهزتك بأوقات الصلاة';

  @override
  String get smartHomeGoogleHome => 'جوجل هوم';

  @override
  String get smartHomeGoogleHomeDesc =>
      'اسأل جوجل عن أوقات الصلاة واتجاه القبلة';

  @override
  String get smartHomeAlexa => 'أمازون أليكسا';

  @override
  String get smartHomeAlexaDesc =>
      'اسأل أليكسا عن أوقات الصلاة والصلاة التالية والمزيد';

  @override
  String get smartHomeSiri => 'اختصارات سيري';

  @override
  String get smartHomeSiriDesc => 'أنشئ اختصارات مخصصة لأوقات الصلاة';

  @override
  String get smartHomeHomeAssistant => 'هوم أسيستانت';

  @override
  String get smartHomeHomeAssistantDesc =>
      'أتمتة الأضواء والشاشات والتذكيرات عند أوقات الصلاة';

  @override
  String get smartHomeLinkAccount => 'ربط الحساب';

  @override
  String get smartHomeLinked => 'مربوط';

  @override
  String get smartHomeUnlink => 'إلغاء الربط';

  @override
  String get smartHomeSetupInstructions => 'تعليمات الإعداد';

  @override
  String get smartHomeRequiresUmmatPlus => 'يتطلب أمة+';

  @override
  String get smartHomeTroubleshooting => 'استكشاف الأخطاء';

  @override
  String get smartHomeTestConnection => 'اختبار الاتصال';

  @override
  String get smartHomeConnectionSuccess => 'تم الاتصال بنجاح';

  @override
  String get smartHomeConnectionFailed => 'فشل الاتصال. تحقق من ربط حسابك.';

  @override
  String get subscriptionTitle => 'أمة+';

  @override
  String get subscriptionSubtitle => 'ميزات أوقات الصلاة المتقدمة';

  @override
  String get subscriptionUpgrade => 'ترقية إلى أمة+';

  @override
  String get subscriptionRestore => 'استعادة الشراء';

  @override
  String get subscriptionManage => 'إدارة الاشتراك';

  @override
  String get subscriptionCancel => 'إلغاء الاشتراك';

  @override
  String get subscriptionActive => 'نشط';

  @override
  String get subscriptionExpired => 'منتهي';

  @override
  String get subscriptionFree => 'مجاني';

  @override
  String get subscriptionFreeDesc => 'أوقات الصلاة الأساسية، القبلة، التقويم';

  @override
  String get subscriptionPlusDesc =>
      'المنزل الذكي، شاشة التلفاز، الأدوات، والمزيد';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count استعلامات مجانية متبقية';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/سنة';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/شهر';
  }

  @override
  String get subscriptionFeatureSmartHome => 'تكامل المنزل الذكي';

  @override
  String get subscriptionFeatureTV => 'وضع عرض التلفاز';

  @override
  String get subscriptionFeatureWidgets => 'أدوات الشاشة الرئيسية';

  @override
  String get subscriptionFeatureWatch => 'واجهة الساعة';

  @override
  String get subscriptionFeatureSync => 'المزامنة عبر الأجهزة';

  @override
  String get subscriptionFeatureAdFree => 'تجربة بدون إعلانات';

  @override
  String get watchTitle => 'الساعة';

  @override
  String get watchNextPrayer => 'الصلاة التالية';

  @override
  String get watchAllPrayers => 'جميع الصلوات';

  @override
  String get watchComplication => 'واجهة الساعة';

  @override
  String get nextPrayer => 'الصلاة التالية';

  @override
  String get allPrayers => 'جميع الصلوات';

  @override
  String get today => 'اليوم';

  @override
  String get tomorrow => 'غداً';

  @override
  String get thisWeek => 'هذا الأسبوع';

  @override
  String get thisMonth => 'هذا الشهر';

  @override
  String get loginCreateAccount => 'إنشاء حساب';

  @override
  String get loginSignIn => 'تسجيل الدخول';

  @override
  String get loginWelcomeBack => 'مرحباً بعودتك';

  @override
  String get loginJoinPrayCalc => 'انضم إلى PrayCalc';

  @override
  String get loginSyncSubtitle => 'زامن بيانات صلاتك عبر الأجهزة';

  @override
  String get loginContinueGoogle => 'المتابعة مع Google';

  @override
  String get loginOr => 'أو';

  @override
  String get loginSigningIn => 'جاري تسجيل الدخول…';

  @override
  String get loginNameLabel => 'الاسم المعروض (اختياري)';

  @override
  String get loginEmailLabel => 'البريد الإلكتروني';

  @override
  String get loginPasswordLabel => 'كلمة المرور';

  @override
  String get loginEmailRequired => 'البريد الإلكتروني مطلوب';

  @override
  String get loginEmailInvalid => 'أدخل بريداً إلكترونياً صحيحاً';

  @override
  String get loginPasswordRequired => 'كلمة المرور مطلوبة';

  @override
  String get loginPasswordMinLength =>
      'يجب أن تكون كلمة المرور 8 أحرف على الأقل';

  @override
  String get loginForgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get loginEnterEmailFirst => 'أدخل بريدك الإلكتروني أولاً';

  @override
  String get loginResetSent => 'تم إرسال بريد إعادة تعيين كلمة المرور';

  @override
  String get loginResetFailed => 'تعذّر إرسال بريد إعادة التعيين';

  @override
  String get loginNewToPrayCalc => 'جديد على PrayCalc؟';

  @override
  String get loginAlreadyHaveAccount => 'لديك حساب بالفعل؟';

  @override
  String get accountTitle => 'الحساب';

  @override
  String get accountNotSignedIn => 'لم يتم تسجيل الدخول';

  @override
  String get accountSyncSection => 'المزامنة';

  @override
  String get accountSyncStatus => 'حالة المزامنة';

  @override
  String get accountSyncNow => 'مزامنة الآن';

  @override
  String get accountSyncHistory => 'سجل المزامنة';

  @override
  String get accountNoConflicts => 'لا توجد تعارضات';

  @override
  String accountConflictsResolved(int count) {
    return '$count تم حلها';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'تمت المزامنة $time';
  }

  @override
  String get accountOfflineStatus => 'غير متصل. التغييرات محفوظة محلياً.';

  @override
  String get accountSyncErrorStatus => 'خطأ في المزامنة. ستتم إعادة المحاولة.';

  @override
  String get accountDataSection => 'البيانات';

  @override
  String get accountExportData => 'تصدير البيانات';

  @override
  String get accountExportSubtitle => 'تنزيل إعداداتك وسجلات الصلاة';

  @override
  String get accountExportFailed => 'تعذّر تصدير البيانات';

  @override
  String get accountSignOutTitle => 'تسجيل الخروج';

  @override
  String get accountSignOutBody =>
      'ستُحفظ بياناتك المحلية. سجّل الدخول مجدداً لاستئناف المزامنة.';

  @override
  String get accountDeleteAccount => 'حذف الحساب';

  @override
  String get accountDeleteSubtitle => 'حذف حسابك وبياناتك نهائياً';

  @override
  String get accountDeleteBody =>
      'سيتم حذف حسابك وجميع البيانات المزامنة نهائياً. لن تُحذف بياناتك المحلية على هذا الجهاز.\n\nلا يمكن التراجع عن هذا الإجراء.';

  @override
  String get accountDeleted => 'تم حذف الحساب';

  @override
  String get accountDeleteFailed => 'تعذّر حذف الحساب';

  @override
  String get accountTimeJustNow => 'الآن';

  @override
  String accountTimeMinAgo(int min) {
    return 'منذ $min دقيقة';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return 'منذ $hour ساعة';
  }

  @override
  String accountTimeDayAgo(int day) {
    return 'منذ $day يوم';
  }

  @override
  String get statsTitle => 'إحصائيات الصلاة';

  @override
  String get statsShareTooltip => 'مشاركة الإحصائيات';

  @override
  String get statsTodayPrayers => 'صلوات اليوم';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'سلسلة';

  @override
  String get statsDays => 'أيام';

  @override
  String get statsThisWeek => 'هذا الأسبوع';

  @override
  String get statsCompletion => 'إتمام';

  @override
  String get statsThisMonth => 'هذا الشهر';

  @override
  String get statsMostMissed => 'الأكثر فوتاً';

  @override
  String get statsThisWeekLabel => 'هذا الأسبوع';

  @override
  String get statsWeeklyChart => 'الإتمام الأسبوعي حسب الصلاة';

  @override
  String get statsMonthlyChart => 'الإتمام الشهري حسب الصلاة';

  @override
  String statsTotalLogged(int count) {
    return '$count صلاة مسجلة';
  }

  @override
  String get statsKeepItUp => 'واصل!';

  @override
  String get statsShareTitle => 'إحصائيات الصلاة — PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'السلسلة: $days أيام';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'أسبوعي: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'شهري: $pct%';
  }

  @override
  String get statsShareBreakdown => 'التفصيل الأسبوعي:';

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
  String get aboutTitle => 'حول PrayCalc';

  @override
  String get aboutWebsite => 'الموقع';

  @override
  String get aboutContact => 'اتصل بنا';

  @override
  String get aboutLicenses => 'تراخيص المصادر المفتوحة';

  @override
  String get aboutCouldNotOpen => 'تعذّر فتح الرابط.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. جميع الحقوق محفوظة.\n\nيتم حساب أوقات الصلاة باستخدام محرك pray_calc_dart. تعتمد الدقة على موقع GPS وطريقة الحساب المحددة.';
  }

  @override
  String get commonCancel => 'إلغاء';

  @override
  String get commonSave => 'حفظ';

  @override
  String get commonDelete => 'حذف';

  @override
  String get commonEdit => 'تعديل';

  @override
  String get commonRetry => 'إعادة المحاولة';

  @override
  String get commonClose => 'إغلاق';

  @override
  String get commonDone => 'تم';

  @override
  String get commonBack => 'رجوع';

  @override
  String get commonNext => 'التالي';

  @override
  String get commonSkip => 'تخطي';

  @override
  String get commonContinue => 'متابعة';

  @override
  String get commonOk => 'موافق';

  @override
  String get commonYes => 'نعم';

  @override
  String get commonNo => 'لا';

  @override
  String get commonShare => 'مشاركة';

  @override
  String get commonCopy => 'نسخ';

  @override
  String get commonCopied => 'تم النسخ';

  @override
  String get commonLoading => 'جاري التحميل...';

  @override
  String get commonError => 'حدث خطأ ما';

  @override
  String get commonErrorRetry => 'حدث خطأ ما. اضغط لإعادة المحاولة.';

  @override
  String get commonNoInternet => 'لا يوجد اتصال بالإنترنت';

  @override
  String get commonOfflineMode => 'وضع عدم الاتصال';

  @override
  String get commonSignIn => 'تسجيل الدخول';

  @override
  String get commonSignOut => 'تسجيل الخروج';

  @override
  String get commonSignUp => 'إنشاء حساب';

  @override
  String get commonProfile => 'الملف الشخصي';

  @override
  String get commonAccount => 'الحساب';

  @override
  String get commonAbout => 'حول';

  @override
  String commonVersion(String version) {
    return 'الإصدار $version';
  }

  @override
  String get commonPrivacyPolicy => 'سياسة الخصوصية';

  @override
  String get commonTermsOfService => 'شروط الخدمة';

  @override
  String get commonRateApp => 'قيّم التطبيق';

  @override
  String get commonFeedback => 'إرسال ملاحظات';

  @override
  String get commonHelp => 'مساعدة';

  @override
  String get commonLanguage => 'اللغة';

  @override
  String get commonOpenSettings => 'فتح الإعدادات';

  @override
  String get travelNotificationTitle => 'أنت الآن مسافر';

  @override
  String get travelNotificationBody =>
      'قد تُقصر أوقات الصلاة. اضغط لمعرفة أحكام صلاة المسافر.';

  @override
  String get travelRulingsTitle => 'السفر والصلاة';

  @override
  String get travelRulingsIntro =>
      'أحكام الصلاة في السفر مع مراجع علمية من القرآن الكريم والأحاديث الصحيحة.';

  @override
  String get travelWhenTitle => 'متى يُعتبر الشخص مسافراً؟';

  @override
  String get travelQasrTitle => 'قصر الصلاة';

  @override
  String get travelJamTitle => 'الجمع بين الصلوات';

  @override
  String get travelDurationTitle => 'مدة السفر';

  @override
  String get travelReferencesTitle => 'المراجع العلمية';

  @override
  String get travelLearnMore => 'اعرف المزيد';

  @override
  String get travelHanafiDefaultTitle => 'لماذا يستخدم PrayCalc الإعداد الحنفي';

  @override
  String get travelDeeperScholarly => 'نقاش علمي أعمق';

  @override
  String get onboardingTitle1 => 'أوقات الصلاة، أينما كنت';

  @override
  String get onboardingBody1 =>
      'أوقات صلاة دقيقة بـ GPS لكل مدينة على وجه الأرض. من الفجر إلى العشاء، ومن الشروق إلى القيام. بمحرك حسابنا الخاص، مصمم للدقة.';

  @override
  String get onboardingTitle2 => 'موقعك، أوقاتك';

  @override
  String get onboardingBody2 =>
      'ابحث عن أي مدينة أو دع GPS يحدد موقعك. PrayCalc يجد الأوقات لـ 5 ملايين مدينة حول العالم.';

  @override
  String get onboardingTitle3 => 'لا تفوّت صلاة';

  @override
  String get onboardingBody3 =>
      'الأذان وقت الصلاة، والتذكيرات قبلها. جداول مخصصة للسحور والدروس والمزيد.';

  @override
  String get onboardingTitle4 => 'كل ما تحتاج';

  @override
  String get onboardingBody4 =>
      'بوصلة القبلة، تقويم الصلاة، أطوار القمر الهجري، عداد التسبيح. الكل في مكان واحد.';

  @override
  String get onboardingSkip => 'تخطي';

  @override
  String get onboardingGetStarted => 'ابدأ';

  @override
  String get onboardingSignInTitle => 'سجّل الدخول إلى PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'احفظ سجل صلاتك وزامن\nعبر جميع أجهزتك.';

  @override
  String get onboardingContinueGoogle => 'المتابعة مع Google';

  @override
  String get onboardingContinueWithoutAccount => 'المتابعة بدون حساب';

  @override
  String get onboardingSigningIn => 'جاري تسجيل الدخول…';

  @override
  String get onboardingSelectLanguage => 'اختر اللغة';

  @override
  String get duaDhikrTitle => 'الدعاء والذكر';

  @override
  String get duaDhikrTabDua => 'الدعاء';

  @override
  String get duaDhikrTabDhikr => 'الذكر';

  @override
  String get duaDhikrTabTasbeeh => 'التسبيح';

  @override
  String get duaDhikrTabMorning => 'الصباح';

  @override
  String get duaDhikrTabEvening => 'المساء';

  @override
  String get duaDhikrMorningAdhkar => 'أذكار الصباح';

  @override
  String get duaDhikrEveningAdhkar => 'أذكار المساء';

  @override
  String get calGregToggle => 'ميلادي';

  @override
  String get calHijriToggle => 'هجري';

  @override
  String get calYearlyTooltip => 'التقويم السنوي';

  @override
  String get calExportIcsTooltip => 'تصدير .ics';

  @override
  String get calMagCol => 'مغر';

  @override
  String get qiblaShowOnMap => 'عرض على الخريطة';

  @override
  String get qiblaWaitingCompass => 'في انتظار البوصلة...';

  @override
  String get qiblaNoCompassSensor =>
      'لا يوجد مستشعر بوصلة. عرض اتجاه القبلة بشكل ثابت.';

  @override
  String get qiblaAccuracyExcellent => 'دقة ممتازة';

  @override
  String get qiblaAccuracyGood => 'دقة جيدة';

  @override
  String get qiblaAccuracyFair => 'دقة مقبولة. عايِر بتحريك الهاتف بشكل رقم 8.';

  @override
  String get qiblaAccuracyLow => 'دقة منخفضة. عايِر بتحريك الهاتف بشكل رقم 8.';

  @override
  String get qiblaToTheKaaba => 'إلى الكعبة المشرفة';

  @override
  String get qiblaYourLocation => 'موقعك';

  @override
  String get qiblaGpsAccurate => 'دقة GPS';

  @override
  String get qiblaCityCenter => 'وسط المدينة';

  @override
  String get moonIlluminatedLabel => 'مضيء';

  @override
  String get moonAgeLabel => 'العمر';

  @override
  String get moonFirstQtr => 'التربيع الأول';

  @override
  String get moonLastQtr => 'التربيع الأخير';

  @override
  String get moonTonight => 'الليلة';

  @override
  String get moonTomorrow => 'غداً';

  @override
  String moonDaysAway(int days) {
    return '$days يوم';
  }

  @override
  String get moonBeta => 'تجريبي';

  @override
  String get setHomeTitle => 'تحديد موقع المنزل';

  @override
  String get setHomeSearchHint => 'ابحث عن مدينة أو رمز بريدي…';

  @override
  String get setHomeClear => 'مسح';

  @override
  String get setHomeUseCurrentLocation => 'استخدام الموقع الحالي';

  @override
  String get setHomeDetectAndSet => 'تحديد موقعك وتعيينه كمنزل';

  @override
  String get setHomeAlreadySet => 'المنزل محدد بالفعل';

  @override
  String setHomeSetAs(String city) {
    return 'تم تعيين $city كمنزل';
  }

  @override
  String get setHomeCurrentLocationSet => 'تم تعيين الموقع الحالي كمنزل';

  @override
  String get setHomePermissionDenied => 'رُفض إذن الموقع. ابحث عن مدينة أدناه.';

  @override
  String get setHomeGpsUnavailable => 'GPS غير متوفر. ابحث يدوياً.';

  @override
  String get setHomeNoCitiesFound => 'لم يتم العثور على مدن.';

  @override
  String get setHomeSearchPrompt => 'ابحث عن مدينتك';

  @override
  String get setHomeSearchBody =>
      'اكتب أعلاه للبحث، أو استخدم موقعك الحالي. وضع السفر سيكتشف عندما تكون بعيداً عن المنزل.';

  @override
  String get subscriptionYouHavePlus => 'لديك أمة+';

  @override
  String get subscriptionUpgradeTo => 'ترقية إلى أمة+';

  @override
  String get subscriptionThankYou => 'شكراً لدعمك PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'افتح الميزات المتقدمة على جميع أجهزتك.';

  @override
  String get subscriptionManageSub => 'إدارة الاشتراك';

  @override
  String get subscriptionWelcome => 'مرحباً بك في أمة+!';

  @override
  String get subscriptionSubscribe => 'اشترك';

  @override
  String get subscriptionFreeFeatures => 'الميزات المجانية';

  @override
  String get subscriptionPlusFeatures => 'ميزات أمة+';

  @override
  String get subscriptionFeaturePrayerTimes => 'أوقات الصلاة';

  @override
  String get subscriptionFeatureQibla => 'بوصلة القبلة';

  @override
  String get subscriptionFeatureCalendar => 'التقويم الشهري';

  @override
  String get subscriptionFeatureTasbeeh => 'عداد التسبيح';

  @override
  String get subscriptionFeatureMoon => 'القمر والهجري';

  @override
  String get smartHomeAlertType => 'نوع التنبيه';

  @override
  String get smartHomeAlertModal => 'نافذة ملء الشاشة';

  @override
  String get smartHomeAlertCorner => 'إشعار جانبي';

  @override
  String get smartHomeAlertNone => 'بدون (صامت)';

  @override
  String get smartHomePauseMedia => 'إيقاف الوسائط أثناء الأذان';

  @override
  String get smartHomeQuietHours => 'ساعات الهدوء';

  @override
  String get smartHomeQuietFrom => 'من';

  @override
  String get smartHomeQuietTo => 'إلى';

  @override
  String get smartHomePrayerAudio => 'صوت كل صلاة';

  @override
  String get smartHomeAudioAdhan => 'أذان';

  @override
  String get smartHomeAudioBeep => 'صافرة';

  @override
  String get smartHomeAudioSilent => 'صامت';

  @override
  String get aboutPrivacy => 'سياسة الخصوصية';

  @override
  String aboutVersion(String version) {
    return 'الإصدار $version';
  }

  @override
  String get notifDefaultAdhan => 'الأذان الافتراضي';

  @override
  String get notifFajrAdhan => 'أذان الفجر';

  @override
  String get notifFajrAdhanSubtitle => 'يُشغّل عند وقت صلاة الفجر';

  @override
  String get notifRegularAdhan => 'الأذان العادي';

  @override
  String get notifRegularAdhanSubtitle =>
      'يُشغّل عند الظهر والعصر والمغرب والعشاء';

  @override
  String get notifPerPrayerSettings => 'إعدادات كل صلاة';

  @override
  String get notifPreview => 'معاينة';

  @override
  String get tvSettingsTitle => 'إعدادات التلفاز';

  @override
  String get tvDisplayMode => 'وضع العرض';

  @override
  String get tvMasjidMode => 'وضع المسجد';

  @override
  String get tvMasjidModeSubtitle => 'عرض لافتات كبير مع أوقات الإقامة';

  @override
  String get tvMasjidName => 'اسم المسجد';

  @override
  String get tvMasjidNameTapToSet => 'اضغط للتعيين';

  @override
  String get tvClock => 'الساعة';

  @override
  String get tv24hFormat => 'تنسيق 24 ساعة';

  @override
  String get tvIqamahOffsets => 'فروق الإقامة (دقائق بعد الأذان)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset دقيقة بعد الأذان';
  }

  @override
  String get tvQrCode => 'رمز QR';

  @override
  String get tvShowQrCode => 'عرض رمز QR';

  @override
  String get tvShowQrCodeSubtitle => 'عرض رمز QR على شاشة المسجد';

  @override
  String get tvQrCodeUrl => 'رابط رمز QR';

  @override
  String get tvAmbientModeSection => 'الوضع المحيطي';

  @override
  String get tvIdleTimeout => 'مهلة الخمول';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes دقيقة قبل تفعيل الوضع المحيطي';
  }

  @override
  String get tvPhotoInterval => 'فاصل الصور';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds ثانية بين الصور';
  }

  @override
  String get tvBackground => 'الخلفية';

  @override
  String get tvPhotoCategory => 'فئة الصور';

  @override
  String get tvLocation => 'الموقع';

  @override
  String get tvChangeCity => 'تغيير المدينة';

  @override
  String get tvChangeCitySubtitle => 'البحث عن مدينة مختلفة';

  @override
  String get tvScreensaverBg => 'خلفية شاشة التوقف';

  @override
  String get tvScreensaverPhotos => 'صور';

  @override
  String get tvScreensaverPattern => 'نمط هندسي';

  @override
  String get tvScreensaverBoth => 'صور + نمط';

  @override
  String get tvCategoryAll => 'جميع الفئات';

  @override
  String get tvCategoryMasjids => 'مساجد';

  @override
  String get tvCategoryInteriors => 'تصاميم داخلية';

  @override
  String get tvCategoryGeometric => 'هندسية';

  @override
  String get tvCategoryCalligraphy => 'خط عربي';

  @override
  String get tvCategoryLandscapes => 'مناظر طبيعية';

  @override
  String get tvCategoryRamadan => 'رمضان';

  @override
  String get tvPhotoCategoryTitle => 'فئة الصور';

  @override
  String tvEnterHint(String title) {
    return 'أدخل $title';
  }

  @override
  String get tvSystemDefault => 'الافتراضي للنظام';

  @override
  String get smartHomeIntegrations => 'التكاملات';

  @override
  String get smartHomeLinkedSpeakers => 'السماعات والشاشات المربوطة';

  @override
  String get smartHomeAlertDisplay => 'عرض التنبيه';

  @override
  String get smartHomeAtAdhanShow => 'عند الأذان أظهر';

  @override
  String get smartHomePauseMediaTitle => 'إيقاف الوسائط عند الأذان';

  @override
  String get smartHomePauseMediaSubtitle => 'يُستأنف بعد انتهاء الأذان';

  @override
  String get smartHomePrayerAudioSection => 'صوت الصلاة';

  @override
  String get smartHomeQuietHoursSection => 'ساعات الهدوء';

  @override
  String get smartHomeEnableQuietHours => 'تفعيل ساعات الهدوء';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'يتم إسكات جميع تنبيهات المنزل الذكي';

  @override
  String get smartHomeNoDevices => 'لم يتم ربط أي أجهزة بعد';

  @override
  String get smartHomeNoDevicesDesc =>
      'اربط Google Home أو Alexa أعلاه، ثم ستظهر سماعاتك وشاشاتك هنا.';

  @override
  String get smartHomeRequiresPlus => 'المنزل الذكي يتطلب أمة+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'تحكم في إعلانات الصلاة على Google Home وAlexa وSiri وHome Assistant. حدد الأجهزة التي تشغل الأذان ومتى توقف الوسائط وساعات الهدوء.';

  @override
  String get smartHomeBroadcastGoogle => 'بث الأذان على سماعات وشاشات Nest.';

  @override
  String get smartHomeEnableAlexa => 'فعّل مهارة PrayCalc على Alexa.';

  @override
  String get smartHomeSiriAsk => 'اسأل Siri عن أوقات الصلاة أو أنشئ أتمتات.';

  @override
  String get smartHomeHassAdd => 'أضف عبر HACS لدعم الأتمتة الكامل.';

  @override
  String get smartHomeSetupGuide => 'دليل الإعداد';

  @override
  String get smartHomeSiriSetupTitle => 'إعداد اختصارات Siri';

  @override
  String get smartHomeSiriStep1 => 'افتح تطبيق الاختصارات على iPhone أو iPad.';

  @override
  String get smartHomeSiriStep2 => 'اضغط \"+\" لإنشاء اختصار جديد.';

  @override
  String get smartHomeSiriStep3 => 'ابحث عن \"PrayCalc\" في قائمة الإجراءات.';

  @override
  String get smartHomeSiriStep4 =>
      'أضف \"وقت الصلاة التالية\" أو \"أوقات الصلاة اليوم\".';

  @override
  String get smartHomeSiriStep5 =>
      'اختيارياً أضفه لأتمتة (مثلاً يومياً عند الفجر).';

  @override
  String get smartHomeSiriStep6 =>
      'قل \"يا Siri، وقت الصلاة التالية\" للاختبار.';

  @override
  String get smartHomeSiriFootnote => 'يتطلب iOS 16 أو أحدث.';

  @override
  String get smartHomeHassSetupTitle => 'إعداد Home Assistant';

  @override
  String get smartHomeHassStep1 => 'ثبّت HACS (متجر مجتمع Home Assistant).';

  @override
  String get smartHomeHassStep2 => 'في HACS، ابحث عن \"PrayCalc\" وثبّته.';

  @override
  String get smartHomeHassStep3 =>
      'اذهب إلى الإعدادات > الأجهزة والخدمات > إضافة تكامل.';

  @override
  String get smartHomeHassStep4 => 'ابحث عن \"PrayCalc\" واختره.';

  @override
  String get smartHomeHassStep5 =>
      'أدخل مفتاح API الخاص بـ PrayCalc (يُنشأ في حسابك).';

  @override
  String get smartHomeHassStep6 => 'حدد موقعك وطريقة الحساب.';

  @override
  String get smartHomeHassFootnote => 'يتطلب Home Assistant 2024.1+ مع HACS.';

  @override
  String get smartHomeApiKey => 'مفتاح API';

  @override
  String get smartHomeGenerateApiKey => 'إنشاء مفتاح API';

  @override
  String get smartHomeApiKeyNotReady =>
      'سيتوفر إنشاء مفتاح API بعد نشر خدمة PrayCalc الذكية.';

  @override
  String get smartHomeApiKeyDesc =>
      'ستحتاج مفتاح API لربط Home Assistant بحسابك في PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'مربوط';

  @override
  String get smartHomeNotLinkedStatus => 'غير مربوط';

  @override
  String get smartHomeCouldNotOpen => 'تعذّر فتح الرابط.';

  @override
  String get smartHomeDevices => 'الأجهزة';

  @override
  String get smartHomeAddDevice => 'إضافة جهاز';

  @override
  String get smartHomeDeleteDevice => 'حذف';

  @override
  String get smartHomeDeleteDeviceConfirm => 'إزالة هذا الجهاز؟';

  @override
  String get smartHomeDeviceOnline => 'متصل';

  @override
  String get smartHomeDeviceOffline => 'غير متصل';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'آخر ظهور: $time';
  }

  @override
  String get smartHomeDeviceName => 'اسم الجهاز';

  @override
  String get smartHomeDeviceType => 'نوع الجهاز';

  @override
  String get smartHomeDeviceTypeTv => 'تلفاز';

  @override
  String get smartHomeDeviceTypeSpeaker => 'سماعة';

  @override
  String get smartHomeDeviceTypeWatch => 'ساعة';

  @override
  String get smartHomeDeviceTypeDesktop => 'حاسوب';

  @override
  String get smartHomeDeviceTypeOther => 'أخرى';

  @override
  String get smartHomeDeviceAdhan => 'إشعارات الأذان';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'استقبال تنبيهات الأذان على هذا الجهاز';

  @override
  String get smartHomeDeviceVolume => 'مستوى الصوت';

  @override
  String get smartHomeDeviceAudioType => 'نوع الصوت';

  @override
  String get smartHomeDeviceEnabledPrayers => 'الصلوات المفعّلة';

  @override
  String get smartHomeDeviceSettings => 'إعدادات الجهاز';

  @override
  String get smartHomeTesting => 'جاري الاختبار...';

  @override
  String get smartHomeTestSuccess => 'تم التحقق من الاتصال';

  @override
  String get smartHomeTestFailed => 'فشل اختبار الاتصال';

  @override
  String get smartHomePairTv => 'ربط التلفاز';

  @override
  String get smartHomePairingTv => 'جاري تسجيل التلفاز...';

  @override
  String get smartHomePairTvSuccess => 'تم ربط التلفاز بنجاح';

  @override
  String get smartHomePairTvFailed => 'فشل ربط التلفاز';

  @override
  String get smartHomeLoadingDevices => 'جاري تحميل الأجهزة...';

  @override
  String get smartHomeLoadingIntegrations => 'جاري تحميل التكاملات...';

  @override
  String get smartHomeServiceUnavailable =>
      'خدمة المنزل الذكي غير متوفرة حالياً. يرجى المحاولة لاحقاً.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total مكتمل';
  }

  @override
  String get adhkarReset => 'إعادة تعيين';

  @override
  String get syncHistoryTitle => 'سجل المزامنة';

  @override
  String get syncClearHistory => 'مسح السجل';

  @override
  String get syncNoConflicts => 'لا توجد تعارضات مزامنة. جميع الأجهزة متزامنة.';

  @override
  String get syncDomainSettings => 'الإعدادات';

  @override
  String get syncDomainCities => 'المدن المحفوظة';

  @override
  String get syncDomainPrayerLogs => 'سجلات الصلاة';

  @override
  String get syncTimeJustNow => 'الآن';

  @override
  String syncTimeMinAgo(int min) {
    return 'منذ $min دقيقة';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return 'منذ $hour ساعة';
  }

  @override
  String syncTimeDayAgo(int day) {
    return 'منذ $day يوم';
  }

  @override
  String get pinCity => 'تثبيت';

  @override
  String get pinMaxReached => 'الحد الأقصى 5 مدن مثبتة. رقِّ إلى أمة+ للمزيد.';

  @override
  String pinCityUnpinned(String city) {
    return 'تم إلغاء تثبيت $city';
  }

  @override
  String get pinUndo => 'تراجع';

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
  String get tvJumuahGreeting => 'جمعة مباركة';

  @override
  String get tvChildFajrExplanation =>
      'Fajr is the morning prayer. We wake up before sunrise to thank Allah for a new day!';

  @override
  String get tvChildFajrFunFact =>
      'The Prophet ‫ﷺ‬ said: “The best prayer in the sight of Allah is Fajr on Friday.” (Bukhari)';

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
      'The Prophet ‫ﷺ‬ loved to pray Dhuhr early when the sun begins to decline. (Muslim)';

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
