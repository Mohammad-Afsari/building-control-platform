import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // supabase/.temp holds runtime files the CLI generates on `supabase
  // start`; the rest are test and build artefacts.
  globalIgnores([
    'dist',
    'supabase/.temp',
    'playwright-report',
    'test-results',
    'blob-report',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // shadcn/CVA-style files export variant helpers/types alongside the
      // component on purpose (see src/components/ui/*) — not an error here.
      'react-refresh/only-export-components': 'off',
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
])
