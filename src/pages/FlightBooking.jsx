import React, { useState } from 'react';
import { bookFlight, subscribeToFlightUpdates, getFlight } from '../api/client';

export default function FlightBooking(){
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [roundTrip, setRoundTrip] = useState(false);
  const [flightItems, setFlightItems] = useState([]);

  async function handleSubmit(e){
    e.preventDefault(); setStatus('loading');
    try {
      const body = await bookFlight({ from, to, date, price: Number(price), currency: 'ZAR', customer: { name: 'Web User' }, returnFlight: roundTrip && returnDate ? { from: to, to: from, date: returnDate, price: Number(price) } : undefined });
      setStatus('ok'); setCheckout(body.checkout || null);
      if (body && body.booking && Array.isArray(body.booking.items)) setFlightItems(body.booking.items.filter(i=>i.type==='flight'));
    } catch(e){ setStatus('error'); }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Book Flight</h1>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <label>From<input value={from} onChange={e=>setFrom(e.target.value)} className="w-full p-2 border" /></label>
        <label>To<input value={to} onChange={e=>setTo(e.target.value)} className="w-full p-2 border" /></label>
        <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border" /></label>
        <label className="block"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={roundTrip} onChange={(e)=>setRoundTrip(e.target.checked)} /> Round-trip</label></label>
        {roundTrip && (
          <label>Return Date<input type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)} className="w-full p-2 border" /></label>
        )}
        <label>Price<input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full p-2 border" /></label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Book</button>
      </form>
      {status==='ok' && checkout && <div className="mt-4">Checkout: <a href={checkout.checkoutUrl}>{checkout.checkoutUrl}</a></div>}
      {status==='ok' && !checkout && <div className="mt-4 text-green-700">Booking confirmed (no payment required)</div>}
      {status==='error' && <div className="mt-4 text-red-700">Booking failed</div>}
      {flightItems.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Flights</h3>
          {flightItems.map(it => (
            <div key={it.id} className="flex items-center gap-3">
              <div>{it.name} — <strong>{it.status || 'Scheduled'}</strong></div>
              <button onClick={()=>{
                // subscribe to SSE updates
                subscribeToFlightUpdates((data)=>{
                  if(data && data.item && data.item.id === it.id){
                    setFlightItems(prev => prev.map(x => x.id===it.id ? { ...x, status: data.item.status } : x));
                  }
                });
              }} className="px-2 py-1 border rounded text-sm">Monitor</button>
              <button onClick={async ()=>{ try { const f = await getFlight(it.id); setFlightItems(prev => prev.map(x => x.id===it.id ? { ...x, status: f.item.status } : x)); } catch(e){} }} className="px-2 py-1 border rounded text-sm">Refresh</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
