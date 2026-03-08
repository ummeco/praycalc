import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';

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
    final l = AppLocalizations.of(context)!;

    return AlertDialog(
      title: Text(l.syncHistoryTitle),
      content: SizedBox(
        width: double.maxFinite,
        child: conflicts.isEmpty
            ? Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  l.syncNoConflicts,
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
            child: Text(l.syncClearHistory),
          ),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(l.commonOk),
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
    final l = AppLocalizations.of(context)!;
    final isRemoteWin = conflict.winner == 'remote';
    return ListTile(
      dense: true,
      leading: Icon(
        isRemoteWin ? Icons.cloud_download : Icons.phone_android,
        color: PrayCalcColors.mid,
        size: 20,
      ),
      title: Text(
        _domainLabel(conflict.domain, l),
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        '${conflict.summary}\n${_timeAgo(conflict.resolvedAt, l)}',
        style: theme.textTheme.bodySmall,
      ),
      isThreeLine: true,
    );
  }

  String _domainLabel(String domain, AppLocalizations l) {
    switch (domain) {
      case 'settings':
        return l.syncDomainSettings;
      case 'cities':
        return l.syncDomainCities;
      case 'prayer_logs':
        return l.syncDomainPrayerLogs;
      default:
        return domain;
    }
  }

  String _timeAgo(DateTime dt, AppLocalizations l) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return l.syncTimeJustNow;
    if (diff.inMinutes < 60) return l.syncTimeMinAgo(diff.inMinutes);
    if (diff.inHours < 24) return l.syncTimeHourAgo(diff.inHours);
    return l.syncTimeDayAgo(diff.inDays);
  }
}
