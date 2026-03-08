// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Somali (`so`).
class AppLocalizationsSo extends AppLocalizations {
  AppLocalizationsSo([String locale = 'so']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Fajr';

  @override
  String get prayerSunrise => 'Qorrax-soo-bax';

  @override
  String get prayerDhuhr => 'Dhuhr';

  @override
  String get prayerAsr => 'Asr';

  @override
  String get prayerMaghrib => 'Maghrib';

  @override
  String get prayerIsha => 'Isha';

  @override
  String get prayerQiyam => 'Qiyaam';

  @override
  String get prayerSuhoor => 'Suxuur';

  @override
  String get prayerIftar => 'Afuur';

  @override
  String get hijriMuharram => 'Muharram';

  @override
  String get hijriSafar => 'Safar';

  @override
  String get hijriRabiAlAwwal => 'Rabi\' al-Awwal';

  @override
  String get hijriRabiAlThani => 'Rabi\' al-Thani';

  @override
  String get hijriJumadaAlAwwal => 'Jumada al-Awwal';

  @override
  String get hijriJumadaAlThani => 'Jumada al-Thani';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Sha\'ban';

  @override
  String get hijriRamadan => 'Ramadaan';

  @override
  String get hijriShawwal => 'Shawwal';

  @override
  String get hijriDhulQidah => 'Dhu al-Qi\'dah';

  @override
  String get hijriDhulHijjah => 'Dhu al-Hijjah';

  @override
  String get monthJan => 'Jan';

  @override
  String get monthFeb => 'Feb';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Abr';

  @override
  String get monthMay => 'May';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Ogs';

  @override
  String get monthSep => 'Seb';

  @override
  String get monthOct => 'Okt';

  @override
  String get monthNov => 'Nof';

  @override
  String get monthDec => 'Dis';

  @override
  String get monthJanuary => 'Janaayo';

  @override
  String get monthFebruary => 'Febraayo';

  @override
  String get monthMarch => 'Maarso';

  @override
  String get monthApril => 'Abriil';

  @override
  String get monthMayFull => 'May';

  @override
  String get monthJune => 'Juun';

  @override
  String get monthJuly => 'Luuliyo';

  @override
  String get monthAugust => 'Ogost';

  @override
  String get monthSeptember => 'Sebtembar';

  @override
  String get monthOctober => 'Oktoobar';

  @override
  String get monthNovember => 'Nofembar';

  @override
  String get monthDecember => 'Disembar';

  @override
  String get dayMonShort => 'Isn';

  @override
  String get dayTueShort => 'Tal';

  @override
  String get dayWedShort => 'Arb';

  @override
  String get dayThuShort => 'Kha';

  @override
  String get dayFriShort => 'Jim';

  @override
  String get daySatShort => 'Sab';

  @override
  String get daySunShort => 'Axd';

  @override
  String get dayMonday => 'Isniin';

  @override
  String get dayTuesday => 'Talaado';

  @override
  String get dayWednesday => 'Arbaco';

  @override
  String get dayThursday => 'Khamiis';

  @override
  String get dayFriday => 'Jimce';

  @override
  String get daySaturday => 'Sabti';

  @override
  String get daySunday => 'Axad';

  @override
  String get daySuChart => 'Ax';

  @override
  String get dayMoChart => 'Is';

  @override
  String get dayTuChart => 'Ta';

  @override
  String get dayWeChart => 'Ar';

  @override
  String get dayThChart => 'Kh';

  @override
  String get dayFrChart => 'Ji';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Dooro magaalo';

  @override
  String get setCityFab => 'Dejiso magaalo';

  @override
  String prayerTimesError(Object error) {
    return 'Lama xisaabin karin waqtiyada salaadda.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer gudahood';
  }

  @override
  String get ramadanMubarak => 'Ramadaan Mubaarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Maalin $day / 30';
  }

  @override
  String get lastTenNights => '10-da Habeenkii Ugu Dambeeyay';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'M';

  @override
  String get homeNoCitySelected => 'Magaalo lama dooran';

  @override
  String get homeNoCityHint =>
      'Taabo sare si aad u raadiso magaaladaada ama aad u shiddo GPS.';

  @override
  String get homeCouldNotCalc => 'Lama xisaabin karin waqtiyada salaadda.';

  @override
  String get homeQasr => 'Qasar';

  @override
  String get homeActionMonthlyTimes => 'Waqtiyada\nBisha';

  @override
  String get homeActionDuaDhikr => 'Ducada &\nDhikriga';

  @override
  String get homeActionPrayerStats => 'Tirada\nSalaadda';

  @override
  String homePolarBanner(int count) {
    return '$count waqtiyada salaadda looma xisaabin karo goobta aad joogto xiligan (qorrax-habeenka dhexe / habeenka cirifka). Isku day qiyaasta latitude-ka ugu dhow ee settings-ka.';
  }

  @override
  String get settingsTitle => 'Dejinta';

  @override
  String get settingsSectionPrayerCalc => 'Xisaabinta Salaadda';

  @override
  String get settingsHanafiAsr => 'Asr Xanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Qiyaasta hooska 2x (waqti Asr ah oo dib u dhac)';

  @override
  String get settingsSectionDisplay => 'Muuqaalka';

  @override
  String get settings24hClock => 'Saacadda 24 saac';

  @override
  String get settingsFollowSystemTheme => 'Raac qaabka nidaamka';

  @override
  String get settingsDarkMode => 'Qaabka madow';

  @override
  String get settingsSectionNotifications => 'Ogeysiisyada';

  @override
  String get settingsPrayerNotifications => 'Ogeysiisyada salaadda';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhaan, xasuusin, iyo dejinta salaat kasta';

  @override
  String get settingsPrayerAgendas => 'Ajendaha salaadda';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Xasuusino gaar ah oo ku salaysan waqtiyada salaadda';

  @override
  String get settingsAccount => 'Akoonka';

  @override
  String get settingsSignInToSync => 'Soo gal si aad u isku mid noqoto';

  @override
  String get settingsSignInToSyncSubtitle => 'Ku hay xogtaada aaladaha oo dhan';

