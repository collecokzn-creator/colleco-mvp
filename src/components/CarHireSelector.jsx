/* eslint-disable no-unused-vars, react/no-unescaped-entities */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  DollarSign, 
  TrendingUp, 
  Car,
  Shield, 
  Award,
  Heart,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Fuel,
  Gauge,
  Users,
  Luggage,
  Snowflake,
  Radio,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CarHireSelector({ 
  pickupLocation,
  dropoffLocation,
  pickupDate,
  dropoffDate,
  onSelectCar,
  onSkip,
  onCancel 
}) {
  // Local debug logger — enabled in dev or when `VITE_DEBUG_CARHIRE=1`
  const _log = (level, ...args) => {
    if (!(import.meta.env.DEV || import.meta?.env?.VITE_DEBUG_CARHIRE === '1')) return;
    // eslint-disable-next-line no-console
    if (level === 'error') console.error(...args);
    // eslint-disable-next-line no-console
    else if (level === 'warn') console.warn(...args);
    // eslint-disable-next-line no-console
    else console.log(...args);
  };
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, economy, compact, suv, luxury
  const [sortBy, setSortBy] = useState('recommended'); // recommended, price_low, price_high, rating
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [preferredTransmission, setPreferredTransmission] = useState(''); // automatic, manual
  const [preferredFuelType, setPreferredFuelType] = useState(''); // petrol, diesel, electric, hybrid
  const [minSeats, setMinSeats] = useState(0);
  const [requiredFeatures, setRequiredFeatures] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchAvailableCars();
    loadFavoriteCars();
  }, [pickupLocation, dropoffLocation, pickupDate, dropoffDate]);

  const fetchAvailableCars = async () => {
    setLoading(true);
    const useDemo = (import.meta?.env?.VITE_DEMO_CARHIRE ?? '1') === '1';
    setErrorMsg('');

    const generateMockCars = () => {
      const carData = [
        { make: 'Toyota', model: 'Corolla', year: 2023, category: 'Compact', seats: 5, luggage: 2, transmission: 'Automatic', fuelType: 'Petrol' },
        { make: 'VW', model: 'Polo', year: 2024, category: 'Economy', seats: 5, luggage: 2, transmission: 'Manual', fuelType: 'Petrol' },
        { make: 'Nissan', model: 'X-Trail', year: 2023, category: 'SUV', seats: 7, luggage: 4, transmission: 'Automatic', fuelType: 'Diesel' },
        { make: 'Hyundai', model: 'i20', year: 2024, category: 'Economy', seats: 5, luggage: 2, transmission: 'Manual', fuelType: 'Petrol' },
        { make: 'Toyota', model: 'Fortuner', year: 2023, category: 'SUV', seats: 7, luggage: 5, transmission: 'Automatic', fuelType: 'Diesel' },
        { make: 'BMW', model: '3 Series', year: 2024, category: 'Luxury', seats: 5, luggage: 3, transmission: 'Automatic', fuelType: 'Petrol' },
        { make: 'Mercedes', model: 'C-Class', year: 2023, category: 'Luxury', seats: 5, luggage: 3, transmission: 'Automatic', fuelType: 'Petrol' },
        { make: 'Renault', model: 'Kwid', year: 2024, category: 'Economy', seats: 4, luggage: 1, transmission: 'Manual', fuelType: 'Petrol' },
        { make: 'Kia', model: 'Sportage', year: 2023, category: 'SUV', seats: 5, luggage: 4, transmission: 'Automatic', fuelType: 'Diesel' },
        { make: 'Honda', model: 'Civic', year: 2024, category: 'Compact', seats: 5, luggage: 2, transmission: 'Automatic', fuelType: 'Petrol' },
        { make: 'Tesla', model: 'Model 3', year: 2024, category: 'Luxury', seats: 5, luggage: 2, transmission: 'Automatic', fuelType: 'Electric' },
        { make: 'Toyota', model: 'Prius', year: 2023, category: 'Compact', seats: 5, luggage: 2, transmission: 'Automatic', fuelType: 'Hybrid' }
      ];
      const featuresList = [
        ['AC', 'GPS', 'Bluetooth', 'USB'],
        ['AC', 'Bluetooth', 'USB'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Cruise Control'],
        ['AC', 'USB'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Leather Seats', '4x4'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Leather Seats', 'Sunroof'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Leather Seats', 'Premium Sound'],
        ['AC'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Parking Sensors'],
        ['AC', 'Bluetooth', 'USB', 'Apple CarPlay'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Autopilot', 'Premium Sound'],
        ['AC', 'GPS', 'Bluetooth', 'USB', 'Eco Mode']
      ];
      const basePrice = 350;
      const pickupDt = new Date(pickupDate);
      const dropoffDt = new Date(dropoffDate);
      const days = Math.max(1, Math.ceil((dropoffDt - pickupDt) / (1000 * 60 * 60 * 24)));
      return carData.map((car, index) => {
        const features = featuresList[index % featuresList.length];
        let priceMultiplier = 1.0;
        if (car.category === 'Luxury') priceMultiplier = 2.5;
        else if (car.category === 'SUV') priceMultiplier = 1.8;
        else if (car.category === 'Compact') priceMultiplier = 1.2;
        else if (car.category === 'Economy') priceMultiplier = 0.8;
        if (car.transmission === 'Automatic') priceMultiplier += 0.2;
        if (car.fuelType === 'Electric') priceMultiplier += 0.4;
        if (car.fuelType === 'Hybrid') priceMultiplier += 0.3;
        if (car.year >= 2024) priceMultiplier += 0.15;
        priceMultiplier += (Math.random() * 0.2 - 0.1);
        const pricePerDay = Math.round(basePrice * priceMultiplier / 10) * 10;
        const totalPrice = pricePerDay * days;
        const rating = 3.8 + Math.random() * 1.2;
        const reviewCount = 30 + Math.floor(Math.random() * 470);
        const safetyRating = 4 + Math.floor(Math.random() * 2);
        const isPremium = car.category === 'Luxury' && car.year >= 2023;
        const insuranceIncluded = Math.random() > 0.5;
        const isPopular = reviewCount > 300 && rating >= 4.5;
        return {
          id: `CAR-${Date.now()}-${index}`,
          ...car,
          features,
          pricePerDay,
          totalPrice,
          days,
          rating: Number(rating.toFixed(1)),
          reviewCount,
          safetyRating,
          isPremium,
          insuranceIncluded,
          isPopular,
          imageUrl: null
        };
      });
    };

    try {
      _log('log', '[CarHireSelector] Fetching cars for:', { pickupLocation, dropoffLocation, pickupDate, dropoffDate });
      const response = await fetch('/api/carhire/available-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation,
          dropoffLocation,
          pickupDate,
          dropoffDate
        })
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.cars || [];
        setCars(list.length ? list : (useDemo ? generateMockCars() : []));
        if (!list.length && useDemo) {
          setErrorMsg('Live car hire providers unavailable. Showing demo cars.');
        }
      } else {
        _log('error', '[CarHireSelector] Failed to fetch cars');
        setCars(useDemo ? generateMockCars() : []);
        setErrorMsg('Unable to load live cars. Showing demo cars.');
      }
    } catch (error) {
      _log('error', '[CarHireSelector] Error fetching cars:', error);
      setCars(useDemo ? generateMockCars() : []);
      setErrorMsg('Network error. Showing demo cars.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteCars = () => {
    try {
      const saved = localStorage.getItem('colleco.favoriteCars');
      if (saved) {
        setFavoriteCars(JSON.parse(saved));
      }
    } catch (error) {
      _log('error', '[CarHireSelector] Error loading favorites:', error);
    }
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollTop > 0);
    setCanScrollRight(
      container.scrollTop < container.scrollHeight - container.clientHeight - 10
    );
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      
      // Add keyboard arrow support
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          scrollUp();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          scrollDown();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [cars]);

  const scrollUp = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: -300, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: 300, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (carId) => {
    const newFavorites = favoriteCars.includes(carId)
      ? favoriteCars.filter(id => id !== carId)
      : [...favoriteCars, carId];
    
    setFavoriteCars(newFavorites);
    localStorage.setItem('colleco.favoriteCars', JSON.stringify(newFavorites));
  };

  // Auto Smart Scoring System
  const scoreCar = (car) => {
    let score = 0;
    
    // Safety & Reliability (40% weight)
    const safetyScore = (car.safetyRating / 5) * 20 + (car.rating / 5) * 20;
    score += safetyScore;
    
    // Value for Money (35% weight)
    const avgPrice = cars.reduce((sum, c) => sum + c.pricePerDay, 0) / cars.length;
    const priceScore = (1 - (car.pricePerDay / (avgPrice * 1.5))) * 35;
    score += Math.max(0, priceScore);
    
    // Customer Satisfaction (25% weight)
    const reviewScore = (car.reviewCount / 500) * 5;
    const ratingScore = (car.rating / 5) * 20;
    score += Math.min(25, reviewScore + ratingScore);
    
    // Bonus points
    if (car.transmission === 'Automatic') score += 3;
    if (car.fuelType === 'Electric' || car.fuelType === 'Hybrid') score += 5;
    if (car.features.includes('GPS')) score += 2;
    if (car.features.includes('AC')) score += 2;
    if (car.insuranceIncluded) score += 3;
    if (car.isPremium) score += 5;
    
    return Math.round(score);
  };

  const autoPickBestCar = () => {
    if (cars.length === 0) return;
    
    const scoredCars = cars.map(car => ({
      ...car,
      smartScore: scoreCar(car)
    }));
    
    const best = scoredCars.reduce((max, car) => 
      car.smartScore > max.smartScore ? car : max
    );
    
    setSelectedCar(best);
    onSelectCar(best);
  };

  const getFilteredAndSortedCars = () => {
    let filtered = [...cars];
    
    // Apply transmission filter (case-insensitive partial match)
    if (preferredTransmission) {
      filtered = filtered.filter(c => 
        c.transmission && c.transmission.toLowerCase().includes(preferredTransmission.toLowerCase())
      );
    }
    
    // Apply fuel type filter (case-insensitive partial match)
    if (preferredFuelType) {
      filtered = filtered.filter(c => 
        c.fuelType && c.fuelType.toLowerCase().includes(preferredFuelType.toLowerCase())
      );
    }
    
    // Apply seats filter
    if (minSeats > 0) {
      filtered = filtered.filter(c => c.seats >= minSeats);
    }
    
    // Apply features filter (case-insensitive partial match)
    if (requiredFeatures.length > 0) {
      filtered = filtered.filter(c => 
        c.features && requiredFeatures.every(feature => 
          c.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
        )
      );
    }
    
    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'favorites') {
        filtered = filtered.filter(c => favoriteCars.includes(c.id));
      } else if (filterBy === 'premium') {
        filtered = filtered.filter(c => c.isPremium);
      } else {
        filtered = filtered.filter(c => c.category.toLowerCase() === filterBy);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.pricePerDay - b.pricePerDay;
        case 'price_high':
          return b.pricePerDay - a.pricePerDay;
        case 'rating':
          return b.rating - a.rating;
        case 'recommended':
        default:
          return scoreCar(b) - scoreCar(a);
      }
    });
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return `R${amount.toLocaleString()}`;
  };

  const filteredCars = getFilteredAndSortedCars();

  // Calculate rental duration in days
  const calculateRentalDays = () => {
    if (!pickupDate || !dropoffDate) return 1;
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const diffTime = Math.abs(dropoff - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const rentalDays = calculateRentalDays();

  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600">
          <h2 className="text-2xl font-bold text-white mb-2">Pick My Car</h2>
          <p className="text-white/90 text-sm">
            {pickupLocation} • {pickupDate} to {dropoffDate} • <span className="font-semibold">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="p-4 border-b bg-gray-50 space-y-4">
          {/* Smart Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={autoPickBestCar}
              className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Award className="h-4 w-4" />
              Auto Smart Pick
            </button>
          </div>

          {/* Preference Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Transmission
              </label>
              <select
                value={preferredTransmission}
                onChange={(e) => setPreferredTransmission(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
              <select
                value={preferredFuelType}
                onChange={(e) => setPreferredFuelType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Minimum Seats
              </label>
              <select
                value={minSeats}
                onChange={(e) => setMinSeats(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="0">Any</option>
                <option value="4">4+ Seats</option>
                <option value="5">5+ Seats</option>
                <option value="7">7+ Seats</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Required Features
              </label>
              <select
                multiple
                value={requiredFeatures}
                onChange={(e) => setRequiredFeatures(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
                size={3}
              >
                <option value="AC">Air Conditioning</option>
                <option value="GPS">GPS Navigation</option>
                <option value="Bluetooth">Bluetooth</option>
                <option value="USB">USB Charging</option>
              </select>
            </div>
          </div>

          {/* Filter & Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="all">All Cars</option>
                <option value="favorites">Favorites</option>
                <option value="economy">Economy</option>
                <option value="compact">Compact</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
                <option value="premium">Premium Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <span className="text-sm text-gray-600 ml-auto">
              {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>

        {/* Cars List */}
        <div className="flex-1 overflow-y-auto p-4 relative" ref={scrollContainerRef}>
          {errorMsg && (
            <div className="mb-3 p-3 bg-brand-orange/10 border-l-4 border-brand-orange rounded">
              <strong className="text-brand-orange">Notice:</strong>
              <span className="ml-2 text-sm text-brand-brown">{errorMsg}</span>
            </div>
          )}
          {/* Scroll Up Button */}
          {canScrollLeft && (
            <button
              onClick={scrollUp}
              className="fixed top-1/2 left-4 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200"
              aria-label="Scroll up"
            >
              <ChevronLeft className="h-6 w-6 text-brand-orange rotate-90" />
            </button>
          )}

          {/* Scroll Down Button */}
          {canScrollRight && (
            <button
              onClick={scrollDown}
              className="fixed bottom-32 left-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200"
              aria-label="Scroll down"
            >
              <ChevronRight className="h-6 w-6 text-brand-orange rotate-90" />
            </button>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cars match your criteria</p>
              <button
                onClick={() => {
                  setFilterBy('all');
                  setPreferredTransmission('');
                  setPreferredFuelType('');
                  setMinSeats(0);
                  setRequiredFeatures([]);
                }}
                className="mt-4 text-brand-orange hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredCars.map((car) => (
              <div
                key={car.id}
                onClick={() => setSelectedCar(car)}
                className={`mb-4 border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedCar?.id === car.id
                    ? 'border-brand-orange bg-orange-50'
                    : 'border-gray-200 hover:border-brand-orange/50'
                }`}
              >
                <div className="flex gap-2 sm:gap-4">
                  {/* Car Image */}
                  <div className="w-24 sm:w-40 h-20 sm:h-28 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    {car.imageUrl ? (
                      <img 
                        src={car.imageUrl} 
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-brand-brown">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-sm text-gray-600">{car.year} • {car.category}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(car.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favoriteCars.includes(car.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-brand-gold" />
                        <span className="font-semibold">{car.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({car.reviewCount} reviews)</span>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{car.seats} seats</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Luggage className="h-4 w-4" />
                        <span>{car.luggage} bags</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        <span>{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4" />
                        <span>{car.fuelType}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {car.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"
                        >
                          {feature === 'AC' && <Snowflake className="h-3 w-3" />}
                          {feature === 'Bluetooth' && <Radio className="h-3 w-3" />}
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {car.isPremium && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Premium Vehicle
                        </span>
                      )}
                      {car.insuranceIncluded && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Insurance Included
                        </span>
                      )}
                      {car.isPopular && (
                        <span className="px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Popular Choice
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-brand-orange">
                        {formatCurrency(car.pricePerDay)}
                      </span>
                      <span className="text-sm text-gray-600">per day</span>
                      {car.totalPrice && (
                        <span className="text-xs text-gray-500 ml-auto">
                          Total: {formatCurrency(car.totalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Cancel
            </button>
            
            {onSkip && (
              <button
                onClick={() => onSkip(cars)}
                className="px-4 py-2 border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors text-sm"
              >
                Skip for now
              </button>
            )}
          </div>
          
          <button
            onClick={() => selectedCar && onSelectCar(selectedCar)}
            disabled={!selectedCar}
            className="px-3 sm:px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Car {selectedCar && `- ${formatCurrency(selectedCar.pricePerDay)}/day`}
          </button>
        </div>
      </div>
    </div>
  );
}
