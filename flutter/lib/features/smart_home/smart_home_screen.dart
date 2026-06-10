// smart_home_screen.dart — v1.1 Smart Home screen + routine editor.
// Spec §11.1, S19-E T27
//
// Routes:
//   /settings/smart-home                    → SmartHomeScreen (routine list)
//   /settings/smart-home/routines           → SmartHomeRoutinesScreen
//   /settings/smart-home/routines/new       → SmartHomeRoutineEditorScreen (create)
//   /settings/smart-home/routines/:id       → SmartHomeRoutineEditorScreen (edit)
//
// Gated behind FF_SMART_HOME feature flag + Ummat+ subscription check.
// Per D-S19-03: Smart Home = Ummat+ only.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/feature_flags_provider.dart';
import '../../core/providers/subscription_provider.dart';
import '../../core/services/smart_home_api_service.dart';
import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Data models
// ---------------------------------------------------------------------------

enum RoutinePlatform { googleHome, alexa, homekit }
enum ActionType { lightColor, lightBrightness, speakerAudio }

class SmartHomeRoutine {
  final String? id;
  final String triggerPrayer;      // "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
  final int    offsetMinutes;      // ±minutes relative to prayer time
  final List<String> daysOfWeek;  // ["Mon","Tue",…] — empty = every day
  final RoutinePlatform platform;
  final List<String> deviceIds;
  final ActionType   actionType;
  final String       actionValue;  // hex color / brightness% / audio URL
  final int          durationSeconds;
  final bool         revertAfter;
  final bool         enabled;

  const SmartHomeRoutine({
    this.id,
    this.triggerPrayer    = 'Fajr',
    this.offsetMinutes    = 0,
    this.daysOfWeek       = const [],
    this.platform         = RoutinePlatform.googleHome,
    this.deviceIds        = const [],
    this.actionType       = ActionType.lightColor,
    this.actionValue      = '#C9F27A',
    this.durationSeconds  = 300,
    this.revertAfter      = true,
    this.enabled          = true,
  });

  SmartHomeRoutine copyWith({
    String? id, String? triggerPrayer, int? offsetMinutes,
    List<String>? daysOfWeek, RoutinePlatform? platform,
    List<String>? deviceIds, ActionType? actionType,
    String? actionValue, int? durationSeconds,
    bool? revertAfter, bool? enabled,
  }) => SmartHomeRoutine(
    id:              id              ?? this.id,
    triggerPrayer:   triggerPrayer   ?? this.triggerPrayer,
    offsetMinutes:   offsetMinutes   ?? this.offsetMinutes,
    daysOfWeek:      daysOfWeek      ?? this.daysOfWeek,
    platform:        platform        ?? this.platform,
    deviceIds:       deviceIds       ?? this.deviceIds,
    actionType:      actionType      ?? this.actionType,
    actionValue:     actionValue     ?? this.actionValue,
    durationSeconds: durationSeconds ?? this.durationSeconds,
    revertAfter:     revertAfter     ?? this.revertAfter,
    enabled:         enabled         ?? this.enabled,
  );
}

// ---------------------------------------------------------------------------
// SmartHomeScreen — routine list (the /settings/smart-home root)
// ---------------------------------------------------------------------------

class SmartHomeScreen extends ConsumerStatefulWidget {
  const SmartHomeScreen({super.key});

  @override
  ConsumerState<SmartHomeScreen> createState() => _SmartHomeScreenState();
}

