// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Thai (`th`).
class AppLocalizationsTh extends AppLocalizations {
  AppLocalizationsTh([String locale = 'th']) : super(locale);

  @override
  String get appTitle => 'PrayCalc';

  @override
  String get prayerFajr => 'ฟัจร์';

  @override
  String get prayerSunrise => 'พระอาทิตย์ขึ้น';

  @override
  String get prayerDhuhr => 'ซุฮ์ริ';

  @override
  String get prayerAsr => 'อัศริ';

  @override
  String get prayerMaghrib => 'มัฆริบ';

  @override
  String get prayerIsha => 'อิชา';

  @override
  String get prayerQiyam => 'กิยาม';

  @override
  String get prayerSuhoor => 'สะฮูร';

  @override
  String get prayerIftar => 'อิฟตาร';

  @override
  String get hijriMuharram => 'มุฮัรรอม';

  @override
  String get hijriSafar => 'ซอฟัร';

  @override
  String get hijriRabiAlAwwal => 'รอบีอุลเอาวัล';

  @override
  String get hijriRabiAlThani => 'รอบีอุษษานี';

  @override
  String get hijriJumadaAlAwwal => 'ญุมาดัลเอาวัล';

  @override
  String get hijriJumadaAlThani => 'ญุมาดัษษานี';

  @override
  String get hijriRajab => 'รอญับ';

  @override
  String get hijriShaban => 'ชะอ์บาน';

  @override
  String get hijriRamadan => 'รอมฎอน';

  @override
  String get hijriShawwal => 'เชาวาล';

  @override
  String get hijriDhulQidah => 'ซุลกิอ์ดะฮ์';

  @override
  String get hijriDhulHijjah => 'ซุลฮิจญะฮ์';

  @override
  String get monthJan => 'ม.ค.';

  @override
  String get monthFeb => 'ก.พ.';

  @override
  String get monthMar => 'มี.ค.';

  @override
  String get monthApr => 'เม.ย.';

  @override
  String get monthMay => 'พ.ค.';

  @override
  String get monthJun => 'มิ.ย.';

  @override
  String get monthJul => 'ก.ค.';

  @override
  String get monthAug => 'ส.ค.';

  @override
  String get monthSep => 'ก.ย.';

  @override
  String get monthOct => 'ต.ค.';

  @override
  String get monthNov => 'พ.ย.';

  @override
  String get monthDec => 'ธ.ค.';

  @override
  String get monthJanuary => 'มกราคม';

  @override
  String get monthFebruary => 'กุมภาพันธ์';

  @override
  String get monthMarch => 'มีนาคม';

  @override
  String get monthApril => 'เมษายน';

  @override
  String get monthMayFull => 'พฤษภาคม';

  @override
  String get monthJune => 'มิถุนายน';

  @override
  String get monthJuly => 'กรกฎาคม';

  @override
  String get monthAugust => 'สิงหาคม';

  @override
  String get monthSeptember => 'กันยายน';

  @override
  String get monthOctober => 'ตุลาคม';

  @override
  String get monthNovember => 'พฤศจิกายน';

  @override
  String get monthDecember => 'ธันวาคม';

  @override
  String get dayMonShort => 'จ.';

  @override
  String get dayTueShort => 'อ.';

  @override
  String get dayWedShort => 'พ.';

  @override
  String get dayThuShort => 'พฤ.';

  @override
  String get dayFriShort => 'ศ.';

  @override
  String get daySatShort => 'ส.';

  @override
  String get daySunShort => 'อา.';

  @override
  String get dayMonday => 'วันจันทร์';

  @override
  String get dayTuesday => 'วันอังคาร';

  @override
  String get dayWednesday => 'วันพุธ';

  @override
  String get dayThursday => 'วันพฤหัสบดี';

  @override
  String get dayFriday => 'วันศุกร์';

  @override
  String get daySaturday => 'วันเสาร์';

  @override
  String get daySunday => 'วันอาทิตย์';

  @override
  String get daySuChart => 'อา';

  @override
  String get dayMoChart => 'จ';

  @override
  String get dayTuChart => 'อ';

  @override
  String get dayWeChart => 'พ';

  @override
  String get dayThChart => 'พฤ';

  @override
  String get dayFrChart => 'ศ';

  @override
  String get daySaChart => 'ส';

  @override
  String get chooseCityLabel => 'เลือกเมือง';

  @override
  String get setCityFab => 'ตั้งเมือง';

  @override
  String prayerTimesError(Object error) {
    return 'ไม่สามารถคำนวณเวลาละหมาดได้\n$error';
  }

  @override
  String prayerCountdownLabel(String prayer) {
    return '$prayer ใน';
  }

  @override
  String get ramadanMubarak => 'รอมฎอนมุบาร็อก';

  @override
  String ramadanDayProgress(int day) {
    return 'วันที่ $day / 30';
  }

  @override
  String get lastTenNights => '10 คืนสุดท้าย';

  @override
  String get laylatulQadr => 'ลัยละตุลก็อดร์';

  @override
  String get homeSuffixAH => 'ฮ.ศ.';

  @override
  String get homeSuffixCE => 'ค.ศ.';

  @override
  String get homeNoCitySelected => 'ยังไม่ได้เลือกเมือง';

  @override
  String get homeNoCityHint => 'แตะด้านบนเพื่อค้นหาเมืองหรือเปิดใช้ GPS';

  @override
  String get homeCouldNotCalc => 'ไม่สามารถคำนวณเวลาละหมาดได้';

  @override
  String get homeQasr => 'ก็อศร์';

  @override
  String get homeActionMonthlyTimes => 'เวลา\nรายเดือน';

  @override
  String get homeActionDuaDhikr => 'ดุอาอ์\nและซิกิร';

  @override
  String get homeActionPrayerStats => 'สถิติ\nละหมาด';

  @override
  String homePolarBanner(int count) {
    return 'ไม่สามารถคำนวณเวลาละหมาด $count รอบสำหรับที่ตั้งของคุณในช่วงนี้ (ดวงอาทิตย์เที่ยงคืน / คืนขั้วโลก) ลองใช้การประมาณละติจูดใกล้เคียงในการตั้งค่า';
  }

  @override
  String get settingsTitle => 'การตั้งค่า';

  @override
  String get settingsSectionPrayerCalc => 'การคำนวณละหมาด';

  @override
  String get settingsCalcMethod => 'วิธีการคำนวณ';

  @override
  String get settingsCalcMethodAuto => 'อัตโนมัติ (ไดนามิก)';

  @override
  String get settingsHanafiAsr => 'อัศริฮะนะฟี';

  @override
  String get settingsHanafiAsrSubtitle => 'ค่าเงา 2 เท่า (เวลาอัศริช้ากว่า)';

  @override
  String get settingsSectionDisplay => 'การแสดงผล';

  @override
  String get settings24hClock => 'นาฬิกา 24 ชั่วโมง';

  @override
  String get settingsFollowSystemTheme => 'ใช้ธีมของระบบ';

  @override
  String get settingsDarkMode => 'โหมดมืด';

  @override
  String get settingsSectionNotifications => 'การแจ้งเตือน';

  @override
  String get settingsPrayerNotifications => 'การแจ้งเตือนละหมาด';

  @override
  String get settingsPrayerNotificationsSubtitle =>
      'อะซาน การเตือน และการตั้งค่าแต่ละละหมาด';

  @override
  String get settingsPrayerAgendas => 'วาระละหมาด';

  @override
  String get settingsPrayerAgendasSubtitle => 'การเตือนกำหนดเองตามเวลาละหมาด';

  @override
  String get settingsAccount => 'บัญชี';

  @override
  String get settingsSignInToSync => 'ลงชื่อเข้าใช้เพื่อซิงค์';

  @override
  String get settingsSignInToSyncSubtitle => 'เก็บข้อมูลของคุณข้ามอุปกรณ์';

