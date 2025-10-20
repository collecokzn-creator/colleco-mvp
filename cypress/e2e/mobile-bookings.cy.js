// Mobile viewport checks for Bookings page responsive behavior
const viewports = [
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'galaxy-s5', width: 360, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'iphone-14-pro-max', width: 430, height: 932 },
]

describe('Mobile Bookings responsiveness', () => {
  viewports.forEach(({ name, width, height }) => {
    it(`renders without horizontal scroll on ${name}`, () => {
      cy.viewport(width, height)
      cy.visit('/bookings', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          setTimeout(() => {
            try { win.dispatchEvent(new Event('load')); } catch (e) {}
          }, 1500)
        }
      })
      cy.get('#root', { timeout: 30000 }).should('exist')
      cy.contains(/Bookings/i, { timeout: 30000 }).should('exist')
      cy.window().then((win) => {
        const doc = win.document
        const clientWidth = doc.documentElement.clientWidth
        const scrollWidth = doc.body.scrollWidth
        expect(scrollWidth, 'body scrollWidth should not exceed viewport').to.be.at.most(clientWidth)
      })
    })
  })
})
