// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Portuguese (`pt`).
class AppLocalizationsPt extends AppLocalizations {
  AppLocalizationsPt([String locale = 'pt']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Fajr';

  @override
  String get prayerSunrise => 'Nascer do sol';

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
  String get hijriRabiAlAwwal => 'Rabi al-Awwal';

  @override
  String get hijriRabiAlThani => 'Rabi al-Thani';

  @override
  String get hijriJumadaAlAwwal => 'Jumada al-Awwal';

  @override
  String get hijriJumadaAlThani => 'Jumada al-Thani';

  @override
  String get hijriRajab => 'Rajab';

  @override
  String get hijriShaban => 'Sha\'ban';

  @override
  String get hijriRamadan => 'Ramadã';

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
  String get monthApr => 'Abr';

  @override
  String get monthMay => 'Mai';

  @override
  String get monthJun => 'Jun';

  @override
  String get monthJul => 'Jul';

  @override
  String get monthAug => 'Ago';

  @override
  String get monthSep => 'Set';

  @override
  String get monthOct => 'Out';

  @override
  String get monthNov => 'Nov';

  @override
  String get monthDec => 'Dez';

  @override
  String get monthJanuary => 'Janeiro';

  @override
  String get monthFebruary => 'Fevereiro';

  @override
  String get monthMarch => 'Março';

  @override
  String get monthApril => 'Abril';

  @override
  String get monthMayFull => 'Maio';

  @override
  String get monthJune => 'Junho';

  @override
  String get monthJuly => 'Julho';

  @override
  String get monthAugust => 'Agosto';

  @override
  String get monthSeptember => 'Setembro';

  @override
  String get monthOctober => 'Outubro';

  @override
  String get monthNovember => 'Novembro';

  @override
  String get monthDecember => 'Dezembro';

  @override
  String get dayMonShort => 'Seg';

  @override
  String get dayTueShort => 'Ter';

  @override
  String get dayWedShort => 'Qua';

  @override
  String get dayThuShort => 'Qui';

  @override
  String get dayFriShort => 'Sex';

  @override
  String get daySatShort => 'Sáb';

  @override
  String get daySunShort => 'Dom';

  @override
  String get dayMonday => 'Segunda-feira';

  @override
  String get dayTuesday => 'Terça-feira';

  @override
  String get dayWednesday => 'Quarta-feira';

  @override
  String get dayThursday => 'Quinta-feira';

  @override
  String get dayFriday => 'Sexta-feira';

  @override
  String get daySaturday => 'Sábado';

  @override
  String get daySunday => 'Domingo';

  @override
  String get daySuChart => 'Do';

  @override
  String get dayMoChart => 'Se';

  @override
  String get dayTuChart => 'Te';

  @override
  String get dayWeChart => 'Qu';

  @override
  String get dayThChart => 'Qi';

  @override
  String get dayFrChart => 'Sx';

  @override
  String get daySaChart => 'Sá';

  @override
  String get chooseCityLabel => 'Escolha uma cidade';

  @override
  String get setCityFab => 'Definir cidade';

  @override
  String prayerTimesError(Object error) {
    return 'Não foi possível calcular os horários de oração.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer em';
  }

  @override
  String get ramadanMubarak => 'Ramadã Mubarak';

  @override
  String ramadanDayProgress(int day) {
    return 'Dia $day / 30';
  }

  @override
  String get lastTenNights => 'Últimas 10 noites';

  @override
  String get laylatulQadr => 'Laylatul Qadr';

  @override
  String get homeSuffixAH => 'H';

  @override
  String get homeSuffixCE => 'd.C.';

  @override
  String get homeNoCitySelected => 'Nenhuma cidade selecionada';

  @override
  String get homeNoCityHint =>
      'Toque acima para pesquisar sua cidade ou ativar o GPS.';

  @override
  String get homeCouldNotCalc =>
      'Não foi possível calcular os horários de oração.';

  @override
  String get homeQasr => 'Qasr';

  @override
  String get homeActionMonthlyTimes => 'Horários\nmensais';

  @override
  String get homeActionDuaDhikr => 'Dua e\nDhikr';

  @override
  String get homeActionPrayerStats => 'Estatísticas\nde oração';

  @override
  String homePolarBanner(int count) {
    return '$count horários de oração não podem ser calculados para sua localização durante este período (sol da meia-noite / noite polar). Tente a estimativa por latitude mais próxima nas configurações.';
  }

  @override
  String get settingsTitle => 'Configurações';

  @override
  String get settingsSectionPrayerCalc => 'Cálculo de oração';

  @override
  String get settingsCalcMethod => 'Metodo de calculo';

  @override
  String get settingsCalcMethodAuto => 'Automatico (Dinamico)';

  @override
  String get settingsHanafiAsr => 'Asr Hanafi';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Fator de sombra 2x (horário de Asr mais tarde)';

  @override
  String get settingsSectionDisplay => 'Exibição';

  @override
  String get settings24hClock => 'Relógio de 24 horas';

  @override
  String get settingsFollowSystemTheme => 'Seguir tema do sistema';

  @override
  String get settingsDarkMode => 'Modo escuro';

  @override
  String get settingsSectionNotifications => 'Notificações';

  @override
  String get settingsPrayerNotifications => 'Notificações de oração';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Adhan, lembretes e configurações por oração';

  @override
  String get settingsPrayerAgendas => 'Agendas de oração';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Lembretes personalizados baseados nos horários de oração';

  @override
  String get settingsAccount => 'Conta';

  @override
  String get settingsSignInToSync => 'Entrar para sincronizar';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Mantenha seus dados em todos os dispositivos';

  @override
  String get settingsHomeScreen => 'Tela inicial';

  @override
  String get settingsSkyGradient => 'Fundo gradiente do céu';

  @override
  String get settingsSkyGradientSubtitle =>
      'Cores animadas do céu conforme a hora do dia';

  @override
  String get settingsWeatherGradient => 'Gradiente do clima';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Cores do céu ajustadas pelo clima local';

  @override
  String get settingsCountdownAnimation => 'Animação de contagem regressiva';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Anel pulsante na próxima oração';

  @override
  String get settingsPrayerTracking => 'Acompanhamento de oração';

  @override
  String get settingsTrackMyPrayers => 'Acompanhar minhas orações';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Registrar quais orações você completa a cada dia';

  @override
  String get settingsPrayerStats => 'Estatísticas de oração';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Sequências, gráficos semanais e mensais';

  @override
  String get settingsJumuahKahf => 'Lembrete Al-Kahf na sexta';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Lembrete toda sexta para ler Surah Al-Kahf';

  @override
  String get settingsTravel => 'Viagem';

  @override
  String get settingsTravelMode => 'Modo viagem';

  @override
  String get settingsTravelModeSubtitle =>
      'Detectar automaticamente quando está fora de casa e ajustar orações';

  @override
  String get settingsHomeLocation => 'Localização residencial';

  @override
  String get settingsHomeLocationNotSet =>
      'Não definida — toque para usar a localização atual';

  @override
  String get settingsClearHomeLocation => 'Limpar localização residencial';

  @override
  String get settingsTravelRulings => 'Regras de oração em viagem';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Qasr, combinação e orientações para viajantes';

  @override
  String get settingsSmartHome => 'Casa inteligente';

  @override
  String get settingsSmartHomeIntegrations => 'Integrações de casa inteligente';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'Display de TV';

  @override
  String get settingsTvHome => 'Display de TV inicial';

  @override
  String get settingsTvHomeSubtitle =>
      'Relógio de oração em tela cheia para TV';

  @override
  String get settingsMasjidDisplay => 'Display de mesquita';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Tabela de adhan/iqamah para telas de mesquita';

  @override
  String get settingsTvSettings => 'Configurações de TV';

  @override
  String get settingsTvSettingsSubtitle =>
      'Modo mesquita, offsets de iqamah, ambiente';

  @override
  String get settingsAboutPrayCalc => 'Sobre o PrayCalc';

  @override
  String get syncSynced => 'Sincronizado';

  @override
  String get syncSyncing => 'Sincronizando...';

  @override
  String get syncOffline => 'Offline';

  @override
  String get syncError => 'Erro de sincronização';

  @override
  String get notifSettingsTitle => 'Notificações e Adhan';

  @override
  String get notifAdhanLabel => 'Adhan';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Lembrete: $minutes min antes';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Volume: $pct%';
  }

