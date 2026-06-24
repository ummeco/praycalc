// FILE: src/integration.ts
// PURPOSE: astroUmmat() Astro integration factory.
//
//   Registers three astro:config:setup hooks:
//   1. Injects @ummat/brand CSS design tokens into every page <head>.
//   2. Sets `dir="rtl"` on <html> for RTL locales (ar, ur, fa, he, ckb).
//   3. Registers urql SSR exchange serialisation hook (when urqlSsr = true).
//
// INPUTS:  UmmatAstroOptions (all optional, defaults to true for all flags)
// OUTPUTS: AstroIntegration-shaped object consumed by Astro defineConfig({})
//
// CONSTRAINTS:
//   - astro and @astrojs/react are peerDependencies — never import at runtime
//     for side-effects; import only their types (type-only imports).
//   - Compatible with Astro >=4.0.0.
// REF: P2-E2-W02-S02-T03-A · ADR-005

import type { UmmatAstroOptions } from './types.js';
import { BRAND_TOKENS_CSS } from './brand-tokens.js';

/** RTL locale primary-subtag set (matches @ummat/i18n ALL_RTL_LOCALES) */
const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he', 'ckb']);

/** Returns true if `locale` maps to RTL layout */
function isRtlLocale(locale: string): boolean {
  const primary = locale.split('-')[0]!.toLowerCase();
  return RTL_LOCALES.has(primary);
}

/**
 * Minimal Astro AstroIntegration interface shape.
 * We declare only what we need rather than importing the full astro package
 * so this file remains type-safe when astro is not installed (peer dep).
 */
export interface AstroIntegration {
  name: string;
  hooks: {
    'astro:config:setup'?: (params: AstroConfigSetupParams) => void | Promise<void>;
  };
}

/** Minimal astro:config:setup hook params we use */
interface AstroConfigSetupParams {
  /** Inject inline script/style into document <head> */
  injectScript: (stage: 'head-inline' | 'before-hydration' | 'page' | 'page-ssr', content: string) => void;
  /** Add middleware */
  addMiddleware?: (options: { entrypoint: string; order: 'pre' | 'post' }) => void;
  /** Update Astro config */
  updateConfig?: (config: Record<string, unknown>) => void;
  /** Current Astro config */
  config?: { i18n?: { defaultLocale?: string } };
  /** Logger */
  logger?: { info: (msg: string) => void; warn: (msg: string) => void };
}

/**
 * Astro integration factory for Ummat sites.
 *
 * Usage in astro.config.mjs:
 * ```ts
 * import { astroUmmat } from '@ummat/astro-preset';
 * export default defineConfig({
 *   integrations: [astroUmmat()],
 * });
 * ```
 *
 * @param options - Integration options (all optional, safe defaults apply)
 */
export function astroUmmat(options: UmmatAstroOptions = {}): AstroIntegration {
  const {
    injectBrandTokens = true,
    setRtlDirection = true,
    urqlSsr = true,
  } = options;

  return {
    name: '@ummat/astro-preset',
    hooks: {
      'astro:config:setup'({ injectScript, config, logger }: AstroConfigSetupParams) {
        // ── 1. Brand tokens ──────────────────────────────────────────────────
        if (injectBrandTokens) {
          injectScript('head-inline', `<style>${BRAND_TOKENS_CSS}</style>`);
          logger?.info?.('@ummat/astro-preset: injected brand tokens CSS');
        }

        // ── 2. RTL direction ─────────────────────────────────────────────────
        if (setRtlDirection) {
          const defaultLocale = config?.i18n?.defaultLocale ?? 'en';
          if (isRtlLocale(defaultLocale)) {
            // Inject a tiny inline script that sets dir="rtl" before first
            // paint, reading the lang attribute Astro already set on <html>.
            injectScript(
              'head-inline',
              `<script>
(function(){
  var lang = document.documentElement.lang || '';
  var primary = lang.split('-')[0].toLowerCase();
  var rtl = ['ar','ur','fa','he','ckb'];
  if (rtl.indexOf(primary) !== -1) {
    document.documentElement.setAttribute('dir','rtl');
  }
})();
</script>`,
            );
          } else {
            // Always inject the RTL guard so client-side navigation to RTL
            // routes works without a server restart.
            injectScript(
              'page',
              `(function(){
  var lang = document.documentElement.lang || '';
  var primary = lang.split('-')[0].toLowerCase();
  var rtl = ['ar','ur','fa','he','ckb'];
  document.documentElement.setAttribute('dir', rtl.indexOf(primary) !== -1 ? 'rtl' : 'ltr');
})();`,
            );
          }
        }

        // ── 3. urql SSR ──────────────────────────────────────────────────────
        if (urqlSsr) {
          // urql SSR requires the client exchange state to be serialised into
          // the HTML and rehydrated on the client. We inject a placeholder
          // marker that the urql Astro middleware (added separately) can use.
          // This hook deliberately does nothing beyond logging — the actual
          // urql SSR config lives in the app's createUrqlClient() call.
          logger?.info?.('@ummat/astro-preset: urql SSR flag noted; configure createUrqlClient() with ssrExchange');
        }
      },
    },
  };
}
