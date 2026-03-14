// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Malay (`ms`).
class AppLocalizationsMs extends AppLocalizations {
  AppLocalizationsMs([String locale = 'ms']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Subuh';

  @override
  String get prayerSunrise => 'Syuruk';

  @override
  String get prayerDhuhr => 'Zohor';

  @override
  String get prayerAsr => 'Asar';

  @override
  String get prayerMaghrib => 'Maghrib';

  @override
  String get prayerIsha => 'Isyak';

  @override
  String get prayerQiyam => 'Qiyam';

  @override
  String get prayerSuhoor => 'Sahur';

  @override
  String get prayerIftar => 'Berbuka';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabiulawal';

  @override
  String get hijriRabiAlThani => 'Rabiulakhir';

  @override
  String get hijriJumadaAlAwwal => 'Jamadilawal';

  @override
  String get hijriJumadaAlThani => 'Jamadilakhir';

  @override
  String get hijriRajab => 'Rejab';

  @override
  String get hijriShaban => 'Syaaban';

  @override
  String get hijriRamadan => 'Ramadan';

  @override
  String get hijriShawwal => 'Syawal';

  @override
  String get hijriDhulQidah => 'Zulkaedah';

  @override
  String get hijriDhulHijjah => 'Zulhijjah';

  @override
  String get monthJan => 'Jan';

  @override
  String get monthFeb => 'Feb';

  @override
  String get monthMar => 'Mac';

  @override
  String get monthApr => 'Apr';

  @override
  String get monthMay => 'Mei';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Ogo';

  @override
  String get monthSep => 'Sep';

  @override
  String get monthOct => 'Okt';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Dis';

  @override
  String get monthJanuary => 'Januari';

  @override
  String get monthFebruary => 'Februari';

  @override
  String get monthMarch => 'Mac';

  @override
  String get monthApril => 'April';

  @override
  String get monthMayFull => 'Mei';

  @override
  String get monthJune => 'Jun';

  @override
  String get monthJuly => 'Julai';

  @override
  String get monthAugust => 'Ogos';

  @override
  String get monthSeptember => 'September';

  @override
  String get monthOctober => 'Oktober';

  @override
  String get monthNovember => 'November';

  @override
  String get monthDecember => 'Disember';

  @override
  String get dayMonShort => 'Isn';

  @override
  String get dayTueShort => 'Sel';

  @override
  String get dayWedShort => 'Rab';

  @override
  String get dayThuShort => 'Kha';

  @override
  String get dayFriShort => 'Jum';

  @override
  String get daySatShort => 'Sab';

  @override
  String get daySunShort => 'Ahd';

  @override
  String get dayMonday => 'Isnin';

  @override
  String get dayTuesday => 'Selasa';

  @override
  String get dayWednesday => 'Rabu';

  @override
  String get dayThursday => 'Khamis';

  @override
  String get dayFriday => 'Jumaat';

  @override
  String get daySaturday => 'Sabtu';

  @override
  String get daySunday => 'Ahad';

  @override
  String get daySuChart => 'Ah';

  @override
  String get dayMoChart => 'Is';

  @override
  String get dayTuChart => 'Se';

  @override
  String get dayWeChart => 'Ra';

  @override
  String get dayThChart => 'Kh';

  @override
  String get dayFrChart => 'Ju';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Pilih bandar';

  @override
  String get setCityFab => 'Tetapkan bandar';

  @override
  String prayerTimesError(Object error) {
    return 'Tidak dapat mengira waktu solat.\n$error';
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
  String get homeNoCitySelected => 'Tiada bandar dipilih';

  @override
  String get homeNoCityHint =>
      'Ketik di atas untuk mencari bandar anda atau aktifkan GPS.';

  @override
  String get homeCouldNotCalc => 'Tidak dapat mengira waktu solat.';

  @override
  String get homeQasr => 'Qasar';

  @override
  String get homeActionMonthlyTimes => 'Waktu\nBulanan';

  @override
  String get homeActionDuaDhikr => 'Doa &\nZikir';

  @override
  String get homeActionPrayerStats => 'Statistik\nSolat';

  @override
  String homePolarBanner(int count) {
    return '$count waktu solat tidak dapat dikira untuk lokasi anda dalam tempoh ini (matahari tengah malam / malam kutub). Cuba anggaran latitud terdekat dalam tetapan.';
  }

  @override
  String get settingsTitle => 'Tetapan';

  @override
  String get settingsSectionPrayerCalc => 'Pengiraan Solat';

  @override
  String get settingsCalcMethod => 'Kaedah Pengiraan';

  @override
  String get settingsCalcMethodAuto => 'Auto (Dinamik)';

  @override
  String get settingsHanafiAsr => 'Asar Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Faktor bayangan 2x (waktu Asar lewat)';

  @override
  String get settingsSectionDisplay => 'Paparan';

  @override
  String get settings24hClock => 'Format 24 jam';

  @override
  String get settingsFollowSystemTheme => 'Ikut tema sistem';

  @override
  String get settingsDarkMode => 'Mod gelap';

  @override
  String get settingsSectionNotifications => 'Pemberitahuan';

  @override
  String get settingsPrayerNotifications => 'Pemberitahuan solat';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Azan, peringatan, dan tetapan setiap solat';

  @override
  String get settingsPrayerAgendas => 'Agenda solat';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Peringatan tersuai berdasarkan waktu solat';

  @override
  String get settingsAccount => 'Akaun';

  @override
  String get settingsSignInToSync => 'Log masuk untuk segerak';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Simpan data anda merentas peranti';

  @override
  String get settingsHomeScreen => 'Skrin Utama';

  @override
  String get settingsSkyGradient => 'Latar belakang langit';

  @override
  String get settingsSkyGradientSubtitle =>
      'Warna langit animasi mengikut waktu hari';

  @override
  String get settingsWeatherGradient => 'Kecerunan cuaca';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Sesuaikan warna langit berdasarkan cuaca setempat';

  @override
  String get settingsCountdownAnimation => 'Animasi undur detik';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Cincin bernafas pada undur detik solat seterusnya';

  @override
  String get settingsPrayerTracking => 'Penjejakan Solat';

  @override
  String get settingsTrackMyPrayers => 'Jejak solat saya';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Log solat yang anda selesaikan setiap hari';

  @override
  String get settingsPrayerStats => 'Statistik solat';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Rangkaian, carta mingguan dan bulanan';

  @override
  String get settingsJumuahKahf => 'Peringatan Al-Kahfi Jumaat';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Peringatan pada hari Jumaat untuk membaca Surah Al-Kahfi';

  @override
  String get settingsTravel => 'Perjalanan';

  @override
  String get settingsTravelMode => 'Mod perjalanan';

  @override
  String get settingsTravelModeSubtitle =>
      'Kesan secara automatik apabila anda jauh dari rumah dan sesuaikan solat';

  @override
  String get settingsHomeLocation => 'Lokasi rumah';

  @override
  String get settingsHomeLocationNotSet =>
      'Belum ditetapkan — ketik untuk gunakan lokasi semasa';

  @override
  String get settingsClearHomeLocation => 'Padamkan lokasi rumah';

  @override
  String get settingsTravelRulings => 'Hukum solat musafir';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasar, jamak, dan panduan musafir';

  @override
  String get settingsSmartHome => 'Rumah Pintar';

  @override
  String get settingsSmartHomeIntegrations => 'Integrasi rumah pintar';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Paparan TV';

  @override
  String get settingsTvHome => 'Paparan utama TV';

  @override
  String get settingsTvHomeSubtitle => 'Jam solat skrin penuh untuk TV';

  @override
  String get settingsMasjidDisplay => 'Paparan masjid';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Jadual azan/iqamah untuk skrin masjid';

  @override
  String get settingsTvSettings => 'Tetapan TV';

  @override
  String get settingsTvSettingsSubtitle => 'Mod masjid, offset iqamah, ambien';

  @override
  String get settingsAboutPrayCalc => 'Tentang PrayCalc';

  @override
  String get syncSynced => 'Disegerakkan';

  @override
  String get syncSyncing => 'Menyegerak...';

  @override
  String get syncOffline => 'Luar talian';

  @override
  String get syncError => 'Ralat segerak';

  @override
  String get notifSettingsTitle => 'Pemberitahuan & Azan';

  @override
  String get notifAdhanLabel => 'Azan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Peringatan: $minutes min sebelum';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Kelantangan: $pct%';
  }

  @override
  String get notifTestAdhan => 'Uji azan';

  @override
  String get notifModeOff => 'Mati';

  @override
  String get notifModeReminderOnly => 'Peringatan sahaja';

  @override
  String get notifModeArrival => 'Pada waktu solat';

  @override
  String get notifModeBoth => 'Peringatan + waktu solat';

  @override
  String get citySearchHint => 'Cari bandar…';

  @override
  String get citySearchDetectTooltip => 'Kesan lokasi saya';

  @override
  String get citySearchNoCityGps => 'Tidak dapat mengesan bandar dari GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Kebenaran lokasi ditolak. Cari secara manual.';

  @override
  String get citySearchNoResults => 'Tiada bandar ditemui.';

  @override
  String get citySearchStartTyping => 'Mula menaip untuk mencari…';

  @override
  String get agendasTitle => 'Agenda Solat';

  @override
  String get agendasEmpty =>
      'Belum ada agenda.\nKetik + untuk menambah peringatan berkait dengan solat anda.';

  @override
  String get agendasUndo => 'Buat asal';

  @override
  String agendasRemoved(String label) {
    return '$label dibuang';
  }

  @override
  String get agendaNewTitle => 'Agenda Baharu';

  @override
  String get agendaEditTitle => 'Edit Agenda';

  @override
  String get agendaSave => 'Simpan';

  @override
  String get agendaLabelEmpty => 'Label tidak boleh kosong';

  @override
  String get agendaLabelField => 'Label';

  @override
  String get agendaLabelHint => 'cth. Bangun untuk Subuh';

  @override
  String get agendaPrayerSection => 'Solat';

  @override
  String get agendaTimeOffsetSection => 'Offset masa';

  @override
  String get agendaOffsetAtPrayerTime => 'Pada waktu solat';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes min sebelum';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes min selepas';
  }

