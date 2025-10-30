describe('Login minimal smoke', () => {
  it('mounts the login form', () => {
    // Use the robust readiness and injected-user fallback similar to
    // `login_register_smoke.cy.js` so this minimal check is tolerant of
    // CI timing and routing differences (history vs hash routers).
    const ts = Date.now();
    const email = `e2e_minimal_${ts}@example.com`;
    const password = 'password123';

    // Visit the actual login route while ensuring our onBeforeLoad setup runs
    // on the page load the app will mount from. This prevents a race where we
    // set window flags on one navigation then reload without them.
    cy.visit('/#/login', {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        try {
          // Clear persisted state so the run is deterministic
          win.localStorage && win.localStorage.clear && win.localStorage.clear();
          win.sessionStorage && win.sessionStorage.clear && win.sessionStorage.clear();
          // Pre-create a test user so the app may take the injected path
          const newUser = { email, password, name: email.split('@')[0] };
          try {
            win.localStorage.setItem('user:' + email, JSON.stringify(newUser));
            win.localStorage.setItem('user', JSON.stringify(newUser));
            win.localStorage.setItem('user:persistence', 'local');
          } catch (e) {}
          // Support both HashRouter and BrowserRouter: prefer history.replaceState
          try { win.history && win.history.replaceState && win.history.replaceState(null, '', '/login'); } catch (e) {}
          // still set hash as a fallback for hash-based routing environments
          win.location.hash = '#/login';
          // Signal the app to enable E2E helpers
          win.__E2E__ = true;
          win.Cypress = win.Cypress || {};
        } catch (e) {}
      },
    });

    // Wait for the app to signal readiness (the app sets data-e2e-ready="true")
    cy.get('[data-e2e-ready="true"]', { timeout: 45000 }).should('exist');

    // Use a body-level existence check (retries automatically) to accept either
    // the login form or an injected Welcome path as valid outcomes.
    cy.get('body', { timeout: 45000 }).should(($body) => {
      const hasForm = $body.find('[data-e2e="login-form"]').length > 0;
      const hasWelcome = $body.find('h2').toArray().some((el) => /Welcome,/.test(el.textContent || ''));
      expect(hasForm || hasWelcome, 'login form or welcome present').to.be.ok;
    });

    // If the body-check didn't find the form, attempt robust fallbacks
    // - click the /login link if present
    // - set the location/hash directly to force the router to navigate
    // - wait again for the app readiness signal, then assert the form exists
    cy.document({ timeout: 45000 }).then((doc) => {
      const $ = Cypress.$;
      const $form = $(doc).find('[data-e2e="login-form"]');
      if ($form.length) return;

      // Try clicking a login link first (some layouts expose this)
      cy.get('a[href="/login"]', { timeout: 5000 })
        .then(($a) => {
          if ($a && $a.length) {
            cy.wrap($a[0]).click({ force: true });
          }
        })
        .catch(() => {
          // ignore - fallback will try direct navigation
        });

      // Give the router a moment to settle, then force the location if still not mounted
      cy.wait(1000);
      cy.document().then((d2) => {
        const $form2 = Cypress.$(d2).find('[data-e2e="login-form"]');
        if ($form2.length) return;
        // force navigation via history/ hash to cover both router modes
        cy.window().then((win) => {
          try { win.history && win.history.replaceState && win.history.replaceState(null, '', '/login'); } catch (e) {}
          try { win.location.hash = '#/login'; } catch (e) {}
        });
      });

      // Wait for the app readiness marker again, then assert the form exists.
      cy.get('[data-e2e-ready="true"]', { timeout: 30000 }).should('exist');
      // Allow a longer timeout here because CI environments can be slower.
      cy.get('[data-e2e="login-form"]', { timeout: 60000 }).should('exist');
    });

    // Sanity: the submit button should be present
    cy.get('[data-e2e="submit"]', { timeout: 15000 }).should('exist');
  });
});
