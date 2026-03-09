import 'dart:convert';

// ---------------------------------------------------------------------------
// TvInfoBarConfig (TV2-2.5)
// ---------------------------------------------------------------------------

/// Configuration for the info bar displayed at the top of the TV home screen.
class TvInfoBarConfig {
  final bool showHijri;
  final bool showGregorian;
  final bool showLocation;
  final bool showWeather;

  /// Temperature unit: 'C', 'F', or 'both'.
  final String weatherUnit;

  final bool showMoon;
  final bool showHadithTicker;
  final bool showCalendarTicker;

  /// Slug of a second city to show in a multi-timezone display. Null = off.
  final String? secondCitySlug;

  const TvInfoBarConfig({
    this.showHijri = true,
    this.showGregorian = true,
    this.showLocation = true,
    this.showWeather = true,
    this.weatherUnit = 'C',
    this.showMoon = false,
    this.showHadithTicker = false,
    this.showCalendarTicker = false,
    this.secondCitySlug,
  });

  TvInfoBarConfig copyWith({
    bool? showHijri,
    bool? showGregorian,
    bool? showLocation,
    bool? showWeather,
    String? weatherUnit,
    bool? showMoon,
    bool? showHadithTicker,
    bool? showCalendarTicker,
    Object? secondCitySlug = _sentinel,
  }) {
    return TvInfoBarConfig(
      showHijri: showHijri ?? this.showHijri,
      showGregorian: showGregorian ?? this.showGregorian,
      showLocation: showLocation ?? this.showLocation,
      showWeather: showWeather ?? this.showWeather,
      weatherUnit: weatherUnit ?? this.weatherUnit,
      showMoon: showMoon ?? this.showMoon,
      showHadithTicker: showHadithTicker ?? this.showHadithTicker,
      showCalendarTicker: showCalendarTicker ?? this.showCalendarTicker,
      secondCitySlug: secondCitySlug == _sentinel
          ? this.secondCitySlug
          : secondCitySlug as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'showHijri': showHijri,
        'showGregorian': showGregorian,
        'showLocation': showLocation,
        'showWeather': showWeather,
        'weatherUnit': weatherUnit,
        'showMoon': showMoon,
        'showHadithTicker': showHadithTicker,
        'showCalendarTicker': showCalendarTicker,
        'secondCitySlug': secondCitySlug,
      };

  factory TvInfoBarConfig.fromJson(Map<String, dynamic> json) =>
      TvInfoBarConfig(
        showHijri: json['showHijri'] as bool? ?? true,
        showGregorian: json['showGregorian'] as bool? ?? true,
        showLocation: json['showLocation'] as bool? ?? true,
        showWeather: json['showWeather'] as bool? ?? true,
        weatherUnit: json['weatherUnit'] as String? ?? 'C',
        showMoon: json['showMoon'] as bool? ?? false,
        showHadithTicker: json['showHadithTicker'] as bool? ?? false,
        showCalendarTicker: json['showCalendarTicker'] as bool? ?? false,
        secondCitySlug: json['secondCitySlug'] as String?,
      );
}

// ---------------------------------------------------------------------------
// Quran playback enums (TV2-4.1)
// ---------------------------------------------------------------------------

/// Playback sequencing mode for the Quran audio service.
enum QuranPlaybackMode { continuous, randomSurah, specificSurah, juzByJuz }

// ---------------------------------------------------------------------------
// Brightness scheduling types (TV2-6.1)
// ---------------------------------------------------------------------------

/// What event triggers a brightness rule.
enum BrightnessTrigger { prayerTime, fixedTime, sunset }

/// A single scheduled brightness change.
class TvBrightnessRule {
  final BrightnessTrigger trigger;

  /// Prayer name (e.g. 'Fajr') — used when [trigger] is [BrightnessTrigger.prayerTime].
  final String? prayerName;

  /// Hour of day 0–23 — used when [trigger] is [BrightnessTrigger.fixedTime].
  final int? fixedHour;

  /// Minute 0–59 — used when [trigger] is [BrightnessTrigger.fixedTime].
  final int? fixedMinute;

  /// Target brightness 0–100. Ignored when [screenOff] is true.
  final int brightnessPercent;

  /// When true the screen is turned off instead of dimmed.
  final bool screenOff;

  const TvBrightnessRule({
    required this.trigger,
    this.prayerName,
    this.fixedHour,
    this.fixedMinute,
    required this.brightnessPercent,
    this.screenOff = false,
  });

