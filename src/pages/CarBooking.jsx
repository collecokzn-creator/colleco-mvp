import React, { useState } from 'react';
import { bookCar } from '../api/client';

export default function CarBooking(){
  const [vehicleType, setVehicleType] = useState('SUV');
  const [days, setDays] = useState(1);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [status, setStatus] = useState(null);
  const [checkout, setCheckout] = useState(null);

  async function handleSubmit(e){
    e.preventDefault(); setStatus('loading');
    try {
      const body = await bookCar({ vehicleType, days: Number(days), pricePerDay: Number(pricePerDay), currency: 'ZAR', customer: { name: 'Web User' } });
      setStatus('ok'); setCheckout(body.checkout || null);
    } catch(e){ setStatus('error'); }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Hire a Car</h1>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <label>Vehicle Type<input value={vehicleType} onChange={e=>setVehicleType(e.target.value)} className="w-full p-2 border" /></label>
        <label>Days<input type="number" value={days} onChange={e=>setDays(e.target.value)} className="w-full p-2 border" /></label>
        <label>Price per day<input type="number" value={pricePerDay} onChange={e=>setPricePerDay(e.target.value)} className="w-full p-2 border" /></label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Hire</button>
      </form>
      {status==='ok' && checkout && <div className="mt-4">Checkout: <a href={checkout.checkoutUrl}>{checkout.checkoutUrl}</a></div>}
      {status==='ok' && !checkout && <div className="mt-4 text-green-700">Booking confirmed (no payment required)</div>}
      {status==='error' && <div className="mt-4 text-red-700">Booking failed</div>}
    </div>
  );
}
