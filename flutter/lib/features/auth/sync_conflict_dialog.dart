import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// A resolved sync conflict entry.
///
/// Captures what was overwritten when last-write-wins resolved a conflict.
class SyncConflictEntry {
  final String domain;
  final DateTime resolvedAt;
  final String winner; // 'local' or 'remote'
  final String summary;

  const SyncConflictEntry({
    required this.domain,
    required this.resolvedAt,
    required this.winner,
    required this.summary,
  });

  Map<String, dynamic> toJson() => {
        'domain': domain,
        'resolvedAt': resolvedAt.toIso8601String(),
        'winner': winner,
        'summary': summary,
      };

  factory SyncConflictEntry.fromJson(Map<String, dynamic> json) =>
      SyncConflictEntry(
        domain: json['domain'] as String,
        resolvedAt: DateTime.parse(json['resolvedAt'] as String),
        winner: json['winner'] as String,
        summary: json['summary'] as String,
      );
}

/// Dialog showing recent sync conflict resolutions.
///
/// Users can see what happened during auto-resolution and understand
/// which version won. This is informational — the sync engine uses
/// last-write-wins automatically, but transparency builds trust.
class SyncConflictDialog extends StatelessWidget {
  final List<SyncConflictEntry> conflicts;

  const SyncConflictDialog({super.key, required this.conflicts});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AlertDialog(
      title: const Text('Sync History'),
      content: SizedBox(
        width: double.maxFinite,
        child: conflicts.isEmpty
            ? const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  'No sync conflicts detected. All devices are in sync.',
                  textAlign: TextAlign.center,
                ),
              )
            : ListView.separated(
                shrinkWrap: true,
                itemCount: conflicts.length,
                separatorBuilder: (_, _) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final c = conflicts[index];
                  return _ConflictTile(conflict: c, theme: theme);
                },
              ),
      ),
      actions: [
        if (conflicts.isNotEmpty)
          TextButton(
            onPressed: () => Navigator.of(context).pop('clear'),
            child: const Text('Clear history'),
          ),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('OK'),
        ),
      ],
    );
  }
}

class _ConflictTile extends StatelessWidget {
  final SyncConflictEntry conflict;
  final ThemeData theme;

  const _ConflictTile({required this.conflict, required this.theme});

  @override
  Widget build(BuildContext context) {
    final isRemoteWin = conflict.winner == 'remote';
    return ListTile(
      dense: true,
      leading: Icon(
        isRemoteWin ? Icons.cloud_download : Icons.phone_android,
        color: PrayCalcColors.mid,
        size: 20,
      ),
      title: Text(
        _domainLabel(conflict.domain),
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        '${conflict.summary}\n${_timeAgo(conflict.resolvedAt)}',
        style: theme.textTheme.bodySmall,
      ),
      isThreeLine: true,
    );
  }

  String _domainLabel(String domain) {
    switch (domain) {
      case 'settings':
        return 'Settings';
      case 'cities':
        return 'Saved Cities';
      case 'prayer_logs':
        return 'Prayer Logs';
      default:
        return domain;
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
