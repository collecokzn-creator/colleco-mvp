import React from "react";

export default function ItineraryDay({ day, date: _date, children }) {
  return (
    <div className="text-brand-brown">
      <div className="space-y-3" role="list" aria-label={`Itinerary items for day ${day}`}>{children}</div>
    </div>
  );
}
