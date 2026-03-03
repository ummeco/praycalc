import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:praycalc_app/main.dart';

void main() {
  testWidgets('App smoke test — renders without error', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: PrayCalcApp()));
    // App renders the home route via GoRouter
    expect(tester.takeException(), isNull);
  });
}
