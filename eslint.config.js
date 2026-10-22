import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['node_modules/**', 'dist/**', 'test-results/**', 'playwright-report/**', 'artifacts/**']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
]);
