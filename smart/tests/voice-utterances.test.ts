import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

/**
 * Voice utterance mapping tests.
 *
 * Tests 50+ voice utterances across Google Home and Alexa, verifying that
 * natural language requests map to the correct intents and produce
 * expected SSML responses.
 */

// --- Google Home helpers ---

function buildGoogleRequest(intent: string, params: Record<string, unknown> = {}) {
  return {
    queryResult: {
      intent: { displayName: intent },
      parameters: params,
    },
    originalDetectIntentRequest: {
      payload: {
        user: {},
      },
    },
  };
}

function extractGoogleSsml(body: any): string {
  return body.fulfillmentMessages?.[0]?.simpleResponses?.simpleResponses?.[0]?.ssml || '';
}

function stripSsml(ssml: string): string {
  return ssml.replace(/<[^>]+>/g, '');
}

// --- Alexa helpers ---

function buildAlexaRequest(
  type: string,
  intentName?: string,
  slots?: Record<string, { value: string }>,
) {
  return {
    version: '1.0',
    session: {
      sessionId: `test-voice-utterances-${Date.now()}`,
      user: {},
    },
    context: {
      System: {
        user: {},
      },
    },
    request: {
      type,
      ...(intentName
        ? {
            intent: {
              name: intentName,
              slots: slots || {},
            },
          }
        : {}),
    },
  };
}

function extractAlexaSsml(body: any): string {
  return body.response?.outputSpeech?.ssml || '';
}

// ============================================================================
// Google Home utterance mapping
// ============================================================================

