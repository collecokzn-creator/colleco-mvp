import React, { useState } from "react";
import BookingNav from '../components/BookingNav';
import LiveMap from '../components/LiveMap';
import TransferChat from '../components/TransferChat';
import DriverRating from '../components/DriverRating';
import { requestNotificationPermission, notifyTransferStatus } from '../utils/notifications';

export default function Transfers() {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Request notification permission on load
    requestNotificationPermission();
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
  const [driverLocation, setDriverLocation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Fetch nearby available drivers based on pickup location
  async function fetchNearbyDrivers(location) {
    if (!location || location.length < 3) {
      setNearbyDrivers([]);
      return;
    }
    
    setLoadingNearby(true);
    try {
      const res = await fetch(`/api/transfers/nearby?location=${encodeURIComponent(location)}`);
      const data = await res.json();
      
      if (data.ok && data.drivers) {
        setNearbyDrivers(data.drivers);
      } else {
        setNearbyDrivers([]);
      }
    } catch (e) {
      console.error('[transfers] fetch nearby drivers failed', e);
      setNearbyDrivers([]);
    } finally {
      setLoadingNearby(false);
    }
  }

  // Watch pickup location and fetch nearby drivers
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchNearbyDrivers(pickup);
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timer);
  }, [pickup]);

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
          const newStatus = data.request.status;
          
          // Trigger notification on status change
          if (newStatus !== previousStatus && newStatus !== 'searching') {
            notifyTransferStatus(newStatus, data.request);
            setPreviousStatus(newStatus);
          }
          
          setStatus(newStatus);
          
          // Update driver location if available
          if (data.request.driverLocation) {
            setDriverLocation(data.request.driverLocation);
          }
          
          if (newStatus === 'completed' || newStatus === 'cancelled') {
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
    <div className="overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6 py-8">
      <BookingNav />
      <h1 className="text-3xl font-bold mb-4 text-brand-brown">Shuttle & Transfers</h1>
      
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
        
        {/* Nearby Shuttles Map */}
        {pickup && pickup.length >= 3 && !status && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-brand-brown">
                {loadingNearby ? '🔍 Finding nearby shuttles...' : `📍 ${nearbyDrivers.length} shuttle${nearbyDrivers.length !== 1 ? 's' : ''} available near you`}
              </h3>
            </div>
            <div className="border-2 border-cream-border rounded-lg overflow-hidden">
              <LiveMap 
                pickup={pickup}
                nearbyDrivers={nearbyDrivers}
                showRoute={false}
                height="300px"
              />
            </div>
            {nearbyDrivers.length > 0 && (
              <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-green-800 text-sm">
                  ✅ Shuttles available in your area. Average ETA: {Math.min(...nearbyDrivers.map(d => d.eta || 10))} min
                </p>
              </div>
            )}
            {!loadingNearby && nearbyDrivers.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No shuttles currently in this area. You can still submit a request and we&apos;ll notify nearby drivers.
                </p>
              </div>
            )}
          </div>
        )}
        
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
              
              {/* Live Map */}
              {(status === 'accepted' || status === 'en-route' || status === 'arrived') && (
                <div className="mt-4">
                  <LiveMap 
                    pickup={request.pickup} 
                    dropoff={request.dropoff} 
                    driverLocation={driverLocation}
                    showRoute={true}
                  />
                </div>
              )}
              
              {/* Chat Button */}
              {(status === 'accepted' || status === 'en-route' || status === 'arrived') && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    💬 {showChat ? 'Hide Chat' : 'Chat with Driver'}
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    📞 Call
                  </button>
                </div>
              )}
              
              {/* Chat Component */}
              {showChat && request.id && (
                <div className="mt-4 h-96">
                  <TransferChat requestId={request.id} role="customer" />
                </div>
              )}
              
              {status === 'accepted' && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-blue-800 text-xs">Driver is preparing to pick you up. You&apos;ll receive updates as they approach.</p>
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
            <p className="text-sm text-gray-600">We&apos;re notifying all available drivers in your area. This may take a moment...</p>
          )}
          
          {/* Rating Component after completion */}
          {status === 'completed' && request.driver && (
            <div className="mt-4">
              <DriverRating 
                requestId={request.id} 
                driver={request.driver}
                onSubmit={() => {
                  // Reload or navigate to history
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
