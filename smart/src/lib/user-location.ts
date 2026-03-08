const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

export interface UserLocation {
  lat: number;
  lng: number;
  timezone: string;
}

/**
 * Query the user's saved home location from Hasura.
 * Picks the location marked `is_home = true`, or the first saved location.
 * Returns null if no location is saved or no userId provided.
 */
export async function getUserLocation(userId: string | undefined): Promise<UserLocation | null> {
  if (!userId) {
    // Use server default location from env vars (for anonymous smart home requests / tests)
    const lat = parseFloat(process.env.DEFAULT_LAT || '');
    const lng = parseFloat(process.env.DEFAULT_LNG || '');
    const timezone = process.env.DEFAULT_TIMEZONE || '';
    if (!isNaN(lat) && !isNaN(lng) && timezone) return { lat, lng, timezone };
    return null;
  }

  try {
    const response = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `query GetUserLocation($userId: uuid!) {
          pc_saved_locations(
            where: { user_id: { _eq: $userId } }
            order_by: [{ is_home: desc }, { created_at: asc }]
            limit: 1
          ) {
            latitude
            longitude
            timezone
          }
        }`,
        variables: { userId },
      }),
    });

    const data = await response.json() as any;
    const locations = data?.data?.pc_saved_locations;

    if (!locations || locations.length === 0) return null;

    const loc = locations[0];
    return {
      lat: loc.latitude,
      lng: loc.longitude,
      timezone: loc.timezone || 'UTC',
    };
  } catch (err) {
    console.error('[USER-LOCATION] Failed to query user location:', err);
    return null;
  }
}

/** Error speech for when no location is set. */
export const NO_LOCATION_SPEECH = 'Please set your home location in the PrayCalc app first, then link your account.';
