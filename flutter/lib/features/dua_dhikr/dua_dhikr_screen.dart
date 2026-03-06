import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../tasbeeh/tasbeeh_screen.dart';
import 'adhkar_tab.dart';
import 'duas_tab.dart';
import 'adhkar_data.dart';

/// Dua & Dhikr screen with tabs: Tasbeeh | Morning | Evening | Duas
class DuaDhikrScreen extends ConsumerStatefulWidget {
  const DuaDhikrScreen({super.key});

  @override
  ConsumerState<DuaDhikrScreen> createState() => _DuaDhikrScreenState();
}

class _DuaDhikrScreenState extends ConsumerState<DuaDhikrScreen>
    with TickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dua & Dhikr'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Tasbeeh'),
            Tab(text: 'Morning'),
            Tab(text: 'Evening'),
            Tab(text: 'Duas'),
          ],
          isScrollable: false,
          labelPadding: const EdgeInsets.symmetric(horizontal: 8),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          const TasbeehTab(),
          AdhkarTab(adhkar: morningAdhkar, title: 'Morning Adhkar'),
          AdhkarTab(adhkar: eveningAdhkar, title: 'Evening Adhkar'),
          const DuasTab(),
        ],
      ),
    );
  }
}

/// Wrapper that embeds the existing TasbeehScreen body (without its own Scaffold).
class TasbeehTab extends ConsumerStatefulWidget {
  const TasbeehTab({super.key});

  @override
  ConsumerState<TasbeehTab> createState() => _TasbeehTabState();
}

class _TasbeehTabState extends ConsumerState<TasbeehTab>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return const TasbeehBody();
  }
}
