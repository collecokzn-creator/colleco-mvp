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
      // Use hash route to avoid deep-linking issues with static preview servers
      cy.visit('/#/about', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          // Ensure app knows it's running under E2E early so it can disable animations
          try { win.__E2E__ = true } catch {}
          // Defer dispatching the load event slightly to avoid race conditions
          setTimeout(() => {
            try { win.dispatchEvent(new Event('load')) } catch {}
          }, 1500)
        },
      })
      // Ensure the SPA has rendered into #root and the launch screen is gone
          // Wait for the app to mark itself ready for E2E (injected by main.jsx)
          cy.get('[data-e2e-ready="true"]', { timeout: 45000 }).should('exist')
          cy.get('#root', { timeout: 30000 }).should(($r) => {
            expect($r.children().length, 'app rendered into #root').to.be.greaterThan(0)
          })
          // Dump a small snapshot of #root text to a file for debugging what the built app rendered
          cy.get('#root').invoke('text').then((t) => {
            const short = typeof t === 'string' ? t.slice(0, 20000) : String(t)
            cy.writeFile(`cypress/logs/about-root-${name}.txt`, short)
          })
          // Now assert the About heading text exactly as rendered
          cy.contains('About Us', { timeout: 30000 }).should('exist')

      cy.window().then((win) => {
        const docEl = win.document.documentElement
        const hasHorizontalScroll = docEl.scrollWidth > docEl.clientWidth
        expect(hasHorizontalScroll, 'no horizontal scroll on mobile').to.be.false
      })
    })
  })
})
