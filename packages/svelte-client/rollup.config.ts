// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

/** @type {import('rollup').RollupOptions} */
export default {
  external: Object.keys(pkg.dependencies),
  input: 'src/main.ts',
  plugins: [typescript()],
  output: [
    {
      format: 'es',
      file: pkg.main,
      sourcemap: true,
    },
  ],
};
