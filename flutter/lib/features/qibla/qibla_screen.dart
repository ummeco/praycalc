import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart' as ll;

import '../../core/providers/prayer_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';

// ── Constants ────────────────────────────────────────────────────────────────

const double _kMeccaLat = 21.4225;
const double _kMeccaLng = 39.8262;
const double _kMeccaLatRad = _kMeccaLat * math.pi / 180;
const double _kMeccaLngRad = _kMeccaLng * math.pi / 180;

/// Max distance (km) from city center to use GPS-accurate bearing.
const double _kGpsProximityKm = 24.0;

const _kCardinalLabels = ['N', 'E', 'S', 'W'];
const _kCompassDirections = [
  'North', 'North-Northeast', 'Northeast', 'East-Northeast',
  'East', 'East-Southeast', 'Southeast', 'South-Southeast',
  'South', 'South-Southwest', 'Southwest', 'West-Southwest',
  'West', 'West-Northwest', 'Northwest', 'North-Northwest',
];
const _kCompassAbbr = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

double _qiblaBearing(double lat, double lng) {
  final latR = lat * math.pi / 180;
  final lngR = lng * math.pi / 180;
  final dLng = _kMeccaLngRad - lngR;
  final y = math.sin(dLng) * math.cos(_kMeccaLatRad);
  final x = math.cos(latR) * math.sin(_kMeccaLatRad) -
      math.sin(latR) * math.cos(_kMeccaLatRad) * math.cos(dLng);
  return (math.atan2(y, x) * 180 / math.pi + 360) % 360;
}

double _distanceKm(double lat1, double lng1, double lat2, double lng2) {
  const r = 6371.0;
  final la1 = lat1 * math.pi / 180;
  final la2 = lat2 * math.pi / 180;
  final dLat = la2 - la1;
  final dLng = (lng2 - lng1) * math.pi / 180;
  final a = math.pow(math.sin(dLat / 2), 2) +
      math.cos(la1) * math.cos(la2) * math.pow(math.sin(dLng / 2), 2);
  return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
}

String _compassDir(double bearing) {
  final idx = ((bearing + 11.25) % 360 / 22.5).floor();
  return _kCompassAbbr[idx.clamp(0, 15)];
}

String _compassFull(double bearing) {
  final idx = ((bearing + 11.25) % 360 / 22.5).floor();
  return _kCompassDirections[idx.clamp(0, 15)];
}

String _formatKm(double km) {
  final rounded = km.round();
  return rounded.toString().replaceAllMapped(
    RegExp(r'(\d)(?=(\d{3})+$)'),
    (m) => '${m[1]},',
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

class QiblaScreen extends ConsumerWidget {
  const QiblaScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final city = ref.watch(cityProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Qibla'),
        actions: [
          if (city != null)
            IconButton(
              icon: const Icon(Icons.map_outlined),
              tooltip: 'Show on map',
              onPressed: () => _showQiblaMap(context, city),
            ),
        ],
      ),
      body: city == null
          ? const Center(
              child: Text(
                'Set your city first\nto calculate the Qibla direction.',
                textAlign: TextAlign.center,
              ),
            )
          : _CompassBody(city: city),
    );
  }
}

// ── Compass body (GPS + sensor logic) ────────────────────────────────────────

class _CompassBody extends StatefulWidget {
  const _CompassBody({required this.city});
  final City city;

  @override
  State<_CompassBody> createState() => _CompassBodyState();
}

class _CompassBodyState extends State<_CompassBody> {
  Timer? _fallbackTimer;
  bool _showFallback = false;

  // GPS-accurate position (null = use city center)
  double? _gpsLat;
  double? _gpsLng;


