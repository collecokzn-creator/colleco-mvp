describe('Production navbar check', () => {
  it('visits travelcolleco.com mobile and ensures no Book Now or /book links', () => {
    // force a mobile viewport
    cy.viewport(390, 844); // typical mobile portrait

    // Visit the production site explicitly
    cy.visit('https://travelcolleco.com', { timeout: 20000 });

    // Ensure page loaded
    cy.get('body', { timeout: 10000 }).should('be.visible');

    // Check that no visible elements contain the 'Book Now' text
    cy.contains('Book Now').should('not.exist');

    // Check that there are no anchors linking to /book
    cy.get('a[href*="/book"]').should('not.exist');
  });
});
