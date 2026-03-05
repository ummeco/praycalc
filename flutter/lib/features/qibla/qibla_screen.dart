import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';

/// Qibla compass screen — PC-3.8.
/// Uses device magnetometer + accelerometer via flutter_compass.
/// Qibla bearing calculated from the great-circle formula.
class QiblaScreen extends ConsumerWidget {
  const QiblaScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final city = ref.watch(cityProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Qibla')),
      body: city == null
          ? const Center(
              child: Text(
                'Set your city first\nto calculate the Qibla direction.',
                textAlign: TextAlign.center,
              ),
            )
          : _CompassBody(city: city, qiblaBearing: _qiblaBearing(city)),
    );
  }

  /// Great-circle bearing from [city] to the Kaaba in Mecca.
  static double _qiblaBearing(City from) {
    const double meccaLat = 21.4225 * math.pi / 180;
    const double meccaLng = 39.8262 * math.pi / 180;
    final lat = from.lat * math.pi / 180;
    final lng = from.lng * math.pi / 180;
    final dLng = meccaLng - lng;
    final y = math.sin(dLng) * math.cos(meccaLat);
    final x = math.cos(lat) * math.sin(meccaLat) -
        math.sin(lat) * math.cos(meccaLat) * math.cos(dLng);
    return (math.atan2(y, x) * 180 / math.pi + 360) % 360;
  }
}

class _CompassBody extends StatelessWidget {
  const _CompassBody({required this.city, required this.qiblaBearing});
  final City city;
  final double qiblaBearing;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<CompassEvent>(
      stream: FlutterCompass.events,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const Center(child: Text('Compass sensor unavailable on this device.'));
        }
        if (!snapshot.hasData) {
          return const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Waiting for compass...'),
              ],
            ),
          );
        }

        final double heading = snapshot.data?.heading ?? 0.0;
        final double qiblaAngle = (qiblaBearing - heading) * math.pi / 180;
        final bool isAccurate = (snapshot.data?.accuracy ?? 999) < 15;

        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isAccurate)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Card(
                  color: Theme.of(context).colorScheme.tertiaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Icon(Icons.warning_amber, color: Theme.of(context).colorScheme.onTertiaryContainer),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Calibrate: move your phone in a figure-8 motion.',
                            style: TextStyle(color: Theme.of(context).colorScheme.onTertiaryContainer),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 16),
            _QiblaCompass(qiblaAngle: qiblaAngle),
            const SizedBox(height: 24),
            Text(
              '${qiblaBearing.round()}° from North',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text(
              _distanceToMecca(city),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 4),
            Text(
              'From ${city.displayName}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        );
      },
    );
  }

  String _distanceToMecca(City from) {
    const double r = 6371;
    const double mLat = 21.4225 * math.pi / 180;
    const double mLng = 39.8262 * math.pi / 180;
    final lat = from.lat * math.pi / 180;
    final lng = from.lng * math.pi / 180;
    final dLat = mLat - lat;
    final dLng = mLng - lng;
    final a = math.pow(math.sin(dLat / 2), 2) +
        math.cos(lat) * math.cos(mLat) * math.pow(math.sin(dLng / 2), 2);
    final dist = r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    final km = dist.round();
    // Format with comma thousands separator
    final formatted = km.toString().replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+$)'),
      (m) => '${m[1]},',
    );
    return '$formatted km from the Kaaba';
  }
}

class _QiblaCompass extends StatelessWidget {
  const _QiblaCompass({required this.qiblaAngle});
  final double qiblaAngle;

  @override
  Widget build(BuildContext context) {
    final isAligned = (qiblaAngle % (2 * math.pi)).abs() < 5 * math.pi / 180;
    final cs = Theme.of(context).colorScheme;

    return SizedBox(
      width: 240,
      height: 240,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 240,
            height: 240,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isAligned ? PrayCalcColors.mid : cs.outline,
                width: isAligned ? 4 : 2,
              ),
            ),
          ),
          Transform.rotate(
            angle: qiblaAngle,
            child: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.navigation, size: 80),
                SizedBox(height: 4),
                Text('🕋', style: TextStyle(fontSize: 20)),
              ],
            ),
          ),
          if (isAligned)
            Positioned(
              bottom: 8,
              child: Builder(
                builder: (context) {
                  final primary = Theme.of(context).colorScheme.primary;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Facing Qibla ✓',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
