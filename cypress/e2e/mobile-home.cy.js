// Mobile viewport checks for Home page responsive behavior
const viewports = [
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'galaxy-s5', width: 360, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'iphone-14-pro-max', width: 430, height: 932 },
]

describe('Mobile Home responsiveness', () => {
  viewports.forEach(({ name, width, height }) => {
    it(`renders without horizontal scroll on ${name}`, () => {
      cy.viewport(width, height)
      cy.visit('/', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          // Force-dispatch a load so Cypress continues without waiting on large assets
          setTimeout(() => {
            try { win.dispatchEvent(new Event('load')); } catch (e) {}
          }, 1500)
        }
      })

      // Key UI elements are visible
      cy.get('nav', { timeout: 30000 }).should('be.visible')
      cy.get('main', { timeout: 30000 }).should('exist')

      // No horizontal scrollbars
      cy.window().then((win) => {
        const doc = win.document
        const clientWidth = doc.documentElement.clientWidth
        const scrollWidth = doc.body.scrollWidth
        expect(scrollWidth, 'body scrollWidth should not exceed viewport').to.be.at.most(clientWidth)
      })
    })
  })
})