  @override
  String get settingsHomeScreen => 'หน้าจอหลัก';

  @override
  String get settingsSkyGradient => 'พื้นหลังไล่สีท้องฟ้า';

  @override
  String get settingsSkyGradientSubtitle =>
      'สีท้องฟ้าแบบเคลื่อนไหวตามเวลาของวัน';

  @override
  String get settingsWeatherGradient => 'ไล่สีตามสภาพอากาศ';

  @override
  String get settingsWeatherGradientSubtitle =>
      'ปรับสีท้องฟ้าตามสภาพอากาศท้องถิ่น';

  @override
  String get settingsCountdownAnimation => 'อนิเมชันนับถอยหลัง';

  @override
  String get settingsCountdownAnimationSubtitle =>
      'วงแหวนหายใจบนเวลาละหมาดถัดไป';

  @override
  String get settingsPrayerTracking => 'การติดตามละหมาด';

  @override
  String get settingsTrackMyPrayers => 'ติดตามละหมาดของฉัน';

  @override
  String get settingsTrackMyPrayersSubtitle => 'บันทึกละหมาดที่คุณทำในแต่ละวัน';

  @override
  String get settingsPrayerStats => 'สถิติละหมาด';

  @override
  String get settingsPrayerStatsSubtitle =>
      'สถิติต่อเนื่อง แผนภูมิรายสัปดาห์และรายเดือน';

  @override
  String get settingsJumuahKahf => 'เตือนอัลกะฮ์ฟีวันศุกร์';

  @override
  String get settingsJumuahKahfSubtitle =>
      'เตือนทุกวันศุกร์ให้อ่านซูเราะฮ์อัลกะฮ์ฟี';

  @override
  String get settingsTravel => 'การเดินทาง';

  @override
  String get settingsTravelMode => 'โหมดเดินทาง';

  @override
  String get settingsTravelModeSubtitle =>
      'ตรวจจับอัตโนมัติเมื่อคุณออกจากบ้านและปรับละหมาด';

  @override
  String get settingsHomeLocation => 'ที่ตั้งบ้าน';

  @override
  String get settingsHomeLocationNotSet =>
      'ยังไม่ได้ตั้ง — แตะเพื่อใช้ตำแหน่งปัจจุบัน';

  @override
  String get settingsClearHomeLocation => 'ล้างที่ตั้งบ้าน';

  @override
  String get settingsTravelRulings => 'หลักการละหมาดขณะเดินทาง';

  @override
  String get settingsTravelRulingsSubtitle =>
      'ก็อศร์ การรวม และแนวทางผู้เดินทาง';

  @override
  String get settingsSmartHome => 'สมาร์ทโฮม';

  @override
  String get settingsSmartHomeIntegrations => 'การเชื่อมต่อสมาร์ทโฮม';

  @override
  String get settingsSmartHomeIntegrationsSubtitle =>
      'HomeKit, Google Home, Alexa, Home Assistant';

  @override
  String get settingsTvDisplay => 'จอทีวี';

  @override
  String get settingsTvHome => 'จอทีวีหน้าหลัก';

  @override
  String get settingsTvHomeSubtitle => 'นาฬิกาละหมาดเต็มจอสำหรับทีวี';

  @override
  String get settingsMasjidDisplay => 'จอมัสยิด';

  @override
  String get settingsMasjidDisplaySubtitle =>
      'ตารางอะซาน/อิกอมะฮ์สำหรับจอมัสยิด';

  @override
  String get settingsTvSettings => 'การตั้งค่าทีวี';

  @override
  String get settingsTvSettingsSubtitle =>
      'โหมดมัสยิด ออฟเซ็ตอิกอมะฮ์ แอมเบียนท์';

  @override
  String get settingsAboutPrayCalc => 'เกี่ยวกับ PrayCalc';

  @override
  String get syncSynced => 'ซิงค์แล้ว';

  @override
  String get syncSyncing => 'กำลังซิงค์...';

  @override
  String get syncOffline => 'ออฟไลน์';

  @override
  String get syncError => 'ซิงค์ผิดพลาด';

  @override
  String get notifSettingsTitle => 'การแจ้งเตือนและอะซาน';

  @override
  String get notifAdhanLabel => 'อะซาน';

  @override
  String notifReminderMinBefore(int minutes) {
    return 'เตือน: $minutes นาทีก่อน';
  }

  @override
  String notifVolumePct(int pct) {
    return 'ระดับเสียง: $pct%';
  }

  @override
  String get notifTestAdhan => 'ทดสอบอะซาน';

  @override
  String get notifModeOff => 'ปิด';

  @override
  String get notifModeReminderOnly => 'เตือนเท่านั้น';

  @override
  String get notifModeArrival => 'เมื่อถึงเวลาละหมาด';

  @override
  String get notifModeBoth => 'เตือน + เมื่อถึงเวลา';

  @override
  String get citySearchHint => 'ค้นหาเมือง…';

  @override
  String get citySearchDetectTooltip => 'ตรวจจับตำแหน่งของฉัน';

  @override
  String get citySearchNoCityGps => 'ไม่สามารถตรวจจับเมืองจาก GPS ได้';

  @override
  String get citySearchPermissionDenied =>
      'ไม่ได้รับอนุญาตตำแหน่ง ค้นหาด้วยตนเอง';

  @override
  String get citySearchNoResults => 'ไม่พบเมือง';

  @override
  String get citySearchStartTyping => 'เริ่มพิมพ์เพื่อค้นหา…';

  @override
  String get agendasTitle => 'วาระละหมาด';

  @override
  String get agendasEmpty =>
      'ยังไม่มีวาระ\nแตะ + เพื่อเพิ่มการเตือนที่เชื่อมกับละหมาดของคุณ';

  @override
  String get agendasUndo => 'เลิกทำ';

  @override
  String agendasRemoved(String label) {
    return 'ลบ $label แล้ว';
  }

  @override
  String get agendaNewTitle => 'วาระใหม่';

  @override
  String get agendaEditTitle => 'แก้ไขวาระ';

  @override
  String get agendaSave => 'บันทึก';

  @override
  String get agendaLabelEmpty => 'ป้ายกำกับต้องไม่ว่าง';

  @override
  String get agendaLabelField => 'ป้ายกำกับ';

  @override
  String get agendaLabelHint => 'เช่น ตื่นสำหรับฟัจร์';

  @override
  String get agendaPrayerSection => 'ละหมาด';

  @override
  String get agendaTimeOffsetSection => 'ออฟเซ็ตเวลา';

  @override
  String get agendaOffsetAtPrayerTime => 'เมื่อถึงเวลาละหมาด';

  @override
  String agendaOffsetMinBefore(int minutes) {
    return '$minutes นาทีก่อน';
  }

  @override
  String agendaOffsetMinAfter(int minutes) {
    return '$minutes นาทีหลัง';
  }

  @override
  String get agendaRepeatSection => 'ทำซ้ำ';

  @override
  String get agendaNotifTypeSection => 'ประเภทการแจ้งเตือน';

  @override
  String get agendaNotifSilent => 'เงียบ';

  @override
  String get agendaNotifSound => 'เสียง';

  @override
  String get agendaNotifVibrate => 'สั่น';

  @override
  String get agendaDayM => 'จ';

  @override
  String get agendaDayT => 'อ';

  @override
  String get agendaDayW => 'พ';

  @override
  String get agendaDayF => 'ศ';

  @override
  String get agendaDayS => 'ส';

  @override
  String get moonTitle => 'ดวงจันทร์และปฏิทินฮิจเราะฮ์';

  @override
  String moonIlluminated(int pct) {
    return 'สว่าง $pct%';
  }

  @override
  String get moonFullTonight => 'คืนนี้จันทร์เต็มดวง!';

