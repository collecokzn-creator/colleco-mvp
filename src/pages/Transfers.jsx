import React, { useState } from "react";
import { Link } from 'react-router-dom';

function Breadcrumbs() {
  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-gray-600">
        <li><Link to="/" className="hover:text-brand-orange">Home</Link></li>
        <li>/</li>
        <li><Link to="/packages" className="hover:text-brand-orange">Packages</Link></li>
        <li>/</li>
        <li className="text-brand-brown font-semibold">Transfers</li>
      </ol>
    </nav>
  );
}

export default function Transfers() {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pax, setPax] = useState(1);
  const [bookingType, setBookingType] = useState("instant"); // "instant" or "prearranged"
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'searching', 'matched', 'accepted', 'en-route', 'arrived', 'completed'

  async function submitRequest(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('searching');
    
    try {
      const payload = {
        pickup,
        dropoff,
        date: bookingType === 'instant' ? new Date().toISOString() : date,
        time: bookingType === 'instant' ? new Date().toISOString() : time,
        pax,
        bookingType
      };
      
      const res = await fetch('/api/transfers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setRequest(data.request);
        setStatus('matched');
        
        // Poll for status updates
        pollStatus(data.request.id);
      } else {
        setStatus('error');
      }
    } catch (e) {
      console.error('[transfers] request failed', e);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }
  
  async function pollStatus(requestId) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transfers/request/${requestId}`);
        const data = await res.json();
        
        if (data.ok && data.request) {
          setRequest(data.request);
          setStatus(data.request.status);
          
          if (data.request.status === 'completed' || data.request.status === 'cancelled') {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error('[transfers] status poll failed', e);
      }
    }, 3000);
    
    // Clear after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Breadcrumbs />
      <div className="mb-4">
        <Link to="/book" className="text-sm text-brand-brown/70 hover:underline">← Back to booking options</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4 text-brand-orange">Request a Transfer</h1>
      
      {/* Booking Type Toggle */}
      <div className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => setBookingType('instant')}
          className={`flex-1 px-4 py-2 rounded font-semibold border-2 transition ${
            bookingType === 'instant' 
              ? 'bg-brand-orange text-white border-brand-orange' 
              : 'bg-white text-brand-brown border-gray-300'
          }`}
        >
          🚗 Instant Request
        </button>
        <button
          type="button"
          onClick={() => setBookingType('prearranged')}
          className={`flex-1 px-4 py-2 rounded font-semibold border-2 transition ${
            bookingType === 'prearranged' 
              ? 'bg-brand-orange text-white border-brand-orange' 
              : 'bg-white text-brand-brown border-gray-300'
          }`}
        >
          📅 Prearranged
        </button>
      </div>
      
      <form className="space-y-4" onSubmit={submitRequest}>
        <div>
          <label className="block mb-1 font-semibold">Pickup Location</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={e => setPickup(e.target.value)} 
            required 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g. King Shaka Airport" 
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Dropoff Location</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={e => setDropoff(e.target.value)} 
            required 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g. Oyster Box Hotel" 
          />
        </div>
        
        {bookingType === 'prearranged' && (
          <>
            <div>
              <label className="block mb-1 font-semibold">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Time</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                required 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
          </>
        )}
        
        <div>
          <label className="block mb-1 font-semibold">Passengers</label>
          <input 
            type="number" 
            min={1} 
            max={12} 
            value={pax} 
            onChange={e => setPax(Number(e.target.value))} 
            required 
            className="w-24 border rounded px-3 py-2" 
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-brand-gold transition" 
          disabled={loading}
        >
          {loading ? "Sending Request..." : bookingType === 'instant' ? "Request Now" : "Schedule Transfer"}
        </button>
      </form>
      
      {/* Status Updates */}
      {status && (
        <div className="mt-6 p-4 border-2 rounded-lg bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              status === 'searching' ? 'bg-yellow-500 animate-pulse' :
              status === 'matched' || status === 'accepted' ? 'bg-blue-500' :
              status === 'en-route' ? 'bg-purple-500 animate-pulse' :
              status === 'arrived' ? 'bg-green-500' :
              status === 'completed' ? 'bg-gray-500' :
              'bg-red-500'
            }`}></div>
            <h2 className="font-bold text-lg text-brand-brown">
              {status === 'searching' && '🔍 Finding available drivers...'}
              {status === 'matched' && '✅ Driver matched!'}
              {status === 'accepted' && '✅ Driver accepted your request'}
              {status === 'en-route' && '🚗 Driver is on the way'}
              {status === 'arrived' && '📍 Driver has arrived'}
              {status === 'completed' && '✅ Trip completed'}
              {status === 'error' && '❌ Request failed'}
            </h2>
          </div>
          
          {request && request.driver && (
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Driver:</span> {request.driver.name}</p>
              <p><span className="font-semibold">Vehicle:</span> {request.driver.vehicle} ({request.driver.plate})</p>
              <p><span className="font-semibold">ETA:</span> {request.driver.eta || 'Calculating...'}</p>
              <p><span className="font-semibold">Price:</span> R{request.price}</p>
              
              {status === 'accepted' && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-blue-800 text-xs">Driver is preparing to pick you up. You'll receive updates as they approach.</p>
                </div>
              )}
              
              {status === 'en-route' && (
                <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                  <p className="text-purple-800 text-xs">Driver is en route to your pickup location. ETA: {request.driver.eta}</p>
                </div>
              )}
              
              {status === 'arrived' && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800 text-xs font-semibold">Driver has arrived at your pickup location!</p>
                </div>
              )}
            </div>
          )}
          
          {status === 'searching' && (
            <p className="text-sm text-gray-600">We're notifying all available drivers in your area. This may take a moment...</p>
          )}
        </div>
      )}
    </div>
  );
}
