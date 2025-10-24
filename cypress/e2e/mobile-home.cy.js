// Mobile viewport checks for Home page responsive behavior
// Shared helper: visit a route under hash routing and ensure E2E readiness
function e2eVisit(path) {
  const hashPath = path.startsWith('#') || path.startsWith('/#') ? path : `/#${path === '/' ? '' : path}`
  return cy.visit(hashPath, {
    timeout: 120000,
    failOnStatusCode: false,
    onBeforeLoad(win) {
      try { win.__E2E__ = true } catch {}
      // small delay to avoid load-event races with heavy assets
      setTimeout(() => { try { win.dispatchEvent(new Event('load')) } catch {} }, 500)
    }
  }).then(() => {
    // wait for app to mark itself ready and for React to render into #root
    cy.get('[data-e2e-ready="true"]', { timeout: 45000 }).should('exist')
    cy.get('#root', { timeout: 30000 }).should(($r) => {
      expect($r.children().length, 'app rendered into #root').to.be.greaterThan(0)
    })
  })
}
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
      e2eVisit('/')

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
