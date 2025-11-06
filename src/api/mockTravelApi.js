// src/api/mockTravelApi.js
// Mock travel API for demo and marketing-ready Trip Assist

const defaultHotels = [
  {
    id: 1,
    name: "Beekman Beach Resort",
    location: "Durban",
    lat: -29.8587,
    lng: 31.0436,
    availableDates: ["2025-10-11", "2025-10-12", "2025-10-13"],
    pricePerNight: 1800,
    amenities: ["Pool", "WiFi", "Breakfast"],
    image: "https://demo.beekman.com/beach-resort.jpg",
    description: "Coastal resort with private beach access and sea views."
  },
  {
    id: 2,
    name: "Umhlanga Sands Hotel",
    location: "Umhlanga Rocks",
    lat: -29.7093,
    lng: 31.0968,
    availableDates: ["2025-10-11", "2025-10-12", "2025-10-13"],
    pricePerNight: 2200,
    amenities: ["Sea View", "Spa", "Bar"],
    image: "https://demo.beekman.com/umhlanga-sands.jpg",
    description: "Classic seaside hotel close to shopping and restaurants."
  }
];

// Allow demo hotels to be persisted in localStorage for owner editing
function loadDemoHotels(){
  try {
    const raw = localStorage.getItem('mock:hotels');
    if(raw) return JSON.parse(raw);
  } catch(e){}
  return defaultHotels;
}

let sampleHotels = loadDemoHotels();

const sampleFlights = [
  {
    id: 1,
    from: "Johannesburg",
    to: "Durban",
    date: "2025-10-11",
    time: "15:00",
    airline: "FlySA",
    price: 950
  },
  {
    id: 2,
    from: "Cape Town",
    to: "Durban",
    date: "2025-10-11",
    time: "16:30",
    airline: "Kulula",
    price: 1200
  }
];

const defaultCars = [
  { id: 1, make: 'Toyota', model: 'Rav4', vehicleType: 'SUV', transmission: 'Automatic', seats: 5, pricePerDay: 650, location: 'Durban', image: 'https://demo.beekman.com/cars/rav4.jpg', description: 'Comfortable SUV, great for families.' },
  { id: 2, make: 'Volkswagen', model: 'Polo', vehicleType: 'Hatchback', transmission: 'Manual', seats: 5, pricePerDay: 420, location: 'Durban', image: 'https://demo.beekman.com/cars/polo.jpg', description: 'Economic city car, easy parking.' },
  { id: 3, make: 'Mercedes', model: 'C-Class', vehicleType: 'Sedan', transmission: 'Automatic', seats: 5, pricePerDay: 1200, location: 'Durban', image: 'https://demo.beekman.com/cars/cclass.jpg', description: 'Premium comfort for business trips.' }
];

function loadDemoCars(){
  try {
    const raw = localStorage.getItem('mock:cars');
    if(raw) return JSON.parse(raw);
  } catch(e){}
  return defaultCars;
}

let sampleCars = loadDemoCars();

const defaultShuttles = [
  {
    id: 1,
    route: 'Airport ↔ City Center',
    origin: 'King Shaka International Airport',
    originLat: -29.6156,
    originLng: 31.1165,
    destination: 'Durban City Centre',
    destinationLat: -29.8579,
    destinationLng: 31.0292,
    departTimes: ['08:00','10:00','12:00','14:00','16:00','18:00'],
    price: 120,
    capacity: 20,
    vehicle: 'Shuttle Bus',
    provider: 'Durban Shuttle Co',
    description: 'Frequent shuttle between the airport and city centre, 7 days a week.'
  },
  {
    id: 2,
    route: 'Umhlanga ↔ Beachfront',
    origin: 'Umhlanga Rocks',
    originLat: -29.7040,
    originLng: 31.1019,
    destination: 'Durban Beachfront',
    destinationLat: -29.8587,
    destinationLng: 31.0436,
    departTimes: ['09:00','11:30','13:30','15:30','17:30'],
    price: 80,
    capacity: 12,
    vehicle: 'Van',
    provider: 'Coastal Shuttles',
    description: 'Convenient short-hop shuttle for beachgoers and shoppers.'
  }
];

function loadDemoShuttles(){
  try { const raw = localStorage.getItem('mock:shuttles'); if(raw) return JSON.parse(raw); } catch(e){}
  return defaultShuttles;
}

let sampleShuttles = loadDemoShuttles();

