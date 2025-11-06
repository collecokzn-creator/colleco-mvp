import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHotels } from '../api/mockTravelApi';

export default function StaysList(){
  const [hotels, setHotels] = useState([]);
  useEffect(()=>{
    const p = getHotels();
    if(p && typeof p.then === 'function'){ p.then(list=>setHotels(list||[])).catch(()=>setHotels([])); } else setHotels(p||[]);
  },[]);
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Stays</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map(h => (
          <article key={h.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">{h.name}</div>
            <div className="text-sm text-gray-600">{h.location}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/plan-trip?dest=${encodeURIComponent(h.location||h.name||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
              <Link to={`/book/accommodation?hotelId=${encodeURIComponent(h.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
