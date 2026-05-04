// praycalc/smarthome/alexa/lambda/index.ts — Alexa skill fulfillment
// Spec §15.2, S19-G T32
//
// Uses ask-sdk-core (Node.js). Handles:
//   LaunchRequest           → Welcome + next prayer
//   SpecificPrayerIntent    → Single prayer time (e.g. "when is Asr")
//   AllPrayersIntent        → All 5 prayer times for today
//   QiblaIntent             → Qibla direction in degrees
//   TomorrowPrayersIntent   → All 5 prayers for tomorrow
//   SetLocationIntent       → Persist city in assistant_links table
//   AMAZON.HelpIntent       → Help prompt
//   AMAZON.CancelIntent / AMAZON.StopIntent → Goodbye
//
// Security:
//   - ALEXA_SKILL_ID validated on every request (RequestInterceptor)
//   - Alexa signature verification: handled by ask-sdk; caller must deploy
//     behind the Alexa Skills Kit endpoint config (signatures verified by SDK)
//
// Location resolution order:
//   1. pc_assistant_links.home_lat/lng for linked accounts
//   2. Alexa device location API (requires Alexa.location permission in manifest)
//   3. Fallback to "Mecca" (lat=21.4225, lng=39.8262)

import Alexa, {
  HandlerInput,
  RequestHandler,
  ErrorHandler,
  RequestInterceptor,
} from 'ask-sdk-core';
import type {
  SessionEndedRequest,
  IntentRequest,
} from 'ask-sdk-model';

import {
  buildAlexaWelcomeResponse,
  buildAlexaPrayerResponse,
  buildAlexaAllPrayersResponse,
  formatCountdown,
  type VoiceContext,
  type PrayerEntry,
} from '../../../web/lib/voice-response';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ALEXA_SKILL_ID = process.env.ALEXA_SKILL_ID ?? '';
const BACKEND_URL    = process.env.UMMAT_BACKEND_URL ?? 'https://api.praycalc.com';
const ADMIN_SECRET   = process.env.HASURA_ADMIN_SECRET ?? '';

// ---------------------------------------------------------------------------
// Request interceptor: validate skill ID
// ---------------------------------------------------------------------------

const SkillIdInterceptor: RequestInterceptor = {
  async process(handlerInput: HandlerInput) {
    const appId = handlerInput.requestEnvelope.context.System.application.applicationId;
    if (ALEXA_SKILL_ID && appId !== ALEXA_SKILL_ID) {
      throw new Error(`Unauthorized skill ID: ${appId}`);
    }
  },
};

// ---------------------------------------------------------------------------
// Location helpers
// ---------------------------------------------------------------------------

interface GeoCoords {
  lat: number;
  lng: number;
  city?: string;
}

