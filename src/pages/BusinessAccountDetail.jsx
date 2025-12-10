/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, Users, _Mail, _Phone, _MapPin, Calendar, DollarSign,
  Briefcase, Edit, Download, FileText, _TrendingUp, CheckCircle2, Clock,
  AlertCircle, _Settings, BarChart3, CreditCard, Shield, User, Plane, Hotel, Car
} from "lucide-react";

export default function BusinessAccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [travelers, setTravelers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    setIsLoading(true);
    try {
      const [accountRes, travelersRes, bookingsRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/business-accounts/${accountId}`).then(r => r.json()),
        fetch(`/api/admin/business-accounts/${accountId}/travelers`).then(r => r.json()),
        fetch(`/api/admin/business-accounts/${accountId}/bookings`).then(r => r.json()),
        fetch(`/api/admin/business-accounts/${accountId}/analytics`).then(r => r.json())
      ]);

      setAccount(accountRes);
      setTravelers(travelersRes);
      setRecentBookings(bookingsRes);
      setAnalytics(analyticsRes);
    } catch (error) {
      console.error('Failed to fetch account details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      confirmed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle2 },
      completed: { bg: "bg-gray-100", text: "text-gray-700", icon: CheckCircle2 }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-brand-brown mb-2">Account Not Found</h2>
          <button
            onClick={() => navigate('/admin/business-accounts')}
            className="mt-4 px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Account Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-brand-brown mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Business Name</label>
              <p className="text-brand-brown font-medium">{account.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Registration Number</label>
              <p className="text-brand-brown font-medium">{account.registrationNumber}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Business Type</label>
              <p className="text-brand-brown font-medium capitalize">{account.businessType}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Company Size</label>
              <p className="text-brand-brown font-medium">{account.companySize}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Primary Contact</label>
              <p className="text-brand-brown font-medium">{account.contactName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Email</label>
              <p className="text-brand-brown font-medium">{account.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Phone</label>
              <p className="text-brand-brown font-medium">{account.phone}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <div className="mt-1">{getStatusBadge(account.status)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Spend</span>
          </div>
          <p className="text-2xl font-bold text-brand-brown">{formatCurrency(account.totalSpend)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Bookings</span>
          </div>
          <p className="text-2xl font-bold text-brand-brown">{account.totalBookings || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Active Travelers</span>
          </div>
          <p className="text-2xl font-bold text-brand-brown">{account.activeTravelers || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-brand-orange" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Account Age</span>
          </div>
          <p className="text-2xl font-bold text-brand-brown">
            {Math.floor((new Date() - new Date(account.createdAt)) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-brand-brown mb-4">Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <Shield className={`w-5 h-5 ${account.settings?.requiresApprovalWorkflow ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-semibold text-brand-brown">Approval Workflow</p>
              <p className="text-sm text-gray-600">
                {account.settings?.requiresApprovalWorkflow ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <CreditCard className={`w-5 h-5 ${account.settings?.centralizedBilling ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-semibold text-brand-brown">Centralized Billing</p>
              <p className="text-sm text-gray-600">
                {account.settings?.centralizedBilling ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTravelersTab = () => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-brand-brown">Registered Travelers</h3>
        <button className="px-4 py-2 text-brand-orange border border-brand-orange rounded-lg hover:bg-orange-50">
          Add Traveler
        </button>
      </div>
      {travelers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No travelers registered yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {travelers.map(traveler => (
            <div key={traveler.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-orange transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                  <p className="font-semibold text-brand-brown">{traveler.name}</p>
                  <p className="text-sm text-gray-600">{traveler.email} • {traveler.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-brown">{traveler.trips} trips</p>
                <p className="text-xs text-gray-500">{formatCurrency(traveler.totalSpend)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookingsTab = () => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-brand-brown mb-6">Recent Bookings</h3>
      {recentBookings.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentBookings.map(booking => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-brand-orange transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-brand-brown mb-1">{booking.destination}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{booking.travelerName}</span>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(booking.status)}
                  <p className="text-sm font-bold text-brand-brown mt-2">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {booking.services?.flight && (
                  <div className="flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    <span>Flight</span>
                  </div>
                )}
                {booking.services?.accommodation && (
                  <div className="flex items-center gap-1">
                    <Hotel className="w-3 h-3" />
                    <span>Hotel</span>
                  </div>
                )}
                {booking.services?.transport && (
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

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-brand-brown mb-6">Spend by Category</h3>
        {analytics?.spendByCategory?.map(category => {
          const percentage = account.totalSpend > 0 ? (category.amount / account.totalSpend) * 100 : 0;
          return (
            <div key={category.name} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-sm font-bold text-brand-brown">{formatCurrency(category.amount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand-orange h-2 rounded-full" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-brand-brown mb-4">Monthly Trends</h3>
        <p className="text-gray-600">Analytics visualization coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/business-accounts')}
            className="flex items-center gap-2 text-brand-orange hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Accounts</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200">
                <Building2 className="w-8 h-8 text-brand-orange" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-brown mb-1">{account.businessName}</h1>
                <p className="text-gray-600">{account.businessType} • {account.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/admin/business-accounts/${accountId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-brand-orange transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "travelers", label: "Travelers", icon: Users },
              { id: "bookings", label: "Bookings", icon: Briefcase },
              { id: "analytics", label: "Analytics", icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-brand-orange text-brand-orange"
                      : "border-transparent text-gray-600 hover:text-brand-brown"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "travelers" && renderTravelersTab()}
        {activeTab === "bookings" && renderBookingsTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
      </div>
    </div>
  );
}
