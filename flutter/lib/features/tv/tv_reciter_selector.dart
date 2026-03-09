import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';
import '../../core/services/tv_quran_service.dart';

/// D-pad navigable list of Quran reciters.
/// Used in TV Settings to pick the active reciter for Quran audio mode.
class TvReciterSelector extends StatelessWidget {
  const TvReciterSelector({
    super.key,
    required this.selectedId,
    required this.onSelected,
  });

  final String selectedId;
  final void Function(QuranReciter) onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: kQuranReciters.map((reciter) {
        final selected = reciter.id == selectedId;
        return _ReciterTile(
          reciter: reciter,
          selected: selected,
          onSelected: () => onSelected(reciter),
        );
      }).toList(),
    );
  }
}

class _ReciterTile extends StatefulWidget {
  const _ReciterTile({
    required this.reciter,
    required this.selected,
    required this.onSelected,
  });

  final QuranReciter reciter;
  final bool selected;
  final VoidCallback onSelected;

  @override
  State<_ReciterTile> createState() => _ReciterTileState();
}

class _ReciterTileState extends State<_ReciterTile> {
  bool _focused = false;

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
          padding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: widget.selected
                ? PrayCalcColors.dark
                : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _focused || widget.selected
                  ? PrayCalcColors.mid
                  : Colors.white12,
              width: _focused ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Text(
                widget.reciter.emoji,
                style: const TextStyle(fontSize: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  widget.reciter.name,
                  style: TextStyle(
                    color: widget.selected
                        ? PrayCalcColors.light
                        : Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Text(
                widget.reciter.country,
                style: const TextStyle(
                    color: Colors.white54, fontSize: 14),
              ),
              if (widget.selected) ...[
                const SizedBox(width: 12),
                const Icon(Icons.check_circle, color: PrayCalcColors.mid),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
