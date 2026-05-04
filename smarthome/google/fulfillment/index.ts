// praycalc/smarthome/google/fulfillment/index.ts — Google Actions fulfillment
// Spec §15.3, S19-G T34
//
// Uses @assistant/conversation SDK.
// Scenes: PrayerTimes, AllPrayers, QiblaQuery
// Account linking: OAuth via Ummat Auth (auth.ummat.dev)
// Visual cards: BasicCard with prayer list table for Nest Hub devices
// Endpoint: https://praycalc.com/api/actions/google
// GCP project: GOOGLE_ACTIONS_PROJECT_ID (per D-S19-05 decision: new "praycalc" project)

import {
  conversation,
  type ConversationV3,
} from '@assistant/conversation';

import {
  buildDialogflowPrayerResponse,
  buildDialogflowAllPrayersResponse,
  formatCountdown,
  type VoiceContext,
  type PrayerEntry,
} from '../../../web/lib/voice-response';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BACKEND_URL = process.env.UMMAT_BACKEND_URL ?? 'https://api.praycalc.com';
const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET ?? '';
const GOOGLE_ACTIONS_PROJECT_ID = process.env.GOOGLE_ACTIONS_PROJECT_ID ?? '';

// ---------------------------------------------------------------------------
// App instance
// ---------------------------------------------------------------------------

export const app = conversation({ debug: process.env.NODE_ENV !== 'production' });

// ---------------------------------------------------------------------------
// Location helpers
// ---------------------------------------------------------------------------

interface GeoCoords {
  lat:  number;
  lng:  number;
  city?: string;
}

/**
 * Resolves location from linked account (pc_assistant_links) or defaults to Mecca.
 * Google Actions does not expose device location directly — requires the user's
 * linked Ummat account to have a saved location.
 */