class _SmartHomeScreenState extends ConsumerState<SmartHomeScreen> {
  List<SmartHomeRoutine> _routines = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api  = ref.read(smartHomeApiServiceProvider);
      final list = await api.fetchRoutines();
      if (!mounted) return;
      setState(() { _routines = list; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ff        = ref.watch(featureFlagsProvider);
    final isPro     = ref.watch(subscriptionProvider).isUmmatPlus;

    // FF gate
    if (!ff.smartHome) {
      return Scaffold(
        appBar: AppBar(title: const Text('Smart Home')),
        body: const Center(child: Text('Smart Home is not available.',
            style: TextStyle(color: Colors.white54))),
      );
    }

    // Ummat+ gate
    if (!isPro) {
      return Scaffold(
        appBar: AppBar(title: const Text('Smart Home')),
        body: _buildUpsell(context),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Home Routines'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Routine',
            onPressed: () => context.push('/settings/smart-home/routines/new')
                .then((_) => _load()),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _routines.isEmpty
              ? _buildEmpty(context)
              : _buildList(),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.home_outlined, size: 56, color: Colors.white.withAlpha(77)),
          const SizedBox(height: 16),
          const Text('No routines yet',
              style: TextStyle(color: Colors.white54, fontSize: 15)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.add),
            label: const Text('Create Routine'),
            style: ElevatedButton.styleFrom(
              backgroundColor: PrayCalcColors.mid,
              foregroundColor: Colors.black,
            ),
            onPressed: () =>
                context.push('/settings/smart-home/routines/new').then((_) => _load()),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    return ListView.builder(
      itemCount: _routines.length,
      itemBuilder: (context, i) {
        final r = _routines[i];
        return ListTile(
          title: Text('${r.triggerPrayer}${r.offsetMinutes != 0 ? ' ${r.offsetMinutes > 0 ? '+' : ''}${r.offsetMinutes}m' : ''}'),
          subtitle: Text(_platformLabel(r.platform),
              style: const TextStyle(color: Colors.white54, fontSize: 12)),
          trailing: Switch(
            value: r.enabled,
            onChanged: (v) async {
              final api = ref.read(smartHomeApiServiceProvider);
              await api.toggleRoutine(r.id!, v);
              _load();
            },
          ),
          onTap: () => context
              .push('/settings/smart-home/routines/${r.id}')
              .then((_) => _load()),
        );
      },
    );
  }

  Widget _buildUpsell(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline,
                size: 48, color: PrayCalcColors.light.withAlpha(153)),
            const SizedBox(height: 16),
            Text(
              'Smart Home Routines',
              style: TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 18,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Automate lights, speakers, and smart devices around prayer times.\n\nAvailable with Ummat+.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white54, fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: PrayCalcColors.mid,
                foregroundColor: Colors.black,
              ),
              onPressed: () => context.push('/subscribe'),
              child: const Text('Upgrade to Ummat+'),
            ),
          ],
        ),
      ),
    );
  }

  String _platformLabel(RoutinePlatform p) {
    switch (p) {
      case RoutinePlatform.googleHome: return 'Google Home';
      case RoutinePlatform.alexa:      return 'Amazon Alexa';
      case RoutinePlatform.homekit:    return 'Apple HomeKit';
    }
  }
}

// ---------------------------------------------------------------------------
// SmartHomeRoutineEditorScreen — create / edit a single routine
// ---------------------------------------------------------------------------

class SmartHomeRoutineEditorScreen extends ConsumerStatefulWidget {
  final String? routineId;  // null = new
  const SmartHomeRoutineEditorScreen({super.key, this.routineId});

  @override
  ConsumerState<SmartHomeRoutineEditorScreen> createState() =>
      _SmartHomeRoutineEditorScreenState();
}

