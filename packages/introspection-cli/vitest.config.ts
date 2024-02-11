import { defineConfig, mergeConfig } from 'vitest/config';
import vitestSharedConfig from '../../vitest.config.mts';

export default mergeConfig(
  vitestSharedConfig,
  defineConfig({
    test: {
      name: '@ptsq/introspection-cli',
    },
  }),
);
