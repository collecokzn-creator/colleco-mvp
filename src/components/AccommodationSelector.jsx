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
    fetch('/api/accommodation/available-properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, checkIn, checkOut, guests })
    })
      .then(res => res.ok ? res.json() : { properties: [] })
      .then(data => setProperties(data.properties || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [location, checkIn, checkOut, guests]);

  return (
    <div className="p-4">
      {/* Property results: scrollable cards, amenities, meal plan selector */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No properties found for your criteria.</div>
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
