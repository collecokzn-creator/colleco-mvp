import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  DollarSign,
  TrendingUp,
  Home,
  Shield,
  Award,
  Heart,
  MapPin,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Wifi,
  Coffee,
  Utensils,
  Waves,
  Dumbbell,
  ParkingCircle,
  X,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Sparkles,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AccommodationSelector({ onSelectProperty, onSkip, onCancel, location, checkIn, checkOut, guests }) {

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Enhanced filters
  const [minStars, setMinStars] = useState(0);
  const [maxStars, setMaxStars] = useState(5);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [requiredAmenities, setRequiredAmenities] = useState([]);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [mealPlanFilter, setMealPlanFilter] = useState(''); // Filter: '', 'room_only', 'breakfast', 'half_board', 'full_board'
  const [propertyMealPlans, setPropertyMealPlans] = useState({}); // Store selected meal plan per property
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', or 'map'
  const [hoveredProperty, setHoveredProperty] = useState(null);
  
  // Google Maps search URL
  const googleMapsAreaUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=hotels+accommodation+${encodeURIComponent(location)}`
    : null;

  useEffect(() => {
    const saved = localStorage.getItem('colleco.favoriteProperties');
    if (saved) {
      try {
        setFavoriteProperties(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!location || !checkIn || !checkOut || !guests) return;
    setLoading(true);
    
    const generateMockProperties = () => {
      const propertyTypes = ['Hotel', 'Guesthouse', 'B&B', 'Lodge', 'Resort', 'Apartment'];
      const propertyNames = [
        'The Oyster Box', 'Beverly Hills Hotel', 'Southern Sun', 'Protea Hotel',
        'Garden Court', 'African Pride', 'City Lodge', 'Premier Hotel',
        'Coastlands Musgrave', 'Quarters Hotel', 'Durban Hilton', 'Holiday Inn',
        'Radisson Blu', 'The Edward Hotel', 'Blue Waters Hotel'
      ];
      const locations = [
        'Umhlanga Rocks, Durban', 'Durban Beachfront', 'Gateway, Umhlanga',
        'Ballito, KZN', 'Durban North', 'Morningside, Durban',
        'Westville, Durban', 'Pinetown, Durban', 'Umdloti Beach'
      ];
      const amenitiesList = [
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Restaurant', 'Gym', 'Spa', 'Room Service'],
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Bar', 'Beach Access'],
        ['Free WiFi', 'Breakfast', 'Parking', 'Garden', 'BBQ'],
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Restaurant', 'Gym', 'Beach Access'],
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Conference Room', 'Business Center'],
        ['Free WiFi', 'Breakfast', 'Parking', 'Pet Friendly', 'Laundry', 'Kitchen'],
        ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Beach Access', 'Room Service']
      ];

      const basePrice = 1200;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      const propertyCount = 12 + Math.floor(Math.random() * 6);
      
      return Array.from({ length: propertyCount }, (_, index) => {
        const stars = 3 + Math.floor(Math.random() * 3);
        const type = propertyTypes[index % propertyTypes.length];
        const name = propertyNames[index % propertyNames.length];
        const address = locations[index % locations.length];
        const amenities = amenitiesList[index % amenitiesList.length];
        
        let priceMultiplier = 0.5 + (stars / 5) * 1.5;
        if (type === 'Resort' || type === 'Lodge') priceMultiplier += 0.3;
        if (amenities.includes('Spa')) priceMultiplier += 0.2;
        if (amenities.includes('Beach Access')) priceMultiplier += 0.15;
        priceMultiplier += (Math.random() * 0.3 - 0.15);
        
        const pricePerNight = Math.round(basePrice * priceMultiplier / 50) * 50;
        const totalPrice = pricePerNight * nights;
        const rating = 3.5 + Math.random() * 1.5;
        const reviewCount = 50 + Math.floor(Math.random() * 950);
        const distanceKm = 0.5 + Math.random() * 15;
        
        const isPremier = stars === 5 && rating >= 4.7;
        const ecoFriendly = Math.random() > 0.7;
        const isPopular = reviewCount > 500 && rating >= 4.5;
        const hasFreeCancellation = Math.random() > 0.4;
        const hasBreakfast = amenities.includes('Breakfast');
        
        // Define available meal plans based on property type and stars
        const availableMealPlans = ['room_only'];
        if (stars >= 2) availableMealPlans.push('breakfast');
        if (stars >= 3 && (type === 'Hotel' || type === 'Resort' || type === 'Lodge')) {
          availableMealPlans.push('half_board');
        }
        if (stars >= 4 && (type === 'Hotel' || type === 'Resort')) {
          availableMealPlans.push('full_board');
        }
        if (stars === 5 && type === 'Resort') {
          availableMealPlans.push('all_inclusive');
        }
        
        // Generate realistic coordinates based on location
        const baseCoords = { lat: -29.8587, lng: 31.0218 }; // Durban center
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        
        return {
          id: `PROP-${Date.now()}-${index}`,
          name,
          type,
          stars,
          address,
          rating: Number(rating.toFixed(1)),
          reviewCount,
          pricePerNight,
          totalPrice,
          amenities,
          isPremier,
          ecoFriendly,
          isPopular,
          hasFreeCancellation,
          hasBreakfast,
          availableMealPlans,
          distanceKm: Number(distanceKm.toFixed(1)),
          imageUrl: null,
          checkIn,
          checkOut,
          nights,
          availableRooms: 1 + Math.floor(Math.random() * 5),
          lastBookedMinutesAgo: Math.random() > 0.6 ? Math.floor(Math.random() * 120) : null,
          coordinates: {
            lat: baseCoords.lat + latOffset,
            lng: baseCoords.lng + lngOffset
          }
        };
      });
    };

    const useDemo = (import.meta?.env?.VITE_DEMO_ACCOMMODATION ?? '1') === '1';

    fetch('/api/accommodation/available-properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, checkIn, checkOut, guests })
    })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('bad status')))
      .then(data => {
        const props = data.properties || [];
        const finalProps = props.length ? props : (useDemo ? generateMockProperties() : []);
        setProperties(finalProps);
        // Auto-set price range based on results
        if (finalProps.length) {
          const prices = finalProps.map(p => p.pricePerNight);
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
      })
      .catch(() => {
        const mockProps = useDemo ? generateMockProperties() : [];
        setProperties(mockProps);
        if (mockProps.length) {
          const prices = mockProps.map(p => p.pricePerNight);
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
      })
      .finally(() => setLoading(false));
  }, [location, checkIn, checkOut, guests]);

  const toggleFavorite = (propertyId) => {
    const updated = favoriteProperties.includes(propertyId)
      ? favoriteProperties.filter(id => id !== propertyId)
      : [...favoriteProperties, propertyId];
    setFavoriteProperties(updated);
    localStorage.setItem('colleco.favoriteProperties', JSON.stringify(updated));
  };

  const getFilteredAndSortedProperties = () => {
    let filtered = [...properties];

    // Apply filters
    if (minStars > 0) filtered = filtered.filter(p => p.stars >= minStars);
    if (maxStars < 5) filtered = filtered.filter(p => p.stars <= maxStars);
    if (minRating > 0) filtered = filtered.filter(p => p.rating >= minRating);
    if (propertyTypes.length > 0) filtered = filtered.filter(p => propertyTypes.includes(p.type));
    if (requiredAmenities.length > 0) {
      filtered = filtered.filter(p => 
        requiredAmenities.every(a => (p.amenities || []).includes(a))
      );
    }
    if (freeCancellation) filtered = filtered.filter(p => p.hasFreeCancellation);
    if (breakfastIncluded) filtered = filtered.filter(p => p.hasBreakfast);
    if (mealPlanFilter) {
      filtered = filtered.filter(p => 
        p.availableMealPlans && p.availableMealPlans.includes(mealPlanFilter)
      );
    }
    
    // Price range filter
    filtered = filtered.filter(p => 
      p.pricePerNight >= priceRange[0] && p.pricePerNight <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'stars':
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        break;
      case 'recommended':
      default:
        // Smart scoring: rating (40%) + stars (30%) + popularity (20%) + value (10%)
        filtered.sort((a, b) => {
          const scoreA = (a.rating / 5 * 40) + (a.stars / 5 * 30) + 
                        (Math.min(a.reviewCount / 1000, 1) * 20) +
                        (1 - (a.pricePerNight / 10000)) * 10;
          const scoreB = (b.rating / 5 * 40) + (b.stars / 5 * 30) + 
                        (Math.min(b.reviewCount / 1000, 1) * 20) +
                        (1 - (b.pricePerNight / 10000)) * 10;
          return scoreB - scoreA;
        });
    }

    return filtered;
  };

  const clearFilters = () => {
    setMinStars(0);
    setMaxStars(5);
    setMinRating(0);
    setPropertyTypes([]);
    setRequiredAmenities([]);
    setFreeCancellation(false);
    setBreakfastIncluded(false);
    setMealPlanFilter('');
    if (properties.length) {
      const prices = properties.map(p => p.pricePerNight);
      setPriceRange([Math.min(...properties.map(p => p.pricePerNight)), Math.max(...properties.map(p => p.pricePerNight))]);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (minStars > 0) count++;
    if (maxStars < 5) count++;
    if (minRating > 0) count++;
    if (propertyTypes.length > 0) count++;
    if (requiredAmenities.length > 0) count++;
    if (freeCancellation) count++;
    if (breakfastIncluded) count++;
    if (mealPlanFilter) count++;
    return count;
  };

  const formatCurrency = (amount) => `R${amount.toLocaleString()}`;

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Exceptional';
    if (rating >= 4.0) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 3.0) return 'Good';
    return 'Average';
  };

  const getMealPlanLabel = (plan) => {
    const labels = {
      'room_only': 'Room Only',
      'breakfast': 'Bed & Breakfast',
      'half_board': 'Half Board (B&B + Dinner)',
      'full_board': 'Full Board (B, L & D)',
      'all_inclusive': 'All Inclusive'
    };
    return labels[plan] || plan;
  };

  const getMealPlanPrice = (basePrice, plan) => {
    const multipliers = {
      'room_only': 1.0,
      'breakfast': 1.15,
      'half_board': 1.35,
      'full_board': 1.55,
      'all_inclusive': 1.85
    };
    return Math.round(basePrice * (multipliers[plan] || 1.0) / 50) * 50;
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-3 w-3" />;
    if (lower.includes('pool')) return <Waves className="h-3 w-3" />;
    if (lower.includes('breakfast') || lower.includes('restaurant')) return <Utensils className="h-3 w-3" />;
    if (lower.includes('parking')) return <ParkingCircle className="h-3 w-3" />;
    if (lower.includes('gym')) return <Dumbbell className="h-3 w-3" />;
    if (lower.includes('coffee') || lower.includes('bar')) return <Coffee className="h-3 w-3" />;
    return <CheckCircle2 className="h-3 w-3" />;
  };

  const filteredProperties = getFilteredAndSortedProperties();
  const activeFilters = getActiveFilterCount();

  const demoModeHint = (import.meta?.env?.VITE_DEMO_ACCOMMODATION ?? '1') === '1' && (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
      <Sparkles className="h-4 w-4 inline mr-2" />
      Demo mode active - showing sample properties
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full flex flex-col my-4">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Find Your Perfect Stay</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{checkIn} → {checkOut}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{guests} guest{guests !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                showFilters || activeFilters > 0
                  ? 'border-brand-orange bg-brand-orange text-white'
                  : 'border-gray-300 bg-white hover:border-brand-orange'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {activeFilters > 0 && (
                <span className="bg-white text-brand-orange px-2 py-0.5 rounded-full text-xs font-bold">
                  {activeFilters}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="stars">Most Stars</option>
              <option value="distance">Closest First</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Grid view"
            >
              <Home className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Map view"
            >
              <MapIcon className="h-5 w-5" />
            </button>
          </div>

          <span className="text-sm text-gray-600">
            {filteredProperties.length} of {properties.length} properties
          </span>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b bg-cream/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Star Rating</label>
                <div className="flex gap-2">
                  {[3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinStars(minStars === star ? 0 : star)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        minStars === star
                          ? 'border-brand-orange bg-brand-orange text-white'
                          : 'border-gray-300 bg-white hover:border-brand-orange'
                      }`}
                    >
                      {star}+ ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Rating</label>
                <div className="flex gap-2">
                  {[0, 3.5, 4.0, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        minRating === rating
                          ? 'border-brand-orange bg-brand-orange text-white'
                          : 'border-gray-300 bg-white hover:border-brand-orange'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {['Hotel', 'Resort', 'Guesthouse', 'B&B'].map(type => (
                    <button
                      key={type}
                      onClick={() => setPropertyTypes(prev => 
                        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm transition-all ${
                        propertyTypes.includes(type)
                          ? 'border-brand-orange bg-brand-orange text-white'
                          : 'border-gray-300 bg-white hover:border-brand-orange'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Plan Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Plan</label>
                <select
                  value={mealPlanFilter}
                  onChange={e => setMealPlanFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:outline-none text-sm"
                >
                  <option value="">Any Meal Plan</option>
                  <option value="room_only">Room Only</option>
                  <option value="breakfast">Bed & Breakfast</option>
                  <option value="half_board">Half Board (Breakfast + Dinner)</option>
                  <option value="full_board">Full Board (All Meals)</option>
                  <option value="all_inclusive">All Inclusive</option>
                </select>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freeCancellation}
                      onChange={e => setFreeCancellation(e.target.checked)}
                      className="w-4 h-4 accent-brand-orange rounded"
                    />
                    <span className="text-sm">Free Cancellation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakfastIncluded}
                      onChange={e => setBreakfastIncluded(e.target.checked)}
                      className="w-4 h-4 accent-brand-orange rounded"
                    />
                    <span className="text-sm">Breakfast Included</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Gym', 'Spa', 'Restaurant', 'Beach Access'].map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => setRequiredAmenities(prev =>
                      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
                    )}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      requiredAmenities.includes(amenity)
                        ? 'border-brand-orange bg-brand-orange text-white'
                        : 'border-gray-300 bg-white hover:border-brand-orange'
                    }`}
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per Night: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </label>
              <input
                type="range"
                min={properties.length ? Math.min(...properties.map(p => p.pricePerNight)) : 0}
                max={properties.length ? Math.max(...properties.map(p => p.pricePerNight)) : 10000}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-brand-orange"
              />
            </div>

            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-brand-orange hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {demoModeHint}
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600"
                  >
                    Clear Filters
                  </button>
                )}
                {googleMapsAreaUrl && (
                  <a
                    href={googleMapsAreaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          ) : viewMode === 'map' ? (
            <div className="h-full min-h-[600px] rounded-lg overflow-hidden border-2 border-gray-200">
              <iframe
                src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo'}&q=hotels+in+${encodeURIComponent(location)}&zoom=12`}
                className="w-full h-full"
                style={{ border: 0, minHeight: '600px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Property locations map"
              />
              
              {/* Map overlay with property cards */}
              <div className="absolute bottom-4 left-0 right-0 px-4">
                <div className="bg-white rounded-lg shadow-2xl p-4 max-h-64 overflow-y-auto">
                  <h3 className="text-sm font-bold text-brand-brown mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-orange" />
                    {filteredProperties.length} Properties on Map
                  </h3>
                  <div className="space-y-2">
                    {filteredProperties.slice(0, 5).map(property => (
                      <div
                        key={property.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedProperty?.id === property.id
                            ? 'border-brand-orange bg-orange-50'
                            : 'border-gray-200 hover:border-brand-orange hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedProperty(property)}
                        onMouseEnter={() => setHoveredProperty(property.id)}
                        onMouseLeave={() => setHoveredProperty(null)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-brand-brown truncate">{property.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {Array.from({ length: property.stars }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">•</span>
                              <div className="flex items-center gap-1 text-xs">
                                <span className="font-semibold text-brand-orange">{property.rating.toFixed(1)}</span>
                                <span className="text-gray-500">({property.reviewCount})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>{property.distanceKm} km away</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-brand-orange">
                              {formatCurrency(property.pricePerNight)}
                            </div>
                            <div className="text-xs text-gray-500">/night</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredProperties.length > 5 && (
                      <button
                        onClick={() => setViewMode('list')}
                        className="w-full text-center text-sm text-brand-orange hover:underline py-2"
                      >
                        View all {filteredProperties.length} properties in list
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
            }>
              {filteredProperties.map(property => (
                <div
                  key={property.id}
                  className={`border-2 rounded-xl bg-white transition-all cursor-pointer ${
                    selectedProperty?.id === property.id
                      ? 'border-brand-orange shadow-lg'
                      : 'border-gray-200 hover:border-brand-orange hover:shadow-md'
                  } ${viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'}`}
                  onClick={() => setSelectedProperty(property)}
                >
                  {/* Property Image Placeholder */}
                  <div className={`bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 ${
                    viewMode === 'list' ? 'w-48 h-48' : 'w-full h-48 mb-3'
                  }`}>
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-brand-brown">{property.name}</h3>
                          {property.isPremier && (
                            <Award className="h-5 w-5 text-yellow-500" title="Premier Property" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{property.type}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {Array.from({ length: property.stars }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">|</span>
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{property.distanceKm} km from center</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favoriteProperties.includes(property.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 px-2 py-1 bg-brand-orange text-white rounded-lg">
                        <span className="font-bold">{property.rating.toFixed(1)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{getRatingLabel(property.rating)}</div>
                        <div className="text-xs text-gray-500">{property.reviewCount} reviews</div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {property.amenities.slice(0, viewMode === 'list' ? 6 : 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > (viewMode === 'list' ? 6 : 4) && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{property.amenities.length - (viewMode === 'list' ? 6 : 4)} more
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {property.hasFreeCancellation && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Free Cancellation
                        </span>
                      )}
                      {property.isPopular && (
                        <span className="px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                      {property.ecoFriendly && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Eco-Friendly
                        </span>
                      )}
                      {property.lastBookedMinutesAgo && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          Booked {property.lastBookedMinutesAgo}m ago
                        </span>
                      )}
                    </div>

                    {/* Meal Plan Selector */}
                    {property.availableMealPlans && property.availableMealPlans.length > 1 && (
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Meal Plan</label>
                        <select
                          value={propertyMealPlans[property.id] || 'room_only'}
                          onChange={(e) => {
                            e.stopPropagation();
                            setPropertyMealPlans({
                              ...propertyMealPlans,
                              [property.id]: e.target.value
                            });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                        >
                          {property.availableMealPlans.map(plan => {
                            const planPrice = getMealPlanPrice(property.pricePerNight, plan);
                            const planLabel = getMealPlanLabel(plan);
                            return (
                              <option key={plan} value={plan}>
                                {planLabel} - {formatCurrency(planPrice)}/night
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="mt-auto pt-3 border-t flex items-end justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">{property.nights} night{property.nights !== 1 ? 's' : ''}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-brand-orange">
                            {formatCurrency(getMealPlanPrice(property.pricePerNight, propertyMealPlans[property.id] || 'room_only'))}
                          </span>
                          <span className="text-sm text-gray-600">/night</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: {formatCurrency(getMealPlanPrice(property.totalPrice, propertyMealPlans[property.id] || 'room_only'))}
                        </div>
                        {propertyMealPlans[property.id] && propertyMealPlans[property.id] !== 'room_only' && (
                          <div className="text-xs text-brand-orange font-medium mt-1">
                            • {getMealPlanLabel(propertyMealPlans[property.id])}
                          </div>
                        )}
                      </div>
                      {property.availableRooms <= 2 && (
                        <div className="text-xs text-red-600 font-medium">
                          Only {property.availableRooms} left!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {onSkip && (
              <button
                onClick={() => onSkip(properties)}
                className="px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
          
          <button
            onClick={() => {
              if (selectedProperty) {
                const selectedMealPlan = propertyMealPlans[selectedProperty.id] || 'room_only';
                const adjustedPrice = getMealPlanPrice(selectedProperty.pricePerNight, selectedMealPlan);
                const adjustedTotal = getMealPlanPrice(selectedProperty.totalPrice, selectedMealPlan);
                
                onSelectProperty({
                  ...selectedProperty,
                  selectedMealPlan,
                  pricePerNight: adjustedPrice,
                  totalPrice: adjustedTotal
                });
              }
            }}
            disabled={!selectedProperty}
            className="px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
          >
            <CheckCircle2 className="h-5 w-5" />
            {selectedProperty 
              ? `Book ${selectedProperty.name} - ${formatCurrency(getMealPlanPrice(selectedProperty.totalPrice, propertyMealPlans[selectedProperty.id] || 'room_only'))}`
              : 'Select a Property'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
