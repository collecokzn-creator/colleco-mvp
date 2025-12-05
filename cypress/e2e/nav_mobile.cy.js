describe('Mobile navbar', () => {
  it('does not show Book Now in mobile navbar and has no /book links', () => {
    // set a common mobile viewport
    cy.viewport(375, 812);
    cy.visit('/');

    // Wait for the navbar to be present
    cy.get('nav[data-testid="navbar-primary"]', { timeout: 10000 }).should('be.visible');

    // Assert there is no visible button or link with text 'Book Now'
    // Only check direct navbar children to avoid catching content from page body
    cy.get('nav[data-testid="navbar-primary"]').within(() => {
      cy.contains('Book Now').should('not.exist');
      cy.get('a[href*="/book"]').should('have.length', 0);
    });
  });
});
describe('Mobile Navbar', () => {
  it('does not show Book Now or quick /book links on mobile', () => {
    // mobile-ish viewport
    cy.viewport(375, 812);
    // visit root (will use baseUrl configured when running Cypress)
    cy.visit('/');

    // Ensure nav exists
    cy.get('nav[data-testid="navbar-primary"]').should('exist');

    // There should be no visible Book Now button/text in the navbar
    // Scoped to navbar only to avoid catching page body content
    cy.get('nav[data-testid="navbar-primary"]').within(() => {
      cy.contains('Book Now').should('not.exist');
      cy.get('a[href^="/book"]').should('not.exist');
    });
  });
});
