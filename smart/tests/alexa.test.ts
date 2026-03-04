import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

/**
 * Alexa Skills Kit fulfillment tests.
 * The endpoint at POST /alexa/fulfillment handles Alexa webhook requests.
 */

function buildAlexaRequest(
  type: string,
  intentName?: string,
  slots?: Record<string, { value: string }>,
) {
  return {
    version: '1.0',
    session: {
      sessionId: 'test-session-id',
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

describe('POST /alexa/fulfillment', () => {
  it('responds to LaunchRequest with welcome message', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('LaunchRequest'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version', '1.0');
    expect(res.body).toHaveProperty('response');
    expect(res.body.response).toHaveProperty('outputSpeech');
    expect(res.body.response.outputSpeech.type).toBe('SSML');

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('Welcome to PrayCalc');
    expect(ssml).toContain('next prayer time');

    // LaunchRequest should keep the session open
    expect(res.body.response.shouldEndSession).toBe(false);
  });

  it('responds to NextPrayerIntent with next prayer info', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'NextPrayerIntent'));

    expect(res.status).toBe(200);
    expect(res.body.version).toBe('1.0');

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toBeDefined();

    // Should mention a prayer or say all have passed
    const mentionsPrayer = /Fajr|Dhuhr|Asr|Maghrib|Isha|Sunrise|prayers.*passed/i.test(ssml);
    expect(mentionsPrayer).toBe(true);

    // NextPrayer should end the session
    expect(res.body.response.shouldEndSession).toBe(true);
  });

  it('responds to AllPrayersIntent with all prayer times', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'AllPrayersIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('Fajr');
    expect(ssml).toContain('Dhuhr');
    expect(ssml).toContain('Asr');
    expect(ssml).toContain('Maghrib');
    expect(ssml).toContain('Isha');

    // Should end session after listing all prayers
    expect(res.body.response.shouldEndSession).toBe(true);
  });

  it('responds to SpecificPrayerIntent with requested prayer time', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
        prayer: { value: 'fajr' },
      }));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('Fajr');
    expect(ssml).toContain('today');
  });

  it('asks follow-up for unknown prayer name', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'SpecificPrayerIntent', {
        prayer: { value: '' },
      }));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('Which prayer');

    // Should keep session open to get the prayer name
    expect(res.body.response.shouldEndSession).toBe(false);
  });

  it('responds to SessionEndedRequest with empty response', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('SessionEndedRequest'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version', '1.0');
    expect(res.body).toHaveProperty('response');
    // SessionEndedRequest should return an empty response object
    expect(res.body.response).toBeDefined();
  });

  it('responds to QiblaIntent with bearing', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'QiblaIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('Qibla');
    expect(ssml).toContain('degrees');
  });

  it('responds to AMAZON.HelpIntent with instructions', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'AMAZON.HelpIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('next prayer');
    expect(ssml).toContain('Qibla');

    // Help should keep session open
    expect(res.body.response.shouldEndSession).toBe(false);
  });

  it('responds to AMAZON.StopIntent with farewell', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'AMAZON.StopIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('salamu alaykum');
    expect(res.body.response.shouldEndSession).toBe(true);
  });

  it('responds to AMAZON.CancelIntent with farewell', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'AMAZON.CancelIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('salamu alaykum');
  });

  it('handles unknown intent gracefully', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'SomeRandomIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toContain('not sure');

    // Keep session open so user can try again
    expect(res.body.response.shouldEndSession).toBe(false);
  });

  it('includes a visual card for AllPrayersIntent', async () => {
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

  it('wraps speech in SSML speak tags', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send(buildAlexaRequest('IntentRequest', 'AllPrayersIntent'));

    expect(res.status).toBe(200);
    const ssml = res.body.response.outputSpeech.ssml;
    expect(ssml).toMatch(/^<speak>/);
    expect(ssml).toMatch(/<\/speak>$/);
  });
});
