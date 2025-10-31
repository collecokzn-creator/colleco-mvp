/// <reference types="cypress" />

describe('Mobile Trips responsiveness', () => {
  const viewports = [
    { device: 'iphone-12', width: 390, height: 844 },
    { device: 'galaxy-s5', width: 360, height: 640 },
    { device: 'iphone-se', width: 375, height: 667 },
    { device: 'pixel-7', width: 412, height: 915 },
    { device: 'iphone-14-pro-max', width: 430, height: 932 }
  ];
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

  viewports.forEach(({ device, width, height }) => {
    it(`renders without horizontal scroll on ${device}`, () => {
      cy.viewport(width, height);
      e2eVisit('/trips');
      cy.get('#root', { timeout: 20000 }).should('exist');
      cy.contains(/Trips/i, { timeout: 20000 }).should('exist');
      cy.document().then(doc => {
        expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth + 2);
      });
    });
  });
});