class _SmartHomeRoutineEditorScreenState
    extends ConsumerState<SmartHomeRoutineEditorScreen> {

  late SmartHomeRoutine _routine;
  bool _loading   = false;
  bool _saving    = false;
  String? _error;

  static const _prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  static const _days    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  void initState() {
    super.initState();
    _routine = const SmartHomeRoutine();
    if (widget.routineId != null) _loadExisting();
  }

  Future<void> _loadExisting() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(smartHomeApiServiceProvider);
      final r   = await api.fetchRoutine(widget.routineId!);
      if (!mounted) return;
      setState(() { _routine = r; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.toString(); });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.routineId == null ? 'New Routine' : 'Edit Routine'),
        actions: [
          if (!_saving)
            TextButton(
              onPressed: _save,
              child: Text('Save',
                  style: TextStyle(color: PrayCalcColors.light)),
            ),
          if (_saving)
            const Padding(
              padding: EdgeInsets.all(12),
              child: SizedBox(width: 20, height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2)),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error',
                  style: const TextStyle(color: Colors.redAccent)))
              : _buildForm(),
    );
  }

  Widget _buildForm() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Trigger prayer
        _section('Trigger'),
        DropdownButtonFormField<String>(
          value: _routine.triggerPrayer,
          decoration: const InputDecoration(labelText: 'Prayer'),
          items: _prayers.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
          onChanged: (v) => setState(() => _routine = _routine.copyWith(triggerPrayer: v)),
        ),
        const SizedBox(height: 12),

        // Offset minutes
        Row(children: [
          const Text('Offset (minutes)'),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.remove),
            onPressed: () => setState(
              () => _routine = _routine.copyWith(offsetMinutes: _routine.offsetMinutes - 5),
            ),
          ),
          Text('${_routine.offsetMinutes > 0 ? '+' : ''}${_routine.offsetMinutes}m',
              style: const TextStyle(fontSize: 16)),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => setState(
              () => _routine = _routine.copyWith(offsetMinutes: _routine.offsetMinutes + 5),
            ),
          ),
        ]),

        // Days of week
        const SizedBox(height: 8),
        _section('Repeat'),
        Wrap(
          spacing: 6,
          children: _days.map((day) {
            final selected = _routine.daysOfWeek.contains(day);
            return FilterChip(
              label: Text(day),
              selected: selected,
              onSelected: (v) {
                final days = List<String>.from(_routine.daysOfWeek);
                v ? days.add(day) : days.remove(day);
                setState(() => _routine = _routine.copyWith(daysOfWeek: days));
              },
            );
          }).toList(),
        ),
        if (_routine.daysOfWeek.isEmpty)
          const Text('Every day', style: TextStyle(color: Colors.white54, fontSize: 12)),

        const SizedBox(height: 16),
        _section('Platform'),
        DropdownButtonFormField<RoutinePlatform>(
          value: _routine.platform,
          decoration: const InputDecoration(labelText: 'Smart Home Platform'),
          items: const [
            DropdownMenuItem(value: RoutinePlatform.googleHome, child: Text('Google Home')),
            DropdownMenuItem(value: RoutinePlatform.alexa,      child: Text('Amazon Alexa')),
            DropdownMenuItem(value: RoutinePlatform.homekit,    child: Text('Apple HomeKit')),
          ],
          onChanged: (v) => setState(() => _routine = _routine.copyWith(platform: v)),
        ),

        const SizedBox(height: 16),
        _section('Action'),
        DropdownButtonFormField<ActionType>(
          value: _routine.actionType,
          decoration: const InputDecoration(labelText: 'Action Type'),
          items: const [
            DropdownMenuItem(value: ActionType.lightColor,      child: Text('Light Color')),
            DropdownMenuItem(value: ActionType.lightBrightness, child: Text('Light Brightness')),
            DropdownMenuItem(value: ActionType.speakerAudio,    child: Text('Speaker Audio')),
          ],
          onChanged: (v) => setState(() => _routine = _routine.copyWith(actionType: v)),
        ),
        const SizedBox(height: 8),

        if (_routine.actionType == ActionType.lightColor)
          TextFormField(
            initialValue: _routine.actionValue,
            decoration: const InputDecoration(
              labelText: 'Color (hex)',
              hintText: '#C9F27A',
            ),
            onChanged: (v) => setState(() => _routine = _routine.copyWith(actionValue: v)),
          ),
        if (_routine.actionType == ActionType.lightBrightness)
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Brightness: ${_routine.actionValue}%',
                style: const TextStyle(fontSize: 13)),
            Slider(
              value: double.tryParse(_routine.actionValue) ?? 80,
              min: 0, max: 100, divisions: 20,
              onChanged: (v) => setState(
                () => _routine = _routine.copyWith(actionValue: v.round().toString()),
              ),
            ),
          ]),
        if (_routine.actionType == ActionType.speakerAudio)
          TextFormField(
            initialValue: _routine.actionValue,
            decoration: const InputDecoration(
              labelText: 'Audio URL or identifier',
            ),
            onChanged: (v) => setState(() => _routine = _routine.copyWith(actionValue: v)),
          ),

        const SizedBox(height: 16),
        _section('Duration'),
        Row(children: [
          const Text('Duration'),
          const Spacer(),
          DropdownButton<int>(
            value: [60, 120, 300, 600, 900].contains(_routine.durationSeconds)
                ? _routine.durationSeconds : 300,
            items: const [
              DropdownMenuItem(value: 60,  child: Text('1 min')),
              DropdownMenuItem(value: 120, child: Text('2 min')),
              DropdownMenuItem(value: 300, child: Text('5 min')),
              DropdownMenuItem(value: 600, child: Text('10 min')),
              DropdownMenuItem(value: 900, child: Text('15 min')),
            ],
            onChanged: (v) =>
                setState(() => _routine = _routine.copyWith(durationSeconds: v)),
          ),
        ]),
        SwitchListTile(
          title: const Text('Revert after duration'),
          subtitle: Text('Restore lights/audio to previous state',
              style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12)),
          value: _routine.revertAfter,
          onChanged: (v) =>
              setState(() => _routine = _routine.copyWith(revertAfter: v)),
        ),

        const SizedBox(height: 32),
      ],
    );
  }

  Widget _section(String label) {
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 8),
      child: Text(label,
          style: TextStyle(
            color: PrayCalcColors.light,
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          )),
    );
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final api = ref.read(smartHomeApiServiceProvider);
      if (widget.routineId == null) {
        await api.createRoutine(_routine);
      } else {
        await api.updateRoutine(_routine);
      }
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        setState(() { _saving = false; _error = e.toString(); });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e')),
        );
      }
    }
  }
}
