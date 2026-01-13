import React, { useState } from 'react';
import BookingNav from '../components/BookingNav';
import CarHireSelector from '../components/CarHireSelector';
import Button from '../components/ui/Button.jsx';
import { Car, Clock, DollarSign } from 'lucide-react';
import { processBookingRewards } from '../utils/bookingIntegration';

export default function CarBooking(){
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('17:00');
  const [driverAge, setDriverAge] = useState(25);
  const [insuranceLevel, setInsuranceLevel] = useState('basic'); // basic, premium, full
  const [additionalDrivers, setAdditionalDrivers] = useState(0);
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [carPending, setCarPending] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Add print styles
    const style = document.createElement('style');
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

  const today = new Date().toISOString().split('T')[0];
  const minDropoff = pickupDate || today;

  function handleSkipCarSelection(cars) {
    setAvailableCars(cars);
    setShowCarSelector(false);
    setCarPending(true);
    setSelectedCar(null);
  }

  async function autoAssignCheapestCar() {
    if (!availableCars || availableCars.length === 0) {
      alert('No available cars to assign. Please try again.');
      return;
    }

    const cheapestCar = availableCars.reduce((min, car) => 
      car.pricePerDay < min.pricePerDay ? car : min
    );

    await confirmCarSelection(cheapestCar);
  }

  function reopenCarSelector() {
    setCarPending(false);
    setShowCarSelector(true);
  }

  async function confirmCarSelection(car) {
    setSelectedCar(car);
    setShowCarSelector(false);
    setCarPending(false);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate booking details
      const pickupDateObj = new Date(pickupDate);
      const dropoffDateObj = new Date(dropoffDate);
      const days = Math.ceil((dropoffDateObj - pickupDateObj) / (1000 * 60 * 60 * 24));
      const totalPrice = car.pricePerDay * days;
      
      // Create booking object for loyalty integration
      const booking = {
        id: `CAR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'car_hire',
        amount: totalPrice,
        userId: localStorage.getItem('colleco.user.id') || 'guest_' + Date.now(),
        checkInDate: pickupDateObj,
        carId: car.id,
        make: car.make,
        model: car.model,
        pickupLocation,
        dropoffLocation,
        days,
        insuranceLevel,
        additionalDrivers
      };
      
      // Process loyalty rewards and track booking
      const result = processBookingRewards(booking);
      
      alert(`Car "${car.make} ${car.model}" booked successfully! You earned ${result.pointsEarned} loyalty points! 🎉`);
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
    if (!pickupLocation || pickupLocation.length < 3) errors.pickupLocation = 'Please enter a valid pickup location';
    if (!dropoffLocation || dropoffLocation.length < 3) errors.dropoffLocation = 'Please enter a valid dropoff location';
    if (!pickupDate) errors.pickupDate = 'Please select pickup date';
    if (!dropoffDate) errors.dropoffDate = 'Please select dropoff date';
    if (dropoffDate && pickupDate && new Date(dropoffDate) <= new Date(pickupDate)) {
      errors.dropoffDate = 'Dropoff must be after pickup';
    }
    if (driverAge < 18 || driverAge > 99) errors.driverAge = 'Driver must be between 18 and 99 years old';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setShowCarSelector(true);
  }

  return (
    <div className="bg-cream min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BookingNav />
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown">Car Hire</h1>
          <p className="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">
            Choose from our wide selection of vehicles with flexible pickup and dropoff options.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Search Available Cars</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Location *</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  placeholder="e.g., King Shaka Airport"
                />
                {formErrors.pickupLocation && <p className="text-red-500 text-xs mt-1">{formErrors.pickupLocation}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Dropoff Location *</label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={e => setDropoffLocation(e.target.value)}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  placeholder="e.g., Durban City Centre"
                />
                {formErrors.dropoffLocation && <p className="text-red-500 text-xs mt-1">{formErrors.dropoffLocation}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Date *</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  min={today}
                  required
                  className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                />
                {formErrors.pickupDate && <p className="text-red-500 text-xs mt-1">{formErrors.pickupDate}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Dropoff Date *</label>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={e => setDropoffDate(e.target.value)}
                  min={minDropoff}
                  required
                  className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                />
                {formErrors.dropoffDate && <p className="text-red-500 text-xs mt-1">{formErrors.dropoffDate}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Dropoff Time</label>
                <input
                  type="time"
                  value={dropoffTime}
                  onChange={e => setDropoffTime(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:shadow-md transition-all duration-200 hover:border-brand-orange/50 hover:shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="driverAge" className="block mb-2 text-sm font-semibold text-brand-brown">Driver Age *</label>
                <input
                  id="driverAge"
                  type="number"
                  min={18}
                  max={99}
                  value={driverAge}
                  onChange={e => setDriverAge(Number(e.target.value))}
                  required
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.driverAge && <p className="text-red-500 text-xs mt-1">{formErrors.driverAge}</p>}
              </div>

              <div>
                <label htmlFor="insuranceLevel" className="block mb-2 text-sm font-semibold text-brand-brown">Insurance Level</label>
                <select
                  id="insuranceLevel"
                  value={insuranceLevel}
                  onChange={e => setInsuranceLevel(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="full">Full Cover</option>
                </select>
              </div>

              <div>
                <label htmlFor="additionalDrivers" className="block mb-2 text-sm font-semibold text-brand-brown">Additional Drivers</label>
                <input
                  id="additionalDrivers"
                  type="number"
                  min={0}
                  max={3}
                  value={additionalDrivers}
                  onChange={e => setAdditionalDrivers(Number(e.target.value))}
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : 'Search Available Cars'}
            </Button>
          </form>
        </div>

        {carPending && !loading && (
          <div className="p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-brand-brown mb-1">Booking Pending - Choose Your Car</h2>
                <p className="text-sm text-brand-russty">Your search details are saved. Select your preferred vehicle to proceed.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-cream-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pickup</p>
                  <p className="font-semibold text-brand-brown">{pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dropoff</p>
                  <p className="font-semibold text-brand-brown">{dropoffLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dates</p>
                  <p className="font-semibold text-brand-brown">{pickupDate} to {dropoffDate}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button fullWidth onClick={reopenCarSelector} className="flex items-center justify-center gap-2">
                <Car className="h-4 w-4" />
                Pick My Car
              </Button>
              
              <Button
                fullWidth
                variant="outline"
                onClick={autoAssignCheapestCar}
                className="flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50"
              >
                <DollarSign className="h-4 w-4" />
                Auto-assign Cheapest Car
              </Button>
            </div>
          </div>
        )}

        {selectedCar && !loading && (
          <div className="space-y-6">
            {/* Booking Confirmation Card */}
            <div className="bg-white rounded-xl shadow-sm border border-cream-border" id="booking-confirmation">
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-brown mb-1">Booking Confirmed</h2>
                    <p className="text-sm text-gray-600">Confirmation ID: CAR-{Date.now().toString().slice(-8)}</p>
                  </div>
                  <ShareButton 
                    bookingId={'CAR-' + Date.now().toString().slice(-8)}
                    serviceType="car"
                    confirmationId={'CAR-' + Date.now().toString().slice(-8)}
                    shareData={{
                      vehicle: `${selectedCar.make} ${selectedCar.model}`,
                      category: selectedCar.category,
                      pricePerDay: selectedCar.pricePerDay,
                      totalPrice: selectedCar.totalPrice
                    }}
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <p><span className="font-semibold">Vehicle:</span> {selectedCar.make} {selectedCar.model}</p>
                  <p><span className="font-semibold">Category:</span> {selectedCar.category}</p>
                  <p><span className="font-semibold">Price per Day:</span> R{selectedCar.pricePerDay}</p>
                  <p><span className="font-semibold">Total:</span> R{selectedCar.totalPrice}</p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions - Rental Policies */}
            <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
              <h2 className="text-lg font-bold text-brand-brown mb-4">Rental Terms & Conditions</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Cancellation Policy</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Free cancellation up to 48 hours before pickup</li>
                      <li>50% refund for cancellations 24-48 hours before pickup</li>
                      <li>No refund for cancellations within 24 hours of pickup</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Payment Terms</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Full rental amount charged at booking</li>
                      <li>Security deposit required at pickup (refunded after return)</li>
                      <li>Fuel and damage waiver options available</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Rental Company Policies</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Valid driver&apos;s license required (minimum 21 years old)</li>
                      <li>International license or IDP may be required</li>
                      <li>Vehicle inspection at pickup and return is mandatory</li>
                      <li>Insurance coverage included; excess may apply</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-brown mb-1">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Pickup timing: Arrive 15 minutes before booked time</li>
                      <li>Return vehicle with full fuel tank to avoid surcharge</li>
                      <li>Report any damage immediately to rental company</li>
                      <li>Child car seats available upon request</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information - Separated by Purpose */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-brown mb-3">Need Assistance?</h3>
                
                {/* Rental Company Contact - For Vehicle-Specific Issues */}
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h4 className="font-semibold text-green-900">During Your Rental - Contact Company Directly</h4>
                  </div>
                  <p className="text-sm text-green-800 mb-3">For pickup, vehicle issues, roadside assistance, or extensions:</p>
                  <div className="text-sm mb-3">
                    <p className="text-green-700 font-medium">Rental Company Contact Info</p>
                    <p className="text-green-600">Available at pickup location or in your confirmation email</p>
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
                    Message Rental Provider
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
          </div>
        )}


      </div>

      {showCarSelector && (
        <CarHireSelector
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          pickupDate={pickupDate}
          dropoffDate={dropoffDate}
          onSelectCar={confirmCarSelection}
          onSkip={handleSkipCarSelection}
          onCancel={() => setShowCarSelector(false)}
        />
      )}
    </div>
  );
}
