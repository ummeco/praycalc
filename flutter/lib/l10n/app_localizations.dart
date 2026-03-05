import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';
import 'app_localizations_ur.dart';

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
    Locale('en'),
    Locale('tr'),
    Locale('ur'),
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
  /// **'Ramadan Mubarak 🌙'**
  String get ramadanMubarak;

  /// No description provided for @ramadanDayProgress.
  ///
  /// In en, this message translates to:
  /// **'Day {day} / 30'**
  String ramadanDayProgress(int day);

  /// No description provided for @lastTenNights.
  ///
  /// In en, this message translates to:
  /// **'Last 10 Nights ✨'**
  String get lastTenNights;

  /// No description provided for @laylatulQadr.
  ///
  /// In en, this message translates to:
  /// **'Laylatul Qadr ✨'**
  String get laylatulQadr;

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

  /// No description provided for @tvTitle.
  ///
  /// In en, this message translates to:
  /// **'TV Display'**
  String get tvTitle;

  /// No description provided for @tvMasjidMode.
  ///
  /// In en, this message translates to:
  /// **'Masjid Mode'**
  String get tvMasjidMode;

  /// No description provided for @tvAmbientMode.
  ///
  /// In en, this message translates to:
  /// **'Ambient Mode'**
  String get tvAmbientMode;

  /// No description provided for @tvSettingsIqamah.
  ///
  /// In en, this message translates to:
  /// **'Iqamah Offsets'**
  String get tvSettingsIqamah;

  /// No description provided for @tvSettingsAnnouncements.
  ///
  /// In en, this message translates to:
  /// **'Announcements'**
  String get tvSettingsAnnouncements;

  /// No description provided for @tvConnectQR.
  ///
  /// In en, this message translates to:
  /// **'Scan to connect'**
  String get tvConnectQR;

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
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'tr', 'ur'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'tr':
      return AppLocalizationsTr();
    case 'ur':
      return AppLocalizationsUr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
