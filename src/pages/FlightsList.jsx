import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFlights } from '../api/mockTravelApi';

export default function FlightsList(){
  const [flights, setFlights] = useState([]);
  useEffect(()=>{
    const p = getFlights();
    if(p && typeof p.then === 'function'){ p.then(list=>setFlights(list||[])).catch(()=>setFlights([])); } else setFlights(p||[]);
  },[]);
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Flights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.map(f => (
          <article key={f.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">{f.from} → {f.to}</div>
            <div className="text-sm text-gray-600">{f.airline} • {f.date} {f.time}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/plan-trip?tab=events&from=${encodeURIComponent(f.from||'')}&to=${encodeURIComponent(f.to||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
              <Link to={`/book/flight?flightId=${encodeURIComponent(f.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
