import React from "react";

export default function ItineraryDay({ day, date, children }) {
  return (
    <div className="rounded border border-cream-border bg-cream p-4 text-brand-brown">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">Day {day}</h4>
        {date ? <span className="text-sm text-brand-brown/70">{date}</span> : null}
      </div>
      <div className="space-y-3" role="list" aria-label={`Itinerary items for day ${day}`}>{children}</div>
    </div>
  );
}
