describe('Smoke', () => {
  it('loads home and has visible header and footer', () => {
    cy.visit('/', { timeout: 120000 })
    // Wait for root mount and some key elements to render
    cy.get('#root', { timeout: 60000 }).should('exist')
    cy.get('header', { timeout: 60000 }).should('be.visible')
    cy.get('footer', { timeout: 60000 }).should('be.visible')
    // Ensure main content exists
    cy.get('main', { timeout: 60000 }).should('exist')
  })

  it('backend /health responds', () => {
    const apiBase = Cypress.env('API_BASE') || 'http://localhost:4000'
    cy.request(`${apiBase}/health`).its('status').should('eq', 200)
  })
})
