import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { a as useParams, u as useNavigate } from "./index-DlOecmR0.js";
import { A as AlertCircle, g as ArrowLeft, h as Building2, i as PenSquare, D as Download, b as FileText, U as Users, j as Briefcase, k as BarChart3, a as DollarSign, C as Calendar, S as Shield, l as CreditCard, m as User, d as Plane, H as Hotel, e as Car, n as CheckCircle2, o as Clock } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function BusinessAccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = reactExports.useState(null);
  const [travelers, setTravelers] = reactExports.useState([]);
  const [recentBookings, setRecentBookings] = reactExports.useState([]);
  const [analytics, setAnalytics] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const fetchAccountDetails = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const [accountRes, travelersRes, bookingsRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/business-accounts/${accountId}`).then((r) => r.json()),
        fetch(`/api/admin/business-accounts/${accountId}/travelers`).then((r) => r.json()),
        fetch(`/api/admin/business-accounts/${accountId}/bookings`).then((r) => r.json()),
        fetch(`/api/admin/business-accounts/${accountId}/analytics`).then((r) => r.json())
      ]);
      setAccount(accountRes);
      setTravelers(travelersRes);
      setRecentBookings(bookingsRes);
      setAnalytics(analyticsRes);
    } catch (error) {
      console.error("Failed to fetch account details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);
  reactExports.useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
      status.charAt(0).toUpperCase() + status.slice(1)
    ] });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading account details..." })
    ] }) });
  }
  if (!account) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-16 h-16 mx-auto mb-4 text-red-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-2", children: "Account Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/admin/business-accounts"),
          className: "mt-4 px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600",
          children: "Back to Accounts"
        }
      )
    ] }) });
  }
  const renderOverviewTab = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-4", children: "Account Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Business Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: account.businessName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Registration Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: account.registrationNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Business Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium capitalize", children: account.businessType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Company Size" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: account.companySize })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Primary Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: account.contactName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: account.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: account.phone })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-gray-600", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: getStatusBadge(account.status) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-5 h-5 text-purple-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-600", children: "Total Spend" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: formatCurrency(account.totalSpend) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "w-5 h-5 text-blue-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-600", children: "Total Bookings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: account.totalBookings || 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 text-green-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-600", children: "Active Travelers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: account.activeTravelers || 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-5 h-5 text-brand-orange" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-600", children: "Account Age" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-brown", children: [
          Math.floor((/* @__PURE__ */ new Date() - new Date(account.createdAt)) / (1e3 * 60 * 60 * 24)),
          " days"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-4", children: "Account Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4 border border-gray-200 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: `w-5 h-5 ${account.settings?.requiresApprovalWorkflow ? "text-green-600" : "text-gray-400"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: "Approval Workflow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: account.settings?.requiresApprovalWorkflow ? "Enabled" : "Disabled" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4 border border-gray-200 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: `w-5 h-5 ${account.settings?.centralizedBilling ? "text-green-600" : "text-gray-400"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: "Centralized Billing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: account.settings?.centralizedBilling ? "Enabled" : "Disabled" })
          ] })
        ] })
      ] })
    ] })
  ] });
  const renderTravelersTab = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown", children: "Registered Travelers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-4 py-2 text-brand-orange border border-brand-orange rounded-lg hover:bg-orange-50", children: "Add Traveler" })
    ] }),
    travelers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-12 h-12 mx-auto mb-3 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No travelers registered yet" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: travelers.map((traveler) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-orange transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-cream rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-brand-orange" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: traveler.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            traveler.email,
            " • ",
            traveler.department
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-brand-brown", children: [
          traveler.trips,
          " trips"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: formatCurrency(traveler.totalSpend) })
      ] })
    ] }, traveler.id)) })
  ] });
  const renderBookingsTab = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-6", children: "Recent Bookings" }),
    recentBookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "w-12 h-12 mx-auto mb-3 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No bookings yet" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: recentBookings.map((booking) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:border-brand-orange transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-brand-brown mb-1", children: booking.destination }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [
            new Date(booking.startDate).toLocaleDateString(),
            " - ",
            new Date(booking.endDate).toLocaleDateString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: booking.travelerName })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          getStatusBadge(booking.status),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-brand-brown mt-2", children: formatCurrency(booking.totalAmount) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [
        booking.services?.flight && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Flight" })
        ] }),
        booking.services?.accommodation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Hotel, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hotel" })
        ] }),
        booking.services?.transport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Transfer" })
        ] })
      ] })
    ] }, booking.id)) })
  ] });
  const renderAnalyticsTab = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-6", children: "Spend by Category" }),
      analytics?.spendByCategory?.map((category) => {
        const percentage = account.totalSpend > 0 ? category.amount / account.totalSpend * 100 : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: category.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-brand-brown", children: formatCurrency(category.amount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand-orange h-2 rounded-full", style: { width: `${percentage}%` } }) })
        ] }, category.name);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-4", children: "Monthly Trends" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Analytics visualization coming soon..." })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/admin/business-accounts"),
          className: "flex items-center gap-2 text-brand-orange hover:underline mb-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back to Accounts" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 mb-4 md:mb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-8 h-8 text-brand-orange" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown mb-1", children: account.businessName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
              account.businessType,
              " • ",
              account.id
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate(`/admin/business-accounts/${accountId}/edit`),
              className: "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-brand-orange transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PenSquare, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-6", children: [
      { id: "overview", label: "Overview", icon: FileText },
      { id: "travelers", label: "Travelers", icon: Users },
      { id: "bookings", label: "Bookings", icon: Briefcase },
      { id: "analytics", label: "Analytics", icon: BarChart3 }
    ].map((tab) => {
      const Icon = tab.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === tab.id ? "border-brand-orange text-brand-orange" : "border-transparent text-gray-600 hover:text-brand-brown"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: tab.label })
          ]
        },
        tab.id
      );
    }) }) }),
    activeTab === "overview" && renderOverviewTab(),
    activeTab === "travelers" && renderTravelersTab(),
    activeTab === "bookings" && renderBookingsTab(),
    activeTab === "analytics" && renderAnalyticsTab()
  ] }) });
}
export {
  BusinessAccountDetail as default
};
//# sourceMappingURL=BusinessAccountDetail-DLIYHckT.js.map
