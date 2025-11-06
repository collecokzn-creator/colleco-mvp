import React from 'react';

export default function CalendarPrices({ prices = {} }){
  // prices: { '2025-10-11': 1200, ... }
  const days = Object.keys(prices).sort();
  return (
    <div className="p-3 bg-white border rounded">
      <div className="text-sm font-semibold mb-2">Price calendar (mock)</div>
      <div className="grid grid-cols-7 gap-2 text-xs">
        {days.map(d => (
          <div key={d} className="p-2 border rounded text-center">
            <div className="font-semibold">{new Date(d).getDate()}</div>
            <div className="text-brand-orange">ZAR {prices[d]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
