// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'Фаджр';

  @override
  String get prayerSunrise => 'Восход';

  @override
  String get prayerDhuhr => 'Зухр';

  @override
  String get prayerAsr => 'Аср';

  @override
  String get prayerMaghrib => 'Магриб';

  @override
  String get prayerIsha => 'Иша';

  @override
  String get prayerQiyam => 'Кийям';

  @override
  String get prayerSuhoor => 'Сухур';

  @override
  String get prayerIftar => 'Ифтар';

  @override
  String get hijriMuharram => 'Мухаррам';

  @override
  String get hijriSafar => 'Сафар';

  @override
  String get hijriRabiAlAwwal => 'Раби аль-Авваль';

  @override
  String get hijriRabiAlThani => 'Раби ас-Сани';

  @override
  String get hijriJumadaAlAwwal => 'Джумада аль-Уля';

  @override
  String get hijriJumadaAlThani => 'Джумада ас-Сания';

  @override
  String get hijriRajab => 'Раджаб';

  @override
  String get hijriShaban => 'Шаабан';

  @override
  String get hijriRamadan => 'Рамадан';

  @override
  String get hijriShawwal => 'Шавваль';

  @override
  String get hijriDhulQidah => 'Зу-ль-Каада';

  @override
  String get hijriDhulHijjah => 'Зу-ль-Хиджа';

  @override
  String get monthJan => 'Янв';

  @override
  String get monthFeb => 'Фев';

  @override
  String get monthMar => 'Мар';

  @override
  String get monthApr => 'Апр';

  @override
  String get monthMay => 'Май';

  @override
  String get monthJun => 'Июн';

  @override
  String get monthJul => 'Июл';

  @override
  String get monthAug => 'Авг';

  @override
  String get monthSep => 'Сен';

  @override
  String get monthOct => 'Окт';

  @override
  String get monthNov => 'Ноя';

  @override
  String get monthDec => 'Дек';

  @override
  String get monthJanuary => 'Январь';

  @override
  String get monthFebruary => 'Февраль';

  @override
  String get monthMarch => 'Март';

  @override
  String get monthApril => 'Апрель';

  @override
  String get monthMayFull => 'Май';

  @override
  String get monthJune => 'Июнь';

  @override
  String get monthJuly => 'Июль';

  @override
  String get monthAugust => 'Август';

  @override
  String get monthSeptember => 'Сентябрь';

  @override
  String get monthOctober => 'Октябрь';

  @override
  String get monthNovember => 'Ноябрь';

  @override
  String get monthDecember => 'Декабрь';

  @override
  String get dayMonShort => 'Пн';

  @override
  String get dayTueShort => 'Вт';

  @override
  String get dayWedShort => 'Ср';

  @override
  String get dayThuShort => 'Чт';

  @override
  String get dayFriShort => 'Пт';

  @override
  String get daySatShort => 'Сб';

  @override
  String get daySunShort => 'Вс';

  @override
  String get dayMonday => 'Понедельник';

  @override
  String get dayTuesday => 'Вторник';

  @override
  String get dayWednesday => 'Среда';

  @override
  String get dayThursday => 'Четверг';

  @override
  String get dayFriday => 'Пятница';

  @override
  String get daySaturday => 'Суббота';

  @override
  String get daySunday => 'Воскресенье';

  @override
  String get daySuChart => 'Вс';

  @override
  String get dayMoChart => 'Пн';

  @override
  String get dayTuChart => 'Вт';

  @override
  String get dayWeChart => 'Ср';

  @override
  String get dayThChart => 'Чт';

  @override
  String get dayFrChart => 'Пт';

  @override
  String get daySaChart => 'Сб';

  @override
  String get chooseCityLabel => 'Выберите город';

  @override
  String get setCityFab => 'Установить город';

  @override
  String prayerTimesError(Object error) {
    return 'Не удалось рассчитать время намаза.\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer через';
  }

  @override
  String get ramadanMubarak => 'Рамадан Мубарак';

  @override
  String ramadanDayProgress(int day) {
    return 'День $day / 30';
  }

  @override
  String get lastTenNights => 'Последние 10 ночей';

  @override
  String get laylatulQadr => 'Ляйлятуль-Кадр';

  @override
  String get homeSuffixAH => 'х.';

  @override
  String get homeSuffixCE => 'н.э.';

  @override
  String get homeNoCitySelected => 'Город не выбран';

  @override
  String get homeNoCityHint =>
      'Нажмите выше, чтобы найти город или включить GPS.';

  @override
  String get homeCouldNotCalc => 'Не удалось рассчитать время намаза.';

  @override
  String get homeQasr => 'Каср';

  @override
  String get homeActionMonthlyTimes => 'Расписание\nна месяц';

  @override
  String get homeActionDuaDhikr => 'Дуа и\nзикр';

  @override
  String get homeActionPrayerStats => 'Статистика\nнамаза';

  @override
  String homePolarBanner(int count) {
    return 'Невозможно рассчитать $count времён намаза для вашей локации в этот период (полярный день/ночь). Попробуйте оценку по ближайшей широте в настройках.';
  }

  @override
  String get settingsTitle => 'Настройки';

  @override
  String get settingsSectionPrayerCalc => 'Расчёт намаза';

  @override
  String get settingsCalcMethod => 'Метод расчёта';

  @override
  String get settingsCalcMethodAuto => 'Авто (Динамический)';

  @override
  String get settingsHanafiAsr => 'Аср по Ханафи';

  @override
  String get settingsHanafiAsrSubtitle =>
      'Коэффициент тени 2x (более позднее время Аср)';

  @override
  String get settingsSectionDisplay => 'Отображение';

  @override
  String get settings24hClock => '24-часовой формат';

  @override
  String get settingsFollowSystemTheme => 'Следовать теме системы';

  @override
  String get settingsDarkMode => 'Тёмный режим';

  @override
  String get settingsSectionNotifications => 'Уведомления';

  @override
  String get settingsPrayerNotifications => 'Уведомления о намазе';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'Азан, напоминания и настройки для каждого намаза';

  @override
  String get settingsPrayerAgendas => 'Расписания намаза';

  @override
  String get settingsPrayerAgendasSubtitle =>
      'Пользовательские напоминания привязанные к намазу';

  @override
  String get settingsAccount => 'Аккаунт';

  @override
  String get settingsSignInToSync => 'Войти для синхронизации';

  @override
  String get settingsSignInToSyncSubtitle =>
      'Сохраняйте данные на всех устройствах';

  @override
  String get settingsHomeScreen => 'Главный экран';

  @override
  String get settingsSkyGradient => 'Градиент неба';

  @override
  String get settingsSkyGradientSubtitle =>
      'Анимированные цвета неба по времени суток';

  @override
  String get settingsWeatherGradient => 'Погодный градиент';

  @override
  String get settingsWeatherGradientSubtitle =>
      'Цвета неба с учётом местной погоды';

  @override
  String get settingsCountdownAnimation => 'Анимация обратного отсчёта';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'Пульсирующее кольцо на следующем намазе';

  @override
  String get settingsPrayerTracking => 'Отслеживание намаза';

  @override
  String get settingsTrackMyPrayers => 'Отслеживать мои намазы';

  @override
  String get settingsTrackMyPrayersSubtitle =>
      'Записывать совершённые намазы каждый день';

  @override
  String get settingsPrayerStats => 'Статистика намаза';

  @override
  String get settingsPrayerStatsSubtitle =>
      'Серии, еженедельные и ежемесячные графики';

  @override
  String get settingsJumuahKahf => 'Напоминание Аль-Кахф в пятницу';

  @override
  String get settingsJumuahKahfSubtitle =>
      'Напоминание каждую пятницу читать суру Аль-Кахф';

  @override
  String get settingsTravel => 'Путешествие';

  @override
  String get settingsTravelMode => 'Режим путешествия';

  @override
  String get settingsTravelModeSubtitle =>
      'Автоматически определять отъезд из дома и корректировать намазы';

  @override
  String get settingsHomeLocation => 'Домашнее местоположение';

  @override
  String get settingsHomeLocationNotSet =>
      'Не задано — нажмите, чтобы использовать текущее местоположение';

  @override
  String get settingsClearHomeLocation => 'Сбросить домашнее местоположение';

  @override
  String get settingsTravelRulings => 'Правила намаза в путешествии';

  @override
  String get settingsTravelRulingsSubtitle =>
      'Каср, объединение и руководство для путешественника';

  @override
  String get settingsSmartHome => 'Умный дом';

  @override
  String get settingsSmartHomeIntegrations => 'Интеграции умного дома';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'ТВ-дисплей';

  @override
  String get settingsTvHome => 'Домашний ТВ-дисплей';

  @override
  String get settingsTvHomeSubtitle => 'Полноэкранные часы намаза для ТВ';

  @override
  String get settingsMasjidDisplay => 'Дисплей мечети';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'Табло азан/икамат для экранов мечети';

  @override
  String get settingsTvSettings => 'Настройки ТВ';

  @override
  String get settingsTvSettingsSubtitle =>
      'Режим мечети, смещения икамата, эмбиент';

  @override
  String get settingsAboutPrayCalc => 'О PrayCalc';

  @override
  String get syncSynced => 'Синхронизировано';

  @override
  String get syncSyncing => 'Синхронизация...';

  @override
  String get syncOffline => 'Офлайн';

  @override
  String get syncError => 'Ошибка синхронизации';

  @override
  String get notifSettingsTitle => 'Уведомления и азан';

  @override
  String get notifAdhanLabel => 'Азан';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'Напоминание: за $minutes мин';
  }

  @override
  String notifVolumePct(int pct) {
    return 'Громкость: $pct%';
  }

  @override
  String get notifTestAdhan => 'Тест азана';

  @override
  String get notifModeOff => 'Выкл';

  @override
  String get notifModeReminderOnly => 'Только напоминание';

  @override
  String get notifModeArrival => 'При наступлении намаза';

  @override
  String get notifModeBoth => 'Напоминание + наступление';

  @override
  String get citySearchHint => 'Поиск города…';

  @override
  String get citySearchDetectTooltip => 'Определить моё местоположение';

  @override
  String get citySearchNoCityGps => 'Не удалось определить город по GPS.';

  @override
  String get citySearchPermissionDenied =>
      'Доступ к местоположению отклонён. Ищите вручную.';

  @override
  String get citySearchNoResults => 'Города не найдены.';

  @override
  String get citySearchStartTyping => 'Начните вводить для поиска…';

  @override
  String get agendasTitle => 'Расписания намаза';

  @override
  String get agendasEmpty =>
      'Расписаний пока нет.\nНажмите +, чтобы добавить напоминание к намазу.';

  @override
  String get agendasUndo => 'Отменить';

  @override
  String agendasRemoved(String label) {
    return '$label удалено';
  }

  @override
  String get agendaNewTitle => 'Новое расписание';

  @override
  String get agendaEditTitle => 'Редактировать расписание';

  @override
  String get agendaSave => 'Сохранить';

  @override
  String get agendaLabelEmpty => 'Название не может быть пустым';

  @override
  String get agendaLabelField => 'Название';

  @override
  String get agendaLabelHint => 'напр.: Подъём на Фаджр';

  @override
  String get agendaPrayerSection => 'Намаз';

  @override
  String get agendaTimeOffsetSection => 'Смещение времени';

  @override
  String get agendaOffsetAtPrayerTime => 'Во время намаза';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return 'За $minutes мин до';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return 'Через $minutes мин после';
  }

  @override
  String get agendaRepeatSection => 'Повтор';

  @override
  String get agendaNotifTypeSection => 'Тип уведомления';

  @override
  String get agendaNotifSilent => 'Беззвучно';

  @override
  String get agendaNotifSound => 'Звук';

  @override
  String get agendaNotifVibrate => 'Вибрация';

  @override
  String get agendaDayM => 'Пн';

  @override
  String get agendaDayT => 'Вт';

  @override
  String get agendaDayW => 'Ср';

  @override
  String get agendaDayF => 'Пт';

  @override
  String get agendaDayS => 'Сб';

  @override
  String get moonTitle => 'Луна и хиджри';

  @override
  String moonIlluminated(int pct) {
    return 'Освещённость $pct%';
  }

  @override
  String get moonFullTonight => 'Полнолуние сегодня!';

  @override
  String get moonNextTomorrow => 'Следующее полнолуние завтра';

  @override
  String moonNextDays(int days) {
    return 'Следующее полнолуние через $days дн.';
  }

  @override
  String moonAge(String age) {
    return 'Возраст луны: $age дн.';
  }

  @override
  String get moonPhaseNewMoon => 'Новолуние';

  @override
  String get moonPhaseWaxingCrescent => 'Растущий серп';

  @override
  String get moonPhaseFirstQuarter => 'Первая четверть';

  @override
  String get moonPhaseWaxingGibbous => 'Растущая луна';

  @override
  String get moonPhaseFullMoon => 'Полнолуние';

  @override
  String get moonPhaseWaningGibbous => 'Убывающая луна';

  @override
  String get moonPhaseLastQuarter => 'Последняя четверть';

  @override
  String get moonPhaseWaningCrescent => 'Убывающий серп';

  @override
  String get moonHilalVisibility => 'Следующая видимость хиляля';

  @override
  String get moonRegionMiddleEast => 'Ближний Восток';

  @override
  String get moonRegionWestAfrica => 'Западная Африка';

  @override
  String get moonRegionSouthAsia => 'Южная Азия';

  @override
  String get moonRegionEurope => 'Европа';

  @override
  String get moonRegionAmericas => 'Америка';

  @override
  String get moonVisible => 'Виден';

  @override
  String get moonNotVisible => 'Не виден';

  @override
  String get moonPossible => 'Возможно';

  @override
  String get moonUpcomingDates => 'Предстоящие исламские даты';

  @override
  String get hijriTodayLabel => 'Сегодня по хиджре';

  @override
  String ramadanBeginsLabel(int year) {
    return 'Рамадан $year г.х. начинается';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'через $days дн.';
  }

  @override
  String get moonLunarCycle => 'Лунный цикл';

  @override
  String moonDayOfCycle(int day) {
    return 'День $day из ~29,5';
  }

  @override
  String get moonHilalSightingForecast => 'Прогноз видимости хиляля';

  @override
  String get moonHilalVisibilityMap => 'Карта видимости хиляля';

  @override
  String moonDayN(int day) {
    return 'День $day';
  }

  @override
  String get moonGlobalSighting => 'Глобальное наблюдение';

  @override
  String get moonZoneNakedEye => 'Невооружённым глазом';

  @override
  String get moonZoneBinoculars => 'В бинокль';

  @override
  String get moonZoneVeryDifficult => 'Очень сложно';

  @override
  String get moonZoneNotVisible => 'Не виден';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year г.х. вероятно будет 29 дней. Ожидается, что полумесяц будет виден 29-го, ин ша Аллах.';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year г.х. вероятно будет 30 дней. Полумесяц вряд ли будет виден 29-го — месяц завершится через 30 дней.';
  }

  @override
  String get moonUmmAlQura => 'Умм аль-Кура';

  @override
  String get moonSaudiArabia => 'Саудовская Аравия';

  @override
  String get moonFCNACalc => 'FCNA / Расч.';

  @override
  String get moonNorthAmerica => 'Северная Америка';

  @override
  String moonNDays(int days) {
    return '$days дн.';
  }

  @override
  String moonStarts(String month) {
    return '$month начинается:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'Возраст луны на закате: $hours ч';
  }

  @override
  String get moon7DayLunarCalendar => 'Лунный календарь на 7 дней';

  @override
  String get moonUpcomingIslamicEvents => 'Предстоящие исламские события';

  @override
  String get moonTodayLabel => 'Сегодня';

  @override
  String get moonTomorrowLabel => 'Завтра';

  @override
  String get calDateCol => 'Дата';

  @override
  String get calHijriCol => 'Хиджра';

  @override
  String get calFajrCol => 'Фаджр';

  @override
  String get calSunriseCol => 'Восход';

  @override
  String get calDhuhrCol => 'Зухр';

  @override
  String get calAsrCol => 'Аср';

  @override
  String get calMaghribCol => 'Магриб';

  @override
  String get calIshaCol => 'Иша';

  @override
  String get calNoCityText =>
      'Сначала выберите город,\nчтобы увидеть календарь намазов.';

  @override
  String get calShareTooltip => 'Поделиться календарём';

  @override
  String get calPrevMonthTooltip => 'Предыдущий месяц';

  @override
  String get calNextMonthTooltip => 'Следующий месяц';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'Время намаза — $month';
  }

  @override
  String get qiblaTitle => 'Кибла';

  @override
  String get qiblaSwitchToCompass => 'Переключить на компас';

  @override
  String get qiblaSwitchToAR => 'Переключить на AR-камеру';

  @override
  String get qiblaNoCityText =>
      'Сначала выберите город,\nчтобы рассчитать направление киблы.';

  @override
  String get qiblaCompassUnavailable =>
      'Датчик компаса недоступен на этом устройстве.';

  @override
  String get qiblaCalibrate => 'Калибровка: двигайте телефон восьмёркой.';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° от севера';
  }

  @override
  String qiblaFrom(String city) {
    return 'Из $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist км от Каабы';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K км от Каабы';
  }

  @override
  String get qiblaFacingQibla => 'Направлено на киблу ✓';

  @override
  String get tasbeehTitle => 'Тасбих';

  @override
  String get tasbeehResetTooltip => 'Сброс';

  @override
  String get tasbeehTapToSwitch => 'Нажмите на ярлык для переключения';

  @override
  String get tasbeehTapToCount => 'Нажмите в любом месте для подсчёта';

  @override
  String get tasbeehResetDialogTitle => 'Сбросить счётчик?';

  @override
  String get tasbeehResetDialogContent => 'Текущий счёт будет сброшен до нуля.';

  @override
  String get tasbeehCancel => 'Отмена';

  @override
  String get tasbeehReset => 'Сброс';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'Сегодня: $count зикров';
  }

  @override
  String get tasbeehLast7Days => 'За 7 дней';

  @override
  String get tasbeehNoHistory => 'Истории пока нет — начните считать!';

  @override
  String tasbeehComplete(int count) {
    return 'Тасбих завершён! $count зикров';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'Умный дом';

  @override
  String get smartHomeSubtitle => 'Подключите устройства к времени намаза';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'Спросите Google о времени намаза и направлении киблы';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'Спросите Alexa о времени намаза, следующем намазе и др.';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc =>
      'Создайте пользовательские команды для времени намаза';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'Автоматизируйте освещение, дисплеи и напоминания по времени намаза';

  @override
  String get smartHomeLinkAccount => 'Привязать аккаунт';

  @override
  String get smartHomeLinked => 'Привязано';

  @override
  String get smartHomeUnlink => 'Отвязать';

  @override
  String get smartHomeSetupInstructions => 'Инструкции по настройке';

  @override
  String get smartHomeRequiresUmmatPlus => 'Требуется Ummat+';

  @override
  String get smartHomeTroubleshooting => 'Устранение неполадок';

  @override
  String get smartHomeTestConnection => 'Тест подключения';

  @override
  String get smartHomeConnectionSuccess => 'Подключение успешно';

  @override
  String get smartHomeConnectionFailed =>
      'Подключение не удалось. Проверьте привязку аккаунта.';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'Премиум-функции намаза';

  @override
  String get subscriptionUpgrade => 'Перейти на Ummat+';

  @override
  String get subscriptionRestore => 'Восстановить покупку';

  @override
  String get subscriptionManage => 'Управление подпиской';

  @override
  String get subscriptionCancel => 'Отменить подписку';

  @override
  String get subscriptionActive => 'Активна';

  @override
  String get subscriptionExpired => 'Истекла';

  @override
  String get subscriptionFree => 'Бесплатно';

  @override
  String get subscriptionFreeDesc => 'Базовое время намаза, кибла, календарь';

  @override
  String get subscriptionPlusDesc =>
      'Умный дом, ТВ-дисплей, виджеты и многое другое';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return 'Осталось $count бесплатных запросов';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/год';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/мес';
  }

  @override
  String get subscriptionFeatureSmartHome => 'Интеграция умного дома';

  @override
  String get subscriptionFeatureTV => 'Режим ТВ-дисплея';

  @override
  String get subscriptionFeatureWidgets => 'Виджеты на главный экран';

  @override
  String get subscriptionFeatureWatch => 'Циферблат часов';

  @override
  String get subscriptionFeatureSync => 'Синхронизация между устройствами';

  @override
  String get subscriptionFeatureAdFree => 'Без рекламы';

  @override
  String get watchTitle => 'Часы';

  @override
  String get watchNextPrayer => 'Следующий намаз';

  @override
  String get watchAllPrayers => 'Все намазы';

  @override
  String get watchComplication => 'Циферблат';

  @override
  String get nextPrayer => 'Следующий намаз';

  @override
  String get allPrayers => 'Все намазы';

  @override
  String get today => 'Сегодня';

  @override
  String get tomorrow => 'Завтра';

  @override
  String get thisWeek => 'На этой неделе';

  @override
  String get thisMonth => 'В этом месяце';

  @override
  String get loginCreateAccount => 'Создать аккаунт';

  @override
  String get loginSignIn => 'Войти';

  @override
  String get loginWelcomeBack => 'С возвращением';

  @override
  String get loginJoinPrayCalc => 'Присоединиться к PrayCalc';

  @override
  String get loginSyncSubtitle =>
      'Синхронизируйте данные намаза между устройствами';

  @override
  String get loginContinueGoogle => 'Продолжить с Google';

  @override
  String get loginOr => 'или';

  @override
  String get loginSigningIn => 'Вход…';

  @override
  String get loginNameLabel => 'Отображаемое имя (необязательно)';

  @override
  String get loginEmailLabel => 'Эл. почта';

  @override
  String get loginPasswordLabel => 'Пароль';

  @override
  String get loginEmailRequired => 'Необходимо указать эл. почту';

  @override
  String get loginEmailInvalid => 'Введите корректный адрес эл. почты';

  @override
  String get loginPasswordRequired => 'Необходимо указать пароль';

  @override
  String get loginPasswordMinLength =>
      'Пароль должен содержать не менее 8 символов';

  @override
  String get loginForgotPassword => 'Забыли пароль?';

  @override
  String get loginEnterEmailFirst => 'Сначала введите адрес эл. почты';

  @override
  String get loginResetSent => 'Письмо для сброса пароля отправлено';

  @override
  String get loginResetFailed => 'Не удалось отправить письмо для сброса';

  @override
  String get loginNewToPrayCalc => 'Новичок в PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'Уже есть аккаунт?';

  @override
  String get accountTitle => 'Аккаунт';

  @override
  String get accountNotSignedIn => 'Вы не вошли';

  @override
  String get accountSyncSection => 'Синхронизация';

  @override
  String get accountSyncStatus => 'Статус синхронизации';

  @override
  String get accountSyncNow => 'Синхронизировать';

  @override
  String get accountSyncHistory => 'История синхронизации';

  @override
  String get accountNoConflicts => 'Конфликтов не обнаружено';

  @override
  String accountConflictsResolved(int count) {
    return 'Разрешено $count';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'Синхронизировано $time';
  }

  @override
  String get accountOfflineStatus => 'Офлайн. Изменения сохранены локально.';

  @override
  String get accountSyncErrorStatus => 'Ошибка синхронизации. Будет повтор.';

  @override
  String get accountDataSection => 'Данные';

  @override
  String get accountExportData => 'Экспорт данных';

  @override
  String get accountExportSubtitle => 'Скачать настройки и записи намазов';

  @override
  String get accountExportFailed => 'Не удалось экспортировать данные';

  @override
  String get accountSignOutTitle => 'Выйти';

  @override
  String get accountSignOutBody =>
      'Локальные данные сохранятся. Войдите снова для продолжения синхронизации.';

  @override
  String get accountDeleteAccount => 'Удалить аккаунт';

  @override
  String get accountDeleteSubtitle => 'Навсегда удалить аккаунт и данные';

  @override
  String get accountDeleteBody =>
      'Это навсегда удалит ваш аккаунт и все синхронизированные данные. Локальные данные на этом устройстве не будут удалены.\n\nЭто действие нельзя отменить.';

  @override
  String get accountDeleted => 'Аккаунт удалён';

  @override
  String get accountDeleteFailed => 'Не удалось удалить аккаунт';

  @override
  String get accountTimeJustNow => 'только что';

  @override
  String accountTimeMinAgo(int min) {
    return '$min мин. назад';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour ч. назад';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day дн. назад';
  }

  @override
  String get statsTitle => 'Статистика намаза';

  @override
  String get statsShareTooltip => 'Поделиться статистикой';

  @override
  String get statsTodayPrayers => 'Намазы сегодня';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'Серия';

  @override
  String get statsDays => 'дней';

  @override
  String get statsThisWeek => 'На этой неделе';

  @override
  String get statsCompletion => 'выполнение';

  @override
  String get statsThisMonth => 'В этом месяце';

  @override
  String get statsMostMissed => 'Чаще пропускаемый';

  @override
  String get statsThisWeekLabel => 'на этой неделе';

  @override
  String get statsWeeklyChart => 'Еженедельное выполнение по намазам';

  @override
  String get statsMonthlyChart => 'Ежемесячное выполнение по намазам';

  @override
  String statsTotalLogged(int count) {
    return 'Всего записано $count намазов';
  }

  @override
  String get statsKeepItUp => 'Так держать!';

  @override
  String get statsShareTitle => 'Статистика намаза PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'Серия: $days дн.';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'За неделю: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'За месяц: $pct%';
  }

  @override
  String get statsShareBreakdown => 'Недельная разбивка:';

  @override
  String get aboutTitle => 'О PrayCalc';

  @override
  String get aboutWebsite => 'Сайт';

  @override
  String get aboutContact => 'Связаться';

  @override
  String get aboutLicenses => 'Лицензии открытого ПО';

  @override
  String get aboutCouldNotOpen => 'Не удалось открыть ссылку.';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. Все права защищены.\n\nВремя намаза рассчитывается движком pray_calc_dart. Точность зависит от GPS-координат и выбранного метода расчёта.';
  }

  @override
  String get commonCancel => 'Отмена';

  @override
  String get commonSave => 'Сохранить';

  @override
  String get commonDelete => 'Удалить';

  @override
  String get commonEdit => 'Изменить';

  @override
  String get commonRetry => 'Повторить';

  @override
  String get commonClose => 'Закрыть';

  @override
  String get commonDone => 'Готово';

  @override
  String get commonBack => 'Назад';

  @override
  String get commonNext => 'Далее';

  @override
  String get commonSkip => 'Пропустить';

  @override
  String get commonContinue => 'Продолжить';

  @override
  String get commonOk => 'ОК';

  @override
  String get commonYes => 'Да';

  @override
  String get commonNo => 'Нет';

  @override
  String get commonShare => 'Поделиться';

  @override
  String get commonCopy => 'Копировать';

  @override
  String get commonCopied => 'Скопировано в буфер обмена';

  @override
  String get commonLoading => 'Загрузка...';

  @override
  String get commonError => 'Что-то пошло не так';

  @override
  String get commonErrorRetry => 'Что-то пошло не так. Нажмите для повтора.';

  @override
  String get commonNoInternet => 'Нет подключения к интернету';

  @override
  String get commonOfflineMode => 'Офлайн-режим';

  @override
  String get commonSignIn => 'Войти';

  @override
  String get commonSignOut => 'Выйти';

  @override
  String get commonSignUp => 'Регистрация';

  @override
  String get commonProfile => 'Профиль';

  @override
  String get commonAccount => 'Аккаунт';

  @override
  String get commonAbout => 'О приложении';

  @override
  String commonVersion(String version) {
    return 'Версия $version';
  }

  @override
  String get commonPrivacyPolicy => 'Политика конфиденциальности';

  @override
  String get commonTermsOfService => 'Условия использования';

  @override
  String get commonRateApp => 'Оценить приложение';

  @override
  String get commonFeedback => 'Обратная связь';

  @override
  String get commonHelp => 'Помощь';

  @override
  String get commonLanguage => 'Язык';

  @override
  String get commonOpenSettings => 'Открыть настройки';

  @override
  String get travelNotificationTitle => 'Вы в путешествии';

  @override
  String get travelNotificationBody =>
      'Время намаза может быть сокращено. Нажмите, чтобы узнать правила путешествия.';

  @override
  String get travelRulingsTitle => 'Путешествие и намаз';

  @override
  String get travelRulingsIntro =>
      'Исламские правила намаза во время путешествия со ссылками на Коран и достоверные хадисы.';

  @override
  String get travelWhenTitle => 'Когда применяются правила путешествия?';

  @override
  String get travelQasrTitle => 'Сокращение намаза (каср)';

  @override
  String get travelJamTitle => 'Объединение намазов (джам)';

  @override
  String get travelDurationTitle => 'Продолжительность путешествия';

  @override
  String get travelReferencesTitle => 'Научные ссылки';

  @override
  String get travelLearnMore => 'Подробнее';

  @override
  String get travelHanafiDefaultTitle =>
      'Почему PrayCalc использует ханафитские значения по умолчанию';

  @override
  String get travelDeeperScholarly => 'Углублённое научное обсуждение';

  @override
  String get onboardingTitle1 => 'Время намаза, где бы вы ни были';

  @override
  String get onboardingBody1 =>
      'Точное время намаза по GPS для каждого города на Земле. От Фаджра до Иши, от восхода до Кийяма. На основе собственного расчётного движка, созданного для точности.';

  @override
  String get onboardingTitle2 => 'Ваше местоположение, ваше время';

  @override
  String get onboardingBody2 =>
      'Ищите любой город или позвольте GPS определить ваше местоположение. PrayCalc находит время для 5 миллионов городов по всему миру.';

  @override
  String get onboardingTitle3 => 'Никогда не пропускайте намаз';

  @override
  String get onboardingBody3 =>
      'Азан в время намаза, напоминания заранее. Настраиваемые расписания для сухура, занятий и многого другого.';

  @override
  String get onboardingTitle4 => 'Всё, что вам нужно';

  @override
  String get onboardingBody4 =>
      'Компас киблы, календарь намазов, лунная фаза хиджры, счётчик тасбиха. Всё в одном месте.';

  @override
  String get onboardingSkip => 'Пропустить';

  @override
  String get onboardingGetStarted => 'Начать';

  @override
  String get onboardingSignInTitle => 'Войти в PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'Сохраните историю намазов и\nсинхронизируйте на всех устройствах.';

  @override
  String get onboardingContinueGoogle => 'Продолжить с Google';

  @override
  String get onboardingContinueWithoutAccount => 'Продолжить без аккаунта';

  @override
  String get onboardingSigningIn => 'Вход…';

  @override
  String get onboardingSelectLanguage => 'Выберите язык';

  @override
  String get duaDhikrTitle => 'Дуа и зикр';

  @override
  String get duaDhikrTabDua => 'Дуа';

  @override
  String get duaDhikrTabDhikr => 'Зикр';

  @override
  String get duaDhikrTabTasbeeh => 'Тасбих';

  @override
  String get duaDhikrTabMorning => 'Утро';

  @override
  String get duaDhikrTabEvening => 'Вечер';

  @override
  String get duaDhikrMorningAdhkar => 'Утренние азкары';

  @override
  String get duaDhikrEveningAdhkar => 'Вечерние азкары';

  @override
  String get calGregToggle => 'Григ.';

  @override
  String get calHijriToggle => 'Хиджра';

  @override
  String get calYearlyTooltip => 'Годовой календарь';

  @override
  String get calExportIcsTooltip => 'Экспорт .ics';

  @override
  String get calMagCol => 'Маг';

  @override
  String get qiblaShowOnMap => 'Показать на карте';

  @override
  String get qiblaWaitingCompass => 'Ожидание компаса...';

  @override
  String get qiblaNoCompassSensor =>
      'Нет датчика компаса. Направление киблы показано статически.';

  @override
  String get qiblaAccuracyExcellent => 'Отличная точность';

  @override
  String get qiblaAccuracyGood => 'Хорошая точность';

  @override
  String get qiblaAccuracyFair =>
      'Средняя точность. Калибруйте, двигая телефон восьмёркой.';

  @override
  String get qiblaAccuracyLow =>
      'Низкая точность. Калибруйте, двигая телефон восьмёркой.';

  @override
  String get qiblaToTheKaaba => 'к Каабе';

  @override
  String get qiblaYourLocation => 'Ваше местоположение';

  @override
  String get qiblaGpsAccurate => 'Точность GPS';

  @override
  String get qiblaCityCenter => 'Центр города';

  @override
  String get moonIlluminatedLabel => 'Освещённость';

  @override
  String get moonAgeLabel => 'Возраст';

  @override
  String get moonFirstQtr => '1-я четв.';

  @override
  String get moonLastQtr => 'Посл. четв.';

  @override
  String get moonTonight => 'Сегодня ночью';

  @override
  String get moonTomorrow => 'Завтра';

  @override
  String moonDaysAway(int days) {
    return '$daysд';
  }

  @override
  String get moonBeta => 'Бета';

  @override
  String get setHomeTitle => 'Установить домашнее местоположение';

  @override
  String get setHomeSearchHint => 'Поиск города, посёлка или индекса…';

  @override
  String get setHomeClear => 'Очистить';

  @override
  String get setHomeUseCurrentLocation => 'Использовать текущее местоположение';

  @override
  String get setHomeDetectAndSet =>
      'Определить местоположение и установить как дом';

  @override
  String get setHomeAlreadySet => 'Домашнее местоположение уже установлено';

  @override
  String setHomeSetAs(String city) {
    return '$city установлен как дом';
  }

  @override
  String get setHomeCurrentLocationSet =>
      'Текущее местоположение установлено как дом';

  @override
  String get setHomePermissionDenied =>
      'Доступ к местоположению отклонён. Ищите город ниже.';

  @override
  String get setHomeGpsUnavailable => 'GPS недоступен. Ищите вручную.';

  @override
  String get setHomeNoCitiesFound => 'Города не найдены.';

  @override
  String get setHomeSearchPrompt => 'Найдите свой домашний город';

  @override
  String get setHomeSearchBody =>
      'Начните вводить текст для поиска или используйте текущее местоположение. Режим путешествия определит, когда вы не дома.';

  @override
  String get subscriptionYouHavePlus => 'У вас есть Ummat+';

  @override
  String get subscriptionUpgradeTo => 'Перейти на Ummat+';

  @override
  String get subscriptionThankYou => 'Спасибо за поддержку PrayCalc.';

  @override
  String get subscriptionUnlockPremium =>
      'Разблокируйте премиум-функции на всех устройствах.';

  @override
  String get subscriptionManageSub => 'Управление подпиской';

  @override
  String get subscriptionWelcome => 'Добро пожаловать в Ummat+!';

  @override
  String get subscriptionSubscribe => 'Подписаться';

  @override
  String get subscriptionFreeFeatures => 'Бесплатные функции';

  @override
  String get subscriptionPlusFeatures => 'Функции Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'Время намаза';

  @override
  String get subscriptionFeatureQibla => 'Компас киблы';

  @override
  String get subscriptionFeatureCalendar => 'Месячный календарь';

  @override
  String get subscriptionFeatureTasbeeh => 'Счётчик тасбиха';

  @override
  String get subscriptionFeatureMoon => 'Луна и хиджра';

  @override
  String get smartHomeAlertType => 'Тип оповещения';

  @override
  String get smartHomeAlertModal => 'Полноэкранное окно';

  @override
  String get smartHomeAlertCorner => 'Угловое уведомление';

  @override
  String get smartHomeAlertNone => 'Нет (без звука)';

  @override
  String get smartHomePauseMedia => 'Пауза медиа во время азана';

  @override
  String get smartHomeQuietHours => 'Тихие часы';

  @override
  String get smartHomeQuietFrom => 'С';

  @override
  String get smartHomeQuietTo => 'До';

  @override
  String get smartHomePrayerAudio => 'Звук для каждого намаза';

  @override
  String get smartHomeAudioAdhan => 'Азан';

  @override
  String get smartHomeAudioBeep => 'Звуковой сигнал';

  @override
  String get smartHomeAudioSilent => 'Без звука';

  @override
  String get aboutPrivacy => 'Политика конфиденциальности';

  @override
  String aboutVersion(String version) {
    return 'Версия $version';
  }

  @override
  String get notifDefaultAdhan => 'Азан по умолчанию';

  @override
  String get notifFajrAdhan => 'Азан Фаджр';

  @override
  String get notifFajrAdhanSubtitle => 'Воспроизводится в время Фаджра';

  @override
  String get notifRegularAdhan => 'Обычный азан';

  @override
  String get notifRegularAdhanSubtitle =>
      'Воспроизводится для Зухр, Аср, Магриб, Иша';

  @override
  String get notifPerPrayerSettings => 'Настройки по намазам';

  @override
  String get notifPreview => 'Предпросмотр';

  @override
  String get tvSettingsTitle => 'Настройки ТВ';

  @override
  String get tvDisplayMode => 'Режим отображения';

  @override
  String get tvMasjidMode => 'Режим мечети';

  @override
  String get tvMasjidModeSubtitle => 'Большой дисплей с временем икамата';

  @override
  String get tvMasjidName => 'Название мечети';

  @override
  String get tvMasjidNameTapToSet => 'Нажмите для установки';

  @override
  String get tvClock => 'Часы';

  @override
  String get tv24hFormat => '24-часовой формат';

  @override
  String get tvIqamahOffsets => 'Смещения икамата (минуты после азана)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset мин после азана';
  }

  @override
  String get tvQrCode => 'QR-код';

  @override
  String get tvShowQrCode => 'Показать QR-код';

  @override
  String get tvShowQrCodeSubtitle => 'Отображать QR-код на экране мечети';

  @override
  String get tvQrCodeUrl => 'URL QR-кода';

  @override
  String get tvAmbientModeSection => 'Эмбиент-режим';

  @override
  String get tvIdleTimeout => 'Таймаут бездействия';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes мин до активации эмбиента';
  }

  @override
  String get tvPhotoInterval => 'Интервал фотографий';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds секунд между фото';
  }

  @override
  String get tvBackground => 'Фон';

  @override
  String get tvPhotoCategory => 'Категория фото';

  @override
  String get tvLocation => 'Местоположение';

  @override
  String get tvChangeCity => 'Сменить город';

  @override
  String get tvChangeCitySubtitle => 'Найти другой город';

  @override
  String get tvScreensaverBg => 'Фон заставки';

  @override
  String get tvScreensaverPhotos => 'Фото';

  @override
  String get tvScreensaverPattern => 'Геометрический узор';

  @override
  String get tvScreensaverBoth => 'Фото + узор';

  @override
  String get tvCategoryAll => 'Все категории';

  @override
  String get tvCategoryMasjids => 'Мечети';

  @override
  String get tvCategoryInteriors => 'Интерьеры';

  @override
  String get tvCategoryGeometric => 'Геометрия';

  @override
  String get tvCategoryCalligraphy => 'Каллиграфия';

  @override
  String get tvCategoryLandscapes => 'Пейзажи';

  @override
  String get tvCategoryRamadan => 'Рамадан';

  @override
  String get tvPhotoCategoryTitle => 'Категория фото';

  @override
  String tvEnterHint(String title) {
    return 'Введите $title';
  }

  @override
  String get tvSystemDefault => 'По умолчанию';

  @override
  String get smartHomeIntegrations => 'Интеграции';

  @override
  String get smartHomeLinkedSpeakers => 'Подключённые колонки и дисплеи';

  @override
  String get smartHomeAlertDisplay => 'Отображение оповещений';

  @override
  String get smartHomeAtAdhanShow => 'При азане показывать';

  @override
  String get smartHomePauseMediaTitle => 'Пауза медиа при азане';

  @override
  String get smartHomePauseMediaSubtitle =>
      'Возобновляется после окончания азана';

  @override
  String get smartHomePrayerAudioSection => 'Звук намаза';

  @override
  String get smartHomeQuietHoursSection => 'Тихие часы';

  @override
  String get smartHomeEnableQuietHours => 'Включить тихие часы';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'Все оповещения умного дома отключены';

  @override
  String get smartHomeNoDevices => 'Устройства ещё не подключены';

  @override
  String get smartHomeNoDevicesDesc =>
      'Подключите Google Home или Alexa выше, и ваши колонки и дисплеи появятся здесь.';

  @override
  String get smartHomeRequiresPlus => 'Умный дом требует Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'Управляйте оповещениями азана на Google Home, Alexa, Siri и Home Assistant. Настройте устройства для азана, паузу медиа и тихие часы.';

  @override
  String get smartHomeBroadcastGoogle =>
      'Транслируйте азан на колонках и дисплеях Nest.';

  @override
  String get smartHomeEnableAlexa => 'Включите навык PrayCalc на Alexa.';

  @override
  String get smartHomeSiriAsk =>
      'Спросите Siri о времени намаза или настройте автоматизацию.';

  @override
  String get smartHomeHassAdd =>
      'Добавьте через HACS для полной поддержки автоматизации.';

  @override
  String get smartHomeSetupGuide => 'Руководство по настройке';

  @override
  String get smartHomeSiriSetupTitle => 'Настройка Siri Shortcuts';

  @override
  String get smartHomeSiriStep1 =>
      'Откройте приложение «Быстрые команды» на iPhone или iPad.';

  @override
  String get smartHomeSiriStep2 => 'Нажмите «+» для создания новой команды.';

  @override
  String get smartHomeSiriStep3 => 'Найдите «PrayCalc» в списке действий.';

  @override
  String get smartHomeSiriStep4 =>
      'Добавьте «Время следующего намаза» или «Намазы сегодня».';

  @override
  String get smartHomeSiriStep5 =>
      'По желанию добавьте в автоматизацию (напр., ежедневно в Фаджр).';

  @override
  String get smartHomeSiriStep6 =>
      'Скажите «Hey Siri, next prayer time» для проверки.';

  @override
  String get smartHomeSiriFootnote => 'Требуется iOS 16 или новее.';

  @override
  String get smartHomeHassSetupTitle => 'Настройка Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'Установите HACS (Home Assistant Community Store).';

  @override
  String get smartHomeHassStep2 => 'В HACS найдите «PrayCalc» и установите.';

  @override
  String get smartHomeHassStep3 =>
      'Перейдите в Настройки > Устройства и службы > Добавить интеграцию.';

  @override
  String get smartHomeHassStep4 => 'Найдите «PrayCalc» и выберите.';

  @override
  String get smartHomeHassStep5 =>
      'Введите API-ключ PrayCalc (создан в вашем аккаунте).';

  @override
  String get smartHomeHassStep6 => 'Настройте местоположение и метод расчёта.';

  @override
  String get smartHomeHassFootnote =>
      'Требуется Home Assistant 2024.1+ с HACS.';

  @override
  String get smartHomeApiKey => 'API-ключ';

  @override
  String get smartHomeGenerateApiKey => 'Сгенерировать API-ключ';

  @override
  String get smartHomeApiKeyNotReady =>
      'Генерация API-ключа будет доступна после запуска смарт-сервиса PrayCalc.';

  @override
  String get smartHomeApiKeyDesc =>
      'API-ключ нужен для подключения Home Assistant к аккаунту PrayCalc.';

  @override
  String get smartHomeLinkedStatus => 'Подключено';

  @override
  String get smartHomeNotLinkedStatus => 'Не подключено';

  @override
  String get smartHomeCouldNotOpen => 'Не удалось открыть ссылку.';

  @override
  String get smartHomeDevices => 'Устройства';

  @override
  String get smartHomeAddDevice => 'Добавить устройство';

  @override
  String get smartHomeDeleteDevice => 'Удалить';

  @override
  String get smartHomeDeleteDeviceConfirm => 'Удалить это устройство?';

  @override
  String get smartHomeDeviceOnline => 'Онлайн';

  @override
  String get smartHomeDeviceOffline => 'Офлайн';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'Последний раз: $time';
  }

  @override
  String get smartHomeDeviceName => 'Имя устройства';

  @override
  String get smartHomeDeviceType => 'Тип устройства';

  @override
  String get smartHomeDeviceTypeTv => 'ТВ';

  @override
  String get smartHomeDeviceTypeSpeaker => 'Колонка';

  @override
  String get smartHomeDeviceTypeWatch => 'Часы';

  @override
  String get smartHomeDeviceTypeDesktop => 'Компьютер';

  @override
  String get smartHomeDeviceTypeOther => 'Другое';

  @override
  String get smartHomeDeviceAdhan => 'Уведомления азана';

  @override
  String get smartHomeDeviceAdhanDesc =>
      'Получать оповещения азана на этом устройстве';

  @override
  String get smartHomeDeviceVolume => 'Громкость';

  @override
  String get smartHomeDeviceAudioType => 'Тип аудио';

  @override
  String get smartHomeDeviceEnabledPrayers => 'Включённые намазы';

  @override
  String get smartHomeDeviceSettings => 'Настройки устройства';

  @override
  String get smartHomeTesting => 'Тестирование...';

  @override
  String get smartHomeTestSuccess => 'Подключение подтверждено';

  @override
  String get smartHomeTestFailed => 'Тест подключения не пройден';

  @override
  String get smartHomePairTv => 'Подключить ТВ';

  @override
  String get smartHomePairingTv => 'Регистрация ТВ...';

  @override
  String get smartHomePairTvSuccess => 'ТВ успешно подключён';

  @override
  String get smartHomePairTvFailed => 'Подключение ТВ не удалось';

  @override
  String get smartHomeLoadingDevices => 'Загрузка устройств...';

  @override
  String get smartHomeLoadingIntegrations => 'Загрузка интеграций...';

  @override
  String get smartHomeServiceUnavailable =>
      'Сервис умного дома временно недоступен. Попробуйте позже.';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total выполнено';
  }

  @override
  String get adhkarReset => 'Сброс';

  @override
  String get syncHistoryTitle => 'История синхронизации';

  @override
  String get syncClearHistory => 'Очистить историю';

  @override
  String get syncNoConflicts =>
      'Конфликтов синхронизации не обнаружено. Все устройства синхронизированы.';

  @override
  String get syncDomainSettings => 'Настройки';

  @override
  String get syncDomainCities => 'Сохранённые города';

  @override
  String get syncDomainPrayerLogs => 'Записи намазов';

  @override
  String get syncTimeJustNow => 'только что';

  @override
  String syncTimeMinAgo(int min) {
    return '$min мин. назад';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour ч. назад';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day дн. назад';
  }

  @override
  String get pinCity => 'Закрепить';

  @override
  String get pinMaxReached =>
      'Максимум 5 закреплённых городов. Перейдите на Ummat+ для увеличения.';

  @override
  String pinCityUnpinned(String city) {
    return '$city откреплён';
  }

  @override
  String get pinUndo => 'Отменить';

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
