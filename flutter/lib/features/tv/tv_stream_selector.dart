import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';
import 'tv_stream_library.dart';

/// D-pad navigable list of streams with emoji thumbnails and names.
/// Used in TV Settings to pick the active background stream.
///
/// Displays built-in streams followed by user-defined custom streams.
/// An "Add Custom URL" tile at the bottom opens a dialog to add a new stream.
/// Custom streams show an edit/delete icon.
class TvStreamSelector extends ConsumerWidget {
  const TvStreamSelector({
    super.key,
    required this.selectedId,
    required this.onSelected,
  });

  final String? selectedId;
  final void Function(TvStream) onSelected;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tvSettings = ref.watch(tvSettingsProvider);
    final customStreams = tvSettings.customStreams;

    // Convert custom streams to TvStream objects for unified display.
    final customAsTvStreams = customStreams.map((c) => TvStream(
          id: c.id,
          name: c.name,
          url: c.url,
          type: TvStreamType.audio,
          thumbnailEmoji: '📡',
          category: 'custom',
          isCustom: true,
        ));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...kBuiltInStreams.map((stream) => _StreamTile(
              stream: stream,
              isSelected: stream.id == selectedId,
              onSelected: () => onSelected(stream),
            )),
        ...customAsTvStreams.map((stream) => _StreamTile(
              stream: stream,
              isSelected: stream.id == selectedId,
              onSelected: () => onSelected(stream),
              onDelete: () =>
                  ref.read(tvSettingsProvider.notifier).removeCustomStream(stream.id),
            )),
        _AddCustomUrlTile(
          onAdd: (TvCustomStream custom) {
            ref.read(tvSettingsProvider.notifier).addCustomStream(custom);
          },
        ),
      ],
    );
  }
}

class _StreamTile extends StatefulWidget {
  const _StreamTile({
    required this.stream,
    required this.isSelected,
    required this.onSelected,
    this.onDelete,
  });

  final TvStream stream;
  final bool isSelected;
  final VoidCallback onSelected;
  final VoidCallback? onDelete;

  @override
  State<_StreamTile> createState() => _StreamTileState();
}

class _StreamTileState extends State<_StreamTile> {
  bool _focused = false;
  bool _offline = false;

  @override
  void initState() {
    super.initState();
    _offline = !TvStreamHealthChecker.isHealthy(widget.stream.id);
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (f) => setState(() => _focused = f),
      onKeyEvent: (_, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          widget.onSelected();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: GestureDetector(
        onTap: widget.onSelected,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: widget.isSelected
                ? PrayCalcColors.dark
                : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _focused || widget.isSelected
                  ? PrayCalcColors.mid
                  : Colors.white12,
              width: _focused ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Text(
                widget.stream.thumbnailEmoji ?? '📺',
                style: const TextStyle(fontSize: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.stream.name,
                      style: TextStyle(
                        color: widget.isSelected
                            ? PrayCalcColors.light
                            : Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          widget.stream.type == TvStreamType.video
                              ? '🎬 Video'
                              : '🎵 Audio',
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 14),
                        ),
                        if (_offline) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'Offline',
                            style:
                                TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (widget.isSelected)
                const Icon(Icons.check_circle, color: PrayCalcColors.mid),
              if (widget.stream.isCustom) ...[
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: widget.onDelete,
                  child: const Icon(Icons.delete_outline,
                      color: Colors.white38, size: 22),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Add Custom URL tile
// ---------------------------------------------------------------------------

class _AddCustomUrlTile extends StatefulWidget {
  const _AddCustomUrlTile({required this.onAdd});

  final void Function(TvCustomStream) onAdd;

  @override
  State<_AddCustomUrlTile> createState() => _AddCustomUrlTileState();
}

class _AddCustomUrlTileState extends State<_AddCustomUrlTile> {
  bool _focused = false;

  void _showDialog() {
    showDialog<void>(
      context: context,
      builder: (_) => _AddStreamDialog(onAdd: widget.onAdd),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (f) => setState(() => _focused = f),
      onKeyEvent: (_, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          _showDialog();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: GestureDetector(
        onTap: _showDialog,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          margin: const EdgeInsets.only(top: 4, bottom: 8),
          padding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _focused ? PrayCalcColors.mid : Colors.white24,
              width: _focused ? 2 : 1,
              style: BorderStyle.solid,
            ),
          ),
          child: const Row(
            children: [
              Icon(Icons.add, color: PrayCalcColors.light, size: 24),
              SizedBox(width: 16),
              Text(
                'Add Custom URL',
                style: TextStyle(color: PrayCalcColors.light, fontSize: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Add stream dialog
// ---------------------------------------------------------------------------

class _AddStreamDialog extends StatefulWidget {
  const _AddStreamDialog({required this.onAdd});

  final void Function(TvCustomStream) onAdd;

  @override
  State<_AddStreamDialog> createState() => _AddStreamDialogState();
}

class _AddStreamDialogState extends State<_AddStreamDialog> {
  final _nameCtrl = TextEditingController();
  final _urlCtrl = TextEditingController();
  String? _urlError;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  bool _validateUrl(String url) {
    final uri = Uri.tryParse(url);
    return uri != null &&
        (uri.scheme == 'http' || uri.scheme == 'https') &&
        uri.host.isNotEmpty;
  }

  void _submit() {
    final url = _urlCtrl.text.trim();
    if (!_validateUrl(url)) {
      setState(() => _urlError = 'Enter a valid http:// or https:// URL');
      return;
    }
    final name = _nameCtrl.text.trim().isEmpty
        ? Uri.parse(url).host
        : _nameCtrl.text.trim();
    final custom = TvCustomStream(
      id: 'custom_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      url: url,
    );
    widget.onAdd(custom);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: PrayCalcColors.deep,
      title: const Text(
        'Add Custom Stream',
        style: TextStyle(color: Colors.white),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _nameCtrl,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Name (optional)',
              labelStyle: TextStyle(color: Colors.white54),
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.white24),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: PrayCalcColors.mid),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _urlCtrl,
            style: const TextStyle(color: Colors.white),
            keyboardType: TextInputType.url,
            decoration: InputDecoration(
              labelText: 'Stream URL (http/https)',
              labelStyle: const TextStyle(color: Colors.white54),
              errorText: _urlError,
              enabledBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.white24),
              ),
              focusedBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: PrayCalcColors.mid),
              ),
            ),
            onChanged: (_) {
              if (_urlError != null) setState(() => _urlError = null);
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel',
              style: TextStyle(color: Colors.white54)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: PrayCalcColors.dark,
            foregroundColor: PrayCalcColors.light,
          ),
          onPressed: _submit,
          child: const Text('Add'),
        ),
      ],
    );
  }
}
