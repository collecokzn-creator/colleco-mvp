import React, { useState } from 'react';
import BookingNav from '../components/BookingNav';
import { bookAccommodation } from '../api/client';

export default function AccommodationBooking(){
  const [hotelName, setHotelName] = useState('');
  const [nights, setNights] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [status, setStatus] = useState(null);
  const [checkout, setCheckout] = useState(null);

  async function handleSubmit(e){
    e.preventDefault(); setStatus('loading');
    try {
      const body = await bookAccommodation({ hotelName, nights: Number(nights), unitPrice: Number(unitPrice), currency: 'ZAR', customer: { name: 'Web User' } });
      setStatus('ok');
      setCheckout(body.checkout || null);
    } catch(e){ setStatus('error'); }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <BookingNav />
      <h1 className="text-3xl font-bold mb-4 text-brand-brown">Accommodation Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <label className="block">Hotel name<input value={hotelName} onChange={e=>setHotelName(e.target.value)} className="w-full p-2 border" /></label>
        <label className="block">Nights<input type="number" value={nights} onChange={e=>setNights(e.target.value)} className="w-full p-2 border" /></label>
        <label className="block">Price per night<input type="number" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} className="w-full p-2 border" /></label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Book</button>
      </form>
      {status==='ok' && checkout && <div className="mt-4">Checkout: <a href={checkout.checkoutUrl}>{checkout.checkoutUrl}</a></div>}
      {status==='ok' && !checkout && <div className="mt-4 text-green-700">Booking confirmed (no payment required)</div>}
      {status==='error' && <div className="mt-4 text-red-700">Booking failed</div>}
    </div>
  );
}