  @override
  String get moonNextTomorrow => 'จันทร์เต็มดวงถัดไปวันพรุ่งนี้';

  @override
  String moonNextDays(int days) {
    return 'จันทร์เต็มดวงถัดไปใน $days วัน';
  }

  @override
  String moonAge(String age) {
    return 'อายุดวงจันทร์: $age วัน';
  }

  @override
  String get moonPhaseNewMoon => 'จันทร์ดับ';

  @override
  String get moonPhaseWaxingCrescent => 'จันทร์เสี้ยวข้างขึ้น';

  @override
  String get moonPhaseFirstQuarter => 'จันทร์ครึ่งดวงข้างขึ้น';

  @override
  String get moonPhaseWaxingGibbous => 'จันทร์ค่อนดวงข้างขึ้น';

  @override
  String get moonPhaseFullMoon => 'จันทร์เต็มดวง';

  @override
  String get moonPhaseWaningGibbous => 'จันทร์ค่อนดวงข้างแรม';

  @override
  String get moonPhaseLastQuarter => 'จันทร์ครึ่งดวงข้างแรม';

  @override
  String get moonPhaseWaningCrescent => 'จันทร์เสี้ยวข้างแรม';

  @override
  String get moonHilalVisibility => 'การมองเห็นฮิลาลถัดไป';

  @override
  String get moonRegionMiddleEast => 'ตะวันออกกลาง';

  @override
  String get moonRegionWestAfrica => 'แอฟริกาตะวันตก';

  @override
  String get moonRegionSouthAsia => 'เอเชียใต้';

  @override
  String get moonRegionEurope => 'ยุโรป';

  @override
  String get moonRegionAmericas => 'อเมริกา';

  @override
  String get moonVisible => 'มองเห็น';

  @override
  String get moonNotVisible => 'มองไม่เห็น';

  @override
  String get moonPossible => 'อาจเป็นไปได้';

  @override
  String get moonUpcomingDates => 'วันสำคัญอิสลามที่จะมาถึง';

  @override
  String get hijriTodayLabel => 'วันนี้ในปฏิทินฮิจเราะฮ์';

  @override
  String ramadanBeginsLabel(int year) {
    return 'รอมฎอน $year ฮ.ศ. เริ่มต้น';
  }

  @override
  String ramadanDaysAway(int days) {
    return 'อีก $days วัน';
  }

  @override
  String get moonLunarCycle => 'วงจรจันทรคติ';

  @override
  String moonDayOfCycle(int day) {
    return 'วันที่ $day จาก ~29.5';
  }

  @override
  String get moonHilalSightingForecast => 'พยากรณ์การมองเห็นฮิลาล';

  @override
  String get moonHilalVisibilityMap => 'แผนที่การมองเห็นฮิลาล';

  @override
  String moonDayN(int day) {
    return 'วันที่ $day';
  }

  @override
  String get moonGlobalSighting => 'การมองเห็นทั่วโลก';

  @override
  String get moonZoneNakedEye => 'ตาเปล่า';

  @override
  String get moonZoneBinoculars => 'กล้องส่องทางไกล';

  @override
  String get moonZoneVeryDifficult => 'ยากมาก';

  @override
  String get moonZoneNotVisible => 'มองไม่เห็น';

  @override
  String moonMonthPrediction29(String month, int year) {
    return '$month $year ฮ.ศ. น่าจะมี 29 วัน คาดว่าจะเห็นจันทร์เสี้ยวในวันที่ 29 อินชาอัลลอฮ์';
  }

  @override
  String moonMonthPrediction30(String month, int year) {
    return '$month $year ฮ.ศ. น่าจะมี 30 วัน ไม่น่าจะเห็นจันทร์เสี้ยวในวันที่ 29 เดือนจะครบ 30 วัน';
  }

  @override
  String get moonUmmAlQura => 'อุมมุลกุรอ';

  @override
  String get moonSaudiArabia => 'ซาอุดีอาระเบีย';

  @override
  String get moonFCNACalc => 'FCNA / คำนวณ';

  @override
  String get moonNorthAmerica => 'อเมริกาเหนือ';

  @override
  String moonNDays(int days) {
    return '$days วัน';
  }

  @override
  String moonStarts(String month) {
    return '$month เริ่ม:';
  }

  @override
  String moonMoonAgeAtSunset(String hours) {
    return 'อายุดวงจันทร์เมื่อพระอาทิตย์ตก: $hours ชม.';
  }

  @override
  String get moon7DayLunarCalendar => 'ปฏิทินจันทรคติ 7 วัน';

  @override
  String get moonUpcomingIslamicEvents => 'เหตุการณ์อิสลามที่จะมาถึง';

  @override
  String get moonTodayLabel => 'วันนี้';

  @override
  String get moonTomorrowLabel => 'พรุ่งนี้';

  @override
  String get calDateCol => 'วันที่';

  @override
  String get calHijriCol => 'ฮิจเราะฮ์';

  @override
  String get calFajrCol => 'ฟัจร์';

  @override
  String get calSunriseCol => 'พระอาทิตย์ขึ้น';

  @override
  String get calDhuhrCol => 'ซุฮ์ริ';

  @override
  String get calAsrCol => 'อัศริ';

  @override
  String get calMaghribCol => 'มัฆริบ';

  @override
  String get calIshaCol => 'อิชา';

  @override
  String get calNoCityText => 'ตั้งเมืองก่อน\nเพื่อดูปฏิทินละหมาด';

  @override
  String get calShareTooltip => 'แชร์ปฏิทิน';

  @override
  String get calPrevMonthTooltip => 'เดือนก่อน';

  @override
  String get calNextMonthTooltip => 'เดือนถัดไป';

  @override
  String calExportHeader(String month) {
    return 'PrayCalc — $month';
  }

  @override
  String calExportSubject(String month) {
    return 'เวลาละหมาด — $month';
  }

  @override
  String get qiblaTitle => 'กิบลัต';

  @override
  String get qiblaSwitchToCompass => 'เปลี่ยนเป็นเข็มทิศ';

  @override
  String get qiblaSwitchToAR => 'เปลี่ยนเป็นกล้อง AR';

  @override
  String get qiblaNoCityText => 'ตั้งเมืองก่อน\nเพื่อคำนวณทิศกิบลัต';

  @override
  String get qiblaCompassUnavailable =>
      'เซ็นเซอร์เข็มทิศไม่พร้อมใช้งานบนอุปกรณ์นี้';

  @override
  String get qiblaCalibrate => 'ปรับเทียบ: เคลื่อนโทรศัพท์เป็นรูปเลข 8';

  @override
  String qiblaDegreesFromNorth(int degrees) {
    return '$degrees° จากทิศเหนือ';
  }

  @override
  String qiblaFrom(String city) {
    return 'จาก $city';
  }

  @override
  String qiblaDistKm(int dist) {
    return '$dist กม. จากกะอ์บะฮ์';
  }

  @override
  String qiblaDistThousandKm(String dist) {
    return '${dist}K กม. จากกะอ์บะฮ์';
  }

  @override
  String get qiblaFacingQibla => 'หันหน้าไปทางกิบลัต ✓';

  @override
  String get tasbeehTitle => 'ตัสบีห์';

  @override
  String get tasbeehResetTooltip => 'รีเซ็ต';

  @override
  String get tasbeehTapToSwitch => 'แตะป้ายเพื่อเปลี่ยน';

  @override
  String get tasbeehTapToCount => 'แตะที่ไหนก็ได้เพื่อนับ';

  @override
  String get tasbeehResetDialogTitle => 'รีเซ็ตตัวนับ?';

  @override
  String get tasbeehResetDialogContent => 'จะรีเซ็ตจำนวนปัจจุบันเป็นศูนย์';

  @override
  String get tasbeehCancel => 'ยกเลิก';

  @override
  String get tasbeehReset => 'รีเซ็ต';

