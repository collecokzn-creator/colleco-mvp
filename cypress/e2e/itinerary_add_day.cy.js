describe('Itinerary - add day control', () => {
  it('creates an empty Day 2 when Add Day is clicked', () => {
    // Visit the itinerary page directly
    cy.visit('/itinerary');

    // Ensure the page loads
    cy.contains('Itinerary').should('be.visible');

    // Click the Add Day button
    cy.get('button').contains('Add Day').click();

    // The Days list should now include Day 2
    cy.contains('Day 2').should('be.visible');
  });
});
