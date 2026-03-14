// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Swahili (`sw`).
class AppLocalizationsSw extends AppLocalizations {
  AppLocalizationsSw([String locale = 'sw']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Alfajiri';

  @override
  String get prayerSunrise => 'Macheo';

  @override
  String get prayerDhuhr => 'Adhuhuri';

  @override
  String get prayerAsr => 'Alasiri';

  @override
  String get prayerMaghrib => 'Magharibi';

  @override
  String get prayerIsha => 'Ishaa';

  @override
  String get prayerQiyam => 'Qiyamu';

  @override
  String get prayerSuhoor => 'Daku';

  @override
  String get prayerIftar => 'Futari';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabiul-Awwal';

  @override
  String get hijriRabiAlThani => 'Rabiul-Thani';

  @override
  String get hijriJumadaAlAwwal => 'Jumadal-Ula';

  @override
  String get hijriJumadaAlThani => 'Jumadal-Thani';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Shaaban';

  @override
  String get hijriRamadan => 'Ramadhani';

  @override
  String get hijriShawwal => 'Shawwal';

  @override
  String get hijriDhulQidah => 'Dhul-Qaada';

  @override
  String get hijriDhulHijjah => 'Dhul-Hijja';

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
  String get monthAug => 'Ago';

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
  String get monthMarch => 'Machi';

  @override
  String get monthApril => 'Aprili';

  @override
  String get monthMayFull => 'Mei';

  @override
  String get monthJune => 'Juni';

  @override
  String get monthJuly => 'Julai';

  @override
  String get monthAugust => 'Agosti';

  @override
  String get monthSeptember => 'Septemba';

  @override
  String get monthOctober => 'Oktoba';

  @override
  String get monthNovember => 'Novemba';

  @override
  String get monthDecember => 'Desemba';

  @override
  String get dayMonShort => 'Jtt';

  @override
  String get dayTueShort => 'Jnn';

  @override
  String get dayWedShort => 'Jtn';

  @override
  String get dayThuShort => 'Alh';

  @override
  String get dayFriShort => 'Iju';

  @override
  String get daySatShort => 'Jms';

  @override
  String get daySunShort => 'Jpi';

  @override
  String get dayMonday => 'Jumatatu';

  @override
  String get dayTuesday => 'Jumanne';

  @override
  String get dayWednesday => 'Jumatano';

  @override
  String get dayThursday => 'Alhamisi';

  @override
  String get dayFriday => 'Ijumaa';

  @override
  String get daySaturday => 'Jumamosi';

  @override
  String get daySunday => 'Jumapili';

  @override
  String get daySuChart => 'Jp';

  @override
  String get dayMoChart => 'Jt';

  @override
  String get dayTuChart => 'Jn';

  @override
  String get dayWeChart => 'Jt';

  @override
  String get dayThChart => 'Al';

  @override
  String get dayFrChart => 'Ij';

  @override
  String get daySaChart => 'Jm';

  @override
  String get chooseCityLabel => 'Chagua jiji';

  @override
  String get setCityFab => 'Weka jiji';

  @override
  String prayerTimesError(Object error) {
    return 'Haiwezi kukokotoa nyakati za sala.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer katika';
  }

  @override
  String get ramadanMubarak => 'Ramadhani Mubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Siku $day / 30';
  }

  @override
  String get lastTenNights => 'Usiku 10 wa Mwisho';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'BK';

  @override
  String get homeNoCitySelected => 'Hakuna jiji lililochaguliwa';

  @override
  String get homeNoCityHint =>
      'Gusa hapo juu kutafuta jiji lako au uwashe GPS.';

  @override
  String get homeCouldNotCalc => 'Haiwezi kukokotoa nyakati za sala.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Nyakati\nza Mwezi';

  @override
  String get homeActionDuaDhikr => 'Dua &\nDhikri';

  @override
  String get homeActionPrayerStats => 'Takwimu\nza Sala';

  @override
  String homePolarBanner(int count) {
    return 'Nyakati $count za sala haziwezi kukokotolewa kwa eneo lako katika kipindi hiki (jua la usiku wa manane / usiku wa polar). Jaribu makadirio ya latitudo ya karibu katika mipangilio.';
  }

  @override
  String get settingsTitle => 'Mipangilio';

  @override
  String get settingsSectionPrayerCalc => 'Ukokotoaji wa Sala';

  @override
  String get settingsCalcMethod => 'Njia ya Ukokotoaji';

  @override
  String get settingsCalcMethodAuto => 'Otomatiki (Nguvu)';

  @override
  String get settingsHanafiAsr => 'Alasiri ya Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Kipengee cha kivuli 2x (wakati wa Alasiri wa baadaye)';

  @override
  String get settingsSectionDisplay => 'Onyesho';

  @override
  String get settings24hClock => 'Saa 24';

  @override
  String get settingsFollowSystemTheme => 'Fuata mandhari ya mfumo';

  @override
  String get settingsDarkMode => 'Hali ya giza';

  @override
  String get settingsSectionNotifications => 'Arifa';

  @override
  String get settingsPrayerNotifications => 'Arifa za sala';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhana, vikumbusho, na mipangilio kwa kila sala';

  @override
  String get settingsPrayerAgendas => 'Ratiba za sala';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Vikumbusho maalum vilivyounganishwa na nyakati za sala';

  @override
  String get settingsAccount => 'Akaunti';

  @override
  String get settingsSignInToSync => 'Ingia ili kusawazisha';

  @override
  String get settingsSignInToSyncSubtitle => 'Hifadhi data yako kati ya vifaa';

  @override
  String get settingsHomeScreen => 'Skrini ya Nyumbani';

  @override
  String get settingsSkyGradient => 'Mandhari ya anga';

  @override
  String get settingsSkyGradientSubtitle =>
      'Rangi za anga zenye uhuishaji zinazofanana na wakati wa siku';

  @override
  String get settingsWeatherGradient => 'Mandhari ya hali ya hewa';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Rekebisha rangi za anga kulingana na hali ya hewa ya eneo';

  @override
  String get settingsCountdownAnimation => 'Uhuishaji wa kuhesabu';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Pete ya kupumua kwenye kuhesabu kwa sala inayofuata';

