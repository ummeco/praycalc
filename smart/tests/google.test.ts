import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

/**
 * Google Actions fulfillment tests.
 * The endpoint at POST /google/fulfillment handles Dialogflow webhook requests.
 */

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

describe('POST /google/fulfillment', () => {
  it('responds to NextPrayer intent', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('NextPrayer'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fulfillmentMessages');
    expect(res.body).toHaveProperty('payload');
    expect(res.body.payload).toHaveProperty('google');

    const ssml = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0]?.ssml;
    expect(ssml).toBeDefined();
    expect(typeof ssml).toBe('string');

    // Should mention a prayer name or "All prayers for today have passed"
    const text = ssml.replace(/<[^>]+>/g, '');
    const mentionsPrayer = /Fajr|Dhuhr|Asr|Maghrib|Isha|Sunrise|prayers.*passed/i.test(text);
    expect(mentionsPrayer).toBe(true);
  });

  it('responds to next_prayer intent (snake_case variant)', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('next_prayer'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('payload');
  });

  it('responds to AllPrayers intent with all prayer times', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('AllPrayers'));

    expect(res.status).toBe(200);

    const ssml = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0]?.ssml;
    expect(ssml).toBeDefined();
    const text = ssml.replace(/<[^>]+>/g, '');

    // Should mention all five daily prayers
    expect(text).toContain('Fajr');
    expect(text).toContain('Dhuhr');
    expect(text).toContain('Asr');
    expect(text).toContain('Maghrib');
    expect(text).toContain('Isha');
  });

  it('responds to all_prayers intent (snake_case variant)', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('all_prayers'));

    expect(res.status).toBe(200);

    const ssml = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0]?.ssml;
    const text = ssml.replace(/<[^>]+>/g, '');
    expect(text).toContain('Fajr');
    expect(text).toContain('Isha');
  });

  it('returns welcome message for unknown intent', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('SomeUnknownIntent'));

    expect(res.status).toBe(200);

    const ssml = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0]?.ssml;
    expect(ssml).toBeDefined();
    const text = ssml.replace(/<[^>]+>/g, '');

    expect(text).toContain('Welcome to PrayCalc');
    expect(text).toContain('next prayer time');
  });

  it('does not end conversation for interactive intents', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('NextPrayer'));

    expect(res.status).toBe(200);
    expect(res.body.payload.google.expectUserResponse).toBe(true);
  });

  it('returns displayText alongside ssml', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('AllPrayers'));

    expect(res.status).toBe(200);

    const simpleResponse = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0];
    expect(simpleResponse).toHaveProperty('ssml');
    expect(simpleResponse).toHaveProperty('displayText');

    // displayText should be SSML stripped of tags
    expect(simpleResponse.displayText).not.toContain('<speak>');
    expect(simpleResponse.displayText).not.toContain('</speak>');
  });

  it('handles SpecificPrayer intent', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('SpecificPrayer', { prayer: 'fajr' }));

    expect(res.status).toBe(200);

    const ssml = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0]?.ssml;
    const text = ssml.replace(/<[^>]+>/g, '');
    expect(text).toContain('Fajr');
  });

  it('handles QiblaDirection intent', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .send(buildGoogleRequest('QiblaDirection'));

    expect(res.status).toBe(200);

    const ssml = res.body.fulfillmentMessages[0]?.simpleResponses?.simpleResponses?.[0]?.ssml;
    const text = ssml.replace(/<[^>]+>/g, '');
    expect(text).toContain('Qibla');
    expect(text).toContain('degrees');
  });
});