  @override
  String tasbeehTodayDhikr(int count) {
    return 'วันนี้: $count ซิกิร';
  }

  @override
  String get tasbeehLast7Days => '7 วันที่ผ่านมา';

  @override
  String get tasbeehNoHistory => 'ยังไม่มีประวัติ — เริ่มนับเลย!';

  @override
  String tasbeehComplete(int count) {
    return 'ตัสบีห์เสร็จสิ้น! $count ซิกิร';
  }

  @override
  String tasbeehPresetComplete(String label, int target) {
    return '✓ $label × $target';
  }

  @override
  String get smartHomeTitle => 'สมาร์ทโฮม';

  @override
  String get smartHomeSubtitle => 'เชื่อมต่ออุปกรณ์กับเวลาละหมาด';

  @override
  String get smartHomeGoogleHome => 'Google Home';

  @override
  String get smartHomeGoogleHomeDesc =>
      'ถาม Google เกี่ยวกับเวลาละหมาดและทิศกิบลัต';

  @override
  String get smartHomeAlexa => 'Amazon Alexa';

  @override
  String get smartHomeAlexaDesc =>
      'ถาม Alexa เกี่ยวกับเวลาละหมาด ละหมาดถัดไป และอื่นๆ';

  @override
  String get smartHomeSiri => 'Siri Shortcuts';

  @override
  String get smartHomeSiriDesc => 'สร้างทางลัดกำหนดเองสำหรับเวลาละหมาด';

  @override
  String get smartHomeHomeAssistant => 'Home Assistant';

  @override
  String get smartHomeHomeAssistantDesc =>
      'อัตโนมัติไฟ จอ และการเตือนตามเวลาละหมาด';

  @override
  String get smartHomeLinkAccount => 'เชื่อมบัญชี';

  @override
  String get smartHomeLinked => 'เชื่อมแล้ว';

  @override
  String get smartHomeUnlink => 'ยกเลิกเชื่อม';

  @override
  String get smartHomeSetupInstructions => 'คำแนะนำการตั้งค่า';

  @override
  String get smartHomeRequiresUmmatPlus => 'ต้องมี Ummat+';

  @override
  String get smartHomeTroubleshooting => 'แก้ไขปัญหา';

  @override
  String get smartHomeTestConnection => 'ทดสอบการเชื่อมต่อ';

  @override
  String get smartHomeConnectionSuccess => 'เชื่อมต่อสำเร็จ';

  @override
  String get smartHomeConnectionFailed =>
      'เชื่อมต่อไม่สำเร็จ ตรวจสอบการเชื่อมบัญชี';

  @override
  String get subscriptionTitle => 'Ummat+';

  @override
  String get subscriptionSubtitle => 'ฟีเจอร์เวลาละหมาดพรีเมียม';

  @override
  String get subscriptionUpgrade => 'อัปเกรดเป็น Ummat+';

  @override
  String get subscriptionRestore => 'กู้คืนการซื้อ';

  @override
  String get subscriptionManage => 'จัดการการสมัคร';

  @override
  String get subscriptionCancel => 'ยกเลิกการสมัคร';

  @override
  String get subscriptionActive => 'ใช้งานอยู่';

  @override
  String get subscriptionExpired => 'หมดอายุ';

  @override
  String get subscriptionFree => 'ฟรี';

  @override
  String get subscriptionFreeDesc => 'เวลาละหมาดพื้นฐาน กิบลัต ปฏิทิน';

  @override
  String get subscriptionPlusDesc => 'สมาร์ทโฮม จอทีวี วิดเจ็ต และอื่นๆ';

  @override
  String subscriptionFreeQueriesRemaining(int count) {
    return 'เหลือคำถามฟรี $count ครั้ง';
  }

  @override
  String subscriptionPriceYearly(String price) {
    return '$price/ปี';
  }

  @override
  String subscriptionPriceMonthly(String price) {
    return '$price/เดือน';
  }

  @override
  String get subscriptionFeatureSmartHome => 'เชื่อมต่อสมาร์ทโฮม';

  @override
  String get subscriptionFeatureTV => 'โหมดจอทีวี';

  @override
  String get subscriptionFeatureWidgets => 'วิดเจ็ตหน้าจอหลัก';

  @override
  String get subscriptionFeatureWatch => 'คอมพลิเคชันนาฬิกา';

  @override
  String get subscriptionFeatureSync => 'ซิงค์ข้ามอุปกรณ์';

  @override
  String get subscriptionFeatureAdFree => 'ปราศจากโฆษณา';

  @override
  String get watchTitle => 'นาฬิกา';

  @override
  String get watchNextPrayer => 'ละหมาดถัดไป';

  @override
  String get watchAllPrayers => 'ละหมาดทั้งหมด';

  @override
  String get watchComplication => 'คอมพลิเคชัน';

  @override
  String get nextPrayer => 'ละหมาดถัดไป';

  @override
  String get allPrayers => 'ละหมาดทั้งหมด';

  @override
  String get today => 'วันนี้';

  @override
  String get tomorrow => 'พรุ่งนี้';

  @override
  String get thisWeek => 'สัปดาห์นี้';

  @override
  String get thisMonth => 'เดือนนี้';

  @override
  String get loginCreateAccount => 'สร้างบัญชี';

  @override
  String get loginSignIn => 'ลงชื่อเข้าใช้';

  @override
  String get loginWelcomeBack => 'ยินดีต้อนรับกลับ';

  @override
  String get loginJoinPrayCalc => 'เข้าร่วม PrayCalc';

  @override
  String get loginSyncSubtitle => 'ซิงค์ข้อมูลละหมาดข้ามอุปกรณ์';

  @override
  String get loginContinueGoogle => 'ดำเนินต่อด้วย Google';

  @override
  String get loginOr => 'หรือ';

  @override
  String get loginSigningIn => 'กำลังลงชื่อเข้าใช้…';

  @override
  String get loginNameLabel => 'ชื่อแสดง (ไม่บังคับ)';

  @override
  String get loginEmailLabel => 'อีเมล';

  @override
  String get loginPasswordLabel => 'รหัสผ่าน';

  @override
  String get loginEmailRequired => 'ต้องระบุอีเมล';

  @override
  String get loginEmailInvalid => 'กรุณาใส่อีเมลที่ถูกต้อง';

  @override
  String get loginPasswordRequired => 'ต้องระบุรหัสผ่าน';

  @override
  String get loginPasswordMinLength => 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';

  @override
  String get loginForgotPassword => 'ลืมรหัสผ่าน?';

  @override
  String get loginEnterEmailFirst => 'กรุณาใส่อีเมลก่อน';

  @override
  String get loginResetSent => 'ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว';

  @override
  String get loginResetFailed => 'ไม่สามารถส่งอีเมลรีเซ็ตได้';

  @override
  String get loginNewToPrayCalc => 'ใหม่กับ PrayCalc?';

  @override
  String get loginAlreadyHaveAccount => 'มีบัญชีอยู่แล้ว?';

  @override
  String get accountTitle => 'บัญชี';

  @override
  String get accountNotSignedIn => 'ยังไม่ได้ลงชื่อเข้าใช้';

  @override
  String get accountSyncSection => 'ซิงค์';

  @override
  String get accountSyncStatus => 'สถานะซิงค์';

  @override
  String get accountSyncNow => 'ซิงค์ตอนนี้';

  @override
  String get accountSyncHistory => 'ประวัติซิงค์';

  @override
  String get accountNoConflicts => 'ไม่พบความขัดแย้ง';

  @override
  String accountConflictsResolved(int count) {
    return 'แก้ไขแล้ว $count รายการ';
  }

  @override
  String accountSyncedAgo(String time) {
    return 'ซิงค์เมื่อ $time';
  }

