export const icons = {
  flight: "🛫",
  hotel: "🏨",
  car: "🚗",
  hike: "🥾",
  dining: "🍽️",
  activity: "🎉",
  default: "✨",
}

export const mockBookings = [
  {
    id: 1,
    ref: "CE-2024-001",
    clientName: "Alice Johnson",
    status: "Accepted",
    itineraryName: "Kruger Safari Adventure",
    items: [
      {
        id: 101,
        name: "Safari Game Drive",
        category: "activity",
        price: 1500,
        qty: 2,
        startTime: "06:00",
        endTime: "09:00",
        description: "Early morning game drive to spot the Big Five.",
      },
      {
        id: 102,
        name: "Safari Lodge",
        category: "hotel",
        price: 4500,
        qty: 2,
        startTime: "14:00",
        description: "Two nights stay in a luxury safari lodge.",
      },
    ],
  },
  {
    id: 2,
    ref: "CE-2024-002",
    clientName: "Bob Williams",
    status: "Sent",
    itineraryName: "Drakensberg Mountain Retreat",
    items: [
      {
        id: 201,
        name: "Guided Mountain Hike",
        category: "hike",
        price: 1200,
        qty: 4,
        startTime: "09:00",
        endTime: "13:00",
        description: "Explore the majestic peaks and valleys.",
      },
      {
        id: 202,
        name: "Picnic Lunch",
        category: "dining",
        price: 450,
        qty: 4,
        startTime: "13:00",
        endTime: "14:00",
        description: "Enjoy a curated picnic with local delicacies.",
      },
      {
        id: 203,
        name: "Stargazing",
        category: "activity",
        // No price for this item
        qty: 4,
        startTime: "20:00",
        endTime: "21:00",
        description: "A guided tour of the southern night sky.",
      },
    ],
  },
  {
    id: 3,
    ref: "CE-2024-003",
    clientName: "Charlie Brown",
    status: "Draft",
    itineraryName: "Cape Town City Tour",
    items: [
      { id: 301, name: "City Tour", category: "car", price: 800, qty: 1, startTime: "10:00", endTime: "13:00", description: "A guided tour of the city's main attractions." },
      { id: 302, name: "Museum Tickets", category: "activity", price: 300, qty: 1, startTime: "14:00", endTime: "16:00", description: "Entry to the Iziko South African Museum." },
    ],
  },
]

export const productCatalog = [
  { id: 101, name: "Safari Game Drive", category: "activity", price: 1500, qty: 1, description: "Early morning game drive to spot the Big Five." },
  { id: 102, name: "Safari Lodge", category: "hotel", price: 4500, qty: 1, description: "Two nights stay in a luxury safari lodge." },
  { id: 201, name: "Guided Mountain Hike", category: "hike", price: 1200, qty: 1, description: "Explore the majestic peaks and valleys." },
  { id: 202, name: "Picnic Lunch", category: "dining", price: 450, qty: 1, description: "Enjoy a curated picnic with local delicacies." },
  { id: 203, name: "Stargazing", category: "activity", qty: 1, description: "A guided tour of the southern night sky." },
  { id: 301, name: "City Tour", category: "car", price: 800, qty: 1, description: "A guided tour of the city's main attractions." },
  { id: 302, name: "Museum Tickets", category: "activity", price: 300, qty: 1, description: "Entry to the Iziko South African Museum." },
  { id: 401, name: "Return Flight CPT-JNB", category: "flight", price: 3500, qty: 1, description: "Economy class return flights." },
  { id: 402, name: "Car Rental", category: "car", price: 750, qty: 1, description: "Standard sedan for 3 days." },
]

export const mockItinerary = {
  title: "Adventure in Drakensberg",
  clientName: "John Doe",
  ref: "COL12345",
  days: [
    {
      day: 1, title: "Arrival & Check-In", start: "14:00", end: "18:00", description: "Check in at the lodge.", icon: "🏨", map: true },
    { day: 2, title: "Hiking Trail", start: "08:00", end: "16:00", description: "Guided hike.", icon: "🥾", map: true },
  ],
  inclusions: ["Accommodation", "Breakfast", "Guided Hike"],
  exclusions: ["Flights", "Travel insurance"],
};