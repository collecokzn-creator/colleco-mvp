import React, { useState } from 'react';
import BookingNav from '../components/BookingNav';
import CarHireSelector from '../components/CarHireSelector';
import Button from '../components/ui/Button.jsx';
import { Car, Calendar, Clock, DollarSign } from 'lucide-react';

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
      alert(`Car "${car.make} ${car.model}" booked successfully!`);
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
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.pickupDate && <p className="text-red-500 text-xs mt-1">{formErrors.pickupDate}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Pickup Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
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
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                />
                {formErrors.dropoffDate && <p className="text-red-500 text-xs mt-1">{formErrors.dropoffDate}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-brand-brown">Dropoff Time</label>
                <input
                  type="time"
                  value={dropoffTime}
                  onChange={e => setDropoffTime(e.target.value)}
                  className="w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
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
          <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
            <h2 className="text-lg font-bold text-brand-brown mb-4">Booking Confirmed</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Vehicle:</span> {selectedCar.make} {selectedCar.model}</p>
              <p><span className="font-semibold">Category:</span> {selectedCar.category}</p>
              <p><span className="font-semibold">Price per Day:</span> R{selectedCar.pricePerDay}</p>
              <p><span className="font-semibold">Total:</span> R{selectedCar.totalPrice}</p>
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
