/**
 * Core types for @acamarata/pray-calc.
 *
 * Purpose: Shared TypeScript interfaces and enums for prayer time calculation.
 * Inputs: N/A (type definitions only)
 * Outputs: Exported types consumed by all algorithm modules.
 * Constraints: Zero runtime dependencies; strict TypeScript.
 */
/**
 * Asr shadow convention: Shafi'i/Maliki/Hanbali (1x) or Hanafi (2x).
 */
export var AsrConvention;
(function (AsrConvention) {
    AsrConvention["shafii"] = "shafii";
    AsrConvention["hanafi"] = "hanafi";
})(AsrConvention || (AsrConvention = {}));
/**
 * Shafaq variant for MSC Isha model.
 * - general: combines ahmer + abyad criteria
 * - ahmer: red twilight (shafaq ahmar)
 * - abyad: white twilight (shafaq abyad)
 */
export var ShafaqMode;
(function (ShafaqMode) {
    ShafaqMode["general"] = "general";
    ShafaqMode["ahmer"] = "ahmer";
    ShafaqMode["abyad"] = "abyad";
})(ShafaqMode || (ShafaqMode = {}));
/**
 * High-latitude rule for locations where twilight may be unreachable.
 * - angleBased: use fraction of night scaled by twilight angle
 * - oneSeventh: Fajr/Isha = 1/7 of the night
 * - middleOfNight: Fajr/Isha split at midnight
 * - twilight: dynamic method — no override needed (default when defined angles work)
 */
export var HighLatitudeRule;
(function (HighLatitudeRule) {
    /** No rule applied — use computed times directly. */
    HighLatitudeRule["none"] = "none";
    /** Fajr/Isha = angle / 60 * night length from midnight. */
    HighLatitudeRule["angleBased"] = "angleBased";
    /** Fajr/Isha offset = 1/7 of the night. */
    HighLatitudeRule["oneSeventh"] = "oneSeventh";
    /** Fajr = midnight - nightHalf, Isha = midnight + nightHalf. */
    HighLatitudeRule["middleOfNight"] = "middleOfNight";
})(HighLatitudeRule || (HighLatitudeRule = {}));
