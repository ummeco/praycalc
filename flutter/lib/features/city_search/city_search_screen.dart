import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/geo_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/services/city_db_service.dart';
import '../../shared/models/settings_model.dart';

class CitySearchScreen extends ConsumerStatefulWidget {
  const CitySearchScreen({super.key});

  @override
  ConsumerState<CitySearchScreen> createState() => _CitySearchScreenState();
}

class _CitySearchScreenState extends ConsumerState<CitySearchScreen> {
  final _controller = TextEditingController();
  List<City> _results = [];
  List<City> _recent = [];
  bool _searching = false;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    loadRecentCities().then((list) {
      if (mounted) setState(() => _recent = list);
    });
  }

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

  void _selectCity(City city) {
    ref.read(cityProvider.notifier).state = city;
    persistCity(city, ref);
    Navigator.of(context).pop();
  }

  void _setHome(City city) {
    ref.read(settingsProvider.notifier).setHomeCoords(city.lat, city.lng);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${city.displayName} set as home')),
    );
  }

  Future<void> _detectGps() async {
    final gps = ref.read(gpsProvider.notifier);
    await gps.requestLocation();
    final state = ref.read(gpsProvider);
    if (!mounted) return;

    if (state.status == GpsStatus.acquired && state.lat != null) {
      final city = await reverseGeocodeToCity(state.lat!, state.lng!);
      if (!mounted) return;
      if (city != null) {
        _selectCity(city);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not detect city from GPS.')),
        );
      }
    } else if (state.status == GpsStatus.denied) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location permission denied. Search manually.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('GPS unavailable. Search manually.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final gpsState = ref.watch(gpsProvider);
    final currentCity = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final isSearching = _controller.text.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search city…',
            border: InputBorder.none,
          ),
          onChanged: _onQueryChanged,
        ),
        actions: [
          if (gpsState.status == GpsStatus.requesting)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
            )
          else
            IconButton(
              icon: const Icon(Icons.my_location),
              tooltip: 'Detect my location',
              onPressed: _detectGps,
            ),
        ],
      ),
      body: _searching
          ? const Center(child: CircularProgressIndicator())
          : isSearching
              ? _results.isEmpty
                  ? const Center(child: Text('No cities found.'))
                  : _CityList(
                      cities: _results,
                      currentCity: currentCity,
                      homeLat: settings.homeLat,
                      homeLng: settings.homeLng,
                      onSelect: _selectCity,
                      onSetHome: _setHome,
                    )
              : _IdleBody(
                  currentCity: currentCity,
                  recentCities: _recent,
                  homeLat: settings.homeLat,
                  homeLng: settings.homeLng,
                  onSelect: _selectCity,
                  onSetHome: _setHome,
                ),
    );
  }
}

// ── Idle body (no query) ──────────────────────────────────────────────────────

class _IdleBody extends StatelessWidget {
  const _IdleBody({
    required this.currentCity,
    required this.recentCities,
    required this.homeLat,
    required this.homeLng,
    required this.onSelect,
    required this.onSetHome,
  });

  final City? currentCity;
  final List<City> recentCities;
  final double? homeLat;
  final double? homeLng;
  final void Function(City) onSelect;
  final void Function(City) onSetHome;

  bool _isHome(City city) {
    if (homeLat == null || homeLng == null) return false;
    const delta = 0.05;
    return (city.lat - homeLat!).abs() < delta && (city.lng - homeLng!).abs() < delta;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Deduplicate recent list against current city
    final recent = currentCity == null
        ? recentCities
        : recentCities
            .where((c) => !(c.lat == currentCity!.lat && c.lng == currentCity!.lng))
            .toList();

    return ListView(
      children: [
        if (currentCity != null) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Text('Current city',
                style: theme.textTheme.labelSmall
                    ?.copyWith(color: theme.colorScheme.onSurface.withAlpha(140))),
          ),
          _CityTile(
            city: currentCity!,
            isCurrent: true,
            isHome: _isHome(currentCity!),
            onSelect: onSelect,
            onSetHome: onSetHome,
          ),
        ],
        if (recent.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Text('Recently visited',
                style: theme.textTheme.labelSmall
                    ?.copyWith(color: theme.colorScheme.onSurface.withAlpha(140))),
          ),
          ...recent.map((c) => _CityTile(
                city: c,
                isCurrent: false,
                isHome: _isHome(c),
                onSelect: onSelect,
                onSetHome: onSetHome,
              )),
        ],
        if (currentCity == null && recent.isEmpty)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: Text('Start typing to search for a city')),
          ),
      ],
    );
  }
}

// ── Search results list ───────────────────────────────────────────────────────

class _CityList extends StatelessWidget {
  const _CityList({
    required this.cities,
    required this.currentCity,
    required this.homeLat,
    required this.homeLng,
    required this.onSelect,
    required this.onSetHome,
  });

  final List<City> cities;
  final City? currentCity;
  final double? homeLat;
  final double? homeLng;
  final void Function(City) onSelect;
  final void Function(City) onSetHome;

  bool _isHome(City city) {
    if (homeLat == null || homeLng == null) return false;
    const delta = 0.05;
    return (city.lat - homeLat!).abs() < delta && (city.lng - homeLng!).abs() < delta;
  }

  bool _isCurrent(City city) =>
      currentCity != null &&
      city.lat == currentCity!.lat &&
      city.lng == currentCity!.lng;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: cities.length,
      itemBuilder: (context, i) => _CityTile(
        city: cities[i],
        isCurrent: _isCurrent(cities[i]),
        isHome: _isHome(cities[i]),
        onSelect: onSelect,
        onSetHome: onSetHome,
      ),
    );
  }
}

// ── Single city tile ──────────────────────────────────────────────────────────

class _CityTile extends StatelessWidget {
  const _CityTile({
    required this.city,
    required this.isCurrent,
    required this.isHome,
    required this.onSelect,
    required this.onSetHome,
  });

  final City city;
  final bool isCurrent;
  final bool isHome;
  final void Function(City) onSelect;
  final void Function(City) onSetHome;

  // Show state code only for US/CA/AU where two-letter codes are meaningful.
  // Other countries use opaque admin codes (e.g. "CA" for Île-de-France) that
  // look like US states and confuse users.
  static String _citySubtitle(City city) {
    const stateCountries = {'US', 'CA', 'AU'};
    if (city.state != null && stateCountries.contains(city.country)) {
      return '${city.state}, ${city.country}';
    }
    return city.country;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListTile(
      leading: Icon(
        isCurrent ? Icons.location_on : Icons.location_city_outlined,
        color: isCurrent ? theme.colorScheme.primary : null,
      ),
      title: Text(
        city.name,
        style: isCurrent
            ? TextStyle(fontWeight: FontWeight.w600, color: theme.colorScheme.primary)
            : null,
      ),
      subtitle: Text(_citySubtitle(city)),
      trailing: IconButton(
        icon: Icon(
          isHome ? Icons.home_rounded : Icons.home_outlined,
          color: isHome ? theme.colorScheme.primary : theme.colorScheme.onSurface.withAlpha(100),
        ),
        tooltip: isHome ? 'This is your home city' : 'Set as home city',
        onPressed: () => onSetHome(city),
      ),
      onTap: () => onSelect(city),
    );
  }
}
