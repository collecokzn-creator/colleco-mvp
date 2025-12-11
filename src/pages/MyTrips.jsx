import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, MapPin, Plane, Hotel, Car, DollarSign, Filter,
  Search, Download, Share2, MessageCircle, CheckCircle2, 
  XCircle, Clock, AlertTriangle, ChevronDown, FileText, Mail
} from "lucide-react";

const TRIP_FILTERS = [
  { value: "all", label: "All Trips" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Trips" },
  { value: "cancelled", label: "Cancelled" }
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "amount_desc", label: "Highest Amount" },
  { value: "amount_asc", label: "Lowest Amount" }
];

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings/all');
      if (!response.ok) throw new Error('Failed to fetch trips');
      
      const data = await response.json();
      setTrips(data.bookings || mockTrips);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      // Use mock data
      setTrips(mockTrips);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const applyFiltersAndSort = useCallback(() => {
    let result = [...trips];

    // Apply status filter
    if (activeFilter !== "all") {
      const now = new Date();
      if (activeFilter === "upcoming") {
        result = result.filter(trip => new Date(trip.startDate) > now && trip.status !== 'cancelled');
      } else if (activeFilter === "past") {
        result = result.filter(trip => new Date(trip.endDate) < now && trip.status !== 'cancelled');
      } else if (activeFilter === "cancelled") {
        result = result.filter(trip => trip.status === 'cancelled');
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip => 
        trip.destination.toLowerCase().includes(query) ||
        trip.bookingRef.toLowerCase().includes(query) ||
        trip.accommodation?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.startDate) - new Date(a.startDate);
        case "date_asc":
          return new Date(a.startDate) - new Date(b.startDate);
        case "amount_desc":
          return b.totalAmount - a.totalAmount;
        case "amount_asc":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredTrips(result);
  }, [trips, activeFilter, sortBy, searchQuery]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  

  

  const getStatusConfig = (trip) => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    if (trip.status === 'cancelled') {
      return { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle, borderColor: "border-red-300" };
    }
    if (trip.status === 'pending_payment') {
      return { label: "Payment Pending", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, borderColor: "border-yellow-300" };
    }
    if (now >= startDate && now <= endDate) {
      return { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Plane, borderColor: "border-blue-300" };
    }
    if (endDate < now) {
      return { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2, borderColor: "border-gray-300" };
    }
    if (startDate > now) {
      return { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle2, borderColor: "border-green-300" };
    }
    return { label: "Pending", color: "bg-gray-100 text-gray-800", icon: Clock, borderColor: "border-gray-300" };
  };

  const renderTripCard = (trip) => {
    const statusConfig = getStatusConfig(trip);
    const StatusIcon = statusConfig.icon;

    return (
      <div 
        key={trip.id}
        className={`bg-white rounded-lg border-2 ${statusConfig.borderColor} hover:shadow-lg transition-all cursor-pointer`}
        onClick={() => navigate(`/bookings/${trip.id}`)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-brand-brown hover:text-brand-orange transition-colors">
                  {trip.destination}
                </h3>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>
              </div>
              <p className="text-sm text-gray-500">Ref: {trip.bookingRef}</p>
            </div>
          </div>

          {/* Date & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-brand-orange" />
              <span>
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>{trip.travelers} traveler(s) • {trip.duration} days</span>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-cream-light rounded-lg">
            {trip.flight && (
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-brand-orange" />
                <span className="text-xs text-gray-700">Flight</span>
              </div>
            )}
            {trip.accommodation && (
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4 text-brand-orange" />
                <span className="text-xs text-gray-700">{trip.accommodation}</span>
              </div>
            )}
            {trip.transport && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-brand-orange" />
                <span className="text-xs text-gray-700">Transport</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-semibold text-gray-700">
                {trip.currency} {trip.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${trip.id}`); }}
              className="flex items-center gap-1 px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); /* Download action */ }}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); /* Share action */ }}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            {trip.hasMessages && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/messages/${trip.id}`); }}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Messages {trip.unreadMessages > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {trip.unreadMessages}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">My Trips</h1>
          <p className="text-gray-600">Manage all your bookings and travel plans</p>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {TRIP_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeFilter === filter.value
                    ? 'bg-brand-orange text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-orange'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination, reference, or hotel..."
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-orange focus:border-transparent cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold text-sm">Filters</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <strong>{filteredTrips.length}</strong> of <strong>{trips.length}</strong> trips
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-brand-orange text-sm font-semibold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-brand-brown mb-2">No trips found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "Try adjusting your search or filters" : "You haven't booked any trips yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/plan-trip')}
                className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Plan Your First Trip
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTrips.map(renderTripCard)}
          </div>
        )}

        {/* Newsletter CTA */}
        {filteredTrips.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-lg p-8 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Get Travel Inspiration</h3>
            <p className="mb-4 opacity-90">Subscribe to our newsletter for exclusive deals and travel tips</p>
            <button className="px-6 py-3 bg-white text-brand-orange rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for development
const mockTrips = [
  {
    id: "TRV001",
    bookingRef: "COL-2025-001",
    destination: "Kruger National Park Safari",
    startDate: "2025-12-15",
    endDate: "2025-12-20",
    duration: 5,
    travelers: 2,
    status: "confirmed",
    accommodation: "Sabi Sabi Private Lodge",
    flight: true,
    transport: true,
    currency: "ZAR",
    totalAmount: 35900,
    hasMessages: true,
    unreadMessages: 2
  },
  {
    id: "TRV002",
    bookingRef: "COL-2025-002",
    destination: "Cape Town & Winelands",
    startDate: "2025-11-28",
    endDate: "2025-12-03",
    duration: 5,
    travelers: 4,
    status: "confirmed",
    accommodation: "Table Bay Hotel",
    flight: false,
    transport: true,
    currency: "ZAR",
    totalAmount: 28500,
    hasMessages: false,
    unreadMessages: 0
  },
  {
    id: "TRV003",
    bookingRef: "COL-2025-003",
    destination: "Zanzibar Beach Escape",
    startDate: "2025-10-10",
    endDate: "2025-10-17",
    duration: 7,
    travelers: 2,
    status: "completed",
    accommodation: "The Rock Resort",
    flight: true,
    transport: true,
    currency: "ZAR",
    totalAmount: 42000,
    hasMessages: true,
    unreadMessages: 0
  }
];
