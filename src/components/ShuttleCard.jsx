import React from 'react';

export default function ShuttleCard({ shuttle, onSelect }){
  if(!shuttle) return null;
  return (
    <div className="border rounded p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{shuttle.route}</h3>
          <p className="text-sm text-gray-600">{shuttle.origin} → {shuttle.destination}</p>
          <p className="text-xs text-gray-500 mt-1">Provider: {shuttle.provider} • Vehicle: {shuttle.vehicle}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{shuttle.price} ZAR</div>
          <div className="text-xs text-gray-500">per seat</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-700">Times: {shuttle.departTimes.slice(0,4).join(', ')}</div>
        <button onClick={()=>onSelect && onSelect(shuttle)} className="px-3 py-1 bg-blue-600 text-white rounded">Select</button>
      </div>
    </div>
  );
}
