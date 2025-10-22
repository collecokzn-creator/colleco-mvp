describe('Login minimal smoke', () => {
  it('mounts the login form', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        try {
          win.localStorage && win.localStorage.clear && win.localStorage.clear();
          win.sessionStorage && win.sessionStorage.clear && win.sessionStorage.clear();
          win.location.hash = '#/login';
          win.__E2E__ = true;
          win.Cypress = win.Cypress || {};
        } catch (e) {}
      },
    });

    // Wait for app readiness and the login form to be present. If it isn't
    // present after ready, force the route and wait again to handle timing races.
    cy.get('[data-e2e-ready="true"]', { timeout: 30000 }).should('exist');
    cy.document().then((doc) => {
      const hasForm = !!doc.querySelector('[data-e2e="login-form"]');
      const hasWelcome = !!doc.querySelector('h2') && /Welcome,/.test(doc.querySelector('h2')?.textContent || '');
      if (!hasForm && !hasWelcome) {
        cy.log('Neither login form nor welcome found after ready; forcing #/login and waiting');
        cy.window().then((w) => { try { w.location.hash = '#/login'; } catch (e) {} });
        cy.get('[data-e2e="login-form"]', { timeout: 30000 }).should('exist');
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
