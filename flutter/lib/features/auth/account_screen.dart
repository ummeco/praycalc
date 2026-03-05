import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/providers/sync_provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/sync_service.dart';
import 'sync_conflict_dialog.dart';

/// Account management screen.
///
/// Shows user info, sync status, and provides sign-out and
/// account deletion controls.
class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final sync = ref.watch(syncProvider);
    final user = auth.user;
    final theme = Theme.of(context);

    if (user == null) {
      // Should not happen, but handle gracefully.
      return Scaffold(
        appBar: AppBar(title: const Text('Account')),
        body: const Center(child: Text('Not signed in')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: ListView(
        children: [
          // ── Profile header ─────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
            color: theme.colorScheme.primaryContainer,
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: theme.colorScheme.primary,
                  child: Text(
                    user.initials,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  user.displayName ?? user.email,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onPrimaryContainer.withAlpha(180),
                  ),
                ),
              ],
            ),
          ),

          // ── Sync status ────────────────────────────────────────────
          const _SectionHeader('Sync'),
          ListTile(
            leading: Icon(_syncIcon(sync.status)),
            title: const Text('Sync status'),
            subtitle: Text(_syncLabel(sync)),
            trailing: sync.status == SyncStatus.syncing
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : IconButton(
                    icon: const Icon(Icons.sync),
                    tooltip: 'Sync now',
                    onPressed: () =>
                        ref.read(syncProvider.notifier).syncNow(),
                  ),
          ),

          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Sync history'),
            subtitle: Text(
              SyncService.instance.conflictLog.isEmpty
                  ? 'No conflicts detected'
                  : '${SyncService.instance.conflictLog.length} resolved',
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showConflictHistory(context),
          ),

          // ── Prayer data ────────────────────────────────────────────
          const _SectionHeader('Data'),
          ListTile(
            leading: const Icon(Icons.download_outlined),
            title: const Text('Export data'),
            subtitle: const Text('Download your settings and prayer logs'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _exportData(context),
          ),

          // ── Account actions ────────────────────────────────────────
          const _SectionHeader('Account'),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Sign out'),
            onTap: () => _signOut(context, ref),
          ),
          ListTile(
            leading: Icon(Icons.delete_forever, color: theme.colorScheme.error),
            title: Text(
              'Delete account',
              style: TextStyle(color: theme.colorScheme.error),
            ),
            subtitle: const Text('Permanently delete your account and data'),
            onTap: () => _deleteAccount(context, ref),
          ),
        ],
      ),
    );
  }

  Future<void> _exportData(BuildContext context) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      final data = <String, dynamic>{};
      for (final key in keys) {
        data[key] = prefs.get(key);
      }

      final export = {
        'app': 'PrayCalc',
        'exportedAt': DateTime.now().toIso8601String(),
        'settings': data,
      };

      final json = const JsonEncoder.withIndent('  ').convert(export);
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/praycalc_export.json');
      await file.writeAsString(json);

      await SharePlus.instance.share(
        ShareParams(files: [XFile(file.path)]),
      );
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not export data')),
        );
      }
    }
  }

  Future<void> _showConflictHistory(BuildContext context) async {
    await SyncService.instance.loadConflictLog();
    if (!context.mounted) return;
    final result = await showDialog<String>(
      context: context,
      builder: (_) => SyncConflictDialog(
        conflicts: SyncService.instance.conflictLog,
      ),
    );
    if (result == 'clear') {
      await SyncService.instance.clearConflictLog();
    }
  }

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign out'),
        content: const Text(
          'Your local data will be kept. Sign in again to resume syncing.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref.read(authProvider.notifier).signOut();
    if (context.mounted) {
      context.pop();
    }
  }

  Future<void> _deleteAccount(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete account'),
        content: const Text(
          'This will permanently delete your account and all synced data. '
          'Your local data on this device will not be removed.\n\n'
          'This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete account'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await SyncService.instance.clearRemoteData();
      await AuthService.instance.deleteAccount();
      if (context.mounted) {
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account deleted')),
        );
      }
    } on AuthException catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not delete account')),
        );
      }
    }
  }

  IconData _syncIcon(SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return Icons.cloud_done;
      case SyncStatus.syncing:
        return Icons.cloud_sync;
      case SyncStatus.offline:
        return Icons.cloud_off;
      case SyncStatus.error:
        return Icons.cloud_off;
    }
  }

  String _syncLabel(SyncState sync) {
    switch (sync.status) {
      case SyncStatus.synced:
        final ago = sync.lastSyncedAt != null
            ? _timeAgo(sync.lastSyncedAt!)
            : 'just now';
        return 'Synced $ago';
      case SyncStatus.syncing:
        return 'Syncing...';
      case SyncStatus.offline:
        return 'Offline. Changes saved locally.';
      case SyncStatus.error:
        return sync.errorMessage ?? 'Sync error. Will retry.';
    }
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.primary,
            ),
      ),
    );
  }
}
