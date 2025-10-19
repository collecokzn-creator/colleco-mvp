describe('Booking E2E', () => {
  it('creates a booking via UI and completes mock checkout', () => {
  // default API for local dev server (server/server.js uses PORT 4000)
    // Visit bookings page and set E2E flags / role so guarded UI renders
    cy.visit('/bookings', { failOnStatusCode: false, onBeforeLoad(win) {
      try { win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); } catch(e){}
      // help SPA hydration in slow CI by dispatching a synthetic load after a short delay
      setTimeout(() => { try { win.dispatchEvent(new Event('load')); } catch(e){} }, 800);
    } });
    // Ensure page rendered
    cy.get('#root', { timeout: 60000 }).should('exist');
    // Use centralized booking stub helper
    cy.stubBooking({ id: 'test-bkg-1', items: [ { name: 'Sea View Hotel (2 nights)', amount: 180 }, { name: 'Table Mountain Hike', amount: 60 } ], pricing: { currency: 'USD', subtotal: 240, total: 240 }, checkout: { sessionId: 'mock-session-1234', checkoutUrl: `/api/mock-checkout/mock-session-1234` } });
  // Click the Pay button (ensure visible). Scope to a button to avoid matching other text nodes.
  cy.contains('button', 'Pay securely', { timeout: 30000 }).should('be.visible').click();
  // After booking creation the PaymentButton shows a small panel with 'Proceed to payment' and 'View booking'
  cy.contains('View booking', { timeout: 20000 }).should('be.visible').click();
  // View booking navigates to the app's payment-success page with bookingId in query
  cy.url({ timeout: 20000 }).should('include', '/payment-success');
  cy.contains('Payment success', { timeout: 10000 }).should('be.visible');
  cy.contains('Pricing breakdown', { timeout: 10000 }).should('be.visible');
  });
});
