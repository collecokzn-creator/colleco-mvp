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

  // E2E mode: disable animations and set a role BEFORE the app boots so guarded
  // routes render correctly in tests. Infer role from the current spec file name.
  try {
    try { win.__E2E__ = true } catch (e) {}
    // Infer role from spec name when available (ensures it runs prior to app init)
    let role = 'client';
    try {
      const specName = (Cypress && Cypress.spec && Cypress.spec.name) ? String(Cypress.spec.name).toLowerCase() : '';
      if (/admin|reports|compliance|settings/.test(specName)) role = 'admin';
      else if (/partner|partners/.test(specName)) role = 'partner';
      else role = 'client';
    } catch (e) {
      role = 'client';
    }
    try {
      // Do not overwrite if a test explicitly set a role in its onBeforeLoad handler.
      const existingRole = win.localStorage.getItem('colleco.sidebar.role');
      if (!existingRole) {
        win.localStorage.setItem('colleco.sidebar.role', JSON.stringify(role))
      }
    } catch (e) {}
    try {
      const existingUser = win.localStorage.getItem('user');
      if (!existingUser) {
        win.localStorage.setItem('user', JSON.stringify({ email: `${role}@example.com`, name: `Auto ${role}`, role }))
      }
    } catch (e) {}
  } catch (e) {}
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
  const msg = String(err || '')
  // Ignore known non-critical errors originating from third-party frames, service workers,
  // or transient network issues that should not fail E2E runs.
  if (/ServiceWorker|network timeout|addEventListener|Blocked a frame with origin/i.test(msg)) {
    // Ignore SW-related errors in headless test runs
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

// Helper: set the active role in localStorage (string) and optional user object
Cypress.Commands.add('setRole', (role = 'client', user = null) => {
  return cy.window({ log: false }).then((win) => {
    try { win.localStorage.setItem('colleco.sidebar.role', JSON.stringify(role)); } catch (e) {}
    if (user) {
      try { win.localStorage.setItem('user', JSON.stringify(user)); } catch (e) {}
    } else {
      try { win.localStorage.setItem('user', JSON.stringify({ email: `${role}@example.com`, name: `Auto ${role}`, role })) } catch (e) {}
    }
  });
});

// Helper: scan document for unexpected horizontal overflow while ignoring
// intentionally scrollable containers. Logs deep details via cy.task('log')
// to make triage easier, then fails the test with a concise message.
Cypress.Commands.add('ensureNoUnexpectedOverflow', { prevSubject: false }, () => {
  return cy.window({ log: false }).then((win) => {
    const doc = win.document;
    const clientWidth = doc.documentElement.clientWidth;
    const tolerance = 1;
  const allowedSelectors = ['.overflow-x-auto', '.overflow-auto', '.ai-panel', '.map-container', '.itinerary-timeline', '.timeline-row', '.max-h-60', '.max-h-72', '[data-scrollable]', '.sidebar-scroll'];
    const els = Array.from(doc.querySelectorAll('body *'));
    const offending = els.filter(el => {
      try {
        for (const sel of allowedSelectors) { if (el.matches && el.matches(sel)) return false }
        return el.scrollWidth > clientWidth + tolerance
      } catch (e) { return false }
    });

    if (offending.length) {
      // Build a detailed report for Node logs via cy.task('log')
      const details = offending.slice(0, 20).map(e => ({
        tag: e.tagName,
        id: e.id || null,
        classes: e.className || null,
        scrollWidth: e.scrollWidth,
        clientWidth: e.clientWidth,
        outer: (e.outerHTML || '').slice(0, 300)
      }));

      // Use Cypress command chain to send to node logger, then fail with message
      return cy.task('log', { type: 'unexpected-overflow', count: offending.length, details }).then(() => {
        const summary = details.map(d => `${d.tag.toLowerCase()}${d.classes?'.'+d.classes.split(' ').slice(0,3).join('.') : ''}`);
        throw new Error(`found ${offending.length} unexpected overflowing elements: ${summary.join(', ')}`)
      })
    }
    return null;
  })
});

// Attempt to infer a sensible role from the spec file name to reduce per-spec setup.
// Specs with 'admin' or 'reports' or 'compliance' -> admin; 'partner' -> partner; default -> client
beforeEach(() => {
  try {
    const spec = Cypress && Cypress.spec && Cypress.spec.name ? Cypress.spec.name.toLowerCase() : '';
    if (/admin|reports|compliance|settings/.test(spec)) {
      cy.setRole('admin');
    } else if (/partner|partners/.test(spec)) {
      cy.setRole('partner');
    } else {
      cy.setRole('client');
    }
  } catch (e) {}
});
