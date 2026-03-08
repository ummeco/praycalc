// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Turkish (`tr`).
class AppLocalizationsTr extends AppLocalizations {
  AppLocalizationsTr([String locale = 'tr']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Fecr';

  @override
  String get prayerSunrise => 'Gunes';

  @override
  String get prayerDhuhr => 'Ogle';

  @override
  String get prayerAsr => 'Ikindi';

  @override
  String get prayerMaghrib => 'Aksam';

  @override
  String get prayerIsha => 'Yatsi';

  @override
  String get prayerQiyam => 'Gece Namazi';

  @override
  String get prayerSuhoor => 'Sahur';

  @override
  String get prayerIftar => 'Iftar';

  @override
  String get hijriMuharram => 'Muharrem';

  @override
  String get hijriSafar => 'Safer';

  @override
  String get hijriRabiAlAwwal => 'Rebiulevvel';

  @override
  String get hijriRabiAlThani => 'Rebiulahir';

  @override
  String get hijriJumadaAlAwwal => 'Cemaziyelevvel';

  @override
  String get hijriJumadaAlThani => 'Cemaziyelahir';

  @override
  String get hijriRajab => 'Recep';

  @override
  String get hijriShaban => 'Saban';

  @override
  String get hijriRamadan => 'Ramazan';

  @override
  String get hijriShawwal => 'Sevval';

  @override
  String get hijriDhulQidah => 'Zilkade';

  @override
  String get hijriDhulHijjah => 'Zilhicce';

  @override
  String get monthJan => 'Oca';

  @override
  String get monthFeb => 'Sub';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Nis';

  @override
  String get monthMay => 'May';

  @override
  String get monthJun => 'Haz';

  @override
  String get monthJul => 'Tem';

  @override
  String get monthAug => 'Agu';

  @override
  String get monthSep => 'Eyl';

  @override
  String get monthOct => 'Eki';

  @override
  String get monthNov => 'Kas';

  @override
  String get monthDec => 'Ara';

  @override
  String get monthJanuary => 'Ocak';

  @override
  String get monthFebruary => 'Subat';

  @override
  String get monthMarch => 'Mart';

  @override
  String get monthApril => 'Nisan';

  @override
  String get monthMayFull => 'Mayis';

  @override
  String get monthJune => 'Haziran';

  @override
  String get monthJuly => 'Temmuz';

  @override
  String get monthAugust => 'Agustos';

  @override
  String get monthSeptember => 'Eylul';

  @override
  String get monthOctober => 'Ekim';

  @override
  String get monthNovember => 'Kasim';

  @override
  String get monthDecember => 'Aralik';

  @override
  String get dayMonShort => 'Pzt';

  @override
  String get dayTueShort => 'Sal';

  @override
  String get dayWedShort => 'Car';

  @override
  String get dayThuShort => 'Per';

  @override
  String get dayFriShort => 'Cum';

  @override
  String get daySatShort => 'Cmt';

  @override
  String get daySunShort => 'Paz';

  @override
  String get dayMonday => 'Pazartesi';

  @override
  String get dayTuesday => 'Sali';

  @override
  String get dayWednesday => 'Carsamba';

  @override
  String get dayThursday => 'Persembe';

  @override
  String get dayFriday => 'Cuma';

  @override
  String get daySaturday => 'Cumartesi';

  @override
  String get daySunday => 'Pazar';

  @override
  String get daySuChart => 'Pa';

  @override
  String get dayMoChart => 'Pt';

  @override
  String get dayTuChart => 'Sa';

  @override
  String get dayWeChart => 'Ca';

  @override
  String get dayThChart => 'Pe';

  @override
  String get dayFrChart => 'Cu';

  @override
  String get daySaChart => 'Ct';

  @override
  String get chooseCityLabel => 'Sehir secin';

  @override
  String get setCityFab => 'Sehir ayarla';

  @override
  String prayerTimesError(Object error) {
    return 'Namaz vakitleri hesaplanamadi.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer icinde';
  }

  @override
  String get ramadanMubarak => 'Ramazan Mubarek';

  @override
  String ramadanDayProgress(int day) {
    return 'Gun $day / 30';
  }

  @override
  String get lastTenNights => 'Son 10 Gece';

  @override
  String get laylatulQadr => 'Kadir Gecesi';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'M';

  @override
  String get homeNoCitySelected => 'Sehir secilmedi';

  @override
  String get homeNoCityHint =>
      'Sehrinizi aramak veya GPS\'i etkinlestirmek icin yukari dokunun.';

  @override
  String get homeCouldNotCalc => 'Namaz vakitleri hesaplanamadi.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Aylik\nVakitler';

  @override
  String get homeActionDuaDhikr => 'Dua &\nZikir';

  @override
  String get homeActionPrayerStats => 'Namaz\nIstatistikleri';

  @override
  String homePolarBanner(int count) {
    return 'Bulundugunuz konum icin bu donemde $count namaz vakti hesaplanamaz (gece yarisi gunesi / kutup gecesi). Ayarlardan en yakin enlem tahmini deneyin.';
  }

  @override
  String get settingsTitle => 'Ayarlar';

  @override
  String get settingsSectionPrayerCalc => 'Namaz Hesaplama';

  @override
  String get settingsCalcMethod => 'Hesaplama Yontemi';

  @override
  String get settingsCalcMethodAuto => 'Otomatik (Dinamik)';

  @override
  String get settingsHanafiAsr => 'Hanefi Ikindi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Golge katsayisi 2x (gec ikindi vakti)';

  @override
  String get settingsSectionDisplay => 'Gorunum';

  @override
  String get settings24hClock => '24 saat';

  @override
  String get settingsFollowSystemTheme => 'Sistem temasini takip et';

  @override
  String get settingsDarkMode => 'Karanlik mod';

  @override
  String get settingsSectionNotifications => 'Bildirimler';

  @override
  String get settingsPrayerNotifications => 'Namaz bildirimleri';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Ezan, hatirlatmalar ve namaz ayarlari';

  @override
  String get settingsPrayerAgendas => 'Namaz ajandasi';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Namaz vakitlerine gore ozel hatirlatmalar';

  @override
  String get settingsAccount => 'Hesap';

  @override
  String get settingsSignInToSync => 'Senkronizasyon icin giris yapin';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Verilerinizi cihazlar arasinda koruyun';

  @override
  String get settingsHomeScreen => 'Ana Ekran';

  @override
  String get settingsSkyGradient => 'Gokyuzu gradyan arka plani';

  @override
  String get settingsSkyGradientSubtitle =>
      'Gunun saatine gore animasyonlu gokyuzu renkleri';

  @override
  String get settingsWeatherGradient => 'Hava durumlu gradyan';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Yerel havaya gore gokyuzu renklerini ayarla';

  @override
  String get settingsCountdownAnimation => 'Geri sayim animasyonu';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Sonraki namaz geri sayiminda nefes halkasi';

  @override
  String get settingsPrayerTracking => 'Namaz Takibi';

  @override
  String get settingsTrackMyPrayers => 'Namazlarimi takip et';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Her gun kildiginiz namazlari kaydedin';

  @override
  String get settingsPrayerStats => 'Namaz istatistikleri';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Seriler, haftalik ve aylik grafikler';

  @override
  String get settingsJumuahKahf => 'Cuma Kehf suresi hatirlatmasi';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Cumalari Kehf suresini okuma hatirlatmasi';

  @override
  String get settingsTravel => 'Seyahat';

  @override
  String get settingsTravelMode => 'Seyahat modu';

  @override
  String get settingsTravelModeSubtitle =>
      'Evden uzakta oldugunuzu otomatik algilar ve namazlari ayarlar';

  @override
  String get settingsHomeLocation => 'Ev konumu';

  @override
  String get settingsHomeLocationNotSet =>
      'Ayarlanmadi — mevcut konumu kullanmak icin dokunun';

  @override
  String get settingsClearHomeLocation => 'Ev konumunu temizle';

  @override
  String get settingsTravelRulings => 'Seyahatte namaz hukumleri';

  @override
  String get settingsTravelRulingsSubtitle => 'Qasr, cem ve yolcu rehberi';

  @override
  String get settingsSmartHome => 'Akilli Ev';

  @override
  String get settingsSmartHomeIntegrations => 'Akilli ev entegrasyonlari';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'TV Gorunumu';

  @override
  String get settingsTvHome => 'TV ana gorunumu';

  @override
  String get settingsTvHomeSubtitle => 'TV icin tam ekran namaz saati';

  @override
  String get settingsMasjidDisplay => 'Cami gorunumu';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Cami ekranlari icin ezan/ikamet tablosu';

  @override
  String get settingsTvSettings => 'TV ayarlari';

  @override
  String get settingsTvSettingsSubtitle => 'Cami modu, ikamet farklari, ortam';

  @override
  String get settingsAboutPrayCalc => 'PrayCalc Hakkinda';

  @override
  String get syncSynced => 'Senkronize';

  @override
  String get syncSyncing => 'Senkronize ediliyor...';

  @override
  String get syncOffline => 'Cevrimdisi';

  @override
  String get syncError => 'Senkronizasyon hatasi';

  @override
  String get notifSettingsTitle => 'Bildirimler ve Ezan';

  @override
  String get notifAdhanLabel => 'Ezan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Hatirlatma: $minutes dk once';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Ses: %$pct';
  }

