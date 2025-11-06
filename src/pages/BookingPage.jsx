import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AccommodationBooking from './AccommodationBooking';
import FlightBooking from './FlightBooking';
import CarBooking from './CarBooking';
import ShuttleBooking from './ShuttleBooking';

export default function BookingPage(){
  const [searchParams] = useSearchParams();
  const initial = searchParams.get('type') || 'accommodation';
  const [type, setType] = useState(initial);

  const offerings = [
    { key: 'accommodation', label: 'Accommodation' },
    { key: 'flight', label: 'Flights' },
    { key: 'car', label: 'Car Hire' },
    { key: 'shuttle', label: 'Shuttle Service' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Book Now</h1>
        <p className="text-sm text-brand-brown/70">Choose a product below to get started.</p>
      </div>
      <div className="flex gap-3 mb-6">
        {offerings.map(o => (
          <button key={o.key} onClick={() => setType(o.key)} className={`px-4 py-2 rounded ${type===o.key? 'bg-brand-orange text-white':'border bg-white text-brand-brown'}`}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow p-4">
        {type === 'accommodation' && <AccommodationBooking />}
        {type === 'flight' && <FlightBooking />}
        {type === 'car' && <CarBooking />}
        {type === 'shuttle' && <ShuttleBooking />}
      </div>

      <div className="mt-6 text-sm text-brand-brown/70">You can also visit specific booking pages: <Link to="/book/accommodation" className="text-brand-orange underline">Accommodation</Link> · <Link to="/book/flight" className="text-brand-orange underline">Flights</Link> · <Link to="/book/car" className="text-brand-orange underline">Car Hire</Link></div>
    </div>
  );
}
