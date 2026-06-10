import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
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
    final l = AppLocalizations.of(context)!;

    if (user == null) {
      // Should not happen, but handle gracefully.
      return Scaffold(
        appBar: AppBar(title: Text(l.accountTitle)),
        body: Center(child: Text(l.accountNotSignedIn)),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l.accountTitle)),
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
          _SectionHeader(l.accountSyncSection),
          ListTile(
            leading: Icon(_syncIcon(sync.status)),
            title: Text(l.accountSyncStatus),
            subtitle: Text(_syncLabel(sync, l)),
            trailing: sync.status == SyncStatus.syncing
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : IconButton(
                    icon: const Icon(Icons.sync),
                    tooltip: l.accountSyncNow,
                    onPressed: () =>
                        ref.read(syncProvider.notifier).syncNow(),
                  ),
          ),

          ListTile(
            leading: const Icon(Icons.history),
            title: Text(l.accountSyncHistory),
            subtitle: Text(
              SyncService.instance.conflictLog.isEmpty
                  ? l.accountNoConflicts
                  : l.accountConflictsResolved(SyncService.instance.conflictLog.length),
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showConflictHistory(context),
          ),

          // ── Prayer data ────────────────────────────────────────────
          _SectionHeader(l.accountDataSection),
          ListTile(
            leading: const Icon(Icons.download_outlined),
            title: Text(l.accountExportData),
            subtitle: Text(l.accountExportSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _exportData(context),
          ),

          // ── Account actions ────────────────────────────────────────
          _SectionHeader(l.accountTitle),
          ListTile(
            leading: const Icon(Icons.logout),
            title: Text(l.accountSignOutTitle),
            onTap: () => _signOut(context, ref),
          ),
          ListTile(
            leading: Icon(Icons.delete_forever, color: theme.colorScheme.error),
            title: Text(
              l.accountDeleteAccount,
              style: TextStyle(color: theme.colorScheme.error),
            ),
            subtitle: Text(l.accountDeleteSubtitle),
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
        final l = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l.accountExportFailed)),
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
    final l = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.accountSignOutTitle),
        content: Text(l.accountSignOutBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(l.commonCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(l.accountSignOutTitle),
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
    final l = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.accountDeleteAccount),
        content: Text(l.accountDeleteBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(l.commonCancel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(l.accountDeleteAccount),
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
          SnackBar(content: Text(l.accountDeleted)),
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
          SnackBar(content: Text(l.accountDeleteFailed)),
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

  String _syncLabel(SyncState sync, AppLocalizations l) {
    switch (sync.status) {
      case SyncStatus.synced:
        final ago = sync.lastSyncedAt != null
            ? _timeAgo(sync.lastSyncedAt!, l)
            : l.accountTimeJustNow;
        return l.accountSyncedAgo(ago);
      case SyncStatus.syncing:
        return l.syncSyncing;
      case SyncStatus.offline:
        return l.syncOffline;
      case SyncStatus.error:
        return sync.errorMessage ?? l.syncError;
    }
  }

  String _timeAgo(DateTime dt, AppLocalizations l) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return l.accountTimeJustNow;
    if (diff.inMinutes < 60) return l.accountTimeMinAgo(diff.inMinutes);
    if (diff.inHours < 24) return l.accountTimeHourAgo(diff.inHours);
    return l.accountTimeDayAgo(diff.inDays);
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
