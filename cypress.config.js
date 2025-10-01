// @ts-check
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    supportFile: false,
    video: false,
    // Allow slower CI environments to finish loading the page (large assets)
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 8000,
  },
})
