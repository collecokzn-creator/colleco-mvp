// CollEco Travel API Client (scalable, API-first)
// Use this module for all frontend API calls. Easily swap endpoints for white-labeling or partner integrations.
// Example: import { getQuotes } from '../api/client'

const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.collecotravel.com/v1';

export async function getQuotes() {
  // GET /quotes
  const res = await fetch(`${BASE_URL}/quotes`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  return res.json();
}

export async function getItineraries() {
  // GET /itineraries
  const res = await fetch(`${BASE_URL}/itineraries`);
  if (!res.ok) throw new Error('Failed to fetch itineraries');
  return res.json();
}

export async function createBooking(data) {
  // POST /bookings
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

// Add more endpoints as needed for partners, admin, payments, etc.
