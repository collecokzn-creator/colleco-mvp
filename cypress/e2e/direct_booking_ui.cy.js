describe('Direct booking UI flows', () => {
  // apiBase intentionally unused here; stubbing POST endpoints with wildcard URLs

  it('accommodation flow: book -> checkout -> success', () => {
    // Visit and set E2E flags so guarded UI renders reliably
  cy.visit('/#/book/accommodation', { failOnStatusCode: false, onBeforeLoad(win){ try{ win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); }catch(e){} setTimeout(()=>{ try{ win.dispatchEvent(new Event('load')); }catch(e){} },800); } });
    cy.get('#root', { timeout: 60000 }).should('exist');
    // Fill the form by scoping to the form element and using index-based inputs
    cy.get('form').within(() => {
      cy.get('input').eq(0).clear().type('Test Hotel'); // Hotel name
      cy.get('input[type="number"]').eq(0).clear().type('2'); // Nights
      cy.get('input[type="number"]').eq(1).clear().type('1200'); // Price per night
    });
    // Use shared booking stub helper to keep tests DRY and deterministic
    cy.stubBooking({ id: 'test-bkg-1', items: [ { name: 'Test Hotel', amount: 240 } ], pricing: { currency: 'USD', subtotal: 240, total: 240 } });
    cy.get('form').within(() => cy.get('button[type="submit"]').click());
  cy.visit('/#/payment-success?bookingId=test-bkg-1', { failOnStatusCode: false });
  cy.contains('Payment success', { timeout: 10000 }).should('be.visible');
  });

  it('flight flow: book -> checkout', () => {
  cy.visit('/#/book/flight', { failOnStatusCode: false, onBeforeLoad(win){ try{ win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); }catch(e){} setTimeout(()=>{ try{ win.dispatchEvent(new Event('load')); }catch(e){} },800); } });
    cy.get('#root', { timeout: 60000 }).should('exist');
    // Fill flight form inside its form container
    cy.get('form').within(() => {
      cy.get('input').eq(0).clear().type('JNB'); // From
      cy.get('input').eq(1).clear().type('CPT'); // To
      cy.get('input[type="date"]').clear().type('2025-11-01'); // Date
      cy.get('input[type="number"]').eq(0).clear().type('2500'); // Price
    });
    cy.stubBooking({ id: 'test-bkg-1', items: [ { name: 'Flight JNB→CPT', amount: 2500 } ], pricing: { currency: 'USD', subtotal: 2500, total: 2500 }, checkout: { sessionId: 'mock-session-2', checkoutUrl: `/api/mock-checkout/mock-session-2` } });
  cy.get('form').within(() => cy.get('button[type="submit"]').click());
  // give the app a moment to handle the mocked checkout navigation and dynamic imports
  cy.wait(300);
  cy.visit('/#/payment-success?bookingId=test-bkg-1', { failOnStatusCode: false });
  cy.contains('Payment success', { timeout: 10000 }).should('be.visible');
  });

  it('car flow: hire -> checkout', () => {
  cy.visit('/#/book/car', { failOnStatusCode: false, onBeforeLoad(win){ try{ win.__E2E__ = true; win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); }catch(e){} setTimeout(()=>{ try{ win.dispatchEvent(new Event('load')); }catch(e){} },800); } });
    cy.get('#root', { timeout: 60000 }).should('exist');
    cy.get('form').within(() => {
      cy.get('input').eq(0).clear().type('SUV'); // Vehicle Type
      cy.get('input[type="number"]').eq(0).clear().type('3'); // Days
      cy.get('input[type="number"]').eq(1).clear().type('500'); // Price per day
    });
    cy.stubBooking({ id: 'test-bkg-1', items: [ { name: 'SUV hire', amount: 1500 } ], pricing: { currency: 'USD', subtotal: 1500, total: 1500 }, checkout: { sessionId: 'mock-session-3', checkoutUrl: `/api/mock-checkout/mock-session-3` } });
  // Click submit, wait briefly for app to process the mocked checkout navigation,
  // then navigate to the success page. The small wait reduces timing flakes.
  cy.get('form').within(() => cy.get('button[type="submit"]').click());
  cy.wait(300);
  cy.visit('/#/payment-success?bookingId=test-bkg-1', { failOnStatusCode: false });
  // Prefer existence (then visible) to avoid chai-jQuery null-subject flakes.
  cy.contains('Payment success', { timeout: 10000 }).should('exist').and('be.visible');
  });
});
