import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, MapPin, Plane, Hotel, Car, DollarSign, 
  Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp,
  Bookmark, FileText, MessageCircle, Star, ArrowRight, Plus
} from "lucide-react";

export default function TravelerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    countriesVisited: 0,
    totalSpent: 0,
    rewardsPoints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user data from localStorage or API
      const userData = JSON.parse(localStorage.getItem('colleco.user') || '{}');
      setUser(userData);

      // Fetch upcoming trips
      const tripsResponse = await fetch('/api/bookings/upcoming');
      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json();
        setUpcomingTrips(tripsData.bookings || []);
      }

      // Fetch saved itineraries
      const itinerariesResponse = await fetch('/api/itineraries/saved');
      if (itinerariesResponse.ok) {
        const itinerariesData = await itinerariesResponse.json();
        setSavedItineraries(itinerariesData.itineraries || []);
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/activity/recent');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/travelers/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setLoading(false);
    }
  };

  const renderStatCard = (icon, label, value, color = "brand-orange") => {
    const Icon = icon;
    return (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-full bg-${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-brand-brown mb-1">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    );
  };

  const renderUpcomingTripCard = (trip) => {
    const statusConfig = {
      confirmed: { label: "Confirmed", color: "text-green-600", icon: CheckCircle2 },
      pending: { label: "Pending", color: "text-yellow-600", icon: Clock },
      cancelled: { label: "Cancelled", color: "text-red-600", icon: XCircle }
    };

    const config = statusConfig[trip.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div 
        key={trip.id} 
        className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-brand-orange transition-all cursor-pointer group"
        onClick={() => navigate(`/bookings/${trip.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-brand-brown mb-1 group-hover:text-brand-orange transition-colors">
              {trip.destination}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {trip.accommodation && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Hotel className="w-4 h-4 text-brand-orange" />
              <span>{trip.accommodation}</span>
            </div>
          )}
          {trip.flight && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Plane className="w-4 h-4 text-brand-orange" />
              <span>{trip.flight}</span>
            </div>
          )}
          {trip.transport && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Car className="w-4 h-4 text-brand-orange" />
              <span>{trip.transport}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <DollarSign className="w-4 h-4 text-brand-orange" />
            <span className="font-semibold">{trip.currency} {trip.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-gray-500">{trip.travelers} traveler(s)</span>
          <button className="text-brand-orange text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderSavedItinerary = (itinerary) => (
    <div 
      key={itinerary.id}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand-orange transition-all cursor-pointer group"
      onClick={() => navigate(`/itineraries/${itinerary.id}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-brand-brown group-hover:text-brand-orange transition-colors">
            {itinerary.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            <span>{itinerary.destinations?.join(', ')}</span>
          </div>
        </div>
        <Bookmark className="w-5 h-5 text-brand-orange" />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{itinerary.duration} days</span>
        <span>Saved {new Date(itinerary.savedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );

  const renderQuickAction = (icon, label, onClick, color = "brand-orange") => {
    const Icon = icon;
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-2 p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-${color} hover:shadow-md transition-all group`}
      >
        <div className={`p-3 rounded-full bg-${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        <span className="text-sm font-semibold text-brand-brown">{label}</span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">
            Welcome back, {user?.name || 'Traveler'}! ✈️
          </h1>
          <p className="text-gray-600">Here's what's happening with your trips</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {renderStatCard(Plane, "Total Trips", stats.totalTrips)}
          {renderStatCard(MapPin, "Countries Visited", stats.countriesVisited)}
          {renderStatCard(DollarSign, "Total Spent", `R ${stats.totalSpent?.toLocaleString()}`)}
          <div 
            onClick={() => navigate('/loyalty')} 
            className="cursor-pointer"
          >
            {renderStatCard(Star, "Rewards Points", stats.rewardsPoints)}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-brand-brown mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {renderQuickAction(Plus, "Plan New Trip", () => navigate('/plan-trip'))}
            {renderQuickAction(Calendar, "My Bookings", () => navigate('/my-trips'))}
            {renderQuickAction(Star, "Rewards", () => navigate('/loyalty'))}
            {renderQuickAction(Bookmark, "Saved Itineraries", () => navigate('/saved-itineraries'))}
            {renderQuickAction(MessageCircle, "Trip Assistant", () => navigate('/trip-assist'))}
            {renderQuickAction(FileText, "Documents", () => navigate('/travel-documents'))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Trips */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-brand-brown">Upcoming Trips</h2>
                <button
                  onClick={() => navigate('/my-trips')}
                  className="text-brand-orange text-sm font-semibold hover:underline flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {upcomingTrips.length === 0 ? (
                <div className="bg-white p-12 rounded-lg text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-brand-brown mb-2">No upcoming trips</h3>
                  <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                  <button
                    onClick={() => navigate('/plan-trip')}
                    className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Plan a Trip
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTrips.slice(0, 3).map(renderUpcomingTripCard)}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-bold text-brand-brown mb-4">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0">
                        <div className="p-2 rounded-full bg-brand-orange bg-opacity-10">
                          {activity.type === 'booking' && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}
                          {activity.type === 'itinerary' && <Bookmark className="w-4 h-4 text-brand-orange" />}
                          {activity.type === 'message' && <MessageCircle className="w-4 h-4 text-brand-orange" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-brand-brown font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.timeAgo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Itineraries */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-brand-brown">Saved Itineraries</h3>
                <button
                  onClick={() => navigate('/saved-itineraries')}
                  className="text-brand-orange text-sm hover:underline"
                >
                  See All
                </button>
              </div>
              
              {savedItineraries.length === 0 ? (
                <div className="text-center py-6">
                  <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No saved itineraries</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedItineraries.slice(0, 3).map(renderSavedItinerary)}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-brand-orange to-orange-600 text-white rounded-lg shadow-md p-6">
              <h3 className="font-bold mb-2">✨ Recommended for You</h3>
              <p className="text-sm mb-4 opacity-90">
                Based on your travel history and preferences
              </p>
              <div className="space-y-2">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="font-semibold text-sm">Garden Route Adventure</p>
                  <p className="text-xs opacity-90">7 days • From R12,500 pp</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="font-semibold text-sm">Kruger Safari Escape</p>
                  <p className="text-xs opacity-90">5 days • From R15,900 pp</p>
                </div>
              </div>
              <button className="mt-4 w-full bg-white text-brand-orange rounded-lg py-2 font-semibold text-sm hover:bg-opacity-90 transition-colors">
                Explore Packages
              </button>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Our travel experts are here to assist you 24/7
              </p>
              <button
                onClick={() => navigate('/support')}
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
