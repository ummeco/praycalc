// src/brand-tokens.ts
var BRAND_TOKENS_CSS = `
/* @ummat/brand design tokens \u2014 injected by @ummat/astro-preset */
:root {
  /* --- Green scale --- */
  --brand-green-light: #C9F27A;
  --brand-green-mid:   #79C24C;
  --brand-green-dark:  #1E5E2F;
  --brand-green-deep:  #0D2F17;

  /* --- Semantic aliases --- */
  --brand-primary:        var(--brand-green-mid);
  --brand-primary-hover:  var(--brand-green-dark);
  --brand-accent:         var(--brand-green-light);
  --brand-background:     #FFFFFF;
  --brand-surface:        #F9FAFB;
  --brand-text-primary:   #111827;
  --brand-text-secondary: #6B7280;
  --brand-border:         #E5E7EB;

  /* --- Focus ring --- */
  --brand-focus-ring: 0 0 0 3px rgba(121, 194, 76, 0.45);
}
`;

// src/integration.ts
var RTL_LOCALES = /* @__PURE__ */ new Set(["ar", "ur", "fa", "he", "ckb"]);
function isRtlLocale(locale) {
  const primary = locale.split("-")[0].toLowerCase();
  return RTL_LOCALES.has(primary);
}
function astroUmmat(options = {}) {
  const {
    injectBrandTokens = true,
    setRtlDirection = true,
    urqlSsr = true
  } = options;
  return {
    name: "@ummat/astro-preset",
    hooks: {
      "astro:config:setup"({ injectScript, config, logger }) {
        if (injectBrandTokens) {
          injectScript("head-inline", `<style>${BRAND_TOKENS_CSS}</style>`);
          logger?.info?.("@ummat/astro-preset: injected brand tokens CSS");
        }
        if (setRtlDirection) {
          const defaultLocale = config?.i18n?.defaultLocale ?? "en";
          if (isRtlLocale(defaultLocale)) {
            injectScript(
              "head-inline",
              `<script>
(function(){
  var lang = document.documentElement.lang || '';
  var primary = lang.split('-')[0].toLowerCase();
  var rtl = ['ar','ur','fa','he','ckb'];
  if (rtl.indexOf(primary) !== -1) {
    document.documentElement.setAttribute('dir','rtl');
  }
})();
</script>`
            );
          } else {
            injectScript(
              "page",
              `(function(){
  var lang = document.documentElement.lang || '';
  var primary = lang.split('-')[0].toLowerCase();
  var rtl = ['ar','ur','fa','he','ckb'];
  document.documentElement.setAttribute('dir', rtl.indexOf(primary) !== -1 ? 'rtl' : 'ltr');
})();`
            );
          }
        }
        if (urqlSsr) {
          logger?.info?.("@ummat/astro-preset: urql SSR flag noted; configure createUrqlClient() with ssrExchange");
        }
      }
    }
  };
}
export {
  BRAND_TOKENS_CSS,
  astroUmmat
};
//# sourceMappingURL=index.js.map