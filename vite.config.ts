import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    environment: 'jsdom',

    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'coverage',
      'tests/e2e/**',
    ],
  },
})