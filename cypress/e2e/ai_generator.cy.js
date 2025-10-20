describe('AI Generator E2E', () => {
  it('generates an itinerary and uploads draft', () => {
  cy.visit('/ai', { failOnStatusCode: false, onBeforeLoad(win) { try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); } catch(e){} } });

  // Wait for the AI panel heading so the component is rendered
  cy.get('#aiGenHeading', { timeout: 60000 }).should('be.visible');

  // Scope interactions to the AI generator panel to avoid accidental matches
  cy.get('#aiGenHeading').parent().as('aiPanel');

  // set prompt (specific textarea inside the AI generator panel) with a small typing delay
  cy.get('@aiPanel').find('textarea').first().should('be.visible').and('not.be.disabled').clear().type('Family trip to Cape Town for 3 nights, beach and food', { delay: 20 });

  // choose single mode and intercept generation request (match any host/port)
  cy.get('@aiPanel').find('input[name="aimode"][value="single"]').should('be.visible').and('not.be.disabled').check({ force: true });
  cy.intercept('POST', '**/api/ai/itinerary').as('generate');
    cy.get('@aiPanel').contains('Generate').should('be.visible').and('not.be.disabled').click();
    cy.wait('@generate', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

    // Ensure plan and pricing panels show results
    cy.contains('Plan', { timeout: 30000 }).should('be.visible');
    cy.contains('Pricing', { timeout: 30000 }).should('be.visible');
    cy.contains('Total:', { timeout: 30000 }).should('be.visible');

    // Upload draft
  cy.intercept('POST', '**/api/ai/draft').as('upload');
    cy.get('@aiPanel').contains('Upload Draft').should('be.visible').and('not.be.disabled').click();
    cy.wait('@upload', { timeout: 30000 }).its('response.statusCode').should('eq', 201);

    // Confirm UI shows uploaded message
    cy.contains('Draft stored on server', { timeout: 15000 }).should('be.visible');
  });
});
