// Client-safe hook + provider only — no server-handler.js (node:crypto), so
// bundlers building for the browser never pull in a Node-only dependency.
export { useConsent, ConsentProvider } from './useConsent.js';
