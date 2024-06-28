/*
 * Copyright © Inter IKEA Systems B.V. 2017 - 2024
 * All Rights Reserved.
 *
 * This is UNPUBLISHED PROPRIETARY SOURCE CODE of © Inter IKEA Systems B.V.;
 * the contents of this file may not be disclosed to third parties, copied
 * or duplicated in any form, in whole or in part, without the prior
 * written permission of © Inter IKEA Systems B.V.
 */

module.exports = {
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  env: {
    node: true,
    es2022: true,
    jest: true,
    commonjs: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
      },
      node: {
        extensions: ['.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['*.d.ts', '.eslintrc.js'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'valid-jsdoc': [
      'error',
      {
        requireReturn: true,
        requireReturnType: true,
        requireParamDescription: true,
        requireReturnDescription: true,
      },
    ],
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
        },
      },
    ],
    semi: ['error'],
    'no-console': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'no-multi-spaces': 'error',
    'space-in-parens': 'error',
    'no-multiple-empty-lines': 'error',
    'eol-last': ['error', 'always'],
    'prefer-const': 'error',
    'no-use-before-define': 'error',
    'no-trailing-spaces': 'error',
    'comma-spacing': 'error',
    'space-infix-ops': 'error',
    'array-bracket-spacing': 'error',
    'keyword-spacing': 'error',
    'func-style': [
      'error',
      'declaration',
      {
        allowArrowFunctions: true,
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: [],
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        printWidth: 160, // override default 80 char width line break
      },
    ],
  },
};
