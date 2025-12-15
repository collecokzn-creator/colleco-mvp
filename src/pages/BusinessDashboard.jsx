import { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  Users, Briefcase, DollarSign, Calendar, MapPin,
  Download, Plus, Filter as _Filter, BarChart3, FileText,
  CheckCircle2, AlertCircle as _AlertCircle, User, Plane, Hotel, Car
} from "lucide-react";

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeTrips: 0,
    totalSpend: 0,
    activeTravelers: 0,
    pendingApprovals: 0,
    avgTripCost: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [topTravelers, setTopTravelers] = useState([]);
  const [spendByCategory, setSpendByCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

  useEffect(() => {
    fetchDashboardData();
    if (successMessage) {
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [successMessage]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Try API first
      try {
        const [statsRes, bookingsRes, tripsRes, travelersRes, spendRes] = await Promise.all([
          fetch('/api/business-travelers/stats').then(r => r.json()),
          fetch('/api/business-travelers/bookings/recent').then(r => r.json()),
          fetch('/api/business-travelers/trips/upcoming').then(r => r.json()),
          fetch('/api/business-travelers/travelers/top').then(r => r.json()),
          fetch('/api/business-travelers/spend/by-category').then(r => r.json())
        ]);

        setStats(statsRes);
        setRecentBookings(bookingsRes);
        setUpcomingTrips(tripsRes);
        setTopTravelers(travelersRes);
        setSpendByCategory(spendRes);
      } catch (apiError) {
        console.log('API not available, using localStorage fallback');
        
        // Fallback to localStorage
        const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
        const travelHistory = JSON.parse(localStorage.getItem('colleco.travel.history') || '[]');
        const users = JSON.parse(localStorage.getItem('colleco.users') || '[]');
        
        // Calculate stats from localStorage
        const now = new Date();
        const activeTrips = bookings.filter(b => {
          if (!b.date || !b.endDate) return false;
          const start = new Date(b.date);
          const end = new Date(b.endDate);
          return start <= now && end >= now;
        }).length;
        
        const totalSpend = [...bookings, ...travelHistory]
          .reduce((sum, x) => sum + (x.amount || 0), 0);
        
        const businessTravelers = users.filter(u => u.role === 'business-traveler' || u.type === 'business');
        
        const avgTripCost = bookings.length > 0 
          ? Math.round(totalSpend / bookings.length) 
          : 0;
        
        const pendingApprovals = bookings.filter(b => b.status === 'pending').length;
        
        // Use demo data if localStorage is empty
        if (bookings.length === 0 && users.length === 0) {
          setStats({
            totalBookings: 156,
            activeTrips: 12,
            totalSpend: 342500,
            activeTravelers: 45,
            pendingApprovals: 8,
            avgTripCost: 8750
          });
          
          setRecentBookings([
            { id: 1, traveler: 'John Smith', destination: 'Cape Town', date: new Date().toISOString(), amount: 12500, status: 'confirmed' },
            { id: 2, traveler: 'Jane Doe', destination: 'Johannesburg', date: new Date(Date.now() - 86400000).toISOString(), amount: 8900, status: 'pending' }
          ]);
          
          setUpcomingTrips([
            { id: 1, destination: 'Durban', startDate: new Date(Date.now() + 7 * 86400000).toISOString(), travelers: 2, totalAmount: 15600 }
          ]);
          
          setTopTravelers([
            { id: 1, name: 'John Smith', trips: 12, spend: 45000 },
            { id: 2, name: 'Jane Doe', trips: 8, spend: 32000 }
          ]);
          
          setSpendByCategory([
            { category: 'Accommodation', amount: 195000, percentage: 57 },
            { category: 'Transport', amount: 99000, percentage: 29 },
            { category: 'Tours', amount: 48500, percentage: 14 }
          ]);
        } else {
          setStats({
            totalBookings: bookings.length,
            activeTrips,
            totalSpend,
            activeTravelers: businessTravelers.length,
            pendingApprovals,
            avgTripCost
          });
          
          setRecentBookings(bookings.slice(0, 10).map(b => ({
            ...b,
            traveler: b.user || 'Guest User'
          })));
          
          setUpcomingTrips(bookings.filter(b => {
            if (!b.date) return false;
            return new Date(b.date) > now;
          }).slice(0, 5));
          
          // Calculate top travelers
          const travelerSpend = {};
          bookings.forEach(b => {
            const userId = b.userId || b.user;
            if (!travelerSpend[userId]) {
              travelerSpend[userId] = { trips: 0, spend: 0, name: b.user || userId };
            }
            travelerSpend[userId].trips++;
            travelerSpend[userId].spend += (b.amount || 0);
          });
          
          const topTravelersData = Object.values(travelerSpend)
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 5)
            .map((t, idx) => ({ id: idx + 1, ...t }));
          
          setTopTravelers(topTravelersData);
          
          // Calculate spend by category (estimate if not categorized)
          const totalAmount = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
          setSpendByCategory([
            { category: 'Accommodation', amount: Math.round(totalAmount * 0.57), percentage: 57 },
            { category: 'Transport', amount: Math.round(totalAmount * 0.29), percentage: 29 },
            { category: 'Tours', amount: Math.round(totalAmount * 0.14), percentage: 14 }
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStatsCards = () => {
    const cards = [
      { 
        label: "Total Bookings", 
        value: stats.totalBookings, 
        icon: Briefcase, 
        color: "blue",
        trend: "+12% from last month"
      },
      { 
        label: "Active Trips", 
        value: stats.activeTrips, 
        icon: MapPin, 
        color: "green",
        trend: `${stats.activeTrips} in progress`
      },
      { 
        label: "Total Spend", 
        value: formatCurrency(stats.totalSpend), 
        icon: DollarSign, 
        color: "purple",
        trend: "This fiscal year"
      },
      { 
        label: "Active Travelers", 
        value: stats.activeTravelers, 
        icon: Users, 
        color: "orange",
        trend: `${stats.pendingApprovals} pending approval`
      }
    ];

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            purple: "bg-purple-100 text-purple-600",
            orange: "bg-orange-100 text-brand-orange"
          };

          return (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.label}</h3>
              <p className="text-2xl font-bold text-brand-brown mb-2">{card.value}</p>
              <p className="text-xs text-gray-500">{card.trend}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { label: "Book Travel", icon: Plus, color: "bg-brand-orange", action: () => navigate('/plan-trip') },
      { label: "Manage Travelers", icon: Users, color: "bg-blue-600", action: () => navigate('/business/travelers') },
      { label: "View Reports", icon: BarChart3, color: "bg-purple-600", action: () => navigate('/business/reports') },
      { label: "Download Invoice", icon: Download, color: "bg-green-600", action: () => navigate('/business/invoices') }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2 shadow-md`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const configs = {
      confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
      completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
      pending_approval: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending Approval" }
    };

    const config = configs[status] || configs.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderUpcomingTrips = () => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-brand-brown">Upcoming Trips</h2>
        <button 
          onClick={() => navigate('/business/trips')}
          className="text-brand-orange font-semibold text-sm hover:underline"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading trips...</div>
      ) : upcomingTrips.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No upcoming trips</p>
          <button
            onClick={() => navigate('/plan-trip')}
            className="mt-4 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Book New Trip
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingTrips.map((trip) => (
            <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:border-brand-orange transition-colors cursor-pointer" onClick={() => navigate(`/booking/${trip.bookingRef}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-brown mb-1">{trip.destination}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{trip.travelerName}</span>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(trip.status)}
                  <p className="text-sm font-bold text-brand-brown mt-2">{formatCurrency(trip.totalAmount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                {trip.services?.flight && (
                  <div className="flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    <span>Flight</span>
                  </div>
                )}
                {trip.services?.accommodation && (
                  <div className="flex items-center gap-1">
                    <Hotel className="w-3 h-3" />
                    <span>Hotel</span>
                  </div>
                )}
                {trip.services?.transport && (
                  <div className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    <span>Transfer</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecentBookings = () => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-brand-brown">Recent Bookings</h2>
        <button 
          onClick={() => navigate('/business/bookings')}
          className="text-brand-orange font-semibold text-sm hover:underline"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading bookings...</div>
      ) : recentBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No recent bookings</div>
      ) : (
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-brand-orange transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                  <p className="font-semibold text-brand-brown text-sm">{booking.travelerName}</p>
                  <p className="text-xs text-gray-500">{booking.destination} • {booking.bookingRef}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-brown text-sm">{formatCurrency(booking.amount)}</p>
                <p className="text-xs text-gray-500">{new Date(booking.bookedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSpendAnalysis = () => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-brand-brown mb-6">Spend by Category</h2>
      
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading analysis...</div>
      ) : spendByCategory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No spend data available</div>
      ) : (
        <div className="space-y-4">
          {spendByCategory.map((category) => {
            const percentage = stats.totalSpend > 0 ? (category.amount / stats.totalSpend) * 100 : 0;
            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm font-bold text-brand-brown">{formatCurrency(category.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-brand-orange h-2 rounded-full transition-all" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total spend</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTopTravelers = () => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-brand-brown mb-6">Top Travelers</h2>
      
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading travelers...</div>
      ) : topTravelers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No traveler data available</div>
      ) : (
        <div className="space-y-4">
          {topTravelers.map((traveler, idx) => (
            <div key={traveler.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-brown text-sm">{traveler.name}</p>
                <p className="text-xs text-gray-500">{traveler.trips} trips • {traveler.department}</p>
              </div>
              <p className="text-sm font-bold text-gray-700">{formatCurrency(traveler.totalSpend)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange/90">
          Business workspace
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-brand-brown sm:text-3xl">
            Business Travel Dashboard
          </h1>
          <p className="max-w-3xl text-base text-brand-brown/75">
            Manage your corporate travel and team bookings
          </p>
        </div>
      </header>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upcoming Trips - Takes 2 columns */}
          <div className="lg:col-span-2">
            {renderUpcomingTrips()}
          </div>

          {/* Recent Bookings */}
          <div>
            {renderRecentBookings()}
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spend Analysis */}
          {renderSpendAnalysis()}

          {/* Top Travelers */}
          {renderTopTravelers()}
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">Need Help Managing Business Travel?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Our dedicated business travel team is here to assist with booking, policy setup, reporting, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="mailto:business@collecotravel.com" className="text-sm font-semibold text-blue-700 hover:underline">
                  Contact Support
                </a>
                <span className="text-blue-300">•</span>
                <button onClick={() => navigate('/business/help')} className="text-sm font-semibold text-blue-700 hover:underline">
                  View Help Center
                </button>
                <span className="text-blue-300">•</span>
                <button onClick={() => navigate('/business/reports')} className="text-sm font-semibold text-blue-700 hover:underline">
                  Download Reports
                </button>
              </div>
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
