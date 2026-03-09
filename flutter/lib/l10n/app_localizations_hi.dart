// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'फज्र';

  @override
  String get prayerSunrise => 'सूर्योदय';

  @override
  String get prayerDhuhr => 'ज़ुहर';

  @override
  String get prayerAsr => 'अस्र';

  @override
  String get prayerMaghrib => 'मग़रिब';

  @override
  String get prayerIsha => 'इशा';

  @override
  String get prayerQiyam => 'क़ियामुल लैल';

  @override
  String get prayerSuhoor => 'सहरी';

  @override
  String get prayerIftar => 'इफ़्तार';

  @override
  String get hijriMuharram => 'मुहर्रम';

  @override
  String get hijriSafar => 'सफ़र';

  @override
  String get hijriRabiAlAwwal => 'रबीउल अव्वल';

  @override
  String get hijriRabiAlThani => 'रबीउस सानी';

  @override
  String get hijriJumadaAlAwwal => 'जुमादल ऊला';

  @override
  String get hijriJumadaAlThani => 'जुमादस सानी';

  @override
  String get hijriRajab => 'रजब';

  @override
  String get hijriShaban => 'शाबान';

  @override
  String get hijriRamadan => 'रमज़ान';

  @override
  String get hijriShawwal => 'शव्वाल';

  @override
  String get hijriDhulQidah => 'ज़ुल-क़ादा';

  @override
  String get hijriDhulHijjah => 'ज़ुल-हिज्जा';

  @override
  String get monthJan => 'जन';

  @override
  String get monthFeb => 'फ़र';

  @override
  String get monthMar => 'मार्च';

  @override
  String get monthApr => 'अप्रै';

  @override
  String get monthMay => 'मई';

  @override
  String get monthJun => 'जून';

  @override
  String get monthJul => 'जुल';

  @override
  String get monthAug => 'अग';

  @override
  String get monthSep => 'सित';

  @override
  String get monthOct => 'अक्टू';

  @override
  String get monthNov => 'नव';

  @override
  String get monthDec => 'दिस';

  @override
  String get monthJanuary => 'जनवरी';

  @override
  String get monthFebruary => 'फ़रवरी';

  @override
  String get monthMarch => 'मार्च';

  @override
  String get monthApril => 'अप्रैल';

  @override
  String get monthMayFull => 'मई';

  @override
  String get monthJune => 'जून';

  @override
  String get monthJuly => 'जुलाई';

  @override
  String get monthAugust => 'अगस्त';

  @override
  String get monthSeptember => 'सितम्बर';

  @override
  String get monthOctober => 'अक्टूबर';

  @override
  String get monthNovember => 'नवम्बर';

  @override
  String get monthDecember => 'दिसम्बर';

  @override
  String get dayMonShort => 'सोम';

  @override
  String get dayTueShort => 'मंगल';

  @override
  String get dayWedShort => 'बुध';

  @override
  String get dayThuShort => 'गुरु';

  @override
  String get dayFriShort => 'शुक्र';

  @override
  String get daySatShort => 'शनि';

  @override
  String get daySunShort => 'रवि';

  @override
  String get dayMonday => 'सोमवार';

  @override
  String get dayTuesday => 'मंगलवार';

  @override
  String get dayWednesday => 'बुधवार';

  @override
  String get dayThursday => 'गुरुवार';

  @override
  String get dayFriday => 'शुक्रवार';

  @override
  String get daySaturday => 'शनिवार';

  @override
  String get daySunday => 'रविवार';

  @override
  String get daySuChart => 'रवि';

  @override
  String get dayMoChart => 'सोम';

  @override
  String get dayTuChart => 'मंगल';

  @override
  String get dayWeChart => 'बुध';

  @override
  String get dayThChart => 'गुरु';

  @override
  String get dayFrChart => 'शुक्र';

  @override
  String get daySaChart => 'शनि';

  @override
  String get chooseCityLabel => 'शहर चुनें';

  @override
  String get setCityFab => 'शहर सेट करें';

  @override
  String prayerTimesError(Object error) {
    return 'नमाज़ के समय की गणना नहीं हो सकी।\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer में';
  }

  @override
  String get ramadanMubarak => 'रमज़ान मुबारक';

  @override
  String ramadanDayProgress(int day) {
    return 'दिन $day / 30';
  }

  @override
  String get lastTenNights => 'आख़िरी 10 रातें';

  @override
  String get laylatulQadr => 'लैलतुल क़द्र';

  @override
  String get homeSuffixAH => 'हिजरी';

  @override
  String get homeSuffixCE => 'ई.';

  @override
  String get homeNoCitySelected => 'कोई शहर नहीं चुना गया';

  @override
  String get homeNoCityHint =>
      'अपना शहर खोजने या GPS चालू करने के लिए ऊपर टैप करें।';

  @override
  String get homeCouldNotCalc => 'नमाज़ के समय की गणना नहीं हो सकी।';

  @override
  String get homeQasr => 'क़स्र';

  @override
  String get homeActionMonthlyTimes => 'मासिक\nसमय';

  @override
  String get homeActionDuaDhikr => 'दुआ और\nज़िक्र';

  @override
  String get homeActionPrayerStats => 'नमाज़\nआँकड़े';

  @override
  String homePolarBanner(int count) {
    return 'इस अवधि में आपके स्थान के लिए $count नमाज़ के समय की गणना नहीं हो सकती (मध्यरात्रि सूर्य / ध्रुवीय रात)। सेटिंग्स में निकटतम अक्षांश अनुमान आज़माएँ।';
  }

  @override
  String get settingsTitle => 'सेटिंग्स';

  @override
  String get settingsSectionPrayerCalc => 'नमाज़ गणना';

  @override
  String get settingsCalcMethod => 'गणना विधि';

  @override
  String get settingsCalcMethodAuto => 'स्वचालित (गतिशील)';

  @override
  String get settingsHanafiAsr => 'हनफ़ी अस्र';

  @override
  String get settingsHanafiAsrSubtitle => 'छाया गुणक 2x (देर से अस्र का समय)';

  @override
  String get settingsSectionDisplay => 'प्रदर्शन';

  @override
  String get settings24hClock => '24 घंटे की घड़ी';

  @override
  String get settingsFollowSystemTheme => 'सिस्टम थीम का पालन करें';

  @override
  String get settingsDarkMode => 'डार्क मोड';

  @override
  String get settingsSectionNotifications => 'सूचनाएँ';

  @override
  String get settingsPrayerNotifications => 'नमाज़ सूचनाएँ';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'अज़ान, रिमाइंडर, और प्रत्येक नमाज़ की सेटिंग्स';

  @override
  String get settingsPrayerAgendas => 'नमाज़ एजेंडा';

  @override
  String get settingsPrayerAgendasSubtitle => 'नमाज़ के समय से कस्टम रिमाइंडर';

  @override
  String get settingsAccount => 'खाता';

  @override
  String get settingsSignInToSync => 'सिंक करने के लिए साइन इन करें';

  @override
  String get settingsSignInToSyncSubtitle => 'अपना डेटा सभी डिवाइसों पर रखें';

  @override
  String get settingsHomeScreen => 'होम स्क्रीन';

  @override
  String get settingsSkyGradient => 'आकाश ग्रेडिएंट पृष्ठभूमि';

  @override
  String get settingsSkyGradientSubtitle =>
      'दिन के समय से मेल खाते एनिमेटेड आकाश रंग';

  @override
  String get settingsWeatherGradient => 'मौसम-रंगित ग्रेडिएंट';

  @override
  String get settingsWeatherGradientSubtitle =>
      'स्थानीय मौसम के आधार पर आकाश के रंग समायोजित करें';

  @override
  String get settingsCountdownAnimation => 'काउंटडाउन एनीमेशन';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'अगली नमाज़ काउंटडाउन पर श्वास रिंग';

  @override
  String get settingsPrayerTracking => 'नमाज़ ट्रैकिंग';

  @override
  String get settingsTrackMyPrayers => 'मेरी नमाज़ ट्रैक करें';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'रोज़ाना कौन सी नमाज़ पढ़ी उसका रिकॉर्ड रखें';

  @override
  String get settingsPrayerStats => 'नमाज़ आँकड़े';

  @override
  String get settingsPrayerStatsSubtitle =>
      'श्रृंखला, साप्ताहिक और मासिक चार्ट';

  @override
  String get settingsJumuahKahf => 'जुमुआ अल-कहफ़ रिमाइंडर';

  @override
  String get settingsJumuahKahfSubtitle =>
      'शुक्रवार को सूरह अल-कहफ़ पढ़ने का रिमाइंडर';

  @override
  String get settingsTravel => 'यात्रा';

  @override
  String get settingsTravelMode => 'यात्रा मोड';

  @override
  String get settingsTravelModeSubtitle =>
      'घर से दूर होने पर स्वचालित रूप से पता लगाएँ और नमाज़ समायोजित करें';

  @override
  String get settingsHomeLocation => 'घर का स्थान';

  @override
  String get settingsHomeLocationNotSet =>
      'सेट नहीं है — वर्तमान स्थान उपयोग करने के लिए टैप करें';

  @override
  String get settingsClearHomeLocation => 'घर का स्थान साफ़ करें';

  @override
  String get settingsTravelRulings => 'यात्रा नमाज़ नियम';

  @override
  String get settingsTravelRulingsSubtitle =>
      'क़स्र, जमा, और मुसाफ़िर दिशानिर्देश';

  @override
  String get settingsSmartHome => 'स्मार्ट होम';

  @override
  String get settingsSmartHomeIntegrations => 'स्मार्ट होम इंटीग्रेशन';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'टीवी डिस्प्ले';

  @override
  String get settingsTvHome => 'टीवी होम डिस्प्ले';

  @override
  String get settingsTvHomeSubtitle => 'टीवी के लिए फुल-स्क्रीन नमाज़ घड़ी';

  @override
  String get settingsMasjidDisplay => 'मस्जिद डिस्प्ले';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'मस्जिद स्क्रीन के लिए अज़ान/इक़ामत टेबल';

  @override
  String get settingsTvSettings => 'टीवी सेटिंग्स';

  @override
  String get settingsTvSettingsSubtitle => 'मस्जिद मोड, इक़ामत ऑफसेट, एम्बियंट';

  @override
  String get settingsAboutPrayCalc => 'PrayCalc के बारे में';

  @override
  String get syncSynced => 'सिंक हो गया';

  @override
  String get syncSyncing => 'सिंक हो रहा है...';

  @override
  String get syncOffline => 'ऑफ़लाइन';

  @override
  String get syncError => 'सिंक त्रुटि';

  @override
  String get notifSettingsTitle => 'सूचनाएँ और अज़ान';

  @override
  String get notifAdhanLabel => 'अज़ान';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'रिमाइंडर: $minutes मिनट पहले';
  }

  @override
  String notifVolumePct(int pct) {
    return 'वॉल्यूम: $pct%';
  }

  @override
  String get notifTestAdhan => 'अज़ान टेस्ट';

  @override
  String get notifModeOff => 'बंद';

  @override
  String get notifModeReminderOnly => 'केवल रिमाइंडर';

  @override
  String get notifModeArrival => 'नमाज़ के समय';

  @override
  String get notifModeBoth => 'रिमाइंडर + समय';

  @override
  String get citySearchHint => 'शहर खोजें…';

  @override
  String get citySearchDetectTooltip => 'मेरा स्थान पता लगाएँ';

  @override
  String get citySearchNoCityGps => 'GPS से शहर का पता नहीं लग सका।';

  @override
  String get citySearchPermissionDenied =>
      'स्थान अनुमति अस्वीकृत। मैन्युअल खोजें।';

  @override
  String get citySearchNoResults => 'कोई शहर नहीं मिला।';

  @override
  String get citySearchStartTyping => 'खोजने के लिए टाइप करें…';

  @override
  String get agendasTitle => 'नमाज़ एजेंडा';

  @override
  String get agendasEmpty =>
      'अभी कोई एजेंडा नहीं है।\nअपनी नमाज़ से जुड़ा रिमाइंडर जोड़ने के लिए + टैप करें।';

  @override
  String get agendasUndo => 'पूर्ववत करें';

  @override
  String agendasRemoved(String label) {
    return '$label हटा दिया गया';
  }

  @override
  String get agendaNewTitle => 'नया एजेंडा';

  @override
  String get agendaEditTitle => 'एजेंडा संपादित करें';

  @override
  String get agendaSave => 'सहेजें';

  @override
  String get agendaLabelEmpty => 'लेबल ख़ाली नहीं हो सकता';

  @override
  String get agendaLabelField => 'लेबल';

  @override
  String get agendaLabelHint => 'जैसे: फज्र के लिए जागें';

  @override
  String get agendaPrayerSection => 'नमाज़';

  @override
  String get agendaTimeOffsetSection => 'समय ऑफसेट';

  @override
  String get agendaOffsetAtPrayerTime => 'नमाज़ के समय';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes मिनट पहले';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes मिनट बाद';
  }

  @override
  String get agendaRepeatSection => 'दोहराएँ';

  @override
  String get agendaNotifTypeSection => 'सूचना प्रकार';

  @override
  String get agendaNotifSilent => 'मूक';

  @override
  String get agendaNotifSound => 'ध्वनि';

  @override
  String get agendaNotifVibrate => 'कंपन';

  @override
  String get agendaDayM => 'सोम';

  @override
  String get agendaDayT => 'मंग';

  @override
  String get agendaDayW => 'बुध';

  @override
  String get agendaDayF => 'शुक्र';

  @override
  String get agendaDayS => 'शनि';

  @override
  String get moonTitle => 'चाँद और हिजरी कैलेंडर';

  @override
  String moonIlluminated(int pct) {
    return '$pct% प्रकाशित';
  }

  @override
  String get moonFullTonight => 'आज रात पूर्णिमा!';

  @override
  String get moonNextTomorrow => 'अगली पूर्णिमा कल';

  @override
  String moonNextDays(int days) {
    return 'अगली पूर्णिमा $days दिनों में';
  }

  @override
  String moonAge(String age) {
    return 'चाँद की आयु: $age दिन';
  }

  @override
  String get moonPhaseNewMoon => 'अमावस्या';

  @override
  String get moonPhaseWaxingCrescent => 'बढ़ता चंद्रमा';

  @override
  String get moonPhaseFirstQuarter => 'पहली तिमाही';

  @override
  String get moonPhaseWaxingGibbous => 'बढ़ता गिबस';

  @override
  String get moonPhaseFullMoon => 'पूर्णिमा';

  @override
  String get moonPhaseWaningGibbous => 'घटता गिबस';

  @override
  String get moonPhaseLastQuarter => 'अंतिम तिमाही';

  @override
  String get moonPhaseWaningCrescent => 'घटता चंद्रमा';

  @override
  String get moonHilalVisibility => 'अगली हिलाल दृश्यता';

  @override
  String get moonRegionMiddleEast => 'मध्य पूर्व';

  @override
  String get moonRegionWestAfrica => 'पश्चिम अफ़्रीका';

  @override
  String get moonRegionSouthAsia => 'दक्षिण एशिया';

  @override
  String get moonRegionEurope => 'यूरोप';

  @override
  String get moonRegionAmericas => 'अमेरिका';

  @override
  String get moonVisible => 'दृश्य';

  @override
  String get moonNotVisible => 'दृश्य नहीं';

  @override
  String get moonPossible => 'संभव';

  @override
  String get moonUpcomingDates => 'आगामी इस्लामी तिथियाँ';

  @override
  String get hijriTodayLabel => 'आज हिजरी कैलेंडर में';

  @override
  String ramadanBeginsLabel(int year) {
    return 'रमज़ान $year हिजरी शुरू';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days दिन बाकी';
  }

  @override
  String get moonLunarCycle => 'चंद्र चक्र';

  @override
  String moonDayOfCycle(int day) {
    return 'दिन $day / ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'हिलाल दर्शन पूर्वानुमान';

  @override
  String get moonHilalVisibilityMap => 'हिलाल दृश्यता मानचित्र';

  @override
  String moonDayN(int day) {
    return 'दिन $day';
  }

  @override
  String get moonGlobalSighting => 'वैश्विक दर्शन';

  @override
  String get moonZoneNakedEye => 'नंगी आँख';

  @override
  String get moonZoneBinoculars => 'दूरबीन';

  @override
  String get moonZoneVeryDifficult => 'बहुत कठिन';

  @override
  String get moonZoneNotVisible => 'दृश्य नहीं';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year हिजरी संभवतः 29 दिनों का होगा। इन शा अल्लाह 29वें दिन चाँद दिखने की उम्मीद है।';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year हिजरी संभवतः 30 दिनों का होगा। 29वें दिन चाँद दिखने की संभावना नहीं — महीना 30 दिनों में पूरा होगा।';
  }

  @override
  String get moonUmmAlQura => 'उम्मुल क़ुरा';

  @override
  String get moonSaudiArabia => 'सऊदी अरब';

  @override
  String get moonFCNACalc => 'FCNA / गणना';

  @override
  String get moonNorthAmerica => 'उत्तरी अमेरिका';

  @override
  String moonNDays(int days) {
    return '$days दिन';
  }

  @override
  String moonStarts(String month) {
    return '$month शुरू:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'सूर्यास्त पर चाँद की आयु: $hours घंटे';
  }

  @override
  String get moon7DayLunarCalendar => '7-दिन चंद्र कैलेंडर';

  @override
  String get moonUpcomingIslamicEvents => 'आगामी इस्लामी आयोजन';

  @override
  String get moonTodayLabel => 'आज';

  @override
  String get moonTomorrowLabel => 'कल';

  @override
  String get calDateCol => 'तारीख';

  @override
  String get calHijriCol => 'हिजरी';

  @override
  String get calFajrCol => 'फज्र';

  @override
  String get calSunriseCol => 'सूर्योदय';

  @override
  String get calDhuhrCol => 'ज़ुहर';

  @override
  String get calAsrCol => 'अस्र';

  @override
  String get calMaghribCol => 'मग़रिब';

  @override
  String get calIshaCol => 'इशा';

  @override
  String get calNoCityText =>
      'नमाज़ कैलेंडर देखने के लिए\nपहले अपना शहर सेट करें।';

  @override
  String get calShareTooltip => 'कैलेंडर शेयर करें';

  @override
  String get calPrevMonthTooltip => 'पिछला महीना';

  @override
  String get calNextMonthTooltip => 'अगला महीना';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'नमाज़ का समय — $month';
  }

  @override
  String get qiblaTitle => 'क़िबला';

  @override
  String get qiblaSwitchToCompass => 'कम्पास पर जाएँ';

  @override
  String get qiblaSwitchToAR => 'AR कैमरे पर जाएँ';

  @override
  String get qiblaNoCityText =>
      'क़िबला दिशा की गणना के लिए\nपहले अपना शहर सेट करें।';

  @override
  String get qiblaCompassUnavailable =>
      'इस डिवाइस पर कम्पास सेंसर उपलब्ध नहीं है।';

  @override
  String get qiblaCalibrate => 'कैलिब्रेट: अपने फ़ोन को 8 के आकार में घुमाएँ।';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return 'उत्तर से $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return '$city से';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'काबा से $dist किमी';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return 'काबा से $dist हज़ार किमी';
  }

  @override
  String get qiblaFacingQibla => 'क़िबला की ओर ✓';

  @override
  String get tasbeehTitle => 'तस्बीह';

  @override
  String get tasbeehResetTooltip => 'रीसेट';

  @override
  String get tasbeehTapToSwitch => 'बदलने के लिए लेबल टैप करें';

  @override
  String get tasbeehTapToCount => 'गिनने के लिए कहीं भी टैप करें';

  @override
  String get tasbeehResetDialogTitle => 'काउंटर रीसेट करें?';

  @override
  String get tasbeehResetDialogContent => 'यह वर्तमान गिनती शून्य कर देगा।';

  @override
  String get tasbeehCancel => 'रद्द करें';

  @override
  String get tasbeehReset => 'रीसेट';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'आज: $count ज़िक्र';
  }

  @override
  String get tasbeehLast7Days => 'पिछले 7 दिन';

  @override
  String get tasbeehNoHistory => 'अभी कोई इतिहास नहीं — गिनती शुरू करें!';

  @override
  String tasbeehComplete(int count) {
    return 'तस्बीह पूर्ण! $count ज़िक्र';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'स्मार्ट होम';

  @override
  String get smartHomeSubtitle => 'अपने डिवाइस नमाज़ के समय से जोड़ें';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Google से नमाज़ के समय और क़िबला दिशा पूछें';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Alexa से नमाज़ के समय, अगली नमाज़ और अधिक पूछें';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc => 'नमाज़ के समय के लिए कस्टम शॉर्टकट बनाएँ';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'नमाज़ के समय पर लाइट, डिस्प्ले और रिमाइंडर ऑटोमेट करें';

  @override
  String get smartHomeLinkAccount => 'खाता लिंक करें';

  @override
  String get smartHomeLinked => 'लिंक किया गया';

  @override
  String get smartHomeUnlink => 'अनलिंक करें';

  @override
  String get smartHomeSetupInstructions => 'सेटअप निर्देश';

  @override
  String get smartHomeRequiresUmmatPlus => 'Ummat+ आवश्यक';

  @override
  String get smartHomeTroubleshooting => 'समस्या निवारण';

  @override
  String get smartHomeTestConnection => 'कनेक्शन टेस्ट';

  @override
  String get smartHomeConnectionSuccess => 'सफलतापूर्वक जुड़ गया';

  @override
  String get smartHomeConnectionFailed =>
      'कनेक्शन विफल। अपना खाता लिंक जाँचें।';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'प्रीमियम नमाज़ सुविधाएँ';

  @override
  String get subscriptionUpgrade => 'Ummat+ में अपग्रेड करें';

  @override
  String get subscriptionRestore => 'खरीदारी पुनर्स्थापित करें';

  @override
  String get subscriptionManage => 'सदस्यता प्रबंधित करें';

  @override
  String get subscriptionCancel => 'सदस्यता रद्द करें';

  @override
  String get subscriptionActive => 'सक्रिय';

  @override
  String get subscriptionExpired => 'समाप्त';

  @override
  String get subscriptionFree => 'मुफ़्त';

  @override
  String get subscriptionFreeDesc => 'बुनियादी नमाज़ का समय, क़िबला, कैलेंडर';

  @override
  String get subscriptionPlusDesc =>
      'स्मार्ट होम, टीवी डिस्प्ले, विजेट और अधिक';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count मुफ़्त क्वेरी बाकी';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/वर्ष';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/माह';
  }

  @override
  String get subscriptionFeatureSmartHome => 'स्मार्ट होम इंटीग्रेशन';

  @override
  String get subscriptionFeatureTV => 'टीवी डिस्प्ले मोड';

  @override
  String get subscriptionFeatureWidgets => 'होम स्क्रीन विजेट';

  @override
  String get subscriptionFeatureWatch => 'वॉच कॉम्प्लिकेशन';

  @override
  String get subscriptionFeatureSync => 'क्रॉस-डिवाइस सिंक';

  @override
  String get subscriptionFeatureAdFree => 'विज्ञापन-मुक्त अनुभव';

  @override
  String get watchTitle => 'वॉच';

  @override
  String get watchNextPrayer => 'अगली नमाज़';

  @override
  String get watchAllPrayers => 'सभी नमाज़ें';

  @override
  String get watchComplication => 'कॉम्प्लिकेशन';

  @override
  String get nextPrayer => 'अगली नमाज़';

  @override
  String get allPrayers => 'सभी नमाज़ें';

  @override
  String get today => 'आज';

  @override
  String get tomorrow => 'कल';

  @override
  String get thisWeek => 'इस सप्ताह';

  @override
  String get thisMonth => 'इस महीने';

  @override
  String get loginCreateAccount => 'खाता बनाएँ';

  @override
  String get loginSignIn => 'साइन इन';

  @override
  String get loginWelcomeBack => 'वापसी पर स्वागत';

  @override
  String get loginJoinPrayCalc => 'PrayCalc से जुड़ें';

  @override
  String get loginSyncSubtitle =>
      'अपने नमाज़ डेटा को सभी डिवाइसों पर सिंक करें';

  @override
  String get loginContinueGoogle => 'Google के साथ जारी रखें';

  @override
  String get loginOr => 'या';

  @override
  String get loginSigningIn => 'साइन इन हो रहा है…';

  @override
  String get loginNameLabel => 'प्रदर्शन नाम (वैकल्पिक)';

  @override
  String get loginEmailLabel => 'ईमेल';

  @override
  String get loginPasswordLabel => 'पासवर्ड';

  @override
  String get loginEmailRequired => 'ईमेल आवश्यक है';

  @override
  String get loginEmailInvalid => 'एक मान्य ईमेल पता दर्ज करें';

  @override
  String get loginPasswordRequired => 'पासवर्ड आवश्यक है';

  @override
  String get loginPasswordMinLength =>
      'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए';

  @override
  String get loginForgotPassword => 'पासवर्ड भूल गए?';

  @override
  String get loginEnterEmailFirst => 'पहले अपना ईमेल पता दर्ज करें';

  @override
  String get loginResetSent => 'पासवर्ड रीसेट ईमेल भेजा गया';

  @override
  String get loginResetFailed => 'रीसेट ईमेल नहीं भेजा जा सका';

  @override
  String get loginNewToPrayCalc => 'PrayCalc में नए हैं?';

  @override
  String get loginAlreadyHaveAccount => 'पहले से खाता है?';

  @override
  String get accountTitle => 'खाता';

  @override
  String get accountNotSignedIn => 'साइन इन नहीं है';

  @override
  String get accountSyncSection => 'सिंक';

  @override
  String get accountSyncStatus => 'सिंक स्थिति';

  @override
  String get accountSyncNow => 'अभी सिंक करें';

  @override
  String get accountSyncHistory => 'सिंक इतिहास';

  @override
  String get accountNoConflicts => 'कोई विरोध नहीं';

  @override
  String accountConflictsResolved(int count) {
    return '$count हल हुए';
  }

  @override
  String accountSyncedAgo(String time) {
    return '$time सिंक हुआ';
  }

  @override
  String get accountOfflineStatus =>
      'ऑफ़लाइन। परिवर्तन स्थानीय रूप से सहेजे गए।';

  @override
  String get accountSyncErrorStatus => 'सिंक त्रुटि। पुनः प्रयास होगा।';

  @override
  String get accountDataSection => 'डेटा';

  @override
  String get accountExportData => 'डेटा निर्यात करें';

  @override
  String get accountExportSubtitle => 'अपनी सेटिंग्स और नमाज़ लॉग डाउनलोड करें';

  @override
  String get accountExportFailed => 'डेटा निर्यात नहीं हो सका';

  @override
  String get accountSignOutTitle => 'साइन आउट';

  @override
  String get accountSignOutBody =>
      'आपका स्थानीय डेटा रखा जाएगा। सिंक फिर से शुरू करने के लिए साइन इन करें।';

  @override
  String get accountDeleteAccount => 'खाता हटाएँ';

  @override
  String get accountDeleteSubtitle => 'अपना खाता और डेटा स्थायी रूप से हटाएँ';

  @override
  String get accountDeleteBody =>
      'इससे आपका खाता और सभी सिंक किया गया डेटा स्थायी रूप से हट जाएगा। इस डिवाइस का स्थानीय डेटा नहीं हटाया जाएगा।\n\nयह क्रिया पूर्ववत नहीं की जा सकती।';

  @override
  String get accountDeleted => 'खाता हटा दिया गया';

  @override
  String get accountDeleteFailed => 'खाता नहीं हटाया जा सका';

  @override
  String get accountTimeJustNow => 'अभी';

  @override
  String accountTimeMinAgo(int min) {
    return '$min मिनट पहले';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour घंटे पहले';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day दिन पहले';
  }

  @override
  String get statsTitle => 'नमाज़ आँकड़े';

  @override
  String get statsShareTooltip => 'आँकड़े शेयर करें';

  @override
  String get statsTodayPrayers => 'आज की नमाज़ें';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'श्रृंखला';

  @override
  String get statsDays => 'दिन';

  @override
  String get statsThisWeek => 'इस सप्ताह';

  @override
  String get statsCompletion => 'पूर्णता';

  @override
  String get statsThisMonth => 'इस महीने';

  @override
  String get statsMostMissed => 'सबसे ज़्यादा छूटी';

  @override
  String get statsThisWeekLabel => 'इस सप्ताह';

  @override
  String get statsWeeklyChart => 'नमाज़ अनुसार साप्ताहिक पूर्णता';

  @override
  String get statsMonthlyChart => 'नमाज़ अनुसार मासिक पूर्णता';

  @override
  String statsTotalLogged(int count) {
    return 'कुल $count नमाज़ें लॉग हुईं';
  }

  @override
  String get statsKeepItUp => 'जारी रखें!';

  @override
  String get statsShareTitle => 'PrayCalc नमाज़ आँकड़े';

  @override
  String statsShareStreak(int days) {
    return 'श्रृंखला: $days दिन';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'साप्ताहिक: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'मासिक: $pct%';
  }

  @override
  String get statsShareBreakdown => 'साप्ताहिक विवरण:';

  @override
  String get aboutTitle => 'PrayCalc के बारे में';

  @override
  String get aboutWebsite => 'वेबसाइट';

  @override
  String get aboutContact => 'संपर्क';

  @override
  String get aboutLicenses => 'ओपन सोर्स लाइसेंस';

  @override
  String get aboutCouldNotOpen => 'लिंक नहीं खोला जा सका।';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev। सर्वाधिकार सुरक्षित।\n\nनमाज़ का समय pray_calc_dart इंजन से गणना किया जाता है। सटीकता आपके GPS स्थान और चुनी गई गणना विधि पर निर्भर करती है।';
  }

  @override
  String get commonCancel => 'रद्द करें';

  @override
  String get commonSave => 'सहेजें';

  @override
  String get commonDelete => 'हटाएँ';

  @override
  String get commonEdit => 'संपादित करें';

  @override
  String get commonRetry => 'पुनः प्रयास';

  @override
  String get commonClose => 'बंद करें';

  @override
  String get commonDone => 'हो गया';

  @override
  String get commonBack => 'वापस';

  @override
  String get commonNext => 'अगला';

  @override
  String get commonSkip => 'छोड़ें';

  @override
  String get commonContinue => 'जारी रखें';

  @override
  String get commonOk => 'ठीक है';

  @override
  String get commonYes => 'हाँ';

  @override
  String get commonNo => 'नहीं';

  @override
  String get commonShare => 'शेयर करें';

  @override
  String get commonCopy => 'कॉपी करें';

  @override
  String get commonCopied => 'क्लिपबोर्ड पर कॉपी हो गया';

  @override
  String get commonLoading => 'लोड हो रहा है...';

  @override
  String get commonError => 'कुछ गलत हो गया';

  @override
  String get commonErrorRetry => 'कुछ गलत हो गया। पुनः प्रयास के लिए टैप करें।';

  @override
  String get commonNoInternet => 'इंटरनेट कनेक्शन नहीं है';

  @override
  String get commonOfflineMode => 'ऑफ़लाइन मोड';

  @override
  String get commonSignIn => 'साइन इन';

  @override
  String get commonSignOut => 'साइन आउट';

  @override
  String get commonSignUp => 'साइन अप';

  @override
  String get commonProfile => 'प्रोफ़ाइल';

  @override
  String get commonAccount => 'खाता';

  @override
  String get commonAbout => 'बारे में';

  @override
  String commonVersion(String version) {
    return 'संस्करण $version';
  }

  @override
  String get commonPrivacyPolicy => 'गोपनीयता नीति';

  @override
  String get commonTermsOfService => 'सेवा की शर्तें';

  @override
  String get commonRateApp => 'ऐप रेट करें';

  @override
  String get commonFeedback => 'प्रतिक्रिया भेजें';

  @override
  String get commonHelp => 'सहायता';

  @override
  String get commonLanguage => 'भाषा';

  @override
  String get commonOpenSettings => 'सेटिंग्स खोलें';

  @override
  String get travelNotificationTitle => 'आप अभी यात्रा पर हैं';

  @override
  String get travelNotificationBody =>
      'नमाज़ के समय कम किए जा सकते हैं। यात्रा नियम जानने के लिए टैप करें।';

  @override
  String get travelRulingsTitle => 'यात्रा और नमाज़';

  @override
  String get travelRulingsIntro =>
      'यात्रा के दौरान नमाज़ के इस्लामी नियम, क़ुरान और सहीह हदीस से विद्वानों के संदर्भ सहित।';

  @override
  String get travelWhenTitle => 'यात्रा कब लागू होती है?';

  @override
  String get travelQasrTitle => 'नमाज़ छोटी करना (क़स्र)';

  @override
  String get travelJamTitle => 'नमाज़ मिलाना (जमा)';

  @override
  String get travelDurationTitle => 'यात्रा की अवधि';

  @override
  String get travelReferencesTitle => 'विद्वानों के संदर्भ';

  @override
  String get travelLearnMore => 'और जानें';

  @override
  String get travelHanafiDefaultTitle =>
      'PrayCalc हनफ़ी डिफ़ॉल्ट क्यों उपयोग करता है';

  @override
  String get travelDeeperScholarly => 'गहन विद्वान चर्चा';

  @override
  String get onboardingTitle1 => 'आप जहाँ भी हों, नमाज़ का समय';

  @override
  String get onboardingBody1 =>
      'पृथ्वी के हर शहर के लिए GPS-सटीक नमाज़ का समय। फज्र से इशा, सूर्योदय से क़ियाम तक। हमारे अपने गणना इंजन से, सटीकता के लिए बनाया गया।';

  @override
  String get onboardingTitle2 => 'आपका स्थान, आपका समय';

  @override
  String get onboardingBody2 =>
      'कोई भी शहर खोजें या GPS को अपना स्थान पता लगाने दें। PrayCalc दुनिया भर के 50 लाख शहरों का समय खोजता है।';

  @override
  String get onboardingTitle3 => 'कोई नमाज़ न छूटे';

  @override
  String get onboardingBody3 =>
      'नमाज़ के समय अज़ान, पहले रिमाइंडर। सहरी, कक्षाओं और अधिक के लिए कस्टम एजेंडा।';

  @override
  String get onboardingTitle4 => 'आपको जो कुछ चाहिए';

  @override
  String get onboardingBody4 =>
      'क़िबला कम्पास, नमाज़ कैलेंडर, हिजरी चंद्र चरण, तस्बीह काउंटर। सब एक जगह।';

  @override
  String get onboardingSkip => 'छोड़ें';

  @override
  String get onboardingGetStarted => 'शुरू करें';

  @override
  String get onboardingSignInTitle => 'PrayCalc में साइन इन करें';

  @override
  String get onboardingSignInSubtitle =>
      'अपना नमाज़ इतिहास सहेजें और\nसभी डिवाइसों पर सिंक करें।';

  @override
  String get onboardingContinueGoogle => 'Google के साथ जारी रखें';

  @override
  String get onboardingContinueWithoutAccount => 'बिना खाते के जारी रखें';

  @override
  String get onboardingSigningIn => 'साइन इन हो रहा है…';

  @override
  String get onboardingSelectLanguage => 'भाषा चुनें';

  @override
  String get duaDhikrTitle => 'दुआ और ज़िक्र';

  @override
  String get duaDhikrTabDua => 'दुआ';

  @override
  String get duaDhikrTabDhikr => 'ज़िक्र';

  @override
  String get duaDhikrTabTasbeeh => 'तस्बीह';

  @override
  String get duaDhikrTabMorning => 'सुबह';

  @override
  String get duaDhikrTabEvening => 'शाम';

  @override
  String get duaDhikrMorningAdhkar => 'सुबह के अज़कार';

  @override
  String get duaDhikrEveningAdhkar => 'शाम के अज़कार';

  @override
  String get calGregToggle => 'ग्रेग';

  @override
  String get calHijriToggle => 'हिजरी';

  @override
  String get calYearlyTooltip => 'वार्षिक कैलेंडर';

  @override
  String get calExportIcsTooltip => '.ics निर्यात';

  @override
  String get calMagCol => 'मग़';

  @override
  String get qiblaShowOnMap => 'मानचित्र पर दिखाएँ';

  @override
  String get qiblaWaitingCompass => 'कम्पास की प्रतीक्षा...';

  @override
  String get qiblaNoCompassSensor =>
      'कम्पास सेंसर नहीं है। क़िबला दिशा स्थिर रूप से दिखाई जा रही है।';

  @override
  String get qiblaAccuracyExcellent => 'उत्कृष्ट सटीकता';

  @override
  String get qiblaAccuracyGood => 'अच्छी सटीकता';

  @override
  String get qiblaAccuracyFair =>
      'ठीक सटीकता। 8 के आकार में फ़ोन घुमाकर कैलिब्रेट करें।';

  @override
  String get qiblaAccuracyLow =>
      'कम सटीकता। 8 के आकार में फ़ोन घुमाकर कैलिब्रेट करें।';

  @override
  String get qiblaToTheKaaba => 'काबा की ओर';

  @override
  String get qiblaYourLocation => 'आपका स्थान';

  @override
  String get qiblaGpsAccurate => 'GPS-सटीक';

  @override
  String get qiblaCityCenter => 'शहर का केंद्र';

  @override
  String get moonIlluminatedLabel => 'प्रकाशित';

  @override
  String get moonAgeLabel => 'आयु';

  @override
  String get moonFirstQtr => 'पहली तिमाही';

  @override
  String get moonLastQtr => 'अंतिम तिमाही';

  @override
  String get moonTonight => 'आज रात';

  @override
  String get moonTomorrow => 'कल';

  @override
  String moonDaysAway(int days) {
    return '$daysदि';
  }

  @override
  String get moonBeta => 'बीटा';

  @override
  String get setHomeTitle => 'घर का स्थान सेट करें';

  @override
  String get setHomeSearchHint => 'शहर, कस्बा या पिन कोड खोजें…';

  @override
  String get setHomeClear => 'साफ़ करें';

  @override
  String get setHomeUseCurrentLocation => 'वर्तमान स्थान उपयोग करें';

  @override
  String get setHomeDetectAndSet =>
      'अपना स्थान पता लगाएँ और घर के रूप में सेट करें';

  @override
  String get setHomeAlreadySet => 'घर पहले से सेट है';

  @override
  String setHomeSetAs(String city) {
    return '$city घर के रूप में सेट किया गया';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'वर्तमान स्थान घर के रूप में सेट किया गया';

  @override
  String get setHomePermissionDenied =>
      'स्थान अनुमति अस्वीकृत। नीचे शहर खोजें।';

  @override
  String get setHomeGpsUnavailable => 'GPS उपलब्ध नहीं। मैन्युअल खोजें।';

  @override
  String get setHomeNoCitiesFound => 'कोई शहर नहीं मिला।';

  @override
  String get setHomeSearchPrompt => 'अपने घर का शहर खोजें';

  @override
  String get setHomeSearchBody =>
      'ऊपर टाइप करके खोजें, या अपना वर्तमान स्थान उपयोग करें। यात्रा मोड पता लगाएगा कि आप घर से कब दूर हैं।';

  @override
  String get subscriptionYouHavePlus => 'आपके पास Ummat+ है';

  @override
  String get subscriptionUpgradeTo => 'Ummat+ में अपग्रेड करें';

  @override
  String get subscriptionThankYou => 'PrayCalc का समर्थन करने के लिए धन्यवाद।';

  @override
  String get subscriptionUnlockPremium =>
      'अपने सभी डिवाइसों पर प्रीमियम सुविधाएँ अनलॉक करें।';

  @override
  String get subscriptionManageSub => 'सदस्यता प्रबंधित करें';

  @override
  String get subscriptionWelcome => 'Ummat+ में आपका स्वागत है!';

  @override
  String get subscriptionSubscribe => 'सदस्यता लें';

  @override
  String get subscriptionFreeFeatures => 'मुफ़्त सुविधाएँ';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ सुविधाएँ';

  @override
  String get subscriptionFeaturePrayerTimes => 'नमाज़ का समय';

  @override
  String get subscriptionFeatureQibla => 'क़िबला कम्पास';

  @override
  String get subscriptionFeatureCalendar => 'मासिक कैलेंडर';

  @override
  String get subscriptionFeatureTasbeeh => 'तस्बीह काउंटर';

  @override
  String get subscriptionFeatureMoon => 'चाँद और हिजरी';

  @override
  String get smartHomeAlertType => 'अलर्ट प्रकार';

  @override
  String get smartHomeAlertModal => 'फुल-स्क्रीन मोडल';

  @override
  String get smartHomeAlertCorner => 'कोने की सूचना';

  @override
  String get smartHomeAlertNone => 'कोई नहीं (मूक)';

  @override
  String get smartHomePauseMedia => 'अज़ान के दौरान मीडिया रोकें';

  @override
  String get smartHomeQuietHours => 'शांत घंटे';

  @override
  String get smartHomeQuietFrom => 'से';

  @override
  String get smartHomeQuietTo => 'तक';

  @override
  String get smartHomePrayerAudio => 'प्रत्येक नमाज़ का ऑडियो';

  @override
  String get smartHomeAudioAdhan => 'अज़ान';

  @override
  String get smartHomeAudioBeep => 'बीप';

  @override
  String get smartHomeAudioSilent => 'मूक';

  @override
  String get aboutPrivacy => 'गोपनीयता नीति';

  @override
  String aboutVersion(String version) {
    return 'संस्करण $version';
  }

  @override
  String get notifDefaultAdhan => 'डिफ़ॉल्ट अज़ान';

  @override
  String get notifFajrAdhan => 'फज्र अज़ान';

  @override
  String get notifFajrAdhanSubtitle => 'फज्र नमाज़ के समय बजती है';

  @override
  String get notifRegularAdhan => 'सामान्य अज़ान';

  @override
  String get notifRegularAdhanSubtitle =>
      'ज़ुहर, अस्र, मग़रिब, इशा में बजती है';

  @override
  String get notifPerPrayerSettings => 'प्रत्येक नमाज़ की सेटिंग्स';

  @override
  String get notifPreview => 'पूर्वश्रवण';

  @override
  String get tvSettingsTitle => 'टीवी सेटिंग्स';

  @override
  String get tvDisplayMode => 'डिस्प्ले मोड';

  @override
  String get tvMasjidMode => 'मस्जिद मोड';

  @override
  String get tvMasjidModeSubtitle => 'इक़ामत समय के साथ बड़ा साइनेज डिस्प्ले';

  @override
  String get tvMasjidName => 'मस्जिद का नाम';

  @override
  String get tvMasjidNameTapToSet => 'सेट करने के लिए टैप करें';

  @override
  String get tvClock => 'घड़ी';

  @override
  String get tv24hFormat => '24 घंटे का फ़ॉर्मैट';

  @override
  String get tvIqamahOffsets => 'इक़ामत ऑफसेट (अज़ान के बाद मिनट)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'अज़ान के बाद $offset मिनट';
  }

  @override
  String get tvQrCode => 'QR कोड';

  @override
  String get tvShowQrCode => 'QR कोड दिखाएँ';

  @override
  String get tvShowQrCodeSubtitle => 'मस्जिद स्क्रीन पर QR कोड दिखाएँ';

  @override
  String get tvQrCodeUrl => 'QR कोड URL';

  @override
  String get tvAmbientModeSection => 'एम्बियंट मोड';

  @override
  String get tvIdleTimeout => 'निष्क्रिय समयसीमा';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'एम्बियंट सक्रिय होने से $minutes मिनट पहले';
  }

  @override
  String get tvPhotoInterval => 'फोटो अंतराल';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'फोटो के बीच $seconds सेकंड';
  }

  @override
  String get tvBackground => 'पृष्ठभूमि';

  @override
  String get tvPhotoCategory => 'फोटो श्रेणी';

  @override
  String get tvLocation => 'स्थान';

  @override
  String get tvChangeCity => 'शहर बदलें';

  @override
  String get tvChangeCitySubtitle => 'कोई अलग शहर खोजें';

  @override
  String get tvScreensaverBg => 'स्क्रीनसेवर पृष्ठभूमि';

  @override
  String get tvScreensaverPhotos => 'फोटो';

  @override
  String get tvScreensaverPattern => 'ज्यामितीय पैटर्न';

  @override
  String get tvScreensaverBoth => 'फोटो + पैटर्न';

  @override
  String get tvCategoryAll => 'सभी श्रेणियाँ';

  @override
  String get tvCategoryMasjids => 'मस्जिदें';

  @override
  String get tvCategoryInteriors => 'आंतरिक';

  @override
  String get tvCategoryGeometric => 'ज्यामितीय';

  @override
  String get tvCategoryCalligraphy => 'सुलेख';

  @override
  String get tvCategoryLandscapes => 'प्रकृति दृश्य';

  @override
  String get tvCategoryRamadan => 'रमज़ान';

  @override
  String get tvPhotoCategoryTitle => 'फोटो श्रेणी';

  @override
  String tvEnterHint(String title) {
    return '$title दर्ज करें';
  }

  @override
  String get tvSystemDefault => 'सिस्टम डिफ़ॉल्ट';

  @override
  String get smartHomeIntegrations => 'इंटीग्रेशन';

  @override
  String get smartHomeLinkedSpeakers => 'लिंक किए गए स्पीकर और डिस्प्ले';

  @override
  String get smartHomeAlertDisplay => 'अलर्ट डिस्प्ले';

  @override
  String get smartHomeAtAdhanShow => 'अज़ान के समय दिखाएँ';

  @override
  String get smartHomePauseMediaTitle => 'अज़ान पर मीडिया रोकें';

  @override
  String get smartHomePauseMediaSubtitle =>
      'अज़ान समाप्त होने पर फिर से चालू होता है';

  @override
  String get smartHomePrayerAudioSection => 'नमाज़ ऑडियो';

  @override
  String get smartHomeQuietHoursSection => 'शांत घंटे';

  @override
  String get smartHomeEnableQuietHours => 'शांत घंटे सक्रिय करें';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'सभी स्मार्ट होम अलर्ट मूक रहते हैं';

  @override
  String get smartHomeNoDevices => 'अभी कोई डिवाइस लिंक नहीं';

  @override
  String get smartHomeNoDevicesDesc =>
      'ऊपर Google Home या Alexa लिंक करें, फिर आपके स्पीकर और डिस्प्ले यहाँ दिखाई देंगे।';

  @override
  String get smartHomeRequiresPlus => 'स्मार्ट होम के लिए Ummat+ चाहिए';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Google Home, Alexa, Siri, और Home Assistant पर नमाज़ की घोषणाएँ नियंत्रित करें। कौन से डिवाइस अज़ान बजाएँ, कब मीडिया रोकें, और शांत घंटे सेट करें।';

  @override
  String get smartHomeBroadcastGoogle =>
      'Nest स्पीकर और डिस्प्ले पर अज़ान प्रसारित करें।';

  @override
  String get smartHomeEnableAlexa => 'Alexa पर PrayCalc स्किल सक्रिय करें।';

  @override
  String get smartHomeSiriAsk =>
      'Siri से नमाज़ के समय पूछें या ऑटोमेशन सेट करें।';

  @override
  String get smartHomeHassAdd => 'पूर्ण ऑटोमेशन सपोर्ट के लिए HACS से जोड़ें।';

  @override
  String get smartHomeSetupGuide => 'सेटअप गाइड';

  @override
  String get smartHomeSiriSetupTitle => 'Siri Shortcuts सेटअप';

  @override
  String get smartHomeSiriStep1 => 'अपने iPhone या iPad पर Shortcuts ऐप खोलें।';

  @override
  String get smartHomeSiriStep2 => 'नया शॉर्टकट बनाने के लिए \"+\" टैप करें।';

  @override
  String get smartHomeSiriStep3 => 'एक्शन सूची में \"PrayCalc\" खोजें।';

  @override
  String get smartHomeSiriStep4 =>
      '\"Next Prayer Time\" या \"Prayer Times Today\" जोड़ें।';

  @override
  String get smartHomeSiriStep5 =>
      'वैकल्पिक: इसे ऑटोमेशन में जोड़ें (जैसे: रोज़ फज्र पर)।';

  @override
  String get smartHomeSiriStep6 =>
      'टेस्ट करने के लिए कहें \"Hey Siri, next prayer time\"।';

  @override
  String get smartHomeSiriFootnote => 'iOS 16 या उससे ऊपर आवश्यक।';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant सेटअप';

  @override
  String get smartHomeHassStep1 =>
      'HACS (Home Assistant Community Store) इंस्टॉल करें।';

  @override
  String get smartHomeHassStep2 =>
      'HACS में \"PrayCalc\" खोजें और इंस्टॉल करें।';

  @override
  String get smartHomeHassStep3 =>
      'Settings > Devices & Services > Add Integration पर जाएँ।';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" खोजें और चुनें।';

  @override
  String get smartHomeHassStep5 =>
      'अपनी PrayCalc API कुंजी दर्ज करें (अपने खाते में बनाई गई)।';

  @override
  String get smartHomeHassStep6 => 'अपना स्थान और गणना विधि कॉन्फ़िगर करें।';

  @override
  String get smartHomeHassFootnote =>
      'HACS सहित Home Assistant 2024.1+ आवश्यक।';

  @override
  String get smartHomeApiKey => 'API कुंजी';

  @override
  String get smartHomeGenerateApiKey => 'API कुंजी बनाएँ';

  @override
  String get smartHomeApiKeyNotReady =>
      'PrayCalc स्मार्ट सेवा तैनात होने पर API कुंजी बनाने की सुविधा उपलब्ध होगी।';

  @override
  String get smartHomeApiKeyDesc =>
      'Home Assistant को अपने PrayCalc खाते से जोड़ने के लिए API कुंजी चाहिए होगी।';

  @override
  String get smartHomeLinkedStatus => 'लिंक किया गया';

  @override
  String get smartHomeNotLinkedStatus => 'लिंक नहीं किया गया';

  @override
  String get smartHomeCouldNotOpen => 'लिंक नहीं खोला जा सका।';

  @override
  String get smartHomeDevices => 'डिवाइस';

  @override
  String get smartHomeAddDevice => 'डिवाइस जोड़ें';

  @override
  String get smartHomeDeleteDevice => 'हटाएं';

  @override
  String get smartHomeDeleteDeviceConfirm => 'इस डिवाइस को हटाएं?';

  @override
  String get smartHomeDeviceOnline => 'ऑनलाइन';

  @override
  String get smartHomeDeviceOffline => 'ऑफलाइन';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'अंतिम बार देखा: $time';
  }

  @override
  String get smartHomeDeviceName => 'डिवाइस का नाम';

  @override
  String get smartHomeDeviceType => 'डिवाइस का प्रकार';

  @override
  String get smartHomeDeviceTypeTv => 'टीवी';

  @override
  String get smartHomeDeviceTypeSpeaker => 'स्पीकर';

  @override
  String get smartHomeDeviceTypeWatch => 'घड़ी';

  @override
  String get smartHomeDeviceTypeDesktop => 'डेस्कटॉप';

  @override
  String get smartHomeDeviceTypeOther => 'अन्य';

  @override
  String get smartHomeDeviceAdhan => 'अज़ान सूचनाएं';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'इस डिवाइस पर अज़ान अलर्ट प्राप्त करें';

  @override
  String get smartHomeDeviceVolume => 'वॉल्यूम';

  @override
  String get smartHomeDeviceAudioType => 'ऑडियो प्रकार';

  @override
  String get smartHomeDeviceEnabledPrayers => 'सक्रिय नमाज़ें';

  @override
  String get smartHomeDeviceSettings => 'डिवाइस सेटिंग्स';

  @override
  String get smartHomeTesting => 'परीक्षण हो रहा है...';

  @override
  String get smartHomeTestSuccess => 'कनेक्शन सत्यापित';

  @override
  String get smartHomeTestFailed => 'कनेक्शन परीक्षण विफल';

  @override
  String get smartHomePairTv => 'टीवी जोड़ें';

  @override
  String get smartHomePairingTv => 'टीवी पंजीकृत हो रहा है...';

  @override
  String get smartHomePairTvSuccess => 'टीवी सफलतापूर्वक जोड़ा गया';

  @override
  String get smartHomePairTvFailed => 'टीवी जोड़ना विफल';

  @override
  String get smartHomeLoadingDevices => 'डिवाइस लोड हो रहे हैं...';

  @override
  String get smartHomeLoadingIntegrations => 'इंटीग्रेशन लोड हो रहे हैं...';

  @override
  String get smartHomeServiceUnavailable =>
      'स्मार्ट होम सेवा वर्तमान में उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total पूर्ण';
  }

  @override
  String get adhkarReset => 'रीसेट';

  @override
  String get syncHistoryTitle => 'सिंक इतिहास';

  @override
  String get syncClearHistory => 'इतिहास साफ़ करें';

  @override
  String get syncNoConflicts => 'कोई सिंक विरोध नहीं। सभी डिवाइस सिंक हैं।';

  @override
  String get syncDomainSettings => 'सेटिंग्स';

  @override
  String get syncDomainCities => 'सहेजे गए शहर';

  @override
  String get syncDomainPrayerLogs => 'नमाज़ लॉग';

  @override
  String get syncTimeJustNow => 'अभी';

  @override
  String syncTimeMinAgo(int min) {
    return '$min मिनट पहले';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour घंटे पहले';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day दिन पहले';
  }

  @override
  String get pinCity => 'पिन';

  @override
  String get pinMaxReached =>
      'अधिकतम 5 पिन किए शहर। अधिक के लिए Ummat+ में अपग्रेड करें।';

  @override
  String pinCityUnpinned(String city) {
    return '$city अनपिन किया गया';
  }

  @override
  String get pinUndo => 'पूर्ववत करें';

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
