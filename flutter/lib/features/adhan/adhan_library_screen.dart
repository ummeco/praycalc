// AdhanLibraryScreen — full-screen adhan voice picker.
//
// Shows 9 built-in voices + a "Custom Recording" slot at the bottom.
// Tap a row to preview; long-press or tap "Use This Voice" to select.
// Route: '/settings/adhan-library'

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';
import 'adhan_library_service.dart';
import 'adhan_voices.dart';

class AdhanLibraryScreen extends StatefulWidget {
  const AdhanLibraryScreen({super.key});

  @override
  State<AdhanLibraryScreen> createState() => _AdhanLibraryScreenState();
}

class _AdhanLibraryScreenState extends State<AdhanLibraryScreen> {
  final _service = AdhanLibraryService.instance;
  AdhanVoice? _previewingVoice;
  late AdhanVoice _pendingSelection;

  @override
  void initState() {
    super.initState();
    _pendingSelection = _service.selected;
    _service.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _service.removeListener(_onServiceUpdate);
    _service.stopPreview();
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  Future<void> _togglePreview(AdhanVoice voice) async {
    if (_previewingVoice?.id == voice.id && _service.isPreviewing) {
      await _service.stopPreview();
      setState(() => _previewingVoice = null);
    } else {
      setState(() => _previewingVoice = voice);
      await _service.previewVoice(voice);
      setState(() {
        if (_service.isPreviewing == false) _previewingVoice = null;
      });
    }
  }

  Future<void> _useSelectedVoice() async {
    await _service.selectVoice(_pendingSelection);
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final allVoices = [...kBuiltInAdhanVoices, kCustomAdhanVoice];

    return Scaffold(
      appBar: AppBar(title: const Text('Adhan Library')),
      body: Column(
        children: [
          Expanded(
            child: ListView.separated(
              itemCount: allVoices.length + 1, // +1 for "Record Custom Adhan" tile
              separatorBuilder: (_, _) => Divider(
                height: 1,
                color: Colors.white.withAlpha(15),
                indent: 72,
              ),
              itemBuilder: (context, i) {
                // Last item: navigate to the recording screen.
                if (i == allVoices.length) {
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.white.withAlpha(15),
                      child: Icon(Icons.fiber_manual_record,
                          size: 20, color: Colors.redAccent.withAlpha(200)),
                    ),
                    title: const Text('Record Custom Adhan'),
                    subtitle: Text(
                      'Use your own voice',
                      style: TextStyle(
                          color: Colors.white.withAlpha(100), fontSize: 12),
                    ),
                    trailing: Icon(Icons.chevron_right,
                        color: Colors.white.withAlpha(80)),
                    onTap: () => context.push(Routes.adhanRecord),
                  );
                }
                final voice = allVoices[i];
                final isSelected = _pendingSelection.id == voice.id;
                final isPreviewing =
                    _previewingVoice?.id == voice.id && _service.isPreviewing;

                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isSelected
                        ? PrayCalcColors.mid.withAlpha(60)
                        : Colors.white.withAlpha(15),
                    child: Icon(
                      voice.isCustom
                          ? Icons.mic_rounded
                          : Icons.mosque_outlined,
                      size: 20,
                      color: isSelected
                          ? PrayCalcColors.light
                          : Colors.white.withAlpha(160),
                    ),
                  ),
                  title: Text(
                    voice.name,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white.withAlpha(200),
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                  subtitle: Text(
                    voice.nameAr,
                    style: TextStyle(
                      color: Colors.white.withAlpha(100),
                      fontSize: 13,
                    ),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (!voice.isCustom)
                        IconButton(
                          icon: Icon(
                            isPreviewing
                                ? Icons.stop_circle_outlined
                                : Icons.play_circle_outline_rounded,
                            color: isPreviewing
                                ? PrayCalcColors.mid
                                : Colors.white.withAlpha(140),
                            size: 26,
                          ),
                          onPressed: () => _togglePreview(voice),
                          tooltip: isPreviewing ? 'Stop' : 'Preview',
                        ),
                      if (isSelected)
                        Icon(Icons.check_circle_rounded,
                            color: PrayCalcColors.light, size: 22),
                    ],
                  ),
                  onTap: () => _togglePreview(voice),
                  onLongPress: () => setState(() => _pendingSelection = voice),
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _useSelectedVoice,
                  style: FilledButton.styleFrom(
                    backgroundColor: PrayCalcColors.mid,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Use "${_pendingSelection.name}"',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
