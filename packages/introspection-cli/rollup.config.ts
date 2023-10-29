// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import pkg from './package.json';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
export default {
  external: [...Object.keys(pkg.dependencies), 'path', 'fs/promises'],
  input: 'src/main.ts',
  plugins: [typescript()],
  output: [
    {
      format: 'cjs',
      file: pkg.main,
      esModule: false,
      sourcemap: true,
    },
    {
      format: 'es',
      file: pkg.module,
      sourcemap: true,
    },
  ],
};
