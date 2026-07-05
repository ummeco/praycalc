// Client-safe UI components only — no server-handler.js (node:crypto), so
// bundlers building for the browser never pull in a Node-only dependency.
export { CookieBanner } from './CookieBanner.js';
export { ConsentGatedScript } from './ConsentGatedScript.js';
export { PreferencesModal } from './PreferencesModal.js';
