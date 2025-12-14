import React, { useState, useEffect, useCallback } from 'react';
import BookingNav from '../components/BookingNav';
import AccommodationSelector from '../components/AccommodationSelector';
import MealSelector from '../components/MealSelector';
import Button from '../components/ui/Button.jsx';
import { Home, Clock, DollarSign } from 'lucide-react';
import { processBookingRewards } from '../utils/bookingIntegration';

import ErrorBoundary from '../components/ErrorBoundary';

function AccommodationBookingInner(){
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState('standard'); // standard, deluxe, suite
  const [specialRequests, setSpecialRequests] = useState('');
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyPending, setPropertyPending] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Property selection (replaces direct supplier selection)
  const [propertyId, setPropertyId] = useState(''); // property ID from search
  const [properties, setProperties] = useState([]);
  const [bookingType, setBookingType] = useState('FIT'); // FIT or Groups
  const [mealPricing, setMealPricing] = useState(null); // Store meal pricing from MealSelector
  
  // Search properties when location changes
  useEffect(() => {
    async function searchProperties() {
      if (!location || location.length < 3) return;
      
      try {
        const response = await fetch(`/api/properties/search?location=${encodeURIComponent(location)}`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
          // Auto-select first property if available
          if (data.length > 0 && !propertyId) {
            setPropertyId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to search properties:', error);
      }
    }
    
    const timer = setTimeout(searchProperties, 300); // Debounce
    return () => clearTimeout(timer);
  }, [location, propertyId]);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Add print styles
    const style = document.createElement('style');
    // Use textContent to avoid inserting HTML or scripts via innerHTML
    style.textContent = `
      @media print {
        @page { margin: 1cm; }
        body * { visibility: hidden; }
        #booking-confirmation, #booking-confirmation * { visibility: visible; }
        #booking-confirmation { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 100%;
          box-shadow: none !important;
        }
        #booking-confirmation button { display: none !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Set minimum check-in date to today
  const today = new Date().toISOString().split('T')[0];
  
  // Set minimum check-out date to check-in + 1 day
  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today;

  const handleSkipPropertySelection = useCallback((properties) => {
    setAvailableProperties(properties);
    setShowPropertySelector(false);
    setPropertyPending(true);
    setSelectedProperty(null);
  }, []);
  const confirmPropertySelection = useCallback(async (property) => {
    setSelectedProperty(property);
    setShowPropertySelector(false);
    setPropertyPending(false);
    setLoading(true);

    try {
      // Get selected property details to derive supplier
      const selectedProp = properties.find(p => p.id === propertyId);
      if (!selectedProp) {
        throw new Error('Please select a property first');
      }
      
      // Calculate booking details
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const basePrice = property.pricePerNight || selectedProp.basePrice;
      const retailPrice = basePrice; // No markup for now
      
      // Build line items array
      const lineItems = [
        {
          serviceType: 'accommodation',
          description: `${selectedProp.name} - ${roomType} room`,
          basePrice,
          retailPrice,
          quantity: 1, // 1 room
          nights
        }
      ];
      
      // Add meal selections from MealSelector if present
      if (mealPricing && mealPricing.items && mealPricing.items.length > 0) {
        mealPricing.items.forEach(mealItem => {
          lineItems.push({
            serviceType: 'meal',
            description: mealItem.name || mealItem.description,
            basePrice: mealItem.total / (mealItem.quantity || 1), // Back-calculate per-unit price
            retailPrice: mealItem.total / (mealItem.quantity || 1),
            quantity: mealItem.quantity || 1,
            nights: 1 // Meals are per-head, not per-night
          });
        });
      }
      
      // Create booking via API
      const userId = localStorage.getItem('colleco.user.id') || 'guest_' + Date.now();
      const bookingData = {
        propertyId: selectedProp.id,
        supplierId: selectedProp.supplierId, // Derived from property mapping
        userId,
        bookingType,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        lineItems,
        metadata: {
          propertyId: property.id,
          propertyName: property.name,
          location,
          guests,
          roomType,
          specialRequests: specialRequests || undefined
        }
      };
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }
      
      const booking = await response.json();
      
      // Process loyalty rewards
      const _loyaltyResult = processBookingRewards({
        id: booking.id,
        type: 'accommodation',
        amount: booking.pricing.total,
        userId,
        checkInDate,
        propertyId: property.id,
        propertyName: property.name,
        nights,
        guests
      });
      
      // Redirect to payment
      const paymentUrl = `/checkout?bookingId=${booking.id}`;
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert(`Booking failed: ${error.message}\n\nPlease try again or contact support.`);
      setLoading(false);
    }
  }, [properties, propertyId, checkIn, checkOut, roomType, mealPricing, bookingType, guests, location, specialRequests]);

  const autoAssignCheapestProperty = useCallback(async () => {
    if (!availableProperties || availableProperties.length === 0) {
      alert('No available properties to assign. Please try again.');
      return;
    }

    const cheapestProperty = availableProperties.reduce((min, property) => 
      property.pricePerNight < min.pricePerNight ? property : min
    );
    await confirmPropertySelection(cheapestProperty);
  }, [availableProperties, confirmPropertySelection]);

  const reopenPropertySelector = useCallback(() => {
    setPropertyPending(false);
    setShowPropertySelector(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!location || location.length < 3) errors.location = 'Please enter a valid location';
    if (!checkIn) errors.checkIn = 'Please select check-in date';
    if (!checkOut) errors.checkOut = 'Please select check-out date';
    if (checkOut && checkIn && new Date(checkOut) <= new Date(checkIn)) {
      errors.checkOut = 'Check-out must be after check-in';
    }
    if (guests < 1 || guests > 20) errors.guests = 'Guests must be between 1 and 20';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setShowPropertySelector(true);
  }, [location, checkIn, checkOut, guests]);

  return (
    <div className="bg-cream min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BookingNav />
        
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown">Accommodation Booking</h1>
          <p className="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">
            Find your perfect stay with our smart property selection and best price guarantee.
          </p>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Search Accommodation</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-brand-brown">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                placeholder="e.g., Durban, Umhlanga, Ballito"
              />
              {formErrors.location && (
                <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
              )}
            </div>

            {/* Property Selection */}
            {properties.length > 0 && (
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">
                  Select Property *
                </label>
                <div className="space-y-2">
                  {properties.map(prop => (
                    <label
                      key={prop.id}
                      className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        propertyId === prop.id
                          ? 'border-brand-orange bg-orange-50'
                          : 'border-cream-border hover:border-brand-orange'
                      }`}
                    >
                      <input
                        type="radio"
                        name="property"
                        value={prop.id}
                        checked={propertyId === prop.id}
                        onChange={e => setPropertyId(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-brand-brown">{prop.name}</p>
                        <p className="text-xs text-gray-600">{prop.type} • {prop.location} • {prop.stars}⭐</p>
                        <p className="text-xs text-gray-500 mt-1">{prop.description}</p>
                        <p className="text-sm font-semibold text-brand-orange mt-2">
                          From ZAR {prop.basePrice}/night
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Type */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-brand-brown">
                Booking Type *
              </label>
              <select
                value={bookingType}
                onChange={e => setBookingType(e.target.value)}
                required
                className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
              >
                <option value="FIT">Individual Booking</option>
                <option value="Groups">Group Booking (10+ guests)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {bookingType === 'FIT' 
                  ? 'Full payment due 7 days before check-in' 
                  : '25% deposit due now, balance 30 days before check-in'}
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  min={today}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.checkIn && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.checkIn}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={minCheckOut}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.checkOut && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.checkOut}</p>
                )}
              </div>
            </div>

            {/* Guests & Room Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guests" className="block mb-2 text-sm font-semibold text-brand-brown">
                  Number of Guests *
                </label>
                <input
                  id="guests"
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.guests && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.guests}</p>
                )}
              </div>

              <div>
                <label htmlFor="roomType" className="block mb-2 text-sm font-semibold text-brand-brown">
                  Room Type
                </label>
                <select
                  id="roomType"
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                >
                  <option value="standard">Standard Room</option>
                  <option value="deluxe">Deluxe Room</option>
                  <option value="suite">Suite</option>
                  <option value="family">Family Room</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label htmlFor="specialRequests" className="block mb-2 text-sm font-semibold text-brand-brown">
                Special Requests <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <textarea
                id="specialRequests"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                placeholder="Early check-in, late check-out, accessible room, etc."
                rows={3}
                maxLength={200}
                className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{specialRequests.length}/200 characters</p>
            </div>

            {/* Meal Selection */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-brand-brown mb-3">Meal Plans (Optional)</h3>
              <MealSelector 
                onMealsSelected={setMealPricing}
                headCount={guests}
                nights={Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1}
                bookingType={bookingType}
              />
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : 'Search Properties'}
            </Button>
          </form>
        </div>

        {/* Pending Property Selection */}
        {propertyPending && !loading && (
          <div className="p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-brand-brown mb-1">
                  Booking Pending - Choose Your Property
                </h2>
                <p className="text-sm text-brand-russty">
                  Your search details are saved. Select your preferred property to proceed.
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-cream-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-semibold text-brand-brown">{location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Guests</p>
                  <p className="font-semibold text-brand-brown">{guests} guest{guests !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Check-in</p>
                  <p className="font-semibold text-brand-brown">{checkIn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Check-out</p>
                  <p className="font-semibold text-brand-brown">{checkOut}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={reopenPropertySelector}
                className="flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Pick My Property
              </Button>
              
              <Button
                fullWidth
                variant="outline"
                onClick={autoAssignCheapestProperty}
                className="flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50"
              >
                <DollarSign className="h-4 w-4" />
                Auto-assign Cheapest Property
              </Button>
              
              <p className="text-xs text-center text-gray-600 mt-2">
                You can also proceed with other bookings and finalize this later.
              </p>
            </div>
          </div>
        )}

        {/* Selected Property Confirmation */}
        {selectedProperty && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-cream-border" id="booking-confirmation">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-brand-brown mb-1">Booking Confirmed</h2>
                  <p className="text-sm text-gray-600">Confirmation ID: ACC-{Date.now().toString().slice(-8)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const email = prompt('Enter your email address:');
                      if (email) {
                        alert(`Booking confirmation will be sent to ${email}\n\nNote: Email functionality requires backend integration.`);
                      }
                    }}
                    className="px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-6">
              {/* Property Information */}
              <div>
                <h3 className="text-lg font-bold text-brand-brown mb-3">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Property Name</p>
                    <p className="font-semibold text-brand-brown">{selectedProperty.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type & Rating</p>
                    <p className="font-semibold text-brand-brown">{selectedProperty.type} • {selectedProperty.stars} ⭐</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="space-y-2">
                      <p className="font-semibold text-brand-brown flex items-center gap-2">
                        <svg className="h-4 w-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {selectedProperty.address || location}
                      </p>
                      
                      {/* CollEco Travel info box */}
                      <div className="mb-3 p-3 bg-brand-orange/10 border-l-4 border-brand-orange rounded">
                        <strong className="text-brand-orange">CollEco Travel Tip:</strong>
                        <span className="ml-2 text-sm text-brand-brown">Map shows approximate property location. Complete your booking here with CollEco Travel for exclusive rates and support!</span>
                      </div>
                      
                      {/* Static Location Map - No API key required */}
                      <div className="relative rounded-lg overflow-hidden border-2 border-brand-orange mb-4 bg-gradient-to-br from-blue-50 to-green-50">
                        <div className="w-full h-64 flex flex-col items-center justify-center p-6">
                          <svg className="h-16 w-16 text-brand-orange mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-lg font-semibold text-brand-brown mb-1">{selectedProperty.name}</p>
                          <p className="text-sm text-gray-600 text-center">{selectedProperty.address || location}</p>
                          {selectedProperty.distanceKm && (
                            <p className="text-xs text-gray-500 mt-2">{selectedProperty.distanceKm} km from city center</p>
                          )}
                        </div>
                        {/* Overlay badge */}
                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs font-semibold text-brand-brown">Property Location</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guest Rating</p>
                    <p className="font-semibold text-brand-brown">{selectedProperty.rating?.toFixed(1) || 'N/A'}/5.0 ({selectedProperty.reviewCount || 0} reviews)</p>
                  </div>
                </div>
              </div>

              {/* Stay Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-brown mb-3">Stay Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold text-brand-brown">{new Date(checkIn).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">After 2:00 PM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-semibold text-brand-brown">{new Date(checkOut).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">Before 11:00 AM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-brand-brown">
                      {(() => {
                        const checkInDate = new Date(checkIn);
                        const checkOutDate = new Date(checkOut);
                        const diffTime = Math.abs(checkOutDate - checkInDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const nights = Math.max(1, diffDays);
                        return `${nights} night${nights !== 1 ? 's' : ''}`;
                      })()}
                    </p>
                    <p className="text-xs text-gray-500">{guests} guest{guests !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-3">Property Amenities</h3>
                  
                  {/* Show selected amenities first if any */}
                  {selectedProperty.requiredAmenities && selectedProperty.requiredAmenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">✓ Your Selected Amenities:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedProperty.requiredAmenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                            <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium text-green-800">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show all property amenities */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">All Available Amenities:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedProperty.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Plan */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-brown mb-3">Meal Plan</h3>
                <div className={`border rounded-lg p-4 ${
                  selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== 'room_only' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`font-semibold ${
                    selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== 'room_only'
                      ? 'text-green-800'
                      : 'text-gray-700'
                  }`}>
                    {!selectedProperty.selectedMealPlan || selectedProperty.selectedMealPlan === 'room_only' ? '🏨 Room Only' :
                     selectedProperty.selectedMealPlan === 'breakfast' ? '🍳 Bed & Breakfast' : 
                     selectedProperty.selectedMealPlan === 'half_board' ? '🍽️ Half Board (Breakfast & Dinner)' : 
                     selectedProperty.selectedMealPlan === 'full_board' ? '🍽️ Full Board (All Meals)' :
                     selectedProperty.selectedMealPlan === 'all_inclusive' ? '🍹 All Inclusive' : '🏨 Room Only'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== 'room_only'
                      ? 'text-green-700'
                      : 'text-gray-600'
                  }`}>
                    {!selectedProperty.selectedMealPlan || selectedProperty.selectedMealPlan === 'room_only' ? 'No meals included - Room accommodation only' :
                     selectedProperty.selectedMealPlan === 'breakfast' ? 'Daily breakfast included in your rate' : 
                     selectedProperty.selectedMealPlan === 'half_board' ? 'Breakfast and dinner included daily' : 
                     selectedProperty.selectedMealPlan === 'full_board' ? 'Breakfast, lunch, and dinner included daily' :
                     selectedProperty.selectedMealPlan === 'all_inclusive' ? 'All meals, drinks, and activities included' : 'No meals included'}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-brown mb-3">Pricing Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">R{selectedProperty.pricePerNight.toLocaleString()} × {(() => {
                      const checkInDate = new Date(checkIn);
                      const checkOutDate = new Date(checkOut);
                      const diffTime = Math.abs(checkOutDate - checkInDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return Math.max(1, diffDays);
                    })()} night(s)</span>
                    <span className="font-semibold">R{(selectedProperty.pricePerNight * (() => {
                      const checkInDate = new Date(checkIn);
                      const checkOutDate = new Date(checkOut);
                      const diffTime = Math.abs(checkOutDate - checkInDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return Math.max(1, diffDays);
                    })()).toLocaleString()}</span>
                  </div>
                  {selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== 'room_only' && (
                    <div className="flex justify-between text-sm text-brand-orange">
                      <span>Meal Plan: {(() => {
                        if (selectedProperty.selectedMealPlan === 'breakfast') return 'Bed & Breakfast';
                        if (selectedProperty.selectedMealPlan === 'half_board') return 'Half Board';
                        if (selectedProperty.selectedMealPlan === 'full_board') return 'Full Board';
                        if (selectedProperty.selectedMealPlan === 'all_inclusive') return 'All Inclusive';
                        return '';
                      })()}</span>
                      <span className="font-medium">Included in price</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-bold text-brand-brown">Total Amount</span>
                    <span className="text-2xl font-bold text-brand-orange">R{(selectedProperty.totalPrice || (selectedProperty.pricePerNight * (() => {
                      const checkInDate = new Date(checkIn);
                      const checkOutDate = new Date(checkOut);
                      const diffTime = Math.abs(checkOutDate - checkInDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return Math.max(1, diffDays);
                    })())).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-brown mb-3">Terms & Conditions</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Cancellation Policy</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Free cancellation up to 48 hours before check-in</li>
                      <li>50% refund for cancellations 24-48 hours before check-in</li>
                      <li>No refund for cancellations within 24 hours of check-in</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Payment Terms</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Full payment required at time of booking</li>
                      <li>Credit card details may be required for incidentals</li>
                      <li>Prices include VAT where applicable</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Property Policies</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Valid photo ID and credit card required at check-in</li>
                      <li>Minimum age to check-in: 18 years</li>
                      <li>Pets: Contact property for pet policy</li>
                      <li>Children: All ages welcome (extra charges may apply)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Please inform the property of your estimated arrival time</li>
                      <li>Special requests are subject to availability and may incur additional charges</li>
                      <li>This is a smoke-free property</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information - Separated by Purpose */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-brown mb-3">Need Assistance?</h3>
                
                {/* Property Contact - For Stay-Related Questions */}
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h4 className="font-semibold text-green-900">During Your Stay - Contact Property Directly</h4>
                  </div>
                  <p className="text-sm text-green-800 mb-3">For check-in, room requests, amenities, or on-site assistance:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {selectedProperty.phone && (
                      <div>
                        <p className="text-green-700 font-medium">Property Phone</p>
                        <p className="font-semibold text-green-900">{selectedProperty.phone}</p>
                      </div>
                    )}
                    {selectedProperty.email && (
                      <div>
                        <p className="text-green-700 font-medium">Property Email</p>
                        <p className="font-semibold text-green-900">{selectedProperty.email}</p>
                      </div>
                    )}
                  </div>
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
          </div>
        )}
      </div>

      {/* Property Selector Modal */}
      {showPropertySelector && (
        <AccommodationSelector
          location={location}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onSelectProperty={confirmPropertySelection}
          onSkip={handleSkipPropertySelection}
          onCancel={() => setShowPropertySelector(false)}
        />
      )}
    </div>
  );
}

    export default function AccommodationBooking() {
      return (
        <ErrorBoundary>
          <AccommodationBookingInner />
        </ErrorBoundary>
      );
    }

export default function AccommodationBooking(){
  return (
    <ErrorBoundary>
      <AccommodationBookingInner />
    </ErrorBoundary>
  );
}
