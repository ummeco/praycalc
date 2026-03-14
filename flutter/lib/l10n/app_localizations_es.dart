// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

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
  String get monthJan => 'Ene';

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
  String get monthAug => 'Ago';

  @override
  String get monthSep => 'Sep';

  @override
  String get monthOct => 'Oct';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Dic';

  @override
  String get monthJanuary => 'Enero';

  @override
  String get monthFebruary => 'Febrero';

  @override
  String get monthMarch => 'Marzo';

  @override
  String get monthApril => 'Abril';

  @override
  String get monthMayFull => 'Mayo';

  @override
  String get monthJune => 'Junio';

  @override
  String get monthJuly => 'Julio';

  @override
  String get monthAugust => 'Agosto';

  @override
  String get monthSeptember => 'Septiembre';

  @override
  String get monthOctober => 'Octubre';

  @override
  String get monthNovember => 'Noviembre';

  @override
  String get monthDecember => 'Diciembre';

  @override
  String get dayMonShort => 'Lun';

  @override
  String get dayTueShort => 'Mar';

  @override
  String get dayWedShort => 'Mie';

  @override
  String get dayThuShort => 'Jue';

  @override
  String get dayFriShort => 'Vie';

  @override
  String get daySatShort => 'Sab';

  @override
  String get daySunShort => 'Dom';

  @override
  String get dayMonday => 'Lunes';

  @override
  String get dayTuesday => 'Martes';

  @override
  String get dayWednesday => 'Miercoles';

  @override
  String get dayThursday => 'Jueves';

  @override
  String get dayFriday => 'Viernes';

  @override
  String get daySaturday => 'Sabado';

  @override
  String get daySunday => 'Domingo';

  @override
  String get daySuChart => 'Do';

  @override
  String get dayMoChart => 'Lu';

  @override
  String get dayTuChart => 'Ma';

  @override
  String get dayWeChart => 'Mi';

  @override
  String get dayThChart => 'Ju';

  @override
  String get dayFrChart => 'Vi';

  @override
  String get daySaChart => 'Sa';

  @override
  String get chooseCityLabel => 'Elegir una ciudad';

  @override
  String get setCityFab => 'Establecer ciudad';

  @override
  String prayerTimesError(Object error) {
    return 'No se pudieron calcular los horarios de oracion.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer en';
  }

  @override
  String get ramadanMubarak => 'Ramadan Mubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Dia $day / 30';
  }

  @override
  String get lastTenNights => 'Ultimas 10 noches';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'EC';

  @override
  String get homeNoCitySelected => 'Ninguna ciudad seleccionada';

  @override
  String get homeNoCityHint =>
      'Toque arriba para buscar su ciudad o activar GPS.';

  @override
  String get homeCouldNotCalc =>
      'No se pudieron calcular los horarios de oracion.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Horarios\nmensuales';

  @override
  String get homeActionDuaDhikr => 'Dua &\nDhikr';

  @override
  String get homeActionPrayerStats => 'Estadisticas\nde oracion';

  @override
  String homePolarBanner(int count) {
    return '$count horarios de oracion no se pueden calcular para su ubicacion durante este periodo (sol de medianoche / noche polar). Pruebe la estimacion de latitud mas cercana en ajustes.';
  }

  @override
  String get settingsTitle => 'Ajustes';

  @override
  String get settingsSectionPrayerCalc => 'Calculo de oracion';

  @override
  String get settingsCalcMethod => 'Metodo de calculo';

  @override
  String get settingsCalcMethodAuto => 'Automatico (Dinamico)';

  @override
  String get settingsHanafiAsr => 'Asr Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Factor de sombra 2x (hora de Asr tardia)';

  @override
  String get settingsSectionDisplay => 'Pantalla';

  @override
  String get settings24hClock => 'Reloj de 24 horas';

  @override
  String get settingsFollowSystemTheme => 'Seguir tema del sistema';

  @override
  String get settingsDarkMode => 'Modo oscuro';

  @override
  String get settingsSectionNotifications => 'Notificaciones';

  @override
  String get settingsPrayerNotifications => 'Notificaciones de oracion';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhan, recordatorios y ajustes por oracion';

  @override
  String get settingsPrayerAgendas => 'Agendas de oracion';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Recordatorios personalizados desde los horarios de oracion';

  @override
  String get settingsAccount => 'Cuenta';

  @override
  String get settingsSignInToSync => 'Inicie sesion para sincronizar';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Mantenga sus datos en todos los dispositivos';

  @override
  String get settingsHomeScreen => 'Pantalla de inicio';

  @override
  String get settingsSkyGradient => 'Fondo de degradado del cielo';

  @override
  String get settingsSkyGradientSubtitle =>
      'Colores del cielo animados segun la hora del dia';

  @override
  String get settingsWeatherGradient => 'Degradado meteorologico';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Ajustar colores del cielo segun el clima local';

  @override
  String get settingsCountdownAnimation => 'Animacion de cuenta regresiva';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Anillo pulsante en la cuenta regresiva de la proxima oracion';

  @override
  String get settingsPrayerTracking => 'Seguimiento de oracion';

  @override
  String get settingsTrackMyPrayers => 'Seguir mis oraciones';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Registre que oraciones completa cada dia';

  @override
  String get settingsPrayerStats => 'Estadisticas de oracion';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Rachas, graficos semanales y mensuales';

  @override
  String get settingsJumuahKahf => 'Recordatorio Jumu\'ah Al-Kahf';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Recordatorio los viernes para leer Surah Al-Kahf';

  @override
  String get settingsTravel => 'Viaje';

  @override
  String get settingsTravelMode => 'Modo viaje';

  @override
  String get settingsTravelModeSubtitle =>
      'Detectar automaticamente cuando esta lejos de casa y ajustar oraciones';

  @override
  String get settingsHomeLocation => 'Ubicacion del hogar';

  @override
  String get settingsHomeLocationNotSet =>
      'No establecida — toque para usar la ubicacion actual';

  @override
  String get settingsClearHomeLocation => 'Borrar ubicacion del hogar';

  @override
  String get settingsTravelRulings => 'Reglas de oracion en viaje';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, combinacion y directrices del viajero';

  @override
  String get settingsSmartHome => 'Hogar inteligente';

  @override
  String get settingsSmartHomeIntegrations =>
      'Integraciones de hogar inteligente';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Pantalla de TV';

  @override
  String get settingsTvHome => 'Pantalla principal de TV';

  @override
  String get settingsTvHomeSubtitle =>
      'Reloj de oracion en pantalla completa para TV';

  @override
  String get settingsMasjidDisplay => 'Pantalla de mezquita';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Tabla de adhan/iqamah para pantallas de mezquita';

  @override
  String get settingsTvSettings => 'Ajustes de TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Modo mezquita, desplazamientos de iqamah, ambiente';

  @override
  String get settingsAboutPrayCalc => 'Acerca de PrayCalc';

  @override
  String get syncSynced => 'Sincronizado';

  @override
  String get syncSyncing => 'Sincronizando...';

  @override
  String get syncOffline => 'Sin conexion';

  @override
  String get syncError => 'Error de sincronizacion';

  @override
  String get notifSettingsTitle => 'Notificaciones y Adhan';

  @override
  String get notifAdhanLabel => 'Adhan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Recordatorio: $minutes min antes';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Volumen: $pct%';
  }

  @override
  String get notifTestAdhan => 'Probar adhan';

  @override
  String get notifModeOff => 'Desactivado';

  @override
  String get notifModeReminderOnly => 'Solo recordatorio';

  @override
  String get notifModeArrival => 'A la hora de oracion';

  @override
  String get notifModeBoth => 'Recordatorio + hora de oracion';

  @override
  String get citySearchHint => 'Buscar ciudad…';

  @override
  String get citySearchDetectTooltip => 'Detectar mi ubicacion';

  @override
  String get citySearchNoCityGps => 'No se pudo detectar la ciudad por GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Permiso de ubicacion denegado. Busque manualmente.';

  @override
  String get citySearchNoResults => 'No se encontraron ciudades.';

  @override
  String get citySearchStartTyping => 'Empiece a escribir para buscar…';

  @override
  String get agendasTitle => 'Agendas de oracion';

  @override
  String get agendasEmpty =>
      'Aun no hay agendas.\nToque + para agregar un recordatorio vinculado a sus oraciones.';

  @override
  String get agendasUndo => 'Deshacer';

  @override
  String agendasRemoved(String label) {
    return '$label eliminado';
  }

  @override
  String get agendaNewTitle => 'Nueva agenda';

  @override
  String get agendaEditTitle => 'Editar agenda';

  @override
  String get agendaSave => 'Guardar';

  @override
  String get agendaLabelEmpty => 'La etiqueta no puede estar vacia';

  @override
  String get agendaLabelField => 'Etiqueta';

  @override
  String get agendaLabelHint => 'ej. Despertar para Fajr';

  @override
  String get agendaPrayerSection => 'Oracion';

  @override
  String get agendaTimeOffsetSection => 'Desplazamiento de tiempo';

  @override
  String get agendaOffsetAtPrayerTime => 'A la hora de oracion';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes min antes';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes min despues';
  }

  @override
  String get agendaRepeatSection => 'Repetir';

  @override
  String get agendaNotifTypeSection => 'Tipo de notificacion';

  @override
  String get agendaNotifSilent => 'Silencioso';

  @override
  String get agendaNotifSound => 'Sonido';

  @override
  String get agendaNotifVibrate => 'Vibracion';

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
  String get moonTitle => 'Luna y Calendario Hijri';

  @override
  String moonIlluminated(int pct) {
    return '$pct% iluminada';
  }

  @override
  String get moonFullTonight => 'Luna llena esta noche!';

  @override
  String get moonNextTomorrow => 'Proxima luna llena manana';

  @override
  String moonNextDays(int days) {
    return 'Proxima luna llena en $days dias';
  }

  @override
  String moonAge(String age) {
    return 'Edad de la luna: $age dias';
  }

  @override
  String get moonPhaseNewMoon => 'Luna nueva';

  @override
  String get moonPhaseWaxingCrescent => 'Creciente';

  @override
  String get moonPhaseFirstQuarter => 'Cuarto creciente';

  @override
  String get moonPhaseWaxingGibbous => 'Gibosa creciente';

  @override
  String get moonPhaseFullMoon => 'Luna llena';

  @override
  String get moonPhaseWaningGibbous => 'Gibosa menguante';

  @override
  String get moonPhaseLastQuarter => 'Cuarto menguante';

  @override
  String get moonPhaseWaningCrescent => 'Menguante';

  @override
  String get moonHilalVisibility => 'Proxima visibilidad del Hilal';

  @override
  String get moonRegionMiddleEast => 'Medio Oriente';

  @override
  String get moonRegionWestAfrica => 'Africa Occidental';

  @override
  String get moonRegionSouthAsia => 'Asia del Sur';

  @override
  String get moonRegionEurope => 'Europa';

  @override
  String get moonRegionAmericas => 'Americas';

  @override
  String get moonVisible => 'Visible';

  @override
  String get moonNotVisible => 'No visible';

  @override
  String get moonPossible => 'Posible';

  @override
  String get moonUpcomingDates => 'Proximas fechas islamicas';

  @override
  String get hijriTodayLabel => 'Hoy en el calendario Hijri';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadan $year H comienza';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'en $days dias';
  }

  @override
  String get moonLunarCycle => 'Ciclo lunar';

  @override
  String moonDayOfCycle(int day) {
    return 'Día $day de ~29.5';
  }

  @override
  String get moonHilalSightingForecast =>
      'Pronóstico de avistamiento del Hilal';

  @override
  String get moonHilalVisibilityMap => 'Mapa de visibilidad del Hilal';

  @override
  String moonDayN(int day) {
    return 'Día $day';
  }

  @override
  String get moonGlobalSighting => 'Avistamiento global';

  @override
  String get moonZoneNakedEye => 'A simple vista';

  @override
  String get moonZoneBinoculars => 'Binoculares';

  @override
  String get moonZoneVeryDifficult => 'Muy difícil';

  @override
  String get moonZoneNotVisible => 'No visible';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H probablemente tendrá 29 días. Se espera ver la luna creciente el día 29, in sha Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H probablemente tendrá 30 días. La luna creciente es improbable el día 29. El mes completa 30 días.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Arabia Saudita';

  @override
  String get moonFCNACalc => 'FCNA / Cálc.';

  @override
  String get moonNorthAmerica => 'Norteamérica';

  @override
  String moonNDays(int days) {
    return '$days días';
  }

  @override
  String moonStarts(String month) {
    return '$month comienza:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Edad de la luna al atardecer: $hours h';
  }

  @override
  String get moon7DayLunarCalendar => 'Calendario lunar de 7 días';

  @override
  String get moonUpcomingIslamicEvents => 'Próximos eventos islámicos';

  @override
  String get moonTodayLabel => 'Hoy';

  @override
  String get moonTomorrowLabel => 'Mañana';

  @override
  String get calDateCol => 'Fecha';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Fajr';

  @override
  String get calSunriseCol => 'Amanecer';

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
      'Establezca su ciudad primero\npara ver el calendario de oracion.';

  @override
  String get calShareTooltip => 'Compartir calendario';

  @override
  String get calPrevMonthTooltip => 'Mes anterior';

  @override
  String get calNextMonthTooltip => 'Mes siguiente';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Horarios de oracion — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Cambiar a brujula';

  @override
  String get qiblaSwitchToAR => 'Cambiar a camara AR';

  @override
  String get qiblaNoCityText =>
      'Establezca su ciudad primero\npara calcular la direccion de la Qibla.';

  @override
  String get qiblaCompassUnavailable =>
      'Sensor de brujula no disponible en este dispositivo.';

  @override
  String get qiblaCalibrate => 'Calibrar: mueva su telefono en forma de 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° del Norte';
  }

  @override
  String qiblaFrom(String city) {
    return 'Desde $city';
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
  String get qiblaFacingQibla => 'Mirando hacia la Qibla ✓';

  @override
  String get tasbeehTitle => 'Tasbeeh';

  @override
  String get tasbeehResetTooltip => 'Reiniciar';

  @override
  String get tasbeehTapToSwitch => 'Toque la etiqueta para cambiar';

  @override
  String get tasbeehTapToCount => 'Toque en cualquier lugar para contar';

  @override
  String get tasbeehResetDialogTitle => 'Reiniciar contador?';

  @override
  String get tasbeehResetDialogContent =>
      'Esto reiniciara el conteo actual a cero.';

  @override
  String get tasbeehCancel => 'Cancelar';

  @override
  String get tasbeehReset => 'Reiniciar';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Hoy: $count dhikr';
  }

  @override
  String get tasbeehLast7Days => 'Ultimos 7 dias';

  @override
  String get tasbeehNoHistory => 'Sin historial aun — comience a contar!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih completo! $count dhikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Hogar inteligente';

  @override
  String get smartHomeSubtitle =>
      'Conecte sus dispositivos a los horarios de oracion';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Pregunte a Google los horarios de oracion y la direccion de la Qibla';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Pregunte a Alexa los horarios de oracion, la proxima oracion y mas';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc =>
      'Cree atajos personalizados para los horarios de oracion';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Automatice luces, pantallas y recordatorios en los horarios de oracion';

  @override
  String get smartHomeLinkAccount => 'Vincular cuenta';

  @override
  String get smartHomeLinked => 'Vinculado';

  @override
  String get smartHomeUnlink => 'Desvincular';

  @override
  String get smartHomeSetupInstructions => 'Instrucciones de configuracion';

  @override
  String get smartHomeRequiresUmmatPlus => 'Requiere Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Solucion de problemas';

  @override
  String get smartHomeTestConnection => 'Probar conexion';

  @override
  String get smartHomeConnectionSuccess => 'Conectado exitosamente';

  @override
  String get smartHomeConnectionFailed =>
      'Conexion fallida. Verifique el vinculo de su cuenta.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Funciones premium de oracion';

  @override
  String get subscriptionUpgrade => 'Actualizar a Ummat+';

  @override
  String get subscriptionRestore => 'Restaurar compra';

  @override
  String get subscriptionManage => 'Gestionar suscripcion';

  @override
  String get subscriptionCancel => 'Cancelar suscripcion';

  @override
  String get subscriptionActive => 'Activa';

  @override
  String get subscriptionExpired => 'Expirada';

  @override
  String get subscriptionFree => 'Gratis';

  @override
  String get subscriptionFreeDesc =>
      'Horarios basicos de oracion, Qibla, calendario';

  @override
  String get subscriptionPlusDesc =>
      'Hogar inteligente, pantalla de TV, widgets y mas';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '$count consultas gratuitas restantes';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/ano';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/mes';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Integracion de hogar inteligente';

  @override
  String get subscriptionFeatureTV => 'Modo pantalla de TV';

  @override
  String get subscriptionFeatureWidgets => 'Widgets de pantalla de inicio';

  @override
  String get subscriptionFeatureWatch => 'Complicaciones de reloj';

  @override
  String get subscriptionFeatureSync => 'Sincronizacion entre dispositivos';

  @override
  String get subscriptionFeatureAdFree => 'Experiencia sin anuncios';

  @override
  String get watchTitle => 'Reloj';

  @override
  String get watchNextPrayer => 'Proxima oracion';

  @override
  String get watchAllPrayers => 'Todas las oraciones';

  @override
  String get watchComplication => 'Complicacion';

  @override
  String get nextPrayer => 'Proxima oracion';

  @override
  String get allPrayers => 'Todas las oraciones';

  @override
  String get today => 'Hoy';

  @override
  String get tomorrow => 'Manana';

  @override
  String get thisWeek => 'Esta semana';

  @override
  String get thisMonth => 'Este mes';

  @override
  String get loginCreateAccount => 'Crear cuenta';

  @override
  String get loginSignIn => 'Iniciar sesion';

  @override
  String get loginWelcomeBack => 'Bienvenido de nuevo';

  @override
  String get loginJoinPrayCalc => 'Unase a PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'Sincronice sus datos de oracion en todos los dispositivos';

  @override
  String get loginContinueGoogle => 'Continuar con Google';

  @override
  String get loginOr => 'o';

  @override
  String get loginSigningIn => 'Iniciando sesion…';

  @override
  String get loginNameLabel => 'Nombre visible (opcional)';

  @override
  String get loginEmailLabel => 'Correo electronico';

  @override
  String get loginPasswordLabel => 'Contrasena';

  @override
  String get loginEmailRequired => 'El correo electronico es obligatorio';

  @override
  String get loginEmailInvalid => 'Ingrese un correo electronico valido';

  @override
  String get loginPasswordRequired => 'La contrasena es obligatoria';

  @override
  String get loginPasswordMinLength =>
      'La contrasena debe tener al menos 8 caracteres';

  @override
  String get loginForgotPassword => 'Olvido su contrasena?';

  @override
  String get loginEnterEmailFirst => 'Ingrese primero su correo electronico';

  @override
  String get loginResetSent => 'Correo de restablecimiento enviado';

  @override
  String get loginResetFailed =>
      'No se pudo enviar el correo de restablecimiento';

  @override
  String get loginNewToPrayCalc => 'Nuevo en PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Ya tiene una cuenta?';

  @override
  String get accountTitle => 'Cuenta';

  @override
  String get accountNotSignedIn => 'No ha iniciado sesion';

  @override
  String get accountSyncSection => 'Sincronizacion';

  @override
  String get accountSyncStatus => 'Estado de sincronizacion';

  @override
  String get accountSyncNow => 'Sincronizar ahora';

  @override
  String get accountSyncHistory => 'Historial de sincronizacion';

  @override
  String get accountNoConflicts => 'Sin conflictos detectados';

  @override
  String accountConflictsResolved(int count) {
    return '$count resueltos';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Sincronizado $time';
  }

  @override
  String get accountOfflineStatus =>
      'Sin conexion. Cambios guardados localmente.';

  @override
  String get accountSyncErrorStatus =>
      'Error de sincronizacion. Se reintentara.';

  @override
  String get accountDataSection => 'Datos';

  @override
  String get accountExportData => 'Exportar datos';

  @override
  String get accountExportSubtitle =>
      'Descargue sus ajustes y registros de oracion';

  @override
  String get accountExportFailed => 'No se pudieron exportar los datos';

  @override
  String get accountSignOutTitle => 'Cerrar sesion';

  @override
  String get accountSignOutBody =>
      'Sus datos locales se mantendran. Inicie sesion de nuevo para reanudar la sincronizacion.';

  @override
  String get accountDeleteAccount => 'Eliminar cuenta';

  @override
  String get accountDeleteSubtitle =>
      'Eliminar permanentemente su cuenta y datos';

  @override
  String get accountDeleteBody =>
      'Esto eliminara permanentemente su cuenta y todos los datos sincronizados. Sus datos locales en este dispositivo no seran eliminados.\n\nEsta accion no se puede deshacer.';

  @override
  String get accountDeleted => 'Cuenta eliminada';

  @override
  String get accountDeleteFailed => 'No se pudo eliminar la cuenta';

  @override
  String get accountTimeJustNow => 'ahora mismo';

  @override
  String accountTimeMinAgo(int min) {
    return 'hace ${min}min';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return 'hace ${hour}h';
  }

  @override
  String accountTimeDayAgo(int day) {
    return 'hace ${day}d';
  }

  @override
  String get statsTitle => 'Estadisticas de oracion';

  @override
  String get statsShareTooltip => 'Compartir estadisticas';

  @override
  String get statsTodayPrayers => 'Oraciones de hoy';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Racha';

  @override
  String get statsDays => 'dias';

  @override
  String get statsThisWeek => 'Esta semana';

  @override
  String get statsCompletion => 'completado';

  @override
  String get statsThisMonth => 'Este mes';

  @override
  String get statsMostMissed => 'Mas perdida';

  @override
  String get statsThisWeekLabel => 'esta semana';

  @override
  String get statsWeeklyChart => 'Completado semanal por oracion';

  @override
  String get statsMonthlyChart => 'Completado mensual por oracion';

  @override
  String statsTotalLogged(int count) {
    return '$count oraciones registradas en total';
  }

  @override
  String get statsKeepItUp => 'Siga asi!';

  @override
  String get statsShareTitle => 'Estadisticas PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Racha: $days dias';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Semanal: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Mensual: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Desglose semanal:';

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
  String get aboutTitle => 'Acerca de PrayCalc';

  @override
  String get aboutWebsite => 'Sitio web';

  @override
  String get aboutContact => 'Contacto';

  @override
  String get aboutLicenses => 'Licencias de codigo abierto';

  @override
  String get aboutCouldNotOpen => 'No se pudo abrir el enlace.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Todos los derechos reservados.\n\nLos horarios de oracion se calculan con el motor pray_calc_dart. La precision depende de su ubicacion GPS y el metodo de calculo seleccionado.';
  }

  @override
  String get commonCancel => 'Cancelar';

  @override
  String get commonSave => 'Guardar';

  @override
  String get commonDelete => 'Eliminar';

  @override
  String get commonEdit => 'Editar';

  @override
  String get commonRetry => 'Reintentar';

  @override
  String get commonClose => 'Cerrar';

  @override
  String get commonDone => 'Hecho';

  @override
  String get commonBack => 'Atras';

  @override
  String get commonNext => 'Siguiente';

  @override
  String get commonSkip => 'Omitir';

  @override
  String get commonContinue => 'Continuar';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Si';

  @override
  String get commonNo => 'No';

  @override
  String get commonShare => 'Compartir';

  @override
  String get commonCopy => 'Copiar';

  @override
  String get commonCopied => 'Copiado al portapapeles';

  @override
  String get commonLoading => 'Cargando...';

  @override
  String get commonError => 'Algo salio mal';

  @override
  String get commonErrorRetry => 'Algo salio mal. Toque para reintentar.';

  @override
  String get commonNoInternet => 'Sin conexion a internet';

  @override
  String get commonOfflineMode => 'Modo sin conexion';

  @override
  String get commonSignIn => 'Iniciar sesion';

  @override
  String get commonSignOut => 'Cerrar sesion';

  @override
  String get commonSignUp => 'Registrarse';

  @override
  String get commonProfile => 'Perfil';

  @override
  String get commonAccount => 'Cuenta';

  @override
  String get commonAbout => 'Acerca de';

  @override
  String commonVersion(String version) {
    return 'Version $version';
  }

  @override
  String get commonPrivacyPolicy => 'Politica de privacidad';

  @override
  String get commonTermsOfService => 'Terminos de servicio';

  @override
  String get commonRateApp => 'Calificar la app';

  @override
  String get commonFeedback => 'Enviar comentarios';

  @override
  String get commonHelp => 'Ayuda';

  @override
  String get commonLanguage => 'Idioma';

  @override
  String get commonOpenSettings => 'Abrir ajustes';

  @override
  String get travelNotificationTitle => 'Esta viajando';

  @override
  String get travelNotificationBody =>
      'Los horarios de oracion pueden acortarse. Toque para conocer las reglas de viaje.';

  @override
  String get travelRulingsTitle => 'Viaje y oracion';

  @override
  String get travelRulingsIntro =>
      'Reglas islamicas sobre la oracion durante el viaje, con referencias de eruditos del Coran y colecciones de Hadith autenticos.';

  @override
  String get travelWhenTitle => 'Cuando se aplica el viaje?';

  @override
  String get travelQasrTitle => 'Acortar oraciones (Qasr)';

  @override
  String get travelJamTitle => 'Combinar oraciones (Jam\')';

  @override
  String get travelDurationTitle => 'Duracion del viaje';

  @override
  String get travelReferencesTitle => 'Referencias de eruditos';

  @override
  String get travelLearnMore => 'Saber mas';

  @override
  String get travelHanafiDefaultTitle =>
      'Por que PrayCalc usa el Hanafi por defecto';

  @override
  String get travelDeeperScholarly => 'Discusion academica profunda';

  @override
  String get onboardingTitle1 => 'Horarios de oracion, donde quiera que este';

  @override
  String get onboardingBody1 =>
      'Horarios de salah precisos por GPS para cada ciudad del mundo. De Fajr a Isha, del amanecer al Qiyam. Con nuestro propio motor de calculo, creado para la precision.';

  @override
  String get onboardingTitle2 => 'Su ubicacion, sus horarios';

  @override
  String get onboardingBody2 =>
      'Busque cualquier ciudad o deje que el GPS detecte su ubicacion. PrayCalc encuentra horarios para 5 millones de ciudades en todo el mundo.';

  @override
  String get onboardingTitle3 => 'Nunca pierda una oracion';

  @override
  String get onboardingBody3 =>
      'Adhan a la hora de oracion, recordatorios antes. Agendas personalizadas para Suhoor, clases y mas.';

  @override
  String get onboardingTitle4 => 'Todo lo que necesita';

  @override
  String get onboardingBody4 =>
      'Brujula Qibla, calendario de oracion, fase lunar Hijri, contador Tasbeeh. Todo en un solo lugar.';

  @override
  String get onboardingSkip => 'Omitir';

  @override
  String get onboardingGetStarted => 'Comenzar';

  @override
  String get onboardingSignInTitle => 'Inicie sesion en PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Guarde su historial de oracion y\nsincronice en todos sus dispositivos.';

  @override
  String get onboardingContinueGoogle => 'Continuar con Google';

  @override
  String get onboardingContinueWithoutAccount => 'Continuar sin cuenta';

  @override
  String get onboardingSigningIn => 'Iniciando sesion…';

  @override
  String get onboardingSelectLanguage => 'Seleccionar idioma';

  @override
  String get duaDhikrTitle => 'Dua & Dhikr';

  @override
  String get duaDhikrTabDua => 'Dua';

  @override
  String get duaDhikrTabDhikr => 'Dhikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbeeh';

  @override
  String get duaDhikrTabMorning => 'Mañana';

  @override
  String get duaDhikrTabEvening => 'Noche';

  @override
  String get duaDhikrMorningAdhkar => 'Adhkar de la mañana';

  @override
  String get duaDhikrEveningAdhkar => 'Adhkar de la noche';

  @override
  String get calGregToggle => 'Greg';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Calendario anual';

  @override
  String get calExportIcsTooltip => 'Exportar .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Mostrar en mapa';

  @override
  String get qiblaWaitingCompass => 'Esperando brújula...';

  @override
  String get qiblaNoCompassSensor =>
      'Sin sensor de brújula. Mostrando dirección de la Qibla estáticamente.';

  @override
  String get qiblaAccuracyExcellent => 'Precisión excelente';

  @override
  String get qiblaAccuracyGood => 'Buena precisión';

  @override
  String get qiblaAccuracyFair =>
      'Precisión aceptable. Calibre moviendo el teléfono en forma de 8.';

  @override
  String get qiblaAccuracyLow =>
      'Precisión baja. Calibre moviendo el teléfono en forma de 8.';

  @override
  String get qiblaToTheKaaba => 'hacia la Kaaba';

  @override
  String get qiblaYourLocation => 'Su ubicación';

  @override
  String get qiblaGpsAccurate => 'GPS preciso';

  @override
  String get qiblaCityCenter => 'Centro de la ciudad';

  @override
  String get moonIlluminatedLabel => 'Iluminada';

  @override
  String get moonAgeLabel => 'Edad';

  @override
  String get moonFirstQtr => 'Primer Cuarto';

  @override
  String get moonLastQtr => 'Último Cuarto';

  @override
  String get moonTonight => 'Esta noche';

  @override
  String get moonTomorrow => 'Mañana';

  @override
  String moonDaysAway(int days) {
    return '${days}d';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Establecer ubicación de hogar';

  @override
  String get setHomeSearchHint => 'Buscar ciudad, pueblo o código postal…';

  @override
  String get setHomeClear => 'Borrar';

  @override
  String get setHomeUseCurrentLocation => 'Usar ubicación actual';

  @override
  String get setHomeDetectAndSet =>
      'Detectar su ubicación y establecerla como hogar';

  @override
  String get setHomeAlreadySet => 'Hogar ya establecido';

  @override
  String setHomeSetAs(String city) {
    return '$city establecida como hogar';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Ubicación actual establecida como hogar';

  @override
  String get setHomePermissionDenied =>
      'Permiso de ubicación denegado. Busque una ciudad abajo.';

  @override
  String get setHomeGpsUnavailable => 'GPS no disponible. Busque manualmente.';

  @override
  String get setHomeNoCitiesFound => 'No se encontraron ciudades.';

  @override
  String get setHomeSearchPrompt => 'Busque su ciudad de hogar';

  @override
  String get setHomeSearchBody =>
      'Escriba arriba para buscar, o use su ubicación actual. El modo viaje detectará cuando esté lejos de casa.';

  @override
  String get subscriptionYouHavePlus => 'Tiene Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Actualizar a Ummat+';

  @override
  String get subscriptionThankYou => 'Gracias por apoyar PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Desbloquee funciones premium en todos sus dispositivos.';

  @override
  String get subscriptionManageSub => 'Gestionar suscripción';

  @override
  String get subscriptionWelcome => 'Bienvenido a Ummat+!';

  @override
  String get subscriptionSubscribe => 'Suscribirse';

  @override
  String get subscriptionFreeFeatures => 'Funciones gratuitas';

  @override
  String get subscriptionPlusFeatures => 'Funciones Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Horarios de oración';

  @override
  String get subscriptionFeatureQibla => 'Brújula Qibla';

  @override
  String get subscriptionFeatureCalendar => 'Calendario mensual';

  @override
  String get subscriptionFeatureTasbeeh => 'Contador Tasbeeh';

  @override
  String get subscriptionFeatureMoon => 'Luna e Hijri';

  @override
  String get smartHomeAlertType => 'Tipo de alerta';

  @override
  String get smartHomeAlertModal => 'Modal de pantalla completa';

  @override
  String get smartHomeAlertCorner => 'Notificación en esquina';

  @override
  String get smartHomeAlertNone => 'Ninguna (silencioso)';

  @override
  String get smartHomePauseMedia => 'Pausar medios durante el adhan';

  @override
  String get smartHomeQuietHours => 'Horas de silencio';

  @override
  String get smartHomeQuietFrom => 'Desde';

  @override
  String get smartHomeQuietTo => 'Hasta';

  @override
  String get smartHomePrayerAudio => 'Audio por oración';

  @override
  String get smartHomeAudioAdhan => 'Adhan';

  @override
  String get smartHomeAudioBeep => 'Pitido';

  @override
  String get smartHomeAudioSilent => 'Silencioso';

  @override
  String get aboutPrivacy => 'Política de privacidad';

  @override
  String aboutVersion(String version) {
    return 'Versión $version';
  }

  @override
  String get notifDefaultAdhan => 'Adhan predeterminado';

  @override
  String get notifFajrAdhan => 'Adhan del Fajr';

  @override
  String get notifFajrAdhanSubtitle => 'Se reproduce a la hora del Fajr';

  @override
  String get notifRegularAdhan => 'Adhan regular';

  @override
  String get notifRegularAdhanSubtitle =>
      'Se reproduce en Dhuhr, Asr, Maghrib, Isha';

  @override
  String get notifPerPrayerSettings => 'Ajustes por oración';

  @override
  String get notifPreview => 'Vista previa';

  @override
  String get tvSettingsTitle => 'Ajustes de TV';

  @override
  String get tvDisplayMode => 'Modo de pantalla';

  @override
  String get tvMasjidMode => 'Modo mezquita';

  @override
  String get tvMasjidModeSubtitle =>
      'Pantalla grande de señalización con horarios de iqamah';

  @override
  String get tvMasjidName => 'Nombre de la mezquita';

  @override
  String get tvMasjidNameTapToSet => 'Toque para establecer';

  @override
  String get tvClock => 'Reloj';

  @override
  String get tv24hFormat => 'Formato 24 horas';

  @override
  String get tvIqamahOffsets =>
      'Desplazamientos de Iqamah (minutos después del adhan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset min después del adhan';
  }

  @override
  String get tvQrCode => 'Código QR';

  @override
  String get tvShowQrCode => 'Mostrar código QR';

  @override
  String get tvShowQrCodeSubtitle =>
      'Mostrar un código QR en la pantalla de la mezquita';

  @override
  String get tvQrCodeUrl => 'URL del código QR';

  @override
  String get tvAmbientModeSection => 'Modo ambiente';

  @override
  String get tvIdleTimeout => 'Tiempo de inactividad';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes minutos antes de que se active el modo ambiente';
  }

  @override
  String get tvPhotoInterval => 'Intervalo de fotos';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds segundos entre fotos';
  }

  @override
  String get tvBackground => 'Fondo';

  @override
  String get tvPhotoCategory => 'Categoría de fotos';

  @override
  String get tvLocation => 'Ubicación';

  @override
  String get tvChangeCity => 'Cambiar ciudad';

  @override
  String get tvChangeCitySubtitle => 'Buscar otra ciudad';

  @override
  String get tvScreensaverBg => 'Fondo del protector de pantalla';

  @override
  String get tvScreensaverPhotos => 'Fotos';

  @override
  String get tvScreensaverPattern => 'Patrón geométrico';

  @override
  String get tvScreensaverBoth => 'Fotos + patrón';

  @override
  String get tvCategoryAll => 'Todas las categorías';

  @override
  String get tvCategoryMasjids => 'Mezquitas';

  @override
  String get tvCategoryInteriors => 'Interiores';

  @override
  String get tvCategoryGeometric => 'Geométrico';

  @override
  String get tvCategoryCalligraphy => 'Caligrafía';

  @override
  String get tvCategoryLandscapes => 'Paisajes';

  @override
  String get tvCategoryRamadan => 'Ramadán';

  @override
  String get tvPhotoCategoryTitle => 'Categoría de fotos';

  @override
  String tvEnterHint(String title) {
    return 'Introduzca $title';
  }

  @override
  String get tvSystemDefault => 'Predeterminado del sistema';

  @override
  String get smartHomeIntegrations => 'Integraciones';

  @override
  String get smartHomeLinkedSpeakers => 'Altavoces y pantallas vinculados';

  @override
  String get smartHomeAlertDisplay => 'Pantalla de alerta';

  @override
  String get smartHomeAtAdhanShow => 'Al momento del adhan mostrar';

  @override
  String get smartHomePauseMediaTitle => 'Pausar medios durante el adhan';

  @override
  String get smartHomePauseMediaSubtitle =>
      'Se reanuda después de que termine el adhan';

  @override
  String get smartHomePrayerAudioSection => 'Audio de oración';

  @override
  String get smartHomeQuietHoursSection => 'Horas de silencio';

  @override
  String get smartHomeEnableQuietHours => 'Activar horas de silencio';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Todas las alertas del hogar inteligente se silencian';

  @override
  String get smartHomeNoDevices => 'Ningún dispositivo vinculado';

  @override
  String get smartHomeNoDevicesDesc =>
      'Vincule Google Home o Alexa arriba, luego sus altavoces y pantallas aparecerán aquí.';

  @override
  String get smartHomeRequiresPlus => 'El hogar inteligente requiere Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Controle los anuncios de oración en Google Home, Alexa, Siri y Home Assistant. Configure qué dispositivos reproducen el adhan, cuándo pausar medios y establezca horas de silencio.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Transmitir adhan en altavoces y pantallas Nest.';

  @override
  String get smartHomeEnableAlexa => 'Active la skill PrayCalc en Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Pregunte a Siri los horarios de oración o establezca automatizaciones.';

  @override
  String get smartHomeHassAdd =>
      'Agregue a través de HACS para soporte completo de automatización.';

  @override
  String get smartHomeSetupGuide => 'Guía de configuración';

  @override
  String get smartHomeSiriSetupTitle => 'Configuración de Siri Shortcuts';

  @override
  String get smartHomeSiriStep1 => 'Abra la app Atajos en su iPhone o iPad.';

  @override
  String get smartHomeSiriStep2 => 'Toque \"+\" para crear un nuevo atajo.';

  @override
  String get smartHomeSiriStep3 =>
      'Busque \"PrayCalc\" en la lista de acciones.';

  @override
  String get smartHomeSiriStep4 =>
      'Agregue \"Próxima hora de oración\" o \"Horarios de oración de hoy\".';

  @override
  String get smartHomeSiriStep5 =>
      'Opcionalmente agréguela a una automatización (ej. diariamente al Fajr).';

  @override
  String get smartHomeSiriStep6 =>
      'Diga \"Oye Siri, próxima hora de oración\" para probar.';

  @override
  String get smartHomeSiriFootnote => 'Requiere iOS 16 o posterior.';

  @override
  String get smartHomeHassSetupTitle => 'Configuración de Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Instale HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 => 'En HACS, busque \"PrayCalc\" e instale.';

  @override
  String get smartHomeHassStep3 =>
      'Vaya a Ajustes > Dispositivos y servicios > Agregar integración.';

  @override
  String get smartHomeHassStep4 => 'Busque \"PrayCalc\" y selecciónelo.';

  @override
  String get smartHomeHassStep5 =>
      'Introduzca su clave API de PrayCalc (generada en su cuenta).';

  @override
  String get smartHomeHassStep6 =>
      'Configure su ubicación y método de cálculo.';

  @override
  String get smartHomeHassFootnote =>
      'Requiere Home Assistant 2024.1+ con HACS.';

  @override
  String get smartHomeApiKey => 'Clave API';

  @override
  String get smartHomeGenerateApiKey => 'Generar clave API';

  @override
  String get smartHomeApiKeyNotReady =>
      'La generación de clave API estará disponible cuando el servicio inteligente de PrayCalc esté desplegado.';

  @override
  String get smartHomeApiKeyDesc =>
      'Necesitará una clave API para conectar Home Assistant a su cuenta de PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'Vinculado';

  @override
  String get smartHomeNotLinkedStatus => 'No vinculado';

  @override
  String get smartHomeCouldNotOpen => 'No se pudo abrir el enlace.';

  @override
  String get smartHomeDevices => 'Dispositivos';

  @override
  String get smartHomeAddDevice => 'Agregar dispositivo';

  @override
  String get smartHomeDeleteDevice => 'Eliminar';

  @override
  String get smartHomeDeleteDeviceConfirm => '¿Eliminar este dispositivo?';

  @override
  String get smartHomeDeviceOnline => 'En línea';

  @override
  String get smartHomeDeviceOffline => 'Sin conexión';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Visto por última vez: $time';
  }

  @override
  String get smartHomeDeviceName => 'Nombre del dispositivo';

  @override
  String get smartHomeDeviceType => 'Tipo de dispositivo';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Altavoz';

  @override
  String get smartHomeDeviceTypeWatch => 'Reloj';

  @override
  String get smartHomeDeviceTypeDesktop => 'Escritorio';

  @override
  String get smartHomeDeviceTypeOther => 'Otro';

  @override
  String get smartHomeDeviceAdhan => 'Notificaciones de adhan';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Recibir alertas de adhan en este dispositivo';

  @override
  String get smartHomeDeviceVolume => 'Volumen';

  @override
  String get smartHomeDeviceAudioType => 'Tipo de audio';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Oraciones habilitadas';

  @override
  String get smartHomeDeviceSettings => 'Ajustes del dispositivo';

  @override
  String get smartHomeTesting => 'Probando...';

  @override
  String get smartHomeTestSuccess => 'Conexión verificada';

  @override
  String get smartHomeTestFailed => 'Prueba de conexión fallida';

  @override
  String get smartHomePairTv => 'Vincular TV';

  @override
  String get smartHomePairingTv => 'Registrando TV...';

  @override
  String get smartHomePairTvSuccess => 'TV vinculada correctamente';

  @override
  String get smartHomePairTvFailed => 'Error al vincular TV';

  @override
  String get smartHomeLoadingDevices => 'Cargando dispositivos...';

  @override
  String get smartHomeLoadingIntegrations => 'Cargando integraciones...';

  @override
  String get smartHomeServiceUnavailable =>
      'El servicio de hogar inteligente no está disponible actualmente. Inténtelo de nuevo más tarde.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total completados';
  }

  @override
  String get adhkarReset => 'Reiniciar';

  @override
  String get syncHistoryTitle => 'Historial de sincronización';

  @override
  String get syncClearHistory => 'Borrar historial';

  @override
  String get syncNoConflicts =>
      'Sin conflictos de sincronización detectados. Todos los dispositivos están sincronizados.';

  @override
  String get syncDomainSettings => 'Ajustes';

  @override
  String get syncDomainCities => 'Ciudades guardadas';

  @override
  String get syncDomainPrayerLogs => 'Registros de oración';

  @override
  String get syncTimeJustNow => 'ahora mismo';

  @override
  String syncTimeMinAgo(int min) {
    return 'hace ${min}min';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return 'hace ${hour}h';
  }

  @override
  String syncTimeDayAgo(int day) {
    return 'hace ${day}d';
  }

  @override
  String get pinCity => 'Fijar';

  @override
  String get pinMaxReached =>
      'Máximo 5 ciudades fijadas. Actualice a Ummat+ para más.';

  @override
  String pinCityUnpinned(String city) {
    return '$city desfijada';
  }

  @override
  String get pinUndo => 'Deshacer';

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
