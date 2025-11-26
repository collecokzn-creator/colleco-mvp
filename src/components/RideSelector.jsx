import React, { useState, useEffect } from 'react';
import { 
  Star, 
  DollarSign, 
  TrendingUp, 
  User, 
  Car, 
  Shield, 
  Award,
  Heart,
  Clock,
  MapPin,
  CheckCircle2,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export default function RideSelector({ 
  pickup, 
  dropoff, 
  vehicleType, 
  passengers,
  onSelectRide,
  onSkip,
  onCancel 
}) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState('all'); // all, price, rating, popularity, brand
  const [sortBy, setSortBy] = useState('recommended'); // recommended, price_low, price_high, rating, popularity
  const [favoriteDrivers, setFavoriteDrivers] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [preferredBrand, setPreferredBrand] = useState('');
  const [preferredDriver, setPreferredDriver] = useState('');

  useEffect(() => {
    fetchAvailableRides();
    loadFavoriteDrivers();
  }, [pickup, dropoff, vehicleType]);

  const fetchAvailableRides = async () => {
    setLoading(true);
    try {
      console.log('[RideSelector] Fetching rides for:', { pickup, dropoff, vehicleType, passengers });
      
      const response = await fetch('/api/transfers/available-rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          vehicleType,
          passengers
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[RideSelector] Received rides:', data.rides?.length || 0);
      setRides(data.rides || []);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      // Set empty array on error so UI shows "no rides" message
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteDrivers = () => {
    try {
      const saved = localStorage.getItem('colleco.favoriteDrivers');
      setFavoriteDrivers(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Failed to load favorite drivers:', error);
    }
  };

  const toggleFavoriteDriver = (driverId) => {
    const updated = favoriteDrivers.includes(driverId)
      ? favoriteDrivers.filter(id => id !== driverId)
      : [...favoriteDrivers, driverId];
    
    setFavoriteDrivers(updated);
    localStorage.setItem('colleco.favoriteDrivers', JSON.stringify(updated));
  };

  const getFilteredAndSortedRides = () => {
    let filtered = [...rides];
    console.log(`[RideSelector] Starting filter: ${filterBy}, Total rides: ${filtered.length}`);

    // Preferred brand/driver filters (exact or contains)
    if (preferredBrand.trim()) {
      const q = preferredBrand.trim().toLowerCase();
      filtered = filtered.filter(r => (r.brand.name || '').toLowerCase().includes(q));
    }
    if (preferredDriver.trim()) {
      const qd = preferredDriver.trim().toLowerCase();
      filtered = filtered.filter(r => (r.driver.name || '').toLowerCase().includes(qd));
    }

    // Apply filters
    if (filterBy === 'favorites') {
      filtered = filtered.filter(ride => favoriteDrivers.includes(ride.driver.id));
      console.log(`[RideSelector] After favorites filter: ${filtered.length}`);
    } else if (filterBy === 'premium') {
      filtered = filtered.filter(ride => ride.brand.isPremium);
      console.log(`[RideSelector] After premium filter: ${filtered.length}`);
    } else if (filterBy === 'budget') {
      if (rides.length > 0) {
        const minPrice = Math.min(...rides.map(r => r.price));
        console.log(`[RideSelector] Min price: R${minPrice}, Budget threshold: R${minPrice * 1.1}`);
        filtered = filtered.filter(ride => ride.price <= minPrice * 1.1); // Within 10% of lowest
        console.log(`[RideSelector] After budget filter: ${filtered.length}`);
      }
    } else if (filterBy === 'top_rated') {
      filtered = filtered.filter(ride => ride.rating >= 4.5);
      console.log(`[RideSelector] After top_rated filter: ${filtered.length}`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.completedTrips - a.completedTrips);
        break;
      case 'recommended':
      default:
        // Weighted scoring: rating (40%) + popularity (30%) + favorite (30%)
        filtered.sort((a, b) => {
          const scoreA = (a.rating / 5 * 40) + 
                        (Math.min(a.completedTrips / 1000, 1) * 30) +
                        (favoriteDrivers.includes(a.driver.id) ? 30 : 0);
          const scoreB = (b.rating / 5 * 40) + 
                        (Math.min(b.completedTrips / 1000, 1) * 30) +
                        (favoriteDrivers.includes(b.driver.id) ? 30 : 0);
          return scoreB - scoreA;
        });
    }

    console.log(`[RideSelector] Final filtered count: ${filtered.length}`);
    return filtered;
  };

  // Auto Smart: compute composite score and pick the best
  const scoreRide = (ride) => {
    // Normalize components: safety ~ verified + superDriver + rating
    const safety = (ride.driver.isVerified ? 1 : 0) + (ride.driver.isSuperDriver ? 0.5 : 0) + (ride.rating / 5);
    // Reliability: completed trips and total reviews (scaled)
    const reliability = Math.min(1, (ride.completedTrips / 1500)) * 0.7 + Math.min(1, (ride.totalReviews / 400)) * 0.3;
    // Affordability: inverse of price relative to min price in set
    const prices = rides.map(r => r.price);
    const minPrice = prices.length ? Math.min(...prices) : ride.price;
    const affordability = Math.min(1, minPrice / ride.price);
    // Premium penalty small unless user chose premium vehicleType
    const premiumPenalty = (ride.brand.isPremium && vehicleType !== 'luxury') ? 0.1 : 0;
    // Weighted composite
    const score = (safety * 0.4) + (reliability * 0.3) + (affordability * 0.3) - premiumPenalty;
    return score;
  };

  const autoPickBestRide = () => {
    const list = getFilteredAndSortedRides();
    if (!list.length) return;
    const best = list
      .map(r => ({ ride: r, score: scoreRide(r) }))
      .sort((a, b) => b.score - a.score)[0].ride;
    setSelectedRide(best);
          <div className="px-4 py-3 border-b bg-cream/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Preferred Brand</label>
                <input
                  type="text"
                  value={preferredBrand}
                  onChange={e => setPreferredBrand(e.target.value)}
                  placeholder="e.g. Uber, Executive Transfers"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Preferred Driver</label>
                <input
                  type="text"
                  value={preferredDriver}
                  onChange={e => setPreferredDriver(e.target.value)}
                  placeholder="e.g. Thabo Mkhize"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
    onSelectRide?.(best);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.8) return 'text-green-600';
    if (rating >= 4.5) return 'text-blue-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPriceLabel = (price, allPrices) => {
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    if (price === minPrice) return 'Lowest Price';
    if (price === maxPrice) return 'Premium';
    return 'Competitive';
  };

  const filteredRides = getFilteredAndSortedRides();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Finding available rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600">
          <h2 className="text-2xl font-bold text-white mb-2">Pick Your Ride</h2>
          <p className="text-white/90 text-sm">
            {pickup} → {dropoff}
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="p-4 border-b bg-cream-50 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Filter className="h-3 w-3 inline mr-1" />
                Filter By
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
              >
                <option value="all">All Rides</option>
                <option value="favorites">My Favorites</option>
                <option value="premium">Premium Brands</option>
                <option value="budget">Budget Options</option>
                <option value="top_rated">Top Rated (4.5+)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <ArrowUpDown className="h-3 w-3 inline mr-1" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            Showing {filteredRides.length} of {rides.length} available rides
          </div>
        </div>

        {/* Rides List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredRides.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No rides match your filters</p>
              <button
                onClick={() => setFilterBy('all')}
                className="mt-3 text-brand-orange hover:underline text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <div
                key={ride.id}
                onClick={() => setSelectedRide(ride)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRide?.id === ride.id
                    ? 'border-brand-orange bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-brand-orange hover:shadow-md'
                }`}
              >
                <div className="flex gap-4">
                  {/* Driver Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden relative">
                      {ride.driver.photo ? (
                        <img 
                          src={ride.driver.photo} 
                          alt={ride.driver.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-4 text-gray-400" />
                      )}
                      {ride.driver.isVerified && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {ride.driver.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteDriver(ride.driver.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                favoriteDrivers.includes(ride.driver.id)
                                  ? 'fill-red-500 text-red-500'
                                  : ''
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            {ride.brand.name}
                          </span>
                          {ride.brand.isPremium && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Award className="h-3 w-3" />
                              Premium
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(ride.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPriceLabel(ride.price, rides.map(r => r.price))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 fill-current ${getRatingColor(ride.rating)}`} />
                        <span className={`font-semibold ${getRatingColor(ride.rating)}`}>
                          {ride.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({ride.totalReviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>{ride.completedTrips.toLocaleString()} trips</span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {ride.estimatedArrival} min</span>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="text-gray-700">
                        <strong>{ride.vehicle.model}</strong> • {ride.vehicle.color} • {ride.vehicle.plate}
                      </span>
                      {ride.vehicle.features.length > 0 && (
                        <span className="text-gray-500">
                          {ride.vehicle.features.join(' • ')}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {ride.driver.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                      {ride.driver.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {ride.isPopular && (
                        <span className="px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Popular Choice
                        </span>
                      )}
                      {ride.driver.isSuperDriver && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Super Driver
                        </span>
                      )}
                    </div>

                    {/* Recent Review Snippet */}
                    {ride.latestReview && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 italic border-l-2 border-brand-orange">
                        "{ride.latestReview.comment}" - {ride.latestReview.author}
                      </div>
                    )}
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
                onClick={() => onSkip(rides)}
                className="px-4 py-2 border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors text-sm"
              >
                Skip for now
              </button>
            )}
          </div>
          
          <button
            onClick={() => selectedRide && onSelectRide(selectedRide)}
            disabled={!selectedRide}
            className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Ride {selectedRide && `- ${formatCurrency(selectedRide.price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
