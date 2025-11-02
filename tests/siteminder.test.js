import { describe, it, expect } from 'vitest';
const s = require('../src/api/siteminder');

describe('siteminder mock wrapper', () => {
  it('creates a booking and returns providerBookingId', async () => {
    const booking = await s.createBooking({ propertyId: 'P1', guest: { firstName: 'T', lastName: 'E' }, arrivalDate: '2025-12-01', departureDate: '2025-12-02' });
    expect(booking).toHaveProperty('providerBookingId');
    expect(booking.status).toBeDefined();
  });

  it('gets availability for a date range', async () => {
    const avail = await s.getAvailability({ propertyId: 'P1', startDate: '2025-12-01', endDate: '2025-12-04' });
    expect(avail).toHaveProperty('availability');
    expect(Array.isArray(avail.availability)).toBe(true);
  });
});
