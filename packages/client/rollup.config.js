// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import externals from 'rollup-plugin-node-externals';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import resolve from 'rollup-plugin-node-resolve'
import multiInput from 'rollup-plugin-multi-input';

/** @type {import('rollup').RollupOptions} */
export default {
  input: ['src/main.ts'],
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
    // @ts-expect-error no typedefs exist for this plugin
    multiInput.default({ relative: path.resolve(__dirname, 'src') }),
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
    resolve(),
  ],
};
