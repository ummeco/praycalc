import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/geo_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/services/city_db_service.dart';
import '../../shared/models/settings_model.dart';

/// Dedicated screen for setting the user's home location.
/// Used from the travel banner "Change Home" button, the Settings screen,
/// and the first-time wizard flow.
///
/// Selecting a city sets it as home and pops back.
class SetHomeScreen extends ConsumerStatefulWidget {
  const SetHomeScreen({super.key});

  @override
  ConsumerState<SetHomeScreen> createState() => _SetHomeScreenState();
}

class _SetHomeScreenState extends ConsumerState<SetHomeScreen> {
  final _controller = TextEditingController();
  List<City> _results = [];
  bool _searching = false;
  bool _loadingGps = false;
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onQueryChanged(String q) {
    _debounce?.cancel();
    if (q.trim().isEmpty) {
      setState(() { _results = []; _searching = false; });
      return;
    }
    setState(() => _searching = true);
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      try {
        final results = await CityDbService.instance.search(q);
        if (mounted) setState(() { _results = results; _searching = false; });
      } catch (_) {
        if (mounted) setState(() { _results = []; _searching = false; });
      }
    });
  }

  Future<void> _confirmAndSet(City city) async {
    ref.read(settingsProvider.notifier).setHomeCoords(city.lat, city.lng);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${city.displayName} set as home')),
      );
      Navigator.of(context).pop();
    }
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _loadingGps = true);
    final gps = ref.read(gpsProvider.notifier);
    await gps.requestLocation();
    final state = ref.read(gpsProvider);
    if (!mounted) return;
    setState(() => _loadingGps = false);

    if (state.status == GpsStatus.acquired &&
        state.lat != null &&
        state.lng != null) {
      final city = await reverseGeocodeToCity(state.lat!, state.lng!);
      if (!mounted) return;
      if (city != null) {
        await _confirmAndSet(city);
      } else {
        // No city found — set raw coordinates
        ref.read(settingsProvider.notifier).setHomeCoords(state.lat!, state.lng!);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Current location set as home')),
          );
          Navigator.of(context).pop();
        }
      }
    } else if (state.status == GpsStatus.denied) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location permission denied. Search for a city below.'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('GPS unavailable. Search manually.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);
    final isSearching = _controller.text.isNotEmpty;
    final theme = Theme.of(context);

    final homeSet = settings.homeLat != null && settings.homeLng != null;

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: false,
          decoration: InputDecoration(
            hintText: 'Search city, town or zip…',
            border: InputBorder.none,
            hintStyle: TextStyle(color: theme.colorScheme.onSurface.withAlpha(100)),
          ),
          onChanged: _onQueryChanged,
        ),
        actions: [
          if (_controller.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              tooltip: 'Clear',
              onPressed: () {
                _controller.clear();
                _onQueryChanged('');
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // ── Use Current Location CTA ──────────────────────────────────
          Material(
            color: theme.colorScheme.primaryContainer.withAlpha(40),
            child: InkWell(
              onTap: _loadingGps ? null : _useCurrentLocation,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    if (_loadingGps)
                      SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: theme.colorScheme.primary,
                        ),
                      )
                    else
                      Icon(
                        Icons.my_location_rounded,
                        color: theme.colorScheme.primary,
                        size: 22,
                      ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Use Current Location',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.primary,
                              fontSize: 15,
                            ),
                          ),
                          Text(
                            'Detect your location and set it as home',
                            style: TextStyle(
                              color: theme.colorScheme.onSurface.withAlpha(140),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.chevron_right,
                      color: theme.colorScheme.primary.withAlpha(160),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Current home indicator ────────────────────────────────────
          if (homeSet) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                children: [
                  Icon(
                    Icons.home_rounded,
                    size: 16,
                    color: theme.colorScheme.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Home already set',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '(${settings.homeLat!.toStringAsFixed(3)}, '
                    '${settings.homeLng!.toStringAsFixed(3)})',
                    style: TextStyle(
                      color: theme.colorScheme.onSurface.withAlpha(100),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const Divider(height: 24, indent: 16, endIndent: 16),

          // ── Search results / idle ─────────────────────────────────────
          Expanded(
            child: _searching
                ? const Center(child: CircularProgressIndicator())
                : isSearching
                    ? _results.isEmpty
                        ? const Center(child: Text('No cities found.'))
                        : ListView.builder(
                            itemCount: _results.length,
                            itemBuilder: (_, i) => _HomeSearchTile(
                              city: _results[i],
                              onTap: () => _confirmAndSet(_results[i]),
                            ),
                          )
                    : Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.home_work_outlined,
                                size: 52,
                                color: theme.colorScheme.primary.withAlpha(80),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Search for your home city',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Type above to search, or use your current '
                                'location. Travel mode will detect when you '
                                'are away from home.',
                                style: TextStyle(
                                  color: theme.colorScheme.onSurface.withAlpha(140),
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

String _citySubtitle(City city) {
  const stateCountries = {'US', 'CA', 'AU'};
  if (city.state != null && stateCountries.contains(city.country)) {
    return '${city.state}, ${city.country}';
  }
  return city.country;
}

class _HomeSearchTile extends StatelessWidget {
  const _HomeSearchTile({required this.city, required this.onTap});
  final City city;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: const Icon(Icons.home_outlined),
      title: Text(city.name, style: const TextStyle(fontWeight: FontWeight.w500)),
      subtitle: Text(_citySubtitle(city)),
      trailing: const Icon(Icons.check_circle_outline),
      onTap: onTap,
    );
  }
}
