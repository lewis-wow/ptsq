// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import externals from 'rollup-plugin-node-externals';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import resolve from 'rollup-plugin-node-resolve'
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/main.ts',
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].js',
      chunkFileNames: '[name]-[hash].js',
    },
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs',
    },
  ],
  plugins: [
    del({
      targets: 'dist',
    }),
    externals({
      packagePath: path.resolve(__dirname, 'package.json'),
      deps: true,
      devDeps: true,
      peerDeps: true,
    }),
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      tsconfigOverride: { emitDeclarationOnly: true },
    }),
    terser(),
    resolve(),
  ],
};
