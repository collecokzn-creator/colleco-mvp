// Cypress smoke spec for Partner Dashboard & Templates
// Focus: route loads, role selection, template persistence

describe('Partner Dashboard & Templates Smoke', () => {
  const partnerRoleKey = 'partnerRole';
  const authRoleKey = 'colleco.sidebar.role';
  const userKey = 'user';

  function seedAuth(win) {
    win.localStorage.setItem(authRoleKey, JSON.stringify('partner'));
    win.localStorage.setItem(userKey, JSON.stringify({ id: 'PARTNER-SMOKE', name: 'Partner Smoke' }));
  }

  beforeEach(() => {
    cy.visit('/partner-dashboard', {
      onBeforeLoad: seedAuth
    });
  });

  it('renders hub heading', () => {
    cy.get('[data-testid="partner-hub-title"]').should('contain.text', 'Partner Business Hub');
  });

  it('selects a category tile and persists partnerRole', () => {
    cy.get('[data-testid="category-hotels-lodges"]').click();
    cy.window().then(win => {
      const stored = win.localStorage.getItem(partnerRoleKey);
      expect(stored, 'partnerRole stored').to.not.equal(null);
    });
  });

  it('visits templates page and detects default template', () => {
    cy.visit('/partner/templates', { onBeforeLoad: seedAuth });
    cy.contains(/Default Template|Manage Invoice Templates|Template/i, { timeout: 8000 }).should('exist');
  });

  it('saves a template and reload retains it', () => {
    cy.visit('/partner/templates', { onBeforeLoad: seedAuth });
    cy.get('input').first().then($el => {
      if ($el.length) {
        cy.wrap($el).clear().type('Smoke Test Co');
      }
    });
    cy.contains(/Save Template|Save/i, { timeout: 4000 }).click({ force: true });
    cy.reload();
    cy.window().then(win => {
      const raw = win.localStorage.getItem(`partner_templates_PARTNER-SMOKE`);
      expect(raw, 'templates persisted').to.not.equal(null);
      const list = JSON.parse(raw);
      expect(list.length).to.be.greaterThan(0);
    });
  });
});
