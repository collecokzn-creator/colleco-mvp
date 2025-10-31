import { describe, it, expect } from 'vitest';
import request from 'supertest';

const app = require('../server/server');

describe('Integration: booking -> checkout -> webhook', () => {
  it('creates a booking, simulates payment, and marks booking confirmed with pricing', async () => {
    // create booking with paid item
    const createRes = await request(app)
      .post('/api/bookings')
      .send({ items: [{ type: 'accommodation', amount: 10000, nights: 2, name: 'Test Hotel' }], currency: 'ZAR', metadata: { partnerBookingCount: 30 } });
    expect(createRes.status).toBe(200);
    expect(createRes.body && createRes.body.ok).toBe(true);
  const { booking, checkout } = createRes.body;
    expect(booking).toBeDefined();
    expect(checkout && checkout.sessionId).toBeDefined();
    // webhook simulate paid
    const webhookRes = await request(app).post('/api/payments/webhook').send({ sessionId: checkout.sessionId, status: 'paid' });
    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body && webhookRes.body.ok).toBe(true);
    // get booking and assert confirmed and pricing present
    const getRes = await request(app).get(`/api/bookings/${booking.id}`);
    expect(getRes.status).toBe(200);
    const b = getRes.body && getRes.body.booking;
    expect(b).toBeDefined();
    expect(b.status).toBe('Confirmed');
    expect(b.pricing).toBeDefined();
    expect(typeof b.pricing.total).toBe('number');
  });
});
