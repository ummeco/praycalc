import 'package:flutter/material.dart';
import '../../shared/models/tv_settings_model.dart';

/// Renders the TV display according to a [TvLayoutSettings] configuration.
///
/// Callers supply pre-built widgets for each slot; null slots are omitted.
///
/// TV2-2.6 NOTE: real-time WebSocket push for announcement/hadith bar content
/// is not yet wired — the [topBarWidget] and [bottomBarWidget] slots accept any
/// widget, so a future StreamBuilder wrapping an adhan WebSocket subscription
/// can be passed in without changing this class.
class TvLayoutManager extends StatelessWidget {
  const TvLayoutManager({
    super.key,
    required this.layout,
    this.leftPanelWidget,
    this.rightPanelWidget,
    this.topBarWidget,
    this.bottomBarWidget,
    this.backgroundWidget,
  });

  final TvLayoutSettings layout;
  final Widget? leftPanelWidget;
  final Widget? rightPanelWidget;
  final Widget? topBarWidget;
  final Widget? bottomBarWidget;

  /// Optional full-screen background (drawn beneath all panels).
  final Widget? backgroundWidget;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (backgroundWidget != null)
          Positioned.fill(child: backgroundWidget!),

        Column(
          children: [
            if (topBarWidget != null)
              SizedBox(height: 56, child: topBarWidget!),

            Expanded(child: _buildMainPanels()),

            if (bottomBarWidget != null)
              SizedBox(height: 56, child: bottomBarWidget!),
          ],
        ),
      ],
    );
  }

  Widget _buildMainPanels() {
    final hasLeft = leftPanelWidget != null;
    final hasRight = rightPanelWidget != null;

    if (hasLeft && hasRight) {
      final leftFlex = _leftFlex;
      final rightFlex = 10 - leftFlex;
      return Row(
        children: [
          Expanded(flex: leftFlex, child: leftPanelWidget!),
          Expanded(flex: rightFlex, child: rightPanelWidget!),
        ],
      );
    } else if (hasLeft) {
      return leftPanelWidget!;
    } else if (hasRight) {
      return rightPanelWidget!;
    }
    return const SizedBox.expand();
  }

  /// Left panel flex out of 10 total units.
  int get _leftFlex {
    switch (layout.preset) {
      case TvLayoutPreset.splitStream:
        return 6;
      case TvLayoutPreset.splitArt:
        return 7;
      case TvLayoutPreset.infoRich:
        return 5;
      default:
        return 5;
    }
  }
}
