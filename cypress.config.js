// @ts-check
import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    API_BASE: process.env.API_BASE || 'http://localhost:4000',
  },
  e2e: {
  // The smoke preview server runs at port 5174 via npm smoke scripts; keep this in sync.
  baseUrl: 'http://localhost:5174',
    supportFile: 'cypress/support/e2e.js',
    video: false,
  // Allow a reasonable wait for the browser 'load' event during CI/local runs.
  // Previously set to 0 which causes an immediate timeout; set to 60s to be safe.
  pageLoadTimeout: 60000,
  // Increase default command timeout to reduce timing-related flakes
  defaultCommandTimeout: 12000,
  // Allow test retries in CI (runMode). This helps transient flakes make the run more stable.
  retries: { runMode: 2, openMode: 0 },
    // Register Node-side event handlers/tasks so specs can surface browser console messages
    setupNodeEvents(on, config) {
      on('task', {
        // Print messages from the browser (or tests) to the Node runner logs.
        log(message) {
          // support both string and arrays
          if (Array.isArray(message)) {
            message = message.join('\n')
          }
          /* eslint-disable no-console */
            console.log('[cy.task.log] ' + String(message)) // eslint-disable-line no-console
          /* eslint-enable no-console */
          return null
        }
      })

      // return the updated config
      return config
    },
  },
})
