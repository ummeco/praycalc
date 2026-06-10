import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  Future<void> _tryLaunch(BuildContext context, String url) async {
    try {
      await launchUrl(Uri.parse(url));
    } catch (_) {
      if (context.mounted) {
        final l = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l.aboutCouldNotOpen)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final l = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l.aboutTitle)),
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
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  l.aboutVersion('0.4.1'),
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
            title: Text(l.aboutWebsite),
            subtitle: const Text('praycalc.com'),
            onTap: () => _tryLaunch(context, 'https://praycalc.com'),
            trailing: const Icon(Icons.open_in_new, size: 16),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: Text(l.commonPrivacyPolicy),
            subtitle: const Text('praycalc.com/privacy'),
            onTap: () => _tryLaunch(context, 'https://praycalc.com/privacy'),
            trailing: const Icon(Icons.open_in_new, size: 16),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Terms of Service'),
            subtitle: const Text('praycalc.com/terms'),
            onTap: () => _tryLaunch(context, 'https://praycalc.com/terms'),
            trailing: const Icon(Icons.open_in_new, size: 16),
          ),
          ListTile(
            leading: const Icon(Icons.mail_outline),
            title: Text(l.aboutContact),
            subtitle: const Text('support@praycalc.com'),
            onTap: () => _tryLaunch(context, 'mailto:support@praycalc.com'),
            trailing: const Icon(Icons.open_in_new, size: 16),
          ),

          const Divider(),

          ListTile(
            leading: const Icon(Icons.gavel_outlined),
            title: Text(l.aboutLicenses),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => showLicensePage(
              context: context,
              applicationName: 'PrayCalc',
              applicationVersion: 'v0.4.1',
            ),
          ),

          const Divider(),

          // ── Copyright ─────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Text(
              l.aboutCopyright(DateTime.now().year),
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

}