  @override
  void initState() {
    super.initState();
    _fallbackTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _showFallback = true);
    });
    _tryGps();
  }

  Future<void> _tryGps() async {
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        final requested = await Geolocator.requestPermission();
        if (requested == LocationPermission.denied ||
            requested == LocationPermission.deniedForever) {
          return;
        }
      }
      if (perm == LocationPermission.deniedForever) {
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 6),
        ),
      );
      final dist = _distanceKm(
        pos.latitude, pos.longitude,
        widget.city.lat, widget.city.lng,
      );
      if (mounted && dist < _kGpsProximityKm) {
        setState(() {
          _gpsLat = pos.latitude;
          _gpsLng = pos.longitude;
        });
      }
    } catch (_) {
      // GPS unavailable — fall back to city center
    }
  }

  double get _activeLat => _gpsLat ?? widget.city.lat;
  double get _activeLng => _gpsLng ?? widget.city.lng;
  bool get _usingGps => _gpsLat != null;

  @override
  void dispose() {
    _fallbackTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bearing = _qiblaBearing(_activeLat, _activeLng);
    final distKm = _distanceKm(_activeLat, _activeLng, _kMeccaLat, _kMeccaLng);

    return StreamBuilder<CompassEvent>(
      stream: FlutterCompass.events,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return _buildContent(
            context,
            bearing: bearing,
            distKm: distKm,
            qiblaAngle: bearing * math.pi / 180,
            isAccurate: false,
            hasCompass: false,
          );
        }

        if (snapshot.hasData && snapshot.data?.heading != null) {
          _fallbackTimer?.cancel();
          if (_showFallback) {
            WidgetsBinding.instance.addPostFrameCallback(
                (_) => setState(() => _showFallback = false));
          }
        }

        // Waiting for compass
        if (!snapshot.hasData && !_showFallback) {
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

        final hasCompass = snapshot.hasData && snapshot.data?.heading != null;
        final heading = snapshot.data?.heading ?? 0.0;
        final qiblaAngle = hasCompass
            ? (bearing - heading) * math.pi / 180
            : bearing * math.pi / 180;
        final isAccurate = hasCompass && (snapshot.data?.accuracy ?? 999) < 15;

        return _buildContent(
          context,
          bearing: bearing,
          distKm: distKm,
          qiblaAngle: qiblaAngle,
          isAccurate: isAccurate,
          hasCompass: hasCompass,
        );
      },
    );
  }

  Widget _buildContent(
    BuildContext context, {
    required double bearing,
    required double distKm,
    required double qiblaAngle,
    required bool isAccurate,
    required bool hasCompass,
  }) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        children: [
          // Calibration / no-sensor banner
          if (!hasCompass)
            _InfoBanner(
              icon: Icons.phonelink_off,
              text: 'No compass sensor detected. Showing Qibla direction statically.',
            ),
          if (hasCompass && !isAccurate)
            _InfoBanner(
              icon: Icons.warning_amber,
              text: 'Calibrate: move your phone in a figure-8 motion.',
            ),
          const SizedBox(height: 20),

          // Compass
          _QiblaCompass(qiblaAngle: qiblaAngle, isAligned: _isAligned(qiblaAngle)),
          const SizedBox(height: 28),

          // Bearing info panel
          _BearingPanel(
            bearing: bearing,
            distKm: distKm,
            cityName: widget.city.displayName,
            usingGps: _usingGps,
            isAccurate: isAccurate,
            hasCompass: hasCompass,
          ),
        ],
      ),
    );
  }

  bool _isAligned(double qiblaAngle) {
    final normalized = (qiblaAngle % (2 * math.pi) + 2 * math.pi) % (2 * math.pi);
    return normalized < 5 * math.pi / 180 || normalized > (2 * math.pi - 5 * math.pi / 180);
  }
}

// ── Info banner ──────────────────────────────────────────────────────────────

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: theme.colorScheme.tertiaryContainer.withAlpha(80),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.tertiaryContainer),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.onTertiaryContainer),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 12,
                color: theme.colorScheme.onTertiaryContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bearing info panel ───────────────────────────────────────────────────────

