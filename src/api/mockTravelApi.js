// src/api/mockTravelApi.js
// Mock travel API for demo and marketing-ready Trip Assist

const sampleHotels = [
  {
    id: 1,
    name: "Beekman Beach Resort",
    location: "Durban",
    availableDates: ["2025-10-11", "2025-10-12", "2025-10-13"],
    pricePerNight: 1800,
    amenities: ["Pool", "WiFi", "Breakfast"],
    image: "https://demo.beekman.com/beach-resort.jpg"
  },
  {
    id: 2,
    name: "Umhlanga Sands Hotel",
    location: "Umhlanga Rocks",
    availableDates: ["2025-10-11", "2025-10-12", "2025-10-13"],
    pricePerNight: 2200,
    amenities: ["Sea View", "Spa", "Bar"],
    image: "https://demo.beekman.com/umhlanga-sands.jpg"
  }
];

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

export function searchHotels({ location, startDate, endDate: _endDate }) {
  // Filter hotels by location and available dates
  return sampleHotels.filter(hotel =>
    hotel.location.toLowerCase().includes(location.toLowerCase()) &&
    hotel.availableDates.includes(startDate)
  );
}

export function searchFlights({ from, to, date }) {
  // Filter flights by route and date
  return sampleFlights.filter(flight =>
    flight.from.toLowerCase().includes(from.toLowerCase()) &&
    flight.to.toLowerCase().includes(to.toLowerCase()) &&
    flight.date === date
  );
}

export function bookHotel(hotelId, userDetails) {
  // Simulate booking
  const hotel = sampleHotels.find(h => h.id === hotelId);
  if (!hotel) return { success: false, message: "Hotel not found." };
  return {
    success: true,
    message: `Booked ${hotel.name} for ${userDetails.name} from ${userDetails.startDate} to ${userDetails.endDate}.`
  };
}

export function bookFlight(flightId, userDetails) {
  // Simulate booking
  const flight = sampleFlights.find(f => f.id === flightId);
  if (!flight) return { success: false, message: "Flight not found." };
  return {
    success: true,
    message: `Booked flight on ${flight.airline} for ${userDetails.name} at ${flight.time} on ${flight.date}.`
  };
}