export function getBookings(){
  try {
    const raw = localStorage.getItem('mock:bookings');
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}

export function getShuttles(){
  if(typeof window !== 'undefined' && window.fetch){
    try { const url = new URL('/api/shuttles', window.location.origin); return fetch(url.toString()).then(r => r.ok ? r.json().then(j => j.shuttles || sampleShuttles).catch(()=>sampleShuttles) : sampleShuttles).catch(()=>sampleShuttles); } catch(e){}
  }
  return sampleShuttles;
}

export function searchShuttles({ origin = '', destination = '' } = {}){
  if(typeof window !== 'undefined' && window.fetch){
    try { const url = new URL('/api/shuttles', window.location.origin); if(origin) url.searchParams.set('origin', origin); if(destination) url.searchParams.set('destination', destination); return fetch(url.toString()).then(r => r.ok ? r.json().then(j => j.shuttles || sampleShuttles).catch(()=>sampleShuttles) : sampleShuttles).catch(()=>sampleShuttles); } catch(e){}
  }
  return sampleShuttles.filter(s => (!origin || String(s.origin||'').toLowerCase().includes(String(origin||'').toLowerCase())) && (!destination || String(s.destination||'').toLowerCase().includes(String(destination||'').toLowerCase())));
}

export function bookShuttle(shuttleId, userDetails){
  const shuttle = sampleShuttles.find(s => Number(s.id) === Number(shuttleId));
  if(!shuttle) return { success:false, message: 'Shuttle not found' };
  const pickup = userDetails.pickupTime || shuttle.departTimes[0];
  const isScheduled = !!userDetails.date || !!userDetails.scheduledAt;
  const booking = {
    id: `SH-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`,
    shuttleId: shuttle.id,
    route: shuttle.route,
    origin: shuttle.origin,
    destination: shuttle.destination,
    pickupTime: pickup,
    passenger: userDetails.name || 'Guest',
    seats: Number(userDetails.seats || 1),
    amount: Number(userDetails.amount || shuttle.price || 0),
    currency: userDetails.currency || 'ZAR',
    status: isScheduled ? 'Scheduled' : 'Confirmed',
    scheduledAt: userDetails.scheduledAt || null,
    metadata: {
      pickupPoint: userDetails.pickupPoint || null,
      pickupCoords: userDetails.pickupCoords || null
    },
    assignment: {
      id: `ASG-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`,
      status: 'requested', // requested -> assigned -> enroute -> arriving -> picked-up
      driver: null,
      etaMinutes: null,
      createdAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem('mock:bookings');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(booking);
    localStorage.setItem('mock:bookings', JSON.stringify(arr));
  } catch(e){}
  return { success:true, booking };
}

export function updateBookingAssignment(bookingId, patch){
  try {
    const raw = localStorage.getItem('mock:bookings');
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(b => String(b.id) === String(bookingId));
    if(idx === -1) return null;
    arr[idx] = { ...arr[idx], assignment: { ...arr[idx].assignment, ...(patch || {}) } };
    localStorage.setItem('mock:bookings', JSON.stringify(arr));
    return arr[idx];
  } catch(e){ return null; }
}

export function updateBookingStatus(bookingId, status){
  try {
    const raw = localStorage.getItem('mock:bookings');
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(b => String(b.id) === String(bookingId));
    if(idx === -1) return null;
    arr[idx] = { ...arr[idx], status };
    try { localStorage.setItem('mock:bookings', JSON.stringify(arr)); } catch(e){}
    return arr[idx];
  } catch(e){ return null; }
}

export function searchHotels({ location, startDate, endDate: _endDate }) {
  // Filter hotels by location and available dates
  return sampleHotels.filter(hotel =>
    hotel.location.toLowerCase().includes(location.toLowerCase()) &&
    hotel.availableDates.includes(startDate)
  );
}

export function updateHotel(id, patch){
  const idx = sampleHotels.findIndex(h => Number(h.id) === Number(id));
  if(idx === -1) return null;
  sampleHotels[idx] = { ...sampleHotels[idx], ...patch };
  try { localStorage.setItem('mock:hotels', JSON.stringify(sampleHotels)); } catch(e){}
  return sampleHotels[idx];
}

export function addHotel(hotel){
  const nextId = Math.max(0, ...sampleHotels.map(h=>Number(h.id)||0)) + 1;
  const toAdd = { id: nextId, ...hotel };
  sampleHotels.push(toAdd);
  try { localStorage.setItem('mock:hotels', JSON.stringify(sampleHotels)); } catch(e){}
  return toAdd;
}

export function searchFlights({ from, to, date }) {
  // Filter flights by route and date
  return sampleFlights.filter(flight =>
    flight.from.toLowerCase().includes(from.toLowerCase()) &&
    flight.to.toLowerCase().includes(to.toLowerCase()) &&
    flight.date === date
  );
}

export function getCars(){
  // Prefer server-side list when available (makes demo state shared). Fall back to localStorage sampleCars.
  if(typeof window !== 'undefined' && window.fetch){
    try {
      const url = new URL('/api/cars', window.location.origin);
      return fetch(url.toString()).then(r => r.ok ? r.json().then(j => (j && j.cars) ? j.cars : sampleCars).catch(()=>sampleCars) : sampleCars).catch(()=>sampleCars);
    } catch(e){ return sampleCars; }
  }
  return sampleCars;
}

export function searchCars({ location = '', vehicleType = '', transmission = '', pickupDate = '', dropoffDate = '' } = {}){
  // Try server-side search first; fall back to local sample filter
  if(typeof window !== 'undefined' && window.fetch){
    try {
      const url = new URL('/api/cars', window.location.origin);
      if(location) url.searchParams.set('location', location);
      if(vehicleType) url.searchParams.set('vehicleType', vehicleType);
      if(transmission) url.searchParams.set('transmission', transmission);
      if(pickupDate) url.searchParams.set('pickupDate', pickupDate);
      if(dropoffDate) url.searchParams.set('dropoffDate', dropoffDate);
      return fetch(url.toString()).then(r => r.ok ? r.json().then(j => (j && j.cars) ? j.cars : sampleCars).catch(()=>sampleCars) : sampleCars).catch(()=>sampleCars);
    } catch(e){ /* fall through */ }
  }
  return sampleCars.filter(c => (
    (!location || String(c.location||'').toLowerCase().includes(String(location||'').toLowerCase())) &&
    (!vehicleType || String(c.vehicleType||'').toLowerCase().includes(String(vehicleType||'').toLowerCase()))
    && (!transmission || String(c.transmission||'').toLowerCase().includes(String(transmission||'').toLowerCase()))
  ));
}

export function getCarById(id){
  return sampleCars.find(c => Number(c.id) === Number(id));
}

export function addCar(car){
  const nextId = Math.max(0, ...sampleCars.map(h=>Number(h.id)||0)) + 1;
  const toAdd = { id: nextId, ...car };
  sampleCars.push(toAdd);
  try { localStorage.setItem('mock:cars', JSON.stringify(sampleCars)); } catch(e){}
  return toAdd;
}

export function updateCar(id, patch){
  const idx = sampleCars.findIndex(h => Number(h.id) === Number(id));
  if(idx === -1) return null;
  sampleCars[idx] = { ...sampleCars[idx], ...patch };
  try { localStorage.setItem('mock:cars', JSON.stringify(sampleCars)); } catch(e){}
  return sampleCars[idx];
}

export function bookCar(carId, userDetails){
  const car = sampleCars.find(h => Number(h.id) === Number(carId));
  if (!car) return { success: false, message: 'Car not found.' };
  const days = Number(userDetails.days || 1);
  const pricePerDay = Number(userDetails.pricePerDay || car.pricePerDay || 0);
  const extras = Array.isArray(userDetails.extras) ? userDetails.extras : [];
  const extrasTotal = extras.reduce((s,e)=>s + Number(e.price||0), 0);
  const total = Math.round((pricePerDay * days + extrasTotal) * 100) / 100;
  const booking = {
    id: `BK-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`,
    type: 'car',
    carId: car.id,
    carName: `${car.make} ${car.model}`,
    vehicleType: car.vehicleType,
    pickupLocation: (userDetails.metadata && userDetails.metadata.pickup && userDetails.metadata.pickup.location) || userDetails.pickupLocation || null,
    pickupDate: (userDetails.metadata && userDetails.metadata.pickup && userDetails.metadata.pickup.date) || null,
    pickupTime: (userDetails.metadata && userDetails.metadata.pickup && userDetails.metadata.pickup.time) || null,
    dropoffLocation: (userDetails.metadata && userDetails.metadata.dropoff && userDetails.metadata.dropoff.location) || userDetails.dropoffLocation || null,
    dropoffDate: (userDetails.metadata && userDetails.metadata.dropoff && userDetails.metadata.dropoff.date) || null,
    dropoffTime: (userDetails.metadata && userDetails.metadata.dropoff && userDetails.metadata.dropoff.time) || null,
    transmission: userDetails.transmission || car.transmission || 'Unknown',
    days, pricePerDay, extras, total, currency: userDetails.currency || 'ZAR', status: 'Confirmed', createdAt: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem('mock:bookings');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(booking);
    localStorage.setItem('mock:bookings', JSON.stringify(arr));
  } catch(e){}
  return { success: true, booking };
}

export function bookHotel(hotelId, userDetails) {
  // Simulate booking and return a booking object
  const hotel = sampleHotels.find(h => h.id === hotelId);
  if (!hotel) return { success: false, message: "Hotel not found." };
  const booking = {
    id: `BK-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`,
    hotelId: hotel.id,
    hotelName: hotel.name,
    guest: userDetails.name || userDetails.guest || 'Guest',
    startDate: userDetails.startDate,
    endDate: userDetails.endDate,
    nights: userDetails.nights || 1,
    pricePerNight: hotel.pricePerNight || userDetails.pricePerNight || 0,
    total: (hotel.pricePerNight || userDetails.pricePerNight || 0) * (userDetails.nights || 1),
    currency: userDetails.currency || 'ZAR',
    createdAt: new Date().toISOString(),
  };
  // Persist to localStorage bookings so demo pages can surface it
  try {
    const raw = localStorage.getItem('mock:bookings');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(booking);
    localStorage.setItem('mock:bookings', JSON.stringify(arr));
  } catch (e) {}
  return { success: true, booking };
}

export function getHotels() {
  return sampleHotels;
}

export function getHotelById(id) {
  return sampleHotels.find(h => h.id === Number(id));
}

// Simple in-memory (localStorage) reviews store for demo
export function getHotelReviews(hotelId) {
  try {
    const raw = localStorage.getItem('mock:hotelReviews');
    const map = raw ? JSON.parse(raw) : {};
    return map[hotelId] || [];
  } catch (e) { return []; }
}

export function addHotelReview(hotelId, review) {
  try {
    const raw = localStorage.getItem('mock:hotelReviews');
    const map = raw ? JSON.parse(raw) : {};
    map[hotelId] = map[hotelId] || [];
    map[hotelId].push({ id: `R-${Date.now()}`, createdAt: new Date().toISOString(), ...review });
    localStorage.setItem('mock:hotelReviews', JSON.stringify(map));
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

export function bookFlight(flightId, userDetails) {
  // Simulate booking and persist to demo bookings
  const flight = sampleFlights.find(f => f.id === flightId);
  if (!flight) return { success: false, message: "Flight not found." };
  const booking = {
    id: `BK-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`,
    type: 'flight',
    flightId: flight.id,
    name: `${flight.from}→${flight.to}`,
    airline: flight.airline,
    passenger: userDetails.name || 'Guest',
    date: userDetails.date || flight.date,
    time: flight.time,
    amount: Number(userDetails.price || flight.price || 0),
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem('mock:bookings');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(booking);
    localStorage.setItem('mock:bookings', JSON.stringify(arr));
  } catch (e) {}
  return { success: true, booking };
}

export function getFlights(){
  return sampleFlights;
}

export function getFlightById(id){
  return sampleFlights.find(f => f.id === Number(id));
}

// Generic product helpers: stores fall back to localStorage under keys like 'mock:products:hotel'
export function getProducts(type){
  try {
    if(type === 'hotel') return getHotels();
    if(type === 'car') return loadDemoCars();
    if(type === 'shuttle') return loadDemoShuttles();
    if(type === 'flight') return getFlights();
    const raw = localStorage.getItem('mock:products:' + type);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}

export function addProduct(type, payload){
  try {
    if(type === 'hotel') return addHotel(payload);
    if(type === 'car') return addCar(payload);
    if(type === 'shuttle') {
      const list = loadDemoShuttles();
      const nextId = Math.max(0, ...list.map(s=>Number(s.id)||0)) + 1;
      const toAdd = { id: nextId, ...payload };
      list.push(toAdd);
      try { localStorage.setItem('mock:shuttles', JSON.stringify(list)); } catch(e){}
      sampleShuttles = list;
      return toAdd;
    }
    if(type === 'flight') {
      const list = sampleFlights;
      const nextId = Math.max(0, ...list.map(s=>Number(s.id)||0)) + 1;
      const toAdd = { id: nextId, ...payload };
      list.push(toAdd);
      return toAdd;
    }
    const key = 'mock:products:' + type;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const nextId = Math.max(0, ...arr.map(i=>Number(i.id)||0)) + 1;
    const toAdd = { id: nextId, ...payload };
    arr.push(toAdd);
    localStorage.setItem(key, JSON.stringify(arr));
    return toAdd;
  } catch(e){ return null; }
}

export function updateProduct(type, id, patch){
  try {
    if(type === 'hotel') return updateHotel(id, patch);
    if(type === 'car') return updateCar(id, patch);
    if(type === 'shuttle'){
      const raw = localStorage.getItem('mock:shuttles');
      const arr = raw ? JSON.parse(raw) : ([]);
      const idx = arr.findIndex(x => String(x.id) === String(id));
      if(idx === -1) return null;
      arr[idx] = { ...arr[idx], ...patch };
      localStorage.setItem('mock:shuttles', JSON.stringify(arr));
      sampleShuttles = arr;
      return arr[idx];
    }
    if(type === 'flight'){
      const idx = sampleFlights.findIndex(x => String(x.id) === String(id));
      if(idx === -1) return null;
      sampleFlights[idx] = { ...sampleFlights[idx], ...patch };
      return sampleFlights[idx];
    }
    const key = 'mock:products:' + type;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(x => String(x.id) === String(id));
    if(idx === -1) return null;
    arr[idx] = { ...arr[idx], ...patch };
    localStorage.setItem(key, JSON.stringify(arr));
    return arr[idx];
  } catch(e){ return null; }
}
