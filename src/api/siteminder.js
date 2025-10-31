// Lightweight wrapper for Siteminder integration (mock-first)
// Exports: createBooking, updateBooking, cancelBooking, getAvailability, pushRates

const useMock = process.env.SITEMINDER_USE_MOCK === '1' || !process.env.SITEMINDER_API_URL;
let mock;
if (useMock) {
  mock = require('./__mocks__/siteminder.mock');
}

async function createBooking(bookingData) {
  if (useMock) return mock.createBooking(bookingData);
  throw new Error('Siteminder real API not implemented. Provide SITEMINDER_API_URL and implement HTTP client.');
}

async function updateBooking(providerBookingId, updateData) {
  if (useMock) return mock.updateBooking(providerBookingId, updateData);
  throw new Error('Siteminder real API not implemented.');
}

async function cancelBooking(providerBookingId, reason) {
  if (useMock) return mock.cancelBooking(providerBookingId, reason);
  throw new Error('Siteminder real API not implemented.');
}

async function getAvailability(params) {
  if (useMock) return mock.getAvailability(params);
  throw new Error('Siteminder real API not implemented.');
}

async function pushRates(ratePayload) {
  if (useMock) return mock.pushRates(ratePayload);
  throw new Error('Siteminder real API not implemented.');
}

module.exports = { createBooking, updateBooking, cancelBooking, getAvailability, pushRates };
