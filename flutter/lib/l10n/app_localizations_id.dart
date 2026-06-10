// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Indonesian (`id`).
class AppLocalizationsId extends AppLocalizations {
  AppLocalizationsId([String locale = 'id']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Subuh';

  @override
  String get prayerSunrise => 'Terbit';

  @override
  String get prayerDhuhr => 'Dzuhur';

  @override
  String get prayerAsr => 'Ashar';

  @override
  String get prayerMaghrib => 'Maghrib';

  @override
  String get prayerIsha => 'Isya';

  @override
  String get prayerQiyam => 'Qiyamul Lail';

  @override
  String get prayerSuhoor => 'Sahur';

  @override
  String get prayerIftar => 'Iftar';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabiul Awal';

  @override
  String get hijriRabiAlThani => 'Rabiul Akhir';

  @override
  String get hijriJumadaAlAwwal => 'Jumadil Awal';

  @override
  String get hijriJumadaAlThani => 'Jumadil Akhir';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Sya\'ban';

  @override
  String get hijriRamadan => 'Ramadan';

  @override
  String get hijriShawwal => 'Syawal';

  @override
  String get hijriDhulQidah => 'Dzulqa\'dah';

  @override
  String get hijriDhulHijjah => 'Dzulhijjah';

  @override
  String get monthJan => 'Jan';

  @override
  String get monthFeb => 'Feb';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Apr';

  @override
  String get monthMay => 'Mei';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Agt';

  @override
  String get monthSep => 'Sep';

  @override
  String get monthOct => 'Okt';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Des';

  @override
  String get monthJanuary => 'Januari';

  @override
  String get monthFebruary => 'Februari';

  @override
  String get monthMarch => 'Maret';

  @override
  String get monthApril => 'April';

  @override
  String get monthMayFull => 'Mei';

  @override
  String get monthJune => 'Juni';

  @override
  String get monthJuly => 'Juli';

  @override
  String get monthAugust => 'Agustus';

  @override
  String get monthSeptember => 'September';

  @override
  String get monthOctober => 'Oktober';

  @override
  String get monthNovember => 'November';

  @override
  String get monthDecember => 'Desember';

  @override
  String get dayMonShort => 'Sen';

  @override
  String get dayTueShort => 'Sel';

  @override
  String get dayWedShort => 'Rab';

  @override
  String get dayThuShort => 'Kam';

  @override
  String get dayFriShort => 'Jum';

  @override
  String get daySatShort => 'Sab';

  @override
  String get daySunShort => 'Min';

  @override
  String get dayMonday => 'Senin';

  @override
  String get dayTuesday => 'Selasa';

  @override
  String get dayWednesday => 'Rabu';

  @override
  String get dayThursday => 'Kamis';

  @override
  String get dayFriday => 'Jumat';

  @override
  String get daySaturday => 'Sabtu';

  @override
  String get daySunday => 'Minggu';

  @override
  String get daySuChart => 'Mi';

  @override
  String get dayMoChart => 'Se';

  @override
  String get dayTuChart => 'Sl';

  @override
  String get dayWeChart => 'Ra';

  @override
  String get dayThChart => 'Ka';

  @override
  String get dayFrChart => 'Ju';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Pilih kota';

  @override
  String get setCityFab => 'Atur kota';

  @override
  String prayerTimesError(Object error) {
    return 'Tidak dapat menghitung waktu sholat.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer dalam';
  }

  @override
  String get ramadanMubarak => 'Ramadan Mubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Hari $day / 30';
  }

  @override
  String get lastTenNights => '10 Malam Terakhir';

  @override
  String get laylatulQadr => 'Lailatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'M';

  @override
  String get homeNoCitySelected => 'Belum ada kota dipilih';

  @override
  String get homeNoCityHint =>
      'Ketuk di atas untuk mencari kota atau aktifkan GPS.';

  @override
  String get homeCouldNotCalc => 'Tidak dapat menghitung waktu sholat.';

  @override
  String get homeQasr => 'Qasar';

  @override
  String get homeActionMonthlyTimes => 'Jadwal\nBulanan';

  @override
  String get homeActionDuaDhikr => 'Doa &\nDzikir';

  @override
  String get homeActionPrayerStats => 'Statistik\nSholat';

  @override
  String homePolarBanner(int count) {
    return '$count waktu sholat tidak dapat dihitung untuk lokasi Anda selama periode ini (matahari tengah malam / malam kutub). Coba estimasi lintang terdekat di pengaturan.';
  }

  @override
  String get settingsTitle => 'Pengaturan';

  @override
  String get settingsSectionPrayerCalc => 'Perhitungan Sholat';

  @override
  String get settingsCalcMethod => 'Metode Perhitungan';

  @override
  String get settingsCalcMethodAuto => 'Otomatis (Dinamis)';

  @override
  String get settingsHanafiAsr => 'Ashar Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Faktor bayangan 2x (waktu Ashar lebih lambat)';

  @override
  String get settingsSectionDisplay => 'Tampilan';

  @override
  String get settings24hClock => 'Format 24 jam';

  @override
  String get settingsFollowSystemTheme => 'Ikuti tema sistem';

  @override
  String get settingsDarkMode => 'Mode gelap';

  @override
  String get settingsSectionNotifications => 'Notifikasi';

  @override
  String get settingsPrayerNotifications => 'Notifikasi sholat';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adzan, pengingat, dan pengaturan per sholat';

  @override
  String get settingsPrayerAgendas => 'Agenda sholat';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Pengingat khusus dari waktu sholat';

  @override
  String get settingsAccount => 'Akun';

  @override
  String get settingsSignInToSync => 'Masuk untuk sinkronisasi';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Simpan data Anda di semua perangkat';

  @override
  String get settingsHomeScreen => 'Layar Utama';

  @override
  String get settingsSkyGradient => 'Latar gradien langit';