  @override
  String get agendaRepeatSection => 'Ulang';

  @override
  String get agendaNotifTypeSection => 'Jenis pemberitahuan';

  @override
  String get agendaNotifSilent => 'Senyap';

  @override
  String get agendaNotifSound => 'Bunyi';

  @override
  String get agendaNotifVibrate => 'Getar';

  @override
  String get agendaDayM => 'I';

  @override
  String get agendaDayT => 'S';

  @override
  String get agendaDayW => 'R';

  @override
  String get agendaDayF => 'J';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Bulan & Kalendar Hijri';

  @override
  String moonIlluminated(int pct) {
    return '$pct% bercahaya';
  }

  @override
  String get moonFullTonight => 'Bulan purnama malam ini!';

  @override
  String get moonNextTomorrow => 'Bulan purnama seterusnya esok';

  @override
  String moonNextDays(int days) {
    return 'Bulan purnama seterusnya dalam $days hari';
  }

  @override
  String moonAge(String age) {
    return 'Umur bulan: $age hari';
  }

  @override
  String get moonPhaseNewMoon => 'Bulan Baharu';

  @override
  String get moonPhaseWaxingCrescent => 'Sabit Membesar';

  @override
  String get moonPhaseFirstQuarter => 'Suku Pertama';

  @override
  String get moonPhaseWaxingGibbous => 'Cembung Membesar';

