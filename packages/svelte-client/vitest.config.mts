import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { defineConfig, mergeConfig } from 'vitest/config';
import vitestSharedConfig from '../../vitest.config.mts';

export default mergeConfig(
  vitestSharedConfig,
  defineConfig({
    plugins: [
      svelte({
        preprocess: sveltePreprocess({
          typescript: true,
        }),
      }),
    ],
    test: {
      name: '@ptsq/svelte-client',
      environment: 'jsdom',
      coverage: {
        exclude: ['**/__test__/**'],
      },
    },
  }),
);
