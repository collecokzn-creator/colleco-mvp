import React, { useEffect, useState } from 'react';
import { getShuttles, searchShuttles, bookShuttle as mockBookShuttle } from '../api/mockTravelApi';
import { bookShuttle as serverBookShuttle } from '../api/client';
import ShuttleCard from '../components/ShuttleCard';

export default function ShuttleBooking(){
  const [origin, setOrigin] = useState('King Shaka International Airport');
  const [destination, setDestination] = useState('Durban City Centre');
  const [shuttles, setShuttles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pickupTime, setPickupTime] = useState('');
  const [seats, setSeats] = useState(1);
  const [status, setStatus] = useState(null);
  const [checkout, setCheckout] = useState(null);

  useEffect(()=>{
    const p = getShuttles();
    if(p && typeof p.then === 'function'){ p.then(list=>setShuttles(list)).catch(()=>setShuttles([])); }
    else setShuttles(p||[]);
  },[]);

  async function handleSearch(e){
    e && e.preventDefault();
    const p = searchShuttles({ origin, destination });
    if(p && typeof p.then === 'function'){ try{ const list = await p; setShuttles(list||[]); }catch(e){ setShuttles([]);} }
    else setShuttles(p||[]);
  }

  async function handleBook(e){
    e && e.preventDefault();
    if(!selected) return setStatus('select');
    setStatus('loading');
    const payload = { shuttleId: selected.id, pickupTime: pickupTime || selected.departTimes[0], seats: Number(seats||1), amount: Number(selected.price||0) * Number(seats||1), currency: 'ZAR', customer: { name: 'Web User' } };
    try {
      const res = await serverBookShuttle(payload).catch(()=>null);
      if(res && res.booking){ setStatus('ok'); setCheckout(res.checkout || null); return; }
    } catch(e){}
    try {
      const demo = mockBookShuttle(selected.id, { pickupTime: payload.pickupTime, seats: payload.seats, name: payload.customer.name, amount: payload.amount, currency: payload.currency });
      if(demo && demo.success){ setStatus('ok'); setCheckout(null); return; }
    } catch(e){ console.error(e); }
    setStatus('error');
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Book a Shuttle</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input className="p-2 border" value={origin} onChange={e=>setOrigin(e.target.value)} />
        <input className="p-2 border" value={destination} onChange={e=>setDestination(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-gray-800 text-white rounded" type="submit">Search</button>
        </div>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-3">
          {shuttles.length===0 && <div className="text-gray-600">No shuttles found.</div>}
          {shuttles.map(s => <ShuttleCard key={s.id} shuttle={s} onSelect={setSelected} />)}
        </div>
        <div className="md:col-span-2 border p-4 rounded">
          <h2 className="font-semibold">Booking</h2>
          {!selected && <div className="text-sm text-gray-600">Select a shuttle to begin booking.</div>}
          {selected && (
            <div className="mt-3">
              <h3 className="font-bold">{selected.route}</h3>
              <p className="text-sm text-gray-700">{selected.description}</p>
              <label className="block mt-2">Pickup time
                <select value={pickupTime||selected.departTimes[0]} onChange={e=>setPickupTime(e.target.value)} className="w-64 p-1 border">
                  { (selected.departTimes||[]).map(t => <option key={t} value={t}>{t}</option>) }
                </select>
              </label>
              <label className="block mt-2">Seats<input type="number" min={1} value={seats} onChange={e=>setSeats(e.target.value)} className="w-24 p-1 border" /></label>
              <div className="mt-4">
                <button onClick={handleBook} className="px-4 py-2 bg-green-600 text-white rounded">Book & Pay</button>
              </div>
            </div>
          )}

          {status==='loading' && <div className="mt-3 text-gray-600">Booking...</div>}
          {status==='select' && <div className="mt-3 text-red-600">Please select a shuttle first.</div>}
          {status==='ok' && checkout && <div className="mt-3 text-green-700">Proceed to checkout: <a href={checkout.checkoutUrl}>{checkout.checkoutUrl}</a></div>}
          {status==='ok' && !checkout && <div className="mt-3 text-green-700">Booking confirmed (demo)</div>}
          {status==='error' && <div className="mt-3 text-red-700">Booking failed</div>}
        </div>
      </div>
    </div>
  );
}
