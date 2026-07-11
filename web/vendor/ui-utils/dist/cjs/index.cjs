"use strict";
/**
 * @praycalc/ui-utils — shared clamp/format helpers.
 *
 * Purpose: Single home for small pure UI helpers that were being
 *          re-implemented verbatim across web/desktop/mobile/tv surfaces.
 * Outputs: All public helpers.
 * Constraints: zero runtime dependencies; ESM + CJS + types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampMinutes1to60 = exports.clampRotateMinutes = exports.clamp = void 0;
var clamp_js_1 = require("./clamp.cjs");
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return clamp_js_1.clamp; } });
Object.defineProperty(exports, "clampRotateMinutes", { enumerable: true, get: function () { return clamp_js_1.clampRotateMinutes; } });
Object.defineProperty(exports, "clampMinutes1to60", { enumerable: true, get: function () { return clamp_js_1.clampMinutes1to60; } });