  @override
  String get settingsPrayerTracking => 'Ufuatiliaji wa Sala';

  @override
  String get settingsTrackMyPrayers => 'Fuatilia sala zangu';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Andika sala unazokamilisha kila siku';

  @override
  String get settingsPrayerStats => 'Takwimu za sala';

  @override
  String get settingsPrayerStatsSubtitle => 'Mfululizo, chati za wiki na mwezi';

  @override
  String get settingsJumuahKahf => 'Kikumbusho cha Al-Kahf Ijumaa';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Kikumbusho siku za Ijumaa kusoma Surat Al-Kahf';

  @override
  String get settingsTravel => 'Safari';

  @override
  String get settingsTravelMode => 'Hali ya safari';

  @override
  String get settingsTravelModeSubtitle =>
      'Tambua kiotomatiki unapokuwa mbali na nyumbani na rekebisha sala';

  @override
  String get settingsHomeLocation => 'Eneo la nyumbani';

  @override
  String get settingsHomeLocationNotSet =>
      'Haijawekwa — gusa kutumia eneo la sasa';

  @override
  String get settingsClearHomeLocation => 'Futa eneo la nyumbani';

  @override
  String get settingsTravelRulings => 'Hukumu za sala ya msafiri';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, kuunganisha, na miongozo ya msafiri';

  @override
  String get settingsSmartHome => 'Nyumba Erevu';

  @override
  String get settingsSmartHomeIntegrations => 'Muunganisho wa nyumba erevu';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Onyesho la TV';

  @override
  String get settingsTvHome => 'Onyesho la nyumbani la TV';

  @override
  String get settingsTvHomeSubtitle => 'Saa ya sala ya skrini kamili kwa TV';

  @override
  String get settingsMasjidDisplay => 'Onyesho la msikiti';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Jedwali la adhana/iqama kwa skrini za msikiti';

  @override
  String get settingsTvSettings => 'Mipangilio ya TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Hali ya msikiti, uambatanisho wa iqama, mazingira';

  @override
  String get settingsAboutPrayCalc => 'Kuhusu PrayCalc';

  @override
  String get syncSynced => 'Imesawazishwa';

  @override
  String get syncSyncing => 'Inasawazisha...';

  @override
  String get syncOffline => 'Nje ya mtandao';

  @override
  String get syncError => 'Hitilafu ya usawazishaji';

  @override
  String get notifSettingsTitle => 'Arifa na Adhana';

