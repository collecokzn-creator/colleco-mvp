import React, { useState } from "react";
import BookingNav from '../components/BookingNav';
import LiveMap from '../components/LiveMap';
import TransferChat from '../components/TransferChat';
import DriverRating from '../components/DriverRating';
import RideSelector from '../components/RideSelector';
import { requestNotificationPermission, notifyTransferStatus } from '../utils/notifications';
import Button from '../components/ui/Button.jsx';
import { Clock, Car, DollarSign } from 'lucide-react';

export default function Transfers() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pax, setPax] = useState(1);
  const [vehicleType, setVehicleType] = useState("sedan"); // sedan, suv, van, luxury
  const [luggage, setLuggage] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [bookingType, setBookingType] = useState("instant"); // "instant" or "prearranged"
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isMultiStop, setIsMultiStop] = useState(false);
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
  const [routeInfo, setRouteInfo] = useState(null);
  const [_formErrors, setFormErrors] = useState({});
  const [showRideSelector, setShowRideSelector] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [ridePending, setRidePending] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Request notification permission on load
    requestNotificationPermission();
  }, []);

  // Auto-update serviceDays based on selected recurring days when multi-day service active
  React.useEffect(() => {
    if (multiDayService) {
      if (recurringDays.length > 0) {
        setServiceDays(recurringDays.length);
      }
    }
  }, [recurringDays, multiDayService]);

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

  // Estimate price when route details change
  const estimatePrice = React.useCallback(async () => {
    try {
      const stops = additionalStops.filter(s => s.trim());
      const res = await fetch('/api/transfers/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, dropoff, vehicleType, pax, luggage, isRoundTrip, additionalStops: stops })
      });
      const data = await res.json();
      if (data.ok && data.estimate) {
        setEstimatedPrice(data.estimate);
      }
    } catch (e) {
      console.error('[transfers] price estimation failed', e);
    }
  }, [pickup, dropoff, vehicleType, pax, luggage, isRoundTrip, additionalStops]);

  React.useEffect(() => {
    if (pickup && dropoff && pickup.length > 3 && dropoff.length > 3) {
      const timer = setTimeout(() => {
        estimatePrice();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setEstimatedPrice(null);
    }
  }, [pickup, dropoff, vehicleType, pax, luggage, isRoundTrip, additionalStops, estimatePrice]);

  async function cancelRequest() {
    if (!request?.id) return;
    
    const confirmed = confirm('Are you sure you want to cancel this transfer request?');
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/transfers/request/${request.id}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(null);
        setRequest(null);
        setDriverLocation(null);
        alert('Transfer request cancelled successfully.');
      }
    } catch (e) {
      console.error('[transfers] cancel failed', e);
      alert('Failed to cancel request. Please try again.');
    }
  }

  async function submitRequest(e) {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!pickup || pickup.length < 3) errors.pickup = 'Please enter a valid pickup location';
    if (!dropoff || dropoff.length < 3) errors.dropoff = 'Please enter a valid dropoff location';
    if (bookingType === 'prearranged' && !date) errors.date = 'Please select a date';
    if (bookingType === 'prearranged' && !time) errors.time = 'Please select a time';
    if (pax < 1 || pax > 12) errors.pax = 'Passengers must be between 1 and 12';
    if (luggage < 0 || luggage > 20) errors.luggage = 'Luggage count must be between 0 and 20';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    // Show ride selector for user to pick their preferred ride
    setShowRideSelector(true);
  }

  function handleSkipRideSelection(rides) {
    // User chose to skip ride selection for now
    setAvailableRides(rides);
    setShowRideSelector(false);
    setRidePending(true);
    setSelectedRide(null);
  }

  async function autoAssignCheapestRide() {
    if (!availableRides || availableRides.length === 0) {
      alert('No available rides to assign. Please try again.');
      return;
    }

    // Find the cheapest ride
    const cheapestRide = availableRides.reduce((min, ride) => 
      ride.price < min.price ? ride : min
    );

    await confirmRideSelection(cheapestRide);
  }

  function reopenRideSelector() {
    setRidePending(false);
    setShowRideSelector(true);
  }

  async function confirmRideSelection(ride) {
    setSelectedRide(ride);
    setShowRideSelector(false);
    setRidePending(false);
    setLoading(true);
    setStatus('searching');
    
    try {
      const payload = {
        pickup,
        dropoff,
        date: bookingType === 'instant' ? new Date().toISOString() : date,
        time: bookingType === 'instant' ? new Date().toISOString() : time,
        pax,
        vehicleType,
        luggage,
        specialRequirements: specialRequirements.trim(),
        bookingType,
        isRoundTrip,
        isMultiStop,
        additionalStops: isMultiStop ? additionalStops.filter(s => s.trim()) : [],
        returnDate: isRoundTrip ? returnDate : null,
        returnTime: isRoundTrip ? returnTime : null,
        multiDayService,
        serviceDays: multiDayService ? serviceDays : 1,
        recurringDays: multiDayService ? recurringDays : [],
        // Include selected ride details
        selectedRide: {
          rideId: ride.id,
          driverId: ride.driver.id,
          driverName: ride.driver.name,
          brandId: ride.brand.id,
          brandName: ride.brand.name,
          vehicleModel: ride.vehicle.model,
          vehiclePlate: ride.vehicle.plate,
          agreedPrice: ride.price
        }
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

      {/* Booking Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
        <h2 className="text-lg font-bold text-brand-brown mb-4">Booking Type</h2>
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

      {/* Multi-Day Service */}
      {bookingType === 'prearranged' && (
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h3 className="text-lg font-bold text-brand-brown mb-4">Multi-Day Service</h3>
          <label className="flex items-center gap-3 cursor-pointer mb-6">
            <input 
              type="checkbox" 
              checked={multiDayService}
              onChange={e => setMultiDayService(e.target.checked)}
              className="w-5 h-5 accent-brand-orange rounded"
            />
            <div>
              <span className="font-semibold text-brand-brown">Enable Multi-Day Booking</span>
              <p className="text-sm text-brand-russty">Book recurring shuttle service for multiple days (discounts apply)</p>
            </div>
          </label>
          
          {multiDayService && (
            <div className="space-y-5 pt-4 border-t border-cream-border">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Number of Days</label>
                {recurringDays.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-lg border-2 border-brand-orange bg-brand-orange/5 text-brand-brown font-semibold w-20 text-center">
                      {serviceDays}
                    </div>
                    <span className="text-sm text-brand-russty">auto from selected days</span>
                  </div>
                ) : (
                  <input 
                    type="number"
                    min={2}
                    max={30}
                    value={serviceDays}
                    onChange={e => setServiceDays(Number(e.target.value))}
                    className="w-32 border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  />
                )}
              </div>
              <div>
                <label className="block mb-3 text-sm font-semibold text-brand-brown">Recurring Days <span className="text-brand-russty font-normal">(Optional)</span></label>
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
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        recurringDays.includes(idx)
                          ? 'bg-brand-orange text-white shadow-sm'
                          : 'border-2 border-cream-border text-brand-brown hover:border-brand-orange/50 hover:bg-cream'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-brand-russty mt-2">Select specific days for recurring service</p>
              </div>
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Multi-day discount:</strong> {serviceDays >= 7 ? '20%' : serviceDays >= 3 ? '15%' : '10%'} off
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <form className="space-y-6" onSubmit={submitRequest}>
        {/* Journey Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
          <h2 className="text-lg font-bold text-brand-brown mb-6">Journey Details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Location</label>
              <input 
                type="text" 
                value={pickup} 
                onChange={e => setPickup(e.target.value)} 
                required 
                className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors" 
                placeholder="e.g. King Shaka Airport" 
              />
            </div>
            
            {/* Nearby Shuttles Map */}
            {pickup && pickup.length >= 3 && !status && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-brand-brown">
                  {loadingNearby ? 'Finding nearby shuttles...' : `${nearbyDrivers.length} shuttle${nearbyDrivers.length !== 1 ? 's' : ''} available near you`}
                </h3>
                <div className="border-2 border-cream-border rounded-lg overflow-hidden">
                  <LiveMap 
                    pickup={pickup}
                    nearbyDrivers={nearbyDrivers}
                    showRoute={false}
                    height="300px"
                  />
                </div>
                {nearbyDrivers.length > 0 && (
                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      <strong>Shuttles available in your area.</strong> Average ETA: {Math.min(...nearbyDrivers.map(d => d.eta || 10))} min
                    </p>
                  </div>
                )}
                {!loadingNearby && nearbyDrivers.length === 0 && (
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>No shuttles currently in this area.</strong> You can still submit a request and we&apos;ll notify nearby drivers.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block mb-2 text-sm font-semibold text-brand-brown">Dropoff Location</label>
              <input 
                type="text" 
                value={dropoff} 
                onChange={e => setDropoff(e.target.value)} 
                required 
                className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors" 
                placeholder="e.g. Oyster Box Hotel" 
              />
            </div>

            {/* Multi-stop Journey Checkbox - Available for all booking types */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isMultiStop}
                  onChange={e => {
                    setIsMultiStop(e.target.checked);
                    if (!e.target.checked) setAdditionalStops([]);
                  }}
                  className="w-5 h-5 accent-brand-orange rounded"
                />
                <div>
                  <span className="font-semibold text-brand-brown">Add Multiple Stops</span>
                  <p className="text-sm text-brand-russty">Visit multiple locations in one trip</p>
                </div>
              </label>
            </div>
            
            {/* Multi-stop Journey */}
            {isMultiStop && (
          <div className="space-y-4 pt-4 border-t border-cream-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-brand-brown">Additional Stops</label>
              <Button
                type="button"
                size="sm"
                onClick={() => setAdditionalStops([...additionalStops, ''])}
                disabled={additionalStops.length >= 5}
              >Add Stop</Button>
            </div>
            
            {additionalStops.map((stop, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="text-sm font-semibold text-brand-russty w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={stop}
                  onChange={e => {
                    const newStops = [...additionalStops];
                    newStops[index] = e.target.value;
                    setAdditionalStops(newStops);
                  }}
                  className="flex-1 border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
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
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total stops:</strong> {additionalStops.length + 2} (Pickup → {additionalStops.length} stop{additionalStops.length !== 1 ? 's' : ''} → Dropoff)
                </p>
              </div>
            )}
          </div>
        )}

            {/* Round Trip Checkbox - Available for all booking types */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRoundTrip}
                  onChange={e => setIsRoundTrip(e.target.checked)}
                  className="w-5 h-5 accent-brand-orange rounded"
                />
                <div>
                  <span className="font-semibold text-brand-brown">Round Trip</span>
                  <p className="text-sm text-brand-russty">Add a return journey (15% discount)</p>
                </div>
              </label>
            </div>

            {/* Date & Time for Prearranged */}
            {bookingType === 'prearranged' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                      className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Time *</label>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      required
                      className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                    />
                  </div>
                </div>

              </>
            )}

            {/* Return Journey Details - Available when Round Trip is checked */}
            {isRoundTrip && (
              <div className="space-y-4 pt-4 border-t border-cream-border">
                <h3 className="text-sm font-bold text-brand-brown">Return Journey</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-brand-brown">Return Date{bookingType === 'prearranged' && ' *'}</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      min={date}
                      required={bookingType === 'prearranged'}
                      className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-brand-brown">Return Time{bookingType === 'prearranged' && ' *'}</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={e => setReturnTime(e.target.value)}
                      required={bookingType === 'prearranged'}
                      className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                    />
                  </div>
                </div>
                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Round trip discount:</strong> 15% off total fare
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <label className="block mb-2 text-sm font-semibold text-brand-brown">Passengers</label>
              <input 
                type="number" 
                min={1} 
                max={12} 
                value={pax} 
                onChange={e => setPax(Number(e.target.value))} 
                required 
                className="w-32 border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors" 
              />
            </div>
          </div>

          {/* Vehicle Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-brown">
              Vehicle Type *
            </label>
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              required
              className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
              aria-label="Select vehicle type"
            >
              <option value="sedan">Sedan (1-4 passengers)</option>
              <option value="suv">SUV (1-6 passengers)</option>
              <option value="van">Van/Minibus (7-12 passengers)</option>
              <option value="luxury">Luxury Sedan (1-4 passengers)</option>
            </select>
          </div>

          {/* Luggage Count */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="luggage" className="block text-sm font-medium text-brand-brown">
                Luggage Pieces
              </label>
              <input 
                id="luggage"
                type="number" 
                min={0}
                max={20}
                value={luggage}
                onChange={e => setLuggage(Number(e.target.value))}
                className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                aria-label="Number of luggage pieces"
              />
            </div>
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <label htmlFor="specialRequirements" className="block text-sm font-medium text-brand-brown">
              Special Requirements <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              id="specialRequirements"
              value={specialRequirements}
              onChange={e => setSpecialRequirements(e.target.value)}
              placeholder="Child seat, wheelchair accessible, pet friendly, etc."
              rows={2}
              maxLength={200}
              className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors resize-none"
              aria-label="Special requirements for the transfer"
            />
            <p className="text-xs text-gray-500">{specialRequirements.length}/200 characters</p>
          </div>

          {/* Price Estimate */}
          {estimatedPrice && (
            <div className="p-4 bg-cream-sand border-2 border-brand-orange rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-brown font-medium">Estimated Price</p>
                  <p className="text-xs text-gray-600 mt-1">Final price may vary based on traffic and actual route</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-orange">R{estimatedPrice.amount}</p>
                  {estimatedPrice.distance && (
                    <p className="text-xs text-gray-600">{estimatedPrice.distance} km • {estimatedPrice.duration}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          fullWidth
          disabled={loading}
        >
          {loading ? "Sending Request..." : bookingType === 'instant' ? "Request Now" : "Schedule Transfer"}
        </Button>
      </form>
      
      {/* Pending Transfer - Awaiting Ride Selection */}
      {ridePending && !status && (
        <div className="mt-10 p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-brand-brown mb-1">
                Transfer Pending - Finalize Your Ride
              </h2>
              <p className="text-sm text-brand-russty">
                Your transfer details are saved. Choose your preferred ride to proceed.
              </p>
            </div>
          </div>

          {/* Transfer Summary */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-cream-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pickup</p>
                <p className="font-semibold text-brand-brown">{pickup}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Dropoff</p>
                <p className="font-semibold text-brand-brown">{dropoff}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Passengers</p>
                <p className="font-semibold text-brand-brown">{pax} passenger{pax !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Vehicle Type</p>
                <p className="font-semibold text-brand-brown capitalize">{vehicleType}</p>
              </div>
              {estimatedPrice && (
                <div className="col-span-full">
                  <p className="text-xs text-gray-500 mb-1">Estimated Price Range</p>
                  <p className="font-bold text-brand-orange text-lg">R{estimatedPrice.amount}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              fullWidth
              onClick={reopenRideSelector}
              className="flex items-center justify-center gap-2"
            >
              <Car className="h-4 w-4" />
              Pick My Ride
            </Button>
            
            <Button
              fullWidth
              variant="outline"
              onClick={autoAssignCheapestRide}
              className="flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50"
            >
              <DollarSign className="h-4 w-4" />
              Auto-assign Cheapest Ride
            </Button>
            
            <p className="text-xs text-center text-gray-600 mt-2">
              You can also proceed with other bookings and finalize this transfer later.
            </p>
          </div>
        </div>
      )}
      
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
              <p><span className="font-semibold">Vehicle Type:</span> {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}</p>
              <p><span className="font-semibold">Passengers:</span> {pax} | <span className="font-semibold">Luggage:</span> {luggage} pieces</p>
              <p><span className="font-semibold">ETA:</span> {request.driver.eta || 'Calculating...'}</p>
              <p><span className="font-semibold">Price:</span> R{request.price}</p>
              {specialRequirements && (
                <p><span className="font-semibold">Special Requirements:</span> {specialRequirements}</p>
              )}
              
              {/* Live Map */}
              {(status === 'matched' || status === 'accepted' || status === 'en-route' || status === 'arrived') && (
                <div className="mt-4">
                  <LiveMap 
                    pickup={request.pickup} 
                    dropoff={request.dropoff} 
                    driverLocation={driverLocation}
                    waypoints={request.additionalStops || []}
                    showRoute={true}
                    onRouteInfo={setRouteInfo}
                  />
                  {routeInfo && (
                    <div className="mt-2 p-3 bg-white border border-cream-border rounded">
                      <div className="text-xs text-brand-brown flex gap-4 flex-wrap">
                        <span><span className="font-semibold">Distance:</span> {(routeInfo.distanceMeters/1000).toFixed(1)} km</span>
                        <span><span className="font-semibold">Duration:</span> {routeInfo.durationText || `${Math.round(routeInfo.durationSeconds/60)} min`}</span>
                      </div>
                    </div>
                  )}
                  {request.additionalStops && request.additionalStops.length > 0 && (
                    <div className="mt-2 p-2 bg-cream-sand border border-cream-border rounded">
                      <p className="text-xs text-brand-brown">
                        📍 Multi-stop route with {request.additionalStops.length} additional stop{request.additionalStops.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              {(status === 'searching' || status === 'matched') && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={cancelRequest}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    ❌ Cancel Request
                  </Button>
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

      {/* AI-First Support Section */}
      {selectedRide && (
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mt-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Transfer Terms & Conditions</h2>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-brand-brown mb-1">Cancellation Policy</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Free cancellation up to 2 hours before pickup</li>
                  <li>50% refund for cancellations 30min-2 hours before pickup</li>
                  <li>No refund for cancellations within 30 minutes of pickup</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-brown mb-1">Payment Terms</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Full payment required at time of booking</li>
                  <li>Loyalty discounts apply for round-trip and multi-day bookings</li>
                  <li>Prices include all taxes and service fees</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-brown mb-1">Transfer Provider Policies</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Valid ID required for all passengers</li>
                  <li>Vehicle capacity limits strictly enforced</li>
                  <li>Driver may refuse service if safety requirements not met</li>
                  <li>Additional luggage surcharges may apply</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-brown mb-1">Important Information</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Be ready 10 minutes before scheduled pickup</li>
                  <li>Contact driver immediately if running late</li>
                  <li>Multi-stop routes: Specify order and time at each stop</li>
                  <li>Lost items: Report to driver immediately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information - Separated by Purpose */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-brand-brown mb-3">Need Assistance?</h3>
            
            {/* Driver Contact - For During Transfer */}
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h4 className="font-semibold text-green-900">During Transfer - Contact Driver Directly</h4>
              </div>
              <p className="text-sm text-green-800 mb-3">For pickup coordination, delays, or route questions:</p>
              <div className="text-sm mb-3">
                <p className="text-green-700 font-medium">Driver: {selectedRide.driver.name}</p>
                <p className="text-green-600">Contact via in-app chat or phone once matched</p>
              </div>
              <button 
                onClick={() => {
                  const messagesButton = document.querySelector('[aria-label="Open Messenger"]');
                  if (messagesButton) {
                    messagesButton.click();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
                className="w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Message Driver
              </button>
              <p className="text-xs text-green-700 mt-2 text-center">
                Direct communication • Escalations handled in-app
              </p>
            </div>

            {/* Zola - Primary Support */}
            <div className="bg-orange-50 border-2 border-brand-orange rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-6 w-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className="font-semibold text-brand-brown text-lg">Zola - 24/7 Instant Help</h4>
              </div>
              <p className="text-sm text-brand-brown mb-3">
                Get instant answers about your booking, changes, cancellations, refunds, payment issues, and recommendations. 
                Zola handles most requests immediately and routes complex issues to the right specialist.
              </p>
              <button 
                onClick={() => {
                  // Trigger AIAgent to open via custom event
                  window.dispatchEvent(new CustomEvent('openAIAgent'));
                  // Smooth scroll to bottom-right where AIAgent is positioned
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="w-full bg-brand-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with Zola Now
              </button>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Available 24/7 • Instant responses • Handles booking changes, queries & recommendations
              </p>
            </div>

            {/* Human Support - Backup */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <h4 className="font-medium text-gray-700 text-sm">Need to Speak to a Specialist?</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">If Zola can&apos;t resolve your issue, you&apos;ll be connected to our team:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Email Support</p>
                  <p className="font-semibold text-gray-700">support@colleco.co.za</p>
                  <p className="text-xs text-gray-400">Zola routes to specialist</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone (Escalations)</p>
                  <p className="font-semibold text-gray-700">+27 31 123 4567</p>
                  <p className="text-xs text-gray-400">Mon-Fri: 9AM-5PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Ride Selector Modal */}
    {showRideSelector && (
      <RideSelector
        pickup={pickup}
        dropoff={dropoff}
        vehicleType={vehicleType}
        passengers={pax}
        onSelectRide={confirmRideSelection}
        onSkip={handleSkipRideSelection}
        onCancel={() => setShowRideSelector(false)}
      />
    )}
    </div>
  );
}

