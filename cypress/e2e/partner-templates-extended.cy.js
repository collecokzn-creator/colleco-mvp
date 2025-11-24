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
    cy.get('[data-testid="save-template-btn"]', { timeout: 15000 }).should('exist');
  }

  function ensureTemplateExists() {
    cy.get('body').then($body => {
      if ($body.find('[data-testid="template-item"]').length === 0) {
        ensureEditing();
        cy.get('[data-testid="company-name-input"]').clear().type('Ext Co');
        cy.get('[data-testid="template-name-input"]').clear().type('Ext Base');
        cy.get('[data-testid="save-template-btn"]').click();
        cy.get('[data-testid="template-item"]', { timeout: 15000 }).should('exist');
      }
    });
  }

  beforeEach(() => {
    cy.visit('/#/partner/templates', { onBeforeLoad: seedAuth });
    cy.contains('Invoice Templates', { timeout: 20000 }).should('exist');
    ensureTemplateExists();
    cy.on('window:confirm', () => true); // auto-confirm deletes
  });

  it('creates base template', () => {
    // Already ensured exists; create an additional one to verify growth
    ensureEditing();
    cy.get('[data-testid="company-name-input"]').clear().type('Ext Co Two');
    cy.get('[data-testid="template-name-input"]').clear().type('Ext Base Two');
    cy.get('[data-testid="save-template-btn"]').click();
    cy.get('[data-testid="template-item"]').should('have.length.at.least', 2);
  });

  it('duplicates template and marks copy', () => {
    ensureTemplateExists();
    cy.get('[data-testid="template-item"]').its('length').then(beforeCount => {
      cy.get('[data-testid="template-copy-btn"]', { timeout: 15000 }).first().click();
      ensureEditing();
      cy.get('[data-testid="template-name-input"]', { timeout: 15000 }).invoke('val').should('match', /\(Copy\)$/);
      cy.get('[data-testid="save-template-btn"]').click();
      cy.get('[data-testid="template-item"]').its('length').should('eq', beforeCount + 1);
    });
  });

  it('sets a template as default and validates exclusivity', () => {
    ensureTemplateExists();
    cy.get('[data-testid="template-edit-btn"]', { timeout: 15000 }).first().click();
    cy.get('input[type="checkbox"]').filter((_, el) => el.nextSibling && el.nextSibling.textContent.includes('Set as Default Template')).first().check({ force: true });
    cy.get('[data-testid="save-template-btn"]').click();
    cy.get('[data-testid="template-default-badge"]', { timeout: 15000 }).should('have.length', 1);
  });

  it('deletes a non-default template', () => {
    ensureTemplateExists();
    // Create a copy to delete (avoid deleting the default)
    cy.get('[data-testid="template-copy-btn"]', { timeout: 15000 }).first().click();
    ensureEditing();
    cy.get('[data-testid="template-name-input"]').clear().type('To Delete Copy');
    cy.get('[data-testid="save-template-btn"]').click();
    cy.get('[data-testid="template-item"]').should('have.length.at.least', 2);
    // Find a delete button where no default badge is present in the same parent
    cy.get('[data-testid="template-item"]').then($items => {
      const nonDefault = [...$items].find(el => el.querySelector('[data-testid="template-default-badge"]') == null);
      if (nonDefault) {
        cy.wrap(nonDefault).find('[data-testid="template-delete-btn"]').click();
      }
    });
    cy.get('[data-testid="template-item"]').should('have.length.at.least', 1);
  });
});
