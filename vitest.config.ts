import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'packages/client/src/**',
        'packages/react-client/src/**',
        'packages/server/src/**',
        'packages/introspection-cli/src/**',
      ],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
});
