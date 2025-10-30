describe('Login minimal smoke', () => {
  it('mounts the login form', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        try {
          win.localStorage && win.localStorage.clear && win.localStorage.clear();
          win.sessionStorage && win.sessionStorage.clear && win.sessionStorage.clear();
          // Support both HashRouter and BrowserRouter: prefer history.replaceState
          try { win.history && win.history.replaceState && win.history.replaceState(null, '', '/login'); } catch (e) {}
          // still set hash as a fallback for hash-based routing environments
          win.location.hash = '#/login';
          win.__E2E__ = true;
          win.Cypress = win.Cypress || {};
        } catch (e) {}
      },
    });

    // Force the hash-based login route early to avoid router timing/race issues
    // (works for HashRouter and is harmless for BrowserRouter where it will
    // simply lead to the same route).
    cy.visit('/#/login', { failOnStatusCode: false });

    // Wait for app readiness and the login form to be present. If it isn't
    // present after ready, force the route and wait again to handle timing races.
    cy.get('[data-e2e-ready="true"]', { timeout: 30000 }).should('exist');
    cy.window({ timeout: 30000 }).should((win) => {
      if (win.__E2E__) {
        expect(win.__E2E_MOUNTED__).to.equal(true);
      }
    });
    cy.document().then((doc) => {
      const hasForm = !!doc.querySelector('[data-e2e="login-form"]');
      const hasWelcome = !!doc.querySelector('h2') && /Welcome,/.test(doc.querySelector('h2')?.textContent || '');
      if (!hasForm && !hasWelcome) {
          cy.log('Neither login form nor welcome found after ready; forcing #/login to mount the login form');
          cy.visit('/#/login', { failOnStatusCode: false });
          cy.get('[data-e2e="login-form"]', { timeout: 30000 }).should('exist');
      }
    });
    // Extra robust fallback: if mounting still fails (CI timing flake), reload the page once
    // and allow additional time for SPA routing to settle before giving up.
    cy.document().then((doc) => {
      const hasForm = !!doc.querySelector('[data-e2e="login-form"]');
      const hasWelcome = !!doc.querySelector('h2') && /Welcome,/.test(doc.querySelector('h2')?.textContent || '');
      if (!hasForm && !hasWelcome) {
        cy.log('Fallback: reload and wait to give SPA another chance to mount the login form');
        cy.reload(true);
        cy.wait(1200);
      }
    });
    // Accept either login-form (UI) or welcome (injected user) as a valid landing.
    cy.get('body', { timeout: 30000 }).should(($b) => {
      const hasForm = !!$b[0].querySelector('[data-e2e="login-form"]');
      const hasWelcome = !!$b[0].querySelector('h2') && /Welcome,/.test($b[0].querySelector('h2')?.textContent || '');
      if (!hasForm && !hasWelcome) throw new Error('neither login form nor welcome found');
    });
    // Sanity: the submit button should be present
    cy.get('[data-e2e="submit"]', { timeout: 10000 }).should('exist');
  });
});
