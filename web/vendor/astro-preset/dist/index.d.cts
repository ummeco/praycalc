import { UmmatAstroOptions } from './types.cjs';

/**
 * Minimal Astro AstroIntegration interface shape.
 * We declare only what we need rather than importing the full astro package
 * so this file remains type-safe when astro is not installed (peer dep).
 */
interface AstroIntegration {
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
    addMiddleware?: (options: {
        entrypoint: string;
        order: 'pre' | 'post';
    }) => void;
    /** Update Astro config */
    updateConfig?: (config: Record<string, unknown>) => void;
    /** Current Astro config */
    config?: {
        i18n?: {
            defaultLocale?: string;
        };
    };
    /** Logger */
    logger?: {
        info: (msg: string) => void;
        warn: (msg: string) => void;
    };
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
declare function astroUmmat(options?: UmmatAstroOptions): AstroIntegration;

/**
 * Core @ummat/brand CSS custom-property declaration block.
 *
 * Injected into Astro document <head> as an inline <style> so pages can
 * reference --brand-* variables without a separate link/import.
 */
declare const BRAND_TOKENS_CSS = "\n/* @ummat/brand design tokens \u2014 injected by @ummat/astro-preset */\n:root {\n  /* --- Green scale --- */\n  --brand-green-light: #C9F27A;\n  --brand-green-mid:   #79C24C;\n  --brand-green-dark:  #1E5E2F;\n  --brand-green-deep:  #0D2F17;\n\n  /* --- Semantic aliases --- */\n  --brand-primary:        var(--brand-green-mid);\n  --brand-primary-hover:  var(--brand-green-dark);\n  --brand-accent:         var(--brand-green-light);\n  --brand-background:     #FFFFFF;\n  --brand-surface:        #F9FAFB;\n  --brand-text-primary:   #111827;\n  --brand-text-secondary: #6B7280;\n  --brand-border:         #E5E7EB;\n\n  /* --- Focus ring --- */\n  --brand-focus-ring: 0 0 0 3px rgba(121, 194, 76, 0.45);\n}\n";

export { type AstroIntegration, BRAND_TOKENS_CSS, UmmatAstroOptions, astroUmmat };
