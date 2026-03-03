import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';

// App version — keep in sync with pubspec.yaml
const _kVersion = '0.3.0';
const _kBuild = '1';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('About PrayCalc')),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 24),
        children: [
          // ── App icon + name ───────────────────────────────────────────────
          Center(
            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Image.asset(
                    'assets/brand/icon.png',
                    width: 88,
                    height: 88,
                    errorBuilder: (_, _, _) => Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: PrayCalcColors.dark,
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: const Icon(
                        Icons.wb_sunny,
                        color: Colors.white,
                        size: 44,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'PrayCalc',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: PrayCalcColors.dark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Version $_kVersion (build $_kBuild)',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: cs.onSurface.withAlpha(140),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Divider(),

          // ── Info tiles ────────────────────────────────────────────────────
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('Website'),
            subtitle: const Text('praycalc.com'),
            onTap: () => _copyToClipboard(context, 'https://praycalc.com'),
            trailing: const Icon(Icons.copy, size: 16),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy Policy'),
            subtitle: const Text('praycalc.com/privacy'),
            onTap: () =>
                _copyToClipboard(context, 'https://praycalc.com/privacy'),
            trailing: const Icon(Icons.copy, size: 16),
          ),
          ListTile(
            leading: const Icon(Icons.mail_outline),
            title: const Text('Contact'),
            subtitle: const Text('support@praycalc.com'),
            onTap: () =>
                _copyToClipboard(context, 'support@praycalc.com'),
            trailing: const Icon(Icons.copy, size: 16),
          ),

          const Divider(),

          ListTile(
            leading: const Icon(Icons.gavel_outlined),
            title: const Text('Open Source Licenses'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => showLicensePage(
              context: context,
              applicationName: 'PrayCalc',
              applicationVersion: 'v$_kVersion',
            ),
          ),

          const Divider(),

          // ── Copyright ─────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Text(
              '© ${DateTime.now().year} Ummat Dev. All rights reserved.\n\n'
              'Prayer times calculated using the pray_calc_dart engine. '
              'Accuracy depends on your GPS location and selected calculation method.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: cs.onSurface.withAlpha(120),
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  void _copyToClipboard(BuildContext context, String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Copied: $text'),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
