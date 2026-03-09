import 'package:flutter/material.dart';

import '../../shared/models/tv_settings_model.dart';

// ---------------------------------------------------------------------------
// TvCanvasLayout
// ---------------------------------------------------------------------------

/// Composes a prayer rail and a content canvas, placing the rail on the
/// requested screen edge and letting the canvas fill the remaining space.
///
/// The rail casts a subtle drop shadow toward the canvas so it visually
/// floats above the content.
class TvCanvasLayout extends StatelessWidget {
  const TvCanvasLayout({
    super.key,
    required this.railPosition,
    required this.rail,
    required this.canvas,
    this.attributionText,
  });

  final TvRailPosition railPosition;
  final Widget rail;
  final Widget canvas;

  /// Attribution line shown bottom-right at 35% opacity, sourced from the
  /// remote platform config (TvPlatformConfigService). Pass null to hide.
  final String? attributionText;

  @override
  Widget build(BuildContext context) {
    final layout = _buildLayout();
    if (attributionText == null || attributionText!.isEmpty) return layout;

    return Stack(
      children: [
        layout,
        Positioned(
          right: 12,
          bottom: 8,
          child: Text(
            attributionText!,
            style: const TextStyle(
              color: Color(0x59FFFFFF), // white 35%
              fontSize: 13,
              fontFamily: 'Amiri',
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLayout() {
    switch (railPosition) {
      case TvRailPosition.top:
        return Column(
          children: [
            _shadowedRail(rail, _RailShadowDirection.down),
            Expanded(child: canvas),
          ],
        );

      case TvRailPosition.bottom:
        return Column(
          children: [
            Expanded(child: canvas),
            _shadowedRail(rail, _RailShadowDirection.up),
          ],
        );

      case TvRailPosition.left:
        return Row(
          children: [
            _shadowedRail(rail, _RailShadowDirection.right),
            Expanded(child: canvas),
          ],
        );

      case TvRailPosition.right:
        return Row(
          children: [
            Expanded(child: canvas),
            _shadowedRail(rail, _RailShadowDirection.left),
          ],
        );
    }
  }

  Widget _shadowedRail(Widget child, _RailShadowDirection direction) {
    return DecoratedBox(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.45),
            blurRadius: 12,
            offset: direction.offset,
          ),
        ],
      ),
      child: child,
    );
  }
}

// ---------------------------------------------------------------------------
// _RailShadowDirection — shadow offset toward the canvas
// ---------------------------------------------------------------------------

enum _RailShadowDirection {
  down,
  up,
  right,
  left;

  Offset get offset {
    switch (this) {
      case _RailShadowDirection.down:
        return const Offset(0, 4);
      case _RailShadowDirection.up:
        return const Offset(0, -4);
      case _RailShadowDirection.right:
        return const Offset(4, 0);
      case _RailShadowDirection.left:
        return const Offset(-4, 0);
    }
  }
}
