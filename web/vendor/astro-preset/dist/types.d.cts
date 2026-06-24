/**
 * Options accepted by astroUmmat() integration factory.
 *
 * All fields are optional — the factory applies safe defaults when omitted.
 */
interface UmmatAstroOptions {
    /**
     * Inject @ummat/brand CSS custom properties (design tokens) into every
     * page's <head>. Defaults to true.
     *
     * The injected <style> block defines all --brand-* CSS variables so Astro
     * pages can use them without a separate CSS import.
     */
    injectBrandTokens?: boolean;
    /**
     * Set the HTML document `dir` attribute to 'rtl' for RTL locales.
     * Locales checked: ar, ur, fa, he, ckb (and their BCP-47 region variants
     * such as ar-SA, fa-IR).
     *
     * Reads the current page's `lang` attribute set by Astro's i18n routing.
     * Defaults to true.
     */
    setRtlDirection?: boolean;
    /**
     * Enable urql SSR support. When true the integration registers the
     * `astro:config:setup` hook needed to serialize urql exchange state for
     * SSR hydration. Defaults to true.
     */
    urqlSsr?: boolean;
}

export type { UmmatAstroOptions };
