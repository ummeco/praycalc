import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// ---------------------------------------------------------------------------
// P-18: TV weather widget enhancement
// ---------------------------------------------------------------------------
//
// Fetches hourly data from Open-Meteo (free, no API key required).
// Shows: current conditions, animated icon, 6-hour forecast row,
// sunrise/sunset arc, wind + humidity.
// Degrades gracefully offline — shows last cached data or "–".

// ---------------------------------------------------------------------------
// Data models
// ---------------------------------------------------------------------------

class _HourlyForecast {
  final DateTime time;
  final double tempC;
  final int weatherCode;
  final double windKph;

  const _HourlyForecast({
    required this.time,
    required this.tempC,
    required this.weatherCode,
    required this.windKph,
  });
}

class _WeatherData {
  final double tempC;
  final double feelsLikeC;
  final int weatherCode;
  final double windKph;
  final int humidity;
  final DateTime? sunriseTime;
  final DateTime? sunsetTime;
  final List<_HourlyForecast> hourly;

  const _WeatherData({
    required this.tempC,
    required this.feelsLikeC,
    required this.weatherCode,
    required this.windKph,
    required this.humidity,
    this.sunriseTime,
    this.sunsetTime,
    this.hourly = const [],
  });
}

// ---------------------------------------------------------------------------
// WMO weather code → icon + label
// ---------------------------------------------------------------------------

