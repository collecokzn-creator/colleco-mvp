/// <reference types="cypress" />

describe('Mobile Support responsiveness', () => {
  const viewports = [
    { device: 'iphone-12', width: 390, height: 844 },
    { device: 'galaxy-s5', width: 360, height: 640 },
    { device: 'iphone-se', width: 375, height: 667 },
    { device: 'pixel-7', width: 412, height: 915 },
    { device: 'iphone-14-pro-max', width: 430, height: 932 }
  ];
  viewports.forEach(({ device, width, height }) => {
    it(`renders without horizontal scroll on ${device}`, () => {
      cy.visit('/support', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          setTimeout(() => win.dispatchEvent(new win.Event('load')), 500);
        }
      });
      cy.viewport(width, height);
      cy.get('#root', { timeout: 20000 }).should('exist');
      cy.contains(/Support/i, { timeout: 20000 }).should('exist');
      cy.document().then(doc => {
        expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth + 2);
      });
    });
  });
});