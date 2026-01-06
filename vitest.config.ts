import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**'
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 100,
        lines: 90
      }
    }
  },
})