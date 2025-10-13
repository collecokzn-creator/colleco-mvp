// Disable service worker during Cypress tests to avoid caching/registration side-effects
Cypress.on('window:before:load', (win) => {
  // Ensure app code detects Cypress immediately
  try { win.Cypress = win.Cypress || {}; } catch {}
  // Make serviceWorker appear absent to app code using `'serviceWorker' in navigator`
  try {
    if ('serviceWorker' in win.navigator) {
      // Remove the property so `'serviceWorker' in navigator` becomes false
      delete win.navigator.serviceWorker
    }
  } catch {}
})

// Optionally, silence uncaught rejected promises from SW fetches in CI noise
Cypress.on('uncaught:exception', (err) => {
  const msg = String(err || '')
  if (/ServiceWorker|network timeout|addEventListener/i.test(msg)) {
    // Ignore SW-related errors in headless test runs
    return false
  }
})
