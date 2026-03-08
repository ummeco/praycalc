// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Uzbek (`uz`).
class AppLocalizationsUz extends AppLocalizations {
  AppLocalizationsUz([String locale = 'uz']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Bomdod';

  @override
  String get prayerSunrise => 'Quyosh chiqishi';

  @override
  String get prayerDhuhr => 'Peshin';

  @override
  String get prayerAsr => 'Asr';

  @override
  String get prayerMaghrib => 'Shom';

  @override
  String get prayerIsha => 'Xufton';

  @override
  String get prayerQiyam => 'Qiyom';

  @override
  String get prayerSuhoor => 'Saharlik';

  @override
  String get prayerIftar => 'Iftor';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabiul Avval';

  @override
  String get hijriRabiAlThani => 'Rabiul Soni';

  @override
  String get hijriJumadaAlAwwal => 'Jumadal Ulo';

  @override
  String get hijriJumadaAlThani => 'Jumadal Soni';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Sha\'bon';

  @override
  String get hijriRamadan => 'Ramazon';

  @override
  String get hijriShawwal => 'Shavvol';

  @override
  String get hijriDhulQidah => 'Zulqa\'da';

  @override
  String get hijriDhulHijjah => 'Zulhijja';

  @override
  String get monthJan => 'Yan';

  @override
  String get monthFeb => 'Fev';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Apr';

  @override
  String get monthMay => 'May';

  @override
  String get monthJun => 'Iyn';

  @override
  String get monthJul => 'Iyl';

  @override
  String get monthAug => 'Avg';

  @override
  String get monthSep => 'Sen';

  @override
  String get monthOct => 'Okt';

  @override
  String get monthNov => 'Noy';

  @override
  String get monthDec => 'Dek';

  @override
  String get monthJanuary => 'Yanvar';

  @override
  String get monthFebruary => 'Fevral';

  @override
  String get monthMarch => 'Mart';

  @override
  String get monthApril => 'Aprel';

  @override
  String get monthMayFull => 'May';

  @override
  String get monthJune => 'Iyun';

  @override
  String get monthJuly => 'Iyul';

  @override
  String get monthAugust => 'Avgust';

  @override
  String get monthSeptember => 'Sentabr';

  @override
  String get monthOctober => 'Oktabr';

  @override
  String get monthNovember => 'Noyabr';

  @override
  String get monthDecember => 'Dekabr';

  @override
  String get dayMonShort => 'Du';

  @override
  String get dayTueShort => 'Se';

  @override
  String get dayWedShort => 'Ch';

  @override
  String get dayThuShort => 'Pa';

  @override
  String get dayFriShort => 'Ju';

  @override
  String get daySatShort => 'Sh';

  @override
  String get daySunShort => 'Ya';

  @override
  String get dayMonday => 'Dushanba';

  @override
  String get dayTuesday => 'Seshanba';

  @override
  String get dayWednesday => 'Chorshanba';

  @override
  String get dayThursday => 'Payshanba';

  @override
  String get dayFriday => 'Juma';

  @override
  String get daySaturday => 'Shanba';

  @override
  String get daySunday => 'Yakshanba';

  @override
  String get daySuChart => 'Ya';

  @override
  String get dayMoChart => 'Du';

  @override
  String get dayTuChart => 'Se';

  @override
  String get dayWeChart => 'Ch';

  @override
  String get dayThChart => 'Pa';

  @override
  String get dayFrChart => 'Ju';

  @override
  String get daySaChart => 'Sh';

  @override
  String get chooseCityLabel => 'Shahar tanlang';

  @override
  String get setCityFab => 'Shaharni belgilash';

  @override
  String prayerTimesError(Object error) {
    return 'Namoz vaqtlarini hisoblash imkoni bo\'lmadi.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer gacha';
  }

  @override
  String get ramadanMubarak => 'Ramazon Muborak';

  @override
  String ramadanDayProgress(int day) {
    return '$day-kun / 30';
  }

  @override
  String get lastTenNights => 'Oxirgi 10 kecha';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'M';

  @override
  String get homeNoCitySelected => 'Shahar tanlanmagan';

  @override
  String get homeNoCityHint =>
      'Shaharingizni qidirish yoki GPS-ni yoqish uchun yuqoriga bosing.';

  @override
  String get homeCouldNotCalc => 'Namoz vaqtlarini hisoblash imkoni bo\'lmadi.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Oylik\nVaqtlar';

  @override
  String get homeActionDuaDhikr => 'Duo va\nZikr';

  @override
  String get homeActionPrayerStats => 'Namoz\nStatistikasi';

  @override
  String homePolarBanner(int count) {
    return 'Joylashuvingiz uchun bu davrda $count ta namoz vaqtini hisoblash imkoni yo\'q. Sozlamalarda eng yaqin kenglikni taxmin qilishni sinab ko\'ring.';
  }

  @override
  String get settingsTitle => 'Sozlamalar';

  @override
  String get settingsSectionPrayerCalc => 'Namoz Hisoblash';

  @override
  String get settingsCalcMethod => 'Hisoblash usuli';

  @override
  String get settingsCalcMethodAuto => 'Avtomatik (Dinamik)';

  @override
  String get settingsHanafiAsr => 'Hanafiy Asr';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Soya koeffitsienti 2x (kechiktirilgan Asr vaqti)';

  @override
  String get settingsSectionDisplay => 'Ko\'rinish';

  @override
  String get settings24hClock => '24 soatlik format';

  @override
  String get settingsFollowSystemTheme => 'Tizim mavzusiga amal qilish';

  @override
  String get settingsDarkMode => 'Qorong\'i rejim';

  @override
  String get settingsSectionNotifications => 'Bildirishnomalar';

  @override
  String get settingsPrayerNotifications => 'Namoz bildirishnomalari';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Azon, eslatmalar va har bir namoz sozlamalari';

  @override
  String get settingsPrayerAgendas => 'Namoz jadvallari';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Namoz vaqtlariga bog\'langan maxsus eslatmalar';

  @override
  String get settingsAccount => 'Hisob';

  @override
  String get settingsSignInToSync => 'Sinxronlash uchun kiring';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Ma\'lumotlaringizni qurilmalar bo\'ylab saqlang';

  @override
  String get settingsHomeScreen => 'Bosh ekran';

  @override
  String get settingsSkyGradient => 'Osmon gradiyenti foni';

  @override
  String get settingsSkyGradientSubtitle =>
      'Kun vaqtiga mos animatsion osmon ranglari';

  @override
  String get settingsWeatherGradient => 'Ob-havo gradiyenti';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Mahalliy ob-havo asosida osmon ranglarini sozlash';

  @override
  String get settingsCountdownAnimation => 'Sanash animatsiyasi';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Keyingi namoz sanashida nafas olish halqasi';

  @override
  String get settingsPrayerTracking => 'Namoz kuzatuvi';

  @override
  String get settingsTrackMyPrayers => 'Namozlarimni kuzatish';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Har kuni bajargan namozlaringizni qayd qiling';

  @override
  String get settingsPrayerStats => 'Namoz statistikasi';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Ketma-ketlik, haftalik va oylik jadvallar';

  @override
  String get settingsJumuahKahf => 'Juma Al-Kahf eslatmasi';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Juma kunlari Surat Al-Kahfni o\'qish uchun eslatma';

  @override
  String get settingsTravel => 'Sayohat';

  @override
  String get settingsTravelMode => 'Sayohat rejimi';

  @override
  String get settingsTravelModeSubtitle =>
      'Uydan uzoqda bo\'lganingizni avtomatik aniqlash va namozlarni sozlash';

  @override
  String get settingsHomeLocation => 'Uy joylashuvi';

  @override
  String get settingsHomeLocationNotSet =>
      'Belgilanmagan — hozirgi joylashuvdan foydalanish uchun bosing';

  @override
  String get settingsClearHomeLocation => 'Uy joylashuvini tozalash';

  @override
  String get settingsTravelRulings => 'Musofir namozi hukmlari';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, jam\' va musofir yo\'riqnomasi';

  @override
  String get settingsSmartHome => 'Aqlli uy';

  @override
  String get settingsSmartHomeIntegrations => 'Aqlli uy integratsiyasi';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'TV ko\'rinishi';

  @override
  String get settingsTvHome => 'TV asosiy ko\'rinishi';

  @override
  String get settingsTvHomeSubtitle => 'TV uchun to\'liq ekranli namoz soati';

  @override
  String get settingsMasjidDisplay => 'Masjid ko\'rinishi';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Masjid ekranlari uchun azon/iqomat jadvali';

  @override
  String get settingsTvSettings => 'TV sozlamalari';

  @override
  String get settingsTvSettingsSubtitle =>
      'Masjid rejimi, iqomat ofseti, muhit';

  @override
  String get settingsAboutPrayCalc => 'PrayCalc haqida';

  @override
  String get syncSynced => 'Sinxronlangan';

  @override
  String get syncSyncing => 'Sinxronlanmoqda...';

  @override
  String get syncOffline => 'Oflayn';

  @override
  String get syncError => 'Sinxronlash xatosi';

  @override
  String get notifSettingsTitle => 'Bildirishnomalar va Azon';

  @override
  String get notifAdhanLabel => 'Azon';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Eslatma: $minutes daqiqa oldin';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Ovoz: $pct%';
  }

