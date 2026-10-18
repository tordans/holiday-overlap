/// <reference types="vitest/config" />

import { homedir } from 'node:os'
import { join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

const base = process.env.GITHUB_PAGES === 'true' ? '/holiday-overlap/' : '/'

export default defineConfig({
  base,
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    // React Compiler via the Oxc transform (oxc-transform-react peer), not Babel.
    react({ compiler: true }),
    tailwindcss(),
  ],
  environments: {
    client: {
      build: {
        // Target derived from the `browserslist` key in package.json.
        target: browserslistToEsbuild(),
        sourcemap: true,
      },
    },
  },
  server: {
    fs: {
      // Bun globalStore links packages into ~/.bun/install/cache/links (outside the project).
      allow: [searchForWorkspaceRoot(process.cwd()), join(homedir(), '.bun/install/cache/links')],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
