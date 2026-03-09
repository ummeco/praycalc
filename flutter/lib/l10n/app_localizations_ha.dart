// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hausa (`ha`).
class AppLocalizationsHa extends AppLocalizations {
  AppLocalizationsHa([String locale = 'ha']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Asuba';

  @override
  String get prayerSunrise => 'Fitowar Rana';

  @override
  String get prayerDhuhr => 'Azahar';

  @override
  String get prayerAsr => 'La\'asar';

  @override
  String get prayerMaghrib => 'Magariba';

  @override
  String get prayerIsha => 'Isha\'i';

  @override
  String get prayerQiyam => 'Qiyamu';

  @override
  String get prayerSuhoor => 'Sahur';

  @override
  String get prayerIftar => 'Bude Baki';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabi\'ul Awwal';

  @override
  String get hijriRabiAlThani => 'Rabi\'ul Thani';

  @override
  String get hijriJumadaAlAwwal => 'Jumadal Ula';

  @override
  String get hijriJumadaAlThani => 'Jumadal Thani';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Sha\'aban';

  @override
  String get hijriRamadan => 'Ramadan';

  @override
  String get hijriShawwal => 'Shawwal';

  @override
  String get hijriDhulQidah => 'Dhul Qa\'ada';

  @override
  String get hijriDhulHijjah => 'Dhul Hijja';

  @override
  String get monthJan => 'Jan';

  @override
  String get monthFeb => 'Fab';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Afr';

  @override
  String get monthMay => 'May';

  @override
  String get monthJun => 'Yun';

  @override
  String get monthJul => 'Yul';

  @override
  String get monthAug => 'Agu';

  @override
  String get monthSep => 'Sat';

  @override
  String get monthOct => 'Okt';

  @override
  String get monthNov => 'Nuw';

  @override
  String get monthDec => 'Dis';

  @override
  String get monthJanuary => 'Janairu';

  @override
  String get monthFebruary => 'Fabrairu';

  @override
  String get monthMarch => 'Maris';

  @override
  String get monthApril => 'Afrilu';

  @override
  String get monthMayFull => 'Mayu';

  @override
  String get monthJune => 'Yuni';

  @override
  String get monthJuly => 'Yuli';

  @override
  String get monthAugust => 'Agusta';

  @override
  String get monthSeptember => 'Satumba';

  @override
  String get monthOctober => 'Oktoba';

  @override
  String get monthNovember => 'Nuwamba';

  @override
  String get monthDecember => 'Disamba';

  @override
  String get dayMonShort => 'Lit';

  @override
  String get dayTueShort => 'Tal';

  @override
  String get dayWedShort => 'Lar';

  @override
  String get dayThuShort => 'Alh';

  @override
  String get dayFriShort => 'Jum';

  @override
  String get daySatShort => 'Asb';

  @override
  String get daySunShort => 'Lah';

  @override
  String get dayMonday => 'Litinin';

  @override
  String get dayTuesday => 'Talata';

  @override
  String get dayWednesday => 'Laraba';

  @override
  String get dayThursday => 'Alhamis';

  @override
  String get dayFriday => 'Jumma\'a';

  @override
  String get daySaturday => 'Asabar';

  @override
  String get daySunday => 'Lahadi';

  @override
  String get daySuChart => 'Lh';

  @override
  String get dayMoChart => 'Lt';

  @override
  String get dayTuChart => 'Tl';

  @override
  String get dayWeChart => 'Lr';

  @override
  String get dayThChart => 'Al';

  @override
  String get dayFrChart => 'Jm';

  @override
  String get daySaChart => 'As';

  @override
  String get chooseCityLabel => 'Zaɓi birni';

  @override
  String get setCityFab => 'Saita birni';

  @override
  String prayerTimesError(Object error) {
    return 'Ba a iya lissafin lokutan salla ba.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer cikin';
  }

  @override
  String get ramadanMubarak => 'Barka da Ramadan';

  @override
  String ramadanDayProgress(int day) {
    return 'Rana $day / 30';
  }

  @override
  String get lastTenNights => 'Darewan Ƙarshe 10';

  @override
  String get laylatulQadr => 'Lailatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'M';

  @override
  String get homeNoCitySelected => 'Ba a zaɓi birni ba';

  @override
  String get homeNoCityHint => 'Danna sama don neman birninku ko kunna GPS.';

  @override
  String get homeCouldNotCalc => 'Ba a iya lissafin lokutan salla ba.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Lokutan\nWata';

  @override
  String get homeActionDuaDhikr => 'Addu\'a &\nZikiri';

  @override
  String get homeActionPrayerStats => 'Ƙididdigan\nSalla';

  @override
  String homePolarBanner(int count) {
    return 'Ba a iya lissafin lokutan salla $count don wurinku a wannan lokacin ba. Gwada kimantawar latitude mafi kusa a cikin saituna.';
  }

  @override
  String get settingsTitle => 'Saituna';

  @override
  String get settingsSectionPrayerCalc => 'Lissafin Salla';

  @override
  String get settingsCalcMethod => 'Hanyar Lissafi';

  @override
  String get settingsCalcMethodAuto => 'Kai-tsaye (Mai Motsi)';

  @override
  String get settingsHanafiAsr => 'La\'asar ta Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Faktor inuwa 2x (lokacin La\'asar na baya)';

  @override
  String get settingsSectionDisplay => 'Nuni';

  @override
  String get settings24hClock => 'Agogon sa\'o\'i 24';

  @override
  String get settingsFollowSystemTheme => 'Bi jigon tsarin';

  @override
  String get settingsDarkMode => 'Yanayin duhu';

  @override
  String get settingsSectionNotifications => 'Sanarwa';

  @override
  String get settingsPrayerNotifications => 'Sanarwar salla';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Azumi, tunatarwa, da saitunan kowane salla';

  @override
  String get settingsPrayerAgendas => 'Tsare-tsaren salla';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Tunatarwa na musamman da ke da alaƙa da lokutan salla';

  @override
  String get settingsAccount => 'Asusu';

  @override
  String get settingsSignInToSync => 'Shiga don daidaita';

  @override
  String get settingsSignInToSyncSubtitle => 'Ajiye bayananku a duk na\'urori';

  @override
  String get settingsHomeScreen => 'Babban Allo';

  @override
  String get settingsSkyGradient => 'Bango na sararin sama';

  @override
  String get settingsSkyGradientSubtitle =>
      'Launukan sararin sama masu motsi bisa lokacin rana';

  @override
  String get settingsWeatherGradient => 'Launin yanayi';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Daidaita launukan sama bisa yanayin gida';

  @override
  String get settingsCountdownAnimation => 'Motsin ƙidaya';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Zoben numfashi akan ƙidayar sallar gaba';

  @override
  String get settingsPrayerTracking => 'Bin Sawun Salla';

  @override
  String get settingsTrackMyPrayers => 'Bi sawun sallata';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Rubuta sallolinku da kuke kammala kowace rana';

  @override
  String get settingsPrayerStats => 'Ƙididdigan salla';

  @override
  String get settingsPrayerStatsSubtitle => 'Jeri, ginshiƙan mako da wata';

  @override
  String get settingsJumuahKahf => 'Tunatarwar Al-Kahf ta Jumu\'a';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Tunatarwa a ranar Jumu\'a don karanta Suratul Kahf';

  @override
  String get settingsTravel => 'Tafiya';

  @override
  String get settingsTravelMode => 'Yanayin tafiya';

  @override
  String get settingsTravelModeSubtitle =>
      'Gano ta atomatik lokacin da kuke nesa da gida kuma daidaita salla';

  @override
  String get settingsHomeLocation => 'Wurin gida';

  @override
  String get settingsHomeLocationNotSet =>
      'Ba a saita ba — danna don amfani da wurin yanzu';

  @override
  String get settingsClearHomeLocation => 'Share wurin gida';

  @override
  String get settingsTravelRulings => 'Hukunce-hukuncen sallar musafiri';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, haɗa salla, da jagororin musafiri';

  @override
  String get settingsSmartHome => 'Gida Mai Hankali';

  @override
  String get settingsSmartHomeIntegrations => 'Haɗin gida mai hankali';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Nunin TV';

  @override
  String get settingsTvHome => 'Babban nunin TV';

  @override
  String get settingsTvHomeSubtitle => 'Agogon salla na cikakken allo don TV';

  @override
  String get settingsMasjidDisplay => 'Nunin masallaci';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Teburin azumi/iqama don allon masallaci';

  @override
  String get settingsTvSettings => 'Saitunan TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Yanayin masallaci, gyaran iqama, yanayi';

  @override
  String get settingsAboutPrayCalc => 'Game da PrayCalc';

  @override
  String get syncSynced => 'An daidaita';

  @override
  String get syncSyncing => 'Ana daidaitawa...';

  @override
  String get syncOffline => 'Ba a layi ba';

  @override
  String get syncError => 'Kuskuren daidaitawa';

  @override
  String get notifSettingsTitle => 'Sanarwa da Azumi';

  @override
  String get notifAdhanLabel => 'Azumi';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Tunatarwa: minti $minutes kafin';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Ƙara: $pct%';
  }