  @override
  String get notifTestAdhan => 'Azonni sinash';

  @override
  String get notifModeOff => 'O\'chirilgan';

  @override
  String get notifModeReminderOnly => 'Faqat eslatma';

  @override
  String get notifModeArrival => 'Namoz vaqtida';

  @override
  String get notifModeBoth => 'Eslatma + namoz vaqti';

  @override
  String get citySearchHint => 'Shahar qidirish…';

  @override
  String get citySearchDetectTooltip => 'Joylashuvimni aniqlash';

  @override
  String get citySearchNoCityGps => 'GPS dan shaharni aniqlab bo\'lmadi.';

  @override
  String get citySearchPermissionDenied =>
      'Joylashuv ruxsati rad etildi. Qo\'lda qidiring.';

  @override
  String get citySearchNoResults => 'Shahar topilmadi.';

  @override
  String get citySearchStartTyping => 'Qidirish uchun yozishni boshlang…';

  @override
  String get agendasTitle => 'Namoz Jadvallari';

  @override
  String get agendasEmpty =>
      'Hali jadval yo\'q.\nNamozlaringizga bog\'langan eslatma qo\'shish uchun + bosing.';

  @override
  String get agendasUndo => 'Qaytarish';

  @override
  String agendasRemoved(String label) {
    return '$label olib tashlandi';
  }

  @override
  String get agendaNewTitle => 'Yangi Jadval';

  @override
  String get agendaEditTitle => 'Jadvalni Tahrirlash';

  @override
  String get agendaSave => 'Saqlash';

  @override
  String get agendaLabelEmpty => 'Yorliq bo\'sh bo\'lishi mumkin emas';

  @override
  String get agendaLabelField => 'Yorliq';

  @override
  String get agendaLabelHint => 'masalan, Bomdod uchun uyg\'onish';

  @override
  String get agendaPrayerSection => 'Namoz';

  @override
  String get agendaTimeOffsetSection => 'Vaqt ofseti';