async function resolveLocationForGoogle(googleUserId: string): Promise<GeoCoords> {
  try {
    const r = await fetch(`${BACKEND_URL}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `query GetAssistantLink($google_user_id: String!) {
          pc_assistant_links(where: {google_user_id: {_eq: $google_user_id}}) {
            home_lat home_lng home_city
          }
        }`,
        variables: { google_user_id: googleUserId },
      }),
    });
    const json = await r.json() as {
      data?: { pc_assistant_links?: { home_lat: number; home_lng: number; home_city?: string }[] }
    };
    const link = json.data?.pc_assistant_links?.[0];
    if (link) return { lat: link.home_lat, lng: link.home_lng, city: link.home_city };
  } catch {}
  return { lat: 21.4225, lng: 39.8262, city: 'Mecca' };
}

// ---------------------------------------------------------------------------
// Prayer time helpers
// ---------------------------------------------------------------------------

interface PrayerTimesData {
  prayers:         PrayerEntry[];
  nextPrayer:      string;
  nextPrayerTime:  string;
  countdownSecs:   number;
  hijriDate:       string;
  location:        string;
}

async function fetchPrayerTimes(coords: GeoCoords, date?: string): Promise<PrayerTimesData> {
  const params = new URLSearchParams({
    lat: coords.lat.toString(),
    lng: coords.lng.toString(),
    ...(date ? { date } : {}),
  });
  const r = await fetch(`${BACKEND_URL}/api/prayers/times?${params.toString()}`);
  const j = await r.json() as {
    prayers:          PrayerEntry[];
    next_prayer:      string;
    next_prayer_time: string;
    countdown_secs:   number;
    hijri_date:       string;
    location:         string;
  };
  return {
    prayers:        j.prayers,
    nextPrayer:     j.next_prayer,
    nextPrayerTime: j.next_prayer_time,
    countdownSecs:  j.countdown_secs,
    hijriDate:      j.hijri_date,
    location:       j.location,
  };
}

function buildContext(data: PrayerTimesData): VoiceContext {
  return {
    nextPrayer:     data.nextPrayer,
    nextPrayerTime: data.nextPrayerTime,
    countdownText:  formatCountdown(data.countdownSecs),
    locationName:   data.location,
    hijriDate:      data.hijriDate,
    prayers:        data.prayers,
  };
}

// ---------------------------------------------------------------------------
// Scene: Main (LaunchRequest equivalent)
// ---------------------------------------------------------------------------

app.handle('main', async (conv: ConversationV3) => {
  const userId = (conv.user as { params?: { verifiedUserId?: string } }).params?.verifiedUserId
               ?? conv.session.id;
  try {
    const coords = await resolveLocationForGoogle(userId);
    const data   = await fetchPrayerTimes(coords);
    const ctx    = buildContext(data);

    const text = `The next prayer is ${ctx.nextPrayer} at ${ctx.nextPrayerTime}, `
               + `in ${ctx.countdownText}.`;

    conv.add(text);
    conv.add({
      candidate: {
        first_simple: { variants: [{ speech: text, text }] },
        card: {
          title:    `PrayCalc — ${ctx.locationName}`,
          subtitle: ctx.hijriDate,
          text:     ctx.prayers.map(p => `${p.name}: ${p.time}`).join('\n'),
          button: {
            name: 'Open PrayCalc',
            open: { url: 'https://praycalc.com' },
          },
        },
      },
    } as never); // SDK type gymnastics

    conv.scene.next = { name: 'PrayerTimes' };
  } catch {
    conv.add("I'm having trouble fetching prayer times. Please try again.");
  }
});

// ---------------------------------------------------------------------------
// Scene: PrayerTimes
// ---------------------------------------------------------------------------

app.handle('prayer_times', async (conv: ConversationV3) => {
  const userId = (conv.user as { params?: { verifiedUserId?: string } }).params?.verifiedUserId
               ?? conv.session.id;
  try {
    const coords = await resolveLocationForGoogle(userId);
    const data   = await fetchPrayerTimes(coords);
    const ctx    = buildContext(data);
    const resp   = buildDialogflowPrayerResponse(ctx);

    const text = resp.fulfillmentText;
    conv.add(text);

    // Visual card for Nest Hub
    if (resp.payload?.google?.richResponse?.items?.[1]) {
      conv.add(resp.payload.google.richResponse.items[1] as never);
    }

    conv.session.params = {
      ...(conv.session.params as Record<string, unknown>),
      lastIntent: 'prayer_times',
    };
  } catch {
    conv.add("I couldn't get prayer times right now. Please try again.");
  }
});

// ---------------------------------------------------------------------------
// Scene: AllPrayers
// ---------------------------------------------------------------------------

app.handle('all_prayers', async (conv: ConversationV3) => {
  const userId = (conv.user as { params?: { verifiedUserId?: string } }).params?.verifiedUserId
               ?? conv.session.id;
  try {
    const coords = await resolveLocationForGoogle(userId);
    const data   = await fetchPrayerTimes(coords);
    const ctx    = buildContext(data);
    const resp   = buildDialogflowAllPrayersResponse(ctx);

    conv.add(resp.fulfillmentText);

    if (resp.payload?.google?.richResponse?.items?.[1]) {
      conv.add(resp.payload.google.richResponse.items[1] as never);
    }
  } catch {
    conv.add("I couldn't get all prayer times right now. Please try again.");
  }
});

// ---------------------------------------------------------------------------
// Scene: QiblaQuery
// ---------------------------------------------------------------------------

app.handle('qibla_query', async (conv: ConversationV3) => {
  const userId = (conv.user as { params?: { verifiedUserId?: string } }).params?.verifiedUserId
               ?? conv.session.id;
  try {
    const coords = await resolveLocationForGoogle(userId);
    const r      = await fetch(`${BACKEND_URL}/api/qibla?lat=${coords.lat}&lng=${coords.lng}`);
    const j      = await r.json() as { direction?: number; compassPoint?: string };
    const deg    = Math.round(j.direction ?? 0);
    const pt     = j.compassPoint ?? '';
    const loc    = coords.city ?? 'your location';

    conv.add(`From ${loc}, the Qibla direction is ${deg} degrees ${pt}.`);
  } catch {
    conv.add("I couldn't calculate the Qibla direction. Please try again.");
  }
});

// ---------------------------------------------------------------------------
// Scene: SetLocation
// ---------------------------------------------------------------------------

app.handle('set_location', async (conv: ConversationV3) => {
  const userId  = (conv.user as { params?: { verifiedUserId?: string } }).params?.verifiedUserId
                ?? conv.session.id;
  const cityVal = (conv.intent.params?.['City'] as { resolved?: string })?.resolved ?? '';

  if (!cityVal) {
    conv.add("Which city would you like to use for prayer times?");
    return;
  }

  try {
    const geoR = await fetch(`${BACKEND_URL}/api/geo/city?q=${encodeURIComponent(cityVal)}`);
    const geoJ = await geoR.json() as { lat?: number; lng?: number; city?: string };

    if (!geoJ.lat || !geoJ.lng) {
      conv.add(`I couldn't find ${cityVal}. Please try a different city name.`);
      return;
    }

    await fetch(`${BACKEND_URL}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `mutation UpsertGoogleLink($google_user_id: String!, $lat: float8!, $lng: float8!, $city: String) {
          insert_pc_assistant_links_one(
            object: { google_user_id: $google_user_id, home_lat: $lat, home_lng: $lng, home_city: $city }
            on_conflict: { constraint: pc_assistant_links_google_user_id_key, update_columns: [home_lat, home_lng, home_city] }
          ) { id }
        }`,
        variables: { google_user_id: userId, lat: geoJ.lat, lng: geoJ.lng, city: geoJ.city ?? cityVal },
      }),
    });

    conv.add(`Done! Your prayer times location is now set to ${geoJ.city ?? cityVal}.`);
  } catch {
    conv.add(`I couldn't save ${cityVal}. Please try again.`);
  }
});

// ---------------------------------------------------------------------------
// Graceful fallback / unknown intent
// ---------------------------------------------------------------------------

app.handle('unknown', async (conv: ConversationV3) => {
  conv.add(
    "I didn't catch that. You can ask for the next prayer, all prayer times, "
    + "the Qibla direction, or set your location."
  );
});
