import { Router } from 'express';
import { calculatePrayerTimes } from '../lib/prayer-calculator.js';
import { hasUmmatPlus, checkFreeQueryLimit } from '../lib/subscription.js';
import { resolveUserFromToken } from './oauth.js';

export const alexaRouter = Router();

/** POST /alexa/fulfillment — Alexa Skills Kit webhook handler. */
alexaRouter.post('/fulfillment', async (req, res) => {
  const body = req.body;
  const requestType = body?.request?.type;
  const intentName = body?.request?.intent?.name;
  const slots = body?.request?.intent?.slots || {};

  // Account linking token
  const accessToken = body?.session?.user?.accessToken || body?.context?.System?.user?.accessToken;
  const userId = accessToken ? await resolveUserId(accessToken) : undefined;

  // Free tier check
  const isPremium = await hasUmmatPlus(userId);
  if (!isPremium && requestType === 'IntentRequest') {
    const identifier = userId || body?.session?.sessionId || 'unknown';
    const limit = checkFreeQueryLimit(identifier);
    if (!limit.allowed) {
      res.json(buildAlexaResponse(
        'You\'ve used your 5 free queries today. Subscribe to Ummat Plus for unlimited access at praycalc.com slash upgrade.',
        true,
      ));
      return;
    }
  }

  // Location: from device address API or defaults
  const lat = 40.7128;
  const lng = -74.0060;
  const dateStr = new Date().toISOString().split('T')[0];
  const times = calculatePrayerTimes(lat, lng, dateStr);

  // Handle request types
  if (requestType === 'LaunchRequest') {
    res.json(buildAlexaResponse(
      'Welcome to PrayCalc. You can ask me for the next prayer time, all today\'s prayers, a specific prayer, or the Qibla direction. What would you like to know?',
      false,
    ));
    return;
  }

  if (requestType === 'SessionEndedRequest') {
    res.json({ version: '1.0', response: {} });
    return;
  }

  let speech = '';
  let shouldEnd = true;

  switch (intentName) {
    case 'NextPrayerIntent': {
      if (times.nextPrayer) {
        speech = `The next prayer is ${times.nextPrayer.name} at ${times.nextPrayer.time}, in about ${times.nextPrayer.minutesUntil} minutes.`;
      } else {
        speech = 'All prayers for today have passed. Check back tomorrow for Fajr.';
      }
      break;
    }

    case 'SpecificPrayerIntent': {
      const prayerSlot = slots.prayer?.value?.toLowerCase() || '';
      const prayerMap: Record<string, string> = {
        fajr: times.prayers.fajr,
        dhuhr: times.prayers.dhuhr, zuhr: times.prayers.dhuhr,
        asr: times.prayers.asr,
        maghrib: times.prayers.maghrib,
        isha: times.prayers.isha,
      };
      const time = prayerMap[prayerSlot];
      if (time) {
        speech = `${capitalize(prayerSlot)} is at ${time} today.`;
      } else {
        speech = 'Which prayer would you like to know about? You can ask about Fajr, Dhuhr, Asr, Maghrib, or Isha.';
        shouldEnd = false;
      }
      break;
    }

    case 'AllPrayersIntent': {
      speech = `Today's prayer times are: Fajr at ${times.prayers.fajr}, Dhuhr at ${times.prayers.dhuhr}, Asr at ${times.prayers.asr}, Maghrib at ${times.prayers.maghrib}, and Isha at ${times.prayers.isha}.`;
      break;
    }

    case 'QiblaIntent': {
      speech = `The Qibla direction from your location is ${times.qibla.bearing} degrees.`;
      break;
    }

    case 'AMAZON.HelpIntent': {
      speech = 'You can ask me for the next prayer time, all of today\'s prayer times, a specific prayer like Fajr or Maghrib, or the Qibla direction. What would you like?';
      shouldEnd = false;
      break;
    }

    case 'AMAZON.StopIntent':
    case 'AMAZON.CancelIntent': {
      speech = 'As-salamu alaykum.';
      break;
    }

    default: {
      speech = 'I\'m not sure what you asked. You can say "next prayer", "all prayers", or ask about a specific prayer like Fajr.';
      shouldEnd = false;
    }
  }

  // Build APL visual card for Echo Show
  const card = {
    type: 'Standard',
    title: 'PrayCalc Prayer Times',
    text: `Fajr: ${times.prayers.fajr}\nDhuhr: ${times.prayers.dhuhr}\nAsr: ${times.prayers.asr}\nMaghrib: ${times.prayers.maghrib}\nIsha: ${times.prayers.isha}`,
  };

  res.json(buildAlexaResponse(speech, shouldEnd, card));
});

function buildAlexaResponse(
  speech: string,
  shouldEndSession: boolean,
  card?: { type: string; title: string; text: string },
) {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: `<speak>${speech}</speak>`,
      },
      ...(card ? { card } : {}),
      shouldEndSession,
    },
  };
}

async function resolveUserId(accessToken: string): Promise<string | undefined> {
  return resolveUserFromToken(accessToken);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
