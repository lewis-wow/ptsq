import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/__test__/**',
        'packages/test-utils/**',
      ],
    },
  },
});
