describe('Admin accommodation inventory', () => {
  // Use API_BASE env var when running Cypress so requests go to backend (e.g. http://localhost:4001)
  const API = (Cypress.env('API_BASE') ? `${Cypress.env('API_BASE')}/api` : '/api');
  it('allows admin to update inventory and create hold + booking', () => {
    // Ensure admin token is not required in local dev; otherwise set Authorization header
    // 1) Replace inventory with a test room type
    cy.request({ method: 'PUT', url: `${API}/accommodation/inventory`, body: { roomTypes: { testroom: { total: 2, price: 100 } } } }).then((res) => {
      expect(res.status).to.be.oneOf([200,201]);
      expect(res.body.inventory.roomTypes.testroom.total).to.equal(2);
    });

    const startDate = Cypress.moment().add(3, 'days').format('YYYY-MM-DD');
    const endDate = Cypress.moment().add(5, 'days').format('YYYY-MM-DD');

    // 2) Check availability
    cy.request({ method: 'GET', url: `${API}/accommodation/availability`, qs: { roomType: 'testroom', startDate, endDate } }).then((res)=>{
      expect(res.status).to.equal(200);
      expect(res.body.ok).to.be.true;
    });

    // 3) Create a hold
    cy.request({ method: 'POST', url: `${API}/accommodation/hold`, body: { roomType: 'testroom', startDate, endDate, qty: 1, holdMinutes: 5 } }).then((res)=>{
      expect(res.status).to.equal(201);
      const hold = res.body.hold;
      expect(hold).to.have.property('id');

      // 4) Create booking using hold
      cy.request({ method: 'POST', url: `${API}/bookings/accommodation`, body: { hotelName: 'Test Hotel', nights: 2, unitPrice: 100, roomType: 'testroom', startDate, endDate, holdId: hold.id, customer: { name: 'E2E Test' } } }).then((bres)=>{
        expect(bres.status).to.equal(200);
        expect(bres.body.booking).to.exist;
        const booking = bres.body.booking;
        // If checkout returned, simulate payment
        if(bres.body.checkout && bres.body.checkout.sessionId){
          cy.request('POST', `${API}/payments/webhook`, { sessionId: bres.body.checkout.sessionId, status: 'paid' }).then((wr)=>{
            expect(wr.status).to.equal(200);
            expect(wr.body.booking.status).to.equal('Confirmed');
          });
        }
      });
    });
  });
});