  Map<String, dynamic> toJson() => {
        'trigger': trigger.name,
        'prayerName': prayerName,
        'fixedHour': fixedHour,
        'fixedMinute': fixedMinute,
        'brightnessPercent': brightnessPercent,
        'screenOff': screenOff,
      };

  factory TvBrightnessRule.fromJson(Map<String, dynamic> j) =>
      TvBrightnessRule(
        trigger: BrightnessTrigger.values.firstWhere(
          (e) => e.name == j['trigger'],
          orElse: () => BrightnessTrigger.prayerTime,
        ),
        prayerName: j['prayerName'] as String?,
        fixedHour: j['fixedHour'] as int?,
        fixedMinute: j['fixedMinute'] as int?,
        brightnessPercent: j['brightnessPercent'] as int? ?? 80,
        screenOff: j['screenOff'] as bool? ?? false,
      );
}

/// Default brightness schedule applied when none is configured.
const List<TvBrightnessRule> _kDefaultBrightnessSchedule = [
  TvBrightnessRule(
    trigger: BrightnessTrigger.prayerTime,
    prayerName: 'Maghrib',
    brightnessPercent: 50,
  ),
  TvBrightnessRule(
    trigger: BrightnessTrigger.prayerTime,
    prayerName: 'Isha',
    brightnessPercent: 20,
  ),
  TvBrightnessRule(
    trigger: BrightnessTrigger.fixedTime,
    fixedHour: 2,
    fixedMinute: 0,
    brightnessPercent: 0,
    screenOff: true,
  ),
  TvBrightnessRule(
    trigger: BrightnessTrigger.prayerTime,
    prayerName: 'Fajr',
    brightnessPercent: 100,
  ),
];

// ---------------------------------------------------------------------------
// Per-prayer alert config enums (TV2-8.2)
// ---------------------------------------------------------------------------

/// How the alert is displayed for a given prayer.
enum TvAlertMode { full, bubble, none }

/// Audio played when the alert fires.
enum TvAudioMode { adhan, beep, silent }

/// Which corner the bubble appears in.
enum TvBubblePosition { topLeft, topRight, bottomLeft, bottomRight }

/// What to do with other media when the adhan fires.
enum TvMediaAction { pause, duck, nothing }

// ---------------------------------------------------------------------------
// TvPrayerAlertConfig (TV2-8.2)
// ---------------------------------------------------------------------------

/// Per-prayer alert configuration for the TV adhan overlay.
class TvPrayerAlertConfig {
  final TvAlertMode alertMode;
  final TvAudioMode audioMode;
  final TvBubblePosition bubblePosition;
  final int autoDismissSeconds;
  final TvMediaAction mediaAction;

  const TvPrayerAlertConfig({
    this.alertMode = TvAlertMode.full,
    this.audioMode = TvAudioMode.adhan,
    this.bubblePosition = TvBubblePosition.topRight,
    this.autoDismissSeconds = 120,
    this.mediaAction = TvMediaAction.pause,
  });

  TvPrayerAlertConfig copyWith({
    TvAlertMode? alertMode,
    TvAudioMode? audioMode,
    TvBubblePosition? bubblePosition,
    int? autoDismissSeconds,
    TvMediaAction? mediaAction,
  }) {
    return TvPrayerAlertConfig(
      alertMode: alertMode ?? this.alertMode,
      audioMode: audioMode ?? this.audioMode,
      bubblePosition: bubblePosition ?? this.bubblePosition,
      autoDismissSeconds: autoDismissSeconds ?? this.autoDismissSeconds,
      mediaAction: mediaAction ?? this.mediaAction,
    );
  }

  Map<String, dynamic> toJson() => {
        'alertMode': alertMode.name,
        'audioMode': audioMode.name,
        'bubblePosition': bubblePosition.name,
        'autoDismissSeconds': autoDismissSeconds,
        'mediaAction': mediaAction.name,
      };

