// Mobile viewport responsiveness tests for About page
const viewports = [
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'galaxy-s5', width: 360, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'iphone-14-pro-max', width: 430, height: 932 },
]

describe('Mobile About responsiveness', () => {
  viewports.forEach(({ name, width, height }) => {
    it(`renders without horizontal scroll on ${name}`, () => {
      cy.viewport(width, height)
      cy.visit('/about', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          // Defer dispatching the load event slightly to avoid race conditions
          setTimeout(() => {
            try { win.dispatchEvent(new Event('load')) } catch {}
          }, 1500)
        },
      })
      cy.get('#root', { timeout: 30000 }).should('exist')
      cy.contains(/About/i, { timeout: 30000 }).should('exist')

      cy.window().then((win) => {
        const docEl = win.document.documentElement
        const hasHorizontalScroll = docEl.scrollWidth > docEl.clientWidth
        expect(hasHorizontalScroll, 'no horizontal scroll on mobile').to.be.false
      })
    })
  })
})
