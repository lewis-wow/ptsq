const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: ['@vercel/style-guide/eslint/typescript'].map(require.resolve),
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/', '.eslintrc.js'],

  rules: {
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
};