String _weatherIcon(int code) {
  if (code == 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code == 3) return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '❄️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

String _weatherLabel(int code) {
  if (code == 0) return 'Clear';
  if (code <= 2) return 'Partly Cloudy';
  if (code == 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

// ---------------------------------------------------------------------------
// TvWeatherPanel
// ---------------------------------------------------------------------------

class TvWeatherPanel extends StatefulWidget {
  const TvWeatherPanel({
    super.key,
    required this.latitude,
    required this.longitude,
    this.tempUnit = 'C',
    this.fontScale = 1.0,
    this.compact = false,
  });

  final double latitude;
  final double longitude;
  final String tempUnit; // 'C' or 'F'
  final double fontScale;
  final bool compact; // true = smaller layout for rail/card use

  @override
  State<TvWeatherPanel> createState() => _TvWeatherPanelState();
}

class _TvWeatherPanelState extends State<TvWeatherPanel>
    with SingleTickerProviderStateMixin {
  _WeatherData? _data;
  bool _loading = true;
  bool _offline = false;
  Timer? _refreshTimer;
  late AnimationController _iconAnimCtrl;

  static const _kBaseUrl = 'https://api.open-meteo.com/v1/forecast';

  @override
  void initState() {
    super.initState();
    _iconAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
    _fetch();
    // Refresh every 30 minutes
    _refreshTimer = Timer.periodic(const Duration(minutes: 30), (_) => _fetch());
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _iconAnimCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetch() async {
    if (!mounted) return;
    setState(() => _loading = _data == null);
    try {
      final uri = Uri.parse(_kBaseUrl).replace(queryParameters: {
        'latitude': widget.latitude.toStringAsFixed(4),
        'longitude': widget.longitude.toStringAsFixed(4),
        'current': 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m',
        'hourly': 'temperature_2m,weather_code,wind_speed_10m',
        'daily': 'sunrise,sunset',
        'timezone': 'auto',
        'forecast_days': '1',
        'wind_speed_unit': 'kmh',
      });
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (!mounted) return;
      if (response.statusCode == 200) {
        final json = jsonDecode(response.body) as Map<String, dynamic>;
        final current = json['current'] as Map<String, dynamic>? ?? {};
        final hourly = json['hourly'] as Map<String, dynamic>? ?? {};
        final daily = json['daily'] as Map<String, dynamic>? ?? {};

        // Parse hourly forecast (next 6 hours from now)
        final now = DateTime.now();
        final times = (hourly['time'] as List<dynamic>?)?.cast<String>() ?? [];
        final temps = (hourly['temperature_2m'] as List<dynamic>?)?.cast<num>() ?? [];
        final codes = (hourly['weather_code'] as List<dynamic>?)?.cast<num>() ?? [];
        final winds = (hourly['wind_speed_10m'] as List<dynamic>?)?.cast<num>() ?? [];

        final forecasts = <_HourlyForecast>[];
        for (int i = 0; i < times.length && forecasts.length < 6; i++) {
          final t = DateTime.tryParse(times[i]);
          if (t != null && t.isAfter(now)) {
            forecasts.add(_HourlyForecast(
              time: t,
              tempC: (temps.length > i ? temps[i] : 0).toDouble(),
              weatherCode: (codes.length > i ? codes[i] : 0).toInt(),
              windKph: (winds.length > i ? winds[i] : 0).toDouble(),
            ));
          }
        }

        DateTime? sunrise, sunset;
        final sunriseList = (daily['sunrise'] as List<dynamic>?)?.cast<String>();
        final sunsetList = (daily['sunset'] as List<dynamic>?)?.cast<String>();
        if (sunriseList != null && sunriseList.isNotEmpty) {
          sunrise = DateTime.tryParse(sunriseList[0]);
        }
        if (sunsetList != null && sunsetList.isNotEmpty) {
          sunset = DateTime.tryParse(sunsetList[0]);
        }

        setState(() {
          _data = _WeatherData(
            tempC: (current['temperature_2m'] as num? ?? 0).toDouble(),
            feelsLikeC: (current['apparent_temperature'] as num? ?? 0).toDouble(),
            weatherCode: (current['weather_code'] as num? ?? 0).toInt(),
            windKph: (current['wind_speed_10m'] as num? ?? 0).toDouble(),
            humidity: (current['relative_humidity_2m'] as num? ?? 0).toInt(),
            sunriseTime: sunrise,
            sunsetTime: sunset,
            hourly: forecasts,
          );
          _offline = false;
          _loading = false;
        });
      } else {
        setState(() { _offline = true; _loading = false; });
      }
    } catch (e) {
      if (mounted) setState(() { _offline = _data == null; _loading = false; });
    }
  }

  String _formatTemp(double celsius) {
    if (widget.tempUnit == 'F') {
      return '${(celsius * 9 / 5 + 32).round()}°F';
    }
    return '${celsius.round()}°C';
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final m = dt.minute.toString().padLeft(2, '0');
    final ampm = dt.hour < 12 ? 'AM' : 'PM';
    return '$h:$m $ampm';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFC9F27A)));
    }

    final data = _data;
    if (data == null) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.cloud_off, color: Colors.white38, size: 40),
          const SizedBox(height: 8),
          Text('Weather unavailable', style: TextStyle(color: Colors.white38, fontSize: 14 * widget.fontScale)),
        ]),
      );
    }

    return widget.compact ? _buildCompact(data) : _buildFull(data);
  }

  Widget _buildCompact(_WeatherData data) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          AnimatedBuilder(
            animation: _iconAnimCtrl,
            builder: (context, _) => Transform.translate(
              offset: Offset(0, _iconAnimCtrl.value * 4 - 2),
              child: Text(_weatherIcon(data.weatherCode), style: const TextStyle(fontSize: 32)),
            ),
          ),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_formatTemp(data.tempC),
                style: TextStyle(color: const Color(0xFFC9F27A), fontSize: 22 * widget.fontScale, fontWeight: FontWeight.bold)),
            Text(_weatherLabel(data.weatherCode),
                style: TextStyle(color: Colors.white54, fontSize: 12 * widget.fontScale)),
          ]),
          const Spacer(),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('💧 ${data.humidity}%', style: TextStyle(color: Colors.white60, fontSize: 12 * widget.fontScale)),
            Text('💨 ${data.windKph.round()} km/h', style: TextStyle(color: Colors.white60, fontSize: 12 * widget.fontScale)),
          ]),
        ],
      ),
    );
  }

  Widget _buildFull(_WeatherData data) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Current conditions
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AnimatedBuilder(
                animation: _iconAnimCtrl,
                builder: (context, _) => Transform.translate(
                  offset: Offset(0, _iconAnimCtrl.value * 6 - 3),
                  child: Text(_weatherIcon(data.weatherCode),
                      style: TextStyle(fontSize: 64 * widget.fontScale)),
                ),
              ),
              const SizedBox(width: 20),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_formatTemp(data.tempC),
                    style: TextStyle(
                      color: const Color(0xFFC9F27A),
                      fontSize: 56 * widget.fontScale,
                      fontWeight: FontWeight.bold,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    )),
                Text(_weatherLabel(data.weatherCode),
                    style: TextStyle(color: Colors.white70, fontSize: 18 * widget.fontScale)),
                Text('Feels like ${_formatTemp(data.feelsLikeC)}',
                    style: TextStyle(color: Colors.white38, fontSize: 14 * widget.fontScale)),
              ]),
              const Spacer(),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                _statRow('💧', '${data.humidity}%', 'Humidity'),
                const SizedBox(height: 8),
                _statRow('💨', '${data.windKph.round()} km/h', 'Wind'),
              ]),
            ],
          ),

          // Sunrise/sunset arc
          if (data.sunriseTime != null && data.sunsetTime != null) ...[
            const SizedBox(height: 16),
            _SunArc(sunrise: data.sunriseTime!, sunset: data.sunsetTime!, now: DateTime.now()),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('🌅 ${_formatTime(data.sunriseTime!)}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                Text('🌇 ${_formatTime(data.sunsetTime!)}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ],

          // 6h forecast row
          if (data.hourly.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(color: Colors.white12, height: 1),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: data.hourly.map((h) => _ForecastCell(
                hour: '${h.time.hour % 12 == 0 ? 12 : h.time.hour % 12}${h.time.hour < 12 ? 'a' : 'p'}',
                icon: _weatherIcon(h.weatherCode),
                temp: _formatTemp(h.tempC),
                fontScale: widget.fontScale,
              )).toList(),
            ),
          ],

          // Offline badge
          if (_offline)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('⚠️ Showing cached data', style: TextStyle(color: Colors.amber.withValues(alpha: 0.7), fontSize: 11 * widget.fontScale)),
            ),
        ],
      ),
    );
  }

  Widget _statRow(String icon, String value, String label) {
    return Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
      Text('$icon $value', style: TextStyle(color: Colors.white70, fontSize: 14 * widget.fontScale)),
      Text(label, style: TextStyle(color: Colors.white38, fontSize: 11 * widget.fontScale)),
    ]);
  }
}

