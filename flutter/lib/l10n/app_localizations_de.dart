// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for German (`de`).
class AppLocalizationsDe extends AppLocalizations {
  AppLocalizationsDe([String locale = 'de']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Fajr';

  @override
  String get prayerSunrise => 'Sunrise';

  @override
  String get prayerDhuhr => 'Dhuhr';

  @override
  String get prayerAsr => 'Asr';

  @override
  String get prayerMaghrib => 'Maghrib';

  @override
  String get prayerIsha => 'Isha';

  @override
  String get prayerQiyam => 'Qiyam';

  @override
  String get prayerSuhoor => 'Suhoor';

  @override
  String get prayerIftar => 'Iftar';

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
  String get hijriRamadan => 'Ramadan';

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
  String get monthApr => 'Apr';

  @override
  String get monthMay => 'Mai';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Aug';

  @override
  String get monthSep => 'Sep';

  @override
  String get monthOct => 'Okt';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Dez';

  @override
  String get monthJanuary => 'Januar';

  @override
  String get monthFebruary => 'Februar';

  @override
  String get monthMarch => 'Maerz';

  @override
  String get monthApril => 'April';

  @override
  String get monthMayFull => 'Mai';

  @override
  String get monthJune => 'Juni';

  @override
  String get monthJuly => 'Juli';

  @override
  String get monthAugust => 'August';

  @override
  String get monthSeptember => 'September';

  @override
  String get monthOctober => 'Oktober';

  @override
  String get monthNovember => 'November';

  @override
  String get monthDecember => 'Dezember';

  @override
  String get dayMonShort => 'Mo';

  @override
  String get dayTueShort => 'Di';

  @override
  String get dayWedShort => 'Mi';

  @override
  String get dayThuShort => 'Do';

  @override
  String get dayFriShort => 'Fr';

  @override
  String get daySatShort => 'Sa';

  @override
  String get daySunShort => 'So';

  @override
  String get dayMonday => 'Montag';

  @override
  String get dayTuesday => 'Dienstag';

  @override
  String get dayWednesday => 'Mittwoch';

  @override
  String get dayThursday => 'Donnerstag';

  @override
  String get dayFriday => 'Freitag';

  @override
  String get daySaturday => 'Samstag';

  @override
  String get daySunday => 'Sonntag';

  @override
  String get daySuChart => 'So';

  @override
  String get dayMoChart => 'Mo';

  @override
  String get dayTuChart => 'Di';

  @override
  String get dayWeChart => 'Mi';

  @override
  String get dayThChart => 'Do';

  @override
  String get dayFrChart => 'Fr';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Stadt waehlen';

  @override
  String get setCityFab => 'Stadt festlegen';

  @override
  String prayerTimesError(Object error) {
    return 'Gebetszeiten konnten nicht berechnet werden.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer in';
  }

  @override
  String get ramadanMubarak => 'Ramadan Mubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Tag $day / 30';
  }

  @override
  String get lastTenNights => 'Letzte 10 Naechte';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'n.H.';

  @override
  String get homeSuffixCE => 'n.Chr.';

  @override
  String get homeNoCitySelected => 'Keine Stadt ausgewaehlt';

  @override
  String get homeNoCityHint =>
      'Tippen Sie oben, um Ihre Stadt zu suchen oder GPS zu aktivieren.';

  @override
  String get homeCouldNotCalc => 'Gebetszeiten konnten nicht berechnet werden.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Monatliche\nZeiten';

  @override
  String get homeActionDuaDhikr => 'Dua &\nDhikr';

  @override
  String get homeActionPrayerStats => 'Gebets-\nstatistik';

  @override
  String homePolarBanner(int count) {
    return '$count Gebetszeiten koennen fuer Ihren Standort in diesem Zeitraum nicht berechnet werden (Mitternachtssonne / Polarnacht). Versuchen Sie die Breitengradschaetzung in den Einstellungen.';
  }

  @override
  String get settingsTitle => 'Einstellungen';

  @override
  String get settingsSectionPrayerCalc => 'Gebetsberechnung';

  @override
  String get settingsCalcMethod => 'Berechnungsmethode';

  @override
  String get settingsCalcMethodAuto => 'Automatisch (Dynamisch)';

  @override
  String get settingsHanafiAsr => 'Hanafi Asr';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Schattenfaktor 2x (spaetere Asr-Zeit)';

  @override
  String get settingsSectionDisplay => 'Anzeige';

  @override
  String get settings24hClock => '24-Stunden-Uhr';

  @override
  String get settingsFollowSystemTheme => 'Systemdesign folgen';

  @override
  String get settingsDarkMode => 'Dunkelmodus';

  @override
  String get settingsSectionNotifications => 'Benachrichtigungen';

  @override
  String get settingsPrayerNotifications => 'Gebetsbenachrichtigungen';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhan, Erinnerungen und Einstellungen pro Gebet';

  @override
  String get settingsPrayerAgendas => 'Gebetsagenden';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Benutzerdefinierte Erinnerungen basierend auf Gebetszeiten';

  @override
  String get settingsAccount => 'Konto';

  @override
  String get settingsSignInToSync => 'Anmelden zum Synchronisieren';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Behalten Sie Ihre Daten auf allen Geraeten';

  @override
  String get settingsHomeScreen => 'Startbildschirm';

  @override
  String get settingsSkyGradient => 'Himmelsverlauf-Hintergrund';

  @override
  String get settingsSkyGradientSubtitle =>
      'Animierte Himmelsfarben passend zur Tageszeit';

  @override
  String get settingsWeatherGradient => 'Wetter-getoenter Verlauf';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Himmelsfarben basierend auf dem lokalen Wetter anpassen';

  @override
  String get settingsCountdownAnimation => 'Countdown-Animation';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Atmender Ring beim naechsten Gebets-Countdown';

  @override
  String get settingsPrayerTracking => 'Gebetsverfolgung';

  @override
  String get settingsTrackMyPrayers => 'Meine Gebete verfolgen';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Protokollieren Sie, welche Gebete Sie taeglich verrichten';

  @override
  String get settingsPrayerStats => 'Gebetsstatistiken';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Serien, woechentliche und monatliche Diagramme';

