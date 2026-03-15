// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Bengali Bangla (`bn`).
class AppLocalizationsBn extends AppLocalizations {
  AppLocalizationsBn([String locale = 'bn']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'ফজর';

  @override
  String get prayerSunrise => 'সূর্যোদয়';

  @override
  String get prayerDhuhr => 'যোহর';

  @override
  String get prayerAsr => 'আসর';

  @override
  String get prayerMaghrib => 'মাগরিব';

  @override
  String get prayerIsha => 'ইশা';

  @override
  String get prayerQiyam => 'কিয়ামুল লাইল';

  @override
  String get prayerSuhoor => 'সেহরি';

  @override
  String get prayerIftar => 'ইফতার';

  @override
  String get hijriMuharram => 'মুহাররম';

  @override
  String get hijriSafar => 'সফর';

  @override
  String get hijriRabiAlAwwal => 'রবিউল আউয়াল';

  @override
  String get hijriRabiAlThani => 'রবিউস সানি';

  @override
  String get hijriJumadaAlAwwal => 'জুমাদাল উলা';

  @override
  String get hijriJumadaAlThani => 'জুমাদাস সানি';

  @override
  String get hijriRajab => 'রজব';

  @override
  String get hijriShaban => 'শাবান';

  @override
  String get hijriRamadan => 'রমজান';

  @override
  String get hijriShawwal => 'শাওয়াল';

  @override
  String get hijriDhulQidah => 'জিলকদ';

  @override
  String get hijriDhulHijjah => 'জিলহজ';

  @override
  String get monthJan => 'জানু';

  @override
  String get monthFeb => 'ফেব';

  @override
  String get monthMar => 'মার্চ';

  @override
  String get monthApr => 'এপ্রি';

  @override
  String get monthMay => 'মে';

  @override
  String get monthJun => 'জুন';

  @override
  String get monthJul => 'জুলা';

  @override
  String get monthAug => 'আগ';

  @override
  String get monthSep => 'সেপ';

  @override
  String get monthOct => 'অক্টো';

  @override
  String get monthNov => 'নভে';

  @override
  String get monthDec => 'ডিসে';

  @override
  String get monthJanuary => 'জানুয়ারি';

  @override
  String get monthFebruary => 'ফেব্রুয়ারি';

  @override
  String get monthMarch => 'মার্চ';

  @override
  String get monthApril => 'এপ্রিল';

  @override
  String get monthMayFull => 'মে';

  @override
  String get monthJune => 'জুন';

  @override
  String get monthJuly => 'জুলাই';

  @override
  String get monthAugust => 'আগস্ট';

  @override
  String get monthSeptember => 'সেপ্টেম্বর';

  @override
  String get monthOctober => 'অক্টোবর';

  @override
  String get monthNovember => 'নভেম্বর';

  @override
  String get monthDecember => 'ডিসেম্বর';

  @override
  String get dayMonShort => 'সোম';

  @override
  String get dayTueShort => 'মঙ্গল';

  @override
  String get dayWedShort => 'বুধ';

  @override
  String get dayThuShort => 'বৃহ';

  @override
  String get dayFriShort => 'শুক্র';

  @override
  String get daySatShort => 'শনি';

  @override
  String get daySunShort => 'রবি';

  @override
  String get dayMonday => 'সোমবার';

  @override
  String get dayTuesday => 'মঙ্গলবার';

  @override
  String get dayWednesday => 'বুধবার';

  @override
  String get dayThursday => 'বৃহস্পতিবার';

  @override
  String get dayFriday => 'শুক্রবার';

  @override
  String get daySaturday => 'শনিবার';

  @override
  String get daySunday => 'রবিবার';

  @override
  String get daySuChart => 'রবি';

  @override
  String get dayMoChart => 'সোম';

  @override
  String get dayTuChart => 'মঙ্গ';

  @override
  String get dayWeChart => 'বুধ';

  @override
  String get dayThChart => 'বৃহ';

  @override
  String get dayFrChart => 'শুক্র';

  @override
  String get daySaChart => 'শনি';

  @override
  String get chooseCityLabel => 'একটি শহর বেছে নিন';

  @override
  String get setCityFab => 'শহর সেট করুন';

  @override
  String prayerTimesError(Object error) {
    return 'নামাজের সময় গণনা করা যায়নি।\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer বাকি';
  }

  @override
  String get ramadanMubarak => 'রমজান মোবারক';

  @override
  String ramadanDayProgress(int day) {
    return 'দিন $day / ৩০';
  }

  @override
  String get lastTenNights => 'শেষ ১০ রাত';

  @override
  String get laylatulQadr => 'লাইলাতুল কদর';

  @override
  String get homeSuffixAH => 'হিজরি';

  @override
  String get homeSuffixCE => 'খ্রি.';

  @override
  String get homeNoCitySelected => 'কোনো শহর নির্বাচন করা হয়নি';

  @override
  String get homeNoCityHint =>
      'আপনার শহর খুঁজতে বা GPS চালু করতে উপরে ট্যাপ করুন।';

  @override
  String get homeCouldNotCalc => 'নামাজের সময় গণনা করা যায়নি।';

  @override
  String get homeQasr => 'কসর';

  @override
  String get homeActionMonthlyTimes => 'মাসিক\nসময়সূচি';

  @override
  String get homeActionDuaDhikr => 'দোয়া ও\nযিকর';

  @override
  String get homeActionPrayerStats => 'নামাজের\nপরিসংখ্যান';

  @override
  String homePolarBanner(int count) {
    return 'এই সময়ে আপনার অবস্থানের জন্য $countটি নামাজের সময় গণনা করা যায় না (মধ্যরাতের সূর্য / মেরু রাত)। সেটিংসে নিকটতম অক্ষাংশ অনুমান চেষ্টা করুন।';
  }

  @override
  String get settingsTitle => 'সেটিংস';

  @override
  String get settingsSectionPrayerCalc => 'নামাজ গণনা';

  @override
  String get settingsCalcMethod => 'গণনা পদ্ধতি';

  @override
  String get settingsCalcMethodAuto => 'স্বয়ংক্রিয় (গতিশীল)';

  @override
  String get settingsHanafiAsr => 'হানাফি আসর';

  @override
  String get settingsHanafiAsrSubtitle => 'ছায়া গুণক ২x (দেরিতে আসরের সময়)';

  @override
  String get settingsSectionDisplay => 'প্রদর্শন';

  @override
  String get settings24hClock => '২৪ ঘণ্টার ঘড়ি';

  @override
  String get settingsFollowSystemTheme => 'সিস্টেম থিম অনুসরণ করুন';

  @override
  String get settingsDarkMode => 'ডার্ক মোড';

  @override
  String get settingsSectionNotifications => 'বিজ্ঞপ্তি';

  @override
  String get settingsPrayerNotifications => 'নামাজের বিজ্ঞপ্তি';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'আজান, রিমাইন্ডার, এবং প্রতিটি নামাজের সেটিংস';

  @override
  String get settingsPrayerAgendas => 'নামাজ এজেন্ডা';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'নামাজের সময় থেকে কাস্টম রিমাইন্ডার';

  @override
  String get settingsAccount => 'অ্যাকাউন্ট';

  @override
  String get settingsSignInToSync => 'সিঙ্ক করতে সাইন ইন করুন';

  @override
  String get settingsSignInToSyncSubtitle => 'আপনার ডেটা সব ডিভাইসে রাখুন';

  @override
  String get settingsHomeScreen => 'হোম স্ক্রিন';

  @override
  String get settingsSkyGradient => 'আকাশের গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড';

  @override
  String get settingsSkyGradientSubtitle =>
      'দিনের সময়ের সাথে মিলিয়ে অ্যানিমেটেড আকাশের রং';

  @override
  String get settingsWeatherGradient => 'আবহাওয়া-রঙিন গ্রেডিয়েন্ট';

  @override
  String get settingsWeatherGradientSubtitle =>
      'স্থানীয় আবহাওয়ার ভিত্তিতে আকাশের রং সমন্বয় করুন';

  @override
  String get settingsCountdownAnimation => 'কাউন্টডাউন অ্যানিমেশন';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'পরবর্তী নামাজের কাউন্টডাউনে শ্বাসের রিং';

  @override
  String get settingsPrayerTracking => 'নামাজ ট্র্যাকিং';

  @override
  String get settingsTrackMyPrayers => 'আমার নামাজ ট্র্যাক করুন';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'প্রতিদিন কোন নামাজ আদায় করেছেন তা লগ করুন';

  @override
  String get settingsPrayerStats => 'নামাজের পরিসংখ্যান';

  @override
  String get settingsPrayerStatsSubtitle => 'ধারা, সাপ্তাহিক এবং মাসিক চার্ট';

  @override
  String get settingsJumuahKahf => 'জুমুআ আল-কাহফ রিমাইন্ডার';

  @override
  String get settingsJumuahKahfSubtitle =>
      'শুক্রবারে সূরা আল-কাহফ পড়ার রিমাইন্ডার';

  @override
  String get settingsTravel => 'ভ্রমণ';

  @override
  String get settingsTravelMode => 'ভ্রমণ মোড';

  @override
  String get settingsTravelModeSubtitle =>
      'বাড়ি থেকে দূরে থাকলে স্বয়ংক্রিয়ভাবে শনাক্ত করুন এবং নামাজ সমন্বয় করুন';

  @override
  String get settingsHomeLocation => 'বাড়ির অবস্থান';

  @override
  String get settingsHomeLocationNotSet =>
      'সেট করা হয়নি — বর্তমান অবস্থান ব্যবহার করতে ট্যাপ করুন';

  @override
  String get settingsClearHomeLocation => 'বাড়ির অবস্থান মুছুন';

  @override
  String get settingsTravelRulings => 'ভ্রমণে নামাজের বিধান';

  @override
  String get settingsTravelRulingsSubtitle =>
      'কসর, একত্রিত করা, এবং মুসাফিরের নির্দেশিকা';

  @override
  String get settingsSmartHome => 'স্মার্ট হোম';

  @override
  String get settingsSmartHomeIntegrations => 'স্মার্ট হোম ইন্টিগ্রেশন';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'টিভি ডিসপ্লে';

  @override
  String get settingsTvHome => 'টিভি হোম ডিসপ্লে';

  @override
  String get settingsTvHomeSubtitle => 'টিভির জন্য ফুল-স্ক্রিন নামাজ ঘড়ি';

  @override
  String get settingsMasjidDisplay => 'মসজিদ ডিসপ্লে';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'মসজিদ স্ক্রিনের জন্য আজান/ইকামত টেবিল';

  @override
  String get settingsTvSettings => 'টিভি সেটিংস';

  @override
  String get settingsTvSettingsSubtitle =>
      'মসজিদ মোড, ইকামত অফসেট, অ্যাম্বিয়েন্ট';

  @override
  String get settingsAboutPrayCalc => 'PrayCalc সম্পর্কে';

  @override
  String get syncSynced => 'সিঙ্ক হয়েছে';

  @override
  String get syncSyncing => 'সিঙ্ক হচ্ছে...';

  @override
  String get syncOffline => 'অফলাইন';

  @override
  String get syncError => 'সিঙ্ক ত্রুটি';

  @override
  String get notifSettingsTitle => 'বিজ্ঞপ্তি ও আজান';

  @override
  String get notifAdhanLabel => 'আজান';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'রিমাইন্ডার: $minutes মিনিট আগে';
  }

