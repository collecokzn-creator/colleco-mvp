import React, { useEffect, useMemo, useState } from 'react';
import { searchFlights, getFlights, bookFlight as mockBookFlight } from '../api/mockTravelApi';
import { bookFlight as serverBookFlight } from '../api/client';
import FlightCard from '../components/FlightCard';
import SeatSelector from '../components/SeatSelector';
import CalendarPrices from '../components/CalendarPrices';

export default function FlightBooking(){
  const [from, setFrom] = useState('Johannesburg');
  const [to, setTo] = useState('Durban');
  const [date, setDate] = useState('2025-10-11');
  const [passengers, setPassengers] = useState(1);
  const [results, setResults] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [status, setStatus] = useState(null);
  const [filter, setFilter] = useState({ airline: 'all', maxPrice: 0, stops: 'any' });
  const [sortBy, setSortBy] = useState('price');
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mock:priceAlerts')||'[]'); } catch(e){ return []; }
  });

  useEffect(()=>{ setAllFlights(getFlights()); }, []);

  function handleSearch(e){
    e?.preventDefault();
    const r = searchFlights({ from, to, date });
    setResults(r);
  }

  const airlines = useMemo(()=> Array.from(new Set(allFlights.map(f=>f.airline))), [allFlights]);

  const filtered = useMemo(()=>{
    let arr = results.slice();
    if(filter.airline !== 'all') arr = arr.filter(f=>f.airline===filter.airline);
    if(filter.maxPrice > 0) arr = arr.filter(f=>f.price <= Number(filter.maxPrice));
    if(sortBy === 'price') arr.sort((a,b)=>a.price-b.price);
    if(sortBy === 'time') arr.sort((a,b)=>a.time.localeCompare(b.time));
    return arr;
  }, [results, filter, sortBy]);

  async function handleBook(f){
    setStatus('booking');
    // Build payload for server booking API
    const payload = { from: f.from, to: f.to, date: f.date, price: f.price, currency: 'ZAR', customer: { name: 'Web User' } };
    try {
      const res = await serverBookFlight(payload);
      // serverBookFlight returns booking or checkout
      if(res && res.checkout && res.checkout.checkoutUrl){
        // Redirect to checkout (mock or Stripe)
        window.location.href = res.checkout.checkoutUrl;
        return;
      }
      // fallback to mock
      if(res && res.booking){
        setStatus('ok');
        setSelectedFlight(res.booking);
        try { window.__E2E_BOOKING = res.booking; } catch(e){}
        window.location.href = `/payment-success?bookingId=${encodeURIComponent(res.booking.id)}`;
        return;
      }
    } catch(e){
      // server may be offline; fallback to mock booking
      const m = mockBookFlight(f.id, { name: 'Web User', date: f.date, price: f.price });
      if(m && m.success && m.booking){
        setStatus('ok');
        try { window.__E2E_BOOKING = m.booking; } catch(e){}
        window.location.href = `/payment-success?bookingId=${encodeURIComponent(m.booking.id)}`;
        return;
      }
      setStatus('error');
    }
  }

  function openSeatSelector(f){ setSelectedFlight(f); setSeatModalOpen(true); }
  function confirmSeats(seats){ setSelectedSeats(seats); setSeatModalOpen(false); setStatus('seats-selected'); }

  function addPriceAlert(){
    const alert = { id: `PA-${Date.now()}`, from, to, date, createdAt: Date.now() };
    const next = [...priceAlerts, alert];
    setPriceAlerts(next); localStorage.setItem('mock:priceAlerts', JSON.stringify(next));
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Search Flights</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end">
        <label className="block"><div className="text-sm mb-1">From</div><input className="w-full p-2 border" value={from} onChange={e=>setFrom(e.target.value)} /></label>
        <label className="block"><div className="text-sm mb-1">To</div><input className="w-full p-2 border" value={to} onChange={e=>setTo(e.target.value)} /></label>
        <label className="block"><div className="text-sm mb-1">Date</div><input type="date" className="w-full p-2 border" value={date} onChange={e=>setDate(e.target.value)} /></label>
        <label className="block"><div className="text-sm mb-1">Passengers</div><input type="number" min={1} className="w-full p-2 border" value={passengers} onChange={e=>setPassengers(Number(e.target.value))} /></label>
        <div><button className="px-4 py-2 bg-brand-orange text-white rounded">Search</button></div>
      </form>

      <div className="flex gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <select value={filter.airline} onChange={e=>setFilter({...filter, airline: e.target.value})} className="p-2 border">
            <option value="all">All airlines</option>
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input placeholder="Max price" type="number" className="p-2 border" value={filter.maxPrice||''} onChange={e=>setFilter({...filter, maxPrice: e.target.value})} />
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="p-2 border">
            <option value="price">Sort by price</option>
            <option value="time">Sort by time</option>
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={()=>setCalendarOpen(!calendarOpen)} className="px-3 py-1 border rounded">Calendar</button>
          <button onClick={addPriceAlert} className="px-3 py-1 border rounded">Price Alert</button>
        </div>
      </div>

      {calendarOpen && <div className="mb-4"><CalendarPrices prices={{'2025-10-09':1200,'2025-10-10':1100,'2025-10-11':950,'2025-10-12':1300,'2025-10-13':1250}} /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(f => (
          <FlightCard key={f.id} flight={f} onSelect={(fl)=>setSelectedFlight(fl)} onBook={handleBook} />
        ))}
      </div>

      {selectedFlight && (
        <div className="mt-6 bg-white p-4 border rounded">
          <h3 className="font-semibold">Flight details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <div className="font-semibold">{selectedFlight.from} → {selectedFlight.to}</div>
              <div className="text-sm text-gray-600">{selectedFlight.airline} • {selectedFlight.date} {selectedFlight.time}</div>
              <div className="mt-2 text-sm">Baggage: 1 checked bag included. Check-in: 2h before departure. In-flight: Snacks & WiFi (selected routes).</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-brand-orange">ZAR {selectedFlight.price}</div>
              <div className="mt-3 flex gap-2 justify-end">
                <button onClick={()=>openSeatSelector(selectedFlight)} className="px-3 py-1 border rounded">Select Seat</button>
                <button onClick={()=>handleBook(selectedFlight)} className="px-3 py-1 bg-brand-orange text-white rounded">Book & Pay</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {seatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <SeatSelector occupied={['1-1','1-2']} onConfirm={(s)=>confirmSeats(s)} />
            <div className="mt-3 text-sm">Selected seats: {selectedSeats.join(', ')}</div>
            <div className="mt-3 text-right"><button onClick={()=>setSeatModalOpen(false)} className="px-3 py-1 border rounded">Close</button></div>
          </div>
        </div>
      )}

      {status==='booking' && <div className="mt-3 text-sm">Processing booking…</div>}
      {status==='ok' && <div className="mt-3 text-green-700">Booking started. Check your email for confirmation (demo).</div>}
      {status==='error' && <div className="mt-3 text-red-700">Booking failed. Try again.</div>}

    </div>
  );
}