  @override
  String get settingsJumuahKahf => 'Jumu\'ah Al-Kahf Erinnerung';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Freitagserinnerung zum Lesen der Sura Al-Kahf';

  @override
  String get settingsTravel => 'Reise';

  @override
  String get settingsTravelMode => 'Reisemodus';

  @override
  String get settingsTravelModeSubtitle =>
      'Automatisch erkennen, wenn Sie nicht zu Hause sind, und Gebete anpassen';

  @override
  String get settingsHomeLocation => 'Heimatstandort';

  @override
  String get settingsHomeLocationNotSet =>
      'Nicht festgelegt — tippen, um aktuellen Standort zu verwenden';

  @override
  String get settingsClearHomeLocation => 'Heimatstandort loeschen';

  @override
  String get settingsTravelRulings => 'Reisegebetsregeln';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, Zusammenlegung und Reiserichtlinien';

  @override
  String get settingsSmartHome => 'Smart Home';

  @override
  String get settingsSmartHomeIntegrations => 'Smart-Home-Integrationen';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'TV-Anzeige';

  @override
  String get settingsTvHome => 'TV-Hauptanzeige';

  @override
  String get settingsTvHomeSubtitle => 'Vollbild-Gebetsuhr fuer den Fernseher';

  @override
  String get settingsMasjidDisplay => 'Moschee-Anzeige';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Adhan/Iqamah-Tabelle fuer Moschee-Bildschirme';

  @override
  String get settingsTvSettings => 'TV-Einstellungen';

  @override
  String get settingsTvSettingsSubtitle =>
      'Moschee-Modus, Iqamah-Versaetze, Ambient';

  @override
  String get settingsAboutPrayCalc => 'Ueber PrayCalc';

  @override
  String get syncSynced => 'Synchronisiert';

  @override
  String get syncSyncing => 'Synchronisiere...';

  @override
  String get syncOffline => 'Offline';

  @override
  String get syncError => 'Synchronisierungsfehler';

  @override
  String get notifSettingsTitle => 'Benachrichtigungen & Adhan';