// ---------------------------------------------------------------------------
// Sunrise/sunset arc painter
// ---------------------------------------------------------------------------

class _SunArc extends StatelessWidget {
  const _SunArc({required this.sunrise, required this.sunset, required this.now});

  final DateTime sunrise;
  final DateTime sunset;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(double.infinity, 40),
      painter: _SunArcPainter(sunrise: sunrise, sunset: sunset, now: now),
    );
  }
}

class _SunArcPainter extends CustomPainter {
  final DateTime sunrise;
  final DateTime sunset;
  final DateTime now;

  _SunArcPainter({required this.sunrise, required this.sunset, required this.now});

  @override
  void paint(Canvas canvas, Size size) {
    final arcPaint = Paint()
      ..color = const Color(0xFFFFD700).withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    final dotPaint = Paint()
      ..color = const Color(0xFFFFD700)
      ..style = PaintingStyle.fill;

    final rect = Rect.fromLTWH(16, 4, size.width - 32, (size.height - 4) * 2);

    // Draw arc
    canvas.drawArc(rect, math.pi, math.pi, false, arcPaint);

    // Compute sun position
    final total = sunset.millisecondsSinceEpoch - sunrise.millisecondsSinceEpoch;
    final elapsed = now.millisecondsSinceEpoch - sunrise.millisecondsSinceEpoch;
    final fraction = (elapsed / total).clamp(0.0, 1.0);

    // Angle: π (left) to 2π (right)
    final angle = math.pi + fraction * math.pi;
    final cx = rect.center.dx + rect.width / 2 * math.cos(angle);
    final cy = rect.center.dy + rect.height / 2 * math.sin(angle);

    canvas.drawCircle(Offset(cx, cy), 6, dotPaint);
  }

  @override
  bool shouldRepaint(_SunArcPainter old) =>
      old.now.minute != now.minute;
}

// ---------------------------------------------------------------------------
// Hourly forecast cell
// ---------------------------------------------------------------------------

class _ForecastCell extends StatelessWidget {
  const _ForecastCell({
    required this.hour,
    required this.icon,
    required this.temp,
    required this.fontScale,
  });

  final String hour;
  final String icon;
  final String temp;
  final double fontScale;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(hour, style: TextStyle(color: Colors.white38, fontSize: 11 * fontScale)),
        const SizedBox(height: 4),
        Text(icon, style: TextStyle(fontSize: 20 * fontScale)),
        const SizedBox(height: 4),
        Text(temp, style: TextStyle(color: Colors.white70, fontSize: 12 * fontScale, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
