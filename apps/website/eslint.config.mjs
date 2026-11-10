import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // Disallow hardcoded URLs or secrets in source code
      'no-console': 'warn',
    },
  },
];

export default config;