  @override
  String get accountOfflineStatus => 'ออฟไลน์ การเปลี่ยนแปลงบันทึกไว้ในเครื่อง';

  @override
  String get accountSyncErrorStatus => 'ซิงค์ผิดพลาด จะลองใหม่';

  @override
  String get accountDataSection => 'ข้อมูล';

  @override
  String get accountExportData => 'ส่งออกข้อมูล';

  @override
  String get accountExportSubtitle => 'ดาวน์โหลดการตั้งค่าและบันทึกละหมาด';

  @override
  String get accountExportFailed => 'ไม่สามารถส่งออกข้อมูลได้';

  @override
  String get accountSignOutTitle => 'ออกจากระบบ';

  @override
  String get accountSignOutBody =>
      'ข้อมูลในเครื่องจะยังคงอยู่ ลงชื่อเข้าใช้อีกครั้งเพื่อซิงค์ต่อ';

  @override
  String get accountDeleteAccount => 'ลบบัญชี';

  @override
  String get accountDeleteSubtitle => 'ลบบัญชีและข้อมูลอย่างถาวร';

  @override
  String get accountDeleteBody =>
      'จะลบบัญชีและข้อมูลที่ซิงค์ทั้งหมดอย่างถาวร ข้อมูลในเครื่องบนอุปกรณ์นี้จะไม่ถูกลบ\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้';

  @override
  String get accountDeleted => 'ลบบัญชีแล้ว';

  @override
  String get accountDeleteFailed => 'ไม่สามารถลบบัญชีได้';

  @override
  String get accountTimeJustNow => 'เมื่อกี้';

  @override
  String accountTimeMinAgo(int min) {
    return '$min นาทีที่แล้ว';
  }

  @override
  String accountTimeHourAgo(int hour) {
    return '$hour ชม.ที่แล้ว';
  }

  @override
  String accountTimeDayAgo(int day) {
    return '$day วันที่แล้ว';
  }

  @override
  String get statsTitle => 'สถิติละหมาด';

  @override
  String get statsShareTooltip => 'แชร์สถิติ';

  @override
  String get statsTodayPrayers => 'ละหมาดวันนี้';

  @override
  String statsTodayCount(int done) {
    return '$done / 5';
  }

  @override
  String get statsStreak => 'สถิติต่อเนื่อง';

  @override
  String get statsDays => 'วัน';

  @override
  String get statsThisWeek => 'สัปดาห์นี้';

  @override
  String get statsCompletion => 'เสร็จสิ้น';

  @override
  String get statsThisMonth => 'เดือนนี้';

  @override
  String get statsMostMissed => 'พลาดมากที่สุด';

  @override
  String get statsThisWeekLabel => 'สัปดาห์นี้';

  @override
  String get statsWeeklyChart => 'ความสำเร็จรายสัปดาห์แยกตามละหมาด';

  @override
  String get statsMonthlyChart => 'ความสำเร็จรายเดือนแยกตามละหมาด';

  @override
  String statsTotalLogged(int count) {
    return 'บันทึกละหมาดทั้งหมด $count ครั้ง';
  }

  @override
  String get statsKeepItUp => 'ทำต่อไป!';

  @override
  String get statsShareTitle => 'สถิติละหมาด PrayCalc';

  @override
  String statsShareStreak(int days) {
    return 'สถิติต่อเนื่อง: $days วัน';
  }

  @override
  String statsShareWeekly(int pct) {
    return 'รายสัปดาห์: $pct%';
  }

  @override
  String statsShareMonthly(int pct) {
    return 'รายเดือน: $pct%';
  }

  @override
  String get statsShareBreakdown => 'รายละเอียดรายสัปดาห์:';

  @override
  String get aboutTitle => 'เกี่ยวกับ PrayCalc';

  @override
  String get aboutWebsite => 'เว็บไซต์';

  @override
  String get aboutContact => 'ติดต่อ';

  @override
  String get aboutLicenses => 'สัญญาอนุญาตโอเพนซอร์ส';

  @override
  String get aboutCouldNotOpen => 'ไม่สามารถเปิดลิงก์ได้';

  @override
  String aboutCopyright(int year) {
    return '© $year Ummat Dev. สงวนลิขสิทธิ์\n\nเวลาละหมาดคำนวณโดยเอนจิน pray_calc_dart ความแม่นยำขึ้นอยู่กับตำแหน่ง GPS และวิธีคำนวณที่เลือก';
  }

  @override
  String get commonCancel => 'ยกเลิก';

  @override
  String get commonSave => 'บันทึก';

  @override
  String get commonDelete => 'ลบ';

  @override
  String get commonEdit => 'แก้ไข';

  @override
  String get commonRetry => 'ลองอีกครั้ง';

  @override
  String get commonClose => 'ปิด';

  @override
  String get commonDone => 'เสร็จ';

  @override
  String get commonBack => 'กลับ';

  @override
  String get commonNext => 'ถัดไป';

  @override
  String get commonSkip => 'ข้าม';

  @override
  String get commonContinue => 'ดำเนินต่อ';

  @override
  String get commonOk => 'ตกลง';

  @override
  String get commonYes => 'ใช่';

  @override
  String get commonNo => 'ไม่';

  @override
  String get commonShare => 'แชร์';

  @override
  String get commonCopy => 'คัดลอก';

  @override
  String get commonCopied => 'คัดลอกไปยังคลิปบอร์ดแล้ว';

  @override
  String get commonLoading => 'กำลังโหลด...';

  @override
  String get commonError => 'เกิดข้อผิดพลาด';

  @override
  String get commonErrorRetry => 'เกิดข้อผิดพลาด แตะเพื่อลองอีกครั้ง';

  @override
  String get commonNoInternet => 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต';

  @override
  String get commonOfflineMode => 'โหมดออฟไลน์';

  @override
  String get commonSignIn => 'ลงชื่อเข้าใช้';

  @override
  String get commonSignOut => 'ออกจากระบบ';

  @override
  String get commonSignUp => 'สมัคร';

  @override
  String get commonProfile => 'โปรไฟล์';

  @override
  String get commonAccount => 'บัญชี';

  @override
  String get commonAbout => 'เกี่ยวกับ';

  @override
  String commonVersion(String version) {
    return 'เวอร์ชัน $version';
  }

  @override
  String get commonPrivacyPolicy => 'นโยบายความเป็นส่วนตัว';

  @override
  String get commonTermsOfService => 'ข้อกำหนดการใช้งาน';

  @override
  String get commonRateApp => 'ให้คะแนนแอป';

  @override
  String get commonFeedback => 'ส่งข้อเสนอแนะ';

  @override
  String get commonHelp => 'ช่วยเหลือ';

  @override
  String get commonLanguage => 'ภาษา';

  @override
  String get commonOpenSettings => 'เปิดการตั้งค่า';

  @override
  String get travelNotificationTitle => 'คุณกำลังเดินทาง';

  @override
  String get travelNotificationBody =>
      'เวลาละหมาดอาจถูกย่อ แตะเพื่อเรียนรู้เกี่ยวกับหลักการเดินทาง';

  @override
  String get travelRulingsTitle => 'การเดินทางและละหมาด';

  @override
  String get travelRulingsIntro =>
      'หลักการอิสลามเกี่ยวกับละหมาดขณะเดินทาง พร้อมอ้างอิงจากอัลกุรอานและหะดีษที่ถูกต้อง';

  @override
  String get travelWhenTitle => 'เมื่อไหร่ใช้หลักการเดินทาง?';

  @override
  String get travelQasrTitle => 'ย่อละหมาด (ก็อศร์)';

  @override
  String get travelJamTitle => 'รวมละหมาด (ญัมอ์)';

  @override
  String get travelDurationTitle => 'ระยะเวลาเดินทาง';

  @override
  String get travelReferencesTitle => 'อ้างอิงทางวิชาการ';