  factory TvPrayerAlertConfig.fromJson(Map<String, dynamic> json) {
    T parseEnum<T extends Enum>(List<T> values, String? name, T fallback) {
      if (name == null) return fallback;
      return values.firstWhere((e) => e.name == name, orElse: () => fallback);
    }

    return TvPrayerAlertConfig(
      alertMode: parseEnum(
          TvAlertMode.values, json['alertMode'] as String?, TvAlertMode.full),
      audioMode: parseEnum(
          TvAudioMode.values, json['audioMode'] as String?, TvAudioMode.adhan),
      bubblePosition: parseEnum(TvBubblePosition.values,
          json['bubblePosition'] as String?, TvBubblePosition.topRight),
      autoDismissSeconds: json['autoDismissSeconds'] as int? ?? 120,
      mediaAction: parseEnum(TvMediaAction.values,
          json['mediaAction'] as String?, TvMediaAction.pause),
    );
  }
}

/// Default alert configs per prayer (all six, with default values).
const _kDefaultPrayerAlertConfigs = <String, TvPrayerAlertConfig>{
  'Fajr': TvPrayerAlertConfig(),
  'Dhuhr': TvPrayerAlertConfig(),
  'Asr': TvPrayerAlertConfig(),
  'Maghrib': TvPrayerAlertConfig(),
  'Isha': TvPrayerAlertConfig(),
  'Jumuah': TvPrayerAlertConfig(),
};

// ---------------------------------------------------------------------------
// Panel & layout enums
// ---------------------------------------------------------------------------

/// Identifies a content panel that can occupy a layout slot.
enum TvPanelType {
  prayerTimes,
  liveStream,
  artSlideshow,
  weatherFull,
  qiblaCompass,
  moonPhase,
  hadithTicker,
  announcementCrawler,
  quranDisplay,
}

/// Built-in layout presets available to the user.
enum TvLayoutPreset {
  prayerOnly,
  splitStream,
  splitArt,
  infoRich,
  masjid,
}

// ---------------------------------------------------------------------------
// TvLayoutSettings
// ---------------------------------------------------------------------------

/// Describes which panel occupies each slot of the TV display.
class TvLayoutSettings {
  final TvLayoutPreset preset;
  final TvPanelType? leftPanel;
  final TvPanelType? rightPanel;
  final TvPanelType? topBar;
  final TvPanelType? bottomBar;

  const TvLayoutSettings({
    this.preset = TvLayoutPreset.prayerOnly,
    this.leftPanel,
    this.rightPanel,
    this.topBar,
    this.bottomBar,
  });

  TvLayoutSettings copyWith({
    TvLayoutPreset? preset,
    Object? leftPanel = _sentinel,
    Object? rightPanel = _sentinel,
    Object? topBar = _sentinel,
    Object? bottomBar = _sentinel,
  }) {
    return TvLayoutSettings(
      preset: preset ?? this.preset,
      leftPanel:
          leftPanel == _sentinel ? this.leftPanel : leftPanel as TvPanelType?,
      rightPanel: rightPanel == _sentinel
          ? this.rightPanel
          : rightPanel as TvPanelType?,
      topBar: topBar == _sentinel ? this.topBar : topBar as TvPanelType?,
      bottomBar:
          bottomBar == _sentinel ? this.bottomBar : bottomBar as TvPanelType?,
    );
  }

  Map<String, dynamic> toJson() => {
        'preset': preset.name,
        'leftPanel': leftPanel?.name,
        'rightPanel': rightPanel?.name,
        'topBar': topBar?.name,
        'bottomBar': bottomBar?.name,
      };

  factory TvLayoutSettings.fromJson(Map<String, dynamic> json) {
    TvPanelType? panel(String key) {
      final v = json[key] as String?;
      if (v == null) return null;
      return TvPanelType.values.firstWhere(
        (e) => e.name == v,
        orElse: () => TvPanelType.prayerTimes,
      );
    }

    final presetName = json['preset'] as String? ?? 'prayerOnly';
    final preset = TvLayoutPreset.values.firstWhere(
      (e) => e.name == presetName,
      orElse: () => TvLayoutPreset.prayerOnly,
    );

    return TvLayoutSettings(
      preset: preset,
      leftPanel: panel('leftPanel'),
      rightPanel: panel('rightPanel'),
      topBar: panel('topBar'),
      bottomBar: panel('bottomBar'),
    );
  }

