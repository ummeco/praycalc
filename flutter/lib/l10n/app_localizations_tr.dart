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
  String get settingsTitle => 'Ayarlar';

  @override
  String get settingsSectionPrayerCalc => 'Namaz Hesaplama';

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
  String get tvTitle => 'TV Gorunumu';

  @override
  String get tvMasjidMode => 'Cami Modu';

  @override
  String get tvAmbientMode => 'Ortam Modu';

  @override
  String get tvSettingsIqamah => 'Ikamet Farklari';

  @override
  String get tvSettingsAnnouncements => 'Duyurular';

  @override
  String get tvConnectQR => 'Baglanmak icin tarayin';

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
