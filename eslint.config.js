// ESLint flat config — frontend (React) + backend (Node ESM) + tests.
// Philosophy: correctness rules are errors; style/noise rules are warnings so
// `npm run lint` fails only on real bugs.
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

const commonRules = {
  ...js.configs.recommended.rules,
  'no-unused-vars': [
    'warn',
    { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrors: 'none' },
  ],
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-console': 'off',
}

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'scripts/**', // local/gitignored audit + verification scripts
      '.agents/**',
      '**/coverage/**',
    ],
  },

  // ---------- Frontend (browser + JSX) ----------
  {
    files: ['frontend/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // `process` appears only behind `typeof process !== 'undefined'` guards
      // (Vite env fallback in services/api.js)
      globals: { ...globals.browser, process: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...commonRules,
      ...reactHooks.configs['recommended-latest'].rules,
      // Loading-flag pattern (setLoading(true) at the top of a fetch effect)
      // is intentional across this app; the rule targets state derived from
      // props/state sync, which this codebase does not do in effects.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // ---------- Backend + tests + config files (Node ESM) ----------
  {
    files: ['backend/**/*.js', 'tests/**/*.{js,mjs}', '*.config.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: commonRules,
  },
]
