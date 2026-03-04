import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/settings_provider.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';

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
    final tvSettings = ref.watch(tvSettingsProvider);
    final tvNotifier = ref.read(tvSettingsProvider.notifier);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: const Text(
          'TV Settings',
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
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
            // ── Display Mode ──
            _SectionHeader(title: 'Display Mode'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.mosque,
              title: 'Masjid Mode',
              subtitle: 'Large signage display with iqamah times',
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
                title: 'Masjid Name',
                subtitle: tvSettings.masjidName.isNotEmpty
                    ? tvSettings.masjidName
                    : 'Tap to set',
                onTap: () => _showTextDialog(
                  context: context,
                  title: 'Masjid Name',
                  controller: _masjidNameController,
                  onSave: (v) => tvNotifier.setMasjidName(v),
                ),
              ),
            ],
            const SizedBox(height: 24),

            // ── Clock ──
            _SectionHeader(title: 'Clock'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.access_time,
              title: '24-hour format',
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
              _SectionHeader(title: 'Iqamah Offsets (minutes after adhan)'),
              const SizedBox(height: 8),
              ..._buildIqamahSliders(tvSettings, tvNotifier),
              const SizedBox(height: 24),
            ],

            // ── QR Code ──
            if (tvSettings.isMasjidMode) ...[
              _SectionHeader(title: 'QR Code'),
              const SizedBox(height: 8),
              _TvSettingsTile(
                icon: Icons.qr_code,
                title: 'Show QR Code',
                subtitle: 'Display a QR code on the masjid screen',
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
                  title: 'QR Code URL',
                  subtitle: tvSettings.qrCodeUrl ?? 'Tap to set',
                  onTap: () => _showTextDialog(
                    context: context,
                    title: 'QR Code URL',
                    controller: _qrUrlController,
                    onSave: (v) => tvNotifier.setQrCodeUrl(v),
                  ),
                ),
              ],
              const SizedBox(height: 24),
            ],

            // ── Ambient Mode ──
            _SectionHeader(title: 'Ambient Mode'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.timer,
              title: 'Idle timeout',
              subtitle:
                  '${tvSettings.ambientIdleMinutes} minutes before ambient activates',
              trailing: _CompactSlider(
                value: tvSettings.ambientIdleMinutes.toDouble(),
                min: 1,
                max: 60,
                divisions: 59,
                label: '${tvSettings.ambientIdleMinutes} min',
                onChanged: (v) =>
                    tvNotifier.setAmbientIdleMinutes(v.round()),
              ),
            ),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.rotate_right,
              title: 'Photo interval',
              subtitle:
                  '${tvSettings.ambientIntervalSeconds} seconds between photos',
              trailing: _CompactSlider(
                value: tvSettings.ambientIntervalSeconds.toDouble(),
                min: 30,
                max: 120,
                divisions: 9,
                label: '${tvSettings.ambientIntervalSeconds}s',
                onChanged: (v) =>
                    tvNotifier.setAmbientIntervalSeconds(v.round()),
              ),
            ),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.wallpaper,
              title: 'Background',
              subtitle: _screensaverModeLabel(tvSettings.screensaverMode),
              onTap: () => _showScreensaverModeDialog(context, tvNotifier),
            ),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.photo_library,
              title: 'Photo category',
              subtitle: _screensaverCategoryLabel(tvSettings.screensaverCategory),
              onTap: () =>
                  _showScreensaverCategoryDialog(context, tvNotifier),
            ),
            const SizedBox(height: 24),

            // ── Location ──
            _SectionHeader(title: 'Location'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.location_city,
              title: 'Change City',
              subtitle: 'Search for a different city',
              trailing: const Icon(
                Icons.chevron_right,
                color: Colors.white54,
                size: 32,
              ),
              onTap: () => context.push('/city-search'),
            ),
            const SizedBox(height: 24),

            // ── Language ──
            _SectionHeader(title: 'Language'),
            const SizedBox(height: 8),
            _TvSettingsTile(
              icon: Icons.language,
              title: 'Language',
              subtitle: _languageLabel(settings.locale),
              trailing: const Icon(
                Icons.chevron_right,
                color: Colors.white54,
                size: 32,
              ),
              onTap: () => _showLanguageDialog(context),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildIqamahSliders(
    dynamic tvSettings,
    TvSettingsNotifier tvNotifier,
  ) {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return prayers.map((prayer) {
      final offset = tvSettings.iqamahOffsets[prayer] ?? 15;
      return Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: _TvSettingsTile(
          icon: Icons.schedule,
          title: prayer,
          subtitle: '$offset min after adhan',
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

  String _screensaverModeLabel(String mode) {
    switch (mode) {
      case 'photo':
        return 'Photos';
      case 'pattern':
        return 'Geometric pattern';
      case 'both':
        return 'Photos + pattern';
      default:
        return 'Photos';
    }
  }

  String _screensaverCategoryLabel(String category) {
    switch (category) {
      case 'masjid-exterior':
        return 'Masjids';
      case 'masjid-interior':
        return 'Interiors';
      case 'geometric':
        return 'Geometric';
      case 'calligraphy':
        return 'Calligraphy';
      case 'landscape':
        return 'Landscapes';
      case 'ramadan':
        return 'Ramadan';
      case '':
      default:
        return 'All categories';
    }
  }

  void _showScreensaverModeDialog(
      BuildContext context, TvSettingsNotifier tvNotifier) {
    final options = [
      ('photo', 'Photos'),
      ('pattern', 'Geometric pattern'),
      ('both', 'Photos + pattern'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Screensaver Background',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected =
                ref.read(tvSettingsProvider).screensaverMode == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setScreensaverMode(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showScreensaverCategoryDialog(
      BuildContext context, TvSettingsNotifier tvNotifier) {
    final options = [
      ('', 'All categories'),
      ('masjid-exterior', 'Masjids'),
      ('masjid-interior', 'Interiors'),
      ('geometric', 'Geometric'),
      ('calligraphy', 'Calligraphy'),
      ('landscape', 'Landscapes'),
      ('ramadan', 'Ramadan'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Photo Category',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected =
                ref.read(tvSettingsProvider).screensaverCategory == opt.$1;
            return _LanguageOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setScreensaverCategory(opt.$1);
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  String _languageLabel(String? locale) {
    switch (locale) {
      case 'ar':
        return 'Arabic';
      case 'en':
        return 'English';
      default:
        return 'System default';
    }
  }

  void _showLanguageDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text('Language',
            style: TextStyle(color: Colors.white, fontSize: 28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _LanguageOption(
              label: 'System default',
              isSelected: ref.read(settingsProvider).locale == null,
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale(null);
                Navigator.of(ctx).pop();
              },
            ),
            _LanguageOption(
              label: 'English',
              isSelected: ref.read(settingsProvider).locale == 'en',
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale('en');
                Navigator.of(ctx).pop();
              },
            ),
            _LanguageOption(
              label: 'Arabic',
              isSelected: ref.read(settingsProvider).locale == 'ar',
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale('ar');
                Navigator.of(ctx).pop();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showTextDialog({
    required BuildContext context,
    required String title,
    required TextEditingController controller,
    required ValueChanged<String> onSave,
  }) {
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
            hintText: 'Enter $title',
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
            child: const Text('Cancel',
                style: TextStyle(color: Colors.white54, fontSize: 22)),
          ),
          TextButton(
            onPressed: () {
              onSave(controller.text.trim());
              Navigator.of(ctx).pop();
            },
            child: const Text('Save',
                style: TextStyle(color: PrayCalcColors.mid, fontSize: 22)),
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
