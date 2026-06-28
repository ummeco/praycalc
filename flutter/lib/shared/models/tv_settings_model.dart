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

  /// When true, the hadith ticker also rotates in the 99 Names of Allah.
  final bool showAsmaAlHusna;

  /// Slug of a second city to show in a multi-timezone display. Null = off.
  final String? secondCitySlug;

  /// When true, show a live countdown to the next prayer in the prayer list.
  final bool showPrayerCountdown;

  const TvInfoBarConfig({
    this.showHijri = true,
    this.showGregorian = true,
    this.showLocation = true,
    this.showWeather = true,
    this.weatherUnit = 'C',
    this.showMoon = false,
    this.showHadithTicker = false,
    this.showCalendarTicker = false,
    this.showAsmaAlHusna = false,
    this.secondCitySlug,
    this.showPrayerCountdown = true,
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
    bool? showAsmaAlHusna,
    Object? secondCitySlug = _sentinel,
    bool? showPrayerCountdown,
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
      showAsmaAlHusna: showAsmaAlHusna ?? this.showAsmaAlHusna,
      secondCitySlug: secondCitySlug == _sentinel
          ? this.secondCitySlug
          : secondCitySlug as String?,
      showPrayerCountdown: showPrayerCountdown ?? this.showPrayerCountdown,
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
        'showAsmaAlHusna': showAsmaAlHusna,
        'secondCitySlug': secondCitySlug,
        'showPrayerCountdown': showPrayerCountdown,
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
        showAsmaAlHusna: json['showAsmaAlHusna'] as bool? ?? false,
        secondCitySlug: json['secondCitySlug'] as String?,
        showPrayerCountdown: json['showPrayerCountdown'] as bool? ?? true,
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
// Q-1: Rail position (TvPrayerRail)
// ---------------------------------------------------------------------------

/// Which edge of the screen the prayer rail occupies.
enum TvRailPosition { top, bottom, left, right }

// ---------------------------------------------------------------------------
// Q-2: Content cycle types (TvContentCycler)
// ---------------------------------------------------------------------------

/// Identifies a content type that can occupy the content canvas.
enum TvContentType {
  liveStream,
  artSlideshow,
  quranDisplay,
  weather,
  ayahOfHour,
  clock,
  hadithDisplay,
  multiCity,
  googlePhotos,
}

/// A single item in the TV content rotation cycle.
class TvContentItem {
  final TvContentType type;
  final int durationSeconds;
  final bool enabled;

  const TvContentItem({
    required this.type,
    this.durationSeconds = 30,
    this.enabled = true,
  });

  TvContentItem copyWith({
    TvContentType? type,
    int? durationSeconds,
    bool? enabled,
  }) {
    return TvContentItem(
      type: type ?? this.type,
      durationSeconds: durationSeconds ?? this.durationSeconds,
      enabled: enabled ?? this.enabled,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type.name,
        'durationSeconds': durationSeconds,
        'enabled': enabled,
      };

  factory TvContentItem.fromJson(Map<String, dynamic> j) => TvContentItem(
        type: TvContentType.values.firstWhere(
          (e) => e.name == j['type'],
          orElse: () => TvContentType.artSlideshow,
        ),
        durationSeconds: j['durationSeconds'] as int? ?? 30,
        enabled: j['enabled'] as bool? ?? true,
      );
}

/// Default content cycle used when none is configured.
const List<TvContentItem> _kDefaultContentCycle = [
  TvContentItem(type: TvContentType.artSlideshow, durationSeconds: 30, enabled: true),
  TvContentItem(type: TvContentType.ayahOfHour, durationSeconds: 60, enabled: true),
  TvContentItem(type: TvContentType.clock, durationSeconds: 20, enabled: true),
];

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
    this.leftPanel = TvPanelType.liveStream,
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
// U-1: TV color palette (named)
// ---------------------------------------------------------------------------

/// Named color theme for the TV display.
///
/// Resolved to actual [Color] values by [TvColorPalette.forName] in
/// `core/theme/tv_color_palette.dart`.
enum TvColorPaletteName {
  emerald,       // default PrayCalc green
  midnightBlue,  // deep navy + sky blue accent
  warmGold,      // dark brown + warm gold accent
  slate,         // charcoal grey + cool white accent
  desertRose,    // deep burgundy + rose-gold accent
}

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

  /// What to show in the video area of the left panel.
  /// 'live-stream' | 'artwork-cycle' | 'masjid-photos' | 'prayer-only'
  final String videoAreaSource;

  /// Active audio mode for the TV background.
  /// 'stream' = live internet stream audio on, 'silent' = video shown but muted.
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

  /// Latitude of the second city for prayer time computation.
  final double? secondCityLat;

  /// Longitude of the second city for prayer time computation.
  final double? secondCityLng;

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

  /// P-16: Use bundled PrayCalc wallpaper pack instead of MinIO library.
  final bool useBundledWallpapers;

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

  // ---------------------------------------------------------------------------
  // P-17 — Font size scale
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // P-1 — Sky gradient background
  // ---------------------------------------------------------------------------

  /// When true, TvSkyBackground replaces the flat deep-green background.
  final bool skyBackgroundEnabled;

  // ---------------------------------------------------------------------------
  // P-8 — Islamic geometric pattern overlay
  // ---------------------------------------------------------------------------

  /// When true, TvGeometricPattern is rendered behind content.
  final bool geometricPatternEnabled;

  /// Which geometric style to draw: 'moroccanStar' or 'girih'.
  final String geometricPatternStyle;

  /// Font scale multiplier applied to all TV text sizes.
  /// Valid values: 0.8, 1.0, 1.2, 1.4, 1.6. Default 1.0.
  final double tvFontScale;

  // ---------------------------------------------------------------------------
  // P-14 — Good Night Isha mode
  // ---------------------------------------------------------------------------

  /// When true, the screen dims automatically 30 min (or [goodNightDelayMinutes])
  /// after Isha and shows the TvGoodNightOverlay with next Fajr time.
  final bool goodNightEnabled;

  /// Minutes after Isha adhan before Good Night mode activates. Default 30.
  final int goodNightDelayMinutes;

  // ---------------------------------------------------------------------------
  // Q-1 — Prayer rail position
  // ---------------------------------------------------------------------------

  /// Which screen edge the TvPrayerRail occupies.
  final TvRailPosition railPosition;

  // ---------------------------------------------------------------------------
  // Q-2 — Content cycle
  // ---------------------------------------------------------------------------

  /// Ordered list of content items that TvContentCycler rotates through.
  final List<TvContentItem> contentCycle;

  // ---------------------------------------------------------------------------
  // Q-3 — Canvas layout
  // ---------------------------------------------------------------------------

  /// True once the user has customised [contentCycle] from the defaults.
  final bool contentCycleCustomized;

  // ---------------------------------------------------------------------------
  // Y-1 — Children's mode
  // ---------------------------------------------------------------------------

  /// When true, TvChildrenMode replaces the normal home screen.
  final bool childrenModeEnabled;

  // ---------------------------------------------------------------------------
  // U-1 — Color palette
  // ---------------------------------------------------------------------------

  /// Active color palette applied to rail, prayer cards, adhan overlay, etc.
  final TvColorPaletteName colorPalette;

  // ---------------------------------------------------------------------------
  // Stream overlays — ayah bar (top) + Ramadan card (bottom)
  // ---------------------------------------------------------------------------

  /// When true and a stream is active, cycles Quranic ayahs in the top black bar.
  final bool showStreamAyahBar;

  /// When true, Ramadan+Iftar card shows in the bottom black bar during stream mode.
  final bool showStreamRamadanOverlay;
  final bool launchOnBoot;

  // ---------------------------------------------------------------------------
  // SYNC-B2 — Conflict resolution timestamp
  // ---------------------------------------------------------------------------

  /// UTC timestamp of the last local settings mutation. Used to resolve
  /// conflicts when remote and local settings diverge: the more recent
  /// timestamp wins. Null for settings that have never been locally edited.
  final DateTime? lastModified;

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
    this.videoAreaSource = 'live-stream',
    this.tvAudioMode = 'stream',
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
    this.secondCityLat,
    this.secondCityLng,
    this.donationQrMode = 'never',
    this.donationQrUrl,
    this.infoBarConfig = const TvInfoBarConfig(),
    this.nightModeEnabled = true,
    this.currentBrightness = 100,
    this.photoSource = 'library',
    this.useBundledWallpapers = false,
    this.photoCategories = const [],
    this.slideshowDurationSeconds = 30,
    this.slideshowTransition = 'kenburns',
    this.overlayDensity = 'standard',
    this.screensaverIdleSeconds = 300,
    this.customStreams = const [],
    this.skyBackgroundEnabled = false,
    this.geometricPatternEnabled = false,
    this.geometricPatternStyle = 'moroccanStar',
    this.tvFontScale = 1.0,
    this.goodNightEnabled = false,
    this.goodNightDelayMinutes = 30,
    this.railPosition = TvRailPosition.top,
    this.contentCycle = _kDefaultContentCycle,
    this.contentCycleCustomized = false,
    this.childrenModeEnabled = false,
    this.colorPalette = TvColorPaletteName.emerald,
    this.showStreamAyahBar = true,
    this.showStreamRamadanOverlay = true,
    this.launchOnBoot = false,
    this.lastModified,
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
    String? videoAreaSource,
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
    Object? secondCityLat = _sentinel,
    Object? secondCityLng = _sentinel,
    String? donationQrMode,
    Object? donationQrUrl = _sentinel,
    TvInfoBarConfig? infoBarConfig,
    bool? nightModeEnabled,
    int? currentBrightness,
    String? photoSource,
    bool? useBundledWallpapers,
    List<String>? photoCategories,
    int? slideshowDurationSeconds,
    String? slideshowTransition,
    String? overlayDensity,
    int? screensaverIdleSeconds,
    List<TvCustomStream>? customStreams,
    bool? skyBackgroundEnabled,
    bool? geometricPatternEnabled,
    String? geometricPatternStyle,
    double? tvFontScale,
    bool? goodNightEnabled,
    int? goodNightDelayMinutes,
    TvRailPosition? railPosition,
    List<TvContentItem>? contentCycle,
    bool? contentCycleCustomized,
    bool? childrenModeEnabled,
    TvColorPaletteName? colorPalette,
    bool? showStreamAyahBar,
    bool? showStreamRamadanOverlay,
    bool? launchOnBoot,
    Object? lastModified = _sentinel,
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
      videoAreaSource: videoAreaSource ?? this.videoAreaSource,
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
      secondCityLat: secondCityLat == _sentinel
          ? this.secondCityLat
          : secondCityLat as double?,
      secondCityLng: secondCityLng == _sentinel
          ? this.secondCityLng
          : secondCityLng as double?,
      donationQrMode: donationQrMode ?? this.donationQrMode,
      donationQrUrl: donationQrUrl == _sentinel
          ? this.donationQrUrl
          : donationQrUrl as String?,
      infoBarConfig: infoBarConfig ?? this.infoBarConfig,
      nightModeEnabled: nightModeEnabled ?? this.nightModeEnabled,
      currentBrightness: currentBrightness ?? this.currentBrightness,
      photoSource: photoSource ?? this.photoSource,
      useBundledWallpapers: useBundledWallpapers ?? this.useBundledWallpapers,
      photoCategories: photoCategories ?? this.photoCategories,
      slideshowDurationSeconds:
          slideshowDurationSeconds ?? this.slideshowDurationSeconds,
      slideshowTransition: slideshowTransition ?? this.slideshowTransition,
      overlayDensity: overlayDensity ?? this.overlayDensity,
      screensaverIdleSeconds:
          screensaverIdleSeconds ?? this.screensaverIdleSeconds,
      customStreams: customStreams ?? this.customStreams,
      skyBackgroundEnabled: skyBackgroundEnabled ?? this.skyBackgroundEnabled,
      geometricPatternEnabled:
          geometricPatternEnabled ?? this.geometricPatternEnabled,
      geometricPatternStyle:
          geometricPatternStyle ?? this.geometricPatternStyle,
      tvFontScale: tvFontScale ?? this.tvFontScale,
      goodNightEnabled: goodNightEnabled ?? this.goodNightEnabled,
      goodNightDelayMinutes:
          goodNightDelayMinutes ?? this.goodNightDelayMinutes,
      railPosition: railPosition ?? this.railPosition,
      contentCycle: contentCycle ?? this.contentCycle,
      contentCycleCustomized:
          contentCycleCustomized ?? this.contentCycleCustomized,
      childrenModeEnabled: childrenModeEnabled ?? this.childrenModeEnabled,
      colorPalette: colorPalette ?? this.colorPalette,
      showStreamAyahBar: showStreamAyahBar ?? this.showStreamAyahBar,
      showStreamRamadanOverlay:
          showStreamRamadanOverlay ?? this.showStreamRamadanOverlay,
      launchOnBoot: launchOnBoot ?? this.launchOnBoot,
      lastModified: lastModified == _sentinel
          ? this.lastModified
          : lastModified as DateTime?,
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
        'videoAreaSource': videoAreaSource,
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
        'secondCityLat': secondCityLat,
        'secondCityLng': secondCityLng,
        'donationQrMode': donationQrMode,
        'donationQrUrl': donationQrUrl,
        'infoBarConfig': infoBarConfig.toJson(),
        'nightModeEnabled': nightModeEnabled,
        'currentBrightness': currentBrightness,
        'photoSource': photoSource,
        'useBundledWallpapers': useBundledWallpapers,
        'photoCategories': photoCategories,
        'slideshowDurationSeconds': slideshowDurationSeconds,
        'slideshowTransition': slideshowTransition,
        'overlayDensity': overlayDensity,
        'screensaverIdleSeconds': screensaverIdleSeconds,
        'customStreams': customStreams.map((s) => s.toJson()).toList(),
        'skyBackgroundEnabled': skyBackgroundEnabled,
        'geometricPatternEnabled': geometricPatternEnabled,
        'geometricPatternStyle': geometricPatternStyle,
        'tvFontScale': tvFontScale,
        'goodNightEnabled': goodNightEnabled,
        'goodNightDelayMinutes': goodNightDelayMinutes,
        'railPosition': railPosition.name,
        'contentCycle': contentCycle.map((i) => i.toJson()).toList(),
        'contentCycleCustomized': contentCycleCustomized,
        'childrenModeEnabled': childrenModeEnabled,
        'colorPalette': colorPalette.name,
        'showStreamAyahBar': showStreamAyahBar,
        'showStreamRamadanOverlay': showStreamRamadanOverlay,
        'launchOnBoot': launchOnBoot,
        if (lastModified != null)
          'last_modified': lastModified!.toUtc().toIso8601String(),
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
      layoutSettings: TvSettings._parseLayoutSettings(json),
      prayerAlertConfigs: parsePrayerAlertConfigs(
          json['prayerAlertConfigs'] as Map<String, dynamic>?),
      globalAudioMode: parseEnum(TvAudioMode.values,
          json['globalAudioMode'] as String?, TvAudioMode.adhan),
      defaultBubblePosition: parseEnum(TvBubblePosition.values,
          json['defaultBubblePosition'] as String?,
          TvBubblePosition.topRight),
      kioskMode: json['kioskMode'] as bool? ?? false,
      kioskPinHash: json['kioskPinHash'] as String? ?? '',
      videoAreaSource: json['videoAreaSource'] as String? ?? 'live-stream',
      tvAudioMode: json['tvAudioMode'] as String? ?? 'stream',
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
      secondCityLat: (json['secondCityLat'] as num?)?.toDouble(),
      secondCityLng: (json['secondCityLng'] as num?)?.toDouble(),
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
      useBundledWallpapers: json['useBundledWallpapers'] as bool? ?? false,
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
      skyBackgroundEnabled:
          json['skyBackgroundEnabled'] as bool? ?? false,
      geometricPatternEnabled:
          json['geometricPatternEnabled'] as bool? ?? false,
      geometricPatternStyle:
          json['geometricPatternStyle'] as String? ?? 'moroccanStar',
      tvFontScale: (json['tvFontScale'] as num?)?.toDouble() ?? 1.0,
      goodNightEnabled: json['goodNightEnabled'] as bool? ?? false,
      goodNightDelayMinutes: json['goodNightDelayMinutes'] as int? ?? 30,
      railPosition: parseEnum(TvRailPosition.values,
          json['railPosition'] as String?, TvRailPosition.top),
      contentCycle: (json['contentCycle'] as List<dynamic>?)
              ?.map((e) =>
                  TvContentItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          _kDefaultContentCycle,
      contentCycleCustomized:
          json['contentCycleCustomized'] as bool? ?? false,
      childrenModeEnabled:
          json['childrenModeEnabled'] as bool? ?? false,
      colorPalette: parseEnum(TvColorPaletteName.values,
          json['colorPalette'] as String?, TvColorPaletteName.emerald),
      showStreamAyahBar: json['showStreamAyahBar'] as bool? ?? true,
      showStreamRamadanOverlay:
          json['showStreamRamadanOverlay'] as bool? ?? true,
      launchOnBoot: json['launchOnBoot'] as bool? ?? false,
      lastModified: json['last_modified'] != null
          ? DateTime.tryParse(json['last_modified'] as String)?.toUtc()
          : null,
    );
  }

  /// Encode to a JSON string for SharedPreferences storage.
  String encode() => jsonEncode(toJson());

  /// Decode from a JSON string stored in SharedPreferences.
  factory TvSettings.decode(String source) =>
      TvSettings.fromJson(jsonDecode(source) as Map<String, dynamic>);

  /// Resolves layoutSettings from either a nested object or a flat 'layout'
  /// string (sent by the web dashboard). The explicit object always wins.
  static TvLayoutSettings _parseLayoutSettings(Map<String, dynamic> json) {
    if (json['layoutSettings'] is Map<String, dynamic>) {
      return TvLayoutSettings.fromJson(
          json['layoutSettings'] as Map<String, dynamic>);
    }
    final layoutStr = json['layout'] as String?;
    if (layoutStr != null) {
      return TvLayoutSettings.forPreset(_layoutStringToPreset(layoutStr));
    }
    // Legacy fallback: no layout info stored — default to splitStream so
    // existing devices keep showing the stream on the left.
    return TvLayoutSettings.forPreset(TvLayoutPreset.splitStream);
  }

  /// Maps kebab-case layout IDs (from web) to TvLayoutPreset enum values.
  static TvLayoutPreset _layoutStringToPreset(String s) {
    switch (s) {
      case 'split-stream': return TvLayoutPreset.splitStream;
      case 'prayer-only':  return TvLayoutPreset.prayerOnly;
      case 'split-art':    return TvLayoutPreset.splitArt;
      case 'info-rich':    return TvLayoutPreset.infoRich;
      case 'masjid':       return TvLayoutPreset.masjid;
      default:             return TvLayoutPreset.splitStream;
    }
  }
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

  Announcement copyWith({
    String? id,
    String? title,
    String? body,
    Object? expiresAt = _sentinel,
  }) {
    return Announcement(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      expiresAt: expiresAt == _sentinel
          ? this.expiresAt
          : expiresAt as DateTime?,
    );
  }

  /// True when this announcement has expired and should be hidden.
  bool get isExpired =>
      expiresAt != null && DateTime.now().isAfter(expiresAt!);
}
