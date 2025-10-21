/// <reference types="cypress" />

describe('Debug mobile pages', () => {
  const pages = ['/plan-trip', '/support'];
  pages.forEach((p) => {
    it(`capture DOM for ${p}`, () => {
      cy.visit(p, {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('client')); win.localStorage.setItem('user', JSON.stringify({ email: 'client@example.com', name: 'Auto client', role: 'client' })); } catch (e) {}
          // give app a moment to pick up pre-seeded values
          try { setTimeout(() => win.dispatchEvent(new win.Event('load')), 500); } catch (e) {}
        }
      });

      // Wait for root and then capture diagnostics
      cy.get('#root', { timeout: 20000 }).should('exist');
      cy.document().then(doc => {
        const title = doc.title;
        const headings = Array.from(doc.querySelectorAll('h1,h2,h3')).map(h => h.innerText.trim()).filter(Boolean);
        const bodyText = (doc.body && doc.body.innerText) ? doc.body.innerText.slice(0, 2000) : '';
        const outer = (doc.documentElement && doc.documentElement.outerHTML) ? doc.documentElement.outerHTML.slice(0, 200000) : '';
        const diag = { page: p, title, headings, bodyText };
        try { cy.task('log', JSON.stringify(diag)); } catch (e) { cy.task('log', diag); }
        // send a larger DOM dump separately (may be truncated by task handler)
        try { cy.task('log', JSON.stringify({ page: p, dom: outer.substring(0, 200000) })); } catch (e) { cy.task('log', { page: p, dom: outer.substring(0, 200000) }); }
      });
      // Also take a screenshot for visual triage
      cy.screenshot(`debug-${p.replace(/\W+/g,'_')}`, { capture: 'viewport' });
    });
  });
});
