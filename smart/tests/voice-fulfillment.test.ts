import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { locationStore, seedOAuthAccessToken } from './setup.js';

/**
 * Voice fulfillment E2E suite — cross-platform parity (WTH Epic H / H1).
 *
 * Complements alexa.test.ts / google.test.ts / voice-utterances.test.ts
 * (intent-mapping and SSML content) with:
 *  - Representative, recorded-shape Alexa + Google payloads asserted against
 *    the FULL fulfillment JSON shape (not just fragment checks).
 *  - The linked-account + saved-location path (prayer-times-by-city), which
 *    no existing test exercised — it depends on resolveUserFromToken() +
 *    getUserLocation(userId), a code path that previously hit a schema-key
 *    mismatch in the test mock (see tests/setup.ts pc_saved_locations fix).
 */

function alexaRequest(
  type: string,
  intentName?: string,
  slots?: Record<string, { value: string }>,
  accessToken?: string,
) {
  const user = accessToken ? { accessToken } : {};
  return {
    version: '1.0',
    session: { sessionId: 'voice-e2e-session', user },
    context: { System: { user } },
    request: {
      type,
      ...(intentName ? { intent: { name: intentName, slots: slots || {} } } : {}),
    },
  };
}

function googleRequest(intent: string, params: Record<string, unknown> = {}, accessToken?: string) {
  return {
    queryResult: { intent: { displayName: intent }, parameters: params },
    originalDetectIntentRequest: { payload: { user: accessToken ? { accessToken } : {} } },
  };
}

describe('Voice fulfillment E2E — Alexa full response shape', () => {
  it('LaunchRequest returns the exact Alexa response envelope', async () => {
    const res = await request(app).post('/alexa/fulfillment').send(alexaRequest('LaunchRequest'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'SSML',
          ssml: expect.stringContaining('Welcome to PrayCalc'),
        },
        shouldEndSession: false,
      },
    });
  });

  it('next-prayer intent returns the full shape including the visual card', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(alexaRequest('IntentRequest', 'NextPrayerIntent'));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      version: '1.0',
      response: {
        outputSpeech: { type: 'SSML', ssml: expect.any(String) },
        card: {
          type: 'Standard',
          title: 'PrayCalc Prayer Times',
          text: expect.stringContaining('Fajr'),
        },
        shouldEndSession: true,
      },
    });
  });
});

describe('Voice fulfillment E2E — Google Home full response shape', () => {
  it('welcome/default intent returns the exact Google response envelope', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(googleRequest('SomeUnrecognizedIntentName'));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      fulfillmentMessages: [
        {
          platform: 'ACTIONS_ON_GOOGLE',
          simpleResponses: {
            simpleResponses: [
              { ssml: expect.stringContaining('Welcome to PrayCalc'), displayText: expect.any(String) },
            ],
          },
        },
      ],
      payload: {
        google: {
          expectUserResponse: true,
          richResponse: {
            items: [{ simpleResponse: { ssml: expect.any(String), displayText: expect.any(String) } }],
          },
        },
      },
    });
  });

  it('next-prayer intent keeps the conversation open (expectUserResponse)', async () => {
    const res = await request(app).post('/google/fulfillment').send(googleRequest('NextPrayer'));

    expect(res.status).toBe(200);
    expect(res.body.payload.google.expectUserResponse).toBe(true);
  });
});

describe('Voice fulfillment E2E — prayer-times-by-city (linked account)', () => {
  const LONDON = { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' };

  it('Alexa: a linked account with a saved city location gets that city\'s Fajr time', async () => {
    const userId = 'user-voice-e2e-alexa-london';
    const rawToken = 'raw-voice-e2e-alexa-london-token';
    seedOAuthAccessToken(rawToken, userId, 'alexa-praycalc');
    locationStore.set(userId, LONDON);

    const linkedRes = await request(app)
      .post('/alexa/fulfillment')
      .send(alexaRequest('IntentRequest', 'SpecificPrayerIntent', { prayer: { value: 'fajr' } }, rawToken));

    const anonRes = await request(app)
      .post('/alexa/fulfillment')
      .send(alexaRequest('IntentRequest', 'SpecificPrayerIntent', { prayer: { value: 'fajr' } }));

    expect(linkedRes.status).toBe(200);
    expect(anonRes.status).toBe(200);

    const linkedSsml = linkedRes.body.response.outputSpeech.ssml;
    const anonSsml = anonRes.body.response.outputSpeech.ssml;

    expect(linkedSsml).toContain('Fajr');
    expect(anonSsml).toContain('Fajr');
    // London vs the anonymous default (New York, via DEFAULT_LAT/LNG env)
    // are different enough that the computed clock time must differ.
    expect(linkedSsml).not.toBe(anonSsml);
  });

  it('Google: a linked account with a saved city location gets all 5 prayers for that city', async () => {
    const userId = 'user-voice-e2e-google-london';
    const rawToken = 'raw-voice-e2e-google-london-token';
    seedOAuthAccessToken(rawToken, userId, 'google-home-praycalc');
    locationStore.set(userId, LONDON);

    const res = await request(app)
      .post('/google/fulfillment')
      .send(googleRequest('AllPrayers', {}, rawToken));

    expect(res.status).toBe(200);
    const ssml = res.body.fulfillmentMessages[0].simpleResponses.simpleResponses[0].ssml;
    for (const prayer of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
      expect(ssml).toContain(prayer);
    }
  });

  it('Alexa: a linked account with NO saved location gets the "set your location" prompt', async () => {
    const userId = 'user-voice-e2e-alexa-no-location';
    const rawToken = 'raw-voice-e2e-alexa-no-location-token';
    seedOAuthAccessToken(rawToken, userId, 'alexa-praycalc');
    // Deliberately do not seed locationStore for this user.

    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(alexaRequest('IntentRequest', 'NextPrayerIntent', undefined, rawToken));

    expect(res.status).toBe(200);
    expect(res.body.response.outputSpeech.ssml).toContain('set your home location');
    expect(res.body.response.shouldEndSession).toBe(true);
  });

  it('Google: a linked account with NO saved location gets the "set your location" prompt', async () => {
    const userId = 'user-voice-e2e-google-no-location';
    const rawToken = 'raw-voice-e2e-google-no-location-token';
    seedOAuthAccessToken(rawToken, userId, 'google-home-praycalc');

    const res = await request(app)
      .post('/google/fulfillment')
      .send(googleRequest('NextPrayer', {}, rawToken));

    expect(res.status).toBe(200);
    const ssml = res.body.fulfillmentMessages[0].simpleResponses.simpleResponses[0].ssml;
    expect(ssml).toContain('set your home location');
  });

  it('an expired/unknown access token falls back to the anonymous default location', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(alexaRequest('IntentRequest', 'NextPrayerIntent', undefined, 'not-a-real-token'));

    expect(res.status).toBe(200);
    // Anonymous default location resolves fine — no "set your location" prompt.
    expect(res.body.response.outputSpeech.ssml).not.toContain('set your home location');
  });
});
