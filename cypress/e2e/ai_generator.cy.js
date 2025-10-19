describe('AI Generator E2E', () => {
  it('generates an itinerary and uploads draft', () => {
  cy.visit('/ai', { failOnStatusCode: false, onBeforeLoad(win) { try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); } catch(e){} } });
  // Wait for the AI panel heading so the component is rendered
  cy.get('#aiGenHeading', { timeout: 60000 }).should('be.visible');

  // set prompt (specific textarea inside the AI generator panel)
  cy.get('#aiGenHeading').parent().find('textarea').first().clear().type('Family trip to Cape Town for 3 nights, beach and food');

  // choose single mode and intercept generation request (match any host/port)
  cy.get('input[name="aimode"][value="single"]').check({ force: true });
  cy.intercept('POST', '**/api/ai/itinerary').as('generate');
    cy.contains('Generate').click();
    cy.wait('@generate', { timeout: 20000 }).its('response.statusCode').should('eq', 200);

    // Ensure plan and pricing panels show results
    cy.contains('Plan', { timeout: 20000 }).should('be.visible');
    cy.contains('Pricing', { timeout: 20000 }).should('be.visible');
    cy.contains('Total:', { timeout: 20000 }).should('be.visible');

    // Upload draft
  cy.intercept('POST', '**/api/ai/draft').as('upload');
    cy.contains('Upload Draft').click();
    cy.wait('@upload', { timeout: 20000 }).its('response.statusCode').should('eq', 201);

    // Confirm UI shows uploaded message
    cy.contains('Draft stored on server', { timeout: 10000 }).should('be.visible');
  });
});
