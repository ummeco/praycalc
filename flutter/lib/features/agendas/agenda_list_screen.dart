import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/agenda_provider.dart';
import '../../core/services/agenda_service.dart';
import '../../shared/models/agenda_model.dart';
import 'agenda_edit_screen.dart';

class AgendaListScreen extends ConsumerWidget {
  const AgendaListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final agendas = ref.watch(agendaProvider);
    final notifier = ref.read(agendaProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Prayer Agendas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => const AgendaEditScreen(),
              ),
            ),
          ),
        ],
      ),
      body: agendas.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text(
                  'No agendas yet.\nTap + to add a reminder linked to your prayers.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16),
                ),
              ),
            )
          : _AgendaGroupedList(agendas: agendas, notifier: notifier),
      floatingActionButton: agendas.isEmpty
          ? null
          : FloatingActionButton(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AgendaEditScreen(),
                ),
              ),
              child: const Icon(Icons.add),
            ),
    );
  }
}

class _AgendaGroupedList extends StatelessWidget {
  const _AgendaGroupedList({
    required this.agendas,
    required this.notifier,
  });

  final List<Agenda> agendas;
  final AgendaNotifier notifier;

  @override
  Widget build(BuildContext context) {
    // Group by prayer
    final grouped = <PrayerName, List<Agenda>>{};
    for (final prayer in PrayerName.values) {
      final items = agendas.where((a) => a.prayer == prayer).toList();
      if (items.isNotEmpty) grouped[prayer] = items;
    }

    return ListView(
      children: [
        for (final entry in grouped.entries) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            child: Text(
              _prayerDisplayName(entry.key),
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
          for (final agenda in entry.value)
            _AgendaTile(
              agenda: agenda,
              notifier: notifier,
            ),
        ],
      ],
    );
  }

  String _prayerDisplayName(PrayerName p) =>
      AgendaService.offsetDescription(
        Agenda(id: '', label: '', prayer: p, offsetMinutes: 0),
      ).replaceFirst('At ', '');
}

class _AgendaTile extends StatelessWidget {
  const _AgendaTile({required this.agenda, required this.notifier});

  final Agenda agenda;
  final AgendaNotifier notifier;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(agenda.id),
      direction: DismissDirection.endToStart,
      background: Builder(
        builder: (context) => Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: 20),
          color: Theme.of(context).colorScheme.error,
          child: Icon(Icons.delete, color: Theme.of(context).colorScheme.onError),
        ),
      ),
      onDismissed: (_) {
        notifier.remove(agenda.id);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${agenda.label} removed'),
            action: SnackBarAction(
              label: 'Undo',
              onPressed: () => notifier.restore(agenda),
            ),
          ),
        );
      },
      child: ListTile(
        leading: const Icon(Icons.schedule),
        title: Text(agenda.label),
        subtitle: Text(AgendaService.offsetDescription(agenda)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Switch(
              value: agenda.enabled,
              onChanged: (_) => notifier.toggleEnabled(agenda.id),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => AgendaEditScreen(agenda: agenda),
          ),
        ),
      ),
    );
  }
}
