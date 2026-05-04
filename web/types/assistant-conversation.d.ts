// Ambient declarations for @assistant/conversation (Google Actions SDK).
// Used in smarthome/google/fulfillment/index.ts which is checked transitively
// by the web tsconfig via the import in app/api/actions/google/route.ts.
// The actual package lives with the Actions fulfillment deployment.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@assistant/conversation' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ConversationV3 = Record<string, any>;
  interface ConversationApp {
    handle(name: string, handler: (conv: ConversationV3) => unknown | Promise<unknown>): this;
    catch(handler: (conv: ConversationV3, error: Error) => unknown | Promise<unknown>): this;
    handler(req: unknown, res: unknown, next?: (err?: Error) => void): void;
  }
  export function conversation(options?: Record<string, unknown>): ConversationApp;
}
