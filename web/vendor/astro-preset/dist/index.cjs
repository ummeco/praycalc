"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BRAND_TOKENS_CSS: () => BRAND_TOKENS_CSS,
  astroUmmat: () => astroUmmat
});
module.exports = __toCommonJS(src_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BRAND_TOKENS_CSS,
  astroUmmat
});
//# sourceMappingURL=index.cjs.map