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
      if (!doc.querySelector('[data-e2e="login-form"]')) {
        cy.log('Login form not present after ready; forcing #/login and waiting');
        cy.window().then((w) => { try { w.location.hash = '#/login'; } catch (e) {} });
        cy.get('[data-e2e="login-form"]', { timeout: 30000 }).should('exist');
      }
    });
    cy.get('[data-e2e="login-form"]', { timeout: 30000 }).should('exist');
    // Sanity: the submit button should be present
    cy.get('[data-e2e="submit"]', { timeout: 10000 }).should('exist');
  });
});
