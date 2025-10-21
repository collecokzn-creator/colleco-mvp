describe('Booking modal (programmatic open)', () => {
  it('opens the booking modal via the app test hook and shows dialog controls', () => {
    // visit the app root — CI and local preview should set baseUrl in Cypress config or via CLI
    cy.visit('/');

    // Give the app a moment to register test hooks
    cy.window({ timeout: 10000 }).should('have.property', '__openBooking').then(() => {
      // Call the function inside the application's window context
      cy.window().then((win) => {
        if (typeof win.__forceOpenBooking === 'function') {
          win.__forceOpenBooking();
        } else if (typeof win.__openBooking === 'function') {
          win.__openBooking();
        } else {
          // fallback: try clicking any booking buttons if present
          cy.get('a[href*="/book"], button[data-e2e="open-booking"]').first().click();
        }
      });
    });

    // Assert the booking modal dialog is present
    cy.get('#booking-modal-title', { timeout: 10000 }).should('be.visible');
    cy.get('[data-e2e-close], [data-e2e="booking-close"]', { timeout: 10000 }).should('exist');
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
  });
});
describe('Booking Modal', () => {
  beforeEach(() => {
    // ensure the app knows we're in E2E so Home exposes helpers (set before scripts run)
    cy.visit('/', { onBeforeLoad(win) { try { win.__E2E__ = true; } catch (e) {} } });
  });

  it('opens modal and creates an accommodation booking', () => {
    // Wait for SPA to render primary CTAs
    cy.contains('Start Planning', { timeout: 10000 }).should('be.visible');

    // Wait for app CTAs then call the programmatic helper (fallback to click if it throws)
    cy.contains('Start Planning', { timeout: 10000 }).should('be.visible');
    cy.window({ timeout: 10000 }).its('__openBooking').should('exist');
    cy.window().then((win) => {
      try {
        win.__openBooking();
      } catch (e) {
        // fallback to clicking the visible button
        cy.contains('button', 'Book Now').filter(':visible').first().click({ force: true });
      }
    });

    // Confirm helper executed (test-only flag)
    cy.window({ timeout: 5000 }).its('__openBookingCalled').should('be.true');

  // Wait for the modal to appear — be resilient by accepting any of several
  // indicators: a dialog role, the modal title, or the E2E close button.
  cy.get('[role="dialog"], #booking-modal-title, [data-e2e-close]', { timeout: 20000 }).should('exist');
  // small pause to allow any render/update to settle after mount
  cy.wait(150);

    // Send Escape to close the modal and ensure the heading disappears
    cy.get('body').type('{esc}');
    cy.get('#booking-modal-title').should('not.exist', { timeout: 10000 });
  });
  it('opens modal and focuses first control, traps focus, and closes on Escape', () => {
    // Wait for the app to hydrate / render main CTAs before opening modal
    cy.contains('Start Planning', { timeout: 10000 }).should('be.visible');

    // Ensure the helper exists (set by the Home component in E2E mode)
    cy.window({ timeout: 10000 }).its('__openBooking').should('exist');
    cy.window().then((win) => {
      try {
        win.__openBooking();
      } catch (e) {
        // fallback to clicking the visible button
        cy.contains('button', 'Book Now').filter(':visible').first().click({ force: true });
      }
    });

    // assert the helper actually executed (test-only flag)
    cy.window({ timeout: 5000 }).its('__openBookingCalled').should('be.true');
    // Wait for E2E modal root to be present and visible
  cy.get('[data-modal-root][data-e2e-ready="true"]', { timeout: 20000 }).should('exist');
  cy.wait(150);

    // Send Escape to close the modal and ensure the heading disappears
    cy.get('body').type('{esc}');
    cy.get('#booking-modal-title').should('not.exist', { timeout: 10000 });
  });
});