  @override
  String get settingsSkyGradientSubtitle =>
      'Warna langit animasi sesuai waktu hari';

  @override
  String get settingsWeatherGradient => 'Gradien cuaca';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Sesuaikan warna langit berdasarkan cuaca lokal';

  @override
  String get settingsCountdownAnimation => 'Animasi hitung mundur';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Cincin bernapas pada hitung mundur sholat berikutnya';

  @override
  String get settingsPrayerTracking => 'Pelacakan Sholat';

  @override
  String get settingsTrackMyPrayers => 'Lacak sholat saya';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Catat sholat yang Anda tunaikan setiap hari';

  @override
  String get settingsPrayerStats => 'Statistik sholat';

  @override
  String get settingsPrayerStatsSubtitle => 'Seri, grafik mingguan dan bulanan';

  @override
  String get settingsJumuahKahf => 'Pengingat Jumat Al-Kahfi';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Pengingat hari Jumat untuk membaca Surah Al-Kahfi';

  @override
  String get settingsTravel => 'Perjalanan';

  @override
  String get settingsTravelMode => 'Mode perjalanan';

  @override
  String get settingsTravelModeSubtitle =>
      'Deteksi otomatis saat jauh dari rumah dan sesuaikan sholat';

  @override
  String get settingsHomeLocation => 'Lokasi rumah';

  @override
  String get settingsHomeLocationNotSet =>
      'Belum diatur — ketuk untuk menggunakan lokasi saat ini';

  @override
  String get settingsClearHomeLocation => 'Hapus lokasi rumah';

  @override
  String get settingsTravelRulings => 'Hukum sholat perjalanan';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasar, jamak, dan panduan musafir';

  @override
  String get settingsSmartHome => 'Smart Home';

  @override
  String get settingsSmartHomeIntegrations => 'Integrasi smart home';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Tampilan TV';

  @override
  String get settingsTvHome => 'Tampilan utama TV';

  @override
  String get settingsTvHomeSubtitle => 'Jam sholat layar penuh untuk TV';

  @override
  String get settingsMasjidDisplay => 'Tampilan masjid';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Tabel adzan/iqamah untuk layar masjid';

  @override
  String get settingsTvSettings => 'Pengaturan TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Mode masjid, offset iqamah, ambient';

  @override
  String get settingsAboutPrayCalc => 'Tentang PrayCalc';

  @override
  String get syncSynced => 'Tersinkronisasi';

  @override
  String get syncSyncing => 'Menyinkronkan...';

  @override
  String get syncOffline => 'Offline';

  @override
  String get syncError => 'Kesalahan sinkronisasi';

  @override
  String get notifSettingsTitle => 'Notifikasi & Adzan';

