// @ts-check
import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    API_BASE: process.env.API_BASE || 'http://localhost:4000',
  },
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    video: false,
  // Allow a reasonable wait for the browser 'load' event during CI/local runs.
  // Previously set to 0 which causes an immediate timeout; set to 60s to be safe.
  pageLoadTimeout: 60000,
    defaultCommandTimeout: 8000,
  },
})
