import React, { useState } from 'react';
import BookingNav from '../components/BookingNav';
import FlightSelector from '../components/FlightSelector';
import Button from '../components/ui/Button.jsx';
import { Plane, Calendar, Users, Clock, DollarSign } from 'lucide-react';

export default function FlightBooking(){
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [showFlightSelector, setShowFlightSelector] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flightPending, setFlightPending] = useState(false);
  const [availableFlights, setAvailableFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const minReturn = departDate || today;

  function handleSkipFlightSelection(flights) {
    setAvailableFlights(flights);
    setShowFlightSelector(false);
    setFlightPending(true);
    setSelectedFlight(null);
  }

  async function autoAssignCheapestFlight() {
    if (!availableFlights || availableFlights.length === 0) {
      alert('No available flights to assign. Please try again.');
      return;
    }

    const cheapestFlight = availableFlights.reduce((min, flight) => 
      flight.price < min.price ? flight : min
    );

    await confirmFlightSelection(cheapestFlight);
  }

  function reopenFlightSelector() {
    setFlightPending(false);
    setShowFlightSelector(true);
  }

  async function confirmFlightSelection(flight) {
    setSelectedFlight(flight);
    setShowFlightSelector(false);
    setFlightPending(false);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Flight ${flight.flightNumber} booked successfully!`);
      setLoading(false);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const errors = {};
    if (!from || from.length < 3) errors.from = 'Please enter a valid departure city';
    if (!to || to.length < 3) errors.to = 'Please enter a valid destination';
    if (!departDate) errors.departDate = 'Please select departure date';
    if (isRoundTrip && !returnDate) errors.returnDate = 'Please select return date';
    if (isRoundTrip && returnDate && departDate && new Date(returnDate) <= new Date(departDate)) {
      errors.returnDate = 'Return date must be after departure';
    }
    if (passengers < 1 || passengers > 9) errors.passengers = 'Passengers must be between 1 and 9';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setShowFlightSelector(true);
  }

  return (
    <div className="bg-cream min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BookingNav />
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown">Flight Booking</h1>
          <p className="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">
            Compare flights from multiple airlines and find the best deals for your journey.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Search Flights</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Trip Type */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isRoundTrip}
                  onChange={() => setIsRoundTrip(false)}
                  className="accent-brand-orange"
                />
                <span className="text-sm font-medium">One-way</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isRoundTrip}
                  onChange={() => setIsRoundTrip(true)}
                  className="accent-brand-orange"
                />
                <span className="text-sm font-medium">Round-trip</span>
              </label>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">From (City/Airport) *</label>
                <input
                  type="text"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  placeholder="e.g., Durban (DUR)"
                />
                {formErrors.from && <p className="text-red-500 text-xs mt-1">{formErrors.from}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">To (City/Airport) *</label>
                <input
                  type="text"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  placeholder="e.g., Cape Town (CPT)"
                />
                {formErrors.to && <p className="text-red-500 text-xs mt-1">{formErrors.to}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Departure Date *</label>
                <input
                  type="date"
                  value={departDate}
                  onChange={e => setDepartDate(e.target.value)}
                  min={today}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.departDate && <p className="text-red-500 text-xs mt-1">{formErrors.departDate}</p>}
              </div>

              {isRoundTrip && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-brand-brown">Return Date *</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    min={minReturn}
                    required={isRoundTrip}
                    className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  />
                  {formErrors.returnDate && <p className="text-red-500 text-xs mt-1">{formErrors.returnDate}</p>}
                </div>
              )}
            </div>

            {/* Passengers & Cabin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passengers" className="block mb-2 text-sm font-semibold text-brand-brown">Passengers *</label>
                <input
                  id="passengers"
                  type="number"
                  min={1}
                  max={9}
                  value={passengers}
                  onChange={e => setPassengers(Number(e.target.value))}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.passengers && <p className="text-red-500 text-xs mt-1">{formErrors.passengers}</p>}
              </div>

              <div>
                <label htmlFor="cabinClass" className="block mb-2 text-sm font-semibold text-brand-brown">Cabin Class</label>
                <select
                  id="cabinClass"
                  value={cabinClass}
                  onChange={e => setCabinClass(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                >
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : 'Search Flights'}
            </Button>
          </form>
        </div>

        {flightPending && !loading && (
          <div className="p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-brand-brown mb-1">Booking Pending - Choose Your Flight</h2>
                <p className="text-sm text-brand-russty">Your search details are saved. Select your preferred flight to proceed.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-cream-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Route</p>
                  <p className="font-semibold text-brand-brown">{from} → {to}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Passengers</p>
                  <p className="font-semibold text-brand-brown">{passengers} passenger{passengers !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Departure</p>
                  <p className="font-semibold text-brand-brown">{departDate}</p>
                </div>
                {isRoundTrip && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Return</p>
                    <p className="font-semibold text-brand-brown">{returnDate}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button fullWidth onClick={reopenFlightSelector} className="flex items-center justify-center gap-2">
                <Plane className="h-4 w-4" />
                Pick My Flight
              </Button>
              
              <Button
                fullWidth
                variant="outline"
                onClick={autoAssignCheapestFlight}
                className="flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50"
              >
                <DollarSign className="h-4 w-4" />
                Auto-assign Cheapest Flight
              </Button>
            </div>
          </div>
        )}

        {selectedFlight && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
            <h2 className="text-lg font-bold text-brand-brown mb-4">Booking Confirmed</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Flight:</span> {selectedFlight.airline.name} {selectedFlight.flightNumber}</p>
              <p><span className="font-semibold">Route:</span> {selectedFlight.from} → {selectedFlight.to}</p>
              <p><span className="font-semibold">Cabin:</span> {selectedFlight.cabin.replace('_', ' ')}</p>
              <p><span className="font-semibold">Total Price:</span> R{selectedFlight.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* AI-First Support Section */}
        {selectedFlight && (
          <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mt-6">
            <h2 className="text-xl font-bold text-brand-brown mb-4">Need Assistance?</h2>
            
            {/* Airline Contact - For Flight-Specific Issues */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h4 className="font-semibold text-blue-900">Flight Changes & Check-in - Contact Airline Directly</h4>
              </div>
              <p className="text-sm text-blue-800 mb-3">For seat selection, baggage, check-in, or flight status updates:</p>
              <div className="text-sm">
                <p className="text-blue-700 font-medium">Airline: {selectedFlight.airline.name}</p>
                <p className="text-blue-600">Visit airline website or call their customer service</p>
              </div>
            </div>

            {/* CollEco AI Agent - Primary Support */}
            <div className="bg-orange-50 border-2 border-brand-orange rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-6 w-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className="font-semibold text-brand-brown text-lg">Zola - Your AI Travel Assistant (24/7)</h4>
              </div>
              <p className="text-sm text-brand-brown mb-3">
                Get instant answers from Zola about your booking, changes, cancellations, refunds, payment issues, and recommendations.
              </p>
              <button 
                onClick={() => window.location.href = '/support'}
                className="w-full bg-brand-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with Zola Now
              </button>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Available 24/7 • Instant responses • Handles booking changes & queries
              </p>
            </div>

            {/* Human Support Fallback */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <h4 className="font-medium text-gray-700 text-sm">Need to Speak to a Human?</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">If Zola can't resolve your issue:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Email Support</p>
                  <p className="font-semibold text-gray-700">support@colleco.co.za</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone (Escalations)</p>
                  <p className="font-semibold text-gray-700">+27 31 123 4567</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFlightSelector && (
        <FlightSelector
          from={from}
          to={to}
          departDate={departDate}
          returnDate={isRoundTrip ? returnDate : null}
          passengers={passengers}
          onSelectFlight={confirmFlightSelection}
          onSkip={handleSkipFlightSelection}
          onCancel={() => setShowFlightSelector(false)}
        />
      )}
    </div>
  );
}
