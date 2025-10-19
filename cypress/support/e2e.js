// Disable service worker during Cypress tests to avoid caching/registration side-effects
Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'serviceWorker', {
    value: undefined,
    configurable: true,
  })
})

// Provide a tiny polyfill for Cypress.moment() for older specs that expect it.
// Implements only the minimal subset used in our tests: moment().add(n,'days').format('YYYY-MM-DD')
try {
  if (typeof Cypress !== 'undefined' && !Cypress.moment) {
    Cypress.moment = function (input) {
      const date = input ? new Date(input) : new Date();
      return {
        add(amount, unit) {
          const u = (unit || '').toString().toLowerCase();
          if (u.startsWith('day')) date.setDate(date.getDate() + Number(amount || 0));
          else if (u.startsWith('month')) date.setMonth(date.getMonth() + Number(amount || 0));
          else if (u.startsWith('year')) date.setFullYear(date.getFullYear() + Number(amount || 0));
          return this;
        },
        format(fmt) {
          const y = date.getFullYear();
          const m = ('0' + (date.getMonth() + 1)).slice(-2);
          const d = ('0' + date.getDate()).slice(-2);
          if (fmt === 'YYYY-MM-DD') return `${y}-${m}-${d}`;
          return fmt.replace('YYYY', y).replace('MM', m).replace('DD', d);
        }
      };
    };
  }
} catch (e) {
  // ignore polyfill failures
}

// Optionally, silence uncaught rejected promises from SW fetches in CI noise
Cypress.on('uncaught:exception', (err) => {
  if (/ServiceWorker|network timeout/i.test(String(err))) {
    return false
  }
})

// add cypress-plugin-tab if available
try {
  require('cypress-plugin-tab')
} catch (e) {
  // optional plugin — ignore if not installed in some environments
}

// Shared test helpers / custom commands
const defaultBookingFixture = (overrides = {}) => ({
  ok: true,
  booking: {
    id: overrides.id || 'test-bkg-1',
    ref: overrides.ref || 'TEST-1',
    status: overrides.status || 'PendingPayment',
    items: overrides.items || [ { name: 'Item 1', amount: 100 } ],
    pricing: overrides.pricing || { currency: 'USD', subtotal: overrides.subtotal || 100, total: overrides.total || 100 }
  },
  checkout: overrides.checkout || { sessionId: overrides.sessionId || 'mock-session-1', checkoutUrl: overrides.checkoutUrl || `/api/mock-checkout/${overrides.sessionId || 'mock-session-1'}` }
});

// Register a Cypress command to stub booking endpoints (POST and GET) using the provided fixture
// Usage: cy.stubBooking({ id: 'bkg-1', items: [...], pricing: {...} })
Cypress.Commands.add('stubBooking', (fixtureOverrides = {}) => {
  const fixture = defaultBookingFixture(fixtureOverrides);
  // stub POST /api/bookings* (accommodation/flight/car or generic)
  cy.intercept('POST', '**/api/bookings*', (req) => {
    req.reply({ statusCode: 200, body: fixture });
  }).as('createBooking');
  // stub GET /api/bookings/:id
  cy.intercept('GET', '**/api/bookings/*', (req) => {
    req.reply({ statusCode: 200, body: { ok: true, booking: fixture.booking } });
  }).as('getBooking');
  // Optionally set E2E flags on the application window for guarded routes
  cy.window({ log: false }).then((win) => {
    try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); } catch (e) {}
  });
  return cy.wrap(fixture, { log: false });
});

// Export helper for tests that import support file programmatically
export { defaultBookingFixture };
