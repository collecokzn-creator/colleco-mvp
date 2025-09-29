// src/utils/bookingsStorage.js

const BOOKINGS_KEY = "bookings";

/**
 * Retrieves all bookings from localStorage.
 * @returns {Array} An array of booking objects.
 */
export function getBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves all bookings to localStorage.
 * @param {Array} bookings The array of bookings to save.
 */
function saveBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch {}
}

/**
 * Updates the status of a specific booking.
 * @param {string} bookingId The ID of the booking to update.
 * @param {string} newStatus The new status for the booking.
 * @returns {boolean} True if the update was successful, false otherwise.
 */
export function updateBookingStatus(bookingId, newStatus) {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return false;
  bookings[index].status = newStatus;
  saveBookings(bookings);
  return true;
}