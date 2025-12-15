import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { k as BarChart3, h as Building2, n as CheckCircle2, a as DollarSign, o as Clock, O as Search, r as Mail, s as Phone, Q as MoreVertical, R as Eye, i as PenSquare, V as XCircle, C as Calendar, A as AlertCircle } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const ACCOUNT_STATUS_FILTERS = ["all", "active", "pending", "suspended", "inactive"];
const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest First" },
  { value: "created_asc", label: "Oldest First" },
  { value: "spend_desc", label: "Highest Spend" },
  { value: "spend_asc", label: "Lowest Spend" },
  { value: "name_asc", label: "Name A-Z" }
];
function ManageBusinessAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = reactExports.useState([]);
  const [filteredAccounts, setFilteredAccounts] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("created_desc");
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [_selectedAccount, _setSelectedAccount] = reactExports.useState(null);
  const [showActionsMenu, setShowActionsMenu] = reactExports.useState(null);
  const [stats, setStats] = reactExports.useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });
  reactExports.useEffect(() => {
    fetchAccounts();
    fetchStats();
  }, [fetchAccounts, fetchStats]);
  reactExports.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  const fetchAccounts = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/business-accounts");
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch business accounts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const fetchStats = reactExports.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/business-accounts/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);
  const applyFiltersAndSort = reactExports.useCallback(() => {
    let filtered = [...accounts];
    if (statusFilter !== "all") {
      filtered = filtered.filter((acc) => acc.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (acc) => acc.businessName?.toLowerCase().includes(query) || acc.contactName?.toLowerCase().includes(query) || acc.email?.toLowerCase().includes(query) || acc.id?.toLowerCase().includes(query)
      );
    }
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAccounts();
      fetchStats();
      setShowActionsMenu(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };
  const handleExportData = async (accountId) => {
    try {
      const response = await fetch(`/api/admin/business-accounts/${accountId}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `business-account-${accountId}-${Date.now()}.csv`;
      a.click();
      setShowActionsMenu(null);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
      config.label
    ] });
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: cards.map((card, idx) => {
      const Icon = card.icon;
      const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-brand-orange"
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `inline-flex p-3 rounded-lg ${colorClasses[card.color]} mb-3`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-600 mb-1", children: card.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: card.value })
      ] }, idx);
    }) });
  };
  const renderFilters = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-5 w-5 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          placeholder: "Search by business name, contact, email, or account ID...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full lg:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "absolute left-3 top-3 h-5 w-5 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          className: "w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent appearance-none bg-white",
          children: ACCOUNT_STATUS_FILTERS.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1) }, status))
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full lg:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "select",
      {
        value: sortBy,
        onChange: (e) => setSortBy(e.target.value),
        className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent appearance-none bg-white",
        children: SORT_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
      }
    ) })
  ] }) });
  const renderAccountCard = (account) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-brand-orange transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-cream rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-6 h-6 text-brand-orange" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-1", children: account.businessName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [
            account.businessType,
            " • ",
            account.companySize
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: account.contactName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: account.email })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: account.phone })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowActionsMenu(showActionsMenu === account.id ? null : account.id),
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertical, { className: "w-5 h-5 text-gray-600" })
          }
        ),
        showActionsMenu === account.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate(`/admin/business-accounts/${account.id}`),
              className: "w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Details" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate(`/admin/business-accounts/${account.id}/edit`),
              className: "w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PenSquare, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit Account" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleExportData(account.id),
              className: "w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export Data" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200 my-1" }),
          account.status === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleUpdateStatus(account.id, "suspended"),
              className: "w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Suspend" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleUpdateStatus(account.id, "active"),
              className: "w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Activate" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Spend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-brand-brown", children: formatCurrency(account.totalSpend) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Active Travelers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-brand-brown", children: account.activeTravelers || 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-brand-brown", children: account.totalBookings || 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: getStatusBadge(account.status) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Joined ",
          new Date(account.createdAt).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate(`/admin/business-accounts/${account.id}/bookings`),
            className: "px-3 py-1.5 text-sm font-medium text-brand-orange border border-brand-orange rounded-lg hover:bg-orange-50 transition-colors",
            children: "View Bookings"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate(`/admin/business-accounts/${account.id}/analytics`),
            className: "px-3 py-1.5 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-orange-600 transition-colors",
            children: "Analytics"
          }
        )
      ] })
    ] })
  ] }, account.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "Manage Business Accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Oversee and support corporate travel clients" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-4 md:mt-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate("/admin/business-accounts/reports"),
            className: "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-brand-orange transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Reports" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate("/business/register"),
            className: "flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Add Account" })
            ]
          }
        )
      ] })
    ] }),
    renderStatsCards(),
    renderFilters(),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading business accounts..." })
    ] }) : filteredAccounts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-16 h-16 mx-auto mb-4 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-2", children: "No accounts found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "No business accounts registered yet" }),
      !searchQuery && statusFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/business/register"),
          className: "px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors",
          children: "Register First Account"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
        "Showing ",
        filteredAccounts.length,
        " of ",
        accounts.length,
        " accounts"
      ] }) }),
      filteredAccounts.map(renderAccountCard)
    ] }) })
  ] }) });
}
export {
  ManageBusinessAccounts as default
};
//# sourceMappingURL=ManageBusinessAccounts-B1LL2z1G.js.map