  /// Returns default panel configuration for a given preset.
  static TvLayoutSettings forPreset(TvLayoutPreset preset) {
    switch (preset) {
      case TvLayoutPreset.prayerOnly:
        return const TvLayoutSettings(
          preset: TvLayoutPreset.prayerOnly,
          rightPanel: TvPanelType.prayerTimes,
          bottomBar: TvPanelType.hadithTicker,
        );
      case TvLayoutPreset.splitStream:
        return const TvLayoutSettings(
          preset: TvLayoutPreset.splitStream,
          leftPanel: TvPanelType.liveStream,
          rightPanel: TvPanelType.prayerTimes,
        );
      case TvLayoutPreset.splitArt:
        return const TvLayoutSettings(
          preset: TvLayoutPreset.splitArt,
          leftPanel: TvPanelType.artSlideshow,
          rightPanel: TvPanelType.prayerTimes,
          bottomBar: TvPanelType.hadithTicker,
        );
      case TvLayoutPreset.infoRich:
        return const TvLayoutSettings(
          preset: TvLayoutPreset.infoRich,
          leftPanel: TvPanelType.prayerTimes,
          rightPanel: TvPanelType.weatherFull,
          topBar: TvPanelType.announcementCrawler,
          bottomBar: TvPanelType.hadithTicker,
        );
      case TvLayoutPreset.masjid:
        return const TvLayoutSettings(
          preset: TvLayoutPreset.masjid,
          rightPanel: TvPanelType.prayerTimes,
          bottomBar: TvPanelType.announcementCrawler,
        );
    }
  }
}

/// Private sentinel for nullable copyWith fields.
const Object _sentinel = Object();

// ---------------------------------------------------------------------------
// TvSettings
// ---------------------------------------------------------------------------

/// TV-specific settings: masjid mode, iqamah offsets, announcements, ambient.
class TvSettings {
  final bool isMasjidMode;
  final String masjidName;

  /// Prayer name -> minutes after adhan for iqamah.
  final Map<String, int> iqamahOffsets;

  final bool showQrCode;
  final String? qrCodeUrl;

  /// Photo/pattern rotation interval in seconds (30-120).
  final int ambientIntervalSeconds;

  /// Idle time in minutes before ambient mode activates.
  final int ambientIdleMinutes;

  /// Screensaver background mode: 'photo', 'pattern', or 'both'.
  final String screensaverMode;

  /// Photo category filter for screensaver. Empty string = all.
  final String screensaverCategory;

  final List<Announcement> announcements;

  /// Whether to pause other media (YouTube, Netflix, etc.) during adhan on TV.
  final bool mediaPauseEnabled;

  /// Layout preset and panel slot assignments.
  final TvLayoutSettings layoutSettings;

  /// Per-prayer alert configurations (TV2-8.2).
  final Map<String, TvPrayerAlertConfig> prayerAlertConfigs;

  /// Global audio mode applied when no per-prayer override is configured (TV2-8.2).
  final TvAudioMode globalAudioMode;

  /// Default bubble corner position (TV2-8.2).
  final TvBubblePosition defaultBubblePosition;

  /// Whether kiosk mode is active (locks UI, hides settings without PIN).
  final bool kioskMode;

  /// SHA-256 hash of the 4-digit kiosk admin PIN. Empty string = no PIN set.
  final String kioskPinHash;

  // ---------------------------------------------------------------------------
  // TV2-4.3 — audio/stream/Quran fields
  // ---------------------------------------------------------------------------

  /// Active audio mode for the TV background.
  /// 'stream' = live internet stream, 'quran' = sequential Quran ayahs, 'silent' = off.
  final String tvAudioMode;

  /// ID of the selected live stream (from kBuiltInStreams). Default: 'mecca'.
  final String selectedStreamId;

  /// ID of the selected Quran reciter (from kQuranReciters). Default: 'sudais'.
  final String selectedReciterId;

  /// Quran playback sequencing mode (TV2-4.1).
  final QuranPlaybackMode quranPlaybackMode;

  /// Specific surah (1–114) for [QuranPlaybackMode.specificSurah]. Null = not set.
  final int? quranSpecificSurah;

  // ---------------------------------------------------------------------------
  // TV2-6.1 — brightness schedule fields
  // ---------------------------------------------------------------------------

  /// Ordered list of brightness rules applied throughout the day.
  final List<TvBrightnessRule> brightnessSchedule;

  /// Prayer name → brightness % (0–100) applied for 60 min after that prayer's adhan.
  /// Overrides the scheduled level for the post-prayer window.
  final Map<String, int> prayerBrightnessOverrides;

  // ---------------------------------------------------------------------------
  // TV2-9.2 — Jumu'ah khutbah time
  // ---------------------------------------------------------------------------

  /// Hour (0–23) of the Jumu'ah khutbah start time (default 13 = 1 PM).
  final int jumuahKhutbahHour;

  /// Minute (0–59) of the Jumu'ah khutbah start time (default 30).
  final int jumuahKhutbahMinute;

  // ---------------------------------------------------------------------------
  // TV2-9.7 — Second timezone display
  // ---------------------------------------------------------------------------

  /// Display name of the second city shown in the info bar (e.g. "Mecca").
  /// Null means use the default (Mecca).
  final String? secondCitySlug;

  /// IANA timezone identifier for the second city (e.g. "Asia/Riyadh").
  /// Null means use the default (Asia/Riyadh = Mecca time).
  final String? secondCityTimeZone;