  @override
  String get travelLearnMore => 'เรียนรู้เพิ่มเติม';

  @override
  String get travelHanafiDefaultTitle => 'ทำไม PrayCalc ใช้ค่าเริ่มต้นฮะนะฟี';

  @override
  String get travelDeeperScholarly => 'การอภิปรายทางวิชาการเชิงลึก';

  @override
  String get onboardingTitle1 => 'เวลาละหมาด ไม่ว่าคุณอยู่ที่ไหน';

  @override
  String get onboardingBody1 =>
      'เวลาละหมาดแม่นยำด้วย GPS สำหรับทุกเมืองบนโลก ตั้งแต่ฟัจร์ถึงอิชา พระอาทิตย์ขึ้นถึงกิยาม ขับเคลื่อนด้วยเอนจินคำนวณของเราเอง สร้างเพื่อความแม่นยำ';

  @override
  String get onboardingTitle2 => 'ตำแหน่งของคุณ เวลาของคุณ';

  @override
  String get onboardingBody2 =>
      'ค้นหาเมืองหรือให้ GPS ตรวจจับตำแหน่งของคุณ PrayCalc ค้นหาเวลาสำหรับ 5 ล้านเมืองทั่วโลก';

  @override
  String get onboardingTitle3 => 'ไม่พลาดละหมาดอีกเลย';

  @override
  String get onboardingBody3 =>
      'อะซานเมื่อถึงเวลาละหมาด เตือนก่อนเวลา วาระกำหนดเองสำหรับสะฮูร ชั้นเรียน และอื่นๆ';

  @override
  String get onboardingTitle4 => 'ทุกอย่างที่คุณต้องการ';

  @override
  String get onboardingBody4 =>
      'เข็มทิศกิบลัต ปฏิทินละหมาด เฟสจันทร์ฮิจเราะฮ์ ตัวนับตัสบีห์ ทั้งหมดในที่เดียว';

  @override
  String get onboardingSkip => 'ข้าม';

  @override
  String get onboardingGetStarted => 'เริ่มต้น';

  @override
  String get onboardingSignInTitle => 'ลงชื่อเข้าใช้ PrayCalc';

  @override
  String get onboardingSignInSubtitle =>
      'บันทึกประวัติละหมาดและซิงค์\nข้ามอุปกรณ์ทั้งหมดของคุณ';

  @override
  String get onboardingContinueGoogle => 'ดำเนินต่อด้วย Google';

  @override
  String get onboardingContinueWithoutAccount => 'ดำเนินต่อโดยไม่มีบัญชี';

  @override
  String get onboardingSigningIn => 'กำลังลงชื่อเข้าใช้…';

  @override
  String get onboardingSelectLanguage => 'เลือกภาษา';

  @override
  String get duaDhikrTitle => 'ดุอาอ์และซิกิร';

  @override
  String get duaDhikrTabDua => 'ดุอาอ์';

  @override
  String get duaDhikrTabDhikr => 'ซิกิร';

  @override
  String get duaDhikrTabTasbeeh => 'ตัสบีห์';

  @override
  String get duaDhikrTabMorning => 'เช้า';

  @override
  String get duaDhikrTabEvening => 'เย็น';

  @override
  String get duaDhikrMorningAdhkar => 'อัซการ์ยามเช้า';

  @override
  String get duaDhikrEveningAdhkar => 'อัซการ์ยามเย็น';

  @override
  String get calGregToggle => 'สากล';

  @override
  String get calHijriToggle => 'ฮิจเราะฮ์';

  @override
  String get calYearlyTooltip => 'ปฏิทินรายปี';

  @override
  String get calExportIcsTooltip => 'ส่งออก .ics';

  @override
  String get calMagCol => 'มัฆ';

  @override
  String get qiblaShowOnMap => 'แสดงบนแผนที่';

  @override
  String get qiblaWaitingCompass => 'รอเข็มทิศ...';

  @override
  String get qiblaNoCompassSensor =>
      'ไม่มีเซ็นเซอร์เข็มทิศ แสดงทิศกิบลัตแบบคงที่';

  @override
  String get qiblaAccuracyExcellent => 'ความแม่นยำดีเยี่ยม';

  @override
  String get qiblaAccuracyGood => 'ความแม่นยำดี';

  @override
  String get qiblaAccuracyFair =>
      'ความแม่นยำพอใช้ ปรับเทียบโดยเคลื่อนโทรศัพท์เป็นรูปเลข 8';

  @override
  String get qiblaAccuracyLow =>
      'ความแม่นยำต่ำ ปรับเทียบโดยเคลื่อนโทรศัพท์เป็นรูปเลข 8';

  @override
  String get qiblaToTheKaaba => 'ไปยังกะอ์บะฮ์';

  @override
  String get qiblaYourLocation => 'ตำแหน่งของคุณ';

  @override
  String get qiblaGpsAccurate => 'GPS แม่นยำ';

  @override
  String get qiblaCityCenter => 'ศูนย์กลางเมือง';

  @override
  String get moonIlluminatedLabel => 'สว่าง';

  @override
  String get moonAgeLabel => 'อายุ';

  @override
  String get moonFirstQtr => 'ครึ่งดวงข้างขึ้น';

  @override
  String get moonLastQtr => 'ครึ่งดวงข้างแรม';

  @override
  String get moonTonight => 'คืนนี้';

  @override
  String get moonTomorrow => 'พรุ่งนี้';

  @override
  String moonDaysAway(int days) {
    return '$daysว';
  }

  @override
  String get moonBeta => 'เบต้า';

  @override
  String get setHomeTitle => 'ตั้งที่ตั้งบ้าน';

  @override
  String get setHomeSearchHint => 'ค้นหาเมือง ตำบล หรือรหัสไปรษณีย์…';

  @override
  String get setHomeClear => 'ล้าง';

  @override
  String get setHomeUseCurrentLocation => 'ใช้ตำแหน่งปัจจุบัน';

  @override
  String get setHomeDetectAndSet => 'ตรวจจับตำแหน่งและตั้งเป็นบ้าน';

  @override
  String get setHomeAlreadySet => 'ตั้งที่ตั้งบ้านแล้ว';

  @override
  String setHomeSetAs(String city) {
    return 'ตั้ง $city เป็นบ้าน';
  }

  @override
  String get setHomeCurrentLocationSet => 'ตั้งตำแหน่งปัจจุบันเป็นบ้านแล้ว';

  @override
  String get setHomePermissionDenied =>
      'ไม่ได้รับอนุญาตตำแหน่ง ค้นหาเมืองด้านล่าง';

  @override
  String get setHomeGpsUnavailable => 'GPS ไม่พร้อมใช้งาน ค้นหาด้วยตนเอง';

  @override
  String get setHomeNoCitiesFound => 'ไม่พบเมือง';

  @override
  String get setHomeSearchPrompt => 'ค้นหาเมืองบ้านของคุณ';

  @override
  String get setHomeSearchBody =>
      'พิมพ์ด้านบนเพื่อค้นหา หรือใช้ตำแหน่งปัจจุบัน โหมดเดินทางจะตรวจจับเมื่อคุณอยู่ห่างจากบ้าน';

  @override
  String get subscriptionYouHavePlus => 'คุณมี Ummat+';

  @override
  String get subscriptionUpgradeTo => 'อัปเกรดเป็น Ummat+';

  @override
  String get subscriptionThankYou => 'ขอบคุณที่สนับสนุน PrayCalc';

  @override
  String get subscriptionUnlockPremium => 'ปลดล็อกฟีเจอร์พรีเมียมในทุกอุปกรณ์';

  @override
  String get subscriptionManageSub => 'จัดการการสมัคร';

  @override
  String get subscriptionWelcome => 'ยินดีต้อนรับสู่ Ummat+!';

  @override
  String get subscriptionSubscribe => 'สมัคร';

