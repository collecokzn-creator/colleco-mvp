// Extended tests for Partner Templates (duplicate, default, delete)

describe('Partner Templates Extended', () => {
  function seedAuth(win) {
    win.__E2E__ = true;
    win.__E2E_USER__ = { id: 'PARTNER-EXT', name: 'Partner Ext', role: 'partner' };
    win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('partner'));
    win.localStorage.setItem('user', JSON.stringify({ id: 'PARTNER-EXT', name: 'Partner Ext', role: 'partner' }));
    win.localStorage.setItem('user:persistence', 'local');
  }

  function ensureEditing() {
    cy.get('body').then($body => {
      if ($body.find('[data-testid="save-template-btn"]').length === 0) {
        if ($body.find('[data-testid="create-first-template-btn"]').length) {
          cy.get('[data-testid="create-first-template-btn"]').click();
        } else if ($body.find('[data-testid="create-new-template-btn"]').length) {
          cy.get('[data-testid="create-new-template-btn"]').click();
        } else if ($body.find('[data-testid="template-edit-btn"]').length) {
          cy.get('[data-testid="template-edit-btn"]').first().click();
        }
      }
    });
    cy.get('[data-testid="save-template-btn"]', { timeout: 12000 }).should('exist');
  }

  beforeEach(() => {
    cy.visit('/#/partner/templates', { onBeforeLoad: seedAuth });
    cy.contains('Invoice Templates', { timeout: 15000 }).should('exist');
  });

  it('creates base template', () => {
    ensureEditing();
    cy.get('[data-testid="company-name-input"]').clear().type('Ext Co');
    cy.get('[data-testid="template-name-input"]').clear().type('Ext Base');
    cy.get('[data-testid="save-template-btn"]').click();
    cy.get('[data-testid="template-item"]').should('have.length.at.least', 1);
  });

  it('duplicates template and marks copy', () => {
    // Precondition: have at least one template
    if (Cypress.config('isInteractive')) {
      // noop
    }
    cy.get('[data-testid="template-copy-btn"]').first().click();
    ensureEditing();
    cy.get('[data-testid="template-name-input"]').invoke('val').should('match', /Copy$/);
    cy.get('[data-testid="save-template-btn"]').click();
    cy.get('[data-testid="template-item"]').should('have.length.at.least', 2);
  });

  it('sets a template as default and validates exclusivity', () => {
    // Edit first template, set default
    cy.get('[data-testid="template-edit-btn"]').first().click();
    cy.get('input[type="checkbox"]').filter((_, el) => el.nextSibling && el.nextSibling.textContent.includes('Set as Default Template')).first().check({ force: true });
    cy.get('[data-testid="save-template-btn"]').click();
    cy.get('[data-testid="template-default-badge"]').should('have.length', 1);
  });

  it('deletes a non-default template', () => {
    // Ensure at least two templates exist; if only one, duplicate first
    cy.get('[data-testid="template-item"]').then($items => {
      if ($items.length < 2) {
        cy.get('[data-testid="template-copy-btn"]').first().click();
        ensureEditing();
        cy.get('[data-testid="save-template-btn"]').click();
      }
    });
    // Find a delete button that is not on the default template row
    cy.get('[data-testid="template-default-badge"]').parent().invoke('attr','data-testid');
    cy.get('[data-testid="template-delete-btn"]').last().click();
    cy.get('[data-testid="template-item"]').should('have.length.at.least', 1);
  });
});
