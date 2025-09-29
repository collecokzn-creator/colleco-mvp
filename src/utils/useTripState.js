import { useLocalStorageState } from "../useLocalStorageState";

export function useTripState() {
  return useLocalStorageState("trip", { days: {}, memories: {} });
}

export function addItemToDay(trip, day, item) {
  const d = String(day);
  const current = trip.days[d] || [];
  // avoid duplicates by id if present
  if (item?.id && current.some((x) => x.id === item.id)) return trip;
  const next = { ...trip, days: { ...trip.days, [d]: [...current, item] } };
  return next;
}

export function removeItemFromDay(trip, day, itemId) {
  const d = String(day);
  const current = trip.days[d] || [];
  const next = { ...trip, days: { ...trip.days, [d]: current.filter((x) => x.id !== itemId) } };
  return next;
}

export function setMemory(trip, day, text) {
  const d = String(day);
  return { ...trip, memories: { ...trip.memories, [d]: text } };
}

export function computeProgress(trip, selectionCount = 0) {
  const hasItineraryItems = Object.values(trip?.days || {}).some((arr) => arr && arr.length > 0);
  return [
    { label: "Select products (Basket)", done: selectionCount > 0 },
    { label: "Draft itinerary", done: hasItineraryItems },
    { label: "Confirm bookings & pay", done: false },
  ];
}