  @override
  String get notifTestAdhan => 'Ezan test';

  @override
  String get notifModeOff => 'Kapali';

  @override
  String get notifModeReminderOnly => 'Sadece hatirlatma';

  @override
  String get notifModeArrival => 'Namaz vaktinde';

  @override
  String get notifModeBoth => 'Hatirlatma + vakit';

  @override
  String get citySearchHint => 'Sehir ara...';

  @override
  String get citySearchDetectTooltip => 'Konumumu bul';

  @override
  String get citySearchNoCityGps => 'GPS ile sehir bulunamadi.';

  @override
  String get citySearchPermissionDenied =>
      'Konum izni reddedildi. Manuel arama yapin.';

  @override
  String get citySearchNoResults => 'Sehir bulunamadi.';

  @override
  String get citySearchStartTyping => 'Aramak icin yazmaya baslayin...';

  @override
  String get agendasTitle => 'Namaz Ajandasi';

  @override
  String get agendasEmpty =>
      'Henuz ajanda yok.\nNamazlariniza bagli hatirlatma eklemek icin + tusuna basin.';

  @override
  String get agendasUndo => 'Geri al';

  @override
  String agendasRemoved(String label) {
    return '$label kaldirildi';
  }

  @override
  String get agendaNewTitle => 'Yeni Ajanda';

  @override
  String get agendaEditTitle => 'Ajanda Duzenle';

  @override
  String get agendaSave => 'Kaydet';

  @override
  String get agendaLabelEmpty => 'Etiket bos olamaz';

  @override
  String get agendaLabelField => 'Etiket';

  @override
  String get agendaLabelHint => 'orn. Fecir icin uyan';

  @override
  String get agendaPrayerSection => 'Namaz';

  @override
  String get agendaTimeOffsetSection => 'Zaman farki';

