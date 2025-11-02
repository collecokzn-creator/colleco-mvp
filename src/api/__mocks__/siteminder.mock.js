// Simple in-memory mock for Siteminder API used for local dev and tests

const { v4: uuidv4 } = require('uuid');

const bookings = new Map();

function now() { return new Date().toISOString(); }

async function createBooking(data) {
  const providerBookingId = `mock-${uuidv4()}`;
  const record = {
    providerBookingId,
    status: 'confirmed',
    createdAt: now(),
    booking: data
  };
  bookings.set(providerBookingId, record);
  return { providerBookingId, status: record.status, createdAt: record.createdAt };
}

async function updateBooking(providerBookingId, updateData) {
  const rec = bookings.get(providerBookingId);
  if (!rec) return { providerBookingId, status: 'not_found' };
  rec.booking = Object.assign({}, rec.booking, updateData);
  rec.updatedAt = now();
  bookings.set(providerBookingId, rec);
  return { providerBookingId, status: 'updated', updatedAt: rec.updatedAt };
}

async function cancelBooking(providerBookingId, reason) {
  const rec = bookings.get(providerBookingId);
  if (!rec) return { providerBookingId, status: 'not_found' };
  rec.status = 'cancelled';
  rec.cancelledAt = now();
  rec.cancelReason = reason;
  bookings.set(providerBookingId, rec);
  return { providerBookingId, status: 'cancelled', cancelledAt: rec.cancelledAt };
}

async function getAvailability({ propertyId, startDate, endDate, roomTypeIds }) {
  // Simple deterministic availability: return 5 units per room per date
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().slice(0,10);
    const roomTypes = (roomTypeIds && roomTypeIds.length) ? roomTypeIds : ['RT-Standard'];
    for (const rt of roomTypes) days.push({ date, roomTypeId: rt, availableUnits: 5 });
  }
  return { availability: days };
}

async function pushRates(ratePayload) {
  // Accept everything in mock
  return { accepted: true };
}

module.exports = { createBooking, updateBooking, cancelBooking, getAvailability, pushRates };
