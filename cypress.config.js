// @ts-check
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    supportFile: false,
    video: false,
    defaultCommandTimeout: 8000,
  },
})
