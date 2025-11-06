import React, { useEffect, useState } from "react";
import globePng from "./assets/Globeicon.png";
import { Link } from 'react-router-dom';
import { getHotels, getFlights, getShuttles, getCars } from './api/mockTravelApi';

function SmallList({ title, items = [], renderItem }){
  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it, idx) => (
          <div key={it.id || idx} className="border rounded p-3 bg-white">
            {renderItem(it)}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const h = getHotels();
    if (h && typeof h.then === 'function') h.then(list => setHotels(list || [])).catch(()=>setHotels([])); else setHotels(h || []);
    const f = getFlights();
    if (f && typeof f.then === 'function') f.then(list => setFlights(list || [])).catch(()=>setFlights([])); else setFlights(f || []);
    const s = getShuttles();
    if (s && typeof s.then === 'function') s.then(list => setShuttles(list || [])).catch(()=>setShuttles([])); else setShuttles(s || []);
    const c = getCars();
    if (c && typeof c.then === 'function') c.then(list => setCars(list || [])).catch(()=>setCars([])); else setCars(c || []);
  }, []);

  return (
    <section className="relative px-0 py-10">
      <div className="max-w-6xl w-full">
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-orange mb-4 text-left">
            Plan unforgettable group adventures
          </h1>
          <p className="text-brand-russty text-lg max-w-2xl text-left mb-6">
            CollEco Travel makes trip planning effortless—co-create itineraries, generate quotes,
            collect payments, and collaborate with partners, all in one.
          </p>
          <div className="flex gap-3">
            <Link to="/plan-trip" className="px-4 py-2 bg-brand-orange text-white rounded">Plan a trip</Link>
            <Link to="/book" className="px-4 py-2 border border-brand-orange text-brand-orange rounded">Book now</Link>
          </div>
        </div>

        <SmallList title="Featured Stays" items={hotels.slice(0,4)} renderItem={(h)=> (
          <>
            <div className="font-semibold">{h.name}</div>
            <div className="text-sm text-gray-600">{h.location} • {h.amenities && h.amenities.slice(0,2).join(', ')}</div>
            <div className="mt-2"><span className="font-bold">{h.pricePerNight} ZAR</span> / night</div>
            <div className="mt-2"><Link to="/book/accommodation" className="text-brand-orange underline">Book stay</Link></div>
          </>
        )} />

        <SmallList title="Popular Flights" items={flights.slice(0,4)} renderItem={(f)=> (
          <>
            <div className="font-semibold">{f.from} → {f.to}</div>
            <div className="text-sm text-gray-600">{f.airline} • {f.time} • {f.date}</div>
            <div className="mt-2"><span className="font-bold">{f.price} ZAR</span></div>
            <div className="mt-2"><Link to="/book/flight" className="text-brand-orange underline">Book flight</Link></div>
          </>
        )} />

        <SmallList title="Shuttle Services" items={shuttles.slice(0,4)} renderItem={(s)=> (
          <>
            <div className="font-semibold">{s.route}</div>
            <div className="text-sm text-gray-600">{s.origin} → {s.destination}</div>
            <div className="mt-2">Times: {s.departTimes && s.departTimes.slice(0,3).join(', ')}</div>
            <div className="mt-2"><span className="font-bold">{s.price} ZAR</span></div>
            <div className="mt-2"><Link to="/book" className="text-brand-orange underline">Book shuttle</Link></div>
          </>
        )} />

        <SmallList title="Car Hire" items={cars.slice(0,4)} renderItem={(c)=> (
          <>
            <div className="font-semibold">{c.make} {c.model}</div>
            <div className="text-sm text-gray-600">{c.vehicleType} • {c.location}</div>
            <div className="mt-2"><span className="font-bold">{c.pricePerDay} ZAR</span> / day</div>
            <div className="mt-2"><Link to="/book/car" className="text-brand-orange underline">Hire car</Link></div>
          </>
        )} />

      </div>
      <img
        src={globePng}
        alt="CollEco Bird Logo"
        className="absolute right-8 top-1/2 -translate-y-1/2 h-40 w-auto opacity-90"
        width={160}
        height={160}
      />
    </section>
  );
}