class _BearingPanel extends StatelessWidget {
  const _BearingPanel({
    required this.bearing,
    required this.distKm,
    required this.cityName,
    required this.usingGps,
    required this.isAccurate,
    required this.hasCompass,
  });
  final double bearing;
  final double distKm;
  final String cityName;
  final bool usingGps;
  final bool isAccurate;
  final bool hasCompass;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final abbr = _compassDir(bearing);
    final full = _compassFull(bearing);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor.withAlpha(60)),
      ),
      child: Column(
        children: [
          // Bearing degrees
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '${bearing.toStringAsFixed(1)}°',
                style: theme.textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: PrayCalcColors.mid,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                abbr,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface.withAlpha(180),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            full,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withAlpha(140),
            ),
          ),
          const SizedBox(height: 16),
          Divider(height: 1, color: theme.dividerColor.withAlpha(40)),
          const SizedBox(height: 16),

          // Distance + source
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _InfoChip(
                icon: Icons.straighten,
                label: '${_formatKm(distKm)} km',
                sublabel: 'to the Kaaba',
              ),
              _InfoChip(
                icon: usingGps ? Icons.gps_fixed : Icons.location_city,
                label: usingGps ? 'Your location' : cityName,
                sublabel: usingGps ? 'GPS-accurate' : 'City center',
              ),
              _InfoChip(
                icon: hasCompass
                    ? (isAccurate ? Icons.check_circle : Icons.compass_calibration)
                    : Icons.compass_calibration,
                label: hasCompass
                    ? (isAccurate ? 'Calibrated' : 'Low accuracy')
                    : 'No sensor',
                sublabel: 'Compass',
                color: hasCompass
                    ? (isAccurate ? PrayCalcColors.mid : Colors.orange)
                    : theme.colorScheme.onSurface.withAlpha(100),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({
    required this.icon,
    required this.label,
    required this.sublabel,
    this.color,
  });
  final IconData icon;
  final String label;
  final String sublabel;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = color ?? PrayCalcColors.mid;
    return Column(
      children: [
        Icon(icon, size: 18, color: c),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600,
            fontSize: 11,
          ),
          textAlign: TextAlign.center,
        ),
        Text(
          sublabel,
          style: theme.textTheme.bodySmall?.copyWith(
            fontSize: 10,
            color: theme.colorScheme.onSurface.withAlpha(100),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

// ── Custom painted Qibla compass ─────────────────────────────────────────────

class _QiblaCompass extends StatelessWidget {
  const _QiblaCompass({required this.qiblaAngle, required this.isAligned});
  final double qiblaAngle;
  final bool isAligned;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SizedBox(
      width: 280,
      height: 280,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Glow effect when aligned
          if (isAligned)
            Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: PrayCalcColors.mid.withAlpha(60),
                    blurRadius: 40,
                    spreadRadius: 10,
                  ),
                ],
              ),
            ),
          // Compass face
          CustomPaint(
            size: const Size(280, 280),
            painter: _CompassPainter(
              qiblaAngle: qiblaAngle,
              isAligned: isAligned,
              isDark: isDark,
            ),
          ),
          // "Facing Qibla" badge
          if (isAligned)
            Positioned(
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: PrayCalcColors.mid,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Text(
                  'Facing Qibla',
                  style: TextStyle(
                    color: Color(0xFF071208),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _CompassPainter extends CustomPainter {
  const _CompassPainter({
    required this.qiblaAngle,
    required this.isAligned,
    required this.isDark,
  });
  final double qiblaAngle;
  final bool isAligned;
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // ── Outer ring ───────────────────────────────────────────────────────
    final ringPaint = Paint()
      ..color = isAligned
          ? PrayCalcColors.mid
          : (isDark ? const Color(0xFF2A4A2A) : const Color(0xFFCCDDCC))
      ..style = PaintingStyle.stroke
      ..strokeWidth = isAligned ? 3.5 : 2.0;
    canvas.drawCircle(center, radius - 2, ringPaint);

    // Inner ring
    final innerRing = Paint()
      ..color = isDark ? const Color(0xFF1A2D1A) : const Color(0xFFE8F0E8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawCircle(center, radius - 14, innerRing);

    // ── Degree tick marks ────────────────────────────────────────────────
    final tickPaint = Paint()
      ..color = isDark ? const Color(0xFF3A5A3A) : const Color(0xFF99BB99)
      ..strokeWidth = 1.0;
    final majorTickPaint = Paint()
      ..color = isDark ? const Color(0xFF5A8A5A) : const Color(0xFF668866)
      ..strokeWidth = 1.5;

    for (var i = 0; i < 360; i += 5) {
      final angle = i * math.pi / 180 - math.pi / 2;
      final isMajor = i % 30 == 0;
      final outerR = radius - 4;
      final innerR = isMajor ? radius - 18 : radius - 12;
      canvas.drawLine(
        Offset(center.dx + outerR * math.cos(angle),
            center.dy + outerR * math.sin(angle)),
        Offset(center.dx + innerR * math.cos(angle),
            center.dy + innerR * math.sin(angle)),
        isMajor ? majorTickPaint : tickPaint,
      );
    }

    // ── Cardinal labels (N, E, S, W) ─────────────────────────────────────
    final labelStyle = TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.bold,
      color: isDark ? const Color(0xFF8AAF8A) : const Color(0xFF4A6B4A),
    );
    final nStyle = TextStyle(
      fontSize: 15,
      fontWeight: FontWeight.bold,
      color: PrayCalcColors.mid,
    );

    for (var i = 0; i < 4; i++) {
      final angle = i * math.pi / 2 - math.pi / 2;
      final labelR = radius - 28;
      final offset = Offset(
        center.dx + labelR * math.cos(angle),
        center.dy + labelR * math.sin(angle),
      );
      final tp = TextPainter(
        text: TextSpan(
          text: _kCardinalLabels[i],
          style: i == 0 ? nStyle : labelStyle,
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(offset.dx - tp.width / 2, offset.dy - tp.height / 2));
    }

    // ── Qibla needle (rotated) ───────────────────────────────────────────
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(qiblaAngle);

    // Needle body — green triangle pointing up (toward Qibla)
    final needlePath = Path()
      ..moveTo(0, -(radius - 40))
      ..lineTo(-8, 0)
      ..lineTo(8, 0)
      ..close();
    canvas.drawPath(
      needlePath,
      Paint()..color = PrayCalcColors.mid,
    );

    // Back half — dim
    final backPath = Path()
      ..moveTo(0, radius - 50)
      ..lineTo(-6, 0)
      ..lineTo(6, 0)
      ..close();
    canvas.drawPath(
      backPath,
      Paint()..color = (isDark ? Colors.white : Colors.black).withAlpha(30),
    );

    // Center circle
    canvas.drawCircle(
      Offset.zero,
      6,
      Paint()..color = isDark ? const Color(0xFF1A2D1A) : const Color(0xFFF0F4F0),
    );
    canvas.drawCircle(
      Offset.zero,
      6,
      Paint()
        ..color = PrayCalcColors.mid
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );

    // Kaaba icon at needle tip
    const kaabaSize = 18.0;
    final kaabaY = -(radius - 40) - kaabaSize / 2 - 4;
    // Rotated square (diamond) for Kaaba
    canvas.save();
    canvas.translate(0, kaabaY);
    canvas.rotate(math.pi / 4);
    canvas.drawRect(
      Rect.fromCenter(center: Offset.zero, width: 12, height: 12),
      Paint()..color = PrayCalcColors.light,
    );
    canvas.drawRect(
      Rect.fromCenter(center: Offset.zero, width: 12, height: 12),
      Paint()
        ..color = PrayCalcColors.dark
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );
    canvas.restore();

    canvas.restore();
  }

  @override
  bool shouldRepaint(_CompassPainter old) =>
      old.qiblaAngle != qiblaAngle ||
      old.isAligned != isAligned ||
      old.isDark != isDark;
}

// ── Qibla map bottom sheet ──────────────────────────────────────────────────

void _showQiblaMap(BuildContext context, City city) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _QiblaMapSheet(city: city),
  );
}

class _QiblaMapSheet extends StatelessWidget {
  const _QiblaMapSheet({required this.city});
  final City city;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final origin = ll.LatLng(city.lat, city.lng);
    final mecca = ll.LatLng(_kMeccaLat, _kMeccaLng);
    final distKm = _distanceKm(city.lat, city.lng, _kMeccaLat, _kMeccaLng);

    // Zoom: street-level (~14) if <24km, city-level (~5) for distant cities
    final zoom = distKm < _kGpsProximityKm ? 14.0 : _zoomForDistance(distKm);

    // Center the map between origin and Mecca
    final centerLat = (city.lat + _kMeccaLat) / 2;
    final centerLng = _midLng(city.lng, _kMeccaLng);

    // Generate great-circle intermediate points
    final arcPoints = _greatCirclePoints(origin, mecca, 60);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      builder: (context, scrollController) => Container(
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            // Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Qibla from ${city.displayName}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    '${_formatKm(distKm)} km',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Map
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: ll.LatLng(centerLat, centerLng),
                    initialZoom: zoom,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.praycalc.app',
                    ),
                    // Great-circle line
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: arcPoints,
                          strokeWidth: 3,
                          color: PrayCalcColors.mid.withAlpha(200),
                        ),
                      ],
                    ),
                    // Markers
                    MarkerLayer(
                      markers: [
                        // Origin (city)
                        Marker(
                          point: origin,
                          width: 24,
                          height: 24,
                          child: Container(
                            decoration: BoxDecoration(
                              color: PrayCalcColors.mid,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(60),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Mecca (Kaaba)
                        Marker(
                          point: mecca,
                          width: 32,
                          height: 32,
                          child: Transform.rotate(
                            angle: math.pi / 4,
                            child: Container(
                              decoration: BoxDecoration(
                                color: PrayCalcColors.light,
                                border: Border.all(color: PrayCalcColors.dark, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(60),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Compute a zoom level that fits the great-circle distance on screen.
double _zoomForDistance(double km) {
  // Rough heuristic: log2-based zoom from world circumference
  if (km < 50) return 12.0;
  if (km < 200) return 9.0;
  if (km < 500) return 7.0;
  if (km < 1500) return 5.5;
  if (km < 5000) return 4.0;
  if (km < 10000) return 3.0;
  return 2.0;
}

/// Midpoint longitude handling wrap-around at 180/-180.
double _midLng(double lng1, double lng2) {
  if ((lng1 - lng2).abs() > 180) {
    final sum = lng1 + lng2 + 360;
    final mid = sum / 2;
    return mid > 180 ? mid - 360 : mid;
  }
  return (lng1 + lng2) / 2;
}

/// Generate points along the great-circle arc between two positions.
List<ll.LatLng> _greatCirclePoints(ll.LatLng from, ll.LatLng to, int segments) {
  final lat1 = from.latitudeInRad;
  final lng1 = from.longitudeInRad;
  final lat2 = to.latitudeInRad;
  final lng2 = to.longitudeInRad;

  final d = 2 * math.asin(math.sqrt(
    math.pow(math.sin((lat1 - lat2) / 2), 2) +
    math.cos(lat1) * math.cos(lat2) * math.pow(math.sin((lng1 - lng2) / 2), 2),
  ));

  if (d < 1e-10) return [from, to];

  final points = <ll.LatLng>[];
  for (var i = 0; i <= segments; i++) {
    final f = i / segments;
    final a = math.sin((1 - f) * d) / math.sin(d);
    final b = math.sin(f * d) / math.sin(d);
    final x = a * math.cos(lat1) * math.cos(lng1) + b * math.cos(lat2) * math.cos(lng2);
    final y = a * math.cos(lat1) * math.sin(lng1) + b * math.cos(lat2) * math.sin(lng2);
    final z = a * math.sin(lat1) + b * math.sin(lat2);
    final lat = math.atan2(z, math.sqrt(x * x + y * y));
    final lng = math.atan2(y, x);
    points.add(ll.LatLng(lat * 180 / math.pi, lng * 180 / math.pi));
  }
  return points;
}