  // ---------------------------------------------------------------------------
  // TV2-11.4 — donation QR overlay
  // ---------------------------------------------------------------------------

  /// When to show the donation QR overlay.
  /// 'always' = always visible, 'jumuah' = Fridays only, 'never' = hidden.
  final String donationQrMode;

  /// URL encoded in the donation QR code. Null means not configured.
  final String? donationQrUrl;

  // ---------------------------------------------------------------------------
  // TV2-2.5 — Info bar configuration
  // ---------------------------------------------------------------------------

  /// Configuration for the top info bar content.
  final TvInfoBarConfig infoBarConfig;

  // ---------------------------------------------------------------------------
  // TV2-6.5 — Night mode / current brightness
  // ---------------------------------------------------------------------------

  /// When true, applies a warm color filter when currentBrightness < 30.
  final bool nightModeEnabled;

  /// Current screen brightness 0–100. Updated by TvBrightnessService.
  final int currentBrightness;

  // ---------------------------------------------------------------------------
  // TV2-7.5 — Photo source & categories
  // ---------------------------------------------------------------------------

  /// Photo source mode: 'library' (PrayCalc library) or 'mix'.
  final String photoSource;

  /// Active photo categories. Empty list = all categories.
  final List<String> photoCategories;

  // ---------------------------------------------------------------------------
  // TV2-7.6 — Slideshow timing
  // ---------------------------------------------------------------------------

  /// Duration each photo is shown in seconds (default 30).
  final int slideshowDurationSeconds;

  /// Transition style: 'crossfade', 'kenburns', or 'both' (default 'kenburns').
  final String slideshowTransition;

  // ---------------------------------------------------------------------------
  // TV2-7.8 — Overlay density
  // ---------------------------------------------------------------------------

  /// Overlay density during screensaver: 'minimal', 'standard', or 'full'.
  final String overlayDensity;

  // ---------------------------------------------------------------------------
  // TV2-7.9 — Screensaver idle timeout (seconds)
  // ---------------------------------------------------------------------------

  /// Seconds of inactivity before screensaver starts. 0 = never.
  final int screensaverIdleSeconds;

  // ---------------------------------------------------------------------------
  // TV2-3.5 — Custom streams
  // ---------------------------------------------------------------------------

  /// User-defined streams added via the custom URL dialog.
  final List<TvCustomStream> customStreams;

  const TvSettings({
    this.isMasjidMode = false,
    this.masjidName = '',
    this.iqamahOffsets = const {
      'Fajr': 20,
      'Dhuhr': 15,
      'Asr': 15,
      'Maghrib': 5,
      'Isha': 15,
      'Jumuah': 30,
    },
    this.showQrCode = false,
    this.qrCodeUrl,
    this.ambientIntervalSeconds = 60,
    this.ambientIdleMinutes = 10,
    this.screensaverMode = 'photo',
    this.screensaverCategory = '',
    this.announcements = const [],
    this.mediaPauseEnabled = false,
    this.layoutSettings = const TvLayoutSettings(),
    this.prayerAlertConfigs = _kDefaultPrayerAlertConfigs,
    this.globalAudioMode = TvAudioMode.adhan,
    this.defaultBubblePosition = TvBubblePosition.topRight,
    this.kioskMode = false,
    this.kioskPinHash = '',
    this.tvAudioMode = 'silent',
    this.selectedStreamId = 'mecca',
    this.selectedReciterId = 'sudais',
    this.quranPlaybackMode = QuranPlaybackMode.continuous,
    this.quranSpecificSurah,
    this.brightnessSchedule = _kDefaultBrightnessSchedule,
    this.prayerBrightnessOverrides = const {},
    this.jumuahKhutbahHour = 13,
    this.jumuahKhutbahMinute = 30,
    this.secondCitySlug,
    this.secondCityTimeZone,
    this.donationQrMode = 'never',
    this.donationQrUrl,
    this.infoBarConfig = const TvInfoBarConfig(),
    this.nightModeEnabled = true,
    this.currentBrightness = 100,
    this.photoSource = 'library',
    this.photoCategories = const [],
    this.slideshowDurationSeconds = 30,
    this.slideshowTransition = 'kenburns',
    this.overlayDensity = 'standard',
    this.screensaverIdleSeconds = 300,
    this.customStreams = const [],
  });

