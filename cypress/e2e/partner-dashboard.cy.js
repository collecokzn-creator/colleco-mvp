// Cypress smoke spec for Partner Dashboard & Templates
// Focus: route loads, role selection, template persistence

describe('Partner Dashboard & Templates Smoke', () => {
  const partnerRoleKey = 'partnerRole';
  const authRoleKey = 'colleco.sidebar.role';
  const userKey = 'user';

  function seedAuth(win) {
    // Enable E2E mode so guarded routes and UserContext fallbacks activate
    win.__E2E__ = true;
    win.__E2E_USER__ = { id: 'PARTNER-SMOKE', name: 'Partner Smoke', role: 'partner' };
    // Primary auth / role keys used by guards & sidebar
    win.localStorage.setItem(authRoleKey, JSON.stringify('partner'));
    win.localStorage.setItem(userKey, JSON.stringify({ id: 'PARTNER-SMOKE', name: 'Partner Smoke', role: 'partner' }));
    // Persistence mode to ensure localStorage read path
    win.localStorage.setItem('user:persistence', 'local');
  }

  function visitPartnerDashboard() {
     // Use hash-based path because production build enables HashRouter (BASE_URL becomes './')
     // so routes resolve off location.hash rather than pathname. Direct /partner-dashboard would
     // land on Home causing missing selectors.
     cy.visit('/#/partner-dashboard', { onBeforeLoad: seedAuth });
    // Wait for E2E readiness markers if they appear
    cy.window().then(win => {
      if (win.__E2E_MOUNTED__ !== true) {
        cy.wrap(null).then({ timeout: 8000 }, () => {
          return new Cypress.Promise((resolve) => {
            const start = Date.now();
            const poll = () => {
              if (win.__E2E_MOUNTED__ === true || Date.now() - start > 7500) return resolve();
              setTimeout(poll, 150);
            };
            poll();
          });
        });
      }
    });
  }

  beforeEach(() => {
    visitPartnerDashboard();
    cy.window().then(win => {
      const comp = win.__E2E_ACTIVE_ROUTE_COMPONENT__ && win.__E2E_ACTIVE_ROUTE_COMPONENT__['/partner-dashboard'];
      if (comp) cy.log(`resolved:/partner-dashboard->${comp}`);
    });
  });

  it('renders hub heading', () => {
    cy.get('[data-testid="partner-hub-title"]', { timeout: 12000 }).should('contain.text', 'Partner Business Hub');
  });

  it('selects a category tile and persists partnerRole', () => {
    cy.get('[data-testid="category-hotels-lodges"]', { timeout: 12000 }).click();
    cy.window().then(win => {
      const stored = win.localStorage.getItem(partnerRoleKey);
      expect(stored, 'partnerRole stored').to.not.equal(null);
    });
  });

  it('visits templates page and detects default template', () => {
     cy.visit('/#/partner/templates', { onBeforeLoad: seedAuth });
    cy.contains(/Manage Invoice Templates|Default Template|Template/i, { timeout: 12000 }).should('exist');
  });

  it('saves a template and reload retains it', () => {
     cy.visit('/#/partner/templates', { onBeforeLoad: seedAuth });
     // Wait for templates page heading to ensure component mounted
     cy.contains('Invoice Templates', { timeout: 12000 });
     // Ensure we are in editing mode: if save button absent, create or edit
     cy.get('body').then($body => {
       if ($body.find('[data-testid="save-template-btn"]').length === 0) {
         if ($body.find('[data-testid="create-first-template-btn"]').length) {
           cy.get('[data-testid="create-first-template-btn"]').click();
         } else if ($body.find('[data-testid="create-new-template-btn"]').length) {
           cy.get('[data-testid="create-new-template-btn"]').click();
         } else if ($body.find('[data-testid="edit-template-btn"]').length) {
           cy.get('[data-testid="edit-template-btn"]').click();
         }
       }
     });
     // Wait for editor to appear
     cy.get('[data-testid="save-template-btn"]', { timeout: 12000 }).should('exist');
     cy.get('[data-testid="company-name-input"]', { timeout: 12000 })
       .clear()
       .type('Smoke Test Co');
     cy.get('[data-testid="template-name-input"]', { timeout: 12000 })
       .clear()
       .type('Smoke Template');
     cy.get('[data-testid="save-template-btn"]', { timeout: 8000 }).click();
     cy.reload();
     cy.window().then(win => {
       const raw = win.localStorage.getItem(`partner_templates_PARTNER-SMOKE`);
       expect(raw, 'templates persisted').to.not.equal(null);
       const list = JSON.parse(raw);
       expect(list.length).to.be.greaterThan(0);
       const found = list.find(t => t.companyInfo?.name === 'Smoke Test Co');
       expect(found, 'saved template present').to.not.equal(undefined);
     });
  });
});
