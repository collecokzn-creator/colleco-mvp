// @ts-check
import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    API_BASE: process.env.API_BASE || 'http://localhost:4000',
  },
  e2e: {
    baseUrl: 'http://localhost:5174',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    // Do not wait for the browser 'load' event; rely on DOM assertions instead
    pageLoadTimeout: 0,
    defaultCommandTimeout: 8000,
  },
})