  @override
  String get notifAdhanLabel => 'Adhana';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Kikumbusho: dakika $minutes kabla';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Sauti: $pct%';
  }

  @override
  String get notifTestAdhan => 'Jaribu adhana';

  @override
  String get notifModeOff => 'Zima';

  @override
  String get notifModeReminderOnly => 'Kikumbusho tu';

  @override
  String get notifModeArrival => 'Wakati wa sala';

  @override
  String get notifModeBoth => 'Kikumbusho + wakati wa sala';

  @override
  String get citySearchHint => 'Tafuta jiji…';

  @override
  String get citySearchDetectTooltip => 'Tambua eneo langu';

  @override
  String get citySearchNoCityGps => 'Haiwezi kutambua jiji kutoka GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Ruhusa ya eneo imekataliwa. Tafuta kwa mkono.';

  @override
  String get citySearchNoResults => 'Hakuna miji iliyopatikana.';

  @override
  String get citySearchStartTyping => 'Anza kuandika kutafuta…';

  @override
  String get agendasTitle => 'Ratiba za Sala';

  @override
  String get agendasEmpty =>
      'Hakuna ratiba bado.\nGusa + kuongeza kikumbusho kilichounganishwa na sala zako.';

  @override
  String get agendasUndo => 'Tendua';

  @override
  String agendasRemoved(String label) {
    return '$label imeondolewa';
  }

  @override
  String get agendaNewTitle => 'Ratiba Mpya';

  @override
  String get agendaEditTitle => 'Hariri Ratiba';

  @override
  String get agendaSave => 'Hifadhi';

  @override
  String get agendaLabelEmpty => 'Lebo haiwezi kuwa tupu';

  @override
  String get agendaLabelField => 'Lebo';

  @override
  String get agendaLabelHint => 'mf. Amka kwa Alfajiri';

  @override
  String get agendaPrayerSection => 'Sala';

  @override
  String get agendaTimeOffsetSection => 'Tofauti ya wakati';

  @override
  String get agendaOffsetAtPrayerTime => 'Wakati wa sala';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return 'dakika $minutes kabla';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return 'dakika $minutes baada';
  }

  @override
  String get agendaRepeatSection => 'Rudia';

  @override
  String get agendaNotifTypeSection => 'Aina ya arifa';

  @override
  String get agendaNotifSilent => 'Kimya';

  @override
  String get agendaNotifSound => 'Sauti';

  @override
  String get agendaNotifVibrate => 'Mtetemo';

  @override
  String get agendaDayM => 'Jt';

  @override
  String get agendaDayT => 'Jn';

  @override
  String get agendaDayW => 'Jt';

  @override
  String get agendaDayF => 'Ij';

  @override
  String get agendaDayS => 'Jm';

  @override
  String get moonTitle => 'Mwezi na Kalenda ya Hijri';

  @override
  String moonIlluminated(int pct) {
    return '$pct% iliyoangazwa';
  }

  @override
  String get moonFullTonight => 'Mwezi mpevu usiku huu!';

  @override
  String get moonNextTomorrow => 'Mwezi mpevu ujao kesho';

  @override
  String moonNextDays(int days) {
    return 'Mwezi mpevu ujao katika siku $days';
  }

  @override
  String moonAge(String age) {
    return 'Umri wa mwezi: siku $age';
  }

  @override
  String get moonPhaseNewMoon => 'Mwezi Mpya';

  @override
  String get moonPhaseWaxingCrescent => 'Hilali Inayokua';

  @override
  String get moonPhaseFirstQuarter => 'Robo ya Kwanza';

  @override
  String get moonPhaseWaxingGibbous => 'Ubarabara Unaokua';

  @override
  String get moonPhaseFullMoon => 'Mwezi Mpevu';

  @override
  String get moonPhaseWaningGibbous => 'Ubarabara Unaopungua';

  @override
  String get moonPhaseLastQuarter => 'Robo ya Mwisho';

  @override
  String get moonPhaseWaningCrescent => 'Hilali Inayopungua';

  @override
  String get moonHilalVisibility => 'Kuonekana kwa Hilali Ijayo';

  @override
  String get moonRegionMiddleEast => 'Mashariki ya Kati';

  @override
  String get moonRegionWestAfrica => 'Afrika Magharibi';

  @override
  String get moonRegionSouthAsia => 'Asia Kusini';

  @override
  String get moonRegionEurope => 'Ulaya';

  @override
  String get moonRegionAmericas => 'Amerika';

  @override
  String get moonVisible => 'Inaonekana';

  @override
  String get moonNotVisible => 'Haionekani';

  @override
  String get moonPossible => 'Inawezekana';

  @override
  String get moonUpcomingDates => 'Tarehe za Kiislamu Zinazokuja';

  @override
  String get hijriTodayLabel => 'Leo katika Kalenda ya Hijri';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadhani $year H inaanza';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'siku $days zimebaki';
  }

  @override
  String get moonLunarCycle => 'Mzunguko wa Mwezi';

  @override
  String moonDayOfCycle(int day) {
    return 'Siku $day kati ya ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'Utabiri wa Kuona Hilali';

  @override
  String get moonHilalVisibilityMap => 'Ramani ya Kuonekana kwa Hilali';

  @override
  String moonDayN(int day) {
    return 'Siku $day';
  }

  @override
  String get moonGlobalSighting => 'Kuona Duniani';

  @override
  String get moonZoneNakedEye => 'Jicho la Kawaida';

  @override
  String get moonZoneBinoculars => 'Darubini';

  @override
  String get moonZoneVeryDifficult => 'Vigumu Sana';

  @override
  String get moonZoneNotVisible => 'Haionekani';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H itakuwa na siku 29 labda. Hilali inatarajiwa kuonekana siku ya 29, in shaa Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H itakuwa na siku 30 labda. Hilali haiwezekani siku ya 29 — mwezi unakamilika siku 30.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Saudi Arabia';

  @override
  String get moonFCNACalc => 'FCNA / Hes.';

  @override
  String get moonNorthAmerica => 'Amerika Kaskazini';

  @override
  String moonNDays(int days) {
    return 'siku $days';
  }

  @override
  String moonStarts(String month) {
    return '$month inaanza:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Umri wa mwezi wakati wa machweo: saa $hours';
  }

  @override
  String get moon7DayLunarCalendar => 'Kalenda ya Mwezi ya Siku 7';

  @override
  String get moonUpcomingIslamicEvents => 'Matukio ya Kiislamu Yanayokuja';

  @override
  String get moonTodayLabel => 'Leo';

  @override
  String get moonTomorrowLabel => 'Kesho';

  @override
  String get calDateCol => 'Tarehe';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Alfajiri';

  @override
  String get calSunriseCol => 'Macheo';

  @override
  String get calDhuhrCol => 'Adhuhuri';

  @override
  String get calAsrCol => 'Alasiri';

  @override
  String get calMaghribCol => 'Magharibi';

  @override
  String get calIshaCol => 'Ishaa';

  @override
  String get calNoCityText =>
      'Weka jiji lako kwanza\nili uone kalenda ya sala.';

  @override
  String get calShareTooltip => 'Shiriki kalenda';

  @override
  String get calPrevMonthTooltip => 'Mwezi uliopita';

  @override
  String get calNextMonthTooltip => 'Mwezi ujao';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Nyakati za Sala — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Badili kwa dira';

  @override
  String get qiblaSwitchToAR => 'Badili kwa kamera ya AR';

  @override
  String get qiblaNoCityText =>
      'Weka jiji lako kwanza\nili kukokotoa mwelekeo wa Qibla.';

  @override
  String get qiblaCompassUnavailable =>
      'Sensori ya dira haipatikani kwenye kifaa hiki.';

  @override
  String get qiblaCalibrate =>
      'Sawazisha: sogeza simu yako kwa umbo la nambari 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° kutoka Kaskazini';
  }

  @override
  String qiblaFrom(String city) {
    return 'Kutoka $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'km $dist kutoka Kaaba';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km kutoka Kaaba';
  }

  @override
  String get qiblaFacingQibla => 'Unakabili Qibla ✓';

  @override
  String get tasbeehTitle => 'Tasbihi';

  @override
  String get tasbeehResetTooltip => 'Weka upya';

  @override
  String get tasbeehTapToSwitch => 'Gusa lebo kubadili';

  @override
  String get tasbeehTapToCount => 'Gusa popote kuhesabu';

  @override
  String get tasbeehResetDialogTitle => 'Weka upya kihesabu?';

  @override
  String get tasbeehResetDialogContent =>
      'Hii itaweka upya hesabu ya sasa hadi sifuri.';

  @override
  String get tasbeehCancel => 'Ghairi';

  @override
  String get tasbeehReset => 'Weka Upya';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Leo: dhikri $count';
  }

  @override
  String get tasbeehLast7Days => 'Siku 7 zilizopita';

  @override
  String get tasbeehNoHistory => 'Hakuna historia bado — anza kuhesabu!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbihi imekamilika! dhikri $count';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Nyumba Erevu';

  @override
  String get smartHomeSubtitle => 'Unganisha vifaa vyako na nyakati za sala';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Muulize Google kuhusu nyakati za sala na mwelekeo wa Qibla';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Muulize Alexa kuhusu nyakati za sala, sala inayofuata, na zaidi';

  @override
  String get smartHomeSiri => 'Njia za Mkato za Siri';

  @override
  String get smartHomeSiriDesc =>
      'Unda njia za mkato maalum za nyakati za sala';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Otomatisha taa, onyesho, na vikumbusho wakati wa sala';

  @override
  String get smartHomeLinkAccount => 'Unganisha Akaunti';

  @override
  String get smartHomeLinked => 'Imeunganishwa';

  @override
  String get smartHomeUnlink => 'Tenganisha';

  @override
  String get smartHomeSetupInstructions => 'Maelekezo ya Usanidi';

  @override
  String get smartHomeRequiresUmmatPlus => 'Inahitaji Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Utatuzi wa Matatizo';

  @override
  String get smartHomeTestConnection => 'Jaribu Muunganisho';

  @override
  String get smartHomeConnectionSuccess => 'Imeunganishwa kwa mafanikio';

  @override
  String get smartHomeConnectionFailed =>
      'Muunganisho umeshindwa. Angalia kiungo cha akaunti yako.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle =>
      'Vipengele vya hali ya juu vya nyakati za sala';

  @override
  String get subscriptionUpgrade => 'Panda daraja hadi Ummat+';

  @override
  String get subscriptionRestore => 'Rejesha Ununuzi';

  @override
  String get subscriptionManage => 'Simamia Usajili';

  @override
  String get subscriptionCancel => 'Ghairi Usajili';

  @override
  String get subscriptionActive => 'Hai';

  @override
  String get subscriptionExpired => 'Imekwisha';

  @override
  String get subscriptionFree => 'Bure';

  @override
  String get subscriptionFreeDesc =>
      'Nyakati za sala za msingi, Qibla, kalenda';

  @override
  String get subscriptionPlusDesc =>
      'Nyumba erevu, onyesho la TV, vijisehemu, na zaidi';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return 'Hoji $count za bure zimebaki';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/mwaka';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/mwezi';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Muunganisho wa nyumba erevu';

  @override
  String get subscriptionFeatureTV => 'Hali ya onyesho la TV';

  @override
  String get subscriptionFeatureWidgets => 'Vijisehemu vya skrini ya nyumbani';

  @override
  String get subscriptionFeatureWatch => 'Vipengele vya saa';

  @override
  String get subscriptionFeatureSync => 'Usawazishaji kati ya vifaa';

  @override
  String get subscriptionFeatureAdFree => 'Uzoefu bila matangazo';

  @override
  String get watchTitle => 'Saa';

  @override
  String get watchNextPrayer => 'Sala Inayofuata';

  @override
  String get watchAllPrayers => 'Sala Zote';

  @override
  String get watchComplication => 'Kipengele';

  @override
  String get nextPrayer => 'Sala inayofuata';

  @override
  String get allPrayers => 'Sala zote';

  @override
  String get today => 'Leo';

  @override
  String get tomorrow => 'Kesho';

  @override
  String get thisWeek => 'Wiki hii';

  @override
  String get thisMonth => 'Mwezi huu';

  @override
  String get loginCreateAccount => 'Unda Akaunti';

  @override
  String get loginSignIn => 'Ingia';

  @override
  String get loginWelcomeBack => 'Karibu tena';

  @override
  String get loginJoinPrayCalc => 'Jiunge na PrayCalc';

  @override
  String get loginSyncSubtitle => 'Sawazisha data yako ya sala kati ya vifaa';

  @override
  String get loginContinueGoogle => 'Endelea na Google';

  @override
  String get loginOr => 'au';

  @override
  String get loginSigningIn => 'Inaingia…';

  @override
  String get loginNameLabel => 'Jina la kuonyesha (hiari)';

  @override
  String get loginEmailLabel => 'Barua pepe';

  @override
  String get loginPasswordLabel => 'Nenosiri';

  @override
  String get loginEmailRequired => 'Barua pepe inahitajika';

  @override
  String get loginEmailInvalid => 'Weka anwani sahihi ya barua pepe';

  @override
  String get loginPasswordRequired => 'Nenosiri linahitajika';

  @override
  String get loginPasswordMinLength =>
      'Nenosiri lazima liwe na herufi 8 au zaidi';

  @override
  String get loginForgotPassword => 'Umesahau nenosiri?';

  @override
  String get loginEnterEmailFirst => 'Weka anwani yako ya barua pepe kwanza';

  @override
  String get loginResetSent => 'Barua pepe ya kuweka upya nenosiri imetumwa';

  @override
  String get loginResetFailed => 'Haikuweza kutuma barua pepe ya kuweka upya';

  @override
  String get loginNewToPrayCalc => 'Mpya katika PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Tayari una akaunti?';

  @override
  String get accountTitle => 'Akaunti';

  @override
  String get accountNotSignedIn => 'Haujaingia';

  @override
  String get accountSyncSection => 'Usawazishaji';

  @override
  String get accountSyncStatus => 'Hali ya usawazishaji';

  @override
  String get accountSyncNow => 'Sawazisha sasa';

  @override
  String get accountSyncHistory => 'Historia ya usawazishaji';

  @override
  String get accountNoConflicts => 'Hakuna migogoro iliyotambuliwa';

  @override
  String accountConflictsResolved(int count) {
    return '$count imetatuliwa';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Ilisawazishwa $time';
  }

  @override
  String get accountOfflineStatus =>
      'Nje ya mtandao. Mabadiliko yamehifadhiwa kienyeji.';

  @override
  String get accountSyncErrorStatus =>
      'Hitilafu ya usawazishaji. Itajaribu tena.';

  @override
  String get accountDataSection => 'Data';

  @override
  String get accountExportData => 'Hamisha data';

  @override
  String get accountExportSubtitle =>
      'Pakua mipangilio yako na kumbukumbu za sala';

  @override
  String get accountExportFailed => 'Haikuweza kuhamisha data';

  @override
  String get accountSignOutTitle => 'Toka';

  @override
  String get accountSignOutBody =>
      'Data yako ya kienyeji itahifadhiwa. Ingia tena kuendelea kusawazisha.';

  @override
  String get accountDeleteAccount => 'Futa akaunti';

  @override
  String get accountDeleteSubtitle => 'Futa akaunti yako na data milele';

  @override
  String get accountDeleteBody =>
      'Hii itafuta akaunti yako na data yote iliyosawazishwa milele. Data yako ya kienyeji kwenye kifaa hiki haitaondolewa.\n\nKitendo hiki hakiwezi kutendulishwa.';

  @override
  String get accountDeleted => 'Akaunti imefutwa';

  @override
  String get accountDeleteFailed => 'Haikuweza kufuta akaunti';

  @override
  String get accountTimeJustNow => 'sasa hivi';

  @override
  String accountTimeMinAgo(int min) {
    return 'dakika $min zilizopita';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return 'saa $hour zilizopita';
  }

  @override
  String accountTimeDayAgo(int day) {
    return 'siku $day zilizopita';
  }

  @override
  String get statsTitle => 'Takwimu za Sala';

  @override
  String get statsShareTooltip => 'Shiriki takwimu';

  @override
  String get statsTodayPrayers => 'Sala za Leo';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Mfululizo';

  @override
  String get statsDays => 'siku';

  @override
  String get statsThisWeek => 'Wiki Hii';

  @override
  String get statsCompletion => 'ukamilishaji';

  @override
  String get statsThisMonth => 'Mwezi Huu';

  @override
  String get statsMostMissed => 'Iliyokoswa Zaidi';

  @override
  String get statsThisWeekLabel => 'wiki hii';

  @override
  String get statsWeeklyChart => 'Ukamilishaji wa Wiki kwa Sala';

  @override
  String get statsMonthlyChart => 'Ukamilishaji wa Mwezi kwa Sala';

  @override
  String statsTotalLogged(int count) {
    return 'sala $count jumla zilizoandikwa';
  }

  @override
  String get statsKeepItUp => 'Endelea hivyo!';

  @override
  String get statsShareTitle => 'Takwimu za Sala za PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Mfululizo: siku $days';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Wiki: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Mwezi: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Uchambuzi wa wiki:';

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
  String get aboutTitle => 'Kuhusu PrayCalc';

  @override
  String get aboutWebsite => 'Tovuti';

  @override
  String get aboutContact => 'Wasiliana';

  @override
  String get aboutLicenses => 'Leseni za Chanzo Huria';

  @override
  String get aboutCouldNotOpen => 'Haikuweza kufungua kiungo.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Haki zote zimehifadhiwa.\n\nNyakati za sala zinakokotolewa kwa injini ya pray_calc_dart. Usahihi unategemea eneo lako la GPS na njia ya ukokotoaji iliyochaguliwa.';
  }

  @override
  String get commonCancel => 'Ghairi';

  @override
  String get commonSave => 'Hifadhi';

  @override
  String get commonDelete => 'Futa';

  @override
  String get commonEdit => 'Hariri';

  @override
  String get commonRetry => 'Jaribu Tena';

  @override
  String get commonClose => 'Funga';

  @override
  String get commonDone => 'Imekamilika';

  @override
  String get commonBack => 'Rudi';

  @override
  String get commonNext => 'Ifuatayo';

  @override
  String get commonSkip => 'Ruka';

  @override
  String get commonContinue => 'Endelea';

  @override
  String get commonOk => 'Sawa';

  @override
  String get commonYes => 'Ndiyo';

  @override
  String get commonNo => 'Hapana';

  @override
  String get commonShare => 'Shiriki';

  @override
  String get commonCopy => 'Nakili';

  @override
  String get commonCopied => 'Imenakiliwa kwenye ubao wa kunakili';

  @override
  String get commonLoading => 'Inapakia...';

  @override
  String get commonError => 'Kitu kimekwenda vibaya';

  @override
  String get commonErrorRetry => 'Kitu kimekwenda vibaya. Gusa kujaribu tena.';

  @override
  String get commonNoInternet => 'Hakuna muunganisho wa intaneti';

  @override
  String get commonOfflineMode => 'Hali ya nje ya mtandao';

  @override
  String get commonSignIn => 'Ingia';

  @override
  String get commonSignOut => 'Toka';

  @override
  String get commonSignUp => 'Jisajili';

  @override
  String get commonProfile => 'Wasifu';

  @override
  String get commonAccount => 'Akaunti';

  @override
  String get commonAbout => 'Kuhusu';

  @override
  String commonVersion(String version) {
    return 'Toleo $version';
  }

  @override
  String get commonPrivacyPolicy => 'Sera ya Faragha';

  @override
  String get commonTermsOfService => 'Masharti ya Huduma';

  @override
  String get commonRateApp => 'Kadiria programu hii';

  @override
  String get commonFeedback => 'Tuma maoni';

  @override
  String get commonHelp => 'Msaada';

  @override
  String get commonLanguage => 'Lugha';

  @override
  String get commonOpenSettings => 'Fungua Mipangilio';

  @override
  String get travelNotificationTitle => 'Uko safarini sasa';

  @override
  String get travelNotificationBody =>
      'Nyakati za sala zinaweza kufupishwa. Gusa kujifunza kuhusu hukumu za sala ya msafiri.';

  @override
  String get travelRulingsTitle => 'Safari na Sala';

  @override
  String get travelRulingsIntro =>
      'Hukumu za Kiislamu za sala wakati wa kusafiri, na marejeleo ya kisomi kutoka Qurani na makusanyo ya Hadithi sahihi.';

  @override
  String get travelWhenTitle => 'Safari Inatumika Lini?';

  @override
  String get travelQasrTitle => 'Kufupisha Sala (Qasr)';

  @override
  String get travelJamTitle => 'Kuunganisha Sala (Jam\')';

  @override
  String get travelDurationTitle => 'Muda wa Safari';

  @override
  String get travelReferencesTitle => 'Marejeleo ya Kisomi';

  @override
  String get travelLearnMore => 'Jifunze zaidi';

  @override
  String get travelHanafiDefaultTitle =>
      'Kwa Nini PrayCalc Inatumia Chaguo la Hanafi';

  @override
  String get travelDeeperScholarly => 'Mjadala wa Kina wa Kisomi';

  @override
  String get onboardingTitle1 => 'Nyakati za sala, popote ulipo';

  @override
  String get onboardingBody1 =>
      'Nyakati za sala sahihi za GPS kwa kila jiji duniani. Alfajiri hadi Ishaa, macheo hadi Qiyamu. Inaendeshwa na injini yetu ya ukokotoaji, iliyojengwa kwa usahihi.';

  @override
  String get onboardingTitle2 => 'Eneo lako, nyakati zako';

  @override
  String get onboardingBody2 =>
      'Tafuta jiji lolote au ruhusu GPS itambue eneo lako. PrayCalc inapata nyakati za miji milioni 5 duniani kote.';

  @override
  String get onboardingTitle3 => 'Usikose sala kamwe';

  @override
  String get onboardingBody3 =>
      'Adhana wakati wa sala, vikumbusho kabla yake. Ratiba maalum za daku, madarasa, na zaidi.';

  @override
  String get onboardingTitle4 => 'Kila kitu unachohitaji';

  @override
  String get onboardingBody4 =>
      'Dira ya Qibla, kalenda ya sala, awamu ya mwezi wa Hijri, kihesabu cha tasbihi. Vyote mahali pamoja.';

  @override
  String get onboardingSkip => 'Ruka';

  @override
  String get onboardingGetStarted => 'Anza';

  @override
  String get onboardingSignInTitle => 'Ingia kwa PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Hifadhi historia yako ya sala na sawazisha\nkati ya vifaa vyako vyote.';

  @override
  String get onboardingContinueGoogle => 'Endelea na Google';

  @override
  String get onboardingContinueWithoutAccount => 'Endelea bila akaunti';

  @override
  String get onboardingSigningIn => 'Inaingia…';

  @override
  String get onboardingSelectLanguage => 'Chagua Lugha';

  @override
  String get duaDhikrTitle => 'Dua na Dhikri';

  @override
  String get duaDhikrTabDua => 'Dua';

  @override
  String get duaDhikrTabDhikr => 'Dhikri';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbihi';

  @override
  String get duaDhikrTabMorning => 'Asubuhi';

  @override
  String get duaDhikrTabEvening => 'Jioni';

  @override
  String get duaDhikrMorningAdhkar => 'Adhkari za Asubuhi';

  @override
  String get duaDhikrEveningAdhkar => 'Adhkari za Jioni';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Kalenda ya mwaka';

  @override
  String get calExportIcsTooltip => 'Hamisha .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Onyesha kwenye ramani';

  @override
  String get qiblaWaitingCompass => 'Inasubiri dira...';

  @override
  String get qiblaNoCompassSensor =>
      'Hakuna sensori ya dira. Inaonyesha mwelekeo wa Qibla kisimamo.';

  @override
  String get qiblaAccuracyExcellent => 'Usahihi bora';

  @override
  String get qiblaAccuracyGood => 'Usahihi mzuri';

  @override
  String get qiblaAccuracyFair =>
      'Usahihi wa wastani. Sawazisha kwa kusogeza simu kwa umbo la nambari 8.';

  @override
  String get qiblaAccuracyLow =>
      'Usahihi wa chini. Sawazisha kwa kusogeza simu kwa umbo la nambari 8.';

  @override
  String get qiblaToTheKaaba => 'kuelekea Kaaba';

  @override
  String get qiblaYourLocation => 'Eneo lako';

  @override
  String get qiblaGpsAccurate => 'Sahihi ya GPS';

  @override
  String get qiblaCityCenter => 'Katikati ya jiji';

  @override
  String get moonIlluminatedLabel => 'Iliyoangazwa';

  @override
  String get moonAgeLabel => 'Umri';

  @override
  String get moonFirstQtr => 'Robo ya Kwanza';

  @override
  String get moonLastQtr => 'Robo ya Mwisho';

  @override
  String get moonTonight => 'Usiku Huu';

  @override
  String get moonTomorrow => 'Kesho';

  @override
  String moonDaysAway(int days) {
    return 'siku $days';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Weka Eneo la Nyumbani';

  @override
  String get setHomeSearchHint => 'Tafuta jiji, mji au msimbo wa posta…';

  @override
  String get setHomeClear => 'Futa';

  @override
  String get setHomeUseCurrentLocation => 'Tumia Eneo la Sasa';

  @override
  String get setHomeDetectAndSet => 'Tambua eneo lako na uweke kama nyumbani';

  @override
  String get setHomeAlreadySet => 'Nyumbani tayari imewekwa';

  @override
  String setHomeSetAs(String city) {
    return '$city imewekwa kama nyumbani';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Eneo la sasa limewekwa kama nyumbani';

  @override
  String get setHomePermissionDenied =>
      'Ruhusa ya eneo imekataliwa. Tafuta jiji hapa chini.';

  @override
  String get setHomeGpsUnavailable => 'GPS haipatikani. Tafuta kwa mkono.';

  @override
  String get setHomeNoCitiesFound => 'Hakuna miji iliyopatikana.';

  @override
  String get setHomeSearchPrompt => 'Tafuta jiji lako la nyumbani';

  @override
  String get setHomeSearchBody =>
      'Andika hapo juu kutafuta, au tumia eneo lako la sasa. Hali ya safari itatambua unapokuwa mbali na nyumbani.';

  @override
  String get subscriptionYouHavePlus => 'Una Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Panda daraja hadi Ummat+';

  @override
  String get subscriptionThankYou => 'Asante kwa kuunga mkono PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Fungua vipengele vya hali ya juu kati ya vifaa vyako vyote.';

  @override
  String get subscriptionManageSub => 'Simamia usajili';

  @override
  String get subscriptionWelcome => 'Karibu kwa Ummat+!';

  @override
  String get subscriptionSubscribe => 'Jisajili';

  @override
  String get subscriptionFreeFeatures => 'Vipengele Bure';

  @override
  String get subscriptionPlusFeatures => 'Vipengele vya Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Nyakati za sala';

  @override
  String get subscriptionFeatureQibla => 'Dira ya Qibla';

  @override
  String get subscriptionFeatureCalendar => 'Kalenda ya mwezi';

  @override
  String get subscriptionFeatureTasbeeh => 'Kihesabu cha tasbihi';

  @override
  String get subscriptionFeatureMoon => 'Mwezi na Hijri';

  @override
  String get smartHomeAlertType => 'Aina ya Tahadhari';

  @override
  String get smartHomeAlertModal => 'Kidirisha cha skrini kamili';

  @override
  String get smartHomeAlertCorner => 'Arifa ya kona';

  @override
  String get smartHomeAlertNone => 'Hakuna (kimya)';

  @override
  String get smartHomePauseMedia => 'Simamisha media wakati wa adhana';

  @override
  String get smartHomeQuietHours => 'Masaa ya utulivu';

  @override
  String get smartHomeQuietFrom => 'Kuanzia';

  @override
  String get smartHomeQuietTo => 'Hadi';

  @override
  String get smartHomePrayerAudio => 'Sauti kwa kila sala';

  @override
  String get smartHomeAudioAdhan => 'Adhana';

  @override
  String get smartHomeAudioBeep => 'Bipu';

  @override
  String get smartHomeAudioSilent => 'Kimya';

  @override
  String get aboutPrivacy => 'Sera ya Faragha';

  @override
  String aboutVersion(String version) {
    return 'Toleo $version';
  }

  @override
  String get notifDefaultAdhan => 'Adhana ya Kawaida';

  @override
  String get notifFajrAdhan => 'Adhana ya Alfajiri';

  @override
  String get notifFajrAdhanSubtitle => 'Inachezwa wakati wa sala ya Alfajiri';

  @override
  String get notifRegularAdhan => 'Adhana ya Kawaida';

  @override
  String get notifRegularAdhanSubtitle =>
      'Inachezwa wakati wa Adhuhuri, Alasiri, Magharibi, Ishaa';

  @override
  String get notifPerPrayerSettings => 'Mipangilio kwa Kila Sala';

  @override
  String get notifPreview => 'Hakiki';

  @override
  String get tvSettingsTitle => 'Mipangilio ya TV';

  @override
  String get tvDisplayMode => 'Hali ya Onyesho';

  @override
  String get tvMasjidMode => 'Hali ya Msikiti';

  @override
  String get tvMasjidModeSubtitle =>
      'Onyesho kubwa la ishara na nyakati za iqama';

  @override
  String get tvMasjidName => 'Jina la Msikiti';

  @override
  String get tvMasjidNameTapToSet => 'Gusa kuweka';

  @override
  String get tvClock => 'Saa';

  @override
  String get tv24hFormat => 'Muundo wa saa 24';

  @override
  String get tvIqamahOffsets => 'Muda wa Iqama (dakika baada ya adhana)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'dakika $offset baada ya adhana';
  }

  @override
  String get tvQrCode => 'Msimbo wa QR';

  @override
  String get tvShowQrCode => 'Onyesha Msimbo wa QR';

  @override
  String get tvShowQrCodeSubtitle =>
      'Onyesha msimbo wa QR kwenye skrini ya msikiti';

  @override
  String get tvQrCodeUrl => 'URL ya Msimbo wa QR';

  @override
  String get tvAmbientModeSection => 'Hali ya Mazingira';

  @override
  String get tvIdleTimeout => 'Muda wa kutokuwa hai';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'dakika $minutes kabla ya mazingira kuamilishwa';
  }

  @override
  String get tvPhotoInterval => 'Muda wa picha';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'sekunde $seconds kati ya picha';
  }

  @override
  String get tvBackground => 'Mandhari';

  @override
  String get tvPhotoCategory => 'Aina ya picha';

  @override
  String get tvLocation => 'Eneo';

  @override
  String get tvChangeCity => 'Badilisha Jiji';

  @override
  String get tvChangeCitySubtitle => 'Tafuta jiji tofauti';

  @override
  String get tvScreensaverBg => 'Mandhari ya Kinga ya Skrini';

  @override
  String get tvScreensaverPhotos => 'Picha';

  @override
  String get tvScreensaverPattern => 'Muundo wa kijiometri';

  @override
  String get tvScreensaverBoth => 'Picha + muundo';

  @override
  String get tvCategoryAll => 'Aina zote';

  @override
  String get tvCategoryMasjids => 'Misikiti';

  @override
  String get tvCategoryInteriors => 'Ndani';

  @override
  String get tvCategoryGeometric => 'Kijiometri';

  @override
  String get tvCategoryCalligraphy => 'Maandishi';

  @override
  String get tvCategoryLandscapes => 'Mandhari';

  @override
  String get tvCategoryRamadan => 'Ramadhani';

  @override
  String get tvPhotoCategoryTitle => 'Aina ya Picha';

  @override
  String tvEnterHint(String title) {
    return 'Weka $title';
  }

  @override
  String get tvSystemDefault => 'Chaguo la mfumo';

  @override
  String get smartHomeIntegrations => 'Muunganisho';

  @override
  String get smartHomeLinkedSpeakers => 'Spika na Onyesho Zilizounganishwa';

  @override
  String get smartHomeAlertDisplay => 'Onyesho la Tahadhari';

  @override
  String get smartHomeAtAdhanShow => 'Wakati wa adhana onyesha';

  @override
  String get smartHomePauseMediaTitle => 'Simamisha media wakati wa adhana';

  @override
  String get smartHomePauseMediaSubtitle => 'Inaendelea baada ya adhana kuisha';

  @override
  String get smartHomePrayerAudioSection => 'Sauti ya Sala';

  @override
  String get smartHomeQuietHoursSection => 'Masaa ya Utulivu';

  @override
  String get smartHomeEnableQuietHours => 'Wezesha masaa ya utulivu';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Tahadhari zote za nyumba erevu zinauzimwa';

  @override
  String get smartHomeNoDevices => 'Hakuna vifaa vilivyounganishwa bado';

  @override
  String get smartHomeNoDevicesDesc =>
      'Unganisha Google Home au Alexa hapo juu, kisha spika na onyesho zako zitaonekana hapa.';

  @override
  String get smartHomeRequiresPlus => 'Nyumba Erevu inahitaji Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Dhibiti matangazo ya sala kwenye Google Home, Alexa, Siri, na Home Assistant. Sanidi vifaa vipi vinacheza adhana, lini kusimamisha media, na weka masaa ya utulivu.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Tangaza adhana kwenye spika na onyesho za Nest.';

  @override
  String get smartHomeEnableAlexa => 'Wezesha ujuzi wa PrayCalc kwenye Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Muulize Siri kuhusu nyakati za sala au weka otomatiki.';

  @override
  String get smartHomeHassAdd =>
      'Ongeza kupitia HACS kwa msaada kamili wa otomatiki.';

  @override
  String get smartHomeSetupGuide => 'Mwongozo wa usanidi';

  @override
  String get smartHomeSiriSetupTitle => 'Usanidi wa Njia za Mkato za Siri';

  @override
  String get smartHomeSiriStep1 =>
      'Fungua programu ya Njia za Mkato kwenye iPhone au iPad yako.';

  @override
  String get smartHomeSiriStep2 => 'Gusa \"+\" kuunda njia mpya ya mkato.';

  @override
  String get smartHomeSiriStep3 =>
      'Tafuta \"PrayCalc\" katika orodha ya vitendo.';

  @override
  String get smartHomeSiriStep4 =>
      'Ongeza \"Wakati wa Sala Inayofuata\" au \"Nyakati za Sala za Leo\".';

  @override
  String get smartHomeSiriStep5 =>
      'Hiari, ongeza kwa otomatiki (mf. kila siku wakati wa Alfajiri).';

  @override
  String get smartHomeSiriStep6 =>
      'Sema \"Hey Siri, wakati wa sala inayofuata\" kujaribu.';

  @override
  String get smartHomeSiriFootnote => 'Inahitaji iOS 16 au baadaye.';

  @override
  String get smartHomeHassSetupTitle => 'Usanidi wa Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Sakinisha HACS (Duka la Jamii la Home Assistant).';

  @override
  String get smartHomeHassStep2 =>
      'Katika HACS, tafuta \"PrayCalc\" na usakinishe.';

  @override
  String get smartHomeHassStep3 =>
      'Nenda Mipangilio > Vifaa na Huduma > Ongeza Muunganisho.';

  @override
  String get smartHomeHassStep4 => 'Tafuta \"PrayCalc\" na uchague.';

  @override
  String get smartHomeHassStep5 =>
      'Weka ufunguo wako wa API wa PrayCalc (uliotengenezwa katika akaunti yako).';

  @override
  String get smartHomeHassStep6 => 'Sanidi eneo lako na njia ya ukokotoaji.';

  @override
  String get smartHomeHassFootnote =>
      'Inahitaji Home Assistant 2024.1+ na HACS.';

  @override
  String get smartHomeApiKey => 'Ufunguo wa API';

  @override
  String get smartHomeGenerateApiKey => 'Tengeneza Ufunguo wa API';

  @override
  String get smartHomeApiKeyNotReady =>
      'Utengenezaji wa ufunguo wa API utapatikana huduma erevu ya PrayCalc itakapowekwa.';

  @override
  String get smartHomeApiKeyDesc =>
      'Unahitaji ufunguo wa API kuunganisha Home Assistant na akaunti yako ya PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'Imeunganishwa';

  @override
  String get smartHomeNotLinkedStatus => 'Haijaunganishwa';

  @override
  String get smartHomeCouldNotOpen => 'Haikuweza kufungua kiungo.';

  @override
  String get smartHomeDevices => 'Vifaa';

  @override
  String get smartHomeAddDevice => 'Ongeza Kifaa';

  @override
  String get smartHomeDeleteDevice => 'Futa';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Ondoa kifaa hiki?';

  @override
  String get smartHomeDeviceOnline => 'Mtandaoni';

  @override
  String get smartHomeDeviceOffline => 'Nje ya mtandao';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Ilionekana mwisho: $time';
  }

  @override
  String get smartHomeDeviceName => 'Jina la kifaa';

  @override
  String get smartHomeDeviceType => 'Aina ya kifaa';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Spika';

  @override
  String get smartHomeDeviceTypeWatch => 'Saa';

  @override
  String get smartHomeDeviceTypeDesktop => 'Kompyuta';

  @override
  String get smartHomeDeviceTypeOther => 'Nyingine';

  @override
  String get smartHomeDeviceAdhan => 'Arifa za adhana';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Pokea arifa za adhana kwenye kifaa hiki';

  @override
  String get smartHomeDeviceVolume => 'Sauti';

  @override
  String get smartHomeDeviceAudioType => 'Aina ya sauti';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Sala zilizowashwa';

  @override
  String get smartHomeDeviceSettings => 'Mipangilio ya Kifaa';

  @override
  String get smartHomeTesting => 'Inapima...';

  @override
  String get smartHomeTestSuccess => 'Muunganisho umethibitishwa';

  @override
  String get smartHomeTestFailed => 'Jaribio la muunganisho limeshindwa';

  @override
  String get smartHomePairTv => 'Unganisha TV';

  @override
  String get smartHomePairingTv => 'Inasajili TV...';

  @override
  String get smartHomePairTvSuccess => 'TV imeunganishwa kwa mafanikio';

  @override
  String get smartHomePairTvFailed => 'Kuunganisha TV kumeshindwa';

  @override
  String get smartHomeLoadingDevices => 'Inapakia vifaa...';

  @override
  String get smartHomeLoadingIntegrations => 'Inapakia miunganisho...';

  @override
  String get smartHomeServiceUnavailable =>
      'Huduma ya nyumba smart haipatikani kwa sasa. Tafadhali jaribu tena baadaye.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total imekamilika';
  }

  @override
  String get adhkarReset => 'Weka Upya';

  @override
  String get syncHistoryTitle => 'Historia ya Usawazishaji';

  @override
  String get syncClearHistory => 'Futa historia';

  @override
  String get syncNoConflicts =>
      'Hakuna migogoro ya usawazishaji iliyotambuliwa. Vifaa vyote vimesawazishwa.';

  @override
  String get syncDomainSettings => 'Mipangilio';

  @override
  String get syncDomainCities => 'Miji Iliyohifadhiwa';

  @override
  String get syncDomainPrayerLogs => 'Kumbukumbu za Sala';

  @override
  String get syncTimeJustNow => 'sasa hivi';

  @override
  String syncTimeMinAgo(int min) {
    return 'dakika $min zilizopita';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return 'saa $hour zilizopita';
  }

  @override
  String syncTimeDayAgo(int day) {
    return 'siku $day zilizopita';
  }

  @override
  String get pinCity => 'Bandika';

  @override
  String get pinMaxReached =>
      'Upeo wa miji 5 iliyobandikwa. Panda daraja hadi Ummat+ kwa zaidi.';

  @override
  String pinCityUnpinned(String city) {
    return '$city imebandulishwa';
  }

  @override
  String get pinUndo => 'Tendua';

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
