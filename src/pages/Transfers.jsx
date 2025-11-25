import React, { useState } from "react";
import BookingNav from '../components/BookingNav';
import LiveMap from '../components/LiveMap';
import TransferChat from '../components/TransferChat';
import DriverRating from '../components/DriverRating';
import { requestNotificationPermission, notifyTransferStatus } from '../utils/notifications';
import Button from '../components/ui/Button.jsx';

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
  const [tripType, setTripType] = useState("one-way"); // "one-way", "round-trip", "multi-stop"
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [additionalStops, setAdditionalStops] = useState([]);
  const [multiDayService, setMultiDayService] = useState(false);
  const [serviceDays, setServiceDays] = useState(1);
  const [recurringDays, setRecurringDays] = useState([]);
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
        bookingType,
        tripType,
        additionalStops: tripType === 'multi-stop' ? additionalStops.filter(s => s.trim()) : [],
        returnDate: tripType === 'round-trip' ? returnDate : null,
        returnTime: tripType === 'round-trip' ? returnTime : null,
        multiDayService,
        serviceDays: multiDayService ? serviceDays : 1,
        recurringDays: multiDayService ? recurringDays : []
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
    <div className="bg-cream min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <BookingNav />
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown">Shuttle & Transfers</h1>
        <p className="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">Request instant or scheduled transport, multi-stop journeys, and monitor live driver progress.</p>
      </div>

      {/* Trip Configuration Card */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
        <h2 className="text-lg font-bold text-brand-brown mb-4">Trip Configuration</h2>
        
        {/* Trip Type */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-semibold text-brand-brown">Trip Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTripType('one-way')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tripType === 'one-way'
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-cream-border hover:border-brand-orange/50 hover:bg-cream'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-brand-brown">One-way</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTripType('round-trip')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tripType === 'round-trip'
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-cream-border hover:border-brand-orange/50 hover:bg-cream'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-brand-brown">Round Trip</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTripType('multi-stop')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tripType === 'multi-stop'
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-cream-border hover:border-brand-orange/50 hover:bg-cream'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-brand-brown">Multi-stop</div>
              </div>
            </button>
          </div>
        </div>

        {/* Booking Type */}
        <div>
          <label className="block mb-3 text-sm font-semibold text-brand-brown">Booking Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBookingType('instant')}
              className={`p-4 rounded-lg border-2 transition-all ${
                bookingType === 'instant'
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-cream-border hover:border-brand-orange/50 hover:bg-cream'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-brand-brown">Instant Request</div>
                <div className="text-xs text-brand-russty mt-1">Book now</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setBookingType('prearranged')}
              className={`p-4 rounded-lg border-2 transition-all ${
                bookingType === 'prearranged'
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-cream-border hover:border-brand-orange/50 hover:bg-cream'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-brand-brown">Prearranged</div>
                <div className="text-xs text-brand-russty mt-1">Schedule ahead</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Day Service Toggle */}
      {bookingType === 'prearranged' && (
        <div className="mb-4 p-4 bg-cream-sand border-2 border-cream-border rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={multiDayService}
              onChange={e => setMultiDayService(e.target.checked)}
              className="w-5 h-5 text-brand-orange rounded"
            />
            <div>
              <span className="font-semibold text-brand-brown">📆 Multi-Day Service</span>
              <p className="text-sm text-gray-600">Book recurring shuttle service for multiple days (discounts apply)</p>
            </div>
          </label>
          
          {multiDayService && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block mb-1 font-semibold text-sm">Number of Days</label>
                <input 
                  type="number"
                  min={2}
                  max={30}
                  value={serviceDays}
                  onChange={e => setServiceDays(Number(e.target.value))}
                  className="w-32 border rounded px-3 py-2"
                />
                <span className="ml-2 text-sm text-gray-600">days</span>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Recurring Days (Optional)</label>
                <div className="flex gap-2 flex-wrap">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (recurringDays.includes(idx)) {
                          setRecurringDays(recurringDays.filter(d => d !== idx));
                        } else {
                          setRecurringDays([...recurringDays, idx]);
                        }
                      }}
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        recurringDays.includes(idx)
                          ? 'bg-brand-orange text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select specific days for recurring service</p>
              </div>
              <div className="p-3 bg-cream-sand border border-cream-border rounded">
                <p className="text-sm text-brand-brown">
                  🎉 Multi-day discount: <strong>{serviceDays >= 7 ? '20%' : serviceDays >= 3 ? '15%' : '10%'} off</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <form className="space-y-6" onSubmit={submitRequest}>
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
              <div className="mt-2 p-3 bg-cream-sand rounded border border-cream-border">
                <p className="text-brand-brown text-sm">
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
        
        <div className="pt-2">
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
        
        {/* Multi-stop Journey */}
        {tripType === 'multi-stop' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-brand-brown">Additional Stops</label>
              <Button
                type="button"
                size="sm"
                onClick={() => setAdditionalStops([...additionalStops, ''])}
                disabled={additionalStops.length >= 5}
              >Add Stop</Button>
            </div>
            
            {additionalStops.map((stop, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="text-sm font-semibold text-gray-500 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={stop}
                  onChange={e => {
                    const newStops = [...additionalStops];
                    newStops[index] = e.target.value;
                    setAdditionalStops(newStops);
                  }}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder={`Stop ${index + 1} location`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => setAdditionalStops(additionalStops.filter((_, i) => i !== index))}
                >✕</Button>
              </div>
            ))}
            
            {additionalStops.length > 0 && (
              <div className="p-3 bg-cream-sand border border-cream-border rounded">
                <p className="text-sm text-brand-brown">
                  📍 Total stops: {additionalStops.length + 2} (Pickup → {additionalStops.length} stop{additionalStops.length !== 1 ? 's' : ''} → Dropoff)
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Round Trip Return Details */}
        {tripType === 'round-trip' && bookingType === 'prearranged' && (
          <div className="p-4 bg-amber-100 border-2 border-brand-gold rounded-lg space-y-3">
            <h3 className="font-semibold text-brand-brown flex items-center gap-2">
              🔁 Return Journey Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold text-sm">Return Date</label>
                <input 
                  type="date" 
                  value={returnDate} 
                  onChange={e => setReturnDate(e.target.value)} 
                  required
                  min={date}
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-sm">Return Time</label>
                <input 
                  type="time" 
                  value={returnTime} 
                  onChange={e => setReturnTime(e.target.value)} 
                  required
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
            </div>
            <div className="p-2 bg-cream-sand border border-cream-border rounded">
              <p className="text-sm text-brand-brown">
                💰 Round trip discount: <strong>15% off</strong> total fare
              </p>
            </div>
          </div>
        )}
        
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
        
        <div className="pt-2">
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
        
        <Button 
          type="submit" 
          fullWidth
          disabled={loading}
        >
          {loading ? "Sending Request..." : bookingType === 'instant' ? "Request Now" : "Schedule Transfer"}
        </Button>
      </form>
      
      {/* Status Updates */}
      {status && (
        <div className="mt-10 p-5 border border-cream-border rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              status === 'searching' ? 'bg-yellow-500 animate-pulse' :
              status === 'matched' || status === 'accepted' ? 'bg-brand-orange' :
              status === 'en-route' ? 'bg-brand-gold animate-pulse' :
              status === 'arrived' ? 'bg-cream-sand' :
              status === 'completed' ? 'bg-brand-brown' :
              'bg-brand-russty'
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
                    waypoints={request.additionalStops || []}
                    showRoute={true}
                  />
                  {request.additionalStops && request.additionalStops.length > 0 && (
                    <div className="mt-2 p-2 bg-cream-sand border border-cream-border rounded">
                      <p className="text-xs text-brand-brown">
                        📍 Multi-stop route with {request.additionalStops.length} additional stop{request.additionalStops.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Chat Button */}
              {(status === 'accepted' || status === 'en-route' || status === 'arrived') && (
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => setShowChat(!showChat)}
                  >
                    💬 {showChat ? 'Hide Chat' : 'Chat with Driver'}
                  </Button>
                  <Button variant="outline">📞 Call</Button>
                </div>
              )}
              
              {/* Chat Component */}
              {showChat && request.id && (
                <div className="mt-4 h-96">
                  <TransferChat requestId={request.id} role="customer" />
                </div>
              )}
              
              {status === 'accepted' && (
                <div className="mt-4 p-3 bg-cream-sand rounded border border-cream-border">
                  <p className="text-brand-brown text-xs">Driver is preparing to pick you up. You&apos;ll receive updates as they approach.</p>
                </div>
              )}
              
              {status === 'en-route' && (
                <div className="mt-4 p-3 bg-amber-100 rounded border border-brand-gold">
                  <p className="text-brand-brown text-xs">Driver is en route to your pickup location. ETA: {request.driver.eta}</p>
                </div>
              )}
              
              {status === 'arrived' && (
                <div className="mt-4 p-3 bg-cream-sand rounded border border-cream-border">
                  <p className="text-brand-brown text-xs font-semibold">Driver has arrived at your pickup location!</p>
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