  @override
  String get notifTestAdhan => 'Testar adhan';

  @override
  String get notifModeOff => 'Desligado';

  @override
  String get notifModeReminderOnly => 'Apenas lembrete';

  @override
  String get notifModeArrival => 'No horário da oração';

  @override
  String get notifModeBoth => 'Lembrete + horário';

  @override
  String get citySearchHint => 'Pesquisar cidade…';

  @override
  String get citySearchDetectTooltip => 'Detectar minha localização';

  @override
  String get citySearchNoCityGps =>
      'Não foi possível detectar a cidade pelo GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Permissão de localização negada. Pesquise manualmente.';

  @override
  String get citySearchNoResults => 'Nenhuma cidade encontrada.';

  @override
  String get citySearchStartTyping => 'Comece a digitar para pesquisar…';

  @override
  String get agendasTitle => 'Agendas de oração';

  @override
  String get agendasEmpty =>
      'Nenhuma agenda ainda.\nToque + para adicionar um lembrete vinculado às suas orações.';

  @override
  String get agendasUndo => 'Desfazer';

  @override
  String agendasRemoved(String label) {
    return '$label removido';
  }

  @override
  String get agendaNewTitle => 'Nova agenda';

  @override
  String get agendaEditTitle => 'Editar agenda';

  @override
  String get agendaSave => 'Salvar';

  @override
  String get agendaLabelEmpty => 'O rótulo não pode estar vazio';

  @override
  String get agendaLabelField => 'Rótulo';

  @override
  String get agendaLabelHint => 'ex.: Acordar para Fajr';

  @override
  String get agendaPrayerSection => 'Oração';

  @override
  String get agendaTimeOffsetSection => 'Deslocamento de tempo';