  @override
  String get notifAdhanLabel => 'Adzan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Pengingat: $minutes menit sebelum';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Volume: $pct%';
  }

  @override
  String get notifTestAdhan => 'Tes adzan';

  @override
  String get notifModeOff => 'Mati';

  @override
  String get notifModeReminderOnly => 'Pengingat saja';

  @override
  String get notifModeArrival => 'Saat waktu sholat';

  @override
  String get notifModeBoth => 'Pengingat + waktu sholat';

  @override
  String get citySearchHint => 'Cari kota…';

  @override
  String get citySearchDetectTooltip => 'Deteksi lokasi saya';

  @override
  String get citySearchNoCityGps => 'Tidak dapat mendeteksi kota dari GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Izin lokasi ditolak. Cari secara manual.';

  @override
  String get citySearchNoResults => 'Tidak ada kota ditemukan.';

  @override
  String get citySearchStartTyping => 'Mulai ketik untuk mencari…';

  @override
  String get agendasTitle => 'Agenda Sholat';

  @override
  String get agendasEmpty =>
      'Belum ada agenda.\nKetuk + untuk menambahkan pengingat terkait sholat Anda.';

  @override
  String get agendasUndo => 'Batalkan';

  @override
  String agendasRemoved(String label) {
    return '$label dihapus';
  }

  @override
  String get agendaNewTitle => 'Agenda Baru';

  @override
  String get agendaEditTitle => 'Edit Agenda';

  @override
  String get agendaSave => 'Simpan';

  @override
  String get agendaLabelEmpty => 'Label tidak boleh kosong';

  @override
  String get agendaLabelField => 'Label';

  @override
  String get agendaLabelHint => 'mis. Bangun untuk Subuh';

  @override
  String get agendaPrayerSection => 'Sholat';

  @override
  String get agendaTimeOffsetSection => 'Offset waktu';

  @override
  String get agendaOffsetAtPrayerTime => 'Saat waktu sholat';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes menit sebelum';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes menit sesudah';
  }

  @override
  String get agendaRepeatSection => 'Ulangi';

  @override
  String get agendaNotifTypeSection => 'Jenis notifikasi';

  @override
  String get agendaNotifSilent => 'Senyap';

  @override
  String get agendaNotifSound => 'Suara';

  @override
  String get agendaNotifVibrate => 'Getar';

  @override
  String get agendaDayM => 'S';

  @override
  String get agendaDayT => 'S';

  @override
  String get agendaDayW => 'R';

  @override
  String get agendaDayF => 'J';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Bulan & Kalender Hijriah';

  @override
  String moonIlluminated(int pct) {
    return '$pct% terang';
  }

  @override
  String get moonFullTonight => 'Bulan purnama malam ini!';

  @override
  String get moonNextTomorrow => 'Bulan purnama berikutnya besok';

  @override
  String moonNextDays(int days) {
    return 'Bulan purnama berikutnya dalam $days hari';
  }

  @override
  String moonAge(String age) {
    return 'Usia bulan: $age hari';
  }

  @override
  String get moonPhaseNewMoon => 'Bulan Baru';

  @override
  String get moonPhaseWaxingCrescent => 'Sabit Awal';

  @override
  String get moonPhaseFirstQuarter => 'Kuartal Pertama';

  @override
  String get moonPhaseWaxingGibbous => 'Cembung Awal';

  @override
  String get moonPhaseFullMoon => 'Bulan Purnama';

  @override
  String get moonPhaseWaningGibbous => 'Cembung Akhir';

  @override
  String get moonPhaseLastQuarter => 'Kuartal Terakhir';

  @override
  String get moonPhaseWaningCrescent => 'Sabit Akhir';

  @override
  String get moonHilalVisibility => 'Visibilitas Hilal Berikutnya';

  @override
  String get moonRegionMiddleEast => 'Timur Tengah';

  @override
  String get moonRegionWestAfrica => 'Afrika Barat';

  @override
  String get moonRegionSouthAsia => 'Asia Selatan';

  @override
  String get moonRegionEurope => 'Eropa';

  @override
  String get moonRegionAmericas => 'Amerika';

  @override
  String get moonVisible => 'Terlihat';

  @override
  String get moonNotVisible => 'Tidak Terlihat';

  @override
  String get moonPossible => 'Mungkin';

  @override
  String get moonUpcomingDates => 'Tanggal Islam Mendatang';

  @override
  String get hijriTodayLabel => 'Hari ini di Kalender Hijriah';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year H dimulai';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days hari lagi';
  }

  @override
  String get moonLunarCycle => 'Siklus Bulan';

  @override
  String moonDayOfCycle(int day) {
    return 'Hari $day dari ~29,5';
  }

  @override
  String get moonHilalSightingForecast => 'Prakiraan Pengamatan Hilal';

  @override
  String get moonHilalVisibilityMap => 'Peta Visibilitas Hilal';

  @override
  String moonDayN(int day) {
    return 'Hari $day';
  }

  @override
  String get moonGlobalSighting => 'Pengamatan Global';

  @override
  String get moonZoneNakedEye => 'Mata Telanjang';

  @override
  String get moonZoneBinoculars => 'Teropong';

  @override
  String get moonZoneVeryDifficult => 'Sangat Sulit';

  @override
  String get moonZoneNotVisible => 'Tidak Terlihat';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H kemungkinan 29 hari. Hilal diperkirakan terlihat pada hari ke-29, in sya Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H kemungkinan 30 hari. Hilal tidak mungkin terlihat pada hari ke-29. Bulan akan genap 30 hari.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Arab Saudi';

  @override
  String get moonFCNACalc => 'FCNA / Hitung';

  @override
  String get moonNorthAmerica => 'Amerika Utara';

  @override
  String moonNDays(int days) {
    return '$days hari';
  }

  @override
  String moonStarts(String month) {
    return '$month dimulai:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Usia bulan saat matahari terbenam: $hours j';
  }

  @override
  String get moon7DayLunarCalendar => 'Kalender Bulan 7 Hari';

  @override
  String get moonUpcomingIslamicEvents => 'Peristiwa Islam Mendatang';

  @override
  String get moonTodayLabel => 'Hari ini';

  @override
  String get moonTomorrowLabel => 'Besok';

  @override
  String get calDateCol => 'Tanggal';

  @override
  String get calHijriCol => 'Hijriah';

  @override
  String get calFajrCol => 'Subuh';

  @override
  String get calSunriseCol => 'Terbit';

  @override
  String get calDhuhrCol => 'Dzuhur';

  @override
  String get calAsrCol => 'Ashar';

  @override
  String get calMaghribCol => 'Maghrib';

  @override
  String get calIshaCol => 'Isya';

  @override
  String get calNoCityText =>
      'Atur kota Anda terlebih dahulu\nuntuk melihat kalender sholat.';

  @override
  String get calShareTooltip => 'Bagikan kalender';

  @override
  String get calPrevMonthTooltip => 'Bulan sebelumnya';

  @override
  String get calNextMonthTooltip => 'Bulan berikutnya';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Waktu Sholat — $month';
  }

  @override
  String get qiblaTitle => 'Kiblat';

  @override
  String get qiblaSwitchToCompass => 'Beralih ke kompas';

  @override
  String get qiblaSwitchToAR => 'Beralih ke kamera AR';

  @override
  String get qiblaNoCityText =>
      'Atur kota Anda terlebih dahulu\nuntuk menghitung arah kiblat.';

  @override
  String get qiblaCompassUnavailable =>
      'Sensor kompas tidak tersedia di perangkat ini.';

  @override
  String get qiblaCalibrate =>
      'Kalibrasi: gerakkan ponsel Anda membentuk angka 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° dari Utara';
  }

  @override
  String qiblaFrom(String city) {
    return 'Dari $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km dari Ka\'bah';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km dari Ka\'bah';
  }

  @override
  String get qiblaFacingQibla => 'Menghadap Kiblat ✓';

  @override
  String get tasbeehTitle => 'Tasbih';

  @override
  String get tasbeehResetTooltip => 'Reset';

  @override
  String get tasbeehTapToSwitch => 'Ketuk label untuk beralih';

  @override
  String get tasbeehTapToCount => 'Ketuk di mana saja untuk menghitung';

  @override
  String get tasbeehResetDialogTitle => 'Reset penghitung?';

  @override
  String get tasbeehResetDialogContent =>
      'Ini akan mengatur ulang hitungan ke nol.';

  @override
  String get tasbeehCancel => 'Batal';

  @override
  String get tasbeehReset => 'Reset';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Hari ini: $count dzikir';
  }

  @override
  String get tasbeehLast7Days => '7 hari terakhir';

  @override
  String get tasbeehNoHistory => 'Belum ada riwayat — mulai menghitung!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih selesai! $count dzikir';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Smart Home';

  @override
  String get smartHomeSubtitle => 'Hubungkan perangkat Anda ke waktu sholat';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Tanya Google tentang waktu sholat dan arah kiblat';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Tanya Alexa tentang waktu sholat, sholat berikutnya, dan lainnya';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc => 'Buat pintasan kustom untuk waktu sholat';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Otomatiskan lampu, tampilan, dan pengingat saat waktu sholat';

  @override
  String get smartHomeLinkAccount => 'Hubungkan Akun';

  @override
  String get smartHomeLinked => 'Terhubung';

  @override
  String get smartHomeUnlink => 'Putuskan';

  @override
  String get smartHomeSetupInstructions => 'Petunjuk Pengaturan';

  @override
  String get smartHomeRequiresUmmatPlus => 'Memerlukan Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Pemecahan Masalah';

  @override
  String get smartHomeTestConnection => 'Tes Koneksi';

  @override
  String get smartHomeConnectionSuccess => 'Berhasil terhubung';

  @override
  String get smartHomeConnectionFailed =>
      'Koneksi gagal. Periksa hubungan akun Anda.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Fitur premium waktu sholat';

  @override
  String get subscriptionUpgrade => 'Upgrade ke Ummat+';

  @override
  String get subscriptionRestore => 'Pulihkan Pembelian';

  @override
  String get subscriptionManage => 'Kelola Langganan';

  @override
  String get subscriptionCancel => 'Batalkan Langganan';

  @override
  String get subscriptionActive => 'Aktif';

  @override
  String get subscriptionExpired => 'Kedaluwarsa';

  @override
  String get subscriptionFree => 'Gratis';

  @override
  String get subscriptionFreeDesc => 'Waktu sholat dasar, kiblat, kalender';

  @override
  String get subscriptionPlusDesc =>
      'Smart home, tampilan TV, widget, dan lainnya';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count pertanyaan gratis tersisa';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/tahun';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/bulan';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Integrasi smart home';

  @override
  String get subscriptionFeatureTV => 'Mode tampilan TV';

  @override
  String get subscriptionFeatureWidgets => 'Widget layar utama';

  @override
  String get subscriptionFeatureWatch => 'Komplikasi jam tangan';

  @override
  String get subscriptionFeatureSync => 'Sinkronisasi lintas perangkat';

  @override
  String get subscriptionFeatureAdFree => 'Pengalaman tanpa iklan';

  @override
  String get watchTitle => 'Jam Tangan';

  @override
  String get watchNextPrayer => 'Sholat Berikutnya';

  @override
  String get watchAllPrayers => 'Semua Sholat';

  @override
  String get watchComplication => 'Komplikasi';

  @override
  String get nextPrayer => 'Sholat berikutnya';

  @override
  String get allPrayers => 'Semua sholat';

  @override
  String get today => 'Hari ini';

  @override
  String get tomorrow => 'Besok';

  @override
  String get thisWeek => 'Minggu ini';

  @override
  String get thisMonth => 'Bulan ini';

  @override
  String get loginCreateAccount => 'Buat Akun';

  @override
  String get loginSignIn => 'Masuk';

  @override
  String get loginWelcomeBack => 'Selamat datang kembali';

  @override
  String get loginJoinPrayCalc => 'Bergabung dengan PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'Sinkronkan data sholat Anda di semua perangkat';

  @override
  String get loginContinueGoogle => 'Lanjutkan dengan Google';

  @override
  String get loginOr => 'atau';

  @override
  String get loginSigningIn => 'Sedang masuk…';

  @override
  String get loginNameLabel => 'Nama tampilan (opsional)';

  @override
  String get loginEmailLabel => 'Email';

  @override
  String get loginPasswordLabel => 'Kata sandi';

  @override
  String get loginEmailRequired => 'Email diperlukan';

  @override
  String get loginEmailInvalid => 'Masukkan alamat email yang valid';

  @override
  String get loginPasswordRequired => 'Kata sandi diperlukan';

  @override
  String get loginPasswordMinLength => 'Kata sandi minimal 8 karakter';

  @override
  String get loginForgotPassword => 'Lupa kata sandi?';

  @override
  String get loginEnterEmailFirst =>
      'Masukkan alamat email Anda terlebih dahulu';

  @override
  String get loginResetSent => 'Email reset kata sandi telah dikirim';

  @override
  String get loginResetFailed => 'Tidak dapat mengirim email reset';

  @override
  String get loginNewToPrayCalc => 'Baru di PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Sudah punya akun?';

  @override
  String get accountTitle => 'Akun';

  @override
  String get accountNotSignedIn => 'Belum masuk';

  @override
  String get accountSyncSection => 'Sinkronisasi';

  @override
  String get accountSyncStatus => 'Status sinkronisasi';

  @override
  String get accountSyncNow => 'Sinkronkan sekarang';

  @override
  String get accountSyncHistory => 'Riwayat sinkronisasi';

  @override
  String get accountNoConflicts => 'Tidak ada konflik';

  @override
  String accountConflictsResolved(int count) {
    return '$count terselesaikan';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Tersinkronisasi $time';
  }

  @override
  String get accountOfflineStatus =>
      'Offline. Perubahan disimpan secara lokal.';

  @override
  String get accountSyncErrorStatus =>
      'Kesalahan sinkronisasi. Akan mencoba lagi.';

  @override
  String get accountDataSection => 'Data';

  @override
  String get accountExportData => 'Ekspor data';

  @override
  String get accountExportSubtitle => 'Unduh pengaturan dan log sholat Anda';

  @override
  String get accountExportFailed => 'Tidak dapat mengekspor data';

  @override
  String get accountSignOutTitle => 'Keluar';

  @override
  String get accountSignOutBody =>
      'Data lokal Anda akan disimpan. Masuk lagi untuk melanjutkan sinkronisasi.';

  @override
  String get accountDeleteAccount => 'Hapus akun';

  @override
  String get accountDeleteSubtitle =>
      'Hapus akun dan data Anda secara permanen';

  @override
  String get accountDeleteBody =>
      'Ini akan menghapus akun dan semua data tersinkronisasi secara permanen. Data lokal di perangkat ini tidak akan dihapus.\n\nTindakan ini tidak dapat dibatalkan.';

  @override
  String get accountDeleted => 'Akun dihapus';

  @override
  String get accountDeleteFailed => 'Tidak dapat menghapus akun';

  @override
  String get accountTimeJustNow => 'baru saja';

  @override
  String accountTimeMinAgo(int min) {
    return '${min}m lalu';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '${hour}j lalu';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '${day}h lalu';
  }

  @override
  String get statsTitle => 'Statistik Sholat';

  @override
  String get statsShareTooltip => 'Bagikan statistik';

  @override
  String get statsTodayPrayers => 'Sholat Hari Ini';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Seri';

  @override
  String get statsDays => 'hari';

  @override
  String get statsThisWeek => 'Minggu Ini';

  @override
  String get statsCompletion => 'penyelesaian';

  @override
  String get statsThisMonth => 'Bulan Ini';

  @override
  String get statsMostMissed => 'Paling Sering Terlewat';

  @override
  String get statsThisWeekLabel => 'minggu ini';

  @override
  String get statsWeeklyChart => 'Penyelesaian Mingguan per Sholat';

  @override
  String get statsMonthlyChart => 'Penyelesaian Bulanan per Sholat';

  @override
  String statsTotalLogged(int count) {
    return '$count total sholat tercatat';
  }

  @override
  String get statsKeepItUp => 'Pertahankan!';

  @override
  String get statsShareTitle => 'Statistik Sholat PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Seri: $days hari';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Mingguan: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Bulanan: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Rincian mingguan:';

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
  String get aboutTitle => 'Tentang PrayCalc';

  @override
  String get aboutWebsite => 'Situs web';

  @override
  String get aboutContact => 'Kontak';

  @override
  String get aboutLicenses => 'Lisensi Open Source';

  @override
  String get aboutCouldNotOpen => 'Tidak dapat membuka tautan.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Hak cipta dilindungi.\n\nWaktu sholat dihitung menggunakan mesin pray_calc_dart. Akurasi bergantung pada lokasi GPS dan metode perhitungan yang dipilih.';
  }

  @override
  String get commonCancel => 'Batal';

  @override
  String get commonSave => 'Simpan';

  @override
  String get commonDelete => 'Hapus';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonRetry => 'Coba lagi';

  @override
  String get commonClose => 'Tutup';

  @override
  String get commonDone => 'Selesai';

  @override
  String get commonBack => 'Kembali';

  @override
  String get commonNext => 'Berikutnya';

  @override
  String get commonSkip => 'Lewati';

  @override
  String get commonContinue => 'Lanjutkan';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Ya';

  @override
  String get commonNo => 'Tidak';

  @override
  String get commonShare => 'Bagikan';

  @override
  String get commonCopy => 'Salin';

  @override
  String get commonCopied => 'Disalin ke papan klip';

  @override
  String get commonLoading => 'Memuat...';

  @override
  String get commonError => 'Terjadi kesalahan';

  @override
  String get commonErrorRetry => 'Terjadi kesalahan. Ketuk untuk mencoba lagi.';

  @override
  String get commonNoInternet => 'Tidak ada koneksi internet';

  @override
  String get commonOfflineMode => 'Mode offline';

  @override
  String get commonSignIn => 'Masuk';

  @override
  String get commonSignOut => 'Keluar';

  @override
  String get commonSignUp => 'Daftar';

  @override
  String get commonProfile => 'Profil';

  @override
  String get commonAccount => 'Akun';

  @override
  String get commonAbout => 'Tentang';

  @override
  String commonVersion(String version) {
    return 'Versi $version';
  }

  @override
  String get commonPrivacyPolicy => 'Kebijakan Privasi';

  @override
  String get commonTermsOfService => 'Ketentuan Layanan';

  @override
  String get commonRateApp => 'Beri rating aplikasi';

  @override
  String get commonFeedback => 'Kirim masukan';

  @override
  String get commonHelp => 'Bantuan';

  @override
  String get commonLanguage => 'Bahasa';

  @override
  String get commonOpenSettings => 'Buka Pengaturan';

  @override
  String get travelNotificationTitle => 'Anda sedang dalam perjalanan';

  @override
  String get travelNotificationBody =>
      'Waktu sholat mungkin dipersingkat. Ketuk untuk mempelajari hukum perjalanan.';

  @override
  String get travelRulingsTitle => 'Perjalanan & Sholat';

  @override
  String get travelRulingsIntro =>
      'Hukum Islam tentang sholat dalam perjalanan, dengan referensi ulama dari Al-Quran dan koleksi Hadits shahih.';

  @override
  String get travelWhenTitle => 'Kapan Perjalanan Berlaku?';

  @override
  String get travelQasrTitle => 'Mempersingkat Sholat (Qasar)';

  @override
  String get travelJamTitle => 'Menggabungkan Sholat (Jamak)';

  @override
  String get travelDurationTitle => 'Durasi Perjalanan';

  @override
  String get travelReferencesTitle => 'Referensi Ulama';

  @override
  String get travelLearnMore => 'Pelajari lebih lanjut';

  @override
  String get travelHanafiDefaultTitle =>
      'Mengapa PrayCalc Menggunakan Default Hanafi';

  @override
  String get travelDeeperScholarly => 'Diskusi Ulama Lebih Mendalam';

  @override
  String get onboardingTitle1 => 'Waktu sholat, di mana pun Anda berada';

  @override
  String get onboardingBody1 =>
      'Waktu sholat akurat GPS untuk setiap kota di dunia. Subuh sampai Isya, terbit sampai Qiyam. Dengan mesin perhitungan kami sendiri, dibuat untuk presisi.';

  @override
  String get onboardingTitle2 => 'Lokasi Anda, waktu Anda';

  @override
  String get onboardingBody2 =>
      'Cari kota mana pun atau biarkan GPS mendeteksi lokasi Anda. PrayCalc menemukan waktu untuk 5 juta kota di seluruh dunia.';

  @override
  String get onboardingTitle3 => 'Jangan pernah lewatkan sholat';

  @override
  String get onboardingBody3 =>
      'Adzan saat waktu sholat, pengingat sebelumnya. Agenda kustom untuk Sahur, kelas, dan lainnya.';

  @override
  String get onboardingTitle4 => 'Semua yang Anda butuhkan';

  @override
  String get onboardingBody4 =>
      'Kompas kiblat, kalender sholat, fase bulan Hijriah, penghitung Tasbih. Semua dalam satu tempat.';

  @override
  String get onboardingSkip => 'Lewati';

  @override
  String get onboardingGetStarted => 'Mulai';

  @override
  String get onboardingSignInTitle => 'Masuk ke PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Simpan riwayat sholat Anda dan\nsinkronkan di semua perangkat.';

  @override
  String get onboardingContinueGoogle => 'Lanjutkan dengan Google';

  @override
  String get onboardingContinueWithoutAccount => 'Lanjutkan tanpa akun';

  @override
  String get onboardingSigningIn => 'Sedang masuk…';

  @override
  String get onboardingSelectLanguage => 'Pilih Bahasa';

  @override
  String get duaDhikrTitle => 'Doa & Dzikir';

  @override
  String get duaDhikrTabDua => 'Doa';

  @override
  String get duaDhikrTabDhikr => 'Dzikir';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbih';

  @override
  String get duaDhikrTabMorning => 'Pagi';

  @override
  String get duaDhikrTabEvening => 'Petang';

  @override
  String get duaDhikrMorningAdhkar => 'Dzikir Pagi';

  @override
  String get duaDhikrEveningAdhkar => 'Dzikir Petang';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijriah';

  @override
  String get calYearlyTooltip => 'Kalender tahunan';

  @override
  String get calExportIcsTooltip => 'Ekspor .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Tampilkan di peta';

  @override
  String get qiblaWaitingCompass => 'Menunggu kompas...';

  @override
  String get qiblaNoCompassSensor =>
      'Tidak ada sensor kompas. Menampilkan arah kiblat secara statis.';

  @override
  String get qiblaAccuracyExcellent => 'Akurasi sangat baik';

  @override
  String get qiblaAccuracyGood => 'Akurasi baik';

  @override
  String get qiblaAccuracyFair =>
      'Akurasi cukup. Kalibrasi dengan menggerakkan ponsel membentuk angka 8.';

  @override
  String get qiblaAccuracyLow =>
      'Akurasi rendah. Kalibrasi dengan menggerakkan ponsel membentuk angka 8.';

  @override
  String get qiblaToTheKaaba => 'ke Ka\'bah';

  @override
  String get qiblaYourLocation => 'Lokasi Anda';

  @override
  String get qiblaGpsAccurate => 'GPS akurat';

  @override
  String get qiblaCityCenter => 'Pusat kota';

  @override
  String get moonIlluminatedLabel => 'Terang';

  @override
  String get moonAgeLabel => 'Usia';

  @override
  String get moonFirstQtr => 'Kuartal Pertama';

  @override
  String get moonLastQtr => 'Kuartal Terakhir';

  @override
  String get moonTonight => 'Malam ini';

  @override
  String get moonTomorrow => 'Besok';

  @override
  String moonDaysAway(int days) {
    return '${days}h';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Atur Lokasi Rumah';

  @override
  String get setHomeSearchHint => 'Cari kota, desa atau kode pos…';

  @override
  String get setHomeClear => 'Hapus';

  @override
  String get setHomeUseCurrentLocation => 'Gunakan Lokasi Saat Ini';

  @override
  String get setHomeDetectAndSet =>
      'Deteksi lokasi Anda dan atur sebagai rumah';

  @override
  String get setHomeAlreadySet => 'Rumah sudah diatur';

  @override
  String setHomeSetAs(String city) {
    return '$city diatur sebagai rumah';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Lokasi saat ini diatur sebagai rumah';

  @override
  String get setHomePermissionDenied =>
      'Izin lokasi ditolak. Cari kota di bawah.';

  @override
  String get setHomeGpsUnavailable => 'GPS tidak tersedia. Cari secara manual.';

  @override
  String get setHomeNoCitiesFound => 'Tidak ada kota ditemukan.';

  @override
  String get setHomeSearchPrompt => 'Cari kota rumah Anda';

  @override
  String get setHomeSearchBody =>
      'Ketik di atas untuk mencari, atau gunakan lokasi saat ini. Mode perjalanan akan mendeteksi saat Anda jauh dari rumah.';

  @override
  String get subscriptionYouHavePlus => 'Anda memiliki Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Upgrade ke Ummat+';

  @override
  String get subscriptionThankYou => 'Terima kasih telah mendukung PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Buka fitur premium di semua perangkat Anda.';

  @override
  String get subscriptionManageSub => 'Kelola langganan';

  @override
  String get subscriptionWelcome => 'Selamat datang di Ummat+!';

  @override
  String get subscriptionSubscribe => 'Berlangganan';

  @override
  String get subscriptionFreeFeatures => 'Fitur Gratis';

  @override
  String get subscriptionPlusFeatures => 'Fitur Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Waktu sholat';

  @override
  String get subscriptionFeatureQibla => 'Kompas kiblat';

  @override
  String get subscriptionFeatureCalendar => 'Kalender bulanan';

  @override
  String get subscriptionFeatureTasbeeh => 'Penghitung tasbih';

  @override
  String get subscriptionFeatureMoon => 'Bulan & Hijriah';

  @override
  String get smartHomeAlertType => 'Jenis Peringatan';

  @override
  String get smartHomeAlertModal => 'Modal layar penuh';

  @override
  String get smartHomeAlertCorner => 'Notifikasi sudut';

  @override
  String get smartHomeAlertNone => 'Tidak ada (senyap)';

  @override
  String get smartHomePauseMedia => 'Jeda media saat adzan';

  @override
  String get smartHomeQuietHours => 'Jam tenang';

  @override
  String get smartHomeQuietFrom => 'Dari';

  @override
  String get smartHomeQuietTo => 'Sampai';

  @override
  String get smartHomePrayerAudio => 'Audio per sholat';

  @override
  String get smartHomeAudioAdhan => 'Adzan';

  @override
  String get smartHomeAudioBeep => 'Bip';

  @override
  String get smartHomeAudioSilent => 'Senyap';

  @override
  String get aboutPrivacy => 'Kebijakan Privasi';

  @override
  String aboutVersion(String version) {
    return 'Versi $version';
  }

  @override
  String get notifDefaultAdhan => 'Adzan Default';

  @override
  String get notifFajrAdhan => 'Adzan Subuh';

  @override
  String get notifFajrAdhanSubtitle => 'Diputar saat waktu Subuh';

  @override
  String get notifRegularAdhan => 'Adzan Reguler';

  @override
  String get notifRegularAdhanSubtitle =>
      'Diputar saat Dzuhur, Ashar, Maghrib, Isya';

  @override
  String get notifPerPrayerSettings => 'Pengaturan Per Sholat';

  @override
  String get notifPreview => 'Pratinjau';

  @override
  String get tvSettingsTitle => 'Pengaturan TV';

  @override
  String get tvDisplayMode => 'Mode Tampilan';

  @override
  String get tvMasjidMode => 'Mode Masjid';

  @override
  String get tvMasjidModeSubtitle => 'Tampilan papan besar dengan waktu iqamah';

  @override
  String get tvMasjidName => 'Nama Masjid';

  @override
  String get tvMasjidNameTapToSet => 'Ketuk untuk mengatur';

  @override
  String get tvClock => 'Jam';

  @override
  String get tv24hFormat => 'Format 24 jam';

  @override
  String get tvIqamahOffsets => 'Offset Iqamah (menit setelah adzan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset menit setelah adzan';
  }

  @override
  String get tvQrCode => 'Kode QR';

  @override
  String get tvShowQrCode => 'Tampilkan Kode QR';

  @override
  String get tvShowQrCodeSubtitle => 'Tampilkan kode QR di layar masjid';

  @override
  String get tvQrCodeUrl => 'URL Kode QR';

  @override
  String get tvAmbientModeSection => 'Mode Ambient';

  @override
  String get tvIdleTimeout => 'Batas waktu idle';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes menit sebelum ambient aktif';
  }

  @override
  String get tvPhotoInterval => 'Interval foto';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds detik antar foto';
  }

  @override
  String get tvBackground => 'Latar belakang';

  @override
  String get tvPhotoCategory => 'Kategori foto';

  @override
  String get tvLocation => 'Lokasi';

  @override
  String get tvChangeCity => 'Ubah Kota';

  @override
  String get tvChangeCitySubtitle => 'Cari kota lain';

  @override
  String get tvScreensaverBg => 'Latar Screensaver';

  @override
  String get tvScreensaverPhotos => 'Foto';

  @override
  String get tvScreensaverPattern => 'Pola geometris';

  @override
  String get tvScreensaverBoth => 'Foto + pola';

  @override
  String get tvCategoryAll => 'Semua kategori';

  @override
  String get tvCategoryMasjids => 'Masjid';

  @override
  String get tvCategoryInteriors => 'Interior';

  @override
  String get tvCategoryGeometric => 'Geometris';

  @override
  String get tvCategoryCalligraphy => 'Kaligrafi';

  @override
  String get tvCategoryLandscapes => 'Pemandangan';

  @override
  String get tvCategoryRamadan => 'Ramadan';

  @override
  String get tvPhotoCategoryTitle => 'Kategori Foto';

  @override
  String tvEnterHint(String title) {
    return 'Masukkan $title';
  }

  @override
  String get tvSystemDefault => 'Default sistem';

  @override
  String get smartHomeIntegrations => 'Integrasi';

  @override
  String get smartHomeLinkedSpeakers => 'Speaker & Layar Terhubung';

  @override
  String get smartHomeAlertDisplay => 'Tampilan Peringatan';

  @override
  String get smartHomeAtAdhanShow => 'Saat adzan tampilkan';

  @override
  String get smartHomePauseMediaTitle => 'Jeda media saat adzan';

  @override
  String get smartHomePauseMediaSubtitle => 'Dilanjutkan setelah adzan selesai';

  @override
  String get smartHomePrayerAudioSection => 'Audio Sholat';

  @override
  String get smartHomeQuietHoursSection => 'Jam Tenang';

  @override
  String get smartHomeEnableQuietHours => 'Aktifkan jam tenang';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Semua peringatan smart home dimatikan';

  @override
  String get smartHomeNoDevices => 'Belum ada perangkat terhubung';

  @override
  String get smartHomeNoDevicesDesc =>
      'Hubungkan Google Home atau Alexa di atas, lalu speaker dan layar Anda akan muncul di sini.';

  @override
  String get smartHomeRequiresPlus => 'Smart Home memerlukan Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Kontrol pengumuman sholat di Google Home, Alexa, Siri, dan Home Assistant. Atur perangkat mana yang memainkan adzan, kapan menjeda media, dan atur jam tenang.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Siarkan adzan di speaker dan layar Nest.';

  @override
  String get smartHomeEnableAlexa => 'Aktifkan skill PrayCalc di Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Tanya Siri waktu sholat atau atur otomatisasi.';

  @override
  String get smartHomeHassAdd =>
      'Tambahkan melalui HACS untuk dukungan otomatisasi penuh.';

  @override
  String get smartHomeSetupGuide => 'Panduan pengaturan';

  @override
  String get smartHomeSiriSetupTitle => 'Pengaturan Siri Shortcuts';

  @override
  String get smartHomeSiriStep1 =>
      'Buka aplikasi Pintasan di iPhone atau iPad Anda.';

  @override
  String get smartHomeSiriStep2 => 'Ketuk \"+\" untuk membuat pintasan baru.';

  @override
  String get smartHomeSiriStep3 => 'Cari \"PrayCalc\" di daftar tindakan.';

  @override
  String get smartHomeSiriStep4 =>
      'Tambahkan \"Waktu Sholat Berikutnya\" atau \"Waktu Sholat Hari Ini\".';

  @override
  String get smartHomeSiriStep5 =>
      'Opsional tambahkan ke otomatisasi (mis. harian saat Subuh).';

  @override
  String get smartHomeSiriStep6 =>
      'Katakan \"Hey Siri, waktu sholat berikutnya\" untuk menguji.';

  @override
  String get smartHomeSiriFootnote => 'Memerlukan iOS 16 atau lebih baru.';

  @override
  String get smartHomeHassSetupTitle => 'Pengaturan Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Instal HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 => 'Di HACS, cari \"PrayCalc\" dan instal.';

  @override
  String get smartHomeHassStep3 =>
      'Buka Pengaturan > Perangkat & Layanan > Tambah Integrasi.';

  @override
  String get smartHomeHassStep4 => 'Cari \"PrayCalc\" dan pilih.';

  @override
  String get smartHomeHassStep5 =>
      'Masukkan kunci API PrayCalc Anda (dibuat di akun Anda).';

  @override
  String get smartHomeHassStep6 =>
      'Konfigurasi lokasi dan metode perhitungan Anda.';

  @override
  String get smartHomeHassFootnote =>
      'Memerlukan Home Assistant 2024.1+ dengan HACS.';

  @override
  String get smartHomeApiKey => 'Kunci API';

  @override
  String get smartHomeGenerateApiKey => 'Buat Kunci API';

  @override
  String get smartHomeApiKeyNotReady =>
      'Pembuatan kunci API akan tersedia setelah layanan pintar PrayCalc diluncurkan.';

  @override
  String get smartHomeApiKeyDesc =>
      'Anda memerlukan kunci API untuk menghubungkan Home Assistant ke akun PrayCalc Anda.';

  @override
  String get smartHomeLinkedStatus => 'Terhubung';

  @override
  String get smartHomeNotLinkedStatus => 'Tidak terhubung';

  @override
  String get smartHomeCouldNotOpen => 'Tidak dapat membuka tautan.';

  @override
  String get smartHomeDevices => 'Perangkat';

  @override
  String get smartHomeAddDevice => 'Tambah Perangkat';

  @override
  String get smartHomeDeleteDevice => 'Hapus';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Hapus perangkat ini?';

  @override
  String get smartHomeDeviceOnline => 'Online';

  @override
  String get smartHomeDeviceOffline => 'Offline';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Terakhir terlihat: $time';
  }

  @override
  String get smartHomeDeviceName => 'Nama perangkat';

  @override
  String get smartHomeDeviceType => 'Jenis perangkat';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Speaker';

  @override
  String get smartHomeDeviceTypeWatch => 'Jam tangan';

  @override
  String get smartHomeDeviceTypeDesktop => 'Desktop';

  @override
  String get smartHomeDeviceTypeOther => 'Lainnya';

  @override
  String get smartHomeDeviceAdhan => 'Notifikasi adzan';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Terima peringatan adzan di perangkat ini';

  @override
  String get smartHomeDeviceVolume => 'Volume';

  @override
  String get smartHomeDeviceAudioType => 'Jenis audio';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Shalat yang diaktifkan';

  @override
  String get smartHomeDeviceSettings => 'Pengaturan Perangkat';

  @override
  String get smartHomeTesting => 'Menguji...';

  @override
  String get smartHomeTestSuccess => 'Koneksi terverifikasi';

  @override
  String get smartHomeTestFailed => 'Uji koneksi gagal';

  @override
  String get smartHomePairTv => 'Pasangkan TV';

  @override
  String get smartHomePairingTv => 'Mendaftarkan TV...';

  @override
  String get smartHomePairTvSuccess => 'TV berhasil dipasangkan';

  @override
  String get smartHomePairTvFailed => 'Pemasangan TV gagal';

  @override
  String get smartHomeLoadingDevices => 'Memuat perangkat...';

  @override
  String get smartHomeLoadingIntegrations => 'Memuat integrasi...';

  @override
  String get smartHomeServiceUnavailable =>
      'Layanan rumah pintar saat ini tidak tersedia. Silakan coba lagi nanti.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total selesai';
  }

  @override
  String get adhkarReset => 'Reset';

  @override
  String get syncHistoryTitle => 'Riwayat Sinkronisasi';

  @override
  String get syncClearHistory => 'Hapus riwayat';

  @override
  String get syncNoConflicts =>
      'Tidak ada konflik sinkronisasi. Semua perangkat tersinkronisasi.';

  @override
  String get syncDomainSettings => 'Pengaturan';

  @override
  String get syncDomainCities => 'Kota Tersimpan';

  @override
  String get syncDomainPrayerLogs => 'Log Sholat';

  @override
  String get syncTimeJustNow => 'baru saja';

  @override
  String syncTimeMinAgo(int min) {
    return '${min}m lalu';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '${hour}j lalu';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '${day}h lalu';
  }

  @override
  String get pinCity => 'Sematkan';

  @override
  String get pinMaxReached =>
      'Maksimal 5 kota disematkan. Upgrade ke Ummat+ untuk lebih banyak.';

  @override
  String pinCityUnpinned(String city) {
    return '$city tidak disematkan';
  }

  @override
  String get pinUndo => 'Batalkan';

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
  String get tvJumuahGreeting => 'Jumu\'ah Mubarak';

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
