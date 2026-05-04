// Ambient declarations for ask-sdk-model (Alexa Skills Kit request/response models).
// Used in smarthome/alexa/lambda/index.ts for SessionEndedRequest and IntentRequest types.

declare module 'ask-sdk-model' {
  export interface Slot {
    name: string;
    value?: string;
    confirmationStatus?: string;
    resolutions?: unknown;
  }
  export interface Intent {
    name: string;
    confirmationStatus?: string;
    slots?: Record<string, Slot>;
  }
  export interface IntentRequest {
    type: 'IntentRequest';
    requestId: string;
    timestamp: string;
    locale?: string;
    intent: Intent;
  }
  export interface SessionEndedRequest {
    type: 'SessionEndedRequest';
    requestId: string;
    timestamp: string;
    locale?: string;
    reason?: string;
    error?: { type: string; message: string };
  }
}
