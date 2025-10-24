// Mobile viewport responsiveness tests for Partners page
function e2eVisit(path) {
  const hashPath = path.startsWith('#') || path.startsWith('/#') ? path : `/#${path === '/' ? '' : path}`
  return cy.visit(hashPath, {
    timeout: 120000,
    failOnStatusCode: false,
    onBeforeLoad(win) {
      try { win.__E2E__ = true } catch {}
      setTimeout(() => { try { win.dispatchEvent(new Event('load')) } catch {} }, 500)
    }
  }).then(() => {
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

describe('Mobile Partners responsiveness', () => {
  viewports.forEach(({ name, width, height }) => {
    it(`renders without horizontal scroll on ${name}`, () => {
      cy.viewport(width, height)
      // Put admin session in localStorage early, then navigate with e2eVisit
      cy.visit('/', {
        onBeforeLoad(win) {
          try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); win.localStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', name: 'Auto admin', role: 'admin' })); } catch (e) {}
        }
      })
      e2eVisit('/admin/partners')
  cy.get('#root', { timeout: 30000 }).should('exist')
  cy.contains(/Partner Management/i, { timeout: 30000 }).should('exist')

      cy.window().then((win) => {
        const docEl = win.document.documentElement
        const hasHorizontalScroll = docEl.scrollWidth > docEl.clientWidth
        expect(hasHorizontalScroll, 'no horizontal scroll on mobile').to.be.false
      })
    })
  })
})
