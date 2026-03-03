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
  String get settingsTitle => 'الإعدادات';

  @override
  String get settingsSectionPrayerCalc => 'حساب أوقات الصلاة';

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
}
