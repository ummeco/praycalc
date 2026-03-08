import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 10_000,
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
    },
  },
});
