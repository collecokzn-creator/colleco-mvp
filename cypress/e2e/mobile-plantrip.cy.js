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
      cy.visit('/plan-trip', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          // ensure a client role is present before app init
          try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('client')); win.localStorage.setItem('user', JSON.stringify({ email: 'client@example.com', name: 'Auto client', role: 'client' })); } catch (e) {}
          setTimeout(() => win.dispatchEvent(new win.Event('load')), 500);
        }
      });

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