  @override
  String get agendaOffsetAtPrayerTime => 'No horário da oração';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes min antes';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes min depois';
  }

  @override
  String get agendaRepeatSection => 'Repetir';

  @override
  String get agendaNotifTypeSection => 'Tipo de notificação';

  @override
  String get agendaNotifSilent => 'Silencioso';

  @override
  String get agendaNotifSound => 'Som';

  @override
  String get agendaNotifVibrate => 'Vibrar';

  @override
  String get agendaDayM => 'S';

  @override
  String get agendaDayT => 'T';

  @override
  String get agendaDayW => 'Q';

  @override
  String get agendaDayF => 'S';

  @override
  String get agendaDayS => 'S';

  @override
  String get moonTitle => 'Lua e calendário Hijri';

  @override
  String moonIlluminated(int pct) {
    return '$pct% iluminada';
  }

  @override
  String get moonFullTonight => 'Lua cheia esta noite!';

  @override
  String get moonNextTomorrow => 'Próxima lua cheia amanhã';

  @override
  String moonNextDays(int days) {
    return 'Próxima lua cheia em $days dias';
  }

  @override
  String moonAge(String age) {
    return 'Idade da lua: $age dias';
  }

  @override
  String get moonPhaseNewMoon => 'Lua nova';

  @override
  String get moonPhaseWaxingCrescent => 'Crescente côncava';

  @override
  String get moonPhaseFirstQuarter => 'Quarto crescente';

  @override
  String get moonPhaseWaxingGibbous => 'Crescente convexa';

  @override
  String get moonPhaseFullMoon => 'Lua cheia';

  @override
  String get moonPhaseWaningGibbous => 'Minguante convexa';

  @override
  String get moonPhaseLastQuarter => 'Quarto minguante';

  @override
  String get moonPhaseWaningCrescent => 'Minguante côncava';

  @override
  String get moonHilalVisibility => 'Próxima visibilidade do Hilal';

  @override
  String get moonRegionMiddleEast => 'Oriente Médio';

  @override
  String get moonRegionWestAfrica => 'África Ocidental';

  @override
  String get moonRegionSouthAsia => 'Sul da Ásia';

  @override
  String get moonRegionEurope => 'Europa';

  @override
  String get moonRegionAmericas => 'Américas';

  @override
  String get moonVisible => 'Visível';

  @override
  String get moonNotVisible => 'Não visível';

  @override
  String get moonPossible => 'Possível';

  @override
  String get moonUpcomingDates => 'Próximas datas islâmicas';

  @override
  String get hijriTodayLabel => 'Hoje no calendário Hijri';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Ramadã $year H começa';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'em $days dias';
  }

  @override
  String get moonLunarCycle => 'Ciclo lunar';

  @override
  String moonDayOfCycle(int day) {
    return 'Dia $day de ~29,5';
  }

  @override
  String get moonHilalSightingForecast => 'Previsão de avistamento do Hilal';

  @override
  String get moonHilalVisibilityMap => 'Mapa de visibilidade do Hilal';

  @override
  String moonDayN(int day) {
    return 'Dia $day';
  }

  @override
  String get moonGlobalSighting => 'Avistamento global';

  @override
  String get moonZoneNakedEye => 'A olho nu';

  @override
  String get moonZoneBinoculars => 'Binóculos';

  @override
  String get moonZoneVeryDifficult => 'Muito difícil';

  @override
  String get moonZoneNotVisible => 'Não visível';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year H provavelmente terá 29 dias. Espera-se que o crescente seja visto no 29º dia, in sha Allah.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year H provavelmente terá 30 dias. O crescente provavelmente não será visto no 29º dia — o mês completará 30 dias.';
  }

  @override
  String get moonUmmAlQura => 'Umm al-Qura';

  @override
  String get moonSaudiArabia => 'Arábia Saudita';

  @override
  String get moonFCNACalc => 'FCNA / Cálc.';

  @override
  String get moonNorthAmerica => 'América do Norte';

  @override
  String moonNDays(int days) {
    return '$days dias';
  }

  @override
  String moonStarts(String month) {
    return '$month começa:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Idade da lua ao pôr do sol: $hours h';
  }

  @override
  String get moon7DayLunarCalendar => 'Calendário lunar de 7 dias';

  @override
  String get moonUpcomingIslamicEvents => 'Próximos eventos islâmicos';

  @override
  String get moonTodayLabel => 'Hoje';

  @override
  String get moonTomorrowLabel => 'Amanhã';

  @override
  String get calDateCol => 'Data';

  @override
  String get calHijriCol => 'Hijri';

  @override
  String get calFajrCol => 'Fajr';

  @override
  String get calSunriseCol => 'Nascer';

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
      'Defina sua cidade primeiro\npara ver o calendário de orações.';

  @override
  String get calShareTooltip => 'Compartilhar calendário';

  @override
  String get calPrevMonthTooltip => 'Mês anterior';

  @override
  String get calNextMonthTooltip => 'Próximo mês';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Horários de oração — $month';
  }

  @override
  String get qiblaTitle => 'Qibla';

  @override
  String get qiblaSwitchToCompass => 'Mudar para bússola';

  @override
  String get qiblaSwitchToAR => 'Mudar para câmera AR';

  @override
  String get qiblaNoCityText =>
      'Defina sua cidade primeiro\npara calcular a direção da Qibla.';

  @override
  String get qiblaCompassUnavailable =>
      'Sensor de bússola indisponível neste dispositivo.';

  @override
  String get qiblaCalibrate => 'Calibrar: mova o telefone em forma de 8.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° do norte';
  }

  @override
  String qiblaFrom(String city) {
    return 'De $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist km da Kaaba';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K km da Kaaba';
  }

  @override
  String get qiblaFacingQibla => 'Voltado para a Qibla ✓';

  @override
  String get tasbeehTitle => 'Tasbih';

  @override
  String get tasbeehResetTooltip => 'Redefinir';

  @override
  String get tasbeehTapToSwitch => 'Toque no rótulo para mudar';

  @override
  String get tasbeehTapToCount => 'Toque em qualquer lugar para contar';

  @override
  String get tasbeehResetDialogTitle => 'Redefinir contador?';

  @override
  String get tasbeehResetDialogContent =>
      'Isso redefinirá a contagem atual para zero.';

  @override
  String get tasbeehCancel => 'Cancelar';

  @override
  String get tasbeehReset => 'Redefinir';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Hoje: $count dhikr';
  }

  @override
  String get tasbeehLast7Days => 'Últimos 7 dias';

  @override
  String get tasbeehNoHistory => 'Sem histórico ainda — comece a contar!';

  @override
  String tasbeehComplete(int count) {
    return 'Tasbih completo! $count dhikr';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Casa inteligente';

  @override
  String get smartHomeSubtitle =>
      'Conecte seus dispositivos aos horários de oração';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Pergunte ao Google sobre horários de oração e direção da Qibla';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Pergunte à Alexa sobre horários de oração, próxima oração e mais';

  @override
  String get smartHomeSiri => 'Atalhos Siri';

  @override
  String get smartHomeSiriDesc =>
      'Crie atalhos personalizados para horários de oração';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Automatize luzes, displays e lembretes nos horários de oração';

  @override
  String get smartHomeLinkAccount => 'Vincular conta';

  @override
  String get smartHomeLinked => 'Vinculado';

  @override
  String get smartHomeUnlink => 'Desvincular';

  @override
  String get smartHomeSetupInstructions => 'Instruções de configuração';

  @override
  String get smartHomeRequiresUmmatPlus => 'Requer Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Solução de problemas';

  @override
  String get smartHomeTestConnection => 'Testar conexão';

  @override
  String get smartHomeConnectionSuccess => 'Conectado com sucesso';

  @override
  String get smartHomeConnectionFailed =>
      'Conexão falhou. Verifique a vinculação da conta.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Recursos premium de horários de oração';

  @override
  String get subscriptionUpgrade => 'Atualizar para Ummat+';

  @override
  String get subscriptionRestore => 'Restaurar compra';

  @override
  String get subscriptionManage => 'Gerenciar assinatura';

  @override
  String get subscriptionCancel => 'Cancelar assinatura';

  @override
  String get subscriptionActive => 'Ativa';

  @override
  String get subscriptionExpired => 'Expirada';

  @override
  String get subscriptionFree => 'Grátis';

  @override
  String get subscriptionFreeDesc =>
      'Horários básicos de oração, Qibla, calendário';

  @override
  String get subscriptionPlusDesc =>
      'Casa inteligente, display de TV, widgets e mais';

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
    return '$price/mês';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Integração com casa inteligente';

  @override
  String get subscriptionFeatureTV => 'Modo display de TV';

  @override
  String get subscriptionFeatureWidgets => 'Widgets da tela inicial';

  @override
  String get subscriptionFeatureWatch => 'Complicações do relógio';

  @override
  String get subscriptionFeatureSync => 'Sincronização entre dispositivos';

  @override
  String get subscriptionFeatureAdFree => 'Sem anúncios';

  @override
  String get watchTitle => 'Relógio';

  @override
  String get watchNextPrayer => 'Próxima oração';

  @override
  String get watchAllPrayers => 'Todas as orações';

  @override
  String get watchComplication => 'Complicação';

  @override
  String get nextPrayer => 'Próxima oração';

  @override
  String get allPrayers => 'Todas as orações';

  @override
  String get today => 'Hoje';

  @override
  String get tomorrow => 'Amanhã';

  @override
  String get thisWeek => 'Esta semana';

  @override
  String get thisMonth => 'Este mês';

  @override
  String get loginCreateAccount => 'Criar conta';

  @override
  String get loginSignIn => 'Entrar';

  @override
  String get loginWelcomeBack => 'Bem-vindo de volta';

  @override
  String get loginJoinPrayCalc => 'Junte-se ao PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'Sincronize seus dados de oração entre dispositivos';

  @override
  String get loginContinueGoogle => 'Continuar com Google';

  @override
  String get loginOr => 'ou';

  @override
  String get loginSigningIn => 'Entrando…';

  @override
  String get loginNameLabel => 'Nome de exibição (opcional)';

  @override
  String get loginEmailLabel => 'E-mail';

  @override
  String get loginPasswordLabel => 'Senha';

  @override
  String get loginEmailRequired => 'E-mail é obrigatório';

  @override
  String get loginEmailInvalid => 'Insira um endereço de e-mail válido';

  @override
  String get loginPasswordRequired => 'Senha é obrigatória';

  @override
  String get loginPasswordMinLength =>
      'A senha deve ter pelo menos 8 caracteres';

  @override
  String get loginForgotPassword => 'Esqueceu a senha?';

  @override
  String get loginEnterEmailFirst => 'Insira seu e-mail primeiro';

  @override
  String get loginResetSent => 'E-mail de redefinição de senha enviado';

  @override
  String get loginResetFailed =>
      'Não foi possível enviar o e-mail de redefinição';

  @override
  String get loginNewToPrayCalc => 'Novo no PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Já tem uma conta?';

  @override
  String get accountTitle => 'Conta';

  @override
  String get accountNotSignedIn => 'Não conectado';

  @override
  String get accountSyncSection => 'Sincronização';

  @override
  String get accountSyncStatus => 'Status da sincronização';

  @override
  String get accountSyncNow => 'Sincronizar agora';

  @override
  String get accountSyncHistory => 'Histórico de sincronização';

  @override
  String get accountNoConflicts => 'Nenhum conflito detectado';

  @override
  String accountConflictsResolved(int count) {
    return '$count resolvidos';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Sincronizado $time';
  }

  @override
  String get accountOfflineStatus => 'Offline. Alterações salvas localmente.';

  @override
  String get accountSyncErrorStatus =>
      'Erro de sincronização. Tentará novamente.';

  @override
  String get accountDataSection => 'Dados';

  @override
  String get accountExportData => 'Exportar dados';

  @override
  String get accountExportSubtitle =>
      'Baixar configurações e registros de oração';

  @override
  String get accountExportFailed => 'Não foi possível exportar os dados';

  @override
  String get accountSignOutTitle => 'Sair';

  @override
  String get accountSignOutBody =>
      'Seus dados locais serão mantidos. Entre novamente para continuar sincronizando.';

  @override
  String get accountDeleteAccount => 'Excluir conta';

  @override
  String get accountDeleteSubtitle =>
      'Excluir permanentemente sua conta e dados';

  @override
  String get accountDeleteBody =>
      'Isso excluirá permanentemente sua conta e todos os dados sincronizados. Os dados locais neste dispositivo não serão removidos.\n\nEsta ação não pode ser desfeita.';

  @override
  String get accountDeleted => 'Conta excluída';

  @override
  String get accountDeleteFailed => 'Não foi possível excluir a conta';

  @override
  String get accountTimeJustNow => 'agora mesmo';

  @override
  String accountTimeMinAgo(int min) {
    return '${min}min atrás';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '${hour}h atrás';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '${day}d atrás';
  }

  @override
  String get statsTitle => 'Estatísticas de oração';

  @override
  String get statsShareTooltip => 'Compartilhar estatísticas';

  @override
  String get statsTodayPrayers => 'Orações de hoje';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Sequência';

  @override
  String get statsDays => 'dias';

  @override
  String get statsThisWeek => 'Esta semana';

  @override
  String get statsCompletion => 'conclusão';

  @override
  String get statsThisMonth => 'Este mês';

  @override
  String get statsMostMissed => 'Mais perdida';

  @override
  String get statsThisWeekLabel => 'esta semana';

  @override
  String get statsWeeklyChart => 'Conclusão semanal por oração';

  @override
  String get statsMonthlyChart => 'Conclusão mensal por oração';

  @override
  String statsTotalLogged(int count) {
    return '$count orações registradas no total';
  }

  @override
  String get statsKeepItUp => 'Continue assim!';

  @override
  String get statsShareTitle => 'Estatísticas de oração PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Sequência: $days dias';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'Semanal: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'Mensal: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Detalhes semanais:';

  @override
  String get aboutTitle => 'Sobre o PrayCalc';

  @override
  String get aboutWebsite => 'Site';

  @override
  String get aboutContact => 'Contato';

  @override
  String get aboutLicenses => 'Licenças de código aberto';

  @override
  String get aboutCouldNotOpen => 'Não foi possível abrir o link.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Todos os direitos reservados.\n\nHorários de oração calculados pelo motor pray_calc_dart. A precisão depende da localização GPS e do método de cálculo selecionado.';
  }

  @override
  String get commonCancel => 'Cancelar';

  @override
  String get commonSave => 'Salvar';

  @override
  String get commonDelete => 'Excluir';

  @override
  String get commonEdit => 'Editar';

  @override
  String get commonRetry => 'Tentar novamente';

  @override
  String get commonClose => 'Fechar';

  @override
  String get commonDone => 'Concluído';

  @override
  String get commonBack => 'Voltar';

  @override
  String get commonNext => 'Próximo';

  @override
  String get commonSkip => 'Pular';

  @override
  String get commonContinue => 'Continuar';

  @override
  String get commonOk => 'OK';

  @override
  String get commonYes => 'Sim';

  @override
  String get commonNo => 'Não';

  @override
  String get commonShare => 'Compartilhar';

  @override
  String get commonCopy => 'Copiar';

  @override
  String get commonCopied => 'Copiado para a área de transferência';

  @override
  String get commonLoading => 'Carregando...';

  @override
  String get commonError => 'Algo deu errado';

  @override
  String get commonErrorRetry =>
      'Algo deu errado. Toque para tentar novamente.';

  @override
  String get commonNoInternet => 'Sem conexão com a internet';

  @override
  String get commonOfflineMode => 'Modo offline';

  @override
  String get commonSignIn => 'Entrar';

  @override
  String get commonSignOut => 'Sair';

  @override
  String get commonSignUp => 'Cadastrar';

  @override
  String get commonProfile => 'Perfil';

  @override
  String get commonAccount => 'Conta';

  @override
  String get commonAbout => 'Sobre';

  @override
  String commonVersion(String version) {
    return 'Versão $version';
  }

  @override
  String get commonPrivacyPolicy => 'Política de privacidade';

  @override
  String get commonTermsOfService => 'Termos de serviço';

  @override
  String get commonRateApp => 'Avaliar este app';

  @override
  String get commonFeedback => 'Enviar feedback';

  @override
  String get commonHelp => 'Ajuda';

  @override
  String get commonLanguage => 'Idioma';

  @override
  String get commonOpenSettings => 'Abrir configurações';

  @override
  String get travelNotificationTitle => 'Você está viajando';

  @override
  String get travelNotificationBody =>
      'Os horários de oração podem ser encurtados. Toque para saber sobre as regras de viagem.';

  @override
  String get travelRulingsTitle => 'Viagem e oração';

  @override
  String get travelRulingsIntro =>
      'Regras islâmicas sobre oração durante viagem, com referências do Alcorão e coleções autênticas de Hadith.';

  @override
  String get travelWhenTitle => 'Quando se aplica a regra de viagem?';

  @override
  String get travelQasrTitle => 'Encurtar orações (Qasr)';

  @override
  String get travelJamTitle => 'Combinar orações (Jam\')';

  @override
  String get travelDurationTitle => 'Duração da viagem';

  @override
  String get travelReferencesTitle => 'Referências acadêmicas';

  @override
  String get travelLearnMore => 'Saiba mais';

  @override
  String get travelHanafiDefaultTitle =>
      'Por que o PrayCalc usa o padrão Hanafi';

  @override
  String get travelDeeperScholarly => 'Discussão acadêmica aprofundada';

  @override
  String get onboardingTitle1 => 'Horários de oração, onde quer que esteja';

  @override
  String get onboardingBody1 =>
      'Horários precisos de oração por GPS para cada cidade do planeta. De Fajr a Isha, do nascer do sol ao Qiyam. Com nosso próprio motor de cálculo, feito para precisão.';

  @override
  String get onboardingTitle2 => 'Sua localização, seus horários';

  @override
  String get onboardingBody2 =>
      'Pesquise qualquer cidade ou deixe o GPS detectar sua localização. O PrayCalc encontra horários para 5 milhões de cidades no mundo.';

  @override
  String get onboardingTitle3 => 'Nunca perca uma oração';

  @override
  String get onboardingBody3 =>
      'Adhan no horário da oração, lembretes antes. Agendas personalizadas para Suhoor, aulas e mais.';

  @override
  String get onboardingTitle4 => 'Tudo que você precisa';

  @override
  String get onboardingBody4 =>
      'Bússola Qibla, calendário de orações, fase lunar Hijri, contador de Tasbih. Tudo em um lugar.';

  @override
  String get onboardingSkip => 'Pular';

  @override
  String get onboardingGetStarted => 'Começar';

  @override
  String get onboardingSignInTitle => 'Entrar no PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Salve seu histórico de orações e\nsincronize em todos os dispositivos.';

  @override
  String get onboardingContinueGoogle => 'Continuar com Google';

  @override
  String get onboardingContinueWithoutAccount => 'Continuar sem conta';

  @override
  String get onboardingSigningIn => 'Entrando…';

  @override
  String get onboardingSelectLanguage => 'Selecione o idioma';

  @override
  String get duaDhikrTitle => 'Dua e Dhikr';

  @override
  String get duaDhikrTabDua => 'Duas';

  @override
  String get duaDhikrTabDhikr => 'Dhikr';

  @override
  String get duaDhikrTabTasbeeh => 'Tasbih';

  @override
  String get duaDhikrTabMorning => 'Manhã';

  @override
  String get duaDhikrTabEvening => 'Noite';

  @override
  String get duaDhikrMorningAdhkar => 'Adhkar da manhã';

  @override
  String get duaDhikrEveningAdhkar => 'Adhkar da noite';

  @override
  String get calGregToggle => 'Greg.';

  @override
  String get calHijriToggle => 'Hijri';

  @override
  String get calYearlyTooltip => 'Calendário anual';

  @override
  String get calExportIcsTooltip => 'Exportar .ics';

  @override
  String get calMagCol => 'Mag';

  @override
  String get qiblaShowOnMap => 'Mostrar no mapa';

  @override
  String get qiblaWaitingCompass => 'Aguardando bússola...';

  @override
  String get qiblaNoCompassSensor =>
      'Sem sensor de bússola. Mostrando direção da Qibla estaticamente.';

  @override
  String get qiblaAccuracyExcellent => 'Precisão excelente';

  @override
  String get qiblaAccuracyGood => 'Boa precisão';

  @override
  String get qiblaAccuracyFair =>
      'Precisão razoável. Calibre movendo o telefone em forma de 8.';

  @override
  String get qiblaAccuracyLow =>
      'Baixa precisão. Calibre movendo o telefone em forma de 8.';

  @override
  String get qiblaToTheKaaba => 'para a Kaaba';

  @override
  String get qiblaYourLocation => 'Sua localização';

  @override
  String get qiblaGpsAccurate => 'GPS preciso';

  @override
  String get qiblaCityCenter => 'Centro da cidade';

  @override
  String get moonIlluminatedLabel => 'Iluminada';

  @override
  String get moonAgeLabel => 'Idade';

  @override
  String get moonFirstQtr => '1º quarto';

  @override
  String get moonLastQtr => 'Último quarto';

  @override
  String get moonTonight => 'Esta noite';

  @override
  String get moonTomorrow => 'Amanhã';

  @override
  String moonDaysAway(int days) {
    return '${days}d';
  }

  @override
  String get moonBeta => 'Beta';

  @override
  String get setHomeTitle => 'Definir localização residencial';

  @override
  String get setHomeSearchHint => 'Pesquisar cidade, vila ou CEP…';

  @override
  String get setHomeClear => 'Limpar';

  @override
  String get setHomeUseCurrentLocation => 'Usar localização atual';

  @override
  String get setHomeDetectAndSet =>
      'Detectar sua localização e definir como casa';

  @override
  String get setHomeAlreadySet => 'Casa já definida';

  @override
  String setHomeSetAs(String city) {
    return '$city definida como casa';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Localização atual definida como casa';

  @override
  String get setHomePermissionDenied =>
      'Permissão de localização negada. Pesquise uma cidade abaixo.';

  @override
  String get setHomeGpsUnavailable => 'GPS indisponível. Pesquise manualmente.';

  @override
  String get setHomeNoCitiesFound => 'Nenhuma cidade encontrada.';

  @override
  String get setHomeSearchPrompt => 'Pesquise sua cidade natal';

  @override
  String get setHomeSearchBody =>
      'Digite acima para pesquisar ou use sua localização atual. O modo viagem detectará quando você estiver longe de casa.';

  @override
  String get subscriptionYouHavePlus => 'Você tem Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Atualizar para Ummat+';

  @override
  String get subscriptionThankYou => 'Obrigado por apoiar o PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Desbloqueie recursos premium em todos os seus dispositivos.';

  @override
  String get subscriptionManageSub => 'Gerenciar assinatura';

  @override
  String get subscriptionWelcome => 'Bem-vindo ao Ummat+!';

  @override
  String get subscriptionSubscribe => 'Assinar';

  @override
  String get subscriptionFreeFeatures => 'Recursos gratuitos';

  @override
  String get subscriptionPlusFeatures => 'Recursos Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Horários de oração';

  @override
  String get subscriptionFeatureQibla => 'Bússola Qibla';

  @override
  String get subscriptionFeatureCalendar => 'Calendário mensal';

  @override
  String get subscriptionFeatureTasbeeh => 'Contador de Tasbih';

  @override
  String get subscriptionFeatureMoon => 'Lua e Hijri';

  @override
  String get smartHomeAlertType => 'Tipo de alerta';

  @override
  String get smartHomeAlertModal => 'Modal em tela cheia';

  @override
  String get smartHomeAlertCorner => 'Notificação no canto';

  @override
  String get smartHomeAlertNone => 'Nenhum (silencioso)';

  @override
  String get smartHomePauseMedia => 'Pausar mídia durante adhan';

  @override
  String get smartHomeQuietHours => 'Horas silenciosas';

  @override
  String get smartHomeQuietFrom => 'De';

  @override
  String get smartHomeQuietTo => 'Até';

  @override
  String get smartHomePrayerAudio => 'Áudio por oração';

  @override
  String get smartHomeAudioAdhan => 'Adhan';

  @override
  String get smartHomeAudioBeep => 'Bipe';

  @override
  String get smartHomeAudioSilent => 'Silencioso';

  @override
  String get aboutPrivacy => 'Política de privacidade';

  @override
  String aboutVersion(String version) {
    return 'Versão $version';
  }

  @override
  String get notifDefaultAdhan => 'Adhan padrão';

  @override
  String get notifFajrAdhan => 'Adhan do Fajr';

  @override
  String get notifFajrAdhanSubtitle => 'Tocado no horário do Fajr';

  @override
  String get notifRegularAdhan => 'Adhan regular';

  @override
  String get notifRegularAdhanSubtitle => 'Tocado no Dhuhr, Asr, Maghrib, Isha';

  @override
  String get notifPerPrayerSettings => 'Configurações por oração';

  @override
  String get notifPreview => 'Visualizar';

  @override
  String get tvSettingsTitle => 'Configurações de TV';

  @override
  String get tvDisplayMode => 'Modo de exibição';

  @override
  String get tvMasjidMode => 'Modo mesquita';

  @override
  String get tvMasjidModeSubtitle => 'Display grande com horários de iqamah';

  @override
  String get tvMasjidName => 'Nome da mesquita';

  @override
  String get tvMasjidNameTapToSet => 'Toque para definir';

  @override
  String get tvClock => 'Relógio';

  @override
  String get tv24hFormat => 'Formato 24 horas';

  @override
  String get tvIqamahOffsets => 'Offsets de iqamah (minutos após adhan)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset min após adhan';
  }

  @override
  String get tvQrCode => 'QR Code';

  @override
  String get tvShowQrCode => 'Mostrar QR Code';

  @override
  String get tvShowQrCodeSubtitle => 'Exibir QR Code na tela da mesquita';

  @override
  String get tvQrCodeUrl => 'URL do QR Code';

  @override
  String get tvAmbientModeSection => 'Modo ambiente';

  @override
  String get tvIdleTimeout => 'Tempo limite de inatividade';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes minutos antes do modo ambiente';
  }

  @override
  String get tvPhotoInterval => 'Intervalo de fotos';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds segundos entre fotos';
  }

  @override
  String get tvBackground => 'Fundo';

  @override
  String get tvPhotoCategory => 'Categoria de fotos';

  @override
  String get tvLocation => 'Localização';

  @override
  String get tvChangeCity => 'Mudar cidade';

  @override
  String get tvChangeCitySubtitle => 'Pesquisar outra cidade';

  @override
  String get tvScreensaverBg => 'Fundo do protetor de tela';

  @override
  String get tvScreensaverPhotos => 'Fotos';

  @override
  String get tvScreensaverPattern => 'Padrão geométrico';

  @override
  String get tvScreensaverBoth => 'Fotos + padrão';

  @override
  String get tvCategoryAll => 'Todas as categorias';

  @override
  String get tvCategoryMasjids => 'Mesquitas';

  @override
  String get tvCategoryInteriors => 'Interiores';

  @override
  String get tvCategoryGeometric => 'Geométrico';

  @override
  String get tvCategoryCalligraphy => 'Caligrafia';

  @override
  String get tvCategoryLandscapes => 'Paisagens';

  @override
  String get tvCategoryRamadan => 'Ramadã';

  @override
  String get tvPhotoCategoryTitle => 'Categoria de fotos';

  @override
  String tvEnterHint(String title) {
    return 'Inserir $title';
  }

  @override
  String get tvSystemDefault => 'Padrão do sistema';

  @override
  String get smartHomeIntegrations => 'Integrações';

  @override
  String get smartHomeLinkedSpeakers => 'Caixas de som e displays vinculados';

  @override
  String get smartHomeAlertDisplay => 'Exibição de alerta';

  @override
  String get smartHomeAtAdhanShow => 'No adhan mostrar';

  @override
  String get smartHomePauseMediaTitle => 'Pausar mídia no adhan';

  @override
  String get smartHomePauseMediaSubtitle => 'Retoma após o adhan terminar';

  @override
  String get smartHomePrayerAudioSection => 'Áudio de oração';

  @override
  String get smartHomeQuietHoursSection => 'Horas silenciosas';

  @override
  String get smartHomeEnableQuietHours => 'Ativar horas silenciosas';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Todos os alertas de casa inteligente são silenciados';

  @override
  String get smartHomeNoDevices => 'Nenhum dispositivo vinculado ainda';

  @override
  String get smartHomeNoDevicesDesc =>
      'Vincule Google Home ou Alexa acima, depois suas caixas de som e displays aparecerão aqui.';

  @override
  String get smartHomeRequiresPlus => 'Casa inteligente requer Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Controle anúncios de adhan no Google Home, Alexa, Siri e Home Assistant. Configure quais dispositivos tocam adhan, quando pausar mídia e horas silenciosas.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Transmita adhan em caixas de som e displays Nest.';

  @override
  String get smartHomeEnableAlexa => 'Ative a skill PrayCalc na Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Pergunte à Siri sobre horários de oração ou configure automações.';

  @override
  String get smartHomeHassAdd =>
      'Adicione via HACS para suporte completo de automação.';

  @override
  String get smartHomeSetupGuide => 'Guia de configuração';

  @override
  String get smartHomeSiriSetupTitle => 'Configuração de atalhos Siri';

  @override
  String get smartHomeSiriStep1 => 'Abra o app Atalhos no iPhone ou iPad.';

  @override
  String get smartHomeSiriStep2 => 'Toque \"+\" para criar um novo atalho.';

  @override
  String get smartHomeSiriStep3 => 'Pesquise \"PrayCalc\" na lista de ações.';

  @override
  String get smartHomeSiriStep4 =>
      'Adicione \"Próximo horário de oração\" ou \"Horários de oração hoje\".';

  @override
  String get smartHomeSiriStep5 =>
      'Opcionalmente adicione a uma automação (ex.: diariamente no Fajr).';

  @override
  String get smartHomeSiriStep6 =>
      'Diga \"Hey Siri, next prayer time\" para testar.';

  @override
  String get smartHomeSiriFootnote => 'Requer iOS 16 ou posterior.';

  @override
  String get smartHomeHassSetupTitle => 'Configuração do Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Instale o HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 => 'No HACS, pesquise \"PrayCalc\" e instale.';

  @override
  String get smartHomeHassStep3 =>
      'Vá para Configurações > Dispositivos e Serviços > Adicionar Integração.';

  @override
  String get smartHomeHassStep4 => 'Pesquise \"PrayCalc\" e selecione.';

  @override
  String get smartHomeHassStep5 =>
      'Insira sua chave API do PrayCalc (gerada na sua conta).';

  @override
  String get smartHomeHassStep6 =>
      'Configure sua localização e método de cálculo.';

  @override
  String get smartHomeHassFootnote => 'Requer Home Assistant 2024.1+ com HACS.';

  @override
  String get smartHomeApiKey => 'Chave API';

  @override
  String get smartHomeGenerateApiKey => 'Gerar chave API';

  @override
  String get smartHomeApiKeyNotReady =>
      'A geração de chave API estará disponível quando o serviço inteligente PrayCalc for lançado.';

  @override
  String get smartHomeApiKeyDesc =>
      'Você precisará de uma chave API para conectar o Home Assistant à sua conta PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'Vinculado';

  @override
  String get smartHomeNotLinkedStatus => 'Não vinculado';

  @override
  String get smartHomeCouldNotOpen => 'Não foi possível abrir o link.';

  @override
  String get smartHomeDevices => 'Dispositivos';

  @override
  String get smartHomeAddDevice => 'Adicionar dispositivo';

  @override
  String get smartHomeDeleteDevice => 'Excluir';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Remover este dispositivo?';

  @override
  String get smartHomeDeviceOnline => 'Online';

  @override
  String get smartHomeDeviceOffline => 'Offline';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Visto por último: $time';
  }

  @override
  String get smartHomeDeviceName => 'Nome do dispositivo';

  @override
  String get smartHomeDeviceType => 'Tipo de dispositivo';

  @override
  String get smartHomeDeviceTypeTv => 'TV';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Caixa de som';

  @override
  String get smartHomeDeviceTypeWatch => 'Relógio';

  @override
  String get smartHomeDeviceTypeDesktop => 'Desktop';

  @override
  String get smartHomeDeviceTypeOther => 'Outro';

  @override
  String get smartHomeDeviceAdhan => 'Notificações de adhan';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Receber alertas de adhan neste dispositivo';

  @override
  String get smartHomeDeviceVolume => 'Volume';

  @override
  String get smartHomeDeviceAudioType => 'Tipo de áudio';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Orações ativadas';

  @override
  String get smartHomeDeviceSettings => 'Configurações do dispositivo';

  @override
  String get smartHomeTesting => 'Testando...';

  @override
  String get smartHomeTestSuccess => 'Conexão verificada';

  @override
  String get smartHomeTestFailed => 'Teste de conexão falhou';

  @override
  String get smartHomePairTv => 'Parear TV';

  @override
  String get smartHomePairingTv => 'Registrando TV...';

  @override
  String get smartHomePairTvSuccess => 'TV pareada com sucesso';

  @override
  String get smartHomePairTvFailed => 'Pareamento da TV falhou';

  @override
  String get smartHomeLoadingDevices => 'Carregando dispositivos...';

  @override
  String get smartHomeLoadingIntegrations => 'Carregando integrações...';

  @override
  String get smartHomeServiceUnavailable =>
      'O serviço de casa inteligente está temporariamente indisponível. Tente novamente mais tarde.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total concluídos';
  }

  @override
  String get adhkarReset => 'Redefinir';

  @override
  String get syncHistoryTitle => 'Histórico de sincronização';

  @override
  String get syncClearHistory => 'Limpar histórico';

  @override
  String get syncNoConflicts =>
      'Nenhum conflito de sincronização detectado. Todos os dispositivos estão sincronizados.';

  @override
  String get syncDomainSettings => 'Configurações';

  @override
  String get syncDomainCities => 'Cidades salvas';

  @override
  String get syncDomainPrayerLogs => 'Registros de oração';

  @override
  String get syncTimeJustNow => 'agora mesmo';

  @override
  String syncTimeMinAgo(int min) {
    return '${min}min atrás';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '${hour}h atrás';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '${day}d atrás';
  }

  @override
  String get pinCity => 'Fixar';

  @override
  String get pinMaxReached =>
      'Máximo de 5 cidades fixadas. Atualize para Ummat+ para mais.';

  @override
  String pinCityUnpinned(String city) {
    return '$city desfixada';
  }

  @override
  String get pinUndo => 'Desfazer';

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
