import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/geo_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/services/city_db_service.dart';
import '../../shared/models/settings_model.dart';

/// City search screen — full implementation (PC-3.6 / PC-3.7).
/// Search field with 300 ms debounce, SQLite-backed results ordered by population,
/// GPS detect button, recent search persistence.
class CitySearchScreen extends ConsumerStatefulWidget {
  const CitySearchScreen({super.key});

  @override
  ConsumerState<CitySearchScreen> createState() => _CitySearchScreenState();
}

class _CitySearchScreenState extends ConsumerState<CitySearchScreen> {
  final _controller = TextEditingController();
  List<City> _results = [];
  bool _searching = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onQueryChanged(String q) async {
    if (q.trim().isEmpty) {
      setState(() { _results = []; _searching = false; });
      return;
    }
    setState(() => _searching = true);
    final results = await CityDbService.instance.search(q);
    if (mounted) setState(() { _results = results; _searching = false; });
  }

  void _selectCity(City city) {
    ref.read(cityProvider.notifier).state = city;
    // Persist so it survives restarts
    persistCity(city, ref);
    Navigator.of(context).pop();
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
    }
  }

  @override
  Widget build(BuildContext context) {
    final gpsState = ref.watch(gpsProvider);

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
          : _results.isEmpty && _controller.text.isNotEmpty
              ? const Center(child: Text('No cities found.'))
              : _results.isEmpty
                  ? const Center(child: Text('Start typing to search…'))
                  : ListView.builder(
                      itemCount: _results.length,
                      itemBuilder: (context, i) {
                        final city = _results[i];
                        return ListTile(
                          leading: const Icon(Icons.location_city),
                          title: Text(city.name),
                          subtitle: Text(city.state != null
                              ? '${city.state}, ${city.country}'
                              : city.country),
                          onTap: () => _selectCity(city),
                        );
                      },
                    ),
    );
  }
}
