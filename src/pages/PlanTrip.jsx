import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { useBasketState } from "../utils/useBasketState";
import { PRODUCTS } from "../data/products";
import { searchEvents } from "../utils/eventsApi";

export default function PlanTrip() {
  const navigate = useNavigate();
  const { basket, addToBasket } = useBasketState();
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);

  // Filter products
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  }).slice(0, 20);

  // Load events
  useEffect(() => {
    if (activeTab === 'events') {
      setLoadingEvents(true);
      searchEvents({ page: 1, limit: 12 })
        .then(result => {
          setEvents(result.events || []);
          setLoadingEvents(false);
        })
        .catch(() => setLoadingEvents(false));
    }
  }, [activeTab]);

  // Read simple mode preference from localStorage on mount
  useEffect(() => {
    try {
      const v = localStorage.getItem('tripSimpleMode');
      if (v === '1') setSimpleMode(true);
    } catch (e) {}
  }, []);

  // When simpleMode is enabled, ensure we are on catalog and hide events
  useEffect(() => {
    if (simpleMode && activeTab === 'events') {
      setActiveTab('catalog');
    }
  }, [simpleMode, activeTab]);

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">Plan Your Trip</h1>
          <p className="text-gray-600">Browse our catalog of travel services and experiences</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, activities..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="accommodation">Accommodation</option>
              <option value="flights">Flights</option>
              <option value="activities">Activities</option>
              <option value="safaris">Safaris</option>
              <option value="transfers">Transfers</option>
            </select>

            {/* Simple Mode Toggle */}
            <label className="inline-flex items-center gap-2 ml-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={simpleMode}
                onChange={(e) => {
                  const on = !!e.target.checked;
                  setSimpleMode(on);
                  try {
                    if (on) localStorage.setItem('tripSimpleMode', '1'); else localStorage.removeItem('tripSimpleMode');
                  } catch (err) {}
                }}
              />
              <span>Simple mode</span>
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'catalog'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-600 hover:text-brand-brown'
            }`}
          >
            Travel Catalog
          </button>
          {!simpleMode && (
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'events'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-600 hover:text-brand-brown'
              }`}
            >
              Events
            </button>
          )}
        </div>

        {/* Catalog Tab */}
        {activeTab === 'catalog' && (
          <div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No results found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">{filteredProducts.length} services available</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-brand-orange hover:shadow-md transition-all"
                    >
                      {product.image && (
                        <div className="relative h-40">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-brand-brown text-sm">{product.title}</h3>
                          <span className="text-xs bg-orange-50 text-brand-orange px-2 py-1 rounded whitespace-nowrap">
                            {product.category}
                          </span>
                        </div>
                        
                        {product.city && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                            <MapPin className="w-3 h-3" />
                            {product.city}, {product.province}
                          </div>
                        )}
                        
                        {product.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {product.price && product.price > 0 ? (
                            <span className="text-base font-bold text-brand-orange">
                              R{product.price.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Price on request</span>
                          )}
                          
                          <button
                            onClick={() => {
                              try {
                                addToBasket(product);
                              } catch (e) {
                                // Fallback to event dispatch for integrations
                                const event = new CustomEvent('addToBasket', { detail: product });
                                window.dispatchEvent(event);
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium text-brand-orange border border-brand-orange rounded hover:bg-orange-50 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && !simpleMode && (
          <div>
            {loadingEvents ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange mx-auto mb-3"></div>
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-gray-600">No events available at the moment</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{events.length} events found</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-brand-orange hover:shadow-md transition-all"
                    >
                      {event.image && (
                        <div className="relative h-40">
                          <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-brand-brown text-sm mb-2">{event.name}</h3>
                        <div className="text-xs text-gray-600 mb-1">{event.date}</div>
                        {event.venue && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                            <MapPin className="w-3 h-3" />
                            {event.venue}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          {event.price ? (
                            <span className="text-base font-bold text-brand-orange">
                              From R{event.price}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Free</span>
                          )}
                          <button className="px-3 py-1 text-xs font-medium text-brand-orange border border-brand-orange rounded hover:bg-orange-50 transition-colors">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Floating Basket */}
        {basket.length > 0 && !simpleMode && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 border-2 border-brand-orange max-w-xs z-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-brand-brown">Trip Basket</h3>
              <span className="bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                {basket.length}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {basket.length} item{basket.length !== 1 ? 's' : ''} in your trip
            </p>
            <button
              onClick={() => navigate('/trip-basket')}
              className="w-full text-brand-orange border border-brand-orange font-medium py-2 rounded-lg hover:bg-orange-50 transition-colors text-sm"
            >
              View Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