  TvSettings copyWith({
    bool? isMasjidMode,
    String? masjidName,
    Map<String, int>? iqamahOffsets,
    bool? showQrCode,
    Object? qrCodeUrl = _sentinel,
    int? ambientIntervalSeconds,
    int? ambientIdleMinutes,
    String? screensaverMode,
    String? screensaverCategory,
    List<Announcement>? announcements,
    bool? mediaPauseEnabled,
    TvLayoutSettings? layoutSettings,
    Map<String, TvPrayerAlertConfig>? prayerAlertConfigs,
    TvAudioMode? globalAudioMode,
    TvBubblePosition? defaultBubblePosition,
    bool? kioskMode,
    String? kioskPinHash,
    String? tvAudioMode,
    String? selectedStreamId,
    String? selectedReciterId,
    QuranPlaybackMode? quranPlaybackMode,
    Object? quranSpecificSurah = _sentinel,
    List<TvBrightnessRule>? brightnessSchedule,
    Map<String, int>? prayerBrightnessOverrides,
    int? jumuahKhutbahHour,
    int? jumuahKhutbahMinute,
    Object? secondCitySlug = _sentinel,
    Object? secondCityTimeZone = _sentinel,
    String? donationQrMode,
    Object? donationQrUrl = _sentinel,
    TvInfoBarConfig? infoBarConfig,
    bool? nightModeEnabled,
    int? currentBrightness,
    String? photoSource,
    List<String>? photoCategories,
    int? slideshowDurationSeconds,
    String? slideshowTransition,
    String? overlayDensity,
    int? screensaverIdleSeconds,
    List<TvCustomStream>? customStreams,
  }) {
    return TvSettings(
      isMasjidMode: isMasjidMode ?? this.isMasjidMode,
      masjidName: masjidName ?? this.masjidName,
      iqamahOffsets: iqamahOffsets ?? this.iqamahOffsets,
      showQrCode: showQrCode ?? this.showQrCode,
      qrCodeUrl:
          qrCodeUrl == _sentinel ? this.qrCodeUrl : qrCodeUrl as String?,
      ambientIntervalSeconds:
          ambientIntervalSeconds ?? this.ambientIntervalSeconds,
      ambientIdleMinutes: ambientIdleMinutes ?? this.ambientIdleMinutes,
      screensaverMode: screensaverMode ?? this.screensaverMode,
      screensaverCategory: screensaverCategory ?? this.screensaverCategory,
      announcements: announcements ?? this.announcements,
      mediaPauseEnabled: mediaPauseEnabled ?? this.mediaPauseEnabled,
      layoutSettings: layoutSettings ?? this.layoutSettings,
      prayerAlertConfigs: prayerAlertConfigs ?? this.prayerAlertConfigs,
      globalAudioMode: globalAudioMode ?? this.globalAudioMode,
      defaultBubblePosition:
          defaultBubblePosition ?? this.defaultBubblePosition,
      kioskMode: kioskMode ?? this.kioskMode,
      kioskPinHash: kioskPinHash ?? this.kioskPinHash,
      tvAudioMode: tvAudioMode ?? this.tvAudioMode,
      selectedStreamId: selectedStreamId ?? this.selectedStreamId,
      selectedReciterId: selectedReciterId ?? this.selectedReciterId,
      quranPlaybackMode: quranPlaybackMode ?? this.quranPlaybackMode,
      quranSpecificSurah: quranSpecificSurah == _sentinel
          ? this.quranSpecificSurah
          : quranSpecificSurah as int?,
      brightnessSchedule: brightnessSchedule ?? this.brightnessSchedule,
      prayerBrightnessOverrides:
          prayerBrightnessOverrides ?? this.prayerBrightnessOverrides,
      jumuahKhutbahHour: jumuahKhutbahHour ?? this.jumuahKhutbahHour,
      jumuahKhutbahMinute: jumuahKhutbahMinute ?? this.jumuahKhutbahMinute,
      secondCitySlug: secondCitySlug == _sentinel
          ? this.secondCitySlug
          : secondCitySlug as String?,
      secondCityTimeZone: secondCityTimeZone == _sentinel
          ? this.secondCityTimeZone
          : secondCityTimeZone as String?,
      donationQrMode: donationQrMode ?? this.donationQrMode,
      donationQrUrl: donationQrUrl == _sentinel
          ? this.donationQrUrl
          : donationQrUrl as String?,
      infoBarConfig: infoBarConfig ?? this.infoBarConfig,
      nightModeEnabled: nightModeEnabled ?? this.nightModeEnabled,
      currentBrightness: currentBrightness ?? this.currentBrightness,
      photoSource: photoSource ?? this.photoSource,
      photoCategories: photoCategories ?? this.photoCategories,
      slideshowDurationSeconds:
          slideshowDurationSeconds ?? this.slideshowDurationSeconds,
      slideshowTransition: slideshowTransition ?? this.slideshowTransition,
      overlayDensity: overlayDensity ?? this.overlayDensity,
      screensaverIdleSeconds:
          screensaverIdleSeconds ?? this.screensaverIdleSeconds,
      customStreams: customStreams ?? this.customStreams,
    );
  }

