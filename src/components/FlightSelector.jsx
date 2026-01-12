import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, TrendingUp, Plane, Shield, Award, Heart, CheckCircle2, Filter, ArrowUpDown, Clock, Briefcase, Coffee, Wifi, MonitorPlay, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlightSelector({ 
  from,
  to,
  departDate,
  returnDate,
  passengers,
  onSelectFlight,
  onSkip,
  onCancel 
}) {
  // Local debug logger — enabled in dev or when `VITE_DEBUG_FLIGHTS=1`
  const _log = (level, ...args) => {
    if (!(import.meta.env.DEV || import.meta?.env?.VITE_DEBUG_FLIGHTS === '1')) return;
    // eslint-disable-next-line no-console
    if (level === 'error') console.error(...args);
    // eslint-disable-next-line no-console
    else if (level === 'warn') console.warn(...args);
    // eslint-disable-next-line no-console
    else console.log(...args);
  };
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState('all'); // all, direct, 1stop, 2stops
  const [sortBy, setSortBy] = useState('recommended'); // recommended, price_low, price_high, duration, departure
  const [favoriteFlights, setFavoriteFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [preferredAirline, setPreferredAirline] = useState('');
  const [preferredCabin, setPreferredCabin] = useState(''); // economy, premium_economy, business, first
  const [maxStops, setMaxStops] = useState(3);
  const [requiredAmenities, setRequiredAmenities] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  const fetchAvailableFlights = useCallback(async () => {
    setLoading(true);
    const useDemo = (import.meta?.env?.VITE_DEMO_FLIGHTS ?? '1') === '1';

    const generateMockFlights = () => {
      const airlines = ['South African', 'Lift', 'FlySafair', 'CemAir', 'British Airways', 'Ethiopian', 'Qatar'];
      const cabins = ['economy', 'premium_economy', 'business'];
      const basePrice = 1200;
      const amenitiesPool = ['WiFi', 'Meals', 'Entertainment', 'Power Outlets', 'Checked Baggage'];

      const mkLeg = (legFrom, legTo, dayOffset = 0, depHour = 6) => {
        const dep = new Date(departDate);
        dep.setDate(dep.getDate() + dayOffset);
        dep.setHours(depHour);
        const durationMinutes = 60 + Math.floor(Math.random() * 180);
        const arr = new Date(dep.getTime() + durationMinutes * 60000);
        return { departureTime: dep.toISOString(), arrivalTime: arr.toISOString(), durationMinutes };
      };

      const out = [];
      for (let i = 0; i < 12; i++) {
        const name = airlines[i % airlines.length];
        const stops = i % 3; // 0,1,2
        const cabin = cabins[i % cabins.length];
        const leg = mkLeg(from, to, 0, 6 + (i % 10));
        const priceMult = (1 + stops * 0.15) * (cabin === 'business' ? 2.2 : cabin === 'premium_economy' ? 1.35 : 1);
        const price = Math.round(basePrice * priceMult / 10) * 10;
        const amenities = amenitiesPool.filter((_, idx) => (i + idx) % 2 === 0).slice(0, 4);
        const rating = 3.6 + Math.random() * 1.3;
        const reviewCount = 400 + Math.floor(Math.random() * 3600);
        out.push({
          id: `FL-${Date.now()}-${i}`,
          airline: { name, rating, reviewCount },
          flightNumber: `${name.slice(0,2).toUpperCase()}${100 + i}`,
          from,
          to,
          ...leg,
          stops,
          cabin,
          amenities,
          baggageIncluded: amenities.includes('Checked Baggage'),
          refundable: Math.random() > 0.5,
          isPremium: cabin !== 'economy',
          price,
          pricePerPerson: Math.round(price / Math.max(1, passengers)),
        });
      }
      return out;
    };

    try {
      _log('log', '[FlightSelector] Fetching flights for:', { from, to, departDate, returnDate, passengers });
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          departDate,
          returnDate,
          passengers
        })
      });

      if (response.ok) {
        const data = await response.json();
        const list = data.flights || [];
        setFlights(list.length ? list : (useDemo ? generateMockFlights() : []));
      } else {
        _log('error', '[FlightSelector] Failed to fetch flights');
        setFlights(useDemo ? generateMockFlights() : []);
      }
    } catch (error) {
      _log('error', '[FlightSelector] Error fetching flights:', error);
      setFlights(useDemo ? generateMockFlights() : []);
    } finally {
      setLoading(false);
    }
  }, [from, to, departDate, returnDate, passengers]);

  const loadFavoriteFlights = useCallback(() => {
    try {
      const saved = localStorage.getItem('colleco.favoriteFlights');
      if (saved) {
        setFavoriteFlights(JSON.parse(saved));
      }
    } catch (error) {
      _log('error', '[FlightSelector] Error loading favorites:', error);
    }
  }, []);

  useEffect(() => {
    fetchAvailableFlights();
    loadFavoriteFlights();
  }, [fetchAvailableFlights, loadFavoriteFlights]);


  // scroll button checks are handled in the effect below

  useEffect(() => {
    const checkScrollButtons = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      setCanScrollLeft(container.scrollTop > 0);
      setCanScrollRight(
        container.scrollTop < container.scrollHeight - container.clientHeight - 10
      );
    };

    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);

      // Add keyboard arrow support
      const handleKeyDown = (e) => {
        const c = scrollContainerRef.current;
        if (!c) return;
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          c.scrollBy({ top: -300, behavior: 'smooth' });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          c.scrollBy({ top: 300, behavior: 'smooth' });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [flights]);

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

  const toggleFavorite = (flightId) => {
    const newFavorites = favoriteFlights.includes(flightId)
      ? favoriteFlights.filter(id => id !== flightId)
      : [...favoriteFlights, flightId];
    
    setFavoriteFlights(newFavorites);
    localStorage.setItem('colleco.favoriteFlights', JSON.stringify(newFavorites));
  };

  // Auto Smart Scoring System
  const scoreFlight = (flight) => {
    let score = 0;
    
    // Convenience (40% weight) - fewer stops and shorter duration
    const stopsScore = (3 - flight.stops) * 10; // Direct = 30, 1 stop = 20, etc
    const durationScore = Math.max(0, 20 - (flight.durationMinutes / 60)); // Faster is better
    score += stopsScore + durationScore;
    
    // Value for Money (35% weight)
    const avgPrice = flights.reduce((sum, f) => sum + f.price, 0) / flights.length;
    const priceScore = (1 - (flight.price / (avgPrice * 1.5))) * 35;
    score += Math.max(0, priceScore);
    
    // Service Quality (25% weight)
    const ratingScore = (flight.airline.rating / 5) * 15;
    const reviewScore = Math.min(10, (flight.airline.reviewCount / 5000) * 10);
    score += ratingScore + reviewScore;
    
    // Bonus points
    if (flight.stops === 0) score += 5; // Direct flight bonus
    if (flight.amenities.includes('WiFi')) score += 2;
    if (flight.amenities.includes('Meals')) score += 2;
    if (flight.baggageIncluded) score += 3;
    if (flight.refundable) score += 3;
    if (flight.isPremium) score += 5;
    
    return Math.round(score);
  };

  const autoPickBestFlight = () => {
    if (flights.length === 0) return;
    
    const scoredFlights = flights.map(flight => ({
      ...flight,
      smartScore: scoreFlight(flight)
    }));
    
    const best = scoredFlights.reduce((max, flight) => 
      flight.smartScore > max.smartScore ? flight : max
    );
    
    setSelectedFlight(best);
    onSelectFlight(best);
  };

  const getFilteredAndSortedFlights = () => {
    let filtered = [...flights];
    
    // Apply airline filter (case-insensitive partial match)
    if (preferredAirline) {
      filtered = filtered.filter(f => 
        f.airline && f.airline.name && f.airline.name.toLowerCase().includes(preferredAirline.toLowerCase())
      );
    }
    
    // Apply cabin filter (case-insensitive partial match)
    if (preferredCabin) {
      filtered = filtered.filter(f => 
        f.cabin && f.cabin.toLowerCase().includes(preferredCabin.toLowerCase())
      );
    }
    
    // Apply stops filter
    if (maxStops < 3) {
      filtered = filtered.filter(f => f.stops <= maxStops);
    }
    
    // Apply amenities filter (case-insensitive partial match)
    if (requiredAmenities.length > 0) {
      filtered = filtered.filter(f => 
        f.amenities && requiredAmenities.every(amenity => 
          f.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }
    
    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'favorites') {
        filtered = filtered.filter(f => favoriteFlights.includes(f.id));
      } else if (filterBy === 'direct') {
        filtered = filtered.filter(f => f.stops === 0);
      } else if (filterBy === '1stop') {
        filtered = filtered.filter(f => f.stops === 1);
      } else if (filterBy === '2stops') {
        filtered = filtered.filter(f => f.stops === 2);
      } else if (filterBy === 'premium') {
        filtered = filtered.filter(f => f.isPremium);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'duration':
          return a.durationMinutes - b.durationMinutes;
        case 'departure':
          return new Date(a.departureTime) - new Date(b.departureTime);
        case 'recommended':
        default:
          return scoreFlight(b) - scoreFlight(a);
      }
    });
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return `R${amount.toLocaleString()}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredFlights = getFilteredAndSortedFlights();

  // Get unique airlines for filter
  const airlines = [...new Set(flights.map(f => f.airline.name))];

  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-xl shadow-2xl max-w-6xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Pick My Flight</h2>
          <p className="text-white/90 text-xs sm:text-sm">
            {from} → {to} • {passengers} passenger{passengers !== 1 ? 's' : ''} • {departDate}
            {returnDate && ` - ${returnDate}`}
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="p-3 sm:p-4 border-b bg-gray-50 space-y-3 overflow-x-hidden">
          {/* Smart Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={autoPickBestFlight}
              className="px-3 sm:px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium"
            >
              <Award className="h-3 sm:h-4 w-3 sm:w-4" />
              Auto Smart Pick
            </button>
          </div>

          {/* Preference Filters - Hide on mobile by default, show via toggle */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Airline
              </label>
              <select
                value={preferredAirline}
                onChange={(e) => setPreferredAirline(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="">Any Airline</option>
                {airlines.map(airline => (
                  <option key={airline} value={airline}>{airline}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cabin Class
              </label>
              <select
                value={preferredCabin}
                onChange={(e) => setPreferredCabin(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="">Any Class</option>
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Maximum Stops
              </label>
              <select
                value={maxStops}
                onChange={(e) => setMaxStops(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="3">Any</option>
                <option value="0">Direct Only</option>
                <option value="1">Max 1 Stop</option>
                <option value="2">Max 2 Stops</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amenities
              </label>
              <select
                multiple
                value={requiredAmenities}
                onChange={(e) => setRequiredAmenities(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none"
                size={3}
              >
                <option value="WiFi">WiFi</option>
                <option value="Meals">Meals Included</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Power Outlets">Power Outlets</option>
              </select>
            </div>
          </div>

          {/* Filter & Sort */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="all">All Flights</option>
                <option value="favorites">Favorites</option>
                <option value="direct">Direct Only</option>
                <option value="1stop">1 Stop</option>
                <option value="2stops">2 Stops</option>
                <option value="premium">Premium Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <ArrowUpDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="duration">Shortest Duration</option>
                <option value="departure">Earliest Departure</option>
              </select>
            </div>

            <span className="text-xs sm:text-sm text-gray-600 sm:ml-auto text-center">
              {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>

        {/* Flights List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 relative" ref={scrollContainerRef}>
          {/* Scroll Up Button - Hidden on small mobile */}
          {canScrollLeft && (
            <button
              onClick={scrollUp}
              className="hidden sm:block absolute top-4 right-4 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200"
              aria-label="Scroll up"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-brand-orange rotate-90" />
            </button>
          )}

          {/* Scroll Down Button - Hidden on small mobile */}
          {canScrollRight && (
            <button
              onClick={scrollDown}
              className="hidden sm:block absolute bottom-4 right-4 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200"
              aria-label="Scroll down"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-brand-orange rotate-90" />
            </button>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No flights match your criteria</p>
              <button
                onClick={() => {
                  setFilterBy('all');
                  setPreferredAirline('');
                  setPreferredCabin('');
                  setMaxStops(3);
                  setRequiredAmenities([]);
                }}
                className="mt-4 text-brand-orange hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredFlights.map((flight) => (
              <div
                key={flight.id}
                onClick={() => setSelectedFlight(flight)}
                className={`mb-3 sm:mb-4 border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-lg active:scale-[0.99] ${
                  selectedFlight?.id === flight.id
                    ? 'border-brand-orange bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-brand-orange/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plane className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-brown">{flight.airline.name}</h3>
                      <p className="text-sm text-gray-600">Flight {flight.flightNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(flight.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favoriteFlights.includes(flight.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Flight Route */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-brand-brown">{formatTime(flight.departureTime)}</p>
                    <p className="text-sm text-gray-600">{flight.from}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">{formatDuration(flight.durationMinutes)}</span>
                      </div>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-brown">{formatTime(flight.arrivalTime)}</p>
                    <p className="text-sm text-gray-600">{flight.to}</p>
                  </div>
                </div>

                {/* Cabin & Rating */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded capitalize">{flight.cabin.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-brand-gold" />
                    <span className="font-semibold">{flight.airline.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({flight.airline.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {flight.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"
                    >
                      {amenity === 'WiFi' && <Wifi className="h-3 w-3" />}
                      {amenity === 'Meals' && <Coffee className="h-3 w-3" />}
                      {amenity === 'Entertainment' && <MonitorPlay className="h-3 w-3" />}
                      {amenity === 'Checked Baggage' && <Briefcase className="h-3 w-3" />}
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {flight.isPremium && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Premium Service
                    </span>
                  )}
                  {flight.baggageIncluded && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Baggage Included
                    </span>
                  )}
                  {flight.refundable && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Refundable
                    </span>
                  )}
                  {flight.stops === 0 && (
                    <span className="px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Direct Flight
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-between pt-3 border-t">
                  <div>
                    <span className="text-2xl font-bold text-brand-orange">
                      {formatCurrency(flight.price)}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">total</span>
                  </div>
                  {flight.pricePerPerson && (
                    <span className="text-xs text-gray-500">
                      {formatCurrency(flight.pricePerPerson)} per person
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex gap-2 order-2 sm:order-1">
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            
            {onSkip && (
              <button
                onClick={() => onSkip(flights)}
                className="flex-1 sm:flex-initial px-4 py-2.5 border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 active:bg-orange-100 transition-colors text-sm font-medium"
              >
                Skip for now
              </button>
            )}
          </div>
          
          <button
            onClick={() => selectedFlight && onSelectFlight(selectedFlight)}
            disabled={!selectedFlight}
            className="order-1 sm:order-2 w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 bg-brand-orange text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-sm"
          >
            <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="truncate">Confirm {selectedFlight && `- ${formatCurrency(selectedFlight.price)}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