  @override
  String get notifAdhanLabel => 'Adhan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Erinnerung: $minutes Min. vorher';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Lautstaerke: $pct%';
  }

  @override
  String get notifTestAdhan => 'Adhan testen';

  @override
  String get notifModeOff => 'Aus';

  @override
  String get notifModeReminderOnly => 'Nur Erinnerung';

  @override
  String get notifModeArrival => 'Zur Gebetszeit';

  @override
  String get notifModeBoth => 'Erinnerung + Gebetszeit';

  @override
  String get citySearchHint => 'Stadt suchen…';

  @override
  String get citySearchDetectTooltip => 'Meinen Standort erkennen';

  @override
  String get citySearchNoCityGps =>
      'Stadt konnte per GPS nicht erkannt werden.';

  @override
  String get citySearchPermissionDenied =>
      'Standortberechtigung verweigert. Suchen Sie manuell.';

  @override
  String get citySearchNoResults => 'Keine Staedte gefunden.';

  @override
  String get citySearchStartTyping => 'Tippen Sie, um zu suchen…';

  @override
  String get agendasTitle => 'Gebetsagenden';

  @override
  String get agendasEmpty =>
      'Noch keine Agenden.\nTippen Sie auf +, um eine Erinnerung zu Ihren Gebeten hinzuzufuegen.';

  @override
  String get agendasUndo => 'Rueckgaengig';

  @override
  String agendasRemoved(String label) {
    return '$label entfernt';
  }

  @override
  String get agendaNewTitle => 'Neue Agenda';

  @override
  String get agendaEditTitle => 'Agenda bearbeiten';

  @override
  String get agendaSave => 'Speichern';

  @override
  String get agendaLabelEmpty => 'Bezeichnung darf nicht leer sein';

  @override
  String get agendaLabelField => 'Bezeichnung';

  @override
  String get agendaLabelHint => 'z.B. Fuer Fajr aufwachen';

  @override
  String get agendaPrayerSection => 'Gebet';

  @override
  String get agendaTimeOffsetSection => 'Zeitversatz';

  @override
  String get agendaOffsetAtPrayerTime => 'Zur Gebetszeit';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes Min. vorher';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes Min. nachher';
  }

  @override
  String get agendaRepeatSection => 'Wiederholen';

  @override
  String get agendaNotifTypeSection => 'Benachrichtigungstyp';

  @override
  String get agendaNotifSilent => 'Lautlos';

  @override
  String get agendaNotifSound => 'Ton';

  @override
  String get agendaNotifVibrate => 'Vibration';

  @override
  String get agendaDayM => 'M';

  @override
  String get agendaDayT => 'D';

  @override
  String get agendaDayW => 'M';

  @override
  String get agendaDayF => 'F';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Mond & Hijri-Kalender';

  @override
  String moonIlluminated(int pct) {
    return '$pct% beleuchtet';
  }

  @override
  String get moonFullTonight => 'Vollmond heute Nacht!';

  @override
  String get moonNextTomorrow => 'Naechster Vollmond morgen';

  @override
  String moonNextDays(int days) {
    return 'Naechster Vollmond in $days Tagen';
  }

  @override
  String moonAge(String age) {
    return 'Mondalter: $age Tage';
  }

  @override
  String get moonPhaseNewMoon => 'Neumond';

  @override
  String get moonPhaseWaxingCrescent => 'Zunehmende Sichel';

  @override
  String get moonPhaseFirstQuarter => 'Erstes Viertel';

  @override
  String get moonPhaseWaxingGibbous => 'Zunehmender Mond';

  @override
  String get moonPhaseFullMoon => 'Vollmond';

  @override
  String get moonPhaseWaningGibbous => 'Abnehmender Mond';

  @override
  String get moonPhaseLastQuarter => 'Letztes Viertel';

  @override
  String get moonPhaseWaningCrescent => 'Abnehmende Sichel';

  @override
  String get moonHilalVisibility => 'Naechste Hilal-Sichtbarkeit';

  @override
  String get moonRegionMiddleEast => 'Naher Osten';

  @override
  String get moonRegionWestAfrica => 'Westafrika';

  @override
  String get moonRegionSouthAsia => 'Suedasien';

  @override
  String get moonRegionEurope => 'Europa';

  @override
  String get moonRegionAmericas => 'Amerika';

  @override
  String get moonVisible => 'Sichtbar';

  @override
  String get moonNotVisible => 'Nicht sichtbar';

  @override
  String get moonPossible => 'Moeglich';

  @override
  String get moonUpcomingDates => 'Kommende islamische Daten';

  @override
  String get hijriTodayLabel => 'Heute im Hijri-Kalender';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year n.H. beginnt';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'in $days Tagen';
  }

  @override
  String get moonLunarCycle => 'Mondzyklus';

  @override
  String moonDayOfCycle(int day) {
    return 'Tag $day von ~29,5';
  }

  @override
  String get moonHilalSightingForecast => 'Hilal-Sichtungsprognose';

  @override
  String get moonHilalVisibilityMap => 'Hilal-Sichtbarkeitskarte';

  @override
  String moonDayN(int day) {
    return 'Tag $day';
  }

  @override
  String get moonGlobalSighting => 'Globale Sichtung';

  @override
  String get moonZoneNakedEye => 'Mit blossem Auge';

  @override
  String get moonZoneBinoculars => 'Fernglas';

  @override
  String get moonZoneVeryDifficult => 'Sehr schwierig';

  @override
  String get moonZoneNotVisible => 'Nicht sichtbar';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year n.H. wird voraussichtlich 29 Tage haben. Die Mondsichel wird voraussichtlich am 29. gesichtet, in sha Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year n.H. wird voraussichtlich 30 Tage haben. Die Mondsichel ist am 29. unwahrscheinlich. Der Monat wird 30 Tage vollenden.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Saudi-Arabien';

  @override
  String get moonFCNACalc => 'FCNA / Ber.';

  @override
  String get moonNorthAmerica => 'Nordamerika';

  @override
  String moonNDays(int days) {
    return '$days Tage';
  }

  @override
  String moonStarts(String month) {
    return '$month beginnt:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Mondalter bei Sonnenuntergang: $hours Std.';
  }

  @override
  String get moon7DayLunarCalendar => '7-Tage-Mondkalender';

  @override
  String get moonUpcomingIslamicEvents => 'Kommende islamische Ereignisse';

  @override
  String get moonTodayLabel => 'Heute';

  @override
  String get moonTomorrowLabel => 'Morgen';

  @override
  String get calDateCol => 'Datum';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Fajr';

  @override
  String get calSunriseCol => 'Sonnenaufgang';

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
      'Legen Sie zuerst Ihre Stadt fest,\num den Gebetskalender anzuzeigen.';

  @override
  String get calShareTooltip => 'Kalender teilen';

  @override
  String get calPrevMonthTooltip => 'Vorheriger Monat';

  @override
  String get calNextMonthTooltip => 'Naechster Monat';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Gebetszeiten — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Zum Kompass wechseln';

  @override
  String get qiblaSwitchToAR => 'Zur AR-Kamera wechseln';

  @override
  String get qiblaNoCityText =>
      'Legen Sie zuerst Ihre Stadt fest,\num die Qibla-Richtung zu berechnen.';

  @override
  String get qiblaCompassUnavailable =>
      'Kompasssensor auf diesem Geraet nicht verfuegbar.';

  @override
  String get qiblaCalibrate =>
      'Kalibrieren: Bewegen Sie Ihr Telefon in einer 8-Form.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° von Norden';
  }

  @override
  String qiblaFrom(String city) {
    return 'Von $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km von der Kaaba';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km von der Kaaba';
  }

  @override
  String get qiblaFacingQibla => 'Qibla-Richtung ✓';

  @override
  String get tasbeehTitle => 'Tasbeeh';

  @override
  String get tasbeehResetTooltip => 'Zuruecksetzen';

  @override
  String get tasbeehTapToSwitch =>
      'Tippen Sie auf die Bezeichnung zum Wechseln';

  @override
  String get tasbeehTapToCount => 'Tippen Sie irgendwo zum Zaehlen';

  @override
  String get tasbeehResetDialogTitle => 'Zaehler zuruecksetzen?';

  @override
  String get tasbeehResetDialogContent =>
      'Dies setzt den aktuellen Zaehler auf Null zurueck.';

  @override
  String get tasbeehCancel => 'Abbrechen';

  @override
  String get tasbeehReset => 'Zuruecksetzen';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Heute: $count Dhikr';
  }

  @override
  String get tasbeehLast7Days => 'Letzte 7 Tage';

  @override
  String get tasbeehNoHistory =>
      'Noch kein Verlauf — fangen Sie an zu zaehlen!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih abgeschlossen! $count Dhikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Smart Home';

  @override
  String get smartHomeSubtitle => 'Verbinden Sie Ihre Geraete mit Gebetszeiten';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Fragen Sie Google nach Gebetszeiten und Qibla-Richtung';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Fragen Sie Alexa nach Gebetszeiten, dem naechsten Gebet und mehr';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc =>
      'Erstellen Sie benutzerdefinierte Kurzbefehle fuer Gebetszeiten';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Automatisieren Sie Lichter, Anzeigen und Erinnerungen zu Gebetszeiten';

  @override
  String get smartHomeLinkAccount => 'Konto verknuepfen';

  @override
  String get smartHomeLinked => 'Verknuepft';

  @override
  String get smartHomeUnlink => 'Verknuepfung aufheben';

  @override
  String get smartHomeSetupInstructions => 'Einrichtungsanleitung';

  @override
  String get smartHomeRequiresUmmatPlus => 'Erfordert Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Fehlerbehebung';

  @override
  String get smartHomeTestConnection => 'Verbindung testen';

  @override
  String get smartHomeConnectionSuccess => 'Erfolgreich verbunden';

  @override
  String get smartHomeConnectionFailed =>
      'Verbindung fehlgeschlagen. Pruefen Sie Ihre Kontoverknuepfung.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Premium-Gebetsfunktionen';

  @override
  String get subscriptionUpgrade => 'Auf Ummat+ upgraden';

  @override
  String get subscriptionRestore => 'Kauf wiederherstellen';

  @override
  String get subscriptionManage => 'Abonnement verwalten';

  @override
  String get subscriptionCancel => 'Abonnement kuendigen';

  @override
  String get subscriptionActive => 'Aktiv';

  @override
  String get subscriptionExpired => 'Abgelaufen';

  @override
  String get subscriptionFree => 'Kostenlos';

  @override
  String get subscriptionFreeDesc =>
      'Grundlegende Gebetszeiten, Qibla, Kalender';

  @override
  String get subscriptionPlusDesc => 'Smart Home, TV-Anzeige, Widgets und mehr';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count kostenlose Abfragen verbleibend';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/Jahr';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/Monat';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Smart-Home-Integration';

  @override
  String get subscriptionFeatureTV => 'TV-Anzeigemodus';

  @override
  String get subscriptionFeatureWidgets => 'Startbildschirm-Widgets';

  @override
  String get subscriptionFeatureWatch => 'Uhrkomplikationen';

  @override
  String get subscriptionFeatureSync =>
      'Geraeteuebergreifende Synchronisierung';

  @override
  String get subscriptionFeatureAdFree => 'Werbefreies Erlebnis';

  @override
  String get watchTitle => 'Uhr';

  @override
  String get watchNextPrayer => 'Naechstes Gebet';

  @override
  String get watchAllPrayers => 'Alle Gebete';

  @override
  String get watchComplication => 'Komplikation';

  @override
  String get nextPrayer => 'Naechstes Gebet';

  @override
  String get allPrayers => 'Alle Gebete';

  @override
  String get today => 'Heute';

  @override
  String get tomorrow => 'Morgen';

  @override
  String get thisWeek => 'Diese Woche';

  @override
  String get thisMonth => 'Dieser Monat';

  @override
  String get loginCreateAccount => 'Konto erstellen';

  @override
  String get loginSignIn => 'Anmelden';

  @override
  String get loginWelcomeBack => 'Willkommen zurueck';

  @override
  String get loginJoinPrayCalc => 'PrayCalc beitreten';

  @override
  String get loginSyncSubtitle =>
      'Synchronisieren Sie Ihre Gebetsdaten auf allen Geraeten';

  @override
  String get loginContinueGoogle => 'Weiter mit Google';

  @override
  String get loginOr => 'oder';

  @override
  String get loginSigningIn => 'Anmeldung laeuft…';

  @override
  String get loginNameLabel => 'Anzeigename (optional)';

  @override
  String get loginEmailLabel => 'E-Mail';

  @override
  String get loginPasswordLabel => 'Passwort';

  @override
  String get loginEmailRequired => 'E-Mail ist erforderlich';

  @override
  String get loginEmailInvalid => 'Geben Sie eine gueltige E-Mail-Adresse ein';

  @override
  String get loginPasswordRequired => 'Passwort ist erforderlich';

  @override
  String get loginPasswordMinLength =>
      'Passwort muss mindestens 8 Zeichen lang sein';

  @override
  String get loginForgotPassword => 'Passwort vergessen?';

  @override
  String get loginEnterEmailFirst => 'Geben Sie zuerst Ihre E-Mail-Adresse ein';

  @override
  String get loginResetSent => 'Passwort-Reset-E-Mail gesendet';

  @override
  String get loginResetFailed => 'Reset-E-Mail konnte nicht gesendet werden';

  @override
  String get loginNewToPrayCalc => 'Neu bei PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Haben Sie bereits ein Konto?';

  @override
  String get accountTitle => 'Konto';

  @override
  String get accountNotSignedIn => 'Nicht angemeldet';

  @override
  String get accountSyncSection => 'Synchronisierung';

  @override
  String get accountSyncStatus => 'Synchronisierungsstatus';

  @override
  String get accountSyncNow => 'Jetzt synchronisieren';

  @override
  String get accountSyncHistory => 'Synchronisierungsverlauf';

  @override
  String get accountNoConflicts => 'Keine Konflikte erkannt';

  @override
  String accountConflictsResolved(int count) {
    return '$count geloest';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Synchronisiert $time';
  }

  @override
  String get accountOfflineStatus => 'Offline. Aenderungen lokal gespeichert.';

  @override
  String get accountSyncErrorStatus =>
      'Synchronisierungsfehler. Erneuter Versuch.';

  @override
  String get accountDataSection => 'Daten';

  @override
  String get accountExportData => 'Daten exportieren';

  @override
  String get accountExportSubtitle =>
      'Laden Sie Ihre Einstellungen und Gebetsprotokolle herunter';

  @override
  String get accountExportFailed => 'Daten konnten nicht exportiert werden';

  @override
  String get accountSignOutTitle => 'Abmelden';

  @override
  String get accountSignOutBody =>
      'Ihre lokalen Daten bleiben erhalten. Melden Sie sich erneut an, um die Synchronisierung fortzusetzen.';

  @override
  String get accountDeleteAccount => 'Konto loeschen';

  @override
  String get accountDeleteSubtitle =>
      'Ihr Konto und Ihre Daten dauerhaft loeschen';

  @override
  String get accountDeleteBody =>
      'Dies loescht Ihr Konto und alle synchronisierten Daten dauerhaft. Ihre lokalen Daten auf diesem Geraet werden nicht entfernt.\n\nDiese Aktion kann nicht rueckgaengig gemacht werden.';

  @override
  String get accountDeleted => 'Konto geloescht';

  @override
  String get accountDeleteFailed => 'Konto konnte nicht geloescht werden';

  @override
  String get accountTimeJustNow => 'gerade eben';

  @override
  String accountTimeMinAgo(int min) {
    return 'vor ${min}Min.';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return 'vor ${hour}Std.';
  }

  @override
  String accountTimeDayAgo(int day) {
    return 'vor ${day}T.';
  }

  @override
  String get statsTitle => 'Gebetsstatistiken';

  @override
  String get statsShareTooltip => 'Statistiken teilen';

  @override
  String get statsTodayPrayers => 'Heutige Gebete';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Serie';

  @override
  String get statsDays => 'Tage';

  @override
  String get statsThisWeek => 'Diese Woche';

  @override
  String get statsCompletion => 'Abschluss';

  @override
  String get statsThisMonth => 'Dieser Monat';

  @override
  String get statsMostMissed => 'Am meisten verpasst';

  @override
  String get statsThisWeekLabel => 'diese Woche';

  @override
  String get statsWeeklyChart => 'Woechentlicher Abschluss nach Gebet';

  @override
  String get statsMonthlyChart => 'Monatlicher Abschluss nach Gebet';

  @override
  String statsTotalLogged(int count) {
    return '$count Gebete insgesamt protokolliert';
  }

  @override
  String get statsKeepItUp => 'Weiter so!';

  @override
  String get statsShareTitle => 'PrayCalc Gebetsstatistiken';

  @override
  String statsShareStreak(int days) {
    return 'Serie: $days Tage';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Woechentlich: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Monatlich: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Woechentliche Aufschluesselung:';

  @override
  String get aboutTitle => 'Ueber PrayCalc';

  @override
  String get aboutWebsite => 'Webseite';

  @override
  String get aboutContact => 'Kontakt';

  @override
  String get aboutLicenses => 'Open-Source-Lizenzen';

  @override
  String get aboutCouldNotOpen => 'Link konnte nicht geoeffnet werden.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Alle Rechte vorbehalten.\n\nGebetszeiten werden mit der pray_calc_dart-Engine berechnet. Die Genauigkeit haengt von Ihrem GPS-Standort und der gewaehlten Berechnungsmethode ab.';
  }

  @override
  String get commonCancel => 'Abbrechen';

  @override
  String get commonSave => 'Speichern';

  @override
  String get commonDelete => 'Loeschen';

  @override
  String get commonEdit => 'Bearbeiten';

  @override
  String get commonRetry => 'Erneut versuchen';

  @override
  String get commonClose => 'Schliessen';

  @override
  String get commonDone => 'Fertig';

  @override
  String get commonBack => 'Zurueck';

  @override
  String get commonNext => 'Weiter';

  @override
  String get commonSkip => 'Ueberspringen';

  @override
  String get commonContinue => 'Fortfahren';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Ja';

  @override
  String get commonNo => 'Nein';

  @override
  String get commonShare => 'Teilen';

  @override
  String get commonCopy => 'Kopieren';

  @override
  String get commonCopied => 'In die Zwischenablage kopiert';

  @override
  String get commonLoading => 'Laden...';

  @override
  String get commonError => 'Etwas ist schiefgelaufen';

  @override
  String get commonErrorRetry =>
      'Etwas ist schiefgelaufen. Tippen Sie zum Wiederholen.';

  @override
  String get commonNoInternet => 'Keine Internetverbindung';

  @override
  String get commonOfflineMode => 'Offlinemodus';

  @override
  String get commonSignIn => 'Anmelden';

  @override
  String get commonSignOut => 'Abmelden';

  @override
  String get commonSignUp => 'Registrieren';

  @override
  String get commonProfile => 'Profil';

  @override
  String get commonAccount => 'Konto';

  @override
  String get commonAbout => 'Info';

  @override
  String commonVersion(String version) {
    return 'Version $version';
  }

  @override
  String get commonPrivacyPolicy => 'Datenschutzrichtlinie';

  @override
  String get commonTermsOfService => 'Nutzungsbedingungen';

  @override
  String get commonRateApp => 'App bewerten';

  @override
  String get commonFeedback => 'Feedback senden';

  @override
  String get commonHelp => 'Hilfe';

  @override
  String get commonLanguage => 'Sprache';

  @override
  String get commonOpenSettings => 'Einstellungen oeffnen';

  @override
  String get travelNotificationTitle => 'Sie sind jetzt auf Reisen';

  @override
  String get travelNotificationBody =>
      'Gebetszeiten koennen verkuerzt werden. Tippen Sie, um die Reiseregeln zu erfahren.';

  @override
  String get travelRulingsTitle => 'Reise & Gebet';

  @override
  String get travelRulingsIntro =>
      'Islamische Regeln zum Gebet auf Reisen, mit Gelehrtenreferenzen aus dem Quran und authentischen Hadith-Sammlungen.';

  @override
  String get travelWhenTitle => 'Wann gilt die Reise?';

  @override
  String get travelQasrTitle => 'Gebete verkuerzen (Qasr)';

  @override
  String get travelJamTitle => 'Gebete zusammenlegen (Jam\')';

  @override
  String get travelDurationTitle => 'Dauer der Reise';

  @override
  String get travelReferencesTitle => 'Gelehrtenreferenzen';

  @override
  String get travelLearnMore => 'Mehr erfahren';

  @override
  String get travelHanafiDefaultTitle =>
      'Warum PrayCalc den Hanafi-Standard verwendet';

  @override
  String get travelDeeperScholarly => 'Tiefere Gelehrtendiskussion';

  @override
  String get onboardingTitle1 => 'Gebetszeiten, wo immer Sie sind';

  @override
  String get onboardingBody1 =>
      'GPS-genaue Salah-Zeiten fuer jede Stadt der Erde. Von Fajr bis Isha, vom Sonnenaufgang bis Qiyam. Mit unserer eigenen Berechnungs-Engine, gebaut fuer Praezision.';

  @override
  String get onboardingTitle2 => 'Ihr Standort, Ihre Zeiten';

  @override
  String get onboardingBody2 =>
      'Suchen Sie jede Stadt oder lassen Sie GPS Ihren Standort erkennen. PrayCalc findet Zeiten fuer 5 Millionen Staedte weltweit.';

  @override
  String get onboardingTitle3 => 'Verpassen Sie nie ein Gebet';

  @override
  String get onboardingBody3 =>
      'Adhan zur Gebetszeit, Erinnerungen davor. Benutzerdefinierte Agenden fuer Suhoor, Kurse und mehr.';

  @override
  String get onboardingTitle4 => 'Alles, was Sie brauchen';

  @override
  String get onboardingBody4 =>
      'Qibla-Kompass, Gebetskalender, Hijri-Mondphase, Tasbeeh-Zaehler. Alles an einem Ort.';

  @override
  String get onboardingSkip => 'Ueberspringen';

  @override
  String get onboardingGetStarted => 'Loslegen';

  @override
  String get onboardingSignInTitle => 'Bei PrayCalc anmelden';

  @override
  String get onboardingSignInSubtitle =>
      'Speichern Sie Ihren Gebetsverlauf und\nsynchronisieren Sie auf allen Geraeten.';

  @override
  String get onboardingContinueGoogle => 'Weiter mit Google';

  @override
  String get onboardingContinueWithoutAccount => 'Ohne Konto fortfahren';

  @override
  String get onboardingSigningIn => 'Anmeldung laeuft…';

  @override
  String get onboardingSelectLanguage => 'Sprache waehlen';

  @override
  String get duaDhikrTitle => 'Dua & Dhikr';

  @override
  String get duaDhikrTabDua => 'Dua';

  @override
  String get duaDhikrTabDhikr => 'Dhikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbeeh';

  @override
  String get duaDhikrTabMorning => 'Morgen';

  @override
  String get duaDhikrTabEvening => 'Abend';

  @override
  String get duaDhikrMorningAdhkar => 'Morgen-Adhkar';

  @override
  String get duaDhikrEveningAdhkar => 'Abend-Adhkar';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Jahreskalender';

  @override
  String get calExportIcsTooltip => '.ics exportieren';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Auf Karte anzeigen';

  @override
  String get qiblaWaitingCompass => 'Warte auf Kompass...';

  @override
  String get qiblaNoCompassSensor =>
      'Kein Kompasssensor. Qibla-Richtung wird statisch angezeigt.';

  @override
  String get qiblaAccuracyExcellent => 'Ausgezeichnete Genauigkeit';

  @override
  String get qiblaAccuracyGood => 'Gute Genauigkeit';

  @override
  String get qiblaAccuracyFair =>
      'Mittlere Genauigkeit. Kalibrieren Sie durch Bewegen des Telefons in einer 8-Form.';

  @override
  String get qiblaAccuracyLow =>
      'Geringe Genauigkeit. Kalibrieren Sie durch Bewegen des Telefons in einer 8-Form.';

  @override
  String get qiblaToTheKaaba => 'zur Kaaba';

  @override
  String get qiblaYourLocation => 'Ihr Standort';

  @override
  String get qiblaGpsAccurate => 'GPS-genau';

  @override
  String get qiblaCityCenter => 'Stadtzentrum';

  @override
  String get moonIlluminatedLabel => 'Beleuchtet';

  @override
  String get moonAgeLabel => 'Alter';

  @override
  String get moonFirstQtr => 'Erstes Viertel';

  @override
  String get moonLastQtr => 'Letztes Viertel';

  @override
  String get moonTonight => 'Heute Nacht';

  @override
  String get moonTomorrow => 'Morgen';

  @override
  String moonDaysAway(int days) {
    return '${days}T';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Heimatstandort festlegen';

  @override
  String get setHomeSearchHint => 'Stadt, Ort oder PLZ suchen…';

  @override
  String get setHomeClear => 'Loeschen';

  @override
  String get setHomeUseCurrentLocation => 'Aktuellen Standort verwenden';

  @override
  String get setHomeDetectAndSet =>
      'Ihren Standort erkennen und als Heimat festlegen';

  @override
  String get setHomeAlreadySet => 'Heimat bereits festgelegt';

  @override
  String setHomeSetAs(String city) {
    return '$city als Heimat festgelegt';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Aktueller Standort als Heimat festgelegt';

  @override
  String get setHomePermissionDenied =>
      'Standortberechtigung verweigert. Suchen Sie unten nach einer Stadt.';

  @override
  String get setHomeGpsUnavailable =>
      'GPS nicht verfuegbar. Suchen Sie manuell.';

  @override
  String get setHomeNoCitiesFound => 'Keine Staedte gefunden.';

  @override
  String get setHomeSearchPrompt => 'Suchen Sie Ihre Heimatstadt';

  @override
  String get setHomeSearchBody =>
      'Geben Sie oben ein, um zu suchen, oder verwenden Sie Ihren aktuellen Standort. Der Reisemodus erkennt, wenn Sie nicht zu Hause sind.';

  @override
  String get subscriptionYouHavePlus => 'Sie haben Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Auf Ummat+ upgraden';

  @override
  String get subscriptionThankYou =>
      'Vielen Dank fuer Ihre Unterstuetzung von PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Schalten Sie Premium-Funktionen auf all Ihren Geraeten frei.';

  @override
  String get subscriptionManageSub => 'Abonnement verwalten';

  @override
  String get subscriptionWelcome => 'Willkommen bei Ummat+!';

  @override
  String get subscriptionSubscribe => 'Abonnieren';

  @override
  String get subscriptionFreeFeatures => 'Kostenlose Funktionen';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ Funktionen';

  @override
  String get subscriptionFeaturePrayerTimes => 'Gebetszeiten';

  @override
  String get subscriptionFeatureQibla => 'Qibla-Kompass';

  @override
  String get subscriptionFeatureCalendar => 'Monatskalender';

  @override
  String get subscriptionFeatureTasbeeh => 'Tasbeeh-Zaehler';

  @override
  String get subscriptionFeatureMoon => 'Mond & Hijri';

  @override
  String get smartHomeAlertType => 'Alarmtyp';

  @override
  String get smartHomeAlertModal => 'Vollbild-Modal';

  @override
  String get smartHomeAlertCorner => 'Eckbenachrichtigung';

  @override
  String get smartHomeAlertNone => 'Keine (lautlos)';

  @override
  String get smartHomePauseMedia => 'Medien waehrend des Adhans pausieren';

  @override
  String get smartHomeQuietHours => 'Ruhezeiten';

  @override
  String get smartHomeQuietFrom => 'Von';

  @override
  String get smartHomeQuietTo => 'Bis';

  @override
  String get smartHomePrayerAudio => 'Audio pro Gebet';

  @override
  String get smartHomeAudioAdhan => 'Adhan';

  @override
  String get smartHomeAudioBeep => 'Piepton';

  @override
  String get smartHomeAudioSilent => 'Lautlos';

  @override
  String get aboutPrivacy => 'Datenschutzrichtlinie';

  @override
  String aboutVersion(String version) {
    return 'Version $version';
  }

  @override
  String get notifDefaultAdhan => 'Standard-Adhan';

  @override
  String get notifFajrAdhan => 'Fajr-Adhan';

  @override
  String get notifFajrAdhanSubtitle => 'Wird zur Fajr-Gebetszeit abgespielt';

  @override
  String get notifRegularAdhan => 'Regulaerer Adhan';

  @override
  String get notifRegularAdhanSubtitle =>
      'Wird bei Dhuhr, Asr, Maghrib, Isha abgespielt';

  @override
  String get notifPerPrayerSettings => 'Einstellungen pro Gebet';

  @override
  String get notifPreview => 'Vorschau';

  @override
  String get tvSettingsTitle => 'TV-Einstellungen';

  @override
  String get tvDisplayMode => 'Anzeigemodus';

  @override
  String get tvMasjidMode => 'Moschee-Modus';

  @override
  String get tvMasjidModeSubtitle =>
      'Grosse Beschilderungsanzeige mit Iqamah-Zeiten';

  @override
  String get tvMasjidName => 'Name der Moschee';

  @override
  String get tvMasjidNameTapToSet => 'Tippen zum Festlegen';

  @override
  String get tvClock => 'Uhr';

  @override
  String get tv24hFormat => '24-Stunden-Format';

  @override
  String get tvIqamahOffsets => 'Iqamah-Versaetze (Minuten nach Adhan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset Min. nach Adhan';
  }

  @override
  String get tvQrCode => 'QR-Code';

  @override
  String get tvShowQrCode => 'QR-Code anzeigen';

  @override
  String get tvShowQrCodeSubtitle =>
      'Einen QR-Code auf dem Moschee-Bildschirm anzeigen';

  @override
  String get tvQrCodeUrl => 'QR-Code-URL';

  @override
  String get tvAmbientModeSection => 'Ambient-Modus';

  @override
  String get tvIdleTimeout => 'Leerlauf-Timeout';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes Minuten bis Ambient aktiviert wird';
  }

  @override
  String get tvPhotoInterval => 'Fotointervall';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds Sekunden zwischen Fotos';
  }

  @override
  String get tvBackground => 'Hintergrund';

  @override
  String get tvPhotoCategory => 'Fotokategorie';

  @override
  String get tvLocation => 'Standort';

  @override
  String get tvChangeCity => 'Stadt aendern';

  @override
  String get tvChangeCitySubtitle => 'Nach einer anderen Stadt suchen';

  @override
  String get tvScreensaverBg => 'Bildschirmschoner-Hintergrund';

  @override
  String get tvScreensaverPhotos => 'Fotos';

  @override
  String get tvScreensaverPattern => 'Geometrisches Muster';

  @override
  String get tvScreensaverBoth => 'Fotos + Muster';

  @override
  String get tvCategoryAll => 'Alle Kategorien';

  @override
  String get tvCategoryMasjids => 'Moscheen';

  @override
  String get tvCategoryInteriors => 'Innenraeume';

  @override
  String get tvCategoryGeometric => 'Geometrisch';

  @override
  String get tvCategoryCalligraphy => 'Kalligrafie';

  @override
  String get tvCategoryLandscapes => 'Landschaften';

  @override
  String get tvCategoryRamadan => 'Ramadan';

  @override
  String get tvPhotoCategoryTitle => 'Fotokategorie';

  @override
  String tvEnterHint(String title) {
    return '$title eingeben';
  }

  @override
  String get tvSystemDefault => 'Systemstandard';

  @override
  String get smartHomeIntegrations => 'Integrationen';

  @override
  String get smartHomeLinkedSpeakers => 'Verknuepfte Lautsprecher & Displays';

  @override
  String get smartHomeAlertDisplay => 'Alarmanzeige';

  @override
  String get smartHomeAtAdhanShow => 'Zur Adhan-Zeit anzeigen';

  @override
  String get smartHomePauseMediaTitle => 'Medien beim Adhan pausieren';

  @override
  String get smartHomePauseMediaSubtitle => 'Wird nach dem Adhan fortgesetzt';

  @override
  String get smartHomePrayerAudioSection => 'Gebets-Audio';

  @override
  String get smartHomeQuietHoursSection => 'Ruhezeiten';

  @override
  String get smartHomeEnableQuietHours => 'Ruhezeiten aktivieren';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Alle Smart-Home-Alarme werden stummgeschaltet';

  @override
  String get smartHomeNoDevices => 'Noch keine Geraete verknuepft';

  @override
  String get smartHomeNoDevicesDesc =>
      'Verknuepfen Sie oben Google Home oder Alexa, dann erscheinen Ihre Lautsprecher und Displays hier.';

  @override
  String get smartHomeRequiresPlus => 'Smart Home erfordert Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Steuern Sie Gebetsankuendigungen auf Google Home, Alexa, Siri und Home Assistant. Konfigurieren Sie, welche Geraete den Adhan abspielen, wann Medien pausiert werden und legen Sie Ruhezeiten fest.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Adhan auf Nest-Lautsprechern und Displays abspielen.';

  @override
  String get smartHomeEnableAlexa =>
      'Aktivieren Sie den PrayCalc-Skill auf Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Fragen Sie Siri nach Gebetszeiten oder richten Sie Automatisierungen ein.';

  @override
  String get smartHomeHassAdd =>
      'Ueber HACS hinzufuegen fuer volle Automatisierungsunterstuetzung.';

  @override
  String get smartHomeSetupGuide => 'Einrichtungsanleitung';

  @override
  String get smartHomeSiriSetupTitle => 'Siri Shortcuts Einrichtung';

  @override
  String get smartHomeSiriStep1 =>
      'Oeffnen Sie die Kurzbefehle-App auf Ihrem iPhone oder iPad.';

  @override
  String get smartHomeSiriStep2 =>
      'Tippen Sie auf \"+\" um einen neuen Kurzbefehl zu erstellen.';

  @override
  String get smartHomeSiriStep3 =>
      'Suchen Sie nach \"PrayCalc\" in der Aktionsliste.';

  @override
  String get smartHomeSiriStep4 =>
      'Fuegen Sie \"Naechste Gebetszeit\" oder \"Gebetszeiten heute\" hinzu.';

  @override
  String get smartHomeSiriStep5 =>
      'Optional zu einer Automatisierung hinzufuegen (z.B. taeglich zum Fajr).';

  @override
  String get smartHomeSiriStep6 =>
      'Sagen Sie \"Hey Siri, naechste Gebetszeit\" zum Testen.';

  @override
  String get smartHomeSiriFootnote => 'Erfordert iOS 16 oder neuer.';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant Einrichtung';

  @override
  String get smartHomeHassStep1 =>
      'Installieren Sie HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 =>
      'Suchen Sie in HACS nach \"PrayCalc\" und installieren Sie es.';

  @override
  String get smartHomeHassStep3 =>
      'Gehen Sie zu Einstellungen > Geraete & Dienste > Integration hinzufuegen.';

  @override
  String get smartHomeHassStep4 =>
      'Suchen Sie nach \"PrayCalc\" und waehlen Sie es aus.';

  @override
  String get smartHomeHassStep5 =>
      'Geben Sie Ihren PrayCalc-API-Schluessel ein (in Ihrem Konto generiert).';

  @override
  String get smartHomeHassStep6 =>
      'Konfigurieren Sie Ihren Standort und Ihre Berechnungsmethode.';

  @override
  String get smartHomeHassFootnote =>
      'Erfordert Home Assistant 2024.1+ mit HACS.';

  @override
  String get smartHomeApiKey => 'API-Schluessel';

  @override
  String get smartHomeGenerateApiKey => 'API-Schluessel generieren';

  @override
  String get smartHomeApiKeyNotReady =>
      'Die API-Schluessel-Generierung wird verfuegbar sein, sobald der PrayCalc Smart-Service bereitgestellt ist.';

  @override
  String get smartHomeApiKeyDesc =>
      'Sie benoetigen einen API-Schluessel, um Home Assistant mit Ihrem PrayCalc-Konto zu verbinden.';

  @override
  String get smartHomeLinkedStatus => 'Verknuepft';

  @override
  String get smartHomeNotLinkedStatus => 'Nicht verknuepft';

  @override
  String get smartHomeCouldNotOpen => 'Link konnte nicht geoeffnet werden.';

  @override
  String get smartHomeDevices => 'Geraete';

  @override
  String get smartHomeAddDevice => 'Geraet hinzufuegen';

  @override
  String get smartHomeDeleteDevice => 'Loeschen';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Dieses Geraet entfernen?';

  @override
  String get smartHomeDeviceOnline => 'Online';

  @override
  String get smartHomeDeviceOffline => 'Offline';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Zuletzt gesehen: $time';
  }

  @override
  String get smartHomeDeviceName => 'Geraetename';

  @override
  String get smartHomeDeviceType => 'Geraetetyp';

  @override
  String get smartHomeDeviceTypeTv => 'Fernseher';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Lautsprecher';

  @override
  String get smartHomeDeviceTypeWatch => 'Uhr';

  @override
  String get smartHomeDeviceTypeDesktop => 'Desktop';

  @override
  String get smartHomeDeviceTypeOther => 'Sonstige';

  @override
  String get smartHomeDeviceAdhan => 'Adhan-Benachrichtigungen';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Adhan-Benachrichtigungen auf diesem Geraet empfangen';

  @override
  String get smartHomeDeviceVolume => 'Lautstaerke';

  @override
  String get smartHomeDeviceAudioType => 'Audiotyp';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Aktivierte Gebete';

  @override
  String get smartHomeDeviceSettings => 'Geraeteeinstellungen';

  @override
  String get smartHomeTesting => 'Teste...';

  @override
  String get smartHomeTestSuccess => 'Verbindung bestaetigt';

  @override
  String get smartHomeTestFailed => 'Verbindungstest fehlgeschlagen';

  @override
  String get smartHomePairTv => 'Fernseher koppeln';

  @override
  String get smartHomePairingTv => 'Fernseher wird registriert...';

  @override
  String get smartHomePairTvSuccess => 'Fernseher erfolgreich gekoppelt';

  @override
  String get smartHomePairTvFailed => 'Kopplung des Fernsehers fehlgeschlagen';

  @override
  String get smartHomeLoadingDevices => 'Geraete werden geladen...';

  @override
  String get smartHomeLoadingIntegrations => 'Integrationen werden geladen...';

  @override
  String get smartHomeServiceUnavailable =>
      'Smart-Home-Dienst ist derzeit nicht verfuegbar. Bitte versuchen Sie es spaeter erneut.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total abgeschlossen';
  }

  @override
  String get adhkarReset => 'Zuruecksetzen';

  @override
  String get syncHistoryTitle => 'Synchronisierungsverlauf';

  @override
  String get syncClearHistory => 'Verlauf loeschen';

  @override
  String get syncNoConflicts =>
      'Keine Synchronisierungskonflikte erkannt. Alle Geraete sind synchronisiert.';

  @override
  String get syncDomainSettings => 'Einstellungen';

  @override
  String get syncDomainCities => 'Gespeicherte Staedte';

  @override
  String get syncDomainPrayerLogs => 'Gebetsprotokolle';

  @override
  String get syncTimeJustNow => 'gerade eben';

  @override
  String syncTimeMinAgo(int min) {
    return 'vor ${min}Min.';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return 'vor ${hour}Std.';
  }

  @override
  String syncTimeDayAgo(int day) {
    return 'vor ${day}T.';
  }

  @override
  String get pinCity => 'Anheften';

  @override
  String get pinMaxReached =>
      'Maximal 5 angeheftete Staedte. Upgraden Sie auf Ummat+ fuer mehr.';

  @override
  String pinCityUnpinned(String city) {
    return '$city abgeheftet';
  }

  @override
  String get pinUndo => 'Rueckgaengig';
}
