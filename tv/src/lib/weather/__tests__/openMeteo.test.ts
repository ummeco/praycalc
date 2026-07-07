/**
 * Purpose: Verify open-meteo response parsing + WMO weather-code mapping + graceful
 *   failure. fetch is mocked (no network).
 * SPORT: praycalc/tv lib/weather tests
 */

import {
  mapWeatherCode,
  parseOpenMeteo,
  buildOpenMeteoUrl,
  fetchCurrentWeather,
} from '../openMeteo';

describe('mapWeatherCode', () => {
  it('maps documented WMO codes to emoji + label', () => {
    expect(mapWeatherCode(0)).toEqual({ emoji: '☀️', label: 'Clear sky' });
    expect(mapWeatherCode(3)).toEqual({ emoji: '☁️', label: 'Overcast' });
    expect(mapWeatherCode(61).label).toBe('Light rain');
    expect(mapWeatherCode(95).label).toBe('Thunderstorm');
  });

  it('falls back for an unknown code', () => {
    expect(mapWeatherCode(1234)).toEqual({ emoji: '🌡️', label: 'Weather' });
  });
});

describe('buildOpenMeteoUrl', () => {
  it('builds the current-weather request URL with lat/lon', () => {
    const url = buildOpenMeteoUrl(21.42, 39.83);
    expect(url).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=21.42');
    expect(url).toContain('longitude=39.83');
    expect(url).toContain('current=temperature_2m,weather_code');
  });
});

describe('parseOpenMeteo', () => {
  it('maps a valid response to CurrentWeather', () => {
    const parsed = parseOpenMeteo({
      current: { temperature_2m: 34.2, weather_code: 0 },
    });
    expect(parsed).toEqual({
      temperatureC: 34.2,
      code: 0,
      emoji: '☀️',
      label: 'Clear sky',
    });
  });

  it('returns null when the current block is missing', () => {
    expect(parseOpenMeteo({})).toBeNull();
  });

  it('returns null when fields are malformed', () => {
    expect(
      parseOpenMeteo({ current: { temperature_2m: undefined, weather_code: 3 } })
    ).toBeNull();
  });
});

describe('fetchCurrentWeather', () => {
  it('returns parsed weather on a successful fetch', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 12, weather_code: 3 } }),
    }) as unknown as typeof fetch;

    const result = await fetchCurrentWeather(1, 2, mockFetch);
    expect(result).toEqual({
      temperatureC: 12,
      code: 3,
      emoji: '☁️',
      label: 'Overcast',
    });
  });

  it('returns null on a non-ok HTTP response', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch;
    expect(await fetchCurrentWeather(1, 2, mockFetch)).toBeNull();
  });

  it('returns null when fetch throws (network error)', async () => {
    const mockFetch = jest
      .fn()
      .mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    expect(await fetchCurrentWeather(1, 2, mockFetch)).toBeNull();
  });
});
