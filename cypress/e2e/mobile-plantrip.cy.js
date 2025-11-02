/// <reference types="cypress" />

describe('Mobile PlanTrip responsiveness', () => {
  const viewports = [
    { device: 'iphone-12', width: 390, height: 844 },
    { device: 'galaxy-s5', width: 360, height: 640 },
    { device: 'iphone-se', width: 375, height: 667 },
    { device: 'pixel-7', width: 412, height: 915 },
    { device: 'iphone-14-pro-max', width: 430, height: 932 }
  ];
  viewports.forEach(({ device, width, height }) => {
    it(`renders without horizontal scroll on ${device}`, () => {
      // Prepopulate localStorage and then use e2eVisit so readiness waits run
      cy.visit('/', {
        onBeforeLoad(win) {
          try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('client')); win.localStorage.setItem('user', JSON.stringify({ email: 'client@example.com', name: 'Auto client', role: 'client' })); } catch (e) {}
        }
      })
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

      e2eVisit('/plan-trip')

      // Capture early DOM and headings for debugging when the heading doesn't appear
      cy.task('log', ['VISIT_DOM_START']);
      cy.document().then(doc => {
        cy.task('log', ['DOM_DUMP_START', doc.documentElement.outerHTML.slice(0, 20000)]);
        const heads = Array.from(doc.querySelectorAll('h1,h2,h3')).map(n => n.textContent.trim());
        cy.task('log', ['HEADINGS', heads]);
        const planSection = doc.querySelector('section');
        cy.task('log', ['PLAN_SECTION_HTML', planSection ? planSection.outerHTML.slice(0, 2000) : '<no-plan-section>']);
        cy.task('log', ['DOM_DUMP_END']);
      });

      cy.viewport(width, height);
  cy.get('#root', { timeout: 20000 }).should('exist');
  // Accept either 'Plan Your Trip', 'Plan Trip' or 'Trip Planner'
  cy.contains(/(Plan.*Trip|Trip Planner)/i, { timeout: 20000 }).should('exist');
      cy.document().then(doc => {
        expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth + 2);
      });
    });
  });
});