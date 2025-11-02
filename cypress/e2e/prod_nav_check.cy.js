describe('Production navbar check', () => {
  it('visits travelcolleco.com mobile and ensures no Book Now or /book links', () => {
    // force a mobile viewport
    cy.viewport(390, 844); // typical mobile portrait

    // Visit the production site explicitly
    cy.visit('https://travelcolleco.com', { timeout: 20000 });

    // Ensure page loaded
    cy.get('body', { timeout: 10000 }).should('be.visible');

  // Scope checks to the navbar only: we only intend to ensure the navbar doesn't show Book Now
  cy.get('nav').should('be.visible');
  cy.get('nav').contains('Book Now').should('not.exist');

  // Ensure navbar has no quick /book anchors
  cy.get('nav').find('a[href*="/book"]').should('not.exist');
  });
});
