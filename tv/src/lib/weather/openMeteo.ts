/**
 * Purpose: Fetch current weather from open-meteo.com (free, no API key) for the TV's
 *   location, and map WMO weather codes to a compact emoji + label for the bottom bar.
 * Inputs: latitude, longitude (+ optional fetch impl for testing).
 * Outputs: CurrentWeather { temperatureC, code, emoji, label } or null on failure.
 * Constraints: No key required. Endpoint:
 *   https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m,weather_code
 *   Network/parse failures return null so the caller degrades gracefully (bar hidden).
 * SPORT: praycalc/tv lib/weather
 */

export interface CurrentWeather {
  /** Temperature in Celsius (as returned by open-meteo current.temperature_2m). */
  temperatureC: number;
  /** WMO weather interpretation code (current.weather_code). */
  code: number;
  /** Emoji glyph for the code. */
  emoji: string;
  /** Short human label for the code. */
  label: string;
}

/** Shape of the subset of the open-meteo response we consume. */
export interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
}

/**
 * WMO weather-code → { emoji, label } table.
 * Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes).
 * Codes are grouped; the map covers each documented code so lookups are exact.
 */
const WEATHER_CODE_MAP: Record<number, { emoji: string; label: string }> = {
  0: { emoji: '☀️', label: 'Clear sky' },
  1: { emoji: '🌤️', label: 'Mainly clear' },
  2: { emoji: '⛅', label: 'Partly cloudy' },
  3: { emoji: '☁️', label: 'Overcast' },
  45: { emoji: '🌫️', label: 'Fog' },
  48: { emoji: '🌫️', label: 'Rime fog' },
  51: { emoji: '🌦️', label: 'Light drizzle' },
  53: { emoji: '🌦️', label: 'Drizzle' },
  55: { emoji: '🌧️', label: 'Dense drizzle' },
  56: { emoji: '🌧️', label: 'Freezing drizzle' },
  57: { emoji: '🌧️', label: 'Freezing drizzle' },
  61: { emoji: '🌦️', label: 'Light rain' },
  63: { emoji: '🌧️', label: 'Rain' },
  65: { emoji: '🌧️', label: 'Heavy rain' },
  66: { emoji: '🌧️', label: 'Freezing rain' },
  67: { emoji: '🌧️', label: 'Freezing rain' },
  71: { emoji: '🌨️', label: 'Light snow' },
  73: { emoji: '🌨️', label: 'Snow' },
  75: { emoji: '❄️', label: 'Heavy snow' },
  77: { emoji: '🌨️', label: 'Snow grains' },
  80: { emoji: '🌦️', label: 'Rain showers' },
  81: { emoji: '🌧️', label: 'Rain showers' },
  82: { emoji: '⛈️', label: 'Violent showers' },
  85: { emoji: '🌨️', label: 'Snow showers' },
  86: { emoji: '❄️', label: 'Snow showers' },
  95: { emoji: '⛈️', label: 'Thunderstorm' },
  96: { emoji: '⛈️', label: 'Thunderstorm w/ hail' },
  99: { emoji: '⛈️', label: 'Thunderstorm w/ hail' },
};

/** Maps a WMO weather code to an emoji + label, defaulting to a neutral cloud. */
export function mapWeatherCode(code: number): { emoji: string; label: string } {
  return WEATHER_CODE_MAP[code] ?? { emoji: '🌡️', label: 'Weather' };
}

/** Builds the open-meteo current-weather request URL. */
export function buildOpenMeteoUrl(latitude: number, longitude: number): string {
  return (
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,weather_code'
  );
}

/**
 * Parses a raw open-meteo response into CurrentWeather, or null when the current block
 * is missing/malformed. Pure — used directly by tests to exercise the mapping.
 */
export function parseOpenMeteo(json: OpenMeteoResponse): CurrentWeather | null {
  const current = json.current;
  if (
    !current ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.weather_code !== 'number'
  ) {
    return null;
  }
  const { emoji, label } = mapWeatherCode(current.weather_code);
  return {
    temperatureC: current.temperature_2m,
    code: current.weather_code,
    emoji,
    label,
  };
}

/**
 * Fetches current weather for [latitude]/[longitude]. Returns null on any network,
 * HTTP, or parse error so the weather bar can degrade gracefully. [fetchImpl] is
 * injectable for tests (defaults to global fetch).
 */
export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  fetchImpl: typeof fetch = fetch
): Promise<CurrentWeather | null> {
  try {
    const res = await fetchImpl(buildOpenMeteoUrl(latitude, longitude));
    if (!res.ok) return null;
    const json = (await res.json()) as OpenMeteoResponse;
    return parseOpenMeteo(json);
  } catch {
    return null;
  }
}
