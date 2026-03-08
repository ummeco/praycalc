import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../shared/models/tv_settings_model.dart';
import '../../core/theme/app_theme.dart';

/// Horizontally scrollable, D-pad-navigable row of layout preset cards.
///
/// Each card shows a miniature diagram of the layout and a name label.
/// Selecting a card (tap or D-pad enter/select) calls [onSelected].
class TvLayoutSelector extends StatelessWidget {
  const TvLayoutSelector({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final TvLayoutPreset selected;
  final void Function(TvLayoutPreset) onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: TvLayoutPreset.values.map((preset) {
          return _LayoutPresetCard(
            preset: preset,
            isSelected: preset == selected,
            onSelected: () => onSelected(preset),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------

class _LayoutPresetCard extends StatelessWidget {
  const _LayoutPresetCard({
    required this.preset,
    required this.isSelected,
    required this.onSelected,
  });

  final TvLayoutPreset preset;
  final bool isSelected;
  final VoidCallback onSelected;

  String get _label {
    switch (preset) {
      case TvLayoutPreset.prayerOnly:
        return 'Prayer Focus';
      case TvLayoutPreset.splitStream:
        return 'Live + Prayers';
      case TvLayoutPreset.splitArt:
        return 'Art + Prayers';
      case TvLayoutPreset.infoRich:
        return 'Full Dashboard';
      case TvLayoutPreset.masjid:
        return 'Masjid Signage';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onSelected();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(builder: (ctx) {
        final focused = Focus.of(ctx).hasFocus;
        return GestureDetector(
          onTap: onSelected,
          child: Container(
            width: 160,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: isSelected ? PrayCalcColors.dark : PrayCalcColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: focused || isSelected
                    ? PrayCalcColors.mid
                    : Colors.white12,
                width: focused ? 3 : isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _PresetDiagram(preset: preset),
                const SizedBox(height: 12),
                Text(
                  _label,
                  style: TextStyle(
                    color:
                        isSelected ? PrayCalcColors.light : Colors.white70,
                    fontSize: 14,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      }),
    );
  }
}

// ---------------------------------------------------------------------------

class _PresetDiagram extends StatelessWidget {
  const _PresetDiagram({required this.preset});

  final TvLayoutPreset preset;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 80,
      height: 50,
      child: CustomPaint(painter: _DiagramPainter(preset)),
    );
  }
}

class _DiagramPainter extends CustomPainter {
  _DiagramPainter(this.preset);

  final TvLayoutPreset preset;

  @override
  void paint(Canvas canvas, Size size) {
    final bg = Paint()..color = const Color(0xFF1E5E2F).withAlpha(80);
    final panel = Paint()..color = const Color(0xFF79C24C).withAlpha(160);
    final bar = Paint()..color = const Color(0xFF79C24C).withAlpha(100);
    const r = Radius.circular(3);

    // Outer background
    canvas.drawRRect(
      RRect.fromRectAndRadius(Offset.zero & size, r),
      bg,
    );

    switch (preset) {
      case TvLayoutPreset.prayerOnly:
        // Right panel + bottom bar
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(
                size.width * 0.5, 4, size.width * 0.46, size.height - 16),
            r,
          ),
          panel,
        );
        canvas.drawRect(
          Rect.fromLTWH(4, size.height - 10, size.width - 8, 6),
          bar,
        );

      case TvLayoutPreset.splitStream:
        // Left 60% + right 40%
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(4, 4, size.width * 0.54, size.height - 8),
            r,
          ),
          panel,
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(
                size.width * 0.60, 4, size.width * 0.36, size.height - 8),
            r,
          ),
          panel,
        );

      case TvLayoutPreset.splitArt:
        // Left 65% + right 35% + bottom bar
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(4, 4, size.width * 0.60, size.height - 16),
            r,
          ),
          panel,
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(
                size.width * 0.65, 4, size.width * 0.31, size.height - 16),
            r,
          ),
          panel,
        );
        canvas.drawRect(
          Rect.fromLTWH(4, size.height - 10, size.width - 8, 6),
          bar,
        );

      case TvLayoutPreset.infoRich:
        // Top bar + left 50% + right 50% + bottom bar
        canvas.drawRect(
          Rect.fromLTWH(4, 4, size.width - 8, 6),
          bar,
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(4, 12, size.width * 0.44, size.height - 24),
            r,
          ),
          panel,
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(
                size.width * 0.50, 12, size.width * 0.46, size.height - 24),
            r,
          ),
          panel,
        );
        canvas.drawRect(
          Rect.fromLTWH(4, size.height - 10, size.width - 8, 6),
          bar,
        );

      case TvLayoutPreset.masjid:
        // Full-width panel + bottom crawler
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(4, 4, size.width - 8, size.height - 16),
            r,
          ),
          panel,
        );
        canvas.drawRect(
          Rect.fromLTWH(4, size.height - 10, size.width - 8, 6),
          bar,
        );
    }
  }

  @override
  bool shouldRepaint(_DiagramPainter old) => old.preset != preset;
}
