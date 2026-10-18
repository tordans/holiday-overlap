import { defineConfig } from 'oxlint'

// Adapted from the FMC tech-stack oxlint template.
// ignorePatterns: keep in sync with oxfmt.config.mjs.
export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react'],
  options: { typeAware: true },
  ignorePatterns: ['dist/**', 'src/routeTree.gen.ts'],
  rules: {
    'typescript/switch-exhaustiveness-check': 'error',
    // Restriction category — keep ESLint recommended coverage (off by default in oxlint)
    'react/unsupported-syntax': 'error',
    // Allow bare `_` (oxlint default ignores `_foo` but not `_`); object config clears defaults
    'eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      // Browser-shipped code: guard Web APIs against the browserslist target.
      files: ['src/components/**', 'src/routes/**', 'src/lib/**'],
      excludeFiles: ['**/*.test.ts', '**/*.test.tsx'],
      jsPlugins: [{ name: 'compat', specifier: 'eslint-plugin-compat' }],
      rules: {
        'compat/compat': 'error',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'typescript/no-non-null-assertion': 'off',
        'react/rules-of-hooks': 'off',
      },
    },
  ],
})
