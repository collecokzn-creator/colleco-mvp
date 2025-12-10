import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bookmark, MapPin, Calendar, DollarSign, Clock, 
  Trash2, Share2, Edit, ArrowRight as _ArrowRight, Plus, Search,
  Filter as _Filter, Download as _Download, Copy, CheckCircle2, Sparkles
} from "lucide-react";

export default function SavedItineraries() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchItineraries();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [itineraries, searchQuery, sortBy]);

  const fetchItineraries = async () => {
    try {
      const response = await fetch('/api/itineraries/saved');
      if (!response.ok) throw new Error('Failed to fetch itineraries');
      
      const data = await response.json();
      setItineraries(data.itineraries || mockItineraries);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setItineraries(mockItineraries);
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...itineraries];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(itinerary =>
        itinerary.title.toLowerCase().includes(query) ||
        itinerary.destinations?.some(d => d.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.savedAt) - new Date(a.savedAt);
        case "oldest":
          return new Date(a.savedAt) - new Date(b.savedAt);
        case "duration_desc":
          return b.duration - a.duration;
        case "duration_asc":
          return a.duration - b.duration;
        case "budget_desc":
          return b.estimatedBudget - a.estimatedBudget;
        case "budget_asc":
          return a.estimatedBudget - b.estimatedBudget;
        default:
          return 0;
      }
    });

    setFilteredItineraries(result);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const response = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      
      setItineraries(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete itinerary');
    }
  };

  const handleDuplicate = async (itinerary, e) => {
    e.stopPropagation();
    
    const newItinerary = {
      ...itinerary,
      id: `ITN-${Date.now()}`,
      title: `${itinerary.title} (Copy)`,
      savedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItinerary)
      });

      if (!response.ok) throw new Error('Duplicate failed');
      
      const result = await response.json();
      setItineraries(prev => [result.itinerary, ...prev]);
    } catch (error) {
      console.error('Duplicate error:', error);
    }
  };

  const handleConvertToBooking = (id, e) => {
    e.stopPropagation();
    navigate(`/book-itinerary/${id}`);
  };

  const renderItineraryCard = (itinerary) => (
    <div
      key={itinerary.id}
      className="bg-white rounded-lg border-2 border-gray-200 hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => navigate(`/itineraries/${itinerary.id}`)}
    >
      {/* Thumbnail/Header */}
      <div className="relative h-48 bg-gradient-to-br from-brand-orange to-orange-600 rounded-t-lg overflow-hidden">
        {itinerary.thumbnail ? (
          <img
            src={itinerary.thumbnail}
            alt={itinerary.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Sparkles className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <Bookmark className="w-5 h-5 text-brand-orange fill-brand-orange" />
          </div>
        </div>
        {itinerary.isAIGenerated && (
          <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-orange transition-colors">
          {itinerary.title}
        </h3>

        {/* Destinations */}
        <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-brand-orange mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{itinerary.destinations?.join(' → ')}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-cream-light rounded-lg">
          <div className="text-center">
            <Calendar className="w-4 h-4 text-brand-orange mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">{itinerary.duration} days</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-4 h-4 text-brand-orange mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">
              {itinerary.currency} {itinerary.estimatedBudget?.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <Clock className="w-4 h-4 text-brand-orange mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">{itinerary.activities || 0} activities</p>
          </div>
        </div>

        {/* Description */}
        {itinerary.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{itinerary.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-3 border-t">
          <span>Saved {new Date(itinerary.savedAt).toLocaleDateString()}</span>
          {itinerary.lastModified && (
            <span>Modified {new Date(itinerary.lastModified).toLocaleDateString()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/itineraries/${itinerary.id}/edit`); }}
            className="flex items-center gap-1 px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={(e) => handleConvertToBooking(itinerary.id, e)}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Book Now
          </button>
          <button
            onClick={(e) => handleDuplicate(itinerary, e)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); /* Share */ }}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDelete(itinerary.id, e)}
            className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">Saved Itineraries</h1>
            <p className="text-gray-600">Your saved travel plans and AI-generated itineraries</p>
          </div>
          <button
            onClick={() => navigate('/trip-assist')}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Itinerary
          </button>
        </div>

        {/* Search & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search itineraries..."
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="duration_desc">Longest Duration</option>
            <option value="duration_asc">Shortest Duration</option>
            <option value="budget_desc">Highest Budget</option>
            <option value="budget_asc">Lowest Budget</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing <strong>{filteredItineraries.length}</strong> of <strong>{itineraries.length}</strong> itineraries
          </p>
        </div>

        {/* Itineraries Grid */}
        {filteredItineraries.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-brand-brown mb-2">No saved itineraries</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "No itineraries match your search" : "Start planning your dream trip with AI assistance"}
            </p>
            <button
              onClick={() => navigate('/trip-assist')}
              className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Use Trip Assistant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItineraries.map(renderItineraryCard)}
          </div>
        )}

        {/* CTA Banner */}
        {filteredItineraries.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Let AI Plan Your Next Adventure</h3>
            <p className="mb-4 opacity-90">Get personalized itineraries in seconds with our AI Trip Assistant</p>
            <button
              onClick={() => navigate('/trip-assist')}
              className="px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Try Trip Assistant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data
const mockItineraries = [
  {
    id: "ITN-001",
    title: "Cape Town & Winelands Explorer",
    destinations: ["Cape Town", "Stellenbosch", "Franschhoek", "Hermanus"],
    duration: 7,
    currency: "ZAR",
    estimatedBudget: 18500,
    activities: 12,
    description: "Experience the beauty of the Western Cape with city tours, wine tasting, and coastal adventures.",
    savedAt: "2025-11-20T10:00:00Z",
    lastModified: "2025-11-22T15:30:00Z",
    isAIGenerated: true,
    thumbnail: null
  },
  {
    id: "ITN-002",
    title: "Kruger Safari Adventure",
    destinations: ["Johannesburg", "Kruger National Park", "Blyde River Canyon"],
    duration: 5,
    currency: "ZAR",
    estimatedBudget: 32000,
    activities: 8,
    description: "Big Five safari with luxury lodge accommodation and guided game drives.",
    savedAt: "2025-11-15T14:00:00Z",
    lastModified: null,
    isAIGenerated: false,
    thumbnail: null
  },
  {
    id: "ITN-003",
    title: "Garden Route Road Trip",
    destinations: ["Cape Town", "Mossel Bay", "Knysna", "Plettenberg Bay", "Port Elizabeth"],
    duration: 10,
    currency: "ZAR",
    estimatedBudget: 25000,
    activities: 15,
    description: "Scenic coastal drive with beaches, forests, and adventure activities.",
    savedAt: "2025-11-10T09:00:00Z",
    lastModified: "2025-11-18T11:00:00Z",
    isAIGenerated: true,
    thumbnail: null
  }
];