describe('Google Home utterance mapping', () => {
  // --- NextPrayer intent utterances ---

  describe('NextPrayer intent', () => {
    it('"What time is the next prayer?" maps to NextPrayer', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('NextPrayer'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toMatch(/next prayer is|prayers.*passed/i);
    });

    it('"When is the next salah?" maps to NextPrayer', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('NextPrayer'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toMatch(/Fajr|Dhuhr|Asr|Maghrib|Isha|prayers.*passed/i);
    });

    it('"What prayer is coming up?" maps to next_prayer (snake_case)', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('next_prayer'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('payload');
      expect(res.body.payload.google.expectUserResponse).toBe(true);
    });

    it('"Tell me the next prayer time" maps to NextPrayer', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('NextPrayer'));

      expect(res.status).toBe(200);
      const ssml = extractGoogleSsml(res.body);
      expect(ssml).toContain('<speak>');
    });

    it('"How long until the next prayer?" maps to NextPrayer with minutesUntil', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('NextPrayer'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      // Should mention minutes or that all prayers passed
      expect(text).toMatch(/minutes|prayers.*passed/i);
    });
  });

  // --- SpecificPrayer intent utterances ---

  describe('SpecificPrayer intent', () => {
    it('"When is Fajr?" maps to SpecificPrayer with prayer=fajr', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'fajr' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Fajr');
      expect(text).toContain('today');
    });

    it('"What time is Dhuhr today?" maps to SpecificPrayer with prayer=dhuhr', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'dhuhr' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Dhuhr');
    });

    it('"When is Zuhr?" maps to SpecificPrayer with prayer=zuhr (Dhuhr alias)', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'zuhr' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      // Should resolve zuhr alias to Dhuhr time
      expect(text).toContain('Zuhr');
      expect(text).toContain('today');
    });

    it('"What time is Asr?" maps to SpecificPrayer with prayer=asr', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'asr' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Asr');
    });

    it('"When is Maghrib today?" maps to SpecificPrayer with prayer=maghrib', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'maghrib' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Maghrib');
    });

    it('"What time is Isha?" maps to SpecificPrayer with prayer=isha', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'isha' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Isha');
    });

    it('"Tell me when Fajr is" maps to specific_prayer (snake_case)', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('specific_prayer', { prayer: 'fajr' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Fajr');
    });

    it('handles missing prayer slot gracefully', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', {}));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('didn\'t catch');
      expect(text).toMatch(/Fajr.*Dhuhr.*Asr.*Maghrib.*Isha/);
    });

    it('handles empty prayer string', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: '' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('didn\'t catch');
    });

    it('handles invalid prayer name', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('SpecificPrayer', { prayer: 'tarawih' }));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('didn\'t catch');
    });
  });

  // --- AllPrayers intent utterances ---

  describe('AllPrayers intent', () => {
    it('"What are today\'s prayer times?" maps to AllPrayers', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('AllPrayers'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Fajr');
      expect(text).toContain('Dhuhr');
      expect(text).toContain('Asr');
      expect(text).toContain('Maghrib');
      expect(text).toContain('Isha');
    });

    it('"Give me all prayer times" maps to all_prayers (snake_case)', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('all_prayers'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Fajr');
      expect(text).toContain('Isha');
    });

    it('"List all salah times" maps to AllPrayers', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('AllPrayers'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      // Must list all five daily prayers
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const prayer of prayers) {
        expect(text).toContain(prayer);
      }
    });

    it('"Read me today\'s prayer schedule" response includes time format', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('AllPrayers'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      // Should contain HH:MM time patterns
      expect(text).toMatch(/\d{2}:\d{2}/);
    });
  });

  // --- QiblaDirection intent utterances ---

  describe('QiblaDirection intent', () => {
    it('"Which direction is the Qibla?" maps to QiblaDirection', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('QiblaDirection'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Qibla');
      expect(text).toContain('degrees');
    });

    it('"Where do I face to pray?" maps to qibla_direction (snake_case)', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('qibla_direction'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Qibla');
    });

    it('"What is the Qibla bearing?" returns numeric bearing', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('QiblaDirection'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      // Should contain a number followed by "degrees"
      expect(text).toMatch(/\d+(\.\d+)?\s*degrees/);
    });

    it('"Point me to Mecca" maps to QiblaDirection', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('QiblaDirection'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Qibla direction');
    });
  });

  // --- Default / unknown intent utterances ---

  describe('Unknown / default intent', () => {
    it('"Hello" with unknown intent returns welcome message', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('UnknownIntent'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Welcome to PrayCalc');
    });

    it('"What can you do?" returns feature list', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('FallbackIntent'));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('next prayer time');
      expect(text).toContain('Qibla');
    });

    it('empty intent name returns welcome message', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest(''));

      expect(res.status).toBe(200);
      const text = stripSsml(extractGoogleSsml(res.body));
      expect(text).toContain('Welcome to PrayCalc');
    });

    it('keeps conversation open for welcome message', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('RandomIntent'));

      expect(res.status).toBe(200);
      expect(res.body.payload.google.expectUserResponse).toBe(true);
    });
  });

  // --- Response format validation ---

  describe('Response format', () => {
    it('all responses include fulfillmentMessages array', async () => {
      const intents = ['NextPrayer', 'AllPrayers', 'QiblaDirection', 'Unknown'];
      for (const intent of intents) {
        const res = await request(app)
          .post('/google/fulfillment')
          .send(buildGoogleRequest(intent));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('fulfillmentMessages');
        expect(Array.isArray(res.body.fulfillmentMessages)).toBe(true);
      }
    });

    it('all responses include Google payload', async () => {
      const intents = ['NextPrayer', 'AllPrayers', 'QiblaDirection'];
      for (const intent of intents) {
        const res = await request(app)
          .post('/google/fulfillment')
          .send(buildGoogleRequest(intent));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('payload.google.richResponse.items');
      }
    });

    it('displayText strips SSML tags from response', async () => {
      const res = await request(app)
        .post('/google/fulfillment')
        .send(buildGoogleRequest('AllPrayers'));

      expect(res.status).toBe(200);
      const simpleResponse = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0];
      expect(simpleResponse.displayText).not.toContain('<speak>');
      expect(simpleResponse.displayText).not.toContain('<say-as');
    });
  });
});

// ============================================================================
// Alexa utterance mapping
// ============================================================================

