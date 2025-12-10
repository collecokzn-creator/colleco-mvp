import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users as _Users, Search, Filter as _Filter, Download as _Download, Eye, Edit, Mail,
  Phone, DollarSign, Calendar, TrendingUp as _TrendingUp, CheckCircle2, AlertCircle,
  Clock, XCircle, MoreVertical, FileText as _FileText, BarChart3, Settings as _Settings
} from "lucide-react";

const ACCOUNT_STATUS_FILTERS = ["all", "active", "pending", "suspended", "inactive"];
const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest First" },
  { value: "created_asc", label: "Oldest First" },
  { value: "spend_desc", label: "Highest Spend" },
  { value: "spend_asc", label: "Lowest Spend" },
  { value: "name_asc", label: "Name A-Z" }
];

export default function ManageBusinessAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [isLoading, setIsLoading] = useState(true);
  const [_selectedAccount, _setSelectedAccount] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    fetchAccounts();
    fetchStats();
  }, [fetchAccounts, fetchStats]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/business-accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch business accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/business-accounts/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...accounts];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(acc => acc.status === statusFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(acc =>
        acc.businessName?.toLowerCase().includes(query) ||
        acc.contactName?.toLowerCase().includes(query) ||
        acc.email?.toLowerCase().includes(query) ||
        acc.id?.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "created_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "created_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "spend_desc":
          return (b.totalSpend || 0) - (a.totalSpend || 0);
        case "spend_asc":
          return (a.totalSpend || 0) - (b.totalSpend || 0);
        case "name_asc":
          return (a.businessName || "").localeCompare(b.businessName || "");
        default:
          return 0;
      }
    });

    setFilteredAccounts(filtered);
  }, [accounts, searchQuery, statusFilter, sortBy]);

  const handleUpdateStatus = async (accountId, newStatus) => {
    try {
      await fetch(`/api/admin/business-accounts/${accountId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAccounts();
      fetchStats();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleExportData = async (accountId) => {
    try {
      const response = await fetch(`/api/admin/business-accounts/${accountId}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-account-${accountId}-${Date.now()}.csv`;
      a.click();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to export data:', error);
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
      active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Active" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
      suspended: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Suspended" },
      inactive: { bg: "bg-gray-100", text: "text-gray-700", icon: AlertCircle, label: "Inactive" }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const renderStatsCards = () => {
    const cards = [
      {
        label: "Total Accounts",
        value: stats.totalAccounts,
        icon: Building2,
        color: "blue"
      },
      {
        label: "Active Accounts",
        value: stats.activeAccounts,
        icon: CheckCircle2,
        color: "green"
      },
      {
        label: "Total Revenue",
        value: formatCurrency(stats.totalRevenue),
        icon: DollarSign,
        color: "purple"
      },
      {
        label: "Pending Approvals",
        value: stats.pendingApprovals,
        icon: Clock,
        color: "orange"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            purple: "bg-purple-100 text-purple-600",
            orange: "bg-orange-100 text-brand-orange"
          };
          return (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className={`inline-flex p-3 rounded-lg ${colorClasses[card.color]} mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.label}</h3>
              <p className="text-2xl font-bold text-brand-brown">{card.value}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name, contact, email, or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent appearance-none bg-white"
            >
              {ACCOUNT_STATUS_FILTERS.map(status => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="w-full lg:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent appearance-none bg-white"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderAccountCard = (account) => (
    <div key={account.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-brand-orange transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-cream rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-brand-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-brand-brown mb-1">{account.businessName}</h3>
            <p className="text-sm text-gray-600 mb-2">{account.businessType} • {account.companySize}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{account.contactName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{account.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{account.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(showActionsMenu === account.id ? null : account.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          {showActionsMenu === account.id && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
              <button
                onClick={() => navigate(`/admin/business-accounts/${account.id}`)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => navigate(`/admin/business-accounts/${account.id}/edit`)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Account</span>
              </button>
              <button
                onClick={() => handleExportData(account.id)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <div className="border-t border-gray-200 my-1" />
              {account.status === "active" ? (
                <button
                  onClick={() => handleUpdateStatus(account.id, "suspended")}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Suspend</span>
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus(account.id, "active")}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 text-left"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Spend</p>
          <p className="font-bold text-brand-brown">{formatCurrency(account.totalSpend)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Active Travelers</p>
          <p className="font-bold text-brand-brown">{account.activeTravelers || 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
          <p className="font-bold text-brand-brown">{account.totalBookings || 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <div>{getStatusBadge(account.status)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Joined {new Date(account.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/business-accounts/${account.id}/bookings`)}
            className="px-3 py-1.5 text-sm font-medium text-brand-orange border border-brand-orange rounded-lg hover:bg-orange-50 transition-colors"
          >
            View Bookings
          </button>
          <button
            onClick={() => navigate(`/admin/business-accounts/${account.id}/analytics`)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-orange-600 transition-colors"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">
              Manage Business Accounts
            </h1>
            <p className="text-gray-600">Oversee and support corporate travel clients</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate('/admin/business-accounts/reports')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-brand-orange transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Reports</span>
            </button>
            <button
              onClick={() => navigate('/business/register')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span className="font-medium">Add Account</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {renderStatsCards()}

        {/* Filters */}
        {renderFilters()}

        {/* Accounts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
              <p className="text-gray-600">Loading business accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-brand-brown mb-2">No accounts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No business accounts registered yet"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <button
                  onClick={() => navigate('/business/register')}
                  className="px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Register First Account
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredAccounts.length} of {accounts.length} accounts
                </p>
              </div>
              {filteredAccounts.map(renderAccountCard)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
