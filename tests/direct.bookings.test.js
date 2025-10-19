import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('Direct booking endpoints', () => {
  it('POST /api/bookings/accommodation creates a booking', async () => {
    // Use non-paid booking (unitPrice: 0) so server does not require a hold in test mode
    const res = await request(app).post('/api/bookings/accommodation').send({ hotelName: 'Test Hotel', nights: 2, unitPrice: 0, currency: 'ZAR', customer: { name: 'Alice' } });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('booking');
    expect(res.body.booking.items[0].type).toBe('accommodation');
  });

  it('POST /api/bookings/flight creates a booking', async () => {
    const res = await request(app).post('/api/bookings/flight').send({ from: 'JNB', to: 'CPT', date: '2025-11-01', price: 2500, currency: 'ZAR', customer: { name: 'Bob' } });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('booking');
    expect(res.body.booking.items[0].type).toBe('flight');
  });

  it('POST /api/bookings/car creates a booking', async () => {
    const res = await request(app).post('/api/bookings/car').send({ vehicleType: 'SUV', days: 3, pricePerDay: 500, currency: 'ZAR', customer: { name: 'Carol' } });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('booking');
    expect(res.body.booking.items[0].type).toBe('car');
  });
});
