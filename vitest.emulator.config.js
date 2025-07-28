import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/emulator.setup.js'],
    include: ['src/test/**/*.test.js'],
    testTimeout: 10000,
    hookTimeout: 10000,
    globals: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Disable mocking for emulator tests
    clearMocks: false,
    mockReset: false,
    restoreMocks: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})