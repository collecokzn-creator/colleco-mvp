// Disable service worker during Cypress tests to avoid caching/registration side-effects
Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'serviceWorker', {
    value: undefined,
    configurable: true,
  })
})

// Optionally, silence uncaught rejected promises from SW fetches in CI noise
Cypress.on('uncaught:exception', (err) => {
  if (/ServiceWorker|network timeout/i.test(String(err))) {
    return false
  }
})