  @override
  String get settingsHomeScreen => 'Shaashadda Guriga';

  @override
  String get settingsSkyGradient => 'Asalka samada gradient';

  @override
  String get settingsSkyGradientSubtitle =>
      'Midabka samada firfircoon ee u dhigma waqtiga maalinta';

  @override
  String get settingsWeatherGradient => 'Cimilada gradient';

  @override
  String get settingsWeatherGradientSubtitle =>
      'U hagaaji midabka samada iyada oo ku saleysan cimilada maxaliga ah';

  @override
  String get settingsCountdownAnimation => 'Dhaqdhaqaaqa tirinta';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Giraanta neefsashada tirinta salaadda xigta';

  @override
  String get settingsPrayerTracking => 'Raadraacinta Salaadda';

  @override
  String get settingsTrackMyPrayers => 'Raadraac salaaddayda';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Diiwaan gali salaadaha aad tukato maalin kasta';

  @override
  String get settingsPrayerStats => 'Tirada salaadda';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Isku xirka, jaantuska toddobaadlaha iyo bishiiba';

  @override
  String get settingsJumuahKahf => 'Xusuusinta Jimcaha Al-Kahf';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Xusuusinta Jimcaha si loo akhriyo Suuradda Al-Kahf';

  @override
  String get settingsTravel => 'Safar';

  @override
  String get settingsTravelMode => 'Qaabka safarka';

  @override
  String get settingsTravelModeSubtitle =>
      'Si toos ah u ogaaw marka aad ka maqan tahay guriga oo u hagaaji salaadaha';

  @override
  String get settingsHomeLocation => 'Goobta guriga';

  @override
  String get settingsHomeLocationNotSet =>
      'Lama dejin — taabo si aad u isticmaasho goobta hadda';

  @override
  String get settingsClearHomeLocation => 'Tirtir goobta guriga';

  @override
  String get settingsTravelRulings => 'Xukmaha salaadda safarka';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasar, isku darida, iyo tilmaamaha musaafirka';

  @override
  String get settingsSmartHome => 'Guriga Casriga';

  @override
  String get settingsSmartHomeIntegrations => 'Isdhexgelinta guriga casriga';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Muuqaalka TV';

  @override
  String get settingsTvHome => 'Muuqaalka guriga TV';

  @override
  String get settingsTvHomeSubtitle =>
      'Saacadda salaadda shaashad buuxda ee TV-ga';

  @override
  String get settingsMasjidDisplay => 'Muuqaalka masjidka';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Jadwalka adhaan/iqaamah ee shaashada masjidka';

  @override
  String get settingsTvSettings => 'Dejinta TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Qaabka masjidka, kala duwanaashada iqaamah, deegaanka';

  @override
  String get settingsAboutPrayCalc => 'Ku saabsan PrayCalc';

  @override
  String get syncSynced => 'Waa la isku mid noqday';

  @override
  String get syncSyncing => 'Waa la isku mid noqonayaa...';

  @override
  String get syncOffline => 'Offline';

  @override
  String get syncError => 'Khalad isku-mid-noqod';

  @override
  String get notifSettingsTitle => 'Ogeysiisyada & Adhaanka';

