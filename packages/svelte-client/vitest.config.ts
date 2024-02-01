import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      preprocess: sveltePreprocess({ typescript: true }),
    }) as any,
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
