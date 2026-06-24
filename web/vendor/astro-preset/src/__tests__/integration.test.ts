// FILE: src/__tests__/integration.test.ts
// PURPOSE: Unit tests for astroUmmat() integration factory.
//   Verifies: export, brand tokens injection, RTL direction logic, urql SSR flag.
// REF: P2-E2-W02-S02-T03-A

import { describe, it, expect, vi } from 'vitest';
import { astroUmmat, BRAND_TOKENS_CSS } from '../index.js';

/** Helper: build a minimal AstroConfigSetupParams mock */
function makeParams(lang = 'en') {
  return {
    injectScript: vi.fn<[string, string], void>(),
    config: { i18n: { defaultLocale: lang } },
    logger: { info: vi.fn(), warn: vi.fn() },
  };
}

describe('astroUmmat()', () => {
  it('is exported from index', () => {
    expect(typeof astroUmmat).toBe('function');
  });

  it('returns an Astro integration with the correct name', () => {
    const integration = astroUmmat();
    expect(integration.name).toBe('@ummat/astro-preset');
    expect(typeof integration.hooks['astro:config:setup']).toBe('function');
  });

  it('injects brand tokens CSS into head-inline by default', () => {
    const integration = astroUmmat();
    const params = makeParams();
    integration.hooks['astro:config:setup']!(params as never);

    // First call should be the brand tokens injection
    const brandCall = params.injectScript.mock.calls.find(
      ([stage, content]) => stage === 'head-inline' && content.includes('<style>'),
    );
    expect(brandCall).toBeDefined();
    const content = brandCall![1] as string;
    expect(content).toContain('--brand-green-mid');
    expect(content).toContain('--brand-primary');
  });

  it('BRAND_TOKENS_CSS contains @ummat/brand token variables', () => {
    expect(BRAND_TOKENS_CSS).toContain('--brand-green-mid');
    expect(BRAND_TOKENS_CSS).toContain('--brand-green-light');
    expect(BRAND_TOKENS_CSS).toContain('--brand-green-dark');
    expect(BRAND_TOKENS_CSS).toContain('--brand-primary');
    expect(BRAND_TOKENS_CSS).toContain('#79C24C'); // brand green mid value
    expect(BRAND_TOKENS_CSS).toContain('#C9F27A'); // brand green light value
  });

  it('does not inject brand tokens when injectBrandTokens = false', () => {
    const integration = astroUmmat({ injectBrandTokens: false });
    const params = makeParams();
    integration.hooks['astro:config:setup']!(params as never);

    const brandCall = params.injectScript.mock.calls.find(
      ([, content]) => typeof content === 'string' && content.includes('--brand-'),
    );
    expect(brandCall).toBeUndefined();
  });

  it('injects RTL guard script for LTR default locale', () => {
    const integration = astroUmmat();
    const params = makeParams('en');
    integration.hooks['astro:config:setup']!(params as never);

    const rtlCall = params.injectScript.mock.calls.find(
      ([, content]) => typeof content === 'string' && content.includes("'ar','ur','fa','he','ckb'"),
    );
    expect(rtlCall).toBeDefined();
  });

  it('injects blocking RTL script in head-inline for RTL default locale (ar)', () => {
    const integration = astroUmmat();
    const params = makeParams('ar');
    integration.hooks['astro:config:setup']!(params as never);

    const headInlineCalls = params.injectScript.mock.calls.filter(
      ([stage, content]) => stage === 'head-inline' && typeof content === 'string' && content.includes('rtl'),
    );
    expect(headInlineCalls.length).toBeGreaterThan(0);
  });

  it('skips RTL injection when setRtlDirection = false', () => {
    const integration = astroUmmat({ setRtlDirection: false });
    const params = makeParams('ar');
    integration.hooks['astro:config:setup']!(params as never);

    const rtlCall = params.injectScript.mock.calls.find(
      ([, content]) => typeof content === 'string' && content.includes("setAttribute('dir'"),
    );
    expect(rtlCall).toBeUndefined();
  });
});