  Map<String, dynamic> toJson() => {
        'isMasjidMode': isMasjidMode,
        'masjidName': masjidName,
        'iqamahOffsets': iqamahOffsets,
        'showQrCode': showQrCode,
        'qrCodeUrl': qrCodeUrl,
        'ambientIntervalSeconds': ambientIntervalSeconds,
        'ambientIdleMinutes': ambientIdleMinutes,
        'screensaverMode': screensaverMode,
        'screensaverCategory': screensaverCategory,
        'announcements': announcements.map((a) => a.toJson()).toList(),
        'mediaPauseEnabled': mediaPauseEnabled,
        'layoutSettings': layoutSettings.toJson(),
        'prayerAlertConfigs':
            prayerAlertConfigs.map((k, v) => MapEntry(k, v.toJson())),
        'globalAudioMode': globalAudioMode.name,
        'defaultBubblePosition': defaultBubblePosition.name,
        'kioskMode': kioskMode,
        'kioskPinHash': kioskPinHash,
        'tvAudioMode': tvAudioMode,
        'selectedStreamId': selectedStreamId,
        'selectedReciterId': selectedReciterId,
        'quranPlaybackMode': quranPlaybackMode.name,
        'quranSpecificSurah': quranSpecificSurah,
        'brightnessSchedule':
            brightnessSchedule.map((r) => r.toJson()).toList(),
        'prayerBrightnessOverrides': prayerBrightnessOverrides,
        'jumuahKhutbahHour': jumuahKhutbahHour,
        'jumuahKhutbahMinute': jumuahKhutbahMinute,
        'secondCitySlug': secondCitySlug,
        'secondCityTimeZone': secondCityTimeZone,
        'donationQrMode': donationQrMode,
        'donationQrUrl': donationQrUrl,
        'infoBarConfig': infoBarConfig.toJson(),
        'nightModeEnabled': nightModeEnabled,
        'currentBrightness': currentBrightness,
        'photoSource': photoSource,
        'photoCategories': photoCategories,
        'slideshowDurationSeconds': slideshowDurationSeconds,
        'slideshowTransition': slideshowTransition,
        'overlayDensity': overlayDensity,
        'screensaverIdleSeconds': screensaverIdleSeconds,
        'customStreams': customStreams.map((s) => s.toJson()).toList(),
      };

