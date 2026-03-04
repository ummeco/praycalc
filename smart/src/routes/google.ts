import { Router } from 'express';
import { calculatePrayerTimes } from '../lib/prayer-calculator.js';
import { hasUmmatPlus, checkFreeQueryLimit } from '../lib/subscription.js';
import { resolveUserFromToken } from './oauth.js';

export const googleRouter = Router();

/** POST /google/fulfillment — Actions on Google webhook handler. */
googleRouter.post('/fulfillment', async (req, res) => {
  const body = req.body;
  const intent = body?.queryResult?.intent?.displayName || body?.intent?.name || '';
  const params = body?.queryResult?.parameters || {};

  // Extract user info from account linking
  const userId = body?.originalDetectIntentRequest?.payload?.user?.accessToken
    ? await resolveUserId(body.originalDetectIntentRequest.payload.user.accessToken)
    : undefined;

  // Check subscription/free limit
  const isPremium = await hasUmmatPlus(userId);
  if (!isPremium) {
    const identifier = userId || req.ip || 'unknown';
    const limit = checkFreeQueryLimit(identifier);
    if (!limit.allowed) {
      res.json(buildGoogleResponse(
        'You\'ve used your 5 free queries today. Subscribe to Ummat Plus for unlimited access at praycalc.com/upgrade.',
        true,
      ));
      return;
    }
  }

  // Get location
  const lat = params.lat || body?.device?.location?.coordinates?.latitude || 40.7128;
  const lng = params.lng || body?.device?.location?.coordinates?.longitude || -74.0060;
  const dateStr = new Date().toISOString().split('T')[0];
  const method = 'isna';
  const madhab = 'shafii';

  const times = calculatePrayerTimes(lat, lng, dateStr, method, madhab);

  let speech = '';

  switch (intent) {
    case 'NextPrayer':
    case 'next_prayer': {
      if (times.nextPrayer) {
        speech = `<speak>The next prayer is <say-as interpret-as="spell-out">${times.nextPrayer.name}</say-as> at ${times.nextPrayer.time}, in about ${times.nextPrayer.minutesUntil} minutes.</speak>`;
      } else {
        speech = '<speak>All prayers for today have passed. Check back tomorrow for Fajr.</speak>';
      }
      break;
    }

    case 'SpecificPrayer':
    case 'specific_prayer': {
      const prayerName = (params.prayer || '').toLowerCase();
      const prayerMap: Record<string, string> = {
        fajr: times.prayers.fajr,
        dhuhr: times.prayers.dhuhr, zuhr: times.prayers.dhuhr,
        asr: times.prayers.asr,
        maghrib: times.prayers.maghrib,
        isha: times.prayers.isha,
      };
      const time = prayerMap[prayerName];
      if (time) {
        speech = `<speak>${capitalize(prayerName)} is at ${time} today.</speak>`;
      } else {
        speech = '<speak>I didn\'t catch which prayer you asked about. You can ask about Fajr, Dhuhr, Asr, Maghrib, or Isha.</speak>';
      }
      break;
    }

    case 'AllPrayers':
    case 'all_prayers': {
      speech = `<speak>Today's prayer times are: Fajr at ${times.prayers.fajr}, Dhuhr at ${times.prayers.dhuhr}, Asr at ${times.prayers.asr}, Maghrib at ${times.prayers.maghrib}, and Isha at ${times.prayers.isha}.</speak>`;
      break;
    }

    case 'QiblaDirection':
    case 'qibla_direction': {
      speech = `<speak>The Qibla direction from your location is ${times.qibla.bearing} degrees.</speak>`;
      break;
    }

    default: {
      speech = '<speak>Welcome to PrayCalc. You can ask me for the next prayer time, all today\'s prayers, a specific prayer time, or the Qibla direction.</speak>';
    }
  }

  res.json(buildGoogleResponse(speech, false));
});

function buildGoogleResponse(ssml: string, endConversation: boolean) {
  return {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {
          simpleResponses: [
            {
              ssml,
              displayText: ssml.replace(/<[^>]+>/g, ''),
            },
          ],
        },
      },
    ],
    payload: {
      google: {
        expectUserResponse: !endConversation,
        richResponse: {
          items: [
            {
              simpleResponse: {
                ssml,
                displayText: ssml.replace(/<[^>]+>/g, ''),
              },
            },
          ],
        },
      },
    },
  };
}

async function resolveUserId(accessToken: string): Promise<string | undefined> {
  return resolveUserFromToken(accessToken);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
