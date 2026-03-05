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
  String get tvTitle => 'شاشة التلفاز';

  @override
  String get tvMasjidMode => 'وضع المسجد';

  @override
  String get tvAmbientMode => 'الوضع المحيطي';

  @override
  String get tvSettingsIqamah => 'فروق الإقامة';

  @override
  String get tvSettingsAnnouncements => 'الإعلانات';

  @override
  String get tvConnectQR => 'امسح للاتصال';

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
}
