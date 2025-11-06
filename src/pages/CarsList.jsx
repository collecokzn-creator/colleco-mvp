import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../api/mockTravelApi';

export default function CarsList(){
  const [cars, setCars] = useState([]);
  useEffect(()=>{
    const p = getCars();
    if(p && typeof p.then === 'function'){ p.then(list=>setCars(list||[])).catch(()=>setCars([])); } else setCars(p||[]);
  },[]);
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Car Hire</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cars.map(c => (
          <article key={c.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">{c.make} {c.model}</div>
            <div className="text-sm text-gray-600">{c.vehicleType} • {c.location}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/plan-trip?category=Transport&city=${encodeURIComponent(c.location||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
              <Link to={`/book/car?carId=${encodeURIComponent(c.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
