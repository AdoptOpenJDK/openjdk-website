import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['node_modules/**', 'dist/**'], // Add ignored paths here
  },
  js.configs.recommended,
  {
    ignores: ['node_modules/**'],
  },
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
    },
    rules: {
      // Add custom rules here if needed
    },
  }),
];