  factory TvSettings.fromJson(Map<String, dynamic> json) {
    T parseEnum<T extends Enum>(List<T> values, String? name, T fallback) {
      if (name == null) return fallback;
      return values.firstWhere((e) => e.name == name, orElse: () => fallback);
    }

    Map<String, TvPrayerAlertConfig> parsePrayerAlertConfigs(
        Map<String, dynamic>? raw) {
      if (raw == null) return _kDefaultPrayerAlertConfigs;
      final result = Map<String, TvPrayerAlertConfig>.from(
          _kDefaultPrayerAlertConfigs);
      raw.forEach((k, v) {
        if (v is Map<String, dynamic>) {
          result[k] = TvPrayerAlertConfig.fromJson(v);
        }
      });
      return result;
    }

    return TvSettings(
      isMasjidMode: json['isMasjidMode'] as bool? ?? false,
      masjidName: json['masjidName'] as String? ?? '',
      iqamahOffsets: (json['iqamahOffsets'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as int)) ??
          const {
            'Fajr': 20,
            'Dhuhr': 15,
            'Asr': 15,
            'Maghrib': 5,
            'Isha': 15,
            'Jumuah': 30,
          },
      showQrCode: json['showQrCode'] as bool? ?? false,
      qrCodeUrl: json['qrCodeUrl'] as String?,
      ambientIntervalSeconds:
          json['ambientIntervalSeconds'] as int? ?? 60,
      ambientIdleMinutes: json['ambientIdleMinutes'] as int? ?? 10,
      screensaverMode: json['screensaverMode'] as String? ?? 'photo',
      screensaverCategory: json['screensaverCategory'] as String? ?? '',
      announcements: (json['announcements'] as List<dynamic>?)
              ?.map((e) =>
                  Announcement.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      mediaPauseEnabled: json['mediaPauseEnabled'] as bool? ?? false,
      layoutSettings: json['layoutSettings'] != null
          ? TvLayoutSettings.fromJson(
              json['layoutSettings'] as Map<String, dynamic>)
          : const TvLayoutSettings(),
      prayerAlertConfigs: parsePrayerAlertConfigs(
          json['prayerAlertConfigs'] as Map<String, dynamic>?),
      globalAudioMode: parseEnum(TvAudioMode.values,
          json['globalAudioMode'] as String?, TvAudioMode.adhan),
      defaultBubblePosition: parseEnum(TvBubblePosition.values,
          json['defaultBubblePosition'] as String?,
          TvBubblePosition.topRight),
      kioskMode: json['kioskMode'] as bool? ?? false,
      kioskPinHash: json['kioskPinHash'] as String? ?? '',
      tvAudioMode: json['tvAudioMode'] as String? ?? 'silent',
      selectedStreamId: json['selectedStreamId'] as String? ?? 'mecca',
      selectedReciterId: json['selectedReciterId'] as String? ?? 'sudais',
      quranPlaybackMode: parseEnum(QuranPlaybackMode.values,
          json['quranPlaybackMode'] as String?, QuranPlaybackMode.continuous),
      quranSpecificSurah: json['quranSpecificSurah'] as int?,
      brightnessSchedule: (json['brightnessSchedule'] as List<dynamic>?)
              ?.map((e) =>
                  TvBrightnessRule.fromJson(e as Map<String, dynamic>))
              .toList() ??
          _kDefaultBrightnessSchedule,
      jumuahKhutbahHour: json['jumuahKhutbahHour'] as int? ?? 13,
      jumuahKhutbahMinute: json['jumuahKhutbahMinute'] as int? ?? 30,
      secondCitySlug: json['secondCitySlug'] as String?,
      secondCityTimeZone: json['secondCityTimeZone'] as String?,
      donationQrMode: json['donationQrMode'] as String? ?? 'never',
      donationQrUrl: json['donationQrUrl'] as String?,
      prayerBrightnessOverrides:
          (json['prayerBrightnessOverrides'] as Map<String, dynamic>?)
                  ?.map((k, v) => MapEntry(k, v as int)) ??
              const {},
      infoBarConfig: json['infoBarConfig'] != null
          ? TvInfoBarConfig.fromJson(
              json['infoBarConfig'] as Map<String, dynamic>)
          : const TvInfoBarConfig(),
      nightModeEnabled: json['nightModeEnabled'] as bool? ?? true,
      currentBrightness: json['currentBrightness'] as int? ?? 100,
      photoSource: json['photoSource'] as String? ?? 'library',
      photoCategories: (json['photoCategories'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      slideshowDurationSeconds:
          json['slideshowDurationSeconds'] as int? ?? 30,
      slideshowTransition:
          json['slideshowTransition'] as String? ?? 'kenburns',
      overlayDensity: json['overlayDensity'] as String? ?? 'standard',
      screensaverIdleSeconds:
          json['screensaverIdleSeconds'] as int? ?? 300,
      customStreams: (json['customStreams'] as List<dynamic>?)
              ?.map((e) =>
                  TvCustomStream.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  /// Encode to a JSON string for SharedPreferences storage.
  String encode() => jsonEncode(toJson());

  /// Decode from a JSON string stored in SharedPreferences.
  factory TvSettings.decode(String source) =>
      TvSettings.fromJson(jsonDecode(source) as Map<String, dynamic>);
}

// ---------------------------------------------------------------------------
// TvCustomStream (TV2-3.5)
// ---------------------------------------------------------------------------

/// A user-defined stream added via the custom URL dialog.
class TvCustomStream {
  final String id;
  final String name;
  final String url;

  const TvCustomStream({
    required this.id,
    required this.name,
    required this.url,
  });

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'url': url};

  factory TvCustomStream.fromJson(Map<String, dynamic> j) => TvCustomStream(
        id: j['id'] as String,
        name: j['name'] as String,
        url: j['url'] as String,
      );
}

/// A single announcement displayed in masjid mode.
class Announcement {
  final String id;
  final String title;
  final String body;
  final DateTime? expiresAt;

  const Announcement({
    required this.id,
    required this.title,
    required this.body,
    this.expiresAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'expiresAt': expiresAt?.toIso8601String(),
      };

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'] as String)
          : null,
    );
  }

  /// True when this announcement has expired and should be hidden.
  bool get isExpired =>
      expiresAt != null && DateTime.now().isAfter(expiresAt!);
}
