import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
    // MITIGATION, not a fix: voice-utterances/integration suites have a
    // PRE-EXISTING intermittent hang (2 fails on clean main before P4 work;
    // count varies with machine load; each test passes in isolation; ruled
    // out: rate-limiter queuing, fake-timer leaks, cross-file state, non-fetch
    // HTTP clients). PCI filed: praycalc-smart-test-hang. Remove retry when
    // root-caused.
    retry: 1,
    setupFiles: ['./tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
      HASURA_GRAPHQL_JWT_SECRET: 'test-secret',
      HASURA_GRAPHQL_URL: 'http://hasura:8080/v1/graphql',
      HASURA_GRAPHQL_ADMIN_SECRET: 'test-admin-secret',
      HASURA_AUTH_URL: 'http://auth:4000',
      DEFAULT_LAT: '40.7128',
      DEFAULT_LNG: '-74.006',
      DEFAULT_TIMEZONE: 'America/New_York',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
    },
  },
});
