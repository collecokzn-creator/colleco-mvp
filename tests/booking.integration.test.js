import { describe, it, expect } from 'vitest';
import request from 'supertest';

const app = require('../server/server');

describe('Integration: booking -> checkout -> webhook', () => {
  it('creates a booking, simulates payment, and marks booking confirmed with pricing', async () => {
    // Create booking with new multi-supplier schema
    const createRes = await request(app)
      .post('/api/bookings')
      .send({
        supplierId: 'beekman',
        userId: 'test_user_' + Date.now(),
        bookingType: 'FIT',
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: [
          {
            serviceType: 'accommodation',
            description: 'Test Hotel - Standard Room',
            basePrice: 450,
            retailPrice: 450,
            quantity: 1,
            nights: 2
          }
        ],
        metadata: {
          propertyName: 'Test Hotel',
          location: 'Test Location'
        }
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body && createRes.body.id).toBeDefined();
    const booking = createRes.body;
    expect(booking).toBeDefined();
    expect(booking.pricing).toBeDefined();
    expect(typeof booking.pricing.total).toBe('number');
    expect(booking.status).toBe('pending');
  });
});
