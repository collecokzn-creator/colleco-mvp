import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { 
  Calendar, MapPin, Plane, Hotel, Car, DollarSign, 
  Clock, CheckCircle2, XCircle, AlertCircle as _AlertCircle, TrendingUp,
  Bookmark, FileText, MessageCircle, Star, ArrowRight, Plus
} from "lucide-react";
import GamificationWidget from "../components/GamificationWidget";

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

      // Try API first, fallback to localStorage
      try {
        const tripsResponse = await fetch('/api/bookings/upcoming');
        if (tripsResponse.ok) {
          const tripsData = await tripsResponse.json();
          setUpcomingTrips(tripsData.bookings || []);
        } else {
          throw new Error('API not available');
        }
      } catch {
        // Fallback to localStorage bookings
        const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
        const now = new Date();
        const upcoming = bookings.filter(b => {
          if (!b.date) return false;
          const bookingDate = new Date(b.date);
          return bookingDate > now && b.status !== 'cancelled';
        }).slice(0, 5);
        setUpcomingTrips(upcoming);
      }

      // Fetch saved itineraries (fallback to localStorage)
      try {
        const itinerariesResponse = await fetch('/api/itineraries/saved');
        if (itinerariesResponse.ok) {
          const itinerariesData = await itinerariesResponse.json();
          setSavedItineraries(itinerariesData.itineraries || []);
        } else {
          throw new Error('API not available');
        }
      } catch {
        const savedItineraries = JSON.parse(localStorage.getItem('colleco.itineraries') || '[]');
        setSavedItineraries(savedItineraries.slice(0, 3));
      }

      // Fetch recent activity (fallback to demo)
      try {
        const activityResponse = await fetch('/api/activity/recent');
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities || []);
        } else {
          throw new Error('API not available');
        }
      } catch {
        setRecentActivity([
          { id: 1, type: 'booking', message: 'Booking confirmed for Cape Town', date: new Date().toISOString() },
          { id: 2, type: 'quote', message: 'New quote received', date: new Date(Date.now() - 86400000).toISOString() }
        ]);
      }

      // Fetch stats (calculate from localStorage)
      try {
        const statsResponse = await fetch('/api/travelers/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else {
          throw new Error('API not available');
        }
      } catch {
        const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
        const travelHistory = JSON.parse(localStorage.getItem('colleco.travel.history') || '[]');
        
        const uniqueCountries = new Set(
          [...bookings, ...travelHistory]
            .map(x => x.country || x.destination)
            .filter(Boolean)
        );
        
        const totalSpent = [...bookings, ...travelHistory]
          .reduce((sum, x) => sum + (x.amount || 0), 0);
        
        setStats({
          totalTrips: travelHistory.length,
          countriesVisited: uniqueCountries.size,
          totalSpent,
          rewardsPoints: Math.floor(totalSpent / 100) // 1 point per R100 spent
        });
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
      <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-brand-brown">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-brown/60">{label}</p>
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
        className="bg-white/80 p-6 rounded-xl border border-cream-border hover:border-brand-orange transition-all cursor-pointer group shadow-sm"
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange/90">
          Client workspace
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-brand-brown sm:text-3xl">
            Welcome back, {user?.name || 'Traveler'}! ✈️
          </h1>
          <p className="max-w-3xl text-base text-brand-brown/75">
            Here's what's happening with your trips
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <section>
        <h2 className="text-lg font-semibold text-brand-brown mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {renderQuickAction(Plus, "Plan New Trip", () => navigate('/plan-trip'))}
            {renderQuickAction(Calendar, "My Bookings", () => navigate('/my-trips'))}
            {renderQuickAction(Star, "Rewards", () => navigate('/loyalty'))}
            {renderQuickAction(Bookmark, "Saved Itineraries", () => navigate('/saved-itineraries'))}
            {renderQuickAction(MessageCircle, "Trip Assistant", () => navigate('/trip-assist'))}
            {renderQuickAction(FileText, "Documents", () => navigate('/travel-documents'))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gamification Widget - Mobile */}
            <div className="lg:hidden">
              <GamificationWidget userId={user?.id || 'user_123'} compact={false} />
            </div>

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
            {/* Gamification Widget - Desktop */}
            <div className="hidden lg:block">
              <GamificationWidget userId={user?.id || 'user_123'} compact={false} />
            </div>

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

      {/* Footer */}
      <footer className="border-t border-cream-border pt-6 text-sm text-brand-brown/70">
        <p>© CollEco Travel – The Odyssey of Adventure</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <NavLink to="/legal/privacy" className="hover:text-brand-brown">Privacy Policy</NavLink>
          <NavLink to="/legal/terms" className="hover:text-brand-brown">Terms</NavLink>
        </div>
      </footer>
    </div>
  );
}