  @override
  String get agendaOffsetAtPrayerTime => 'Namaz vaktinde';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes dk once';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes dk sonra';
  }

  @override
  String get agendaRepeatSection => 'Tekrar';

  @override
  String get agendaNotifTypeSection => 'Bildirim turu';

  @override
  String get agendaNotifSilent => 'Sessiz';

  @override
  String get agendaNotifSound => 'Sesli';

  @override
  String get agendaNotifVibrate => 'Titresim';

  @override
  String get agendaDayM => 'P';

  @override
  String get agendaDayT => 'S';

  @override
  String get agendaDayW => 'C';

  @override
  String get agendaDayF => 'C';

  @override
  String get agendaDayS => 'C';

  @override
  String get moonTitle => 'Ay ve Hicri Takvim';

  @override
  String moonIlluminated(int pct) {
    return '%$pct aydinlik';
  }

  @override
  String get moonFullTonight => 'Bu gece dolunay!';

  @override
  String get moonNextTomorrow => 'Sonraki dolunay yarin';

  @override
  String moonNextDays(int days) {
    return 'Sonraki dolunay $days gun icinde';
  }

  @override
  String moonAge(String age) {
    return 'Ay yasi: $age gun';
  }

  @override
  String get moonPhaseNewMoon => 'Yeni Ay';

  @override
  String get moonPhaseWaxingCrescent => 'Hilal';

  @override
  String get moonPhaseFirstQuarter => 'Ilk Dordun';

  @override
  String get moonPhaseWaxingGibbous => 'Buyuyen Ay';

  @override
  String get moonPhaseFullMoon => 'Dolunay';

  @override
  String get moonPhaseWaningGibbous => 'Kuculen Ay';

  @override
  String get moonPhaseLastQuarter => 'Son Dordun';

  @override
  String get moonPhaseWaningCrescent => 'Kuculen Hilal';

  @override
  String get moonHilalVisibility => 'Sonraki Hilal Gorunurlugu';

  @override
  String get moonRegionMiddleEast => 'Orta Dogu';

  @override
  String get moonRegionWestAfrica => 'Bati Afrika';

  @override
  String get moonRegionSouthAsia => 'Guney Asya';

  @override
  String get moonRegionEurope => 'Avrupa';

  @override
  String get moonRegionAmericas => 'Amerikalar';

  @override
  String get moonVisible => 'Gorunur';

  @override
  String get moonNotVisible => 'Gorunmez';

  @override
  String get moonPossible => 'Muhtemel';

  @override
  String get moonUpcomingDates => 'Yaklasan Islami Tarihler';

  @override
  String get hijriTodayLabel => 'Bugunku Hicri Tarih';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramazan $year baslangiç';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days gun kaldi';
  }

  @override
  String get moonLunarCycle => 'Ay Dongusu';

  @override
  String moonDayOfCycle(int day) {
    return '$day. gun / ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'Hilal Gorunurluk Tahmini';

  @override
  String get moonHilalVisibilityMap => 'Hilal Gorunurluk Haritasi';

  @override
  String moonDayN(int day) {
    return '$day. Gun';
  }

  @override
  String get moonGlobalSighting => 'Kuresel Gorunurluk';

  @override
  String get moonZoneNakedEye => 'Cipak Gozle';

  @override
  String get moonZoneBinoculars => 'Durbunle';

  @override
  String get moonZoneVeryDifficult => 'Cok Zor';

  @override
  String get moonZoneNotVisible => 'Gorunmez';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year Hicri buyuk olasilikla 29 gun olacak. Hilal 29. gunde gorulebilir, insallah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year Hicri buyuk olasilikla 30 gun olacak. 29. gunde hilal gorulmesi beklenmemektedir.';
  }

  @override
  String get moonUmmAlQura => 'Ummu\'l-Kura';

  @override
  String get moonSaudiArabia => 'Suudi Arabistan';

  @override
  String get moonFCNACalc => 'FCNA / Hesap';

  @override
  String get moonNorthAmerica => 'Kuzey Amerika';

  @override
  String moonNDays(int days) {
    return '$days gun';
  }

  @override
  String moonStarts(String month) {
    return '$month baslangici:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Gun batiminda ay yasi: $hours saat';
  }

  @override
  String get moon7DayLunarCalendar => '7 Gunluk Ay Takvimi';

  @override
  String get moonUpcomingIslamicEvents => 'Yaklasan Islami Gunler';

  @override
  String get moonTodayLabel => 'Bugun';

  @override
  String get moonTomorrowLabel => 'Yarin';

  @override
  String get calDateCol => 'Tarih';

  @override
  String get calHijriCol => 'Hicri';

  @override
  String get calFajrCol => 'Fecr';

  @override
  String get calSunriseCol => 'Gunes';

  @override
  String get calDhuhrCol => 'Ogle';

  @override
  String get calAsrCol => 'Ikindi';

  @override
  String get calMaghribCol => 'Aksam';

  @override
  String get calIshaCol => 'Yatsi';

  @override
  String get calNoCityText =>
      'Namaz takvimini gormek icin\nonce sehrinizi ayarlayin.';

  @override
  String get calShareTooltip => 'Takvimi paylas';

  @override
  String get calPrevMonthTooltip => 'Onceki ay';

  @override
  String get calNextMonthTooltip => 'Sonraki ay';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Namaz Vakitleri — $month';
  }

  @override
  String get qiblaTitle => 'Kible';

  @override
  String get qiblaSwitchToCompass => 'Pusulaya gec';

  @override
  String get qiblaSwitchToAR => 'AR kameraya gec';

  @override
  String get qiblaNoCityText =>
      'Kible yonunu hesaplamak icin\nonce sehrinizi ayarlayin.';

  @override
  String get qiblaCompassUnavailable => 'Bu cihazda pusula sensoru bulunmuyor.';

  @override
  String get qiblaCalibrate =>
      'Kalibrasyon: telefonunuzu 8 seklinde hareket ettirin.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return 'Kuzeyden $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return '$city konumundan';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'Kabe\'ye $dist km';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return 'Kabe\'ye ${dist}K km';
  }

  @override
  String get qiblaFacingQibla => 'Kible yonunde ✓';

  @override
  String get tasbeehTitle => 'Tesbih';

  @override
  String get tasbeehResetTooltip => 'Sifirla';

  @override
  String get tasbeehTapToSwitch => 'Degistirmek icin etikete basin';

  @override
  String get tasbeehTapToCount => 'Saymak icin herhangi bir yere basin';

  @override
  String get tasbeehResetDialogTitle => 'Sayaci sifirla?';

  @override
  String get tasbeehResetDialogContent =>
      'Bu islem mevcut sayiyi sifira dusurur.';

  @override
  String get tasbeehCancel => 'Iptal';

  @override
  String get tasbeehReset => 'Sifirla';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Bugun: $count zikir';
  }

  @override
  String get tasbeehLast7Days => 'Son 7 gun';

  @override
  String get tasbeehNoHistory => 'Henuz gecmis yok, saymaya baslayin!';

  @override
  String tasbeehComplete(int count) {
    return 'Tesbih tamamlandi! $count zikir';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Akilli Ev';

  @override
  String get smartHomeSubtitle => 'Cihazlarinizi namaz vakitlerine baglayun';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Google\'a namaz vakitlerini ve kible yonunu sorun';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc => 'Alexa\'ya namaz vakitlerini sorun';

  @override
  String get smartHomeSiri => 'Siri Kisayollari';

  @override
  String get smartHomeSiriDesc =>
      'Namaz vakitleri icin ozel kisayollar olusturun';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Namaz vakitlerinde isiklari ve hatirlatmalari otomatiklestirin';

  @override
  String get smartHomeLinkAccount => 'Hesap Bagla';

  @override
  String get smartHomeLinked => 'Bagli';

  @override
  String get smartHomeUnlink => 'Baglantyi Kes';

  @override
  String get smartHomeSetupInstructions => 'Kurulum Talimatlari';

  @override
  String get smartHomeRequiresUmmatPlus => 'Ummat+ gerektirir';

  @override
  String get smartHomeTroubleshooting => 'Sorun Giderme';

  @override
  String get smartHomeTestConnection => 'Baglanti Testi';

  @override
  String get smartHomeConnectionSuccess => 'Basariyla baglandi';

  @override
  String get smartHomeConnectionFailed =>
      'Baglanti basarisiz. Hesap baglantinizi kontrol edin.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Premium namaz vakti ozellikleri';

  @override
  String get subscriptionUpgrade => 'Ummat+\'a yukselt';

  @override
  String get subscriptionRestore => 'Satin Almayi Geri Yukle';

  @override
  String get subscriptionManage => 'Aboneligi Yonet';

  @override
  String get subscriptionCancel => 'Aboneligi Iptal Et';

  @override
  String get subscriptionActive => 'Aktif';

  @override
  String get subscriptionExpired => 'Suresi dolmus';

  @override
  String get subscriptionFree => 'Ucretsiz';

  @override
  String get subscriptionFreeDesc => 'Temel namaz vakitleri, kible, takvim';

  @override
  String get subscriptionPlusDesc =>
      'Akilli ev, TV gorunumu, widget\'lar ve daha fazlasi';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count ucretsiz sorgu kaldi';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/yil';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/ay';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Akilli ev entegrasyonu';

  @override
  String get subscriptionFeatureTV => 'TV gorunum modu';

  @override
  String get subscriptionFeatureWidgets => 'Ana ekran widget\'lari';

  @override
  String get subscriptionFeatureWatch => 'Saat komplikasyonlari';

  @override
  String get subscriptionFeatureSync => 'Cihazlar arasi senkronizasyon';

  @override
  String get subscriptionFeatureAdFree => 'Reklamsiz deneyim';

  @override
  String get watchTitle => 'Saat';

  @override
  String get watchNextPrayer => 'Sonraki Namaz';

  @override
  String get watchAllPrayers => 'Tum Namazlar';

  @override
  String get watchComplication => 'Komplikasyon';

  @override
  String get nextPrayer => 'Sonraki namaz';

  @override
  String get allPrayers => 'Tum namazlar';

  @override
  String get today => 'Bugun';

  @override
  String get tomorrow => 'Yarin';

  @override
  String get thisWeek => 'Bu hafta';

  @override
  String get thisMonth => 'Bu ay';

  @override
  String get loginCreateAccount => 'Hesap Olustur';

  @override
  String get loginSignIn => 'Giris Yap';

  @override
  String get loginWelcomeBack => 'Tekrar hosgeldiniz';

  @override
  String get loginJoinPrayCalc => 'PrayCalc\'a katil';

  @override
  String get loginSyncSubtitle =>
      'Namaz verilerinizi cihazlar arasinda senkronize edin';

  @override
  String get loginContinueGoogle => 'Google ile devam et';

  @override
  String get loginOr => 'veya';

  @override
  String get loginSigningIn => 'Giris yapiliyor…';

  @override
  String get loginNameLabel => 'Gorunen ad (istege bagli)';

  @override
  String get loginEmailLabel => 'E-posta';

  @override
  String get loginPasswordLabel => 'Sifre';

  @override
  String get loginEmailRequired => 'E-posta gereklidir';

  @override
  String get loginEmailInvalid => 'Gecerli bir e-posta adresi girin';

  @override
  String get loginPasswordRequired => 'Sifre gereklidir';

  @override
  String get loginPasswordMinLength => 'Sifre en az 8 karakter olmalidir';

  @override
  String get loginForgotPassword => 'Sifremi unuttum?';

  @override
  String get loginEnterEmailFirst => 'Once e-posta adresinizi girin';

  @override
  String get loginResetSent => 'Sifre sifirlama e-postasi gonderildi';

  @override
  String get loginResetFailed => 'Sifirlama e-postasi gonderilemedi';

  @override
  String get loginNewToPrayCalc => 'PrayCalc\'ta yeni misiniz?';

  @override
  String get loginAlreadyHaveAccount => 'Zaten hesabiniz var mi?';

  @override
  String get accountTitle => 'Hesap';

  @override
  String get accountNotSignedIn => 'Giris yapilmadi';

  @override
  String get accountSyncSection => 'Senkronizasyon';

  @override
  String get accountSyncStatus => 'Senkronizasyon durumu';

  @override
  String get accountSyncNow => 'Simdi senkronize et';

  @override
  String get accountSyncHistory => 'Senkronizasyon gecmisi';

  @override
  String get accountNoConflicts => 'Catisma bulunamadi';

  @override
  String accountConflictsResolved(int count) {
    return '$count cozuldu';
  }

  @override
  String accountSyncedAgo(String time) {
    return '$time senkronize edildi';
  }

  @override
  String get accountOfflineStatus =>
      'Cevrimdisi. Degisiklikler yerel olarak kaydedildi.';

  @override
  String get accountSyncErrorStatus =>
      'Senkronizasyon hatasi. Yeniden denenecek.';

  @override
  String get accountDataSection => 'Veri';

  @override
  String get accountExportData => 'Veriyi disari aktar';

  @override
  String get accountExportSubtitle =>
      'Ayarlarinizi ve namaz kayitlarinizi indirin';

  @override
  String get accountExportFailed => 'Veri disari aktarilamadi';

  @override
  String get accountSignOutTitle => 'Cikis yap';

  @override
  String get accountSignOutBody =>
      'Yerel verileriniz korunacak. Senkronizasyona devam etmek icin tekrar giris yapin.';

  @override
  String get accountDeleteAccount => 'Hesabi sil';

  @override
  String get accountDeleteSubtitle =>
      'Hesabinizi ve verilerinizi kalici olarak silin';

  @override
  String get accountDeleteBody =>
      'Bu islem hesabinizi ve tum senkronize verileri kalici olarak silecektir. Bu cihazdaki yerel verileriniz silinmeyecektir.\n\nBu islem geri alinamaz.';

  @override
  String get accountDeleted => 'Hesap silindi';

  @override
  String get accountDeleteFailed => 'Hesap silinemedi';

  @override
  String get accountTimeJustNow => 'simdi';

  @override
  String accountTimeMinAgo(int min) {
    return '${min}dk once';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '${hour}sa once';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '${day}g once';
  }

  @override
  String get statsTitle => 'Namaz Istatistikleri';

  @override
  String get statsShareTooltip => 'Istatistikleri paylas';

  @override
  String get statsTodayPrayers => 'Bugunun Namazlari';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Seri';

  @override
  String get statsDays => 'gun';

  @override
  String get statsThisWeek => 'Bu Hafta';

  @override
  String get statsCompletion => 'tamamlama';

  @override
  String get statsThisMonth => 'Bu Ay';

  @override
  String get statsMostMissed => 'En Cok Kacirilan';

  @override
  String get statsThisWeekLabel => 'bu hafta';

  @override
  String get statsWeeklyChart => 'Namaza Gore Haftalik Tamamlama';

  @override
  String get statsMonthlyChart => 'Namaza Gore Aylik Tamamlama';

  @override
  String statsTotalLogged(int count) {
    return '$count toplam namaz kaydedildi';
  }

  @override
  String get statsKeepItUp => 'Boyle devam!';

  @override
  String get statsShareTitle => 'PrayCalc Namaz Istatistikleri';

  @override
  String statsShareStreak(int days) {
    return 'Seri: $days gun';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Haftalik: %$pct';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Aylik: %$pct';
  }

  @override
  String get statsShareBreakdown => 'Haftalik dagilim:';

  @override
  String get aboutTitle => 'PrayCalc Hakkinda';

  @override
  String get aboutWebsite => 'Web sitesi';

  @override
  String get aboutContact => 'Iletisim';

  @override
  String get aboutLicenses => 'Acik Kaynak Lisanslari';

  @override
  String get aboutCouldNotOpen => 'Baglanti acilamadi.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Tum haklari saklidir.\n\nNamaz vakitleri pray_calc_dart motoru kullanilarak hesaplanir. Dogruluk GPS konumunuza ve secilen hesaplama yontemine baglidir.';
  }

  @override
  String get commonCancel => 'Iptal';

  @override
  String get commonSave => 'Kaydet';

  @override
  String get commonDelete => 'Sil';

  @override
  String get commonEdit => 'Duzenle';

  @override
  String get commonRetry => 'Tekrar dene';

  @override
  String get commonClose => 'Kapat';

  @override
  String get commonDone => 'Tamam';

  @override
  String get commonBack => 'Geri';

  @override
  String get commonNext => 'Ileri';

  @override
  String get commonSkip => 'Atla';

  @override
  String get commonContinue => 'Devam';

  @override
  String get commonOk => 'Tamam';

  @override
  String get commonYes => 'Evet';

  @override
  String get commonNo => 'Hayir';

  @override
  String get commonShare => 'Paylas';

  @override
  String get commonCopy => 'Kopyala';

  @override
  String get commonCopied => 'Panoya kopyalandi';

  @override
  String get commonLoading => 'Yukleniyor...';

  @override
  String get commonError => 'Bir hata olustu';

  @override
  String get commonErrorRetry =>
      'Bir hata olustu. Tekrar denemek icin dokunun.';

  @override
  String get commonNoInternet => 'Internet baglantisi yok';

  @override
  String get commonOfflineMode => 'Cevrimdisi mod';

  @override
  String get commonSignIn => 'Giris yap';

  @override
  String get commonSignOut => 'Cikis yap';

  @override
  String get commonSignUp => 'Kayit ol';

  @override
  String get commonProfile => 'Profil';

  @override
  String get commonAccount => 'Hesap';

  @override
  String get commonAbout => 'Hakkinda';

  @override
  String commonVersion(String version) {
    return 'Surum $version';
  }

  @override
  String get commonPrivacyPolicy => 'Gizlilik Politikasi';

  @override
  String get commonTermsOfService => 'Kullanim Sartlari';

  @override
  String get commonRateApp => 'Uygulamayi degerlendir';

  @override
  String get commonFeedback => 'Geri bildirim gonder';

  @override
  String get commonHelp => 'Yardim';

  @override
  String get commonLanguage => 'Dil';

  @override
  String get commonOpenSettings => 'Ayarlari Ac';

  @override
  String get travelNotificationTitle => 'Şu anda seyahattesiniz';

  @override
  String get travelNotificationBody =>
      'Namaz vakitleri kısaltılabilir. Seyahat hükümleri hakkında bilgi almak için dokunun.';

  @override
  String get travelRulingsTitle => 'Seyahat ve Namaz';

  @override
  String get travelRulingsIntro =>
      'Seyahatte namaz hükümleri, Kur\'an ve sahih hadis koleksiyonlarından ilmi referanslarla.';

  @override
  String get travelWhenTitle => 'Seyahat Ne Zaman Geçerlidir?';

  @override
  String get travelQasrTitle => 'Namazları Kısaltma (Qasr)';

  @override
  String get travelJamTitle => 'Namazları Birleştirme (Cem)';

  @override
  String get travelDurationTitle => 'Seyahat Süresi';

  @override
  String get travelReferencesTitle => 'İlmi Referanslar';

  @override
  String get travelLearnMore => 'Daha fazla bilgi';

  @override
  String get travelHanafiDefaultTitle =>
      'PrayCalc Neden Hanefi Varsayilanini Kullanir';

  @override
  String get travelDeeperScholarly => 'Daha Derin Ilmi Tartisma';

  @override
  String get onboardingTitle1 => 'Nerede olursaniz olun namaz vakitleri';

  @override
  String get onboardingBody1 =>
      'Dunyadaki her sehir icin GPS hassasiyetinde namaz vakitleri. Fecrden Yatsiya, Gunesten Kiyama. Hassasiyet icin tasarlanmis kendi hesaplama motorumuzla.';

  @override
  String get onboardingTitle2 => 'Konumunuz, vakitleriniz';

  @override
  String get onboardingBody2 =>
      'Herhangi bir sehri arayin veya GPS konumunuzu tespit etsin. PrayCalc dunya capinda 5 milyon sehir icin vakitleri bulur.';

  @override
  String get onboardingTitle3 => 'Hicbir namazi kacirmayin';

  @override
  String get onboardingBody3 =>
      'Namaz vaktinde ezan, oncesinde hatirlatma. Sahur, dersler ve daha fazlasi icin ozel ajandalar.';

  @override
  String get onboardingTitle4 => 'Ihtiyaciniz olan her sey';

  @override
  String get onboardingBody4 =>
      'Kible pusulasi, namaz takvimi, Hicri ay safhasi, Tesbih sayaci. Hepsi tek yerde.';

  @override
  String get onboardingSkip => 'Atla';

  @override
  String get onboardingGetStarted => 'Basla';

  @override
  String get onboardingSignInTitle => 'PrayCalc\'a giris yapin';

  @override
  String get onboardingSignInSubtitle =>
      'Namaz gecmisinizi kaydedin ve\ntum cihazlarinizda senkronize edin.';

  @override
  String get onboardingContinueGoogle => 'Google ile devam et';

  @override
  String get onboardingContinueWithoutAccount => 'Hesapsiz devam et';

  @override
  String get onboardingSigningIn => 'Giris yapiliyor…';

  @override
  String get onboardingSelectLanguage => 'Dil Secin';

  @override
  String get duaDhikrTitle => 'Dua & Zikir';

  @override
  String get duaDhikrTabDua => 'Dua';

  @override
  String get duaDhikrTabDhikr => 'Zikir';

  @override
  String get duaDhikrTabTasbeeh => 'Tesbih';

  @override
  String get duaDhikrTabMorning => 'Sabah';

  @override
  String get duaDhikrTabEvening => 'Aksam';

  @override
  String get duaDhikrMorningAdhkar => 'Sabah Ezkarları';

  @override
  String get duaDhikrEveningAdhkar => 'Aksam Ezkarları';

  @override
  String get calGregToggle => 'Miladi';

  @override
  String get calHijriToggle => 'Hicri';

  @override
  String get calYearlyTooltip => 'Yıllık takvim';

  @override
  String get calExportIcsTooltip => '.ics dışa aktar';

  @override
  String get calMagCol => 'Akş';

  @override
  String get qiblaShowOnMap => 'Haritada göster';

  @override
  String get qiblaWaitingCompass => 'Pusula bekleniyor...';

  @override
  String get qiblaNoCompassSensor =>
      'Pusula sensörü yok. Kıble yönü statik gösteriliyor.';

  @override
  String get qiblaAccuracyExcellent => 'Mükemmel doğruluk';

  @override
  String get qiblaAccuracyGood => 'İyi doğruluk';

  @override
  String get qiblaAccuracyFair =>
      'Orta doğruluk. Telefonu 8 şeklinde hareket ettirerek kalibre edin.';

  @override
  String get qiblaAccuracyLow =>
      'Düşük doğruluk. Telefonu 8 şeklinde hareket ettirerek kalibre edin.';

  @override
  String get qiblaToTheKaaba => 'Kabe\'ye';

  @override
  String get qiblaYourLocation => 'Konumunuz';

  @override
  String get qiblaGpsAccurate => 'GPS hassas';

  @override
  String get qiblaCityCenter => 'Şehir merkezi';

  @override
  String get moonIlluminatedLabel => 'Aydınlık';

  @override
  String get moonAgeLabel => 'Yaş';

  @override
  String get moonFirstQtr => 'İlk Dördün';

  @override
  String get moonLastQtr => 'Son Dördün';

  @override
  String get moonTonight => 'Bu gece';

  @override
  String get moonTomorrow => 'Yarın';

  @override
  String moonDaysAway(int days) {
    return '${days}g';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Ev Konumunu Ayarla';

  @override
  String get setHomeSearchHint => 'Şehir, kasaba veya posta kodu ara…';

  @override
  String get setHomeClear => 'Temizle';

  @override
  String get setHomeUseCurrentLocation => 'Mevcut Konumu Kullan';

  @override
  String get setHomeDetectAndSet =>
      'Konumunuzu tespit edip ev olarak ayarlayın';

  @override
  String get setHomeAlreadySet => 'Ev zaten ayarlanmış';

  @override
  String setHomeSetAs(String city) {
    return '$city ev olarak ayarlandı';
  }

  @override
  String get setHomeCurrentLocationSet => 'Mevcut konum ev olarak ayarlandı';

  @override
  String get setHomePermissionDenied =>
      'Konum izni reddedildi. Aşağıdan şehir arayın.';

  @override
  String get setHomeGpsUnavailable => 'GPS kullanılamıyor. Manuel arayın.';

  @override
  String get setHomeNoCitiesFound => 'Şehir bulunamadı.';

  @override
  String get setHomeSearchPrompt => 'Ev şehrinizi arayın';

  @override
  String get setHomeSearchBody =>
      'Aramak için yukarı yazın veya mevcut konumunuzu kullanın. Seyahat modu evden uzakta olduğunuzu algılar.';

  @override
  String get subscriptionYouHavePlus => 'Ummat+ abonesiniz';

  @override
  String get subscriptionUpgradeTo => 'Ummat+\'a yükseltin';

  @override
  String get subscriptionThankYou =>
      'PrayCalc\'ı desteklediğiniz için teşekkürler.';

  @override
  String get subscriptionUnlockPremium =>
      'Tüm cihazlarınızda premium özelliklerin kilidini açın.';

  @override
  String get subscriptionManageSub => 'Aboneliği yönet';

  @override
  String get subscriptionWelcome => 'Ummat+\'a hoş geldiniz!';

  @override
  String get subscriptionSubscribe => 'Abone ol';

  @override
  String get subscriptionFreeFeatures => 'Ücretsiz Özellikler';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ Özellikleri';

  @override
  String get subscriptionFeaturePrayerTimes => 'Namaz vakitleri';

  @override
  String get subscriptionFeatureQibla => 'Kıble pusulası';

  @override
  String get subscriptionFeatureCalendar => 'Aylık takvim';

  @override
  String get subscriptionFeatureTasbeeh => 'Tesbih sayacı';

  @override
  String get subscriptionFeatureMoon => 'Ay & Hicri';

  @override
  String get smartHomeAlertType => 'Uyarı Türü';

  @override
  String get smartHomeAlertModal => 'Tam ekran pencere';

  @override
  String get smartHomeAlertCorner => 'Köşe bildirimi';

  @override
  String get smartHomeAlertNone => 'Yok (sessiz)';

  @override
  String get smartHomePauseMedia => 'Ezan sırasında medyayı duraklat';

  @override
  String get smartHomeQuietHours => 'Sessiz saatler';

  @override
  String get smartHomeQuietFrom => 'Başlangıç';

  @override
  String get smartHomeQuietTo => 'Bitiş';

  @override
  String get smartHomePrayerAudio => 'Namaz başına ses';

  @override
  String get smartHomeAudioAdhan => 'Ezan';

  @override
  String get smartHomeAudioBeep => 'Bip';

  @override
  String get smartHomeAudioSilent => 'Sessiz';

  @override
  String get aboutPrivacy => 'Gizlilik Politikası';

  @override
  String aboutVersion(String version) {
    return 'Sürüm $version';
  }

  @override
  String get notifDefaultAdhan => 'Varsayılan Ezan';

  @override
  String get notifFajrAdhan => 'Fecir Ezanı';

  @override
  String get notifFajrAdhanSubtitle => 'Fecir namaz vaktinde çalar';

  @override
  String get notifRegularAdhan => 'Normal Ezan';

  @override
  String get notifRegularAdhanSubtitle =>
      'Öğle, İkindi, Akşam, Yatsı\'da çalar';

  @override
  String get notifPerPrayerSettings => 'Namaz Başına Ayarlar';

  @override
  String get notifPreview => 'Önizleme';

  @override
  String get tvSettingsTitle => 'TV Ayarları';

  @override
  String get tvDisplayMode => 'Görüntü Modu';

  @override
  String get tvMasjidMode => 'Cami Modu';

  @override
  String get tvMasjidModeSubtitle => 'İkamet vakitli büyük tabela gösterimi';

  @override
  String get tvMasjidName => 'Cami Adı';

  @override
  String get tvMasjidNameTapToSet => 'Ayarlamak için dokunun';

  @override
  String get tvClock => 'Saat';

  @override
  String get tv24hFormat => '24 saat formatı';

  @override
  String get tvIqamahOffsets => 'İkamet Farkları (ezandan sonra dakika)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'Ezandan $offset dk sonra';
  }

  @override
  String get tvQrCode => 'QR Kodu';

  @override
  String get tvShowQrCode => 'QR Kodu Göster';

  @override
  String get tvShowQrCodeSubtitle => 'Cami ekranında QR kodu göster';

  @override
  String get tvQrCodeUrl => 'QR Kodu URL\'si';

  @override
  String get tvAmbientModeSection => 'Ortam Modu';

  @override
  String get tvIdleTimeout => 'Boşta kalma süresi';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'Ortam modu etkinleşmeden önce $minutes dakika';
  }

  @override
  String get tvPhotoInterval => 'Fotoğraf aralığı';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'Fotoğraflar arası $seconds saniye';
  }

  @override
  String get tvBackground => 'Arka plan';

  @override
  String get tvPhotoCategory => 'Fotoğraf kategorisi';

  @override
  String get tvLocation => 'Konum';

  @override
  String get tvChangeCity => 'Şehri Değiştir';

  @override
  String get tvChangeCitySubtitle => 'Farklı bir şehir arayın';

  @override
  String get tvScreensaverBg => 'Ekran Koruyucu Arka Planı';

  @override
  String get tvScreensaverPhotos => 'Fotoğraflar';

  @override
  String get tvScreensaverPattern => 'Geometrik desen';

  @override
  String get tvScreensaverBoth => 'Fotoğraflar + desen';

  @override
  String get tvCategoryAll => 'Tüm kategoriler';

  @override
  String get tvCategoryMasjids => 'Camiler';

  @override
  String get tvCategoryInteriors => 'İç mekanlar';

  @override
  String get tvCategoryGeometric => 'Geometrik';

  @override
  String get tvCategoryCalligraphy => 'Hat sanatı';

  @override
  String get tvCategoryLandscapes => 'Manzaralar';

  @override
  String get tvCategoryRamadan => 'Ramazan';

  @override
  String get tvPhotoCategoryTitle => 'Fotoğraf Kategorisi';

  @override
  String tvEnterHint(String title) {
    return '$title girin';
  }

  @override
  String get tvSystemDefault => 'Sistem varsayılanı';

  @override
  String get smartHomeIntegrations => 'Entegrasyonlar';

  @override
  String get smartHomeLinkedSpeakers => 'Bağlı Hoparlörler ve Ekranlar';

  @override
  String get smartHomeAlertDisplay => 'Uyarı Gösterimi';

  @override
  String get smartHomeAtAdhanShow => 'Ezan vaktinde göster';

  @override
  String get smartHomePauseMediaTitle => 'Ezanda medyayı duraklat';

  @override
  String get smartHomePauseMediaSubtitle => 'Ezan bittikten sonra devam eder';

  @override
  String get smartHomePrayerAudioSection => 'Namaz Sesi';

  @override
  String get smartHomeQuietHoursSection => 'Sessiz Saatler';

  @override
  String get smartHomeEnableQuietHours => 'Sessiz saatleri etkinleştir';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Tüm akıllı ev uyarıları susturulur';

  @override
  String get smartHomeNoDevices => 'Henüz bağlı cihaz yok';

  @override
  String get smartHomeNoDevicesDesc =>
      'Yukarıdan Google Home veya Alexa bağlayın, ardından hoparlörleriniz ve ekranlarınız burada görünecektir.';

  @override
  String get smartHomeRequiresPlus => 'Akıllı Ev için Ummat+ gereklidir';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Google Home, Alexa, Siri ve Home Assistant üzerinden namaz duyurularını yönetin. Hangi cihazların ezan çalacağını, medya duraklatmayı ve sessiz saatleri ayarlayın.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Nest hoparlör ve ekranlarında ezan yayınlayın.';

  @override
  String get smartHomeEnableAlexa =>
      'Alexa\'da PrayCalc becerisini etkinleştirin.';

  @override
  String get smartHomeSiriAsk =>
      'Siri\'den namaz vakitlerini sorun veya otomasyon kurun.';

  @override
  String get smartHomeHassAdd =>
      'Tam otomasyon desteği için HACS üzerinden ekleyin.';

  @override
  String get smartHomeSetupGuide => 'Kurulum rehberi';

  @override
  String get smartHomeSiriSetupTitle => 'Siri Kısayolları Kurulumu';

  @override
  String get smartHomeSiriStep1 =>
      'iPhone veya iPad\'inizde Kısayollar uygulamasını açın.';

  @override
  String get smartHomeSiriStep2 =>
      'Yeni kısayol oluşturmak için \"+\" düğmesine dokunun.';

  @override
  String get smartHomeSiriStep3 => 'Eylemler listesinde \"PrayCalc\" arayın.';

  @override
  String get smartHomeSiriStep4 =>
      '\"Sonraki Namaz Vakti\" veya \"Bugünün Namaz Vakitleri\" ekleyin.';

  @override
  String get smartHomeSiriStep5 =>
      'İsteğe bağlı olarak bir otomasyona ekleyin (ör. her gün Fecir\'de).';

  @override
  String get smartHomeSiriStep6 =>
      'Test etmek için \"Hey Siri, sonraki namaz vakti\" deyin.';

  @override
  String get smartHomeSiriFootnote => 'iOS 16 veya üstü gerektirir.';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant Kurulumu';

  @override
  String get smartHomeHassStep1 =>
      'HACS\'ı (Home Assistant Topluluk Mağazası) kurun.';

  @override
  String get smartHomeHassStep2 => 'HACS\'ta \"PrayCalc\" arayın ve kurun.';

  @override
  String get smartHomeHassStep3 =>
      'Ayarlar > Cihazlar & Hizmetler > Entegrasyon Ekle\'ye gidin.';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" arayın ve seçin.';

  @override
  String get smartHomeHassStep5 =>
      'PrayCalc API anahtarınızı girin (hesabınızda oluşturulur).';

  @override
  String get smartHomeHassStep6 =>
      'Konumunuzu ve hesaplama yönteminizi yapılandırın.';

  @override
  String get smartHomeHassFootnote =>
      'HACS ile Home Assistant 2024.1+ gerektirir.';

  @override
  String get smartHomeApiKey => 'API Anahtarı';

  @override
  String get smartHomeGenerateApiKey => 'API Anahtarı Oluştur';

  @override
  String get smartHomeApiKeyNotReady =>
      'PrayCalc akıllı hizmeti dağıtıldığında API anahtarı oluşturma kullanılabilir olacak.';

  @override
  String get smartHomeApiKeyDesc =>
      'Home Assistant\'ı PrayCalc hesabınıza bağlamak için API anahtarına ihtiyacınız olacak.';

  @override
  String get smartHomeLinkedStatus => 'Bağlı';

  @override
  String get smartHomeNotLinkedStatus => 'Bağlı değil';

  @override
  String get smartHomeCouldNotOpen => 'Bağlantı açılamadı.';

  @override
  String get smartHomeDevices => 'Cihazlar';

  @override
  String get smartHomeAddDevice => 'Cihaz Ekle';

  @override
  String get smartHomeDeleteDevice => 'Sil';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Bu cihazı kaldır?';

  @override
  String get smartHomeDeviceOnline => 'Çevrimiçi';

  @override
  String get smartHomeDeviceOffline => 'Çevrimdışı';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Son görülme: $time';
  }

  @override
  String get smartHomeDeviceName => 'Cihaz adı';

  @override
  String get smartHomeDeviceType => 'Cihaz türü';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Hoparlör';

  @override
  String get smartHomeDeviceTypeWatch => 'Saat';

  @override
  String get smartHomeDeviceTypeDesktop => 'Masaüstü';

  @override
  String get smartHomeDeviceTypeOther => 'Diğer';

  @override
  String get smartHomeDeviceAdhan => 'Ezan bildirimleri';

  @override
  String get smartHomeDeviceAdhanDesc => 'Bu cihazda ezan uyarıları al';

  @override
  String get smartHomeDeviceVolume => 'Ses düzeyi';

  @override
  String get smartHomeDeviceAudioType => 'Ses türü';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Etkin namazlar';

  @override
  String get smartHomeDeviceSettings => 'Cihaz Ayarları';

  @override
  String get smartHomeTesting => 'Test ediliyor...';

  @override
  String get smartHomeTestSuccess => 'Bağlantı doğrulandı';

  @override
  String get smartHomeTestFailed => 'Bağlantı testi başarısız';

  @override
  String get smartHomePairTv => 'TV Eşleştir';

  @override
  String get smartHomePairingTv => 'TV kaydediliyor...';

  @override
  String get smartHomePairTvSuccess => 'TV başarıyla eşleştirildi';

  @override
  String get smartHomePairTvFailed => 'TV eşleştirme başarısız';

  @override
  String get smartHomeLoadingDevices => 'Cihazlar yükleniyor...';

  @override
  String get smartHomeLoadingIntegrations => 'Entegrasyonlar yükleniyor...';

  @override
  String get smartHomeServiceUnavailable =>
      'Akıllı ev hizmeti şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total tamamlandı';
  }

  @override
  String get adhkarReset => 'Sıfırla';

  @override
  String get syncHistoryTitle => 'Senkronizasyon Geçmişi';

  @override
  String get syncClearHistory => 'Geçmişi temizle';

  @override
  String get syncNoConflicts =>
      'Senkronizasyon çatışması yok. Tüm cihazlar eşitlenmiş.';

  @override
  String get syncDomainSettings => 'Ayarlar';

  @override
  String get syncDomainCities => 'Kayıtlı Şehirler';

  @override
  String get syncDomainPrayerLogs => 'Namaz Kayıtları';

  @override
  String get syncTimeJustNow => 'şimdi';

  @override
  String syncTimeMinAgo(int min) {
    return '${min}dk önce';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '${hour}sa önce';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '${day}g önce';
  }

  @override
  String get pinCity => 'Sabitle';

  @override
  String get pinMaxReached =>
      'En fazla 5 sabitlenmiş şehir. Daha fazlası için Ummat+\'a yükseltin.';

  @override
  String pinCityUnpinned(String city) {
    return '$city sabitlemesi kaldırıldı';
  }

  @override
  String get pinUndo => 'Geri al';
}
