import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,jsx}'],
    reporters: 'default',
    testTimeout: 20000,
    setupFiles: ['./tests/setupTests.js'],
  },
});
