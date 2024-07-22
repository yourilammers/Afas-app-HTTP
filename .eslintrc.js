'use strict';

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  ignorePatterns: ['.idea/*', 'dist/*'],
  settings: {
    'import/extensions': ['.ts', '.js'],
    'import/resolver': {
      node: true,
      typescript: true,
    },
  },
  rules: {
    'prettier/prettier': ['error', { singleQuote: true, printWidth: 100 }],
    'import/no-unresolved': 'error',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'error',
      {
        'newlines-between': 'never',
      },
    ],
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
    },
    {
      files: ['*.ts', '*.mts'],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
    {
      files: 'tests/**/*',
      plugins: ['vitest'],
      extends: ['plugin:vitest/recommended'],
    },
  ],
};
