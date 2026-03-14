import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_bn.dart';
import 'app_localizations_de.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fa.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_ha.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_id.dart';
import 'app_localizations_ku.dart';
import 'app_localizations_ms.dart';
import 'app_localizations_ps.dart';
import 'app_localizations_pt.dart';
import 'app_localizations_ru.dart';
import 'app_localizations_so.dart';
import 'app_localizations_sw.dart';
import 'app_localizations_th.dart';
import 'app_localizations_tr.dart';
import 'app_localizations_ur.dart';
import 'app_localizations_uz.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('bn'),
    Locale('de'),
    Locale('en'),
    Locale('es'),
    Locale('fa'),
    Locale('fr'),
    Locale('ha'),
    Locale('hi'),
    Locale('id'),
    Locale('ku'),
    Locale('ms'),
    Locale('ps'),
    Locale('pt'),
    Locale('ru'),
    Locale('so'),
    Locale('sw'),
    Locale('th'),
    Locale('tr'),
    Locale('ur'),
    Locale('uz'),
    Locale('zh'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'PrayCalc'**
  String get appTitle;

  /// No description provided for @prayerFajr.
  ///
  /// In en, this message translates to:
  /// **'Fajr'**
  String get prayerFajr;

  /// No description provided for @prayerSunrise.
  ///
  /// In en, this message translates to:
  /// **'Sunrise'**
  String get prayerSunrise;

  /// No description provided for @prayerDhuhr.
  ///
  /// In en, this message translates to:
  /// **'Dhuhr'**
  String get prayerDhuhr;

  /// No description provided for @prayerAsr.
  ///
  /// In en, this message translates to:
  /// **'Asr'**
  String get prayerAsr;

  /// No description provided for @prayerMaghrib.
  ///
  /// In en, this message translates to:
  /// **'Maghrib'**
  String get prayerMaghrib;

  /// No description provided for @prayerIsha.
  ///
  /// In en, this message translates to:
  /// **'Isha'**
  String get prayerIsha;

  /// No description provided for @prayerQiyam.
  ///
  /// In en, this message translates to:
  /// **'Qiyam'**
  String get prayerQiyam;

  /// No description provided for @prayerSuhoor.
  ///
  /// In en, this message translates to:
  /// **'Suhoor'**
  String get prayerSuhoor;

  /// No description provided for @prayerIftar.
  ///
  /// In en, this message translates to:
  /// **'Iftar'**
  String get prayerIftar;

  /// No description provided for @hijriMuharram.
  ///
  /// In en, this message translates to:
  /// **'Muharram'**
  String get hijriMuharram;

  /// No description provided for @hijriSafar.
  ///
  /// In en, this message translates to:
  /// **'Safar'**
  String get hijriSafar;

  /// No description provided for @hijriRabiAlAwwal.
  ///
  /// In en, this message translates to:
  /// **'Rabi\' al-Awwal'**
  String get hijriRabiAlAwwal;

  /// No description provided for @hijriRabiAlThani.
  ///
  /// In en, this message translates to:
  /// **'Rabi\' al-Thani'**
  String get hijriRabiAlThani;

  /// No description provided for @hijriJumadaAlAwwal.
  ///
  /// In en, this message translates to:
  /// **'Jumada al-Awwal'**
  String get hijriJumadaAlAwwal;

  /// No description provided for @hijriJumadaAlThani.
  ///
  /// In en, this message translates to:
  /// **'Jumada al-Thani'**
  String get hijriJumadaAlThani;

  /// No description provided for @hijriRajab.
  ///
  /// In en, this message translates to:
  /// **'Rajab'**
  String get hijriRajab;

  /// No description provided for @hijriShaban.
  ///
  /// In en, this message translates to:
  /// **'Sha\'ban'**
  String get hijriShaban;

  /// No description provided for @hijriRamadan.
  ///
  /// In en, this message translates to:
  /// **'Ramadan'**
  String get hijriRamadan;

  /// No description provided for @hijriShawwal.
  ///
  /// In en, this message translates to:
  /// **'Shawwal'**
  String get hijriShawwal;

  /// No description provided for @hijriDhulQidah.
  ///
  /// In en, this message translates to:
  /// **'Dhu al-Qi\'dah'**
  String get hijriDhulQidah;

  /// No description provided for @hijriDhulHijjah.
  ///
  /// In en, this message translates to:
  /// **'Dhu al-Hijjah'**
  String get hijriDhulHijjah;

  /// No description provided for @monthJan.
  ///
  /// In en, this message translates to:
  /// **'Jan'**
  String get monthJan;

  /// No description provided for @monthFeb.
  ///
  /// In en, this message translates to:
  /// **'Feb'**
  String get monthFeb;

  /// No description provided for @monthMar.
  ///
  /// In en, this message translates to:
  /// **'Mar'**
  String get monthMar;

  /// No description provided for @monthApr.
  ///
  /// In en, this message translates to:
  /// **'Apr'**
  String get monthApr;

  /// No description provided for @monthMay.
  ///
  /// In en, this message translates to:
  /// **'May'**
  String get monthMay;

  /// No description provided for @monthJun.
  ///
  /// In en, this message translates to:
  /// **'Jun'**
  String get monthJun;

  /// No description provided for @monthJul.
  ///
  /// In en, this message translates to:
  /// **'Jul'**
  String get monthJul;

  /// No description provided for @monthAug.
  ///
  /// In en, this message translates to:
  /// **'Aug'**
  String get monthAug;

  /// No description provided for @monthSep.
  ///
  /// In en, this message translates to:
  /// **'Sep'**
  String get monthSep;

  /// No description provided for @monthOct.
  ///
  /// In en, this message translates to:
  /// **'Oct'**
  String get monthOct;

  /// No description provided for @monthNov.
  ///
  /// In en, this message translates to:
  /// **'Nov'**
  String get monthNov;

  /// No description provided for @monthDec.
  ///
  /// In en, this message translates to:
  /// **'Dec'**
  String get monthDec;

  /// No description provided for @monthJanuary.
  ///
  /// In en, this message translates to:
  /// **'January'**
  String get monthJanuary;

  /// No description provided for @monthFebruary.
  ///
  /// In en, this message translates to:
  /// **'February'**
  String get monthFebruary;

  /// No description provided for @monthMarch.
  ///
  /// In en, this message translates to:
  /// **'March'**
  String get monthMarch;

  /// No description provided for @monthApril.
  ///
  /// In en, this message translates to:
  /// **'April'**
  String get monthApril;

  /// No description provided for @monthMayFull.
  ///
  /// In en, this message translates to:
  /// **'May'**
  String get monthMayFull;

  /// No description provided for @monthJune.
  ///
  /// In en, this message translates to:
  /// **'June'**
  String get monthJune;

  /// No description provided for @monthJuly.
  ///
  /// In en, this message translates to:
  /// **'July'**
  String get monthJuly;

  /// No description provided for @monthAugust.
  ///
  /// In en, this message translates to:
  /// **'August'**
  String get monthAugust;

  /// No description provided for @monthSeptember.
  ///
  /// In en, this message translates to:
  /// **'September'**
  String get monthSeptember;

  /// No description provided for @monthOctober.
  ///
  /// In en, this message translates to:
  /// **'October'**
  String get monthOctober;

  /// No description provided for @monthNovember.
  ///
  /// In en, this message translates to:
  /// **'November'**
  String get monthNovember;

  /// No description provided for @monthDecember.
  ///
  /// In en, this message translates to:
  /// **'December'**
  String get monthDecember;

  /// No description provided for @dayMonShort.
  ///
  /// In en, this message translates to:
  /// **'Mon'**
  String get dayMonShort;

  /// No description provided for @dayTueShort.
  ///
  /// In en, this message translates to:
  /// **'Tue'**
  String get dayTueShort;

  /// No description provided for @dayWedShort.
  ///
  /// In en, this message translates to:
  /// **'Wed'**
  String get dayWedShort;

  /// No description provided for @dayThuShort.
  ///
  /// In en, this message translates to:
  /// **'Thu'**
  String get dayThuShort;

  /// No description provided for @dayFriShort.
  ///
  /// In en, this message translates to:
  /// **'Fri'**
  String get dayFriShort;

  /// No description provided for @daySatShort.
  ///
  /// In en, this message translates to:
  /// **'Sat'**
  String get daySatShort;

  /// No description provided for @daySunShort.
  ///
  /// In en, this message translates to:
  /// **'Sun'**
  String get daySunShort;

  /// No description provided for @dayMonday.
  ///
  /// In en, this message translates to:
  /// **'Monday'**
  String get dayMonday;

  /// No description provided for @dayTuesday.
  ///
  /// In en, this message translates to:
  /// **'Tuesday'**
  String get dayTuesday;

  /// No description provided for @dayWednesday.
  ///
  /// In en, this message translates to:
  /// **'Wednesday'**
  String get dayWednesday;

  /// No description provided for @dayThursday.
  ///
  /// In en, this message translates to:
  /// **'Thursday'**
  String get dayThursday;

  /// No description provided for @dayFriday.
  ///
  /// In en, this message translates to:
  /// **'Friday'**
  String get dayFriday;

  /// No description provided for @daySaturday.
  ///
  /// In en, this message translates to:
  /// **'Saturday'**
  String get daySaturday;

  /// No description provided for @daySunday.
  ///
  /// In en, this message translates to:
  /// **'Sunday'**
  String get daySunday;

  /// No description provided for @daySuChart.
  ///
  /// In en, this message translates to:
  /// **'Su'**
  String get daySuChart;

  /// No description provided for @dayMoChart.
  ///
  /// In en, this message translates to:
  /// **'Mo'**
  String get dayMoChart;

  /// No description provided for @dayTuChart.
  ///
  /// In en, this message translates to:
  /// **'Tu'**
  String get dayTuChart;

  /// No description provided for @dayWeChart.
  ///
  /// In en, this message translates to:
  /// **'We'**
  String get dayWeChart;

  /// No description provided for @dayThChart.
  ///
  /// In en, this message translates to:
  /// **'Th'**
  String get dayThChart;

  /// No description provided for @dayFrChart.
  ///
  /// In en, this message translates to:
  /// **'Fr'**
  String get dayFrChart;

  /// No description provided for @daySaChart.
  ///
  /// In en, this message translates to:
  /// **'Sa'**
  String get daySaChart;

  /// No description provided for @chooseCityLabel.
  ///
  /// In en, this message translates to:
  /// **'Choose a city'**
  String get chooseCityLabel;

  /// No description provided for @setCityFab.
  ///
  /// In en, this message translates to:
  /// **'Set city'**
  String get setCityFab;

  /// No description provided for @prayerTimesError.
  ///
  /// In en, this message translates to:
  /// **'Could not calculate prayer times.\n{error}'**
  String prayerTimesError(Object error);

  /// No description provided for @prayerCountdownLabel.
  ///
  /// In en, this message translates to:
  /// **'{prayer} in'**
  String prayerCountdownLabel(String prayer);

  /// No description provided for @ramadanMubarak.
  ///
  /// In en, this message translates to:
  /// **'Ramadan Mubarak'**
  String get ramadanMubarak;

  /// No description provided for @ramadanDayProgress.
  ///
  /// In en, this message translates to:
  /// **'Day {day} / 30'**
  String ramadanDayProgress(int day);

  /// No description provided for @lastTenNights.
  ///
  /// In en, this message translates to:
  /// **'Last 10 Nights'**
  String get lastTenNights;

  /// No description provided for @laylatulQadr.
  ///
  /// In en, this message translates to:
  /// **'Laylatul Qadr'**
  String get laylatulQadr;

  /// No description provided for @homeSuffixAH.
  ///
  /// In en, this message translates to:
  /// **'AH'**
  String get homeSuffixAH;

  /// No description provided for @homeSuffixCE.
  ///
  /// In en, this message translates to:
  /// **'CE'**
  String get homeSuffixCE;

  /// No description provided for @homeNoCitySelected.
  ///
  /// In en, this message translates to:
  /// **'No city selected'**
  String get homeNoCitySelected;

  /// No description provided for @homeNoCityHint.
  ///
  /// In en, this message translates to:
  /// **'Tap above to search for your city or enable GPS.'**
  String get homeNoCityHint;

  /// No description provided for @homeCouldNotCalc.
  ///
  /// In en, this message translates to:
  /// **'Could not calculate prayer times.'**
  String get homeCouldNotCalc;

  /// No description provided for @homeQasr.
  ///
  /// In en, this message translates to:
  /// **'Qasr'**
  String get homeQasr;

  /// No description provided for @homeActionMonthlyTimes.
  ///
  /// In en, this message translates to:
  /// **'Monthly\nTimes'**
  String get homeActionMonthlyTimes;

  /// No description provided for @homeActionDuaDhikr.
  ///
  /// In en, this message translates to:
  /// **'Dua &\nDhikr'**
  String get homeActionDuaDhikr;

  /// No description provided for @homeActionPrayerStats.
  ///
  /// In en, this message translates to:
  /// **'Prayer\nStats'**
  String get homeActionPrayerStats;

  /// No description provided for @homePolarBanner.
  ///
  /// In en, this message translates to:
  /// **'{count} prayer times cannot be calculated for your location during this period (midnight sun / polar night). Try nearest-latitude estimation in settings.'**
  String homePolarBanner(int count);

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @settingsSectionPrayerCalc.
  ///
  /// In en, this message translates to:
  /// **'Prayer Calculation'**
  String get settingsSectionPrayerCalc;

  /// No description provided for @settingsCalcMethod.
  ///
  /// In en, this message translates to:
  /// **'Calculation Method'**
  String get settingsCalcMethod;

  /// No description provided for @settingsCalcMethodAuto.
  ///
  /// In en, this message translates to:
  /// **'Auto (Dynamic)'**
  String get settingsCalcMethodAuto;

  /// No description provided for @settingsHanafiAsr.
  ///
  /// In en, this message translates to:
  /// **'Hanafi Asr'**
  String get settingsHanafiAsr;

  /// No description provided for @settingsHanafiAsrSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Shadow factor 2x (later Asr time)'**
  String get settingsHanafiAsrSubtitle;

  /// No description provided for @settingsSectionDisplay.
  ///
  /// In en, this message translates to:
  /// **'Display'**
  String get settingsSectionDisplay;

  /// No description provided for @settings24hClock.
  ///
  /// In en, this message translates to:
  /// **'24-hour clock'**
  String get settings24hClock;

  /// No description provided for @settingsFollowSystemTheme.
  ///
  /// In en, this message translates to:
  /// **'Follow system theme'**
  String get settingsFollowSystemTheme;

  /// No description provided for @settingsDarkMode.
  ///
  /// In en, this message translates to:
  /// **'Dark mode'**
  String get settingsDarkMode;

  /// No description provided for @settingsSectionNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get settingsSectionNotifications;

  /// No description provided for @settingsPrayerNotifications.
  ///
  /// In en, this message translates to:
  /// **'Prayer notifications'**
  String get settingsPrayerNotifications;

  /// No description provided for @settingsPrayerNotificationsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Adhan, reminders, and per-prayer settings'**
  String get settingsPrayerNotificationsSubtitle;

  /// No description provided for @settingsPrayerAgendas.
  ///
  /// In en, this message translates to:
  /// **'Prayer agendas'**
  String get settingsPrayerAgendas;

  /// No description provided for @settingsPrayerAgendasSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Custom reminders offset from prayer times'**
  String get settingsPrayerAgendasSubtitle;

  /// No description provided for @settingsAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get settingsAccount;

  /// No description provided for @settingsSignInToSync.
  ///
  /// In en, this message translates to:
  /// **'Sign in to sync'**
  String get settingsSignInToSync;

  /// No description provided for @settingsSignInToSyncSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Keep your data across devices'**
  String get settingsSignInToSyncSubtitle;

  /// No description provided for @settingsHomeScreen.
  ///
  /// In en, this message translates to:
  /// **'Home Screen'**
  String get settingsHomeScreen;

  /// No description provided for @settingsSkyGradient.
  ///
  /// In en, this message translates to:
  /// **'Sky gradient background'**
  String get settingsSkyGradient;

  /// No description provided for @settingsSkyGradientSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Animated sky colors matching the time of day'**
  String get settingsSkyGradientSubtitle;

  /// No description provided for @settingsWeatherGradient.
  ///
  /// In en, this message translates to:
  /// **'Weather-tinted gradient'**
  String get settingsWeatherGradient;

  /// No description provided for @settingsWeatherGradientSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Adjust sky colors based on local weather'**
  String get settingsWeatherGradientSubtitle;

  /// No description provided for @settingsCountdownAnimation.
  ///
  /// In en, this message translates to:
  /// **'Countdown animation'**
  String get settingsCountdownAnimation;

  /// No description provided for @settingsCountdownAnimationSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Breathing ring on the next prayer countdown'**
  String get settingsCountdownAnimationSubtitle;

  /// No description provided for @settingsPrayerTracking.
  ///
  /// In en, this message translates to:
  /// **'Prayer Tracking'**
  String get settingsPrayerTracking;

  /// No description provided for @settingsTrackMyPrayers.
  ///
  /// In en, this message translates to:
  /// **'Track my prayers'**
  String get settingsTrackMyPrayers;

  /// No description provided for @settingsTrackMyPrayersSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Log which prayers you complete each day'**
  String get settingsTrackMyPrayersSubtitle;

  /// No description provided for @settingsPrayerStats.
  ///
  /// In en, this message translates to:
  /// **'Prayer statistics'**
  String get settingsPrayerStats;

  /// No description provided for @settingsPrayerStatsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Streaks, weekly and monthly charts'**
  String get settingsPrayerStatsSubtitle;

  /// No description provided for @settingsJumuahKahf.
  ///
  /// In en, this message translates to:
  /// **'Jumu\'ah Al-Kahf reminder'**
  String get settingsJumuahKahf;

  /// No description provided for @settingsJumuahKahfSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Reminder on Fridays to read Surah Al-Kahf'**
  String get settingsJumuahKahfSubtitle;

  /// No description provided for @settingsTravel.
  ///
  /// In en, this message translates to:
  /// **'Travel'**
  String get settingsTravel;

  /// No description provided for @settingsTravelMode.
  ///
  /// In en, this message translates to:
  /// **'Travel mode'**
  String get settingsTravelMode;

  /// No description provided for @settingsTravelModeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Automatically detect when away from home and adjust prayers'**
  String get settingsTravelModeSubtitle;

  /// No description provided for @settingsHomeLocation.
  ///
  /// In en, this message translates to:
  /// **'Home location'**
  String get settingsHomeLocation;

  /// No description provided for @settingsHomeLocationNotSet.
  ///
  /// In en, this message translates to:
  /// **'Not set — tap to use current location'**
  String get settingsHomeLocationNotSet;

  /// No description provided for @settingsClearHomeLocation.
  ///
  /// In en, this message translates to:
  /// **'Clear home location'**
  String get settingsClearHomeLocation;

  /// No description provided for @settingsTravelRulings.
  ///
  /// In en, this message translates to:
  /// **'Travel prayer rulings'**
  String get settingsTravelRulings;

  /// No description provided for @settingsTravelRulingsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Qasr, combining, and traveler guidelines'**
  String get settingsTravelRulingsSubtitle;

  /// No description provided for @settingsSmartHome.
  ///
  /// In en, this message translates to:
  /// **'Smart Home'**
  String get settingsSmartHome;

  /// No description provided for @settingsSmartHomeIntegrations.
  ///
  /// In en, this message translates to:
  /// **'Smart home integrations'**
  String get settingsSmartHomeIntegrations;

  /// No description provided for @settingsSmartHomeIntegrationsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'HomeKit, Google Home, Alexa, Home Assistant'**
  String get settingsSmartHomeIntegrationsSubtitle;

  /// No description provided for @settingsTvDisplay.
  ///
  /// In en, this message translates to:
  /// **'TV Display'**
  String get settingsTvDisplay;

  /// No description provided for @settingsTvHome.
  ///
  /// In en, this message translates to:
  /// **'TV home display'**
  String get settingsTvHome;

  /// No description provided for @settingsTvHomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Full-screen prayer clock for TV'**
  String get settingsTvHomeSubtitle;

  /// No description provided for @settingsMasjidDisplay.
  ///
  /// In en, this message translates to:
  /// **'Masjid display'**
  String get settingsMasjidDisplay;

  /// No description provided for @settingsMasjidDisplaySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Adhan/iqamah table for masjid screens'**
  String get settingsMasjidDisplaySubtitle;

  /// No description provided for @settingsTvSettings.
  ///
  /// In en, this message translates to:
  /// **'TV settings'**
  String get settingsTvSettings;

  /// No description provided for @settingsTvSettingsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Masjid mode, iqamah offsets, ambient'**
  String get settingsTvSettingsSubtitle;

  /// No description provided for @settingsAboutPrayCalc.
  ///
  /// In en, this message translates to:
  /// **'About PrayCalc'**
  String get settingsAboutPrayCalc;

  /// No description provided for @syncSynced.
  ///
  /// In en, this message translates to:
  /// **'Synced'**
  String get syncSynced;

  /// No description provided for @syncSyncing.
  ///
  /// In en, this message translates to:
  /// **'Syncing...'**
  String get syncSyncing;

  /// No description provided for @syncOffline.
  ///
  /// In en, this message translates to:
  /// **'Offline'**
  String get syncOffline;

  /// No description provided for @syncError.
  ///
  /// In en, this message translates to:
  /// **'Sync error'**
  String get syncError;

  /// No description provided for @notifSettingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications & Adhan'**
  String get notifSettingsTitle;

  /// No description provided for @notifAdhanLabel.
  ///
  /// In en, this message translates to:
  /// **'Adhan'**
  String get notifAdhanLabel;

  /// No description provided for @notifReminderMinBefore.
  ///
  /// In en, this message translates to:
  /// **'Reminder: {minutes} min before'**
  String notifReminderMinBefore(int minutes);

  /// No description provided for @notifVolumePct.
  ///
  /// In en, this message translates to:
  /// **'Volume: {pct}%'**
  String notifVolumePct(int pct);

  /// No description provided for @notifTestAdhan.
  ///
  /// In en, this message translates to:
  /// **'Test adhan'**
  String get notifTestAdhan;

  /// No description provided for @notifModeOff.
  ///
  /// In en, this message translates to:
  /// **'Off'**
  String get notifModeOff;

  /// No description provided for @notifModeReminderOnly.
  ///
  /// In en, this message translates to:
  /// **'Reminder only'**
  String get notifModeReminderOnly;

  /// No description provided for @notifModeArrival.
  ///
  /// In en, this message translates to:
  /// **'At prayer time'**
  String get notifModeArrival;

  /// No description provided for @notifModeBoth.
  ///
  /// In en, this message translates to:
  /// **'Reminder + arrival'**
  String get notifModeBoth;

  /// No description provided for @citySearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search city…'**
  String get citySearchHint;

  /// No description provided for @citySearchDetectTooltip.
  ///
  /// In en, this message translates to:
  /// **'Detect my location'**
  String get citySearchDetectTooltip;

  /// No description provided for @citySearchNoCityGps.
  ///
  /// In en, this message translates to:
  /// **'Could not detect city from GPS.'**
  String get citySearchNoCityGps;

  /// No description provided for @citySearchPermissionDenied.
  ///
  /// In en, this message translates to:
  /// **'Location permission denied. Search manually.'**
  String get citySearchPermissionDenied;

  /// No description provided for @citySearchNoResults.
  ///
  /// In en, this message translates to:
  /// **'No cities found.'**
  String get citySearchNoResults;

  /// No description provided for @citySearchStartTyping.
  ///
  /// In en, this message translates to:
  /// **'Start typing to search…'**
  String get citySearchStartTyping;

  /// No description provided for @agendasTitle.
  ///
  /// In en, this message translates to:
  /// **'Prayer Agendas'**
  String get agendasTitle;

  /// No description provided for @agendasEmpty.
  ///
  /// In en, this message translates to:
  /// **'No agendas yet.\nTap + to add a reminder linked to your prayers.'**
  String get agendasEmpty;

  /// No description provided for @agendasUndo.
  ///
  /// In en, this message translates to:
  /// **'Undo'**
  String get agendasUndo;

  /// No description provided for @agendasRemoved.
  ///
  /// In en, this message translates to:
  /// **'{label} removed'**
  String agendasRemoved(String label);

  /// No description provided for @agendaNewTitle.
  ///
  /// In en, this message translates to:
  /// **'New Agenda'**
  String get agendaNewTitle;

  /// No description provided for @agendaEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit Agenda'**
  String get agendaEditTitle;

  /// No description provided for @agendaSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get agendaSave;

  /// No description provided for @agendaLabelEmpty.
  ///
  /// In en, this message translates to:
  /// **'Label cannot be empty'**
  String get agendaLabelEmpty;

  /// No description provided for @agendaLabelField.
  ///
  /// In en, this message translates to:
  /// **'Label'**
  String get agendaLabelField;

  /// No description provided for @agendaLabelHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Wake for Fajr'**
  String get agendaLabelHint;

  /// No description provided for @agendaPrayerSection.
  ///
  /// In en, this message translates to:
  /// **'Prayer'**
  String get agendaPrayerSection;

  /// No description provided for @agendaTimeOffsetSection.
  ///
  /// In en, this message translates to:
  /// **'Time offset'**
  String get agendaTimeOffsetSection;

  /// No description provided for @agendaOffsetAtPrayerTime.
  ///
  /// In en, this message translates to:
  /// **'At prayer time'**
  String get agendaOffsetAtPrayerTime;

  /// No description provided for @agendaOffsetMinBefore.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min before'**
  String agendaOffsetMinBefore(int minutes);

  /// No description provided for @agendaOffsetMinAfter.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min after'**
  String agendaOffsetMinAfter(int minutes);

  /// No description provided for @agendaRepeatSection.
  ///
  /// In en, this message translates to:
  /// **'Repeat'**
  String get agendaRepeatSection;

  /// No description provided for @agendaNotifTypeSection.
  ///
  /// In en, this message translates to:
  /// **'Notification type'**
  String get agendaNotifTypeSection;

  /// No description provided for @agendaNotifSilent.
  ///
  /// In en, this message translates to:
  /// **'Silent'**
  String get agendaNotifSilent;

  /// No description provided for @agendaNotifSound.
  ///
  /// In en, this message translates to:
  /// **'Sound'**
  String get agendaNotifSound;

  /// No description provided for @agendaNotifVibrate.
  ///
  /// In en, this message translates to:
  /// **'Vibrate'**
  String get agendaNotifVibrate;

  /// No description provided for @agendaDayM.
  ///
  /// In en, this message translates to:
  /// **'M'**
  String get agendaDayM;

  /// No description provided for @agendaDayT.
  ///
  /// In en, this message translates to:
  /// **'T'**
  String get agendaDayT;

  /// No description provided for @agendaDayW.
  ///
  /// In en, this message translates to:
  /// **'W'**
  String get agendaDayW;

  /// No description provided for @agendaDayF.
  ///
  /// In en, this message translates to:
  /// **'F'**
  String get agendaDayF;

  /// No description provided for @agendaDayS.
  ///
  /// In en, this message translates to:
  /// **'S'**
  String get agendaDayS;

  /// No description provided for @moonTitle.
  ///
  /// In en, this message translates to:
  /// **'Moon & Hijri Calendar'**
  String get moonTitle;

  /// No description provided for @moonIlluminated.
  ///
  /// In en, this message translates to:
  /// **'{pct}% illuminated'**
  String moonIlluminated(int pct);

  /// No description provided for @moonFullTonight.
  ///
  /// In en, this message translates to:
  /// **'Full moon tonight!'**
  String get moonFullTonight;

  /// No description provided for @moonNextTomorrow.
  ///
  /// In en, this message translates to:
  /// **'Next full moon tomorrow'**
  String get moonNextTomorrow;

  /// No description provided for @moonNextDays.
  ///
  /// In en, this message translates to:
  /// **'Next full moon in {days} days'**
  String moonNextDays(int days);

  /// No description provided for @moonAge.
  ///
  /// In en, this message translates to:
  /// **'Moon age: {age} days'**
  String moonAge(String age);

  /// No description provided for @moonPhaseNewMoon.
  ///
  /// In en, this message translates to:
  /// **'New Moon'**
  String get moonPhaseNewMoon;

  /// No description provided for @moonPhaseWaxingCrescent.
  ///
  /// In en, this message translates to:
  /// **'Waxing Crescent'**
  String get moonPhaseWaxingCrescent;

  /// No description provided for @moonPhaseFirstQuarter.
  ///
  /// In en, this message translates to:
  /// **'First Quarter'**
  String get moonPhaseFirstQuarter;

  /// No description provided for @moonPhaseWaxingGibbous.
  ///
  /// In en, this message translates to:
  /// **'Waxing Gibbous'**
  String get moonPhaseWaxingGibbous;

  /// No description provided for @moonPhaseFullMoon.
  ///
  /// In en, this message translates to:
  /// **'Full Moon'**
  String get moonPhaseFullMoon;

  /// No description provided for @moonPhaseWaningGibbous.
  ///
  /// In en, this message translates to:
  /// **'Waning Gibbous'**
  String get moonPhaseWaningGibbous;

  /// No description provided for @moonPhaseLastQuarter.
  ///
  /// In en, this message translates to:
  /// **'Last Quarter'**
  String get moonPhaseLastQuarter;

  /// No description provided for @moonPhaseWaningCrescent.
  ///
  /// In en, this message translates to:
  /// **'Waning Crescent'**
  String get moonPhaseWaningCrescent;

  /// No description provided for @moonHilalVisibility.
  ///
  /// In en, this message translates to:
  /// **'Next Hilal Visibility'**
  String get moonHilalVisibility;

  /// No description provided for @moonRegionMiddleEast.
  ///
  /// In en, this message translates to:
  /// **'Middle East'**
  String get moonRegionMiddleEast;

  /// No description provided for @moonRegionWestAfrica.
  ///
  /// In en, this message translates to:
  /// **'West Africa'**
  String get moonRegionWestAfrica;

  /// No description provided for @moonRegionSouthAsia.
  ///
  /// In en, this message translates to:
  /// **'South Asia'**
  String get moonRegionSouthAsia;

  /// No description provided for @moonRegionEurope.
  ///
  /// In en, this message translates to:
  /// **'Europe'**
  String get moonRegionEurope;

  /// No description provided for @moonRegionAmericas.
  ///
  /// In en, this message translates to:
  /// **'Americas'**
  String get moonRegionAmericas;

  /// No description provided for @moonVisible.
  ///
  /// In en, this message translates to:
  /// **'Visible'**
  String get moonVisible;

  /// No description provided for @moonNotVisible.
  ///
  /// In en, this message translates to:
  /// **'Not Visible'**
  String get moonNotVisible;

  /// No description provided for @moonPossible.
  ///
  /// In en, this message translates to:
  /// **'Possible'**
  String get moonPossible;

  /// No description provided for @moonUpcomingDates.
  ///
  /// In en, this message translates to:
  /// **'Upcoming Islamic Dates'**
  String get moonUpcomingDates;

  /// No description provided for @hijriTodayLabel.
  ///
  /// In en, this message translates to:
  /// **'Today in the Hijri Calendar'**
  String get hijriTodayLabel;

  /// No description provided for @ramadanBeginsLabel.
  ///
  /// In en, this message translates to:
  /// **'Ramadan {year} AH begins'**
  String ramadanBeginsLabel(int year);

  /// No description provided for @ramadanDaysAway.
  ///
  /// In en, this message translates to:
  /// **'{days} days away'**
  String ramadanDaysAway(int days);

  /// No description provided for @moonLunarCycle.
  ///
  /// In en, this message translates to:
  /// **'Lunar Cycle'**
  String get moonLunarCycle;

  /// No description provided for @moonDayOfCycle.
  ///
  /// In en, this message translates to:
  /// **'Day {day} of ~29.5'**
  String moonDayOfCycle(int day);

  /// No description provided for @moonHilalSightingForecast.
  ///
  /// In en, this message translates to:
  /// **'Hilal Sighting Forecast'**
  String get moonHilalSightingForecast;

  /// No description provided for @moonHilalVisibilityMap.
  ///
  /// In en, this message translates to:
  /// **'Hilal Visibility Map'**
  String get moonHilalVisibilityMap;

  /// No description provided for @moonDayN.
  ///
  /// In en, this message translates to:
  /// **'Day {day}'**
  String moonDayN(int day);

  /// No description provided for @moonGlobalSighting.
  ///
  /// In en, this message translates to:
  /// **'Global Sighting'**
  String get moonGlobalSighting;

  /// No description provided for @moonZoneNakedEye.
  ///
  /// In en, this message translates to:
  /// **'Naked Eye'**
  String get moonZoneNakedEye;

  /// No description provided for @moonZoneBinoculars.
  ///
  /// In en, this message translates to:
  /// **'Binoculars'**
  String get moonZoneBinoculars;

  /// No description provided for @moonZoneVeryDifficult.
  ///
  /// In en, this message translates to:
  /// **'Very Difficult'**
  String get moonZoneVeryDifficult;

  /// No description provided for @moonZoneNotVisible.
  ///
  /// In en, this message translates to:
  /// **'Not Visible'**
  String get moonZoneNotVisible;

  /// No description provided for @moonMonthPrediction29.
  ///
  /// In en, this message translates to:
  /// **'{month} {year} AH will likely be 29 days. Crescent expected to be sighted on the 29th, in sha Allah.'**
  String moonMonthPrediction29(String month, int year);

  /// No description provided for @moonMonthPrediction30.
  ///
  /// In en, this message translates to:
  /// **'{month} {year} AH will likely be 30 days. Crescent unlikely on the 29th — month completes 30 days.'**
  String moonMonthPrediction30(String month, int year);

  /// No description provided for @moonUmmAlQura.
  ///
  /// In en, this message translates to:
  /// **'Umm al-Qura'**
  String get moonUmmAlQura;

  /// No description provided for @moonSaudiArabia.
  ///
  /// In en, this message translates to:
  /// **'Saudi Arabia'**
  String get moonSaudiArabia;

  /// No description provided for @moonFCNACalc.
  ///
  /// In en, this message translates to:
  /// **'FCNA / Calc.'**
  String get moonFCNACalc;

  /// No description provided for @moonNorthAmerica.
  ///
  /// In en, this message translates to:
  /// **'North America'**
  String get moonNorthAmerica;

  /// No description provided for @moonNDays.
  ///
  /// In en, this message translates to:
  /// **'{days} days'**
  String moonNDays(int days);

  /// No description provided for @moonStarts.
  ///
  /// In en, this message translates to:
  /// **'{month} starts:'**
  String moonStarts(String month);

  /// No description provided for @moonMoonAgeAtSunset.
  ///
  /// In en, this message translates to:
  /// **'Moon age at sunset: {hours} h'**
  String moonMoonAgeAtSunset(String hours);

  /// No description provided for @moon7DayLunarCalendar.
  ///
  /// In en, this message translates to:
  /// **'7-Day Lunar Calendar'**
  String get moon7DayLunarCalendar;

  /// No description provided for @moonUpcomingIslamicEvents.
  ///
  /// In en, this message translates to:
  /// **'Upcoming Islamic Events'**
  String get moonUpcomingIslamicEvents;

  /// No description provided for @moonTodayLabel.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get moonTodayLabel;

  /// No description provided for @moonTomorrowLabel.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get moonTomorrowLabel;

  /// No description provided for @calDateCol.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get calDateCol;

  /// No description provided for @calHijriCol.
  ///
  /// In en, this message translates to:
  /// **'Hijri'**
  String get calHijriCol;

  /// No description provided for @calFajrCol.
  ///
  /// In en, this message translates to:
  /// **'Fajr'**
  String get calFajrCol;

  /// No description provided for @calSunriseCol.
  ///
  /// In en, this message translates to:
  /// **'Sunrise'**
  String get calSunriseCol;

  /// No description provided for @calDhuhrCol.
  ///
  /// In en, this message translates to:
  /// **'Dhuhr'**
  String get calDhuhrCol;

  /// No description provided for @calAsrCol.
  ///
  /// In en, this message translates to:
  /// **'Asr'**
  String get calAsrCol;

  /// No description provided for @calMaghribCol.
  ///
  /// In en, this message translates to:
  /// **'Maghrib'**
  String get calMaghribCol;

  /// No description provided for @calIshaCol.
  ///
  /// In en, this message translates to:
  /// **'Isha'**
  String get calIshaCol;

  /// No description provided for @calNoCityText.
  ///
  /// In en, this message translates to:
  /// **'Set your city first\nto view the prayer calendar.'**
  String get calNoCityText;

  /// No description provided for @calShareTooltip.
  ///
  /// In en, this message translates to:
  /// **'Share calendar'**
  String get calShareTooltip;

  /// No description provided for @calPrevMonthTooltip.
  ///
  /// In en, this message translates to:
  /// **'Previous month'**
  String get calPrevMonthTooltip;

  /// No description provided for @calNextMonthTooltip.
  ///
  /// In en, this message translates to:
  /// **'Next month'**
  String get calNextMonthTooltip;

  /// No description provided for @calExportHeader.
  ///
  /// In en, this message translates to:
  /// **'PrayCalc — {month}'**
  String calExportHeader(String month);

  /// No description provided for @calExportSubject.
  ///
  /// In en, this message translates to:
  /// **'Prayer Times — {month}'**
  String calExportSubject(String month);

  /// No description provided for @qiblaTitle.
  ///
  /// In en, this message translates to:
  /// **'Qibla'**
  String get qiblaTitle;

  /// No description provided for @qiblaSwitchToCompass.
  ///
  /// In en, this message translates to:
  /// **'Switch to compass'**
  String get qiblaSwitchToCompass;

  /// No description provided for @qiblaSwitchToAR.
  ///
  /// In en, this message translates to:
  /// **'Switch to AR camera'**
  String get qiblaSwitchToAR;

  /// No description provided for @qiblaNoCityText.
  ///
  /// In en, this message translates to:
  /// **'Set your city first\nto calculate the Qibla direction.'**
  String get qiblaNoCityText;

  /// No description provided for @qiblaCompassUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Compass sensor unavailable on this device.'**
  String get qiblaCompassUnavailable;

  /// No description provided for @qiblaCalibrate.
  ///
  /// In en, this message translates to:
  /// **'Calibrate: move your phone in a figure-8 motion.'**
  String get qiblaCalibrate;

  /// No description provided for @qiblaDegreesFromNorth.
  ///
  /// In en, this message translates to:
  /// **'{degrees}° from North'**
  String qiblaDegreesFromNorth(int degrees);

  /// No description provided for @qiblaFrom.
  ///
  /// In en, this message translates to:
  /// **'From {city}'**
  String qiblaFrom(String city);

  /// No description provided for @qiblaDistKm.
  ///
  /// In en, this message translates to:
  /// **'{dist} km from the Kaaba'**
  String qiblaDistKm(int dist);

  /// No description provided for @qiblaDistThousandKm.
  ///
  /// In en, this message translates to:
  /// **'{dist}K km from the Kaaba'**
  String qiblaDistThousandKm(String dist);

  /// No description provided for @qiblaFacingQibla.
  ///
  /// In en, this message translates to:
  /// **'Facing Qibla ✓'**
  String get qiblaFacingQibla;

  /// No description provided for @tasbeehTitle.
  ///
  /// In en, this message translates to:
  /// **'Tasbeeh'**
  String get tasbeehTitle;

  /// No description provided for @tasbeehResetTooltip.
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get tasbeehResetTooltip;

  /// No description provided for @tasbeehTapToSwitch.
  ///
  /// In en, this message translates to:
  /// **'Tap label to switch'**
  String get tasbeehTapToSwitch;

  /// No description provided for @tasbeehTapToCount.
  ///
  /// In en, this message translates to:
  /// **'Tap anywhere to count'**
  String get tasbeehTapToCount;

  /// No description provided for @tasbeehResetDialogTitle.
  ///
  /// In en, this message translates to:
  /// **'Reset counter?'**
  String get tasbeehResetDialogTitle;

  /// No description provided for @tasbeehResetDialogContent.
  ///
  /// In en, this message translates to:
  /// **'This will reset the current count to zero.'**
  String get tasbeehResetDialogContent;

  /// No description provided for @tasbeehCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get tasbeehCancel;

  /// No description provided for @tasbeehReset.
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get tasbeehReset;

  /// No description provided for @tasbeehTodayDhikr.
  ///
  /// In en, this message translates to:
  /// **'Today: {count} dhikr'**
  String tasbeehTodayDhikr(int count);

  /// No description provided for @tasbeehLast7Days.
  ///
  /// In en, this message translates to:
  /// **'Last 7 days'**
  String get tasbeehLast7Days;

  /// No description provided for @tasbeehNoHistory.
  ///
  /// In en, this message translates to:
  /// **'No history yet — start counting!'**
  String get tasbeehNoHistory;

  /// No description provided for @tasbeehComplete.
  ///
  /// In en, this message translates to:
  /// **'Tasbih complete! {count} dhikr'**
  String tasbeehComplete(int count);

  /// No description provided for @tasbeehPresetComplete.
  ///
  /// In en, this message translates to:
  /// **'✓ {label} × {target}'**
  String tasbeehPresetComplete(String label, int target);

  /// No description provided for @smartHomeTitle.
  ///
  /// In en, this message translates to:
  /// **'Smart Home'**
  String get smartHomeTitle;

  /// No description provided for @smartHomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Connect your devices to prayer times'**
  String get smartHomeSubtitle;

  /// No description provided for @smartHomeGoogleHome.
  ///
  /// In en, this message translates to:
  /// **'Google Home'**
  String get smartHomeGoogleHome;

  /// No description provided for @smartHomeGoogleHomeDesc.
  ///
  /// In en, this message translates to:
  /// **'Ask Google for prayer times and Qibla direction'**
  String get smartHomeGoogleHomeDesc;

  /// No description provided for @smartHomeAlexa.
  ///
  /// In en, this message translates to:
  /// **'Amazon Alexa'**
  String get smartHomeAlexa;

  /// No description provided for @smartHomeAlexaDesc.
  ///
  /// In en, this message translates to:
  /// **'Ask Alexa for prayer times, next prayer, and more'**
  String get smartHomeAlexaDesc;

  /// No description provided for @smartHomeSiri.
  ///
  /// In en, this message translates to:
  /// **'Siri Shortcuts'**
  String get smartHomeSiri;

  /// No description provided for @smartHomeSiriDesc.
  ///
  /// In en, this message translates to:
  /// **'Create custom shortcuts for prayer times'**
  String get smartHomeSiriDesc;

  /// No description provided for @smartHomeHomeAssistant.
  ///
  /// In en, this message translates to:
  /// **'Home Assistant'**
  String get smartHomeHomeAssistant;

  /// No description provided for @smartHomeHomeAssistantDesc.
  ///
  /// In en, this message translates to:
  /// **'Automate lights, displays, and reminders at prayer times'**
  String get smartHomeHomeAssistantDesc;

  /// No description provided for @smartHomeLinkAccount.
  ///
  /// In en, this message translates to:
  /// **'Link Account'**
  String get smartHomeLinkAccount;

  /// No description provided for @smartHomeLinked.
  ///
  /// In en, this message translates to:
  /// **'Linked'**
  String get smartHomeLinked;

  /// No description provided for @smartHomeUnlink.
  ///
  /// In en, this message translates to:
  /// **'Unlink'**
  String get smartHomeUnlink;

  /// No description provided for @smartHomeSetupInstructions.
  ///
  /// In en, this message translates to:
  /// **'Setup Instructions'**
  String get smartHomeSetupInstructions;

  /// No description provided for @smartHomeRequiresUmmatPlus.
  ///
  /// In en, this message translates to:
  /// **'Requires Ummat+'**
  String get smartHomeRequiresUmmatPlus;

  /// No description provided for @smartHomeTroubleshooting.
  ///
  /// In en, this message translates to:
  /// **'Troubleshooting'**
  String get smartHomeTroubleshooting;

  /// No description provided for @smartHomeTestConnection.
  ///
  /// In en, this message translates to:
  /// **'Test Connection'**
  String get smartHomeTestConnection;

  /// No description provided for @smartHomeConnectionSuccess.
  ///
  /// In en, this message translates to:
  /// **'Connected successfully'**
  String get smartHomeConnectionSuccess;

  /// No description provided for @smartHomeConnectionFailed.
  ///
  /// In en, this message translates to:
  /// **'Connection failed. Check your account link.'**
  String get smartHomeConnectionFailed;

  /// No description provided for @subscriptionTitle.
  ///
  /// In en, this message translates to:
  /// **'Ummat+'**
  String get subscriptionTitle;

  /// No description provided for @subscriptionSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Premium prayer time features'**
  String get subscriptionSubtitle;

  /// No description provided for @subscriptionUpgrade.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to Ummat+'**
  String get subscriptionUpgrade;

  /// No description provided for @subscriptionRestore.
  ///
  /// In en, this message translates to:
  /// **'Restore Purchase'**
  String get subscriptionRestore;

  /// No description provided for @subscriptionManage.
  ///
  /// In en, this message translates to:
  /// **'Manage Subscription'**
  String get subscriptionManage;

  /// No description provided for @subscriptionCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel Subscription'**
  String get subscriptionCancel;

  /// No description provided for @subscriptionActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get subscriptionActive;

  /// No description provided for @subscriptionExpired.
  ///
  /// In en, this message translates to:
  /// **'Expired'**
  String get subscriptionExpired;

  /// No description provided for @subscriptionFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get subscriptionFree;

  /// No description provided for @subscriptionFreeDesc.
  ///
  /// In en, this message translates to:
  /// **'Basic prayer times, Qibla, calendar'**
  String get subscriptionFreeDesc;

  /// No description provided for @subscriptionPlusDesc.
  ///
  /// In en, this message translates to:
  /// **'Smart home, TV display, widgets, and more'**
  String get subscriptionPlusDesc;

  /// No description provided for @subscriptionFreeQueriesRemaining.
  ///
  /// In en, this message translates to:
  /// **'{count} free queries remaining'**
  String subscriptionFreeQueriesRemaining(int count);

  /// No description provided for @subscriptionPriceYearly.
  ///
  /// In en, this message translates to:
  /// **'{price}/year'**
  String subscriptionPriceYearly(String price);

  /// No description provided for @subscriptionPriceMonthly.
  ///
  /// In en, this message translates to:
  /// **'{price}/month'**
  String subscriptionPriceMonthly(String price);

  /// No description provided for @subscriptionFeatureSmartHome.
  ///
  /// In en, this message translates to:
  /// **'Smart home integration'**
  String get subscriptionFeatureSmartHome;

  /// No description provided for @subscriptionFeatureTV.
  ///
  /// In en, this message translates to:
  /// **'TV display mode'**
  String get subscriptionFeatureTV;

  /// No description provided for @subscriptionFeatureWidgets.
  ///
  /// In en, this message translates to:
  /// **'Home screen widgets'**
  String get subscriptionFeatureWidgets;

  /// No description provided for @subscriptionFeatureWatch.
  ///
  /// In en, this message translates to:
  /// **'Watch complications'**
  String get subscriptionFeatureWatch;

  /// No description provided for @subscriptionFeatureSync.
  ///
  /// In en, this message translates to:
  /// **'Cross-device sync'**
  String get subscriptionFeatureSync;

  /// No description provided for @subscriptionFeatureAdFree.
  ///
  /// In en, this message translates to:
  /// **'Ad-free experience'**
  String get subscriptionFeatureAdFree;

  /// No description provided for @watchTitle.
  ///
  /// In en, this message translates to:
  /// **'Watch'**
  String get watchTitle;

  /// No description provided for @watchNextPrayer.
  ///
  /// In en, this message translates to:
  /// **'Next Prayer'**
  String get watchNextPrayer;

  /// No description provided for @watchAllPrayers.
  ///
  /// In en, this message translates to:
  /// **'All Prayers'**
  String get watchAllPrayers;

  /// No description provided for @watchComplication.
  ///
  /// In en, this message translates to:
  /// **'Complication'**
  String get watchComplication;

  /// No description provided for @nextPrayer.
  ///
  /// In en, this message translates to:
  /// **'Next prayer'**
  String get nextPrayer;

  /// No description provided for @allPrayers.
  ///
  /// In en, this message translates to:
  /// **'All prayers'**
  String get allPrayers;

  /// No description provided for @today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// No description provided for @tomorrow.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get tomorrow;

  /// No description provided for @thisWeek.
  ///
  /// In en, this message translates to:
  /// **'This week'**
  String get thisWeek;

  /// No description provided for @thisMonth.
  ///
  /// In en, this message translates to:
  /// **'This month'**
  String get thisMonth;

  /// No description provided for @loginCreateAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get loginCreateAccount;

  /// No description provided for @loginSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get loginSignIn;

  /// No description provided for @loginWelcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get loginWelcomeBack;

  /// No description provided for @loginJoinPrayCalc.
  ///
  /// In en, this message translates to:
  /// **'Join PrayCalc'**
  String get loginJoinPrayCalc;

  /// No description provided for @loginSyncSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sync your prayer data across devices'**
  String get loginSyncSubtitle;

  /// No description provided for @loginContinueGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get loginContinueGoogle;

  /// No description provided for @loginOr.
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get loginOr;

  /// No description provided for @loginSigningIn.
  ///
  /// In en, this message translates to:
  /// **'Signing in…'**
  String get loginSigningIn;

  /// No description provided for @loginNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Display name (optional)'**
  String get loginNameLabel;

  /// No description provided for @loginEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get loginEmailLabel;

  /// No description provided for @loginPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get loginPasswordLabel;

  /// No description provided for @loginEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get loginEmailRequired;

  /// No description provided for @loginEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address'**
  String get loginEmailInvalid;

  /// No description provided for @loginPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Password is required'**
  String get loginPasswordRequired;

  /// No description provided for @loginPasswordMinLength.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get loginPasswordMinLength;

  /// No description provided for @loginForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get loginForgotPassword;

  /// No description provided for @loginEnterEmailFirst.
  ///
  /// In en, this message translates to:
  /// **'Enter your email address first'**
  String get loginEnterEmailFirst;

  /// No description provided for @loginResetSent.
  ///
  /// In en, this message translates to:
  /// **'Password reset email sent'**
  String get loginResetSent;

  /// No description provided for @loginResetFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not send reset email'**
  String get loginResetFailed;

  /// No description provided for @loginNewToPrayCalc.
  ///
  /// In en, this message translates to:
  /// **'New to PrayCalc?'**
  String get loginNewToPrayCalc;

  /// No description provided for @loginAlreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get loginAlreadyHaveAccount;

  /// No description provided for @accountTitle.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get accountTitle;

  /// No description provided for @accountNotSignedIn.
  ///
  /// In en, this message translates to:
  /// **'Not signed in'**
  String get accountNotSignedIn;

  /// No description provided for @accountSyncSection.
  ///
  /// In en, this message translates to:
  /// **'Sync'**
  String get accountSyncSection;

  /// No description provided for @accountSyncStatus.
  ///
  /// In en, this message translates to:
  /// **'Sync status'**
  String get accountSyncStatus;

  /// No description provided for @accountSyncNow.
  ///
  /// In en, this message translates to:
  /// **'Sync now'**
  String get accountSyncNow;

  /// No description provided for @accountSyncHistory.
  ///
  /// In en, this message translates to:
  /// **'Sync history'**
  String get accountSyncHistory;

  /// No description provided for @accountNoConflicts.
  ///
  /// In en, this message translates to:
  /// **'No conflicts detected'**
  String get accountNoConflicts;

  /// No description provided for @accountConflictsResolved.
  ///
  /// In en, this message translates to:
  /// **'{count} resolved'**
  String accountConflictsResolved(int count);

  /// No description provided for @accountSyncedAgo.
  ///
  /// In en, this message translates to:
  /// **'Synced {time}'**
  String accountSyncedAgo(String time);

  /// No description provided for @accountOfflineStatus.
  ///
  /// In en, this message translates to:
  /// **'Offline. Changes saved locally.'**
  String get accountOfflineStatus;

  /// No description provided for @accountSyncErrorStatus.
  ///
  /// In en, this message translates to:
  /// **'Sync error. Will retry.'**
  String get accountSyncErrorStatus;

  /// No description provided for @accountDataSection.
  ///
  /// In en, this message translates to:
  /// **'Data'**
  String get accountDataSection;

  /// No description provided for @accountExportData.
  ///
  /// In en, this message translates to:
  /// **'Export data'**
  String get accountExportData;

  /// No description provided for @accountExportSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Download your settings and prayer logs'**
  String get accountExportSubtitle;

  /// No description provided for @accountExportFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not export data'**
  String get accountExportFailed;

  /// No description provided for @accountSignOutTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get accountSignOutTitle;

  /// No description provided for @accountSignOutBody.
  ///
  /// In en, this message translates to:
  /// **'Your local data will be kept. Sign in again to resume syncing.'**
  String get accountSignOutBody;

  /// No description provided for @accountDeleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete account'**
  String get accountDeleteAccount;

  /// No description provided for @accountDeleteSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Permanently delete your account and data'**
  String get accountDeleteSubtitle;

  /// No description provided for @accountDeleteBody.
  ///
  /// In en, this message translates to:
  /// **'This will permanently delete your account and all synced data. Your local data on this device will not be removed.\n\nThis action cannot be undone.'**
  String get accountDeleteBody;

  /// No description provided for @accountDeleted.
  ///
  /// In en, this message translates to:
  /// **'Account deleted'**
  String get accountDeleted;

  /// No description provided for @accountDeleteFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not delete account'**
  String get accountDeleteFailed;

  /// No description provided for @accountTimeJustNow.
  ///
  /// In en, this message translates to:
  /// **'just now'**
  String get accountTimeJustNow;

  /// No description provided for @accountTimeMinAgo.
  ///
  /// In en, this message translates to:
  /// **'{min}m ago'**
  String accountTimeMinAgo(int min);

  /// No description provided for @accountTimeHourAgo.
  ///
  /// In en, this message translates to:
  /// **'{hour}h ago'**
  String accountTimeHourAgo(int hour);

  /// No description provided for @accountTimeDayAgo.
  ///
  /// In en, this message translates to:
  /// **'{day}d ago'**
  String accountTimeDayAgo(int day);

  /// No description provided for @statsTitle.
  ///
  /// In en, this message translates to:
  /// **'Prayer Statistics'**
  String get statsTitle;

  /// No description provided for @statsShareTooltip.
  ///
  /// In en, this message translates to:
  /// **'Share stats'**
  String get statsShareTooltip;

  /// No description provided for @statsTodayPrayers.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Prayers'**
  String get statsTodayPrayers;

  /// No description provided for @statsTodayCount.
  ///
  /// In en, this message translates to:
  /// **'{done} / 5'**
  String statsTodayCount(int done);

  /// No description provided for @statsStreak.
  ///
  /// In en, this message translates to:
  /// **'Streak'**
  String get statsStreak;

  /// No description provided for @statsDays.
  ///
  /// In en, this message translates to:
  /// **'days'**
  String get statsDays;

  /// No description provided for @statsThisWeek.
  ///
  /// In en, this message translates to:
  /// **'This Week'**
  String get statsThisWeek;

  /// No description provided for @statsCompletion.
  ///
  /// In en, this message translates to:
  /// **'completion'**
  String get statsCompletion;

  /// No description provided for @statsThisMonth.
  ///
  /// In en, this message translates to:
  /// **'This Month'**
  String get statsThisMonth;

  /// No description provided for @statsMostMissed.
  ///
  /// In en, this message translates to:
  /// **'Most Missed'**
  String get statsMostMissed;

  /// No description provided for @statsThisWeekLabel.
  ///
  /// In en, this message translates to:
  /// **'this week'**
  String get statsThisWeekLabel;

  /// No description provided for @statsWeeklyChart.
  ///
  /// In en, this message translates to:
  /// **'Weekly Completion by Prayer'**
  String get statsWeeklyChart;

  /// No description provided for @statsMonthlyChart.
  ///
  /// In en, this message translates to:
  /// **'Monthly Completion by Prayer'**
  String get statsMonthlyChart;

  /// No description provided for @statsTotalLogged.
  ///
  /// In en, this message translates to:
  /// **'{count} total prayers logged'**
  String statsTotalLogged(int count);

  /// No description provided for @statsKeepItUp.
  ///
  /// In en, this message translates to:
  /// **'Keep it up!'**
  String get statsKeepItUp;

  /// No description provided for @statsShareTitle.
  ///
  /// In en, this message translates to:
  /// **'PrayCalc Prayer Statistics'**
  String get statsShareTitle;

  /// No description provided for @statsShareStreak.
  ///
  /// In en, this message translates to:
  /// **'Streak: {days} days'**
  String statsShareStreak(int days);

  /// No description provided for @statsShareWeekly.
  ///
  /// In en, this message translates to:
  /// **'Weekly: {pct}%'**
  String statsShareWeekly(int pct);

  /// No description provided for @statsShareMonthly.
  ///
  /// In en, this message translates to:
  /// **'Monthly: {pct}%'**
  String statsShareMonthly(int pct);

  /// No description provided for @statsShareBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Weekly breakdown:'**
  String get statsShareBreakdown;

  /// No description provided for @statsHeatmapTitle.
  ///
  /// In en, this message translates to:
  /// **'Year at a Glance'**
  String get statsHeatmapTitle;

  /// No description provided for @statsHeatmapNoData.
  ///
  /// In en, this message translates to:
  /// **'No prayers logged for this day'**
  String get statsHeatmapNoData;

  /// No description provided for @statsHeatmapDetail.
  ///
  /// In en, this message translates to:
  /// **'{count} / 5 prayers completed'**
  String statsHeatmapDetail(int count);

  /// No description provided for @statsDailyGoalTitle.
  ///
  /// In en, this message translates to:
  /// **'Daily Prayer Goal'**
  String get statsDailyGoalTitle;

  /// No description provided for @statsDailyGoalLabel.
  ///
  /// In en, this message translates to:
  /// **'{goal} prayers / day'**
  String statsDailyGoalLabel(int goal);

  /// No description provided for @statsGoalStreak.
  ///
  /// In en, this message translates to:
  /// **'Goal Streak'**
  String get statsGoalStreak;

  /// No description provided for @statsBestStreak.
  ///
  /// In en, this message translates to:
  /// **'Best Streak'**
  String get statsBestStreak;

  /// No description provided for @aboutTitle.
  ///
  /// In en, this message translates to:
  /// **'About PrayCalc'**
  String get aboutTitle;

  /// No description provided for @aboutWebsite.
  ///
  /// In en, this message translates to:
  /// **'Website'**
  String get aboutWebsite;

  /// No description provided for @aboutContact.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get aboutContact;

  /// No description provided for @aboutLicenses.
  ///
  /// In en, this message translates to:
  /// **'Open Source Licenses'**
  String get aboutLicenses;

  /// No description provided for @aboutCouldNotOpen.
  ///
  /// In en, this message translates to:
  /// **'Could not open the link.'**
  String get aboutCouldNotOpen;

  /// No description provided for @aboutCopyright.
  ///
  /// In en, this message translates to:
  /// **'© {year} Ummat Dev. All rights reserved.\n\nPrayer times calculated using the pray_calc_dart engine. Accuracy depends on your GPS location and selected calculation method.'**
  String aboutCopyright(int year);

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @commonEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// No description provided for @commonRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonRetry;

  /// No description provided for @commonClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// No description provided for @commonDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get commonDone;

  /// No description provided for @commonBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonBack;

  /// No description provided for @commonNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get commonNext;

  /// No description provided for @commonSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get commonSkip;

  /// No description provided for @commonContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get commonContinue;

  /// No description provided for @commonOk.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get commonOk;

  /// No description provided for @commonYes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get commonYes;

  /// No description provided for @commonNo.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get commonNo;

  /// No description provided for @commonShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get commonShare;

  /// No description provided for @commonCopy.
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get commonCopy;

  /// No description provided for @commonCopied.
  ///
  /// In en, this message translates to:
  /// **'Copied to clipboard'**
  String get commonCopied;

  /// No description provided for @commonLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get commonLoading;

  /// No description provided for @commonError.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get commonError;

  /// No description provided for @commonErrorRetry.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Tap to retry.'**
  String get commonErrorRetry;

  /// No description provided for @commonNoInternet.
  ///
  /// In en, this message translates to:
  /// **'No internet connection'**
  String get commonNoInternet;

  /// No description provided for @commonOfflineMode.
  ///
  /// In en, this message translates to:
  /// **'Offline mode'**
  String get commonOfflineMode;

  /// No description provided for @commonSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get commonSignIn;

  /// No description provided for @commonSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get commonSignOut;

  /// No description provided for @commonSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get commonSignUp;

  /// No description provided for @commonProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get commonProfile;

  /// No description provided for @commonAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get commonAccount;

  /// No description provided for @commonAbout.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get commonAbout;

  /// No description provided for @commonVersion.
  ///
  /// In en, this message translates to:
  /// **'Version {version}'**
  String commonVersion(String version);

  /// No description provided for @commonPrivacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get commonPrivacyPolicy;

  /// No description provided for @commonTermsOfService.
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get commonTermsOfService;

  /// No description provided for @commonRateApp.
  ///
  /// In en, this message translates to:
  /// **'Rate this app'**
  String get commonRateApp;

  /// No description provided for @commonFeedback.
  ///
  /// In en, this message translates to:
  /// **'Send feedback'**
  String get commonFeedback;

  /// No description provided for @commonHelp.
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get commonHelp;

  /// No description provided for @commonLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get commonLanguage;

  /// No description provided for @commonOpenSettings.
  ///
  /// In en, this message translates to:
  /// **'Open Settings'**
  String get commonOpenSettings;

  /// No description provided for @travelNotificationTitle.
  ///
  /// In en, this message translates to:
  /// **'You are now traveling'**
  String get travelNotificationTitle;

  /// No description provided for @travelNotificationBody.
  ///
  /// In en, this message translates to:
  /// **'Prayer times may be shortened. Tap to learn about travel rulings.'**
  String get travelNotificationBody;

  /// No description provided for @travelRulingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Travel & Prayer'**
  String get travelRulingsTitle;

  /// No description provided for @travelRulingsIntro.
  ///
  /// In en, this message translates to:
  /// **'Islamic rulings on prayer while traveling, with scholarly references from the Quran and authentic Hadith collections.'**
  String get travelRulingsIntro;

  /// No description provided for @travelWhenTitle.
  ///
  /// In en, this message translates to:
  /// **'When Does Travel Apply?'**
  String get travelWhenTitle;

  /// No description provided for @travelQasrTitle.
  ///
  /// In en, this message translates to:
  /// **'Shortening Prayers (Qasr)'**
  String get travelQasrTitle;

  /// No description provided for @travelJamTitle.
  ///
  /// In en, this message translates to:
  /// **'Combining Prayers (Jam\')'**
  String get travelJamTitle;

  /// No description provided for @travelDurationTitle.
  ///
  /// In en, this message translates to:
  /// **'Duration of Travel'**
  String get travelDurationTitle;

  /// No description provided for @travelReferencesTitle.
  ///
  /// In en, this message translates to:
  /// **'Scholarly References'**
  String get travelReferencesTitle;

  /// No description provided for @travelLearnMore.
  ///
  /// In en, this message translates to:
  /// **'Learn more'**
  String get travelLearnMore;

  /// No description provided for @travelHanafiDefaultTitle.
  ///
  /// In en, this message translates to:
  /// **'Why PrayCalc Uses the Hanafi Default'**
  String get travelHanafiDefaultTitle;

  /// No description provided for @travelDeeperScholarly.
  ///
  /// In en, this message translates to:
  /// **'Deeper Scholarly Discussion'**
  String get travelDeeperScholarly;

  /// No description provided for @onboardingTitle1.
  ///
  /// In en, this message translates to:
  /// **'Prayer times, wherever you are'**
  String get onboardingTitle1;

  /// No description provided for @onboardingBody1.
  ///
  /// In en, this message translates to:
  /// **'GPS-accurate salah times for every city on earth. Fajr to Isha, sunrise to Qiyam. Powered by our own calculation engine, built for precision.'**
  String get onboardingBody1;

  /// No description provided for @onboardingTitle2.
  ///
  /// In en, this message translates to:
  /// **'Your location, your times'**
  String get onboardingTitle2;

  /// No description provided for @onboardingBody2.
  ///
  /// In en, this message translates to:
  /// **'Search any city or let GPS detect your location. PrayCalc finds times for 5 million cities worldwide.'**
  String get onboardingBody2;

  /// No description provided for @onboardingTitle3.
  ///
  /// In en, this message translates to:
  /// **'Never miss a prayer'**
  String get onboardingTitle3;

  /// No description provided for @onboardingBody3.
  ///
  /// In en, this message translates to:
  /// **'Adhan at prayer time, reminders before it. Custom agendas for Suhoor, classes, and more.'**
  String get onboardingBody3;

  /// No description provided for @onboardingTitle4.
  ///
  /// In en, this message translates to:
  /// **'Everything you need'**
  String get onboardingTitle4;

  /// No description provided for @onboardingBody4.
  ///
  /// In en, this message translates to:
  /// **'Qibla compass, prayer calendar, Hijri moon phase, Tasbeeh counter. All in one place.'**
  String get onboardingBody4;

  /// No description provided for @onboardingSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get onboardingSkip;

  /// No description provided for @onboardingGetStarted.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get onboardingGetStarted;

  /// No description provided for @onboardingSignInTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in to PrayCalc'**
  String get onboardingSignInTitle;

  /// No description provided for @onboardingSignInSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Save your prayer history and sync\nacross all your devices.'**
  String get onboardingSignInSubtitle;

  /// No description provided for @onboardingContinueGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get onboardingContinueGoogle;

  /// No description provided for @onboardingContinueWithoutAccount.
  ///
  /// In en, this message translates to:
  /// **'Continue without account'**
  String get onboardingContinueWithoutAccount;

  /// No description provided for @onboardingSigningIn.
  ///
  /// In en, this message translates to:
  /// **'Signing in…'**
  String get onboardingSigningIn;

  /// No description provided for @onboardingSelectLanguage.
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get onboardingSelectLanguage;

  /// No description provided for @duaDhikrTitle.
  ///
  /// In en, this message translates to:
  /// **'Dua & Dhikr'**
  String get duaDhikrTitle;

  /// No description provided for @duaDhikrTabDua.
  ///
  /// In en, this message translates to:
  /// **'Duas'**
  String get duaDhikrTabDua;

  /// No description provided for @duaDhikrTabDhikr.
  ///
  /// In en, this message translates to:
  /// **'Dhikr'**
  String get duaDhikrTabDhikr;

  /// No description provided for @duaDhikrTabTasbeeh.
  ///
  /// In en, this message translates to:
  /// **'Tasbeeh'**
  String get duaDhikrTabTasbeeh;

  /// No description provided for @duaDhikrTabMorning.
  ///
  /// In en, this message translates to:
  /// **'Morning'**
  String get duaDhikrTabMorning;

  /// No description provided for @duaDhikrTabEvening.
  ///
  /// In en, this message translates to:
  /// **'Evening'**
  String get duaDhikrTabEvening;

  /// No description provided for @duaDhikrMorningAdhkar.
  ///
  /// In en, this message translates to:
  /// **'Morning Adhkar'**
  String get duaDhikrMorningAdhkar;

  /// No description provided for @duaDhikrEveningAdhkar.
  ///
  /// In en, this message translates to:
  /// **'Evening Adhkar'**
  String get duaDhikrEveningAdhkar;

  /// No description provided for @calGregToggle.
  ///
  /// In en, this message translates to:
  /// **'Greg'**
  String get calGregToggle;

  /// No description provided for @calHijriToggle.
  ///
  /// In en, this message translates to:
  /// **'Hijri'**
  String get calHijriToggle;

  /// No description provided for @calYearlyTooltip.
  ///
  /// In en, this message translates to:
  /// **'Yearly calendar'**
  String get calYearlyTooltip;

  /// No description provided for @calExportIcsTooltip.
  ///
  /// In en, this message translates to:
  /// **'Export .ics'**
  String get calExportIcsTooltip;

  /// No description provided for @calMagCol.
  ///
  /// In en, this message translates to:
  /// **'Mag'**
  String get calMagCol;

  /// No description provided for @qiblaShowOnMap.
  ///
  /// In en, this message translates to:
  /// **'Show on map'**
  String get qiblaShowOnMap;

  /// No description provided for @qiblaWaitingCompass.
  ///
  /// In en, this message translates to:
  /// **'Waiting for compass...'**
  String get qiblaWaitingCompass;

  /// No description provided for @qiblaNoCompassSensor.
  ///
  /// In en, this message translates to:
  /// **'No compass sensor. Showing Qibla direction statically.'**
  String get qiblaNoCompassSensor;

  /// No description provided for @qiblaAccuracyExcellent.
  ///
  /// In en, this message translates to:
  /// **'Excellent accuracy'**
  String get qiblaAccuracyExcellent;

  /// No description provided for @qiblaAccuracyGood.
  ///
  /// In en, this message translates to:
  /// **'Good accuracy'**
  String get qiblaAccuracyGood;

  /// No description provided for @qiblaAccuracyFair.
  ///
  /// In en, this message translates to:
  /// **'Fair accuracy. Calibrate by moving phone in figure-8.'**
  String get qiblaAccuracyFair;

  /// No description provided for @qiblaAccuracyLow.
  ///
  /// In en, this message translates to:
  /// **'Low accuracy. Calibrate by moving phone in figure-8.'**
  String get qiblaAccuracyLow;

  /// No description provided for @qiblaToTheKaaba.
  ///
  /// In en, this message translates to:
  /// **'to the Kaaba'**
  String get qiblaToTheKaaba;

  /// No description provided for @qiblaYourLocation.
  ///
  /// In en, this message translates to:
  /// **'Your location'**
  String get qiblaYourLocation;

  /// No description provided for @qiblaGpsAccurate.
  ///
  /// In en, this message translates to:
  /// **'GPS-accurate'**
  String get qiblaGpsAccurate;

  /// No description provided for @qiblaCityCenter.
  ///
  /// In en, this message translates to:
  /// **'City center'**
  String get qiblaCityCenter;

  /// No description provided for @moonIlluminatedLabel.
  ///
  /// In en, this message translates to:
  /// **'Illuminated'**
  String get moonIlluminatedLabel;

  /// No description provided for @moonAgeLabel.
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get moonAgeLabel;

  /// No description provided for @moonFirstQtr.
  ///
  /// In en, this message translates to:
  /// **'First Qtr'**
  String get moonFirstQtr;

  /// No description provided for @moonLastQtr.
  ///
  /// In en, this message translates to:
  /// **'Last Qtr'**
  String get moonLastQtr;

  /// No description provided for @moonTonight.
  ///
  /// In en, this message translates to:
  /// **'Tonight'**
  String get moonTonight;

  /// No description provided for @moonTomorrow.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get moonTomorrow;

  /// No description provided for @moonDaysAway.
  ///
  /// In en, this message translates to:
  /// **'{days}d'**
  String moonDaysAway(int days);

  /// No description provided for @moonBeta.
  ///
  /// In en, this message translates to:
  /// **'Beta'**
  String get moonBeta;

  /// No description provided for @setHomeTitle.
  ///
  /// In en, this message translates to:
  /// **'Set Home Location'**
  String get setHomeTitle;

  /// No description provided for @setHomeSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search city, town or zip…'**
  String get setHomeSearchHint;

  /// No description provided for @setHomeClear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get setHomeClear;

  /// No description provided for @setHomeUseCurrentLocation.
  ///
  /// In en, this message translates to:
  /// **'Use Current Location'**
  String get setHomeUseCurrentLocation;

  /// No description provided for @setHomeDetectAndSet.
  ///
  /// In en, this message translates to:
  /// **'Detect your location and set it as home'**
  String get setHomeDetectAndSet;

  /// No description provided for @setHomeAlreadySet.
  ///
  /// In en, this message translates to:
  /// **'Home already set'**
  String get setHomeAlreadySet;

  /// No description provided for @setHomeSetAs.
  ///
  /// In en, this message translates to:
  /// **'{city} set as home'**
  String setHomeSetAs(String city);

  /// No description provided for @setHomeCurrentLocationSet.
  ///
  /// In en, this message translates to:
  /// **'Current location set as home'**
  String get setHomeCurrentLocationSet;

  /// No description provided for @setHomePermissionDenied.
  ///
  /// In en, this message translates to:
  /// **'Location permission denied. Search for a city below.'**
  String get setHomePermissionDenied;

  /// No description provided for @setHomeGpsUnavailable.
  ///
  /// In en, this message translates to:
  /// **'GPS unavailable. Search manually.'**
  String get setHomeGpsUnavailable;

  /// No description provided for @setHomeNoCitiesFound.
  ///
  /// In en, this message translates to:
  /// **'No cities found.'**
  String get setHomeNoCitiesFound;

  /// No description provided for @setHomeSearchPrompt.
  ///
  /// In en, this message translates to:
  /// **'Search for your home city'**
  String get setHomeSearchPrompt;

  /// No description provided for @setHomeSearchBody.
  ///
  /// In en, this message translates to:
  /// **'Type above to search, or use your current location. Travel mode will detect when you are away from home.'**
  String get setHomeSearchBody;

  /// No description provided for @subscriptionYouHavePlus.
  ///
  /// In en, this message translates to:
  /// **'You have Ummat+'**
  String get subscriptionYouHavePlus;

  /// No description provided for @subscriptionUpgradeTo.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to Ummat+'**
  String get subscriptionUpgradeTo;

  /// No description provided for @subscriptionThankYou.
  ///
  /// In en, this message translates to:
  /// **'Thank you for supporting PrayCalc.'**
  String get subscriptionThankYou;

  /// No description provided for @subscriptionUnlockPremium.
  ///
  /// In en, this message translates to:
  /// **'Unlock premium features across all your devices.'**
  String get subscriptionUnlockPremium;

  /// No description provided for @subscriptionManageSub.
  ///
  /// In en, this message translates to:
  /// **'Manage subscription'**
  String get subscriptionManageSub;

  /// No description provided for @subscriptionWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome to Ummat+!'**
  String get subscriptionWelcome;

  /// No description provided for @subscriptionSubscribe.
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get subscriptionSubscribe;

  /// No description provided for @subscriptionFreeFeatures.
  ///
  /// In en, this message translates to:
  /// **'Free Features'**
  String get subscriptionFreeFeatures;

  /// No description provided for @subscriptionPlusFeatures.
  ///
  /// In en, this message translates to:
  /// **'Ummat+ Features'**
  String get subscriptionPlusFeatures;

  /// No description provided for @subscriptionFeaturePrayerTimes.
  ///
  /// In en, this message translates to:
  /// **'Prayer times'**
  String get subscriptionFeaturePrayerTimes;

  /// No description provided for @subscriptionFeatureQibla.
  ///
  /// In en, this message translates to:
  /// **'Qibla compass'**
  String get subscriptionFeatureQibla;

  /// No description provided for @subscriptionFeatureCalendar.
  ///
  /// In en, this message translates to:
  /// **'Monthly calendar'**
  String get subscriptionFeatureCalendar;

  /// No description provided for @subscriptionFeatureTasbeeh.
  ///
  /// In en, this message translates to:
  /// **'Tasbeeh counter'**
  String get subscriptionFeatureTasbeeh;

  /// No description provided for @subscriptionFeatureMoon.
  ///
  /// In en, this message translates to:
  /// **'Moon & Hijri'**
  String get subscriptionFeatureMoon;

  /// No description provided for @smartHomeAlertType.
  ///
  /// In en, this message translates to:
  /// **'Alert Type'**
  String get smartHomeAlertType;

  /// No description provided for @smartHomeAlertModal.
  ///
  /// In en, this message translates to:
  /// **'Full-screen modal'**
  String get smartHomeAlertModal;

  /// No description provided for @smartHomeAlertCorner.
  ///
  /// In en, this message translates to:
  /// **'Corner notification'**
  String get smartHomeAlertCorner;

  /// No description provided for @smartHomeAlertNone.
  ///
  /// In en, this message translates to:
  /// **'None (silent)'**
  String get smartHomeAlertNone;

  /// No description provided for @smartHomePauseMedia.
  ///
  /// In en, this message translates to:
  /// **'Pause media during adhan'**
  String get smartHomePauseMedia;

  /// No description provided for @smartHomeQuietHours.
  ///
  /// In en, this message translates to:
  /// **'Quiet hours'**
  String get smartHomeQuietHours;

  /// No description provided for @smartHomeQuietFrom.
  ///
  /// In en, this message translates to:
  /// **'From'**
  String get smartHomeQuietFrom;

  /// No description provided for @smartHomeQuietTo.
  ///
  /// In en, this message translates to:
  /// **'To'**
  String get smartHomeQuietTo;

  /// No description provided for @smartHomePrayerAudio.
  ///
  /// In en, this message translates to:
  /// **'Per-prayer audio'**
  String get smartHomePrayerAudio;

  /// No description provided for @smartHomeAudioAdhan.
  ///
  /// In en, this message translates to:
  /// **'Adhan'**
  String get smartHomeAudioAdhan;

  /// No description provided for @smartHomeAudioBeep.
  ///
  /// In en, this message translates to:
  /// **'Beep'**
  String get smartHomeAudioBeep;

  /// No description provided for @smartHomeAudioSilent.
  ///
  /// In en, this message translates to:
  /// **'Silent'**
  String get smartHomeAudioSilent;

  /// No description provided for @aboutPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get aboutPrivacy;

  /// No description provided for @aboutVersion.
  ///
  /// In en, this message translates to:
  /// **'Version {version}'**
  String aboutVersion(String version);

  /// No description provided for @notifDefaultAdhan.
  ///
  /// In en, this message translates to:
  /// **'Default Adhan'**
  String get notifDefaultAdhan;

  /// No description provided for @notifFajrAdhan.
  ///
  /// In en, this message translates to:
  /// **'Fajr Adhan'**
  String get notifFajrAdhan;

  /// No description provided for @notifFajrAdhanSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Played at Fajr prayer time'**
  String get notifFajrAdhanSubtitle;

  /// No description provided for @notifRegularAdhan.
  ///
  /// In en, this message translates to:
  /// **'Regular Adhan'**
  String get notifRegularAdhan;

  /// No description provided for @notifRegularAdhanSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Played at Dhuhr, Asr, Maghrib, Isha'**
  String get notifRegularAdhanSubtitle;

  /// No description provided for @notifPerPrayerSettings.
  ///
  /// In en, this message translates to:
  /// **'Per-Prayer Settings'**
  String get notifPerPrayerSettings;

  /// No description provided for @notifPreview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get notifPreview;

  /// No description provided for @tvSettingsTitle.
  ///
  /// In en, this message translates to:
  /// **'TV Settings'**
  String get tvSettingsTitle;

  /// No description provided for @tvDisplayMode.
  ///
  /// In en, this message translates to:
  /// **'Display Mode'**
  String get tvDisplayMode;

  /// No description provided for @tvMasjidMode.
  ///
  /// In en, this message translates to:
  /// **'Masjid Mode'**
  String get tvMasjidMode;

  /// No description provided for @tvMasjidModeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Large signage display with iqamah times'**
  String get tvMasjidModeSubtitle;

  /// No description provided for @tvMasjidName.
  ///
  /// In en, this message translates to:
  /// **'Masjid Name'**
  String get tvMasjidName;

  /// No description provided for @tvMasjidNameTapToSet.
  ///
  /// In en, this message translates to:
  /// **'Tap to set'**
  String get tvMasjidNameTapToSet;

  /// No description provided for @tvClock.
  ///
  /// In en, this message translates to:
  /// **'Clock'**
  String get tvClock;

  /// No description provided for @tv24hFormat.
  ///
  /// In en, this message translates to:
  /// **'24-hour format'**
  String get tv24hFormat;

  /// No description provided for @tvIqamahOffsets.
  ///
  /// In en, this message translates to:
  /// **'Iqamah Offsets (minutes after adhan)'**
  String get tvIqamahOffsets;

  /// No description provided for @tvIqamahMinAfter.
  ///
  /// In en, this message translates to:
  /// **'{offset} min after adhan'**
  String tvIqamahMinAfter(int offset);

  /// No description provided for @tvQrCode.
  ///
  /// In en, this message translates to:
  /// **'QR Code'**
  String get tvQrCode;

  /// No description provided for @tvShowQrCode.
  ///
  /// In en, this message translates to:
  /// **'Show QR Code'**
  String get tvShowQrCode;

  /// No description provided for @tvShowQrCodeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Display a QR code on the masjid screen'**
  String get tvShowQrCodeSubtitle;

  /// No description provided for @tvQrCodeUrl.
  ///
  /// In en, this message translates to:
  /// **'QR Code URL'**
  String get tvQrCodeUrl;

  /// No description provided for @tvAmbientModeSection.
  ///
  /// In en, this message translates to:
  /// **'Ambient Mode'**
  String get tvAmbientModeSection;

  /// No description provided for @tvIdleTimeout.
  ///
  /// In en, this message translates to:
  /// **'Idle timeout'**
  String get tvIdleTimeout;

  /// No description provided for @tvIdleTimeoutSubtitle.
  ///
  /// In en, this message translates to:
  /// **'{minutes} minutes before ambient activates'**
  String tvIdleTimeoutSubtitle(int minutes);

  /// No description provided for @tvPhotoInterval.
  ///
  /// In en, this message translates to:
  /// **'Photo interval'**
  String get tvPhotoInterval;

  /// No description provided for @tvPhotoIntervalSubtitle.
  ///
  /// In en, this message translates to:
  /// **'{seconds} seconds between photos'**
  String tvPhotoIntervalSubtitle(int seconds);

  /// No description provided for @tvBackground.
  ///
  /// In en, this message translates to:
  /// **'Background'**
  String get tvBackground;

  /// No description provided for @tvPhotoCategory.
  ///
  /// In en, this message translates to:
  /// **'Photo category'**
  String get tvPhotoCategory;

  /// No description provided for @tvLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get tvLocation;

  /// No description provided for @tvChangeCity.
  ///
  /// In en, this message translates to:
  /// **'Change City'**
  String get tvChangeCity;

  /// No description provided for @tvChangeCitySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Search for a different city'**
  String get tvChangeCitySubtitle;

  /// No description provided for @tvScreensaverBg.
  ///
  /// In en, this message translates to:
  /// **'Screensaver Background'**
  String get tvScreensaverBg;

  /// No description provided for @tvScreensaverPhotos.
  ///
  /// In en, this message translates to:
  /// **'Photos'**
  String get tvScreensaverPhotos;

  /// No description provided for @tvScreensaverPattern.
  ///
  /// In en, this message translates to:
  /// **'Geometric pattern'**
  String get tvScreensaverPattern;

  /// No description provided for @tvScreensaverBoth.
  ///
  /// In en, this message translates to:
  /// **'Photos + pattern'**
  String get tvScreensaverBoth;

  /// No description provided for @tvCategoryAll.
  ///
  /// In en, this message translates to:
  /// **'All categories'**
  String get tvCategoryAll;

  /// No description provided for @tvCategoryMasjids.
  ///
  /// In en, this message translates to:
  /// **'Masjids'**
  String get tvCategoryMasjids;

  /// No description provided for @tvCategoryInteriors.
  ///
  /// In en, this message translates to:
  /// **'Interiors'**
  String get tvCategoryInteriors;

  /// No description provided for @tvCategoryGeometric.
  ///
  /// In en, this message translates to:
  /// **'Geometric'**
  String get tvCategoryGeometric;

  /// No description provided for @tvCategoryCalligraphy.
  ///
  /// In en, this message translates to:
  /// **'Calligraphy'**
  String get tvCategoryCalligraphy;

  /// No description provided for @tvCategoryLandscapes.
  ///
  /// In en, this message translates to:
  /// **'Landscapes'**
  String get tvCategoryLandscapes;

  /// No description provided for @tvCategoryRamadan.
  ///
  /// In en, this message translates to:
  /// **'Ramadan'**
  String get tvCategoryRamadan;

  /// No description provided for @tvPhotoCategoryTitle.
  ///
  /// In en, this message translates to:
  /// **'Photo Category'**
  String get tvPhotoCategoryTitle;

  /// No description provided for @tvEnterHint.
  ///
  /// In en, this message translates to:
  /// **'Enter {title}'**
  String tvEnterHint(String title);

  /// No description provided for @tvSystemDefault.
  ///
  /// In en, this message translates to:
  /// **'System default'**
  String get tvSystemDefault;

  /// No description provided for @smartHomeIntegrations.
  ///
  /// In en, this message translates to:
  /// **'Integrations'**
  String get smartHomeIntegrations;

  /// No description provided for @smartHomeLinkedSpeakers.
  ///
  /// In en, this message translates to:
  /// **'Linked Speakers & Displays'**
  String get smartHomeLinkedSpeakers;

  /// No description provided for @smartHomeAlertDisplay.
  ///
  /// In en, this message translates to:
  /// **'Alert Display'**
  String get smartHomeAlertDisplay;

  /// No description provided for @smartHomeAtAdhanShow.
  ///
  /// In en, this message translates to:
  /// **'At adhan time show'**
  String get smartHomeAtAdhanShow;

  /// No description provided for @smartHomePauseMediaTitle.
  ///
  /// In en, this message translates to:
  /// **'Pause media at adhan'**
  String get smartHomePauseMediaTitle;

  /// No description provided for @smartHomePauseMediaSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Resumes after the adhan ends'**
  String get smartHomePauseMediaSubtitle;

  /// No description provided for @smartHomePrayerAudioSection.
  ///
  /// In en, this message translates to:
  /// **'Prayer Audio'**
  String get smartHomePrayerAudioSection;

  /// No description provided for @smartHomeQuietHoursSection.
  ///
  /// In en, this message translates to:
  /// **'Quiet Hours'**
  String get smartHomeQuietHoursSection;

  /// No description provided for @smartHomeEnableQuietHours.
  ///
  /// In en, this message translates to:
  /// **'Enable quiet hours'**
  String get smartHomeEnableQuietHours;

  /// No description provided for @smartHomeQuietHoursSubtitle.
  ///
  /// In en, this message translates to:
  /// **'All smart home alerts are silenced'**
  String get smartHomeQuietHoursSubtitle;

  /// No description provided for @smartHomeNoDevices.
  ///
  /// In en, this message translates to:
  /// **'No devices linked yet'**
  String get smartHomeNoDevices;

  /// No description provided for @smartHomeNoDevicesDesc.
  ///
  /// In en, this message translates to:
  /// **'Link Google Home or Alexa above, then your speakers and displays will appear here.'**
  String get smartHomeNoDevicesDesc;

  /// No description provided for @smartHomeRequiresPlus.
  ///
  /// In en, this message translates to:
  /// **'Smart Home requires Ummat+'**
  String get smartHomeRequiresPlus;

  /// No description provided for @smartHomeRequiresPlusDesc.
  ///
  /// In en, this message translates to:
  /// **'Control prayer announcements on Google Home, Alexa, Siri, and Home Assistant. Configure which devices play adhan, when to pause media, and set quiet hours.'**
  String get smartHomeRequiresPlusDesc;

  /// No description provided for @smartHomeBroadcastGoogle.
  ///
  /// In en, this message translates to:
  /// **'Broadcast adhan on Nest speakers and displays.'**
  String get smartHomeBroadcastGoogle;

  /// No description provided for @smartHomeEnableAlexa.
  ///
  /// In en, this message translates to:
  /// **'Enable the PrayCalc skill on Alexa.'**
  String get smartHomeEnableAlexa;

  /// No description provided for @smartHomeSiriAsk.
  ///
  /// In en, this message translates to:
  /// **'Ask Siri for prayer times or set automations.'**
  String get smartHomeSiriAsk;

  /// No description provided for @smartHomeHassAdd.
  ///
  /// In en, this message translates to:
  /// **'Add via HACS for full automation support.'**
  String get smartHomeHassAdd;

  /// No description provided for @smartHomeSetupGuide.
  ///
  /// In en, this message translates to:
  /// **'Setup guide'**
  String get smartHomeSetupGuide;

  /// No description provided for @smartHomeSiriSetupTitle.
  ///
  /// In en, this message translates to:
  /// **'Siri Shortcuts Setup'**
  String get smartHomeSiriSetupTitle;

  /// No description provided for @smartHomeSiriStep1.
  ///
  /// In en, this message translates to:
  /// **'Open the Shortcuts app on your iPhone or iPad.'**
  String get smartHomeSiriStep1;

  /// No description provided for @smartHomeSiriStep2.
  ///
  /// In en, this message translates to:
  /// **'Tap \"+\" to create a new shortcut.'**
  String get smartHomeSiriStep2;

  /// No description provided for @smartHomeSiriStep3.
  ///
  /// In en, this message translates to:
  /// **'Search for \"PrayCalc\" in the actions list.'**
  String get smartHomeSiriStep3;

  /// No description provided for @smartHomeSiriStep4.
  ///
  /// In en, this message translates to:
  /// **'Add \"Next Prayer Time\" or \"Prayer Times Today\".'**
  String get smartHomeSiriStep4;

  /// No description provided for @smartHomeSiriStep5.
  ///
  /// In en, this message translates to:
  /// **'Optionally add it to an automation (e.g. daily at Fajr).'**
  String get smartHomeSiriStep5;

  /// No description provided for @smartHomeSiriStep6.
  ///
  /// In en, this message translates to:
  /// **'Say \"Hey Siri, next prayer time\" to test.'**
  String get smartHomeSiriStep6;

  /// No description provided for @smartHomeSiriFootnote.
  ///
  /// In en, this message translates to:
  /// **'Requires iOS 16 or later.'**
  String get smartHomeSiriFootnote;

  /// No description provided for @smartHomeHassSetupTitle.
  ///
  /// In en, this message translates to:
  /// **'Home Assistant Setup'**
  String get smartHomeHassSetupTitle;

  /// No description provided for @smartHomeHassStep1.
  ///
  /// In en, this message translates to:
  /// **'Install HACS (Home Assistant Community Store).'**
  String get smartHomeHassStep1;

  /// No description provided for @smartHomeHassStep2.
  ///
  /// In en, this message translates to:
  /// **'In HACS, search for \"PrayCalc\" and install.'**
  String get smartHomeHassStep2;

  /// No description provided for @smartHomeHassStep3.
  ///
  /// In en, this message translates to:
  /// **'Go to Settings > Devices & Services > Add Integration.'**
  String get smartHomeHassStep3;

  /// No description provided for @smartHomeHassStep4.
  ///
  /// In en, this message translates to:
  /// **'Search for \"PrayCalc\" and select it.'**
  String get smartHomeHassStep4;

  /// No description provided for @smartHomeHassStep5.
  ///
  /// In en, this message translates to:
  /// **'Enter your PrayCalc API key (generated in your account).'**
  String get smartHomeHassStep5;

  /// No description provided for @smartHomeHassStep6.
  ///
  /// In en, this message translates to:
  /// **'Configure your location and calculation method.'**
  String get smartHomeHassStep6;

  /// No description provided for @smartHomeHassFootnote.
  ///
  /// In en, this message translates to:
  /// **'Requires Home Assistant 2024.1+ with HACS.'**
  String get smartHomeHassFootnote;

  /// No description provided for @smartHomeApiKey.
  ///
  /// In en, this message translates to:
  /// **'API Key'**
  String get smartHomeApiKey;

  /// No description provided for @smartHomeGenerateApiKey.
  ///
  /// In en, this message translates to:
  /// **'Generate API Key'**
  String get smartHomeGenerateApiKey;

  /// No description provided for @smartHomeApiKeyNotReady.
  ///
  /// In en, this message translates to:
  /// **'API key generation will be available once the PrayCalc smart service is deployed.'**
  String get smartHomeApiKeyNotReady;

  /// No description provided for @smartHomeApiKeyDesc.
  ///
  /// In en, this message translates to:
  /// **'You will need an API key to connect Home Assistant to your PrayCalc account.'**
  String get smartHomeApiKeyDesc;

  /// No description provided for @smartHomeLinkedStatus.
  ///
  /// In en, this message translates to:
  /// **'Linked'**
  String get smartHomeLinkedStatus;

  /// No description provided for @smartHomeNotLinkedStatus.
  ///
  /// In en, this message translates to:
  /// **'Not linked'**
  String get smartHomeNotLinkedStatus;

  /// No description provided for @smartHomeCouldNotOpen.
  ///
  /// In en, this message translates to:
  /// **'Could not open the link.'**
  String get smartHomeCouldNotOpen;

  /// No description provided for @smartHomeDevices.
  ///
  /// In en, this message translates to:
  /// **'Devices'**
  String get smartHomeDevices;

  /// No description provided for @smartHomeAddDevice.
  ///
  /// In en, this message translates to:
  /// **'Add Device'**
  String get smartHomeAddDevice;

  /// No description provided for @smartHomeDeleteDevice.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get smartHomeDeleteDevice;

  /// No description provided for @smartHomeDeleteDeviceConfirm.
  ///
  /// In en, this message translates to:
  /// **'Remove this device?'**
  String get smartHomeDeleteDeviceConfirm;

  /// No description provided for @smartHomeDeviceOnline.
  ///
  /// In en, this message translates to:
  /// **'Online'**
  String get smartHomeDeviceOnline;

  /// No description provided for @smartHomeDeviceOffline.
  ///
  /// In en, this message translates to:
  /// **'Offline'**
  String get smartHomeDeviceOffline;

  /// No description provided for @smartHomeDeviceLastSeen.
  ///
  /// In en, this message translates to:
  /// **'Last seen: {time}'**
  String smartHomeDeviceLastSeen(String time);

  /// No description provided for @smartHomeDeviceName.
  ///
  /// In en, this message translates to:
  /// **'Device name'**
  String get smartHomeDeviceName;

  /// No description provided for @smartHomeDeviceType.
  ///
  /// In en, this message translates to:
  /// **'Device type'**
  String get smartHomeDeviceType;

  /// No description provided for @smartHomeDeviceTypeTv.
  ///
  /// In en, this message translates to:
  /// **'TV'**
  String get smartHomeDeviceTypeTv;

  /// No description provided for @smartHomeDeviceTypeSpeaker.
  ///
  /// In en, this message translates to:
  /// **'Speaker'**
  String get smartHomeDeviceTypeSpeaker;

  /// No description provided for @smartHomeDeviceTypeWatch.
  ///
  /// In en, this message translates to:
  /// **'Watch'**
  String get smartHomeDeviceTypeWatch;

  /// No description provided for @smartHomeDeviceTypeDesktop.
  ///
  /// In en, this message translates to:
  /// **'Desktop'**
  String get smartHomeDeviceTypeDesktop;

  /// No description provided for @smartHomeDeviceTypeOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get smartHomeDeviceTypeOther;

  /// No description provided for @smartHomeDeviceAdhan.
  ///
  /// In en, this message translates to:
  /// **'Adhan notifications'**
  String get smartHomeDeviceAdhan;

  /// No description provided for @smartHomeDeviceAdhanDesc.
  ///
  /// In en, this message translates to:
  /// **'Receive adhan alerts on this device'**
  String get smartHomeDeviceAdhanDesc;

  /// No description provided for @smartHomeDeviceVolume.
  ///
  /// In en, this message translates to:
  /// **'Volume'**
  String get smartHomeDeviceVolume;

  /// No description provided for @smartHomeDeviceAudioType.
  ///
  /// In en, this message translates to:
  /// **'Audio type'**
  String get smartHomeDeviceAudioType;

  /// No description provided for @smartHomeDeviceEnabledPrayers.
  ///
  /// In en, this message translates to:
  /// **'Enabled prayers'**
  String get smartHomeDeviceEnabledPrayers;

  /// No description provided for @smartHomeDeviceSettings.
  ///
  /// In en, this message translates to:
  /// **'Device Settings'**
  String get smartHomeDeviceSettings;

  /// No description provided for @smartHomeTesting.
  ///
  /// In en, this message translates to:
  /// **'Testing...'**
  String get smartHomeTesting;

  /// No description provided for @smartHomeTestSuccess.
  ///
  /// In en, this message translates to:
  /// **'Connection verified'**
  String get smartHomeTestSuccess;

  /// No description provided for @smartHomeTestFailed.
  ///
  /// In en, this message translates to:
  /// **'Connection test failed'**
  String get smartHomeTestFailed;

  /// No description provided for @smartHomePairTv.
  ///
  /// In en, this message translates to:
  /// **'Pair TV'**
  String get smartHomePairTv;

  /// No description provided for @smartHomePairingTv.
  ///
  /// In en, this message translates to:
  /// **'Registering TV...'**
  String get smartHomePairingTv;

  /// No description provided for @smartHomePairTvSuccess.
  ///
  /// In en, this message translates to:
  /// **'TV paired successfully'**
  String get smartHomePairTvSuccess;

  /// No description provided for @smartHomePairTvFailed.
  ///
  /// In en, this message translates to:
  /// **'TV pairing failed'**
  String get smartHomePairTvFailed;

  /// No description provided for @smartHomeLoadingDevices.
  ///
  /// In en, this message translates to:
  /// **'Loading devices...'**
  String get smartHomeLoadingDevices;

  /// No description provided for @smartHomeLoadingIntegrations.
  ///
  /// In en, this message translates to:
  /// **'Loading integrations...'**
  String get smartHomeLoadingIntegrations;

  /// No description provided for @smartHomeServiceUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Smart home service is currently unavailable. Please try again later.'**
  String get smartHomeServiceUnavailable;

  /// No description provided for @adhkarCompletedCount.
  ///
  /// In en, this message translates to:
  /// **'{completed} / {total} completed'**
  String adhkarCompletedCount(int completed, int total);

  /// No description provided for @adhkarReset.
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get adhkarReset;

  /// No description provided for @syncHistoryTitle.
  ///
  /// In en, this message translates to:
  /// **'Sync History'**
  String get syncHistoryTitle;

  /// No description provided for @syncClearHistory.
  ///
  /// In en, this message translates to:
  /// **'Clear history'**
  String get syncClearHistory;

  /// No description provided for @syncNoConflicts.
  ///
  /// In en, this message translates to:
  /// **'No sync conflicts detected. All devices are in sync.'**
  String get syncNoConflicts;

  /// No description provided for @syncDomainSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get syncDomainSettings;

  /// No description provided for @syncDomainCities.
  ///
  /// In en, this message translates to:
  /// **'Saved Cities'**
  String get syncDomainCities;

  /// No description provided for @syncDomainPrayerLogs.
  ///
  /// In en, this message translates to:
  /// **'Prayer Logs'**
  String get syncDomainPrayerLogs;

  /// No description provided for @syncTimeJustNow.
  ///
  /// In en, this message translates to:
  /// **'just now'**
  String get syncTimeJustNow;

  /// No description provided for @syncTimeMinAgo.
  ///
  /// In en, this message translates to:
  /// **'{min}m ago'**
  String syncTimeMinAgo(int min);

  /// No description provided for @syncTimeHourAgo.
  ///
  /// In en, this message translates to:
  /// **'{hour}h ago'**
  String syncTimeHourAgo(int hour);

  /// No description provided for @syncTimeDayAgo.
  ///
  /// In en, this message translates to:
  /// **'{day}d ago'**
  String syncTimeDayAgo(int day);

  /// No description provided for @pinCity.
  ///
  /// In en, this message translates to:
  /// **'Pin'**
  String get pinCity;

  /// No description provided for @pinMaxReached.
  ///
  /// In en, this message translates to:
  /// **'Maximum 5 pinned cities. Upgrade to Ummat+ for more.'**
  String get pinMaxReached;

  /// No description provided for @pinCityUnpinned.
  ///
  /// In en, this message translates to:
  /// **'{city} unpinned'**
  String pinCityUnpinned(String city);

  /// No description provided for @pinUndo.
  ///
  /// In en, this message translates to:
  /// **'Undo'**
  String get pinUndo;

  /// No description provided for @tvPairingScanQr.
  ///
  /// In en, this message translates to:
  /// **'Scan TV QR Code'**
  String get tvPairingScanQr;

  /// No description provided for @tvPairingScanInstruction.
  ///
  /// In en, this message translates to:
  /// **'Point your camera at the QR code on your TV'**
  String get tvPairingScanInstruction;

  /// No description provided for @tvPairingEnterManually.
  ///
  /// In en, this message translates to:
  /// **'Enter code manually'**
  String get tvPairingEnterManually;

  /// No description provided for @tvPairingEnterCode.
  ///
  /// In en, this message translates to:
  /// **'Enter pairing code'**
  String get tvPairingEnterCode;

  /// No description provided for @tvPairingCodeHint.
  ///
  /// In en, this message translates to:
  /// **'6-character code shown on your TV'**
  String get tvPairingCodeHint;

  /// No description provided for @tvPairingNameThisTv.
  ///
  /// In en, this message translates to:
  /// **'Name this TV'**
  String get tvPairingNameThisTv;

  /// No description provided for @tvPairingNameHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Living Room TV'**
  String get tvPairingNameHint;

  /// No description provided for @tvPairingSuccess.
  ///
  /// In en, this message translates to:
  /// **'{name} paired!'**
  String tvPairingSuccess(String name);

  /// No description provided for @tvPairingSuccessSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your TV is now connected to your account.'**
  String get tvPairingSuccessSubtitle;

  /// No description provided for @tvPairingBackToMyTvs.
  ///
  /// In en, this message translates to:
  /// **'Back to My TVs'**
  String get tvPairingBackToMyTvs;

  /// No description provided for @tvPairingTimeout.
  ///
  /// In en, this message translates to:
  /// **'Request timed out. Is the TV on and connected?'**
  String get tvPairingTimeout;

  /// No description provided for @tvPairingServerError.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to server.'**
  String get tvPairingServerError;

  /// No description provided for @tvPairingSignInRequired.
  ///
  /// In en, this message translates to:
  /// **'Sign in to your account before pairing a TV.'**
  String get tvPairingSignInRequired;

  /// No description provided for @tvJumuahGreeting.
  ///
  /// In en, this message translates to:
  /// **'Jumu\'ah Mubarak'**
  String get tvJumuahGreeting;

  /// No description provided for @tvChildFajrExplanation.
  ///
  /// In en, this message translates to:
  /// **'Fajr is the morning prayer. We wake up before sunrise to thank Allah for a new day!'**
  String get tvChildFajrExplanation;

  /// No description provided for @tvChildFajrFunFact.
  ///
  /// In en, this message translates to:
  /// **'The Prophet ‫ﷺ‬ said: “The best prayer in the sight of Allah is Fajr on Friday.” (Bukhari)'**
  String get tvChildFajrFunFact;

  /// No description provided for @tvChildSunriseExplanation.
  ///
  /// In en, this message translates to:
  /// **'After Fajr, the sun rises. This is a blessed time to make dhikr and read Quran.'**
  String get tvChildSunriseExplanation;

  /// No description provided for @tvChildSunriseFunFact.
  ///
  /// In en, this message translates to:
  /// **'Sitting after Fajr until sunrise and praying two rak’ahs earns the reward of a full Hajj! (Tirmidhi)'**
  String get tvChildSunriseFunFact;

  /// No description provided for @tvChildDhuhrExplanation.
  ///
  /// In en, this message translates to:
  /// **'Dhuhr is the midday prayer. The sun is highest in the sky, and we pause to remember Allah.'**
  String get tvChildDhuhrExplanation;

  /// No description provided for @tvChildDhuhrFunFact.
  ///
  /// In en, this message translates to:
  /// **'The Prophet ‫ﷺ‬ loved to pray Dhuhr early when the sun begins to decline. (Muslim)'**
  String get tvChildDhuhrFunFact;

  /// No description provided for @tvChildAsrExplanation.
  ///
  /// In en, this message translates to:
  /// **'Asr is the afternoon prayer. Allah swears by this time in Surah Al-Asr — it is very important!'**
  String get tvChildAsrExplanation;

  /// No description provided for @tvChildAsrFunFact.
  ///
  /// In en, this message translates to:
  /// **'Missing Asr prayer is like losing one’s family and wealth. That is how much Allah loves it! (Bukhari)'**
  String get tvChildAsrFunFact;

  /// No description provided for @tvChildMaghribExplanation.
  ///
  /// In en, this message translates to:
  /// **'Maghrib is the sunset prayer. When the sun sets, we thank Allah for the beautiful day.'**
  String get tvChildMaghribExplanation;

  /// No description provided for @tvChildMaghribFunFact.
  ///
  /// In en, this message translates to:
  /// **'The angels of the day and night meet at Fajr and Maghrib. How special! (Bukhari)'**
  String get tvChildMaghribFunFact;

  /// No description provided for @tvChildIshaExplanation.
  ///
  /// In en, this message translates to:
  /// **'Isha is the night prayer. We end our day by thanking Allah before we sleep.'**
  String get tvChildIshaExplanation;

  /// No description provided for @tvChildIshaFunFact.
  ///
  /// In en, this message translates to:
  /// **'Praying Isha and Fajr in congregation is like praying all night long! (Muslim)'**
  String get tvChildIshaFunFact;

  /// No description provided for @desktopOpen.
  ///
  /// In en, this message translates to:
  /// **'Open PrayCalc'**
  String get desktopOpen;

  /// No description provided for @desktopQuit.
  ///
  /// In en, this message translates to:
  /// **'Quit PrayCalc'**
  String get desktopQuit;

  /// No description provided for @desktopSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings…'**
  String get desktopSettings;

  /// No description provided for @desktopTvDisplays.
  ///
  /// In en, this message translates to:
  /// **'TV Displays…'**
  String get desktopTvDisplays;

  /// No description provided for @desktopTrayTooltip.
  ///
  /// In en, this message translates to:
  /// **'PrayCalc - Prayer Times'**
  String get desktopTrayTooltip;

  /// No description provided for @desktopNextPrayer.
  ///
  /// In en, this message translates to:
  /// **'Next Prayer…'**
  String get desktopNextPrayer;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'ar',
    'bn',
    'de',
    'en',
    'es',
    'fa',
    'fr',
    'ha',
    'hi',
    'id',
    'ku',
    'ms',
    'ps',
    'pt',
    'ru',
    'so',
    'sw',
    'th',
    'tr',
    'ur',
    'uz',
    'zh',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'bn':
      return AppLocalizationsBn();
    case 'de':
      return AppLocalizationsDe();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fa':
      return AppLocalizationsFa();
    case 'fr':
      return AppLocalizationsFr();
    case 'ha':
      return AppLocalizationsHa();
    case 'hi':
      return AppLocalizationsHi();
    case 'id':
      return AppLocalizationsId();
    case 'ku':
      return AppLocalizationsKu();
    case 'ms':
      return AppLocalizationsMs();
    case 'ps':
      return AppLocalizationsPs();
    case 'pt':
      return AppLocalizationsPt();
    case 'ru':
      return AppLocalizationsRu();
    case 'so':
      return AppLocalizationsSo();
    case 'sw':
      return AppLocalizationsSw();
    case 'th':
      return AppLocalizationsTh();
    case 'tr':
      return AppLocalizationsTr();
    case 'ur':
      return AppLocalizationsUr();
    case 'uz':
      return AppLocalizationsUz();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
