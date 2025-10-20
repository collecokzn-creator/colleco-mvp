import React from "react";

const mockFeed = [
  { id: 1, type: "Partner", message: "Beekman Holiday added 3 new units.", time: "2m ago" },
  { id: 2, type: "Booking", message: "Nomsa Dlamini confirmed booking for Umhlanga Sands.", time: "10m ago" },
  { id: 3, type: "Compliance", message: "Margate Retreats missing COI document.", time: "1h ago" },
];

const typeColors = {
  Partner: "bg-brand-gold text-brand-russty",
  Booking: "bg-brand-orange text-white",
  Compliance: "bg-cream-hover text-brand-russty",
};

const ActivityFeed = () => (
  <div className="bg-white rounded-2xl shadow-md p-4">
  <h3 className="font-medium text-lg text-brand-russty mb-3">Activity Feed</h3>
    <ul className="space-y-3">
      {mockFeed.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${typeColors[item.type]}`}>{item.type}</span>
          <span className="text-sm text-brand-russty flex-1">{item.message}</span>
          <span className="text-xs text-brand-russty opacity-50">{item.time}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ActivityFeed;
