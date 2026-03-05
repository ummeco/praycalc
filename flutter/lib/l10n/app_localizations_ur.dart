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
  String get settingsTitle => 'ترتیبات';

  @override
  String get settingsSectionPrayerCalc => 'نماز کا حساب';

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
  String get tvTitle => 'ٹی وی ڈسپلے';

  @override
  String get tvMasjidMode => 'مسجد موڈ';

  @override
  String get tvAmbientMode => 'ایمبیئنٹ موڈ';

  @override
  String get tvSettingsIqamah => 'اقامت کے فرق';

  @override
  String get tvSettingsAnnouncements => 'اعلانات';

  @override
  String get tvConnectQR => 'جوڑنے کے لیے اسکین کریں';

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
