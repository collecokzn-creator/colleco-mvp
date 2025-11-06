import React, { useEffect, useState } from 'react';
import { bookCar as serverBookCar } from '../api/client';
import { searchCars, getCars, bookCar as mockBookCar } from '../api/mockTravelApi';
import CarCard from '../components/CarCard';

export default function CarBooking(){
  const [location, setLocation] = useState('Durban');
  const [vehicleType, setVehicleType] = useState('');
  const [transmission, setTransmission] = useState('Both');
  const [pickupSame, setPickupSame] = useState(true);
  const [pickupLocation, setPickupLocation] = useState('Durban Airport');
  const [dropoffLocation, setDropoffLocation] = useState('Durban Airport');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('17:00');
  const [days, setDays] = useState(1);
  const [cars, setCars] = useState([]);
  const [selected, setSelected] = useState(null);
  const [extras, setExtras] = useState([]);
  const [status, setStatus] = useState(null);
  const [checkout, setCheckout] = useState(null);

  useEffect(()=>{
    const p = getCars();
    if(p && typeof p.then === 'function'){
      p.then(list=>setCars(list)).catch(()=>setCars([]));
    } else {
      setCars(p || []);
    }
  },[]);

  async function handleSearch(e){
    e && e.preventDefault();
    const res = searchCars({ location, vehicleType, transmission, pickupDate, dropoffDate });
    if(res && typeof res.then === 'function'){
      try { const list = await res; setCars(list || []); } catch(e){ setCars([]); }
    } else {
      setCars(res || []);
    }
  }

  function toggleExtra(extra){
    const idx = extras.findIndex(x=>x.id===extra.id);
    if(idx === -1) setExtras([...extras, extra]); else setExtras(extras.filter(x=>x.id!==extra.id));
  }

  async function handleBook(e){
    e && e.preventDefault();
    if(!selected) return setStatus('select_required');
    setStatus('loading');
  const pricePerDay = Number(selected.pricePerDay || selected.price || selected.pricePerDay || 0) || 0;
  const payload = { vehicleType: selected.vehicleType || `${selected.make} ${selected.model}`, days: Number(days), pricePerDay, currency: 'ZAR', customer: { name: 'Web User' }, extras, transmission, metadata: { pickup: { location: pickupSame ? pickupLocation : pickupLocation || selected.location, date: pickupDate, time: pickupTime }, dropoff: { location: dropoffLocation, date: dropoffDate, time: dropoffTime } } };
    // Try server booking first, fall back to mock
    try {
      const res = await serverBookCar(payload).catch(()=>null);
      if(res && res.booking){ setStatus('ok'); setCheckout(res.checkout || null); return; }
    } catch(e){}
    try {
      const demo = mockBookCar(selected.id, { ...payload, pricePerDay: selected.pricePerDay || selected.pricePerDay });
      if(demo && demo.success){ setStatus('ok'); setCheckout(null); return; }
    } catch(e){ console.error(e); }
    setStatus('error');
  }

  const sampleExtras = [ { id: 'ins', title: 'Basic Insurance', price: 120 }, { id: 'gps', title: 'GPS', price: 80 }, { id: 'child', title: 'Child Seat', price: 60 } ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Hire a Car</h1>
      <form onSubmit={handleSearch} className="space-y-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="p-2 border" />
          <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)} className="p-2 border">
            <option value="">Any type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
          </select>
          <select value={transmission} onChange={e=>setTransmission(e.target.value)} className="p-2 border">
            <option value="Both">Any transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
          <div className="col-span-1 md:col-span-1 flex items-center gap-2">
            <button type="submit" className="px-3 py-2 bg-gray-700 text-white rounded">Search</button>
          </div>
        </div>
      </form>

      <div className="mb-4 border rounded p-3">
        <h3 className="font-semibold">Pick-up & drop-off</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-sm">Pick-up location</label>
            <input value={pickupLocation} onChange={e=>setPickupLocation(e.target.value)} className="p-2 border w-full" />
          </div>
          <div>
            <label className="block text-sm">Drop-off location</label>
            <div className="flex items-center gap-2">
              <input value={dropoffLocation} onChange={e=>setDropoffLocation(e.target.value)} className="p-2 border w-full" disabled={pickupSame} />
              <label className="text-sm inline-flex items-center gap-2"><input type="checkbox" checked={pickupSame} onChange={(e)=>setPickupSame(e.target.checked)} /> Same as pickup</label>
            </div>
          </div>
          <div>
            <label className="block text-sm">Pick-up date</label>
            <input type="date" value={pickupDate} onChange={e=>setPickupDate(e.target.value)} className="p-2 border w-full" />
          </div>
          <div>
            <label className="block text-sm">Drop-off date</label>
            <input type="date" value={dropoffDate} onChange={e=>setDropoffDate(e.target.value)} className="p-2 border w-full" />
          </div>
          <div>
            <label className="block text-sm">Pick-up time</label>
            <input type="time" value={pickupTime} onChange={e=>setPickupTime(e.target.value)} className="p-2 border w-full" />
          </div>
          <div>
            <label className="block text-sm">Drop-off time</label>
            <input type="time" value={dropoffTime} onChange={e=>setDropoffTime(e.target.value)} className="p-2 border w-full" />
          </div>
        </div>
      </div>

      {/* keep dropoff in sync when user selects "Same as pickup" */}
      {pickupSame && (
        <SyncPickupEffect pickupLocation={pickupLocation} setDropoffLocation={setDropoffLocation} />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {cars.length===0 && <div className="text-gray-600">No cars found — try a different location or vehicle type.</div>}
          {cars.map(c => <CarCard key={c.id} car={c} onSelect={setSelected} />)}
        </div>
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Selection</h2>
          {!selected && <div className="text-sm text-gray-600">Select a car to see details and book.</div>}
          {selected && (
            <div className="mt-3">
              <h3 className="font-bold">{selected.make} {selected.model}</h3>
              <p className="text-sm text-gray-700">{selected.description}</p>
              <div className="mt-2">Price: <span className="font-semibold">{selected.pricePerDay} ZAR/day</span></div>
              <label className="block mt-2">Days<input type="number" min={1} value={days} onChange={e=>setDays(e.target.value)} className="w-24 p-1 border" /></label>
              <div className="mt-3">
                <div className="text-sm font-semibold">Extras</div>
                <div className="flex gap-2 mt-2">
                  {sampleExtras.map(ex => (
                    <button type="button" key={ex.id} onClick={()=>toggleExtra(ex)} className={`px-2 py-1 border rounded ${extras.find(x=>x.id===ex.id)?'bg-blue-600 text-white':''}`}>{ex.title} ({ex.price})</button>
                  ))}
                </div>
              </div>
              {/* booking validity: require pickup/dropoff dates and dropoff >= pickup */}
              {(() => {
                const pickup = pickupDate ? new Date(pickupDate) : null;
                const dropoff = dropoffDate ? new Date(dropoffDate) : null;
                const datesPresent = !!pickup && !!dropoff;
                const dropGEpickup = datesPresent ? (dropoff.getTime() >= pickup.getTime()) : false;
                const isValid = datesPresent && dropGEpickup;
                return (
                  <div className="mt-4">
                    <button onClick={handleBook} disabled={!isValid} className={`px-4 py-2 rounded text-white ${isValid ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}>Book now</button>
                    <div className="text-xs text-gray-600 mt-2">Note: This is a demo — provider may require a deposit or full payment at checkout. Check payment details on confirmation.</div>
                    {!datesPresent && <div className="mt-2 text-sm text-red-600">Please set both pick-up and drop-off dates to proceed.</div>}
                    {datesPresent && !dropGEpickup && <div className="mt-2 text-sm text-red-600">Drop-off must be the same or after pick-up.</div>}
                  </div>
                );
              })()}
            </div>
          )}

          {status==='loading' && <div className="mt-3 text-gray-600">Booking...</div>}
          {status==='select_required' && <div className="mt-3 text-red-600">Please select a car first.</div>}
          {status==='ok' && checkout && <div className="mt-3 text-green-700">Proceed to checkout: <a href={checkout.checkoutUrl}>{checkout.checkoutUrl}</a></div>}
          {status==='ok' && !checkout && <div className="mt-3 text-green-700">Booking confirmed (demo)</div>}
          {status==='error' && <div className="mt-3 text-red-700">Booking failed</div>}
        </div>
      </div>
    </div>
  );
}

function SyncPickupEffect({ pickupLocation, setDropoffLocation }){
  // tiny effect component to keep dropoffLocation synced when "Same as pickup" is checked
  React.useEffect(()=>{
    if(pickupLocation) setDropoffLocation(pickupLocation);
  }, [pickupLocation, setDropoffLocation]);
  return null;
}
