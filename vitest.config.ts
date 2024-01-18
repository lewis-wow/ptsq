import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    teardownTimeout: 1000,
    coverage: {
      provider: 'istanbul',
      include: [
        'packages/client/src/**',
        'packages/react-client/src/**',
        'packages/server/src/**',
        'packages/introspection-cli/src/**',
      ],
      exclude: ['**/node_modules/**', '**/dist/**'],
      all: false,
    },
  },
});