  @override
  String notifVolumePct(int pct) {
    return 'ভলিউম: $pct%';
  }

  @override
  String get notifTestAdhan => 'আজান পরীক্ষা';

  @override
  String get notifModeOff => 'বন্ধ';

  @override
  String get notifModeReminderOnly => 'শুধু রিমাইন্ডার';

  @override
  String get notifModeArrival => 'নামাজের সময়ে';

  @override
  String get notifModeBoth => 'রিমাইন্ডার + নামাজের সময়';

  @override
  String get citySearchHint => 'শহর খুঁজুন…';

  @override
  String get citySearchDetectTooltip => 'আমার অবস্থান শনাক্ত করুন';

  @override
  String get citySearchNoCityGps => 'GPS থেকে শহর শনাক্ত করা যায়নি।';

  @override
  String get citySearchPermissionDenied =>
      'অবস্থানের অনুমতি প্রত্যাখ্যান করা হয়েছে। ম্যানুয়ালি খুঁজুন।';

  @override
  String get citySearchNoResults => 'কোনো শহর পাওয়া যায়নি।';

  @override
  String get citySearchStartTyping => 'খুঁজতে টাইপ শুরু করুন…';

  @override
  String get agendasTitle => 'নামাজ এজেন্ডা';

  @override
  String get agendasEmpty =>
      'এখনো কোনো এজেন্ডা নেই।\nআপনার নামাজের সাথে সংযুক্ত রিমাইন্ডার যোগ করতে + ট্যাপ করুন।';

  @override
  String get agendasUndo => 'পূর্বাবস্থা';

  @override
  String agendasRemoved(String label) {
    return '$label সরানো হয়েছে';
  }

  @override
  String get agendaNewTitle => 'নতুন এজেন্ডা';

  @override
  String get agendaEditTitle => 'এজেন্ডা সম্পাদনা';

  @override
  String get agendaSave => 'সংরক্ষণ';

  @override
  String get agendaLabelEmpty => 'লেবেল খালি হতে পারে না';

  @override
  String get agendaLabelField => 'লেবেল';

  @override
  String get agendaLabelHint => 'যেমন: ফজরের জন্য জাগুন';

  @override
  String get agendaPrayerSection => 'নামাজ';

  @override
  String get agendaTimeOffsetSection => 'সময়ের অফসেট';

