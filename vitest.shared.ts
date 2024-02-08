import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      preprocess: sveltePreprocess({ typescript: true }),
    }) as any,
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      include: [
        'packages/server/src/**',
        'packages/client/src/**',
        'packages/react-client/src/**',
        'packages/svelte-client/src/**',
        'packages/introspection-cli/src/**',
      ],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
});