  @override
  String get subscriptionFreeFeatures => 'ฟีเจอร์ฟรี';

  @override
  String get subscriptionPlusFeatures => 'ฟีเจอร์ Ummat+';

  @override
  String get subscriptionFeaturePrayerTimes => 'เวลาละหมาด';

  @override
  String get subscriptionFeatureQibla => 'เข็มทิศกิบลัต';

  @override
  String get subscriptionFeatureCalendar => 'ปฏิทินรายเดือน';

  @override
  String get subscriptionFeatureTasbeeh => 'ตัวนับตัสบีห์';

  @override
  String get subscriptionFeatureMoon => 'ดวงจันทร์และฮิจเราะฮ์';

  @override
  String get smartHomeAlertType => 'ประเภทการแจ้งเตือน';

  @override
  String get smartHomeAlertModal => 'โมดัลเต็มจอ';

  @override
  String get smartHomeAlertCorner => 'แจ้งเตือนมุม';

  @override
  String get smartHomeAlertNone => 'ไม่มี (เงียบ)';

  @override
  String get smartHomePauseMedia => 'หยุดสื่อระหว่างอะซาน';

  @override
  String get smartHomeQuietHours => 'ช่วงเงียบ';

  @override
  String get smartHomeQuietFrom => 'จาก';

  @override
  String get smartHomeQuietTo => 'ถึง';

  @override
  String get smartHomePrayerAudio => 'เสียงแต่ละละหมาด';

  @override
  String get smartHomeAudioAdhan => 'อะซาน';

  @override
  String get smartHomeAudioBeep => 'เสียงบี๊ป';

  @override
  String get smartHomeAudioSilent => 'เงียบ';

  @override
  String get aboutPrivacy => 'นโยบายความเป็นส่วนตัว';

  @override
  String aboutVersion(String version) {
    return 'เวอร์ชัน $version';
  }

  @override
  String get notifDefaultAdhan => 'อะซานเริ่มต้น';

  @override
  String get notifFajrAdhan => 'อะซานฟัจร์';

  @override
  String get notifFajrAdhanSubtitle => 'เล่นเมื่อถึงเวลาละหมาดฟัจร์';

  @override
  String get notifRegularAdhan => 'อะซานปกติ';

  @override
  String get notifRegularAdhanSubtitle => 'เล่นที่ซุฮ์ริ อัศริ มัฆริบ อิชา';

  @override
  String get notifPerPrayerSettings => 'การตั้งค่าแต่ละละหมาด';

  @override
  String get notifPreview => 'ดูตัวอย่าง';

  @override
  String get tvSettingsTitle => 'การตั้งค่าทีวี';

  @override
  String get tvDisplayMode => 'โหมดแสดงผล';

  @override
  String get tvMasjidMode => 'โหมดมัสยิด';

  @override
  String get tvMasjidModeSubtitle => 'จอขนาดใหญ่พร้อมเวลาอิกอมะฮ์';

  @override
  String get tvMasjidName => 'ชื่อมัสยิด';

  @override
  String get tvMasjidNameTapToSet => 'แตะเพื่อตั้งค่า';

  @override
  String get tvClock => 'นาฬิกา';

  @override
  String get tv24hFormat => 'รูปแบบ 24 ชั่วโมง';

  @override
  String get tvIqamahOffsets => 'ออฟเซ็ตอิกอมะฮ์ (นาทีหลังอะซาน)';

  @override
  String tvIqamahMinAfter(int offset) {
    return '$offset นาทีหลังอะซาน';
  }

  @override
  String get tvQrCode => 'QR Code';

  @override
  String get tvShowQrCode => 'แสดง QR Code';

  @override
  String get tvShowQrCodeSubtitle => 'แสดง QR Code บนจอมัสยิด';

  @override
  String get tvQrCodeUrl => 'URL ของ QR Code';

  @override
  String get tvAmbientModeSection => 'โหมดแอมเบียนท์';

  @override
  String get tvIdleTimeout => 'เวลาไม่ใช้งาน';

  @override
  String tvIdleTimeoutSubtitle(int minutes) {
    return '$minutes นาทีก่อนเปิดแอมเบียนท์';
  }

  @override
  String get tvPhotoInterval => 'ช่วงเวลาภาพ';

  @override
  String tvPhotoIntervalSubtitle(int seconds) {
    return '$seconds วินาทีระหว่างภาพ';
  }

  @override
  String get tvBackground => 'พื้นหลัง';

  @override
  String get tvPhotoCategory => 'หมวดภาพ';

  @override
  String get tvLocation => 'ตำแหน่ง';

  @override
  String get tvChangeCity => 'เปลี่ยนเมือง';

  @override
  String get tvChangeCitySubtitle => 'ค้นหาเมืองอื่น';

  @override
  String get tvScreensaverBg => 'พื้นหลังพักหน้าจอ';

  @override
  String get tvScreensaverPhotos => 'ภาพ';

  @override
  String get tvScreensaverPattern => 'ลายเรขาคณิต';

  @override
  String get tvScreensaverBoth => 'ภาพ + ลาย';

  @override
  String get tvCategoryAll => 'ทุกหมวด';

  @override
  String get tvCategoryMasjids => 'มัสยิด';

  @override
  String get tvCategoryInteriors => 'ภายใน';

  @override
  String get tvCategoryGeometric => 'เรขาคณิต';

  @override
  String get tvCategoryCalligraphy => 'อักษรวิจิตร';

  @override
  String get tvCategoryLandscapes => 'ภูมิทัศน์';

  @override
  String get tvCategoryRamadan => 'รอมฎอน';

  @override
  String get tvPhotoCategoryTitle => 'หมวดภาพ';

  @override
  String tvEnterHint(String title) {
    return 'ใส่ $title';
  }

  @override
  String get tvSystemDefault => 'ค่าเริ่มต้นระบบ';

  @override
  String get smartHomeIntegrations => 'การเชื่อมต่อ';

  @override
  String get smartHomeLinkedSpeakers => 'ลำโพงและจอที่เชื่อมแล้ว';

  @override
  String get smartHomeAlertDisplay => 'การแสดงการแจ้งเตือน';

  @override
  String get smartHomeAtAdhanShow => 'เมื่อถึงเวลาอะซานแสดง';

  @override
  String get smartHomePauseMediaTitle => 'หยุดสื่อเมื่อถึงอะซาน';

  @override
  String get smartHomePauseMediaSubtitle => 'เล่นต่อหลังอะซานจบ';

  @override
  String get smartHomePrayerAudioSection => 'เสียงละหมาด';

  @override
  String get smartHomeQuietHoursSection => 'ช่วงเงียบ';

  @override
  String get smartHomeEnableQuietHours => 'เปิดช่วงเงียบ';

  @override
  String get smartHomeQuietHoursSubtitle =>
      'ปิดเสียงการแจ้งเตือนสมาร์ทโฮมทั้งหมด';

  @override
  String get smartHomeNoDevices => 'ยังไม่มีอุปกรณ์เชื่อม';

  @override
  String get smartHomeNoDevicesDesc =>
      'เชื่อม Google Home หรือ Alexa ด้านบน แล้วลำโพงและจอจะปรากฏที่นี่';

  @override
  String get smartHomeRequiresPlus => 'สมาร์ทโฮมต้องมี Ummat+';

  @override
  String get smartHomeRequiresPlusDesc =>
      'ควบคุมการประกาศอะซานบน Google Home, Alexa, Siri และ Home Assistant ตั้งค่าอุปกรณ์ที่เล่นอะซาน เวลาหยุดสื่อ และช่วงเงียบ';

  @override
  String get smartHomeBroadcastGoogle => 'ออกอากาศอะซานบนลำโพงและจอ Nest';

  @override
  String get smartHomeEnableAlexa => 'เปิดสกิล PrayCalc บน Alexa';