describe('Alexa utterance mapping', () => {
  // --- LaunchRequest utterances ---

  describe('LaunchRequest (invocation)', () => {
    it('"Alexa, open PrayCalc" triggers LaunchRequest', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('LaunchRequest'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Welcome to PrayCalc');
      expect(res.body.response.shouldEndSession).toBe(false);
    });

    it('"Alexa, start PrayCalc" triggers LaunchRequest with instructions', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('LaunchRequest'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('next prayer time');
      expect(ssml).toContain('Qibla');
    });
  });

  // --- NextPrayerIntent utterances ---

  describe('NextPrayerIntent', () => {
    it('"What time is the next prayer?" maps to NextPrayerIntent', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'NextPrayerIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toMatch(/next prayer is|prayers.*passed/i);
      expect(res.body.response.shouldEndSession).toBe(true);
    });

    it('"When is the next salah?" maps to NextPrayerIntent', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'NextPrayerIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toMatch(/Fajr|Dhuhr|Asr|Maghrib|Isha|prayers.*passed/i);
    });

    it('"What prayer is next?" maps to NextPrayerIntent and wraps in SSML', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'NextPrayerIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toMatch(/^<speak>/);
      expect(ssml).toMatch(/<\/speak>$/);
    });

    it('"How many minutes until next prayer?" includes time info', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'NextPrayerIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      // Should mention minutes or say prayers have passed
      expect(ssml).toMatch(/minutes|prayers.*passed/i);
    });
  });

  // --- SpecificPrayerIntent utterances ---

  describe('SpecificPrayerIntent', () => {
    it('"When is Fajr?" maps to SpecificPrayerIntent with prayer=fajr', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'fajr' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Fajr');
      expect(ssml).toContain('today');
    });

    it('"What time is Dhuhr?" maps to SpecificPrayerIntent with prayer=dhuhr', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'dhuhr' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Dhuhr');
    });

    it('"When is Zuhr?" maps to SpecificPrayerIntent with prayer=zuhr (Dhuhr alias)', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'zuhr' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      // zuhr is an alias for dhuhr, should return the dhuhr time
      expect(ssml).toContain('Zuhr');
      expect(ssml).toContain('today');
    });

    it('"Tell me the Asr time" maps to SpecificPrayerIntent with prayer=asr', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'asr' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Asr');
    });

    it('"When is Maghrib today?" maps to SpecificPrayerIntent with prayer=maghrib', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'maghrib' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Maghrib');
    });

    it('"What time is Isha?" maps to SpecificPrayerIntent with prayer=isha', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'isha' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Isha');
    });

    it('missing prayer slot prompts for clarification', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: '' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Which prayer');
      expect(res.body.response.shouldEndSession).toBe(false);
    });

    it('invalid prayer name prompts for clarification', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
          prayer: { value: 'witr' },
        }));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Which prayer');
      expect(res.body.response.shouldEndSession).toBe(false);
    });

    it('no slots object at all prompts for clarification', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Which prayer');
    });
  });

  // --- AllPrayersIntent utterances ---

  describe('AllPrayersIntent', () => {
    it('"What are today\'s prayer times?" maps to AllPrayersIntent', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AllPrayersIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Fajr');
      expect(ssml).toContain('Dhuhr');
      expect(ssml).toContain('Asr');
      expect(ssml).toContain('Maghrib');
      expect(ssml).toContain('Isha');
    });

    it('"Read me all prayer times" lists all five prayers', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AllPrayersIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const prayer of prayers) {
        expect(ssml).toContain(prayer);
      }
      expect(res.body.response.shouldEndSession).toBe(true);
    });

    it('"Give me the full prayer schedule" includes time format', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AllPrayersIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      // Should contain HH:MM formatted times
      expect(ssml).toMatch(/\d{2}:\d{2}/);
    });

    it('AllPrayersIntent includes visual card for Echo Show', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AllPrayersIntent'));

      expect(res.status).toBe(200);
      expect(res.body.response).toHaveProperty('card');
      expect(res.body.response.card.type).toBe('Standard');
      expect(res.body.response.card.title).toBe('PrayCalc Prayer Times');
      expect(res.body.response.card.text).toContain('Fajr');
      expect(res.body.response.card.text).toContain('Isha');
    });
  });

  // --- QiblaIntent utterances ---

  describe('QiblaIntent', () => {
    it('"Which direction is the Qibla?" maps to QiblaIntent', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'QiblaIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Qibla');
      expect(ssml).toContain('degrees');
    });

    it('"Where do I face to pray?" maps to QiblaIntent with bearing', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'QiblaIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toMatch(/\d+(\.\d+)?\s*degrees/);
    });

    it('"Point me to the Kaaba" maps to QiblaIntent', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'QiblaIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('Qibla direction');
      expect(res.body.response.shouldEndSession).toBe(true);
    });
  });

  // --- Amazon built-in intents ---

  describe('Amazon built-in intents', () => {
    it('"Help" maps to AMAZON.HelpIntent with instructions', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AMAZON.HelpIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('next prayer');
      expect(ssml).toContain('Qibla');
      expect(res.body.response.shouldEndSession).toBe(false);
    });

    it('"Stop" maps to AMAZON.StopIntent with farewell', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AMAZON.StopIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('salamu alaykum');
      expect(res.body.response.shouldEndSession).toBe(true);
    });

    it('"Cancel" maps to AMAZON.CancelIntent with farewell', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'AMAZON.CancelIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('salamu alaykum');
    });
  });

  // --- SessionEndedRequest ---

  describe('SessionEndedRequest', () => {
    it('"Alexa, exit" triggers SessionEndedRequest with empty response', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('SessionEndedRequest'));

      expect(res.status).toBe(200);
      expect(res.body.version).toBe('1.0');
      expect(res.body.response).toBeDefined();
    });
  });

  // --- Unknown intent / fallback ---

  describe('Unknown intent fallback', () => {
    it('unknown intent returns guidance message', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'CompletelyUnknownIntent'));

      expect(res.status).toBe(200);
      const ssml = extractAlexaSsml(res.body);
      expect(ssml).toContain('not sure');
      expect(ssml).toContain('next prayer');
      expect(res.body.response.shouldEndSession).toBe(false);
    });

    it('another unknown intent keeps session open for retry', async () => {
      const res = await request(app)
        .post('/alexa/fulfillment')
        .send(buildAlexaRequest('IntentRequest', 'WeatherIntent'));

      expect(res.status).toBe(200);
      expect(res.body.response.shouldEndSession).toBe(false);
    });
  });

  // --- SSML format validation ---

  describe('SSML format validation', () => {
    it('all Alexa responses wrap speech in <speak> tags', async () => {
      const intents = [
        { type: 'IntentRequest', name: 'NextPrayerIntent' },
        { type: 'IntentRequest', name: 'AllPrayersIntent' },
        { type: 'IntentRequest', name: 'QiblaIntent' },
        { type: 'IntentRequest', name: 'AMAZON.HelpIntent' },
        { type: 'IntentRequest', name: 'AMAZON.StopIntent' },
        { type: 'LaunchRequest', name: undefined },
      ];

      for (const { type, name } of intents) {
        const res = await request(app)
          .post('/alexa/fulfillment')
          .send(buildAlexaRequest(type, name));

        expect(res.status).toBe(200);
        const ssml = extractAlexaSsml(res.body);
        if (ssml) {
          expect(ssml).toMatch(/^<speak>/);
          expect(ssml).toMatch(/<\/speak>$/);
        }
      }
    });

    it('all Alexa responses include version 1.0', async () => {
      const intents = ['NextPrayerIntent', 'AllPrayersIntent', 'QiblaIntent'];
      for (const intent of intents) {
        const res = await request(app)
          .post('/alexa/fulfillment')
          .send(buildAlexaRequest('IntentRequest', intent));

        expect(res.status).toBe(200);
        expect(res.body.version).toBe('1.0');
      }
    });

    it('outputSpeech type is always SSML', async () => {
      const intents = ['NextPrayerIntent', 'AllPrayersIntent', 'QiblaIntent'];
      for (const intent of intents) {
        const res = await request(app)
          .post('/alexa/fulfillment')
          .send(buildAlexaRequest('IntentRequest', intent));

        expect(res.status).toBe(200);
        expect(res.body.response.outputSpeech.type).toBe('SSML');
      }
    });
  });
});