  @override
  String get moonPhaseFullMoon => 'Bulan Purnama';

  @override
  String get moonPhaseWaningGibbous => 'Cembung Mengecil';

  @override
  String get moonPhaseLastQuarter => 'Suku Akhir';

  @override
  String get moonPhaseWaningCrescent => 'Sabit Mengecil';

  @override
  String get moonHilalVisibility => 'Keterlihatan Hilal Seterusnya';

  @override
  String get moonRegionMiddleEast => 'Timur Tengah';

  @override
  String get moonRegionWestAfrica => 'Afrika Barat';

  @override
  String get moonRegionSouthAsia => 'Asia Selatan';

  @override
  String get moonRegionEurope => 'Eropah';

  @override
  String get moonRegionAmericas => 'Amerika';

  @override
  String get moonVisible => 'Kelihatan';

  @override
  String get moonNotVisible => 'Tidak Kelihatan';

  @override
  String get moonPossible => 'Mungkin';

  @override
  String get moonUpcomingDates => 'Tarikh Islam Akan Datang';

  @override
  String get hijriTodayLabel => 'Hari Ini dalam Kalendar Hijri';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year H bermula';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days hari lagi';
  }

  @override
  String get moonLunarCycle => 'Kitaran Lunar';

  @override
  String moonDayOfCycle(int day) {
    return 'Hari $day daripada ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'Ramalan Rukyah Hilal';

  @override
  String get moonHilalVisibilityMap => 'Peta Keterlihatan Hilal';

  @override
  String moonDayN(int day) {
    return 'Hari $day';
  }

  @override
  String get moonGlobalSighting => 'Rukyah Global';

  @override
  String get moonZoneNakedEye => 'Mata Kasar';

  @override
  String get moonZoneBinoculars => 'Binokular';

  @override
  String get moonZoneVeryDifficult => 'Sangat Sukar';

  @override
  String get moonZoneNotVisible => 'Tidak Kelihatan';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H berkemungkinan 29 hari. Anak bulan dijangka kelihatan pada hari ke-29, insya Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H berkemungkinan 30 hari. Anak bulan tidak dijangka kelihatan pada hari ke-29 — bulan genap 30 hari.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Arab Saudi';

  @override
  String get moonFCNACalc => 'FCNA / Kiraan';

  @override
  String get moonNorthAmerica => 'Amerika Utara';

  @override
  String moonNDays(int days) {
    return '$days hari';
  }

  @override
  String moonStarts(String month) {
    return '$month bermula:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Umur bulan pada maghrib: $hours j';
  }

  @override
  String get moon7DayLunarCalendar => 'Kalendar Lunar 7 Hari';

  @override
  String get moonUpcomingIslamicEvents => 'Peristiwa Islam Akan Datang';

  @override
  String get moonTodayLabel => 'Hari Ini';

  @override
  String get moonTomorrowLabel => 'Esok';

  @override
  String get calDateCol => 'Tarikh';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Subuh';

  @override
  String get calSunriseCol => 'Syuruk';

  @override
  String get calDhuhrCol => 'Zohor';

  @override
  String get calAsrCol => 'Asar';

  @override
  String get calMaghribCol => 'Maghrib';

  @override
  String get calIshaCol => 'Isyak';

  @override
  String get calNoCityText =>
      'Tetapkan bandar anda terlebih dahulu\nuntuk melihat kalendar solat.';

  @override
  String get calShareTooltip => 'Kongsi kalendar';

  @override
  String get calPrevMonthTooltip => 'Bulan sebelumnya';

  @override
  String get calNextMonthTooltip => 'Bulan seterusnya';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Waktu Solat — $month';
  }

  @override
  String get qiblaTitle => 'Kiblat';

  @override
  String get qiblaSwitchToCompass => 'Tukar ke kompas';

  @override
  String get qiblaSwitchToAR => 'Tukar ke kamera AR';

  @override
  String get qiblaNoCityText =>
      'Tetapkan bandar anda terlebih dahulu\nuntuk mengira arah kiblat.';

  @override
  String get qiblaCompassUnavailable =>
      'Sensor kompas tidak tersedia pada peranti ini.';

  @override
  String get qiblaCalibrate =>
      'Kalibrasi: gerakkan telefon anda dalam bentuk angka 8.';

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
    return '$dist km dari Kaabah';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km dari Kaabah';
  }

  @override
  String get qiblaFacingQibla => 'Menghadap Kiblat ✓';

  @override
  String get tasbeehTitle => 'Tasbih';

  @override
  String get tasbeehResetTooltip => 'Set semula';

  @override
  String get tasbeehTapToSwitch => 'Ketik label untuk menukar';

  @override
  String get tasbeehTapToCount => 'Ketik di mana sahaja untuk mengira';

  @override
  String get tasbeehResetDialogTitle => 'Set semula pembilang?';

  @override
  String get tasbeehResetDialogContent =>
      'Ini akan menetapkan semula kiraan kepada sifar.';

  @override
  String get tasbeehCancel => 'Batal';

  @override
  String get tasbeehReset => 'Set Semula';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Hari ini: $count zikir';
  }

  @override
  String get tasbeehLast7Days => '7 hari lepas';

  @override
  String get tasbeehNoHistory => 'Belum ada sejarah — mula mengira!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih selesai! $count zikir';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Rumah Pintar';

  @override
  String get smartHomeSubtitle => 'Sambungkan peranti anda ke waktu solat';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Tanya Google tentang waktu solat dan arah kiblat';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Tanya Alexa tentang waktu solat, solat seterusnya, dan lagi';

  @override
  String get smartHomeSiri => 'Pintasan Siri';

  @override
  String get smartHomeSiriDesc => 'Cipta pintasan tersuai untuk waktu solat';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Automasi lampu, paparan, dan peringatan pada waktu solat';

  @override
  String get smartHomeLinkAccount => 'Paut Akaun';

  @override
  String get smartHomeLinked => 'Dipautkan';

  @override
  String get smartHomeUnlink => 'Nyahpaut';

  @override
  String get smartHomeSetupInstructions => 'Arahan Persediaan';

  @override
  String get smartHomeRequiresUmmatPlus => 'Memerlukan Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Penyelesaian Masalah';

  @override
  String get smartHomeTestConnection => 'Uji Sambungan';

  @override
  String get smartHomeConnectionSuccess => 'Berjaya disambungkan';

  @override
  String get smartHomeConnectionFailed =>
      'Sambungan gagal. Semak pautan akaun anda.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Ciri premium waktu solat';

  @override
  String get subscriptionUpgrade => 'Naik taraf ke Ummat+';

  @override
  String get subscriptionRestore => 'Pulihkan Pembelian';

  @override
  String get subscriptionManage => 'Urus Langganan';

  @override
  String get subscriptionCancel => 'Batal Langganan';

  @override
  String get subscriptionActive => 'Aktif';

  @override
  String get subscriptionExpired => 'Tamat Tempoh';

  @override
  String get subscriptionFree => 'Percuma';

  @override
  String get subscriptionFreeDesc => 'Waktu solat asas, Kiblat, kalendar';

  @override
  String get subscriptionPlusDesc =>
      'Rumah pintar, paparan TV, widget, dan lagi';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count pertanyaan percuma berbaki';
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
  String get subscriptionFeatureSmartHome => 'Integrasi rumah pintar';

  @override
  String get subscriptionFeatureTV => 'Mod paparan TV';

  @override
  String get subscriptionFeatureWidgets => 'Widget skrin utama';

  @override
  String get subscriptionFeatureWatch => 'Komplikasi jam tangan';

  @override
  String get subscriptionFeatureSync => 'Segerak merentas peranti';

  @override
  String get subscriptionFeatureAdFree => 'Pengalaman tanpa iklan';

  @override
  String get watchTitle => 'Jam Tangan';

  @override
  String get watchNextPrayer => 'Solat Seterusnya';

  @override
  String get watchAllPrayers => 'Semua Solat';

  @override
  String get watchComplication => 'Komplikasi';

  @override
  String get nextPrayer => 'Solat seterusnya';

  @override
  String get allPrayers => 'Semua solat';

  @override
  String get today => 'Hari ini';

  @override
  String get tomorrow => 'Esok';

  @override
  String get thisWeek => 'Minggu ini';

  @override
  String get thisMonth => 'Bulan ini';

  @override
  String get loginCreateAccount => 'Cipta Akaun';

  @override
  String get loginSignIn => 'Log Masuk';

  @override
  String get loginWelcomeBack => 'Selamat kembali';

  @override
  String get loginJoinPrayCalc => 'Sertai PrayCalc';

  @override
  String get loginSyncSubtitle => 'Segerakkan data solat anda merentas peranti';

  @override
  String get loginContinueGoogle => 'Teruskan dengan Google';

  @override
  String get loginOr => 'atau';

  @override
  String get loginSigningIn => 'Sedang log masuk…';

  @override
  String get loginNameLabel => 'Nama paparan (pilihan)';

  @override
  String get loginEmailLabel => 'E-mel';

  @override
  String get loginPasswordLabel => 'Kata laluan';

  @override
  String get loginEmailRequired => 'E-mel diperlukan';

  @override
  String get loginEmailInvalid => 'Masukkan alamat e-mel yang sah';

  @override
  String get loginPasswordRequired => 'Kata laluan diperlukan';

  @override
  String get loginPasswordMinLength =>
      'Kata laluan mestilah sekurang-kurangnya 8 aksara';

  @override
  String get loginForgotPassword => 'Lupa kata laluan?';

  @override
  String get loginEnterEmailFirst =>
      'Masukkan alamat e-mel anda terlebih dahulu';

  @override
  String get loginResetSent => 'E-mel tetapan semula kata laluan dihantar';

  @override
  String get loginResetFailed => 'Tidak dapat menghantar e-mel tetapan semula';

  @override
  String get loginNewToPrayCalc => 'Baharu di PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Sudah ada akaun?';

  @override
  String get accountTitle => 'Akaun';

  @override
  String get accountNotSignedIn => 'Belum log masuk';

  @override
  String get accountSyncSection => 'Segerak';

  @override
  String get accountSyncStatus => 'Status segerak';

  @override
  String get accountSyncNow => 'Segerak sekarang';

  @override
  String get accountSyncHistory => 'Sejarah segerak';

  @override
  String get accountNoConflicts => 'Tiada konflik dikesan';

  @override
  String accountConflictsResolved(int count) {
    return '$count diselesaikan';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Disegerak $time';
  }

  @override
  String get accountOfflineStatus =>
      'Luar talian. Perubahan disimpan secara setempat.';

  @override
  String get accountSyncErrorStatus => 'Ralat segerak. Akan cuba semula.';

  @override
  String get accountDataSection => 'Data';

  @override
  String get accountExportData => 'Eksport data';

  @override
  String get accountExportSubtitle => 'Muat turun tetapan dan log solat anda';

  @override
  String get accountExportFailed => 'Tidak dapat mengeksport data';

  @override
  String get accountSignOutTitle => 'Log keluar';

  @override
  String get accountSignOutBody =>
      'Data setempat anda akan disimpan. Log masuk semula untuk menyambung segerakan.';

  @override
  String get accountDeleteAccount => 'Padam akaun';

  @override
  String get accountDeleteSubtitle => 'Padam akaun dan data anda secara kekal';

  @override
  String get accountDeleteBody =>
      'Ini akan memadamkan akaun dan semua data yang disegerakkan secara kekal. Data setempat pada peranti ini tidak akan dibuang.\n\nTindakan ini tidak boleh dibatalkan.';

  @override
  String get accountDeleted => 'Akaun dipadam';

  @override
  String get accountDeleteFailed => 'Tidak dapat memadam akaun';

  @override
  String get accountTimeJustNow => 'baru sahaja';

  @override
  String accountTimeMinAgo(int min) {
    return '${min}m lepas';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '${hour}j lepas';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '${day}h lepas';
  }

  @override
  String get statsTitle => 'Statistik Solat';

  @override
  String get statsShareTooltip => 'Kongsi statistik';

  @override
  String get statsTodayPrayers => 'Solat Hari Ini';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Rangkaian';

  @override
  String get statsDays => 'hari';

  @override
  String get statsThisWeek => 'Minggu Ini';

  @override
  String get statsCompletion => 'penyelesaian';

  @override
  String get statsThisMonth => 'Bulan Ini';

  @override
  String get statsMostMissed => 'Paling Kerap Tertinggal';

  @override
  String get statsThisWeekLabel => 'minggu ini';

  @override
  String get statsWeeklyChart => 'Penyelesaian Mingguan mengikut Solat';

  @override
  String get statsMonthlyChart => 'Penyelesaian Bulanan mengikut Solat';

  @override
  String statsTotalLogged(int count) {
    return '$count jumlah solat dicatat';
  }

  @override
  String get statsKeepItUp => 'Teruskan!';

  @override
  String get statsShareTitle => 'Statistik Solat PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Rangkaian: $days hari';
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
  String get statsShareBreakdown => 'Pecahan mingguan:';

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
  String get aboutWebsite => 'Laman web';

  @override
  String get aboutContact => 'Hubungi';

  @override
  String get aboutLicenses => 'Lesen Sumber Terbuka';

  @override
  String get aboutCouldNotOpen => 'Tidak dapat membuka pautan.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Hak cipta terpelihara.\n\nWaktu solat dikira menggunakan enjin pray_calc_dart. Ketepatan bergantung pada lokasi GPS dan kaedah pengiraan yang dipilih.';
  }

  @override
  String get commonCancel => 'Batal';

  @override
  String get commonSave => 'Simpan';

  @override
  String get commonDelete => 'Padam';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonRetry => 'Cuba Semula';

  @override
  String get commonClose => 'Tutup';

  @override
  String get commonDone => 'Selesai';

  @override
  String get commonBack => 'Kembali';

  @override
  String get commonNext => 'Seterusnya';

  @override
  String get commonSkip => 'Langkau';

  @override
  String get commonContinue => 'Teruskan';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Ya';

  @override
  String get commonNo => 'Tidak';

  @override
  String get commonShare => 'Kongsi';

  @override
  String get commonCopy => 'Salin';

  @override
  String get commonCopied => 'Disalin ke papan keratan';

  @override
  String get commonLoading => 'Memuatkan...';

  @override
  String get commonError => 'Sesuatu tidak kena';

  @override
  String get commonErrorRetry => 'Sesuatu tidak kena. Ketik untuk cuba semula.';

  @override
  String get commonNoInternet => 'Tiada sambungan internet';

  @override
  String get commonOfflineMode => 'Mod luar talian';

  @override
  String get commonSignIn => 'Log masuk';

  @override
  String get commonSignOut => 'Log keluar';

  @override
  String get commonSignUp => 'Daftar';

  @override
  String get commonProfile => 'Profil';

  @override
  String get commonAccount => 'Akaun';

  @override
  String get commonAbout => 'Tentang';

  @override
  String commonVersion(String version) {
    return 'Versi $version';
  }

  @override
  String get commonPrivacyPolicy => 'Dasar Privasi';

  @override
  String get commonTermsOfService => 'Terma Perkhidmatan';

  @override
  String get commonRateApp => 'Nilai aplikasi ini';

  @override
  String get commonFeedback => 'Hantar maklum balas';

  @override
  String get commonHelp => 'Bantuan';

  @override
  String get commonLanguage => 'Bahasa';

  @override
  String get commonOpenSettings => 'Buka Tetapan';

  @override
  String get travelNotificationTitle => 'Anda sedang bermusafir';

  @override
  String get travelNotificationBody =>
      'Waktu solat mungkin dipendekkan. Ketik untuk mengetahui hukum solat musafir.';

  @override
  String get travelRulingsTitle => 'Musafir & Solat';

  @override
  String get travelRulingsIntro =>
      'Hukum Islam tentang solat semasa bermusafir, dengan rujukan ilmiah dari al-Quran dan koleksi Hadis sahih.';

  @override
  String get travelWhenTitle => 'Bila Hukum Musafir Terpakai?';

  @override
  String get travelQasrTitle => 'Qasar Solat';

  @override
  String get travelJamTitle => 'Jamak Solat';

  @override
  String get travelDurationTitle => 'Tempoh Musafir';

  @override
  String get travelReferencesTitle => 'Rujukan Ilmiah';

  @override
  String get travelLearnMore => 'Ketahui lebih lanjut';

  @override
  String get travelHanafiDefaultTitle =>
      'Mengapa PrayCalc Menggunakan Tetapan Hanafi';

  @override
  String get travelDeeperScholarly => 'Perbincangan Ilmiah Lebih Mendalam';

  @override
  String get onboardingTitle1 => 'Waktu solat, di mana sahaja anda berada';

  @override
  String get onboardingBody1 =>
      'Waktu solat tepat GPS untuk setiap bandar di bumi. Subuh hingga Isyak, syuruk hingga Qiyam. Dikuasakan oleh enjin pengiraan kami sendiri, dibina untuk ketepatan.';

  @override
  String get onboardingTitle2 => 'Lokasi anda, waktu anda';

  @override
  String get onboardingBody2 =>
      'Cari mana-mana bandar atau biarkan GPS mengesan lokasi anda. PrayCalc mencari waktu untuk 5 juta bandar di seluruh dunia.';

  @override
  String get onboardingTitle3 => 'Jangan pernah tertinggal solat';

  @override
  String get onboardingBody3 =>
      'Azan pada waktu solat, peringatan sebelumnya. Agenda tersuai untuk sahur, kelas, dan lagi.';

  @override
  String get onboardingTitle4 => 'Semua yang anda perlukan';

  @override
  String get onboardingBody4 =>
      'Kompas kiblat, kalendar solat, fasa bulan Hijri, pembilang tasbih. Semua di satu tempat.';

  @override
  String get onboardingSkip => 'Langkau';

  @override
  String get onboardingGetStarted => 'Mula';

  @override
  String get onboardingSignInTitle => 'Log masuk ke PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Simpan sejarah solat anda dan segerak\nmerentas semua peranti anda.';

  @override
  String get onboardingContinueGoogle => 'Teruskan dengan Google';

  @override
  String get onboardingContinueWithoutAccount => 'Teruskan tanpa akaun';

  @override
  String get onboardingSigningIn => 'Sedang log masuk…';

  @override
  String get onboardingSelectLanguage => 'Pilih Bahasa';

  @override
  String get duaDhikrTitle => 'Doa & Zikir';

  @override
  String get duaDhikrTabDua => 'Doa';

  @override
  String get duaDhikrTabDhikr => 'Zikir';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbih';

  @override
  String get duaDhikrTabMorning => 'Pagi';

  @override
  String get duaDhikrTabEvening => 'Petang';

  @override
  String get duaDhikrMorningAdhkar => 'Zikir Pagi';

  @override
  String get duaDhikrEveningAdhkar => 'Zikir Petang';

  @override
  String get calGregToggle => 'Masihi';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Kalendar tahunan';

  @override
  String get calExportIcsTooltip => 'Eksport .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Tunjuk di peta';

  @override
  String get qiblaWaitingCompass => 'Menunggu kompas...';

  @override
  String get qiblaNoCompassSensor =>
      'Tiada sensor kompas. Menunjukkan arah kiblat secara statik.';

  @override
  String get qiblaAccuracyExcellent => 'Ketepatan cemerlang';

  @override
  String get qiblaAccuracyGood => 'Ketepatan baik';

  @override
  String get qiblaAccuracyFair =>
      'Ketepatan sederhana. Kalibrasikan dengan menggerakkan telefon dalam bentuk angka 8.';

  @override
  String get qiblaAccuracyLow =>
      'Ketepatan rendah. Kalibrasikan dengan menggerakkan telefon dalam bentuk angka 8.';

  @override
  String get qiblaToTheKaaba => 'ke Kaabah';

  @override
  String get qiblaYourLocation => 'Lokasi anda';

  @override
  String get qiblaGpsAccurate => 'Tepat GPS';

  @override
  String get qiblaCityCenter => 'Pusat bandar';

  @override
  String get moonIlluminatedLabel => 'Bercahaya';

  @override
  String get moonAgeLabel => 'Umur';

  @override
  String get moonFirstQtr => 'Suku Pertama';

  @override
  String get moonLastQtr => 'Suku Akhir';

  @override
  String get moonTonight => 'Malam Ini';

  @override
  String get moonTomorrow => 'Esok';

  @override
  String moonDaysAway(int days) {
    return '${days}h';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Tetapkan Lokasi Rumah';

  @override
  String get setHomeSearchHint => 'Cari bandar, pekan atau poskod…';

  @override
  String get setHomeClear => 'Kosongkan';

  @override
  String get setHomeUseCurrentLocation => 'Gunakan Lokasi Semasa';

  @override
  String get setHomeDetectAndSet =>
      'Kesan lokasi anda dan tetapkan sebagai rumah';

  @override
  String get setHomeAlreadySet => 'Rumah sudah ditetapkan';

  @override
  String setHomeSetAs(String city) {
    return '$city ditetapkan sebagai rumah';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Lokasi semasa ditetapkan sebagai rumah';

  @override
  String get setHomePermissionDenied =>
      'Kebenaran lokasi ditolak. Cari bandar di bawah.';

  @override
  String get setHomeGpsUnavailable => 'GPS tidak tersedia. Cari secara manual.';

  @override
  String get setHomeNoCitiesFound => 'Tiada bandar ditemui.';

  @override
  String get setHomeSearchPrompt => 'Cari bandar rumah anda';

  @override
  String get setHomeSearchBody =>
      'Taip di atas untuk mencari, atau gunakan lokasi semasa anda. Mod perjalanan akan mengesan apabila anda jauh dari rumah.';

  @override
  String get subscriptionYouHavePlus => 'Anda mempunyai Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Naik taraf ke Ummat+';

  @override
  String get subscriptionThankYou => 'Terima kasih kerana menyokong PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Buka kunci ciri premium merentas semua peranti anda.';

  @override
  String get subscriptionManageSub => 'Urus langganan';

  @override
  String get subscriptionWelcome => 'Selamat datang ke Ummat+!';

  @override
  String get subscriptionSubscribe => 'Langgan';

  @override
  String get subscriptionFreeFeatures => 'Ciri Percuma';

  @override
  String get subscriptionPlusFeatures => 'Ciri Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Waktu solat';

  @override
  String get subscriptionFeatureQibla => 'Kompas kiblat';

  @override
  String get subscriptionFeatureCalendar => 'Kalendar bulanan';

  @override
  String get subscriptionFeatureTasbeeh => 'Pembilang tasbih';

  @override
  String get subscriptionFeatureMoon => 'Bulan & Hijri';

  @override
  String get smartHomeAlertType => 'Jenis Makluman';

  @override
  String get smartHomeAlertModal => 'Modal skrin penuh';

  @override
  String get smartHomeAlertCorner => 'Pemberitahuan sudut';

  @override
  String get smartHomeAlertNone => 'Tiada (senyap)';

  @override
  String get smartHomePauseMedia => 'Jeda media semasa azan';

  @override
  String get smartHomeQuietHours => 'Waktu senyap';

  @override
  String get smartHomeQuietFrom => 'Dari';

  @override
  String get smartHomeQuietTo => 'Hingga';

  @override
  String get smartHomePrayerAudio => 'Audio setiap solat';

  @override
  String get smartHomeAudioAdhan => 'Azan';

  @override
  String get smartHomeAudioBeep => 'Bunyi bip';

  @override
  String get smartHomeAudioSilent => 'Senyap';

  @override
  String get aboutPrivacy => 'Dasar Privasi';

  @override
  String aboutVersion(String version) {
    return 'Versi $version';
  }

  @override
  String get notifDefaultAdhan => 'Azan Lalai';

  @override
  String get notifFajrAdhan => 'Azan Subuh';

  @override
  String get notifFajrAdhanSubtitle => 'Dimainkan pada waktu solat Subuh';

  @override
  String get notifRegularAdhan => 'Azan Biasa';

  @override
  String get notifRegularAdhanSubtitle =>
      'Dimainkan pada Zohor, Asar, Maghrib, Isyak';

  @override
  String get notifPerPrayerSettings => 'Tetapan Setiap Solat';

  @override
  String get notifPreview => 'Pratonton';

  @override
  String get tvSettingsTitle => 'Tetapan TV';

  @override
  String get tvDisplayMode => 'Mod Paparan';

  @override
  String get tvMasjidMode => 'Mod Masjid';

  @override
  String get tvMasjidModeSubtitle =>
      'Paparan papan tanda besar dengan waktu iqamah';

  @override
  String get tvMasjidName => 'Nama Masjid';

  @override
  String get tvMasjidNameTapToSet => 'Ketik untuk tetapkan';

  @override
  String get tvClock => 'Jam';

  @override
  String get tv24hFormat => 'Format 24 jam';

  @override
  String get tvIqamahOffsets => 'Offset Iqamah (minit selepas azan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset min selepas azan';
  }

  @override
  String get tvQrCode => 'Kod QR';

  @override
  String get tvShowQrCode => 'Tunjuk Kod QR';

  @override
  String get tvShowQrCodeSubtitle => 'Paparkan kod QR pada skrin masjid';

  @override
  String get tvQrCodeUrl => 'URL Kod QR';

  @override
  String get tvAmbientModeSection => 'Mod Ambien';

  @override
  String get tvIdleTimeout => 'Tamat masa senyap';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes minit sebelum ambien diaktifkan';
  }

  @override
  String get tvPhotoInterval => 'Selang foto';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds saat antara foto';
  }

  @override
  String get tvBackground => 'Latar Belakang';

  @override
  String get tvPhotoCategory => 'Kategori foto';

  @override
  String get tvLocation => 'Lokasi';

  @override
  String get tvChangeCity => 'Tukar Bandar';

  @override
  String get tvChangeCitySubtitle => 'Cari bandar berbeza';

  @override
  String get tvScreensaverBg => 'Latar Penyelamat Skrin';

  @override
  String get tvScreensaverPhotos => 'Foto';

  @override
  String get tvScreensaverPattern => 'Corak geometri';

  @override
  String get tvScreensaverBoth => 'Foto + corak';

  @override
  String get tvCategoryAll => 'Semua kategori';

  @override
  String get tvCategoryMasjids => 'Masjid';

  @override
  String get tvCategoryInteriors => 'Dalaman';

  @override
  String get tvCategoryGeometric => 'Geometri';

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
  String get tvSystemDefault => 'Lalai sistem';

  @override
  String get smartHomeIntegrations => 'Integrasi';

  @override
  String get smartHomeLinkedSpeakers => 'Pembesar Suara & Paparan Dipautkan';

  @override
  String get smartHomeAlertDisplay => 'Paparan Makluman';

  @override
  String get smartHomeAtAdhanShow => 'Pada waktu azan tunjukkan';

  @override
  String get smartHomePauseMediaTitle => 'Jeda media pada waktu azan';

  @override
  String get smartHomePauseMediaSubtitle =>
      'Disambung semula selepas azan tamat';

  @override
  String get smartHomePrayerAudioSection => 'Audio Solat';

  @override
  String get smartHomeQuietHoursSection => 'Waktu Senyap';

  @override
  String get smartHomeEnableQuietHours => 'Aktifkan waktu senyap';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Semua makluman rumah pintar disenyapkan';

  @override
  String get smartHomeNoDevices => 'Belum ada peranti dipautkan';

  @override
  String get smartHomeNoDevicesDesc =>
      'Pautkan Google Home atau Alexa di atas, kemudian pembesar suara dan paparan anda akan muncul di sini.';

  @override
  String get smartHomeRequiresPlus => 'Rumah Pintar memerlukan Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Kawal pengumuman solat di Google Home, Alexa, Siri, dan Home Assistant. Tetapkan peranti yang memainkan azan, bila jeda media, dan tetapkan waktu senyap.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Siarkan azan pada pembesar suara dan paparan Nest.';

  @override
  String get smartHomeEnableAlexa => 'Aktifkan kemahiran PrayCalc di Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Tanya Siri tentang waktu solat atau tetapkan automasi.';

  @override
  String get smartHomeHassAdd =>
      'Tambah melalui HACS untuk sokongan automasi penuh.';

  @override
  String get smartHomeSetupGuide => 'Panduan persediaan';

  @override
  String get smartHomeSiriSetupTitle => 'Persediaan Pintasan Siri';

  @override
  String get smartHomeSiriStep1 =>
      'Buka aplikasi Pintasan pada iPhone atau iPad anda.';

  @override
  String get smartHomeSiriStep2 => 'Ketik \"+\" untuk cipta pintasan baharu.';

  @override
  String get smartHomeSiriStep3 => 'Cari \"PrayCalc\" dalam senarai tindakan.';

  @override
  String get smartHomeSiriStep4 =>
      'Tambah \"Waktu Solat Seterusnya\" atau \"Waktu Solat Hari Ini\".';

  @override
  String get smartHomeSiriStep5 =>
      'Secara pilihan, tambah ke automasi (cth. setiap hari pada waktu Subuh).';

  @override
  String get smartHomeSiriStep6 =>
      'Sebut \"Hey Siri, waktu solat seterusnya\" untuk menguji.';

  @override
  String get smartHomeSiriFootnote => 'Memerlukan iOS 16 atau lebih baharu.';

  @override
  String get smartHomeHassSetupTitle => 'Persediaan Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Pasang HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 => 'Dalam HACS, cari \"PrayCalc\" dan pasang.';

  @override
  String get smartHomeHassStep3 =>
      'Pergi ke Tetapan > Peranti & Perkhidmatan > Tambah Integrasi.';

  @override
  String get smartHomeHassStep4 => 'Cari \"PrayCalc\" dan pilih.';

  @override
  String get smartHomeHassStep5 =>
      'Masukkan kunci API PrayCalc anda (dijana dalam akaun anda).';

  @override
  String get smartHomeHassStep6 => 'Tetapkan lokasi dan kaedah pengiraan anda.';

  @override
  String get smartHomeHassFootnote =>
      'Memerlukan Home Assistant 2024.1+ dengan HACS.';

  @override
  String get smartHomeApiKey => 'Kunci API';

  @override
  String get smartHomeGenerateApiKey => 'Jana Kunci API';

  @override
  String get smartHomeApiKeyNotReady =>
      'Penjanaan kunci API akan tersedia setelah perkhidmatan pintar PrayCalc dilancarkan.';

  @override
  String get smartHomeApiKeyDesc =>
      'Anda memerlukan kunci API untuk menyambungkan Home Assistant ke akaun PrayCalc anda.';

  @override
  String get smartHomeLinkedStatus => 'Dipautkan';

  @override
  String get smartHomeNotLinkedStatus => 'Tidak dipautkan';

  @override
  String get smartHomeCouldNotOpen => 'Tidak dapat membuka pautan.';

  @override
  String get smartHomeDevices => 'Peranti';

  @override
  String get smartHomeAddDevice => 'Tambah Peranti';

  @override
  String get smartHomeDeleteDevice => 'Padam';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Alih keluar peranti ini?';

  @override
  String get smartHomeDeviceOnline => 'Dalam Talian';

  @override
  String get smartHomeDeviceOffline => 'Luar Talian';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Terakhir dilihat: $time';
  }

  @override
  String get smartHomeDeviceName => 'Nama peranti';

  @override
  String get smartHomeDeviceType => 'Jenis peranti';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Pembesar suara';

  @override
  String get smartHomeDeviceTypeWatch => 'Jam tangan';

  @override
  String get smartHomeDeviceTypeDesktop => 'Desktop';

  @override
  String get smartHomeDeviceTypeOther => 'Lain-lain';

  @override
  String get smartHomeDeviceAdhan => 'Pemberitahuan azan';

  @override
  String get smartHomeDeviceAdhanDesc => 'Terima amaran azan pada peranti ini';

  @override
  String get smartHomeDeviceVolume => 'Kelantangan';

  @override
  String get smartHomeDeviceAudioType => 'Jenis audio';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Solat yang diaktifkan';

  @override
  String get smartHomeDeviceSettings => 'Tetapan Peranti';

  @override
  String get smartHomeTesting => 'Menguji...';

  @override
  String get smartHomeTestSuccess => 'Sambungan disahkan';

  @override
  String get smartHomeTestFailed => 'Ujian sambungan gagal';

  @override
  String get smartHomePairTv => 'Pasangkan TV';

  @override
  String get smartHomePairingTv => 'Mendaftarkan TV...';

  @override
  String get smartHomePairTvSuccess => 'TV berjaya dipasangkan';

  @override
  String get smartHomePairTvFailed => 'Pemasangan TV gagal';

  @override
  String get smartHomeLoadingDevices => 'Memuatkan peranti...';

  @override
  String get smartHomeLoadingIntegrations => 'Memuatkan integrasi...';

  @override
  String get smartHomeServiceUnavailable =>
      'Perkhidmatan rumah pintar tidak tersedia buat masa ini. Sila cuba lagi kemudian.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total selesai';
  }

  @override
  String get adhkarReset => 'Set Semula';

  @override
  String get syncHistoryTitle => 'Sejarah Segerak';

  @override
  String get syncClearHistory => 'Kosongkan sejarah';

  @override
  String get syncNoConflicts =>
      'Tiada konflik segerak dikesan. Semua peranti disegerakkan.';

  @override
  String get syncDomainSettings => 'Tetapan';

  @override
  String get syncDomainCities => 'Bandar Disimpan';

  @override
  String get syncDomainPrayerLogs => 'Log Solat';

  @override
  String get syncTimeJustNow => 'baru sahaja';

  @override
  String syncTimeMinAgo(int min) {
    return '${min}m lepas';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '${hour}j lepas';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '${day}h lepas';
  }

  @override
  String get pinCity => 'Semat';

  @override
  String get pinMaxReached =>
      'Maksimum 5 bandar disemat. Naik taraf ke Ummat+ untuk lebih.';

  @override
  String pinCityUnpinned(String city) {
    return '$city dinyahsemat';
  }

  @override
  String get pinUndo => 'Buat Asal';

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
