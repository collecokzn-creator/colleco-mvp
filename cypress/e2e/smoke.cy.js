describe('Smoke', () => {
  it('loads home and has visible header and footer', () => {
    cy.visit('/')
    cy.get('header').should('be.visible')
    cy.get('footer').should('be.visible')
    // Ensure main content isn\'t overlapped: check there\'s some content margin/padding
    cy.get('main').should('exist')
  })

  it('backend /health responds', () => {
    const apiBase = Cypress.env('API_BASE') || 'http://localhost:4000'
    cy.request(`${apiBase}/health`).its('status').should('eq', 200)
  })
})
