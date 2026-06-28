import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/providers/settings_provider.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/tv_launcher_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';
import 'tv_info_bar_configurator.dart';
import 'tv_kiosk_gate.dart' show isLayoutLocked;

/// TV settings screen, fully D-pad navigable.
class TvSettingsScreen extends ConsumerStatefulWidget {
  const TvSettingsScreen({super.key});

  @override
  ConsumerState<TvSettingsScreen> createState() => _TvSettingsScreenState();
}

class _TvSettingsScreenState extends ConsumerState<TvSettingsScreen> {
  final _masjidNameController = TextEditingController();
  final _qrUrlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final tvSettings = ref.read(tvSettingsProvider);
      _masjidNameController.text = tvSettings.masjidName;
      _qrUrlController.text = tvSettings.qrCodeUrl ?? '';
    });
  }

  @override
  void dispose() {
    _masjidNameController.dispose();
    _qrUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    final tvSettings = ref.watch(tvSettingsProvider);
    final tvNotifier = ref.read(tvSettingsProvider.notifier);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: Text(
          l.tvSettingsTitle,
          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 32),
          onPressed: () => context.pop(),
        ),
      ),
      body: FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
          children: [
            // ── Layout (TV2-11.3: locked to masjid in kiosk mode) ──
            _SectionHeader(title: 'Layout'),
            const SizedBox(height: 8),
            Tooltip(
              message: isLayoutLocked(tvSettings)
                  ? 'Layout locked — change via remote dashboard'
                  : '',
              child: _TvSettingsTile(
                icon: Icons.dashboard,
                title: 'Layout Preset',
                subtitle: isLayoutLocked(tvSettings)
                    ? 'Masjid (locked)'
                    : _layoutPresetLabel(tvSettings.layoutSettings.preset),
                trailing: isLayoutLocked(tvSettings)
                    ? const Icon(Icons.lock_outline, color: Colors.white24, size: 28)
                    : const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
                // Grey out tile when kiosk mode locks the layout.
                onTap: isLayoutLocked(tvSettings)
                    ? null
                    : () => _showLayoutPresetDialog(context, tvNotifier, tvSettings),
              ),
            ),
            const SizedBox(height: 8),
            // P-17 — Font size scale
            _TvSettingsTile(
              icon: Icons.text_fields,
              title: 'Font Size',
              subtitle: _fontScaleLabel(tvSettings.tvFontScale),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () => _showFontScaleDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 24),

            // ── Info Bar (TV2-2.5) ──
            _SectionHeader(title: 'Info Bar'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.view_compact,
              title: 'Configure Info Bar',
              subtitle: _infoBarSummary(tvSettings.infoBarConfig),
              trailing: const Icon(Icons.chevron_right,
                  color: Colors.white54, size: 32),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                    builder: (_) => const TvInfoBarConfigurator()),
              ),
            ),
            const SizedBox(height: 24),

            // ── Second Timezone (TV2-9.7) ──
            _SectionHeader(title: 'Second City Time'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.public,
              title: 'Show Second City Time',
              subtitle: 'Display a second city\'s clock in the info bar',
              trailing: Switch(
                value: tvSettings.secondCitySlug != null &&
                    tvSettings.secondCitySlug!.isNotEmpty,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) {
                  if (v) {
                    // Default to Mecca when enabling
                    tvNotifier.setSecondCity(
                        'mecca', 'Asia/Riyadh', 21.3891, 39.8579);
                  } else {
                    tvNotifier.setSecondCity(null, null, null, null);
                  }
                },
              ),
              onTap: () {
                final active = tvSettings.secondCitySlug != null &&
                    tvSettings.secondCitySlug!.isNotEmpty;
                if (active) {
                  tvNotifier.setSecondCity(null, null, null, null);
                } else {
                  tvNotifier.setSecondCity(
                      'mecca', 'Asia/Riyadh', 21.3891, 39.8579);
                }
              },
            ),
            if (tvSettings.secondCitySlug != null &&
                tvSettings.secondCitySlug!.isNotEmpty) ...[
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.location_city,
                title: 'Second City',
                subtitle: _secondCityLabel(tvSettings.secondCitySlug!),
                trailing: const Icon(Icons.chevron_right,
                    color: Colors.white54, size: 32),
                onTap: () => _showSecondCityDialog(
                    context, tvNotifier, tvSettings),
              ),
            ],
            const SizedBox(height: 24),

            // ── Display Mode ──
            _SectionHeader(title: l.tvDisplayMode),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.mosque,
              title: l.tvMasjidMode,
              subtitle: l.tvMasjidModeSubtitle,
              trailing: Switch(
                value: tvSettings.isMasjidMode,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) => tvNotifier.setMasjidMode(v),
              ),
              onTap: () =>
                  tvNotifier.setMasjidMode(!tvSettings.isMasjidMode),
            ),
            if (tvSettings.isMasjidMode) ...[
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.edit,
                title: l.tvMasjidName,
                subtitle: tvSettings.masjidName.isNotEmpty
                    ? tvSettings.masjidName
                    : l.tvMasjidNameTapToSet,
                onTap: () => _showTextDialog(
                  context: context,
                  title: l.tvMasjidName,
                  controller: _masjidNameController,
                  onSave: (v) => tvNotifier.setMasjidName(v),
                ),
              ),
            ],
            const SizedBox(height: 24),

            // ── Audio & Streams ──
            _SectionHeader(title: 'Audio & Streams'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.volume_up,
              title: 'Background Audio',
              subtitle: _audioModeLabel(tvSettings.tvAudioMode),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () => _showAudioModeDialog(context, tvNotifier, tvSettings),
            ),
            if (tvSettings.tvAudioMode == 'stream') ...[
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.radio,
                title: 'Stream Source',
                subtitle: tvSettings.selectedStreamId.isNotEmpty
                    ? tvSettings.selectedStreamId
                    : 'Mecca Live',
                trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
                onTap: () => _showStreamSourceDialog(context, tvNotifier, tvSettings),
              ),
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.link,
                title: 'Custom Stream URL',
                subtitle: tvSettings.customStreams.isNotEmpty
                    ? tvSettings.customStreams.last.url
                    : 'Enter an HLS or MP4 URL',
                trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
                onTap: () =>
                    _showCustomStreamUrlDialog(context, tvNotifier, tvSettings),
              ),
            ],
            if (tvSettings.tvAudioMode == 'quran') ...[
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.menu_book,
                title: 'Reciter',
                subtitle: tvSettings.selectedReciterId.isNotEmpty
                    ? tvSettings.selectedReciterId
                    : 'Al-Sudais',
                trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
                onTap: () => _showReciterDialog(context, tvNotifier, tvSettings),
              ),
              // TV2-4.5 — Playback mode
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.playlist_play,
                title: 'Playback Mode',
                subtitle: _quranPlaybackModeLabel(tvSettings.quranPlaybackMode),
                trailing: const Icon(Icons.chevron_right,
                    color: Colors.white54, size: 32),
                onTap: () => _showQuranPlaybackModeDialog(
                    context, tvNotifier, tvSettings),
              ),
            ],
            const SizedBox(height: 24),

            // ── Clock ──
            _SectionHeader(title: l.tvClock),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.access_time,
              title: l.tv24hFormat,
              trailing: Switch(
                value: settings.use24h,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) =>
                    ref.read(settingsProvider.notifier).setUse24h(v),
              ),
              onTap: () => ref
                  .read(settingsProvider.notifier)
                  .setUse24h(!settings.use24h),
            ),
            const SizedBox(height: 24),

            // ── Iqamah Offsets ──
            if (tvSettings.isMasjidMode) ...[
              _SectionHeader(title: l.tvIqamahOffsets),
              const SizedBox(height: 8),
              ..._buildIqamahSliders(l, tvNotifier),
              const SizedBox(height: 24),
            ],

            // ── QR Code ──
            if (tvSettings.isMasjidMode) ...[
              _SectionHeader(title: l.tvQrCode),
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.qr_code,
                title: l.tvShowQrCode,
                subtitle: l.tvShowQrCodeSubtitle,
                trailing: Switch(
                  value: tvSettings.showQrCode,
                  activeThumbColor: PrayCalcColors.mid,
                  onChanged: (v) => tvNotifier.setShowQrCode(v),
                ),
                onTap: () =>
                    tvNotifier.setShowQrCode(!tvSettings.showQrCode),
              ),
              if (tvSettings.showQrCode) ...[
                const SizedBox(height: 8),
                _TvSettingsTile(
                  icon: Icons.link,
                  title: l.tvQrCodeUrl,
                  subtitle: tvSettings.qrCodeUrl ?? l.tvMasjidNameTapToSet,
                  onTap: () => _showTextDialog(
                    context: context,
                    title: l.tvQrCodeUrl,
                    controller: _qrUrlController,
                    onSave: (v) => tvNotifier.setQrCodeUrl(v),
                  ),
                ),
              ],
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.qr_code_2,
                title: 'Share Prayer Times (QR)',
                subtitle: 'Generate a 24h QR code guests can scan to view prayer times',
                trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
                onTap: () => _showGuestQrDialog(context, settings),
              ),
              const SizedBox(height: 24),
            ],

            // ── Screensaver (TV2-7.5 / TV2-7.6 / TV2-7.8 / TV2-7.9 / P-15) ──
            _SectionHeader(title: 'Screensaver'),
            const SizedBox(height: 8),
            // P-15 — Screensaver mode
            _TvSettingsTile(
              icon: Icons.nights_stay,
              title: 'Screensaver Mode',
              subtitle: _screensaverModeLabel(tvSettings.screensaverMode),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () => _showScreensaverModeDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 8),
            // P-16 — Bundled wallpapers toggle
            _TvSettingsTile(
              icon: Icons.photo_album,
              title: 'Use PrayCalc Wallpapers',
              subtitle: tvSettings.useBundledWallpapers
                  ? 'Bundled mosque & nature photos'
                  : 'Stream from cloud library',
              trailing: Switch(
                value: tvSettings.useBundledWallpapers,
                onChanged: (v) => tvNotifier.setUseBundledWallpapers(v),
                activeThumbColor: PrayCalcColors.light,
              ),
              onTap: () => tvNotifier
                  .setUseBundledWallpapers(!tvSettings.useBundledWallpapers),
            ),
            const SizedBox(height: 8),
            // TV2-7.5 — Photo source
            _TvSettingsTile(
              icon: Icons.wallpaper,
              title: 'Photo Source',
              subtitle: _photoSourceLabel(tvSettings.photoSource),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () => _showPhotoSourceV2Dialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 8),
            // TV2-7.5 — Category checkboxes
            _TvSettingsTile(
              icon: Icons.photo_library,
              title: l.tvPhotoCategory,
              subtitle: _photoCategoriesLabel(tvSettings.photoCategories),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () =>
                  _showPhotoCategoriesDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 8),
            // TV2-7.6 — Photo duration
            _TvSettingsTile(
              icon: Icons.rotate_right,
              title: 'Photo Duration',
              subtitle: _slideshowDurationLabel(
                  tvSettings.slideshowDurationSeconds),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () =>
                  _showSlideshowDurationDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 8),
            // TV2-7.6 — Transition style
            _TvSettingsTile(
              icon: Icons.animation,
              title: 'Transition',
              subtitle:
                  _slideshowTransitionLabel(tvSettings.slideshowTransition),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () => _showSlideshowTransitionDialog(
                  context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 8),
            // TV2-7.8 — Overlay density
            _TvSettingsTile(
              icon: Icons.layers,
              title: 'Overlay Density',
              subtitle: _overlayDensityLabel(tvSettings.overlayDensity),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () =>
                  _showOverlayDensityDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 8),
            // TV2-7.9 — Screensaver idle timeout
            _TvSettingsTile(
              icon: Icons.timer,
              title: 'Screensaver Starts After',
              subtitle:
                  _screensaverIdleLabel(tvSettings.screensaverIdleSeconds),
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () =>
                  _showScreensaverIdleDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 24),

            // ── Brightness (TV2-6.4 / TV2-6.5 / TV2-6.7) ──
            _SectionHeader(title: 'Brightness'),
            const SizedBox(height: 8),
            // P-8 — Islamic geometric pattern
            _TvSettingsTile(
              icon: Icons.blur_on,
              title: 'Geometric Pattern',
              subtitle: tvSettings.geometricPatternEnabled
                  ? _geometricStyleLabel(tvSettings.geometricPatternStyle)
                  : 'Off — Islamic pattern overlay',
              trailing: Switch(
                value: tvSettings.geometricPatternEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) =>
                    tvNotifier.setGeometricPatternEnabled(v),
              ),
              onTap: () {
                if (tvSettings.geometricPatternEnabled) {
                  _showGeometricStyleDialog(
                      context, tvNotifier, tvSettings);
                } else {
                  tvNotifier.setGeometricPatternEnabled(true);
                }
              },
            ),
            const SizedBox(height: 8),
            // P-1 — Sky gradient background
            _TvSettingsTile(
              icon: Icons.gradient,
              title: 'Sky Background',
              subtitle: 'Time-of-day gradient with stars at night',
              trailing: Switch(
                value: tvSettings.skyBackgroundEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) => tvNotifier.setSkyBackgroundEnabled(v),
              ),
              onTap: () => tvNotifier
                  .setSkyBackgroundEnabled(!tvSettings.skyBackgroundEnabled),
            ),
            const SizedBox(height: 8),
            // Y-1 — Children's mode
            _TvSettingsTile(
              icon: Icons.child_care,
              title: "Children's Mode",
              subtitle: 'Kid-friendly display with prayer explanations',
              trailing: Switch(
                value: tvSettings.childrenModeEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) => tvNotifier.setChildrenModeEnabled(v),
              ),
              onTap: () => tvNotifier
                  .setChildrenModeEnabled(!tvSettings.childrenModeEnabled),
            ),
            const SizedBox(height: 8),
            // P-14 — Good Night Isha mode
            _TvSettingsTile(
              icon: Icons.nightlight_round,
              title: 'Good Night Mode',
              subtitle: 'Dim screen ${tvSettings.goodNightDelayMinutes} min after Isha',
              trailing: Switch(
                value: tvSettings.goodNightEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) => tvNotifier.setGoodNightEnabled(v),
              ),
              onTap: () => tvNotifier
                  .setGoodNightEnabled(!tvSettings.goodNightEnabled),
            ),
            const SizedBox(height: 8),
            // TV2-6.5 — Night mode
            _TvSettingsTile(
              icon: Icons.bedtime,
              title: 'Night Mode',
              subtitle: 'Warm colour filter when brightness < 30%',
              trailing: Switch(
                value: tvSettings.nightModeEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) => tvNotifier.setNightModeEnabled(v),
              ),
              onTap: () =>
                  tvNotifier.setNightModeEnabled(!tvSettings.nightModeEnabled),
            ),
            const SizedBox(height: 8),
            // TV2-6.4 — Brightness schedule list
            _SectionHeader(title: 'Brightness Schedule'),
            const SizedBox(height: 8),
            ...tvSettings.brightnessSchedule.asMap().entries.map((entry) {
              final idx = entry.key;
              final rule = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _TvSettingsTile(
                  icon: Icons.brightness_medium,
                  title: _brightnessRuleTitle(rule),
                  subtitle: rule.screenOff
                      ? 'Screen off'
                      : '${rule.brightnessPercent}% brightness',
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline,
                        color: Colors.white38, size: 28),
                    onPressed: () {
                      final updated = [...tvSettings.brightnessSchedule];
                      updated.removeAt(idx);
                      tvNotifier.setBrightnessSchedule(updated);
                    },
                  ),
                  onTap: null,
                ),
              );
            }),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.add_circle_outline,
              title: 'Add Rule',
              subtitle: 'Schedule a brightness change',
              trailing: const Icon(Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: () =>
                  _showAddBrightnessRuleDialog(context, tvNotifier, tvSettings),
            ),
            const SizedBox(height: 16),
            // TV2-6.7 — Per-prayer brightness overrides
            _SectionHeader(title: 'Prayer Brightness Overrides'),
            const SizedBox(height: 8),
            ..._buildPrayerBrightnessOverrides(tvNotifier, tvSettings),
            const SizedBox(height: 24),

            // ── Launcher ──
            _SectionHeader(title: 'Launcher'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.home,
              title: 'Set as Home Launcher',
              subtitle: 'PrayCalc becomes the default TV home screen',
              trailing: Switch(
                value: tvSettings.kioskMode,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) async {
                  if (v) {
                    await TvLauncherService.enableLauncher();
                  } else {
                    await TvLauncherService.disableLauncher();
                  }
                  tvNotifier.setKioskMode(v);
                },
              ),
              onTap: () async {
                final next = !tvSettings.kioskMode;
                if (next) {
                  await TvLauncherService.enableLauncher();
                } else {
                  await TvLauncherService.disableLauncher();
                }
                tvNotifier.setKioskMode(next);
              },
            ),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.power_settings_new,
              title: 'Launch on Boot',
              subtitle: 'Start PrayCalc automatically when the TV turns on',
              trailing: Switch(
                value: tvSettings.launchOnBoot,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: tvNotifier.setLaunchOnBoot,
              ),
              onTap: () => tvNotifier.setLaunchOnBoot(!tvSettings.launchOnBoot),
            ),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.flash_on,
              title: 'Fast Launch Mode',
              subtitle:
                  'Triple-press Back at any time to return to the stock launcher',
              onTap: null,
            ),
            const SizedBox(height: 24),

            // ── Location ──
            _SectionHeader(title: l.tvLocation),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.location_city,
              title: l.tvChangeCity,
              subtitle: l.tvChangeCitySubtitle,
              trailing: const Icon(
                Icons.chevron_right,
                color: Colors.white54,
                size: 32,
              ),
              onTap: () => context.push(Routes.citySearch),
            ),
            const SizedBox(height: 24),

            // ── Language ──
            _SectionHeader(title: l.commonLanguage),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.language,
              title: l.commonLanguage,
              subtitle: _languageLabel(l, settings.locale),
              trailing: const Icon(
                Icons.chevron_right,
                color: Colors.white54,
                size: 32,
              ),
              onTap: () => _showLanguageDialog(context, l),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildIqamahSliders(
    AppLocalizations l,
    TvSettingsNotifier tvNotifier,
  ) {
    final tvSettings = ref.read(tvSettingsProvider);
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return prayers.map((prayer) {
      final offset = tvSettings.iqamahOffsets[prayer] ?? 15;
      return Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: _TvSettingsTile(
          icon: Icons.schedule,
          title: prayer,
          subtitle: l.tvIqamahMinAfter(offset),
          trailing: _CompactSlider(
            value: offset.toDouble(),
            min: 0,
            max: 60,
            divisions: 60,
            label: '$offset min',
            onChanged: (v) =>
                tvNotifier.setIqamahOffset(prayer, v.round()),
          ),
        ),
      );
    }).toList();
  }

  // ── Layout helpers ──────────────────────────────────────────────────────────

  // ── P-8: Geometric pattern helpers ─────────────────────────────────────────

  String _geometricStyleLabel(String style) => switch (style) {
    'girih' => 'Girih Tiling',
    'muqarnas' => 'Muqarnas',
    'kufic' => 'Kufic Square',
    'isometric' => 'Isometric Cubes',
    _ => 'Moroccan Star',
  };

  void _showGeometricStyleDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      ('moroccanStar', 'Moroccan Star'),
      ('girih', 'Girih Tiling'),
      ('muqarnas', 'Muqarnas'),
      ('kufic', 'Kufic Square'),
      ('isometric', 'Isometric Cubes'),
    ];
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Pattern Style',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected = tvSettings.geometricPatternStyle == opt.$1;
            return Focus(
              onKeyEvent: (_, event) {
                if (event is KeyDownEvent &&
                    (event.logicalKey == LogicalKeyboardKey.select ||
                        event.logicalKey == LogicalKeyboardKey.enter)) {
                  tvNotifier.setGeometricPatternStyle(opt.$1);
                  Navigator.of(ctx).pop();
                  return KeyEventResult.handled;
                }
                return KeyEventResult.ignored;
              },
              child: ListTile(
                title: Text(opt.$2,
                    style: TextStyle(
                      color: isSelected
                          ? PrayCalcColors.light
                          : Colors.white70,
                      fontSize: 24,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                    )),
                trailing: isSelected
                    ? const Icon(Icons.check,
                        color: PrayCalcColors.light, size: 28)
                    : null,
                onTap: () {
                  tvNotifier.setGeometricPatternStyle(opt.$1);
                  Navigator.of(ctx).pop();
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── P-17: Font scale helpers ────────────────────────────────────────────────

  String _fontScaleLabel(double scale) {
    if (scale <= 0.85) return 'Small (80%)';
    if (scale <= 0.95) return 'Compact (90%)';
    if (scale <= 1.05) return 'Normal (100%)';
    if (scale <= 1.15) return 'Large (120%)';
    if (scale <= 1.35) return 'X-Large (140%)';
    return 'XX-Large (160%)';
  }

  void _showFontScaleDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      (0.8, 'Small (80%)'),
      (1.0, 'Normal (100%)'),
      (1.2, 'Large (120%)'),
      (1.4, 'X-Large (140%)'),
      (1.6, 'XX-Large (160%)'),
    ];
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Font Size',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected =
                (tvSettings.tvFontScale - opt.$1).abs() < 0.05;
            return Focus(
              onKeyEvent: (_, event) {
                if (event is KeyDownEvent &&
                    (event.logicalKey == LogicalKeyboardKey.select ||
                        event.logicalKey == LogicalKeyboardKey.enter)) {
                  tvNotifier.setTvFontScale(opt.$1);
                  Navigator.of(ctx).pop();
                  return KeyEventResult.handled;
                }
                return KeyEventResult.ignored;
              },
              child: ListTile(
                title: Text(opt.$2,
                    style: TextStyle(
                      color: isSelected
                          ? PrayCalcColors.light
                          : Colors.white70,
                      fontSize: 24,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                    )),
                trailing: isSelected
                    ? const Icon(Icons.check,
                        color: PrayCalcColors.light, size: 28)
                    : null,
                onTap: () {
                  tvNotifier.setTvFontScale(opt.$1);
                  Navigator.of(ctx).pop();
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  String _layoutPresetLabel(TvLayoutPreset preset) {
    switch (preset) {
      case TvLayoutPreset.prayerOnly:
        return 'Prayer Only';
      case TvLayoutPreset.splitStream:
        return 'Split + Stream';
      case TvLayoutPreset.splitArt:
        return 'Split + Art';
      case TvLayoutPreset.infoRich:
        return 'Info Rich';
      case TvLayoutPreset.masjid:
        return 'Masjid';
    }
  }

  void _showLayoutPresetDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    final options = [
      (TvLayoutPreset.prayerOnly, 'Prayer Only',
          'Prayer times panel + hadith ticker'),
      (TvLayoutPreset.splitStream, 'Split + Stream',
          'Live stream left, prayer times right'),
      (TvLayoutPreset.splitArt, 'Split + Art',
          'Art slideshow left, prayer times right'),
      (TvLayoutPreset.infoRich, 'Info Rich',
          'Prayer times + weather + crawlers'),
      (TvLayoutPreset.masjid, 'Masjid',
          'Prayer times + announcement crawl'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Layout Preset',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: options.map((opt) {
              final isSelected =
                  tvSettings.layoutSettings.preset == opt.$1;
              return _LanguageOption(
                label: '${opt.$2}\n${opt.$3}',
                isSelected: isSelected,
                onTap: () {
                  tvNotifier.setLayoutSettings(
                      TvLayoutSettings.forPreset(opt.$1));
                  Navigator.of(ctx).pop();
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  // ── Second Timezone helpers (TV2-9.7) ────────────────────────────────────────

  /// Well-known city slugs with display name and IANA timezone.
  // (slug, label, timezone, lat, lng)
  static const _kSecondCities = [
    ('mecca', 'Mecca', 'Asia/Riyadh', 21.3891, 39.8579),
    ('medina', 'Medina', 'Asia/Riyadh', 24.5247, 39.5692),
    ('istanbul', 'Istanbul', 'Europe/Istanbul', 41.0082, 28.9784),
    ('cairo', 'Cairo', 'Africa/Cairo', 30.0444, 31.2357),
    ('karachi', 'Karachi', 'Asia/Karachi', 24.8607, 67.0011),
    ('jakarta', 'Jakarta', 'Asia/Jakarta', -6.2088, 106.8456),
    ('london', 'London', 'Europe/London', 51.5074, -0.1278),
    ('new-york', 'New York', 'America/New_York', 40.7128, -74.0060),
    ('dubai', 'Dubai', 'Asia/Dubai', 25.2048, 55.2708),
    ('kuala-lumpur', 'Kuala Lumpur', 'Asia/Kuala_Lumpur', 3.1390, 101.6869),
  ];

  String _secondCityLabel(String slug) {
    for (final c in _kSecondCities) {
      if (c.$1 == slug) return c.$2;
    }
    return slug;
  }

  void _showSecondCityDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.deep,
        title: const Text('Second City',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: _kSecondCities.map((city) {
              final isSelected = tvSettings.secondCitySlug == city.$1;
              return _LanguageOption(
                label: city.$2,
                isSelected: isSelected,
                onTap: () {
                  tvNotifier.setSecondCity(city.$1, city.$3, city.$4, city.$5);
                  Navigator.of(ctx).pop();
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  // ── Audio & Streams helpers ──────────────────────────────────────────────────

  String _audioModeLabel(String mode) {
    switch (mode) {
      case 'stream':
        return 'Live Stream';
      case 'quran':
        return 'Quran Recitation';
      case 'silent':
      default:
        return 'Silent';
    }
  }

  void _showAudioModeDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    final options = [
      ('silent', 'Silent', Icons.volume_off),
      ('stream', 'Live Stream', Icons.radio),
      ('quran', 'Quran Recitation', Icons.menu_book),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Background Audio',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected = tvSettings.tvAudioMode == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setTvAudioMode(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showStreamSourceDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const streams = [
      ('mecca', 'Mecca Live — Masjid al-Haram'),
      ('medina', 'Medina Live — Masjid an-Nabawi'),
      ('quds', 'Al-Quds — Masjid al-Aqsa'),
      ('azhar', 'Al-Azhar Mosque'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Stream Source',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: streams.map((s) {
              final isSelected = tvSettings.selectedStreamId == s.$1;
              return _LanguageOption(
                label: s.$2,
                isSelected: isSelected,
                onTap: () {
                  tvNotifier.setSelectedStreamId(s.$1);
                  Navigator.of(ctx).pop();
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  void _showCustomStreamUrlDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    final controller = TextEditingController(
      text: tvSettings.customStreams.isNotEmpty
          ? tvSettings.customStreams.last.url
          : '',
    );
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text(
          'Custom Stream URL',
          style: TextStyle(color: Colors.white, fontSize: 28),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter an HLS (.m3u8) or MP4 URL',
              style: TextStyle(color: Colors.white54, fontSize: 18),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              autofocus: true,
              style: const TextStyle(color: Colors.white, fontSize: 20),
              decoration: InputDecoration(
                hintText: 'https://example.com/stream.m3u8',
                hintStyle: const TextStyle(color: Colors.white38),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: PrayCalcColors.mid),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: PrayCalcColors.light, width: 2),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel',
                style: TextStyle(color: Colors.white54, fontSize: 20)),
          ),
          TextButton(
            onPressed: () {
              final url = controller.text.trim();
              if (url.isNotEmpty) {
                final stream = TvCustomStream(
                  id: 'custom_${DateTime.now().millisecondsSinceEpoch}',
                  name: 'Custom Stream',
                  url: url,
                );
                // Replace previous custom entry (keep only latest).
                final updated = tvSettings.customStreams
                    .where((s) => !s.id.startsWith('custom_'))
                    .toList()
                  ..add(stream);
                tvNotifier.update(
                    tvSettings.copyWith(customStreams: updated));
              }
              Navigator.of(ctx).pop();
            },
            child: const Text('Save',
                style: TextStyle(color: PrayCalcColors.light, fontSize: 20)),
          ),
        ],
      ),
    ).then((_) => controller.dispose());
  }

  void _showReciterDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const reciters = [
      ('sudais', 'Abdul Rahman Al-Sudais'),
      ('shuraim', 'Saud Al-Shuraim'),
      ('ghamdi', 'Saad Al-Ghamdi'),
      ('minshawi', 'Mohamed Siddiq Al-Minshawi'),
      ('husary', 'Mahmoud Khalil Al-Husary'),
      ('alafasy', 'Mishary Rashid Alafasy'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Select Reciter',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: reciters.map((r) {
              final isSelected = tvSettings.selectedReciterId == r.$1;
              return _LanguageOption(
                label: r.$2,
                isSelected: isSelected,
                onTap: () {
                  tvNotifier.setSelectedReciterId(r.$1);
                  Navigator.of(ctx).pop();
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  // ── Quran playback mode helpers (TV2-4.5) ────────────────────────────────────

  String _quranPlaybackModeLabel(QuranPlaybackMode mode) {
    switch (mode) {
      case QuranPlaybackMode.continuous:
        return 'Continuous';
      case QuranPlaybackMode.randomSurah:
        return 'Random Surah';
      case QuranPlaybackMode.specificSurah:
        return 'Specific Surah';
      case QuranPlaybackMode.juzByJuz:
        return 'Juz-by-Juz';
    }
  }

  void _showQuranPlaybackModeDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      (QuranPlaybackMode.continuous, 'Continuous',
          'Play surahs in order, looping'),
      (QuranPlaybackMode.randomSurah, 'Random Surah',
          'Pick a random surah each time'),
      (QuranPlaybackMode.specificSurah, 'Specific Surah',
          'Always start from one surah'),
      (QuranPlaybackMode.juzByJuz, 'Juz-by-Juz',
          'Advance through the 30 juz'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Playback Mode',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: options.map((opt) {
              final isSelected = tvSettings.quranPlaybackMode == opt.$1;
              return _LanguageOption(
                label: '${opt.$2}\n${opt.$3}',
                isSelected: isSelected,
                onTap: () {
                  tvNotifier.setQuranPlaybackMode(opt.$1);
                  Navigator.of(ctx).pop();
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  // ── Info Bar helpers (TV2-2.5) ──────────────────────────────────────────────

  String _infoBarSummary(TvInfoBarConfig cfg) {
    final items = <String>[];
    if (cfg.showHijri) items.add('Hijri');
    if (cfg.showGregorian) items.add('Gregorian');
    if (cfg.showLocation) items.add('Location');
    if (cfg.showWeather) items.add('Weather');
    if (cfg.showMoon) items.add('Moon');
    if (cfg.showHadithTicker) items.add('Hadith');
    if (cfg.showCalendarTicker) items.add('Calendar');
    return items.isEmpty ? 'Nothing shown' : items.join(', ');
  }

  // ── Brightness Schedule helpers ──────────────────────────────────────────────

  String _brightnessRuleTitle(TvBrightnessRule rule) {
    switch (rule.trigger) {
      case BrightnessTrigger.prayerTime:
        return 'At ${rule.prayerName ?? 'Prayer'}';
      case BrightnessTrigger.fixedTime:
        final h = (rule.fixedHour ?? 0).toString().padLeft(2, '0');
        final m = (rule.fixedMinute ?? 0).toString().padLeft(2, '0');
        return 'At $h:$m';
      case BrightnessTrigger.sunset:
        return 'At Sunset';
    }
  }

  void _showAddBrightnessRuleDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    BrightnessTrigger trigger = BrightnessTrigger.prayerTime;
    String prayerName = 'Fajr';
    int fixedHour = 22;
    int fixedMinute = 0;
    int brightnessPercent = 80;
    bool screenOff = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: PrayCalcColors.surface,
          title: const Text('Add Brightness Rule',
              style: TextStyle(color: Colors.white, fontSize: 28)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Trigger type
                const Text('Trigger',
                    style: TextStyle(color: Colors.white54, fontSize: 20)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _DialogChip(
                      label: 'Prayer Time',
                      selected: trigger == BrightnessTrigger.prayerTime,
                      onTap: () => setDialogState(
                          () => trigger = BrightnessTrigger.prayerTime),
                    ),
                    const SizedBox(width: 8),
                    _DialogChip(
                      label: 'Fixed Time',
                      selected: trigger == BrightnessTrigger.fixedTime,
                      onTap: () => setDialogState(
                          () => trigger = BrightnessTrigger.fixedTime),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Prayer picker or hour input
                if (trigger == BrightnessTrigger.prayerTime) ...[
                  const Text('Prayer',
                      style: TextStyle(color: Colors.white54, fontSize: 20)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
                        .map((p) => _DialogChip(
                              label: p,
                              selected: prayerName == p,
                              onTap: () =>
                                  setDialogState(() => prayerName = p),
                            ))
                        .toList(),
                  ),
                ] else ...[
                  const Text('Time (hour)',
                      style: TextStyle(color: Colors.white54, fontSize: 20)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    children: List.generate(24, (h) => _DialogChip(
                      label: h.toString().padLeft(2, '0'),
                      selected: fixedHour == h,
                      onTap: () => setDialogState(() => fixedHour = h),
                    )),
                  ),
                  const SizedBox(height: 8),
                  const Text('Minute',
                      style: TextStyle(color: Colors.white54, fontSize: 20)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    children: [0, 15, 30, 45]
                        .map((m) => _DialogChip(
                              label: m.toString().padLeft(2, '0'),
                              selected: fixedMinute == m,
                              onTap: () =>
                                  setDialogState(() => fixedMinute = m),
                            ))
                        .toList(),
                  ),
                ],
                const SizedBox(height: 16),

                // Screen off toggle
                Row(
                  children: [
                    const Text('Screen Off',
                        style:
                            TextStyle(color: Colors.white, fontSize: 22)),
                    const Spacer(),
                    Switch(
                      value: screenOff,
                      activeThumbColor: PrayCalcColors.mid,
                      onChanged: (v) =>
                          setDialogState(() => screenOff = v),
                    ),
                  ],
                ),

                // Brightness slider (only if not screen-off)
                if (!screenOff) ...[
                  const SizedBox(height: 8),
                  Text('Brightness: $brightnessPercent%',
                      style: const TextStyle(
                          color: Colors.white, fontSize: 22)),
                  SliderTheme(
                    data: SliderTheme.of(ctx).copyWith(
                      activeTrackColor: PrayCalcColors.mid,
                      inactiveTrackColor: Colors.white12,
                      thumbColor: PrayCalcColors.light,
                    ),
                    child: Slider(
                      value: brightnessPercent.toDouble(),
                      min: 0,
                      max: 100,
                      divisions: 20,
                      onChanged: (v) => setDialogState(
                          () => brightnessPercent = v.round()),
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel',
                  style:
                      TextStyle(color: Colors.white54, fontSize: 22)),
            ),
            TextButton(
              onPressed: () {
                final rule = TvBrightnessRule(
                  trigger: trigger,
                  prayerName: trigger == BrightnessTrigger.prayerTime
                      ? prayerName
                      : null,
                  fixedHour: trigger == BrightnessTrigger.fixedTime
                      ? fixedHour
                      : null,
                  fixedMinute: trigger == BrightnessTrigger.fixedTime
                      ? fixedMinute
                      : null,
                  brightnessPercent: brightnessPercent,
                  screenOff: screenOff,
                );
                tvNotifier.setBrightnessSchedule(
                    [...tvSettings.brightnessSchedule, rule]);
                Navigator.of(ctx).pop();
              },
              child: const Text('Add',
                  style: TextStyle(
                      color: PrayCalcColors.mid, fontSize: 22)),
            ),
          ],
        ),
      ),
    );
  }

  // ── Screensaver helpers — P-15 / TV2-7.5 / 7.6 / 7.8 / 7.9 ────────────────

  String _screensaverModeLabel(String mode) => switch (mode) {
    'photo' => 'Photos',
    'pattern' => 'Islamic Pattern',
    'starfield' => 'Starfield',
    'calligraphy' => 'Calligraphy',
    'quranVerses' => 'Quran Verses',
    'worldMap' => 'World Map',
    _ => 'Photos',
  };

  void _showScreensaverModeDialog(
    BuildContext context,
    TvSettingsNotifier notifier,
    TvSettings tvSettings,
  ) {
    const options = [
      ('photo', 'Photos', Icons.photo_library),
      ('pattern', 'Islamic Pattern', Icons.star),
      ('starfield', 'Starfield', Icons.nights_stay),
      ('calligraphy', 'Calligraphy', Icons.menu_book),
      ('quranVerses', 'Quran Verses', Icons.auto_stories),
      ('worldMap', 'World Map', Icons.public),
    ];
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1A2E1A),
        title: const Text('Screensaver Mode',
            style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final selected = tvSettings.screensaverMode == opt.$1;
            return ListTile(
              leading: Icon(opt.$3,
                  color: selected ? PrayCalcColors.light : Colors.white54),
              title: Text(opt.$2,
                  style: TextStyle(
                      color: selected ? Colors.white : Colors.white70)),
              trailing: selected
                  ? const Icon(Icons.check, color: PrayCalcColors.light)
                  : null,
              onTap: () {
                notifier.setScreensaverMode(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── Screensaver helpers — TV2-7.5 / 7.6 / 7.8 / 7.9 ───────────────────────

  String _photoSourceLabel(String source) {
    switch (source) {
      case 'mix':
        return 'Mix — Library + Pattern';
      case 'library':
      default:
        return 'PrayCalc Library';
    }
  }

  void _showPhotoSourceV2Dialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      ('library', 'PrayCalc Library'),
      ('mix', 'Mix — Library + Pattern'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Photo Source',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected = tvSettings.photoSource == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setPhotoSource(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  static const _kPhotoCategories = [
    ('mecca-kaaba', 'Mecca — Kaaba'),
    ('medina', 'Medina'),
    ('al-aqsa', 'Al-Aqsa'),
    ('masjid-exterior', 'Masjid Exterior'),
    ('masjid-interior', 'Masjid Interior'),
    ('geometric', 'Geometric Art'),
    ('calligraphy', 'Calligraphy'),
    ('landscape', 'Landscape'),
  ];

  String _photoCategoriesLabel(List<String> cats) {
    if (cats.isEmpty) return 'All categories';
    if (cats.length == _kPhotoCategories.length) return 'All categories';
    return '${cats.length} selected';
  }

  void _showPhotoCategoriesDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          final selected = List<String>.from(tvSettings.photoCategories);
          return AlertDialog(
            backgroundColor: PrayCalcColors.surface,
            title: const Text('Photo Categories',
                style: TextStyle(color: Colors.white, fontSize: 28)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: _kPhotoCategories.map((cat) {
                  final checked = selected.isEmpty || selected.contains(cat.$1);
                  return Focus(
                    onKeyEvent: (node, event) {
                      if (event is KeyDownEvent &&
                          (event.logicalKey == LogicalKeyboardKey.select ||
                              event.logicalKey == LogicalKeyboardKey.enter)) {
                        setDialogState(() {
                          if (selected.contains(cat.$1)) {
                            selected.remove(cat.$1);
                          } else {
                            selected.add(cat.$1);
                          }
                        });
                        return KeyEventResult.handled;
                      }
                      return KeyEventResult.ignored;
                    },
                    child: CheckboxListTile(
                      title: Text(cat.$2,
                          style: const TextStyle(
                              color: Colors.white, fontSize: 22)),
                      value: checked,
                      activeColor: PrayCalcColors.mid,
                      checkColor: PrayCalcColors.deep,
                      onChanged: (v) {
                        setDialogState(() {
                          if (v == true) {
                            if (!selected.contains(cat.$1)) {
                              selected.add(cat.$1);
                            }
                          } else {
                            selected.remove(cat.$1);
                          }
                        });
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancel',
                    style:
                        TextStyle(color: Colors.white54, fontSize: 22)),
              ),
              TextButton(
                onPressed: () {
                  // Empty list = all categories
                  final toSave = selected.length == _kPhotoCategories.length
                      ? <String>[]
                      : selected;
                  tvNotifier.setPhotoCategories(toSave);
                  Navigator.of(ctx).pop();
                },
                child: const Text('Save',
                    style: TextStyle(
                        color: PrayCalcColors.mid, fontSize: 22)),
              ),
            ],
          );
        },
      ),
    );
  }

  String _slideshowDurationLabel(int seconds) {
    switch (seconds) {
      case 15:
        return '15 seconds';
      case 60:
        return '1 minute';
      case 180:
        return '3 minutes';
      case 300:
        return '5 minutes';
      case 30:
      default:
        return '30 seconds';
    }
  }

  void _showSlideshowDurationDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      (15, '15 seconds'),
      (30, '30 seconds'),
      (60, '1 minute'),
      (180, '3 minutes'),
      (300, '5 minutes'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Photo Duration',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected =
                tvSettings.slideshowDurationSeconds == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setSlideshowDurationSeconds(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  String _slideshowTransitionLabel(String transition) {
    switch (transition) {
      case 'crossfade':
        return 'Crossfade';
      case 'both':
        return 'Both';
      case 'kenburns':
      default:
        return 'Ken Burns';
    }
  }

  void _showSlideshowTransitionDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      ('crossfade', 'Crossfade'),
      ('kenburns', 'Ken Burns'),
      ('both', 'Both'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Transitions',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected = tvSettings.slideshowTransition == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setSlideshowTransition(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  String _overlayDensityLabel(String density) {
    switch (density) {
      case 'minimal':
        return 'Minimal — time only';
      case 'full':
        return 'Full — all prayers + weather';
      case 'standard':
      default:
        return 'Standard — time + next prayer';
    }
  }

  void _showOverlayDensityDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      ('minimal', 'Minimal', 'Time only'),
      ('standard', 'Standard', 'Time + next prayer'),
      ('full', 'Full', 'All prayers + weather'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Overlay Density',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected = tvSettings.overlayDensity == opt.$1;
            return _LanguageOption(
              label: '${opt.$2} — ${opt.$3}',
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setOverlayDensity(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  String _screensaverIdleLabel(int seconds) {
    if (seconds == 0) return 'Never';
    if (seconds < 60) return '${seconds}s';
    final min = seconds ~/ 60;
    return '$min minute${min == 1 ? '' : 's'}';
  }

  void _showScreensaverIdleDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const options = [
      (60, '1 minute'),
      (300, '5 minutes'),
      (600, '10 minutes'),
      (1800, '30 minutes'),
      (0, 'Never'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Screensaver Starts After',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected =
                tvSettings.screensaverIdleSeconds == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setScreensaverIdleSeconds(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── Brightness helpers — TV2-6.7 ────────────────────────────────────────────

  List<Widget> _buildPrayerBrightnessOverrides(
    TvSettingsNotifier tvNotifier,
    TvSettings tvSettings,
  ) {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return prayers.map((prayer) {
      final override = tvSettings.prayerBrightnessOverrides[prayer];
      final displayValue = override ?? 80;
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: _TvSettingsTile(
          icon: Icons.brightness_6,
          title: prayer,
          subtitle: override != null ? '$override%' : 'Default',
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 180,
                child: SliderTheme(
                  data: SliderTheme.of(
                          // Use a dummy context key — will be replaced
                          // by the actual context inside Builder.
                          // We resolve via the _CompactSlider widget below.
                          // ignore: prefer_const_constructors
                          const Key('') as dynamic)
                      .copyWith(),
                  child: _CompactSlider(
                    value: displayValue.toDouble(),
                    min: 0,
                    max: 100,
                    divisions: 20,
                    label: '$displayValue%',
                    onChanged: (v) => tvNotifier
                        .setPrayerBrightnessOverride(prayer, v.round()),
                  ),
                ),
              ),
              if (override != null)
                IconButton(
                  icon: const Icon(Icons.refresh,
                      color: Colors.white38, size: 24),
                  tooltip: 'Reset to default',
                  onPressed: () =>
                      tvNotifier.clearPrayerBrightnessOverride(prayer),
                ),
            ],
          ),
          onTap: null,
        ),
      );
    }).toList();
  }

  static const _supportedLocales = [
    ('System default', null),
    ('English', 'en'),
    ('العربية', 'ar'),
    ('Türkçe', 'tr'),
    ('اردو', 'ur'),
    ('Bahasa Indonesia', 'id'),
    ('Français', 'fr'),
    ('বাংলা', 'bn'),
    ('Soomaali', 'so'),
    ('Deutsch', 'de'),
    ('Español', 'es'),
    ('हिन्दी', 'hi'),
    ('Bahasa Melayu', 'ms'),
    ('فارسی', 'fa'),
    ('پښتو', 'ps'),
    ('Kiswahili', 'sw'),
    ('Hausa', 'ha'),
    ('Oʻzbek', 'uz'),
    ('کوردی', 'ku'),
    ('ไทย', 'th'),
    ('中文', 'zh'),
    ('Русский', 'ru'),
    ('Português', 'pt'),
  ];

  String _languageLabel(AppLocalizations l, String? locale) {
    if (locale == null) return l.tvSystemDefault;
    return _supportedLocales
        .firstWhere((e) => e.$2 == locale,
            orElse: () => _supportedLocales.first)
        .$1;
  }

  void _showLanguageDialog(BuildContext context, AppLocalizations l) {
    final current = ref.read(settingsProvider).locale;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: Text(l.commonLanguage,
            style: const TextStyle(color: Colors.white, fontSize: 28)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final (label, code) in _supportedLocales)
                _LanguageOption(
                  label: label,
                  isSelected: code == current ||
                      (code == null && current == null),
                  onTap: () {
                    ref.read(settingsProvider.notifier).setLocale(code);
                    Navigator.of(ctx).pop();
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  /// Calls the smart service to generate a 24h guest QR code for prayer times,
  /// then shows a dialog with the QR code the TV can display to guests.
  Future<void> _showGuestQrDialog(BuildContext context, dynamic settings) async {
    const kSmartBase = 'https://smart.praycalc.com/api/v1/tv';
    const kTvSessionJwt = 'tv_session_jwt';

    final prefs = await SharedPreferences.getInstance();
    final jwt = prefs.getString(kTvSessionJwt);

    // Coordinates come from the app's home location setting.
    final lat = (settings as dynamic).homeLat as double?;
    final lng = (settings as dynamic).homeLng as double?;

    if (jwt == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('TV not paired — cannot generate QR')),
        );
      }
      return;
    }
    if (lat == null || lng == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Set a home location in Settings first')),
        );
      }
      return;
    }

    // Show loading indicator while we fetch the code.
    String? guestUrl;
    String? expiresAt;
    if (context.mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );
    }

    try {
      final resp = await http.post(
        Uri.parse('$kSmartBase/guest-qr'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwt',
        },
        body: jsonEncode({'lat': lat, 'lng': lng}),
      );
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        guestUrl = body['url'] as String?;
        expiresAt = body['expiresAt'] as String?;
      }
    } catch (e) {
      // fall through to error handling below
    }

    if (!context.mounted) return;
    // Dismiss loading dialog.
    Navigator.of(context, rootNavigator: true).pop();

    if (guestUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not generate guest QR — check connection')),
      );
      return;
    }

    final expiry = expiresAt != null
        ? DateTime.tryParse(expiresAt)?.toLocal()
        : null;
    final expiryLabel = expiry != null
        ? 'Expires ${expiry.hour.toString().padLeft(2, '0')}:${expiry.minute.toString().padLeft(2, '0')} tomorrow'
        : 'Expires in 24h';

    final url = guestUrl;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text(
          'Share Prayer Times',
          style: TextStyle(color: Colors.white, fontSize: 28),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            QrImageView(data: url, size: 220, backgroundColor: Colors.white),
            const SizedBox(height: 16),
            const Text(
              'Guests scan with any camera app to view prayer times — no app needed.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              expiryLabel,
              style: const TextStyle(color: PrayCalcColors.mid, fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Close',
                style: TextStyle(color: Colors.white54, fontSize: 22)),
          ),
        ],
      ),
    );
  }

  void _showTextDialog({
    required BuildContext context,
    required String title,
    required TextEditingController controller,
    required ValueChanged<String> onSave,
  }) {
    final l = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: Text(title,
            style: const TextStyle(color: Colors.white, fontSize: 28)),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: const TextStyle(color: Colors.white, fontSize: 24),
          decoration: InputDecoration(
            hintText: l.tvEnterHint(title),
            hintStyle: const TextStyle(color: Colors.white38, fontSize: 24),
            enabledBorder: const UnderlineInputBorder(
              borderSide: BorderSide(color: PrayCalcColors.mid),
            ),
            focusedBorder: const UnderlineInputBorder(
              borderSide: BorderSide(color: PrayCalcColors.light, width: 2),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(l.commonCancel,
                style: const TextStyle(color: Colors.white54, fontSize: 22)),
          ),
          TextButton(
            onPressed: () {
              onSave(controller.text.trim());
              Navigator.of(ctx).pop();
            },
            child: Text(l.commonSave,
                style: const TextStyle(color: PrayCalcColors.mid, fontSize: 22)),
          ),
        ],
      ),
    );
  }
}

// ─── Reusable setting widgets ──────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        color: PrayCalcColors.mid,
        fontSize: 24,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

class _TvSettingsTile extends StatelessWidget {
  const _TvSettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap?.call();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (ctx) {
          final hasFocus = Focus.of(ctx).hasFocus;
          return Container(
            decoration: BoxDecoration(
              color: hasFocus
                  ? PrayCalcColors.dark.withAlpha(120)
                  : PrayCalcColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: hasFocus
                  ? Border.all(color: PrayCalcColors.mid, width: 2)
                  : null,
            ),
            child: ListTile(
              leading: Icon(icon, color: PrayCalcColors.mid, size: 32),
              title: Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: subtitle != null
                  ? Text(
                      subtitle!,
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 20),
                    )
                  : null,
              trailing: trailing,
              onTap: onTap,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20, vertical: 8),
            ),
          );
        },
      ),
    );
  }
}

class _CompactSlider extends StatelessWidget {
  const _CompactSlider({
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    this.divisions,
    this.label,
  });

  final double value;
  final double min;
  final double max;
  final int? divisions;
  final String? label;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      child: SliderTheme(
        data: SliderTheme.of(context).copyWith(
          activeTrackColor: PrayCalcColors.mid,
          inactiveTrackColor: Colors.white12,
          thumbColor: PrayCalcColors.light,
          overlayColor: PrayCalcColors.mid.withAlpha(40),
          valueIndicatorTextStyle:
              const TextStyle(color: Colors.white, fontSize: 18),
        ),
        child: Slider(
          value: value,
          min: min,
          max: max,
          divisions: divisions,
          label: label,
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _LanguageOption extends StatelessWidget {
  const _LanguageOption({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: ListTile(
        title: Text(
          label,
          style: TextStyle(
            color: isSelected ? PrayCalcColors.light : Colors.white70,
            fontSize: 24,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        trailing: isSelected
            ? const Icon(Icons.check, color: PrayCalcColors.light, size: 28)
            : null,
        onTap: onTap,
      ),
    );
  }
}

/// Small focusable chip used inside dialogs (e.g. the Add Brightness Rule dialog).
class _DialogChip extends StatelessWidget {
  const _DialogChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: selected ? PrayCalcColors.dark : Colors.white10,
            borderRadius: BorderRadius.circular(8),
            border: selected
                ? Border.all(color: PrayCalcColors.mid, width: 2)
                : Border.all(color: Colors.white24),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: selected ? PrayCalcColors.light : Colors.white70,
              fontSize: 20,
              fontWeight:
                  selected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
