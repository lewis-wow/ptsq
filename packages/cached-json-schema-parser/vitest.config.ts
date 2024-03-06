import { defineConfig, mergeConfig } from 'vitest/config';
import vitestSharedConfig from '../../vitest.config.mts';
import pkg from './package.json';

export default mergeConfig(
  vitestSharedConfig,
  defineConfig({
    test: {
      name: pkg.name,
    },
  }),
);
