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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AccommodationSelector({ onSelectProperty, onSkip, onCancel, location, checkIn, checkOut, guests }) {

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [preferredType, setPreferredType] = useState('');
  const [minStars, setMinStars] = useState(0);
  const [requiredAmenities, setRequiredAmenities] = useState([]);
  const [mealPlan, setMealPlan] = useState('room_only');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  
  // Google Maps search URL for all hotels/accommodation in the area
  const googleMapsAreaUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=hotels+accommodation+${encodeURIComponent(location)}`
    : null;

  useEffect(() => {
    // No auto-fetch on field change; search is triggered by button
  }, []);

  // ...other logic, hooks, and functions...

  // Place the main return at the end of the function
  useEffect(() => {
    if (!location || !checkIn || !checkOut || !guests) return;
    setLoading(true);
    const generateMockProperties = () => {
      const propertyTypes = ['Hotel', 'Guesthouse', 'B&B', 'Lodge', 'Resort'];
      const propertyNames = [
        'The Oyster Box', 'Beverly Hills Hotel', 'Southern Sun', 'Protea Hotel',
        'Garden Court', 'African Pride', 'City Lodge', 'Premier Hotel',
        'Coastlands Musgrave', 'Quarters Hotel', 'Durban Hilton', 'Holiday Inn'
      ];
      const locations = [
        'Umhlanga Rocks, Durban', 'Durban Beachfront', 'Gateway, Umhlanga',
        'Ballito, KZN', 'Durban North', 'Morningside, Durban',
        'Westville, Durban', 'Pinetown, Durban'
      ];
      const amenitiesList = [
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Restaurant', 'Gym', 'Spa', 'Room Service'],
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Bar'],
        ['Free WiFi', 'Breakfast', 'Parking', 'Garden', 'BBQ'],
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Restaurant', 'Gym', 'Beach Access'],
        ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Conference Room', 'Business Center'],
        ['Free WiFi', 'Breakfast', 'Parking', 'Pet Friendly', 'Laundry']
      ];

      const basePrice = 1200;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      const propertyCount = 10 + Math.floor(Math.random() * 3);
      return Array.from({ length: propertyCount }, (_, index) => {
        const stars = 3 + Math.floor(Math.random() * 3);
        const type = propertyTypes[index % propertyTypes.length];
        const name = propertyNames[index % propertyNames.length];
        const address = locations[index % locations.length];
        const amenities = amenitiesList[index % amenitiesList.length];
        let priceMultiplier = 0.5 + (stars / 5) * 1.5;
        if (type === 'Resort' || type === 'Lodge') priceMultiplier += 0.3;
        if (amenities.includes('Spa')) priceMultiplier += 0.2;
        priceMultiplier += (Math.random() * 0.3 - 0.15);
        const pricePerNight = Math.round(basePrice * priceMultiplier / 50) * 50;
        const totalPrice = pricePerNight * nights;
        const rating = 3.5 + Math.random() * 1.5;
        const reviewCount = 50 + Math.floor(Math.random() * 950);
        const isPremier = stars === 5 && rating >= 4.7;
        const ecoFriendly = Math.random() > 0.7;
        const isPopular = reviewCount > 500 && rating >= 4.5;
        const mealPlans = ['room_only'];
        if (stars >= 3) mealPlans.push('breakfast');
        if (stars >= 4) mealPlans.push('half_board');
        if (stars >= 4 && (type === 'Hotel' || type === 'Resort')) mealPlans.push('full_board');
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
          mealPlans,
          isPremier,
          ecoFriendly,
          isPopular,
          imageUrl: null,
          checkIn,
          checkOut,
          nights,
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
        setProperties(props.length ? props : (useDemo ? generateMockProperties() : []));
      })
      .catch(() => {
        // Fallback for static deployments or API downtime when demo mode enabled
        setProperties(useDemo ? generateMockProperties() : []);
      })
      .finally(() => setLoading(false));
  }, [location, checkIn, checkOut, guests]);

  return (
    <div className="p-4">
      {/* Property results: scrollable cards, amenities, meal plan selector */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2 font-semibold text-brand-brown">No properties found for your criteria.</div>
          <div className="text-sm mb-4">Try widening your search:</div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <button
              className="px-3 py-2 border rounded text-sm bg-white hover:bg-cream"
              onClick={() => {
                setMinStars(0);
                setPreferredType('');
                setRequiredAmenities([]);
                setMealPlan('room_only');
              }}
            >
              Reset filters
            </button>
            {googleMapsAreaUrl && (
              <a
                href={googleMapsAreaUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 border rounded text-sm bg-white hover:bg-cream"
              >
                View area on Google Maps
              </a>
            )}
          </div>
          <div className="text-xs text-gray-600">Tip: Remove strict amenities or lower minimum stars.</div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
          <div className="flex gap-6 min-w-max">
            {properties.map(property => (
              <div key={property.id} className="border rounded-lg bg-white shadow p-4 min-w-[340px] max-w-xs flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-brand-brown">{property.name}</h3>
                  <button
                    className={favoriteProperties.includes(property.id) ? "text-red-500" : "text-gray-300"}
                    onClick={() => setFavoriteProperties(fav => fav.includes(property.id) ? fav.filter(id => id !== property.id) : [...fav, property.id])}
                    title={favoriteProperties.includes(property.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 mb-1">{property.address}</p>
                <p className="text-xs text-gray-500 mb-2">{property.type} &bull; {property.stars} stars</p>
                {/* Amenities icons/tags */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {property.amenities.map((amenity, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 bg-cream rounded text-xs text-brand-brown border border-cream-border">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                {/* Meal plan selector */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meal Plan</label>
                  <select
                    value={mealPlan}
                    onChange={e => setMealPlan(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-xs"
                  >
                    <option value="room_only">Room Only</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="half_board">Half Board</option>
                    <option value="full_board">Full Board</option>
                  </select>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <button
                    className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-orange-600 text-xs"
                    onClick={() => onSelectProperty({ ...property, mealPlan })}
                  >
                    Select Property
                  </button>
                  <span className="text-xs text-gray-500">From R{property.pricePerNight || property.price || 'N/A'}/night</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
