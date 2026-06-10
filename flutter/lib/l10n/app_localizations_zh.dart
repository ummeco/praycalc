// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => '晨礼';

  @override
  String get prayerSunrise => '日出';

  @override
  String get prayerDhuhr => '晌礼';

  @override
  String get prayerAsr => '晡礼';

  @override
  String get prayerMaghrib => '昏礼';

  @override
  String get prayerIsha => '宵礼';

  @override
  String get prayerQiyam => '夜间拜';

  @override
  String get prayerSuhoor => '封斋饭';

  @override
  String get prayerIftar => '开斋饭';

  @override
  String get hijriMuharram => '穆哈拉姆月';

  @override
  String get hijriSafar => '赛法尔月';

  @override
  String get hijriRabiAlAwwal => '赖比尔·敖外鲁月';

  @override
  String get hijriRabiAlThani => '赖比尔·阿赫尔月';

  @override
  String get hijriJumadaAlAwwal => '主马达·敖外鲁月';

  @override
  String get hijriJumadaAlThani => '主马达·阿赫尔月';

  @override
  String get hijriRajab => '赖哲卜月';

  @override
  String get hijriShaban => '舍尔邦月';

  @override
  String get hijriRamadan => '莱麦丹月';

  @override
  String get hijriShawwal => '闪瓦鲁月';

  @override
  String get hijriDhulQidah => '都尔喀尔德月';

  @override
  String get hijriDhulHijjah => '都尔黑哲月';

  @override
  String get monthJan => '1月';

  @override
  String get monthFeb => '2月';

  @override
  String get monthMar => '3月';

  @override
  String get monthApr => '4月';

  @override
  String get monthMay => '5月';

  @override
  String get monthJun => '6月';

  @override
  String get monthJul => '7月';

  @override
  String get monthAug => '8月';

  @override
  String get monthSep => '9月';

  @override
  String get monthOct => '10月';

  @override
  String get monthNov => '11月';

  @override
  String get monthDec => '12月';

  @override
  String get monthJanuary => '一月';

  @override
  String get monthFebruary => '二月';

  @override
  String get monthMarch => '三月';

  @override
  String get monthApril => '四月';

  @override
  String get monthMayFull => '五月';

  @override
  String get monthJune => '六月';

  @override
  String get monthJuly => '七月';

  @override
  String get monthAugust => '八月';

  @override
  String get monthSeptember => '九月';

  @override
  String get monthOctober => '十月';

  @override
  String get monthNovember => '十一月';

  @override
  String get monthDecember => '十二月';

  @override
  String get dayMonShort => '周一';

  @override
  String get dayTueShort => '周二';

  @override
  String get dayWedShort => '周三';

  @override
  String get dayThuShort => '周四';

  @override
  String get dayFriShort => '周五';

  @override
  String get daySatShort => '周六';

  @override
  String get daySunShort => '周日';

  @override
  String get dayMonday => '星期一';

  @override
  String get dayTuesday => '星期二';

  @override
  String get dayWednesday => '星期三';

  @override
  String get dayThursday => '星期四';

  @override
  String get dayFriday => '星期五';

  @override
  String get daySaturday => '星期六';

  @override
  String get daySunday => '星期日';

  @override
  String get daySuChart => '日';

  @override
  String get dayMoChart => '一';

  @override
  String get dayTuChart => '二';

  @override
  String get dayWeChart => '三';

  @override
  String get dayThChart => '四';

  @override
  String get dayFrChart => '五';

  @override
  String get daySaChart => '六';

  @override
  String get chooseCityLabel => '选择城市';

  @override
  String get setCityFab => '设置城市';

  @override
  String prayerTimesError(Object error) {
    return '无法计算礼拜时间。\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer 还有';
  }

  @override
  String get ramadanMubarak => '莱麦丹吉庆';

  @override
  String ramadanDayProgress(int day) {
    return '第 $day 天 / 30';
  }

  @override
  String get lastTenNights => '最后十夜';

  @override
  String get laylatulQadr => '盖德尔夜';

  @override
  String get homeSuffixAH => '伊历';

  @override
  String get homeSuffixCE => '公元';

  @override
  String get homeNoCitySelected => '未选择城市';

  @override
  String get homeNoCityHint => '点击上方搜索城市或启用GPS。';

  @override
  String get homeCouldNotCalc => '无法计算礼拜时间。';

  @override
  String get homeQasr => '缩短';

  @override
  String get homeActionMonthlyTimes => '月度\n时间表';

  @override
  String get homeActionDuaDhikr => '祈祷\n与赞念';

  @override
  String get homeActionPrayerStats => '礼拜\n统计';

  @override
  String homePolarBanner(int count) {
    return '在此期间，您所在位置有 $count 个礼拜时间无法计算（极昼/极夜）。请在设置中尝试最近纬度估算。';
  }

  @override
  String get settingsTitle => '设置';

  @override
  String get settingsSectionPrayerCalc => '礼拜计算';

  @override
  String get settingsCalcMethod => '计算方法';

  @override
  String get settingsCalcMethodAuto => '自动（动态）';

  @override
  String get settingsHanafiAsr => '哈乃斐晡礼';

  @override
  String get settingsHanafiAsrSubtitle => '影子系数2倍（较晚的晡礼时间）';

  @override
  String get settingsSectionDisplay => '显示';

  @override
  String get settings24hClock => '24小时制';

  @override
  String get settingsFollowSystemTheme => '跟随系统主题';

  @override
  String get settingsDarkMode => '深色模式';

  @override
  String get settingsSectionNotifications => '通知';

  @override
  String get settingsPrayerNotifications => '礼拜通知';

  @override
  String get settingsPrayerNotificationsSubtitle => '宣礼、提醒和每次礼拜设置';

  @override
  String get settingsPrayerAgendas => '礼拜日程';

  @override
  String get settingsPrayerAgendasSubtitle => '基于礼拜时间的自定义提醒';

  @override
  String get settingsAccount => '账户';

  @override
  String get settingsSignInToSync => '登录以同步';

  @override
  String get settingsSignInToSyncSubtitle => '在各设备间保存数据';

  @override
  String get settingsHomeScreen => '主屏幕';

  @override
  String get settingsSkyGradient => '天空渐变背景';

  @override
  String get settingsSkyGradientSubtitle => '根据时间变化的动态天空色彩';

  @override
  String get settingsWeatherGradient => '天气色调渐变';

  @override
  String get settingsWeatherGradientSubtitle => '根据当地天气调整天空色彩';

  @override
  String get settingsCountdownAnimation => '倒计时动画';

  @override
  String get settingsCountdownAnimationSubtitle => '下次礼拜的呼吸环动画';

  @override
  String get settingsPrayerTracking => '礼拜追踪';

  @override
  String get settingsTrackMyPrayers => '追踪我的礼拜';

  @override
  String get settingsTrackMyPrayersSubtitle => '记录每天完成的礼拜';

  @override
  String get settingsPrayerStats => '礼拜统计';

  @override
  String get settingsPrayerStatsSubtitle => '连续记录、每周和每月图表';

  @override
  String get settingsJumuahKahf => '主麻日山洞章提醒';

  @override
  String get settingsJumuahKahfSubtitle => '每周五提醒阅读山洞章';

  @override
  String get settingsTravel => '旅行';

  @override
  String get settingsTravelMode => '旅行模式';

  @override
  String get settingsTravelModeSubtitle => '自动检测离家状态并调整礼拜';

  @override
  String get settingsHomeLocation => '家庭位置';

  @override
  String get settingsHomeLocationNotSet => '未设置 — 点击使用当前位置';

  @override
  String get settingsClearHomeLocation => '清除家庭位置';

  @override
  String get settingsTravelRulings => '旅行礼拜规则';

  @override
  String get settingsTravelRulingsSubtitle => '缩短、合并和旅行者指南';

  @override
  String get settingsSmartHome => '智能家居';

  @override
  String get settingsSmartHomeIntegrations => '智能家居集成';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit、Google Home、Alexa、Home Assistant';

  @override
  String get settingsTvDisplay => '电视显示';

  @override
  String get settingsTvHome => '电视主屏显示';

  @override
  String get settingsTvHomeSubtitle => '电视全屏礼拜时钟';

  @override
  String get settingsMasjidDisplay => '清真寺显示';

  @override
  String get settingsMasjidDisplaySubtitle => '清真寺屏幕宣礼/起拜表';

  @override
  String get settingsTvSettings => '电视设置';

  @override
  String get settingsTvSettingsSubtitle => '清真寺模式、起拜偏移、环境模式';

  @override
  String get settingsAboutPrayCalc => '关于 PrayCalc';

  @override
  String get syncSynced => '已同步';

  @override
  String get syncSyncing => '同步中...';

  @override
  String get syncOffline => '离线';

  @override
  String get syncError => '同步错误';

  @override
  String get notifSettingsTitle => '通知与宣礼';

  @override
  String get notifAdhanLabel => '宣礼';

  @override
  String notifReminderMinBefore(int minutes) {
    return '提醒：提前 $minutes 分钟';
  }

  @override
  String notifVolumePct(int pct) {
    return '音量：$pct%';
  }

  @override
  String get notifTestAdhan => '测试宣礼';

  @override
  String get notifModeOff => '关闭';

  @override
  String get notifModeReminderOnly => '仅提醒';

  @override
  String get notifModeArrival => '礼拜时间到时';

  @override
  String get notifModeBoth => '提醒 + 到时';

  @override
  String get citySearchHint => '搜索城市…';

  @override
  String get citySearchDetectTooltip => '检测我的位置';

  @override
  String get citySearchNoCityGps => '无法从GPS检测城市。';

  @override
  String get citySearchPermissionDenied => '位置权限被拒绝。请手动搜索。';

  @override
  String get citySearchNoResults => '未找到城市。';

  @override
  String get citySearchStartTyping => '开始输入以搜索…';

  @override
  String get agendasTitle => '礼拜日程';

  @override
  String get agendasEmpty => '还没有日程。\n点击 + 添加与礼拜关联的提醒。';

  @override
  String get agendasUndo => '撤销';

  @override
  String agendasRemoved(String label) {
    return '已移除 $label';
  }

  @override
  String get agendaNewTitle => '新建日程';

  @override
  String get agendaEditTitle => '编辑日程';

  @override
  String get agendaSave => '保存';

  @override
  String get agendaLabelEmpty => '标签不能为空';

  @override
  String get agendaLabelField => '标签';

  @override
  String get agendaLabelHint => '例如：晨礼起床';

  @override
  String get agendaPrayerSection => '礼拜';

  @override
  String get agendaTimeOffsetSection => '时间偏移';

  @override
  String get agendaOffsetAtPrayerTime => '礼拜时间到时';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '提前 $minutes 分钟';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '延后 $minutes 分钟';
  }

  @override
  String get agendaRepeatSection => '重复';

  @override
  String get agendaNotifTypeSection => '通知类型';

  @override
  String get agendaNotifSilent => '静音';

  @override
  String get agendaNotifSound => '声音';

  @override
  String get agendaNotifVibrate => '震动';

  @override
  String get agendaDayM => '一';

  @override
  String get agendaDayT => '二';

  @override
  String get agendaDayW => '三';

  @override
  String get agendaDayF => '五';

  @override
  String get agendaDayS => '六';

  @override
  String get moonTitle => '月亮与伊历';

  @override
  String moonIlluminated(int pct) {
    return '亮度 $pct%';
  }

  @override
  String get moonFullTonight => '今晚满月！';

  @override
  String get moonNextTomorrow => '下次满月在明天';

  @override
  String moonNextDays(int days) {
    return '下次满月在 $days 天后';
  }

  @override
  String moonAge(String age) {
    return '月龄：$age 天';
  }

  @override
  String get moonPhaseNewMoon => '新月';

  @override
  String get moonPhaseWaxingCrescent => '蛾眉月';

  @override
  String get moonPhaseFirstQuarter => '上弦月';

  @override
  String get moonPhaseWaxingGibbous => '盈凸月';

  @override
  String get moonPhaseFullMoon => '满月';

  @override
  String get moonPhaseWaningGibbous => '亏凸月';

  @override
  String get moonPhaseLastQuarter => '下弦月';

  @override
  String get moonPhaseWaningCrescent => '残月';

  @override
  String get moonHilalVisibility => '下次新月可见性';

  @override
  String get moonRegionMiddleEast => '中东';

  @override
  String get moonRegionWestAfrica => '西非';

  @override
  String get moonRegionSouthAsia => '南亚';

  @override
  String get moonRegionEurope => '欧洲';

  @override
  String get moonRegionAmericas => '美洲';

  @override
  String get moonVisible => '可见';

  @override
  String get moonNotVisible => '不可见';

  @override
  String get moonPossible => '可能可见';

  @override
  String get moonUpcomingDates => '即将到来的伊斯兰日期';

  @override
  String get hijriTodayLabel => '今天的伊历日期';

  @override
  String ramadanBeginsLabel(int year) {
    return '伊历 $year 年莱麦丹月开始';
  }

  @override
  String ramadanDaysAway(int days) {
    return '还有 $days 天';
  }

  @override
  String get moonLunarCycle => '月亮周期';

  @override
  String moonDayOfCycle(int day) {
    return '第 $day 天 / ~29.5';
  }

  @override
  String get moonHilalSightingForecast => '新月观测预报';

  @override
  String get moonHilalVisibilityMap => '新月可见性地图';

  @override
  String moonDayN(int day) {
    return '第 $day 天';
  }

  @override
  String get moonGlobalSighting => '全球观测';

  @override
  String get moonZoneNakedEye => '肉眼可见';

  @override
  String get moonZoneBinoculars => '望远镜';

  @override
  String get moonZoneVeryDifficult => '非常困难';

  @override
  String get moonZoneNotVisible => '不可见';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '伊历 $year 年$month可能为29天。预计第29天可看到新月，因沙安拉。';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '伊历 $year 年$month可能为30天。第29天不太可能看到新月，月份将满30天。';
  }

  @override
  String get moonUmmAlQura => '乌姆库拉';

  @override
  String get moonSaudiArabia => '沙特阿拉伯';

  @override
  String get moonFCNACalc => 'FCNA / 计算';

  @override
  String get moonNorthAmerica => '北美洲';

  @override
  String moonNDays(int days) {
    return '$days 天';
  }

  @override
  String moonStarts(String month) {
    return '$month 开始：';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return '日落时月龄：$hours 小时';
  }

  @override
  String get moon7DayLunarCalendar => '7天月历';

  @override
  String get moonUpcomingIslamicEvents => '即将到来的伊斯兰事件';

  @override
  String get moonTodayLabel => '今天';

  @override
  String get moonTomorrowLabel => '明天';

  @override
  String get calDateCol => '日期';

  @override
  String get calHijriCol => '伊历';

  @override
  String get calFajrCol => '晨礼';

  @override
  String get calSunriseCol => '日出';

  @override
  String get calDhuhrCol => '晌礼';

  @override
  String get calAsrCol => '晡礼';

  @override
  String get calMaghribCol => '昏礼';

  @override
  String get calIshaCol => '宵礼';

  @override
  String get calNoCityText => '请先设置城市\n以查看礼拜日历。';

  @override
  String get calShareTooltip => '分享日历';

  @override
  String get calPrevMonthTooltip => '上个月';

  @override
  String get calNextMonthTooltip => '下个月';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return '礼拜时间 — $month';
  }

  @override
  String get qiblaTitle => '朝向';

  @override
  String get qiblaSwitchToCompass => '切换到指南针';

  @override
  String get qiblaSwitchToAR => '切换到AR相机';

  @override
  String get qiblaNoCityText => '请先设置城市\n以计算朝向。';

  @override
  String get qiblaCompassUnavailable => '此设备没有指南针传感器。';

  @override
  String get qiblaCalibrate => '校准：将手机画8字形。';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '北偏 $degrees°';
  }

  @override
  String qiblaFrom(String city) {
    return '从 $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '距天房 $dist 公里';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '距天房 ${dist}K 公里';
  }

  @override
  String get qiblaFacingQibla => '已朝向朝拜方向 ✓';

  @override
  String get tasbeehTitle => '赞念珠';

  @override
  String get tasbeehResetTooltip => '重置';

  @override
  String get tasbeehTapToSwitch => '点击标签切换';

  @override
  String get tasbeehTapToCount => '点击任意处计数';

  @override
  String get tasbeehResetDialogTitle => '重置计数器？';

  @override
  String get tasbeehResetDialogContent => '这将把当前计数重置为零。';

  @override
  String get tasbeehCancel => '取消';

  @override
  String get tasbeehReset => '重置';

  @override
  String tasbeehTodayDhikr(int count) {
    return '今天：$count 次赞念';
  }

  @override
  String get tasbeehLast7Days => '过去7天';

  @override
  String get tasbeehNoHistory => '还没有记录 — 开始计数吧！';

  @override
  String tasbeehComplete(int count) {
    return '赞念完成！$count 次';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => '智能家居';

  @override
  String get smartHomeSubtitle => '将设备与礼拜时间连接';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc => '向Google询问礼拜时间和朝向';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc => '向Alexa询问礼拜时间、下次礼拜等';

  @override
  String get smartHomeSiri => 'Siri 快捷指令';

  @override
  String get smartHomeSiriDesc => '为礼拜时间创建自定义快捷指令';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc => '在礼拜时间自动化灯光、显示和提醒';

  @override
  String get smartHomeLinkAccount => '关联账户';

  @override
  String get smartHomeLinked => '已关联';

  @override
  String get smartHomeUnlink => '取消关联';

  @override
  String get smartHomeSetupInstructions => '设置说明';

  @override
  String get smartHomeRequiresUmmatPlus => '需要 Ummat+';

  @override
  String get smartHomeTroubleshooting => '故障排除';

  @override
  String get smartHomeTestConnection => '测试连接';

  @override
  String get smartHomeConnectionSuccess => '连接成功';

  @override
  String get smartHomeConnectionFailed => '连接失败。请检查账户关联。';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => '高级礼拜时间功能';

  @override
  String get subscriptionUpgrade => '升级到 Ummat+';

  @override
  String get subscriptionRestore => '恢复购买';

  @override
  String get subscriptionManage => '管理订阅';

  @override
  String get subscriptionCancel => '取消订阅';

  @override
  String get subscriptionActive => '已激活';

  @override
  String get subscriptionExpired => '已过期';

  @override
  String get subscriptionFree => '免费';

  @override
  String get subscriptionFreeDesc => '基本礼拜时间、朝向、日历';

  @override
  String get subscriptionPlusDesc => '智能家居、电视显示、小组件等';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return '剩余 $count 次免费查询';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/年';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/月';
  }

  @override
  String get subscriptionFeatureSmartHome => '智能家居集成';

  @override
  String get subscriptionFeatureTV => '电视显示模式';

  @override
  String get subscriptionFeatureWidgets => '主屏幕小组件';

  @override
  String get subscriptionFeatureWatch => '手表表盘';

  @override
  String get subscriptionFeatureSync => '跨设备同步';

  @override
  String get subscriptionFeatureAdFree => '无广告体验';

  @override
  String get watchTitle => '手表';

  @override
  String get watchNextPrayer => '下次礼拜';

  @override
  String get watchAllPrayers => '所有礼拜';

  @override
  String get watchComplication => '表盘功能';

  @override
  String get nextPrayer => '下次礼拜';

  @override
  String get allPrayers => '所有礼拜';

  @override
  String get today => '今天';

  @override
  String get tomorrow => '明天';

  @override
  String get thisWeek => '本周';

  @override
  String get thisMonth => '本月';

  @override
  String get loginCreateAccount => '创建账户';

  @override
  String get loginSignIn => '登录';

  @override
  String get loginWelcomeBack => '欢迎回来';

  @override
  String get loginJoinPrayCalc => '加入 PrayCalc';

  @override
  String get loginSyncSubtitle => '跨设备同步礼拜数据';

  @override
  String get loginContinueGoogle => '使用Google继续';

  @override
  String get loginOr => '或';

  @override
  String get loginSigningIn => '登录中…';

  @override
  String get loginNameLabel => '显示名称（可选）';

  @override
  String get loginEmailLabel => '邮箱';

  @override
  String get loginPasswordLabel => '密码';

  @override
  String get loginEmailRequired => '邮箱为必填';

  @override
  String get loginEmailInvalid => '请输入有效的邮箱地址';

  @override
  String get loginPasswordRequired => '密码为必填';

  @override
  String get loginPasswordMinLength => '密码至少需要8个字符';

  @override
  String get loginForgotPassword => '忘记密码？';

  @override
  String get loginEnterEmailFirst => '请先输入邮箱地址';

  @override
  String get loginResetSent => '密码重置邮件已发送';

  @override
  String get loginResetFailed => '无法发送重置邮件';

  @override
  String get loginNewToPrayCalc => '新用户？';

  @override
  String get loginAlreadyHaveAccount => '已有账户？';

  @override
  String get accountTitle => '账户';

  @override
  String get accountNotSignedIn => '未登录';

  @override
  String get accountSyncSection => '同步';

  @override
  String get accountSyncStatus => '同步状态';

  @override
  String get accountSyncNow => '立即同步';

  @override
  String get accountSyncHistory => '同步历史';

  @override
  String get accountNoConflicts => '未检测到冲突';

  @override
  String accountConflictsResolved(int count) {
    return '已解决 $count 个';
  }

  @override
  String accountSyncedAgo(String time) {
    return '$time前同步';
  }

  @override
  String get accountOfflineStatus => '离线。更改已保存在本地。';

  @override
  String get accountSyncErrorStatus => '同步错误。将重试。';

  @override
  String get accountDataSection => '数据';

  @override
  String get accountExportData => '导出数据';

  @override
  String get accountExportSubtitle => '下载设置和礼拜记录';

  @override
  String get accountExportFailed => '无法导出数据';

  @override
  String get accountSignOutTitle => '退出登录';

  @override
  String get accountSignOutBody => '本地数据将保留。重新登录即可继续同步。';

  @override
  String get accountDeleteAccount => '删除账户';

  @override
  String get accountDeleteSubtitle => '永久删除账户和数据';

  @override
  String get accountDeleteBody =>
      '这将永久删除您的账户和所有同步数据。此设备上的本地数据不会被删除。\n\n此操作无法撤销。';

  @override
  String get accountDeleted => '账户已删除';

  @override
  String get accountDeleteFailed => '无法删除账户';

  @override
  String get accountTimeJustNow => '刚刚';

  @override
  String accountTimeMinAgo(int min) {
    return '$min分钟前';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour小时前';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day天前';
  }

  @override
  String get statsTitle => '礼拜统计';

  @override
  String get statsShareTooltip => '分享统计';

  @override
  String get statsTodayPrayers => '今天的礼拜';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => '连续天数';

  @override
  String get statsDays => '天';

  @override
  String get statsThisWeek => '本周';

  @override
  String get statsCompletion => '完成率';

  @override
  String get statsThisMonth => '本月';

  @override
  String get statsMostMissed => '最常错过';

  @override
  String get statsThisWeekLabel => '本周';

  @override
  String get statsWeeklyChart => '每周各礼拜完成率';

  @override
  String get statsMonthlyChart => '每月各礼拜完成率';

  @override
  String statsTotalLogged(int count) {
    return '共记录 $count 次礼拜';
  }

  @override
  String get statsKeepItUp => '继续加油！';

  @override
  String get statsShareTitle => 'PrayCalc 礼拜统计';

  @override
  String statsShareStreak(int days) {
    return '连续：$days 天';
  }

  @override
  String statsShareWeekly(int pct) {
    return '每周：$pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return '每月：$pct%';
  }

  @override
  String get statsShareBreakdown => '每周明细：';

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
  String get aboutTitle => '关于 PrayCalc';

  @override
  String get aboutWebsite => '网站';

  @override
  String get aboutContact => '联系我们';

  @override
  String get aboutLicenses => '开源许可证';

  @override
  String get aboutCouldNotOpen => '无法打开链接。';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. 保留所有权利。\n\n礼拜时间由 pray_calc_dart 引擎计算。准确性取决于您的GPS位置和选择的计算方法。';
  }

  @override
  String get commonCancel => '取消';

  @override
  String get commonSave => '保存';

  @override
  String get commonDelete => '删除';

  @override
  String get commonEdit => '编辑';

  @override
  String get commonRetry => '重试';

  @override
  String get commonClose => '关闭';

  @override
  String get commonDone => '完成';

  @override
  String get commonBack => '返回';

  @override
  String get commonNext => '下一步';

  @override
  String get commonSkip => '跳过';

  @override
  String get commonContinue => '继续';

  @override
  String get commonOk => '确定';

  @override
  String get commonYes => '是';

  @override
  String get commonNo => '否';

  @override
  String get commonShare => '分享';

  @override
  String get commonCopy => '复制';

  @override
  String get commonCopied => '已复制到剪贴板';

  @override
  String get commonLoading => '加载中...';

  @override
  String get commonError => '出错了';

  @override
  String get commonErrorRetry => '出错了。点击重试。';

  @override
  String get commonNoInternet => '无网络连接';

  @override
  String get commonOfflineMode => '离线模式';

  @override
  String get commonSignIn => '登录';

  @override
  String get commonSignOut => '退出';

  @override
  String get commonSignUp => '注册';

  @override
  String get commonProfile => '个人资料';

  @override
  String get commonAccount => '账户';

  @override
  String get commonAbout => '关于';

  @override
  String commonVersion(String version) {
    return '版本 $version';
  }

  @override
  String get commonPrivacyPolicy => '隐私政策';

  @override
  String get commonTermsOfService => '服务条款';

  @override
  String get commonRateApp => '评价应用';

  @override
  String get commonFeedback => '发送反馈';

  @override
  String get commonHelp => '帮助';

  @override
  String get commonLanguage => '语言';

  @override
  String get commonOpenSettings => '打开设置';

  @override
  String get travelNotificationTitle => '您正在旅行';

  @override
  String get travelNotificationBody => '礼拜时间可能被缩短。点击了解旅行规则。';

  @override
  String get travelRulingsTitle => '旅行与礼拜';

  @override
  String get travelRulingsIntro => '旅行中礼拜的伊斯兰教法，参考古兰经和可靠圣训集。';

  @override
  String get travelWhenTitle => '何时适用旅行规则？';

  @override
  String get travelQasrTitle => '缩短礼拜（卡斯尔）';

  @override
  String get travelJamTitle => '合并礼拜（杰姆阿）';

  @override
  String get travelDurationTitle => '旅行时长';

  @override
  String get travelReferencesTitle => '学术参考';

  @override
  String get travelLearnMore => '了解更多';

  @override
  String get travelHanafiDefaultTitle => '为什么 PrayCalc 使用哈乃斐默认值';

  @override
  String get travelDeeperScholarly => '更深入的学术讨论';

  @override
  String get onboardingTitle1 => '礼拜时间，无论你在哪里';

  @override
  String get onboardingBody1 =>
      'GPS精确的礼拜时间，覆盖地球上每座城市。从晨礼到宵礼，从日出到夜间拜。由我们自己的计算引擎驱动，为精确而生。';

  @override
  String get onboardingTitle2 => '你的位置，你的时间';

  @override
  String get onboardingBody2 => '搜索任何城市或让GPS检测你的位置。PrayCalc 可查找全球500万城市的时间。';

  @override
  String get onboardingTitle3 => '再也不错过礼拜';

  @override
  String get onboardingBody3 => '礼拜时间到时播放宣礼，提前提醒。为封斋饭、课程等自定义日程。';

  @override
  String get onboardingTitle4 => '你需要的一切';

  @override
  String get onboardingBody4 => '朝向指南针、礼拜日历、伊历月相、赞念珠计数器。一切尽在一处。';

  @override
  String get onboardingSkip => '跳过';

  @override
  String get onboardingGetStarted => '开始使用';

  @override
  String get onboardingSignInTitle => '登录 PrayCalc';

  @override
  String get onboardingSignInSubtitle => '保存礼拜记录并\n跨设备同步。';

  @override
  String get onboardingContinueGoogle => '使用Google继续';

  @override
  String get onboardingContinueWithoutAccount => '不使用账户继续';

  @override
  String get onboardingSigningIn => '登录中…';

  @override
  String get onboardingSelectLanguage => '选择语言';

  @override
  String get duaDhikrTitle => '祈祷与赞念';

  @override
  String get duaDhikrTabDua => '祈祷';

  @override
  String get duaDhikrTabDhikr => '赞念';

  @override
  String get duaDhikrTabTasbeeh => '赞念珠';

  @override
  String get duaDhikrTabMorning => '晨间';

  @override
  String get duaDhikrTabEvening => '晚间';

  @override
  String get duaDhikrMorningAdhkar => '晨间赞词';

  @override
  String get duaDhikrEveningAdhkar => '晚间赞词';

  @override
  String get calGregToggle => '公历';

  @override
  String get calHijriToggle => '伊历';

  @override
  String get calYearlyTooltip => '年度日历';

  @override
  String get calExportIcsTooltip => '导出 .ics';

  @override
  String get calMagCol => '昏';

  @override
  String get qiblaShowOnMap => '在地图上显示';

  @override
  String get qiblaWaitingCompass => '等待指南针...';

  @override
  String get qiblaNoCompassSensor => '无指南针传感器。静态显示朝向。';

  @override
  String get qiblaAccuracyExcellent => '精度极佳';

  @override
  String get qiblaAccuracyGood => '精度良好';

  @override
  String get qiblaAccuracyFair => '精度一般。画8字形校准手机。';

  @override
  String get qiblaAccuracyLow => '精度较低。画8字形校准手机。';

  @override
  String get qiblaToTheKaaba => '到天房';

  @override
  String get qiblaYourLocation => '你的位置';

  @override
  String get qiblaGpsAccurate => 'GPS精确';

  @override
  String get qiblaCityCenter => '城市中心';

  @override
  String get moonIlluminatedLabel => '亮度';

  @override
  String get moonAgeLabel => '月龄';

  @override
  String get moonFirstQtr => '上弦';

  @override
  String get moonLastQtr => '下弦';

  @override
  String get moonTonight => '今晚';

  @override
  String get moonTomorrow => '明天';

  @override
  String moonDaysAway(int days) {
    return '$days天';
  }

  @override
  String get moonBeta => '测试版';

  @override
  String get setHomeTitle => '设置家庭位置';

  @override
  String get setHomeSearchHint => '搜索城市、镇或邮编…';

  @override
  String get setHomeClear => '清除';

  @override
  String get setHomeUseCurrentLocation => '使用当前位置';

  @override
  String get setHomeDetectAndSet => '检测位置并设为家';

  @override
  String get setHomeAlreadySet => '家庭位置已设置';

  @override
  String setHomeSetAs(String city) {
    return '已将 $city 设为家';
  }

  @override
  String get setHomeCurrentLocationSet => '已将当前位置设为家';

  @override
  String get setHomePermissionDenied => '位置权限被拒绝。请在下方搜索城市。';

  @override
  String get setHomeGpsUnavailable => 'GPS不可用。请手动搜索。';

  @override
  String get setHomeNoCitiesFound => '未找到城市。';

  @override
  String get setHomeSearchPrompt => '搜索你的家乡城市';

  @override
  String get setHomeSearchBody => '在上方输入搜索，或使用当前位置。旅行模式会检测你何时离家。';

  @override
  String get subscriptionYouHavePlus => '你已拥有 Ummat+';

  @override
  String get subscriptionUpgradeTo => '升级到 Ummat+';

  @override
  String get subscriptionThankYou => '感谢支持 PrayCalc。';

  @override
  String get subscriptionUnlockPremium => '在所有设备上解锁高级功能。';

  @override
  String get subscriptionManageSub => '管理订阅';

  @override
  String get subscriptionWelcome => '欢迎使用 Ummat+！';

  @override
  String get subscriptionSubscribe => '订阅';

  @override
  String get subscriptionFreeFeatures => '免费功能';

  @override
  String get subscriptionPlusFeatures => 'Ummat+ 功能';

  @override
  String get subscriptionFeaturePrayerTimes => '礼拜时间';

  @override
  String get subscriptionFeatureQibla => '朝向指南针';

  @override
  String get subscriptionFeatureCalendar => '月度日历';

  @override
  String get subscriptionFeatureTasbeeh => '赞念珠计数器';

  @override
  String get subscriptionFeatureMoon => '月亮与伊历';

  @override
  String get smartHomeAlertType => '提醒类型';

  @override
  String get smartHomeAlertModal => '全屏弹窗';

  @override
  String get smartHomeAlertCorner => '角落通知';

  @override
  String get smartHomeAlertNone => '无（静音）';

  @override
  String get smartHomePauseMedia => '宣礼时暂停媒体';

  @override
  String get smartHomeQuietHours => '安静时段';

  @override
  String get smartHomeQuietFrom => '从';

  @override
  String get smartHomeQuietTo => '到';

  @override
  String get smartHomePrayerAudio => '各礼拜音频';

  @override
  String get smartHomeAudioAdhan => '宣礼';

  @override
  String get smartHomeAudioBeep => '蜂鸣';

  @override
  String get smartHomeAudioSilent => '静音';

  @override
  String get aboutPrivacy => '隐私政策';

  @override
  String aboutVersion(String version) {
    return '版本 $version';
  }

  @override
  String get notifDefaultAdhan => '默认宣礼';

  @override
  String get notifFajrAdhan => '晨礼宣礼';

  @override
  String get notifFajrAdhanSubtitle => '在晨礼时间播放';

  @override
  String get notifRegularAdhan => '常规宣礼';

  @override
  String get notifRegularAdhanSubtitle => '在晌礼、晡礼、昏礼、宵礼时播放';

  @override
  String get notifPerPrayerSettings => '各礼拜设置';

  @override
  String get notifPreview => '预览';

  @override
  String get tvSettingsTitle => '电视设置';

  @override
  String get tvDisplayMode => '显示模式';

  @override
  String get tvMasjidMode => '清真寺模式';

  @override
  String get tvMasjidModeSubtitle => '带起拜时间的大屏显示';

  @override
  String get tvMasjidName => '清真寺名称';

  @override
  String get tvMasjidNameTapToSet => '点击设置';

  @override
  String get tvClock => '时钟';

  @override
  String get tv24hFormat => '24小时格式';

  @override
  String get tvIqamahOffsets => '起拜偏移（宣礼后分钟数）';

  @override
  String tvIqamahMinAfter(int offset) {
    return '宣礼后 $offset 分钟';
  }

  @override
  String get tvQrCode => '二维码';

  @override
  String get tvShowQrCode => '显示二维码';

  @override
  String get tvShowQrCodeSubtitle => '在清真寺屏幕上显示二维码';

  @override
  String get tvQrCodeUrl => '二维码链接';

  @override
  String get tvAmbientModeSection => '环境模式';

  @override
  String get tvIdleTimeout => '空闲超时';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes 分钟后启动环境模式';
  }

  @override
  String get tvPhotoInterval => '照片间隔';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '照片间隔 $seconds 秒';
  }

  @override
  String get tvBackground => '背景';

  @override
  String get tvPhotoCategory => '照片类别';

  @override
  String get tvLocation => '位置';

  @override
  String get tvChangeCity => '更换城市';

  @override
  String get tvChangeCitySubtitle => '搜索其他城市';

  @override
  String get tvScreensaverBg => '屏保背景';

  @override
  String get tvScreensaverPhotos => '照片';

  @override
  String get tvScreensaverPattern => '几何图案';

  @override
  String get tvScreensaverBoth => '照片 + 图案';

  @override
  String get tvCategoryAll => '所有类别';

  @override
  String get tvCategoryMasjids => '清真寺';

  @override
  String get tvCategoryInteriors => '内部';

  @override
  String get tvCategoryGeometric => '几何';

  @override
  String get tvCategoryCalligraphy => '书法';

  @override
  String get tvCategoryLandscapes => '风景';

  @override
  String get tvCategoryRamadan => '莱麦丹';

  @override
  String get tvPhotoCategoryTitle => '照片类别';

  @override
  String tvEnterHint(String title) {
    return '输入$title';
  }

  @override
  String get tvSystemDefault => '系统默认';

  @override
  String get smartHomeIntegrations => '集成';

  @override
  String get smartHomeLinkedSpeakers => '已关联的音箱和显示器';

  @override
  String get smartHomeAlertDisplay => '提醒显示';

  @override
  String get smartHomeAtAdhanShow => '宣礼时显示';

  @override
  String get smartHomePauseMediaTitle => '宣礼时暂停媒体';

  @override
  String get smartHomePauseMediaSubtitle => '宣礼结束后恢复';

  @override
  String get smartHomePrayerAudioSection => '礼拜音频';

  @override
  String get smartHomeQuietHoursSection => '安静时段';

  @override
  String get smartHomeEnableQuietHours => '启用安静时段';

  @override
  String get smartHomeQuietHoursSubtitle => '所有智能家居提醒将被静音';

  @override
  String get smartHomeNoDevices => '还没有关联的设备';

  @override
  String get smartHomeNoDevicesDesc => '在上方关联Google Home或Alexa，你的音箱和显示器将显示在这里。';

  @override
  String get smartHomeRequiresPlus => '智能家居需要 Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      '在Google Home、Alexa、Siri和Home Assistant上控制宣礼。配置哪些设备播放宣礼、何时暂停媒体和安静时段。';

  @override
  String get smartHomeBroadcastGoogle => '在Nest音箱和显示器上播放宣礼。';

  @override
  String get smartHomeEnableAlexa => '在Alexa上启用PrayCalc技能。';

  @override
  String get smartHomeSiriAsk => '向Siri询问礼拜时间或设置自动化。';

  @override
  String get smartHomeHassAdd => '通过HACS添加以获得完整的自动化支持。';

  @override
  String get smartHomeSetupGuide => '设置指南';

  @override
  String get smartHomeSiriSetupTitle => 'Siri 快捷指令设置';

  @override
  String get smartHomeSiriStep1 => '在iPhone或iPad上打开快捷指令应用。';

  @override
  String get smartHomeSiriStep2 => '点击\"+\"创建新的快捷指令。';

  @override
  String get smartHomeSiriStep3 => '在操作列表中搜索\"PrayCalc\"。';

  @override
  String get smartHomeSiriStep4 => '添加\"下次礼拜时间\"或\"今天的礼拜时间\"。';

  @override
  String get smartHomeSiriStep5 => '可选添加到自动化（例如每天晨礼时）。';

  @override
  String get smartHomeSiriStep6 => '说\"Hey Siri, next prayer time\"测试。';

  @override
  String get smartHomeSiriFootnote => '需要iOS 16或更高版本。';

  @override
  String get smartHomeHassSetupTitle => 'Home Assistant 设置';

  @override
  String get smartHomeHassStep1 => '安装HACS（Home Assistant社区商店）。';

  @override
  String get smartHomeHassStep2 => '在HACS中搜索\"PrayCalc\"并安装。';

  @override
  String get smartHomeHassStep3 => '前往设置 > 设备和服务 > 添加集成。';

  @override
  String get smartHomeHassStep4 => '搜索\"PrayCalc\"并选择。';

  @override
  String get smartHomeHassStep5 => '输入PrayCalc API密钥（在账户中生成）。';

  @override
  String get smartHomeHassStep6 => '配置位置和计算方法。';

  @override
  String get smartHomeHassFootnote => '需要Home Assistant 2024.1+并安装HACS。';

  @override
  String get smartHomeApiKey => 'API 密钥';

  @override
  String get smartHomeGenerateApiKey => '生成API密钥';

  @override
  String get smartHomeApiKeyNotReady => 'PrayCalc智能服务部署后将可生成API密钥。';

  @override
  String get smartHomeApiKeyDesc => '你需要API密钥将Home Assistant连接到PrayCalc账户。';

  @override
  String get smartHomeLinkedStatus => '已关联';

  @override
  String get smartHomeNotLinkedStatus => '未关联';

  @override
  String get smartHomeCouldNotOpen => '无法打开链接。';

  @override
  String get smartHomeDevices => '设备';

  @override
  String get smartHomeAddDevice => '添加设备';

  @override
  String get smartHomeDeleteDevice => '删除';

  @override
  String get smartHomeDeleteDeviceConfirm => '移除此设备？';

  @override
  String get smartHomeDeviceOnline => '在线';

  @override
  String get smartHomeDeviceOffline => '离线';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return '最后在线：$time';
  }

  @override
  String get smartHomeDeviceName => '设备名称';

  @override
  String get smartHomeDeviceType => '设备类型';

  @override
  String get smartHomeDeviceTypeTv => '电视';

  @override
  String get smartHomeDeviceTypeSpeaker => '音箱';

  @override
  String get smartHomeDeviceTypeWatch => '手表';

  @override
  String get smartHomeDeviceTypeDesktop => '桌面';

  @override
  String get smartHomeDeviceTypeOther => '其他';

  @override
  String get smartHomeDeviceAdhan => '宣礼通知';

  @override
  String get smartHomeDeviceAdhanDesc => '在此设备上接收宣礼提醒';

  @override
  String get smartHomeDeviceVolume => '音量';

  @override
  String get smartHomeDeviceAudioType => '音频类型';

  @override
  String get smartHomeDeviceEnabledPrayers => '已启用的礼拜';

  @override
  String get smartHomeDeviceSettings => '设备设置';

  @override
  String get smartHomeTesting => '测试中...';

  @override
  String get smartHomeTestSuccess => '连接已验证';

  @override
  String get smartHomeTestFailed => '连接测试失败';

  @override
  String get smartHomePairTv => '配对电视';

  @override
  String get smartHomePairingTv => '注册电视中...';

  @override
  String get smartHomePairTvSuccess => '电视配对成功';

  @override
  String get smartHomePairTvFailed => '电视配对失败';

  @override
  String get smartHomeLoadingDevices => '加载设备中...';

  @override
  String get smartHomeLoadingIntegrations => '加载集成中...';

  @override
  String get smartHomeServiceUnavailable => '智能家居服务暂时不可用。请稍后再试。';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '已完成 $completed / $total';
  }

  @override
  String get adhkarReset => '重置';

  @override
  String get syncHistoryTitle => '同步历史';

  @override
  String get syncClearHistory => '清除历史';

  @override
  String get syncNoConflicts => '未检测到同步冲突。所有设备已同步。';

  @override
  String get syncDomainSettings => '设置';

  @override
  String get syncDomainCities => '已保存的城市';

  @override
  String get syncDomainPrayerLogs => '礼拜记录';

  @override
  String get syncTimeJustNow => '刚刚';

  @override
  String syncTimeMinAgo(int min) {
    return '$min分钟前';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour小时前';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day天前';
  }

  @override
  String get pinCity => '置顶';

  @override
  String get pinMaxReached => '最多置顶5个城市。升级到Ummat+获取更多。';

  @override
  String pinCityUnpinned(String city) {
    return '已取消置顶 $city';
  }

  @override
  String get pinUndo => '撤销';

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
