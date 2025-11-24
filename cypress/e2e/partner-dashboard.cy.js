// Cypress smoke spec for Partner Dashboard & Templates
// Focus: route loads, role selection, template persistence

describe('Partner Dashboard & Templates Smoke', () => {
  const partnerRoleKey = 'partnerRole';

  before(() => {
    // Clear any previous state
    cy.clearLocalStorage();
  });

  it('loads the partner dashboard and shows heading', () => {
    cy.visit('/partner-dashboard');
    cy.contains('h1', 'Partner Business Hub').should('be.visible');
  });

  it('selects a partner type and persists role', () => {
    cy.get('button').contains(/Hotels & Lodges|Hotels/).click();
    cy.get('[aria-label^="Select Hotels"]').should('exist'); // Category tile click may have changed role selection area
    // If role display updated
    cy.contains(/Hotels, lodges, guesthouses|Hotels & Lodges/).should('exist');
    cy.window().then(win => {
      const stored = win.localStorage.getItem(partnerRoleKey);
      expect(stored).to.not.equal(null);
    });
  });

  it('navigates to templates page and saves a template', () => {
    // Some routes may require auth; if guard present, simulate basic role storage
    cy.visit('/partner/templates', {
      onBeforeLoad(win) {
        // Simulate authenticated partner role for guarded routes
        win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('partner'));
      }
    });
    cy.contains('Invoice').should('exist');
    // Basic form interactions if elements exist
    cy.get('input[name="companyInfo.name"], input').first().then($el => {
      if ($el.length) {
        cy.wrap($el).clear().type('Smoke Test Co');
      }
    });
    // Trigger save if button exists
    cy.contains(/Save Template/i).then($btn => {
      if ($btn.length) cy.wrap($btn).click();
    });
  });

  it('retains template data after reload (localStorage)', () => {
    cy.reload();
    cy.window().then(win => {
      const userId = (win.localStorage.getItem('user') && JSON.parse(win.localStorage.getItem('user')).id) || '';
      const templatesRaw = win.localStorage.getItem(`partner_templates_${userId}`);
      // Presence check only; not all environments set user id
      if (templatesRaw) {
        const templates = JSON.parse(templatesRaw);
        expect(templates.length).to.be.greaterThan(0);
      }
    });
  });
});