  @override
  String get notifTestAdhan => 'Gwada azumi';

  @override
  String get notifModeOff => 'Kashe';

  @override
  String get notifModeReminderOnly => 'Tunatarwa kawai';

  @override
  String get notifModeArrival => 'A lokacin salla';

  @override
  String get notifModeBoth => 'Tunatarwa + lokacin salla';

  @override
  String get citySearchHint => 'Nemo birni…';

  @override
  String get citySearchDetectTooltip => 'Gano wurina';

  @override
  String get citySearchNoCityGps => 'Ba a iya gano birni daga GPS ba.';

  @override
  String get citySearchPermissionDenied => 'An ƙi izinin wuri. Nema da hannu.';

  @override
  String get citySearchNoResults => 'Ba a sami birni ba.';

  @override
  String get citySearchStartTyping => 'Fara rubuta don nema…';

  @override
  String get agendasTitle => 'Tsare-tsaren Salla';

  @override
  String get agendasEmpty =>
      'Babu tsare-tsare tukuna.\nDanna + don ƙara tunatarwa da ke da alaƙa da sallolinka.';

  @override
  String get agendasUndo => 'Komawa';

  @override
  String agendasRemoved(String label) {
    return 'An cire $label';
  }

  @override
  String get agendaNewTitle => 'Sabon Tsari';

  @override
  String get agendaEditTitle => 'Gyara Tsari';

  @override
  String get agendaSave => 'Ajiye';

  @override
  String get agendaLabelEmpty => 'Lakkabi ba zai zama komai ba';

  @override
  String get agendaLabelField => 'Lakkabi';

  @override
  String get agendaLabelHint => 'misali: Farka don Asuba';

  @override
  String get agendaPrayerSection => 'Salla';

  @override
  String get agendaTimeOffsetSection => 'Bambancin lokaci';