async function resolveLocation(handlerInput: HandlerInput): Promise<GeoCoords> {
  // 1. Try linked account's saved location from pc_assistant_links
  const userId = handlerInput.requestEnvelope.context.System.user.userId;
  try {
    const r = await fetch(`${BACKEND_URL}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `query GetAssistantLink($alexa_user_id: String!) {
          pc_assistant_links(where: {alexa_user_id: {_eq: $alexa_user_id}}) {
            home_lat home_lng home_city
          }
        }`,
        variables: { alexa_user_id: userId },
      }),
    });
    const json = await r.json() as {
      data?: { pc_assistant_links?: { home_lat: number; home_lng: number; home_city?: string }[] }
    };
    const link = json.data?.pc_assistant_links?.[0];
    if (link) return { lat: link.home_lat, lng: link.home_lng, city: link.home_city };
  } catch {}

  // 2. Try Alexa device location API
  try {
    const serviceClientFactory = handlerInput.serviceClientFactory;
    if (serviceClientFactory) {
      const deviceLocationServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
      const address = await deviceLocationServiceClient.getFullAddress(
        handlerInput.requestEnvelope.context.System.device.deviceId,
      );
      if (address.city) {
        // Geocode the city via PrayCalc API
        const geoR = await fetch(`${BACKEND_URL}/api/geo/city?q=${encodeURIComponent(address.city)}`);
        const geoJ = await geoR.json() as { lat?: number; lng?: number };
        if (geoJ.lat && geoJ.lng) return { lat: geoJ.lat, lng: geoJ.lng, city: address.city ?? undefined };
      }
    }
  } catch {}

  // 3. Default: Mecca
  return { lat: 21.4225, lng: 39.8262, city: 'Mecca' };
}

// ---------------------------------------------------------------------------
// Prayer time helpers
// ---------------------------------------------------------------------------

interface PrayerTimesData {
  prayers: PrayerEntry[];
  nextPrayer: string;
  nextPrayerTime: string;
  countdownSecs: number;
  hijriDate: string;
  location: string;
}

async function fetchPrayerTimes(coords: GeoCoords, date?: string): Promise<PrayerTimesData> {
  const params = new URLSearchParams({
    lat:  coords.lat.toString(),
    lng:  coords.lng.toString(),
    ...(date ? { date } : {}),
  });
  const r = await fetch(`${BACKEND_URL}/api/prayers/times?${params.toString()}`);
  const j = await r.json() as {
    prayers:         PrayerEntry[];
    next_prayer:     string;
    next_prayer_time: string;
    countdown_secs:  number;
    hijri_date:      string;
    location:        string;
  };
  return {
    prayers:         j.prayers,
    nextPrayer:      j.next_prayer,
    nextPrayerTime:  j.next_prayer_time,
    countdownSecs:   j.countdown_secs,
    hijriDate:       j.hijri_date,
    location:        j.location,
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
// Request handlers
// ---------------------------------------------------------------------------

// MARK: LaunchRequest

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    try {
      const coords = await resolveLocation(handlerInput);
      const data   = await fetchPrayerTimes(coords);
      const ctx    = buildContext(data);
      const resp   = buildAlexaWelcomeResponse(ctx);
      return handlerInput.responseBuilder
        .speak(resp.outputSpeech.ssml.replace(/<\/?speak>/g, ''))
        .withShouldEndSession(false)
        .getResponse();
    } catch {
      return handlerInput.responseBuilder
        .speak('Welcome to PrayCalc. I had trouble fetching prayer times. Please try again.')
        .getResponse();
    }
  },
};

// MARK: SpecificPrayerIntent

const SpecificPrayerIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request as IntentRequest).intent.name === 'SpecificPrayerIntent';
  },
  async handle(handlerInput) {
    const slots = (handlerInput.requestEnvelope.request as IntentRequest).intent.slots ?? {};
    const prayerSlot = slots['Prayer']?.value ?? '';
    const normalize  = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const prayerName = normalize(prayerSlot);

    try {
      const coords = await resolveLocation(handlerInput);
      const data   = await fetchPrayerTimes(coords);
      const ctx    = buildContext(data);

      const found = ctx.prayers.find(p =>
        p.name.toLowerCase() === prayerName.toLowerCase()
      );

      if (!found) {
        return handlerInput.responseBuilder
          .speak(`I couldn't find a prayer called ${prayerName}. Try Fajr, Dhuhr, Asr, Maghrib, or Isha.`)
          .getResponse();
      }

      const isNext = found.isNext ? `, which is your next prayer in ${ctx.countdownText}` : '';
      return handlerInput.responseBuilder
        .speak(`${prayerName} is at ${found.time}${isNext}.`)
        .getResponse();
    } catch {
      return handlerInput.responseBuilder
        .speak(`I had trouble fetching ${prayerName} time. Please try again.`)
        .getResponse();
    }
  },
};

// MARK: AllPrayersIntent

const AllPrayersIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request as IntentRequest).intent.name === 'AllPrayersIntent';
  },
  async handle(handlerInput) {
    try {
      const coords = await resolveLocation(handlerInput);
      const data   = await fetchPrayerTimes(coords);
      const ctx    = buildContext(data);
      const resp   = buildAlexaAllPrayersResponse(ctx);
      return handlerInput.responseBuilder
        .speak(resp.outputSpeech.ssml.replace(/<\/?speak>/g, ''))
        .withSimpleCard(resp.card!.title, resp.card!.text)
        .getResponse();
    } catch {
      return handlerInput.responseBuilder
        .speak("I couldn't get today's prayer times. Please try again.")
        .getResponse();
    }
  },
};

// MARK: QiblaIntent

const QiblaIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request as IntentRequest).intent.name === 'QiblaIntent';
  },
  async handle(handlerInput) {
    try {
      const coords = await resolveLocation(handlerInput);
      const r  = await fetch(`${BACKEND_URL}/api/qibla?lat=${coords.lat}&lng=${coords.lng}`);
      const j  = await r.json() as { direction?: number; compassPoint?: string };
      const deg = Math.round(j.direction ?? 0);
      const pt  = j.compassPoint ?? '';
      const loc = coords.city ?? 'your location';
      return handlerInput.responseBuilder
        .speak(`From ${loc}, the Qibla direction is ${deg} degrees ${pt}. Face towards the Kaaba.`)
        .getResponse();
    } catch {
      return handlerInput.responseBuilder
        .speak("I couldn't calculate the Qibla direction. Please try again.")
        .getResponse();
    }
  },
};

// MARK: TomorrowPrayersIntent

const TomorrowPrayersIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request as IntentRequest).intent.name === 'TomorrowPrayersIntent';
  },
  async handle(handlerInput) {
    try {
      const coords = await resolveLocation(handlerInput);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      const data    = await fetchPrayerTimes(coords, dateStr);
      const ctx     = buildContext(data);

      const list = ctx.prayers
        .filter(p => p.name !== 'Sunrise')
        .map(p => `${p.name} at ${p.time}`)
        .join(', ');

      return handlerInput.responseBuilder
        .speak(`Tomorrow's prayer times in ${ctx.locationName} are: ${list}.`)
        .withSimpleCard(
          `PrayCalc — Tomorrow in ${ctx.locationName}`,
          ctx.prayers.map(p => `${p.name}: ${p.time}`).join('\n')
        )
        .getResponse();
    } catch {
      return handlerInput.responseBuilder
        .speak("I couldn't get tomorrow's prayer times. Please try again.")
        .getResponse();
    }
  },
};

// MARK: SetLocationIntent

const SetLocationIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request as IntentRequest).intent.name === 'SetLocationIntent';
  },
  async handle(handlerInput) {
    const slots   = (handlerInput.requestEnvelope.request as IntentRequest).intent.slots ?? {};
    const cityVal = slots['City']?.value;
    if (!cityVal) {
      return handlerInput.responseBuilder
        .speak('Which city would you like to use for prayer times?')
        .addElicitSlotDirective('City')
        .getResponse();
    }

    try {
      const geoR = await fetch(`${BACKEND_URL}/api/geo/city?q=${encodeURIComponent(cityVal)}`);
      const geoJ = await geoR.json() as { lat?: number; lng?: number; city?: string };
      if (!geoJ.lat || !geoJ.lng) {
        return handlerInput.responseBuilder
          .speak(`I couldn't find ${cityVal}. Please try a different city name.`)
          .getResponse();
      }

      const userId = handlerInput.requestEnvelope.context.System.user.userId;
      await fetch(`${BACKEND_URL}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({
          query: `mutation UpsertAlexaLink($alexa_user_id: String!, $lat: float8!, $lng: float8!, $city: String) {
            insert_pc_assistant_links_one(
              object: { alexa_user_id: $alexa_user_id, home_lat: $lat, home_lng: $lng, home_city: $city }
              on_conflict: { constraint: pc_assistant_links_alexa_user_id_key, update_columns: [home_lat, home_lng, home_city] }
            ) { id }
          }`,
          variables: { alexa_user_id: userId, lat: geoJ.lat, lng: geoJ.lng, city: geoJ.city ?? cityVal },
        }),
      });

      return handlerInput.responseBuilder
        .speak(`Done! I've set your prayer times location to ${geoJ.city ?? cityVal}.`)
        .getResponse();
    } catch {
      return handlerInput.responseBuilder
        .speak(`I couldn't save ${cityVal}. Please try again.`)
        .getResponse();
    }
  },
};

// MARK: Help / Cancel / Stop

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request as IntentRequest).intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('You can ask for the next prayer, all prayer times, the Qibla direction, '
           + 'or tomorrow\'s prayer times. You can also say "set my location to London" '
           + 'to use a specific city. What would you like to know?')
      .withShouldEndSession(false)
      .getResponse();
  },
};

const CancelStopIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const intent = handlerInput.requestEnvelope.request.type === 'IntentRequest'
      ? (handlerInput.requestEnvelope.request as IntentRequest).intent.name
      : '';
    return intent === 'AMAZON.CancelIntent' || intent === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak('Assalamu alaikum!').getResponse();
  },
};

const SessionEndedHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    const req = handlerInput.requestEnvelope.request as SessionEndedRequest;
    if (req.error) {
      console.error('Session ended with error:', JSON.stringify(req.error));
    }
    return handlerInput.responseBuilder.getResponse();
  },
};

// MARK: Fallback error handler

const GenericErrorHandler: ErrorHandler = {
  canHandle() { return true; },
  handle(handlerInput, error) {
    console.error('Unhandled error:', error.message, error.stack);
    return handlerInput.responseBuilder
      .speak("Sorry, I didn't understand. Please try again.")
      .withShouldEndSession(false)
      .getResponse();
  },
};

// ---------------------------------------------------------------------------
// Skill builder
// ---------------------------------------------------------------------------

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SpecificPrayerIntentHandler,
    AllPrayersIntentHandler,
    QiblaIntentHandler,
    TomorrowPrayersIntentHandler,
    SetLocationIntentHandler,
    HelpIntentHandler,
    CancelStopIntentHandler,
    SessionEndedHandler,
  )
  .addErrorHandlers(GenericErrorHandler)
  .addRequestInterceptors(SkillIdInterceptor)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
