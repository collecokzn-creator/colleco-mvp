import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { bookShuttle } from '../api/mockTravelApi';

export default function ShuttleRequestModal({ open, shuttle, onClose, onBooked }){
  const [name, setName] = useState('');
  const [seats, setSeats] = useState(1);
  const [pickupPoint, setPickupPoint] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [geoSuggestions, setGeoSuggestions] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState('');
  const geoTimer = useRef(null);

  // recent pickups stored in localStorage to provide autocomplete suggestions
  const recentKey = 'mock:recentPickups';
  const [recentPickups, setRecentPickups] = useState([]);
  useEffect(()=>{
    try { const raw = localStorage.getItem(recentKey); setRecentPickups(raw ? JSON.parse(raw) : []); } catch(e){ setRecentPickups([]); }
  }, [open]);

  useEffect(()=>{
    if(open){
      setName(''); setSeats(1);
      setPickupPoint('');
      setPickupTime(shuttle && shuttle.departTimes && shuttle.departTimes[0] ? shuttle.departTimes[0] : '');
      setError(null);
      setSuggestionsVisible(false);
      setPickupCoords(null);
      setGeoSuggestions([]);
      setGeoLoading(false);
      setSchedule(false);
      setDate('');
    }
  },[open, shuttle]);


  const saveRecentPickup = (val) => {
    try {
      const raw = localStorage.getItem(recentKey);
      const arr = raw ? JSON.parse(raw) : [];
      const dedup = [val, ...arr.filter(a => a !== val)].slice(0,8);
      localStorage.setItem(recentKey, JSON.stringify(dedup));
    } catch(e){}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const scheduledAt = schedule && date ? new Date(`${date}T${pickupTime || '09:00'}`) : null;
      const payload = { name, seats, pickupPoint, pickupTime, pickupCoords, scheduledAt: scheduledAt ? scheduledAt.toISOString() : null, amount: (shuttle && shuttle.price ? Number(shuttle.price) * Number(seats) : 0), currency: 'ZAR' };
      const res = await Promise.resolve(bookShuttle(shuttle.id, payload));
      setSubmitting(false);
      if(res && res.success){
        saveRecentPickup(pickupPoint || (shuttle && shuttle.origin) || '');
        onBooked && onBooked(res.booking);
      } else {
        setError((res && res.message) ? res.message : 'Unable to create booking');
      }
    } catch(err){
      setSubmitting(false);
      setError(err && err.message ? err.message : 'Booking failed');
    }
  };

  const baseSuggestions = useMemo(() => {
    const arr = [];
    if(shuttle && shuttle.origin) arr.push(shuttle.origin);
    if(shuttle && shuttle.destination) arr.push(shuttle.destination);
    return arr.concat(recentPickups || []);
  }, [shuttle, recentPickups]);

  // filtered suggestions combine local base suggestions and geo suggestions
  const filtered = useMemo(() => {
    const q = String(pickupPoint||'').toLowerCase();
    const locals = (!q) ? baseSuggestions.slice(0,6) : baseSuggestions.filter(s => String(s||'').toLowerCase().includes(q)).slice(0,6);
    const geo = geoSuggestions || [];
    return { locals, geo };
  }, [pickupPoint, baseSuggestions, geoSuggestions]);

  const chooseSuggestion = (s) => {
    if(typeof s === 'string'){
      setPickupPoint(s);
      setPickupCoords(null);
    } else if(s && s.lat && s.lon){
      setPickupPoint(s.display_name || `${s.lat},${s.lon}`);
      setPickupCoords({ lat: Number(s.lat), lng: Number(s.lon) });
    }
    setSuggestionsVisible(false);
  };

  // debounce geocoding: query Nominatim when input pauses
  useEffect(()=>{
    if(!pickupPoint || pickupPoint.length < 3) { setGeoSuggestions([]); return; }
    if(geoTimer.current) clearTimeout(geoTimer.current);
    geoTimer.current = setTimeout(async ()=>{
      try {
        setGeoLoading(true);
        const q = encodeURIComponent(pickupPoint);
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${q}&addressdetails=0`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const json = await res.json();
        setGeoSuggestions(Array.isArray(json) ? json : []);
      } catch(e){ setGeoSuggestions([]); }
      setGeoLoading(false);
    }, 600);
    return ()=>{ if(geoTimer.current) clearTimeout(geoTimer.current); };
  }, [pickupPoint]);

  // small map click handler component
  function ClickPicker(){
    useMapEvents({ click(e){ setPickupCoords({ lat: e.latlng.lat, lng: e.latlng.lng }); setPickupPoint(`Pinned: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`); } });
    return null;
  }

  if(!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold">Request a ride — {shuttle ? shuttle.route : ''}</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3" autoComplete="off">
          <div>
            <label className="block text-sm text-gray-700">Your name</label>
            <input name="name" className="w-full border px-3 py-2 rounded" value={name} onChange={e=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Pickup point</label>
            <div className="relative">
              <input name="pickup" className="w-full border px-3 py-2 rounded" value={pickupPoint} onChange={e=>{ setPickupPoint(e.target.value); setSuggestionsVisible(true); }} placeholder={shuttle && shuttle.origin ? shuttle.origin : ''} required />
              {suggestionsVisible && (
                <ul className="absolute left-0 right-0 bg-white border mt-1 rounded max-h-48 overflow-auto z-50">
                  {filtered.geo && filtered.geo.length > 0 && (
                    <>
                      {filtered.geo.map(s => (
                        <li key={s.place_id} onMouseDown={(ev)=>{ ev.preventDefault(); chooseSuggestion(s); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{s.display_name}</li>
                      ))}
                      <li className="px-3 py-1 text-xs text-gray-500">Suggested places</li>
                    </>
                  )}
                  {filtered.locals && filtered.locals.length > 0 && filtered.locals.map(s => (
                    <li key={s} onMouseDown={(ev)=>{ ev.preventDefault(); chooseSuggestion(s); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{s}</li>
                  ))}
                  {geoLoading && <li className="px-3 py-2 text-sm text-gray-500">Looking up places…</li>}
                </ul>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Seats</label>
              <input type="number" name="seats" min="1" max={shuttle && shuttle.capacity ? shuttle.capacity : 8} className="w-full border px-3 py-2 rounded" value={seats} onChange={e=>setSeats(Math.max(1, Number(e.target.value||1)))} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Pickup time</label>
              <select name="pickupTime" className="w-full border px-3 py-2 rounded" value={pickupTime} onChange={e=>setPickupTime(e.target.value)}>
                {(shuttle && shuttle.departTimes ? shuttle.departTimes : []).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Estimated: {shuttle && shuttle.price ? `ZAR ${Number(shuttle.price) * Number(seats)}` : '—'}</div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
              <button type="submit" disabled={submitting} className={`px-3 py-2 rounded text-white ${submitting ? 'bg-gray-400' : 'bg-brand-orange'}`}>{submitting ? 'Booking…' : 'Request Ride'}</button>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
        {/* Small map preview for picking/tweaking pickup coordinates */}
        <div className="mt-4">
          <div className="text-sm mb-2 text-gray-700">Map preview (click to set pickup)</div>
          <div className="h-40 border rounded overflow-hidden">
            <MapContainer center={pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : (shuttle && shuttle.originLat ? [shuttle.originLat, shuttle.originLng] : [-29.8587,31.0436])} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickPicker />
              {pickupCoords && <Marker position={[pickupCoords.lat, pickupCoords.lng]} />}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