  @override
  String get agendaOffsetAtPrayerTime => 'Namoz vaqtida';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes daqiqa oldin';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes daqiqa keyin';
  }

  @override
  String get agendaRepeatSection => 'Takrorlash';

  @override
  String get agendaNotifTypeSection => 'Bildirishnoma turi';

  @override
  String get agendaNotifSilent => 'Ovozsiz';

  @override
  String get agendaNotifSound => 'Ovozli';

  @override
  String get agendaNotifVibrate => 'Tebranish';

  @override
  String get agendaDayM => 'Du';

  @override
  String get agendaDayT => 'Se';

  @override
  String get agendaDayW => 'Ch';

  @override
  String get agendaDayF => 'Ju';

  @override
  String get agendaDayS => 'Sh';

  @override
  String get moonTitle => 'Oy va Hijriy Taqvim';

  @override
  String moonIlluminated(int pct) {
    return '$pct% yoritilgan';
  }

  @override
  String get moonFullTonight => 'Bugun kechasi to\'lin oy!';

  @override
  String get moonNextTomorrow => 'Keyingi to\'lin oy ertaga';

  @override
  String moonNextDays(int days) {
    return 'Keyingi to\'lin oy $days kunda';
  }

  @override
  String moonAge(String age) {
    return 'Oy yoshi: $age kun';
  }

  @override
  String get moonPhaseNewMoon => 'Yangi Oy';

  @override
  String get moonPhaseWaxingCrescent => 'O\'suvchi Hilol';

  @override
  String get moonPhaseFirstQuarter => 'Birinchi Chorak';

  @override
  String get moonPhaseWaxingGibbous => 'O\'suvchi Qavariq';

  @override
  String get moonPhaseFullMoon => 'To\'lin Oy';

  @override
  String get moonPhaseWaningGibbous => 'Kamayuvchi Qavariq';

  @override
  String get moonPhaseLastQuarter => 'Oxirgi Chorak';

  @override
  String get moonPhaseWaningCrescent => 'Kamayuvchi Hilol';

  @override
  String get moonHilalVisibility => 'Keyingi Hilol Ko\'rinishi';

  @override
  String get moonRegionMiddleEast => 'Yaqin Sharq';

  @override
  String get moonRegionWestAfrica => 'G\'arbiy Afrika';

  @override
  String get moonRegionSouthAsia => 'Janubiy Osiyo';

  @override
  String get moonRegionEurope => 'Yevropa';

  @override
  String get moonRegionAmericas => 'Amerika';

  @override
  String get moonVisible => 'Ko\'rinadi';

  @override
  String get moonNotVisible => 'Ko\'rinmaydi';

  @override
  String get moonPossible => 'Mumkin';

  @override
  String get moonUpcomingDates => 'Yaqinlashayotgan Islomiy Sanalar';

  @override
  String get hijriTodayLabel => 'Bugun Hijriy Taqvimda';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramazon $year H boshlanadi';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days kun qoldi';
  }

  @override
  String get moonLunarCycle => 'Oy sikli';

  @override
  String moonDayOfCycle(int day) {
    return '$day-kun ~29.5 dan';
  }

  @override
  String get moonHilalSightingForecast => 'Hilol ko\'rish bashorati';

  @override
  String get moonHilalVisibilityMap => 'Hilol ko\'rinish xaritasi';

  @override
  String moonDayN(int day) {
    return '$day-kun';
  }

  @override
  String get moonGlobalSighting => 'Global ko\'rish';

  @override
  String get moonZoneNakedEye => 'Yalang\'och ko\'z';

  @override
  String get moonZoneBinoculars => 'Durbin';

  @override
  String get moonZoneVeryDifficult => 'Juda qiyin';

  @override
  String get moonZoneNotVisible => 'Ko\'rinmaydi';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H ehtimol 29 kun bo\'ladi. Hilol 29-kuni ko\'rinishi kutilmoqda, in sha Alloh.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H ehtimol 30 kun bo\'ladi. 29-kuni hilol ko\'rinishi dargumon — oy 30 kunda tugaydi.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Quro';

  @override
  String get moonSaudiArabia => 'Saudiya Arabistoni';

  @override
  String get moonFCNACalc => 'FCNA / His.';

  @override
  String get moonNorthAmerica => 'Shimoliy Amerika';

  @override
  String moonNDays(int days) {
    return '$days kun';
  }

  @override
  String moonStarts(String month) {
    return '$month boshlanadi:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Quyosh botishida oy yoshi: $hours soat';
  }

  @override
  String get moon7DayLunarCalendar => '7 kunlik oy taqvimi';

  @override
  String get moonUpcomingIslamicEvents => 'Yaqinlashayotgan Islomiy Voqealar';

  @override
  String get moonTodayLabel => 'Bugun';

  @override
  String get moonTomorrowLabel => 'Ertaga';

  @override
  String get calDateCol => 'Sana';

  @override
  String get calHijriCol => 'Hijriy';

  @override
  String get calFajrCol => 'Bomdod';

  @override
  String get calSunriseCol => 'Quyosh';

  @override
  String get calDhuhrCol => 'Peshin';

  @override
  String get calAsrCol => 'Asr';

  @override
  String get calMaghribCol => 'Shom';

  @override
  String get calIshaCol => 'Xufton';

  @override
  String get calNoCityText =>
      'Namoz taqvimini ko\'rish uchun\navval shaharingizni belgilang.';

  @override
  String get calShareTooltip => 'Taqvimni ulashish';

  @override
  String get calPrevMonthTooltip => 'Oldingi oy';

  @override
  String get calNextMonthTooltip => 'Keyingi oy';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Namoz Vaqtlari — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Kompasga o\'tish';

  @override
  String get qiblaSwitchToAR => 'AR kameraga o\'tish';

  @override
  String get qiblaNoCityText =>
      'Qibla yo\'nalishini hisoblash uchun\navval shaharingizni belgilang.';

  @override
  String get qiblaCompassUnavailable =>
      'Bu qurilmada kompas sensori mavjud emas.';

  @override
  String get qiblaCalibrate =>
      'Kalibrlash: telefoningizni 8 raqami shaklida harakatlantiring.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return 'Shimoldan $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return '$city dan';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'Ka\'badan $dist km';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return 'Ka\'badan ${dist}K km';
  }

  @override
  String get qiblaFacingQibla => 'Qiblaga yuz tutgan ✓';

  @override
  String get tasbeehTitle => 'Tasbeh';

  @override
  String get tasbeehResetTooltip => 'Qayta sozlash';

  @override
  String get tasbeehTapToSwitch => 'O\'zgartirish uchun yorliqqa bosing';

  @override
  String get tasbeehTapToCount => 'Sanash uchun istalgan joyga bosing';

  @override
  String get tasbeehResetDialogTitle => 'Hisoblagichni qayta sozlashmi?';

  @override
  String get tasbeehResetDialogContent => 'Bu joriy hisob nolga qaytaradi.';

  @override
  String get tasbeehCancel => 'Bekor qilish';

  @override
  String get tasbeehReset => 'Qayta Sozlash';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Bugun: $count zikr';
  }

  @override
  String get tasbeehLast7Days => 'Oxirgi 7 kun';

  @override
  String get tasbeehNoHistory => 'Hali tarix yo\'q — sanashni boshlang!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbeh tugadi! $count zikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Aqlli Uy';

  @override
  String get smartHomeSubtitle => 'Qurilmalaringizni namoz vaqtlariga ulang';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Google dan namoz vaqtlari va Qibla yo\'nalishi haqida so\'rang';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Alexa dan namoz vaqtlari, keyingi namoz va boshqalar haqida so\'rang';

  @override
  String get smartHomeSiri => 'Siri Yorliqlari';

  @override
  String get smartHomeSiriDesc =>
      'Namoz vaqtlari uchun maxsus yorliqlar yarating';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Namoz vaqtlarida chiroqlar, displeylar va eslatmalarni avtomatlashtiring';

  @override
  String get smartHomeLinkAccount => 'Hisobni Ulash';

  @override
  String get smartHomeLinked => 'Ulangan';

  @override
  String get smartHomeUnlink => 'Uzish';

  @override
  String get smartHomeSetupInstructions => 'O\'rnatish Ko\'rsatmalari';

  @override
  String get smartHomeRequiresUmmatPlus => 'Ummat+ talab qilinadi';

  @override
  String get smartHomeTroubleshooting => 'Muammolarni Bartaraf Etish';

  @override
  String get smartHomeTestConnection => 'Ulanishni Sinash';

  @override
  String get smartHomeConnectionSuccess => 'Muvaffaqiyatli ulandi';

  @override
  String get smartHomeConnectionFailed =>
      'Ulanish amalga oshmadi. Hisob ulanishingizni tekshiring.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Premium namoz vaqtlari xususiyatlari';

  @override
  String get subscriptionUpgrade => 'Ummat+ ga yangilash';

  @override
  String get subscriptionRestore => 'Xaridni Tiklash';

  @override
  String get subscriptionManage => 'Obunani Boshqarish';

  @override
  String get subscriptionCancel => 'Obunani Bekor Qilish';

  @override
  String get subscriptionActive => 'Faol';

  @override
  String get subscriptionExpired => 'Muddati Tugagan';

  @override
  String get subscriptionFree => 'Bepul';

  @override
  String get subscriptionFreeDesc => 'Asosiy namoz vaqtlari, Qibla, taqvim';

  @override
  String get subscriptionPlusDesc =>
      'Aqlli uy, TV ko\'rinishi, vidjetlar va boshqalar';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count ta bepul so\'rov qoldi';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/yil';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/oy';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Aqlli uy integratsiyasi';

  @override
  String get subscriptionFeatureTV => 'TV ko\'rinish rejimi';

  @override
  String get subscriptionFeatureWidgets => 'Bosh ekran vidjetlari';

  @override
  String get subscriptionFeatureWatch => 'Soat xususiyatlari';

  @override
  String get subscriptionFeatureSync => 'Qurilmalar aro sinxronlash';

  @override
  String get subscriptionFeatureAdFree => 'Reklama sizdan tajriba';

  @override
  String get watchTitle => 'Soat';

  @override
  String get watchNextPrayer => 'Keyingi Namoz';

  @override
  String get watchAllPrayers => 'Barcha Namozlar';

  @override
  String get watchComplication => 'Xususiyat';

  @override
  String get nextPrayer => 'Keyingi namoz';

  @override
  String get allPrayers => 'Barcha namozlar';

  @override
  String get today => 'Bugun';

  @override
  String get tomorrow => 'Ertaga';

  @override
  String get thisWeek => 'Bu hafta';

  @override
  String get thisMonth => 'Bu oy';

  @override
  String get loginCreateAccount => 'Hisob Yaratish';

  @override
  String get loginSignIn => 'Kirish';

  @override
  String get loginWelcomeBack => 'Qaytganingizdan xursandmiz';

  @override
  String get loginJoinPrayCalc => 'PrayCalc ga qo\'shiling';

  @override
  String get loginSyncSubtitle =>
      'Namoz ma\'lumotlaringizni qurilmalar bo\'ylab sinxronlang';

  @override
  String get loginContinueGoogle => 'Google bilan davom eting';

  @override
  String get loginOr => 'yoki';

  @override
  String get loginSigningIn => 'Kirilmoqda…';

  @override
  String get loginNameLabel => 'Ko\'rinish nomi (ixtiyoriy)';

  @override
  String get loginEmailLabel => 'Elektron pochta';

  @override
  String get loginPasswordLabel => 'Parol';

  @override
  String get loginEmailRequired => 'Elektron pochta talab qilinadi';

  @override
  String get loginEmailInvalid => 'Yaroqli elektron pochta manzilini kiriting';

  @override
  String get loginPasswordRequired => 'Parol talab qilinadi';

  @override
  String get loginPasswordMinLength =>
      'Parol kamida 8 belgidan iborat bo\'lishi kerak';

  @override
  String get loginForgotPassword => 'Parolni unutdingizmi?';

  @override
  String get loginEnterEmailFirst =>
      'Avval elektron pochta manzilingizni kiriting';

  @override
  String get loginResetSent => 'Parolni tiklash elektron pochtasi yuborildi';

  @override
  String get loginResetFailed =>
      'Tiklash elektron pochtasini yuborib bo\'lmadi';

  @override
  String get loginNewToPrayCalc => 'PrayCalc da yangimisiz?';

  @override
  String get loginAlreadyHaveAccount => 'Hisobingiz bormi?';

  @override
  String get accountTitle => 'Hisob';

  @override
  String get accountNotSignedIn => 'Kirmagan';

  @override
  String get accountSyncSection => 'Sinxronlash';

  @override
  String get accountSyncStatus => 'Sinxronlash holati';

  @override
  String get accountSyncNow => 'Hozir sinxronlash';

  @override
  String get accountSyncHistory => 'Sinxronlash tarixi';

  @override
  String get accountNoConflicts => 'Ziddiyat aniqlanmadi';

  @override
  String accountConflictsResolved(int count) {
    return '$count hal qilindi';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Sinxronlangan $time';
  }

  @override
  String get accountOfflineStatus =>
      'Oflayn. O\'zgarishlar mahalliy saqlanadi.';

  @override
  String get accountSyncErrorStatus => 'Sinxronlash xatosi. Qayta urinadi.';

  @override
  String get accountDataSection => 'Ma\'lumotlar';

  @override
  String get accountExportData => 'Ma\'lumotlarni eksport qilish';

  @override
  String get accountExportSubtitle =>
      'Sozlamalar va namoz yozuvlaringizni yuklab oling';

  @override
  String get accountExportFailed => 'Ma\'lumotlarni eksport qilib bo\'lmadi';

  @override
  String get accountSignOutTitle => 'Chiqish';

  @override
  String get accountSignOutBody =>
      'Mahalliy ma\'lumotlaringiz saqlanadi. Sinxronlashni davom ettirish uchun qayta kiring.';

  @override
  String get accountDeleteAccount => 'Hisobni o\'chirish';

  @override
  String get accountDeleteSubtitle =>
      'Hisobingiz va ma\'lumotlaringizni butunlay o\'chiring';

  @override
  String get accountDeleteBody =>
      'Bu hisobingiz va barcha sinxronlangan ma\'lumotlarni butunlay o\'chiradi. Bu qurilmadagi mahalliy ma\'lumotlar o\'chirilmaydi.\n\nBu amalni qaytarib bo\'lmaydi.';

  @override
  String get accountDeleted => 'Hisob o\'chirildi';

  @override
  String get accountDeleteFailed => 'Hisobni o\'chirib bo\'lmadi';

  @override
  String get accountTimeJustNow => 'hozirgina';

  @override
  String accountTimeMinAgo(int min) {
    return '$min daqiqa oldin';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour soat oldin';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day kun oldin';
  }

  @override
  String get statsTitle => 'Namoz Statistikasi';

  @override
  String get statsShareTooltip => 'Statistikani ulashish';

  @override
  String get statsTodayPrayers => 'Bugungi Namozlar';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Ketma-ketlik';

  @override
  String get statsDays => 'kun';

  @override
  String get statsThisWeek => 'Bu Hafta';

  @override
  String get statsCompletion => 'bajarilish';

  @override
  String get statsThisMonth => 'Bu Oy';

  @override
  String get statsMostMissed => 'Eng Ko\'p Qoldirilgan';

  @override
  String get statsThisWeekLabel => 'bu hafta';

  @override
  String get statsWeeklyChart => 'Haftalik Bajarilish Namoz Bo\'yicha';

  @override
  String get statsMonthlyChart => 'Oylik Bajarilish Namoz Bo\'yicha';

  @override
  String statsTotalLogged(int count) {
    return 'Jami $count namoz qayd etilgan';
  }

  @override
  String get statsKeepItUp => 'Davom eting!';

  @override
  String get statsShareTitle => 'PrayCalc Namoz Statistikasi';

  @override
  String statsShareStreak(int days) {
    return 'Ketma-ketlik: $days kun';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Haftalik: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Oylik: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Haftalik tafsilot:';

  @override
  String get aboutTitle => 'PrayCalc Haqida';

  @override
  String get aboutWebsite => 'Veb-sayt';

  @override
  String get aboutContact => 'Aloqa';

  @override
  String get aboutLicenses => 'Ochiq Manba Litsenziyalari';

  @override
  String get aboutCouldNotOpen => 'Havolani ochib bo\'lmadi.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Barcha huquqlar himoyalangan.\n\nNamoz vaqtlari pray_calc_dart dvigateli yordamida hisoblanadi. Aniqlik GPS joylashuvingiz va tanlangan hisoblash usulga bog\'liq.';
  }

  @override
  String get commonCancel => 'Bekor qilish';

  @override
  String get commonSave => 'Saqlash';

  @override
  String get commonDelete => 'O\'chirish';

  @override
  String get commonEdit => 'Tahrirlash';

  @override
  String get commonRetry => 'Qayta urinish';

  @override
  String get commonClose => 'Yopish';

  @override
  String get commonDone => 'Tayyor';

  @override
  String get commonBack => 'Orqaga';

  @override
  String get commonNext => 'Keyingi';

  @override
  String get commonSkip => 'O\'tkazib yuborish';

  @override
  String get commonContinue => 'Davom etish';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Ha';

  @override
  String get commonNo => 'Yo\'q';

  @override
  String get commonShare => 'Ulashish';

  @override
  String get commonCopy => 'Nusxa olish';

  @override
  String get commonCopied => 'Vaqtinchalik xotiraga nusxalandi';

  @override
  String get commonLoading => 'Yuklanmoqda...';

  @override
  String get commonError => 'Nimadir xato ketdi';

  @override
  String get commonErrorRetry =>
      'Nimadir xato ketdi. Qayta urinish uchun bosing.';

  @override
  String get commonNoInternet => 'Internet ulanishi yo\'q';

  @override
  String get commonOfflineMode => 'Oflayn rejim';

  @override
  String get commonSignIn => 'Kirish';

  @override
  String get commonSignOut => 'Chiqish';

  @override
  String get commonSignUp => 'Ro\'yxatdan o\'tish';

  @override
  String get commonProfile => 'Profil';

  @override
  String get commonAccount => 'Hisob';

  @override
  String get commonAbout => 'Haqida';

  @override
  String commonVersion(String version) {
    return 'Versiya $version';
  }

  @override
  String get commonPrivacyPolicy => 'Maxfiylik Siyosati';

  @override
  String get commonTermsOfService => 'Xizmat Shartlari';

  @override
  String get commonRateApp => 'Ilovani baholash';

  @override
  String get commonFeedback => 'Fikr bildirish';

  @override
  String get commonHelp => 'Yordam';

  @override
  String get commonLanguage => 'Til';

  @override
  String get commonOpenSettings => 'Sozlamalarni Ochish';

  @override
  String get travelNotificationTitle => 'Siz hozir sayohatdasiz';

  @override
  String get travelNotificationBody =>
      'Namoz vaqtlari qisqartirilishi mumkin. Musofir namozi hukmlari haqida bilish uchun bosing.';

  @override
  String get travelRulingsTitle => 'Sayohat va Namoz';

  @override
  String get travelRulingsIntro =>
      'Sayohat paytidagi namoz bo\'yicha islomiy hukmlar, Qur\'on va sahih hadis to\'plamlaridan ilmiy manbalar bilan.';

  @override
  String get travelWhenTitle => 'Sayohat Qachon Qo\'llaniladi?';

  @override
  String get travelQasrTitle => 'Namozni Qisqartirish (Qasr)';

  @override
  String get travelJamTitle => 'Namozlarni Birlashtirish (Jam\')';

  @override
  String get travelDurationTitle => 'Sayohat Muddati';

  @override
  String get travelReferencesTitle => 'Ilmiy Manbalar';

  @override
  String get travelLearnMore => 'Batafsil';

  @override
  String get travelHanafiDefaultTitle =>
      'Nima Uchun PrayCalc Hanafiy Standartdan Foydalanadi';

  @override
  String get travelDeeperScholarly => 'Chuqurroq Ilmiy Muhokama';

  @override
  String get onboardingTitle1 => 'Namoz vaqtlari, qayerda bo\'lsangiz';

  @override
  String get onboardingBody1 =>
      'Yer yuzidagi har bir shahar uchun GPS aniqligidagi namoz vaqtlari. Bomdoddan Xufton gacha, Quyosh chiqishdan Qiyom gacha. O\'zimizning hisoblash dvigatelimiz bilan ishlaydi.';

  @override
  String get onboardingTitle2 => 'Joylashuvingiz, vaqtlaringiz';

  @override
  String get onboardingBody2 =>
      'Istalgan shaharni qidiring yoki GPS joylashuvingizni aniqlashiga ruxsat bering. PrayCalc butun dunyo bo\'ylab 5 million shahar uchun vaqtlarni topadi.';

  @override
  String get onboardingTitle3 => 'Hech qachon namozni qoldirmang';

  @override
  String get onboardingBody3 =>
      'Namoz vaqtida azon, oldindan eslatma. Saharlik, darslar va boshqalar uchun maxsus jadvallar.';

  @override
  String get onboardingTitle4 => 'Sizga kerak bo\'lgan hamma narsa';

  @override
  String get onboardingBody4 =>
      'Qibla kompasi, namoz taqvimi, Hijriy oy fazasi, tasbeh hisoblagichi. Hammasi bir joyda.';

  @override
  String get onboardingSkip => 'O\'tkazib yuborish';

  @override
  String get onboardingGetStarted => 'Boshlash';

  @override
  String get onboardingSignInTitle => 'PrayCalc ga kiring';

  @override
  String get onboardingSignInSubtitle =>
      'Namoz tarixingizni saqlang va barcha\nqurilmalaringiz bo\'ylab sinxronlang.';

  @override
  String get onboardingContinueGoogle => 'Google bilan davom eting';

  @override
  String get onboardingContinueWithoutAccount => 'Hisobsiz davom eting';

  @override
  String get onboardingSigningIn => 'Kirilmoqda…';

  @override
  String get onboardingSelectLanguage => 'Tilni Tanlang';

  @override
  String get duaDhikrTitle => 'Duo va Zikr';

  @override
  String get duaDhikrTabDua => 'Duolar';

  @override
  String get duaDhikrTabDhikr => 'Zikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbeh';

  @override
  String get duaDhikrTabMorning => 'Ertalab';

  @override
  String get duaDhikrTabEvening => 'Kechqurun';

  @override
  String get duaDhikrMorningAdhkar => 'Ertalabki Azkorlar';

  @override
  String get duaDhikrEveningAdhkar => 'Kechki Azkorlar';

  @override
  String get calGregToggle => 'Milod';

  @override
  String get calHijriToggle => 'Hijriy';

  @override
  String get calYearlyTooltip => 'Yillik taqvim';

  @override
  String get calExportIcsTooltip => '.ics eksport';

  @override
  String get calMagCol => 'Shom';

  @override
  String get qiblaShowOnMap => 'Xaritada ko\'rsatish';

  @override
  String get qiblaWaitingCompass => 'Kompas kutilmoqda...';

  @override
  String get qiblaNoCompassSensor =>
      'Kompas sensori yo\'q. Qibla yo\'nalishi statik ko\'rsatilmoqda.';

  @override
  String get qiblaAccuracyExcellent => 'A\'lo aniqlik';

  @override
  String get qiblaAccuracyGood => 'Yaxshi aniqlik';

  @override
  String get qiblaAccuracyFair =>
      'O\'rtacha aniqlik. Telefonni 8 raqami shaklida harakatlantiring.';

  @override
  String get qiblaAccuracyLow =>
      'Past aniqlik. Telefonni 8 raqami shaklida harakatlantiring.';

  @override
  String get qiblaToTheKaaba => 'Ka\'ba tomon';

  @override
  String get qiblaYourLocation => 'Joylashuvingiz';

  @override
  String get qiblaGpsAccurate => 'GPS aniq';

  @override
  String get qiblaCityCenter => 'Shahar markazi';

  @override
  String get moonIlluminatedLabel => 'Yoritilgan';

  @override
  String get moonAgeLabel => 'Yosh';

  @override
  String get moonFirstQtr => 'Birinchi Chorak';

  @override
  String get moonLastQtr => 'Oxirgi Chorak';

  @override
  String get moonTonight => 'Bugun kechasi';

  @override
  String get moonTomorrow => 'Ertaga';

  @override
  String moonDaysAway(int days) {
    return '$days kun';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Uy Joylashuvini Belgilash';

  @override
  String get setHomeSearchHint =>
      'Shahar, shaharcha yoki pochta indeksini qidiring…';

  @override
  String get setHomeClear => 'Tozalash';

  @override
  String get setHomeUseCurrentLocation => 'Hozirgi Joylashuvdan Foydalanish';

  @override
  String get setHomeDetectAndSet =>
      'Joylashuvingizni aniqlang va uy sifatida belgilang';

  @override
  String get setHomeAlreadySet => 'Uy allaqachon belgilangan';

  @override
  String setHomeSetAs(String city) {
    return '$city uy sifatida belgilandi';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Hozirgi joylashuv uy sifatida belgilandi';

  @override
  String get setHomePermissionDenied =>
      'Joylashuv ruxsati rad etildi. Quyida shahar qidiring.';

  @override
  String get setHomeGpsUnavailable => 'GPS mavjud emas. Qo\'lda qidiring.';

  @override
  String get setHomeNoCitiesFound => 'Shahar topilmadi.';

  @override
  String get setHomeSearchPrompt => 'Uy shaharingizni qidiring';

  @override
  String get setHomeSearchBody =>
      'Qidirish uchun yuqoriga yozing yoki hozirgi joylashuvingizdan foydalaning. Sayohat rejimi uydan uzoqda bo\'lganingizni aniqlaydi.';

  @override
  String get subscriptionYouHavePlus => 'Sizda Ummat+ bor';

  @override
  String get subscriptionUpgradeTo => 'Ummat+ ga yangilash';

  @override
  String get subscriptionThankYou =>
      'PrayCalc ni qo\'llab-quvvatlaganingiz uchun rahmat.';

  @override
  String get subscriptionUnlockPremium =>
      'Barcha qurilmalaringizda premium xususiyatlarni oching.';

  @override
  String get subscriptionManageSub => 'Obunani boshqarish';

  @override
  String get subscriptionWelcome => 'Ummat+ ga xush kelibsiz!';

  @override
  String get subscriptionSubscribe => 'Obuna bo\'lish';

  @override
  String get subscriptionFreeFeatures => 'Bepul Xususiyatlar';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ Xususiyatlari';

  @override
  String get subscriptionFeaturePrayerTimes => 'Namoz vaqtlari';

  @override
  String get subscriptionFeatureQibla => 'Qibla kompasi';

  @override
  String get subscriptionFeatureCalendar => 'Oylik taqvim';

  @override
  String get subscriptionFeatureTasbeeh => 'Tasbeh hisoblagichi';

  @override
  String get subscriptionFeatureMoon => 'Oy va Hijriy';

  @override
  String get smartHomeAlertType => 'Ogohlantirish Turi';

  @override
  String get smartHomeAlertModal => 'To\'liq ekranli oyna';

  @override
  String get smartHomeAlertCorner => 'Burchak bildirishnomasi';

  @override
  String get smartHomeAlertNone => 'Yo\'q (ovozsiz)';

  @override
  String get smartHomePauseMedia => 'Azon paytida mediani to\'xtatish';

  @override
  String get smartHomeQuietHours => 'Jim soatlar';

  @override
  String get smartHomeQuietFrom => 'Dan';

  @override
  String get smartHomeQuietTo => 'Gacha';

  @override
  String get smartHomePrayerAudio => 'Har bir namoz audisi';

  @override
  String get smartHomeAudioAdhan => 'Azon';

  @override
  String get smartHomeAudioBeep => 'Bip';

  @override
  String get smartHomeAudioSilent => 'Ovozsiz';

  @override
  String get aboutPrivacy => 'Maxfiylik Siyosati';

  @override
  String aboutVersion(String version) {
    return 'Versiya $version';
  }

  @override
  String get notifDefaultAdhan => 'Standart Azon';

  @override
  String get notifFajrAdhan => 'Bomdod Azoni';

  @override
  String get notifFajrAdhanSubtitle => 'Bomdod namozi vaqtida ijro etiladi';

  @override
  String get notifRegularAdhan => 'Oddiy Azon';

  @override
  String get notifRegularAdhanSubtitle =>
      'Peshin, Asr, Shom, Xufton vaqtlarida ijro etiladi';

  @override
  String get notifPerPrayerSettings => 'Har Bir Namoz Sozlamalari';

  @override
  String get notifPreview => 'Ko\'rib chiqish';

  @override
  String get tvSettingsTitle => 'TV Sozlamalari';

  @override
  String get tvDisplayMode => 'Ko\'rinish Rejimi';

  @override
  String get tvMasjidMode => 'Masjid Rejimi';

  @override
  String get tvMasjidModeSubtitle =>
      'Iqomat vaqtlari bilan katta belgi ko\'rinishi';

  @override
  String get tvMasjidName => 'Masjid Nomi';

  @override
  String get tvMasjidNameTapToSet => 'Belgilash uchun bosing';

  @override
  String get tvClock => 'Soat';

  @override
  String get tv24hFormat => '24 soatlik format';

  @override
  String get tvIqamahOffsets => 'Iqomat Ofsetlari (azondan keyin daqiqalar)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'Azondan keyin $offset daqiqa';
  }

  @override
  String get tvQrCode => 'QR Kod';

  @override
  String get tvShowQrCode => 'QR Kodni Ko\'rsatish';

  @override
  String get tvShowQrCodeSubtitle => 'Masjid ekranida QR kodni ko\'rsatish';

  @override
  String get tvQrCodeUrl => 'QR Kod URL';

  @override
  String get tvAmbientModeSection => 'Muhit Rejimi';

  @override
  String get tvIdleTimeout => 'Bo\'sh vaqt';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'Muhit faollashishidan $minutes daqiqa oldin';
  }

  @override
  String get tvPhotoInterval => 'Rasm oralig\'i';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'Rasmlar orasida $seconds soniya';
  }

  @override
  String get tvBackground => 'Fon';

  @override
  String get tvPhotoCategory => 'Rasm toifasi';

  @override
  String get tvLocation => 'Joylashuv';

  @override
  String get tvChangeCity => 'Shaharni O\'zgartirish';

  @override
  String get tvChangeCitySubtitle => 'Boshqa shahar qidirish';

  @override
  String get tvScreensaverBg => 'Ekran Himoyachisi Foni';

  @override
  String get tvScreensaverPhotos => 'Rasmlar';

  @override
  String get tvScreensaverPattern => 'Geometrik naqsh';

  @override
  String get tvScreensaverBoth => 'Rasmlar + naqsh';

  @override
  String get tvCategoryAll => 'Barcha toifalar';

  @override
  String get tvCategoryMasjids => 'Masjidlar';

  @override
  String get tvCategoryInteriors => 'Ichki ko\'rinishlar';

  @override
  String get tvCategoryGeometric => 'Geometrik';

  @override
  String get tvCategoryCalligraphy => 'Xattotlik';

  @override
  String get tvCategoryLandscapes => 'Manzaralar';

  @override
  String get tvCategoryRamadan => 'Ramazon';

  @override
  String get tvPhotoCategoryTitle => 'Rasm Toifasi';

  @override
  String tvEnterHint(String title) {
    return '$title kiriting';
  }

  @override
  String get tvSystemDefault => 'Tizim standarti';

  @override
  String get smartHomeIntegrations => 'Integratsiyalar';

  @override
  String get smartHomeLinkedSpeakers => 'Ulangan Karnaylar va Displeylar';

  @override
  String get smartHomeAlertDisplay => 'Ogohlantirish Ko\'rinishi';

  @override
  String get smartHomeAtAdhanShow => 'Azon vaqtida ko\'rsatish';

  @override
  String get smartHomePauseMediaTitle => 'Azon vaqtida mediani to\'xtatish';

  @override
  String get smartHomePauseMediaSubtitle =>
      'Azon tugaganidan keyin davom etadi';

  @override
  String get smartHomePrayerAudioSection => 'Namoz Audisi';

  @override
  String get smartHomeQuietHoursSection => 'Jim Soatlar';

  @override
  String get smartHomeEnableQuietHours => 'Jim soatlarni yoqish';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Barcha aqlli uy ogohlantirishlari o\'chiriladi';

  @override
  String get smartHomeNoDevices => 'Hali hech qanday qurilma ulanmagan';

  @override
  String get smartHomeNoDevicesDesc =>
      'Yuqorida Google Home yoki Alexa ni ulang, keyin karnay va displeylaringiz bu yerda ko\'rinadi.';

  @override
  String get smartHomeRequiresPlus => 'Aqlli Uy Ummat+ talab qiladi';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Google Home, Alexa, Siri va Home Assistant da namoz e\'lonlarini boshqaring. Qaysi qurilmalar azon ijro etishini, qachon media to\'xtatilishini va jim soatlarni sozlang.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Nest karnay va displeylarida azonni translyatsiya qiling.';

  @override
  String get smartHomeEnableAlexa => 'Alexa da PrayCalc ko\'nikmasini yoqing.';

  @override
  String get smartHomeSiriAsk =>
      'Siri dan namoz vaqtlari haqida so\'rang yoki avtomatlashtirishni sozlang.';

  @override
  String get smartHomeHassAdd =>
      'To\'liq avtomatlashtirish uchun HACS orqali qo\'shing.';

  @override
  String get smartHomeSetupGuide => 'O\'rnatish yo\'riqnomasi';

  @override
  String get smartHomeSiriSetupTitle => 'Siri Yorliqlari O\'rnatish';

  @override
  String get smartHomeSiriStep1 =>
      'iPhone yoki iPad da Yorliqlar ilovasini oching.';

  @override
  String get smartHomeSiriStep2 => 'Yangi yorliq yaratish uchun \"+\" bosing.';

  @override
  String get smartHomeSiriStep3 =>
      'Amallar ro\'yxatida \"PrayCalc\" ni qidiring.';

  @override
  String get smartHomeSiriStep4 =>
      '\"Keyingi Namoz Vaqti\" yoki \"Bugungi Namoz Vaqtlari\" ni qo\'shing.';

  @override
  String get smartHomeSiriStep5 =>
      'Ixtiyoriy: avtomatlashtirishga qo\'shing (masalan, har kuni Bomdod vaqtida).';

  @override
  String get smartHomeSiriStep6 =>
      'Sinash uchun \"Hey Siri, keyingi namoz vaqti\" deng.';

  @override
  String get smartHomeSiriFootnote =>
      'iOS 16 yoki undan keyingi versiya talab qilinadi.';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant O\'rnatish';

  @override
  String get smartHomeHassStep1 =>
      'HACS (Home Assistant Jamiyat Do\'koni) ni o\'rnating.';

  @override
  String get smartHomeHassStep2 =>
      'HACS da \"PrayCalc\" ni qidiring va o\'rnating.';

  @override
  String get smartHomeHassStep3 =>
      'Sozlamalar > Qurilmalar va Xizmatlar > Integratsiya Qo\'shish ga o\'ting.';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" ni qidiring va tanlang.';

  @override
  String get smartHomeHassStep5 =>
      'PrayCalc API kalitingizni kiriting (hisobingizda yaratilgan).';

  @override
  String get smartHomeHassStep6 => 'Joylashuv va hisoblash usulini sozlang.';

  @override
  String get smartHomeHassFootnote =>
      'HACS bilan Home Assistant 2024.1+ talab qilinadi.';

  @override
  String get smartHomeApiKey => 'API Kalit';

  @override
  String get smartHomeGenerateApiKey => 'API Kalit Yaratish';

  @override
  String get smartHomeApiKeyNotReady =>
      'PrayCalc aqlli xizmati ishga tushirilgandan keyin API kalit yaratish mavjud bo\'ladi.';

  @override
  String get smartHomeApiKeyDesc =>
      'Home Assistant ni PrayCalc hisobingizga ulash uchun API kalitga ehtiyoj bor.';

  @override
  String get smartHomeLinkedStatus => 'Ulangan';

  @override
  String get smartHomeNotLinkedStatus => 'Ulanmagan';

  @override
  String get smartHomeCouldNotOpen => 'Havolani ochib bo\'lmadi.';

  @override
  String get smartHomeDevices => 'Qurilmalar';

  @override
  String get smartHomeAddDevice => 'Qurilma qo\'shish';

  @override
  String get smartHomeDeleteDevice => 'O\'chirish';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Bu qurilmani olib tashlaysizmi?';

  @override
  String get smartHomeDeviceOnline => 'Onlayn';

  @override
  String get smartHomeDeviceOffline => 'Oflayn';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Oxirgi ko\'rinish: $time';
  }

  @override
  String get smartHomeDeviceName => 'Qurilma nomi';

  @override
  String get smartHomeDeviceType => 'Qurilma turi';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Karnay';

  @override
  String get smartHomeDeviceTypeWatch => 'Soat';

  @override
  String get smartHomeDeviceTypeDesktop => 'Kompyuter';

  @override
  String get smartHomeDeviceTypeOther => 'Boshqa';

  @override
  String get smartHomeDeviceAdhan => 'Azon bildirishnomalari';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Bu qurilmada azon ogohlantirishlarini oling';

  @override
  String get smartHomeDeviceVolume => 'Ovoz balandligi';

  @override
  String get smartHomeDeviceAudioType => 'Audio turi';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Yoqilgan namozlar';

  @override
  String get smartHomeDeviceSettings => 'Qurilma Sozlamalari';

  @override
  String get smartHomeTesting => 'Sinovdan o\'tkazilmoqda...';

  @override
  String get smartHomeTestSuccess => 'Ulanish tasdiqlandi';

  @override
  String get smartHomeTestFailed => 'Ulanish sinovi muvaffaqiyatsiz';

  @override
  String get smartHomePairTv => 'TV ulash';

  @override
  String get smartHomePairingTv => 'TV ro\'yxatdan o\'tkazilmoqda...';

  @override
  String get smartHomePairTvSuccess => 'TV muvaffaqiyatli ulandi';

  @override
  String get smartHomePairTvFailed => 'TV ulash muvaffaqiyatsiz';

  @override
  String get smartHomeLoadingDevices => 'Qurilmalar yuklanmoqda...';

  @override
  String get smartHomeLoadingIntegrations => 'Integratsiyalar yuklanmoqda...';

  @override
  String get smartHomeServiceUnavailable =>
      'Aqlli uy xizmati hozirda mavjud emas. Iltimos, keyinroq qayta urinib ko\'ring.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total bajarildi';
  }

  @override
  String get adhkarReset => 'Qayta Sozlash';

  @override
  String get syncHistoryTitle => 'Sinxronlash Tarixi';

  @override
  String get syncClearHistory => 'Tarixni tozalash';

  @override
  String get syncNoConflicts =>
      'Sinxronlash ziddiyati aniqlanmadi. Barcha qurilmalar sinxron.';

  @override
  String get syncDomainSettings => 'Sozlamalar';

  @override
  String get syncDomainCities => 'Saqlangan Shaharlar';

  @override
  String get syncDomainPrayerLogs => 'Namoz Yozuvlari';

  @override
  String get syncTimeJustNow => 'hozirgina';

  @override
  String syncTimeMinAgo(int min) {
    return '$min daqiqa oldin';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour soat oldin';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day kun oldin';
  }

  @override
  String get pinCity => 'Qadash';

  @override
  String get pinMaxReached =>
      'Maksimal 5 ta qadalgan shahar. Ko\'proq uchun Ummat+ ga yangilang.';

  @override
  String pinCityUnpinned(String city) {
    return '$city qadashdan olindi';
  }

  @override
  String get pinUndo => 'Qaytarish';
}
