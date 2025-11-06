// CollEco Travel API Client (scalable, API-first)
// Use this module for all frontend API calls. Easily swap endpoints for white-labeling or partner integrations.
// Example: import { getQuotes } from '../api/client'

// Default to local dev server if not provided. Use Vite's import.meta.env in the browser build.
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000/api');

export async function getQuotes() {
  // GET /quotes
  const res = await fetch(`${BASE_URL}/quotes`);
  if (!res.ok) {
    const body = await res.text();
    const err = new Error('Failed to fetch quotes');
    err.status = res.status;
    err.body = body;
    throw err;
  }
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
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    const err = new Error('Failed to create booking');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

export async function getBooking(id) {
  // GET /bookings/:id
  if (!id) throw new Error('Missing booking id');
  const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const body = await res.text();
    const err = new Error('Failed to fetch booking');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

export async function bookAccommodation({ hotelName, nights, unitPrice, currency = 'USD', customer = {}, metadata = {} }){
  const res = await fetch(`${BASE_URL}/bookings/accommodation`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelName, nights, unitPrice, currency, customer, metadata })
  });
  if(!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    const err = new Error('Failed to create accommodation booking'); err.status = res.status; err.body = body; throw err;
  }
  return res.json();
}

export async function checkAccommodationAvailability({ roomType = 'standard', startDate, endDate }){
  const url = new URL(`${BASE_URL.replace(/\/api$/,'')}/api/accommodation/availability`);
  if(roomType) url.searchParams.set('roomType', roomType);
  if(startDate) url.searchParams.set('startDate', startDate);
  if(endDate) url.searchParams.set('endDate', endDate);
  const res = await fetch(url.toString());
  if(!res.ok){ const body = await res.text(); const err = new Error('Failed to check availability'); err.status = res.status; err.body = body; throw err; }
  return res.json();
}

export async function createAccommodationHold({ roomType = 'standard', startDate, endDate, qty = 1, holdMinutes = 10 }){
  const res = await fetch(`${BASE_URL}/accommodation/hold`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomType, startDate, endDate, qty, holdMinutes }) });
  if(!res.ok){ const body = await res.text(); const err = new Error('Failed to create hold'); err.status = res.status; err.body = body; throw err; }
  return res.json();
}

export async function bookFlight({ from, to, date, price, currency = 'USD', customer = {}, metadata = {}, flightNumber, returnFlight }){
  const res = await fetch(`${BASE_URL}/bookings/flight`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to, date, price, currency, customer, metadata, flightNumber, returnFlight })
  });
  if(!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    const err = new Error('Failed to create flight booking'); err.status = res.status; err.body = body; throw err;
  }
  return res.json();
}

export async function bookCar({ vehicleType, days = 1, pricePerDay, currency = 'USD', customer = {}, metadata = {} }){
  const res = await fetch(`${BASE_URL}/bookings/car`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleType, days, pricePerDay, currency, customer, metadata })
  });
  if(!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    const err = new Error('Failed to create car booking'); err.status = res.status; err.body = body; throw err;
  }
  return res.json();
}

export async function bookShuttle({ shuttleId, pickupTime, seats = 1, amount = 0, currency = 'USD', customer = {}, metadata = {} }){
  const res = await fetch(`${BASE_URL}/bookings/shuttle`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shuttleId, pickupTime, seats, amount, currency, customer, metadata })
  });
  if(!res.ok){ const ct = res.headers.get('content-type') || ''; const body = ct.includes('application/json') ? await res.json() : await res.text(); const err = new Error('Failed to create shuttle booking'); err.status = res.status; err.body = body; throw err; }
  return res.json();
}

// Add more endpoints as needed for partners, admin, payments, etc.

export async function getFlight(itemId){
  if(!itemId) throw new Error('Missing flight item id');
  const res = await fetch(`${BASE_URL}/flights/${encodeURIComponent(itemId)}`);
  if(!res.ok){ const body = await res.text(); const err = new Error('Failed to fetch flight'); err.status = res.status; err.body = body; throw err; }
  return res.json();
}

export function subscribeToFlightUpdates(onEvent, opts = { role: 'client' }){
  if(typeof window === 'undefined' || !window.EventSource) return { close: ()=>{} };
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000/api');
  const url = new URL(`${base.replace(/\/api$/,'')}/events`);
  if(opts.role) url.searchParams.set('role', opts.role);
  const es = new EventSource(url.toString());
  es.addEventListener('flight.updated', (ev) => {
    try { const data = JSON.parse(ev.data); onEvent && onEvent(data); } catch(e){}
  });
  return { close: ()=> es.close() };
}