  @override
  String get notifAdhanLabel => 'Adhaan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Xusuusin: $minutes daqiiqo ka hor';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Codka: $pct%';
  }

  @override
  String get notifTestAdhan => 'Tijaabi adhaanka';

  @override
  String get notifModeOff => 'Dami';

  @override
  String get notifModeReminderOnly => 'Xusuusin kaliya';

  @override
  String get notifModeArrival => 'Waqtiga salaadda';

  @override
  String get notifModeBoth => 'Xusuusin + waqtiga';

  @override
  String get citySearchHint => 'Raadi magaalo…';

  @override
  String get citySearchDetectTooltip => 'Ogaaw goobta aan joogto';

  @override
  String get citySearchNoCityGps => 'Lagama helin magaalada GPS-ka.';

  @override
  String get citySearchPermissionDenied =>
      'Ogolaanshaha goobta waa la diiday. Gacanta ku raadi.';

  @override
  String get citySearchNoResults => 'Magaalo lama helin.';

  @override
  String get citySearchStartTyping => 'Bilow qorista si aad u raadiso…';

  @override
  String get agendasTitle => 'Ajendaha Salaadda';

  @override
  String get agendasEmpty =>
      'Wali ma jirto ajenda.\nTaabo + si aad ugu darto xusuusin ku xiran salaadadaada.';

  @override
  String get agendasUndo => 'Ka noqo';

  @override
  String agendasRemoved(String label) {
    return '$label waa la saaray';
  }

  @override
  String get agendaNewTitle => 'Ajenda Cusub';

  @override
  String get agendaEditTitle => 'Wax ka Beddel Ajendaha';

  @override
  String get agendaSave => 'Kaydi';

  @override
  String get agendaLabelEmpty => 'Cinwaanka ma bannaana karo';

  @override
  String get agendaLabelField => 'Cinwaan';

  @override
  String get agendaLabelHint => 'tusaale: U kac Fajr';

  @override
  String get agendaPrayerSection => 'Salaadda';

  @override
  String get agendaTimeOffsetSection => 'Kala duwanaashada waqtiga';

  @override
  String get agendaOffsetAtPrayerTime => 'Waqtiga salaadda';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes daqiiqo ka hor';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes daqiiqo ka dib';
  }

  @override
  String get agendaRepeatSection => 'Ku celi';

  @override
  String get agendaNotifTypeSection => 'Nooca ogeysiiska';

  @override
  String get agendaNotifSilent => 'Aamusnaan';

  @override
  String get agendaNotifSound => 'Cod';

  @override
  String get agendaNotifVibrate => 'Gariir';

  @override
  String get agendaDayM => 'I';

  @override
  String get agendaDayT => 'T';

  @override
  String get agendaDayW => 'A';

  @override
  String get agendaDayF => 'J';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Dayaxa & Taariikhda Hijriga';

  @override
  String moonIlluminated(int pct) {
    return '$pct% iftiin';
  }

  @override
  String get moonFullTonight => 'Dayax buuxa caawa!';

  @override
  String get moonNextTomorrow => 'Dayaxa buuxa ee xiga berri';

  @override
  String moonNextDays(int days) {
    return 'Dayaxa buuxa ee xiga $days maalmood gudahooda';
  }

  @override
  String moonAge(String age) {
    return 'Da\'da dayaxa: $age maalmood';
  }

  @override
  String get moonPhaseNewMoon => 'Dayax Cusub';

  @override
  String get moonPhaseWaxingCrescent => 'Hilaal Koraya';

  @override
  String get moonPhaseFirstQuarter => 'Rubucii Koowaad';

  @override
  String get moonPhaseWaxingGibbous => 'Gibbous Koraya';

  @override
  String get moonPhaseFullMoon => 'Dayax Buuxa';

  @override
  String get moonPhaseWaningGibbous => 'Gibbous Yaraanaya';

  @override
  String get moonPhaseLastQuarter => 'Rubucii Ugu Dambeeyay';

  @override
  String get moonPhaseWaningCrescent => 'Hilaal Yaraanaya';

  @override
  String get moonHilalVisibility => 'Muuqaalka Hilaasha Xiga';

  @override
  String get moonRegionMiddleEast => 'Bariga Dhexe';

  @override
  String get moonRegionWestAfrica => 'Afrika Galbeed';

  @override
  String get moonRegionSouthAsia => 'Aasiya Koonfureed';

  @override
  String get moonRegionEurope => 'Yurub';

  @override
  String get moonRegionAmericas => 'Ameerika';

  @override
  String get moonVisible => 'Waa La Arki Karaa';

  @override
  String get moonNotVisible => 'Lama Arki Karo';

  @override
  String get moonPossible => 'Suurtagal';

  @override
  String get moonUpcomingDates => 'Taariikhaha Islaamiga Soo Socda';

  @override
  String get hijriTodayLabel => 'Maanta Taariikhda Hijriga';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadaan $year H bilaabmo';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days maalmood ka maqan';
  }

  @override
  String get moonLunarCycle => 'Wareegga Dayaxa';

  @override
  String moonDayOfCycle(int day) {
    return 'Maalin $day ka mid ah ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'Saadaasha Arkida Hilaasha';

  @override
  String get moonHilalVisibilityMap => 'Khariidadda Muuqaalka Hilaasha';

  @override
  String moonDayN(int day) {
    return 'Maalin $day';
  }

  @override
  String get moonGlobalSighting => 'Arkida Caalamiga';

  @override
  String get moonZoneNakedEye => 'Isha Qaawan';

  @override
  String get moonZoneBinoculars => 'Durbin';

  @override
  String get moonZoneVeryDifficult => 'Aad U Adag';

  @override
  String get moonZoneNotVisible => 'Lama Arki Karo';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H waxay u badan tahay 29 maalmood. Hilaasha waxaa la filayaa in la arko maalinta 29-aad, in shaa Allaah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H waxay u badan tahay 30 maalmood. Hilaasha looma arki karo maalinta 29-aad. Bisha waxay buuxinaysaa 30 maalmood.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Sacuudi Carabiya';

  @override
  String get moonFCNACalc => 'FCNA / Xis.';

  @override
  String get moonNorthAmerica => 'Waqooyiga Ameerika';

  @override
  String moonNDays(int days) {
    return '$days maalmood';
  }

  @override
  String moonStarts(String month) {
    return '$month waa bilaabataa:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Da\'da dayaxa qorrax-dhicidda: $hours s';
  }

  @override
  String get moon7DayLunarCalendar => 'Taariikhda Dayaxa 7 Maalmood';

  @override
  String get moonUpcomingIslamicEvents => 'Munaasabadaha Islaamiga Soo Socda';

  @override
  String get moonTodayLabel => 'Maanta';

  @override
  String get moonTomorrowLabel => 'Berri';

  @override
  String get calDateCol => 'Taariikh';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Fajr';

  @override
  String get calSunriseCol => 'Qorrax-soo-bax';

  @override
  String get calDhuhrCol => 'Dhuhr';

  @override
  String get calAsrCol => 'Asr';

  @override
  String get calMaghribCol => 'Maghrib';

  @override
  String get calIshaCol => 'Isha';

  @override
  String get calNoCityText =>
      'Marka hore deji magaaladaada\nsi aad u aragto taariikhda salaadda.';

  @override
  String get calShareTooltip => 'La wadaag taariikhda';

  @override
  String get calPrevMonthTooltip => 'Bisha hore';

  @override
  String get calNextMonthTooltip => 'Bisha xigta';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Waqtiyada Salaadda — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'U beddel compass-ka';

  @override
  String get qiblaSwitchToAR => 'U beddel kaamiraddaAR';

  @override
  String get qiblaNoCityText =>
      'Marka hore deji magaaladaada\nsi loo xisaabiyo jihadiia Qiblada.';

  @override
  String get qiblaCompassUnavailable =>
      'Sensor-ka compass-ka kuma jiro aaladdan.';

  @override
  String get qiblaCalibrate => 'Hagaajin: u dhaq telefoonkaaga qaab 8-aad.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° waqooyiga';
  }

  @override
  String qiblaFrom(String city) {
    return 'Ka bilaaw $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km Kacbada';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km Kacbada';
  }

  @override
  String get qiblaFacingQibla => 'Waxaad u jeedaa Qiblada ✓';

  @override
  String get tasbeehTitle => 'Tasbiix';

  @override
  String get tasbeehResetTooltip => 'Dib u deji';

  @override
  String get tasbeehTapToSwitch => 'Taabo cinwaanka si aad u beddesho';

  @override
  String get tasbeehTapToCount => 'Meel kasta taabo si aad u tiriso';

  @override
  String get tasbeehResetDialogTitle => 'Dib u deji tirada?';

  @override
  String get tasbeehResetDialogContent =>
      'Tani waxay dib u dejin doontaa tirada hadda eber.';

  @override
  String get tasbeehCancel => 'Ka noqo';

  @override
  String get tasbeehReset => 'Dib u deji';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Maanta: $count dhikr';
  }

  @override
  String get tasbeehLast7Days => '7-dii maalmood ee la soo dhaafay';

  @override
  String get tasbeehNoHistory => 'Wali taariikhma jirto — bilow tirinta!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbiixda waa la dhammeeyay! $count dhikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Guriga Casriga';

  @override
  String get smartHomeSubtitle => 'Ku xir aaladahaaga waqtiyada salaadda';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Weydii Google waqtiyada salaadda iyo jihada Qiblada';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Weydii Alexa waqtiyada salaadda, salaadda xigta, iyo wax kale';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc =>
      'Samee shortcut-yo gaar ah oo waqtiyada salaadda';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Toosan nalallada, shaashada, iyo xusuusiyaha waqtiyada salaadda';

  @override
  String get smartHomeLinkAccount => 'Ku Xir Akoonka';

  @override
  String get smartHomeLinked => 'Waa La Xiray';

  @override
  String get smartHomeUnlink => 'Ka Fur';

  @override
  String get smartHomeSetupInstructions => 'Tilmaamaha Dejinta';

  @override
  String get smartHomeRequiresUmmatPlus => 'Waxay u baahan tahay Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Xalinta Dhibaatooyinka';

  @override
  String get smartHomeTestConnection => 'Tijaabi Xiriirka';

  @override
  String get smartHomeConnectionSuccess => 'Si guul leh ayaa loo xiray';

  @override
  String get smartHomeConnectionFailed =>
      'Xiriirku waa guul-darreystay. Hubi xiritaanka akoonkaaga.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Sifooyinka salaadda premium-ka';

  @override
  String get subscriptionUpgrade => 'U kor u qaad Ummat+';

  @override
  String get subscriptionRestore => 'Soo celi Iibsiga';

  @override
  String get subscriptionManage => 'Maaree Xiriirka';

  @override
  String get subscriptionCancel => 'Ka noqo Xiriirka';

  @override
  String get subscriptionActive => 'Firfircoon';

  @override
  String get subscriptionExpired => 'Waa dhacay';

  @override
  String get subscriptionFree => 'Bilaash';

  @override
  String get subscriptionFreeDesc =>
      'Waqtiyada salaadda aasaasiga, Qibla, taariikhda';

  @override
  String get subscriptionPlusDesc =>
      'Guriga casriga, muuqaalka TV, widgets, iyo wax kale';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count su\'aalood oo bilaash ah oo haray';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/sannad';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/bil';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Isdhexgelinta guriga casriga';

  @override
  String get subscriptionFeatureTV => 'Qaabka muuqaalka TV';

  @override
  String get subscriptionFeatureWidgets => 'Widgets-ka shaashada guriga';

  @override
  String get subscriptionFeatureWatch => 'Saacadda complications';

  @override
  String get subscriptionFeatureSync => 'Isku mid-noqoshada aaladaha';

  @override
  String get subscriptionFeatureAdFree => 'Khibrad xayeysiis la\'aan ah';

  @override
  String get watchTitle => 'Saacadda';

  @override
  String get watchNextPrayer => 'Salaadda Xigta';

  @override
  String get watchAllPrayers => 'Dhammaan Salaadaha';

  @override
  String get watchComplication => 'Complication';

  @override
  String get nextPrayer => 'Salaadda xigta';

  @override
  String get allPrayers => 'Dhammaan salaadaha';

  @override
  String get today => 'Maanta';

  @override
  String get tomorrow => 'Berri';

  @override
  String get thisWeek => 'Toddobaadkan';

  @override
  String get thisMonth => 'Bishan';

  @override
  String get loginCreateAccount => 'Samee Akoon';

  @override
  String get loginSignIn => 'Soo Gal';

  @override
  String get loginWelcomeBack => 'Ku soo dhawoow mar kale';

  @override
  String get loginJoinPrayCalc => 'Ku biir PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'Isku mid yeelo xogta salaaddaada aaladaha oo dhan';

  @override
  String get loginContinueGoogle => 'Ku sii wad Google';

  @override
  String get loginOr => 'ama';

  @override
  String get loginSigningIn => 'Waa la soo galayaa…';

  @override
  String get loginNameLabel => 'Magaca muuqda (ikhtiyaari)';

  @override
  String get loginEmailLabel => 'Iimayl';

  @override
  String get loginPasswordLabel => 'Furaha sirta';

  @override
  String get loginEmailRequired => 'Iimayl ayaa loo baahan yahay';

  @override
  String get loginEmailInvalid => 'Gali cinwaan iimayl sax ah';

  @override
  String get loginPasswordRequired => 'Furaha sirta ayaa loo baahan yahay';

  @override
  String get loginPasswordMinLength =>
      'Furaha sirta waa inuu ugu yaraan 8 xaraf noqdaa';

  @override
  String get loginForgotPassword => 'Ma ilowday furaha sirta?';

  @override
  String get loginEnterEmailFirst => 'Marka hore gali cinwaanka iimayl-kaaga';

  @override
  String get loginResetSent =>
      'Iimayl-ka dib-u-dejinta furaha sirta waa la diray';

  @override
  String get loginResetFailed => 'Lama diri karin iimayl-ka dib-u-dejinta';

  @override
  String get loginNewToPrayCalc => 'Cusub PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Horey ma u leedahay akoon?';

  @override
  String get accountTitle => 'Akoonka';

  @override
  String get accountNotSignedIn => 'Lama soo gelin';

  @override
  String get accountSyncSection => 'Isku mid noqod';

  @override
  String get accountSyncStatus => 'Xaalada isku mid noqodka';

  @override
  String get accountSyncNow => 'Hadda isku mid noqo';

  @override
  String get accountSyncHistory => 'Taariikhda isku mid noqodka';

  @override
  String get accountNoConflicts => 'Khilaaf lama helin';

  @override
  String accountConflictsResolved(int count) {
    return '$count la xaliyay';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Waa la isku mid noqday $time';
  }

  @override
  String get accountOfflineStatus =>
      'Offline. Isbeddelada waxaa lagu kaydiyay maxalliga.';

  @override
  String get accountSyncErrorStatus =>
      'Khalad isku-mid-noqod. Waa la isku dayi doonaa mar kale.';

  @override
  String get accountDataSection => 'Xogta';

  @override
  String get accountExportData => 'Dhigaal xogta';

  @override
  String get accountExportSubtitle =>
      'Soo deji dejintaada iyo diiwaanada salaadda';

  @override
  String get accountExportFailed => 'Lama dhigaalin karin xogta';

  @override
  String get accountSignOutTitle => 'Ka bax';

  @override
  String get accountSignOutBody =>
      'Xogtaada maxaliga waa la haysan doonaa. Soo gal mar kale si aad u sii wadato isku mid noqodka.';

  @override
  String get accountDeleteAccount => 'Tirtir akoonka';

  @override
  String get accountDeleteSubtitle =>
      'Si joogto ah u tirtir akoonkaaga iyo xogtaada';

  @override
  String get accountDeleteBody =>
      'Tani waxay si joogto ah u tirtiri doontaa akoonkaaga iyo dhammaan xogta la isku mid noqday. Xogtaada maxaliga ee aaladdan lama saari doono.\n\nFicilkani dib looma celin karo.';

  @override
  String get accountDeleted => 'Akoonka waa la tirtiray';

  @override
  String get accountDeleteFailed => 'Lama tirtiri karin akoonka';

  @override
  String get accountTimeJustNow => 'hadda';

  @override
  String accountTimeMinAgo(int min) {
    return '${min}d ka hor';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '${hour}s ka hor';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '${day}m ka hor';
  }

  @override
  String get statsTitle => 'Tirada Salaadda';

  @override
  String get statsShareTooltip => 'La wadaag tirada';

  @override
  String get statsTodayPrayers => 'Salaadaha Maanta';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Isku xir';

  @override
  String get statsDays => 'maalmood';

  @override
  String get statsThisWeek => 'Toddobaadkan';

  @override
  String get statsCompletion => 'dhammayn';

  @override
  String get statsThisMonth => 'Bishan';

  @override
  String get statsMostMissed => 'Ugu Badan La Waayay';

  @override
  String get statsThisWeekLabel => 'toddobaadkan';

  @override
  String get statsWeeklyChart => 'Dhammaynta Toddobaadlaha Salaad kasta';

  @override
  String get statsMonthlyChart => 'Dhammaynta Bishiiba Salaad kasta';

  @override
  String statsTotalLogged(int count) {
    return '$count salaad wadarta la diiwaan-geliyay';
  }

  @override
  String get statsKeepItUp => 'Sii wad!';

  @override
  String get statsShareTitle => 'Tirada Salaadda PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Isku xir: $days maalmood';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Toddobaadlaha: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Bishiiba: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Faahfaahinta toddobaadlaha:';

  @override
  String get aboutTitle => 'Ku saabsan PrayCalc';

  @override
  String get aboutWebsite => 'Websaydhka';

  @override
  String get aboutContact => 'La xiriir';

  @override
  String get aboutLicenses => 'Shatiyada Open Source';

  @override
  String get aboutCouldNotOpen => 'Lama furin karin xiriirka.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Dhammaan xuquuqda way dhowrsanyihiin.\n\nWaqtiyada salaadda waxaa lagu xisaabiyaa matoorka pray_calc_dart. Saxda waxay ku xiran tahay goobta GPS iyo habka xisaabinta la doortay.';
  }

  @override
  String get commonCancel => 'Ka noqo';

  @override
  String get commonSave => 'Kaydi';

  @override
  String get commonDelete => 'Tirtir';

  @override
  String get commonEdit => 'Wax ka beddel';

  @override
  String get commonRetry => 'Isku day mar kale';

  @override
  String get commonClose => 'Xir';

  @override
  String get commonDone => 'Waa la dhammeeyay';

  @override
  String get commonBack => 'Dib';

  @override
  String get commonNext => 'Xiga';

  @override
  String get commonSkip => 'Ka bood';

  @override
  String get commonContinue => 'Sii wad';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Haa';

  @override
  String get commonNo => 'Maya';

  @override
  String get commonShare => 'La wadaag';

  @override
  String get commonCopy => 'Koobiyee';

  @override
  String get commonCopied => 'Waa la koobiyeeyay';

  @override
  String get commonLoading => 'Waa la soo rarayaa...';

  @override
  String get commonError => 'Wax qalad ayaa dhacay';

  @override
  String get commonErrorRetry =>
      'Wax qalad ayaa dhacay. Taabo si aad mar kale u isku daydo.';

  @override
  String get commonNoInternet => 'Xiriir internet ah ma jiro';

  @override
  String get commonOfflineMode => 'Qaabka offline';

  @override
  String get commonSignIn => 'Soo gal';

  @override
  String get commonSignOut => 'Ka bax';

  @override
  String get commonSignUp => 'Isdiiwaangeli';

  @override
  String get commonProfile => 'Xogta shaqsiga';

  @override
  String get commonAccount => 'Akoonka';

  @override
  String get commonAbout => 'Ku saabsan';

  @override
  String commonVersion(String version) {
    return 'Nooca $version';
  }

  @override
  String get commonPrivacyPolicy => 'Siyaasadda Asturnaanta';

  @override
  String get commonTermsOfService => 'Shuruudaha Adeegga';

  @override
  String get commonRateApp => 'Qiimee app-ka';

  @override
  String get commonFeedback => 'Dir jawaab-celin';

  @override
  String get commonHelp => 'Caawimaad';

  @override
  String get commonLanguage => 'Luqadda';

  @override
  String get commonOpenSettings => 'Fur Dejinta';

  @override
  String get travelNotificationTitle => 'Hadda waxaad safrayaysaa';

  @override
  String get travelNotificationBody =>
      'Waqtiyada salaadda laga yaabaa in la gaabsiiyo. Taabo si aad wax uga barato xukmaha safarka.';

  @override
  String get travelRulingsTitle => 'Safar & Salaad';

  @override
  String get travelRulingsIntro =>
      'Xukmaha Islaamka ee salaadda marka la safrayayo, oo leh tixraacyo cilmiyeed Quraanka iyo Xadiisyada sugan.';

  @override
  String get travelWhenTitle => 'Goorma Ayay Safarka Khusaysaa?';

  @override
  String get travelQasrTitle => 'Gaabinta Salaadda (Qasar)';

  @override
  String get travelJamTitle => 'Isku Darida Salaadda (Jam\')';

  @override
  String get travelDurationTitle => 'Muddada Safarka';

  @override
  String get travelReferencesTitle => 'Tixraacyada Cilmiga';

  @override
  String get travelLearnMore => 'Wax badan baro';

  @override
  String get travelHanafiDefaultTitle =>
      'Sababta PrayCalc uu u Isticmaalo Default-ka Xanafiga';

  @override
  String get travelDeeperScholarly => 'Dood Cilmiyeed Qoto Dheer';

  @override
  String get onboardingTitle1 => 'Waqtiyada salaadda, meel kasta oo aad joogto';

  @override
  String get onboardingBody1 =>
      'Waqtiyada salaadda ee GPS-ku sax u yahay magaalo kasta oo dhulka ah. Fajr ilaa Isha, qorrax-soo-bax ilaa Qiyaam. Matoorkeena xisaabinta oo u dhisan saxnaanta.';

  @override
  String get onboardingTitle2 => 'Goobta aad joogto, waqtiyadaada';

  @override
  String get onboardingBody2 =>
      'Raadi magaalo kasta ama u daa GPS-ka inuu ogaado goobta aad joogto. PrayCalc wuxuu helaa waqtiyada 5 milyan oo magaalo adduunka oo dhan.';

  @override
  String get onboardingTitle3 => 'Marnaba ha seeginin salaad';

  @override
  String get onboardingBody3 =>
      'Adhaan waqtiga salaadda, xusuusino ka hor. Ajendoyin gaar ah oo Suxuurta, fasallada, iyo wax kale.';

  @override
  String get onboardingTitle4 => 'Wax kasta oo aad u baahan tahay';

  @override
  String get onboardingBody4 =>
      'Compass-ka Qiblada, taariikhda salaadda, wajiga dayaxa Hijriga, tiriyaha Tasbiixda. Dhammaan hal meel.';

  @override
  String get onboardingSkip => 'Ka bood';

  @override
  String get onboardingGetStarted => 'Bilaaw';

  @override
  String get onboardingSignInTitle => 'Soo gal PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Kaydi taariikhda salaaddaada oo\nkula mid noqo dhammaan aaladahaaga.';

  @override
  String get onboardingContinueGoogle => 'Ku sii wad Google';

  @override
  String get onboardingContinueWithoutAccount => 'Ku sii wad akoon la\'aan';

  @override
  String get onboardingSigningIn => 'Waa la soo galayaa…';

  @override
  String get onboardingSelectLanguage => 'Dooro Luqad';

  @override
  String get duaDhikrTitle => 'Ducada & Dhikriga';

  @override
  String get duaDhikrTabDua => 'Duco';

  @override
  String get duaDhikrTabDhikr => 'Dhikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbiix';

  @override
  String get duaDhikrTabMorning => 'Subax';

  @override
  String get duaDhikrTabEvening => 'Fiid';

  @override
  String get duaDhikrMorningAdhkar => 'Adhkaar Subax';

  @override
  String get duaDhikrEveningAdhkar => 'Adhkaar Fiid';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Taariikhda sannadka';

  @override
  String get calExportIcsTooltip => 'Dhigaal .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Ku muuji khariidadda';

  @override
  String get qiblaWaitingCompass => 'Waa la sugayaa compass-ka...';

  @override
  String get qiblaNoCompassSensor =>
      'Sensor compass ma jiro. Waxaa la muujinayaa jihada Qiblada si taagan.';

  @override
  String get qiblaAccuracyExcellent => 'Saxnaan aad u fiican';

  @override
  String get qiblaAccuracyGood => 'Saxnaan wanaagsan';

  @override
  String get qiblaAccuracyFair =>
      'Saxnaan dhexdhexaad. U dhaq telefoonkaaga qaab 8-aad si aad u hagaajiso.';

  @override
  String get qiblaAccuracyLow =>
      'Saxnaan hoose. U dhaq telefoonkaaga qaab 8-aad si aad u hagaajiso.';

  @override
  String get qiblaToTheKaaba => 'xagga Kacbada';

  @override
  String get qiblaYourLocation => 'Goobta aad joogto';

  @override
  String get qiblaGpsAccurate => 'GPS sax ah';

  @override
  String get qiblaCityCenter => 'Bartamaha magaalada';

  @override
  String get moonIlluminatedLabel => 'Iftiin';

  @override
  String get moonAgeLabel => 'Da\'da';

  @override
  String get moonFirstQtr => 'Rubucii Koowaad';

  @override
  String get moonLastQtr => 'Rubucii Ugu Dambeeyay';

  @override
  String get moonTonight => 'Caawa';

  @override
  String get moonTomorrow => 'Berri';

  @override
  String moonDaysAway(int days) {
    return '${days}m';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Deji Goobta Guriga';

  @override
  String get setHomeSearchHint => 'Raadi magaalo, tuulo ama zip…';

  @override
  String get setHomeClear => 'Nadiifi';

  @override
  String get setHomeUseCurrentLocation => 'Isticmaal Goobta Hadda';

  @override
  String get setHomeDetectAndSet => 'Ogaaw goobta aad joogto oo u deji guriga';

  @override
  String get setHomeAlreadySet => 'Guriga horey ayaa loo dejiyay';

  @override
  String setHomeSetAs(String city) {
    return '$city waxaa loo dejiyay guriga';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Goobta hadda waxaa loo dejiyay guriga';

  @override
  String get setHomePermissionDenied =>
      'Ogolaanshaha goobta waa la diiday. Hoosta ka raadi magaalo.';

  @override
  String get setHomeGpsUnavailable => 'GPS ma diyaara. Gacanta ku raadi.';

  @override
  String get setHomeNoCitiesFound => 'Magaalo lama helin.';

  @override
  String get setHomeSearchPrompt => 'Raadi magaaladaada guriga';

  @override
  String get setHomeSearchBody =>
      'Kor ku qor si aad u raadiso, ama isticmaal goobta aad hadda joogto. Qaabka safarka wuxuu ogaan doonaa marka aad ka maqan tahay guriga.';

  @override
  String get subscriptionYouHavePlus => 'Waxaad leedahay Ummat+';

  @override
  String get subscriptionUpgradeTo => 'U kor u qaad Ummat+';

  @override
  String get subscriptionThankYou =>
      'Waad ku mahadsan tahay taageerada PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Fur sifooyinka premium-ka aaladahaaga oo dhan.';

  @override
  String get subscriptionManageSub => 'Maaree xiriirka';

  @override
  String get subscriptionWelcome => 'Ku soo dhawoow Ummat+!';

  @override
  String get subscriptionSubscribe => 'Isdiiwaangeli';

  @override
  String get subscriptionFreeFeatures => 'Sifooyinka Bilaashka';

  @override
  String get subscriptionPlusFeatures => 'Sifooyinka Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Waqtiyada salaadda';

  @override
  String get subscriptionFeatureQibla => 'Compass-ka Qiblada';

  @override
  String get subscriptionFeatureCalendar => 'Taariikhda bishiiba';

  @override
  String get subscriptionFeatureTasbeeh => 'Tiriyaha Tasbiixda';

  @override
  String get subscriptionFeatureMoon => 'Dayaxa & Hijri';

  @override
  String get smartHomeAlertType => 'Nooca Digniin';

  @override
  String get smartHomeAlertModal => 'Shaashad-buuxda modal';

  @override
  String get smartHomeAlertCorner => 'Ogeysiis geeska';

  @override
  String get smartHomeAlertNone => 'Midna (aamusnaan)';

  @override
  String get smartHomePauseMedia => 'Jooji warbaahinta adhaanka';

  @override
  String get smartHomeQuietHours => 'Saacadaha aamusnaanta';

  @override
  String get smartHomeQuietFrom => 'Ka bilaaw';

  @override
  String get smartHomeQuietTo => 'Ilaa';

  @override
  String get smartHomePrayerAudio => 'Codka salaat kasta';

  @override
  String get smartHomeAudioAdhan => 'Adhaan';

  @override
  String get smartHomeAudioBeep => 'Dhawaaq';

  @override
  String get smartHomeAudioSilent => 'Aamusnaan';

  @override
  String get aboutPrivacy => 'Siyaasadda Asturnaanta';

  @override
  String aboutVersion(String version) {
    return 'Nooca $version';
  }

  @override
  String get notifDefaultAdhan => 'Adhaanka Caadiga';

  @override
  String get notifFajrAdhan => 'Adhaanka Fajr';

  @override
  String get notifFajrAdhanSubtitle =>
      'Waxaa la ciyaaraa waqtiga salaadda Fajr';

  @override
  String get notifRegularAdhan => 'Adhaanka Caadiga';

  @override
  String get notifRegularAdhanSubtitle =>
      'Waxaa la ciyaaraa Dhuhr, Asr, Maghrib, Isha';

  @override
  String get notifPerPrayerSettings => 'Dejinta Salaat kasta';

  @override
  String get notifPreview => 'Hordhac';

  @override
  String get tvSettingsTitle => 'Dejinta TV';

  @override
  String get tvDisplayMode => 'Qaabka Muuqaalka';

  @override
  String get tvMasjidMode => 'Qaabka Masjidka';

  @override
  String get tvMasjidModeSubtitle =>
      'Muuqaal calaamad weyn oo leh waqtiyada iqaamah';

  @override
  String get tvMasjidName => 'Magaca Masjidka';

  @override
  String get tvMasjidNameTapToSet => 'Taabo si aad u dejiso';

  @override
  String get tvClock => 'Saacad';

  @override
  String get tv24hFormat => 'Qaabka 24 saac';

  @override
  String get tvIqamahOffsets =>
      'Kala duwanaashada Iqaamah (daqiiqooyinka adhaanka ka dib)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset daqiiqo adhaanka ka dib';
  }

  @override
  String get tvQrCode => 'QR Code';

  @override
  String get tvShowQrCode => 'Muuji QR Code';

  @override
  String get tvShowQrCodeSubtitle => 'Ku muuji QR code shaashada masjidka';

  @override
  String get tvQrCodeUrl => 'URL-ka QR Code';

  @override
  String get tvAmbientModeSection => 'Qaabka Deegaanka';

  @override
  String get tvIdleTimeout => 'Waqtiga firaaqada';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes daqiiqo ka hor inta aan ambient-ku hawlgelin';
  }

  @override
  String get tvPhotoInterval => 'Kala fogaanshaha sawirka';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds ilbiriqsi u dhexeeya sawirada';
  }

  @override
  String get tvBackground => 'Asalka';

  @override
  String get tvPhotoCategory => 'Qaybta sawirka';

  @override
  String get tvLocation => 'Goobta';

  @override
  String get tvChangeCity => 'Beddel Magaalada';

  @override
  String get tvChangeCitySubtitle => 'Raadi magaalo kale';

  @override
  String get tvScreensaverBg => 'Asalka Screensaver-ka';

  @override
  String get tvScreensaverPhotos => 'Sawirada';

  @override
  String get tvScreensaverPattern => 'Qaab joomitiri';

  @override
  String get tvScreensaverBoth => 'Sawirada + qaab';

  @override
  String get tvCategoryAll => 'Dhammaan qaybaha';

  @override
  String get tvCategoryMasjids => 'Masaajidda';

  @override
  String get tvCategoryInteriors => 'Gudaha';

  @override
  String get tvCategoryGeometric => 'Joomitiri';

  @override
  String get tvCategoryCalligraphy => 'Fanka qoraalka';

  @override
  String get tvCategoryLandscapes => 'Muuqaallada dabiiciga';

  @override
  String get tvCategoryRamadan => 'Ramadaan';

  @override
  String get tvPhotoCategoryTitle => 'Qaybta Sawirka';

  @override
  String tvEnterHint(String title) {
    return 'Gali $title';
  }

  @override
  String get tvSystemDefault => 'Caadiga nidaamka';

  @override
  String get smartHomeIntegrations => 'Isdhexgelinta';

  @override
  String get smartHomeLinkedSpeakers => 'Speakers & Shaashado La Xiray';

  @override
  String get smartHomeAlertDisplay => 'Muuqaalka Digniinta';

  @override
  String get smartHomeAtAdhanShow => 'Waqtiga adhaanka muuji';

  @override
  String get smartHomePauseMediaTitle => 'Jooji warbaahinta adhaanka';

  @override
  String get smartHomePauseMediaSubtitle => 'Waa la sii wadaa adhaanka ka dib';

  @override
  String get smartHomePrayerAudioSection => 'Codka Salaadda';

  @override
  String get smartHomeQuietHoursSection => 'Saacadaha Aamusnaanta';

  @override
  String get smartHomeEnableQuietHours => 'Hawlgali saacadaha aamusnaanta';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Dhammaan digniimaha guriga casriga waa la aamusinayaa';

  @override
  String get smartHomeNoDevices => 'Wali aalad lama xirin';

  @override
  String get smartHomeNoDevicesDesc =>
      'Ku xir Google Home ama Alexa sare, ka dibna speakers-kaaga iyo shaashada ayaa halkan ka muuqan doonta.';

  @override
  String get smartHomeRequiresPlus =>
      'Guriga Casriga wuxuu u baahan yahay Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Xakamee ogeysiisyada salaadda Google Home, Alexa, Siri, iyo Home Assistant. Habee aaladaha adhaanka ciyaara, goorta warbaahinta la joojiyo, iyo deji saacadaha aamusnaanta.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Ku baahi adhaanka speakers-ka iyo shaashada Nest.';

  @override
  String get smartHomeEnableAlexa => 'Hawlgali skill-ka PrayCalc ee Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Weydii Siri waqtiyada salaadda ama deji automations.';

  @override
  String get smartHomeHassAdd =>
      'Ku dar HACS si loo helo taageero automation oo buuxda.';

  @override
  String get smartHomeSetupGuide => 'Hagaha dejinta';

  @override
  String get smartHomeSiriSetupTitle => 'Dejinta Siri Shortcuts';

  @override
  String get smartHomeSiriStep1 =>
      'Fur app-ka Shortcuts ee iPhone-kaaga ama iPad-kaaga.';

  @override
  String get smartHomeSiriStep2 =>
      'Taabo \"+\" si aad u abuurto shortcut cusub.';

  @override
  String get smartHomeSiriStep3 => 'Raadi \"PrayCalc\" liiska ficillada.';

  @override
  String get smartHomeSiriStep4 =>
      'Ku dar \"Waqtiga Salaadda Xigta\" ama \"Waqtiyada Salaadda Maanta\".';

  @override
  String get smartHomeSiriStep5 =>
      'Si ikhtiyaari ah u dar automation (tus. maalin kasta Fajrka).';

  @override
  String get smartHomeSiriStep6 =>
      'Dheh \"Hey Siri, waqtiga salaadda xigta\" si aad u tijaabiso.';

  @override
  String get smartHomeSiriFootnote =>
      'Waxay u baahan tahay iOS 16 ama ka dambeeya.';

  @override
  String get smartHomeHassSetupTitle => 'Dejinta Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Ku rakib HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 => 'HACS-ka, raadi \"PrayCalc\" oo rakib.';

  @override
  String get smartHomeHassStep3 =>
      'Aad Settings > Devices & Services > Add Integration.';

  @override
  String get smartHomeHassStep4 => 'Raadi \"PrayCalc\" oo dooro.';

  @override
  String get smartHomeHassStep5 =>
      'Gali furaha API-ga PrayCalc (laga sameeyay akoonkaaga).';

  @override
  String get smartHomeHassStep6 =>
      'Habee goobta aad joogto iyo habka xisaabinta.';

  @override
  String get smartHomeHassFootnote =>
      'Waxay u baahan tahay Home Assistant 2024.1+ oo leh HACS.';

  @override
  String get smartHomeApiKey => 'Furaha API';

  @override
  String get smartHomeGenerateApiKey => 'Samee Furaha API';

  @override
  String get smartHomeApiKeyNotReady =>
      'Sameynta furaha API waxay diyaar noqon doontaa marka adeegga casriga ee PrayCalc la geeyo.';

  @override
  String get smartHomeApiKeyDesc =>
      'Waxaad u baahan doontaa fure API ah si aad ugu xirto Home Assistant akoonkaaga PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'Waa La Xiray';

  @override
  String get smartHomeNotLinkedStatus => 'Lama xirin';

  @override
  String get smartHomeCouldNotOpen => 'Lama furin karin xiriirka.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total la dhammeeyay';
  }

  @override
  String get adhkarReset => 'Dib u deji';

  @override
  String get syncHistoryTitle => 'Taariikhda Isku Mid Noqodka';

  @override
  String get syncClearHistory => 'Tirtir taariikhda';

  @override
  String get syncNoConflicts =>
      'Khilaaf isku mid noqod lama helin. Dhammaan aaladaha waa isku mid yihiin.';

  @override
  String get syncDomainSettings => 'Dejinta';

  @override
  String get syncDomainCities => 'Magaalooyinka La Kaydiyay';

  @override
  String get syncDomainPrayerLogs => 'Diiwaanka Salaadda';

  @override
  String get syncTimeJustNow => 'hadda';

  @override
  String syncTimeMinAgo(int min) {
    return '${min}d ka hor';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '${hour}s ka hor';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '${day}m ka hor';
  }

  @override
  String get pinCity => 'Xidhidh';

  @override
  String get pinMaxReached =>
      'Ugu badnaan 5 magaalo la xidhay. U kor u qaad Ummat+ si aad wax badan u hesho.';

  @override
  String pinCityUnpinned(String city) {
    return '$city waa la furturay';
  }

  @override
  String get pinUndo => 'Ka noqo';
}
