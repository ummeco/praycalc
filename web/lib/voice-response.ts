// voice-response.ts — v1.1 SSML + response builders for voice assistants.
// Spec §15.4, S19-G T31
//
// Builds:
//   - Alexa responses with SSML phoneme tags for Arabic prayer names
//   - Google Dialogflow/Actions responses with visual cards for Nest Hub
//   - Shared prayer-time utterance format

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrayerEntry {
  name:       string;    // "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
  time:       string;    // "3:47 PM" or "15:47"
  isNext:     boolean;
  isDone:     boolean;
}

export interface VoiceContext {
  nextPrayer:      string;
  nextPrayerTime:  string;
  countdownText:   string;     // "2 hours and 17 minutes"
  locationName:    string;
  hijriDate:       string;
  prayers:         PrayerEntry[];
}

// ---------------------------------------------------------------------------
// IPA phoneme map for Arabic prayer names (Spec §15.4)
// ---------------------------------------------------------------------------

const PRAYER_IPA: Record<string, string> = {
  Fajr:    'fɑːdʒr',
  Sunrise: 'sʌnraɪz',   // no Arabic phoneme needed; English is fine
  Dhuhr:   'ðʊhr',
  Asr:     'ɑːsr',
  Maghrib: 'mɑːɣrɪb',
  Isha:    'ɪʃɑː',
};

/**
 * Wraps a prayer name in an Alexa SSML <phoneme> tag using IPA.
 * Falls back to the plain name if no IPA mapping exists.
 */
function alexaPhoneme(name: string): string {
  const ipa = PRAYER_IPA[name];
  if (!ipa) return name;
  return `<phoneme alphabet="ipa" ph="${ipa}">${name}</phoneme>`;
}

/**
 * Returns an SSML-safe version of the prayer name for Google (no phoneme
 * tags — Google TTS handles Arabic loanwords acceptably without them).
 */
function googlePrayerName(name: string): string {
  return name; // Google TTS pronounces these acceptably without custom phonemes
}

// ---------------------------------------------------------------------------
// Alexa response builders
// ---------------------------------------------------------------------------

export interface AlexaResponse {
  outputSpeech: {
    type:  'SSML';
    ssml:  string;
  };
  card?: {
    type:    'Standard';
    title:   string;
    text:    string;
  };
  shouldEndSession?: boolean;
}

/**
 * Builds an Alexa response for the next prayer question.
 * "The next prayer is Asr at 3:47 PM, in 2 hours and 17 minutes."
 */
export function buildAlexaPrayerResponse(ctx: VoiceContext): AlexaResponse {
  const pName  = alexaPhoneme(ctx.nextPrayer);
  const speech = `<speak>The next prayer is ${pName} at ${ctx.nextPrayerTime}, `
               + `in ${ctx.countdownText}.</speak>`;

  return {
    outputSpeech: { type: 'SSML', ssml: speech },
    card: {
      type:  'Standard',
      title: `PrayCalc — ${ctx.locationName}`,
      text:  `Next: ${ctx.nextPrayer} at ${ctx.nextPrayerTime}\n`
           + `(${ctx.countdownText})\n\n`
           + ctx.prayers.map(p => `${p.name}: ${p.time}`).join('\n'),
    },
    shouldEndSession: true,
  };
}

/**
 * Builds an Alexa response listing all 5 prayers for today.
 */
export function buildAlexaAllPrayersResponse(ctx: VoiceContext): AlexaResponse {
  const prayerList = ctx.prayers
    .filter(p => p.name !== 'Sunrise')
    .map(p => `${alexaPhoneme(p.name)} at ${p.time}`)
    .join(', ');

  const speech = `<speak>Today's prayer times in ${ctx.locationName} are: `
               + `${prayerList}.</speak>`;

  return {
    outputSpeech: { type: 'SSML', ssml: speech },
    card: {
      type:  'Standard',
      title: `PrayCalc — Prayer Times for ${ctx.locationName}`,
      text:  ctx.prayers.map(p => `${p.name}: ${p.time}`).join('\n')
           + `\n\n${ctx.hijriDate}`,
    },
    shouldEndSession: true,
  };
}

/**
 * Builds a welcome / launch Alexa response.
 * Tells the user the next prayer and offers to give all times.
 */
