// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

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
  String get monthFeb => 'Fev';

  @override
  String get monthMar => 'Mar';

  @override
  String get monthApr => 'Avr';

  @override
  String get monthMay => 'Mai';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Aou';

  @override
  String get monthSep => 'Sep';

  @override
  String get monthOct => 'Oct';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Dec';

  @override
  String get monthJanuary => 'Janvier';

  @override
  String get monthFebruary => 'Fevrier';

  @override
  String get monthMarch => 'Mars';

  @override
  String get monthApril => 'Avril';

  @override
  String get monthMayFull => 'Mai';

  @override
  String get monthJune => 'Juin';

  @override
  String get monthJuly => 'Juillet';

  @override
  String get monthAugust => 'Aout';

  @override
  String get monthSeptember => 'Septembre';

  @override
  String get monthOctober => 'Octobre';

  @override
  String get monthNovember => 'Novembre';

  @override
  String get monthDecember => 'Decembre';

  @override
  String get dayMonShort => 'Lun';

  @override
  String get dayTueShort => 'Mar';

  @override
  String get dayWedShort => 'Mer';

  @override
  String get dayThuShort => 'Jeu';

  @override
  String get dayFriShort => 'Ven';

  @override
  String get daySatShort => 'Sam';

  @override
  String get daySunShort => 'Dim';

  @override
  String get dayMonday => 'Lundi';

  @override
  String get dayTuesday => 'Mardi';

  @override
  String get dayWednesday => 'Mercredi';

  @override
  String get dayThursday => 'Jeudi';

  @override
  String get dayFriday => 'Vendredi';

  @override
  String get daySaturday => 'Samedi';

  @override
  String get daySunday => 'Dimanche';

  @override
  String get daySuChart => 'Di';

  @override
  String get dayMoChart => 'Lu';

  @override
  String get dayTuChart => 'Ma';

  @override
  String get dayWeChart => 'Me';

  @override
  String get dayThChart => 'Je';

  @override
  String get dayFrChart => 'Ve';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Choisir une ville';

  @override
  String get setCityFab => 'Definir la ville';

  @override
  String prayerTimesError(Object error) {
    return 'Impossible de calculer les horaires de priere.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer dans';
  }

  @override
  String get ramadanMubarak => 'Ramadan Moubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Jour $day / 30';
  }

  @override
  String get lastTenNights => '10 dernieres nuits';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'EC';

  @override
  String get homeNoCitySelected => 'Aucune ville selectionnee';

  @override
  String get homeNoCityHint =>
      'Appuyez ci-dessus pour chercher votre ville ou activer le GPS.';

  @override
  String get homeCouldNotCalc =>
      'Impossible de calculer les horaires de priere.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Horaires\nmensuels';

  @override
  String get homeActionDuaDhikr => 'Dua &\nDhikr';

  @override
  String get homeActionPrayerStats => 'Statistiques\nde priere';

  @override
  String homePolarBanner(int count) {
    return '$count horaires de priere ne peuvent pas etre calcules pour votre emplacement pendant cette periode (soleil de minuit / nuit polaire). Essayez l\'estimation par latitude la plus proche dans les parametres.';
  }

  @override
  String get settingsTitle => 'Parametres';

  @override
  String get settingsSectionPrayerCalc => 'Calcul de priere';

  @override
  String get settingsCalcMethod => 'Methode de calcul';

  @override
  String get settingsCalcMethodAuto => 'Auto (Dynamique)';

  @override
  String get settingsHanafiAsr => 'Asr Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Facteur d\'ombre 2x (heure d\'Asr tardive)';

  @override
  String get settingsSectionDisplay => 'Affichage';

  @override
  String get settings24hClock => 'Horloge 24 heures';

  @override
  String get settingsFollowSystemTheme => 'Suivre le theme du systeme';

  @override
  String get settingsDarkMode => 'Mode sombre';

  @override
  String get settingsSectionNotifications => 'Notifications';

  @override
  String get settingsPrayerNotifications => 'Notifications de priere';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhan, rappels et parametres par priere';

  @override
  String get settingsPrayerAgendas => 'Agendas de priere';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Rappels personnalises decales des horaires de priere';

  @override
  String get settingsAccount => 'Compte';

  @override
  String get settingsSignInToSync => 'Connectez-vous pour synchroniser';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Conservez vos donnees sur tous vos appareils';

  @override
  String get settingsHomeScreen => 'Ecran d\'accueil';

  @override
  String get settingsSkyGradient => 'Fond degrade du ciel';

  @override
  String get settingsSkyGradientSubtitle =>
      'Couleurs du ciel animees correspondant a l\'heure du jour';

  @override
  String get settingsWeatherGradient => 'Degrade meteo';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Ajuster les couleurs du ciel selon la meteo locale';

  @override
  String get settingsCountdownAnimation => 'Animation du compte a rebours';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Anneau respirant sur le compte a rebours de la prochaine priere';

  @override
  String get settingsPrayerTracking => 'Suivi de priere';

  @override
  String get settingsTrackMyPrayers => 'Suivre mes prieres';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Enregistrez les prieres que vous accomplissez chaque jour';

  @override
  String get settingsPrayerStats => 'Statistiques de priere';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Series, graphiques hebdomadaires et mensuels';

  @override
  String get settingsJumuahKahf => 'Rappel Jumu\'ah Al-Kahf';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Rappel le vendredi pour lire la sourate Al-Kahf';

  @override
  String get settingsTravel => 'Voyage';

  @override
  String get settingsTravelMode => 'Mode voyage';

  @override
  String get settingsTravelModeSubtitle =>
      'Detecter automatiquement quand vous etes loin de chez vous et ajuster les prieres';

  @override
  String get settingsHomeLocation => 'Lieu de residence';

  @override
  String get settingsHomeLocationNotSet =>
      'Non defini — appuyez pour utiliser la position actuelle';

  @override
  String get settingsClearHomeLocation => 'Effacer le lieu de residence';

  @override
  String get settingsTravelRulings => 'Regles de priere en voyage';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, combinaison et directives du voyageur';

  @override
  String get settingsSmartHome => 'Maison connectee';

  @override
  String get settingsSmartHomeIntegrations => 'Integrations maison connectee';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Affichage TV';

  @override
  String get settingsTvHome => 'Affichage TV principal';

  @override
  String get settingsTvHomeSubtitle =>
      'Horloge de priere plein ecran pour la TV';

  @override
  String get settingsMasjidDisplay => 'Affichage mosquee';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Tableau adhan/iqamah pour ecrans de mosquee';

  @override
  String get settingsTvSettings => 'Parametres TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Mode mosquee, decalages iqamah, ambiance';

  @override
  String get settingsAboutPrayCalc => 'A propos de PrayCalc';

  @override
  String get syncSynced => 'Synchronise';

  @override
  String get syncSyncing => 'Synchronisation...';

  @override
  String get syncOffline => 'Hors ligne';

  @override
  String get syncError => 'Erreur de synchronisation';

  @override
  String get notifSettingsTitle => 'Notifications & Adhan';

  @override
  String get notifAdhanLabel => 'Adhan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Rappel : $minutes min avant';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Volume : $pct%';
  }

  @override
  String get notifTestAdhan => 'Tester l\'adhan';

  @override
  String get notifModeOff => 'Desactive';

  @override
  String get notifModeReminderOnly => 'Rappel uniquement';

  @override
  String get notifModeArrival => 'A l\'heure de priere';

  @override
  String get notifModeBoth => 'Rappel + heure de priere';

  @override
  String get citySearchHint => 'Rechercher une ville…';

  @override
  String get citySearchDetectTooltip => 'Detecter ma position';

  @override
  String get citySearchNoCityGps => 'Impossible de detecter la ville par GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Autorisation de localisation refusee. Recherchez manuellement.';

  @override
  String get citySearchNoResults => 'Aucune ville trouvee.';

  @override
  String get citySearchStartTyping => 'Commencez a taper pour chercher…';

  @override
  String get agendasTitle => 'Agendas de priere';

  @override
  String get agendasEmpty =>
      'Pas encore d\'agenda.\nAppuyez sur + pour ajouter un rappel lie a vos prieres.';

  @override
  String get agendasUndo => 'Annuler';

  @override
  String agendasRemoved(String label) {
    return '$label supprime';
  }

  @override
  String get agendaNewTitle => 'Nouvel agenda';

  @override
  String get agendaEditTitle => 'Modifier l\'agenda';

  @override
  String get agendaSave => 'Enregistrer';

  @override
  String get agendaLabelEmpty => 'Le libelle ne peut pas etre vide';

  @override
  String get agendaLabelField => 'Libelle';

  @override
  String get agendaLabelHint => 'ex. Se lever pour Fajr';

  @override
  String get agendaPrayerSection => 'Priere';

  @override
  String get agendaTimeOffsetSection => 'Decalage horaire';

  @override
  String get agendaOffsetAtPrayerTime => 'A l\'heure de priere';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes min avant';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes min apres';
  }

  @override
  String get agendaRepeatSection => 'Repetition';

  @override
  String get agendaNotifTypeSection => 'Type de notification';

  @override
  String get agendaNotifSilent => 'Silencieux';

  @override
  String get agendaNotifSound => 'Son';

  @override
  String get agendaNotifVibrate => 'Vibration';

  @override
  String get agendaDayM => 'L';

  @override
  String get agendaDayT => 'M';

  @override
  String get agendaDayW => 'M';

  @override
  String get agendaDayF => 'V';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Lune & Calendrier Hijri';

  @override
  String moonIlluminated(int pct) {
    return '$pct% illuminee';
  }

  @override
  String get moonFullTonight => 'Pleine lune ce soir !';

  @override
  String get moonNextTomorrow => 'Prochaine pleine lune demain';

  @override
  String moonNextDays(int days) {
    return 'Prochaine pleine lune dans $days jours';
  }

  @override
  String moonAge(String age) {
    return 'Age de la lune : $age jours';
  }

  @override
  String get moonPhaseNewMoon => 'Nouvelle lune';

  @override
  String get moonPhaseWaxingCrescent => 'Premier croissant';

  @override
  String get moonPhaseFirstQuarter => 'Premier quartier';

  @override
  String get moonPhaseWaxingGibbous => 'Gibbeuse croissante';

  @override
  String get moonPhaseFullMoon => 'Pleine lune';

  @override
  String get moonPhaseWaningGibbous => 'Gibbeuse decroissante';

  @override
  String get moonPhaseLastQuarter => 'Dernier quartier';

  @override
  String get moonPhaseWaningCrescent => 'Dernier croissant';

  @override
  String get moonHilalVisibility => 'Prochaine visibilite du Hilal';

  @override
  String get moonRegionMiddleEast => 'Moyen-Orient';

  @override
  String get moonRegionWestAfrica => 'Afrique de l\'Ouest';

  @override
  String get moonRegionSouthAsia => 'Asie du Sud';

  @override
  String get moonRegionEurope => 'Europe';

  @override
  String get moonRegionAmericas => 'Ameriques';

  @override
  String get moonVisible => 'Visible';

  @override
  String get moonNotVisible => 'Non visible';

  @override
  String get moonPossible => 'Possible';

  @override
  String get moonUpcomingDates => 'Prochaines dates islamiques';

  @override
  String get hijriTodayLabel => 'Aujourd\'hui dans le calendrier Hijri';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year H commence';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'dans $days jours';
  }

  @override
  String get moonLunarCycle => 'Cycle lunaire';

  @override
  String moonDayOfCycle(int day) {
    return 'Jour $day / ~29,5';
  }

  @override
  String get moonHilalSightingForecast => 'Prévision d\'observation du Hilal';

  @override
  String get moonHilalVisibilityMap => 'Carte de visibilité du Hilal';

  @override
  String moonDayN(int day) {
    return 'Jour $day';
  }

  @override
  String get moonGlobalSighting => 'Observation mondiale';

  @override
  String get moonZoneNakedEye => 'À l\'œil nu';

  @override
  String get moonZoneBinoculars => 'Jumelles';

  @override
  String get moonZoneVeryDifficult => 'Très difficile';

  @override
  String get moonZoneNotVisible => 'Non visible';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H durera probablement 29 jours. Le croissant devrait être observé le 29, in sha Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H durera probablement 30 jours. Croissant improbable le 29 — le mois se complète en 30 jours.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Arabie saoudite';

  @override
  String get moonFCNACalc => 'FCNA / Calc.';

  @override
  String get moonNorthAmerica => 'Amérique du Nord';

  @override
  String moonNDays(int days) {
    return '$days jours';
  }

  @override
  String moonStarts(String month) {
    return '$month commence :';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Âge de la lune au coucher du soleil : $hours h';
  }

  @override
  String get moon7DayLunarCalendar => 'Calendrier lunaire sur 7 jours';

  @override
  String get moonUpcomingIslamicEvents => 'Prochains événements islamiques';

  @override
  String get moonTodayLabel => 'Aujourd\'hui';

  @override
  String get moonTomorrowLabel => 'Demain';

  @override
  String get calDateCol => 'Date';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Fajr';

  @override
  String get calSunriseCol => 'Lever';

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
      'Definissez d\'abord votre ville\npour voir le calendrier de priere.';

  @override
  String get calShareTooltip => 'Partager le calendrier';

  @override
  String get calPrevMonthTooltip => 'Mois precedent';

  @override
  String get calNextMonthTooltip => 'Mois suivant';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Horaires de priere — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Passer a la boussole';

  @override
  String get qiblaSwitchToAR => 'Passer a la camera AR';

  @override
  String get qiblaNoCityText =>
      'Definissez d\'abord votre ville\npour calculer la direction de la Qibla.';

  @override
  String get qiblaCompassUnavailable =>
      'Capteur de boussole indisponible sur cet appareil.';

  @override
  String get qiblaCalibrate =>
      'Calibrer : bougez votre telephone en forme de 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° du Nord';
  }

  @override
  String qiblaFrom(String city) {
    return 'Depuis $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km de la Kaaba';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km de la Kaaba';
  }

  @override
  String get qiblaFacingQibla => 'Face a la Qibla ✓';

  @override
  String get tasbeehTitle => 'Tasbeeh';

  @override
  String get tasbeehResetTooltip => 'Reinitialiser';

  @override
  String get tasbeehTapToSwitch => 'Appuyez sur le libelle pour changer';

  @override
  String get tasbeehTapToCount => 'Appuyez n\'importe ou pour compter';

  @override
  String get tasbeehResetDialogTitle => 'Reinitialiser le compteur ?';

  @override
  String get tasbeehResetDialogContent => 'Cela remettra le compteur a zero.';

  @override
  String get tasbeehCancel => 'Annuler';

  @override
  String get tasbeehReset => 'Reinitialiser';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Aujourd\'hui : $count dhikr';
  }

  @override
  String get tasbeehLast7Days => '7 derniers jours';

  @override
  String get tasbeehNoHistory =>
      'Pas encore d\'historique — commencez a compter !';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih termine ! $count dhikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Maison connectee';

  @override
  String get smartHomeSubtitle =>
      'Connectez vos appareils aux horaires de priere';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Demandez a Google les horaires de priere et la direction de la Qibla';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Demandez a Alexa les horaires de priere, la prochaine priere et plus';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc =>
      'Creez des raccourcis personnalises pour les horaires de priere';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Automatisez lumieres, ecrans et rappels aux heures de priere';

  @override
  String get smartHomeLinkAccount => 'Lier le compte';

  @override
  String get smartHomeLinked => 'Lie';

  @override
  String get smartHomeUnlink => 'Delier';

  @override
  String get smartHomeSetupInstructions => 'Instructions d\'installation';

  @override
  String get smartHomeRequiresUmmatPlus => 'Necessite Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Depannage';

  @override
  String get smartHomeTestConnection => 'Tester la connexion';

  @override
  String get smartHomeConnectionSuccess => 'Connecte avec succes';

  @override
  String get smartHomeConnectionFailed =>
      'Connexion echouee. Verifiez votre liaison de compte.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Fonctionnalites premium de priere';

  @override
  String get subscriptionUpgrade => 'Passer a Ummat+';

  @override
  String get subscriptionRestore => 'Restaurer l\'achat';

  @override
  String get subscriptionManage => 'Gerer l\'abonnement';

  @override
  String get subscriptionCancel => 'Annuler l\'abonnement';

  @override
  String get subscriptionActive => 'Actif';

  @override
  String get subscriptionExpired => 'Expire';

  @override
  String get subscriptionFree => 'Gratuit';

  @override
  String get subscriptionFreeDesc =>
      'Horaires de priere de base, Qibla, calendrier';

  @override
  String get subscriptionPlusDesc =>
      'Maison connectee, affichage TV, widgets et plus';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count requetes gratuites restantes';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/an';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/mois';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Integration maison connectee';

  @override
  String get subscriptionFeatureTV => 'Mode affichage TV';

  @override
  String get subscriptionFeatureWidgets => 'Widgets d\'ecran d\'accueil';

  @override
  String get subscriptionFeatureWatch => 'Complications de montre';

  @override
  String get subscriptionFeatureSync => 'Synchronisation multi-appareils';

  @override
  String get subscriptionFeatureAdFree => 'Experience sans publicite';

  @override
  String get watchTitle => 'Montre';

  @override
  String get watchNextPrayer => 'Prochaine priere';

  @override
  String get watchAllPrayers => 'Toutes les prieres';

  @override
  String get watchComplication => 'Complication';

  @override
  String get nextPrayer => 'Prochaine priere';

  @override
  String get allPrayers => 'Toutes les prieres';

  @override
  String get today => 'Aujourd\'hui';

  @override
  String get tomorrow => 'Demain';

  @override
  String get thisWeek => 'Cette semaine';

  @override
  String get thisMonth => 'Ce mois';

  @override
  String get loginCreateAccount => 'Creer un compte';

  @override
  String get loginSignIn => 'Se connecter';

  @override
  String get loginWelcomeBack => 'Bon retour';

  @override
  String get loginJoinPrayCalc => 'Rejoignez PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'Synchronisez vos donnees de priere sur tous vos appareils';

  @override
  String get loginContinueGoogle => 'Continuer avec Google';

  @override
  String get loginOr => 'ou';

  @override
  String get loginSigningIn => 'Connexion en cours…';

  @override
  String get loginNameLabel => 'Nom d\'affichage (facultatif)';

  @override
  String get loginEmailLabel => 'E-mail';

  @override
  String get loginPasswordLabel => 'Mot de passe';

  @override
  String get loginEmailRequired => 'L\'e-mail est requis';

  @override
  String get loginEmailInvalid => 'Entrez une adresse e-mail valide';

  @override
  String get loginPasswordRequired => 'Le mot de passe est requis';

  @override
  String get loginPasswordMinLength =>
      'Le mot de passe doit contenir au moins 8 caracteres';

  @override
  String get loginForgotPassword => 'Mot de passe oublie ?';

  @override
  String get loginEnterEmailFirst => 'Entrez d\'abord votre adresse e-mail';

  @override
  String get loginResetSent =>
      'E-mail de reinitialisation du mot de passe envoye';

  @override
  String get loginResetFailed =>
      'Impossible d\'envoyer l\'e-mail de reinitialisation';

  @override
  String get loginNewToPrayCalc => 'Nouveau sur PrayCalc ?';

  @override
  String get loginAlreadyHaveAccount => 'Vous avez deja un compte ?';

  @override
  String get accountTitle => 'Compte';

  @override
  String get accountNotSignedIn => 'Non connecte';

  @override
  String get accountSyncSection => 'Synchronisation';

  @override
  String get accountSyncStatus => 'Etat de synchronisation';

  @override
  String get accountSyncNow => 'Synchroniser maintenant';

  @override
  String get accountSyncHistory => 'Historique de synchronisation';

  @override
  String get accountNoConflicts => 'Aucun conflit detecte';

  @override
  String accountConflictsResolved(int count) {
    return '$count resolus';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Synchronise $time';
  }

  @override
  String get accountOfflineStatus =>
      'Hors ligne. Modifications sauvegardees localement.';

  @override
  String get accountSyncErrorStatus =>
      'Erreur de synchronisation. Nouvelle tentative.';

  @override
  String get accountDataSection => 'Donnees';

  @override
  String get accountExportData => 'Exporter les donnees';

  @override
  String get accountExportSubtitle =>
      'Telecharger vos parametres et journaux de priere';

  @override
  String get accountExportFailed => 'Impossible d\'exporter les donnees';

  @override
  String get accountSignOutTitle => 'Se deconnecter';

  @override
  String get accountSignOutBody =>
      'Vos donnees locales seront conservees. Reconnectez-vous pour reprendre la synchronisation.';

  @override
  String get accountDeleteAccount => 'Supprimer le compte';

  @override
  String get accountDeleteSubtitle =>
      'Supprimer definitivement votre compte et vos donnees';

  @override
  String get accountDeleteBody =>
      'Cela supprimera definitivement votre compte et toutes les donnees synchronisees. Vos donnees locales sur cet appareil ne seront pas supprimees.\n\nCette action est irreversible.';

  @override
  String get accountDeleted => 'Compte supprime';

  @override
  String get accountDeleteFailed => 'Impossible de supprimer le compte';

  @override
  String get accountTimeJustNow => 'a l\'instant';

  @override
  String accountTimeMinAgo(int min) {
    return 'il y a ${min}min';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return 'il y a ${hour}h';
  }

  @override
  String accountTimeDayAgo(int day) {
    return 'il y a ${day}j';
  }

  @override
  String get statsTitle => 'Statistiques de priere';

  @override
  String get statsShareTooltip => 'Partager les stats';

  @override
  String get statsTodayPrayers => 'Prieres d\'aujourd\'hui';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Serie';

  @override
  String get statsDays => 'jours';

  @override
  String get statsThisWeek => 'Cette semaine';

  @override
  String get statsCompletion => 'completion';

  @override
  String get statsThisMonth => 'Ce mois';

  @override
  String get statsMostMissed => 'Plus manquee';

  @override
  String get statsThisWeekLabel => 'cette semaine';

  @override
  String get statsWeeklyChart => 'Completion hebdomadaire par priere';

  @override
  String get statsMonthlyChart => 'Completion mensuelle par priere';

  @override
  String statsTotalLogged(int count) {
    return '$count prieres enregistrees au total';
  }

  @override
  String get statsKeepItUp => 'Continuez !';

  @override
  String get statsShareTitle => 'Statistiques PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Serie : $days jours';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Hebdomadaire : $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Mensuel : $pct%';
  }

  @override
  String get statsShareBreakdown => 'Repartition hebdomadaire :';

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
  String get aboutTitle => 'A propos de PrayCalc';

  @override
  String get aboutWebsite => 'Site web';

  @override
  String get aboutContact => 'Contact';

  @override
  String get aboutLicenses => 'Licences open source';

  @override
  String get aboutCouldNotOpen => 'Impossible d\'ouvrir le lien.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Tous droits reserves.\n\nLes horaires de priere sont calcules avec le moteur pray_calc_dart. La precision depend de votre position GPS et de la methode de calcul selectionnee.';
  }

  @override
  String get commonCancel => 'Annuler';

  @override
  String get commonSave => 'Enregistrer';

  @override
  String get commonDelete => 'Supprimer';

  @override
  String get commonEdit => 'Modifier';

  @override
  String get commonRetry => 'Reessayer';

  @override
  String get commonClose => 'Fermer';

  @override
  String get commonDone => 'Termine';

  @override
  String get commonBack => 'Retour';

  @override
  String get commonNext => 'Suivant';

  @override
  String get commonSkip => 'Passer';

  @override
  String get commonContinue => 'Continuer';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Oui';

  @override
  String get commonNo => 'Non';

  @override
  String get commonShare => 'Partager';

  @override
  String get commonCopy => 'Copier';

  @override
  String get commonCopied => 'Copie dans le presse-papiers';

  @override
  String get commonLoading => 'Chargement...';

  @override
  String get commonError => 'Une erreur est survenue';

  @override
  String get commonErrorRetry =>
      'Une erreur est survenue. Appuyez pour reessayer.';

  @override
  String get commonNoInternet => 'Pas de connexion internet';

  @override
  String get commonOfflineMode => 'Mode hors ligne';

  @override
  String get commonSignIn => 'Se connecter';

  @override
  String get commonSignOut => 'Se deconnecter';

  @override
  String get commonSignUp => 'S\'inscrire';

  @override
  String get commonProfile => 'Profil';

  @override
  String get commonAccount => 'Compte';

  @override
  String get commonAbout => 'A propos';

  @override
  String commonVersion(String version) {
    return 'Version $version';
  }

  @override
  String get commonPrivacyPolicy => 'Politique de confidentialite';

  @override
  String get commonTermsOfService => 'Conditions d\'utilisation';

  @override
  String get commonRateApp => 'Noter l\'application';

  @override
  String get commonFeedback => 'Envoyer un commentaire';

  @override
  String get commonHelp => 'Aide';

  @override
  String get commonLanguage => 'Langue';

  @override
  String get commonOpenSettings => 'Ouvrir les parametres';

  @override
  String get travelNotificationTitle => 'Vous etes en voyage';

  @override
  String get travelNotificationBody =>
      'Les horaires de priere peuvent etre raccourcis. Appuyez pour decouvrir les regles de voyage.';

  @override
  String get travelRulingsTitle => 'Voyage & Priere';

  @override
  String get travelRulingsIntro =>
      'Regles islamiques sur la priere en voyage, avec references des savants du Coran et des Hadiths authentiques.';

  @override
  String get travelWhenTitle => 'Quand le voyage s\'applique-t-il ?';

  @override
  String get travelQasrTitle => 'Raccourcir les prieres (Qasr)';

  @override
  String get travelJamTitle => 'Combiner les prieres (Jam\')';

  @override
  String get travelDurationTitle => 'Duree du voyage';

  @override
  String get travelReferencesTitle => 'References des savants';

  @override
  String get travelLearnMore => 'En savoir plus';

  @override
  String get travelHanafiDefaultTitle =>
      'Pourquoi PrayCalc utilise le Hanafi par defaut';

  @override
  String get travelDeeperScholarly => 'Discussion savante approfondie';

  @override
  String get onboardingTitle1 => 'Les horaires de priere, ou que vous soyez';

  @override
  String get onboardingBody1 =>
      'Horaires de salah precis par GPS pour chaque ville sur terre. Du Fajr a l\'Isha, du lever du soleil au Qiyam. Avec notre propre moteur de calcul, concu pour la precision.';

  @override
  String get onboardingTitle2 => 'Votre emplacement, vos horaires';

  @override
  String get onboardingBody2 =>
      'Cherchez n\'importe quelle ville ou laissez le GPS detecter votre position. PrayCalc trouve les horaires pour 5 millions de villes dans le monde.';

  @override
  String get onboardingTitle3 => 'Ne manquez jamais une priere';

  @override
  String get onboardingBody3 =>
      'L\'adhan a l\'heure de priere, des rappels avant. Des agendas personnalises pour le Suhoor, les cours et plus.';

  @override
  String get onboardingTitle4 => 'Tout ce dont vous avez besoin';

  @override
  String get onboardingBody4 =>
      'Boussole Qibla, calendrier de priere, phase lunaire Hijri, compteur Tasbeeh. Tout en un seul endroit.';

  @override
  String get onboardingSkip => 'Passer';

  @override
  String get onboardingGetStarted => 'Commencer';

  @override
  String get onboardingSignInTitle => 'Connectez-vous a PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Sauvegardez votre historique de priere et\nsynchronisez sur tous vos appareils.';

  @override
  String get onboardingContinueGoogle => 'Continuer avec Google';

  @override
  String get onboardingContinueWithoutAccount => 'Continuer sans compte';

  @override
  String get onboardingSigningIn => 'Connexion en cours…';

  @override
  String get onboardingSelectLanguage => 'Choisir la langue';

  @override
  String get duaDhikrTitle => 'Dua & Dhikr';

  @override
  String get duaDhikrTabDua => 'Dua';

  @override
  String get duaDhikrTabDhikr => 'Dhikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbeeh';

  @override
  String get duaDhikrTabMorning => 'Matin';

  @override
  String get duaDhikrTabEvening => 'Soir';

  @override
  String get duaDhikrMorningAdhkar => 'Adhkar du matin';

  @override
  String get duaDhikrEveningAdhkar => 'Adhkar du soir';

  @override
  String get calGregToggle => 'Grég';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Calendrier annuel';

  @override
  String get calExportIcsTooltip => 'Exporter .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Afficher sur la carte';

  @override
  String get qiblaWaitingCompass => 'En attente de la boussole...';

  @override
  String get qiblaNoCompassSensor =>
      'Pas de capteur de boussole. Direction de la Qibla affichée de manière statique.';

  @override
  String get qiblaAccuracyExcellent => 'Excellente précision';

  @override
  String get qiblaAccuracyGood => 'Bonne précision';

  @override
  String get qiblaAccuracyFair =>
      'Précision correcte. Calibrez en bougeant le téléphone en forme de 8.';

  @override
  String get qiblaAccuracyLow =>
      'Faible précision. Calibrez en bougeant le téléphone en forme de 8.';

  @override
  String get qiblaToTheKaaba => 'vers la Kaaba';

  @override
  String get qiblaYourLocation => 'Votre position';

  @override
  String get qiblaGpsAccurate => 'Précis par GPS';

  @override
  String get qiblaCityCenter => 'Centre-ville';

  @override
  String get moonIlluminatedLabel => 'Illuminée';

  @override
  String get moonAgeLabel => 'Âge';

  @override
  String get moonFirstQtr => 'Premier Qrt';

  @override
  String get moonLastQtr => 'Dernier Qrt';

  @override
  String get moonTonight => 'Ce soir';

  @override
  String get moonTomorrow => 'Demain';

  @override
  String moonDaysAway(int days) {
    return '${days}j';
  }

  @override
  String get moonBeta => 'Bêta';

  @override
  String get setHomeTitle => 'Définir le lieu de résidence';

  @override
  String get setHomeSearchHint => 'Chercher ville, commune ou code postal…';

  @override
  String get setHomeClear => 'Effacer';

  @override
  String get setHomeUseCurrentLocation => 'Utiliser la position actuelle';

  @override
  String get setHomeDetectAndSet =>
      'Détecter votre position et la définir comme domicile';

  @override
  String get setHomeAlreadySet => 'Domicile déjà défini';

  @override
  String setHomeSetAs(String city) {
    return '$city défini comme domicile';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Position actuelle définie comme domicile';

  @override
  String get setHomePermissionDenied =>
      'Autorisation de localisation refusée. Recherchez une ville ci-dessous.';

  @override
  String get setHomeGpsUnavailable =>
      'GPS indisponible. Recherchez manuellement.';

  @override
  String get setHomeNoCitiesFound => 'Aucune ville trouvée.';

  @override
  String get setHomeSearchPrompt => 'Recherchez votre ville de résidence';

  @override
  String get setHomeSearchBody =>
      'Tapez ci-dessus pour rechercher, ou utilisez votre position actuelle. Le mode voyage détectera quand vous êtes loin de chez vous.';

  @override
  String get subscriptionYouHavePlus => 'Vous avez Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Passer à Ummat+';

  @override
  String get subscriptionThankYou => 'Merci de soutenir PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Débloquez les fonctionnalités premium sur tous vos appareils.';

  @override
  String get subscriptionManageSub => 'Gérer l\'abonnement';

  @override
  String get subscriptionWelcome => 'Bienvenue dans Ummat+ !';

  @override
  String get subscriptionSubscribe => 'S\'abonner';

  @override
  String get subscriptionFreeFeatures => 'Fonctionnalités gratuites';

  @override
  String get subscriptionPlusFeatures => 'Fonctionnalités Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Horaires de prière';

  @override
  String get subscriptionFeatureQibla => 'Boussole Qibla';

  @override
  String get subscriptionFeatureCalendar => 'Calendrier mensuel';

  @override
  String get subscriptionFeatureTasbeeh => 'Compteur Tasbeeh';

  @override
  String get subscriptionFeatureMoon => 'Lune & Hijri';

  @override
  String get smartHomeAlertType => 'Type d\'alerte';

  @override
  String get smartHomeAlertModal => 'Modale plein écran';

  @override
  String get smartHomeAlertCorner => 'Notification en coin';

  @override
  String get smartHomeAlertNone => 'Aucune (silencieux)';

  @override
  String get smartHomePauseMedia => 'Pause média pendant l\'adhan';

  @override
  String get smartHomeQuietHours => 'Heures calmes';

  @override
  String get smartHomeQuietFrom => 'De';

  @override
  String get smartHomeQuietTo => 'À';

  @override
  String get smartHomePrayerAudio => 'Audio par prière';

  @override
  String get smartHomeAudioAdhan => 'Adhan';

  @override
  String get smartHomeAudioBeep => 'Bip';

  @override
  String get smartHomeAudioSilent => 'Silencieux';

  @override
  String get aboutPrivacy => 'Politique de confidentialité';

  @override
  String aboutVersion(String version) {
    return 'Version $version';
  }

  @override
  String get notifDefaultAdhan => 'Adhan par défaut';

  @override
  String get notifFajrAdhan => 'Adhan du Fajr';

  @override
  String get notifFajrAdhanSubtitle => 'Joué à l\'heure de la prière du Fajr';

  @override
  String get notifRegularAdhan => 'Adhan régulier';

  @override
  String get notifRegularAdhanSubtitle => 'Joué à Dhuhr, Asr, Maghrib, Isha';

  @override
  String get notifPerPrayerSettings => 'Paramètres par prière';

  @override
  String get notifPreview => 'Aperçu';

  @override
  String get tvSettingsTitle => 'Paramètres TV';

  @override
  String get tvDisplayMode => 'Mode d\'affichage';

  @override
  String get tvMasjidMode => 'Mode mosquee';

  @override
  String get tvMasjidModeSubtitle =>
      'Grand affichage signalétique avec horaires d\'iqamah';

  @override
  String get tvMasjidName => 'Nom de la mosquée';

  @override
  String get tvMasjidNameTapToSet => 'Appuyez pour définir';

  @override
  String get tvClock => 'Horloge';

  @override
  String get tv24hFormat => 'Format 24 heures';

  @override
  String get tvIqamahOffsets => 'Décalages Iqamah (minutes après l\'adhan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset min après l\'adhan';
  }

  @override
  String get tvQrCode => 'Code QR';

  @override
  String get tvShowQrCode => 'Afficher le code QR';

  @override
  String get tvShowQrCodeSubtitle =>
      'Afficher un code QR sur l\'écran de la mosquée';

  @override
  String get tvQrCodeUrl => 'URL du code QR';

  @override
  String get tvAmbientModeSection => 'Mode ambiance';

  @override
  String get tvIdleTimeout => 'Délai d\'inactivité';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes minutes avant l\'activation du mode ambiance';
  }

  @override
  String get tvPhotoInterval => 'Intervalle photo';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds secondes entre les photos';
  }

  @override
  String get tvBackground => 'Arrière-plan';

  @override
  String get tvPhotoCategory => 'Catégorie photo';

  @override
  String get tvLocation => 'Emplacement';

  @override
  String get tvChangeCity => 'Changer de ville';

  @override
  String get tvChangeCitySubtitle => 'Rechercher une autre ville';

  @override
  String get tvScreensaverBg => 'Fond d\'écran de veille';

  @override
  String get tvScreensaverPhotos => 'Photos';

  @override
  String get tvScreensaverPattern => 'Motif géométrique';

  @override
  String get tvScreensaverBoth => 'Photos + motif';

  @override
  String get tvCategoryAll => 'Toutes les catégories';

  @override
  String get tvCategoryMasjids => 'Mosquées';

  @override
  String get tvCategoryInteriors => 'Intérieurs';

  @override
  String get tvCategoryGeometric => 'Géométrique';

  @override
  String get tvCategoryCalligraphy => 'Calligraphie';

  @override
  String get tvCategoryLandscapes => 'Paysages';

  @override
  String get tvCategoryRamadan => 'Ramadan';

  @override
  String get tvPhotoCategoryTitle => 'Catégorie photo';

  @override
  String tvEnterHint(String title) {
    return 'Entrer $title';
  }

  @override
  String get tvSystemDefault => 'Par défaut du système';

  @override
  String get smartHomeIntegrations => 'Intégrations';

  @override
  String get smartHomeLinkedSpeakers => 'Enceintes et écrans liés';

  @override
  String get smartHomeAlertDisplay => 'Affichage d\'alerte';

  @override
  String get smartHomeAtAdhanShow => 'À l\'heure de l\'adhan, afficher';

  @override
  String get smartHomePauseMediaTitle => 'Pause média à l\'adhan';

  @override
  String get smartHomePauseMediaSubtitle => 'Reprend après la fin de l\'adhan';

  @override
  String get smartHomePrayerAudioSection => 'Audio de prière';

  @override
  String get smartHomeQuietHoursSection => 'Heures calmes';

  @override
  String get smartHomeEnableQuietHours => 'Activer les heures calmes';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Toutes les alertes maison connectée sont en silencieux';

  @override
  String get smartHomeNoDevices => 'Aucun appareil lié';

  @override
  String get smartHomeNoDevicesDesc =>
      'Liez Google Home ou Alexa ci-dessus, puis vos enceintes et écrans apparaîtront ici.';

  @override
  String get smartHomeRequiresPlus => 'Maison connectée nécessite Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Contrôlez les annonces de prière sur Google Home, Alexa, Siri et Home Assistant. Configurez quels appareils jouent l\'adhan, quand mettre en pause les médias et définissez les heures calmes.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Diffuser l\'adhan sur les enceintes et écrans Nest.';

  @override
  String get smartHomeEnableAlexa => 'Activer le skill PrayCalc sur Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Demandez à Siri les horaires de prière ou créez des automatisations.';

  @override
  String get smartHomeHassAdd =>
      'Ajoutez via HACS pour un support d\'automatisation complet.';

  @override
  String get smartHomeSetupGuide => 'Guide d\'installation';

  @override
  String get smartHomeSiriSetupTitle => 'Configuration Siri Shortcuts';

  @override
  String get smartHomeSiriStep1 =>
      'Ouvrez l\'application Raccourcis sur votre iPhone ou iPad.';

  @override
  String get smartHomeSiriStep2 =>
      'Appuyez sur « + » pour créer un nouveau raccourci.';

  @override
  String get smartHomeSiriStep3 =>
      'Recherchez « PrayCalc » dans la liste des actions.';

  @override
  String get smartHomeSiriStep4 =>
      'Ajoutez « Next Prayer Time » ou « Prayer Times Today ».';

  @override
  String get smartHomeSiriStep5 =>
      'Ajoutez-le éventuellement à une automatisation (ex. : chaque jour au Fajr).';

  @override
  String get smartHomeSiriStep6 =>
      'Dites « Dis Siri, prochaine prière » pour tester.';

  @override
  String get smartHomeSiriFootnote => 'Nécessite iOS 16 ou ultérieur.';

  @override
  String get smartHomeHassSetupTitle => 'Configuration Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Installez HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 =>
      'Dans HACS, recherchez « PrayCalc » et installez.';

  @override
  String get smartHomeHassStep3 =>
      'Allez dans Paramètres > Appareils & Services > Ajouter une intégration.';

  @override
  String get smartHomeHassStep4 =>
      'Recherchez « PrayCalc » et sélectionnez-le.';

  @override
  String get smartHomeHassStep5 =>
      'Entrez votre clé API PrayCalc (générée dans votre compte).';

  @override
  String get smartHomeHassStep6 =>
      'Configurez votre emplacement et méthode de calcul.';

  @override
  String get smartHomeHassFootnote =>
      'Nécessite Home Assistant 2024.1+ avec HACS.';

  @override
  String get smartHomeApiKey => 'Clé API';

  @override
  String get smartHomeGenerateApiKey => 'Générer une clé API';

  @override
  String get smartHomeApiKeyNotReady =>
      'La génération de clé API sera disponible une fois le service intelligent PrayCalc déployé.';

  @override
  String get smartHomeApiKeyDesc =>
      'Vous aurez besoin d\'une clé API pour connecter Home Assistant à votre compte PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'Lié';

  @override
  String get smartHomeNotLinkedStatus => 'Non lié';

  @override
  String get smartHomeCouldNotOpen => 'Impossible d\'ouvrir le lien.';

  @override
  String get smartHomeDevices => 'Appareils';

  @override
  String get smartHomeAddDevice => 'Ajouter un appareil';

  @override
  String get smartHomeDeleteDevice => 'Supprimer';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Supprimer cet appareil ?';

  @override
  String get smartHomeDeviceOnline => 'En ligne';

  @override
  String get smartHomeDeviceOffline => 'Hors ligne';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Vu pour la dernière fois : $time';
  }

  @override
  String get smartHomeDeviceName => 'Nom de l\'appareil';

  @override
  String get smartHomeDeviceType => 'Type d\'appareil';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Haut-parleur';

  @override
  String get smartHomeDeviceTypeWatch => 'Montre';

  @override
  String get smartHomeDeviceTypeDesktop => 'Ordinateur';

  @override
  String get smartHomeDeviceTypeOther => 'Autre';

  @override
  String get smartHomeDeviceAdhan => 'Notifications d\'adhan';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Recevoir les alertes d\'adhan sur cet appareil';

  @override
  String get smartHomeDeviceVolume => 'Volume';

  @override
  String get smartHomeDeviceAudioType => 'Type audio';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Prières activées';

  @override
  String get smartHomeDeviceSettings => 'Paramètres de l\'appareil';

  @override
  String get smartHomeTesting => 'Test en cours...';

  @override
  String get smartHomeTestSuccess => 'Connexion vérifiée';

  @override
  String get smartHomeTestFailed => 'Échec du test de connexion';

  @override
  String get smartHomePairTv => 'Associer la TV';

  @override
  String get smartHomePairingTv => 'Enregistrement de la TV...';

  @override
  String get smartHomePairTvSuccess => 'TV associée avec succès';

  @override
  String get smartHomePairTvFailed => 'Échec de l\'association de la TV';

  @override
  String get smartHomeLoadingDevices => 'Chargement des appareils...';

  @override
  String get smartHomeLoadingIntegrations => 'Chargement des intégrations...';

  @override
  String get smartHomeServiceUnavailable =>
      'Le service maison connectée est actuellement indisponible. Veuillez réessayer plus tard.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total terminés';
  }

  @override
  String get adhkarReset => 'Réinitialiser';

  @override
  String get syncHistoryTitle => 'Historique de synchronisation';

  @override
  String get syncClearHistory => 'Effacer l\'historique';

  @override
  String get syncNoConflicts =>
      'Aucun conflit de synchronisation. Tous les appareils sont synchronisés.';

  @override
  String get syncDomainSettings => 'Paramètres';

  @override
  String get syncDomainCities => 'Villes sauvegardées';

  @override
  String get syncDomainPrayerLogs => 'Journaux de prière';

  @override
  String get syncTimeJustNow => 'à l\'instant';

  @override
  String syncTimeMinAgo(int min) {
    return 'il y a ${min}min';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return 'il y a ${hour}h';
  }

  @override
  String syncTimeDayAgo(int day) {
    return 'il y a ${day}j';
  }

  @override
  String get pinCity => 'Épingler';

  @override
  String get pinMaxReached =>
      'Maximum 5 villes épinglées. Passez à Ummat+ pour en ajouter.';

  @override
  String pinCityUnpinned(String city) {
    return '$city désépinglée';
  }

  @override
  String get pinUndo => 'Annuler';

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