  @override
  String get agendaOffsetAtPrayerTime => 'A lokacin salla';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return 'minti $minutes kafin';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return 'minti $minutes bayan';
  }

  @override
  String get agendaRepeatSection => 'Maimaita';

  @override
  String get agendaNotifTypeSection => 'Nau\'in sanarwa';

  @override
  String get agendaNotifSilent => 'Shiru';

  @override
  String get agendaNotifSound => 'Sauti';

  @override
  String get agendaNotifVibrate => 'Girgiza';

  @override
  String get agendaDayM => 'Lt';

  @override
  String get agendaDayT => 'Tl';

  @override
  String get agendaDayW => 'Lr';

  @override
  String get agendaDayF => 'Jm';

  @override
  String get agendaDayS => 'As';

  @override
  String get moonTitle => 'Wata da Kalandar Hijiriya';

  @override
  String moonIlluminated(int pct) {
    return '$pct% mai haske';
  }

  @override
  String get moonFullTonight => 'Cikakken wata a daren yau!';

  @override
  String get moonNextTomorrow => 'Cikakken wata na gaba gobe';

  @override
  String moonNextDays(int days) {
    return 'Cikakken wata na gaba cikin kwanaki $days';
  }

  @override
  String moonAge(String age) {
    return 'Shekarun wata: kwanaki $age';
  }

  @override
  String get moonPhaseNewMoon => 'Sabon Wata';

  @override
  String get moonPhaseWaxingCrescent => 'Jinjirin Wata Mai Ƙaruwa';

  @override
  String get moonPhaseFirstQuarter => 'Kashi na Farko';

  @override
  String get moonPhaseWaxingGibbous => 'Wata Mai Ƙaruwa';

  @override
  String get moonPhaseFullMoon => 'Cikakken Wata';

  @override
  String get moonPhaseWaningGibbous => 'Wata Mai Raguwa';

  @override
  String get moonPhaseLastQuarter => 'Kashi na Ƙarshe';

  @override
  String get moonPhaseWaningCrescent => 'Jinjirin Wata Mai Raguwa';

  @override
  String get moonHilalVisibility => 'Ganin Hilal na Gaba';

  @override
  String get moonRegionMiddleEast => 'Gabas ta Tsakiya';

  @override
  String get moonRegionWestAfrica => 'Yammacin Afirka';

  @override
  String get moonRegionSouthAsia => 'Kudancin Asiya';

  @override
  String get moonRegionEurope => 'Turai';

  @override
  String get moonRegionAmericas => 'Amurka';

  @override
  String get moonVisible => 'Ana Gani';

  @override
  String get moonNotVisible => 'Ba a Gani Ba';

  @override
  String get moonPossible => 'Mai Yiwuwa';

  @override
  String get moonUpcomingDates => 'Kwanakin Musulunci Masu Zuwa';

  @override
  String get hijriTodayLabel => 'Yau a Kalandar Hijiriya';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year H yana farawa';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'kwanaki $days suna sauran';
  }

  @override
  String get moonLunarCycle => 'Zagayen Wata';

  @override
  String moonDayOfCycle(int day) {
    return 'Rana $day cikin ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'Hasashen Ganin Hilal';

  @override
  String get moonHilalVisibilityMap => 'Taswirar Ganin Hilal';

  @override
  String moonDayN(int day) {
    return 'Rana $day';
  }

  @override
  String get moonGlobalSighting => 'Ganin Duniya';

  @override
  String get moonZoneNakedEye => 'Ido Tsirara';

  @override
  String get moonZoneBinoculars => 'Na\'urar Hango';

  @override
  String get moonZoneVeryDifficult => 'Mai Wuya Sosai';

  @override
  String get moonZoneNotVisible => 'Ba a Gani Ba';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H mai yiwuwa kwanaki 29 ne. Ana sa ran a ga hilal a rana ta 29, in sha Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H mai yiwuwa kwanaki 30 ne. Hilal ba zai yiwu a rana ta 29 ba — wata zai cika kwanaki 30.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Saudiyya';

  @override
  String get moonFCNACalc => 'FCNA / Liss.';

  @override
  String get moonNorthAmerica => 'Arewacin Amurka';

  @override
  String moonNDays(int days) {
    return 'kwanaki $days';
  }

  @override
  String moonStarts(String month) {
    return '$month yana farawa:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Shekarun wata a fadin rana: sa\'o\'i $hours';
  }

  @override
  String get moon7DayLunarCalendar => 'Kalandar Wata na Kwanaki 7';

  @override
  String get moonUpcomingIslamicEvents => 'Abubuwan Musulunci Masu Zuwa';

  @override
  String get moonTodayLabel => 'Yau';

  @override
  String get moonTomorrowLabel => 'Gobe';

  @override
  String get calDateCol => 'Kwanan';

  @override
  String get calHijriCol => 'Hijiriya';

  @override
  String get calFajrCol => 'Asuba';

  @override
  String get calSunriseCol => 'Fitowar Rana';

  @override
  String get calDhuhrCol => 'Azahar';

  @override
  String get calAsrCol => 'La\'asar';

  @override
  String get calMaghribCol => 'Magariba';

  @override
  String get calIshaCol => 'Isha\'i';

  @override
  String get calNoCityText =>
      'Saita birninku da farko\ndon ganin kalandar salla.';

  @override
  String get calShareTooltip => 'Raba kalanda';

  @override
  String get calPrevMonthTooltip => 'Watan da ya gabata';

  @override
  String get calNextMonthTooltip => 'Wata mai zuwa';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Lokutan Salla — $month';
  }

  @override
  String get qiblaTitle => 'Alƙibla';

  @override
  String get qiblaSwitchToCompass => 'Canja zuwa kamfas';

  @override
  String get qiblaSwitchToAR => 'Canja zuwa kyamarar AR';

  @override
  String get qiblaNoCityText =>
      'Saita birninku da farko\ndon lissafin fuskantar Alƙibla.';

  @override
  String get qiblaCompassUnavailable =>
      'Masu aunin kamfas ba su nan a wannan na\'urar.';

  @override
  String get qiblaCalibrate => 'Daidaita: motsa wayarka ta siffar lamba 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° daga Arewa';
  }

  @override
  String qiblaFrom(String city) {
    return 'Daga $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km daga Ka\'aba';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km daga Ka\'aba';
  }

  @override
  String get qiblaFacingQibla => 'Fuskantar Alƙibla ✓';

  @override
  String get tasbeehTitle => 'Tasbihi';

  @override
  String get tasbeehResetTooltip => 'Sake saita';

  @override
  String get tasbeehTapToSwitch => 'Danna lakkabi don canzawa';

  @override
  String get tasbeehTapToCount => 'Danna ko\'ina don ƙidaya';

  @override
  String get tasbeehResetDialogTitle => 'Sake saita ƙidayar?';

  @override
  String get tasbeehResetDialogContent =>
      'Wannan zai sake saita adadin zuwa sifili.';

  @override
  String get tasbeehCancel => 'Soke';

  @override
  String get tasbeehReset => 'Sake Saita';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Yau: zikiri $count';
  }

  @override
  String get tasbeehLast7Days => 'Kwanaki 7 da suka gabata';

  @override
  String get tasbeehNoHistory => 'Babu tarihi tukuna — fara ƙidayar!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbihi ta cika! zikiri $count';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Gida Mai Hankali';

  @override
  String get smartHomeSubtitle => 'Haɗa na\'urorinku da lokutan salla';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Tambayi Google game da lokutan salla da fuskantar Alƙibla';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Tambayi Alexa game da lokutan salla, sallar gaba, da ƙari';

  @override
  String get smartHomeSiri => 'Gajerun Hanyoyin Siri';

  @override
  String get smartHomeSiriDesc =>
      'Ƙirƙiri gajerun hanyoyi na musamman don lokutan salla';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Sarrafa fitila, nuni, da tunatarwa a lokutan salla ta atomatik';

  @override
  String get smartHomeLinkAccount => 'Haɗa Asusu';

  @override
  String get smartHomeLinked => 'An Haɗa';

  @override
  String get smartHomeUnlink => 'Cire Haɗi';

  @override
  String get smartHomeSetupInstructions => 'Umarnin Saitawa';

  @override
  String get smartHomeRequiresUmmatPlus => 'Yana Buƙatar Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Warware Matsaloli';

  @override
  String get smartHomeTestConnection => 'Gwada Haɗi';

  @override
  String get smartHomeConnectionSuccess => 'An haɗa cikin nasara';

  @override
  String get smartHomeConnectionFailed => 'Haɗin ya kasa. Duba haɗin asusunku.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Fasalolin lokutan salla na musamman';

  @override
  String get subscriptionUpgrade => 'Haɓaka zuwa Ummat+';

  @override
  String get subscriptionRestore => 'Dawo da Siye';

  @override
  String get subscriptionManage => 'Sarrafa Biyan Kuɗi';

  @override
  String get subscriptionCancel => 'Soke Biyan Kuɗi';

  @override
  String get subscriptionActive => 'Mai Aiki';

  @override
  String get subscriptionExpired => 'Ya Ƙare';

  @override
  String get subscriptionFree => 'Kyauta';

  @override
  String get subscriptionFreeDesc => 'Lokutan salla na asali, Alƙibla, kalanda';

  @override
  String get subscriptionPlusDesc =>
      'Gida mai hankali, nunin TV, widgets, da ƙari';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return 'Tambayoyi $count na kyauta sun rage';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/shekara';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/wata';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Haɗin gida mai hankali';

  @override
  String get subscriptionFeatureTV => 'Yanayin nunin TV';

  @override
  String get subscriptionFeatureWidgets => 'Widgets na babban allo';

  @override
  String get subscriptionFeatureWatch => 'Fasalolin agogo';

  @override
  String get subscriptionFeatureSync => 'Daidaitawa tsakanin na\'urori';

  @override
  String get subscriptionFeatureAdFree => 'Ba tare da talla ba';

  @override
  String get watchTitle => 'Agogo';

  @override
  String get watchNextPrayer => 'Sallar Gaba';

  @override
  String get watchAllPrayers => 'Dukkan Salloli';

  @override
  String get watchComplication => 'Fasali';

  @override
  String get nextPrayer => 'Sallar gaba';

  @override
  String get allPrayers => 'Dukkan salloli';

  @override
  String get today => 'Yau';

  @override
  String get tomorrow => 'Gobe';

  @override
  String get thisWeek => 'Wannan makon';

  @override
  String get thisMonth => 'Wannan watan';

  @override
  String get loginCreateAccount => 'Ƙirƙiri Asusu';

  @override
  String get loginSignIn => 'Shiga';

  @override
  String get loginWelcomeBack => 'Barka da dawowa';

  @override
  String get loginJoinPrayCalc => 'Shiga PrayCalc';

  @override
  String get loginSyncSubtitle => 'Daidaita bayanan sallarka a duk na\'urori';

  @override
  String get loginContinueGoogle => 'Ci gaba da Google';

  @override
  String get loginOr => 'ko';

  @override
  String get loginSigningIn => 'Ana shiga…';

  @override
  String get loginNameLabel => 'Sunan nuni (zaɓi)';

  @override
  String get loginEmailLabel => 'Imel';

  @override
  String get loginPasswordLabel => 'Kalmar sirri';

  @override
  String get loginEmailRequired => 'Ana buƙatar imel';

  @override
  String get loginEmailInvalid => 'Shigar da adireshin imel mai inganci';

  @override
  String get loginPasswordRequired => 'Ana buƙatar kalmar sirri';

  @override
  String get loginPasswordMinLength =>
      'Kalmar sirri dole ta kasance haruffa 8 ko fiye';

  @override
  String get loginForgotPassword => 'An mance kalmar sirri?';

  @override
  String get loginEnterEmailFirst => 'Shigar da adireshin imelku da farko';

  @override
  String get loginResetSent => 'An aika imel ɗin sake saita kalmar sirri';

  @override
  String get loginResetFailed => 'Ba a iya aika imel ɗin sake saita ba';

  @override
  String get loginNewToPrayCalc => 'Sabo ne ga PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Kuna da asusu?';

  @override
  String get accountTitle => 'Asusu';

  @override
  String get accountNotSignedIn => 'Ba a shiga ba';

  @override
  String get accountSyncSection => 'Daidaitawa';

  @override
  String get accountSyncStatus => 'Yanayin daidaitawa';

  @override
  String get accountSyncNow => 'Daidaita yanzu';

  @override
  String get accountSyncHistory => 'Tarihin daidaitawa';

  @override
  String get accountNoConflicts => 'Ba a gano rikici ba';

  @override
  String accountConflictsResolved(int count) {
    return '$count an warware';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'An daidaita $time';
  }

  @override
  String get accountOfflineStatus =>
      'Ba a layi ba. An ajiye canje-canje a cikin gida.';

  @override
  String get accountSyncErrorStatus =>
      'Kuskuren daidaitawa. Za a sake gwadawa.';

  @override
  String get accountDataSection => 'Bayanai';

  @override
  String get accountExportData => 'Fitar da bayanai';

  @override
  String get accountExportSubtitle => 'Sauke saitunanku da rahoton salloli';

  @override
  String get accountExportFailed => 'Ba a iya fitar da bayanai ba';

  @override
  String get accountSignOutTitle => 'Fita';

  @override
  String get accountSignOutBody =>
      'Za a ajiye bayananku na cikin gida. Sake shiga don ci gaba da daidaitawa.';

  @override
  String get accountDeleteAccount => 'Share asusu';

  @override
  String get accountDeleteSubtitle => 'Share asusunku da bayanai har abada';

  @override
  String get accountDeleteBody =>
      'Wannan zai share asusunku da dukkan bayanan da aka daidaita har abada. Ba za a share bayananku na cikin gida a wannan na\'urar ba.\n\nBa za a iya komawa ba.';

  @override
  String get accountDeleted => 'An share asusu';

  @override
  String get accountDeleteFailed => 'Ba a iya share asusu ba';

  @override
  String get accountTimeJustNow => 'yanzu';

  @override
  String accountTimeMinAgo(int min) {
    return 'minti $min da suka gabata';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return 'sa\'o\'i $hour da suka gabata';
  }

  @override
  String accountTimeDayAgo(int day) {
    return 'kwanaki $day da suka gabata';
  }

  @override
  String get statsTitle => 'Ƙididdigan Salla';

  @override
  String get statsShareTooltip => 'Raba ƙididdiga';

  @override
  String get statsTodayPrayers => 'Sallolin Yau';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Jeri';

  @override
  String get statsDays => 'kwanaki';

  @override
  String get statsThisWeek => 'Wannan Makon';

  @override
  String get statsCompletion => 'kammala';

  @override
  String get statsThisMonth => 'Wannan Watan';

  @override
  String get statsMostMissed => 'Mafi Yawan Kuskure';

  @override
  String get statsThisWeekLabel => 'wannan makon';

  @override
  String get statsWeeklyChart => 'Kammalawa ta Mako ta Salla';

  @override
  String get statsMonthlyChart => 'Kammalawa ta Wata ta Salla';

  @override
  String statsTotalLogged(int count) {
    return 'jimlar salloli $count da aka rubuta';
  }

  @override
  String get statsKeepItUp => 'Ci gaba!';

  @override
  String get statsShareTitle => 'Ƙididdigan Salla na PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Jeri: kwanaki $days';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Mako: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Wata: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Bayani na mako:';

  @override
  String get aboutTitle => 'Game da PrayCalc';

  @override
  String get aboutWebsite => 'Yanar gizo';

  @override
  String get aboutContact => 'Tuntuɓi';

  @override
  String get aboutLicenses => 'Lasisi na Buɗe Tushe';

  @override
  String get aboutCouldNotOpen => 'Ba a iya buɗe hanyar haɗin ba.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. An kiyaye dukkan haƙƙoƙi.\n\nAna lissafin lokutan salla ta amfani da injin pray_calc_dart. Daidaito ya dogara da wurin GPS ɗinku da hanyar lissafin da aka zaɓa.';
  }

  @override
  String get commonCancel => 'Soke';

  @override
  String get commonSave => 'Ajiye';

  @override
  String get commonDelete => 'Share';

  @override
  String get commonEdit => 'Gyara';

  @override
  String get commonRetry => 'Sake Gwadawa';

  @override
  String get commonClose => 'Rufe';

  @override
  String get commonDone => 'An Gama';

  @override
  String get commonBack => 'Baya';

  @override
  String get commonNext => 'Na Gaba';

  @override
  String get commonSkip => 'Tsallaka';

  @override
  String get commonContinue => 'Ci Gaba';

  @override
  String get commonOk => 'To';

  @override
  String get commonYes => 'Ee';

  @override
  String get commonNo => 'A\'a';

  @override
  String get commonShare => 'Raba';

  @override
  String get commonCopy => 'Kwafi';

  @override
  String get commonCopied => 'An kwafi zuwa allo';

  @override
  String get commonLoading => 'Ana lodawa...';

  @override
  String get commonError => 'Wani abu ya yi kuskure';

  @override
  String get commonErrorRetry =>
      'Wani abu ya yi kuskure. Danna don sake gwadawa.';

  @override
  String get commonNoInternet => 'Babu haɗin intanet';

  @override
  String get commonOfflineMode => 'Yanayin ba da layi';

  @override
  String get commonSignIn => 'Shiga';

  @override
  String get commonSignOut => 'Fita';

  @override
  String get commonSignUp => 'Yi rajista';

  @override
  String get commonProfile => 'Bayani';

  @override
  String get commonAccount => 'Asusu';

  @override
  String get commonAbout => 'Game da';

  @override
  String commonVersion(String version) {
    return 'Siga $version';
  }

  @override
  String get commonPrivacyPolicy => 'Manufar Sirri';

  @override
  String get commonTermsOfService => 'Sharuɗɗan Aiki';

  @override
  String get commonRateApp => 'Ka kayyade wannan app';

  @override
  String get commonFeedback => 'Aika ra\'ayi';

  @override
  String get commonHelp => 'Taimako';

  @override
  String get commonLanguage => 'Harshe';

  @override
  String get commonOpenSettings => 'Buɗe Saituna';

  @override
  String get travelNotificationTitle => 'Kuna tafiya yanzu';

  @override
  String get travelNotificationBody =>
      'Za a iya rage lokutan salla. Danna don sanin hukunce-hukuncen sallar musafiri.';

  @override
  String get travelRulingsTitle => 'Tafiya da Salla';

  @override
  String get travelRulingsIntro =>
      'Hukunce-hukuncen Musulunci na salla a lokacin tafiya, tare da nassoshi daga Alƙur\'ani da tarin Hadisi sahihi.';

  @override
  String get travelWhenTitle => 'Yaushe Ake Amfani da Tafiya?';

  @override
  String get travelQasrTitle => 'Rage Salla (Qasr)';

  @override
  String get travelJamTitle => 'Haɗa Salloli (Jam\')';

  @override
  String get travelDurationTitle => 'Tsawon Tafiya';

  @override
  String get travelReferencesTitle => 'Nassoshi';

  @override
  String get travelLearnMore => 'Ƙarin bayani';

  @override
  String get travelHanafiDefaultTitle =>
      'Me Ya Sa PrayCalc Ke Amfani da Saita na Hanafi';

  @override
  String get travelDeeperScholarly => 'Tattaunawa ta Ilimi Mai Zurfi';

  @override
  String get onboardingTitle1 => 'Lokutan salla, ko ina kuke';

  @override
  String get onboardingBody1 =>
      'Lokutan salla masu daidaito na GPS don kowace birni a duniya. Asuba zuwa Isha\'i, fitowar rana zuwa Qiyamu. Ana gudanar da shi ta injinmu na lissafi.';

  @override
  String get onboardingTitle2 => 'Wurinku, lokutanku';

  @override
  String get onboardingBody2 =>
      'Nemo kowace birni ko bari GPS ta gano wurinku. PrayCalc tana samun lokuta don birane miliyan 5 a duk faɗin duniya.';

  @override
  String get onboardingTitle3 => 'Kada ku rasa salla';

  @override
  String get onboardingBody3 =>
      'Azumi a lokacin salla, tunatarwa kafin haka. Tsare-tsare na musamman don sahur, darasi, da ƙari.';

  @override
  String get onboardingTitle4 => 'Duk abin da kuke buƙata';

  @override
  String get onboardingBody4 =>
      'Kamfas na Alƙibla, kalandar salla, yanayin watan Hijiriya, ƙidayar tasbihi. Duk a wuri ɗaya.';

  @override
  String get onboardingSkip => 'Tsallaka';

  @override
  String get onboardingGetStarted => 'Fara';

  @override
  String get onboardingSignInTitle => 'Shiga PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Ajiye tarihin sallarka kuma\ndaidaita a duk na\'urorinku.';

  @override
  String get onboardingContinueGoogle => 'Ci gaba da Google';

  @override
  String get onboardingContinueWithoutAccount => 'Ci gaba ba tare da asusu ba';

  @override
  String get onboardingSigningIn => 'Ana shiga…';

  @override
  String get onboardingSelectLanguage => 'Zaɓi Harshe';

  @override
  String get duaDhikrTitle => 'Addu\'a da Zikiri';

  @override
  String get duaDhikrTabDua => 'Addu\'o\'i';

  @override
  String get duaDhikrTabDhikr => 'Zikiri';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbihi';

  @override
  String get duaDhikrTabMorning => 'Safiya';

  @override
  String get duaDhikrTabEvening => 'Yamma';

  @override
  String get duaDhikrMorningAdhkar => 'Azkar na Safiya';

  @override
  String get duaDhikrEveningAdhkar => 'Azkar na Yamma';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijiriya';

  @override
  String get calYearlyTooltip => 'Kalandar shekara';

  @override
  String get calExportIcsTooltip => 'Fitar da .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Nuna a taswirar';

  @override
  String get qiblaWaitingCompass => 'Ana jiran kamfas...';

  @override
  String get qiblaNoCompassSensor =>
      'Babu na\'urar kamfas. Ana nuna fuskantar Alƙibla a tsaye.';

  @override
  String get qiblaAccuracyExcellent => 'Daidaito mai kyau sosai';

  @override
  String get qiblaAccuracyGood => 'Daidaito mai kyau';

  @override
  String get qiblaAccuracyFair =>
      'Matsakaicin daidaito. Daidaita ta hanyar motsa waya a siffar lamba 8.';

  @override
  String get qiblaAccuracyLow =>
      'Ƙarancin daidaito. Daidaita ta hanyar motsa waya a siffar lamba 8.';

  @override
  String get qiblaToTheKaaba => 'zuwa Ka\'aba';

  @override
  String get qiblaYourLocation => 'Wurinku';

  @override
  String get qiblaGpsAccurate => 'Daidai da GPS';

  @override
  String get qiblaCityCenter => 'Tsakiyar birni';

  @override
  String get moonIlluminatedLabel => 'Mai Haske';

  @override
  String get moonAgeLabel => 'Shekaru';

  @override
  String get moonFirstQtr => 'Kashi na Farko';

  @override
  String get moonLastQtr => 'Kashi na Ƙarshe';

  @override
  String get moonTonight => 'Daren Yau';

  @override
  String get moonTomorrow => 'Gobe';

  @override
  String moonDaysAway(int days) {
    return 'kwanaki $days';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Saita Wurin Gida';

  @override
  String get setHomeSearchHint => 'Nemo birni, ƙauye ko lambar gida…';

  @override
  String get setHomeClear => 'Share';

  @override
  String get setHomeUseCurrentLocation => 'Yi Amfani da Wurin Yanzu';

  @override
  String get setHomeDetectAndSet =>
      'Gano wurinku kuma saita shi a matsayin gida';

  @override
  String get setHomeAlreadySet => 'An riga an saita gida';

  @override
  String setHomeSetAs(String city) {
    return 'An saita $city a matsayin gida';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'An saita wurin yanzu a matsayin gida';

  @override
  String get setHomePermissionDenied => 'An ƙi izinin wuri. Nemo birni a ƙasa.';

  @override
  String get setHomeGpsUnavailable => 'GPS ba shi nan. Nemo da hannu.';

  @override
  String get setHomeNoCitiesFound => 'Ba a sami birane ba.';

  @override
  String get setHomeSearchPrompt => 'Nemo birnin gidanku';

  @override
  String get setHomeSearchBody =>
      'Rubuta sama don nema, ko yi amfani da wurinku na yanzu. Yanayin tafiya zai gano lokacin da kuke nesa da gida.';

  @override
  String get subscriptionYouHavePlus => 'Kuna da Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Haɓaka zuwa Ummat+';

  @override
  String get subscriptionThankYou => 'Na gode da tallafin PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Buɗe fasaloli na musamman a duk na\'urorinku.';

  @override
  String get subscriptionManageSub => 'Sarrafa biyan kuɗi';

  @override
  String get subscriptionWelcome => 'Barka da zuwa Ummat+!';

  @override
  String get subscriptionSubscribe => 'Yi rajista';

  @override
  String get subscriptionFreeFeatures => 'Fasaloli na Kyauta';

  @override
  String get subscriptionPlusFeatures => 'Fasalolin Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Lokutan salla';

  @override
  String get subscriptionFeatureQibla => 'Kamfas na Alƙibla';

  @override
  String get subscriptionFeatureCalendar => 'Kalandar wata';

  @override
  String get subscriptionFeatureTasbeeh => 'Ƙidayar tasbihi';

  @override
  String get subscriptionFeatureMoon => 'Wata da Hijiriya';

  @override
  String get smartHomeAlertType => 'Nau\'in Faɗakarwa';

  @override
  String get smartHomeAlertModal => 'Cikakken allo';

  @override
  String get smartHomeAlertCorner => 'Sanarwa a kusurwa';

  @override
  String get smartHomeAlertNone => 'Babu (shiru)';

  @override
  String get smartHomePauseMedia =>
      'Tsaya kafofin watsa labarai a lokacin azumi';

  @override
  String get smartHomeQuietHours => 'Sa\'o\'in shiru';

  @override
  String get smartHomeQuietFrom => 'Daga';

  @override
  String get smartHomeQuietTo => 'Zuwa';

  @override
  String get smartHomePrayerAudio => 'Sautin kowane salla';

  @override
  String get smartHomeAudioAdhan => 'Azumi';

  @override
  String get smartHomeAudioBeep => 'Kara';

  @override
  String get smartHomeAudioSilent => 'Shiru';

  @override
  String get aboutPrivacy => 'Manufar Sirri';

  @override
  String aboutVersion(String version) {
    return 'Siga $version';
  }

  @override
  String get notifDefaultAdhan => 'Azumi na Asali';

  @override
  String get notifFajrAdhan => 'Azumin Asuba';

  @override
  String get notifFajrAdhanSubtitle => 'Ana buga shi a lokacin sallar Asuba';

  @override
  String get notifRegularAdhan => 'Azumi na Yau da kullum';

  @override
  String get notifRegularAdhanSubtitle =>
      'Ana buga shi a Azahar, La\'asar, Magariba, Isha\'i';

  @override
  String get notifPerPrayerSettings => 'Saitunan Kowane Salla';

  @override
  String get notifPreview => 'Duba';

  @override
  String get tvSettingsTitle => 'Saitunan TV';

  @override
  String get tvDisplayMode => 'Yanayin Nuni';

  @override
  String get tvMasjidMode => 'Yanayin Masallaci';

  @override
  String get tvMasjidModeSubtitle => 'Babban nunin alama tare da lokutan iqama';

  @override
  String get tvMasjidName => 'Sunan Masallaci';

  @override
  String get tvMasjidNameTapToSet => 'Danna don saita';

  @override
  String get tvClock => 'Agogo';

  @override
  String get tv24hFormat => 'Tsarin sa\'o\'i 24';

  @override
  String get tvIqamahOffsets => 'Gyaran Iqama (minti bayan azumi)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'minti $offset bayan azumi';
  }

  @override
  String get tvQrCode => 'Lambar QR';

  @override
  String get tvShowQrCode => 'Nuna Lambar QR';

  @override
  String get tvShowQrCodeSubtitle => 'Nuna lambar QR a allon masallaci';

  @override
  String get tvQrCodeUrl => 'URL na Lambar QR';

  @override
  String get tvAmbientModeSection => 'Yanayin Muhalli';

  @override
  String get tvIdleTimeout => 'Lokacin rashin amfani';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'minti $minutes kafin muhalli ya fara';
  }

  @override
  String get tvPhotoInterval => 'Tazarar hoto';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'sakanni $seconds tsakanin hotuna';
  }

  @override
  String get tvBackground => 'Bango';

  @override
  String get tvPhotoCategory => 'Nau\'in hoto';

  @override
  String get tvLocation => 'Wuri';

  @override
  String get tvChangeCity => 'Canja Birni';

  @override
  String get tvChangeCitySubtitle => 'Nemo wani birni dabam';

  @override
  String get tvScreensaverBg => 'Bangon Kariyar Allo';

  @override
  String get tvScreensaverPhotos => 'Hotuna';

  @override
  String get tvScreensaverPattern => 'Tsarin lissafi';

  @override
  String get tvScreensaverBoth => 'Hotuna + tsari';

  @override
  String get tvCategoryAll => 'Duk nau\'uka';

  @override
  String get tvCategoryMasjids => 'Masallatai';

  @override
  String get tvCategoryInteriors => 'Cikin gida';

  @override
  String get tvCategoryGeometric => 'Lissafi';

  @override
  String get tvCategoryCalligraphy => 'Rubutu';

  @override
  String get tvCategoryLandscapes => 'Shimfidar ƙasa';

  @override
  String get tvCategoryRamadan => 'Ramadan';

  @override
  String get tvPhotoCategoryTitle => 'Nau\'in Hoto';

  @override
  String tvEnterHint(String title) {
    return 'Shigar da $title';
  }

  @override
  String get tvSystemDefault => 'Saita na tsarin';

  @override
  String get smartHomeIntegrations => 'Haɗe-haɗe';

  @override
  String get smartHomeLinkedSpeakers => 'Na\'urorin Sauti da Nuni da Aka Haɗa';

  @override
  String get smartHomeAlertDisplay => 'Nunin Faɗakarwa';

  @override
  String get smartHomeAtAdhanShow => 'A lokacin azumi nuna';

  @override
  String get smartHomePauseMediaTitle =>
      'Tsaya kafofin watsa labarai a lokacin azumi';

  @override
  String get smartHomePauseMediaSubtitle => 'Ana ci gaba bayan azumin ya ƙare';

  @override
  String get smartHomePrayerAudioSection => 'Sautin Salla';

  @override
  String get smartHomeQuietHoursSection => 'Sa\'o\'in Shiru';

  @override
  String get smartHomeEnableQuietHours => 'Kunna sa\'o\'in shiru';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Duk faɗakarwashin gida mai hankali suna shiru';

  @override
  String get smartHomeNoDevices => 'Babu na\'urori da aka haɗa tukuna';

  @override
  String get smartHomeNoDevicesDesc =>
      'Haɗa Google Home ko Alexa a sama, sannan na\'urorin sautinku da nuni za su bayyana a nan.';

  @override
  String get smartHomeRequiresPlus => 'Gida Mai Hankali yana buƙatar Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Sarrafa sanarwar salla a Google Home, Alexa, Siri, da Home Assistant. Saita waɗanne na\'urori suke buga azumi, yaushe ake tsayar da kafofin watsa labarai, da saita sa\'o\'in shiru.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Yaɗa azumi a na\'urorin sauti da nuni na Nest.';

  @override
  String get smartHomeEnableAlexa => 'Kunna ƙwarewar PrayCalc a Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Tambayi Siri game da lokutan salla ko saita atomatik.';

  @override
  String get smartHomeHassAdd => 'Ƙara ta HACS don cikakken tallafin atomatik.';

  @override
  String get smartHomeSetupGuide => 'Jagoran saitawa';

  @override
  String get smartHomeSiriSetupTitle => 'Saitawar Gajerun Hanyoyin Siri';

  @override
  String get smartHomeSiriStep1 =>
      'Buɗe app ɗin Gajerun Hanyoyi a iPhone ko iPad ɗinku.';

  @override
  String get smartHomeSiriStep2 =>
      'Danna \"+\" don ƙirƙiri sabon gajeriyar hanya.';

  @override
  String get smartHomeSiriStep3 => 'Nemo \"PrayCalc\" a cikin jerin ayyuka.';

  @override
  String get smartHomeSiriStep4 =>
      'Ƙara \"Lokacin Sallar Gaba\" ko \"Lokutan Salla na Yau\".';

  @override
  String get smartHomeSiriStep5 =>
      'A zaɓi, ƙara shi zuwa atomatik (misali kowace rana a lokacin Asuba).';

  @override
  String get smartHomeSiriStep6 =>
      'Ce \"Hey Siri, lokacin sallar gaba\" don gwadawa.';

  @override
  String get smartHomeSiriFootnote => 'Yana buƙatar iOS 16 ko baya.';

  @override
  String get smartHomeHassSetupTitle => 'Saitawar Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Shigar da HACS (Shagon Al\'ummar Home Assistant).';

  @override
  String get smartHomeHassStep2 =>
      'A cikin HACS, nemo \"PrayCalc\" kuma shigar.';

  @override
  String get smartHomeHassStep3 =>
      'Je zuwa Saituna > Na\'urori da Ayyuka > Ƙara Haɗawa.';

  @override
  String get smartHomeHassStep4 => 'Nemo \"PrayCalc\" kuma zaɓa shi.';

  @override
  String get smartHomeHassStep5 =>
      'Shigar da mabuɗin API ɗin PrayCalc ɗinku (an ƙirƙira a asusunku).';

  @override
  String get smartHomeHassStep6 => 'Saita wurinku da hanyar lissafi.';

  @override
  String get smartHomeHassFootnote =>
      'Yana buƙatar Home Assistant 2024.1+ tare da HACS.';

  @override
  String get smartHomeApiKey => 'Mabuɗin API';

  @override
  String get smartHomeGenerateApiKey => 'Ƙirƙiri Mabuɗin API';

  @override
  String get smartHomeApiKeyNotReady =>
      'Ƙirƙirar mabuɗin API za ta kasance da zarar an tura sabis ɗin PrayCalc mai hankali.';

  @override
  String get smartHomeApiKeyDesc =>
      'Kuna buƙatar mabuɗin API don haɗa Home Assistant da asusun PrayCalc ɗinku.';

  @override
  String get smartHomeLinkedStatus => 'An Haɗa';

  @override
  String get smartHomeNotLinkedStatus => 'Ba a haɗa ba';

  @override
  String get smartHomeCouldNotOpen => 'Ba a iya buɗe hanyar haɗin ba.';

  @override
  String get smartHomeDevices => 'Na\'urori';

  @override
  String get smartHomeAddDevice => 'Ƙara Na\'ura';

  @override
  String get smartHomeDeleteDevice => 'Share';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Cire wannan na\'urar?';

  @override
  String get smartHomeDeviceOnline => 'A kan layi';

  @override
  String get smartHomeDeviceOffline => 'Ba a kan layi ba';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'An gani a ƙarshe: $time';
  }

  @override
  String get smartHomeDeviceName => 'Sunan na\'ura';

  @override
  String get smartHomeDeviceType => 'Nau\'in na\'ura';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Lasifika';

  @override
  String get smartHomeDeviceTypeWatch => 'Agogo';

  @override
  String get smartHomeDeviceTypeDesktop => 'Kwamfuta';

  @override
  String get smartHomeDeviceTypeOther => 'Wani';

  @override
  String get smartHomeDeviceAdhan => 'Sanarwar azumi';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Karɓi sanarwar azumi a wannan na\'urar';

  @override
  String get smartHomeDeviceVolume => 'Ƙarar murya';

  @override
  String get smartHomeDeviceAudioType => 'Nau\'in sauti';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Sallolin da aka kunna';

  @override
  String get smartHomeDeviceSettings => 'Saitin Na\'ura';

  @override
  String get smartHomeTesting => 'Ana gwadawa...';

  @override
  String get smartHomeTestSuccess => 'An tabbatar da haɗi';

  @override
  String get smartHomeTestFailed => 'Gwajin haɗi ya gaza';

  @override
  String get smartHomePairTv => 'Haɗa TV';

  @override
  String get smartHomePairingTv => 'Ana rajista TV...';

  @override
  String get smartHomePairTvSuccess => 'An haɗa TV cikin nasara';

  @override
  String get smartHomePairTvFailed => 'Haɗa TV ya gaza';

  @override
  String get smartHomeLoadingDevices => 'Ana loda na\'urori...';

  @override
  String get smartHomeLoadingIntegrations => 'Ana loda haɗin gwiwa...';

  @override
  String get smartHomeServiceUnavailable =>
      'Sabis na gida mai wayo ba ya samuwa a yanzu. Da fatan za a sake gwadawa daga baya.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total an kammala';
  }

  @override
  String get adhkarReset => 'Sake Saita';

  @override
  String get syncHistoryTitle => 'Tarihin Daidaitawa';

  @override
  String get syncClearHistory => 'Share tarihi';

  @override
  String get syncNoConflicts =>
      'Ba a gano rikicin daidaitawa ba. Duk na\'urori sun daidaita.';

  @override
  String get syncDomainSettings => 'Saituna';

  @override
  String get syncDomainCities => 'Birane da Aka Ajiye';

  @override
  String get syncDomainPrayerLogs => 'Rahoton Salla';

  @override
  String get syncTimeJustNow => 'yanzu';

  @override
  String syncTimeMinAgo(int min) {
    return 'minti $min da suka gabata';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return 'sa\'o\'i $hour da suka gabata';
  }

  @override
  String syncTimeDayAgo(int day) {
    return 'kwanaki $day da suka gabata';
  }

  @override
  String get pinCity => 'Maƙala';

  @override
  String get pinMaxReached =>
      'Iyakar birane 5 da aka maƙala. Haɓaka zuwa Ummat+ don ƙari.';

  @override
  String pinCityUnpinned(String city) {
    return 'An cire maƙalar $city';
  }

  @override
  String get pinUndo => 'Komawa';

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
}