export function buildAlexaWelcomeResponse(ctx: VoiceContext): AlexaResponse {
  const pName  = alexaPhoneme(ctx.nextPrayer);
  const speech = `<speak>Welcome to PrayCalc. `
               + `The next prayer is ${pName} at ${ctx.nextPrayerTime}, `
               + `in ${ctx.countdownText}. `
               + `Would you like all of today's prayer times?</speak>`;

  return {
    outputSpeech: { type: 'SSML', ssml: speech },
    shouldEndSession: false,
  };
}

// ---------------------------------------------------------------------------
// Dialogflow / Google Assistant response builders
// ---------------------------------------------------------------------------

export interface DialogflowResponse {
  fulfillmentText: string;
  fulfillmentMessages: unknown[];
  payload?: { google?: GooglePayload };
}

interface GooglePayload {
  expectUserResponse: boolean;
  richResponse: {
    items: unknown[];
    suggestions?: { title: string }[];
  };
}

/**
 * Builds a Dialogflow response for the next prayer query.
 * Includes a Basic Card with prayer list for Nest Hub and smart displays.
 */
export function buildDialogflowPrayerResponse(ctx: VoiceContext): DialogflowResponse {
  const text = `The next prayer is ${ctx.nextPrayer} at ${ctx.nextPrayerTime} `
             + `(in ${ctx.countdownText}).`;

  const tableText = ctx.prayers
    .map(p => `${p.name}: ${p.time}${p.isNext ? ' ←' : ''}`)
    .join('\n');

  return {
    fulfillmentText: text,
    fulfillmentMessages: [
      { text: { text: [text] } },
    ],
    payload: {
      google: {
        expectUserResponse: false,
        richResponse: {
          items: [
            {
              simpleResponse: {
                textToSpeech: text,
                displayText:  text,
              },
            },
            // ImageCard with prayer list table for Nest Hub / Echo Show
            {
              basicCard: {
                title:       `PrayCalc — ${ctx.locationName}`,
                subtitle:    ctx.hijriDate,
                formattedText: tableText,
                image: {
                  url:               'https://praycalc.com/assets/og-image.png',
                  accessibilityText: 'PrayCalc prayer times',
                },
                buttons: [
                  {
                    title: 'Open PrayCalc',
                    openUrlAction: { url: 'https://praycalc.com' },
                  },
                ],
              },
            },
          ],
          suggestions: [
            { title: 'All prayer times' },
            { title: 'Qibla direction' },
            { title: 'Tomorrow\'s times' },
          ],
        },
      },
    },
  };
}

/**
 * Builds a Dialogflow response for listing all prayer times.
 */
export function buildDialogflowAllPrayersResponse(ctx: VoiceContext): DialogflowResponse {
  const text = `Today's prayer times in ${ctx.locationName}: `
             + ctx.prayers.map(p => `${p.name} at ${p.time}`).join(', ')
             + '.';

  const tableText = ctx.prayers
    .map(p => `${p.name}: ${p.time}`)
    .join('\n');

  return {
    fulfillmentText: text,
    fulfillmentMessages: [{ text: { text: [text] } }],
    payload: {
      google: {
        expectUserResponse: false,
        richResponse: {
          items: [
            { simpleResponse: { textToSpeech: text, displayText: text } },
            {
              basicCard: {
                title:         `Prayer Times — ${ctx.locationName}`,
                subtitle:      ctx.hijriDate,
                formattedText: tableText,
              },
            },
          ],
        },
      },
    },
  };
}

/**
 * Alexa adhan voice response: announces a prayer arrival.
 * Called by the push/notification system, not user-initiated.
 */
export function buildAdhanaVoiceResponse(
  prayerName: string,
  prayerTime: string,
): AlexaResponse {
  const pName  = alexaPhoneme(prayerName);
  const speech = `<speak>It is time for ${pName} prayer. ${pName} prayer at ${prayerTime}.</speak>`;
  return {
    outputSpeech: { type: 'SSML', ssml: speech },
    card: {
      type:  'Standard',
      title: `${prayerName} Prayer — PrayCalc`,
      text:  `${prayerName} prayer time: ${prayerTime}`,
    },
    shouldEndSession: true,
  };
}

// ---------------------------------------------------------------------------
// Countdown text formatting
// ---------------------------------------------------------------------------

/**
 * Converts seconds remaining into a human-readable string.
 * Examples: "2 hours and 17 minutes", "45 minutes", "3 minutes"
 */
export function formatCountdown(secondsRemaining: number): string {
  const absSeconds = Math.abs(secondsRemaining);
  const hours   = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return 'less than a minute';
}
