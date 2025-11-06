import React from 'react';

export default function FlightCard({ flight, onSelect, onBook }){
  if(!flight) return null;
  return (
    <div className="border rounded p-3 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{flight.from} → {flight.to}</div>
          <div className="text-sm text-gray-600">{flight.airline} • {flight.date} {flight.time}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">From</div>
          <div className="font-bold text-brand-orange">ZAR {flight.price}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={()=>onSelect && onSelect(flight)} className="px-3 py-1 border rounded text-sm">Details</button>
        <button onClick={()=>onBook && onBook(flight)} className="px-3 py-1 bg-brand-orange text-white rounded text-sm">Book</button>
      </div>
    </div>
  );
}