  @override
  String get agendaOffsetAtPrayerTime => 'নামাজের সময়ে';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes মিনিট আগে';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes মিনিট পরে';
  }

  @override
  String get agendaRepeatSection => 'পুনরাবৃত্তি';

  @override
  String get agendaNotifTypeSection => 'বিজ্ঞপ্তির ধরন';

  @override
  String get agendaNotifSilent => 'নীরব';

  @override
  String get agendaNotifSound => 'শব্দ';

  @override
  String get agendaNotifVibrate => 'কম্পন';

  @override
  String get agendaDayM => 'সোম';

  @override
  String get agendaDayT => 'মঙ্গ';

  @override
  String get agendaDayW => 'বুধ';

  @override
  String get agendaDayF => 'শুক্র';

  @override
  String get agendaDayS => 'শনি';

  @override
  String get moonTitle => 'চাঁদ ও হিজরি ক্যালেন্ডার';

  @override
  String moonIlluminated(int pct) {
    return '$pct% আলোকিত';
  }

  @override
  String get moonFullTonight => 'আজ রাতে পূর্ণিমা!';

  @override
  String get moonNextTomorrow => 'পরবর্তী পূর্ণিমা আগামীকাল';

  @override
  String moonNextDays(int days) {
    return 'পরবর্তী পূর্ণিমা $days দিনে';
  }

  @override
  String moonAge(String age) {
    return 'চাঁদের বয়স: $age দিন';
  }

  @override
  String get moonPhaseNewMoon => 'অমাবস্যা';

  @override
  String get moonPhaseWaxingCrescent => 'শুক্লপক্ষ চন্দ্রকলা';

  @override
  String get moonPhaseFirstQuarter => 'প্রথম পাদ';

  @override
  String get moonPhaseWaxingGibbous => 'শুক্লপক্ষ গিবাস';

  @override
  String get moonPhaseFullMoon => 'পূর্ণিমা';

  @override
  String get moonPhaseWaningGibbous => 'কৃষ্ণপক্ষ গিবাস';

  @override
  String get moonPhaseLastQuarter => 'শেষ পাদ';

  @override
  String get moonPhaseWaningCrescent => 'কৃষ্ণপক্ষ চন্দ্রকলা';

  @override
  String get moonHilalVisibility => 'পরবর্তী হিলাল দৃশ্যমানতা';

  @override
  String get moonRegionMiddleEast => 'মধ্যপ্রাচ্য';

  @override
  String get moonRegionWestAfrica => 'পশ্চিম আফ্রিকা';

  @override
  String get moonRegionSouthAsia => 'দক্ষিণ এশিয়া';

  @override
  String get moonRegionEurope => 'ইউরোপ';

  @override
  String get moonRegionAmericas => 'আমেরিকা';

  @override
  String get moonVisible => 'দৃশ্যমান';

  @override
  String get moonNotVisible => 'দৃশ্যমান নয়';

  @override
  String get moonPossible => 'সম্ভব';

  @override
  String get moonUpcomingDates => 'আসন্ন ইসলামি তারিখ';

  @override
  String get hijriTodayLabel => 'আজ হিজরি ক্যালেন্ডারে';

  @override
  String ramadanBeginsLabel(int year) {
    return 'রমজান $year হিজরি শুরু';
  }

  @override
  String ramadanDaysAway(int days) {
    return '$days দিন বাকি';
  }

  @override
  String get moonLunarCycle => 'চান্দ্র চক্র';

  @override
  String moonDayOfCycle(int day) {
    return 'দিন $day / ~২৯.৫';
  }

  @override
  String get moonHilalSightingForecast => 'হিলাল দেখার পূর্বাভাস';

  @override
  String get moonHilalVisibilityMap => 'হিলাল দৃশ্যমানতার মানচিত্র';

  @override
  String moonDayN(int day) {
    return 'দিন $day';
  }

  @override
  String get moonGlobalSighting => 'বৈশ্বিক দর্শন';

  @override
  String get moonZoneNakedEye => 'খালি চোখে';

  @override
  String get moonZoneBinoculars => 'বাইনোকুলার';

  @override
  String get moonZoneVeryDifficult => 'অত্যন্ত কঠিন';

  @override
  String get moonZoneNotVisible => 'দৃশ্যমান নয়';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year হিজরি সম্ভবত ২৯ দিনের হবে। ইনশাআল্লাহ ২৯ তারিখে চাঁদ দেখা যাবে বলে আশা করা যায়।';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year হিজরি সম্ভবত ৩০ দিনের হবে। ২৯ তারিখে চাঁদ দেখা অসম্ভাব্য — মাস ৩০ দিনে পূর্ণ হবে।';
  }

  @override
  String get moonUmmAlQura => 'উম্মুল কুরা';

  @override
  String get moonSaudiArabia => 'সৌদি আরব';

  @override
  String get moonFCNACalc => 'FCNA / গণনা';

  @override
  String get moonNorthAmerica => 'উত্তর আমেরিকা';

  @override
  String moonNDays(int days) {
    return '$days দিন';
  }

  @override
  String moonStarts(String month) {
    return '$month শুরু:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'সূর্যাস্তে চাঁদের বয়স: $hours ঘণ্টা';
  }

  @override
  String get moon7DayLunarCalendar => '৭-দিনের চান্দ্র ক্যালেন্ডার';

  @override
  String get moonUpcomingIslamicEvents => 'আসন্ন ইসলামি ঘটনা';

  @override
  String get moonTodayLabel => 'আজ';

  @override
  String get moonTomorrowLabel => 'আগামীকাল';

  @override
  String get calDateCol => 'তারিখ';

  @override
  String get calHijriCol => 'হিজরি';

  @override
  String get calFajrCol => 'ফজর';

  @override
  String get calSunriseCol => 'সূর্যোদয়';

  @override
  String get calDhuhrCol => 'যোহর';

  @override
  String get calAsrCol => 'আসর';

  @override
  String get calMaghribCol => 'মাগরিব';

  @override
  String get calIshaCol => 'ইশা';

  @override
  String get calNoCityText =>
      'নামাজের ক্যালেন্ডার দেখতে\nপ্রথমে আপনার শহর সেট করুন।';

  @override
  String get calShareTooltip => 'ক্যালেন্ডার শেয়ার করুন';

  @override
  String get calPrevMonthTooltip => 'আগের মাস';

  @override
  String get calNextMonthTooltip => 'পরের মাস';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'নামাজের সময় — $month';
  }

  @override
  String get qiblaTitle => 'কিবলা';

  @override
  String get qiblaSwitchToCompass => 'কম্পাসে যান';

  @override
  String get qiblaSwitchToAR => 'AR ক্যামেরায় যান';

  @override
  String get qiblaNoCityText =>
      'কিবলার দিক নির্ণয়ের জন্য\nপ্রথমে আপনার শহর সেট করুন।';

  @override
  String get qiblaCompassUnavailable => 'এই ডিভাইসে কম্পাস সেন্সর নেই।';

  @override
  String get qiblaCalibrate => 'ক্যালিব্রেট: আপনার ফোন ৮ আকারে ঘোরান।';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return 'উত্তর থেকে $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return '$city থেকে';
  }

  @override
  String qiblaDistKm(int dist) {
    return 'কাবা থেকে $dist কিমি';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return 'কাবা থেকে $dist হাজার কিমি';
  }

  @override
  String get qiblaFacingQibla => 'কিবলামুখী ✓';

  @override
  String get tasbeehTitle => 'তাসবীহ';

  @override
  String get tasbeehResetTooltip => 'রিসেট';

  @override
  String get tasbeehTapToSwitch => 'পরিবর্তন করতে লেবেলে ট্যাপ করুন';

  @override
  String get tasbeehTapToCount => 'গণনা করতে যেকোনো জায়গায় ট্যাপ করুন';

  @override
  String get tasbeehResetDialogTitle => 'কাউন্টার রিসেট করবেন?';

  @override
  String get tasbeehResetDialogContent => 'এটি বর্তমান গণনা শূন্যে রিসেট করবে।';

  @override
  String get tasbeehCancel => 'বাতিল';

  @override
  String get tasbeehReset => 'রিসেট';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'আজ: $count যিকর';
  }

  @override
  String get tasbeehLast7Days => 'গত ৭ দিন';

  @override
  String get tasbeehNoHistory => 'এখনো কোনো ইতিহাস নেই — গণনা শুরু করুন!';

  @override
  String tasbeehComplete(int count) {
    return 'তাসবীহ সম্পূর্ণ! $count যিকর';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'স্মার্ট হোম';

  @override
  String get smartHomeSubtitle =>
      'আপনার ডিভাইসগুলো নামাজের সময়ের সাথে সংযুক্ত করুন';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Google-কে নামাজের সময় এবং কিবলার দিক জিজ্ঞেস করুন';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Alexa-কে নামাজের সময়, পরবর্তী নামাজ এবং আরও জিজ্ঞেস করুন';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc =>
      'নামাজের সময়ের জন্য কাস্টম শর্টকাট তৈরি করুন';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'নামাজের সময় লাইট, ডিসপ্লে এবং রিমাইন্ডার অটোমেট করুন';

  @override
  String get smartHomeLinkAccount => 'অ্যাকাউন্ট লিংক করুন';

  @override
  String get smartHomeLinked => 'লিংক করা হয়েছে';

  @override
  String get smartHomeUnlink => 'আনলিংক';

  @override
  String get smartHomeSetupInstructions => 'সেটআপ নির্দেশনা';

  @override
  String get smartHomeRequiresUmmatPlus => 'Ummat+ প্রয়োজন';

  @override
  String get smartHomeTroubleshooting => 'সমস্যা সমাধান';

  @override
  String get smartHomeTestConnection => 'সংযোগ পরীক্ষা';

  @override
  String get smartHomeConnectionSuccess => 'সফলভাবে সংযুক্ত';

  @override
  String get smartHomeConnectionFailed =>
      'সংযোগ ব্যর্থ। আপনার অ্যাকাউন্ট লিংক পরীক্ষা করুন।';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'প্রিমিয়াম নামাজের সময় বৈশিষ্ট্য';

  @override
  String get subscriptionUpgrade => 'Ummat+-এ আপগ্রেড করুন';

  @override
  String get subscriptionRestore => 'ক্রয় পুনরুদ্ধার';

  @override
  String get subscriptionManage => 'সাবস্ক্রিপশন পরিচালনা';

  @override
  String get subscriptionCancel => 'সাবস্ক্রিপশন বাতিল';

  @override
  String get subscriptionActive => 'সক্রিয়';

  @override
  String get subscriptionExpired => 'মেয়াদোত্তীর্ণ';

  @override
  String get subscriptionFree => 'ফ্রি';

  @override
  String get subscriptionFreeDesc => 'মৌলিক নামাজের সময়, কিবলা, ক্যালেন্ডার';

  @override
  String get subscriptionPlusDesc => 'স্মার্ট হোম, টিভি ডিসপ্লে, উইজেট এবং আরো';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$countটি ফ্রি প্রশ্ন বাকি';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/বছর';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/মাস';
  }

  @override
  String get subscriptionFeatureSmartHome => 'স্মার্ট হোম ইন্টিগ্রেশন';

  @override
  String get subscriptionFeatureTV => 'টিভি ডিসপ্লে মোড';

  @override
  String get subscriptionFeatureWidgets => 'হোম স্ক্রিন উইজেট';

  @override
  String get subscriptionFeatureWatch => 'ওয়াচ কমপ্লিকেশন';

  @override
  String get subscriptionFeatureSync => 'ক্রস-ডিভাইস সিঙ্ক';

  @override
  String get subscriptionFeatureAdFree => 'বিজ্ঞাপনমুক্ত অভিজ্ঞতা';

  @override
  String get watchTitle => 'ওয়াচ';

  @override
  String get watchNextPrayer => 'পরবর্তী নামাজ';

  @override
  String get watchAllPrayers => 'সব নামাজ';

  @override
  String get watchComplication => 'কমপ্লিকেশন';

  @override
  String get nextPrayer => 'পরবর্তী নামাজ';

  @override
  String get allPrayers => 'সব নামাজ';

  @override
  String get today => 'আজ';

  @override
  String get tomorrow => 'আগামীকাল';

  @override
  String get thisWeek => 'এই সপ্তাহ';

  @override
  String get thisMonth => 'এই মাস';

  @override
  String get loginCreateAccount => 'অ্যাকাউন্ট তৈরি করুন';

  @override
  String get loginSignIn => 'সাইন ইন';

  @override
  String get loginWelcomeBack => 'আবার স্বাগতম';

  @override
  String get loginJoinPrayCalc => 'PrayCalc-এ যোগ দিন';

  @override
  String get loginSyncSubtitle => 'আপনার নামাজের ডেটা সব ডিভাইসে সিঙ্ক করুন';

  @override
  String get loginContinueGoogle => 'Google দিয়ে চালিয়ে যান';

  @override
  String get loginOr => 'অথবা';

  @override
  String get loginSigningIn => 'সাইন ইন হচ্ছে…';

  @override
  String get loginNameLabel => 'প্রদর্শন নাম (ঐচ্ছিক)';

  @override
  String get loginEmailLabel => 'ইমেইল';

  @override
  String get loginPasswordLabel => 'পাসওয়ার্ড';

  @override
  String get loginEmailRequired => 'ইমেইল প্রয়োজন';

  @override
  String get loginEmailInvalid => 'একটি সঠিক ইমেইল ঠিকানা লিখুন';

  @override
  String get loginPasswordRequired => 'পাসওয়ার্ড প্রয়োজন';

  @override
  String get loginPasswordMinLength => 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে';

  @override
  String get loginForgotPassword => 'পাসওয়ার্ড ভুলে গেছেন?';

  @override
  String get loginEnterEmailFirst => 'প্রথমে আপনার ইমেইল ঠিকানা লিখুন';

  @override
  String get loginResetSent => 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে';

  @override
  String get loginResetFailed => 'রিসেট ইমেইল পাঠানো যায়নি';

  @override
  String get loginNewToPrayCalc => 'PrayCalc-এ নতুন?';

  @override
  String get loginAlreadyHaveAccount => 'ইতিমধ্যে অ্যাকাউন্ট আছে?';

  @override
  String get accountTitle => 'অ্যাকাউন্ট';

  @override
  String get accountNotSignedIn => 'সাইন ইন করা হয়নি';

  @override
  String get accountSyncSection => 'সিঙ্ক';

  @override
  String get accountSyncStatus => 'সিঙ্ক স্ট্যাটাস';

  @override
  String get accountSyncNow => 'এখনই সিঙ্ক করুন';

  @override
  String get accountSyncHistory => 'সিঙ্ক ইতিহাস';

  @override
  String get accountNoConflicts => 'কোনো দ্বন্দ্ব নেই';

  @override
  String accountConflictsResolved(int count) {
    return '$countটি সমাধান হয়েছে';
  }

  @override
  String accountSyncedAgo(String time) {
    return '$time সিঙ্ক হয়েছে';
  }

  @override
  String get accountOfflineStatus =>
      'অফলাইন। পরিবর্তনগুলো স্থানীয়ভাবে সংরক্ষিত।';

  @override
  String get accountSyncErrorStatus => 'সিঙ্ক ত্রুটি। পুনরায় চেষ্টা হবে।';

  @override
  String get accountDataSection => 'ডেটা';

  @override
  String get accountExportData => 'ডেটা রপ্তানি';

  @override
  String get accountExportSubtitle =>
      'আপনার সেটিংস এবং নামাজের লগ ডাউনলোড করুন';

  @override
  String get accountExportFailed => 'ডেটা রপ্তানি করা যায়নি';

  @override
  String get accountSignOutTitle => 'সাইন আউট';

  @override
  String get accountSignOutBody =>
      'আপনার স্থানীয় ডেটা রাখা হবে। সিঙ্ক পুনরায় শুরু করতে আবার সাইন ইন করুন।';

  @override
  String get accountDeleteAccount => 'অ্যাকাউন্ট মুছুন';

  @override
  String get accountDeleteSubtitle =>
      'আপনার অ্যাকাউন্ট এবং ডেটা স্থায়ীভাবে মুছুন';

  @override
  String get accountDeleteBody =>
      'এটি আপনার অ্যাকাউন্ট এবং সমস্ত সিঙ্ক করা ডেটা স্থায়ীভাবে মুছে ফেলবে। এই ডিভাইসের স্থানীয় ডেটা সরানো হবে না।\n\nএই ক্রিয়া পূর্বাবস্থায় ফেরানো যাবে না।';

  @override
  String get accountDeleted => 'অ্যাকাউন্ট মুছে ফেলা হয়েছে';

  @override
  String get accountDeleteFailed => 'অ্যাকাউন্ট মুছে ফেলা যায়নি';

  @override
  String get accountTimeJustNow => 'এইমাত্র';

  @override
  String accountTimeMinAgo(int min) {
    return '$min মিনিট আগে';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour ঘণ্টা আগে';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day দিন আগে';
  }

  @override
  String get statsTitle => 'নামাজের পরিসংখ্যান';

  @override
  String get statsShareTooltip => 'পরিসংখ্যান শেয়ার করুন';

  @override
  String get statsTodayPrayers => 'আজকের নামাজ';

  @override
  String statsTodayCount(int done) {
    return '$done / ৫';
  }

  @override
  String get statsStreak => 'ধারা';

  @override
  String get statsDays => 'দিন';

  @override
  String get statsThisWeek => 'এই সপ্তাহ';

  @override
  String get statsCompletion => 'সম্পন্ন';

  @override
  String get statsThisMonth => 'এই মাস';

  @override
  String get statsMostMissed => 'সবচেয়ে বেশি মিস';

  @override
  String get statsThisWeekLabel => 'এই সপ্তাহ';

  @override
  String get statsWeeklyChart => 'নামাজ অনুযায়ী সাপ্তাহিক সম্পন্ন';

  @override
  String get statsMonthlyChart => 'নামাজ অনুযায়ী মাসিক সম্পন্ন';

  @override
  String statsTotalLogged(int count) {
    return 'মোট $countটি নামাজ লগ হয়েছে';
  }

  @override
  String get statsKeepItUp => 'চালিয়ে যান!';

  @override
  String get statsShareTitle => 'PrayCalc নামাজের পরিসংখ্যান';

  @override
  String statsShareStreak(int days) {
    return 'ধারা: $days দিন';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'সাপ্তাহিক: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'মাসিক: $pct%';
  }

  @override
  String get statsShareBreakdown => 'সাপ্তাহিক বিশ্লেষণ:';

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
  String get aboutTitle => 'PrayCalc সম্পর্কে';

  @override
  String get aboutWebsite => 'ওয়েবসাইট';

  @override
  String get aboutContact => 'যোগাযোগ';

  @override
  String get aboutLicenses => 'ওপেন সোর্স লাইসেন্স';

  @override
  String get aboutCouldNotOpen => 'লিংক খোলা যায়নি।';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev। সর্বস্বত্ব সংরক্ষিত।\n\nনামাজের সময় pray_calc_dart ইঞ্জিন ব্যবহার করে গণনা করা হয়। নির্ভুলতা আপনার GPS অবস্থান এবং নির্বাচিত গণনা পদ্ধতির উপর নির্ভর করে।';
  }

  @override
  String get commonCancel => 'বাতিল';

  @override
  String get commonSave => 'সংরক্ষণ';

  @override
  String get commonDelete => 'মুছুন';

  @override
  String get commonEdit => 'সম্পাদনা';

  @override
  String get commonRetry => 'পুনরায় চেষ্টা';

  @override
  String get commonClose => 'বন্ধ';

  @override
  String get commonDone => 'সম্পন্ন';

  @override
  String get commonBack => 'পেছনে';

  @override
  String get commonNext => 'পরবর্তী';

  @override
  String get commonSkip => 'এড়িয়ে যান';

  @override
  String get commonContinue => 'চালিয়ে যান';

  @override
  String get commonOk => 'ঠিক আছে';

  @override
  String get commonYes => 'হ্যাঁ';

  @override
  String get commonNo => 'না';

  @override
  String get commonShare => 'শেয়ার';

  @override
  String get commonCopy => 'কপি';

  @override
  String get commonCopied => 'ক্লিপবোর্ডে কপি হয়েছে';

  @override
  String get commonLoading => 'লোড হচ্ছে...';

  @override
  String get commonError => 'কিছু ভুল হয়েছে';

  @override
  String get commonErrorRetry =>
      'কিছু ভুল হয়েছে। পুনরায় চেষ্টা করতে ট্যাপ করুন।';

  @override
  String get commonNoInternet => 'ইন্টারনেট সংযোগ নেই';

  @override
  String get commonOfflineMode => 'অফলাইন মোড';

  @override
  String get commonSignIn => 'সাইন ইন';

  @override
  String get commonSignOut => 'সাইন আউট';

  @override
  String get commonSignUp => 'সাইন আপ';

  @override
  String get commonProfile => 'প্রোফাইল';

  @override
  String get commonAccount => 'অ্যাকাউন্ট';

  @override
  String get commonAbout => 'সম্পর্কে';

  @override
  String commonVersion(String version) {
    return 'সংস্করণ $version';
  }

  @override
  String get commonPrivacyPolicy => 'গোপনীয়তা নীতি';

  @override
  String get commonTermsOfService => 'সেবার শর্তাবলী';

  @override
  String get commonRateApp => 'অ্যাপ রেট করুন';

  @override
  String get commonFeedback => 'মতামত পাঠান';

  @override
  String get commonHelp => 'সাহায্য';

  @override
  String get commonLanguage => 'ভাষা';

  @override
  String get commonOpenSettings => 'সেটিংস খুলুন';

  @override
  String get travelNotificationTitle => 'আপনি এখন ভ্রমণে আছেন';

  @override
  String get travelNotificationBody =>
      'নামাজের সময় কমানো হতে পারে। ভ্রমণের বিধান জানতে ট্যাপ করুন।';

  @override
  String get travelRulingsTitle => 'ভ্রমণ ও নামাজ';

  @override
  String get travelRulingsIntro =>
      'ভ্রমণে নামাজের ইসলামি বিধান, কুরআন ও সহিহ হাদিস থেকে পণ্ডিত রেফারেন্স সহ।';

  @override
  String get travelWhenTitle => 'ভ্রমণ কখন প্রযোজ্য?';

  @override
  String get travelQasrTitle => 'নামাজ সংক্ষিপ্ত করা (কসর)';

  @override
  String get travelJamTitle => 'নামাজ একত্রিত করা (জমা)';

  @override
  String get travelDurationTitle => 'ভ্রমণের সময়কাল';

  @override
  String get travelReferencesTitle => 'পণ্ডিত রেফারেন্স';

  @override
  String get travelLearnMore => 'আরো জানুন';

  @override
  String get travelHanafiDefaultTitle =>
      'PrayCalc কেন হানাফি ডিফল্ট ব্যবহার করে';

  @override
  String get travelDeeperScholarly => 'গভীর পণ্ডিত আলোচনা';

  @override
  String get onboardingTitle1 => 'আপনি যেখানেই থাকুন, নামাজের সময়';

  @override
  String get onboardingBody1 =>
      'পৃথিবীর প্রতিটি শহরের জন্য GPS-সঠিক নামাজের সময়। ফজর থেকে ইশা, সূর্যোদয় থেকে কিয়াম। আমাদের নিজস্ব গণনা ইঞ্জিনে, নির্ভুলতার জন্য তৈরি।';

  @override
  String get onboardingTitle2 => 'আপনার অবস্থান, আপনার সময়';

  @override
  String get onboardingBody2 =>
      'যেকোনো শহর খুঁজুন বা GPS আপনার অবস্থান শনাক্ত করুক। PrayCalc বিশ্বব্যাপী ৫০ লাখ শহরের সময় খুঁজে দেয়।';

  @override
  String get onboardingTitle3 => 'কোনো নামাজ মিস করবেন না';

  @override
  String get onboardingBody3 =>
      'নামাজের সময় আজান, আগে রিমাইন্ডার। সেহরি, ক্লাস এবং আরও অনেক কিছুর জন্য কাস্টম এজেন্ডা।';

  @override
  String get onboardingTitle4 => 'আপনার যা কিছু দরকার';

  @override
  String get onboardingBody4 =>
      'কিবলা কম্পাস, নামাজের ক্যালেন্ডার, হিজরি চাঁদের ধাপ, তাসবীহ কাউন্টার। সব এক জায়গায়।';

  @override
  String get onboardingSkip => 'এড়িয়ে যান';

  @override
  String get onboardingGetStarted => 'শুরু করুন';

  @override
  String get onboardingSignInTitle => 'PrayCalc-এ সাইন ইন করুন';

  @override
  String get onboardingSignInSubtitle =>
      'আপনার নামাজের ইতিহাস সংরক্ষণ করুন এবং\nসব ডিভাইসে সিঙ্ক করুন।';

  @override
  String get onboardingContinueGoogle => 'Google দিয়ে চালিয়ে যান';

  @override
  String get onboardingContinueWithoutAccount => 'অ্যাকাউন্ট ছাড়া চালিয়ে যান';

  @override
  String get onboardingSigningIn => 'সাইন ইন হচ্ছে…';

  @override
  String get onboardingSelectLanguage => 'ভাষা নির্বাচন করুন';

  @override
  String get duaDhikrTitle => 'দোয়া ও যিকর';

  @override
  String get duaDhikrTabDua => 'দোয়া';

  @override
  String get duaDhikrTabDhikr => 'যিকর';

  @override
  String get duaDhikrTabTasbeeh => 'তাসবীহ';

  @override
  String get duaDhikrTabMorning => 'সকাল';

  @override
  String get duaDhikrTabEvening => 'সন্ধ্যা';

  @override
  String get duaDhikrMorningAdhkar => 'সকালের আযকার';

  @override
  String get duaDhikrEveningAdhkar => 'সন্ধ্যার আযকার';

  @override
  String get calGregToggle => 'গ্রেগ';

  @override
  String get calHijriToggle => 'হিজরি';

  @override
  String get calYearlyTooltip => 'বার্ষিক ক্যালেন্ডার';

  @override
  String get calExportIcsTooltip => '.ics রপ্তানি';

  @override
  String get calMagCol => 'মাগ';

  @override
  String get qiblaShowOnMap => 'মানচিত্রে দেখুন';

  @override
  String get qiblaWaitingCompass => 'কম্পাসের জন্য অপেক্ষা করা হচ্ছে...';

  @override
  String get qiblaNoCompassSensor =>
      'কম্পাস সেন্সর নেই। কিবলার দিক স্থিরভাবে দেখানো হচ্ছে।';

  @override
  String get qiblaAccuracyExcellent => 'চমৎকার নির্ভুলতা';

  @override
  String get qiblaAccuracyGood => 'ভালো নির্ভুলতা';

  @override
  String get qiblaAccuracyFair =>
      'মোটামুটি নির্ভুলতা। ৮ আকারে ফোন ঘুরিয়ে ক্যালিব্রেট করুন।';

  @override
  String get qiblaAccuracyLow =>
      'কম নির্ভুলতা। ৮ আকারে ফোন ঘুরিয়ে ক্যালিব্রেট করুন।';

  @override
  String get qiblaToTheKaaba => 'কাবার দিকে';

  @override
  String get qiblaYourLocation => 'আপনার অবস্থান';

  @override
  String get qiblaGpsAccurate => 'GPS-সঠিক';

  @override
  String get qiblaCityCenter => 'শহরের কেন্দ্র';

  @override
  String get moonIlluminatedLabel => 'আলোকিত';

  @override
  String get moonAgeLabel => 'বয়স';

  @override
  String get moonFirstQtr => 'প্রথম পাদ';

  @override
  String get moonLastQtr => 'শেষ পাদ';

  @override
  String get moonTonight => 'আজ রাতে';

  @override
  String get moonTomorrow => 'আগামীকাল';

  @override
  String moonDaysAway(int days) {
    return '$daysদি';
  }

  @override
  String get moonBeta => 'বেটা';

  @override
  String get setHomeTitle => 'বাড়ির অবস্থান সেট করুন';

  @override
  String get setHomeSearchHint => 'শহর, টাউন বা জিপ কোড খুঁজুন…';

  @override
  String get setHomeClear => 'মুছুন';

  @override
  String get setHomeUseCurrentLocation => 'বর্তমান অবস্থান ব্যবহার করুন';

  @override
  String get setHomeDetectAndSet =>
      'আপনার অবস্থান শনাক্ত করে বাড়ি হিসেবে সেট করুন';

  @override
  String get setHomeAlreadySet => 'বাড়ি আগেই সেট করা আছে';

  @override
  String setHomeSetAs(String city) {
    return '$city বাড়ি হিসেবে সেট করা হয়েছে';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'বর্তমান অবস্থান বাড়ি হিসেবে সেট হয়েছে';

  @override
  String get setHomePermissionDenied =>
      'অবস্থানের অনুমতি প্রত্যাখ্যান করা হয়েছে। নিচে একটি শহর খুঁজুন।';

  @override
  String get setHomeGpsUnavailable =>
      'GPS পাওয়া যাচ্ছে না। ম্যানুয়ালি খুঁজুন।';

  @override
  String get setHomeNoCitiesFound => 'কোনো শহর পাওয়া যায়নি।';

  @override
  String get setHomeSearchPrompt => 'আপনার বাড়ির শহর খুঁজুন';

  @override
  String get setHomeSearchBody =>
      'উপরে টাইপ করে খুঁজুন, বা আপনার বর্তমান অবস্থান ব্যবহার করুন। ভ্রমণ মোড শনাক্ত করবে আপনি বাড়ি থেকে কখন দূরে আছেন।';

  @override
  String get subscriptionYouHavePlus => 'আপনার Ummat+ আছে';

  @override
  String get subscriptionUpgradeTo => 'Ummat+-এ আপগ্রেড করুন';

  @override
  String get subscriptionThankYou => 'PrayCalc সমর্থন করার জন্য ধন্যবাদ।';

  @override
  String get subscriptionUnlockPremium =>
      'আপনার সব ডিভাইসে প্রিমিয়াম বৈশিষ্ট্য আনলক করুন।';

  @override
  String get subscriptionManageSub => 'সাবস্ক্রিপশন পরিচালনা';

  @override
  String get subscriptionWelcome => 'Ummat+-এ স্বাগতম!';

  @override
  String get subscriptionSubscribe => 'সাবস্ক্রাইব করুন';

  @override
  String get subscriptionFreeFeatures => 'ফ্রি বৈশিষ্ট্য';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ বৈশিষ্ট্য';

  @override
  String get subscriptionFeaturePrayerTimes => 'নামাজের সময়';

  @override
  String get subscriptionFeatureQibla => 'কিবলা কম্পাস';

  @override
  String get subscriptionFeatureCalendar => 'মাসিক ক্যালেন্ডার';

  @override
  String get subscriptionFeatureTasbeeh => 'তাসবীহ কাউন্টার';

  @override
  String get subscriptionFeatureMoon => 'চাঁদ ও হিজরি';

  @override
  String get smartHomeAlertType => 'সতর্কতার ধরন';

  @override
  String get smartHomeAlertModal => 'ফুল-স্ক্রিন মোডাল';

  @override
  String get smartHomeAlertCorner => 'কোণায় বিজ্ঞপ্তি';

  @override
  String get smartHomeAlertNone => 'কোনোটি নয় (নীরব)';

  @override
  String get smartHomePauseMedia => 'আজানের সময় মিডিয়া থামান';

  @override
  String get smartHomeQuietHours => 'নীরব সময়';

  @override
  String get smartHomeQuietFrom => 'থেকে';

  @override
  String get smartHomeQuietTo => 'পর্যন্ত';

  @override
  String get smartHomePrayerAudio => 'প্রতিটি নামাজের অডিও';

  @override
  String get smartHomeAudioAdhan => 'আজান';

  @override
  String get smartHomeAudioBeep => 'বিপ';

  @override
  String get smartHomeAudioSilent => 'নীরব';

  @override
  String get aboutPrivacy => 'গোপনীয়তা নীতি';

  @override
  String aboutVersion(String version) {
    return 'সংস্করণ $version';
  }

  @override
  String get notifDefaultAdhan => 'ডিফল্ট আজান';

  @override
  String get notifFajrAdhan => 'ফজরের আজান';

  @override
  String get notifFajrAdhanSubtitle => 'ফজরের নামাজের সময় বাজানো হয়';

  @override
  String get notifRegularAdhan => 'সাধারণ আজান';

  @override
  String get notifRegularAdhanSubtitle => 'যোহর, আসর, মাগরিব, ইশায় বাজানো হয়';

  @override
  String get notifPerPrayerSettings => 'প্রতিটি নামাজের সেটিংস';

  @override
  String get notifPreview => 'পূর্বশ্রবণ';

  @override
  String get tvSettingsTitle => 'টিভি সেটিংস';

  @override
  String get tvDisplayMode => 'ডিসপ্লে মোড';

  @override
  String get tvMasjidMode => 'মসজিদ মোড';

  @override
  String get tvMasjidModeSubtitle => 'ইকামত সময়সহ বড় সাইনেজ ডিসপ্লে';

  @override
  String get tvMasjidName => 'মসজিদের নাম';

  @override
  String get tvMasjidNameTapToSet => 'সেট করতে ট্যাপ করুন';

  @override
  String get tvClock => 'ঘড়ি';

  @override
  String get tv24hFormat => '২৪ ঘণ্টার ফরম্যাট';

  @override
  String get tvIqamahOffsets => 'ইকামত অফসেট (আজানের পরে মিনিট)';

  @override
  String tvIqamahMinAfter(int offset) {
    return 'আজানের পরে $offset মিনিট';
  }

  @override
  String get tvQrCode => 'QR কোড';

  @override
  String get tvShowQrCode => 'QR কোড দেখান';

  @override
  String get tvShowQrCodeSubtitle => 'মসজিদ স্ক্রিনে একটি QR কোড দেখান';

  @override
  String get tvQrCodeUrl => 'QR কোড URL';

  @override
  String get tvAmbientModeSection => 'অ্যাম্বিয়েন্ট মোড';

  @override
  String get tvIdleTimeout => 'নিষ্ক্রিয় সময়সীমা';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return 'অ্যাম্বিয়েন্ট সক্রিয় হওয়ার $minutes মিনিট আগে';
  }

  @override
  String get tvPhotoInterval => 'ফটো ব্যবধান';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return 'ফটোর মধ্যে $seconds সেকেন্ড';
  }

  @override
  String get tvBackground => 'ব্যাকগ্রাউন্ড';

  @override
  String get tvPhotoCategory => 'ফটো ক্যাটাগরি';

  @override
  String get tvLocation => 'অবস্থান';

  @override
  String get tvChangeCity => 'শহর পরিবর্তন';

  @override
  String get tvChangeCitySubtitle => 'একটি ভিন্ন শহর খুঁজুন';

  @override
  String get tvScreensaverBg => 'স্ক্রিনসেভার ব্যাকগ্রাউন্ড';

  @override
  String get tvScreensaverPhotos => 'ফটো';

  @override
  String get tvScreensaverPattern => 'জ্যামিতিক প্যাটার্ন';

  @override
  String get tvScreensaverBoth => 'ফটো + প্যাটার্ন';

  @override
  String get tvCategoryAll => 'সব ক্যাটাগরি';

  @override
  String get tvCategoryMasjids => 'মসজিদ';

  @override
  String get tvCategoryInteriors => 'অভ্যন্তরীণ';

  @override
  String get tvCategoryGeometric => 'জ্যামিতিক';

  @override
  String get tvCategoryCalligraphy => 'ক্যালিগ্রাফি';

  @override
  String get tvCategoryLandscapes => 'প্রকৃতি';

  @override
  String get tvCategoryRamadan => 'রমজান';

  @override
  String get tvPhotoCategoryTitle => 'ফটো ক্যাটাগরি';

  @override
  String tvEnterHint(String title) {
    return '$title লিখুন';
  }

  @override
  String get tvSystemDefault => 'সিস্টেম ডিফল্ট';

  @override
  String get smartHomeIntegrations => 'ইন্টিগ্রেশন';

  @override
  String get smartHomeLinkedSpeakers => 'লিংক করা স্পিকার ও ডিসপ্লে';

  @override
  String get smartHomeAlertDisplay => 'সতর্কতা প্রদর্শন';

  @override
  String get smartHomeAtAdhanShow => 'আজানের সময় দেখান';

  @override
  String get smartHomePauseMediaTitle => 'আজানের সময় মিডিয়া থামান';

  @override
  String get smartHomePauseMediaSubtitle => 'আজান শেষ হলে আবার চালু হয়';

  @override
  String get smartHomePrayerAudioSection => 'নামাজের অডিও';

  @override
  String get smartHomeQuietHoursSection => 'নীরব সময়';

  @override
  String get smartHomeEnableQuietHours => 'নীরব সময় সক্রিয় করুন';

  @override
  String get smartHomeQuietHoursSubtitle => 'সব স্মার্ট হোম সতর্কতা নীরব থাকে';

  @override
  String get smartHomeNoDevices => 'এখনো কোনো ডিভাইস লিংক করা হয়নি';

  @override
  String get smartHomeNoDevicesDesc =>
      'উপরে Google Home বা Alexa লিংক করুন, তারপর আপনার স্পিকার ও ডিসপ্লে এখানে দেখা যাবে।';

  @override
  String get smartHomeRequiresPlus => 'স্মার্ট হোমের জন্য Ummat+ প্রয়োজন';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Google Home, Alexa, Siri, এবং Home Assistant-এ নামাজের ঘোষণা নিয়ন্ত্রণ করুন। কোন ডিভাইসে আজান বাজবে, কখন মিডিয়া থামবে এবং নীরব সময় সেট করুন।';

  @override
  String get smartHomeBroadcastGoogle =>
      'Nest স্পিকার ও ডিসপ্লেতে আজান সম্প্রচার করুন।';

  @override
  String get smartHomeEnableAlexa => 'Alexa-তে PrayCalc স্কিল সক্রিয় করুন।';

  @override
  String get smartHomeSiriAsk =>
      'Siri-কে নামাজের সময় জিজ্ঞেস করুন বা অটোমেশন সেট করুন।';

  @override
  String get smartHomeHassAdd =>
      'সম্পূর্ণ অটোমেশন সমর্থনের জন্য HACS দিয়ে যোগ করুন।';

  @override
  String get smartHomeSetupGuide => 'সেটআপ গাইড';

  @override
  String get smartHomeSiriSetupTitle => 'Siri Shortcuts সেটআপ';

  @override
  String get smartHomeSiriStep1 =>
      'আপনার iPhone বা iPad-এ Shortcuts অ্যাপ খুলুন।';

  @override
  String get smartHomeSiriStep2 =>
      'একটি নতুন শর্টকাট তৈরি করতে \"+\" ট্যাপ করুন।';

  @override
  String get smartHomeSiriStep3 => 'অ্যাকশন তালিকায় \"PrayCalc\" খুঁজুন।';

  @override
  String get smartHomeSiriStep4 =>
      '\"Next Prayer Time\" বা \"Prayer Times Today\" যোগ করুন।';

  @override
  String get smartHomeSiriStep5 =>
      'ঐচ্ছিকভাবে এটি একটি অটোমেশনে যোগ করুন (যেমন: প্রতিদিন ফজরে)।';

  @override
  String get smartHomeSiriStep6 =>
      'পরীক্ষা করতে বলুন \"Hey Siri, next prayer time\"।';

  @override
  String get smartHomeSiriFootnote => 'iOS ১৬ বা তার পরে প্রয়োজন।';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant সেটআপ';

  @override
  String get smartHomeHassStep1 =>
      'HACS (Home Assistant Community Store) ইনস্টল করুন।';

  @override
  String get smartHomeHassStep2 =>
      'HACS-এ \"PrayCalc\" খুঁজুন এবং ইনস্টল করুন।';

  @override
  String get smartHomeHassStep3 =>
      'Settings > Devices & Services > Add Integration-এ যান।';

  @override
  String get smartHomeHassStep4 => '\"PrayCalc\" খুঁজুন এবং নির্বাচন করুন।';

  @override
  String get smartHomeHassStep5 =>
      'আপনার PrayCalc API কী লিখুন (আপনার অ্যাকাউন্টে তৈরি করা)।';

  @override
  String get smartHomeHassStep6 =>
      'আপনার অবস্থান এবং গণনা পদ্ধতি কনফিগার করুন।';

  @override
  String get smartHomeHassFootnote =>
      'HACS সহ Home Assistant 2024.1+ প্রয়োজন।';

  @override
  String get smartHomeApiKey => 'API কী';

  @override
  String get smartHomeGenerateApiKey => 'API কী তৈরি করুন';

  @override
  String get smartHomeApiKeyNotReady =>
      'PrayCalc স্মার্ট সার্ভিস স্থাপিত হলে API কী তৈরি পাওয়া যাবে।';

  @override
  String get smartHomeApiKeyDesc =>
      'Home Assistant-কে আপনার PrayCalc অ্যাকাউন্টের সাথে সংযুক্ত করতে একটি API কী প্রয়োজন হবে।';

  @override
  String get smartHomeLinkedStatus => 'লিংক করা হয়েছে';

  @override
  String get smartHomeNotLinkedStatus => 'লিংক করা হয়নি';

  @override
  String get smartHomeCouldNotOpen => 'লিংক খোলা যায়নি।';

  @override
  String get smartHomeDevices => 'ডিভাইস';

  @override
  String get smartHomeAddDevice => 'ডিভাইস যোগ করুন';

  @override
  String get smartHomeDeleteDevice => 'মুছুন';

  @override
  String get smartHomeDeleteDeviceConfirm => 'এই ডিভাইসটি সরাবেন?';

  @override
  String get smartHomeDeviceOnline => 'অনলাইন';

  @override
  String get smartHomeDeviceOffline => 'অফলাইন';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'সর্বশেষ দেখা: $time';
  }

  @override
  String get smartHomeDeviceName => 'ডিভাইসের নাম';

  @override
  String get smartHomeDeviceType => 'ডিভাইসের ধরন';

  @override
  String get smartHomeDeviceTypeTv => 'টিভি';

  @override
  String get smartHomeDeviceTypeSpeaker => 'স্পিকার';

  @override
  String get smartHomeDeviceTypeWatch => 'ঘড়ি';

  @override
  String get smartHomeDeviceTypeDesktop => 'ডেস্কটপ';

  @override
  String get smartHomeDeviceTypeOther => 'অন্যান্য';

  @override
  String get smartHomeDeviceAdhan => 'আযানের বিজ্ঞপ্তি';

  @override
  String get smartHomeDeviceAdhanDesc => 'এই ডিভাইসে আযানের সতর্কতা পান';

  @override
  String get smartHomeDeviceVolume => 'ভলিউম';

  @override
  String get smartHomeDeviceAudioType => 'অডিও ধরন';

  @override
  String get smartHomeDeviceEnabledPrayers => 'সক্রিয় নামায';

  @override
  String get smartHomeDeviceSettings => 'ডিভাইস সেটিংস';

  @override
  String get smartHomeTesting => 'পরীক্ষা হচ্ছে...';

  @override
  String get smartHomeTestSuccess => 'সংযোগ যাচাই হয়েছে';

  @override
  String get smartHomeTestFailed => 'সংযোগ পরীক্ষা ব্যর্থ';

  @override
  String get smartHomePairTv => 'টিভি যুক্ত করুন';

  @override
  String get smartHomePairingTv => 'টিভি নিবন্ধন হচ্ছে...';

  @override
  String get smartHomePairTvSuccess => 'টিভি সফলভাবে যুক্ত হয়েছে';

  @override
  String get smartHomePairTvFailed => 'টিভি যুক্তকরণ ব্যর্থ';

  @override
  String get smartHomeLoadingDevices => 'ডিভাইস লোড হচ্ছে...';

  @override
  String get smartHomeLoadingIntegrations => 'ইন্টিগ্রেশন লোড হচ্ছে...';

  @override
  String get smartHomeServiceUnavailable =>
      'স্মার্ট হোম সেবা বর্তমানে অনুপলব্ধ। পরে আবার চেষ্টা করুন।';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total সম্পন্ন';
  }

  @override
  String get adhkarReset => 'রিসেট';

  @override
  String get syncHistoryTitle => 'সিঙ্ক ইতিহাস';

  @override
  String get syncClearHistory => 'ইতিহাস মুছুন';

  @override
  String get syncNoConflicts => 'কোনো সিঙ্ক দ্বন্দ্ব নেই। সব ডিভাইস সিঙ্ক আছে।';

  @override
  String get syncDomainSettings => 'সেটিংস';

  @override
  String get syncDomainCities => 'সংরক্ষিত শহর';

  @override
  String get syncDomainPrayerLogs => 'নামাজের লগ';

  @override
  String get syncTimeJustNow => 'এইমাত্র';

  @override
  String syncTimeMinAgo(int min) {
    return '$min মিনিট আগে';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour ঘণ্টা আগে';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day দিন আগে';
  }

  @override
  String get pinCity => 'পিন';

  @override
  String get pinMaxReached =>
      'সর্বোচ্চ ৫টি পিন করা শহর। আরও পেতে Ummat+-এ আপগ্রেড করুন।';

  @override
  String pinCityUnpinned(String city) {
    return '$city আনপিন করা হয়েছে';
  }

  @override
  String get pinUndo => 'পূর্বাবস্থা';

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
