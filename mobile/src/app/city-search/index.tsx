/**
 * Purpose: City search route — thin wrapper around the real city-search feature
 *   component. This file used to be its own separate scaffold (8 hardcoded cities,
 *   fake setTimeout search, no debounce) that quietly diverged from the fully-built
 *   src/features/city-search/CitySearchScreen.tsx (real pc_cities GraphQL search,
 *   offline fallback, debounce, current-location) which was otherwise only reachable
 *   embedded inside TravelScreen — so every "Set Location"/"Search City" entry point
 *   in the app (Home, Qibla, Settings) was hitting the primitive scaffold instead.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-city-search
 */

import { router } from 'expo-router';
import CitySearchScreen from '../../features/city-search/CitySearchScreen';
import type { CityCoords } from '../../types/prayer';

export default function CitySearchRoute() {
  return (
    <CitySearchScreen
      mode="home"
      onSelectCity={(_city: CityCoords) => router.back()}
    />
  );
}
