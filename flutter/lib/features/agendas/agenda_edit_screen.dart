import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/agenda_provider.dart';
import '../../shared/models/agenda_model.dart';

class AgendaEditScreen extends ConsumerStatefulWidget {
  const AgendaEditScreen({super.key, this.agenda});

  /// Null = create mode, non-null = edit mode.
  final Agenda? agenda;

  @override
  ConsumerState<AgendaEditScreen> createState() => _AgendaEditScreenState();
}

class _AgendaEditScreenState extends ConsumerState<AgendaEditScreen> {
  late final TextEditingController _labelController;
  late PrayerName _prayer;
  late int _offsetMinutes;
  late List<bool> _daySelected; // index 0=Mon .. 6=Sun
  late AgendaNotificationType _notificationType;

  static const _dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  @override
  void initState() {
    super.initState();
    final a = widget.agenda;
    _labelController = TextEditingController(text: a?.label ?? '');
    _prayer = a?.prayer ?? PrayerName.fajr;
    _offsetMinutes = a?.offsetMinutes ?? 0;
    _daySelected = List.generate(
      7,
      (i) => a == null ? true : a.days.contains(i),
    );
    _notificationType = a?.notificationType ?? AgendaNotificationType.sound;
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  List<int> get _selectedDays =>
      [for (var i = 0; i < 7; i++) if (_daySelected[i]) i];

  String _offsetLabel() {
    if (_offsetMinutes == 0) return 'At prayer time';
    if (_offsetMinutes < 0) return '${_offsetMinutes.abs()} min before';
    return '$_offsetMinutes min after';
  }

  Future<void> _save() async {
    final label = _labelController.text.trim();
    if (label.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Label cannot be empty')),
      );
      return;
    }

    final notifier = ref.read(agendaProvider.notifier);
    if (widget.agenda == null) {
      await notifier.add(
        label: label,
        prayer: _prayer,
        offsetMinutes: _offsetMinutes,
        days: _selectedDays,
        notificationType: _notificationType,
      );
    } else {
      await notifier.update(
        widget.agenda!.copyWith(
          label: label,
          prayer: _prayer,
          offsetMinutes: _offsetMinutes,
          days: _selectedDays,
          notificationType: _notificationType,
        ),
      );
    }

    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.agenda == null ? 'New Agenda' : 'Edit Agenda'),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Label
          TextField(
            controller: _labelController,
            decoration: const InputDecoration(
              labelText: 'Label',
              hintText: 'e.g. Wake for Fajr',
              border: OutlineInputBorder(),
            ),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 20),

          // Prayer picker
          Text('Prayer', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          InputDecorator(
            decoration: const InputDecoration(border: OutlineInputBorder()),
            child: DropdownButton<PrayerName>(
              value: _prayer,
              isExpanded: true,
              underline: const SizedBox.shrink(),
              items: PrayerName.values
                  .map(
                    (p) => DropdownMenuItem(
                      value: p,
                      child: Text(_prayerDisplayName(p)),
                    ),
                  )
                  .toList(),
              onChanged: (v) {
                if (v != null) setState(() => _prayer = v);
              },
            ),
          ),
          const SizedBox(height: 20),

          // Offset slider
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Time offset', style: Theme.of(context).textTheme.titleMedium),
              Text(
                _offsetLabel(),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
          Slider(
            value: _offsetMinutes.toDouble(),
            min: -60,
            max: 60,
            divisions: 24, // steps of 5 minutes
            label: _offsetLabel(),
            onChanged: (v) =>
                setState(() => _offsetMinutes = (v / 5).round() * 5),
          ),
          const SizedBox(height: 20),

          // Day picker
          Text('Repeat', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ToggleButtons(
            isSelected: _daySelected,
            onPressed: (i) => setState(() => _daySelected[i] = !_daySelected[i]),
            borderRadius: BorderRadius.circular(8),
            constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
            children: _dayLabels
                .map((d) => Text(d, style: const TextStyle(fontSize: 13)))
                .toList(),
          ),
          const SizedBox(height: 20),

          // Notification type
          Text(
            'Notification type',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: AgendaNotificationType.values.map((t) {
              return ChoiceChip(
                label: Text(_notificationTypeLabel(t)),
                selected: _notificationType == t,
                onSelected: (_) => setState(() => _notificationType = t),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  String _prayerDisplayName(PrayerName p) {
    switch (p) {
      case PrayerName.fajr:
        return 'Fajr';
      case PrayerName.sunrise:
        return 'Sunrise';
      case PrayerName.dhuhr:
        return 'Dhuhr';
      case PrayerName.asr:
        return 'Asr';
      case PrayerName.maghrib:
        return 'Maghrib';
      case PrayerName.isha:
        return 'Isha';
    }
  }

  String _notificationTypeLabel(AgendaNotificationType t) {
    switch (t) {
      case AgendaNotificationType.silent:
        return 'Silent';
      case AgendaNotificationType.sound:
        return 'Sound';
      case AgendaNotificationType.vibrate:
        return 'Vibrate';
    }
  }
}
