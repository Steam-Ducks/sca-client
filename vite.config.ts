import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: "jsdom",

    exclude: [
      "node_modules",
      "dist",
      ".git",
      ".cache",
      "coverage",
      "tests/**",
      "tests/e2e/**",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",

      // Coverage thresholds — CI fails if any metric drops below these values.
      // Current baseline : statements 92%, branches 89%, functions 57%, lines 92%.
      // Functions threshold is lower becuse many composable helpers are tested
      // indirectly via view tests rather than called as standalone functions.
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 50,
        lines: 80,
      },
    },
  },
});