  @override
  String get smartHomeSiriAsk =>
      'ถาม Siri เกี่ยวกับเวลาละหมาดหรือตั้งระบบอัตโนมัติ';

  @override
  String get smartHomeHassAdd =>
      'เพิ่มผ่าน HACS สำหรับการรองรับระบบอัตโนมัติเต็มรูปแบบ';

  @override
  String get smartHomeSetupGuide => 'คู่มือการตั้งค่า';

  @override
  String get smartHomeSiriSetupTitle => 'การตั้งค่า Siri Shortcuts';

  @override
  String get smartHomeSiriStep1 => 'เปิดแอป Shortcuts บน iPhone หรือ iPad';

  @override
  String get smartHomeSiriStep2 => 'แตะ \"+\" เพื่อสร้างทางลัดใหม่';

  @override
  String get smartHomeSiriStep3 => 'ค้นหา \"PrayCalc\" ในรายการ';

  @override
  String get smartHomeSiriStep4 =>
      'เพิ่ม \"เวลาละหมาดถัดไป\" หรือ \"เวลาละหมาดวันนี้\"';

  @override
  String get smartHomeSiriStep5 =>
      'เพิ่มลงในระบบอัตโนมัติ (เช่น ทุกวันตอนฟัจร์)';

  @override
  String get smartHomeSiriStep6 =>
      'พูด \"Hey Siri, next prayer time\" เพื่อทดสอบ';

  @override
  String get smartHomeSiriFootnote => 'ต้องมี iOS 16 ขึ้นไป';

  @override
  String get smartHomeHassSetupTitle => 'การตั้งค่า Home Assistant';

  @override
  String get smartHomeHassStep1 =>
      'ติดตั้ง HACS (Home Assistant Community Store)';

  @override
  String get smartHomeHassStep2 => 'ใน HACS ค้นหา \"PrayCalc\" และติดตั้ง';

  @override
  String get smartHomeHassStep3 =>
      'ไปที่ การตั้งค่า > อุปกรณ์และบริการ > เพิ่มการเชื่อมต่อ';

  @override
  String get smartHomeHassStep4 => 'ค้นหา \"PrayCalc\" และเลือก';

  @override
  String get smartHomeHassStep5 =>
      'ใส่ API Key ของ PrayCalc (สร้างจากบัญชีของคุณ)';

  @override
  String get smartHomeHassStep6 => 'ตั้งค่าตำแหน่งและวิธีคำนวณ';

  @override
  String get smartHomeHassFootnote =>
      'ต้องมี Home Assistant 2024.1+ พร้อม HACS';

  @override
  String get smartHomeApiKey => 'API Key';

  @override
  String get smartHomeGenerateApiKey => 'สร้าง API Key';

  @override
  String get smartHomeApiKeyNotReady =>
      'การสร้าง API Key จะพร้อมใช้งานเมื่อบริการสมาร์ท PrayCalc เปิดตัว';

  @override
  String get smartHomeApiKeyDesc =>
      'คุณต้องมี API Key เพื่อเชื่อมต่อ Home Assistant กับบัญชี PrayCalc';

  @override
  String get smartHomeLinkedStatus => 'เชื่อมแล้ว';

  @override
  String get smartHomeNotLinkedStatus => 'ไม่ได้เชื่อม';

  @override
  String get smartHomeCouldNotOpen => 'ไม่สามารถเปิดลิงก์ได้';

  @override
  String get smartHomeDevices => 'อุปกรณ์';

  @override
  String get smartHomeAddDevice => 'เพิ่มอุปกรณ์';

  @override
  String get smartHomeDeleteDevice => 'ลบ';

  @override
  String get smartHomeDeleteDeviceConfirm => 'ลบอุปกรณ์นี้?';

  @override
  String get smartHomeDeviceOnline => 'ออนไลน์';

  @override
  String get smartHomeDeviceOffline => 'ออฟไลน์';

  @override
  String smartHomeDeviceLastSeen(String time) {
    return 'เห็นล่าสุด: $time';
  }

  @override
  String get smartHomeDeviceName => 'ชื่ออุปกรณ์';

  @override
  String get smartHomeDeviceType => 'ประเภทอุปกรณ์';

  @override
  String get smartHomeDeviceTypeTv => 'ทีวี';

  @override
  String get smartHomeDeviceTypeSpeaker => 'ลำโพง';

  @override
  String get smartHomeDeviceTypeWatch => 'นาฬิกา';

  @override
  String get smartHomeDeviceTypeDesktop => 'เดสก์ท็อป';

  @override
  String get smartHomeDeviceTypeOther => 'อื่นๆ';

  @override
  String get smartHomeDeviceAdhan => 'การแจ้งเตือนอะซาน';

  @override
  String get smartHomeDeviceAdhanDesc => 'รับการแจ้งเตือนอะซานบนอุปกรณ์นี้';

  @override
  String get smartHomeDeviceVolume => 'ระดับเสียง';

  @override
  String get smartHomeDeviceAudioType => 'ประเภทเสียง';

  @override
  String get smartHomeDeviceEnabledPrayers => 'ละหมาดที่เปิดใช้';

  @override
  String get smartHomeDeviceSettings => 'การตั้งค่าอุปกรณ์';

  @override
  String get smartHomeTesting => 'กำลังทดสอบ...';

  @override
  String get smartHomeTestSuccess => 'ยืนยันการเชื่อมต่อแล้ว';

  @override
  String get smartHomeTestFailed => 'ทดสอบการเชื่อมต่อไม่ผ่าน';

  @override
  String get smartHomePairTv => 'จับคู่ทีวี';

  @override
  String get smartHomePairingTv => 'กำลังลงทะเบียนทีวี...';

  @override
  String get smartHomePairTvSuccess => 'จับคู่ทีวีสำเร็จ';

  @override
  String get smartHomePairTvFailed => 'จับคู่ทีวีไม่สำเร็จ';

  @override
  String get smartHomeLoadingDevices => 'กำลังโหลดอุปกรณ์...';

  @override
  String get smartHomeLoadingIntegrations => 'กำลังโหลดการเชื่อมต่อ...';

  @override
  String get smartHomeServiceUnavailable =>
      'บริการสมาร์ทโฮมไม่พร้อมใช้งานขณะนี้ กรุณาลองอีกครั้งภายหลัง';

  @override
  String adhkarCompletedCount(int completed, int total) {
    return '$completed / $total เสร็จสิ้น';
  }

  @override
  String get adhkarReset => 'รีเซ็ต';

  @override
  String get syncHistoryTitle => 'ประวัติซิงค์';

  @override
  String get syncClearHistory => 'ล้างประวัติ';

  @override
  String get syncNoConflicts =>
      'ไม่พบความขัดแย้งในการซิงค์ อุปกรณ์ทั้งหมดซิงค์กันแล้ว';

  @override
  String get syncDomainSettings => 'การตั้งค่า';

  @override
  String get syncDomainCities => 'เมืองที่บันทึก';

  @override
  String get syncDomainPrayerLogs => 'บันทึกละหมาด';

  @override
  String get syncTimeJustNow => 'เมื่อกี้';

  @override
  String syncTimeMinAgo(int min) {
    return '$min นาทีที่แล้ว';
  }

  @override
  String syncTimeHourAgo(int hour) {
    return '$hour ชม.ที่แล้ว';
  }

  @override
  String syncTimeDayAgo(int day) {
    return '$day วันที่แล้ว';
  }

  @override
  String get pinCity => 'ปักหมุด';

  @override
  String get pinMaxReached =>
      'ปักหมุดได้สูงสุด 5 เมือง อัปเกรดเป็น Ummat+ เพื่อเพิ่ม';

  @override
  String pinCityUnpinned(String city) {
    return 'เลิกปักหมุด $city แล้ว';
  }

  @override
  String get pinUndo => 'เลิกทำ';

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
