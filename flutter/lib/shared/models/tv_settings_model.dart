import 'dart:convert';

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
    );
  }

  /// Encode to a JSON string for SharedPreferences storage.
  String encode() => jsonEncode(toJson());

  /// Decode from a JSON string stored in SharedPreferences.
  factory TvSettings.decode(String source) =>
      TvSettings.fromJson(jsonDecode(source) as Map<String, dynamic>);
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
