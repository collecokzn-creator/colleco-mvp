import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Plane, Car, Bus } from 'lucide-react';

export default function Book() {
  const tiles = [
    { title: 'Accommodation', desc: 'Hotels, lodges and places to stay', to: '/book/accommodation', icon: BedDouble },
    { title: 'Flights', desc: 'Search and book flights quickly', to: '/book/flight', icon: Plane },
    { title: 'Car Hire', desc: 'Self drive or chauffeured vehicle hire', to: '/book/car', icon: Car },
    { title: 'Shuttle & Transfers', desc: 'Airport shuttles and local transfer services', to: '/transfers', icon: Bus }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Book Now</h1>
      <p className="text-sm text-brand-brown/70 mb-6">Choose what you want to book — we’ll walk you through the details and pricing.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiles.map(t => (
          <article key={t.to} className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded bg-cream-border/20"><t.icon className="w-6 h-6 text-brand-orange" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="text-sm text-brand-brown/70 mt-1">{t.desc}</p>
                <div className="mt-3">
                  <Link to={t.to} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-orange text-white text-sm">Choose {t.title}</Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
